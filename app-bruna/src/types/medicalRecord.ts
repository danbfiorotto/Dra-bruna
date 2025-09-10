export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id?: string;
  anamnesis?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  rg?: string;
  cpf?: string;
  indication?: string;
  main_complaint?: string;
  last_dental_consultation?: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateMedicalRecordRequest {
  patient_id: string;
  appointment_id?: string;
  anamnesis?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  rg?: string;
  cpf?: string;
  indication?: string;
  main_complaint?: string;
  last_dental_consultation?: string;
  created_by?: string;
}

export interface UpdateMedicalRecordRequest {
  anamnesis?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  rg?: string;
  cpf?: string;
  indication?: string;
  main_complaint?: string;
  last_dental_consultation?: string;
  updated_by?: string;
}

