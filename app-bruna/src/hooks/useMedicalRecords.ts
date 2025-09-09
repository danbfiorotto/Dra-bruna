import { useState, useEffect, useCallback } from 'react';
import { MedicalRecordsService, MedicalRecord } from '../services/supabase/medicalRecords';

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
  const createMedicalRecord = useCallback(async (recordData: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
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
  const updateMedicalRecord = useCallback(async (id: string, updates: Partial<MedicalRecord>) => {
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

  // Get medical records by appointment
  const getMedicalRecordsByAppointment = useCallback(async (appointmentId: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.getMedicalRecordsByAppointment(appointmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get medical records by appointment');
      throw err;
    }
  }, []);

  // Get medical record history
  const getMedicalRecordHistory = useCallback(async (patientId: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.getMedicalRecordHistory(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get medical record history');
      throw err;
    }
  }, []);

  // Get latest medical record
  const getLatestMedicalRecord = useCallback(async (patientId: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.getLatestMedicalRecord(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get latest medical record');
      throw err;
    }
  }, []);

  // Search medical records
  const searchMedicalRecords = useCallback(async (searchTerm: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.searchMedicalRecords(searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search medical records');
      throw err;
    }
  }, []);

  // Duplicate medical record
  const duplicateMedicalRecord = useCallback(async (id: string, newAppointmentId?: string) => {
    try {
      setError(null);
      const duplicatedRecord = await MedicalRecordsService.duplicateMedicalRecord(id, newAppointmentId);
      setMedicalRecords(prev => [duplicatedRecord, ...prev]);
      return duplicatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate medical record');
      throw err;
    }
  }, []);

  // Export medical record to PDF
  const exportMedicalRecordToPDF = useCallback(async (id: string) => {
    try {
      setError(null);
      return await MedicalRecordsService.exportMedicalRecordToPDF(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export medical record to PDF');
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
    getMedicalRecordsByAppointment,
    getMedicalRecordHistory,
    getLatestMedicalRecord,
    searchMedicalRecords,
    duplicateMedicalRecord,
    exportMedicalRecordToPDF,
    getMedicalRecord,
  };
};
