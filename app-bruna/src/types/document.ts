export interface Document {
  id: string;
  patient_id: string;
  appointment_id?: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  encrypted: boolean;
  encryption_data?: string; // Dados de criptografia serializados
  content_hash?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  patient?: {
    id: string;
    name: string;
  };
}

export interface CreateDocumentData {
  patient_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  encrypted?: boolean;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
}

export interface DocumentContent {
  id: string;
  document_id: string;
  content: string;
  version: number;
  created_at: string;
  updated_at: string;
}
