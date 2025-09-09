import { supabase } from '../supabase';
import { Document } from '../../types/document';

export class DocumentsService {
  // Buscar todos os documentos
  static async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(document => ({
      ...document,
      file_name: document.filename,
      mime_type: document.file_type,
      user_id: document.created_by
    }));
  }

  // Buscar documentos por paciente
  static async getDocumentsByPatient(patientId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(document => ({
      ...document,
      file_name: document.filename,
      mime_type: document.file_type,
      user_id: document.created_by
    }));
  }

  // Buscar documentos por agendamento
  static async getDocumentsByAppointment(appointmentId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(document => ({
      ...document,
      file_name: document.filename,
      mime_type: document.file_type,
      user_id: document.created_by
    }));
  }

  // Buscar documento por ID
  static async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      file_name: data.filename,
      mime_type: data.file_type,
      user_id: data.created_by
    };
  }

  // Criar novo documento
  static async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const documentData = {
      patient_id: document.patient_id,
      filename: document.file_name,
      file_type: document.mime_type,
      file_size: document.file_size,
      storage_path: document.storage_path,
      encrypted: document.encrypted,
      created_by: document.user_id
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      file_name: data.filename,
      mime_type: data.file_type,
      user_id: data.created_by
    };
  }

  // Upload de documento
  static async uploadDocument(
    file: File,
    patientId: string,
    appointmentId?: string,
    userId?: string
  ): Promise<Document> {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${patientId}/${fileName}`;

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Criar registro no banco
    const documentData = {
      patient_id: patientId,
      appointment_id: appointmentId,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      content_hash: await this.calculateFileHash(file),
      encrypted: false, // Por enquanto sem criptografia
      created_by: userId
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      file_name: data.filename,
      mime_type: data.file_type,
      user_id: data.created_by
    };
  }

  // Download de documento
  static async downloadDocument(id: string): Promise<Blob> {
    const document = await this.getDocument(id);
    if (!document) throw new Error('Document not found');

    const { data, error } = await supabase.storage
      .from('documents')
      .download(document.storage_path);

    if (error) throw error;
    return data;
  }

  // Obter URL pública do documento
  static async getDocumentUrl(id: string): Promise<string> {
    const document = await this.getDocument(id);
    if (!document) throw new Error('Document not found');

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(document.storage_path);

    return data.publicUrl;
  }

  // Deletar documento
  static async deleteDocument(id: string): Promise<void> {
    const document = await this.getDocument(id);
    if (!document) throw new Error('Document not found');

    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.storage_path]);

    if (storageError) throw storageError;

    // Deletar do banco
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Calcular hash do arquivo
  private static async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Buscar documentos por termo
  static async searchDocuments(searchTerm: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('filename', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(document => ({
      ...document,
      file_name: document.filename,
      mime_type: document.file_type,
      user_id: document.created_by
    }));
  }
}
