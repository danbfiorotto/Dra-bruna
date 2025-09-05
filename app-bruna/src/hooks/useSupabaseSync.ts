import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTauri, safeInvoke } from './useTauri';

export interface SyncResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface SyncStatus {
  table_name: string;
  last_sync: string | null;
  total_records: number;
  pending_sync: number;
}

export const useSupabaseSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const isTauri = useTauri();

  // Helper function to safely invoke Tauri commands
  const safeInvokeCommand = useCallback(async <T = any>(command: string, args?: any): Promise<T> => {
    if (isTauri) {
      return await invoke<T>(command, args);
    } else {
      return await safeInvoke(command, args) as T;
    }
  }, [isTauri]);

  // Test Supabase connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await safeInvokeCommand<boolean>('test_supabase_connection');
    } catch (error) {
      console.error('Failed to test Supabase connection:', error);
      return false;
    }
  }, [safeInvokeCommand]);

  // Sync local data to Supabase
  const syncToSupabase = useCallback(async (): Promise<SyncResult> => {
    try {
      setIsLoading(true);
      const result = await safeInvokeCommand<any>('sync_to_supabase');

      setLastSync(new Date());
      return {
        success: true,
        message: 'Sincronização para Supabase concluída com sucesso',
        details: result,
      };
    } catch (error) {
      console.error('Failed to sync to Supabase:', error);
      return {
        success: false,
        message: `Erro na sincronização: ${error}`,
      };
    } finally {
      setIsLoading(false);
    }
  }, [safeInvokeCommand]);

  // Sync data from Supabase to local
  const syncFromSupabase = useCallback(async (): Promise<SyncResult> => {
    try {
      setIsLoading(true);
      const result = await safeInvokeCommand<any>('sync_from_supabase');

      setLastSync(new Date());
      return {
        success: true,
        message: 'Sincronização do Supabase concluída com sucesso',
        details: result,
      };
    } catch (error) {
      console.error('Failed to sync from Supabase:', error);
      return {
        success: false,
        message: `Erro na sincronização: ${error}`,
      };
    } finally {
      setIsLoading(false);
    }
  }, [safeInvokeCommand]);

  // Get sync status
  const getSyncStatus = useCallback(async (): Promise<SyncStatus[]> => {
    try {
      const status = await safeInvokeCommand<any>('get_sync_status');
      
      // Transform the result to match our interface
      const syncStatusArray: SyncStatus[] = [
        {
          table_name: 'patients',
          last_sync: status.local_data?.patients ? new Date().toISOString() : null,
          total_records: status.local_data?.patients || 0,
          pending_sync: 0, // This would need to be calculated based on actual sync logic
        },
        {
          table_name: 'appointments',
          last_sync: status.local_data?.appointments ? new Date().toISOString() : null,
          total_records: status.local_data?.appointments || 0,
          pending_sync: 0,
        },
        {
          table_name: 'documents',
          last_sync: status.local_data?.documents ? new Date().toISOString() : null,
          total_records: status.local_data?.documents || 0,
          pending_sync: 0,
        },
      ];

      setSyncStatus(syncStatusArray);
      return syncStatusArray;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return [];
    }
  }, [safeInvokeCommand]);

  // Full sync (both directions)
  const fullSync = useCallback(async (): Promise<SyncResult> => {
    try {
      setIsLoading(true);
      
      // First sync from Supabase to get latest data
      const fromResult = await syncFromSupabase();
      if (!fromResult.success) {
        return fromResult;
      }

      // Then sync to Supabase to push local changes
      const toResult = await syncToSupabase();
      if (!toResult.success) {
        return toResult;
      }

      return {
        success: true,
        message: 'Sincronização completa concluída com sucesso',
        details: {
          from: fromResult.details,
          to: toResult.details,
        },
      };
    } catch (error) {
      console.error('Failed to perform full sync:', error);
      return {
        success: false,
        message: `Erro na sincronização completa: ${error}`,
      };
    } finally {
      setIsLoading(false);
    }
  }, [syncFromSupabase, syncToSupabase]);

  // Auto-sync (can be called periodically)
  const autoSync = useCallback(async (): Promise<SyncResult> => {
    try {
      // Check if we have internet connection and Supabase is accessible
      const isConnected = await testConnection();
      if (!isConnected) {
        return {
          success: false,
          message: 'Sem conexão com o Supabase',
        };
      }

      // Perform incremental sync (this would need to be implemented)
      // For now, we'll do a full sync
      return await fullSync();
    } catch (error) {
      console.error('Auto-sync failed:', error);
      return {
        success: false,
        message: `Erro na sincronização automática: ${error}`,
      };
    }
  }, [testConnection, fullSync]);

  return {
    isLoading,
    lastSync,
    syncStatus,
    testConnection,
    syncToSupabase,
    syncFromSupabase,
    getSyncStatus,
    fullSync,
    autoSync,
  };
};
