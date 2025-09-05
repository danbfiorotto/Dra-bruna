use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use chrono::Utc;
use tauri::AppHandle;
use rusqlite::params;

use crate::commands_simple::{
    Patient, Appointment, Document, OpLogEntry, SyncOperation, SyncState, 
    ConflictInfo, ConflictResolution, CreatePatientRequest, CreateAppointmentRequest, CreateDocumentRequest
};
use crate::supabase::{SupabaseClient, SupabaseConfig};
use crate::config;
use crate::commands_database::DATABASE;

// Sistema de sincronização híbrida com LWW e tombstones
pub struct HybridSyncManager {
    device_id: String,
    op_seq_counter: Arc<Mutex<u64>>,
}

impl HybridSyncManager {
    pub fn new() -> Self {
        Self {
            device_id: uuid::Uuid::new_v4().to_string(),
            op_seq_counter: Arc::new(Mutex::new(0)),
        }
    }

    // PULL: Buscar mudanças do servidor
    pub async fn pull_changes(&self, table_name: &str) -> Result<Vec<serde_json::Value>> {
        let app_config = config::get_config()
            .map_err(|e| anyhow::anyhow!("Failed to get config: {}", e))?;
        
        let supabase_config = SupabaseConfig {
            url: app_config.supabase.url.clone(),
            anon_key: app_config.supabase.anon_key.clone(),
            service_role_key: app_config.supabase.service_role_key.clone(),
        };

        let client = SupabaseClient::new(supabase_config);
        
        // Test connection
        if !client.test_connection().await.unwrap_or(false) {
            return Err(anyhow::anyhow!("Supabase connection failed"));
        }

        // Get last pulled revision for this table
        let last_pulled_rev = self.get_last_pulled_rev(table_name)?;
        
        // Fetch changes from server where rev > last_pulled_rev
        let url = format!("{}/rest/v1/{}?rev=gt.{}", app_config.supabase.url, table_name, last_pulled_rev);
        
        // This would be implemented in SupabaseClient
        // For now, we'll use the existing methods
        match table_name {
            "patients" => {
                let patients = client.get_patients().await?;
                Ok(patients.into_iter().map(|p| serde_json::to_value(p).unwrap()).collect())
            }
            "appointments" => {
                let appointments = client.get_remote_appointments().await?;
                Ok(appointments.into_iter().map(|a| serde_json::to_value(a).unwrap()).collect())
            }
            _ => Ok(vec![])
        }
    }

    // RECONCILE: Aplicar mudanças do servidor localmente com LWW
    pub async fn reconcile_changes(&self, table_name: &str, server_changes: Vec<serde_json::Value>) -> Result<Vec<ConflictInfo>> {
        let mut conflicts = Vec::new();
        
        for change in server_changes {
            let entity_id = change["id"].as_str().unwrap();
            let server_rev = change["rev"].as_i64().unwrap();
            let server_deleted_at = change["deleted_at"].as_str();
            
            // Get local version
            let local_data = self.get_local_entity(table_name, entity_id)?;
            
            match local_data {
                Some(local) => {
                    let local_rev = local["rev"].as_i64().unwrap_or(0);
                    
                    // Apply LWW rules
                    if server_rev > local_rev {
                        if let Some(deleted_at) = server_deleted_at {
                            // Server deleted this entity
                            if local_rev > 0 {
                                // Local has changes after server deletion
                                let conflict = ConflictInfo {
                                    entity_type: table_name.to_string(),
                                    entity_id: entity_id.to_string(),
                                    local_data: local,
                                    server_data: change,
                                    conflict_type: "deleted_remotely".to_string(),
                                    recommended_action: self.get_recommended_action(table_name, "deleted_remotely"),
                                    created_at: Utc::now().to_rfc3339(),
                                };
                                conflicts.push(conflict);
                            } else {
                                // Apply soft delete locally
                                self.apply_soft_delete(table_name, entity_id, deleted_at)?;
                            }
                        } else {
                            // Server updated this entity
                            self.apply_server_update(table_name, &change)?;
                        }
                    } else if local_rev > server_rev {
                        // Local is newer - will be handled in PUSH
                        continue;
                    }
                    // If revs are equal, no conflict
                }
                None => {
                    // Entity doesn't exist locally - create it
                    self.create_local_entity(table_name, &change)?;
                }
            }
        }
        
        Ok(conflicts)
    }

