export interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateClinicData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface UpdateClinicData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}
