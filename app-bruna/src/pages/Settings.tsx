import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Database, Bell, Monitor, Download, Upload, CheckCircle, Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';
import { useSupabaseSync } from '../hooks/useSupabaseSync';

interface BackupInfo {
  patients_count: number;
  appointments_count: number;
  documents_count: number;
  total_size: number;
  last_backup: string;
}

export function Settings() {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [notifications, setNotifications] = useState(true);
  // const [backupFile, setBackupFile] = useState<File | null>(null);
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Database and sync hooks
  const { 
    isInitialized: dbInitialized, 
    databaseStatus, 
    initializeDatabase, 
    getDatabaseStatus,
    migrateFromMemoryToDatabase 
  } = useDatabase();
  
  const { 
    lastSync, 
    syncStatus, 
    testConnection, 
    syncToSupabase, 
    syncFromSupabase, 
    fullSync, 
    getSyncStatus 
  } = useSupabaseSync();

  useEffect(() => {
    loadBackupInfo();
    getDatabaseStatus();
    getSyncStatus();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const result = await invoke('get_backup_info');
      setBackupInfo(result as BackupInfo);
    } catch (error) {
      console.error('Erro ao carregar informações de backup:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const result = await invoke('backup_database');
      alert(result);
      loadBackupInfo();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  // const handleRestoreBackup = async () => {
  //   if (!backupFile) {
  //     alert('Selecione um arquivo de backup');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const content = await backupFile.text();
  //     const result = await invoke('restore_database', { backupData: content });
  //     alert(result);
  //     loadBackupInfo();
  //   } catch (error) {
  //     console.error('Erro ao restaurar backup:', error);
  //     alert('Erro ao restaurar backup');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAutoBackupToggle = async () => {
    try {
      const newValue = !autoBackup;
      setAutoBackup(newValue);
      const result = await invoke('schedule_automatic_backup', { enabled: newValue });
      alert(result);
    } catch (error) {
      console.error('Erro ao alterar backup automático:', error);
      setAutoBackup(!autoBackup); // Revert on error
    }
  };

  // const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setBackupFile(file);
  //   }
  // };

  // Database and sync functions
  const handleInitializeDatabase = async () => {
    try {
      setLoading(true);
      const result = await initializeDatabase('03151731.Bts', true);
      if (result) {
        setSyncMessage('Banco de dados inicializado com sucesso!');
        await getDatabaseStatus();
      } else {
        setSyncMessage('Erro ao inicializar banco de dados');
      }
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
      setSyncMessage('Erro ao inicializar banco de dados');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateData = async () => {
    try {
      setLoading(true);
      const result = await migrateFromMemoryToDatabase();
      if (result) {
        setSyncMessage(result);
        await getDatabaseStatus();
      } else {
        setSyncMessage('Erro na migração de dados');
      }
    } catch (error) {
      console.error('Erro na migração:', error);
      setSyncMessage('Erro na migração de dados');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const isConnected = await testConnection();
      setSyncMessage(isConnected ? 'Conexão com Supabase OK!' : 'Erro na conexão com Supabase');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setSyncMessage('Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToSupabase = async () => {
    try {
      setLoading(true);
      const result = await syncToSupabase();
      setSyncMessage(result.message);
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncMessage('Erro na sincronização para Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromSupabase = async () => {
    try {
      setLoading(true);
      const result = await syncFromSupabase();
      setSyncMessage(result.message);
      await getDatabaseStatus();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncMessage('Erro na sincronização do Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleFullSync = async () => {
    try {
      setLoading(true);
      const result = await fullSync();
      setSyncMessage(result.message);
      await getDatabaseStatus();
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      setSyncMessage('Erro na sincronização completa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">
          Configure o sistema e gerencie as preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alterar senha
              </label>
              <Button variant="outline" className="w-full" disabled>
                Alterar Senha
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup automático
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={autoBackup}
                  onChange={handleAutoBackupToggle}
                />
                <span className="text-sm text-gray-600">Ativar backup diário</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criptografia
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={encryption}
                  onChange={(e) => setEncryption(e.target.checked)}
                />
                <span className="text-sm text-gray-600">Criptografar dados sensíveis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Banco de Dados
            </CardTitle>
            <CardDescription>
              Gerenciamento do banco de dados local
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {databaseStatus && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Status do Banco</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Inicializado: {databaseStatus.initialized ? 'Sim' : 'Não'}</div>
                  <div>Pacientes: {databaseStatus.patients_count}</div>
                  <div>Consultas: {databaseStatus.appointments_count}</div>
                  <div>Documentos: {databaseStatus.documents_count}</div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Total: {databaseStatus.total_records} registros
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inicializar banco de dados
              </label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleInitializeDatabase}
                disabled={loading || dbInitialized}
              >
                <Database className="h-4 w-4 mr-2" />
                {loading ? 'Inicializando...' : 'Inicializar BD'}
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Migrar dados da memória
              </label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleMigrateData}
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Migrando...' : 'Migrar Dados'}
              </Button>
            </div>
            
            {backupInfo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup manual
                </label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCreateBackup}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Criando...' : 'Criar Backup'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="h-5 w-5 mr-2" />
              Sincronização Supabase
            </CardTitle>
            <CardDescription>
              Sincronização com o banco de dados na nuvem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncStatus.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Status da Sincronização</h4>
                {syncStatus.map((status, index) => (
                  <div key={index} className="text-sm mb-1">
                    {status.table_name}: {status.total_records} registros
                  </div>
                ))}
                {lastSync && (
                  <div className="mt-2 text-sm text-gray-500">
                    Última sincronização: {lastSync.toLocaleString()}
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testar conexão
              </label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleTestConnection}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? 'Testando...' : 'Testar Conexão'}
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sincronizar para Supabase
              </label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSyncToSupabase}
                disabled={loading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Sincronizando...' : 'Enviar para Nuvem'}
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sincronizar do Supabase
              </label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSyncFromSupabase}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Sincronizando...' : 'Baixar da Nuvem'}
              </Button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sincronização completa
              </label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleFullSync}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {loading ? 'Sincronizando...' : 'Sincronização Completa'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configurações de notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lembretes de consulta
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  defaultChecked 
                />
                <span className="text-sm text-gray-600">Ativar lembretes</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notificações de backup
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="text-sm text-gray-600">Notificar sobre backups</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Som de notificação
              </label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Reproduzir som</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Interface
            </CardTitle>
            <CardDescription>
              Personalização da interface do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <select id="theme" className="w-full p-2 border border-gray-300 rounded-md">
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">Idioma</Label>
              <select id="language" className="w-full p-2 border border-gray-300 rounded-md">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="font">Fonte</Label>
              <select id="font" className="w-full p-2 border border-gray-300 rounded-md">
                <option value="inter">Inter</option>
                <option value="poppins">Poppins</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Verificação da integridade e funcionamento do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {dbInitialized ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="text-sm">
                  Banco de dados: {dbInitialized ? 'Funcionando' : 'Não inicializado'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Criptografia: Ativa</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Backup: Configurado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagens de Status */}
      {syncMessage && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Mensagens do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{syncMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}