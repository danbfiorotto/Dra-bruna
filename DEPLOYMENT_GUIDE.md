# Guia de Deploy - Sistema Dra. Bruna

## 🏗️ Arquitetura de Segurança

### Domínios
- **Site**: `drabruna.com.br` (Next.js - Marketing)
- **App**: `app.drabruna.com.br` (Tauri - Gestão)

### Regra de Ouro
> **Service Role NUNCA entra no browser!**

## 📁 Estrutura de Projetos

```
Site_Bruna/
├── site-bruna/          # Next.js (Marketing)
│   ├── .env.local       # Variáveis públicas do site
│   ├── .env             # Variáveis privadas do servidor (se houver API)
│   └── next.config.js   # Headers de segurança
├── app-bruna/           # Tauri (Gestão)
│   ├── .env             # Apenas anon key + master password
│   └── src-tauri/       # Backend Rust
└── supabase-schema.sql  # Schema completo do banco
```

## 🔐 Configuração de Segurança

### 1. Site Next.js (drabruna.com.br)

#### Variáveis Públicas (.env.local)
```env
NEXT_PUBLIC_SITE_URL=https://drabruna.com.br
NEXT_PUBLIC_APP_URL=https://app.drabruna.com.br
```

#### Variáveis Privadas (.env - servidor)
```env
# APENAS se tiver formulário de contato
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

#### Headers de Segurança
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Content-Security-Policy: Configurada
- ✅ Strict-Transport-Security: HSTS
- ✅ Permissions-Policy: Restritiva

### 2. App Tauri (app.drabruna.com.br)

#### Variáveis (.env)
```env
# APENAS anon key - NUNCA service role
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_MASTER_PASSWORD=your-secure-master-password
```

## 🗄️ Configuração do Supabase

### 1. Executar Schema
```sql
-- Execute o arquivo supabase-schema.sql no SQL Editor
-- Isso criará todas as tabelas, políticas e buckets
```

### 2. Configurar CORS
- **Authentication > URL Configuration**
  - Site redirects: `https://drabruna.com.br/*`
  - App redirects: `https://app.drabruna.com.br/*`

### 3. Configurar Storage
- **Storage > Buckets**
  - `public_site`: Assets públicos do site
  - `documents`: Documentos privados do app

### 4. Configurar RLS
- **Database > Row Level Security**
  - `profiles`: Apenas admin
  - `leads`: Inserção via API, leitura apenas admin
  - `audit_logs`: Apenas admin

## 🚀 Deploy

### 1. Vercel (Recomendado)

#### Site (drabruna.com.br)
```bash
# Deploy do site
cd site-bruna
vercel --prod

# Configurar domínio
vercel domains add drabruna.com.br
```

#### App (app.drabruna.com.br)
```bash
# Deploy do app
cd app-bruna
npm run tauri build
# Upload do executável para CDN ou servidor
```

### 2. Configuração de Domínios

#### DNS
```
A     drabruna.com.br        → IP do Vercel
CNAME app.drabruna.com.br    → CDN ou servidor do app
```

#### Vercel
- **Site**: `drabruna.com.br` → projeto site
- **App**: `app.drabruna.com.br` → projeto app

## 🔧 Variáveis de Ambiente por Projeto

### Site (Vercel)
```env
# Públicas
NEXT_PUBLIC_SITE_URL=https://drabruna.com.br
NEXT_PUBLIC_APP_URL=https://app.drabruna.com.br

# Privadas (se houver API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

### App (Build)
```env
# Públicas (vão para o executável)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_MASTER_PASSWORD=your-secure-master-password
```

## 🛡️ Checklist de Segurança

### Site
- [ ] Sem chaves Supabase no browser
- [ ] Headers de segurança ativos
- [ ] CSP configurada
- [ ] Formulário via API route (se houver)
- [ ] Rate limiting implementado

### App
- [ ] Apenas anon key
- [ ] Master password segura
- [ ] Criptografia de documentos
- [ ] DPAPI para sessões
- [ ] Logs de auditoria

### Supabase
- [ ] RLS ativo em todas as tabelas
- [ ] Buckets separados
- [ ] Políticas restritivas
- [ ] Service role apenas no servidor
- [ ] CORS configurado

## 🔄 Fluxo de Dados

### Site → Supabase
```
Formulário → API Route → Service Role → Supabase
```

### App → Supabase
```
App → Anon Key → Supabase (com RLS)
```

### Documentos
```
Upload → Criptografia → Storage (documents bucket)
Download → Descriptografia → Usuário
```

## 🚨 Troubleshooting

### Erro de CORS
- Verificar configuração no Supabase
- Adicionar domínios corretos

### Erro de RLS
- Verificar políticas
- Testar com usuário admin

### Erro de Storage
- Verificar buckets
- Verificar políticas de storage

### Erro de Autenticação
- Verificar anon key
- Verificar configuração de auth

## 📞 Suporte

Para problemas de deploy:
1. Verificar logs do Vercel
2. Verificar logs do Supabase
3. Verificar configuração de domínios
4. Verificar variáveis de ambiente

---

**Lembre-se**: Service Role NUNCA vai para o browser!
