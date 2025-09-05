use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex, Arc};
use base64::Engine;

use crate::dpapi::SecureSession;

// =========================
// Modelos
// =========================

#[derive(Debug, Clone, Serialize, Deserialize)]
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
pub struct CreatePatientRequest {
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub birth_date: Option<String>,
    pub address: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Appointment {
    pub id: String,
    pub patient_id: String,
    pub patient_name: Option<String>,
    pub date: String,
    pub time: String,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAppointmentRequest {
    pub patient_id: String,
    pub date: String,
    pub time: String,
    pub status: String,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub patient_id: String,
    pub appointment_id: Option<String>,
    pub filename: String,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
    pub encrypted: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDocumentRequest {
    pub patient_id: String,
    pub appointment_id: Option<String>,
    pub filename: String,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
    pub content: String, // Base64
}

// =========================
// Armazenamento em memória
// =========================

pub static PATIENTS: LazyLock<Mutex<Vec<Patient>>> = LazyLock::new(|| Mutex::new(Vec::new()));
pub static APPOINTMENTS: LazyLock<Mutex<Vec<Appointment>>> = LazyLock::new(|| Mutex::new(Vec::new()));
pub static DOCUMENTS: LazyLock<Mutex<Vec<Document>>> = LazyLock::new(|| Mutex::new(Vec::new()));
pub static DOCUMENT_CONTENT: LazyLock<Mutex<HashMap<String, String>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

// =========================
// Serviços (Auth/Crypto/DPAPI)
// =========================

pub static AUTH_SERVICE: LazyLock<Mutex<Option<Arc<crate::auth::AuthService>>>> =
    LazyLock::new(|| Mutex::new(None));

pub static DPAPI_SERVICE: LazyLock<Mutex<Option<crate::dpapi::DpapiService>>> =
    LazyLock::new(|| Mutex::new(None));

pub static CRYPTO_SERVICE: LazyLock<Mutex<Option<crate::crypto::CryptoService>>> =
    LazyLock::new(|| Mutex::new(None));

pub static CURRENT_SESSION: LazyLock<Mutex<Option<SecureSession>>> =
    LazyLock::new(|| Mutex::new(None));

pub static AUDIT_LOGS: LazyLock<Mutex<Vec<crate::auth::AuditLog>>> =
    LazyLock::new(|| Mutex::new(Vec::new()));

// =========================
// Comandos básicos
// =========================

#[tauri::command]
pub async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

// =========================
// Pacientes
// =========================

#[tauri::command]
pub async fn get_patients(_app_handle: AppHandle) -> Result<Vec<Patient>, String> {
    Ok(PATIENTS.lock().unwrap().clone())
}

#[tauri::command]
pub async fn create_patient(
    _app_handle: AppHandle,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let patient = Patient {
        id: id.clone(),
        name: request.name,
        email: request.email,
        phone: request.phone,
        birth_date: request.birth_date,
        address: request.address,
        notes: request.notes,
        created_at: now.clone(),
        updated_at: now,
    };

    PATIENTS.lock().unwrap().push(patient.clone());
    Ok(patient)
}

#[tauri::command]
pub async fn update_patient(
    _app_handle: AppHandle,
    id: String,
    request: CreatePatientRequest,
) -> Result<Patient, String> {
    let mut guard = PATIENTS.lock().unwrap();
    if let Some(p) = guard.iter_mut().find(|p| p.id == id) {
        p.name = request.name;
        p.email = request.email;
        p.phone = request.phone;
        p.birth_date = request.birth_date;
        p.address = request.address;
        p.notes = request.notes;
        p.updated_at = chrono::Utc::now().to_rfc3339();
        Ok(p.clone())
    } else {
        Err("Patient not found".into())
    }
}

#[tauri::command]
pub async fn delete_patient(_app_handle: AppHandle, id: String) -> Result<(), String> {
    PATIENTS.lock().unwrap().retain(|p| p.id != id);
    Ok(())
}

#[tauri::command]
pub async fn search_patients(_app_handle: AppHandle, query: String) -> Result<Vec<Patient>, String> {
    let q = query.to_lowercase();
    let out = PATIENTS.lock().unwrap()
        .iter()
        .filter(|p| {
            p.name.to_lowercase().contains(&q) ||
            p.email.as_ref().map_or(false, |e| e.to_lowercase().contains(&q)) ||
            p.phone.as_ref().map_or(false, |ph| ph.contains(&query))
        })
        .cloned()
        .collect();
    Ok(out)
}

// =========================
// Consultas
// =========================

#[tauri::command]
pub async fn get_appointments(_app_handle: AppHandle) -> Result<Vec<Appointment>, String> {
    let patients = PATIENTS.lock().unwrap();
    let mut list: Vec<Appointment> = APPOINTMENTS.lock().unwrap().iter().cloned().collect();
    for a in &mut list {
        a.patient_name = patients.iter().find(|p| p.id == a.patient_id).map(|p| p.name.clone());
    }
    list.sort_by(|a, b| format!("{} {}", a.date, a.time).cmp(&format!("{} {}", b.date, b.time)));
    Ok(list)
}

#[tauri::command]
pub async fn create_appointment(
    _app_handle: AppHandle,
    request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    if !PATIENTS.lock().unwrap().iter().any(|p| p.id == request.patient_id) {
        return Err("Patient not found".into());
    }

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let appointment = Appointment {
        id: id.clone(),
        patient_id: request.patient_id,
        patient_name: None,
        date: request.date,
        time: request.time,
        status: request.status,
        notes: request.notes,
        created_at: now.clone(),
        updated_at: now,
    };

    APPOINTMENTS.lock().unwrap().push(appointment.clone());
    Ok(appointment)
}

#[tauri::command]
pub async fn update_appointment(
    _app_handle: AppHandle,
    id: String,
    request: CreateAppointmentRequest,
) -> Result<Appointment, String> {
    if !PATIENTS.lock().unwrap().iter().any(|p| p.id == request.patient_id) {
        return Err("Patient not found".into());
    }

    let mut guard = APPOINTMENTS.lock().unwrap();
    if let Some(appointment) = guard.iter_mut().find(|a| a.id == id) {
        appointment.patient_id = request.patient_id;
        appointment.date = request.date;
        appointment.time = request.time;
        appointment.status = request.status;
        appointment.notes = request.notes;
        appointment.updated_at = chrono::Utc::now().to_rfc3339();
        Ok(appointment.clone())
    } else {
        Err("Appointment not found".into())
    }
}

#[tauri::command]
pub async fn delete_appointment(_app_handle: AppHandle, id: String) -> Result<(), String> {
    APPOINTMENTS.lock().unwrap().retain(|a| a.id != id);
    Ok(())
}

// =========================
// Documentos
// =========================

#[tauri::command]
pub async fn get_documents(_app_handle: AppHandle, patient_id: Option<String>) -> Result<Vec<Document>, String> {
    let docs = DOCUMENTS.lock().unwrap();
    let out: Vec<Document> = match patient_id {
        Some(pid) => docs.iter().filter(|d| d.patient_id == pid).cloned().collect(),
        None => docs.clone(),
    };
    Ok(out)
}

#[tauri::command]
pub async fn create_document(
    _app_handle: AppHandle,
    request: CreateDocumentRequest,
) -> Result<Document, String> {
    if !PATIENTS.lock().unwrap().iter().any(|p| p.id == request.patient_id) {
        return Err("Patient not found".into());
    }

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    // "Criptografia" simples (somente simulação)
    let encrypted_content = format!("ENCRYPTED:{}", request.content);

    let document = Document {
        id: id.clone(),
        patient_id: request.patient_id,
        appointment_id: request.appointment_id,
        filename: request.filename,
        file_type: request.file_type,
        file_size: request.file_size,
        encrypted: true,
        created_at: now.clone(),
        updated_at: now,
    };

    DOCUMENTS.lock().unwrap().push(document.clone());
    DOCUMENT_CONTENT.lock().unwrap().insert(id, encrypted_content);

    Ok(document)
}

#[tauri::command]
pub async fn get_document_content(_app_handle: AppHandle, document_id: String) -> Result<String, String> {
    let map = DOCUMENT_CONTENT.lock().unwrap();
    let content = map.get(&document_id).ok_or("Document not found")?;
    Ok(if let Some(raw) = content.strip_prefix("ENCRYPTED:") { raw.to_string() } else { content.clone() })
}

#[tauri::command]
pub async fn delete_document(_app_handle: AppHandle, id: String) -> Result<(), String> {
    DOCUMENTS.lock().unwrap().retain(|d| d.id != id);
    DOCUMENT_CONTENT.lock().unwrap().remove(&id);
    Ok(())
}

// =========================
// Utilitários de criptografia simples (Base64)
// =========================

#[tauri::command]
pub async fn encrypt_data(data: String) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    let encoded = general_purpose::STANDARD.encode(data.as_bytes());
    Ok(format!("ENCRYPTED:{}", encoded))
}

#[tauri::command]
pub async fn decrypt_data(encrypted_data: String) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    if let Some(data) = encrypted_data.strip_prefix("ENCRYPTED:") {
        match general_purpose::STANDARD.decode(data) {
            Ok(decoded) => String::from_utf8(decoded).map_err(|_| "Invalid UTF-8 data".to_string()),
            Err(_) => Err("Invalid base64 data".to_string()),
        }
    } else {
        Err("Invalid encrypted data format".to_string())
    }
}

// =========================
// Relatórios (CSV em memória)
// =========================

#[tauri::command]
pub async fn generate_patients_report(_app_handle: AppHandle) -> Result<String, String> {
    let mut csv_content = String::from("ID,Nome,Email,Telefone,Data de Nascimento,Endereço,Observações,Data de Criação\n");
    for patient in PATIENTS.lock().unwrap().iter() {
        csv_content.push_str(&format!(
            "{},{},{},{},{},{},{},{}\n",
            patient.id,
            patient.name,
            patient.email.as_deref().unwrap_or(""),
            patient.phone.as_deref().unwrap_or(""),
            patient.birth_date.as_deref().unwrap_or(""),
            patient.address.as_deref().unwrap_or(""),
            patient.notes.as_deref().unwrap_or(""),
            patient.created_at
        ));
    }
    Ok(csv_content)
}

#[tauri::command]
pub async fn generate_appointments_report(_app_handle: AppHandle) -> Result<String, String> {
    let mut csv_content = String::from("ID,Paciente ID,Nome do Paciente,Data,Hora,Status,Observações,Data de Criação\n");
    for appointment in APPOINTMENTS.lock().unwrap().iter() {
        let patients_guard = PATIENTS.lock().unwrap();
        let patient_name = patients_guard
            .iter()
            .find(|p| p.id == appointment.patient_id)
            .map(|p| p.name.as_str())
            .unwrap_or("Paciente não encontrado");

        csv_content.push_str(&format!(
            "{},{},{},{},{},{},{},{}\n",
            appointment.id,
            appointment.patient_id,
            patient_name,
            appointment.date,
            appointment.time,
            appointment.status,
            appointment.notes.as_deref().unwrap_or(""),
            appointment.created_at
        ));
    }
    Ok(csv_content)
}

#[tauri::command]
pub async fn generate_documents_report(_app_handle: AppHandle) -> Result<String, String> {
    let mut csv_content = String::from("ID,Paciente ID,Nome do Paciente,Nome do Arquivo,Tipo,Tamanho,Criptografado,Data de Criação\n");
    for document in DOCUMENTS.lock().unwrap().iter() {
        let patients_guard = PATIENTS.lock().unwrap();
        let patient_name = patients_guard
            .iter()
            .find(|p| p.id == document.patient_id)
            .map(|p| p.name.as_str())
            .unwrap_or("Paciente não encontrado");

        csv_content.push_str(&format!(
            "{},{},{},{},{},{},{},{}\n",
            document.id,
            document.patient_id,
            patient_name,
            document.filename,
            document.file_type.as_deref().unwrap_or(""),
            document.file_size.unwrap_or(0),
            if document.encrypted { "Sim" } else { "Não" },
            document.created_at
        ));
    }
    Ok(csv_content)
}

#[tauri::command]
pub async fn generate_daily_appointments_report(_app_handle: AppHandle, date: String) -> Result<String, String> {
    let mut csv_content = String::from("ID,Paciente ID,Nome do Paciente,Data,Hora,Status,Observações\n");
    for appointment in APPOINTMENTS.lock().unwrap().iter() {
        if appointment.date == date {
            let patients_guard = PATIENTS.lock().unwrap();
            let patient_name = patients_guard
                .iter()
                .find(|p| p.id == appointment.patient_id)
                .map(|p| p.name.as_str())
                .unwrap_or("Paciente não encontrado");

            csv_content.push_str(&format!(
                "{},{},{},{},{},{},{}\n",
                appointment.id,
                appointment.patient_id,
                patient_name,
                appointment.date,
                appointment.time,
                appointment.status,
                appointment.notes.as_deref().unwrap_or("")
            ));
        }
    }
    Ok(csv_content)
}

#[tauri::command]
pub async fn get_appointment_statistics(_app_handle: AppHandle) -> Result<serde_json::Value, String> {
    let appts = APPOINTMENTS.lock().unwrap();
    let total = appts.len();
    let confirmed = appts.iter().filter(|a| a.status.eq_ignore_ascii_case("confirmada")).count();
    let pending   = appts.iter().filter(|a| a.status.eq_ignore_ascii_case("pendente")).count();
    let completed = appts.iter().filter(|a| a.status.eq_ignore_ascii_case("realizada")).count();
    let cancelled = appts.iter().filter(|a| a.status.eq_ignore_ascii_case("cancelada")).count();

    Ok(serde_json::json!({
        "total": total,
        "confirmed": confirmed,
        "pending": pending,
        "completed": completed,
        "cancelled": cancelled,
        "confirmation_rate": if total>0 { (confirmed as f64 / total as f64)*100.0 } else { 0.0 },
        "completion_rate":   if total>0 { (completed as f64 / total as f64)*100.0 } else { 0.0 }
    }))
}

// =========================
// Backup/Restore (simulação)
// =========================

#[tauri::command]
pub async fn backup_database(_app_handle: AppHandle) -> Result<String, String> {
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let backup_filename = format!("backup_{}.json", timestamp);

    let backup_data = serde_json::json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "version": "1.0.0",
        "patients": PATIENTS.lock().unwrap().clone(),
        "appointments": APPOINTMENTS.lock().unwrap().clone(),
        "documents": DOCUMENTS.lock().unwrap().clone(),
        "document_content": DOCUMENT_CONTENT.lock().unwrap().clone()
    });

    let backup_json = serde_json::to_string_pretty(&backup_data)
        .map_err(|e| format!("Erro ao serializar backup: {}", e))?;

    Ok(format!("Backup criado: {} ({} bytes)", backup_filename, backup_json.len()))
}

