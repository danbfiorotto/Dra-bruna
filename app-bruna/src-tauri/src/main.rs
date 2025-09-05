// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands_simple;
mod commands_database;
mod commands_sync;
mod supabase;
mod auth;
mod dpapi;
mod crypto;
mod database;
mod config;
mod auto_sync;
mod hybrid_sync;



fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize configuration first
            if let Err(e) = config::initialize_config() {
                eprintln!("Failed to initialize configuration: {}", e);
                return Err(e.into());
            }
            
            // Initialize database on app startup
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // Get configuration
                let config = match config::get_config() {
                    Ok(config) => config,
                    Err(e) => {
                        eprintln!("Failed to get configuration: {}", e);
                        return;
                    }
                };
                
                // Initialize main database with configuration
                if let Err(e) = commands_database::initialize_database(
                    app_handle.clone(),
                    config.master_password.clone(),
                    config.database_encrypted,
                ).await {
                    eprintln!("Failed to initialize main database: {}", e);
                }
                
                // Initialize sync database
                if let Err(e) = commands_sync::initialize_sync_database(app_handle.clone()).await {
                    eprintln!("Failed to initialize sync database: {}", e);
                }
                
                // Initialize auto-sync
                if let Err(e) = auto_sync::initialize_auto_sync(app_handle).await {
                    eprintln!("Failed to initialize auto-sync: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Legacy commands (in-memory)
            commands_simple::greet,
            commands_simple::get_patients,
            commands_simple::create_patient,
            commands_simple::update_patient,
            commands_simple::delete_patient,
            commands_simple::search_patients,
            commands_simple::create_appointment,
            commands_simple::update_appointment,
            commands_simple::delete_appointment,
            commands_simple::create_document,
            commands_simple::delete_document,
            commands_simple::generate_patients_report,
            commands_simple::generate_appointments_report,
            commands_simple::generate_documents_report,
            commands_simple::generate_daily_appointments_report,
            commands_simple::get_appointment_statistics,
            commands_simple::backup_database,
            commands_simple::restore_database,
            commands_simple::get_backup_info,
            commands_simple::schedule_automatic_backup,
            // commands_simple::test_supabase_connection,
            // commands_simple::sync_to_supabase,
            // commands_simple::sync_from_supabase,
            // commands_simple::get_sync_status,
            commands_simple::encrypt_data,
            commands_simple::decrypt_data,
            // Authentication commands
            commands_simple::initialize_auth,
            commands_simple::login,
            commands_simple::logout,
            commands_simple::get_current_user,
            commands_simple::refresh_session,
            commands_simple::encrypt_document,
            commands_simple::decrypt_document,
            commands_simple::check_permission,
            // Database commands (SQLite)
            commands_database::initialize_database,
            commands_database::get_database_status,
            commands_database::db_get_patients,
            commands_database::db_create_patient,
            commands_database::db_update_patient,
            commands_database::db_delete_patient,
            commands_database::db_search_patients,
            commands_database::db_get_appointments,
            commands_database::db_create_appointment,
            commands_database::db_update_appointment,
            commands_database::db_delete_appointment,
            commands_database::db_get_documents,
            commands_database::db_create_document,
            commands_database::db_get_document_content,
            commands_database::db_delete_document,
            commands_database::db_get_appointment_statistics,
            commands_database::db_backup_database,
            commands_database::db_restore_database,
            commands_database::migrate_from_memory_to_database,
            // Sync commands (Supabase)
            commands_sync::test_supabase_connection,
            commands_sync::sync_to_supabase,
            commands_sync::sync_from_supabase,
            commands_sync::get_sync_status,
            commands_sync::initialize_sync_database,
            // Hybrid sync commands
            hybrid_sync::sync_hybrid,
            hybrid_sync::resolve_conflict
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
