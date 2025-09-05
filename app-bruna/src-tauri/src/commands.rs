use crate::{crypto::CryptoService, database_cipher::{DatabaseManager, get_uuid, get_timestamp, parse_row_to_patient, parse_row_to_appointment}};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use uuid::Uuid;
use std::sync::{Mutex, OnceLock};

#[derive(Debug, Serialize, Deserialize)]
pub struct Patient {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub birth_date: Option<String>,
    pub address: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Appointment {
    pub id: String,
    pub patient_id: String,
    pub date: String,
    pub time: String,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePatientRequest {
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub birth_date: Option<String>,
    pub address: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAppointmentRequest {
    pub patient_id: String,
    pub date: String,
    pub time: String,
    pub status: String,
    pub notes: Option<String>,
}

// Simple in-memory storage for demo purposes
// In production, this should be properly managed
static CRYPTO_SERVICE: OnceLock<Mutex<Option<CryptoService>>> = OnceLock::new();

fn get_crypto_service() -> &'static CryptoService {
    let crypto_guard = CRYPTO_SERVICE.get_or_init(|| Mutex::new(None));
    let mut crypto = crypto_guard.lock().unwrap();
    if crypto.is_none() {
        *crypto = Some(CryptoService::new().expect("Failed to initialize crypto"));
    }
    // This is unsafe but necessary for returning a static reference
    // The crypto service is initialized once and never changed
    unsafe {
        std::mem::transmute(crypto.as_ref().unwrap() as *const CryptoService)
    }
}

fn log_audit(conn: &rusqlite::Connection, action: &str, entity_type: &str, entity_id: &str, details: &str) -> Result<()> {
    let audit_id = get_uuid();
    let timestamp = get_timestamp();
    
    conn.execute(
        "INSERT INTO audit_log (id, action, entity_type, entity_id, details, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?)",
        rusqlite::params![audit_id, action, entity_type, entity_id, details, timestamp],
    )?;
    
    Ok(())
}

#[tauri::command]
pub async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

#[tauri::command]
pub async fn get_patients(app_handle: AppHandle) -> Result<Vec<Patient>, String> {
    let db_manager = DatabaseManager::new(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;
    
    let conn = db_manager.get_connection();
    let mut stmt = conn.prepare("SELECT * FROM patients WHERE deleted_at IS NULL ORDER BY name")
        .map_err(|e| format!("Query error: {}", e))?;

    let patient_iter = stmt.query_map([], |row| {
        parse_row_to_patient(row).map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e)))
    }).map_err(|e| format!("Query execution error: {}", e))?;

    let mut patients = Vec::new();
    for patient in patient_iter {
        patients.push(patient.map_err(|e| format!("Row parsing error: {}", e))?);
    }

    Ok(patients)
}

