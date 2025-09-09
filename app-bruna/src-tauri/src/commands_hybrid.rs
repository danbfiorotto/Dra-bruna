use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use std::collections::HashMap;

use crate::hybrid_sync::HybridSyncManager;
use crate::merge_utils::JsonMergeEngine;
use crate::deduplication::{DeduplicationEngine, DeduplicationResult};
use crate::tombstone_cleanup::{TombstoneCleanupManager, CleanupStats};
use crate::sync_audit::{SyncAuditLogger, AuditEvent};
use crate::offline_queue::{OfflineQueueManager, QueueStats};
use crate::integrity_checks::{IntegrityChecker, IntegrityReport};
use crate::field_merge::{FieldMergeEngine, MergeResult};
use crate::restore_window::{RestoreWindowManager, RestorableRecord};
use crate::entity_rules::{EntityConflictResolver, ConflictResolution};
use crate::medical_records_sync::{MedicalRecordsSync, MedicalRecord};
use crate::storage_sync::{StorageSync, FileMetadata, StorageSyncStats};

// =========================
// Comandos de Sincronização Híbrida
// =========================

#[tauri::command]
pub async fn sync_hybrid_system() -> Result<Vec<serde_json::Value>, String> {
    let manager = HybridSyncManager::new();
    match manager.sync().await {
        Ok(conflicts) => {
            let conflicts_json: Vec<serde_json::Value> = conflicts.into_iter()
                .map(|c| serde_json::to_value(c).unwrap())
                .collect();
            Ok(conflicts_json)
        }
        Err(e) => Err(format!("Erro na sincronização híbrida: {}", e))
    }
}

#[tauri::command]
pub async fn resolve_conflict_hybrid(
    entity_type: String,
    entity_id: String,
    resolution: String
) -> Result<bool, String> {
    let manager = HybridSyncManager::new();
    // Implementar resolução de conflito específica
    // Por enquanto, retornar sucesso
    Ok(true)
}

// =========================
// Comandos de Merge e Deduplicação
// =========================

#[tauri::command]
pub async fn merge_json_data(
    base: serde_json::Value,
    local: serde_json::Value,
    server: serde_json::Value
) -> Result<serde_json::Value, String> {
    let mut engine = JsonMergeEngine::new();
    match engine.merge(&base, &local, &server) {
        Ok(result) => Ok(result.merged_data),
        Err(e) => Err(format!("Erro no merge JSON: {}", e))
    }
}

#[tauri::command]
pub async fn find_duplicates() -> Result<DeduplicationResult, String> {
    let mut engine = DeduplicationEngine::new();
    match engine.find_duplicates() {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Erro na deduplicação: {}", e))
    }
}

#[tauri::command]
pub async fn merge_duplicates(duplicate_groups: Vec<Vec<String>>) -> Result<bool, String> {
    let mut engine = DeduplicationEngine::new();
    match engine.merge_duplicates(duplicate_groups) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Erro ao mesclar duplicatas: {}", e))
    }
}

// =========================
// Comandos de Tombstone e Limpeza
// =========================

#[tauri::command]
pub async fn cleanup_tombstones() -> Result<Vec<CleanupStats>, String> {
    let manager = TombstoneCleanupManager::new();
    match manager.cleanup_all_tables().await {
        Ok(stats) => Ok(stats),
        Err(e) => Err(format!("Erro na limpeza de tombstones: {}", e))
    }
}

#[tauri::command]
pub async fn restore_deleted_record(
    table_name: String,
    record_id: String
) -> Result<bool, String> {
    let manager = TombstoneCleanupManager::new();
    match manager.restore_record(&table_name, &record_id) {
        Ok(success) => Ok(success),
        Err(e) => Err(format!("Erro ao restaurar registro: {}", e))
    }
}

#[tauri::command]
pub async fn list_restorable_records(
    table_name: String,
    limit: Option<usize>
) -> Result<Vec<RestorableRecord>, String> {
    let manager = TombstoneCleanupManager::new();
    match manager.list_restorable_records(&table_name, limit) {
        Ok(records) => Ok(records),
        Err(e) => Err(format!("Erro ao listar registros restaurados: {}", e))
    }
}

// =========================
// Comandos de Auditoria
// =========================

#[tauri::command]
pub async fn log_sync_event(
    event_type: String,
    entity_type: String,
    entity_id: String,
    details: serde_json::Value
) -> Result<bool, String> {
    let logger = SyncAuditLogger::new();
    let event = AuditEvent {
        id: uuid::Uuid::new_v4().to_string(),
        event_type,
        entity_type,
        entity_id,
        details,
        timestamp: chrono::Utc::now(),
        user_id: None,
        device_id: None,
    };
    
    match logger.log_event(event).await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Erro ao registrar evento: {}", e))
    }
}

#[tauri::command]
pub async fn get_audit_logs(
    entity_type: Option<String>,
    limit: Option<usize>
) -> Result<Vec<serde_json::Value>, String> {
    let logger = SyncAuditLogger::new();
    match logger.get_events(entity_type.as_deref(), limit).await {
        Ok(events) => {
            let events_json: Vec<serde_json::Value> = events.into_iter()
                .map(|e| serde_json::to_value(e).unwrap())
                .collect();
            Ok(events_json)
        }
        Err(e) => Err(format!("Erro ao buscar logs de auditoria: {}", e))
    }
}

// =========================
// Comandos de Fila Offline
// =========================

#[tauri::command]
pub async fn get_offline_queue_status() -> Result<QueueStats, String> {
    let manager = OfflineQueueManager::new();
    match manager.get_queue_stats() {
        Ok(stats) => Ok(stats),
        Err(e) => Err(format!("Erro ao obter status da fila: {}", e))
    }
}

#[tauri::command]
pub async fn retry_failed_operations() -> Result<usize, String> {
    let manager = OfflineQueueManager::new();
    match manager.retry_failed_operations().await {
        Ok(count) => Ok(count),
        Err(e) => Err(format!("Erro ao tentar operações falhadas: {}", e))
    }
}

// =========================
// Comandos de Integridade
// =========================

#[tauri::command]
pub async fn check_data_integrity() -> Result<IntegrityReport, String> {
    let checker = IntegrityChecker::new();
    match checker.check_all_integrity().await {
        Ok(report) => Ok(report),
        Err(e) => Err(format!("Erro na verificação de integridade: {}", e))
    }
}

#[tauri::command]
pub async fn repair_data_integrity() -> Result<bool, String> {
    let checker = IntegrityChecker::new();
    match checker.repair_integrity_issues().await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Erro ao reparar integridade: {}", e))
    }
}

// =========================
// Comandos de Merge de Campos
// =========================

#[tauri::command]
pub async fn merge_field_values(
    field_name: String,
    local_value: String,
    server_value: String,
    merge_strategy: String
) -> Result<MergeResult, String> {
    let mut engine = FieldMergeEngine::new();
    match engine.merge_field(&field_name, &local_value, &server_value, &merge_strategy) {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Erro no merge de campo: {}", e))
    }
}

// =========================
// Comandos de Janela de Restauração
// =========================

#[tauri::command]
pub async fn get_restore_window_status() -> Result<serde_json::Value, String> {
    let manager = RestoreWindowManager::new();
    match manager.get_restore_status() {
        Ok(status) => Ok(serde_json::to_value(status).unwrap()),
        Err(e) => Err(format!("Erro ao obter status da janela de restauração: {}", e))
    }
}

// =========================
// Comandos de Regras de Entidade
// =========================

#[tauri::command]
pub async fn resolve_entity_conflict(
    entity_type: String,
    entity_id: String,
    conflict_type: String,
    local_data: serde_json::Value,
    server_data: serde_json::Value
) -> Result<String, String> {
    let mut resolver = EntityConflictResolver::with_default_config();
    
    // Converter strings para enums (simplificado)
    let entity_type_enum = match entity_type.as_str() {
        "patients" => crate::entity_rules::EntityType::Patients,
        "appointments" => crate::entity_rules::EntityType::Appointments,
        "documents" => crate::entity_rules::EntityType::Documents,
        "medical_records" => crate::entity_rules::EntityType::MedicalRecords,
        _ => return Err("Tipo de entidade inválido".to_string()),
    };
    
    let conflict_type_enum = match conflict_type.as_str() {
        "both_modified" => crate::entity_rules::ConflictType::BothModified,
        "deleted_remotely" => crate::entity_rules::ConflictType::DeletedRemotely,
        "deleted_locally" => crate::entity_rules::ConflictType::DeletedLocally,
        "duplicate_creation" => crate::entity_rules::ConflictType::DuplicateCreation,
        _ => return Err("Tipo de conflito inválido".to_string()),
    };
    
    match resolver.resolve_conflict(
        entity_type_enum,
        entity_id,
        conflict_type_enum,
        &local_data,
        &server_data,
        None
    ) {
        Ok(action) => Ok(format!("{:?}", action)),
        Err(e) => Err(format!("Erro ao resolver conflito: {}", e))
    }
}