#[tauri::command]
pub async fn restore_database(_app_handle: AppHandle, backup_data: String) -> Result<String, String> {
    let backup: serde_json::Value = serde_json::from_str(&backup_data)
        .map_err(|e| format!("Erro ao parsear backup: {}", e))?;

    PATIENTS.lock().unwrap().clear();
    APPOINTMENTS.lock().unwrap().clear();
    DOCUMENTS.lock().unwrap().clear();
    DOCUMENT_CONTENT.lock().unwrap().clear();

    if let Some(patients_array) = backup.get("patients").and_then(|v| v.as_array()) {
        for patient_json in patients_array {
            if let Ok(patient) = serde_json::from_value::<Patient>(patient_json.clone()) {
                PATIENTS.lock().unwrap().push(patient);
            }
        }
    }

    if let Some(appointments_array) = backup.get("appointments").and_then(|v| v.as_array()) {
        for appointment_json in appointments_array {
            if let Ok(appointment) = serde_json::from_value::<Appointment>(appointment_json.clone()) {
                APPOINTMENTS.lock().unwrap().push(appointment);
            }
        }
    }

    if let Some(documents_array) = backup.get("documents").and_then(|v| v.as_array()) {
        for document_json in documents_array {
            if let Ok(document) = serde_json::from_value::<Document>(document_json.clone()) {
                DOCUMENTS.lock().unwrap().push(document);
            }
        }
    }

    if let Some(content_obj) = backup.get("document_content").and_then(|v| v.as_object()) {
        let mut content_map = std::collections::HashMap::new();
        for (key, value) in content_obj {
            if let Some(content_str) = value.as_str() {
                content_map.insert(key.clone(), content_str.to_string());
            }
        }
        DOCUMENT_CONTENT.lock().unwrap().extend(content_map);
    }

    Ok(format!(
        "Backup restaurado com sucesso! {} pacientes, {} consultas, {} documentos",
        PATIENTS.lock().unwrap().len(),
        APPOINTMENTS.lock().unwrap().len(),
        DOCUMENTS.lock().unwrap().len()
    ))
}

