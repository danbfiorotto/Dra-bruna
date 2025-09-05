import React, { useState, useEffect } from 'react';
import { useAuth, AuditLog } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Shield, 
  User, 
  Calendar, 
  FileText, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AuditLogs: React.FC = () => {
  const { getAuditLogs } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const auditLogs = await getAuditLogs(
        filters.userId || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setLogs(auditLogs);
      setFilteredLogs(auditLogs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (filters.action) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (filters.entityType) {
      filtered = filtered.filter(log => 
        log.entity_type.toLowerCase().includes(filters.entityType.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
      case 'LOGOUT':
        return <User className="h-4 w-4" />;
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return <FileText className="h-4 w-4" />;
      case 'ENCRYPT_DOCUMENT':
      case 'DECRYPT_DOCUMENT':
        return <Shield className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return 'text-green-600 bg-green-100';
      case 'LOGOUT':
        return 'text-orange-600 bg-orange-100';
      case 'CREATE':
        return 'text-blue-600 bg-blue-100';
      case 'UPDATE':
        return 'text-yellow-600 bg-yellow-100';
      case 'DELETE':
        return 'text-red-600 bg-red-100';
      case 'ENCRYPT_DOCUMENT':
      case 'DECRYPT_DOCUMENT':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'Data/Hora,Usuário,Ação,Entidade,ID da Entidade,Detalhes',
      ...filteredLogs.map(log => 
        `"${format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}","${log.user_email}","${log.action}","${log.entity_type}","${log.entity_id || ''}","${log.details || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-600">Monitore todas as ações realizadas no sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="userId">Usuário</Label>
              <Input
                id="userId"
                placeholder="Filtrar por usuário"
                value={filters.userId}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="action">Ação</Label>
              <Input
                id="action"
                placeholder="Filtrar por ação"
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="entityType">Tipo de Entidade</Label>
              <Input
                id="entityType"
                placeholder="Filtrar por tipo"
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoria</CardTitle>
          <CardDescription>
            {filteredLogs.length} de {logs.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum log de auditoria encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{log.action}</h3>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{log.entity_type}</span>
                          {log.entity_id && (
                            <>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">ID: {log.entity_id}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>{log.user_email}</strong>
                          {log.details && ` - ${log.details}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
