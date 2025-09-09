import { useState, useEffect, useCallback } from 'react';
import { DocumentsService } from '../services/supabase/documents';
import { Document } from '../types/document';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DocumentsService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Upload document
  const uploadDocument = useCallback(async (file: File, patientId: string, appointmentId?: string) => {
    try {
      setError(null);
      const newDocument = await DocumentsService.uploadDocument(file, patientId, appointmentId);
      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      throw err;
    }
  }, []);

  // Download document
  const downloadDocument = useCallback(async (id: string) => {
    try {
      setError(null);
      return await DocumentsService.downloadDocument(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
      throw err;
    }
  }, []);

  // Get document URL
  const getDocumentUrl = useCallback(async (id: string) => {
    try {
      setError(null);
      return await DocumentsService.getDocumentUrl(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get document URL');
      throw err;
    }
  }, []);

  // Delete document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      setError(null);
      await DocumentsService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    }
  }, []);

  // Get documents by patient
  const getDocumentsByPatient = useCallback(async (patientId: string) => {
    try {
      setError(null);
      return await DocumentsService.getDocumentsByPatient(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get documents by patient');
      throw err;
    }
  }, []);

  // Get documents by appointment
  const getDocumentsByAppointment = useCallback(async (appointmentId: string) => {
    try {
      setError(null);
      return await DocumentsService.getDocumentsByAppointment(appointmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get documents by appointment');
      throw err;
    }
  }, []);

  // Search documents
  const searchDocuments = useCallback(async (searchTerm: string) => {
    try {
      setError(null);
      return await DocumentsService.searchDocuments(searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search documents');
      throw err;
    }
  }, []);

  // Get document by ID
  const getDocument = useCallback(async (id: string) => {
    try {
      setError(null);
      return await DocumentsService.getDocument(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get document');
      throw err;
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    loadDocuments,
    uploadDocument,
    downloadDocument,
    getDocumentUrl,
    deleteDocument,
    getDocumentsByPatient,
    getDocumentsByAppointment,
    searchDocuments,
    getDocument,
  };
};
