# ADR-0007: Persistência SQLite + SQLCipher + Sync Supabase

## Status
Accepted

## Context
O aplicativo desktop precisa de persistência local robusta e sincronização com nuvem para backup e acesso multi-dispositivo, mantendo dados sensíveis protegidos.

## Decision
Implementar arquitetura de persistência híbrida:
- **Local**: SQLite + SQLCipher para criptografia de dados sensíveis
- **Cloud**: Supabase para sincronização e backup
- **Sync**: Bidirecional com resolução de conflitos

## Rationale
- **SQLite**: Banco local rápido, confiável e offline-first
- **SQLCipher**: Criptografia transparente para dados sensíveis (LGPD)
- **Supabase**: Backend-as-a-Service com PostgreSQL, auth e real-time
- **Sync**: Garantia de backup e acesso multi-dispositivo

## Consequences
### Positive
- Dados sempre disponíveis offline
- Criptografia automática de dados sensíveis
- Backup automático na nuvem
- Sincronização em tempo real

### Negative
- Complexidade de resolução de conflitos
- Necessidade de gerenciar chaves de criptografia
- Dependência de conectividade para sync

## Implementation
- **Local DB**: SQLite com SQLCipher
- **Cloud DB**: Supabase PostgreSQL
- **Sync Engine**: Custom com resolução de conflitos
- **Encryption**: AES-256 para dados sensíveis
- **Backup**: Diário automático com checksum
