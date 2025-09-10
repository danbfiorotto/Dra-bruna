export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  notes?: string;
  rg?: string;
  cpf?: string;
  indication?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreatePatientData {
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  notes?: string;
  rg?: string;
  cpf?: string;
  indication?: string;
}

export interface UpdatePatientData {
  name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  notes?: string;
  rg?: string;
  cpf?: string;
  indication?: string;
}
