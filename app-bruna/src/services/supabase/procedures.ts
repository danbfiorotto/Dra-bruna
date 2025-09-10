import { supabase } from '../supabase';
import { 
  Procedure, 
  ProcedureExecution, 
  CreateProcedureData, 
  UpdateProcedureData,
  CreateProcedureExecutionData,
  UpdateProcedureExecutionData
} from '../../types/procedure';

export class ProceduresService {
  // Procedures
  static async getProcedures(): Promise<Procedure[]> {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar procedimentos:', error);
      throw error;
    }

    return data || [];
  }

  static async getProcedure(id: string): Promise<Procedure | null> {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  static async createProcedure(procedureData: CreateProcedureData): Promise<Procedure> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('procedures')
      .insert([{
        ...procedureData,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar procedimento: ${error.message}`);
    }

    return data;
  }

  static async updateProcedure(id: string, procedureData: UpdateProcedureData): Promise<Procedure> {
    const { data, error } = await supabase
      .from('procedures')
      .update(procedureData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar procedimento: ${error.message}`);
    }

    return data;
  }

  static async deleteProcedure(id: string): Promise<void> {
    const { error } = await supabase
      .from('procedures')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar procedimento: ${error.message}`);
    }
  }

  // Procedure Executions
  static async getProcedureExecutions(): Promise<ProcedureExecution[]> {
    const { data, error } = await supabase
      .from('procedure_executions')
      .select(`
        *,
        procedure:procedures(*),
        appointment:appointments(
          id,
          appointment_date,
          start_time,
          patient:patients(id, name)
        )
      `)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar execuções de procedimentos:', error);
      throw error;
    }

    return data || [];
  }

  static async getProcedureExecutionsByAppointment(appointmentId: string): Promise<ProcedureExecution[]> {
    const { data, error } = await supabase
      .from('procedure_executions')
      .select(`
        *,
        procedure:procedures(*)
      `)
      .eq('appointment_id', appointmentId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar execuções de procedimentos da consulta:', error);
      throw error;
    }

    return data || [];
  }

  static async getProcedureExecution(id: string): Promise<ProcedureExecution | null> {
    const { data, error } = await supabase
      .from('procedure_executions')
      .select(`
        *,
        procedure:procedures(*),
        appointment:appointments(
          id,
          appointment_date,
          start_time,
          patient:patients(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  static async createProcedureExecution(executionData: CreateProcedureExecutionData): Promise<ProcedureExecution> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('procedure_executions')
      .insert([{
        ...executionData,
        user_id: user.id
      }])
      .select(`
        *,
        procedure:procedures(*),
        appointment:appointments(
          id,
          appointment_date,
          start_time,
          patient:patients(id, name)
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar execução de procedimento: ${error.message}`);
    }

    return data;
  }

  static async updateProcedureExecution(id: string, executionData: UpdateProcedureExecutionData): Promise<ProcedureExecution> {
    const { data, error } = await supabase
      .from('procedure_executions')
      .update(executionData)
      .eq('id', id)
      .select(`
        *,
        procedure:procedures(*),
        appointment:appointments(
          id,
          appointment_date,
          start_time,
          patient:patients(id, name)
        )
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar execução de procedimento: ${error.message}`);
    }

    return data;
  }

  static async deleteProcedureExecution(id: string): Promise<void> {
    const { error } = await supabase
      .from('procedure_executions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar execução de procedimento: ${error.message}`);
    }
  }

  // Get procedures by category
  static async getProceduresByCategory(): Promise<Record<string, Procedure[]>> {
    const procedures = await this.getProcedures();
    
    return procedures.reduce((acc, procedure) => {
      if (!acc[procedure.category]) {
        acc[procedure.category] = [];
      }
      acc[procedure.category].push(procedure);
      return acc;
    }, {} as Record<string, Procedure[]>);
  }

  // Get procedure executions by date range
  static async getProcedureExecutionsByDateRange(startDate: string, endDate: string): Promise<ProcedureExecution[]> {
    const { data, error } = await supabase
      .from('procedure_executions')
      .select(`
        *,
        procedure:procedures(*),
        appointment:appointments(
          id,
          appointment_date,
          start_time,
          patient:patients(id, name)
        )
      `)
      .gte('performed_at', startDate)
      .lte('performed_at', endDate)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar execuções de procedimentos por período:', error);
      throw error;
    }

    return data || [];
  }
}
