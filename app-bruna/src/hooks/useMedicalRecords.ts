import { useState, useEffect, useCallback } from 'react';
import { MedicalRecordsService } from '../services/supabase/medicalRecords';
import { MedicalRecord, CreateMedicalRecordRequest, UpdateMedicalRecordRequest } from '../types/medicalRecord';

export const useMedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load medical records
  const loadMedicalRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await MedicalRecordsService.getMedicalRecords();
      setMedicalRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medical records');
      console.error('Failed to load medical records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load medical records on mount
  useEffect(() => {
    loadMedicalRecords();
  }, [loadMedicalRecords]);

  // Create medical record
  const createMedicalRecord = useCallback(async (recordData: CreateMedicalRecordRequest) => {
    try {
      setError(null);
      const newRecord = await MedicalRecordsService.createMedicalRecord(recordData);
      setMedicalRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create medical record');
      throw err;
    }
  }, []);

  // Update medical record
  const updateMedicalRecord = useCallback(async (id: string, updates: UpdateMedicalRecordRequest) => {
    try {
      setError(null);
      const updatedRecord = await MedicalRecordsService.updateMedicalRecord(id, updates);
      setMedicalRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medical record');
      throw err;
    }
  }, []);

  // Delete medical record
  const deleteMedicalRecord = useCallback(async (id: string) => {
    try {
      setError(null);
      await MedicalRecordsService.deleteMedicalRecord(id);
      setMedicalRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medical record');
      throw err;
    }
  }, []);

  // Get medical records by patient
  const getMedicalRecordsByPatient = useCallback(async (patientId: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.getMedicalRecordsByPatient(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get medical records by patient');
      throw err;
    }
  }, []);


  // Get medical record by ID
  const getMedicalRecord = useCallback(async (id: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.getMedicalRecord(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get medical record');
      throw err;
    }
  }, []);

  return {
    medicalRecords,
    isLoading,
    error,
    loadMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getMedicalRecordsByPatient,
    getMedicalRecord,
  };
};
