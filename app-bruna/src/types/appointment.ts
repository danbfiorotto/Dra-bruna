export interface Appointment {
  id: string;
  patient_id: string;
  clinic_id?: string;
  title: string;
  description?: string;
  appointment_date: string;
  start_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  patient?: {
    id: string;
    name: string;
    phone?: string;
  };
  clinic?: {
    id: string;
    name: string;
  };
}

export interface CreateAppointmentData {
  patient_id: string;
  clinic_id?: string;
  title: string;
  description?: string;
  appointment_date: string;
  start_time: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface UpdateAppointmentData {
  patient_id?: string;
  clinic_id?: string;
  title?: string;
  description?: string;
  appointment_date?: string;
  start_time?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}
