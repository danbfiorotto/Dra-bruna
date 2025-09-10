import { useState, useEffect, useCallback } from 'react';
import { ProceduresService } from '../services/supabase/procedures';
import { 
  Procedure, 
  ProcedureExecution, 
  CreateProcedureData, 
  UpdateProcedureData,
  CreateProcedureExecutionData,
  UpdateProcedureExecutionData
} from '../types/procedure';

export const useProcedures = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [executions, setExecutions] = useState<ProcedureExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load procedures
  const loadProcedures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProceduresService.getProcedures();
      setProcedures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load procedures');
      console.error('Failed to load procedures:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load procedure executions
  const loadExecutions = useCallback(async () => {
    try {
      setError(null);
      const data = await ProceduresService.getProcedureExecutions();
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load procedure executions');
      console.error('Failed to load procedure executions:', err);
    }
  }, []);

  // Load executions by appointment
  const loadExecutionsByAppointment = useCallback(async (appointmentId: string) => {
    try {
      setError(null);
      const data = await ProceduresService.getProcedureExecutionsByAppointment(appointmentId);
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load procedure executions for appointment');
      console.error('Failed to load procedure executions for appointment:', err);
    }
  }, []);

  // Load procedures on mount
  useEffect(() => {
    loadProcedures();
  }, [loadProcedures]);

  // Create procedure
  const createProcedure = useCallback(async (procedureData: CreateProcedureData) => {
    try {
      setError(null);
      const newProcedure = await ProceduresService.createProcedure(procedureData);
      setProcedures(prev => [...prev, newProcedure]);
      return newProcedure;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create procedure');
      throw err;
    }
  }, []);

  // Update procedure
  const updateProcedure = useCallback(async (id: string, procedureData: UpdateProcedureData) => {
    try {
      setError(null);
      const updatedProcedure = await ProceduresService.updateProcedure(id, procedureData);
      setProcedures(prev => prev.map(p => p.id === id ? updatedProcedure : p));
      return updatedProcedure;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update procedure');
      throw err;
    }
  }, []);

  // Delete procedure
  const deleteProcedure = useCallback(async (id: string) => {
    try {
      setError(null);
      await ProceduresService.deleteProcedure(id);
      setProcedures(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete procedure');
      throw err;
    }
  }, []);

  // Create procedure execution
  const createExecution = useCallback(async (executionData: CreateProcedureExecutionData) => {
    try {
      setError(null);
      const newExecution = await ProceduresService.createProcedureExecution(executionData);
      setExecutions(prev => [newExecution, ...prev]);
      return newExecution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create procedure execution');
      throw err;
    }
  }, []);

  // Update procedure execution
  const updateExecution = useCallback(async (id: string, executionData: UpdateProcedureExecutionData) => {
    try {
      setError(null);
      const updatedExecution = await ProceduresService.updateProcedureExecution(id, executionData);
      setExecutions(prev => prev.map(e => e.id === id ? updatedExecution : e));
      return updatedExecution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update procedure execution');
      throw err;
    }
  }, []);

  // Delete procedure execution
  const deleteExecution = useCallback(async (id: string) => {
    try {
      setError(null);
      await ProceduresService.deleteProcedureExecution(id);
      setExecutions(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete procedure execution');
      throw err;
    }
  }, []);

  // Get procedures by category
  const getProceduresByCategory = useCallback(async () => {
    try {
      setError(null);
      return await ProceduresService.getProceduresByCategory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get procedures by category');
      throw err;
    }
  }, []);

  // Get executions by date range
  const getExecutionsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      const data = await ProceduresService.getProcedureExecutionsByDateRange(startDate, endDate);
      setExecutions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get executions by date range');
      throw err;
    }
  }, []);

  // Get procedure by id
  const getProcedure = useCallback(async (id: string) => {
    try {
      setError(null);
      return await ProceduresService.getProcedure(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get procedure');
      throw err;
    }
  }, []);

  // Get execution by id
  const getExecution = useCallback(async (id: string) => {
    try {
      setError(null);
      return await ProceduresService.getProcedureExecution(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get procedure execution');
      throw err;
    }
  }, []);

  return {
    procedures,
    executions,
    isLoading,
    error,
    loadProcedures,
    loadExecutions,
    loadExecutionsByAppointment,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    createExecution,
    updateExecution,
    deleteExecution,
    getProceduresByCategory,
    getExecutionsByDateRange,
    getProcedure,
    getExecution
  };
};
