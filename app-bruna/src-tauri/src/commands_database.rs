use anyhow::Result;
use tauri::AppHandle;
use std::sync::{Mutex, OnceLock};
use dirs;
use base64::Engine;

use crate::database::{Database, DatabaseConfig};
use crate::commands_simple::{Patient, Appointment, Document, CreatePatientRequest, CreateAppointmentRequest, CreateDocumentRequest};
use crate::crypto::CryptoService;

// Global database instance
pub static DATABASE: OnceLock<Mutex<Option<Database>>> = OnceLock::new();
static CRYPTO_SERVICE: OnceLock<Mutex<Option<CryptoService>>> = OnceLock::new();

// Helper functions to safely access static variables
fn get_database() -> &'static Mutex<Option<Database>> {
    DATABASE.get_or_init(|| Mutex::new(None))
}

fn get_crypto_service() -> &'static Mutex<Option<CryptoService>> {
    CRYPTO_SERVICE.get_or_init(|| Mutex::new(None))
}

#[tauri::command]
pub async fn initialize_database(
    _app_handle: AppHandle,
    master_password: String,
    encrypted: bool,
) -> Result<String, String> {
    // Initialize crypto service
    let service = CryptoService::new(&master_password)
        .map_err(|e| format!("Failed to initialize crypto service: {e}"))?;
    CRYPTO_SERVICE
        .set(Mutex::new(Some(service)))
        .map_err(|_| "Crypto service already initialized".to_string())?;

    // Get app data directory
    let app_data_dir = dirs::data_dir()
        .ok_or("Failed to get app data directory")?
        .join("SistemaDraBruna");
    
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    let db_path = app_data_dir.join("database.db");
    
    let config = DatabaseConfig {
        path: db_path.to_string_lossy().to_string(),
        encrypted,
        key: if encrypted { Some(master_password) } else { None },
    };

    let database = Database::new(config)
        .map_err(|e| format!("Failed to initialize database: {}", e))?;

    DATABASE
        .set(Mutex::new(Some(database)))
        .map_err(|_| "Database already initialized".to_string())?;

    Ok("Database initialized successfully".to_string())
}

#[tauri::command]
pub async fn get_database_status(_app_handle: AppHandle) -> Result<serde_json::Value, String> {
    if DATABASE.get().is_some() {
        let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
        let db = db_guard.as_ref().ok_or("Database not initialized")?;
        let patients = db.get_patients().map_err(|e| e.to_string())?;
        let appointments = db.get_appointments().map_err(|e| e.to_string())?;
        let documents = db.get_documents(None).map_err(|e| e.to_string())?;

        Ok(serde_json::json!({
            "initialized": true,
            "patients_count": patients.len(),
            "appointments_count": appointments.len(),
            "documents_count": documents.len(),
            "total_records": patients.len() + appointments.len() + documents.len()
        }))
    } else {
        Ok(serde_json::json!({
            "initialized": false,
            "patients_count": 0,
            "appointments_count": 0,
            "documents_count": 0,
            "total_records": 0
        }))
    }
}

// Patient CRUD operations
#[tauri::command]
pub async fn db_get_patients(_app_handle: AppHandle) -> Result<Vec<Patient>, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
    
    db.get_patients().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_create_patient(
    _app_handle: AppHandle,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let patient = db.create_patient(request).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue
    if let Err(e) = crate::auto_sync::add_sync_operation(
        crate::auto_sync::SyncOperation::CreatePatient(patient.clone())
    ) {
        eprintln!("Failed to add patient to sync queue: {}", e);
    }
    
    Ok(patient)
}

#[tauri::command]
pub async fn db_update_patient(
    _app_handle: AppHandle,
    id: String,
    request: CreatePatientRequest,
) -> Result<Option<Patient>, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let patient = db.update_patient(&id, request).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue if patient was updated
    if let Some(ref patient) = patient {
        if let Err(e) = crate::auto_sync::add_sync_operation(
            crate::auto_sync::SyncOperation::UpdatePatient(patient.clone())
        ) {
            eprintln!("Failed to add patient update to sync queue: {}", e);
        }
    }
    
    Ok(patient)
}

