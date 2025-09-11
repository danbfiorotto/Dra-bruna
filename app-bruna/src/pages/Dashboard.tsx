import { useDashboard } from '@/hooks/useDashboard';
import { DashboardFilters } from '@/components/DashboardFilters';
import { KpiCard } from '@/components/KpiCard';
import { StackedBar } from '@/components/StackedBar';
import { WeeklyBarChart } from '@/components/WeeklyBarChart';
import { ClinicRanking } from '@/components/ClinicRanking';
import { TodayList } from '@/components/TodayList';
import { ActivityFeed } from '@/components/ActivityFeed';
import { DonutDistribution } from '@/components/DonutDistribution';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const {
    data,
    filters,
    isLoading,
    error,
    alerts,
    availableClinics,
    updateFilters,
    refreshData
  } = useDashboard();

  const handleClinicClick = (clinicId: string) => updateFilters({ clinics: [clinicId] });
  const handleClinicRankingSeeAll = () => console.log('Navigate to full ranking');
  const handleDistributionClick = (clinic: string) => {
    const clinicId = availableClinics.find(c => c.name === clinic)?.id;
    if (clinicId) handleClinicClick(clinicId);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refreshData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-8xl mx-auto px-4 lg:px-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm lg:text-base text-gray-600">
          Visão geral da clínica Dra. Bruna
        </p>
      </div>

      {/* Filters */}
      <DashboardFilters
        value={filters}
        onChange={updateFilters}
        clinics={availableClinics}
        isLoading={isLoading}
      />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div>
                <strong>{alerts[0].title}:</strong>
                <div className="mt-2 space-y-1">
                  {alerts[0].message.split('•').filter(msg => msg.trim()).map((m, i) => (
                    <div key={i} className="text-sm">• {m.trim()}</div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-8">
        <KpiCard label="Faturamento do Período" value={data?.kpis.revenue_total || 0} delta={data?.kpis.deltas.revenue_total} suffix="R$" isLoading={isLoading} />
        <KpiCard label="Ticket Médio" value={data?.kpis.avg_ticket || 0} delta={data?.kpis.deltas.avg_ticket} suffix="R$" isLoading={isLoading} />
        <KpiCard label="Recebido" value={data?.kpis.received || 0} delta={data?.kpis.deltas.received} suffix="R$" isLoading={isLoading} />
        <KpiCard label="Pendente" value={data?.kpis.pending || 0} delta={data?.kpis.deltas.pending} suffix="R$" isLoading={isLoading} />
        <KpiCard label="Atendimentos" value={data?.kpis.appointments_done || 0} delta={data?.kpis.deltas.appointments_done} isLoading={isLoading} />
        <KpiCard label="Taxa de Confirmação" value={data?.kpis.confirmation_rate || 0} delta={data?.kpis.deltas.confirmation_rate} suffix="%" isLoading={isLoading} />
        <KpiCard label="Pacientes Únicos" value={data?.kpis.unique_patients || 0} delta={data?.kpis.deltas.unique_patients} isLoading={isLoading} />
        <KpiCard label="Prontuários Pendentes" value={data?.kpis.pending_charts || 0} delta={data?.kpis.deltas.pending_charts} isLoading={isLoading} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 mb-8">
        <div className="min-w-[320px]">
          <StackedBar
            series={data ? [
              { name: 'Recebido', value: data.cashflow.received, color: '#10b981' },
              { name: 'Pendente', value: data.cashflow.pending, color: '#f59e0b' }
            ] : []}
            isLoading={isLoading}
          />
        </div>
        <div className="min-w-[320px]">
          <WeeklyBarChart
            data={data?.weekly_productivity || []}
            metric="appointments"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 mb-8">
        <ClinicRanking
          rows={data?.clinics_ranking || []}
          onRowClick={handleClinicClick}
          onSeeAll={handleClinicRankingSeeAll}
          isLoading={isLoading}
        />
        <DonutDistribution
          slices={data?.distribution || []}
          onSliceClick={handleDistributionClick}
          isLoading={isLoading}
        />
      </div>

      {/* Today Section */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <TodayList appointments={data?.today.appointments || []} isLoading={isLoading} />
        <ActivityFeed events={data?.today.activities || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
