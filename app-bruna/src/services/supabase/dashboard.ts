import { supabase } from '../../config/supabase';
import { DashboardData, DashboardFilters, DashboardKPIs, CashflowData, WeeklyProductivityData, ClinicRankingData, TodayData, ClinicDistribution } from '../../types/dashboard';

export class DashboardService {
  // Get dashboard overview data
  static async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    const { startDate, endDate } = this.getDateRange(filters);
    
    // Execute all queries in parallel for better performance
    const [
      kpis,
      cashflow,
      weeklyProductivity,
      clinicsRanking,
      todayData,
      distribution
    ] = await Promise.all([
      this.getKPIs(startDate, endDate, filters.clinics),
      this.getCashflowData(startDate, endDate, filters.clinics),
      this.getWeeklyProductivity(startDate, endDate, filters.clinics),
      this.getClinicsRanking(startDate, endDate, filters.clinics),
      this.getTodayData(filters.clinics),
      this.getClinicDistribution(startDate, endDate, filters.clinics)
    ]);

    return {
      kpis,
      cashflow,
      weekly_productivity: weeklyProductivity,
      clinics_ranking: clinicsRanking,
      today: todayData,
      distribution
    };
  }

  // Get KPIs data
  private static async getKPIs(startDate: string, endDate: string, clinicIds: string[]): Promise<DashboardKPIs> {
    // Get current period data
    const currentData = await this.getKPIsForPeriod(startDate, endDate, clinicIds);
    
    // Get previous period data for deltas
    const previousStartDate = this.getPreviousPeriodStartDate(startDate, endDate);
    const previousEndDate = this.getPreviousPeriodEndDate(startDate, endDate);
    const previousData = await this.getKPIsForPeriod(previousStartDate, previousEndDate, clinicIds);

    // Calculate deltas
    const deltas = {
      revenue_total: this.calculateDelta(currentData.revenue_total, previousData.revenue_total),
      avg_ticket: this.calculateDelta(currentData.avg_ticket, previousData.avg_ticket),
      received: this.calculateDelta(currentData.received, previousData.received),
      pending: this.calculateDelta(currentData.pending, previousData.pending),
      appointments_done: this.calculateDelta(currentData.appointments_done, previousData.appointments_done),
      confirmation_rate: this.calculateDelta(currentData.confirmation_rate, previousData.confirmation_rate),
      unique_patients: this.calculateDelta(currentData.unique_patients, previousData.unique_patients),
      pending_charts: this.calculateDelta(currentData.pending_charts, previousData.pending_charts)
    };

    return {
      ...currentData,
      deltas
    };
  }

  // Get KPIs for a specific period
  private static async getKPIsForPeriod(startDate: string, endDate: string, clinicIds: string[]): Promise<Omit<DashboardKPIs, 'deltas'>> {
    // Build clinic filter
    const clinicFilter = clinicIds.length > 0 ? `AND clinic_id = ANY(ARRAY[${clinicIds.map(id => `'${id}'`).join(',')}])` : '';

    // Get appointments data
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .rpc('get_appointments_stats', {
        start_date: startDate,
        end_date: endDate,
        clinic_filter: clinicFilter
      });

    if (appointmentsError) {
      console.error('Error fetching appointments stats:', appointmentsError);
      throw appointmentsError;
    }

    // Get financial data from budgets
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        total_value,
        status,
        created_at,
        medical_record:medical_records(
          appointment:appointments(
            clinic_id,
            appointment_date
          )
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (budgetsError) {
      console.error('Error fetching budgets data:', budgetsError);
      throw budgetsError;
    }

    // Calculate financial metrics
    const approvedBudgets = budgetsData?.filter(b => b.status === 'approved') || [];
    const revenue_total = approvedBudgets.reduce((sum, budget) => sum + budget.total_value, 0);
    const received = revenue_total * 0.8; // Simulate 80% received
    const pending = revenue_total * 0.2; // Simulate 20% pending

    // Get pending charts count
    const { data: pendingChartsData, error: pendingChartsError } = await supabase
      .rpc('get_pending_medical_records_count');
    
    if (pendingChartsError) {
      console.error('Error fetching pending charts count:', pendingChartsError);
      throw pendingChartsError;
    }

    return {
      revenue_total,
      avg_ticket: appointmentsData?.[0]?.appointments_done > 0 ? revenue_total / appointmentsData[0].appointments_done : 0,
      received,
      pending,
      appointments_done: appointmentsData?.[0]?.appointments_done || 0,
      confirmation_rate: appointmentsData?.[0]?.confirmation_rate || 0,
      unique_patients: appointmentsData?.[0]?.unique_patients || 0,
      pending_charts: pendingChartsData || 0
    };
  }

  // Get cashflow data
  private static async getCashflowData(startDate: string, endDate: string, clinicIds: string[]): Promise<CashflowData> {
    const kpis = await this.getKPIsForPeriod(startDate, endDate, clinicIds);
    
    // Get forecast data (simplified - would need more complex logic in real implementation)
    const forecast_next_30d = kpis.revenue_total * 0.3; // Simulate 30% of current revenue as forecast
    
    return {
      received: kpis.received,
      pending: kpis.pending,
      forecast_next_30d,
      inadimplencia: kpis.revenue_total > 0 ? kpis.pending / kpis.revenue_total : 0
    };
  }

  // Get weekly productivity data
  private static async getWeeklyProductivity(startDate: string, endDate: string, clinicIds: string[]): Promise<WeeklyProductivityData[]> {
    const { data, error } = await supabase
      .rpc('get_weekly_productivity', {
        start_date: startDate,
        end_date: endDate,
        clinic_filter: clinicIds.length > 0 ? `AND clinic_id = ANY(ARRAY[${clinicIds.map(id => `'${id}'`).join(',')}])` : ''
      });

    if (error) {
      console.error('Error fetching weekly productivity:', error);
      throw error;
    }

    return data || [];
  }

  // Get clinics ranking
  private static async getClinicsRanking(startDate: string, endDate: string, clinicIds: string[]): Promise<ClinicRankingData[]> {
    const { data, error } = await supabase
      .rpc('get_clinics_ranking', {
        start_date: startDate,
        end_date: endDate,
        clinic_filter: clinicIds.length > 0 ? `AND clinic_id = ANY(ARRAY[${clinicIds.map(id => `'${id}'`).join(',')}])` : ''
      });

    if (error) {
      console.error('Error fetching clinics ranking:', error);
      throw error;
    }

    return data || [];
  }

  // Get today's data
  private static async getTodayData(_clinicIds: string[]): Promise<TodayData> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        title,
        status,
        patient:patients(name),
        clinic:clinics(name)
      `)
      .eq('appointment_date', today)
      .order('start_time');

    if (appointmentsError) {
      console.error('Error fetching today appointments:', appointmentsError);
      throw appointmentsError;
    }

    // Get recent activities (simplified)
    const { data: activities, error: activitiesError } = await supabase
      .from('audit_logs')
      .select('action, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      throw activitiesError;
    }

    return {
      appointments: appointments?.map(apt => ({
        id: apt.id,
        time: apt.start_time,
        patient: (apt.patient as any)?.name || 'N/A',
        clinic: (apt.clinic as any)?.name || 'N/A',
        procedure: apt.title,
        status: this.mapAppointmentStatus(apt.status),
        amount: 0 // Would need to get from budget
      })) || [],
      activities: activities?.map(activity => ({
        type: 'patient.created' as const,
        title: this.mapActivityTitle(activity.action),
        by: 'Sistema',
        ago: this.getTimeAgo(activity.created_at)
      })) || []
    };
  }

  // Get clinic distribution
  private static async getClinicDistribution(startDate: string, endDate: string, clinicIds: string[]): Promise<ClinicDistribution[]> {
    const { data, error } = await supabase
      .rpc('get_clinic_distribution', {
        start_date: startDate,
        end_date: endDate,
        clinic_filter: clinicIds.length > 0 ? `AND clinic_id = ANY(ARRAY[${clinicIds.map(id => `'${id}'`).join(',')}])` : ''
      });

    if (error) {
      console.error('Error fetching clinic distribution:', error);
      throw error;
    }

    return data || [];
  }

  // Helper methods
  private static getDateRange(filters: DashboardFilters): { startDate: string; endDate: string } {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (filters.period) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return { startDate: weekStart.toISOString().split('T')[0], endDate: today };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: monthStart.toISOString().split('T')[0], endDate: today };
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: lastMonthStart.toISOString().split('T')[0], endDate: lastMonthEnd.toISOString().split('T')[0] };
      case 'custom':
        return { 
          startDate: filters.customStartDate || today, 
          endDate: filters.customEndDate || today 
        };
      default:
        return { startDate: today, endDate: today };
    }
  }

  private static getPreviousPeriodStartDate(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    return previousStart.toISOString().split('T')[0];
  }

  private static getPreviousPeriodEndDate(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    
    return previousEnd.toISOString().split('T')[0];
  }

  private static calculateDelta(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 1 : 0;
    return (current - previous) / previous;
  }

  private static mapAppointmentStatus(status: string): 'Confirmada' | 'Pendente' | 'Aguardando' | 'Pago' {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'scheduled': return 'Pendente';
      case 'completed': return 'Pago';
      default: return 'Aguardando';
    }
  }

  private static mapActivityTitle(action: string): string {
    switch (action) {
      case 'create_patient': return 'Novo paciente cadastrado';
      case 'complete_appointment': return 'Consulta finalizada';
      case 'create_budget': return 'Orçamento criado';
      default: return 'Ação realizada';
    }
  }

  private static getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'agora';
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }
}
