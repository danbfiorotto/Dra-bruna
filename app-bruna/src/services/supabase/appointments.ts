import { supabase } from '../supabase';
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '../../types/appointment';

export class AppointmentsService {
  // Buscar todos os agendamentos
  static async getAppointments(): Promise<Appointment[]> {
    // Buscar agendamentos
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos:', appointmentsError);
      throw appointmentsError;
    }

    if (!appointments || appointments.length === 0) {
      return [];
    }

    // Buscar pacientes únicos
    const patientIds = [...new Set(appointments.map(a => a.patient_id))];
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, name, phone, email')
      .in('id', patientIds);

    if (patientsError) {
      console.error('Erro ao buscar pacientes:', patientsError);
      throw patientsError;
    }

    // Buscar clínicas únicas
    const clinicIds = [...new Set(appointments.map(a => a.clinic_id).filter(Boolean))];
    let clinics: any[] = [];
    if (clinicIds.length > 0) {
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('id, name')
        .in('id', clinicIds);

      if (clinicsError) {
        console.error('Erro ao buscar clínicas:', clinicsError);
        throw clinicsError;
      }
      clinics = clinicsData || [];
    }

    // Fazer o join manual
    const appointmentsWithRelations = appointments.map(appointment => ({
      ...appointment,
      patient: patients?.find(p => p.id === appointment.patient_id),
      clinic: clinics?.find(c => c.id === appointment.clinic_id)
    }));

    console.log('Dados processados:', appointmentsWithRelations);
    return appointmentsWithRelations;
  }

  // Buscar agendamentos por data
  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name, phone, email),
        clinics(id, name)
      `)
      .eq('appointment_date', date)
      .order('start_time', { ascending: true });

    if (error) throw error;
    
    return data || [];
  }

  // Buscar agendamentos por paciente
  static async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name, phone, email),
        clinics(id, name)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });

    if (error) throw error;
    
    return data || [];
  }

  // Buscar agendamento por ID
  static async getAppointment(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name, phone, email),
        clinics(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  }

  // Criar novo agendamento
  static async createAppointment(appointment: CreateAppointmentData): Promise<Appointment> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Filtrar campos vazios e preparar dados para inserção
    const appointmentData: any = {
      patient_id: appointment.patient_id,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      title: appointment.title,
      status: appointment.status || 'scheduled',
      created_by: user.id
    };

    // Adicionar campos opcionais apenas se não estiverem vazios
    if (appointment.clinic_id && appointment.clinic_id.trim() !== '') {
      appointmentData.clinic_id = appointment.clinic_id;
    }
    
    if (appointment.description && appointment.description.trim() !== '') {
      appointmentData.description = appointment.description;
    }
    
    if (appointment.notes && appointment.notes.trim() !== '') {
      appointmentData.notes = appointment.notes;
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select(`
        *,
        patients(id, name, phone, email),
        clinics(id, name)
      `)
      .single();

    if (error) throw error;
    
    return data;
  }

  // Atualizar agendamento
  static async updateAppointment(id: string, updates: UpdateAppointmentData): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patients(id, name, phone, email),
        clinics(id, name)
      `)
      .single();

    if (error) throw error;
    
    return data;
  }

  // Deletar agendamento
  static async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Obter agendamentos do dia
  static async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }

  // Obter agendamentos da semana
  static async getWeekAppointments(): Promise<Appointment[]> {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name, phone, email),
        clinics(id, name)
      `)
      .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
      .lte('appointment_date', endOfWeek.toISOString().split('T')[0])
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
