-- Migration: Add Clinics and update Appointments schema
-- This migration adds the clinics table and updates appointments to support clinics

-- Create clinics table
CREATE TABLE public.clinics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending',
    -- Campos de sincronização híbrida
    rev BIGINT DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_editor TEXT,
    last_pulled_rev BIGINT DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Add clinic_id to appointments table
ALTER TABLE public.appointments 
ADD COLUMN clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL;

-- Add new columns to appointments table to match the frontend structure
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS appointment_date DATE,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing appointments to use new column names
UPDATE public.appointments 
SET appointment_date = date, start_time = time, end_time = time
WHERE appointment_date IS NULL;

-- Make appointment_date and start_time NOT NULL after data migration
ALTER TABLE public.appointments 
ALTER COLUMN appointment_date SET NOT NULL,
ALTER COLUMN start_time SET NOT NULL;

-- Add default values for new columns
UPDATE public.appointments 
SET title = 'Consulta - ' || (SELECT name FROM public.patients WHERE id = appointments.patient_id)
WHERE title IS NULL;

-- Create medical_records table
CREATE TABLE public.medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    anamnesis TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'pending',
    -- Campos de sincronização híbrida
    rev BIGINT DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_editor TEXT,
    last_pulled_rev BIGINT DEFAULT 0
);

-- Update documents table to match frontend structure
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_data TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing documents to use new column names
UPDATE public.documents 
SET file_name = filename, mime_type = file_type, storage_path = filename
WHERE file_name IS NULL;

-- Create indexes for new tables and columns
CREATE INDEX idx_clinics_name ON public.clinics(name);
CREATE INDEX idx_clinics_user_id ON public.clinics(user_id);
CREATE INDEX idx_clinics_sync_status ON public.clinics(sync_status);
CREATE INDEX idx_clinics_updated_at ON public.clinics(updated_at);
CREATE INDEX idx_clinics_rev ON public.clinics(rev);
CREATE INDEX idx_clinics_deleted_at ON public.clinics(deleted_at);
CREATE INDEX idx_clinics_last_editor ON public.clinics(last_editor);

CREATE INDEX idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX idx_appointments_appointment_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);

CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);
CREATE INDEX idx_medical_records_created_by ON public.medical_records(created_by);
CREATE INDEX idx_medical_records_sync_status ON public.medical_records(sync_status);
CREATE INDEX idx_medical_records_updated_at ON public.medical_records(updated_at);
CREATE INDEX idx_medical_records_rev ON public.medical_records(rev);
CREATE INDEX idx_medical_records_deleted_at ON public.medical_records(deleted_at);
CREATE INDEX idx_medical_records_last_editor ON public.medical_records(last_editor);

CREATE INDEX idx_documents_title ON public.documents(title);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);

-- Enable RLS for new tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinics
CREATE POLICY "Users can view own clinics" ON public.clinics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own clinics" ON public.clinics
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for medical_records
CREATE POLICY "Admin and doctor can manage medical records" ON public.medical_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'doctor')
        )
    );

CREATE POLICY "Other users can view medical records" ON public.medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('nurse', 'receptionist')
        )
    );

-- Triggers for new tables
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER increment_clinics_rev BEFORE INSERT OR UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION increment_rev_column();

CREATE TRIGGER increment_medical_records_rev BEFORE INSERT OR UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION increment_rev_column();

-- Soft delete triggers for new tables
CREATE OR REPLACE FUNCTION soft_delete_clinics_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.clinics 
    SET deleted_at = NOW(), rev = get_next_rev()
    WHERE id = OLD.id;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION soft_delete_medical_records_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.medical_records 
    SET deleted_at = NOW(), rev = get_next_rev()
    WHERE id = OLD.id;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_clinics_hard_delete BEFORE DELETE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION soft_delete_clinics_trigger();

CREATE TRIGGER prevent_medical_records_hard_delete BEFORE DELETE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION soft_delete_medical_records_trigger();

-- Update sync status function to include new tables
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
        (SELECT COUNT(*) FROM public.patients WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.patients WHERE sync_status = 'pending' AND deleted_at IS NULL)
    UNION ALL
    SELECT 
        'appointments'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'appointments' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.appointments WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.appointments WHERE sync_status = 'pending' AND deleted_at IS NULL)
    UNION ALL
    SELECT 
        'documents'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'documents' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.documents WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.documents WHERE sync_status = 'pending' AND deleted_at IS NULL)
    UNION ALL
    SELECT 
        'clinics'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'clinics' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.clinics WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.clinics WHERE sync_status = 'pending' AND deleted_at IS NULL)
    UNION ALL
    SELECT 
        'medical_records'::TEXT,
        (SELECT last_sync FROM public.sync_status WHERE table_name = 'medical_records' ORDER BY created_at DESC LIMIT 1),
        (SELECT COUNT(*) FROM public.medical_records WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM public.medical_records WHERE sync_status = 'pending' AND deleted_at IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for new tables
GRANT ALL ON public.clinics TO authenticated;
GRANT ALL ON public.medical_records TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