// =========================
// Comandos de Prontuários Médicos
// =========================

#[tauri::command]
pub async fn sync_medical_record(
    patient_id: String,
    record_data: serde_json::Value
) -> Result<MedicalRecord, String> {
    let mut sync = MedicalRecordsSync::new();
    match sync.sync_medical_record(&patient_id, &record_data).await {
        Ok(record) => Ok(record),
        Err(e) => Err(format!("Erro na sincronização de prontuário: {}", e))
    }
}

#[tauri::command]
pub async fn get_medical_record_versions(
    patient_id: String
) -> Result<Vec<serde_json::Value>, String> {
    let sync = MedicalRecordsSync::new();
    match sync.get_record_versions(&patient_id).await {
        Ok(versions) => {
            let versions_json: Vec<serde_json::Value> = versions.into_iter()
                .map(|v| serde_json::to_value(v).unwrap())
                .collect();
            Ok(versions_json)
        }
        Err(e) => Err(format!("Erro ao buscar versões do prontuário: {}", e))
    }
}

// =========================
// Comandos de Storage
// =========================

#[tauri::command]
pub async fn add_file_to_sync(
    file_path: String,
    remote_path: Option<String>,
    uploaded_by: Option<String>
) -> Result<String, String> {
    let mut sync = StorageSync::with_default_config();
    match sync.add_file(&file_path, remote_path, uploaded_by).await {
        Ok(file_id) => Ok(file_id),
        Err(e) => Err(format!("Erro ao adicionar arquivo: {}", e))
    }
}

#[tauri::command]
pub async fn sync_all_files() -> Result<StorageSyncStats, String> {
    let mut sync = StorageSync::with_default_config();
    match sync.sync_all_files().await {
        Ok(stats) => Ok(stats),
        Err(e) => Err(format!("Erro na sincronização de arquivos: {}", e))
    }
}

#[tauri::command]
pub async fn get_file_sync_status() -> Result<StorageSyncStats, String> {
    let sync = StorageSync::with_default_config();
    Ok(sync.get_stats().clone())
}

#[tauri::command]
pub async fn get_files_by_status(status: String) -> Result<Vec<FileMetadata>, String> {
    let sync = StorageSync::with_default_config();
    let status_enum = match status.as_str() {
        "pending" => crate::storage_sync::FileSyncStatus::Pending,
        "syncing" => crate::storage_sync::FileSyncStatus::Syncing,
        "synced" => crate::storage_sync::FileSyncStatus::Synced,
        "failed" => crate::storage_sync::FileSyncStatus::Failed,
        "conflict" => crate::storage_sync::FileSyncStatus::Conflict,
        "local_only" => crate::storage_sync::FileSyncStatus::LocalOnly,
        "remote_only" => crate::storage_sync::FileSyncStatus::RemoteOnly,
        _ => return Err("Status inválido".to_string()),
    };
    
    Ok(sync.get_files_by_status(status_enum).into_iter().cloned().collect())
}

#[tauri::command]
pub async fn download_file(file_id: String) -> Result<bool, String> {
    let mut sync = StorageSync::with_default_config();
    match sync.download_file(&file_id).await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Erro ao baixar arquivo: {}", e))
    }
}

#[tauri::command]
pub async fn remove_file_from_sync(file_id: String) -> Result<bool, String> {
    let mut sync = StorageSync::with_default_config();
    match sync.remove_file(&file_id).await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Erro ao remover arquivo: {}", e))
    }
}
