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

export interface CreateMedicalRecordRequest {
  patient_id: string;
  appointment_id?: string;
  anamnesis?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  created_by?: string;
}

export interface UpdateMedicalRecordRequest {
  anamnesis?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  updated_by?: string;
}

