use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuração para testes de integração
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestConfig {
    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub test_database_path: String,
    pub test_device_id: String,
    pub test_user_id: String,
    pub sync_timeout_seconds: u64,
    pub max_retry_attempts: u32,
    pub test_data: TestData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestData {
    pub test_patients: Vec<TestPatient>,
    pub test_appointments: Vec<TestAppointment>,
    pub test_documents: Vec<TestDocument>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestPatient {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub birth_date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestAppointment {
    pub id: String,
    pub patient_id: String,
    pub date: String,
    pub time: String,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestDocument {
    pub id: String,
    pub patient_id: String,
    pub filename: String,
    pub content_type: String,
    pub file_size: u64,
}

impl Default for TestConfig {
    fn default() -> Self {
        Self {
            supabase_url: "https://test.supabase.co".to_string(),
            supabase_anon_key: "test-anon-key".to_string(),
            test_database_path: "./test_database.db".to_string(),
            test_device_id: "test-device-123".to_string(),
            test_user_id: "test-user-123".to_string(),
            sync_timeout_seconds: 30,
            max_retry_attempts: 3,
            test_data: TestData {
                test_patients: vec![
                    TestPatient {
                        id: "patient-1".to_string(),
                        name: "João Silva".to_string(),
                        email: "joao@test.com".to_string(),
                        phone: "11999999999".to_string(),
                        birth_date: "1990-01-01".to_string(),
                    },
                    TestPatient {
                        id: "patient-2".to_string(),
                        name: "Maria Santos".to_string(),
                        email: "maria@test.com".to_string(),
                        phone: "11888888888".to_string(),
                        birth_date: "1985-05-15".to_string(),
                    },
                ],
                test_appointments: vec![
                    TestAppointment {
                        id: "appointment-1".to_string(),
                        patient_id: "patient-1".to_string(),
                        date: "2024-12-20".to_string(),
                        time: "10:00".to_string(),
                        notes: "Consulta de rotina".to_string(),
                    },
                ],
                test_documents: vec![
                    TestDocument {
                        id: "document-1".to_string(),
                        patient_id: "patient-1".to_string(),
                        filename: "exame.pdf".to_string(),
                        content_type: "application/pdf".to_string(),
                        file_size: 1024,
                    },
                ],
            },
        }
    }
}

impl TestConfig {
    pub fn new() -> Self {
        Self::default()
    }
    
    pub fn with_supabase_config(url: String, anon_key: String) -> Self {
        Self {
            supabase_url: url,
            supabase_anon_key: anon_key,
            ..Self::default()
        }
    }
    
    pub fn get_test_patient(&self, id: &str) -> Option<&TestPatient> {
        self.test_data.test_patients.iter().find(|p| p.id == id)
    }
    
    pub fn get_test_appointment(&self, id: &str) -> Option<&TestAppointment> {
        self.test_data.test_appointments.iter().find(|a| a.id == id)
    }
    
    pub fn get_test_document(&self, id: &str) -> Option<&TestDocument> {
        self.test_data.test_documents.iter().find(|d| d.id == id)
    }
}

/// Utilitários para testes
pub struct TestUtils;

impl TestUtils {
    /// Cria dados de teste para conflitos
    pub fn create_conflict_data() -> HashMap<String, serde_json::Value> {
        let mut data = HashMap::new();
        
        // Dados locais modificados
        data.insert("local_patient".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva Modificado",
            "email": "joao@test.com",
            "phone": "11999999999",
            "rev": 5,
            "updated_at": "2024-12-19T10:00:00Z"
        }));
        
        // Dados do servidor (mais recentes)
        data.insert("server_patient".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva",
            "email": "joao.novo@test.com",
            "phone": "11999999999",
            "rev": 7,
            "updated_at": "2024-12-19T11:00:00Z"
        }));
        
        // Dados base (versão anterior)
        data.insert("base_patient".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva",
            "email": "joao@test.com",
            "phone": "11999999999",
            "rev": 3,
            "updated_at": "2024-12-19T09:00:00Z"
        }));
        
        data
    }
    
    /// Cria dados de teste para deduplicação
    pub fn create_duplicate_data() -> Vec<serde_json::Value> {
        vec![
            serde_json::json!({
                "id": "patient-1",
                "name": "João Silva",
                "email": "joao@test.com",
                "phone": "11999999999",
                "birth_date": "1990-01-01"
            }),
            serde_json::json!({
                "id": "patient-2",
                "name": "João Silva",
                "email": "joao@test.com",
                "phone": "11999999999",
                "birth_date": "1990-01-01"
            }),
            serde_json::json!({
                "id": "patient-3",
                "name": "Maria Santos",
                "email": "maria@test.com",
                "phone": "11888888888",
                "birth_date": "1985-05-15"
            }),
        ]
    }
    
    /// Cria dados de teste para prontuários médicos
    pub fn create_medical_record_data() -> serde_json::Value {
        serde_json::json!({
            "id": "record-1",
            "patient_id": "patient-1",
            "version": 1,
            "sections": {
                "anamnese": {
                    "queixa_principal": "Dor de cabeça",
                    "historia_doenca_atual": "Há 3 dias",
                    "antecedentes": "Hipertensão"
                },
                "diagnostico": {
                    "hipotese_diagnostica": "Cefaleia tensional",
                    "exames_solicitados": ["Hemograma", "Glicemia"]
                },
                "plano": {
                    "medicamentos": ["Dipirona 500mg"],
                    "orientacoes": "Repouso e hidratação"
                }
            },
            "created_at": "2024-12-19T10:00:00Z",
            "updated_at": "2024-12-19T10:00:00Z"
        })
    }
    
    /// Cria dados de teste para arquivos
    pub fn create_file_data() -> serde_json::Value {
        serde_json::json!({
            "id": "file-1",
            "filename": "exame.pdf",
            "file_path": "./test_files/exame.pdf",
            "remote_path": "files/file-1",
            "file_size": 1024,
            "content_type": "application/pdf",
            "content_hash": "abc123def456",
            "sync_status": "pending",
            "local_modified": "2024-12-19T10:00:00Z",
            "remote_modified": null,
            "uploaded_by": "test-user",
            "download_url": null
        })
    }
    
    /// Simula operação de sincronização
    pub async fn simulate_sync_operation(
        operation_type: &str,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<serde_json::Value, String> {
        // Simular delay de rede
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        let result = serde_json::json!({
            "operation": operation_type,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "success": true,
            "server_rev": 123,
            "timestamp": chrono::Utc::now().to_rfc3339()
        });
        
        Ok(result)
    }
    
    /// Valida estrutura de dados de sincronização
    pub fn validate_sync_data(data: &serde_json::Value) -> bool {
        data["id"].is_string() &&
        data["rev"].is_number() &&
        data["updated_at"].is_string()
    }
    
    /// Cria cenário de teste para conflito "deleted_remotely"
    pub fn create_deleted_remotely_scenario() -> HashMap<String, serde_json::Value> {
        let mut scenario = HashMap::new();
        
        scenario.insert("local_data".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva",
            "email": "joao@test.com",
            "rev": 5,
            "updated_at": "2024-12-19T10:00:00Z",
            "deleted_at": null
        }));
        
        scenario.insert("server_data".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva",
            "email": "joao@test.com",
            "rev": 7,
            "updated_at": "2024-12-19T11:00:00Z",
            "deleted_at": "2024-12-19T11:00:00Z"
        }));
        
        scenario
    }
    
    /// Cria cenário de teste para conflito "both_modified"
    pub fn create_both_modified_scenario() -> HashMap<String, serde_json::Value> {
        let mut scenario = HashMap::new();
        
        scenario.insert("local_data".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva Modificado",
            "email": "joao@test.com",
            "rev": 5,
            "updated_at": "2024-12-19T10:00:00Z"
        }));
        
        scenario.insert("server_data".to_string(), serde_json::json!({
            "id": "patient-1",
            "name": "João Silva",
            "email": "joao.novo@test.com",
            "rev": 6,
            "updated_at": "2024-12-19T10:30:00Z"
        }));
        
        scenario
    }
}
