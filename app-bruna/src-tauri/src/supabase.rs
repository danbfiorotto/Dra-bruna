use anyhow::Result;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

// Data structures for Supabase integration
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Patient {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub birth_date: Option<String>,
    pub address: Option<String>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Appointment {
    pub id: String,
    pub patient_id: String,
    pub title: String,
    pub description: Option<String>,
    pub appointment_date: String,
    pub start_time: String,
    pub end_time: String,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Document {
    pub id: String,
    pub patient_id: String,
    pub title: String,
    pub description: Option<String>,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: String,
    pub encrypted: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseConfig {
    pub url: String,
    pub anon_key: String,
    pub service_role_key: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseAuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
    pub token_type: String,
    pub user: SupabaseUser,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseUser {
    pub id: String,
    pub email: String,
    pub user_metadata: serde_json::Value,
    pub app_metadata: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseProfile {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncStatus {
    pub last_sync: Option<String>,
    pub status: String,
    pub patients_synced: i32,
    pub appointments_synced: i32,
    pub documents_synced: i32,
    pub errors: Vec<String>,
}

pub struct SupabaseClient {
    config: SupabaseConfig,
    client: reqwest::Client,
}

impl SupabaseClient {
    pub fn new(config: SupabaseConfig) -> Self {
        let client = reqwest::Client::new();
        Self { config, client }
    }

    pub async fn sign_in_with_password(&self, email: &str, password: &str) -> Result<SupabaseAuthResponse> {
        let url = format!("{}/auth/v1/token?grant_type=password", self.config.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "email": email,
                "password": password
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Authentication failed: HTTP {} - {}", status, error_text));
        }

        let auth_response: SupabaseAuthResponse = response.json().await?;
        Ok(auth_response)
    }

    pub async fn sign_up(&self, email: &str, password: &str, name: &str) -> Result<SupabaseAuthResponse> {
        let url = format!("{}/auth/v1/signup", self.config.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "email": email,
                "password": password,
                "data": {
                    "name": name
                }
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Registration failed: HTTP {} - {}", status, error_text));
        }

        let auth_response: SupabaseAuthResponse = response.json().await?;
        Ok(auth_response)
    }

    pub async fn refresh_token(&self, refresh_token: &str) -> Result<SupabaseAuthResponse> {
        let url = format!("{}/auth/v1/token?grant_type=refresh_token", self.config.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "refresh_token": refresh_token
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Token refresh failed: HTTP {} - {}", status, error_text));
        }

        let auth_response: SupabaseAuthResponse = response.json().await?;
        Ok(auth_response)
    }

    pub async fn sign_out(&self, access_token: &str) -> Result<()> {
        let url = format!("{}/auth/v1/logout", self.config.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Logout failed: HTTP {} - {}", status, error_text));
        }

        Ok(())
    }

    pub async fn get_user_profile(&self, access_token: &str, user_id: &str) -> Result<SupabaseProfile> {
        let url = format!("{}/rest/v1/profiles?id=eq.{}", self.config.url, user_id);
        
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to get profile: HTTP {} - {}", status, error_text));
        }

        let profiles: Vec<SupabaseProfile> = response.json().await?;
        profiles.into_iter().next()
            .ok_or_else(|| anyhow::anyhow!("Profile not found"))
    }

    // Sync methods for data synchronization
    pub async fn create_patient(&self, patient: &Patient) -> Result<()> {
        let url = format!("{}/rest/v1/patients", self.config.url);
        
        // Use upsert to handle duplicate keys
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Content-Type", "application/json")
            .header("Prefer", "resolution=merge-duplicates")
            .json(patient)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to create patient: HTTP {} - {}", status, error_text));
        }

        Ok(())
    }

    pub async fn get_patients(&self) -> Result<Vec<Patient>> {
        let url = format!("{}/rest/v1/patients", self.config.url);
        
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to get patients: HTTP {} - {}", status, error_text));
        }

        let patients: Vec<Patient> = response.json().await?;
        Ok(patients)
    }

    pub async fn create_appointment(&self, appointment: &Appointment) -> Result<()> {
        let url = format!("{}/rest/v1/appointments", self.config.url);
        
        // Create a Supabase-compatible appointment without patient_name
        let supabase_appointment = serde_json::json!({
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "date": appointment.appointment_date,
            "time": appointment.start_time,
            "status": appointment.status,
            "notes": appointment.notes,
            "created_at": appointment.created_at,
            "updated_at": appointment.updated_at
        });
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Content-Type", "application/json")
            .header("Prefer", "resolution=merge-duplicates")
            .json(&supabase_appointment)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to create appointment: HTTP {} - {}", status, error_text));
        }

        Ok(())
    }

    pub async fn get_appointments(&self) -> Result<Vec<Appointment>> {
        let url = format!("{}/rest/v1/appointments", self.config.url);
        
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to get appointments: HTTP {} - {}", status, error_text));
        }

        let appointments: Vec<Appointment> = response.json().await?;
        Ok(appointments)
    }

    pub async fn create_document(&self, document: &Document) -> Result<()> {
        let url = format!("{}/rest/v1/documents", self.config.url);
        
        let response = self.client
            .post(&url)
            .header("apikey", &self.config.anon_key)
            .header("Content-Type", "application/json")
            .json(document)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to create document: HTTP {} - {}", status, error_text));
        }

        Ok(())
    }

    pub async fn get_documents(&self) -> Result<Vec<Document>> {
        let url = format!("{}/rest/v1/documents", self.config.url);
        
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to get documents: HTTP {} - {}", status, error_text));
        }

        let documents: Vec<Document> = response.json().await?;
        Ok(documents)
    }

    pub async fn test_connection(&self) -> Result<bool> {
        let url = format!("{}/rest/v1/", self.config.url);
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", self.config.anon_key))
            .send()
            .await?;

        Ok(response.status().is_success())
    }

    pub async fn sync_patients(&self, patients: &[Patient]) -> Result<SyncStatus> {
        let mut status = SyncStatus {
            last_sync: Some(chrono::Utc::now().to_rfc3339()),
            status: "syncing".to_string(),
            patients_synced: 0,
            appointments_synced: 0,
            documents_synced: 0,
            errors: Vec::new(),
        };

        let url = format!("{}/rest/v1/patients", self.config.url);
        
        for patient in patients {
            match self.sync_single_patient(&url, patient).await {
                Ok(_) => status.patients_synced += 1,
                Err(e) => status.errors.push(format!("Erro ao sincronizar paciente {}: {}", patient.name, e)),
            }
        }

        status.status = if status.errors.is_empty() {
            "completed".to_string()
        } else {
            "completed_with_errors".to_string()
        };

        Ok(status)
    }

    async fn sync_single_patient(&self, url: &str, patient: &Patient) -> Result<()> {
        let response = self.client
            .post(url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", self.config.anon_key))
            .header("Content-Type", "application/json")
            .header("Prefer", "resolution=merge-duplicates")
            .json(patient)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        Ok(())
    }

    pub async fn sync_appointments(&self, appointments: &[Appointment]) -> Result<SyncStatus> {
        let mut status = SyncStatus {
            last_sync: Some(chrono::Utc::now().to_rfc3339()),
            status: "syncing".to_string(),
            patients_synced: 0,
            appointments_synced: 0,
            documents_synced: 0,
            errors: Vec::new(),
        };

        let url = format!("{}/rest/v1/appointments", self.config.url);
        
        for appointment in appointments {
            match self.sync_single_appointment(&url, appointment).await {
                Ok(_) => status.appointments_synced += 1,
                Err(e) => status.errors.push(format!("Erro ao sincronizar consulta {}: {}", appointment.id, e)),
            }
        }

        status.status = if status.errors.is_empty() {
            "completed".to_string()
        } else {
            "completed_with_errors".to_string()
        };

        Ok(status)
    }

    async fn sync_single_appointment(&self, url: &str, appointment: &Appointment) -> Result<()> {
        let response = self.client
            .post(url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", self.config.anon_key))
            .header("Content-Type", "application/json")
            .header("Prefer", "resolution=merge-duplicates")
            .json(appointment)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        Ok(())
    }

    pub async fn get_remote_patients(&self) -> Result<Vec<Patient>> {
        let url = format!("{}/rest/v1/patients", self.config.url);
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", self.config.anon_key))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        let patients: Vec<Patient> = response.json().await?;
        Ok(patients)
    }

    pub async fn get_remote_appointments(&self) -> Result<Vec<Appointment>> {
        let url = format!("{}/rest/v1/appointments", self.config.url);
        let response = self.client
            .get(&url)
            .header("apikey", &self.config.anon_key)
            .header("Authorization", format!("Bearer {}", self.config.anon_key))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("HTTP {}: {}", status, error_text));
        }

        let appointments: Vec<Appointment> = response.json().await?;
        Ok(appointments)
    }
}
