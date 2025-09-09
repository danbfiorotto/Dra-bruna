import { supabase } from '../supabase';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id?: string;
  anamnesis?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export class MedicalRecordsService {
  // Buscar todos os prontuários
  static async getMedicalRecords(): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar prontuários por paciente
  static async getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar prontuários por agendamento
  static async getMedicalRecordsByAppointment(appointmentId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar prontuário por ID
  static async getMedicalRecord(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Criar novo prontuário
  static async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        ...record,
        version: 1
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Atualizar prontuário
  static async updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord> {
    // Buscar versão atual
    const currentRecord = await this.getMedicalRecord(id);
    if (!currentRecord) throw new Error('Medical record not found');

    const { data, error } = await supabase
      .from('medical_records')
      .update({
        ...updates,
        version: currentRecord.version + 1
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar prontuário
  static async deleteMedicalRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Buscar histórico de versões de um prontuário
  static async getMedicalRecordHistory(patientId: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('version', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar prontuário mais recente de um paciente
  static async getLatestMedicalRecord(patientId: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  // Buscar prontuários por termo de busca
  static async searchMedicalRecords(searchTerm: string): Promise<MedicalRecord[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .or(`anamnesis.ilike.%${searchTerm}%,diagnosis.ilike.%${searchTerm}%,treatment_plan.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Duplicar prontuário (criar nova versão baseada em um existente)
  static async duplicateMedicalRecord(id: string, newAppointmentId?: string): Promise<MedicalRecord> {
    const originalRecord = await this.getMedicalRecord(id);
    if (!originalRecord) throw new Error('Medical record not found');

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: originalRecord.patient_id,
        appointment_id: newAppointmentId || originalRecord.appointment_id,
        anamnesis: originalRecord.anamnesis,
        diagnosis: originalRecord.diagnosis,
        treatment_plan: originalRecord.treatment_plan,
        notes: originalRecord.notes,
        version: 1 // Nova versão independente
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Exportar prontuário para PDF (placeholder - implementar geração de PDF)
  static async exportMedicalRecordToPDF(id: string): Promise<string> {
    const record = await this.getMedicalRecord(id);
    if (!record) throw new Error('Medical record not found');

    // TODO: Implementar geração de PDF
    // Por enquanto, retornar URL de download (quando implementado)
    return `https://example.com/medical-records/${id}/export.pdf`;
  }
}
