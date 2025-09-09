import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Monitor, Cloud, CheckCircle, AlertCircle, RefreshCw, Palette } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SystemStatus {
  online: boolean;
  lastCheck: string;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  supabaseStatus: 'active' | 'inactive' | 'checking';
}

export function Settings() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    online: false,
    lastCheck: '',
    connectionStatus: 'checking',
    supabaseStatus: 'checking'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    checkSystemStatus();
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, connectionStatus: 'checking', supabaseStatus: 'checking' }));
      
      // Verificar conexão com Supabase usando a tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const isOnline = !error && data !== null;
      const supabaseStatus = isOnline ? 'active' : 'inactive';
      
      setSystemStatus({
        online: isOnline,
        lastCheck: new Date().toLocaleString('pt-BR'),
        connectionStatus: isOnline ? 'connected' : 'disconnected',
        supabaseStatus
      });
      
      if (isOnline) {
        setMessage('Sistema online e funcionando normalmente');
      } else {
        setMessage('Problema de conexão detectado');
      }
    } catch (error) {
      console.error('Erro ao verificar status do sistema:', error);
      setSystemStatus(prev => ({
        ...prev,
        online: false,
        lastCheck: new Date().toLocaleString('pt-BR'),
        connectionStatus: 'disconnected',
        supabaseStatus: 'inactive'
      }));
      setMessage('Erro ao verificar status do sistema');
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    try {
      await checkSystemStatus();
      setMessage('Status atualizado com sucesso');
    } catch (error) {
      setMessage('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie as configurações do sistema</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          systemStatus.online 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Verificação automática da conexão com o Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Status da Conexão</Label>
                <p className="text-sm text-gray-600">
                  {systemStatus.connectionStatus === 'checking' && 'Verificando...'}
                  {systemStatus.connectionStatus === 'connected' && 'Conectado'}
                  {systemStatus.connectionStatus === 'disconnected' && 'Desconectado'}
                </p>
              </div>
              <div className="flex items-center">
                {systemStatus.connectionStatus === 'checking' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                {systemStatus.connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {systemStatus.connectionStatus === 'disconnected' && <AlertCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Supabase</Label>
                <p className="text-sm text-gray-600">
                  {systemStatus.supabaseStatus === 'checking' && 'Verificando...'}
                  {systemStatus.supabaseStatus === 'active' && 'Ativo'}
                  {systemStatus.supabaseStatus === 'inactive' && 'Inativo'}
                </p>
              </div>
              <div className="flex items-center">
                {systemStatus.supabaseStatus === 'checking' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                {systemStatus.supabaseStatus === 'active' && <Cloud className="h-5 w-5 text-green-500" />}
                {systemStatus.supabaseStatus === 'inactive' && <AlertCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Última Verificação</Label>
              <p className="text-sm text-gray-600">{systemStatus.lastCheck || 'Nunca'}</p>
            </div>
            <Button 
              onClick={handleRefreshStatus} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Interface
          </CardTitle>
          <CardDescription>
            Personalize a aparência do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Tema</Label>
              <p className="text-sm text-gray-600 mt-1">
                Configurações de tema serão implementadas em breve
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Layout</Label>
              <p className="text-sm text-gray-600 mt-1">
                Opções de layout serão implementadas em breve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}