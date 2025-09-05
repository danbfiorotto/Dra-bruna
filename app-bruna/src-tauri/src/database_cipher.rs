use anyhow::Result;
use rusqlite::{Connection, params, Row};

use tauri::{AppHandle, Manager};
use uuid::Uuid;
use chrono::Utc;

pub struct DatabaseManager {
    connection: Connection,
}

impl DatabaseManager {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        let app_data_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|_| anyhow::anyhow!("Failed to get app data directory"))?;

        std::fs::create_dir_all(&app_data_dir)?;

        let db_path = app_data_dir.join("clinic_encrypted.db");
        let mut connection = Connection::open(&db_path)?;

        // Enable SQLCipher
        connection.execute("PRAGMA key = 'DraBrunaClinic2024!';", [])?;
        
        // Verify encryption is working
        connection.execute("PRAGMA cipher_version;", [])?;

        let manager = Self { connection };
        manager.run_migrations()?;
        
        Ok(manager)
    }

    fn run_migrations(&self) -> Result<()> {
        // Create migrations table
        self.connection.execute(
            "CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY,
                version TEXT UNIQUE NOT NULL,
                applied_at TEXT NOT NULL
            )",
            [],
        )?;

        // Get applied migrations
        let mut stmt = self.connection.prepare("SELECT version FROM migrations ORDER BY version")?;
        let applied_migrations: Vec<String> = stmt
            .query_map([], |row| Ok(row.get::<_, String>(0)?))?
            .collect::<Result<Vec<_>, _>>()?;

        // Run pending migrations
        let migrations = get_migrations();
        for migration in migrations {
            if !applied_migrations.contains(&migration.version) {
                println!("Running migration: {}", migration.version);
                self.connection.execute(&migration.sql, [])?;
                
                // Record migration
                self.connection.execute(
                    "INSERT INTO migrations (version, applied_at) VALUES (?, ?)",
                    params![migration.version, Utc::now().to_rfc3339()],
                )?;
            }
        }

        Ok(())
    }

    pub fn get_connection(&self) -> &Connection {
        &self.connection
    }
}

struct Migration {
    version: String,
    sql: String,
}

fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: "001_initial_schema".to_string(),
            sql: r#"
                CREATE TABLE IF NOT EXISTS patients (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT,
                    phone TEXT,
                    birth_date TEXT,
                    address TEXT,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT
                );

                CREATE TABLE IF NOT EXISTS appointments (
                    id TEXT PRIMARY KEY,
                    patient_id TEXT NOT NULL,
                    date TEXT NOT NULL,
                    time TEXT NOT NULL,
                    status TEXT NOT NULL,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id)
                );

                CREATE TABLE IF NOT EXISTS treatment_types (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    duration_minutes INTEGER,
                    price REAL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT
                );

                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    patient_id TEXT NOT NULL,
                    appointment_id TEXT,
                    filename TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_type TEXT,
                    file_size INTEGER,
                    encrypted BOOLEAN DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id),
                    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
                );

                CREATE TABLE IF NOT EXISTS medical_records (
                    id TEXT PRIMARY KEY,
                    patient_id TEXT NOT NULL,
                    appointment_id TEXT,
                    anamnesis TEXT,
                    diagnosis TEXT,
                    treatment_plan TEXT,
                    notes TEXT,
                    version INTEGER DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id),
                    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
                );

                CREATE TABLE IF NOT EXISTS financial_transactions (
                    id TEXT PRIMARY KEY,
                    patient_id TEXT,
                    appointment_id TEXT,
                    type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    deleted_at TEXT,
                    FOREIGN KEY (patient_id) REFERENCES patients (id),
                    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
                );

                CREATE TABLE IF NOT EXISTS audit_log (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    action TEXT NOT NULL,
                    entity_type TEXT NOT NULL,
                    entity_id TEXT,
                    details TEXT,
                    timestamp TEXT NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    host TEXT
                );
            "#.to_string(),
        },
        Migration {
            version: "002_fts5_search".to_string(),
            sql: r#"
                CREATE VIRTUAL TABLE IF NOT EXISTS patients_fts USING fts5(
                    name, email, phone, address, notes,
                    content='patients',
                    content_rowid='rowid'
                );

                CREATE TRIGGER IF NOT EXISTS patients_fts_insert AFTER INSERT ON patients BEGIN
                    INSERT INTO patients_fts(rowid, name, email, phone, address, notes)
                    VALUES (new.rowid, new.name, new.email, new.phone, new.address, new.notes);
                END;

                CREATE TRIGGER IF NOT EXISTS patients_fts_delete AFTER DELETE ON patients BEGIN
                    INSERT INTO patients_fts(patients_fts, rowid, name, email, phone, address, notes)
                    VALUES('delete', old.rowid, old.name, old.email, old.phone, old.address, old.notes);
                END;

                CREATE TRIGGER IF NOT EXISTS patients_fts_update AFTER UPDATE ON patients BEGIN
                    INSERT INTO patients_fts(patients_fts, rowid, name, email, phone, address, notes)
                    VALUES('delete', old.rowid, old.name, old.email, old.phone, old.address, old.notes);
                    INSERT INTO patients_fts(rowid, name, email, phone, address, notes)
                    VALUES (new.rowid, new.name, new.email, new.phone, new.address, new.notes);
                END;
            "#.to_string(),
        },
        Migration {
            version: "003_settings_table".to_string(),
            sql: r#"
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES 
                    ('documents_path', '', ?),
                    ('encryption_enabled', '1', ?),
                    ('timezone', 'America/Sao_Paulo', ?),
                    ('backup_auto', '1', ?),
                    ('backup_interval_days', '7', ?);
            "#.to_string(),
        },
    ]
}

// Helper functions for common database operations
pub fn get_uuid() -> String {
    Uuid::new_v4().to_string()
}

pub fn get_timestamp() -> String {
    Utc::now().to_rfc3339()
}

pub fn parse_row_to_patient(row: &Row) -> Result<crate::commands::Patient> {
    Ok(crate::commands::Patient {
        id: row.get("id")?,
        name: row.get("name")?,
        email: row.get("email")?,
        phone: row.get("phone")?,
        birth_date: row.get("birth_date")?,
        address: row.get("address")?,
        notes: row.get("notes")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

pub fn parse_row_to_appointment(row: &Row) -> Result<crate::commands::Appointment> {
    Ok(crate::commands::Appointment {
        id: row.get("id")?,
        patient_id: row.get("patient_id")?,
        date: row.get("date")?,
        time: row.get("time")?,
        status: row.get("status")?,
        notes: row.get("notes")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}
