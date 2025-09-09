import { useState, useEffect, useCallback } from 'react';
import { PatientsService } from '../services/supabase/patients';
import { Patient } from '../types/patient';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patients
  const loadPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await PatientsService.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      console.error('Failed to load patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Create patient
  const createPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newPatient = await PatientsService.createPatient(patientData);
      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      throw err;
    }
  }, []);

  // Update patient
  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>) => {
    try {
      setError(null);
      const updatedPatient = await PatientsService.updatePatient(id, updates);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      return updatedPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
      throw err;
    }
  }, []);

  // Delete patient
  const deletePatient = useCallback(async (id: string) => {
    try {
      setError(null);
      await PatientsService.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
      throw err;
    }
  }, []);

  // Search patients
  const searchPatients = useCallback(async (searchTerm: string) => {
    try {
      setError(null);
      const results = await PatientsService.searchPatients(searchTerm);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search patients');
      throw err;
    }
  }, []);

  // Get patient by ID
  const getPatient = useCallback(async (id: string) => {
    try {
      setError(null);
      return await PatientsService.getPatient(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get patient');
      throw err;
    }
  }, []);

  // Get patient stats
  const getPatientStats = useCallback(async () => {
    try {
      setError(null);
      return await PatientsService.getPatientStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get patient stats');
      throw err;
    }
  }, []);

  return {
    patients,
    isLoading,
    error,
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatient,
    getPatientStats,
  };
};
