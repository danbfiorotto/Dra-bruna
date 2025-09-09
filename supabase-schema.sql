-- =====================================================
-- SISTEMA DRA. BRUNA - ESQUEMA SUPABASE COMPLETO
-- =====================================================
-- Este arquivo contém todo o esquema necessário para
-- migrar o sistema para 100% online com Supabase
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TABELAS PRINCIPAIS
-- =====================================================

-- 2.1 PACIENTES
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2.2 AGENDAMENTOS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2.3 DOCUMENTOS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    storage_path TEXT NOT NULL, -- Caminho no Supabase Storage
    content_hash TEXT,
    encrypted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2.4 PRONTUÁRIOS MÉDICOS
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    anamnesis TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2.5 TRANSAÇÕES FINANCEIRAS
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2.6 CATEGORIAS FINANCEIRAS
CREATE TABLE financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 LOGS DE AUDITORIA
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para pacientes
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_created_at ON patients(created_at);

-- Índices para agendamentos
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);

-- Índices para documentos
CREATE INDEX idx_documents_patient_id ON documents(patient_id);
CREATE INDEX idx_documents_appointment_id ON documents(appointment_id);
CREATE INDEX idx_documents_filename ON documents(filename);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Índices para prontuários
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_appointment_id ON medical_records(appointment_id);
CREATE INDEX idx_medical_records_created_at ON medical_records(created_at);

-- Índices para transações financeiras
CREATE INDEX idx_financial_transactions_patient_id ON financial_transactions(patient_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_created_at ON financial_transactions(created_at);

-- Índices para auditoria
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes
CREATE POLICY "Users can view patients" ON patients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create patients" ON patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update patients" ON patients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete patients" ON patients
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para agendamentos
CREATE POLICY "Users can view appointments" ON appointments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create appointments" ON appointments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update appointments" ON appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete appointments" ON appointments
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para documentos
CREATE POLICY "Users can view documents" ON documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create documents" ON documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update documents" ON documents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete documents" ON documents
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para prontuários
CREATE POLICY "Users can view medical records" ON medical_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create medical records" ON medical_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update medical records" ON medical_records
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete medical records" ON medical_records
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para transações financeiras
CREATE POLICY "Users can view financial transactions" ON financial_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create financial transactions" ON financial_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update financial transactions" ON financial_transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete financial transactions" ON financial_transactions
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para categorias financeiras
CREATE POLICY "Users can view financial categories" ON financial_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage financial categories" ON financial_categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para logs de auditoria
CREATE POLICY "Users can view audit logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 5. TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON financial_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        user_email,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        auth.jwt() ->> 'email',
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
        ),
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers de auditoria para tabelas principais
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_medical_records AFTER INSERT OR UPDATE OR DELETE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_financial_transactions AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- 6. DADOS INICIAIS
-- =====================================================

-- Inserir categorias financeiras padrão
INSERT INTO financial_categories (name, type, description, color) VALUES
('Consultas', 'income', 'Receitas de consultas médicas', '#10B981'),
('Procedimentos', 'income', 'Receitas de procedimentos', '#3B82F6'),
('Produtos', 'income', 'Venda de produtos', '#8B5CF6'),
('Aluguel', 'expense', 'Aluguel do consultório', '#EF4444'),
('Equipamentos', 'expense', 'Compra de equipamentos', '#F59E0B'),
('Material', 'expense', 'Material de consumo', '#6B7280'),
('Marketing', 'expense', 'Gastos com marketing', '#EC4899'),
('Outros', 'expense', 'Outras despesas', '#9CA3AF');

-- =====================================================
-- 7. VIEWS ÚTEIS
-- =====================================================

-- View para agendamentos com dados do paciente
CREATE VIEW appointments_with_patient AS
SELECT 
    a.*,
    p.name as patient_name,
    p.phone as patient_phone,
    p.email as patient_email
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id;

-- View para resumo financeiro mensal
CREATE VIEW monthly_financial_summary AS
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM financial_transactions
GROUP BY DATE_TRUNC('month', transaction_date), type
ORDER BY month DESC;

-- View para estatísticas de pacientes
CREATE VIEW patient_stats AS
SELECT 
    COUNT(*) as total_patients,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_patients_30_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_patients_7_days
FROM patients;

-- =====================================================
-- 8. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para buscar pacientes por nome
CREATE OR REPLACE FUNCTION search_patients(search_term TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.email, p.phone, p.created_at
    FROM patients p
    WHERE p.name ILIKE '%' || search_term || '%'
       OR p.email ILIKE '%' || search_term || '%'
       OR p.phone ILIKE '%' || search_term || '%'
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_patients', (SELECT COUNT(*) FROM patients),
        'total_appointments', (SELECT COUNT(*) FROM appointments),
        'appointments_today', (SELECT COUNT(*) FROM appointments WHERE date = CURRENT_DATE),
        'monthly_revenue', (SELECT COALESCE(SUM(amount), 0) FROM financial_transactions WHERE type = 'income' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)),
        'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM financial_transactions WHERE type = 'expense' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE patients IS 'Tabela de pacientes da clínica';
COMMENT ON TABLE appointments IS 'Tabela de agendamentos';
COMMENT ON TABLE documents IS 'Tabela de documentos dos pacientes';
COMMENT ON TABLE medical_records IS 'Tabela de prontuários médicos';
COMMENT ON TABLE financial_transactions IS 'Tabela de transações financeiras';
COMMENT ON TABLE financial_categories IS 'Tabela de categorias financeiras';
COMMENT ON TABLE audit_logs IS 'Tabela de logs de auditoria';

-- =====================================================
-- FIM DO ESQUEMA
-- =====================================================