#[tauri::command]
pub async fn create_patient(
    app_handle: AppHandle,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let db_manager = DatabaseManager::new(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;
    
    let conn = db_manager.get_connection();
    let id = get_uuid();
    let now = get_timestamp();

    conn.execute(
        "INSERT INTO patients (id, name, email, phone, birth_date, address, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![
            &id,
            &request.name,
            &request.email,
            &request.phone,
            &request.birth_date,
            &request.address,
            &request.notes,
            &now,
            &now
        ],
    ).map_err(|e| format!("Insert error: {}", e))?;

    // Log audit
    log_audit(&conn, "CREATE", "patient", &id, &format!("Created patient: {}", request.name))
        .map_err(|e| format!("Audit log error: {}", e))?;

    Ok(Patient {
        id,
        name: request.name,
        email: request.email,
        phone: request.phone,
        birth_date: request.birth_date,
        address: request.address,
        notes: request.notes,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_patient(
    app_handle: AppHandle,
    id: String,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let db_manager = DatabaseManager::new(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;
    
    let conn = db_manager.get_connection();
    let now = get_timestamp();

    conn.execute(
        "UPDATE patients SET name = ?, email = ?, phone = ?, birth_date = ?, address = ?, notes = ?, updated_at = ? 
         WHERE id = ? AND deleted_at IS NULL",
        rusqlite::params![
            &request.name,
            &request.email,
            &request.phone,
            &request.birth_date,
            &request.address,
            &request.notes,
            &now,
            &id
        ],
    ).map_err(|e| format!("Update error: {}", e))?;

    // Log audit
    log_audit(&conn, "UPDATE", "patient", &id, &format!("Updated patient: {}", request.name))
        .map_err(|e| format!("Audit log error: {}", e))?;

    // Fetch updated patient
    let mut stmt = conn.prepare("SELECT * FROM patients WHERE id = ? AND deleted_at IS NULL")
        .map_err(|e| format!("Query error: {}", e))?;
    
    let patient = stmt.query_row(rusqlite::params![&id], |row| {
        Ok(parse_row_to_patient(row)?)
    }).map_err(|e| format!("Row parsing error: {}", e))?;

    Ok(patient)
}

#[tauri::command]
pub async fn delete_patient(app_handle: AppHandle, id: String) -> Result<(), String> {
    let db_manager = DatabaseManager::new(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;
    
    let conn = db_manager.get_connection();
    let now = get_timestamp();

    // Soft delete
    conn.execute(
        "UPDATE patients SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
        rusqlite::params![&now, &id],
    ).map_err(|e| format!("Delete error: {}", e))?;

    // Log audit
    log_audit(&conn, "DELETE", "patient", &id, "Soft deleted patient")
        .map_err(|e| format!("Audit log error: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn search_patients(app_handle: AppHandle, query: String) -> Result<Vec<Patient>, String> {
    let db_manager = DatabaseManager::new(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;
    
    let conn = db_manager.get_connection();
    
    // Use FTS5 for full-text search
    let mut stmt = conn.prepare(
        "SELECT p.* FROM patients p 
         JOIN patients_fts fts ON p.rowid = fts.rowid 
         WHERE fts.patients_fts MATCH ? AND p.deleted_at IS NULL 
         ORDER BY rank"
    ).map_err(|e| format!("Query error: {}", e))?;

    let patient_iter = stmt.query_map(rusqlite::params![&query], |row| {
        Ok(parse_row_to_patient(row)?)
    }).map_err(|e| format!("Query execution error: {}", e))?;

    let mut patients = Vec::new();
    for patient in patient_iter {
        patients.push(patient.map_err(|e| format!("Row parsing error: {}", e))?);
    }

    Ok(patients)
}

#[tauri::command]
pub async fn get_appointments(app_handle: AppHandle) -> Result<Vec<Appointment>, String> {
    let db_manager = DatabaseManager::new(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;
    
    let conn = db_manager.get_connection();
    let mut stmt = conn.prepare("SELECT * FROM appointments WHERE deleted_at IS NULL ORDER BY date, time")
        .map_err(|e| format!("Query error: {}", e))?;

    let appointment_iter = stmt.query_map([], |row| {
        Ok(parse_row_to_appointment(row)?)
    }).map_err(|e| format!("Query execution error: {}", e))?;

    let mut appointments = Vec::new();
    for appointment in appointment_iter {
        appointments.push(appointment.map_err(|e| format!("Row parsing error: {}", e))?);
    }

    Ok(appointments)
}

// Simplified appointment functions - will be implemented later
#[tauri::command]
pub async fn create_appointment(
    _app_handle: AppHandle,
    _request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub async fn update_appointment(
    _app_handle: AppHandle,
    _id: String,
    _request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub async fn delete_appointment(_app_handle: AppHandle, _id: String) -> Result<(), String> {
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub async fn encrypt_data(data: String) -> Result<String, String> {
    let crypto = get_crypto_service();
    crypto
        .encrypt(data.as_bytes())
        .map_err(|e| format!("Encryption error: {}", e))
}

#[tauri::command]
pub async fn decrypt_data(encrypted_data: String) -> Result<String, String> {
    let crypto = get_crypto_service();
    let decrypted_bytes = crypto
        .decrypt(&encrypted_data)
        .map_err(|e| format!("Decryption error: {}", e))?;
    
    String::from_utf8(decrypted_bytes)
        .map_err(|e| format!("UTF-8 conversion error: {}", e))
}

#[tauri::command]
pub async fn backup_database(_app_handle: AppHandle) -> Result<String, String> {
    // This is a simplified backup - in production, you'd want more robust backup logic
    Ok("Backup functionality not implemented yet".to_string())
}

#[tauri::command]
pub async fn restore_database(_app_handle: AppHandle, _backup_path: String) -> Result<(), String> {
    // This is a simplified restore - in production, you'd want more robust restore logic
    Ok(())
}
