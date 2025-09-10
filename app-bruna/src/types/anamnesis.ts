export interface AnamnesisQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'boolean' | 'text' | 'date';
  is_required: boolean;
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface AnamnesisResponse {
  id: string;
  medical_record_id: string;
  question_id: string;
  boolean_response?: boolean;
  text_response?: string;
  date_response?: string;
  created_at: string;
  updated_at: string;
  question?: AnamnesisQuestion;
}

export interface CreateAnamnesisQuestionData {
  question_number: number;
  question_text: string;
  question_type: 'boolean' | 'text' | 'date';
  is_required?: boolean;
  category: string;
}

export interface UpdateAnamnesisQuestionData {
  question_text?: string;
  question_type?: 'boolean' | 'text' | 'date';
  is_required?: boolean;
  category?: string;
}

export interface CreateAnamnesisResponseData {
  medical_record_id: string;
  question_id: string;
  question_number: number;
  boolean_response?: boolean;
  text_response?: string;
  date_response?: string;
}

export interface UpdateAnamnesisResponseData {
  boolean_response?: boolean;
  text_response?: string;
  date_response?: string;
}

export interface AnamnesisCategory {
  key: string;
  label: string;
  questions: AnamnesisQuestion[];
}

export const ANAMNESIS_CATEGORIES = {
  medical_history: 'Histórico Médico',
  medications: 'Medicações',
  allergies: 'Alergias',
  lifestyle: 'Estilo de Vida',
  dental_history: 'Histórico Odontológico',
  complaint: 'Queixa Principal'
} as const;
