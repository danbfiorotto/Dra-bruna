import React, { useState, useEffect } from 'react';
import { useHybridSync, useFileSync } from '../hooks/useHybridSync';
import { SyncMetrics, SyncMetrics as SyncMetricsType, SyncPerformance, NetworkStatus } from './SyncMetrics';

export const HybridSyncMetrics: React.FC = () => {
  const { syncStats, getSyncStats } = useHybridSync();
  const { getStats } = useFileSync();
  const [isLoading, setIsLoading] = useState(false);

  // Converter stats para o formato esperado pelo componente
  const metrics: SyncMetricsType = {
    total_syncs: syncStats?.total_files || 0,
    successful_syncs: syncStats?.synced_files || 0,
    failed_syncs: syncStats?.failed_files || 0,
    conflicts_detected: 0, // Será implementado
    conflicts_resolved: 0, // Será implementado
    tombstones_created: 0, // Será implementado
    tombstones_cleaned: 0, // Será implementado
    records_restored: 0, // Será implementado
    duplicates_found: 0, // Será implementado
    last_sync: syncStats?.last_sync || null,
    average_sync_duration_ms: null, // Será implementado
    uptime_percentage: 95.0, // Será implementado
    network_errors: 0, // Será implementado
    auth_errors: 0, // Será implementado
    data_integrity_errors: 0, // Será implementado
  };

  const performance: SyncPerformance = {
    sync_times: [1000, 1500, 2000, 1200, 1800], // Será implementado
    success_rate: syncStats ? (syncStats.synced_files / syncStats.total_files) * 100 : 0,
    error_rate: syncStats ? (syncStats.failed_files / syncStats.total_files) * 100 : 0,
    conflict_rate: 5.0, // Será implementado
    average_records_per_sync: syncStats?.total_files || 0,
    peak_sync_time: 3000, // Será implementado
    slowest_sync: 5000, // Será implementado
    fastest_sync: 500, // Será implementado
  };

  const networkStatus: NetworkStatus = {
    is_online: navigator.onLine,
    connection_quality: 'good', // Será implementado
    latency_ms: 50, // Será implementado
    bandwidth_mbps: 100, // Será implementado
    last_network_error: null, // Será implementado
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getSyncStats(),
        getStats()
      ]);
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar métricas na inicialização
  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <SyncMetrics
      metrics={metrics}
      performance={performance}
      networkStatus={networkStatus}
      onRefresh={handleRefresh}
      isLoading={isLoading}
    />
  );
};

export default HybridSyncMetrics;
