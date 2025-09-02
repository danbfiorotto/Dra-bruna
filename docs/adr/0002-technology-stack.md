# ADR-0002: Technology Stack

## Status
Accepted

## Context
Precisamos definir a stack tecnológica para os dois produtos do Sistema Dra. Bruna:
- Site institucional (vitrine)
- Aplicativo desktop para gestão clínica

## Decision

### Site Vitrine (Next.js)
- **Framework**: Next.js 14+ (modo estático/SSG)
- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui (Radix)
- **Hospedagem**: Vercel/Netlify
- **Fonts**: Google Fonts (Inter + Poppins)

### App Desktop (Tauri)
- **Core**: Tauri 1.5+ (Rust)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui (Radix)
- **Database**: SQLite + SQLCipher (criptografia)
- **Sync**: Supabase (Postgres + Auth + Storage)
- **Crypto**: Ring (AES-256-GCM)

## Rationale

### Site Vitrine - Next.js
**Vantagens:**
- ✅ SSG para performance máxima
- ✅ SEO otimizado out-of-the-box
- ✅ Deploy simples em Vercel
- ✅ TypeScript nativo
- ✅ Image optimization automática

**Alternativas consideradas:**
- **Gatsby**: Mais complexo para site simples
- **Astro**: Menos maduro, menor ecossistema
- **Vite + React**: Sem otimizações SEO nativas

### App Desktop - Tauri
**Vantagens:**
- ✅ Performance nativa (Rust)
- ✅ Bundle size pequeno (~10MB vs ~100MB Electron)
- ✅ Segurança superior
- ✅ Acesso completo ao sistema
- ✅ Cross-platform (Windows, macOS, Linux)

**Alternativas consideradas:**
- **Electron**: Bundle muito grande, performance inferior
- **Flutter Desktop**: Menos maduro, curva de aprendizado
- **Qt**: Complexo, licenciamento

### Database - SQLite + SQLCipher
**Vantagens:**
- ✅ Zero configuração
- ✅ Criptografia nativa (AES-256)
- ✅ Performance excelente
- ✅ Backup simples (arquivo único)
- ✅ Offline-first

**Alternativas consideradas:**
- **PostgreSQL local**: Complexidade desnecessária
- **MongoDB**: Overhead para dados relacionais

### Sync - Supabase
**Vantagens:**
- ✅ PostgreSQL robusto
- ✅ Auth integrado
- ✅ RLS (Row Level Security)
- ✅ Real-time subscriptions
- ✅ Storage para documentos

## Consequences

### Positivas:
- ✅ Stack moderna e performática
- ✅ TypeScript em todo o frontend
- ✅ Componentes UI reutilizáveis
- ✅ Segurança de dados robusta
- ✅ Deploy e distribuição simplificados

### Negativas:
- ❌ Curva de aprendizado para Tauri/Rust
- ❌ Dependência de serviços externos (Supabase)
- ❌ Complexidade de sincronização

## Implementation
- Configurar Next.js com SSG
- Setup Tauri com React + TypeScript
- Implementar SQLite com SQLCipher
- Integrar Supabase para sync
- Configurar CI/CD para ambos

## References
- [Tauri documentation](https://tauri.app/)
- [Next.js SSG](https://nextjs.org/docs/advanced-features/static-html-export)
- [SQLCipher](https://www.zetetic.net/sqlcipher/)
- [Supabase](https://supabase.com/)
