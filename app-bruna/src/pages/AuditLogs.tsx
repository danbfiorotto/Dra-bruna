import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Shield, Calendar, User, Loader2 } from 'lucide-react';
import { useAudit } from '../hooks/useAudit';

export function AuditLogs() {
  const {
    auditLogs,
    isLoading,
    error,
    loadAuditLogs,
    exportAuditLogsToCSV,
    getAuditStats
  } = useAudit();

  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    start_date: '',
    end_date: ''
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadAuditLogs();
    loadStats();
  }, [loadAuditLogs]);

  const loadStats = async () => {
    try {
      const auditStats = await getAuditStats();
      setStats(auditStats);
    } catch (err) {
      console.error('Failed to load audit stats:', err);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const filterParams = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
    );
    loadAuditLogs(filterParams);
  };

  const handleExport = async () => {
    try {
      const csvContent = await exportAuditLogsToCSV(filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar logs de auditoria: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoria</h1>
            <p className="mt-2 text-gray-600">
              Registro de todas as ações realizadas no sistema
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total de Logs</p>
                  <p className="text-2xl font-bold">{stats.total_logs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold">{stats.logs_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold">{stats.logs_this_week}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold">{stats.logs_this_month}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ação</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="INSERT">Inserir</SelectItem>
                  <SelectItem value="UPDATE">Atualizar</SelectItem>
                  <SelectItem value="DELETE">Deletar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Recurso</label>
              <Select value={filters.resource_type} onValueChange={(value) => handleFilterChange('resource_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="patients">Pacientes</SelectItem>
                  <SelectItem value="appointments">Agendamentos</SelectItem>
                  <SelectItem value="documents">Documentos</SelectItem>
                  <SelectItem value="medical_records">Prontuários</SelectItem>
                  <SelectItem value="financial_transactions">Transações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Data Inicial</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Data Final</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={applyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        {auditLogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum log de auditoria encontrado</p>
            </CardContent>
          </Card>
        ) : (
          auditLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-600">{log.resource_type}</span>
                      {log.resource_id && (
                        <span className="text-xs text-gray-500">ID: {log.resource_id}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {log.user_email || 'Sistema'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(log.created_at)}
                      </span>
                      {log.ip_address && (
                        <span>IP: {log.ip_address}</span>
                      )}
                    </div>
                    {log.details && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Ver detalhes
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}