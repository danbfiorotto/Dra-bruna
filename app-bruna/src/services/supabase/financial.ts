import { supabase } from '../supabase';

export interface FinancialTransaction {
  id: string;
  patient_id?: string;
  appointment_id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyFinancialSummary {
  month: string;
  type: 'income' | 'expense';
  total_amount: number;
  transaction_count: number;
}

export class FinancialService {
  // ===== TRANSAÇÕES FINANCEIRAS =====

  // Buscar todas as transações
  static async getTransactions(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar transações por período
  static async getTransactionsByPeriod(startDate: string, endDate: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar transações por tipo
  static async getTransactionsByType(type: 'income' | 'expense'): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('type', type)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar transações por categoria
  static async getTransactionsByCategory(category: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('category', category)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar transação por ID
  static async getTransaction(id: string): Promise<FinancialTransaction | null> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Criar nova transação
  static async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Atualizar transação
  static async updateTransaction(id: string, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar transação
  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== CATEGORIAS FINANCEIRAS =====

  // Buscar todas as categorias
  static async getCategories(): Promise<FinancialCategory[]> {
    const { data, error } = await supabase
      .from('financial_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Buscar categorias por tipo
  static async getCategoriesByType(type: 'income' | 'expense'): Promise<FinancialCategory[]> {
    const { data, error } = await supabase
      .from('financial_categories')
      .select('*')
      .eq('type', type)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Criar nova categoria
  static async createCategory(category: Omit<FinancialCategory, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialCategory> {
    const { data, error } = await supabase
      .from('financial_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Atualizar categoria
  static async updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const { data, error } = await supabase
      .from('financial_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar categoria
  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== RELATÓRIOS E ESTATÍSTICAS =====

  // Obter resumo financeiro mensal
  static async getMonthlySummary(): Promise<MonthlyFinancialSummary[]> {
    const { data, error } = await supabase
      .from('monthly_financial_summary')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  // Obter estatísticas do dashboard
  static async getDashboardStats() {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats');

    if (error) throw error;
    return data;
  }

  // Obter receitas do mês atual
  static async getCurrentMonthIncome(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'income')
      .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
      .lte('transaction_date', endOfMonth.toISOString().split('T')[0]);

    if (error) throw error;
    
    return data?.reduce((sum: number, transaction: any) => sum + Number(transaction.amount), 0) || 0;
  }

  // Obter despesas do mês atual
  static async getCurrentMonthExpenses(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'expense')
      .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
      .lte('transaction_date', endOfMonth.toISOString().split('T')[0]);

    if (error) throw error;
    
    return data?.reduce((sum: number, transaction: any) => sum + Number(transaction.amount), 0) || 0;
  }

  // Obter lucro do mês atual
  static async getCurrentMonthProfit(): Promise<number> {
    const [income, expenses] = await Promise.all([
      this.getCurrentMonthIncome(),
      this.getCurrentMonthExpenses()
    ]);
    
    return income - expenses;
  }
}
