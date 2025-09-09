import { supabase } from '../supabase';
import { Appointment } from '../../types/appointment';

export class AppointmentsService {
  // Buscar todos os agendamentos
  static async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(name, phone, email)
      `)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    
    // Transformar para o formato esperado
    return (data || []).map(appointment => ({
      ...appointment,
      appointment_date: appointment.date,
      start_time: appointment.time,
      end_time: appointment.time, // Usar o mesmo horário por enquanto
      title: `Consulta - ${appointment.patients.name}`,
      patient_name: appointment.patients.name,
      patient_phone: appointment.patients.phone,
      patient_email: appointment.patients.email,
      user_id: appointment.created_by
    }));
  }

  // Buscar agendamentos por data
  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(name, phone, email)
      `)
      .eq('date', date)
      .order('time', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(appointment => ({
      ...appointment,
      appointment_date: appointment.date,
      start_time: appointment.time,
      end_time: appointment.time,
      title: `Consulta - ${appointment.patients.name}`,
      patient_name: appointment.patients.name,
      patient_phone: appointment.patients.phone,
      patient_email: appointment.patients.email,
      user_id: appointment.created_by
    }));
  }

  // Buscar agendamentos por paciente
  static async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(name, phone, email)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(appointment => ({
      ...appointment,
      appointment_date: appointment.date,
      start_time: appointment.time,
      end_time: appointment.time,
      title: `Consulta - ${appointment.patients.name}`,
      patient_name: appointment.patients.name,
      patient_phone: appointment.patients.phone,
      patient_email: appointment.patients.email,
      user_id: appointment.created_by
    }));
  }

  // Buscar agendamento por ID
  static async getAppointment(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(name, phone, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      appointment_date: data.date,
      start_time: data.time,
      end_time: data.time,
      title: `Consulta - ${data.patients.name}`,
      patient_name: data.patients.name,
      patient_phone: data.patients.phone,
      patient_email: data.patients.email,
      user_id: data.created_by
    };
  }

  // Criar novo agendamento
  static async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'patient_phone' | 'patient_email'>): Promise<Appointment> {
    const appointmentData = {
      patient_id: appointment.patient_id,
      date: appointment.appointment_date,
      time: appointment.start_time,
      status: appointment.status,
      notes: appointment.notes,
      created_by: appointment.user_id
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select(`
        *,
        patients!inner(name, phone, email)
      `)
      .single();

    if (error) throw error;
    
    // Transformar para o formato esperado
    return {
      ...data,
      appointment_date: data.date,
      start_time: data.time,
      end_time: data.time,
      title: `Consulta - ${data.patients.name}`,
      patient_name: data.patients.name,
      patient_phone: data.patients.phone,
      patient_email: data.patients.email,
      user_id: data.created_by
    };
  }

  // Atualizar agendamento
  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const updateData: any = {};
    if (updates.patient_id) updateData.patient_id = updates.patient_id;
    if (updates.appointment_date) updateData.date = updates.appointment_date;
    if (updates.start_time) updateData.time = updates.start_time;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.user_id) updateData.updated_by = updates.user_id;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        patients!inner(name, phone, email)
      `)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      appointment_date: data.date,
      start_time: data.time,
      end_time: data.time,
      title: `Consulta - ${data.patients.name}`,
      patient_name: data.patients.name,
      patient_phone: data.patients.phone,
      patient_email: data.patients.email,
      user_id: data.created_by
    };
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
      .from('appointments_with_patient')
      .select('*')
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .lte('date', endOfWeek.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
