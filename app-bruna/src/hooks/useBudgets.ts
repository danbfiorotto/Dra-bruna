import { useState, useEffect, useCallback } from 'react';
import { BudgetsService } from '../services/supabase/budgets';
import { 
  Budget, 
  BudgetItem, 
  CreateBudgetData, 
  UpdateBudgetData,
  CreateBudgetItemData,
  UpdateBudgetItemData
} from '../types/budget';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load budgets
  const loadBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await BudgetsService.getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
      console.error('Failed to load budgets:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load budgets by medical record
  const loadBudgetsByMedicalRecord = useCallback(async (medicalRecordId: string) => {
    try {
      setError(null);
      const data = await BudgetsService.getBudgetsByMedicalRecord(medicalRecordId);
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets for medical record');
      console.error('Failed to load budgets for medical record:', err);
    }
  }, []);

  // Load budget items
  const loadBudgetItems = useCallback(async (budgetId: string) => {
    try {
      setError(null);
      const data = await BudgetsService.getBudgetItems(budgetId);
      setBudgetItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget items');
      console.error('Failed to load budget items:', err);
    }
  }, []);

  // Load budgets on mount
  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Create budget
  const createBudget = useCallback(async (budgetData: CreateBudgetData) => {
    try {
      setError(null);
      const newBudget = await BudgetsService.createBudget(budgetData);
      setBudgets(prev => [newBudget, ...prev]);
      return newBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
      throw err;
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (id: string, budgetData: UpdateBudgetData) => {
    try {
      setError(null);
      const updatedBudget = await BudgetsService.updateBudget(id, budgetData);
      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
      return updatedBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      throw err;
    }
  }, []);

  // Delete budget
  const deleteBudget = useCallback(async (id: string) => {
    try {
      setError(null);
      await BudgetsService.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
      throw err;
    }
  }, []);

  // Create budget item
  const createBudgetItem = useCallback(async (itemData: CreateBudgetItemData & { budget_id: string }) => {
    try {
      setError(null);
      const newItem = await BudgetsService.createBudgetItem(itemData);
      setBudgetItems(prev => [...prev, newItem]);
      // Update budget total
      await BudgetsService.updateBudgetTotal(itemData.budget_id);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget item');
      throw err;
    }
  }, []);

  // Update budget item
  const updateBudgetItem = useCallback(async (id: string, itemData: UpdateBudgetItemData) => {
    try {
      setError(null);
      const updatedItem = await BudgetsService.updateBudgetItem(id, itemData);
      setBudgetItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      // Update budget total
      if (updatedItem.budget_id) {
        await BudgetsService.updateBudgetTotal(updatedItem.budget_id);
      }
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget item');
      throw err;
    }
  }, []);

  // Delete budget item
  const deleteBudgetItem = useCallback(async (id: string, budgetId: string) => {
    try {
      setError(null);
      await BudgetsService.deleteBudgetItem(id);
      setBudgetItems(prev => prev.filter(item => item.id !== id));
      // Update budget total
      await BudgetsService.updateBudgetTotal(budgetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget item');
      throw err;
    }
  }, []);

  // Get budget by id
  const getBudget = useCallback(async (id: string) => {
    try {
      setError(null);
      return await BudgetsService.getBudget(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get budget');
      throw err;
    }
  }, []);

  // Get budgets by status
  const getBudgetsByStatus = useCallback(async (status: 'draft' | 'approved' | 'rejected') => {
    try {
      setError(null);
      const data = await BudgetsService.getBudgetsByStatus(status);
      setBudgets(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get budgets by status');
      throw err;
    }
  }, []);

  // Calculate budget total
  const calculateBudgetTotal = useCallback(async (budgetId: string) => {
    try {
      setError(null);
      return await BudgetsService.calculateBudgetTotal(budgetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate budget total');
      throw err;
    }
  }, []);

  // Update budget total
  const updateBudgetTotal = useCallback(async (budgetId: string) => {
    try {
      setError(null);
      await BudgetsService.updateBudgetTotal(budgetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget total');
      throw err;
    }
  }, []);

  return {
    budgets,
    budgetItems,
    isLoading,
    error,
    loadBudgets,
    loadBudgetsByMedicalRecord,
    loadBudgetItems,
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    getBudget,
    getBudgetsByStatus,
    calculateBudgetTotal,
    updateBudgetTotal
  };
};
