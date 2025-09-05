use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UserRole {
    Admin,
}

impl UserRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            UserRole::Admin => "admin",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "admin" => Some(UserRole::Admin),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub user: User,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseAuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
    pub user: SupabaseUser,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SupabaseUser {
    pub id: String,
    pub email: String,
    pub user_metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: String,
    pub user_id: String,
    pub user_email: String,
    pub action: String,
    pub entity_type: String,
    pub entity_id: Option<String>,
    pub details: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
}

pub struct AuthService {
    supabase_url: String,
    supabase_anon_key: String,
    client: reqwest::Client,
}

impl AuthService {
    pub fn new(supabase_url: String, supabase_anon_key: String) -> Self {
        Self {
            supabase_url,
            supabase_anon_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn login(&self, email: String, password: String) -> Result<LoginResponse> {
        let url = format!("{}/auth/v1/token?grant_type=password", self.supabase_url);
        
        let mut body = HashMap::new();
        body.insert("email", email.clone());
        body.insert("password", password);

        let response = self.client
            .post(&url)
            .header("apikey", &self.supabase_anon_key)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Login failed: {}", error_text));
        }

        let auth_response: SupabaseAuthResponse = response.json().await?;
        
        // Get user profile with role information
        let user = self.get_user_profile(&auth_response.user.id).await?;
        
        let expires_at = Utc::now() + chrono::Duration::seconds(auth_response.expires_in);

        Ok(LoginResponse {
            user,
            access_token: auth_response.access_token,
            refresh_token: auth_response.refresh_token,
            expires_at,
        })
    }

    pub async fn refresh_token(&self, refresh_token: String) -> Result<LoginResponse> {
        let url = format!("{}/auth/v1/token?grant_type=refresh_token", self.supabase_url);
        
        let mut body = HashMap::new();
        body.insert("refresh_token", refresh_token);

        let response = self.client
            .post(&url)
            .header("apikey", &self.supabase_anon_key)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Token refresh failed: {}", error_text));
        }

        let auth_response: SupabaseAuthResponse = response.json().await?;
        
        // Get user profile with role information
        let user = self.get_user_profile(&auth_response.user.id).await?;
        
        let expires_at = Utc::now() + chrono::Duration::seconds(auth_response.expires_in);

        Ok(LoginResponse {
            user,
            access_token: auth_response.access_token,
            refresh_token: auth_response.refresh_token,
            expires_at,
        })
    }

    async fn get_user_profile(&self, user_id: &str) -> Result<User> {
        let url = format!("{}/rest/v1/profiles?id=eq.{}", self.supabase_url, user_id);
        
        let response = self.client
            .get(&url)
            .header("apikey", &self.supabase_anon_key)
            .header("Authorization", format!("Bearer {}", self.supabase_anon_key))
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Failed to get user profile: {}", error_text));
        }

        let profiles: Vec<serde_json::Value> = response.json().await?;
        
        if profiles.is_empty() {
            return Err(anyhow::anyhow!("User profile not found"));
        }

        let profile = &profiles[0];
        
        let role = profile.get("role")
            .and_then(|r| r.as_str())
            .and_then(UserRole::from_str)
            .unwrap_or(UserRole::Admin); // Default role

        Ok(User {
            id: profile.get("id")
                .and_then(|id| id.as_str())
                .unwrap_or(user_id)
                .to_string(),
            email: profile.get("email")
                .and_then(|e| e.as_str())
                .unwrap_or("")
                .to_string(),
            name: profile.get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("")
                .to_string(),
            role,
            active: profile.get("active")
                .and_then(|a| a.as_bool())
                .unwrap_or(true),
            created_at: profile.get("created_at")
                .and_then(|c| c.as_str())
                .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(Utc::now),
            updated_at: profile.get("updated_at")
                .and_then(|u| u.as_str())
                .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(Utc::now),
        })
    }

    pub async fn logout(&self, access_token: String) -> Result<()> {
        let url = format!("{}/auth/v1/logout", self.supabase_url);
        
        self.client
            .post(&url)
            .header("apikey", &self.supabase_anon_key)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await?;

        Ok(())
    }

    pub async fn create_audit_log(
        &self,
        user_id: String,
        user_email: String,
        action: String,
        entity_type: String,
        entity_id: Option<String>,
        details: Option<String>,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Result<AuditLog> {
        let audit_log = AuditLog {
            id: Uuid::new_v4().to_string(),
            user_id,
            user_email,
            action,
            entity_type,
            entity_id,
            details,
            ip_address,
            user_agent,
            created_at: Utc::now(),
        };

        // In a real implementation, this would be saved to the database
        // For now, we'll just return the audit log
        Ok(audit_log)
    }
}
