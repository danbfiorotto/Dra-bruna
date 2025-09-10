import { supabase } from '../../config/supabase';
import { Clinic, CreateClinicData, UpdateClinicData } from '../../types/clinic';

export class ClinicsService {
  static async getClinics(): Promise<Clinic[]> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar clínicas: ${error.message}`);
    }

    return data || [];
  }

  static async getClinic(id: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar clínica: ${error.message}`);
    }

    return data;
  }

  static async createClinic(clinicData: CreateClinicData): Promise<Clinic> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('clinics')
      .insert([{
        ...clinicData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar clínica: ${error.message}`);
    }

    return data;
  }

  static async updateClinic(id: string, clinicData: UpdateClinicData): Promise<Clinic> {
    const { data, error } = await supabase
      .from('clinics')
      .update(clinicData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar clínica: ${error.message}`);
    }

    return data;
  }

  static async deleteClinic(id: string): Promise<void> {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir clínica: ${error.message}`);
    }
  }
}
