// Authentication configuration
export const AUTH_CONFIG = {
  // Supabase configuration (APENAS ANON KEY - NUNCA SERVICE ROLE)
  supabase: {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here',
  },
  
  // Master password for document encryption
  masterPassword: (import.meta as any).env?.VITE_MASTER_PASSWORD || 'DraBrunaClinic2024!DefaultPassword',
  
  // Session configuration
  session: {
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxRetries: 3,
  },
  
  // Demo user for testing
  demoUser: {
    email: 'admin@drabruna.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  
  // App configuration
  app: {
    name: 'Sistema Dra. Bruna',
    version: '1.0.0',
    environment: (import.meta as any).env?.VITE_APP_ENV || 'development',
  },
};

// Permission definitions
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Patients
  VIEW_PATIENTS: 'view_patients',
  CREATE_PATIENT: 'create_patient',
  UPDATE_PATIENT: 'update_patient',
  DELETE_PATIENT: 'delete_patient',
  
  // Appointments
  VIEW_APPOINTMENTS: 'view_appointments',
  CREATE_APPOINTMENT: 'create_appointment',
  UPDATE_APPOINTMENT: 'update_appointment',
  DELETE_APPOINTMENT: 'delete_appointment',
  
  // Documents
  VIEW_DOCUMENTS: 'view_documents',
  CREATE_DOCUMENT: 'create_document',
  DELETE_DOCUMENT: 'delete_document',
  
  // Medical Records
  VIEW_MEDICAL_RECORDS: 'view_medical_records',
  CREATE_MEDICAL_RECORD: 'create_medical_record',
  UPDATE_MEDICAL_RECORD: 'update_medical_record',
  
  // Financial
  VIEW_FINANCIAL: 'view_financial',
  CREATE_FINANCIAL_RECORD: 'create_financial_record',
  UPDATE_FINANCIAL_RECORD: 'update_financial_record',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Sync
  VIEW_SYNC: 'view_sync',
  MANAGE_SYNC: 'manage_sync',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Audit Logs
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  EXPORT_AUDIT_LOGS: 'export_audit_logs',
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS), // Admin has all permissions
};
