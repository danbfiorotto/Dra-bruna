# ADR-0001: Mono-repo Architecture

## Status
Accepted

## Context
O Sistema Dra. Bruna é composto por dois produtos principais:
- **Site Vitrine**: Site institucional estático (Next.js)
- **App Desktop**: Aplicativo Windows para gestão clínica (Tauri + React)

Precisamos decidir a estrutura de repositórios para organizar esses dois produtos.

## Decision
Adotar uma arquitetura de **mono-repo** com workspaces npm para organizar os dois produtos.

### Estrutura escolhida:
```
sistema-dra-bruna/
├── package.json (root)
├── site-bruna/          # Workspace do site
├── app-bruna/           # Workspace do app
├── docs/                # Documentação compartilhada
└── .github/workflows/   # CI/CD compartilhado
```

## Rationale

### Vantagens do Mono-repo:
1. **Compartilhamento de código**: Componentes UI, utilitários e configurações podem ser compartilhados
2. **CI/CD unificado**: Workflows GitHub Actions podem gerenciar ambos os projetos
3. **Versionamento sincronizado**: Releases podem ser coordenados entre os produtos
4. **Documentação centralizada**: ADRs e documentação técnica em um local
5. **Dependências compartilhadas**: ESLint, Prettier, TypeScript configs podem ser centralizados

### Alternativas consideradas:
- **Repositórios separados**: Maior isolamento, mas duplicação de configurações
- **Submodules Git**: Complexidade adicional de gerenciamento

## Consequences

### Positivas:
- ✅ Configurações centralizadas (ESLint, Prettier, TypeScript)
- ✅ CI/CD unificado e eficiente
- ✅ Facilita manutenção e evolução
- ✅ Compartilhamento de componentes UI (shadcn/ui)
- ✅ Versionamento semântico coordenado

### Negativas:
- ❌ Builds podem ser mais lentos (mitigado com cache)
- ❌ Dependências podem afetar ambos os projetos
- ❌ Maior complexidade inicial de setup

## Implementation
- Configurar workspaces no `package.json` root
- Estruturar cada produto como workspace independente
- Configurar CI/CD para ambos os workspaces
- Estabelecer convenções de nomenclatura e estrutura

## References
- [npm workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Mono-repo best practices](https://monorepo.tools/)
