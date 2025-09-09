import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

export interface SyncMetrics {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  conflicts_detected: number;
  conflicts_resolved: number;
  tombstones_created: number;
  tombstones_cleaned: number;
  records_restored: number;
  duplicates_found: number;
  last_sync: string | null;
  average_sync_duration_ms: number | null;
  uptime_percentage: number;
  network_errors: number;
  auth_errors: number;
  data_integrity_errors: number;
}

export interface SyncPerformance {
  sync_times: number[];
  success_rate: number;
  error_rate: number;
  conflict_rate: number;
  average_records_per_sync: number;
  peak_sync_time: number;
  slowest_sync: number;
  fastest_sync: number;
}

export interface NetworkStatus {
  is_online: boolean;
  connection_quality: 'excellent' | 'good' | 'poor' | 'offline';
  latency_ms: number | null;
  bandwidth_mbps: number | null;
  last_network_error: string | null;
}

interface SyncMetricsProps {
  metrics: SyncMetrics;
  performance: SyncPerformance;
  networkStatus: NetworkStatus;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const SyncMetrics: React.FC<SyncMetricsProps> = ({
  metrics,
  performance,
  networkStatus,
  onRefresh,
  isLoading = false
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'good': return <Wifi className="h-4 w-4 text-blue-600" />;
      case 'poor': return <Wifi className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-600" />;
      default: return <Wifi className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };


  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Métricas de Sincronização
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="1h">Última hora</option>
                <option value="24h">Últimas 24h</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-blue-50' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status de rede */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getConnectionQualityIcon(networkStatus.connection_quality)}
            Status da Rede
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {networkStatus.is_online ? 'Online' : 'Offline'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {networkStatus.latency_ms ? `${networkStatus.latency_ms}ms` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Latência</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {networkStatus.bandwidth_mbps ? `${networkStatus.bandwidth_mbps} Mbps` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Largura de Banda</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConnectionQualityColor(networkStatus.connection_quality)}`}>
                {networkStatus.connection_quality}
              </div>
              <div className="text-sm text-gray-600">Qualidade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(performance.success_rate)}`}>
                  {formatPercentage(performance.success_rate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.average_sync_duration_ms ? formatDuration(metrics.average_sync_duration_ms) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Syncs</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_syncs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conflitos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conflicts_detected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com métricas detalhadas */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estatísticas de sincronização */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas de Sincronização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Syncs Bem-sucedidos</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {metrics.successful_syncs}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Syncs Falharam</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {metrics.failed_syncs}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conflitos Detectados</span>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {metrics.conflicts_detected}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conflitos Resolvidos</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {metrics.conflicts_resolved}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duplicatas Encontradas</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {metrics.duplicates_found}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de dados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas de Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tombstones Criados</span>
                  <Badge variant="outline">{metrics.tombstones_created}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tombstones Limpos</span>
                  <Badge variant="outline">{metrics.tombstones_cleaned}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Registros Restaurados</span>
                  <Badge variant="outline">{metrics.records_restored}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Última Sincronização</span>
                  <span className="text-sm text-gray-500">
                    {metrics.last_sync ? new Date(metrics.last_sync).toLocaleString() : 'Nunca'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Performance de tempo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance de Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sync Mais Rápido</span>
                  <span className="font-medium">{formatDuration(performance.fastest_sync)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sync Mais Lento</span>
                  <span className="font-medium">{formatDuration(performance.slowest_sync)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pico de Tempo</span>
                  <span className="font-medium">{formatDuration(performance.peak_sync_time)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Registros por Sync</span>
                  <span className="font-medium">{performance.average_records_per_sync}</span>
                </div>
              </CardContent>
            </Card>

            {/* Taxas de performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                    <span className="font-medium">{formatPercentage(performance.success_rate)}</span>
                  </div>
                  <Progress value={performance.success_rate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taxa de Erro</span>
                    <span className="font-medium">{formatPercentage(performance.error_rate)}</span>
                  </div>
                  <Progress value={performance.error_rate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Taxa de Conflito</span>
                    <span className="font-medium">{formatPercentage(performance.conflict_rate)}</span>
                  </div>
                  <Progress value={performance.conflict_rate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Erros de Rede</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.network_errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Erros de Auth</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.auth_errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Erros de Integridade</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.data_integrity_errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Histórico detalhado será implementado em breve</p>
                <p className="text-sm">Incluirá gráficos de tendências e logs de eventos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SyncMetrics;
