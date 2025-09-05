# Configuração de Autenticação - Sistema Dra. Bruna

## Visão Geral

Este documento descreve como configurar e usar o sistema de autenticação implementado na Fase 3 do projeto.

## Funcionalidades Implementadas

### ✅ Autenticação Supabase
- Login com e-mail/senha
- Gestão de sessões seguras
- Renovação automática de tokens
- Logout seguro

### ✅ Sistema de Papéis
- **Admin**: Acesso total ao sistema

### ✅ Criptografia de Documentos
- AES-256-GCM para criptografia de arquivos
- PBKDF2 para derivação de chaves
- Verificação de integridade com SHA-256
- Proteção via DPAPI no Windows

### ✅ Sistema de Auditoria
- Log de todas as ações críticas
- Filtros por usuário, data e tipo de ação
- Exportação para CSV
- Interface de visualização

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Master Password for Document Encryption
VITE_MASTER_PASSWORD=your-secure-master-password

# Development Settings
VITE_APP_ENV=development
```

### 2. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure a autenticação por e-mail/senha
3. Crie a tabela `profiles`:

```sql
-- Tabela de perfis de usuário
CREATE TABLE profiles (
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

-- Política para permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Usuário de Demonstração

O sistema inclui um usuário de demonstração configurado:

| Papel | E-mail | Senha | Permissões |
|-------|--------|-------|------------|
| Admin | admin@drabruna.com | admin123 | Acesso total |

## Uso

### Login
1. Acesse a aplicação
2. Use as credenciais de demonstração (admin@drabruna.com / admin123)
3. O sistema redirecionará automaticamente após o login

### Criptografia de Documentos
- Todos os documentos são automaticamente criptografados ao fazer upload
- A descriptografia é transparente ao fazer download
- A chave mestra é derivada da senha configurada

### Logs de Auditoria
- Acesse "Logs de Auditoria" no menu lateral
- Filtre por usuário, data ou tipo de ação
- Exporte os logs para análise

## Segurança

### Implementações de Segurança

1. **DPAPI (Windows)**: Proteção de sessões usando Windows Data Protection API
2. **AES-256-GCM**: Criptografia de documentos com autenticação
3. **PBKDF2**: Derivação segura de chaves
4. **SHA-256**: Verificação de integridade de arquivos
5. **RLS**: Row Level Security no Supabase
6. **Auditoria**: Log completo de ações críticas

### Boas Práticas

1. **Senha Mestra**: Use uma senha forte e única
2. **Tokens**: Nunca exponha tokens de acesso
3. **Logs**: Monitore regularmente os logs de auditoria
4. **Backup**: Faça backup regular dos dados criptografados
5. **Atualizações**: Mantenha o sistema atualizado

## Troubleshooting

### Problemas Comuns

1. **Erro de Login**: Verifique as credenciais e configuração do Supabase
2. **Documentos não Criptografam**: Verifique a senha mestra
3. **Logs não Aparecem**: Verifique as permissões do usuário
4. **Sessão Expira**: O sistema renova automaticamente, mas pode falhar se offline

### Logs de Debug

Para debug, verifique o console do navegador e os logs do Tauri:

```bash
# Desenvolvimento
npm run tauri:dev

# Build
npm run tauri:build
```

## Próximos Passos

1. **Configuração de Produção**: Configure variáveis de ambiente seguras
2. **Backup**: Implemente backup automático de dados criptografados
3. **Monitoramento**: Configure alertas para ações suspeitas
4. **Testes**: Execute testes de segurança regulares

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs de auditoria
2. Consulte a documentação do Supabase
3. Verifique as configurações de segurança
4. Entre em contato com a equipe de desenvolvimento