#[tauri::command]
pub async fn get_backup_info(_app_handle: AppHandle) -> Result<serde_json::Value, String> {
    let info = serde_json::json!({
        "patients_count": PATIENTS.lock().unwrap().len(),
        "appointments_count": APPOINTMENTS.lock().unwrap().len(),
        "documents_count": DOCUMENTS.lock().unwrap().len(),
        "total_size": PATIENTS.lock().unwrap().len()
            + APPOINTMENTS.lock().unwrap().len()
            + DOCUMENTS.lock().unwrap().len()
            + DOCUMENT_CONTENT.lock().unwrap().len(),
        "last_backup": "Nunca"
    });

    Ok(info)
}

#[tauri::command]
pub async fn schedule_automatic_backup(_app_handle: AppHandle, enabled: bool) -> Result<String, String> {
    if enabled {
        Ok("Backup automático habilitado (simulação - em produção seria configurado um cron job)".to_string())
    } else {
        Ok("Backup automático desabilitado".to_string())
    }
}

// =========================
// Autenticação / Sessão
// =========================

#[tauri::command]
pub async fn initialize_auth(
    _app_handle: AppHandle,
    supabase_url: String,
    supabase_anon_key: String,
    master_password: String,
) -> Result<String, String> {
    AUTH_SERVICE.lock().unwrap().replace(Arc::new(crate::auth::AuthService::new(
        supabase_url,
        supabase_anon_key,
    )));
    DPAPI_SERVICE.lock().unwrap().replace(crate::dpapi::DpapiService::new());
    let crypto = crate::crypto::CryptoService::new(&master_password)
        .map_err(|e| format!("Failed to initialize crypto service: {}", e))?;
    CRYPTO_SERVICE.lock().unwrap().replace(crypto);
    Ok("Authentication services initialized successfully".to_string())
}

