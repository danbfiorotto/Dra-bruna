import { supabase } from '../../config/supabase';
import { MedicalRecord, CreateMedicalRecordRequest, UpdateMedicalRecordRequest } from '../../types/medicalRecord';

export class MedicalRecordsService {
  static async getMedicalRecords(): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar prontuários: ${error.message}`);
    }

    return data || [];
  }

  static async getMedicalRecord(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar prontuário: ${error.message}`);
    }

    return data;
  }

  static async getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar prontuários do paciente: ${error.message}`);
    }

    return data || [];
  }

  static async createMedicalRecord(recordData: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('medical_records')
      .insert([{
        ...recordData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar prontuário: ${error.message}`);
    }

    return data;
  }

  static async updateMedicalRecord(id: string, recordData: UpdateMedicalRecordRequest): Promise<MedicalRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('medical_records')
      .update({
        ...recordData,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar prontuário: ${error.message}`);
    }

    return data;
  }

  static async deleteMedicalRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir prontuário: ${error.message}`);
    }
  }
}