#[tauri::command]
pub async fn db_delete_patient(_app_handle: AppHandle, id: String) -> Result<bool, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let deleted = db.delete_patient(&id).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue if patient was deleted
    if deleted {
        if let Err(e) = crate::auto_sync::add_sync_operation(
            crate::auto_sync::SyncOperation::DeletePatient(id)
        ) {
            eprintln!("Failed to add patient deletion to sync queue: {}", e);
        }
    }
    
    Ok(deleted)
}

#[tauri::command]
pub async fn db_search_patients(_app_handle: AppHandle, query: String) -> Result<Vec<Patient>, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    db.search_patients(&query).map_err(|e| e.to_string())
}

// Appointment CRUD operations
#[tauri::command]
pub async fn db_get_appointments(_app_handle: AppHandle) -> Result<Vec<Appointment>, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    db.get_appointments().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_create_appointment(
    _app_handle: AppHandle,
    request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let appointment = db.create_appointment(request).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue
    if let Err(e) = crate::auto_sync::add_sync_operation(
        crate::auto_sync::SyncOperation::CreateAppointment(appointment.clone())
    ) {
        eprintln!("Failed to add appointment to sync queue: {}", e);
    }
    
    Ok(appointment)
}

#[tauri::command]
pub async fn db_update_appointment(
    _app_handle: AppHandle,
    id: String,
    request: CreateAppointmentRequest,
) -> Result<Option<Appointment>, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let appointment = db.update_appointment(&id, request).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue if appointment was updated
    if let Some(ref appointment) = appointment {
        if let Err(e) = crate::auto_sync::add_sync_operation(
            crate::auto_sync::SyncOperation::UpdateAppointment(appointment.clone())
        ) {
            eprintln!("Failed to add appointment update to sync queue: {}", e);
        }
    }
    
    Ok(appointment)
}

#[tauri::command]
pub async fn db_delete_appointment(_app_handle: AppHandle, id: String) -> Result<bool, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let deleted = db.delete_appointment(&id).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue if appointment was deleted
    if deleted {
        if let Err(e) = crate::auto_sync::add_sync_operation(
            crate::auto_sync::SyncOperation::DeleteAppointment(id)
        ) {
            eprintln!("Failed to add appointment deletion to sync queue: {}", e);
        }
    }
    
    Ok(deleted)
}