#[tauri::command]
pub async fn login(
    _app_handle: AppHandle,
    email: String,
    password: String,
) -> Result<crate::auth::LoginResponse, String> {
    // Clona o Arc<AuthService> fora do lock
    let service: Arc<crate::auth::AuthService> = {
        let guard = AUTH_SERVICE.lock().unwrap();
        guard.as_ref().cloned().ok_or("Authentication service not initialized")?
    };

    let login_response = service
        .login(email.clone(), password)
        .await
        .map_err(|e| format!("Login failed: {}", e))?;

    // Cria e persiste a sessão (sem await aqui)
    let secure_session = SecureSession {
        user_id: login_response.user.id.clone(),
        email: login_response.user.email.clone(),
        role: login_response.user.role.as_str().to_string(),
        access_token: login_response.access_token.clone(),
        refresh_token: login_response.refresh_token.clone(),
        expires_at: login_response.expires_at.to_rfc3339(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    // Salva via DPAPI (pode exigir &mut self)
    {
        let mut dpapi_guard = DPAPI_SERVICE.lock().unwrap();
        if let Some(dpapi) = dpapi_guard.as_mut() {
            dpapi
                .store_session(uuid::Uuid::new_v4().to_string(), secure_session.clone())
                .map_err(|e| format!("Failed to store session: {}", e))?;
        }
    }

    // Atualiza sessão atual
    CURRENT_SESSION.lock().unwrap().replace(secure_session.clone());

    // Audit log (await somente com Arc<AuthService>, sem locks ativos)
    let audit_log = service
        .create_audit_log(
            login_response.user.id.clone(),
            login_response.user.email.clone(),
            "LOGIN".to_string(),
            "USER".to_string(),
            Some(login_response.user.id.clone()),
            Some("User logged in successfully".to_string()),
            None,
            None,
        )
        .await
        .map_err(|e| format!("Failed to create audit log: {}", e))?;
    AUDIT_LOGS.lock().unwrap().push(audit_log);

    Ok(login_response)
}

#[tauri::command]
pub async fn logout(_app_handle: AppHandle) -> Result<String, String> {
    // Captura dados necessários da sessão e o serviço de auth
    let (service_opt, access_token_opt, user_id_opt, email_opt) = {
        let service = AUTH_SERVICE.lock().unwrap().as_ref().cloned();
        let session_guard = CURRENT_SESSION.lock().unwrap();
        let (access, uid, mail) = if let Some(s) = session_guard.as_ref() {
            (Some(s.access_token.clone()), Some(s.user_id.clone()), Some(s.email.clone()))
        } else {
            (None, None, None)
        };
        (service, access, uid, mail)
    };

    if let Some(service) = service_opt {
        if let Some(access_token) = access_token_opt {
            let _ = service.logout(access_token).await;
        }

        // Cria audit log se tivermos dados do usuário
        if let (Some(uid), Some(mail)) = (user_id_opt, email_opt) {
            let audit_log = service
                .create_audit_log(
                    uid.clone(),
                    mail.clone(),
                    "LOGOUT".to_string(),
                    "USER".to_string(),
                    Some(uid),
                    Some("User logged out".to_string()),
                    None,
                    None,
                )
                .await
                .map_err(|e| format!("Failed to create audit log: {}", e))?;
            AUDIT_LOGS.lock().unwrap().push(audit_log);
        }
    }

    // Limpa sessão atual
    CURRENT_SESSION.lock().unwrap().take();

    // Limpa DPAPI (pode exigir &mut self)
    {
        let mut dpapi_guard = DPAPI_SERVICE.lock().unwrap();
        if let Some(dpapi) = dpapi_guard.as_mut() {
            dpapi
                .clear_all_sessions()
                .map_err(|e| format!("Failed to clear sessions: {}", e))?;
        }
    }

    Ok("Logged out successfully".to_string())
}

#[tauri::command]
pub async fn get_current_user(_app_handle: AppHandle) -> Result<Option<crate::auth::User>, String> {
    if let Some(session) = CURRENT_SESSION.lock().unwrap().as_ref() {
        Ok(Some(crate::auth::User {
            id: session.user_id.clone(),
            email: session.email.clone(),
            name: "".to_string(),
            role: crate::auth::UserRole::from_str(&session.role)
                .unwrap_or(crate::auth::UserRole::Admin),
            active: true,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn refresh_session(_app_handle: AppHandle) -> Result<crate::auth::LoginResponse, String> {
    // Pega refresh_token e created_at sem segurar o lock em await
    let (refresh_token, created_at) = {
        let guard = CURRENT_SESSION.lock().unwrap();
        let s = guard.as_ref().ok_or("No active session")?;
        (s.refresh_token.clone(), s.created_at.clone())
    };

    // Clona o AuthService
    let service: Arc<crate::auth::AuthService> = {
        let guard = AUTH_SERVICE.lock().unwrap();
        guard.as_ref().cloned().ok_or("Authentication service not initialized")?
    };

    // Atualiza token
    let login_response = service
        .refresh_token(refresh_token)
        .await
        .map_err(|e| format!("Token refresh failed: {}", e))?;

    // Atualiza CURRENT_SESSION após await
    {
        let mut cur = CURRENT_SESSION.lock().unwrap();
        cur.replace(SecureSession {
            user_id: login_response.user.id.clone(),
            email: login_response.user.email.clone(),
            role: login_response.user.role.as_str().to_string(),
            access_token: login_response.access_token.clone(),
            refresh_token: login_response.refresh_token.clone(),
            expires_at: login_response.expires_at.to_rfc3339(),
            created_at,
        });
    }

    Ok(login_response)
}

// =========================
// Criptografia de documentos (real)
// =========================

#[tauri::command]
pub async fn encrypt_document(
    _app_handle: AppHandle,
    content: String, // Base64
    filename: String,
) -> Result<crate::crypto::EncryptedDocument, String> {
    use base64::{engine::general_purpose, Engine as _};

    // Executa criptografia sem manter locks durante await (não há await aqui)
    let encrypted_doc = {
        let crypto_guard = CRYPTO_SERVICE.lock().unwrap();
        let crypto_service = crypto_guard
            .as_ref()
            .ok_or("Crypto service not initialized")?;
        let content_bytes = general_purpose::STANDARD
            .decode(&content)
            .map_err(|e| format!("Invalid base64 content: {}", e))?;
        crypto_service
            .encrypt_document(&content_bytes, &filename)
            .map_err(|e| format!("Document encryption failed: {}", e))?
    };

    // Audit log (se houver sessão e serviço de auth)
    let (service_opt, sess_info) = {
        let service = AUTH_SERVICE.lock().unwrap().as_ref().cloned();
        let sess = CURRENT_SESSION.lock().unwrap().clone();
        (service, sess)
    };

    if let (Some(service), Some(session)) = (service_opt, sess_info) {
        let audit_log = service
            .create_audit_log(
                session.user_id.clone(),
                session.email.clone(),
                "ENCRYPT_DOCUMENT".to_string(),
                "DOCUMENT".to_string(),
                Some(filename.clone()),
                Some(format!("Document encrypted: {}", filename)),
                None,
                None,
            )
            .await
            .map_err(|e| format!("Failed to create audit log: {}", e))?;
        AUDIT_LOGS.lock().unwrap().push(audit_log);
    }

    Ok(encrypted_doc)
}

#[tauri::command]
pub async fn decrypt_document(
    _app_handle: AppHandle,
    encrypted_doc: crate::crypto::EncryptedDocument,
) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};

    // Decripta sem manter locks durante awaits
    let decrypted_content_b64 = {
        let crypto_guard = CRYPTO_SERVICE.lock().unwrap();
        let crypto_service = crypto_guard
            .as_ref()
            .ok_or("Crypto service not initialized")?;
        let decrypted_bytes = crypto_service
            .decrypt_document(&encrypted_doc)
            .map_err(|e| format!("Document decryption failed: {}", e))?;
        general_purpose::STANDARD.encode(&decrypted_bytes)
    };

    // Audit log (se houver sessão e serviço de auth)
    let (service_opt, sess_info) = {
        let service = AUTH_SERVICE.lock().unwrap().as_ref().cloned();
        let sess = CURRENT_SESSION.lock().unwrap().clone();
        (service, sess)
    };

    if let (Some(service), Some(session)) = (service_opt, sess_info) {
        let audit_log = service
            .create_audit_log(
                session.user_id.clone(),
                session.email.clone(),
                "DECRYPT_DOCUMENT".to_string(),
                "DOCUMENT".to_string(),
                Some(encrypted_doc.file_hash.clone()),
                Some("Document decrypted".to_string()),
                None,
                None,
            )
            .await
            .map_err(|e| format!("Failed to create audit log: {}", e))?;
        AUDIT_LOGS.lock().unwrap().push(audit_log);
    }

    Ok(decrypted_content_b64)
}

// =========================
// Auditoria / Permissões
// =========================

#[tauri::command]
pub async fn list_audit_logs(
    _app_handle: AppHandle,
    user_id: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Vec<crate::auth::AuditLog>, String> {
    let mut logs = AUDIT_LOGS.lock().unwrap().clone();

    if let Some(uid) = user_id {
        logs.retain(|l| l.user_id == uid);
    }

    if let Some(start) = start_date {
        if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&start) {
            let s = dt.with_timezone(&chrono::Utc);
            logs.retain(|l| l.created_at >= s);
        }
    }

    if let Some(end) = end_date {
        if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(&end) {
            let e = dt.with_timezone(&chrono::Utc);
            logs.retain(|l| l.created_at <= e);
        }
    }

    logs.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(logs)
}

#[tauri::command]
pub async fn check_permission(
    _app_handle: AppHandle,
    _action: String,
) -> Result<bool, String> {
    if let Some(session) = CURRENT_SESSION.lock().unwrap().as_ref() {
        let role = crate::auth::UserRole::from_str(&session.role)
            .unwrap_or(crate::auth::UserRole::Admin);

        let has_permission = match role {
            crate::auth::UserRole::Admin => true,
        };

        Ok(has_permission)
    } else {
        Ok(false)
    }
}

