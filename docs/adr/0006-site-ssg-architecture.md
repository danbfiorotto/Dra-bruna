# ADR-0006: Site SSG + App Tauri Architecture

## Status
Accepted

## Context
O sistema Dra. Bruna precisa de uma arquitetura que combine um site institucional estático (SSG) com um aplicativo desktop para gestão clínica, mantendo identidade visual unificada e funcionalidade offline.

## Decision
Adotar arquitetura híbrida:
- **Site**: Next.js com Static Site Generation (SSG) para performance e SEO
- **App**: Tauri + React para aplicativo desktop nativo e offline
- **Design System**: Pacote centralizado `@bruna/design-tokens` compartilhado

## Rationale
- **SSG**: Melhor performance, SEO e custos de hospedagem
- **Tauri**: Aplicativo nativo, menor bundle, melhor performance que Electron
- **Design Tokens**: Consistência visual e manutenibilidade
- **Offline-first**: Essencial para clínicas com conectividade instável

## Consequences
### Positive
- Performance otimizada para ambos os projetos
- Identidade visual unificada
- Funcionamento offline garantido
- Manutenção centralizada de tokens

### Negative
- Complexidade de sincronização entre projetos
- Necessidade de build separado para cada plataforma

## Implementation
- Site: Next.js 14+ com SSG
- App: Tauri 2.0 + React + TypeScript
- Design System: Pacote npm workspace
- CI/CD: Pipelines separados mas coordenados
