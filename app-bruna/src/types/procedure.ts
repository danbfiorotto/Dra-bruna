export interface Procedure {
  id: string;
  name: string;
  description?: string;
  category: 'consultation' | 'treatment' | 'examination' | 'surgery';
  default_duration?: number; // in minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProcedureExecution {
  id: string;
  appointment_id: string;
  procedure_id: string;
  performed_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  procedure?: Procedure;
  appointment?: {
    id: string;
    appointment_date: string;
    start_time: string;
    patient?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateProcedureData {
  name: string;
  description?: string;
  category: 'consultation' | 'treatment' | 'examination' | 'surgery';
  default_duration?: number;
  is_active?: boolean;
}

export interface UpdateProcedureData {
  name?: string;
  description?: string;
  category?: 'consultation' | 'treatment' | 'examination' | 'surgery';
  default_duration?: number;
  is_active?: boolean;
}

export interface CreateProcedureExecutionData {
  appointment_id: string;
  procedure_id: string;
  performed_at?: string;
  notes?: string;
}

export interface UpdateProcedureExecutionData {
  performed_at?: string;
  notes?: string;
}

export const PROCEDURE_CATEGORIES = {
  consultation: 'Consulta',
  treatment: 'Tratamento',
  examination: 'Exame',
  surgery: 'Cirurgia'
} as const;
