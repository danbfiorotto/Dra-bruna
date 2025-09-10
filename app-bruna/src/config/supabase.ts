import { createClient } from '@supabase/supabase-js';

// Supabase configuration for the Tauri app
export const SUPABASE_CONFIG = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://yzegxffboezduzqbrrfv.supabase.co',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZWd4ZmZib2V6ZHV6cWJycmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTYyMTEsImV4cCI6MjA3MjQ5MjIxMX0.L5nffqlwK6cWYjyZKywrCVmd124emU7sDizDcHpcC9M',
  masterPassword: (import.meta as any).env?.VITE_MASTER_PASSWORD || '03151731.Bts'
};

// Cliente Supabase
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseAuthResponse {
  user: SupabaseUser;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface DatabaseStatus {
  initialized: boolean;
  patients_count: number;
  appointments_count: number;
  documents_count: number;
  total_records: number;
}

export interface SyncStatus {
  table_name: string;
  last_sync: string | null;
  total_records: number;
  pending_sync: number;
}
