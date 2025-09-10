import { supabase } from '../supabase';
import { Patient } from '../../types/patient';

export class PatientsService {
  // Buscar todos os pacientes
  static async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Buscar paciente por ID
  static async getPatient(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar pacientes por termo
  static async searchPatients(searchTerm: string): Promise<Patient[]> {
    if (!searchTerm.trim()) {
      return this.getPatients();
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Criar novo paciente
  static async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const patientData = {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birth_date: patient.birth_date,
      address: patient.address,
      notes: patient.notes,
      created_by: patient.user_id
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      user_id: data.created_by || ''
    };
  }

  // Atualizar paciente
  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.birth_date !== undefined) updateData.birth_date = updates.birth_date;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.user_id) updateData.updated_by = updates.user_id;

    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      user_id: data.created_by || ''
    };
  }

  // Deletar paciente
  static async deletePatient(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Obter estatísticas de pacientes
  static async getPatientStats() {
    const { data, error } = await supabase
      .from('patient_stats')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
