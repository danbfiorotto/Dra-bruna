# Configuração de Proteção de Branch

Este documento descreve as configurações recomendadas para proteção de branches no GitHub.

## Branch Protection Rules

### Main Branch (`main`)

**Configurações obrigatórias:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 2
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review from code owners
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Restrict pushes that create files larger than 100MB

**Status Checks obrigatórios:**
- `lint` (Site CI)
- `type-check` (Site CI)
- `build` (Site CI)
- `lint` (App CI)
- `type-check` (App CI)
- `rust-check` (App CI)
- `build` (App CI)

### Develop Branch (`develop`)

**Configurações obrigatórias:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Status Checks obrigatórios:**
- `lint` (Site CI)
- `type-check` (Site CI)
- `lint` (App CI)
- `type-check` (App CI)
- `rust-check` (App CI)

## Configuração via GitHub CLI

```bash
# Proteger branch main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","type-check","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null

# Proteger branch develop
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","type-check"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":false}' \
  --field restrictions=null
```

## Configuração via Interface Web

1. Vá para **Settings** > **Branches**
2. Clique em **Add rule**
3. Configure conforme as regras acima
4. Salve as configurações

## Política de Branches

### Nomenclatura
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes
- `docs/*`: Documentação
- `refactor/*`: Refatoração

### Workflow
1. Criar branch a partir de `develop`
2. Desenvolver e testar localmente
3. Criar Pull Request para `develop`
4. Após aprovação, merge para `develop`
5. Para release, criar PR de `develop` para `main`

## Exceções

### Hotfixes
- Podem ser criados diretamente a partir de `main`
- Requerem aprovação de 2 revisores
- Devem ser mergeados de volta para `develop`

### Administradores
- Podem fazer push direto em casos de emergência
- Devem justificar a ação em issue separada
- Devem criar PR de follow-up se necessário
