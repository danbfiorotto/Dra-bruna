import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  Database, 
  FileText, 
  Users, 
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

import HybridSyncConflictResolution from '../components/HybridSyncConflictResolution';
import HybridSyncMetrics from '../components/HybridSyncMetrics';
import { useHybridSync, useDeduplication, useFileSync, useAuditLog, useTombstoneCleanup } from '../hooks/useHybridSync';

export const HybridSyncPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hooks do sistema híbrido
  const {
    conflicts,
    isLoading: syncLoading,
    error: syncError,
    syncHybridSystem
  } = useHybridSync();

  const {
    duplicates,
    isLoading: dedupLoading,
    findDuplicates
  } = useDeduplication();

  const {
    files,
    stats: fileStats,
    isLoading: fileLoading,
    syncAllFiles,
    getFilesByStatus
  } = useFileSync();

  const {
    // isLoading: auditLoading
  } = useAuditLog();

  const {
    isLoading: cleanupLoading,
    cleanupTombstones
  } = useTombstoneCleanup();

  const handleFullSync = async () => {
    try {
      await syncHybridSystem();
      await syncAllFiles();
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
    }
  };

  const handleFindDuplicates = async () => {
    try {
      await findDuplicates();
    } catch (error) {
      console.error('Erro ao buscar duplicatas:', error);
    }
  };

  const handleCleanupTombstones = async () => {
    try {
      await cleanupTombstones();
    } catch (error) {
      console.error('Erro na limpeza de tombstones:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'conflict': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <RefreshCw className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'conflict': return <AlertTriangle className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema Híbrido de Sincronização</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento completo de sincronização entre cache local e Supabase
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleFullSync}
            disabled={syncLoading || fileLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(syncLoading || fileLoading) ? 'animate-spin' : ''}`} />
            Sincronização Completa
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conflitos</p>
                <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duplicatas</p>
                <p className="text-2xl font-bold text-gray-900">{duplicates?.total_candidates || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Arquivos</p>
                <p className="text-2xl font-bold text-gray-900">{fileStats?.total_files || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge className={syncError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {syncError ? 'Erro' : 'OK'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="conflicts">Conflitos</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicatas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status de Sincronização */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status de Sincronização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conflitos Pendentes</span>
                  <Badge variant="outline">{conflicts.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arquivos Sincronizados</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {fileStats?.synced_files || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arquivos Pendentes</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {fileStats?.pending_files || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arquivos com Erro</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {fileStats?.failed_files || 0}
                  </Badge>
                </div>
                {fileStats?.last_sync && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Última Sincronização</span>
                    <span className="text-sm text-gray-500">
                      {new Date(fileStats.last_sync).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleFullSync}
                  disabled={syncLoading || fileLoading}
                  className="w-full justify-start"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${(syncLoading || fileLoading) ? 'animate-spin' : ''}`} />
                  Sincronização Completa
                </Button>
                
                <Button
                  onClick={handleFindDuplicates}
                  disabled={dedupLoading}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Buscar Duplicatas
                </Button>
                
                <Button
                  onClick={handleCleanupTombstones}
                  disabled={cleanupLoading}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Limpar Tombstones
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conflitos */}
        <TabsContent value="conflicts">
          <HybridSyncConflictResolution />
        </TabsContent>

        {/* Arquivos */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sincronização de Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => getFilesByStatus('all')}
                    disabled={fileLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${fileLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                  <Button
                    onClick={syncAllFiles}
                    disabled={fileLoading}
                    variant="outline"
                  >
                    Sincronizar Todos
                  </Button>
                </div>

                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(file.sync_status)}
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-sm text-gray-500">
                            {file.file_size} bytes • {file.content_type}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(file.sync_status)}>
                        {file.sync_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duplicatas */}
        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Duplicatas Encontradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {duplicates ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{duplicates.total_candidates}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{duplicates.high_confidence}</p>
                      <p className="text-sm text-gray-600">Alta Confiança</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{duplicates.medium_confidence}</p>
                      <p className="text-sm text-gray-600">Média Confiança</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{duplicates.low_confidence}</p>
                      <p className="text-sm text-gray-600">Baixa Confiança</p>
                    </div>
                  </div>

                  {duplicates.duplicates.map((group, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Grupo de Duplicatas {index + 1}</h4>
                      <div className="space-y-2">
                        {group.map((duplicate) => (
                          <div key={duplicate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{duplicate.name}</p>
                              <p className="text-sm text-gray-500">
                                {duplicate.email} • {duplicate.phone}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {duplicate.confidence} ({duplicate.similarity_score.toFixed(2)})
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Nenhuma duplicata encontrada</p>
                  <Button
                    onClick={handleFindDuplicates}
                    disabled={dedupLoading}
                    className="mt-4"
                  >
                    Buscar Duplicatas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas */}
        <TabsContent value="metrics">
          <HybridSyncMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HybridSyncPage;
