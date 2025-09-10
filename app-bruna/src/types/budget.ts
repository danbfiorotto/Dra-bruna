export interface Budget {
  id: string;
  medical_record_id: string;
  total_value: number;
  description?: string;
  status: 'draft' | 'approved' | 'rejected';
  valid_until?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  items?: BudgetItem[];
  medical_record?: {
    id: string;
    patient?: {
      id: string;
      name: string;
    };
  };
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  procedure_id?: string;
  description: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  procedure?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface CreateBudgetData {
  medical_record_id: string;
  total_value?: number;
  description?: string;
  status?: 'draft' | 'approved' | 'rejected';
  valid_until?: string;
  items?: CreateBudgetItemData[];
}

export interface UpdateBudgetData {
  total_value?: number;
  description?: string;
  status?: 'draft' | 'approved' | 'rejected';
  valid_until?: string;
}

export interface CreateBudgetItemData {
  procedure_id?: string;
  description: string;
  quantity?: number;
  unit_value: number;
  total_value?: number;
}

export interface UpdateBudgetItemData {
  procedure_id?: string;
  description?: string;
  quantity?: number;
  unit_value?: number;
  total_value?: number;
}

export const BUDGET_STATUS = {
  draft: 'Rascunho',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
} as const;
