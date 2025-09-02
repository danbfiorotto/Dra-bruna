# Sistema Dra. Bruna

Sistema integrado composto por site institucional e aplicativo desktop para gestão clínica da Dra. Bruna.

## 🏗️ Arquitetura

### Produtos
- **Site Vitrine** (`site-bruna/`): Site institucional estático (Next.js)
- **App Desktop** (`app-bruna/`): Aplicativo Windows para gestão clínica (Tauri + React)

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + TailwindCSS + shadcn/ui
- **Site**: Next.js 14 (SSG) + Vercel
- **App**: Tauri 1.5 + Rust + SQLite + SQLCipher
- **Sync**: Supabase (Postgres + Auth + Storage)
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Rust 1.75+
- npm 9+

### Instalação
```bash
# Clone o repositório
git clone https://github.com/dra-bruna/sistema-dra-bruna.git
cd sistema-dra-bruna

# Instale as dependências
npm install

# Desenvolvimento do site
npm run dev:site

# Desenvolvimento do app
npm run dev:app
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev:site          # Site (Next.js)
npm run dev:app           # App (Tauri)

# Build
npm run build:site        # Build do site
npm run build:app         # Build do app

# Lint
npm run lint              # Lint de todos os workspaces
npm run lint:fix          # Fix automático

# Testes
npm run test              # Testes de todos os workspaces
```

## 📁 Estrutura do Projeto

```
sistema-dra-bruna/
├── site-bruna/              # Site institucional
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas Next.js
│   │   ├── lib/            # Utilitários
│   │   └── styles/         # Estilos globais
│   ├── public/             # Assets estáticos
│   └── package.json
├── app-bruna/              # App desktop
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas do app
│   │   ├── lib/            # Utilitários
│   │   └── hooks/          # React hooks
│   ├── src-tauri/          # Backend Rust
│   │   ├── src/            # Código Rust
│   │   └── Cargo.toml
│   └── package.json
├── docs/                   # Documentação
│   └── adr/               # Architecture Decision Records
├── .github/workflows/      # CI/CD
└── package.json           # Root workspace
```

## 🔧 Desenvolvimento

### Site Vitrine
```bash
cd site-bruna
npm run dev          # http://localhost:3000
npm run build        # Build estático
npm run lint         # ESLint + Prettier
```

### App Desktop
```bash
cd app-bruna
npm run dev          # Tauri dev server
npm run tauri:dev    # App desktop
npm run tauri:build  # Build para produção
```

## 🛡️ Segurança

### Criptografia
- **Banco Local**: SQLCipher (AES-256)
- **Documentos**: AES-256-GCM (cliente-side)
- **Comunicação**: TLS 1.3
- **Sessões**: Windows DPAPI

### Conformidade
- ✅ LGPD (Lei Geral de Proteção de Dados)
- ✅ CFM (Conselho Federal de Medicina)
- ✅ Auditoria completa
- ✅ Backup criptografado

## 🚀 Deploy

### Site
- **Desenvolvimento**: Deploy automático via Vercel
- **Produção**: Deploy via tags `v*`

### App
- **Desenvolvimento**: Build local
- **Produção**: Release via GitHub Actions

## 🔐 Secrets e Variáveis de Ambiente

### GitHub Secrets (CI/CD)

#### Site Pipeline
- `VERCEL_TOKEN`: Token do Vercel para deploy
- `VERCEL_PROJECT_ID`: ID do projeto no Vercel
- `VERCEL_ORG_ID`: ID da organização no Vercel

#### App Pipeline
- `TAURI_PRIVATE_KEY`: Chave privada para assinatura do app
- `TAURI_KEY_PASSWORD`: Senha da chave privada
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

### Variáveis de Ambiente Locais

#### Site (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### App (.env)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_VERSION=1.0.0
```

### Configuração de Desenvolvimento

1. **Clone o repositório**
2. **Configure as variáveis de ambiente** (copie `env.example` para `.env`)
3. **Instale as dependências**: `npm install`
4. **Build dos design tokens**: `npm run build --workspace=design-tokens`
5. **Execute o projeto desejado**:
   - Site: `npm run dev:site`
   - App: `npm run dev:app`

## 📊 CI/CD

### Pipeline de CI
- ✅ Lint (ESLint + Prettier + Clippy)
- ✅ Type Check (TypeScript)
- ✅ Build (Next.js + Tauri)
- ✅ Security Scan (Trivy)
- ✅ Tests (Jest/Vitest)

### Pipeline de Release
- ✅ Build artifacts
- ✅ Deploy site to Vercel
- ✅ Create GitHub release
- ✅ Upload Windows installer

## 📚 Documentação

### ADRs (Architecture Decision Records)
- [ADR-0001: Mono-repo Architecture](docs/adr/0001-mono-repo-architecture.md)
- [ADR-0002: Technology Stack](docs/adr/0002-technology-stack.md)
- [ADR-0003: Database Architecture](docs/adr/0003-database-architecture.md)
- [ADR-0004: Security and Encryption](docs/adr/0004-security-encryption.md)
- [ADR-0005: CI/CD Strategy](docs/adr/0005-ci-cd-strategy.md)
- [ADR-0006: Site SSG + App Tauri Architecture](docs/adr/0006-site-ssg-architecture.md)
- [ADR-0007: Persistência SQLite + SQLCipher + Sync Supabase](docs/adr/0007-persistence-sqlite-supabase.md)
- [ADR-0008: Autenticação Supabase Auth + DPAPI](docs/adr/0008-authentication-supabase-dpapi.md)
- [ADR-0009: Criptografia DB + AES-GCM para Documentos](docs/adr/0009-encryption-db-aes-gcm.md)
- [ADR-0010: Relatórios HTML→PDF + CSV](docs/adr/0010-reports-html-pdf-csv.md)
- [ADR-0011: Backup/Restore Diário, Checksum, Retenção](docs/adr/0011-backup-restore-strategy.md)
- [ADR-0012: Design System (Tokens, Fontes, Ícones)](docs/adr/0012-design-system-tokens.md)

### Documentação Técnica
- [Descrição dos Sistemas](Descricao%20dos%20Sistemas.md)
- [Guia Visual](Guia%20Visual.md)

## 🤝 Contribuição

### Convenções
- **Commits**: [Conventional Commits](https://conventionalcommits.org/)
- **Branches**: `feature/*`, `hotfix/*`, `dev`, `main`
- **Versionamento**: [Semantic Versioning](https://semver.org/)

### Workflow
1. Fork do repositório
2. Branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Pull Request para `dev`

### Code Review
- ✅ Lint sem erros
- ✅ Type check sem erros
- ✅ Build bem-sucedido
- ✅ Security scan limpo
- ✅ Review obrigatório

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
- **Issues**: [GitHub Issues](https://github.com/dra-bruna/sistema-dra-bruna/issues)
- **Documentação**: [Wiki](https://github.com/dra-bruna/sistema-dra-bruna/wiki)

---

**Sistema Dra. Bruna** - Solução integrada para gestão clínica moderna e segura.
