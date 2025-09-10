import { supabase } from '../supabase';
import { MedicalRecord, CreateMedicalRecordRequest, UpdateMedicalRecordRequest } from '../../types/medicalRecord';

export class MedicalRecordsService {
  static async getMedicalRecords(): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(id, name, phone, email),
        appointment:appointments(id, appointment_date, start_time)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar prontuários: ${error.message}`);
    }

    return data || [];
  }

  static async getMedicalRecord(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(id, name, phone, email, rg, cpf, indication),
        appointment:appointments(id, appointment_date, start_time)
      `)
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
      .select(`
        *,
        patient:patients(id, name, phone, email, rg, cpf, indication),
        appointment:appointments(id, appointment_date, start_time)
      `)
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

    // Filtrar campos vazios que podem causar erro de UUID ou data
    const cleanData = { ...recordData };
    if (cleanData.appointment_id === '') {
      delete cleanData.appointment_id;
    }
    
    // Filtrar campos de data vazios
    if (cleanData.last_dental_consultation === '') {
      delete cleanData.last_dental_consultation;
    }

    const { data, error } = await supabase
      .from('medical_records')
      .insert([{
        ...cleanData,
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
    // First, delete related anamnesis responses
    await supabase
      .from('anamnesis_responses')
      .delete()
      .eq('medical_record_id', id);

    // Then delete the medical record
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir prontuário: ${error.message}`);
    }
  }
}