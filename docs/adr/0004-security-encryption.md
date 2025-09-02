# ADR-0004: Security and Encryption

## Status
Accepted

## Context
O Sistema Dra. Bruna lida com dados sensíveis de saúde que requerem:
- Conformidade com LGPD
- Criptografia robusta
- Auditoria completa
- Backup seguro
- Controle de acesso

## Decision

### Estratégia de Segurança Multicamada

#### 1. Criptografia de Dados
- **Banco Local**: SQLCipher (AES-256)
- **Documentos**: AES-256-GCM (cliente-side)
- **Comunicação**: TLS 1.3
- **Chaves**: Derivação PBKDF2 + Argon2

#### 2. Controle de Acesso
- **Autenticação**: Supabase Auth
- **Autorização**: RLS (Row Level Security)
- **Sessões**: Tokens JWT + refresh tokens
- **Armazenamento**: Windows DPAPI

#### 3. Auditoria
- **Log completo**: Todas as ações sensíveis
- **Rastreabilidade**: Usuário, ação, timestamp, IP
- **Integridade**: Hash SHA-256 dos logs
- **Retenção**: 7 anos (conformidade médica)

#### 4. Backup e Recovery
- **Backup automático**: Diário, criptografado
- **Integridade**: Checksum SHA-256
- **Teste**: Validação periódica
- **Recovery**: Verificação de versão

## Rationale

### SQLCipher para Banco Local
**Vantagens:**
- ✅ Criptografia transparente
- ✅ Performance otimizada
- ✅ Padrão da indústria
- ✅ Zero configuração adicional

### AES-256-GCM para Documentos
**Vantagens:**
- ✅ Autenticação integrada
- ✅ Proteção contra tampering
- ✅ Performance excelente
- ✅ Padrão NIST

### Supabase Auth + RLS
**Vantagens:**
- ✅ Auth robusto e testado
- ✅ RLS granular
- ✅ Integração nativa
- ✅ Compliance ready

### Windows DPAPI
**Vantagens:**
- ✅ Integração com sistema
- ✅ Transparente para usuário
- ✅ Segurança do Windows
- ✅ Backup automático de chaves

## Consequences

### Positivas:
- ✅ Conformidade LGPD
- ✅ Segurança de nível bancário
- ✅ Auditoria completa
- ✅ Backup confiável
- ✅ Controle de acesso granular

### Negativas:
- ❌ Complexidade de implementação
- ❌ Overhead de performance
- ❌ Dependência de Windows DPAPI
- ❌ Curva de aprendizado

## Implementation

### Fase 1: Criptografia Básica
1. Setup SQLCipher
2. Criptografia de campos sensíveis
3. Geração segura de chaves
4. Testes de integridade

### Fase 2: Documentos Seguros
1. Upload com criptografia cliente-side
2. Metadados seguros
3. Download e descriptografia
4. Versionamento

### Fase 3: Auditoria
1. Log de todas as ações
2. Integridade dos logs
3. Relatórios de auditoria
4. Alertas de segurança

### Fase 4: Backup Seguro
1. Backup automático criptografado
2. Verificação de integridade
3. Teste de restore
4. Retenção configurável

## Security Checklist
- [ ] Criptografia AES-256 em todos os dados sensíveis
- [ ] Autenticação multifator
- [ ] Logs de auditoria completos
- [ ] Backup criptografado e testado
- [ ] Controle de acesso baseado em roles
- [ ] Validação de entrada rigorosa
- [ ] Sanitização de dados
- [ ] Rate limiting
- [ ] Monitoramento de segurança

## Compliance
- **LGPD**: Consentimento, minimização, segurança
- **CFM**: Sigilo médico, prontuários
- **ISO 27001**: Gestão de segurança da informação
- **NIST**: Framework de cibersegurança

## References
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [SQLCipher Security](https://www.zetetic.net/sqlcipher/design/)
- [AES-GCM Specification](https://tools.ietf.org/html/rfc5288)
- [Windows DPAPI](https://docs.microsoft.com/en-us/windows/win32/api/dpapi/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
