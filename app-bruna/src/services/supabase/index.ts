import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente Supabase real
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Exportar serviços
export { PatientsService } from './patients';
export { AppointmentsService } from './appointments';
export { ClinicsService } from './clinics';
export { DocumentsService } from './documents';
export { FinancialService } from './financial';
export { MedicalRecordsService } from './medicalRecords';
export { AuditService } from './audit';

// Exportar tipos
export type { FinancialTransaction, FinancialCategory, MonthlyFinancialSummary } from './financial';
export type { AuditLog, AuditLogFilters } from './audit';