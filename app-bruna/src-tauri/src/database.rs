use anyhow::Result;
use rusqlite::{Connection, params, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use chrono::Utc;
use sha2::Digest;

use crate::commands_simple::{Patient, Appointment, Document, CreatePatientRequest, CreateAppointmentRequest, CreateDocumentRequest};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub path: String,
    pub encrypted: bool,
    pub key: Option<String>,
}

pub struct Database {
    conn: Mutex<Connection>,
    config: DatabaseConfig,
}

impl Database {
    pub fn new(config: DatabaseConfig) -> Result<Self> {
        let conn = if config.encrypted {
            Self::create_encrypted_connection(&config)?
        } else {
            Self::create_connection(&config)?
        };

        let db = Self {
            conn: Mutex::new(conn),
            config,
        };

        db.initialize_schema()?;
        Ok(db)
    }

    fn create_connection(config: &DatabaseConfig) -> Result<Connection> {
        let conn = Connection::open(&config.path)?;
        Ok(conn)
    }

    fn create_encrypted_connection(config: &DatabaseConfig) -> Result<Connection> {
        // For now, just create a regular connection
        // SQLCipher support can be added later
        let conn = Connection::open(&config.path)?;
        Ok(conn)
    }

    // Método público para executar queries SQL
    pub fn execute_sql(&self, sql: &str, params: &[&dyn rusqlite::ToSql]) -> Result<usize> {
        let conn = self.conn.lock().unwrap();
        let rows_affected = conn.execute(sql, params)?;
        Ok(rows_affected)
    }

    // Método público para query_row
    pub fn query_row<F, R>(&self, sql: &str, params: &[&dyn rusqlite::ToSql], f: F) -> Result<R>
    where
        F: FnOnce(&rusqlite::Row) -> Result<R, rusqlite::Error>,
    {
        let conn = self.conn.lock().unwrap();
        let result = conn.query_row(sql, params, f)?;
        Ok(result)
    }

    // Método público para query_map
    pub fn query_map<F, R>(&self, sql: &str, params: &[&dyn rusqlite::ToSql], f: F) -> Result<Vec<R>>
    where
        F: FnMut(&rusqlite::Row) -> Result<R, rusqlite::Error>,
    {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(sql)?;
        let rows = stmt.query_map(params, f)?;
        let mut result = Vec::new();
        for row in rows {
            result.push(row?);
        }
        Ok(result)
    }

