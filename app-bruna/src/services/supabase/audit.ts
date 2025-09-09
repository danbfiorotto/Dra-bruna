import { supabase } from '../supabase';

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export class AuditService {
  // Buscar logs de auditoria
  static async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Buscar log por ID
  static async getAuditLog(id: string): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar logs por usuário
  static async getAuditLogsByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Buscar logs por ação
  static async getAuditLogsByAction(action: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Buscar logs por tipo de recurso
  static async getAuditLogsByResourceType(resourceType: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Buscar logs por período
  static async getAuditLogsByPeriod(startDate: string, endDate: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar logs recentes (últimas 24 horas)
  static async getRecentAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Exportar logs para CSV
  static async exportAuditLogsToCSV(filters: AuditLogFilters = {}): Promise<string> {
    const logs = await this.getAuditLogs(filters);
    
    // Cabeçalho CSV
    const headers = [
      'ID',
      'Usuário',
      'Email',
      'Ação',
      'Tipo de Recurso',
      'ID do Recurso',
      'IP',
      'User Agent',
      'Data/Hora'
    ];

    // Dados CSV
    const rows = logs.map(log => [
      log.id,
      log.user_id || '',
      log.user_email || '',
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.ip_address || '',
      log.user_agent || '',
      new Date(log.created_at).toLocaleString('pt-BR')
    ]);

    // Gerar CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Estatísticas de auditoria
  static async getAuditStats(): Promise<{
    total_logs: number;
    logs_today: number;
    logs_this_week: number;
    logs_this_month: number;
    top_actions: Array<{ action: string; count: number }>;
    top_users: Array<{ user_email: string; count: number }>;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total de logs
    const { count: totalLogs } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    // Logs de hoje
    const { count: logsToday } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Logs desta semana
    const { count: logsThisWeek } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Logs deste mês
    const { count: logsThisMonth } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString());

    // Top ações
    const { data: topActions } = await supabase
      .from('audit_logs')
      .select('action')
      .gte('created_at', monthAgo.toISOString());

    const actionCounts = topActions?.reduce((acc: any, log: any) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topActionsArray = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count: count as number }))
      .sort((a: any, b: any) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    // Top usuários
    const { data: topUsers } = await supabase
      .from('audit_logs')
      .select('user_email')
      .gte('created_at', monthAgo.toISOString())
      .not('user_email', 'is', null);

    const userCounts = topUsers?.reduce((acc: any, log: any) => {
      acc[log.user_email] = (acc[log.user_email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topUsersArray = Object.entries(userCounts)
      .map(([user_email, count]) => ({ user_email, count: count as number }))
      .sort((a: any, b: any) => (b.count as number) - (a.count as number))
      .slice(0, 10);

    return {
      total_logs: totalLogs || 0,
      logs_today: logsToday || 0,
      logs_this_week: logsThisWeek || 0,
      logs_this_month: logsThisMonth || 0,
      top_actions: topActionsArray,
      top_users: topUsersArray
    };
  }

  // Limpar logs antigos (manter apenas últimos 6 meses)
  static async cleanOldLogs(): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', sixMonthsAgo.toISOString());

    if (error) throw error;
    
    // Para obter o count, fazemos uma consulta separada
    const { count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', sixMonthsAgo.toISOString());

    if (error) throw error;
    return count || 0;
  }
}
