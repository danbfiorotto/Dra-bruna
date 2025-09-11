import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardService } from '../services/supabase/dashboard';
import { DashboardData, DashboardFilters, DashboardState, AlertData } from '../types/dashboard';
import { useClinics } from './useClinics';

const DEFAULT_FILTERS: DashboardFilters = {
  period: 'month',
  clinics: []
};

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    data: null,
    filters: DEFAULT_FILTERS,
    isLoading: true,
    error: null,
    alerts: []
  });

  const { clinics, isLoading: clinicsLoading } = useClinics();

  // Load dashboard data
  const loadDashboardData = useCallback(async (filters: DashboardFilters) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data = await DashboardService.getDashboardData(filters);
      
      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        error: null
      }));

      // Generate alerts based on data
      const alerts = generateAlerts(data);
      setState(prev => ({ ...prev, alerts }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard'
      }));
    }
  }, []);

  // Update filters and reload data
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    loadDashboardData(updatedFilters);
  }, [state.filters, loadDashboardData]);

  // Export data
  const exportData = useCallback(async (format: 'csv' | 'pdf') => {
    try {
      // This would integrate with the PDF generator service
      console.log(`Exporting dashboard data as ${format}`);
      // Implementation would depend on the specific export requirements
    } catch (error) {
      console.error('Error exporting data:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao exportar dados'
      }));
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    loadDashboardData(state.filters);
  }, [state.filters, loadDashboardData]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadDashboardData(state.filters);
  }, []);

  // Memoized computed values
  const computedValues = useMemo(() => {
    if (!state.data) return null;

    const { kpis, cashflow, weekly_productivity, clinics_ranking } = state.data;

    return {
      // Financial metrics
      totalRevenue: kpis.revenue_total,
      avgTicket: kpis.avg_ticket,
      receivedAmount: kpis.received,
      pendingAmount: kpis.pending,
      inadimplencia: cashflow.inadimplencia,
      
      // Operational metrics
      totalAppointments: kpis.appointments_done,
      confirmationRate: kpis.confirmation_rate,
      uniquePatients: kpis.unique_patients,
      pendingCharts: kpis.pending_charts,
      
      // Productivity metrics
      weeklyData: weekly_productivity,
      topClinic: clinics_ranking[0],
      
      // Deltas
      revenueDelta: kpis.deltas.revenue_total,
      ticketDelta: kpis.deltas.avg_ticket,
      appointmentsDelta: kpis.deltas.appointments_done
    };
  }, [state.data]);

  // Available clinics for filters
  const availableClinics = useMemo(() => {
    return clinics.map(clinic => ({
      id: clinic.id,
      name: clinic.name
    }));
  }, [clinics]);

  return {
    // State
    data: state.data,
    filters: state.filters,
    isLoading: state.isLoading || clinicsLoading,
    error: state.error,
    alerts: state.alerts,
    
    // Computed values
    computedValues,
    availableClinics,
    
    // Actions
    updateFilters,
    exportData,
    refreshData,
    loadDashboardData
  };
};

// Helper function to generate consolidated alerts
function generateAlerts(data: DashboardData): AlertData[] {
  const alerts: AlertData[] = [];
  const messages: string[] = [];

  // Check for pending charts
  if (data.kpis.pending_charts > 0) {
    messages.push(`• Há ${data.kpis.pending_charts} prontuários aguardando finalização.`);
  }

  // Check for high pending amounts
  if (data.kpis.pending > 1000) {
    messages.push(`• Há R$ ${data.kpis.pending.toLocaleString('pt-BR')} em valores pendentes.`);
  }

  // Check for low confirmation rate
  if (data.kpis.confirmation_rate < 0.7) {
    messages.push(`• Taxa de confirmação está em ${(data.kpis.confirmation_rate * 100).toFixed(1)}%. Considere melhorar o processo de confirmação.`);
  }

  // Check for low occupancy on specific days
  const lowOccupancyDays = data.weekly_productivity.filter(day => day.occupancy < 0.5);
  if (lowOccupancyDays.length > 0) {
    messages.push(`• Alguns dias da semana apresentam ocupação baixa. Considere campanhas promocionais.`);
  }

  // Create consolidated alert if there are any messages
  if (messages.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Avisos do Sistema',
      message: messages.join(' ')
    });
  }

  return alerts;
}
