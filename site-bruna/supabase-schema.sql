-- =============================================================================
-- SCHEMA COMPLETO - SISTEMA DRA. BRUNA
-- =============================================================================
-- Este arquivo contém todas as tabelas, políticas e configurações necessárias
-- para o sistema de gestão clínica Dra. Bruna

-- =============================================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =============================================================================

-- Habilitar UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. TABELA DE PERFIS DE USUÁRIO
-- =============================================================================

-- Tabela de perfis (apenas admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. TABELA DE LEADS (FORMULÁRIO DE CONTATO)
-- =============================================================================

-- Tabela para leads do site
CREATE TABLE IF NOT EXISTS public.leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  utm JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para leads (apenas inserção via API)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política: apenas inserção via Service Role (API)
CREATE POLICY "Allow insert via service role" ON leads
  FOR INSERT WITH CHECK (true);

-- Política: apenas admins podem ver leads
CREATE POLICY "Admins can view leads" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- 4. TABELA DE LOGS DE AUDITORIA
-- =============================================================================

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política: inserção via Service Role
CREATE POLICY "Allow insert via service role" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- 5. STORAGE BUCKETS
-- =============================================================================

-- Bucket para assets públicos do site
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public_site',
  'public_site',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos privados (app)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. POLÍTICAS DE STORAGE
-- =============================================================================

-- Política para public_site (leitura pública)
CREATE POLICY "Public read site assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'public_site');

-- Política para public_site (upload apenas via Service Role)
CREATE POLICY "Service role can upload site assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'public_site');

-- Política para documents (acesso apenas para usuários autenticados)
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );

-- Política para documents (upload apenas para usuários autenticados)
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );

-- Política para documents (delete apenas para usuários autenticados)
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' 
    AND auth.role() = 'authenticated'
  );

-- =============================================================================
-- 7. FUNÇÕES AUXILIARES
-- =============================================================================

-- Função para criar log de auditoria
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_user_id UUID,
  p_user_email TEXT,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, user_email, action_type, entity_type, entity_id,
    description, ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_user_email, p_action_type, p_entity_type, p_entity_id,
    p_description, p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar logs antigos (manter apenas últimos 90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================================================
-- 9. CONFIGURAÇÕES DE SEGURANÇA
-- =============================================================================

-- Configurar CORS para o app
-- (Isso deve ser feito no painel do Supabase em Settings > API)

-- Configurar Rate Limiting
-- (Isso deve ser feito no painel do Supabase em Settings > API)

-- =============================================================================
-- 10. DADOS INICIAIS (OPCIONAL)
-- =============================================================================

-- Inserir usuário admin de demonstração (se necessário)
-- NOTA: O usuário deve ser criado primeiro no Supabase Auth
-- INSERT INTO public.profiles (id, email, name, role)
-- VALUES ('uuid-do-usuario-admin', 'admin@drabruna.com', 'Administrador', 'admin')
-- ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================
