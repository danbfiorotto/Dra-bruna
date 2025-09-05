use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;
use std::time::{Duration, Instant};
use tokio::time::sleep;
use tauri::AppHandle;

use crate::supabase::{SupabaseClient, SupabaseConfig};
use crate::config;
use crate::commands_simple::{Patient, Appointment, Document};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncOperation {
    CreatePatient(Patient),
    UpdatePatient(Patient),
    DeletePatient(String),
    CreateAppointment(Appointment),
    UpdateAppointment(Appointment),
    DeleteAppointment(String),
    CreateDocument(Document),
    UpdateDocument(Document),
    DeleteDocument(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncQueueItem {
    pub id: String,
    pub operation: SyncOperation,
    pub timestamp: String,
    pub retry_count: u32,
    pub max_retries: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoSyncConfig {
    pub enabled: bool,
    pub sync_interval_seconds: u64,
    pub max_retries: u32,
    pub batch_size: usize,
}

impl Default for AutoSyncConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            sync_interval_seconds: 30, // Sync every 30 seconds
            max_retries: 3,
            batch_size: 10,
        }
    }
}

pub struct AutoSyncManager {
    config: AutoSyncConfig,
    sync_queue: Arc<Mutex<VecDeque<SyncQueueItem>>>,
    last_sync: Arc<Mutex<Option<Instant>>>,
    is_running: Arc<Mutex<bool>>,
}

impl AutoSyncManager {
    pub fn new(config: AutoSyncConfig) -> Self {
        Self {
            config,
            sync_queue: Arc::new(Mutex::new(VecDeque::new())),
            last_sync: Arc::new(Mutex::new(None)),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn add_to_sync_queue(&self, operation: SyncOperation) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        let id = uuid::Uuid::new_v4().to_string();
        let timestamp = chrono::Utc::now().to_rfc3339();
        
        let item = SyncQueueItem {
            id,
            operation,
            timestamp,
            retry_count: 0,
            max_retries: self.config.max_retries,
        };

        let mut queue = self.sync_queue.lock().unwrap();
        queue.push_back(item);
        
        eprintln!("Added operation to sync queue. Queue size: {}", queue.len());
        Ok(())
    }

    pub async fn start_auto_sync(&self, app_handle: AppHandle) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        let mut is_running = self.is_running.lock().unwrap();
        if *is_running {
            eprintln!("Auto-sync already running");
            return Ok(());
        }
        *is_running = true;
        eprintln!("Auto-sync started, is_running set to true");
        drop(is_running);

        let sync_queue = Arc::clone(&self.sync_queue);
        let last_sync = Arc::clone(&self.last_sync);
        let is_running = Arc::clone(&self.is_running);
        let config = self.config.clone();

        tokio::spawn(async move {
            loop {
                // Check if we should stop
                {
                    let is_running_guard = is_running.lock().unwrap();
                    if !*is_running_guard {
                        break;
                    }
                }

                // Process bidirectional sync with last write wins
                if let Err(e) = Self::sync_with_last_write_wins(&sync_queue, &last_sync, &config, &app_handle).await {
                    eprintln!("Error in bidirectional sync: {}", e);
                }

                // Wait for next sync interval
                sleep(Duration::from_secs(config.sync_interval_seconds)).await;
            }
        });

        Ok(())
    }

    pub fn stop_auto_sync(&self) {
        let mut is_running = self.is_running.lock().unwrap();
        *is_running = false;
    }

    async fn process_sync_queue(
        sync_queue: &Arc<Mutex<VecDeque<SyncQueueItem>>>,
        last_sync: &Arc<Mutex<Option<Instant>>>,
        config: &AutoSyncConfig,
        _app_handle: &AppHandle,
    ) -> Result<()> {
        // Check if we have items to sync
        let queue_size = {
            let queue = sync_queue.lock().unwrap();
            queue.len()
        };

        if queue_size == 0 {
            return Ok(());
        }

        // Check if we're connected to Supabase
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
            eprintln!("Supabase connection failed, skipping sync");
            return Ok(());
        }