    // PUSH: Enviar mudanças locais para o servidor
    pub async fn push_changes(&self) -> Result<()> {
        let app_config = config::get_config()
            .map_err(|e| anyhow::anyhow!("Failed to get config: {}", e))?;
        
        let supabase_config = SupabaseConfig {
            url: app_config.supabase.url.clone(),
            anon_key: app_config.supabase.anon_key.clone(),
            service_role_key: app_config.supabase.service_role_key.clone(),
        };

        let client = SupabaseClient::new(supabase_config);
        
        // Get pending operations from oplog
        let pending_ops = self.get_pending_operations()?;
        
        for op in pending_ops {
            match op.operation {
                SyncOperation::Insert => {
                    self.push_insert(&client, &op).await?;
                }
                SyncOperation::Update => {
                    self.push_update(&client, &op).await?;
                }
                SyncOperation::Delete => {
                    self.push_delete(&client, &op).await?;
                }
                SyncOperation::Undelete => {
                    self.push_undelete(&client, &op).await?;
                }
            }
            
            // Mark as committed
            self.mark_operation_committed(&op.id, op.server_rev)?;
        }
        
        Ok(())
    }

    // COMMIT: Atualizar last_pulled_rev
    pub fn commit_sync(&self, table_name: &str, max_rev: i64) -> Result<()> {
        let db_guard = DATABASE.get()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
        let db = db_guard.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
        
        db.execute_sql(
            "INSERT OR REPLACE INTO sync_state (table_name, last_pulled_rev, last_sync_at) VALUES (?1, ?2, ?3)",
            &[&table_name, &max_rev, &Utc::now().to_rfc3339()],
        )?;
        
        Ok(())
    }

    // Helper methods
    fn get_last_pulled_rev(&self, table_name: &str) -> Result<i64> {
        let db_guard = DATABASE.get()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
        let db = db_guard.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
        
        let rev: i64 = db.query_row(
            "SELECT last_pulled_rev FROM sync_state WHERE table_name = ?1",
            &[&table_name],
            |row| row.get(0)
        ).unwrap_or(0);
        
        Ok(rev)
    }

