import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTauri, safeInvoke } from './useTauri';
import { DatabaseStatus } from '../config/supabase';

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  patient_id: string;
  appointment_id?: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  notes?: string;
}

export interface CreateAppointmentRequest {
  patient_id: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

export interface CreateDocumentRequest {
  patient_id: string;
  appointment_id?: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  content: string; // Base64 encoded content
}

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isTauri = useTauri();

  // Helper function to safely invoke Tauri commands
  const safeInvokeCommand = useCallback(async <T = any>(command: string, args?: any): Promise<T> => {
    if (isTauri) {
      return await invoke<T>(command, args);
    } else {
      return await safeInvoke(command, args) as T;
    }
  }, [isTauri]);

  // Initialize database
  const initializeDatabase = useCallback(async (masterPassword: string, encrypted: boolean = true) => {
    try {
      setIsLoading(true);
      const result = await safeInvokeCommand<string>('initialize_database', {
        masterPassword,
        encrypted,
      });
      
      if (result.includes('successfully')) {
        setIsInitialized(true);
        await getDatabaseStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [safeInvokeCommand]);

  // Get database status
  const getDatabaseStatus = useCallback(async () => {
    try {
      const status = await safeInvokeCommand<DatabaseStatus>('get_database_status');
      setDatabaseStatus(status);
      setIsInitialized(status.initialized);
      return status;
    } catch (error) {
      console.error('Failed to get database status:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  // Patient CRUD operations
  const getPatients = useCallback(async (): Promise<Patient[]> => {
    try {
      return await safeInvokeCommand<Patient[]>('db_get_patients');
    } catch (error) {
      console.error('Failed to get patients:', error);
      return [];
    }
  }, [safeInvokeCommand]);

  const createPatient = useCallback(async (request: CreatePatientRequest): Promise<Patient | null> => {
    try {
      return await safeInvokeCommand<Patient>('db_create_patient', request);
    } catch (error) {
      console.error('Failed to create patient:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const updatePatient = useCallback(async (id: string, request: CreatePatientRequest): Promise<Patient | null> => {
    try {
      return await safeInvokeCommand<Patient | null>('db_update_patient', { id, request });
    } catch (error) {
      console.error('Failed to update patient:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await safeInvokeCommand<boolean>('db_delete_patient', { id });
    } catch (error) {
      console.error('Failed to delete patient:', error);
      return false;
    }
  }, [safeInvokeCommand]);

  const searchPatients = useCallback(async (query: string): Promise<Patient[]> => {
    try {
      return await safeInvokeCommand<Patient[]>('db_search_patients', { query });
    } catch (error) {
      console.error('Failed to search patients:', error);
      return [];
    }
  }, [safeInvokeCommand]);

  // Appointment CRUD operations
  const getAppointments = useCallback(async (): Promise<Appointment[]> => {
    try {
      return await safeInvokeCommand<Appointment[]>('db_get_appointments');
    } catch (error) {
      console.error('Failed to get appointments:', error);
      return [];
    }
  }, [safeInvokeCommand]);

  const createAppointment = useCallback(async (request: CreateAppointmentRequest): Promise<Appointment | null> => {
    try {
      return await safeInvokeCommand<Appointment>('db_create_appointment', request);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const updateAppointment = useCallback(async (id: string, request: CreateAppointmentRequest): Promise<Appointment | null> => {
    try {
      return await safeInvokeCommand<Appointment | null>('db_update_appointment', { id, request });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await safeInvokeCommand<boolean>('db_delete_appointment', { id });
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      return false;
    }
  }, [safeInvokeCommand]);

  // Document CRUD operations
  const getDocuments = useCallback(async (patientId?: string): Promise<Document[]> => {
    try {
      return await safeInvokeCommand<Document[]>('db_get_documents', { patient_id: patientId || null });
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }, [safeInvokeCommand]);

  const createDocument = useCallback(async (request: CreateDocumentRequest): Promise<Document | null> => {
    try {
      return await safeInvokeCommand<Document>('db_create_document', request);
    } catch (error) {
      console.error('Failed to create document:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const getDocumentContent = useCallback(async (documentId: string): Promise<string | null> => {
    try {
      return await safeInvokeCommand<string>('db_get_document_content', { document_id: documentId });
    } catch (error) {
      console.error('Failed to get document content:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await safeInvokeCommand<boolean>('db_delete_document', { id });
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }, [safeInvokeCommand]);

  // Statistics
  const getAppointmentStatistics = useCallback(async () => {
    try {
      return await safeInvokeCommand<any>('db_get_appointment_statistics');
    } catch (error) {
      console.error('Failed to get appointment statistics:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  // Backup and restore
  const backupDatabase = useCallback(async () => {
    try {
      return await safeInvokeCommand<any>('db_backup_database');
    } catch (error) {
      console.error('Failed to backup database:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  const restoreDatabase = useCallback(async (backupData: any) => {
    try {
      return await safeInvokeCommand<string>('db_restore_database', { backup_data: backupData });
    } catch (error) {
      console.error('Failed to restore database:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  // Migration
  const migrateFromMemoryToDatabase = useCallback(async () => {
    try {
      return await safeInvokeCommand<string>('migrate_from_memory_to_database');
    } catch (error) {
      console.error('Failed to migrate from memory to database:', error);
      return null;
    }
  }, [safeInvokeCommand]);

  // Check database status on mount
  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        // Just check if database is initialized (it should be initialized by the backend)
        await getDatabaseStatus();
      } catch (error) {
        console.error('Failed to check database status:', error);
      }
    };

    checkDatabaseStatus();
  }, [getDatabaseStatus]);

  return {
    isInitialized,
    databaseStatus,
    isLoading,
    initializeDatabase,
    getDatabaseStatus,
    // Patient operations
    getPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    // Appointment operations
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    // Document operations
    getDocuments,
    createDocument,
    getDocumentContent,
    deleteDocument,
    // Statistics
    getAppointmentStatistics,
    // Backup and restore
    backupDatabase,
    restoreDatabase,
    // Migration
    migrateFromMemoryToDatabase,
  };
};
