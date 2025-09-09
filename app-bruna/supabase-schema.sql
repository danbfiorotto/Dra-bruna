-- Supabase Schema for Sistema Dra. Bruna
-- This schema defines the database structure for the cloud sync functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sequência global de revisões para sincronização híbrida
CREATE SEQUENCE IF NOT EXISTS public.rev_seq START 1;

-- Função para obter próximo rev
CREATE OR REPLACE FUNCTION get_next_rev() RETURNS BIGINT AS $$
BEGIN
    RETURN nextval('public.rev_seq');
END;
$$ LANGUAGE plpgsql;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict', 'error');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'doctor',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE public.patients (
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
    sync_status sync_status DEFAULT 'pending',
    -- Campos de sincronização híbrida
    rev BIGINT DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_editor TEXT,
    last_pulled_rev BIGINT DEFAULT 0
);

-- Appointments table
CREATE TABLE public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending',
    -- Campos de sincronização híbrida
    rev BIGINT DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_editor TEXT,
    last_pulled_rev BIGINT DEFAULT 0
);

-- Documents table
CREATE TABLE public.documents (
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
    sync_status sync_status DEFAULT 'pending',
    -- Campos de sincronização híbrida
    rev BIGINT DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_editor TEXT,
    last_pulled_rev BIGINT DEFAULT 0
);

-- Document content table (encrypted)
CREATE TABLE public.document_content (
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE PRIMARY KEY,
    encrypted_content BYTEA NOT NULL,
    nonce BYTEA NOT NULL,
    tag BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
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
CREATE TABLE public.sync_status (
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
CREATE INDEX idx_patients_name ON public.patients(name);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_patients_sync_status ON public.patients(sync_status);
CREATE INDEX idx_patients_updated_at ON public.patients(updated_at);
-- Índices para sincronização híbrida
CREATE INDEX idx_patients_rev ON public.patients(rev);
CREATE INDEX idx_patients_deleted_at ON public.patients(deleted_at);
CREATE INDEX idx_patients_last_editor ON public.patients(last_editor);

CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_sync_status ON public.appointments(sync_status);
CREATE INDEX idx_appointments_updated_at ON public.appointments(updated_at);
-- Índices para sincronização híbrida
CREATE INDEX idx_appointments_rev ON public.appointments(rev);
CREATE INDEX idx_appointments_deleted_at ON public.appointments(deleted_at);
CREATE INDEX idx_appointments_last_editor ON public.appointments(last_editor);

CREATE INDEX idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX idx_documents_appointment_id ON public.documents(appointment_id);
CREATE INDEX idx_documents_sync_status ON public.documents(sync_status);
CREATE INDEX idx_documents_updated_at ON public.documents(updated_at);
-- Índices para sincronização híbrida
CREATE INDEX idx_documents_rev ON public.documents(rev);
CREATE INDEX idx_documents_deleted_at ON public.documents(deleted_at);
CREATE INDEX idx_documents_last_editor ON public.documents(last_editor);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX idx_sync_status_table_name ON public.sync_status(table_name);
CREATE INDEX idx_sync_status_created_at ON public.sync_status(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for patients (admin and doctor can access all, others can view only)
CREATE POLICY "Admin and doctor can manage patients" ON public.patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

CREATE POLICY "Other users can view patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('nurse', 'receptionist')
        )
    );

-- RLS Policies for appointments
CREATE POLICY "Admin and doctor can manage appointments" ON public.appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

CREATE POLICY "Other users can view appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('nurse', 'receptionist')
        )
    );

-- RLS Policies for documents
CREATE POLICY "Admin and doctor can manage documents" ON public.documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

CREATE POLICY "Other users can view documents" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('nurse', 'receptionist')
        )
    );

-- RLS Policies for document_content
CREATE POLICY "Admin and doctor can manage document content" ON public.document_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

-- RLS Policies for audit_logs
CREATE POLICY "Admin can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for sync_status
CREATE POLICY "Admin can manage sync status" ON public.sync_status
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para incrementar rev automaticamente
CREATE OR REPLACE FUNCTION increment_rev_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.rev = get_next_rev();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para converter DELETE em soft delete
CREATE OR REPLACE FUNCTION soft_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Em vez de deletar, marca como deleted_at
    UPDATE public.patients 
    SET deleted_at = NOW(), rev = get_next_rev()
    WHERE id = OLD.id;
    RETURN NULL; -- Cancela o DELETE
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para incrementar rev automaticamente
CREATE TRIGGER increment_patients_rev BEFORE INSERT OR UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION increment_rev_column();

CREATE TRIGGER increment_appointments_rev BEFORE INSERT OR UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION increment_rev_column();

CREATE TRIGGER increment_documents_rev BEFORE INSERT OR UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION increment_rev_column();

-- Triggers para prevenir hard delete (converter em soft delete)
CREATE TRIGGER prevent_patients_hard_delete BEFORE DELETE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION soft_delete_trigger();

-- Função similar para appointments
CREATE OR REPLACE FUNCTION soft_delete_appointments_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.appointments 
    SET deleted_at = NOW(), rev = get_next_rev()
    WHERE id = OLD.id;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_appointments_hard_delete BEFORE DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION soft_delete_appointments_trigger();

-- Função similar para documents
CREATE OR REPLACE FUNCTION soft_delete_documents_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.documents 
    SET deleted_at = NOW(), rev = get_next_rev()
    WHERE id = OLD.id;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_documents_hard_delete BEFORE DELETE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION soft_delete_documents_trigger();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'doctor'::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get sync status
CREATE OR REPLACE FUNCTION public.get_sync_status()
RETURNS TABLE (
    table_name TEXT,
    last_sync TIMESTAMP WITH TIME ZONE,
    total_records BIGINT,
    pending_sync BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'patients'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'patients' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.patients),
        (SELECT COUNT(*) FROM public.patients WHERE sync_status = 'pending')
    UNION ALL
    SELECT 
        'appointments'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'appointments' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.appointments),
        (SELECT COUNT(*) FROM public.appointments WHERE sync_status = 'pending')
    UNION ALL
    SELECT 
        'documents'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'documents' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.documents),
        (SELECT COUNT(*) FROM public.documents WHERE sync_status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert initial admin user (this should be done through the app, but here for reference)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@drabruna.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );
