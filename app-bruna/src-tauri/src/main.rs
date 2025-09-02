// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod crypto;
mod commands;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database
            database::init_database(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::get_patients,
            commands::create_patient,
            commands::update_patient,
            commands::delete_patient,
            commands::get_appointments,
            commands::create_appointment,
            commands::update_appointment,
            commands::delete_appointment,
            commands::encrypt_data,
            commands::decrypt_data,
            commands::backup_database,
            commands::restore_database
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
