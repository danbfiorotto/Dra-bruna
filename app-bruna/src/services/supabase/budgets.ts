import { supabase } from '../supabase';
import { 
  Budget, 
  BudgetItem, 
  CreateBudgetData, 
  UpdateBudgetData,
  CreateBudgetItemData,
  UpdateBudgetItemData
} from '../../types/budget';

export class BudgetsService {
  // Budgets
  static async getBudgets(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        items:budget_items(
          *,
          procedure:procedures(*)
        ),
        medical_record:medical_records(
          id,
          patient:patients(id, name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }

    return data || [];
  }

  static async getBudget(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        items:budget_items(
          *,
          procedure:procedures(*)
        ),
        medical_record:medical_records(
          id,
          patient:patients(id, name)
        )
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

  static async getBudgetsByMedicalRecord(medicalRecordId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        items:budget_items(
          *,
          procedure:procedures(*)
        ),
        medical_record:medical_records(
          id,
          patient:patients(id, name)
        )
      `)
      .eq('medical_record_id', medicalRecordId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar orçamentos do prontuário:', error);
      throw error;
    }

    return data || [];
  }

  static async createBudget(budgetData: CreateBudgetData): Promise<Budget> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { items, ...budgetInfo } = budgetData;

    // Create budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert([{
        ...budgetInfo,
        user_id: user.id
      }])
      .select()
      .single();

    if (budgetError) {
      throw new Error(`Erro ao criar orçamento: ${budgetError.message}`);
    }

    // Create budget items if provided
    if (items && items.length > 0) {
      const itemsWithBudgetId = items.map(item => ({
        ...item,
        budget_id: budget.id
      }));

      const { error: itemsError } = await supabase
        .from('budget_items')
        .insert(itemsWithBudgetId);

      if (itemsError) {
        // Rollback budget creation
        await supabase.from('budgets').delete().eq('id', budget.id);
        throw new Error(`Erro ao criar itens do orçamento: ${itemsError.message}`);
      }
    }

    // Return budget with items
    return this.getBudget(budget.id) as Promise<Budget>;
  }

  static async updateBudget(id: string, budgetData: UpdateBudgetData): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(budgetData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
    }

    return this.getBudget(id) as Promise<Budget>;
  }

  static async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar orçamento: ${error.message}`);
    }
  }

  // Budget Items
  static async getBudgetItems(budgetId: string): Promise<BudgetItem[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select(`
        *,
        procedure:procedures(*)
      `)
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar itens do orçamento:', error);
      throw error;
    }

    return data || [];
  }

  static async createBudgetItem(itemData: CreateBudgetItemData & { budget_id: string }): Promise<BudgetItem> {
    const { data, error } = await supabase
      .from('budget_items')
      .insert([itemData])
      .select(`
        *,
        procedure:procedures(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar item do orçamento: ${error.message}`);
    }

    return data;
  }

  static async updateBudgetItem(id: string, itemData: UpdateBudgetItemData): Promise<BudgetItem> {
    const { data, error } = await supabase
      .from('budget_items')
      .update(itemData)
      .eq('id', id)
      .select(`
        *,
        procedure:procedures(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar item do orçamento: ${error.message}`);
    }

    return data;
  }

  static async deleteBudgetItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar item do orçamento: ${error.message}`);
    }
  }

  // Calculate total value of budget
  static async calculateBudgetTotal(budgetId: string): Promise<number> {
    const items = await this.getBudgetItems(budgetId);
    return items.reduce((total, item) => total + item.total_value, 0);
  }

  // Update budget total when items change
  static async updateBudgetTotal(budgetId: string): Promise<void> {
    const total = await this.calculateBudgetTotal(budgetId);
    
    const { error } = await supabase
      .from('budgets')
      .update({ total_value: total })
      .eq('id', budgetId);

    if (error) {
      throw new Error(`Erro ao atualizar total do orçamento: ${error.message}`);
    }
  }

  // Get budgets by status
  static async getBudgetsByStatus(status: 'draft' | 'approved' | 'rejected'): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        items:budget_items(
          *,
          procedure:procedures(*)
        ),
        medical_record:medical_records(
          id,
          patient:patients(id, name)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar orçamentos por status:', error);
      throw error;
    }

    return data || [];
  }
}
