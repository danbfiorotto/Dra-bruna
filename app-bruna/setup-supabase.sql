-- Script para configurar o Supabase com todas as tabelas necessárias
-- Execute este script no SQL Editor do Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types (only if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sync_status') THEN
        CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict', 'error');
    END IF;
END $$;

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending'
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending'
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    content_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending'
);

-- Document content table (encrypted)
CREATE TABLE IF NOT EXISTS public.document_content (
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE PRIMARY KEY,
    encrypted_content BYTEA NOT NULL,
    nonce BYTEA NOT NULL,
    tag BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync status table
CREATE TABLE IF NOT EXISTS public.sync_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_type TEXT NOT NULL, -- 'full' or 'incremental'
    status TEXT NOT NULL,
    records_synced INTEGER DEFAULT 0,
    errors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_sync_status ON public.patients(sync_status);
CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON public.patients(updated_at);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_sync_status ON public.appointments(sync_status);
CREATE INDEX IF NOT EXISTS idx_appointments_updated_at ON public.appointments(updated_at);

CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_appointment_id ON public.documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_documents_sync_status ON public.documents(sync_status);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON public.documents(updated_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_sync_status_table_name ON public.sync_status(table_name);
CREATE INDEX IF NOT EXISTS idx_sync_status_created_at ON public.sync_status(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients (temporarily allow all for testing)
DROP POLICY IF EXISTS "Allow all for patients" ON public.patients;
CREATE POLICY "Allow all for patients" ON public.patients
    FOR ALL USING (true);

-- RLS Policies for appointments (temporarily allow all for testing)
DROP POLICY IF EXISTS "Allow all for appointments" ON public.appointments;
CREATE POLICY "Allow all for appointments" ON public.appointments
    FOR ALL USING (true);

-- RLS Policies for documents (temporarily allow all for testing)
DROP POLICY IF EXISTS "Allow all for documents" ON public.documents;
CREATE POLICY "Allow all for documents" ON public.documents
    FOR ALL USING (true);

-- RLS Policies for document_content (temporarily allow all for testing)
DROP POLICY IF EXISTS "Allow all for document content" ON public.document_content;
CREATE POLICY "Allow all for document content" ON public.document_content
    FOR ALL USING (true);

-- RLS Policies for audit_logs (temporarily allow all for testing)
DROP POLICY IF EXISTS "Allow all for audit logs" ON public.audit_logs;
CREATE POLICY "Allow all for audit logs" ON public.audit_logs
    FOR ALL USING (true);

-- RLS Policies for sync_status (temporarily allow all for testing)
DROP POLICY IF EXISTS "Allow all for sync status" ON public.sync_status;
CREATE POLICY "Allow all for sync status" ON public.sync_status
    FOR ALL USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon role for testing
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
