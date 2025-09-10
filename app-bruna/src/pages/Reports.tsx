import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PDFGenerator } from '../services/pdfGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Calendar, Users, DollarSign, FolderOpen, BarChart3 } from 'lucide-react';

interface AppointmentStats {
  total: number;
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
  confirmation_rate: number;
  completion_rate: number;
}

export function Reports() {
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Implementação simples usando Supabase
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*');
      
      if (error) throw error;
      
      // Calcular estatísticas básicas
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
      const pendingAppointments = appointments?.filter(a => a.status === 'scheduled').length || 0;
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
      
      const stats: AppointmentStats = {
        total: totalAppointments,
        confirmed: appointments?.filter(a => a.status === 'confirmed').length || 0,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        confirmation_rate: totalAppointments > 0 ? ((appointments?.filter(a => a.status === 'confirmed').length || 0) / totalAppointments) * 100 : 0,
        completion_rate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const downloadCSV = async (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPatients = async () => {
    try {
      setLoading(true);
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = ['Nome', 'Email', 'Telefone', 'Data de Nascimento', 'Endereço', 'Data de Criação'];
      const rows = patients?.map(patient => [
        patient.name || '',
        patient.email || '',
        patient.phone || '',
        patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '',
        patient.address || '',
        new Date(patient.created_at).toLocaleDateString('pt-BR')
      ]) || [];

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      await downloadCSV(csvContent, `pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Erro ao exportar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAppointments = async () => {
    try {
      setLoading(true);
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(name, email, phone)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const headers = ['Data', 'Hora', 'Paciente', 'Email', 'Telefone', 'Status', 'Observações', 'Data de Criação'];
      const rows = appointments?.map(appointment => [
        new Date(appointment.date).toLocaleDateString('pt-BR'),
        appointment.time || '',
        appointment.patients?.name || '',
        appointment.patients?.email || '',
        appointment.patients?.phone || '',
        appointment.status || '',
        appointment.notes || '',
        new Date(appointment.created_at).toLocaleDateString('pt-BR')
      ]) || [];

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      await downloadCSV(csvContent, `consultas_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Erro ao exportar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDocuments = async () => {
    try {
      setLoading(true);
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          *,
          patients!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = ['Nome do Arquivo', 'Tipo', 'Tamanho', 'Paciente', 'Email', 'Criptografado', 'Data de Criação'];
      const rows = documents?.map(document => [
        document.filename || '',
        document.file_type || '',
        document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB` : '0 MB',
        document.patients?.name || '',
        document.patients?.email || '',
        document.encrypted ? 'Sim' : 'Não',
        new Date(document.created_at).toLocaleDateString('pt-BR')
      ]) || [];

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      await downloadCSV(csvContent, `documentos_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Erro ao exportar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDailyAppointments = async () => {
    try {
      setLoading(true);
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(name, email, phone)
        `)
        .eq('date', selectedDate)
        .order('time', { ascending: true });

      if (error) throw error;

      // Gerar PDF da agenda do dia
      await PDFGenerator.generateDailyAppointmentsPDF(appointments || []);
    } catch (error) {
      console.error('Erro ao exportar agenda do dia:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      // Para sistema online, backup é automático no Supabase
      alert('Sistema online - backup automático no Supabase Cloud!');
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-2 text-gray-600">
          Gere relatórios e exportações dos dados da clínica
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Estatísticas das Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                  <div className="text-sm text-gray-500">Confirmadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-500">Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                  <div className="text-sm text-gray-500">Realizadas</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.confirmation_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Taxa de Confirmação</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.completion_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Taxa de Realização</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Relatório de Pacientes
            </CardTitle>
            <CardDescription>
              Lista completa de pacientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Exporte dados dos pacientes em formato CSV
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportPatients}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Relatório de Consultas
            </CardTitle>
            <CardDescription>
              Agenda e histórico de consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Relatório completo de consultas
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportAppointments}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Relatório de Documentos
            </CardTitle>
            <CardDescription>
              Lista de documentos armazenados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Relatório de documentos por paciente
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportDocuments}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Agenda do Dia
            </CardTitle>
            <CardDescription>
              Impressão da agenda diária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleExportDailyAppointments}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Exportando...' : 'Exportar CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Relatório Financeiro
            </CardTitle>
            <CardDescription>
              Demonstrativo financeiro da clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Receitas, despesas e lucro por período
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Download className="h-4 w-4 mr-2" />
              Em Desenvolvimento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Backup dos Dados
            </CardTitle>
            <CardDescription>
              Backup completo do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Crie um backup de todos os dados
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleBackup}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Criando...' : 'Criar Backup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}