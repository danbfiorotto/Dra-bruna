import { useState, useEffect, useCallback } from 'react';
import { ClinicsService } from '../services/supabase/clinics';
import { Clinic } from '../types/clinic';

export const useClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clinics
  const loadClinics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ClinicsService.getClinics();
      setClinics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clinics');
      console.error('Failed to load clinics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load clinics on mount
  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  // Create clinic
  const createClinic = useCallback(async (clinicData: Omit<Clinic, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      setError(null);
      const newClinic = await ClinicsService.createClinic(clinicData);
      setClinics(prev => [newClinic, ...prev]);
      return newClinic;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create clinic');
      throw err;
    }
  }, []);

  // Update clinic
  const updateClinic = useCallback(async (id: string, updates: Partial<Clinic>) => {
    try {
      setError(null);
      const updatedClinic = await ClinicsService.updateClinic(id, updates);
      setClinics(prev => prev.map(c => c.id === id ? updatedClinic : c));
      return updatedClinic;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update clinic');
      throw err;
    }
  }, []);

  // Delete clinic
  const deleteClinic = useCallback(async (id: string) => {
    try {
      setError(null);
      await ClinicsService.deleteClinic(id);
      setClinics(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete clinic');
      throw err;
    }
  }, []);

  // Get clinic by ID
  const getClinic = useCallback(async (id: string) => {
    try {
      setError(null);
      return await ClinicsService.getClinic(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get clinic');
      throw err;
    }
  }, []);

  return {
    clinics,
    isLoading,
    error,
    loadClinics,
    createClinic,
    updateClinic,
    deleteClinic,
    getClinic
  };
};
