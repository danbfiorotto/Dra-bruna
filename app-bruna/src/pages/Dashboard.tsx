import { useEffect, useState } from 'react';
// import { safeInvoke } from '@/hooks/useTauri';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, DollarSign, FileText } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  monthlyRevenue: number;
  pendingRecords: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
    pendingRecords: 0,
  });

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalPatients: 150,
      totalAppointments: 45,
      monthlyRevenue: 12500.00,
      pendingRecords: 8,
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral da clínica Dra. Bruna
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prontuários Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRecords}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando finalização
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas de Hoje</CardTitle>
            <CardDescription>
              Agenda do dia atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Maria Silva</p>
                  <p className="text-sm text-gray-500">09:00 - Limpeza de pele</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Confirmada
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">João Santos</p>
                  <p className="text-sm text-gray-500">14:30 - Consulta dermatológica</p>
                </div>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Pendente
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Novo paciente cadastrado</p>
                  <p className="text-xs text-gray-500">Ana Costa - há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Consulta finalizada</p>
                  <p className="text-xs text-gray-500">Pedro Lima - há 4 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Agendamento alterado</p>
                  <p className="text-xs text-gray-500">Carla Mendes - há 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
