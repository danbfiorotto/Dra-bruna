# Guia de Deploy - Sistema Dra. Bruna

Este documento descreve como fazer deploy dos produtos do Sistema Dra. Bruna.

## 📋 Índice

- [Site Vitrine](#site-vitrine)
- [App Desktop](#app-desktop)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Secrets do GitHub](#secrets-do-github)
- [Monitoramento](#monitoramento)
- [Rollback](#rollback)

## 🌐 Site Vitrine

### Deploy Automático (Vercel)

O site é deployado automaticamente via GitHub Actions quando há push para `main` ou tags `v*`.

#### Configuração Inicial
1. Criar projeto no Vercel
2. Configurar secrets no GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

#### Deploy Manual
```bash
# Build local
cd site-bruna
npm run build

# Deploy via Vercel CLI
npx vercel --prod
```

### Deploy Manual (Netlify)

```bash
# Build
cd site-bruna
npm run build

# Deploy
npx netlify deploy --prod --dir=out
```

## 🖥️ App Desktop

### Build Local

```bash
# Instalar dependências
cd app-bruna
npm install

# Build frontend
npm run build

# Build Tauri
npm run tauri:build
```

### Deploy via GitHub Actions

O app é buildado automaticamente via GitHub Actions:

1. **Push para `main`**: Build de teste
2. **Tag `v*`**: Build de release + GitHub Release

#### Artifacts Gerados
- `app-bruna-windows.msi` (Windows Installer)
- `app-bruna-setup.exe` (NSIS Installer)

### Distribuição

#### GitHub Releases
- Automático via GitHub Actions
- Inclui changelog
- Downloads públicos

#### Windows Store (Futuro)
- Preparação para publicação
- Certificado de assinatura
- Processo de review

## 🔐 Variáveis de Ambiente

### Site Vitrine
```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://drabruna.com
NEXT_PUBLIC_CONTACT_EMAIL=contato@drabruna.com
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

### App Desktop
```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔑 Secrets do GitHub

### Configuração
Acesse: `Settings > Secrets and variables > Actions`

### Secrets Necessários
```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Build
WINDOWS_CERTIFICATE_PASSWORD=your-cert-password
WINDOWS_CERTIFICATE_THUMBPRINT=your-cert-thumbprint
```

### Como Obter

#### Vercel
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em `Settings > Tokens`
3. Crie um novo token
4. Copie `Org ID` e `Project ID`

#### Supabase
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em `Settings > API`
3. Copie `URL` e `anon key`
4. Para `service_role_key`, use com cuidado

## 📊 Monitoramento

### Site Vitrine
- **Vercel Analytics**: Métricas de performance
- **Google Analytics**: Tráfego e comportamento
- **Uptime Monitoring**: Status do site
- **Error Tracking**: Sentry ou similar

### App Desktop
- **Crash Reporting**: Integrado ao Tauri
- **Usage Analytics**: Métricas de uso
- **Update Status**: Verificação de atualizações
- **Error Logs**: Logs locais + remotos

### Alertas
- **Email**: Para falhas críticas
- **Slack**: Para equipe de desenvolvimento
- **SMS**: Para emergências

## 🔄 Rollback

### Site Vitrine
```bash
# Rollback no Vercel
npx vercel rollback [deployment-url]

# Rollback via Git
git revert [commit-hash]
git push origin main
```

### App Desktop
```bash
# Rollback via GitHub
1. Acesse GitHub Releases
2. Baixe versão anterior
3. Publique nova release com versão anterior
```

### Banco de Dados
```bash
# Restore backup
npm run restore-backup --workspace=app-bruna

# Verificar integridade
npm run verify-backup --workspace=app-bruna
```

## 🚀 Processo de Release

### Versionamento
Seguimos [Semantic Versioning](https://semver.org/):
- `MAJOR`: Mudanças incompatíveis
- `MINOR`: Novas funcionalidades
- `PATCH`: Correções de bugs

### Workflow
1. **Desenvolvimento**: Branch `feature/*`
2. **Teste**: Merge para `dev`
3. **Release**: Merge para `main` + tag `v*`
4. **Deploy**: Automático via GitHub Actions

### Changelog
```bash
# Gerar changelog
npm run changelog

# Formato
## [1.0.0] - 2025-01-09
### Added
- Nova funcionalidade X
### Changed
- Melhoria Y
### Fixed
- Bug Z
```

## 🔍 Verificação Pós-Deploy

### Site Vitrine
- [ ] Site carrega corretamente
- [ ] Formulários funcionam
- [ ] Links internos funcionam
- [ ] SEO tags presentes
- [ ] Performance > 90 (PageSpeed)

### App Desktop
- [ ] App inicia sem erros
- [ ] Banco de dados conecta
- [ ] Sincronização funciona
- [ ] Backup automático ativo
- [ ] Logs sem erros críticos

## 📞 Suporte

### Em Caso de Problemas
1. **Verificar logs**: GitHub Actions, Vercel, App
2. **Rollback**: Se necessário
3. **Comunicar**: Equipe e usuários
4. **Investigar**: Causa raiz
5. **Corrigir**: E testar

### Contatos
- **DevOps**: `devops@drabruna.com`
- **Desenvolvimento**: `dev@drabruna.com`
- **Emergência**: `+55 11 99999-9999`

---

Este guia deve ser atualizado conforme o sistema evolui. Para dúvidas específicas, consulte a documentação técnica ou abra uma issue.
