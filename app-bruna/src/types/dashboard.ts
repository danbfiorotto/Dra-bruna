export interface DashboardFilters {
  period: 'today' | 'week' | 'month' | 'last_month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  clinics: string[];
}

export interface DashboardKPIs {
  revenue_total: number;
  avg_ticket: number;
  received: number;
  pending: number;
  appointments_done: number;
  confirmation_rate: number;
  unique_patients: number;
  pending_charts: number;
  deltas: {
    revenue_total: number;
    avg_ticket: number;
    received: number;
    pending: number;
    appointments_done: number;
    confirmation_rate: number;
    unique_patients: number;
    pending_charts: number;
  };
}

export interface CashflowData {
  received: number;
  pending: number;
  forecast_next_30d: number;
  inadimplencia: number;
}

export interface WeeklyProductivityData {
  date: string;
  appointments: number;
  revenue: number;
  occupancy: number;
  cancellations: number;
  no_shows: number;
}

export interface ClinicRankingData {
  clinic_id: string;
  name: string;
  revenue: number;
  avg_ticket: number;
  appointments: number;
  delta: number;
}

export interface TodayAppointment {
  id: string;
  time: string;
  patient: string;
  clinic: string;
  procedure: string;
  status: 'Confirmada' | 'Pendente' | 'Aguardando' | 'Pago';
  amount: number;
}

export interface ActivityEvent {
  type: 'patient.created' | 'appointment.completed' | 'payment.registered' | 'document.sent';
  title: string;
  by: string;
  ago: string;
  details?: string;
}

export interface TodayData {
  appointments: TodayAppointment[];
  activities: ActivityEvent[];
}

export interface ClinicDistribution {
  clinic: string;
  revenue: number;
  share: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  cashflow: CashflowData;
  weekly_productivity: WeeklyProductivityData[];
  clinics_ranking: ClinicRankingData[];
  today: TodayData;
  distribution: ClinicDistribution[];
}

export interface SparklineData {
  data: number[];
  period: '7d' | '30d';
}

export interface KpiCardProps {
  label: string;
  value: number | string;
  delta?: number;
  suffix?: string;
  sparklineData?: SparklineData;
  onClick?: () => void;
  isLoading?: boolean;
}

export interface DashboardFiltersProps {
  value: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  clinics: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export interface StackedBarProps {
  series: Array<{ name: string; value: number; color?: string }>;
  onSegmentClick?: (segment: string) => void;
  isLoading?: boolean;
}

export interface WeeklyBarChartProps {
  data: WeeklyProductivityData[];
  metric: 'appointments' | 'revenue';
  onBarClick?: (date: string) => void;
  isLoading?: boolean;
}

export interface ClinicRankingProps {
  rows: ClinicRankingData[];
  onRowClick?: (clinicId: string) => void;
  onSeeAll?: () => void;
  isLoading?: boolean;
}

export interface TodayListProps {
  appointments: TodayAppointment[];
  isLoading?: boolean;
}

export interface ActivityFeedProps {
  events: ActivityEvent[];
  isLoading?: boolean;
}

export interface DonutDistributionProps {
  slices: ClinicDistribution[];
  onSliceClick?: (clinic: string) => void;
  isLoading?: boolean;
}

export interface AlertData {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DashboardState {
  data: DashboardData | null;
  filters: DashboardFilters;
  isLoading: boolean;
  error: string | null;
  alerts: AlertData[];
}
