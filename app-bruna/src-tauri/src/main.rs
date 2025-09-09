// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod supabase;
mod auth;
mod config;
mod commands;
mod real_time;
mod offline_cache;
mod security;
mod performance;



fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize configuration
            if let Err(e) = config::initialize_config() {
                eprintln!("Failed to initialize configuration: {}", e);
                return Err(e.into());
            }
            
            let app_handle = app.handle().clone();
            
            // Initialize robust system components
            tauri::async_runtime::spawn(async move {
                // Initialize Supabase connection
                // Initialize Supabase configuration
                if let Err(e) = config::initialize_config() {
                    eprintln!("Failed to initialize Supabase: {}", e);
                }
                
                // Initialize offline cache
                if let Err(e) = offline_cache::initialize_cache().await {
                    eprintln!("Failed to initialize offline cache: {}", e);
                }
                
                // Initialize real-time synchronization
                if let Err(e) = real_time::initialize_real_time_sync(app_handle.clone()).await {
                    eprintln!("Failed to initialize real-time sync: {}", e);
                }
                
                // Initialize security monitoring
                if let Err(e) = security::initialize_security_monitoring().await {
                    eprintln!("Failed to initialize security monitoring: {}", e);
                }
                
                // Initialize performance monitoring
                if let Err(e) = performance::initialize_performance_monitoring().await {
                    eprintln!("Failed to initialize performance monitoring: {}", e);
                }
                
                eprintln!("🚀 Sistema Dra. Bruna inicializado com sucesso!");
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Core system commands
            commands::get_system_status,
            commands::get_app_info,
            commands::check_connectivity,
            
            // Authentication commands
            commands::login,
            commands::logout,
            commands::get_current_user,
            commands::refresh_session,
            commands::check_permission,
            
            // Real-time commands
            commands::subscribe_to_changes,
            commands::unsubscribe_from_changes,
            commands::get_sync_status,
            
            // Offline cache commands
            commands::get_cached_data,
            commands::sync_offline_changes,
            commands::clear_cache,
            
            // Security commands
            commands::audit_action,
            commands::get_security_logs,
            commands::validate_data_integrity,
            
            // Performance commands
            commands::get_performance_metrics,
            commands::optimize_database,
            commands::cleanup_old_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