// Document CRUD operations
#[tauri::command]
pub async fn db_get_documents(_app_handle: AppHandle, patient_id: Option<String>) -> Result<Vec<Document>, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    db.get_documents(patient_id.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_create_document(
    _app_handle: AppHandle,
    request: CreateDocumentRequest,
) -> Result<Document, String> {
        let crypto_guard = CRYPTO_SERVICE.get().ok_or("Crypto service not initialized")?.lock().unwrap();
        let crypto_service = crypto_guard.as_ref()
            .ok_or("Crypto service not initialized")?;

    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

        // Decode base64 content
        let content_bytes = base64::engine::general_purpose::STANDARD.decode(&request.content)
            .map_err(|e| format!("Invalid base64 content: {}", e))?;

        // Encrypt document
        let encrypted_doc = crypto_service.encrypt_document(&content_bytes, &request.filename)
            .map_err(|e| format!("Document encryption failed: {}", e))?;

        // Decode base64 strings to bytes
        let encrypted_content = base64::engine::general_purpose::STANDARD.decode(&encrypted_doc.content)
            .map_err(|e| format!("Failed to decode encrypted content: {}", e))?;
        let nonce = base64::engine::general_purpose::STANDARD.decode(&encrypted_doc.iv)
            .map_err(|e| format!("Failed to decode IV: {}", e))?;
        let tag = base64::engine::general_purpose::STANDARD.decode(&encrypted_doc.tag)
            .map_err(|e| format!("Failed to decode tag: {}", e))?;

        // Store in database
    let document = db.create_document(
            request,
            encrypted_content,
            nonce,
            tag,
        ).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue
    if let Err(e) = crate::auto_sync::add_sync_operation(
        crate::auto_sync::SyncOperation::CreateDocument(document.clone())
    ) {
        eprintln!("Failed to add document to sync queue: {}", e);
    }
    
    Ok(document)
}

#[tauri::command]
pub async fn db_get_document_content(_app_handle: AppHandle, document_id: String) -> Result<String, String> {
        let crypto_guard = CRYPTO_SERVICE.get().ok_or("Crypto service not initialized")?.lock().unwrap();
        let crypto_service = crypto_guard.as_ref()
            .ok_or("Crypto service not initialized")?;

    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

        // Get encrypted content from database
        let (encrypted_content, nonce, tag) = db.get_document_content(&document_id)
            .map_err(|e| e.to_string())?
            .ok_or("Document not found")?;

        // Encode bytes to base64 strings
        let content_b64 = base64::engine::general_purpose::STANDARD.encode(&encrypted_content);
        let iv_b64 = base64::engine::general_purpose::STANDARD.encode(&nonce);
        let tag_b64 = base64::engine::general_purpose::STANDARD.encode(&tag);

        // Create encrypted document struct
        let encrypted_doc = crate::crypto::EncryptedDocument {
            content: content_b64,
            iv: iv_b64,
            salt: "".to_string(), // Not used in this context
            tag: tag_b64,
            file_hash: document_id.clone(),
        };

        // Decrypt document
        let decrypted_bytes = crypto_service.decrypt_document(&encrypted_doc)
            .map_err(|e| format!("Document decryption failed: {}", e))?;

        // Encode as base64
        let decrypted_content = base64::engine::general_purpose::STANDARD.encode(&decrypted_bytes);
        Ok(decrypted_content)
}

#[tauri::command]
pub async fn db_delete_document(_app_handle: AppHandle, id: String) -> Result<bool, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    let deleted = db.delete_document(&id).map_err(|e| e.to_string())?;
    
    // Add to auto-sync queue if document was deleted
    if deleted {
        if let Err(e) = crate::auto_sync::add_sync_operation(
            crate::auto_sync::SyncOperation::DeleteDocument(id)
        ) {
            eprintln!("Failed to add document deletion to sync queue: {}", e);
        }
    }
    
    Ok(deleted)
}

// Statistics and reports
#[tauri::command]
pub async fn db_get_appointment_statistics(_app_handle: AppHandle) -> Result<serde_json::Value, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    db.get_appointment_statistics().map_err(|e| e.to_string())
}

// Backup and restore
#[tauri::command]
pub async fn db_backup_database(_app_handle: AppHandle) -> Result<serde_json::Value, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    db.backup_database().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_restore_database(_app_handle: AppHandle, backup_data: serde_json::Value) -> Result<String, String> {
    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
        
    db.restore_database(backup_data).map_err(|e| e.to_string())
}

// Migration from in-memory to database
#[tauri::command]
pub async fn migrate_from_memory_to_database(_app_handle: AppHandle) -> Result<String, String> {
    // Get data from in-memory storage first
    let memory_patients = crate::commands_simple::PATIENTS.lock().unwrap().clone();
    let memory_appointments = crate::commands_simple::APPOINTMENTS.lock().unwrap().clone();

    let mut migrated_count = 0;

    let db_guard = DATABASE.get().ok_or("Database not initialized")?.lock().unwrap();
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

        // Migrate patients
        for patient in memory_patients {
            let patient_name = patient.name.clone();
            let request = CreatePatientRequest {
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                birth_date: patient.birth_date,
                address: patient.address,
                notes: patient.notes,
            };
            
            if let Err(e) = db.create_patient(request) {
                eprintln!("Failed to migrate patient {}: {}", patient_name, e);
            } else {
                migrated_count += 1;
            }
        }

        // Migrate appointments
        for appointment in memory_appointments {
            let request = CreateAppointmentRequest {
                patient_id: appointment.patient_id,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status,
                notes: appointment.notes,
            };
            
            if let Err(e) = db.create_appointment(request) {
                eprintln!("Failed to migrate appointment {}: {}", appointment.id, e);
            } else {
                migrated_count += 1;
            }
        }

    Ok(format!("Migration completed. {} records migrated to database.", migrated_count))
}
