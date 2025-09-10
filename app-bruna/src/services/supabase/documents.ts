import { supabase } from '../../config/supabase';
import { Document } from '../../types/document';
import { EncryptionService } from '../encryption';

export class DocumentsService {
  // Buscar todos os documentos
  static async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        patients(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }
    
    return data || [];
  }

  // Buscar documentos por paciente
  static async getDocumentsByPatient(patientId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        patients(id, name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar documentos do paciente: ${error.message}`);
    }
    
    return (data || []).map(document => ({
      ...document,
      file_name: document.filename,
      mime_type: document.file_type,
      user_id: document.created_by || ''
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
      user_id: document.created_by || ''
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
      user_id: data.created_by || ''
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
      user_id: data.created_by || ''
    };
  }

  // Upload de documento com criptografia
  static async uploadDocument(
    file: File,
    patientId: string,
    appointmentId?: string,
    userId?: string,
    password?: string
  ): Promise<Document> {
    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Caminho no storage: pasta do paciente + nome do arquivo
      const storagePath = `${patientId}/${fileName}`;

      let encryptedData: ArrayBuffer;
      let iv: Uint8Array;
      let tag: Uint8Array;
      let salt: Uint8Array;
      let isEncrypted = false;

      // Criptografar arquivo se senha for fornecida
      if (password) {
        const encryptionResult = await EncryptionService.encryptFile(file, password);
        encryptedData = encryptionResult.encryptedData;
        iv = encryptionResult.iv;
        tag = encryptionResult.tag;
        salt = encryptionResult.salt;
        isEncrypted = true;
      } else {
        // Upload sem criptografia
        encryptedData = await file.arrayBuffer();
        iv = new Uint8Array(0);
        tag = new Uint8Array(0);
        salt = new Uint8Array(0);
      }

      // Verificar autenticação antes do upload
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Upload para Supabase Storage
      const blob = new Blob([encryptedData], { type: file.type });
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Criar registro no banco
      const documentData = {
        patient_id: patientId,
        appointment_id: appointmentId,
        title: file.name.split('.')[0], // Nome sem extensão como título
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: storagePath, // Caminho no storage
        storage_path: storagePath, // Mesmo caminho para compatibilidade
        content_hash: await EncryptionService.calculateFileHash(file),
        encrypted: isEncrypted,
        encryption_data: isEncrypted ? EncryptionService.serializeEncryptionData({
          encryptedData,
          iv,
          tag,
          salt
        }) : null,
        created_by: userId
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return {
        ...data,
        file_name: data.filename,
        mime_type: data.file_type,
        user_id: data.created_by || ''
      };
    } catch (error) {
      console.error('❌ Erro no upload do documento:', error);
      throw error;
    }
  }


  // Download de documento com descriptografia
  static async downloadDocument(id: string, password?: string): Promise<Blob> {
    const document = await this.getDocument(id);
    if (!document) throw new Error('Document not found');


    try {
      // Corrigir o caminho - remover prefixo 'documents/' se existir
      let filePath = document.storage_path;
      if (filePath.startsWith('documents/')) {
        filePath = filePath.substring('documents/'.length);
      }
      
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Se o documento está criptografado, descriptografar
      if (document.encrypted && password) {
        const arrayBuffer = await data.arrayBuffer();
        const encryptionData = EncryptionService.deserializeEncryptionData(document.encryption_data || '');
        
        return await EncryptionService.decryptFile(
          arrayBuffer,
          encryptionData.iv,
          encryptionData.tag,
          encryptionData.salt,
          password,
          document.mime_type || 'application/octet-stream'
        );
      } else if (document.encrypted && !password) {
        throw new Error('Este documento está criptografado. Forneça a senha para descriptografar.');
      } else {
        // Documento não criptografado
        return data;
      }
    } catch (error) {
      throw error;
    }
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
      user_id: document.created_by || ''
    }));
  }
}
