# ADR-0011: Backup/Restore Diário, Checksum, Retenção

## Status
Accepted

## Context
Dados médicos são críticos e requerem estratégia robusta de backup com verificação de integridade e retenção adequada.

## Decision
Implementar estratégia de backup em múltiplas camadas:
- **Frequency**: Backup diário automático
- **Verification**: Checksum SHA-256 para integridade
- **Retention**: 30 dias local, 1 ano na nuvem
- **Encryption**: Backup criptografado antes do upload

## Rationale
- **Daily Backup**: Proteção contra perda de dados
- **Checksum**: Verificação de integridade dos backups
- **Retention**: Balanceamento entre espaço e histórico
- **Encryption**: Proteção de dados em trânsito e repouso

## Consequences
### Positive
- Proteção robusta contra perda de dados
- Verificação automática de integridade
- Retenção adequada para compliance
- Backup criptografado e seguro

### Negative
- Consumo de espaço de armazenamento
- Overhead de processamento para checksum
- Complexidade de gerenciamento de retenção

## Implementation
- **Schedule**: Cron job diário às 02:00
- **Compression**: Gzip para otimização de espaço
- **Checksum**: SHA-256 de cada arquivo
- **Upload**: S3/Supabase Storage com versionamento
- **Cleanup**: Rotação automática por idade
- **Monitoring**: Logs e alertas de falhas
