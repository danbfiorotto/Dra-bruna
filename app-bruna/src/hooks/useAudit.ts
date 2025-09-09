import { useState, useEffect, useCallback } from 'react';
import { AuditService, AuditLog, AuditLogFilters } from '../services/supabase/audit';

export const useAudit = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load audit logs
  const loadAuditLogs = useCallback(async (filters: AuditLogFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AuditService.getAuditLogs(filters);
      setAuditLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load audit logs on mount
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Get audit logs by user
  const getAuditLogsByUser = useCallback(async (userId: string, limit: number = 50) => {
    try {
      setError(null);
      return await AuditService.getAuditLogsByUser(userId, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit logs by user');
      throw err;
    }
  }, []);

  // Get audit logs by action
  const getAuditLogsByAction = useCallback(async (action: string, limit: number = 50) => {
    try {
      setError(null);
      return await AuditService.getAuditLogsByAction(action, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit logs by action');
      throw err;
    }
  }, []);

  // Get audit logs by resource type
  const getAuditLogsByResourceType = useCallback(async (resourceType: string, limit: number = 50) => {
    try {
      setError(null);
      return await AuditService.getAuditLogsByResourceType(resourceType, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit logs by resource type');
      throw err;
    }
  }, []);

  // Get audit logs by period
  const getAuditLogsByPeriod = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      return await AuditService.getAuditLogsByPeriod(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit logs by period');
      throw err;
    }
  }, []);

  // Get recent audit logs
  const getRecentAuditLogs = useCallback(async (limit: number = 100) => {
    try {
      setError(null);
      return await AuditService.getRecentAuditLogs(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recent audit logs');
      throw err;
    }
  }, []);

  // Export audit logs to CSV
  const exportAuditLogsToCSV = useCallback(async (filters: AuditLogFilters = {}) => {
    try {
      setError(null);
      return await AuditService.exportAuditLogsToCSV(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export audit logs to CSV');
      throw err;
    }
  }, []);

  // Get audit stats
  const getAuditStats = useCallback(async () => {
    try {
      setError(null);
      return await AuditService.getAuditStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit stats');
      throw err;
    }
  }, []);

  // Clean old logs
  const cleanOldLogs = useCallback(async () => {
    try {
      setError(null);
      const deletedCount = await AuditService.cleanOldLogs();
      // Reload logs after cleaning
      await loadAuditLogs();
      return deletedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clean old logs');
      throw err;
    }
  }, [loadAuditLogs]);

  // Get audit log by ID
  const getAuditLog = useCallback(async (id: string) => {
    try {
      setError(null);
      return await AuditService.getAuditLog(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get audit log');
      throw err;
    }
  }, []);

  return {
    auditLogs,
    isLoading,
    error,
    loadAuditLogs,
    getAuditLogsByUser,
    getAuditLogsByAction,
    getAuditLogsByResourceType,
    getAuditLogsByPeriod,
    getRecentAuditLogs,
    exportAuditLogsToCSV,
    getAuditStats,
    cleanOldLogs,
    getAuditLog,
  };
};