        // Process items in batches
        let mut processed_count = 0;
        let mut failed_items = Vec::new();

        while processed_count < config.batch_size {
            let item = {
                let mut queue = sync_queue.lock().unwrap();
                queue.pop_front()
            };

            match item {
                Some(mut item) => {
                    match Self::execute_sync_operation(&client, &item.operation).await {
                        Ok(_) => {
                            eprintln!("Successfully synced operation: {}", item.id);
                            processed_count += 1;
                        }
                        Err(e) => {
                            eprintln!("Failed to sync operation {}: {}", item.id, e);
                            item.retry_count += 1;
                            
                            if item.retry_count < item.max_retries {
                                failed_items.push(item);
                            } else {
                                eprintln!("Max retries exceeded for operation: {}", item.id);
                            }
                        }
                    }
                }
                None => break,
            }
        }

        // Re-add failed items to the queue
        if !failed_items.is_empty() {
            let mut queue = sync_queue.lock().unwrap();
            for item in failed_items {
                queue.push_back(item);
            }
        }

        // Update last sync time
        {
            let mut last_sync_guard = last_sync.lock().unwrap();
            *last_sync_guard = Some(Instant::now());
        }

        eprintln!("Processed {} sync operations", processed_count);
        Ok(())
    }

    async fn execute_sync_operation(
        client: &SupabaseClient,
        operation: &SyncOperation,
    ) -> Result<()> {
        match operation {
            SyncOperation::CreatePatient(patient) => {
                client.create_patient(patient).await?;
            }
            SyncOperation::UpdatePatient(patient) => {
                client.create_patient(patient).await?; // Upsert
            }
            SyncOperation::DeletePatient(patient_id) => {
                // Note: Supabase doesn't have a delete endpoint in our current implementation
                // This would need to be implemented
                eprintln!("Delete patient operation not implemented: {}", patient_id);
            }
            SyncOperation::CreateAppointment(appointment) => {
                client.create_appointment(appointment).await?;
            }
            SyncOperation::UpdateAppointment(appointment) => {
                client.create_appointment(appointment).await?; // Upsert
            }
            SyncOperation::DeleteAppointment(appointment_id) => {
                // Note: Supabase doesn't have a delete endpoint in our current implementation
                eprintln!("Delete appointment operation not implemented: {}", appointment_id);
            }
            SyncOperation::CreateDocument(document) => {
                client.create_document(document).await?;
            }
            SyncOperation::UpdateDocument(document) => {
                client.create_document(document).await?; // Upsert
            }
            SyncOperation::DeleteDocument(document_id) => {
                // Note: Supabase doesn't have a delete endpoint in our current implementation
                eprintln!("Delete document operation not implemented: {}", document_id);
            }
        }
        Ok(())
    }

    // New method for bidirectional sync with last write wins
    pub async fn sync_with_last_write_wins(
        sync_queue: &Arc<Mutex<VecDeque<SyncQueueItem>>>,
        last_sync: &Arc<Mutex<Option<Instant>>>,
        config: &AutoSyncConfig,
        _app_handle: &AppHandle,
    ) -> Result<()> {
        // Check if we're connected to Supabase
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
            eprintln!("Supabase connection failed, skipping sync");
            return Ok(());
        }

        // 1. First, sync local changes to Supabase (outbound)
        Self::process_sync_queue(sync_queue, last_sync, config, _app_handle).await?;

        // 2. Then, sync remote changes to local (inbound) with last write wins
        Self::sync_from_remote_with_conflict_resolution(&client).await?;

        Ok(())
    }

    async fn sync_from_remote_with_conflict_resolution(client: &SupabaseClient) -> Result<()> {
        eprintln!("Starting bidirectional sync with last write wins...");

        // Get remote patients
        let remote_patients = client.get_patients().await?;
        eprintln!("Retrieved {} remote patients", remote_patients.len());

        // Get local patients
        let local_patients = {
            let db_guard = crate::commands_database::DATABASE.get()
                .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
            let db = db_guard.as_ref().ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
            db.get_patients().map_err(|e| anyhow::anyhow!("Failed to get local patients: {}", e))?
        };

        // Create a map of local patients for quick lookup
        let mut local_patients_map: std::collections::HashMap<String, crate::commands_simple::Patient> = 
            local_patients.into_iter().map(|p| (p.id.clone(), p)).collect();

        // Process each remote patient
        for remote_patient in remote_patients {
            if let Some(local_patient) = local_patients_map.get(&remote_patient.id) {
                // Patient exists locally - check for conflicts using last write wins
                let remote_time = chrono::DateTime::parse_from_rfc3339(&remote_patient.updated_at)
                    .unwrap_or_default();
                let local_time = chrono::DateTime::parse_from_rfc3339(&local_patient.updated_at)
                    .unwrap_or_default();

                if remote_time > local_time {
                    // Remote is newer - update local
                    eprintln!("Updating local patient {} with remote data (remote: {}, local: {})", 
                        remote_patient.id, remote_patient.updated_at, local_patient.updated_at);
                    
                    let db_guard = crate::commands_database::DATABASE.get()
                        .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
                    let db = db_guard.as_ref().ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
                    
                    // Update local patient with remote data
                    let update_request = crate::commands_simple::CreatePatientRequest {
                        name: remote_patient.name,
                        email: remote_patient.email,
                        phone: remote_patient.phone,
                        birth_date: remote_patient.birth_date,
                        address: remote_patient.address,
                        notes: remote_patient.notes,
                    };
                    
                    db.update_patient(&remote_patient.id, update_request)?;
                } else if local_time > remote_time {
                    // Local is newer - update remote (this will be handled by the outbound sync)
                    eprintln!("Local patient {} is newer than remote (local: {}, remote: {})", 
                        local_patient.id, local_patient.updated_at, remote_patient.updated_at);
                }
                // If times are equal, no conflict - do nothing
            } else {
                // Patient doesn't exist locally - create it
                eprintln!("Creating new local patient from remote: {}", remote_patient.id);
                
                let db_guard = crate::commands_database::DATABASE.get()
                    .ok_or_else(|| anyhow::anyhow!("Database not initialized"))?.lock().unwrap();
                let db = db_guard.as_ref().ok_or_else(|| anyhow::anyhow!("Database not initialized"))?;
                
                let create_request = crate::commands_simple::CreatePatientRequest {
                    name: remote_patient.name,
                    email: remote_patient.email,
                    phone: remote_patient.phone,
                    birth_date: remote_patient.birth_date,
                    address: remote_patient.address,
                    notes: remote_patient.notes,
                };
                
                db.create_patient(create_request)?;
            }
        }

        eprintln!("Bidirectional sync completed successfully");
        Ok(())
    }

}

// Global auto-sync manager instance
static AUTO_SYNC_MANAGER: std::sync::OnceLock<AutoSyncManager> = std::sync::OnceLock::new();

pub fn get_auto_sync_manager() -> &'static AutoSyncManager {
    AUTO_SYNC_MANAGER.get_or_init(|| {
        AutoSyncManager::new(AutoSyncConfig::default())
    })
}

pub async fn initialize_auto_sync(app_handle: AppHandle) -> Result<()> {
    eprintln!("Initializing auto-sync...");
    let manager = get_auto_sync_manager();
    manager.start_auto_sync(app_handle).await?;
    eprintln!("Auto-sync initialized successfully");
    Ok(())
}

pub fn add_sync_operation(operation: SyncOperation) -> Result<()> {
    let manager = get_auto_sync_manager();
    manager.add_to_sync_queue(operation)?;
    Ok(())
}

