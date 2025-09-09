import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Tipos para o sistema híbrido de sincronização
export interface ConflictInfo {
  entity_type: string;
  entity_id: string;
  local_data: any;
  server_data: any;
  conflict_type: string;
  recommended_action: string;
  created_at: string;
}

export interface SyncStats {
  total_files: number;
  synced_files: number;
  pending_files: number;
  failed_files: number;
  total_size_bytes: number;
  last_sync?: string;
  sync_errors: string[];
}

export interface FileMetadata {
  id: string;
  filename: string;
  file_path: string;
  remote_path: string;
  file_size: number;
  content_type: string;
  content_hash: string;
  last_modified: string;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict' | 'local_only' | 'remote_only';
  local_modified: string;
  remote_modified?: string;
  uploaded_by?: string;
  download_url?: string;
  metadata: Record<string, string>;
}

export interface DeduplicationResult {
  duplicates: Array<Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    similarity_score: number;
    match_type: string;
    confidence: string;
  }>>;
  total_candidates: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
}

export interface AuditEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  details: any;
  timestamp: string;
  user_id?: string;
  device_id?: string;
}

// Hook principal para sincronização híbrida
export function useHybridSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar sistema híbrido
  const syncHybridSystem = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const conflicts = await invoke<ConflictInfo[]>('sync_hybrid_system');
      setConflicts(conflicts);
      return conflicts;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resolver conflito
  const resolveConflict = useCallback(async (
    entityType: string,
    entityId: string,
    resolution: string
  ) => {
    try {
      await invoke('resolve_conflict_hybrid', {
        entityType,
        entityId,
        resolution
      });
      
      // Remover conflito da lista
      setConflicts(prev => 
        prev.filter(c => !(c.entity_type === entityType && c.entity_id === entityId))
      );
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Obter estatísticas de sincronização
  const getSyncStats = useCallback(async () => {
    try {
      const stats = await invoke<SyncStats>('get_file_sync_status');
      setSyncStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Carregar estatísticas na inicialização
  useEffect(() => {
    getSyncStats();
  }, [getSyncStats]);

  return {
    isLoading,
    conflicts,
    syncStats,
    error,
    syncHybridSystem,
    resolveConflict,
    getSyncStats,
    clearError: () => setError(null)
  };
}

// Hook para deduplicação
export function useDeduplication() {
  const [isLoading, setIsLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DeduplicationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findDuplicates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await invoke<DeduplicationResult>('find_duplicates');
      setDuplicates(result);
      return result;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mergeDuplicates = useCallback(async (duplicateGroups: string[][]) => {
    try {
      await invoke('merge_duplicates', { duplicateGroups });
      // Recarregar duplicatas após merge
      await findDuplicates();
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [findDuplicates]);

  return {
    isLoading,
    duplicates,
    error,
    findDuplicates,
    mergeDuplicates,
    clearError: () => setError(null)
  };
}

// Hook para sincronização de arquivos
export function useFileSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addFile = useCallback(async (
    filePath: string,
    remotePath?: string,
    uploadedBy?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fileId = await invoke<string>('add_file_to_sync', {
        filePath,
        remotePath,
        uploadedBy
      });
      
      // Recarregar arquivos
      await getFilesByStatus('all');
      return fileId;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncAllFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await invoke<SyncStats>('sync_all_files');
      setStats(stats);
      await getFilesByStatus('all');
      return stats;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFilesByStatus = useCallback(async (status: string) => {
    try {
      const files = await invoke<FileMetadata[]>('get_files_by_status', { status });
      setFiles(files);
      return files;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const downloadFile = useCallback(async (fileId: string) => {
    try {
      await invoke('download_file', { fileId });
      await getFilesByStatus('all');
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getFilesByStatus]);

  const removeFile = useCallback(async (fileId: string) => {
    try {
      await invoke('remove_file_from_sync', { fileId });
      await getFilesByStatus('all');
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getFilesByStatus]);

  const getStats = useCallback(async () => {
    try {
      const stats = await invoke<SyncStats>('get_file_sync_status');
      setStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    getFilesByStatus('all');
    getStats();
  }, [getFilesByStatus, getStats]);

  return {
    isLoading,
    files,
    stats,
    error,
    addFile,
    syncAllFiles,
    getFilesByStatus,
    downloadFile,
    removeFile,
    getStats,
    clearError: () => setError(null)
  };
}

// Hook para auditoria
export function useAuditLog() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const logEvent = useCallback(async (
    eventType: string,
    entityType: string,
    entityId: string,
    details: any
  ) => {
    try {
      await invoke('log_sync_event', {
        eventType,
        entityType,
        entityId,
        details
      });
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getAuditLogs = useCallback(async (entityType?: string, limit?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const events = await invoke<AuditEvent[]>('get_audit_logs', {
        entityType,
        limit
      });
      setEvents(events);
      return events;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    events,
    error,
    logEvent,
    getAuditLogs,
    clearError: () => setError(null)
  };
}

// Hook para limpeza de tombstones
export function useTombstoneCleanup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanupTombstones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await invoke<any[]>('cleanup_tombstones');
      return stats;
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreRecord = useCallback(async (tableName: string, recordId: string) => {
    try {
      await invoke('restore_deleted_record', { tableName, recordId });
    } catch (err) {
      const errorMessage = err as string;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    isLoading,
    error,
    cleanupTombstones,
    restoreRecord,
    clearError: () => setError(null)
  };
}
