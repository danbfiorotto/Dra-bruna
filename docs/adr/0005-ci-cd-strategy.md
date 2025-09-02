# ADR-0005: CI/CD Strategy

## Status
Accepted

## Context
O Sistema Dra. Bruna possui dois produtos com diferentes requisitos de build e deploy:
- **Site Vitrine**: Next.js estático para Vercel/Netlify
- **App Desktop**: Tauri para Windows (MSI/NSIS)

Precisamos de uma estratégia de CI/CD eficiente e confiável.

## Decision

### Estratégia de CI/CD com GitHub Actions

#### 1. Pipeline de CI (Continuous Integration)
- **Trigger**: Push para `main`/`dev` e Pull Requests
- **Jobs paralelos**:
  - Site Bruna: Lint → Type Check → Build
  - App Bruna: Lint (TS + Rust) → Type Check → Build
  - Security Scan: Trivy vulnerability scanner
  - Tests: Matrix de workspaces

#### 2. Pipeline de Release
- **Trigger**: Tags `v*` (SemVer)
- **Jobs**:
  - Site: Build → Deploy Vercel
  - App: Build → Create GitHub Release
  - Windows: Build específico para Windows

#### 3. Estratégia de Branches
- `main`: Produção
- `dev`: Desenvolvimento
- `feature/*`: Features
- `hotfix/*`: Correções urgentes

## Rationale

### GitHub Actions
**Vantagens:**
- ✅ Integração nativa com GitHub
- ✅ Marketplace rico de actions
- ✅ Suporte a matriz de builds
- ✅ Cache eficiente
- ✅ Gratuito para projetos públicos

**Alternativas consideradas:**
- **GitLab CI**: Menos integração com GitHub
- **Jenkins**: Complexidade de manutenção
- **Azure DevOps**: Vendor lock-in

### Jobs Paralelos
**Vantagens:**
- ✅ Builds mais rápidos
- ✅ Falhas isoladas
- ✅ Cache independente
- ✅ Escalabilidade

### SemVer + Tags
**Vantagens:**
- ✅ Versionamento claro
- ✅ Releases automáticos
- ✅ Rollback fácil
- ✅ Changelog automático

## Consequences

### Positivas:
- ✅ Builds rápidos e confiáveis
- ✅ Deploy automático
- ✅ Qualidade de código garantida
- ✅ Releases coordenados
- ✅ Rollback simples

### Negativas:
- ❌ Complexidade de configuração
- ❌ Dependência do GitHub
- ❌ Custos para projetos privados
- ❌ Debugging de falhas

## Implementation

### Workflows

#### CI Workflow (`.github/workflows/ci.yml`)
```yaml
- Lint (ESLint + Prettier)
- Type Check (TypeScript)
- Build (Next.js + Tauri)
- Security Scan (Trivy)
- Tests (Jest/Vitest)
```

#### Release Workflow (`.github/workflows/release.yml`)
```yaml
- Build artifacts
- Deploy site to Vercel
- Create GitHub release
- Upload Windows installer
```

### Cache Strategy
- **Node modules**: Cache por workspace
- **Rust dependencies**: Cache por Cargo.lock
- **Build artifacts**: Upload/download
- **Docker layers**: Cache de dependências

### Quality Gates
- ✅ Lint sem erros
- ✅ Type check sem erros
- ✅ Build bem-sucedido
- ✅ Security scan limpo
- ✅ Tests passando (quando implementados)

### Deployment Strategy
- **Site**: Deploy automático para Vercel
- **App**: Release manual via GitHub
- **Rollback**: Revert de tag
- **Monitoring**: Status checks obrigatórios

## Security Considerations
- Secrets em GitHub Secrets
- Dependências verificadas
- Builds em ambiente isolado
- Artefatos assinados
- Audit trail completo

## Monitoring
- Status badges no README
- Notificações de falhas
- Métricas de build time
- Coverage reports
- Security alerts

## References
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [Trivy Security Scanner](https://trivy.dev/)
- [Tauri CI/CD](https://tauri.app/v1/guides/deployment/)
