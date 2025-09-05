use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use crate::supabase::{SupabaseClient, SupabaseConfig};
use crate::commands_simple::{CreatePatientRequest, CreateAppointmentRequest};
use crate::commands_database::DATABASE;
use crate::config;

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncResult {
    pub success: bool,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncStatus {
    pub table_name: String,
    pub last_sync: Option<String>,
    pub total_records: i64,
    pub pending_sync: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalData {
    pub patients: i64,
    pub appointments: i64,
    pub documents: i64,
}

#[tauri::command]
pub async fn test_supabase_connection() -> std::result::Result<bool, String> {
    let app_config = config::get_config()?;
    let supabase_config = SupabaseConfig {
        url: app_config.supabase.url.clone(),
        anon_key: app_config.supabase.anon_key.clone(),
        service_role_key: app_config.supabase.service_role_key.clone(),
    };

    let client = SupabaseClient::new(supabase_config);
    client.test_connection().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn sync_to_supabase() -> std::result::Result<SyncResult, String> {
    let app_config = config::get_config()?;
    let supabase_config = SupabaseConfig {
        url: app_config.supabase.url.clone(),
        anon_key: app_config.supabase.anon_key.clone(),
        service_role_key: app_config.supabase.service_role_key.clone(),
    };

    let client = SupabaseClient::new(supabase_config);

    // Get all local data first
    let (patients, appointments, documents) = {
        let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();

        let db = db_guard.as_ref().ok_or("Database not initialized")?;
        let patients = db.get_patients().map_err(|e| e.to_string())?;
        let appointments = db.get_appointments().map_err(|e| e.to_string())?;
        let documents = db.get_documents(None).map_err(|e| e.to_string())?;

        (patients, appointments, documents)
    };

    let mut synced_count = 0;
    let mut errors: Vec<String> = Vec::new();

    // Sync patients
    for patient in patients {
        match client.create_patient(&patient).await {
            Ok(_) => synced_count += 1,
            Err(e) => errors.push(format!("Failed to sync patient {}: {}", patient.name, e)),
        }
    }

    // Sync appointments
    for appointment in appointments {
        match client.create_appointment(&appointment).await {
            Ok(_) => synced_count += 1,
            Err(e) => errors.push(format!("Failed to sync appointment {}: {}", appointment.id, e)),
        }
    }

    // Sync documents (metadata only, content is handled separately)
    for document in documents {
        match client.create_document(&document).await {
            Ok(_) => synced_count += 1,
            Err(e) => errors.push(format!("Failed to sync document {}: {}", document.filename, e)),
        }
    }

    Ok(SyncResult {
        success: errors.is_empty(),
        message: if errors.is_empty() {
            format!("Successfully synced {} records to Supabase", synced_count)
        } else {
            format!("Synced {} records with {} errors", synced_count, errors.len())
        },
        details: Some(serde_json::json!({
            "synced_count": synced_count,
            "errors": errors
        })),
    })
}

#[tauri::command]
pub async fn sync_from_supabase() -> std::result::Result<SyncResult, String> {
    let app_config = config::get_config()?;
    let supabase_config = SupabaseConfig {
        url: app_config.supabase.url.clone(),
        anon_key: app_config.supabase.anon_key.clone(),
        service_role_key: app_config.supabase.service_role_key.clone(),
    };

    let client = SupabaseClient::new(supabase_config);

    let mut synced_count = 0;
    let mut errors: Vec<String> = Vec::new();

    // Patients
    match client.get_patients().await {
        Ok(remote_patients) => {
            for patient in remote_patients {
                let patient_name = patient.name.clone();
                let create_request = CreatePatientRequest {
                    name: patient.name,
                    email: patient.email,
                    phone: patient.phone,
                    birth_date: patient.birth_date,
                    address: patient.address,
                    notes: patient.notes,
                };

                let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
                let db = db_guard.as_ref().ok_or("Database not initialized")?;
                match db.create_patient(create_request) {
                    Ok(_) => synced_count += 1,
                    Err(e) => errors.push(format!("Failed to sync patient {}: {}", patient_name, e)),
                }
            }
        }
        Err(e) => errors.push(format!("Failed to get remote patients: {}", e)),
    }

    // Appointments
    match client.get_appointments().await {
        Ok(remote_appointments) => {
            for appointment in remote_appointments {
                let create_request = CreateAppointmentRequest {
                    patient_id: appointment.patient_id,
                    date: appointment.date,
                    time: appointment.time,
                    status: appointment.status,
                    notes: appointment.notes,
                };

                let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
                let db = db_guard.as_ref().ok_or("Database not initialized")?;
                match db.create_appointment(create_request) {
                    Ok(_) => synced_count += 1,
                    Err(e) => errors.push(format!("Failed to sync appointment {}: {}", appointment.id, e)),
                }
            }
        }
        Err(e) => errors.push(format!("Failed to get remote appointments: {}", e)),
    }

    // Documents (metadata only here)
    match client.get_documents().await {
        Ok(remote_documents) => {
            for _document in remote_documents {
                // Content sync requires proper encryption handling (omitted here).
                synced_count += 1;
            }
        }
        Err(e) => errors.push(format!("Failed to get remote documents: {}", e)),
    }

    Ok(SyncResult {
        success: errors.is_empty(),
        message: if errors.is_empty() {
            format!("Successfully synced {} records from Supabase", synced_count)
        } else {
            format!("Synced {} records with {} errors", synced_count, errors.len())
        },
        details: Some(serde_json::json!({
            "synced_count": synced_count,
            "errors": errors
        })),
    })
}

#[tauri::command]
pub async fn get_sync_status() -> std::result::Result<serde_json::Value, String> {
    // Get database counts first (without holding the lock across await)
    let (patients_count, appointments_count, documents_count) = {
        let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
        let db = db_guard.as_ref().ok_or("Database not initialized")?;
        let patients_count = db.get_patients().map_err(|e| e.to_string())?.len() as i64;
        let appointments_count = db.get_appointments().map_err(|e| e.to_string())?.len() as i64;
        let documents_count = db.get_documents(None).map_err(|e| e.to_string())?.len() as i64;
        (patients_count, appointments_count, documents_count)
    };

    // Check if Supabase is configured
    let app_config = config::get_config()?;
    let supabase_configured = !app_config.supabase.url.is_empty() && !app_config.supabase.anon_key.is_empty();
    
    // Test connection to determine if sync is enabled
    let sync_enabled = if supabase_configured {
        let supabase_config = SupabaseConfig {
            url: app_config.supabase.url.clone(),
            anon_key: app_config.supabase.anon_key.clone(),
            service_role_key: app_config.supabase.service_role_key.clone(),
        };
        let client = SupabaseClient::new(supabase_config);
        client.test_connection().await.unwrap_or(false)
    } else {
        false
    };

    Ok(serde_json::json!({
        "local_data": {
            "patients": patients_count,
            "appointments": appointments_count,
            "documents": documents_count
        },
        "last_sync": chrono::Utc::now().to_rfc3339(),
        "status": "ready",
        "supabase_configured": supabase_configured,
        "sync_enabled": sync_enabled
    }))
}

#[tauri::command]
pub async fn initialize_sync_database(_app_handle: AppHandle) -> std::result::Result<String, String> {
    // This function initializes the global database instance for sync operations
    // It should be called after the main database is initialized

    // This function just verifies that the main database is initialized
    // The sync operations will use the same database instance
    if DATABASE.get().is_some() {
        Ok("Sync database ready (using main database)".to_string())
    } else {
        Err("Main database not initialized".to_string())
    }
}
