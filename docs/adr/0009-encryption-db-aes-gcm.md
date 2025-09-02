# ADR-0009: Criptografia DB + AES-GCM para Documentos

## Status
Accepted

## Context
Dados médicos são altamente sensíveis e requerem criptografia robusta tanto em repouso quanto em trânsito, atendendo LGPD e boas práticas de segurança.

## Decision
Implementar criptografia em múltiplas camadas:
- **Database**: SQLCipher para criptografia transparente do banco
- **Documents**: AES-GCM para arquivos e documentos sensíveis
- **Transit**: TLS 1.3 para comunicação com Supabase
- **Keys**: Derivação de chaves com PBKDF2

## Rationale
- **SQLCipher**: Criptografia transparente e performática
- **AES-GCM**: Autenticação e criptografia para documentos
- **TLS 1.3**: Proteção em trânsito
- **PBKDF2**: Derivação segura de chaves

## Consequences
### Positive
- Proteção robusta de dados sensíveis
- Conformidade com LGPD
- Criptografia transparente para desenvolvedores
- Performance otimizada

### Negative
- Complexidade de gerenciamento de chaves
- Overhead de criptografia/descriptografia
- Necessidade de backup seguro de chaves

## Implementation
- **DB Encryption**: SQLCipher com AES-256
- **File Encryption**: AES-GCM-256 para documentos
- **Key Management**: PBKDF2 + salt único por usuário
- **Backup**: Chaves criptografadas com master key
- **Compliance**: Auditoria e logs de acesso