    fn get_local_entity(&self, table_name: &str, entity_id: &str) -> Result<Option<serde_json::Value>> {
        let db_guard = DATABASE.get()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
        let db = db_guard.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
        
        match table_name {
            "patients" => {
                match db.query_row(
                    "SELECT * FROM patients WHERE id = ?1",
                    &[&entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "name": row.get::<_, String>(1)?,
                            "email": row.get::<_, Option<String>>(2)?,
                            "phone": row.get::<_, Option<String>>(3)?,
                            "birth_date": row.get::<_, Option<String>>(4)?,
                            "address": row.get::<_, Option<String>>(5)?,
                            "notes": row.get::<_, Option<String>>(6)?,
                            "created_at": row.get::<_, String>(7)?,
                            "updated_at": row.get::<_, String>(8)?,
                            "rev": row.get::<_, i64>(9)?,
                            "deleted_at": row.get::<_, Option<String>>(10)?,
                            "last_editor": row.get::<_, Option<String>>(11)?,
                            "last_pulled_rev": row.get::<_, Option<i64>>(12)?
                        }))
                    }
                ) {
                    Ok(patient) => Ok(Some(patient)),
                    Err(_) => Ok(None), // Entity not found
                }
            }
            _ => Ok(None)
        }
    }

    fn apply_soft_delete(&self, table_name: &str, entity_id: &str, deleted_at: &str) -> Result<()> {
        let db_guard = DATABASE.get()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
        let db = db_guard.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
        
        db.execute_sql(
            &format!("UPDATE {} SET deleted_at = ?1 WHERE id = ?2", table_name),
            &[&deleted_at, &entity_id],
        )?;
        
        Ok(())
    }

    fn apply_server_update(&self, table_name: &str, server_data: &serde_json::Value) -> Result<()> {
        // Implementation would update local entity with server data
        // This is a simplified version
        eprintln!("Applying server update for {}: {}", table_name, server_data["id"]);
        Ok(())
    }

    fn create_local_entity(&self, table_name: &str, server_data: &serde_json::Value) -> Result<()> {
        // Implementation would create local entity from server data
        eprintln!("Creating local entity for {}: {}", table_name, server_data["id"]);
        Ok(())
    }

    fn get_recommended_action(&self, entity_type: &str, conflict_type: &str) -> ConflictResolution {
        match (entity_type, conflict_type) {
            ("patients", "deleted_remotely") => ConflictResolution::Manual, // Requer confirmação
            ("appointments", "deleted_remotely") => ConflictResolution::Undelete, // Pode recriar
            ("documents", "deleted_remotely") => ConflictResolution::ServerWins, // Servidor vence
            (_, "both_modified") => ConflictResolution::ServerWins, // LWW padrão
            _ => ConflictResolution::ServerWins,
        }
    }

    fn get_pending_operations(&self) -> Result<Vec<OpLogEntry>> {
        let db_guard = DATABASE.get()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
        let db = db_guard.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
        
        let ops = db.query_map("SELECT * FROM oplog WHERE committed = 0 ORDER BY op_seq", &[], |row| {
            Ok(OpLogEntry {
                id: row.get(0)?,
                entity_type: row.get(1)?,
                entity_id: row.get(2)?,
                operation: match row.get::<_, String>(3)?.as_str() {
                    "Insert" => SyncOperation::Insert,
                    "Update" => SyncOperation::Update,
                    "Delete" => SyncOperation::Delete,
                    "Undelete" => SyncOperation::Undelete,
                    _ => SyncOperation::Update,
                },
                payload_hash: row.get(4)?,
                origin_device_id: row.get(5)?,
                op_seq: row.get(6)?,
                local_ts: row.get(7)?,
                committed: row.get(8)?,
                server_rev: row.get(9)?,
            })
        })?;
        
        Ok(ops)
    }

    async fn push_insert(&self, client: &SupabaseClient, op: &OpLogEntry) -> Result<()> {
        // Implementation would send insert to server
        eprintln!("Pushing insert for {}: {}", op.entity_type, op.entity_id);
        Ok(())
    }

    async fn push_update(&self, client: &SupabaseClient, op: &OpLogEntry) -> Result<()> {
        // Implementation would send update to server
        eprintln!("Pushing update for {}: {}", op.entity_type, op.entity_id);
        Ok(())
    }

    async fn push_delete(&self, client: &SupabaseClient, op: &OpLogEntry) -> Result<()> {
        // Implementation would send soft delete to server
        eprintln!("Pushing delete for {}: {}", op.entity_type, op.entity_id);
        Ok(())
    }

    async fn push_undelete(&self, client: &SupabaseClient, op: &OpLogEntry) -> Result<()> {
        // Implementation would send undelete to server
        eprintln!("Pushing undelete for {}: {}", op.entity_type, op.entity_id);
        Ok(())
    }

    fn mark_operation_committed(&self, op_id: &str, server_rev: Option<i64>) -> Result<()> {
        let db_guard = DATABASE.get()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
        let db = db_guard.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
        
        db.execute_sql(
            "UPDATE oplog SET committed = 1, server_rev = ?1 WHERE id = ?2",
            &[&server_rev, &op_id],
        )?;
        
        Ok(())
    }

    // Método principal de sincronização
    pub async fn sync(&self) -> Result<Vec<ConflictInfo>> {
        let mut all_conflicts = Vec::new();
        
        // PULL + RECONCILE para cada tabela
        for table_name in &["patients", "appointments", "documents"] {
            let changes = self.pull_changes(table_name).await?;
            let conflicts = self.reconcile_changes(table_name, changes).await?;
            all_conflicts.extend(conflicts);
        }
        
        // PUSH mudanças locais
        self.push_changes().await?;
        
        // COMMIT
        for table_name in &["patients", "appointments", "documents"] {
            // In a real implementation, you'd get the max rev from the pull
            self.commit_sync(table_name, 0)?;
        }
        
        Ok(all_conflicts)
    }
}

// Global instance
static HYBRID_SYNC_MANAGER: std::sync::OnceLock<HybridSyncManager> = std::sync::OnceLock::new();

pub fn get_hybrid_sync_manager() -> &'static HybridSyncManager {
    HYBRID_SYNC_MANAGER.get_or_init(|| HybridSyncManager::new())
}

#[tauri::command]
pub async fn sync_hybrid() -> Result<Vec<ConflictInfo>, String> {
    let manager = get_hybrid_sync_manager();
    manager.sync().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resolve_conflict(
    conflict_id: String,
    resolution: ConflictResolution,
) -> Result<(), String> {
    // Implementation would resolve the conflict based on user choice
    eprintln!("Resolving conflict {} with {:?}", conflict_id, resolution);
    Ok(())
}
