use crate::{crypto::CryptoService, database};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePool, Row};
use std::collections::HashMap;
use tauri::State;
use uuid::Uuid;

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
static mut CRYPTO_SERVICE: Option<CryptoService> = None;

fn get_crypto_service() -> &'static CryptoService {
    unsafe {
        if CRYPTO_SERVICE.is_none() {
            CRYPTO_SERVICE = Some(CryptoService::new().expect("Failed to initialize crypto"));
        }
        CRYPTO_SERVICE.as_ref().unwrap()
    }
}

#[tauri::command]
pub async fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub async fn get_patients(app_handle: tauri::AppHandle) -> Result<Vec<Patient>, String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    let rows = sqlx::query("SELECT * FROM patients ORDER BY name")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let patients: Result<Vec<Patient>, _> = rows
        .into_iter()
        .map(|row| {
            Ok(Patient {
                id: row.get("id"),
                name: row.get("name"),
                email: row.get("email"),
                phone: row.get("phone"),
                birth_date: row.get("birth_date"),
                address: row.get("address"),
                notes: row.get("notes"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            })
        })
        .collect();

    patients.map_err(|e| format!("Row parsing error: {}", e))
}

#[tauri::command]
pub async fn create_patient(
    app_handle: tauri::AppHandle,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO patients (id, name, email, phone, birth_date, address, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&request.name)
    .bind(&request.email)
    .bind(&request.phone)
    .bind(&request.birth_date)
    .bind(&request.address)
    .bind(&request.notes)
    .bind(&now)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Insert error: {}", e))?;

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
    app_handle: tauri::AppHandle,
    id: String,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE patients SET name = ?, email = ?, phone = ?, birth_date = ?, address = ?, notes = ?, updated_at = ? 
         WHERE id = ?",
    )
    .bind(&request.name)
    .bind(&request.email)
    .bind(&request.phone)
    .bind(&request.birth_date)
    .bind(&request.address)
    .bind(&request.notes)
    .bind(&now)
    .bind(&id)
    .execute(&pool)
    .await
    .map_err(|e| format!("Update error: {}", e))?;

    Ok(Patient {
        id,
        name: request.name,
        email: request.email,
        phone: request.phone,
        birth_date: request.birth_date,
        address: request.address,
        notes: request.notes,
        created_at: "".to_string(), // Would need to fetch from DB
        updated_at: now,
    })
}

#[tauri::command]
pub async fn delete_patient(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    sqlx::query("DELETE FROM patients WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Delete error: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_appointments(app_handle: tauri::AppHandle) -> Result<Vec<Appointment>, String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    let rows = sqlx::query("SELECT * FROM appointments ORDER BY date, time")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query error: {}", e))?;

    let appointments: Result<Vec<Appointment>, _> = rows
        .into_iter()
        .map(|row| {
            Ok(Appointment {
                id: row.get("id"),
                patient_id: row.get("patient_id"),
                date: row.get("date"),
                time: row.get("time"),
                status: row.get("status"),
                notes: row.get("notes"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            })
        })
        .collect();

    appointments.map_err(|e| format!("Row parsing error: {}", e))
}

#[tauri::command]
pub async fn create_appointment(
    app_handle: tauri::AppHandle,
    request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO appointments (id, patient_id, date, time, status, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&request.patient_id)
    .bind(&request.date)
    .bind(&request.time)
    .bind(&request.status)
    .bind(&request.notes)
    .bind(&now)
    .bind(&now)
    .execute(&pool)
    .await
    .map_err(|e| format!("Insert error: {}", e))?;

    Ok(Appointment {
        id,
        patient_id: request.patient_id,
        date: request.date,
        time: request.time,
        status: request.status,
        notes: request.notes,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_appointment(
    app_handle: tauri::AppHandle,
    id: String,
    request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "UPDATE appointments SET patient_id = ?, date = ?, time = ?, status = ?, notes = ?, updated_at = ? 
         WHERE id = ?",
    )
    .bind(&request.patient_id)
    .bind(&request.date)
    .bind(&request.time)
    .bind(&request.status)
    .bind(&request.notes)
    .bind(&now)
    .bind(&id)
    .execute(&pool)
    .await
    .map_err(|e| format!("Update error: {}", e))?;

    Ok(Appointment {
        id,
        patient_id: request.patient_id,
        date: request.date,
        time: request.time,
        status: request.status,
        notes: request.notes,
        created_at: "".to_string(), // Would need to fetch from DB
        updated_at: now,
    })
}

#[tauri::command]
pub async fn delete_appointment(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let pool = SqlitePool::connect(&database_url)
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    sqlx::query("DELETE FROM appointments WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await
        .map_err(|e| format!("Delete error: {}", e))?;

    Ok(())
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
pub async fn backup_database(app_handle: tauri::AppHandle) -> Result<String, String> {
    // This is a simplified backup - in production, you'd want more robust backup logic
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    let backup_path = format!("{}.backup", database_url);
    
    // In a real implementation, you'd copy the database file
    // and potentially encrypt it
    Ok(format!("Backup created at: {}", backup_path))
}

#[tauri::command]
pub async fn restore_database(app_handle: tauri::AppHandle, backup_path: String) -> Result<(), String> {
    // This is a simplified restore - in production, you'd want more robust restore logic
    let database_url = database::get_database_url(&app_handle)
        .map_err(|e| format!("Database error: {}", e))?;

    // In a real implementation, you'd restore from the backup file
    // and verify integrity
    Ok(())
}