    pub fn initialize_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        // Create patients table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                birth_date TEXT,
                address TEXT,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                rev INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT,
                last_editor TEXT,
                last_pulled_rev INTEGER
            )",
            [],
        )?;

        // Create appointments table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                rev INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT,
                last_editor TEXT,
                last_pulled_rev INTEGER,
                FOREIGN KEY (patient_id) REFERENCES patients (id)
            )",
            [],
        )?;

        // Create documents table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                appointment_id TEXT,
                filename TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                encrypted BOOLEAN NOT NULL DEFAULT 1,
                content_hash TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                rev INTEGER NOT NULL DEFAULT 0,
                deleted_at TEXT,
                last_editor TEXT,
                last_pulled_rev INTEGER,
                FOREIGN KEY (patient_id) REFERENCES patients (id),
                FOREIGN KEY (appointment_id) REFERENCES appointments (id)
            )",
            [],
        )?;

        // Create document_content table for encrypted content
        conn.execute(
            "CREATE TABLE IF NOT EXISTS document_content (
                document_id TEXT PRIMARY KEY,
                encrypted_content BLOB NOT NULL,
                nonce BLOB NOT NULL,
                tag BLOB NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (id)
            )",
            [],
        )?;

        // Create audit_logs table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_email TEXT NOT NULL,
                action TEXT NOT NULL,
                resource_type TEXT NOT NULL,
                resource_id TEXT,
                description TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        // Create sync_status table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sync_status (
                id INTEGER PRIMARY KEY,
                last_sync TEXT,
                sync_type TEXT NOT NULL,
                status TEXT NOT NULL,
                records_synced INTEGER DEFAULT 0,
                errors TEXT,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        // Create oplog table for local operations
        conn.execute(
            "CREATE TABLE IF NOT EXISTS oplog (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                payload_hash TEXT NOT NULL,
                origin_device_id TEXT NOT NULL,
                op_seq INTEGER NOT NULL,
                local_ts TEXT NOT NULL,
                committed BOOLEAN NOT NULL DEFAULT 0,
                server_rev INTEGER
            )",
            [],
        )?;

        // Create sync_state table for tracking last pulled revisions
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sync_state (
                table_name TEXT PRIMARY KEY,
                last_pulled_rev INTEGER NOT NULL DEFAULT 0,
                last_sync_at TEXT NOT NULL
            )",
            [],
        )?;

        // Create conflicts table for pending conflicts
        conn.execute(
            "CREATE TABLE IF NOT EXISTS conflicts (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                local_data TEXT NOT NULL,
                server_data TEXT NOT NULL,
                conflict_type TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                created_at TEXT NOT NULL,
                resolved BOOLEAN NOT NULL DEFAULT 0
            )",
            [],
        )?;

        // Create indexes for better performance
        conn.execute("CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (name)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_patients_email ON patients (email)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_patients_rev ON patients (rev)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_patients_deleted ON patients (deleted_at)", [])?;
        
        conn.execute("CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments (patient_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_appointments_rev ON appointments (rev)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_appointments_deleted ON appointments (deleted_at)", [])?;
        
        conn.execute("CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents (patient_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_documents_rev ON documents (rev)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_documents_deleted ON documents (deleted_at)", [])?;
        
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at)", [])?;
        
        // Indexes for sync system
        conn.execute("CREATE INDEX IF NOT EXISTS idx_oplog_entity ON oplog (entity_type, entity_id)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_oplog_committed ON oplog (committed)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_oplog_op_seq ON oplog (op_seq)", [])?;
        conn.execute("CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON conflicts (resolved)", [])?;

        Ok(())
    }

    // Patient CRUD operations
    pub fn create_patient(&self, request: CreatePatientRequest) -> Result<Patient> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

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
            rev: 0, // Will be set by server
            deleted_at: None,
            last_editor: Some("local_device".to_string()),
            last_pulled_rev: None,
        };

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO patients (id, name, email, phone, birth_date, address, notes, created_at, updated_at, rev, deleted_at, last_editor, last_pulled_rev)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                patient.id,
                patient.name,
                patient.email,
                patient.phone,
                patient.birth_date,
                patient.address,
                patient.notes,
                patient.created_at,
                patient.updated_at,
                patient.rev,
                patient.deleted_at,
                patient.last_editor,
                patient.last_pulled_rev
            ],
        )?;

        Ok(patient)
    }

    pub fn get_patients(&self) -> Result<Vec<Patient>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT * FROM patients ORDER BY name")?;
        let patient_iter = stmt.query_map([], |row| {
            Ok(Patient {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                phone: row.get(3)?,
                birth_date: row.get(4)?,
                address: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                rev: row.get(9)?,
                deleted_at: row.get(10)?,
                last_editor: row.get(11)?,
                last_pulled_rev: row.get(12)?,
            })
        })?;

        let mut patients = Vec::new();
        for patient in patient_iter {
            patients.push(patient?);
        }

        Ok(patients)
    }

    pub fn get_patient(&self, id: &str) -> Result<Option<Patient>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT * FROM patients WHERE id = ?1")?;
        
        let patient = stmt.query_row(params![id], |row| {
            Ok(Patient {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                phone: row.get(3)?,
                birth_date: row.get(4)?,
                address: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                rev: row.get(9)?,
                deleted_at: row.get(10)?,
                last_editor: row.get(11)?,
                last_pulled_rev: row.get(12)?,
            })
        }).optional()?;

        Ok(patient)
    }

    pub fn update_patient(&self, id: &str, request: CreatePatientRequest) -> Result<Option<Patient>> {
        let now = Utc::now().to_rfc3339();
        
        let conn = self.conn.lock().unwrap();
        
        // Get current patient to increment rev
        let current_patient = self.get_patient(id)?;
        let new_rev = current_patient.as_ref().map(|p| p.rev + 1).unwrap_or(1);
        
        let rows_affected = conn.execute(
            "UPDATE patients SET name = ?2, email = ?3, phone = ?4, birth_date = ?5, 
             address = ?6, notes = ?7, updated_at = ?8, rev = ?9, last_editor = ?10 WHERE id = ?1",
            params![
                id,
                request.name,
                request.email,
                request.phone,
                request.birth_date,
                request.address,
                request.notes,
                now,
                new_rev,
                "local_device"
            ],
        )?;

        if rows_affected > 0 {
            self.get_patient(id)
        } else {
            Ok(None)
        }
    }

    pub fn delete_patient(&self, id: &str) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let rows_affected = conn.execute("DELETE FROM patients WHERE id = ?1", params![id])?;
        Ok(rows_affected > 0)
    }

    pub fn search_patients(&self, query: &str) -> Result<Vec<Patient>> {
        let conn = self.conn.lock().unwrap();
        let search_pattern = format!("%{}%", query);
        
        let mut stmt = conn.prepare(
            "SELECT * FROM patients 
             WHERE name LIKE ?1 OR email LIKE ?1 OR phone LIKE ?1 
             ORDER BY name"
        )?;
        
        let patient_iter = stmt.query_map(params![search_pattern], |row| {
            Ok(Patient {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                phone: row.get(3)?,
                birth_date: row.get(4)?,
                address: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                rev: row.get(9)?,
                deleted_at: row.get(10)?,
                last_editor: row.get(11)?,
                last_pulled_rev: row.get(12)?,
            })
        })?;

        let mut patients = Vec::new();
        for patient in patient_iter {
            patients.push(patient?);
        }

        Ok(patients)
    }

    // Appointment CRUD operations
    pub fn create_appointment(&self, request: CreateAppointmentRequest) -> Result<Appointment> {
        // Verify patient exists
        if self.get_patient(&request.patient_id)?.is_none() {
            return Err(anyhow::anyhow!("Patient not found"));
        }

        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        let appointment = Appointment {
            id: id.clone(),
            patient_id: request.patient_id,
            patient_name: None, // Will be filled when retrieving
            date: request.date,
            time: request.time,
            status: request.status,
            notes: request.notes,
            created_at: now.clone(),
            updated_at: now.clone(),
            rev: 0, // Will be set by server
            deleted_at: None,
            last_editor: Some("local_device".to_string()),
            last_pulled_rev: None,
        };

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO appointments (id, patient_id, date, time, status, notes, created_at, updated_at, rev, deleted_at, last_editor, last_pulled_rev)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                appointment.id,
                appointment.patient_id,
                appointment.date,
                appointment.time,
                appointment.status,
                appointment.notes,
                appointment.created_at,
                appointment.updated_at,
                appointment.rev,
                appointment.deleted_at,
                appointment.last_editor,
                appointment.last_pulled_rev
            ],
        )?;

        Ok(appointment)
    }

    pub fn get_appointments(&self) -> Result<Vec<Appointment>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT a.*, p.name as patient_name 
             FROM appointments a 
             LEFT JOIN patients p ON a.patient_id = p.id 
             ORDER BY a.date, a.time"
        )?;
        
        let appointment_iter = stmt.query_map([], |row| {
            Ok(Appointment {
                id: row.get(0)?,
                patient_id: row.get(1)?,
                patient_name: row.get(8)?, // patient_name from JOIN
                date: row.get(2)?,
                time: row.get(3)?,
                status: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                rev: row.get(9)?,
                deleted_at: row.get(10)?,
                last_editor: row.get(11)?,
                last_pulled_rev: row.get(12)?,
            })
        })?;

        let mut appointments = Vec::new();
        for appointment in appointment_iter {
            appointments.push(appointment?);
        }

        Ok(appointments)
    }

    pub fn get_appointment(&self, id: &str) -> Result<Option<Appointment>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT a.*, p.name as patient_name 
             FROM appointments a 
             LEFT JOIN patients p ON a.patient_id = p.id 
             WHERE a.id = ?1"
        )?;
        
        let appointment = stmt.query_row(params![id], |row| {
            Ok(Appointment {
                id: row.get(0)?,
                patient_id: row.get(1)?,
                patient_name: row.get(8)?, // patient_name from JOIN
                date: row.get(2)?,
                time: row.get(3)?,
                status: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                rev: row.get(9)?,
                deleted_at: row.get(10)?,
                last_editor: row.get(11)?,
                last_pulled_rev: row.get(12)?,
            })
        }).optional()?;

        Ok(appointment)
    }

    pub fn update_appointment(&self, id: &str, request: CreateAppointmentRequest) -> Result<Option<Appointment>> {
        // Verify patient exists
        if self.get_patient(&request.patient_id)?.is_none() {
            return Err(anyhow::anyhow!("Patient not found"));
        }

        let now = Utc::now().to_rfc3339();
        
        let conn = self.conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE appointments SET patient_id = ?2, date = ?3, time = ?4, 
             status = ?5, notes = ?6, updated_at = ?7 WHERE id = ?1",
            params![
                id,
                request.patient_id,
                request.date,
                request.time,
                request.status,
                request.notes,
                now
            ],
        )?;

        if rows_affected > 0 {
            self.get_appointment(id)
        } else {
            Ok(None)
        }
    }

    pub fn delete_appointment(&self, id: &str) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let rows_affected = conn.execute("DELETE FROM appointments WHERE id = ?1", params![id])?;
        Ok(rows_affected > 0)
    }

    // Document CRUD operations
    pub fn create_document(&self, request: CreateDocumentRequest, encrypted_content: Vec<u8>, nonce: Vec<u8>, tag: Vec<u8>) -> Result<Document> {
        // Verify patient exists
        if self.get_patient(&request.patient_id)?.is_none() {
            return Err(anyhow::anyhow!("Patient not found"));
        }

        let id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();
        let mut hasher = sha2::Sha256::new();
        hasher.update(&encrypted_content);
        let content_hash = hasher.finalize();
        let content_hash_hex = hex::encode(content_hash);

        let document = Document {
            id: id.clone(),
            patient_id: request.patient_id,
            appointment_id: request.appointment_id,
            filename: request.filename,
            file_type: request.file_type,
            file_size: request.file_size,
            encrypted: true,
            created_at: now.clone(),
            updated_at: now.clone(),
            rev: 0, // Will be set by server
            deleted_at: None,
            last_editor: Some("local_device".to_string()),
            last_pulled_rev: None,
        };

        let conn = self.conn.lock().unwrap();
        
        // Insert document record
        conn.execute(
            "INSERT INTO documents (id, patient_id, appointment_id, filename, file_type, file_size, encrypted, content_hash, created_at, updated_at, rev, deleted_at, last_editor, last_pulled_rev)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            params![
                document.id,
                document.patient_id,
                document.appointment_id,
                document.filename,
                document.file_type,
                document.file_size,
                document.encrypted,
                content_hash_hex,
                document.created_at,
                document.updated_at,
                document.rev,
                document.deleted_at,
                document.last_editor,
                document.last_pulled_rev
            ],
        )?;

        // Insert encrypted content
        conn.execute(
            "INSERT INTO document_content (document_id, encrypted_content, nonce, tag)
             VALUES (?1, ?2, ?3, ?4)",
            params![id, encrypted_content, nonce, tag],
        )?;

        Ok(document)
    }

    pub fn get_documents(&self, patient_id: Option<&str>) -> Result<Vec<Document>> {
        let conn = self.conn.lock().unwrap();
        
        let (query, params) = if let Some(pid) = patient_id {
            ("SELECT * FROM documents WHERE patient_id = ?1 ORDER BY created_at DESC", vec![pid.to_string()])
        } else {
            ("SELECT * FROM documents ORDER BY created_at DESC", vec![])
        };

        let mut stmt = conn.prepare(query)?;
        let document_iter = stmt.query_map(rusqlite::params_from_iter(params), |row| {
            Ok(Document {
                id: row.get(0)?,
                patient_id: row.get(1)?,
                appointment_id: row.get(2)?,
                filename: row.get(3)?,
                file_type: row.get(4)?,
                file_size: row.get(5)?,
                encrypted: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                rev: row.get(9)?,
                deleted_at: row.get(10)?,
                last_editor: row.get(11)?,
                last_pulled_rev: row.get(12)?,
            })
        })?;

        let mut documents = Vec::new();
        for document in document_iter {
            documents.push(document?);
        }

        Ok(documents)
    }

    pub fn get_document_content(&self, document_id: &str) -> Result<Option<(Vec<u8>, Vec<u8>, Vec<u8>)>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT encrypted_content, nonce, tag FROM document_content WHERE document_id = ?1")?;
        
        let content = stmt.query_row(params![document_id], |row| {
            Ok((row.get::<_, Vec<u8>>(0)?, row.get::<_, Vec<u8>>(1)?, row.get::<_, Vec<u8>>(2)?))
        }).optional()?;

        Ok(content)
    }

    pub fn delete_document(&self, id: &str) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        
        // Delete from both tables
        let content_rows = conn.execute("DELETE FROM document_content WHERE document_id = ?1", params![id])?;
        let doc_rows = conn.execute("DELETE FROM documents WHERE id = ?1", params![id])?;
        
        Ok(content_rows > 0 || doc_rows > 0)
    }

    // Statistics and reports
    pub fn get_appointment_statistics(&self) -> Result<serde_json::Value> {
        let conn = self.conn.lock().unwrap();
        
        let total: i64 = conn.query_row("SELECT COUNT(*) FROM appointments", [], |row| row.get(0))?;
        let confirmed: i64 = conn.query_row("SELECT COUNT(*) FROM appointments WHERE status = 'confirmada'", [], |row| row.get(0))?;
        let pending: i64 = conn.query_row("SELECT COUNT(*) FROM appointments WHERE status = 'pendente'", [], |row| row.get(0))?;
        let completed: i64 = conn.query_row("SELECT COUNT(*) FROM appointments WHERE status = 'realizada'", [], |row| row.get(0))?;
        let cancelled: i64 = conn.query_row("SELECT COUNT(*) FROM appointments WHERE status = 'cancelada'", [], |row| row.get(0))?;
        
        let stats = serde_json::json!({
            "total": total,
            "confirmed": confirmed,
            "pending": pending,
            "completed": completed,
            "cancelled": cancelled,
            "confirmation_rate": if total > 0 { (confirmed as f64 / total as f64) * 100.0 } else { 0.0 },
            "completion_rate": if total > 0 { (completed as f64 / total as f64) * 100.0 } else { 0.0 }
        });
        
        Ok(stats)
    }

    // Backup and restore
    pub fn backup_database(&self) -> Result<serde_json::Value> {
        let patients = self.get_patients()?;
        let appointments = self.get_appointments()?;
        let documents = self.get_documents(None)?;
        
        let backup_data = serde_json::json!({
            "timestamp": Utc::now().to_rfc3339(),
            "version": "1.0.0",
            "patients": patients,
            "appointments": appointments,
            "documents": documents,
            "total_records": patients.len() + appointments.len() + documents.len()
        });
        
        Ok(backup_data)
    }

    pub fn restore_database(&self, backup_data: serde_json::Value) -> Result<String> {
        let mut conn = self.conn.lock().unwrap();
        
        // Start transaction
        let tx = conn.transaction()?;
        
        // Clear existing data
        tx.execute("DELETE FROM document_content", [])?;
        tx.execute("DELETE FROM documents", [])?;
        tx.execute("DELETE FROM appointments", [])?;
        tx.execute("DELETE FROM patients", [])?;
        
        // Restore patients
        if let Some(patients_array) = backup_data.get("patients").and_then(|v| v.as_array()) {
            for patient_json in patients_array {
                if let Ok(patient) = serde_json::from_value::<Patient>(patient_json.clone()) {
                    tx.execute(
                        "INSERT INTO patients (id, name, email, phone, birth_date, address, notes, created_at, updated_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                        params![
                            patient.id,
                            patient.name,
                            patient.email,
                            patient.phone,
                            patient.birth_date,
                            patient.address,
                            patient.notes,
                            patient.created_at,
                            patient.updated_at
                        ],
                    )?;
                }
            }
        }
        
        // Restore appointments
        if let Some(appointments_array) = backup_data.get("appointments").and_then(|v| v.as_array()) {
            for appointment_json in appointments_array {
                if let Ok(appointment) = serde_json::from_value::<Appointment>(appointment_json.clone()) {
                    tx.execute(
                        "INSERT INTO appointments (id, patient_id, date, time, status, notes, created_at, updated_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                        params![
                            appointment.id,
                            appointment.patient_id,
                            appointment.date,
                            appointment.time,
                            appointment.status,
                            appointment.notes,
                            appointment.created_at,
                            appointment.updated_at
                        ],
                    )?;
                }
            }
        }
        
        // Restore documents (without content for now)
        if let Some(documents_array) = backup_data.get("documents").and_then(|v| v.as_array()) {
            for document_json in documents_array {
                if let Ok(document) = serde_json::from_value::<Document>(document_json.clone()) {
                    tx.execute(
                        "INSERT INTO documents (id, patient_id, appointment_id, filename, file_type, file_size, encrypted, content_hash, created_at, updated_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                        params![
                            document.id,
                            document.patient_id,
                            document.appointment_id,
                            document.filename,
                            document.file_type,
                            document.file_size,
                            document.encrypted,
                            "", // content_hash will be empty for restored documents
                            document.created_at,
                            document.updated_at
                        ],
                    )?;
                }
            }
        }
        
        // Commit transaction
        tx.commit()?;
        
        let patients_count = self.get_patients()?.len();
        let appointments_count = self.get_appointments()?.len();
        let documents_count = self.get_documents(None)?.len();
        
        Ok(format!("Backup restaurado com sucesso! {} pacientes, {} consultas, {} documentos", 
                   patients_count, appointments_count, documents_count))
    }
}
