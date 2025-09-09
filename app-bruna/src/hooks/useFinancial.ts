import { useState, useEffect, useCallback } from 'react';
import { FinancialService, FinancialTransaction, FinancialCategory } from '../services/supabase/financial';

export const useFinancial = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions and categories
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [transactionsData, categoriesData] = await Promise.all([
        FinancialService.getTransactions(),
        FinancialService.getCategories()
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
      console.error('Failed to load financial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create transaction
  const createTransaction = useCallback(async (transactionData: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newTransaction = await FinancialService.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      throw err;
    }
  }, []);

  // Update transaction
  const updateTransaction = useCallback(async (id: string, updates: Partial<FinancialTransaction>) => {
    try {
      setError(null);
      const updatedTransaction = await FinancialService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      await FinancialService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  }, []);

  // Create category
  const createCategory = useCallback(async (categoryData: Omit<FinancialCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newCategory = await FinancialService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  }, []);

  // Update category
  const updateCategory = useCallback(async (id: string, updates: Partial<FinancialCategory>) => {
    try {
      setError(null);
      const updatedCategory = await FinancialService.updateCategory(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError(null);
      await FinancialService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  }, []);

  // Get transactions by period
  const getTransactionsByPeriod = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      return await FinancialService.getTransactionsByPeriod(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get transactions by period');
      throw err;
    }
  }, []);

  // Get transactions by type
  const getTransactionsByType = useCallback(async (type: 'income' | 'expense') => {
    try {
      setError(null);
      return await FinancialService.getTransactionsByType(type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get transactions by type');
      throw err;
    }
  }, []);

  // Get monthly summary
  const getMonthlySummary = useCallback(async () => {
    try {
      setError(null);
      return await FinancialService.getMonthlySummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get monthly summary');
      throw err;
    }
  }, []);

  // Get dashboard stats
  const getDashboardStats = useCallback(async () => {
    try {
      setError(null);
      return await FinancialService.getDashboardStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get dashboard stats');
      throw err;
    }
  }, []);

  // Get current month income
  const getCurrentMonthIncome = useCallback(async () => {
    try {
      setError(null);
      return await FinancialService.getCurrentMonthIncome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current month income');
      throw err;
    }
  }, []);

  // Get current month expenses
  const getCurrentMonthExpenses = useCallback(async () => {
    try {
      setError(null);
      return await FinancialService.getCurrentMonthExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current month expenses');
      throw err;
    }
  }, []);

  // Get current month profit
  const getCurrentMonthProfit = useCallback(async () => {
    try {
      setError(null);
      return await FinancialService.getCurrentMonthProfit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current month profit');
      throw err;
    }
  }, []);

  return {
    transactions,
    categories,
    isLoading,
    error,
    loadData,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createCategory,
    updateCategory,
    deleteCategory,
    getTransactionsByPeriod,
    getTransactionsByType,
    getMonthlySummary,
    getDashboardStats,
    getCurrentMonthIncome,
    getCurrentMonthExpenses,
    getCurrentMonthProfit,
  };
};
