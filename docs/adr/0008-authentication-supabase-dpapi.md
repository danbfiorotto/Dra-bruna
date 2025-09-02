# ADR-0008: Autenticação Supabase Auth + DPAPI

## Status
Accepted

## Context
O sistema precisa de autenticação segura que funcione tanto online quanto offline, com proteção adequada de credenciais locais.

## Decision
Implementar autenticação híbrida:
- **Online**: Supabase Auth com providers sociais e email/senha
- **Offline**: Cache local de sessão com DPAPI para proteção de credenciais
- **Fallback**: Modo offline com dados locais

## Rationale
- **Supabase Auth**: Solução completa com providers, JWT e refresh tokens
- **DPAPI**: Proteção nativa do Windows para credenciais locais
- **Offline-first**: Funcionamento mesmo sem conectividade
- **Security**: Múltiplas camadas de proteção

## Consequences
### Positive
- Autenticação robusta online e offline
- Proteção nativa de credenciais
- Suporte a múltiplos providers
- Sessões persistentes

### Negative
- Complexidade de gerenciar estados online/offline
- Dependência de APIs nativas do sistema operacional

## Implementation
- **Auth Provider**: Supabase Auth
- **Local Storage**: DPAPI para credenciais sensíveis
- **Session Management**: JWT com refresh automático
- **Offline Mode**: Cache de sessão com validação local
- **Providers**: Email/senha, Google, Microsoft
