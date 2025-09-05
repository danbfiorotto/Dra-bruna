use serde::{Deserialize, Serialize};
use std::env;
use std::sync::{Mutex, OnceLock};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseConfig {
    pub url: String,
    pub anon_key: String,
    pub service_role_key: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub supabase: SupabaseConfig,
    pub master_password: String,
    pub database_encrypted: bool,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, String> {
        // Load .env file if it exists
        if let Err(_) = dotenv::dotenv() {
            eprintln!("Warning: Could not load .env file, using environment variables or defaults");
        }
        
        let supabase_url = env::var("SUPABASE_URL")
            .unwrap_or_else(|_| "https://yzegxffboezduzqbrrfv.supabase.co".to_string());
        
        let supabase_anon_key = env::var("SUPABASE_ANON_KEY")
            .unwrap_or_else(|_| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZWd4ZmZib2V6ZHV6cWJycmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTYyMTEsImV4cCI6MjA3MjQ5MjIxMX0.L5nffqlwK6cWYjyZKywrCVmd124emU7sDizDcHpcC9M".to_string());
        
        let supabase_service_role_key = env::var("SUPABASE_SERVICE_ROLE_KEY").ok();
        
        let master_password = env::var("MASTER_PASSWORD")
            .unwrap_or_else(|_| "03151731.Bts".to_string());
        
        let database_encrypted = env::var("DATABASE_ENCRYPTED")
            .unwrap_or_else(|_| "false".to_string())
            .parse::<bool>()
            .unwrap_or(false);

        // Debug logging
        eprintln!("Supabase URL: {}", supabase_url);
        eprintln!("Supabase Anon Key: {}...", &supabase_anon_key[..20]);
        eprintln!("Master Password: {}...", &master_password[..5]);

        Ok(AppConfig {
            supabase: SupabaseConfig {
                url: supabase_url,
                anon_key: supabase_anon_key,
                service_role_key: supabase_service_role_key,
            },
            master_password,
            database_encrypted,
        })
    }
}

// Global configuration instance
static APP_CONFIG: OnceLock<Mutex<Option<AppConfig>>> = OnceLock::new();

fn get_config_mutex() -> &'static Mutex<Option<AppConfig>> {
    APP_CONFIG.get_or_init(|| Mutex::new(None))
}

pub fn get_config() -> Result<&'static AppConfig, String> {
    let config_guard = get_config_mutex().lock().unwrap();
    if let Some(ref config) = *config_guard {
        // This is unsafe but necessary for returning a static reference
        // The config is initialized once and never changed
        unsafe {
            Ok(std::mem::transmute(config as *const AppConfig))
        }
    } else {
        Err("Configuration not initialized".to_string())
    }
}

pub fn initialize_config() -> Result<(), String> {
    let mut config_guard = get_config_mutex().lock().unwrap();
    *config_guard = Some(AppConfig::from_env()?);
    Ok(())
}
