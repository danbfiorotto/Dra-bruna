# ADR-0003: Database Architecture

## Status
Accepted

## Context
O aplicativo desktop precisa gerenciar dados sensíveis de saúde (pacientes, prontuários, documentos) com requisitos específicos:
- Segurança e criptografia
- Funcionamento offline
- Sincronização com nuvem
- Conformidade LGPD
- Backup e restore

## Decision

### Arquitetura Híbrida: Local + Cloud
- **Banco Local**: SQLite + SQLCipher (AES-256)
- **Cloud**: Supabase (PostgreSQL + Auth + Storage)
- **Sincronização**: Bidirecional com resolução de conflitos
- **Criptografia**: Cliente-side para dados sensíveis

### Estrutura de Dados

#### Tabelas Principais:
```sql
-- Pacientes
patients (id, name, email, phone, birth_date, address, notes, created_at, updated_at)

-- Consultas
appointments (id, patient_id, date, time, status, notes, created_at, updated_at)

-- Prontuários
medical_records (id, patient_id, appointment_id, anamnesis, diagnosis, treatment_plan, notes, created_at, updated_at)

-- Financeiro
financial_records (id, patient_id, appointment_id, type, amount, description, date, created_at, updated_at)

-- Auditoria
audit_log (id, user_id, action, entity_type, entity_id, details, timestamp, ip_address, user_agent)
```

#### Documentos:
- Armazenados como arquivos criptografados (AES-GCM)
- Metadados no banco (nome, hash, IV, salt)
- Upload para Supabase Storage

## Rationale

### SQLite + SQLCipher
**Vantagens:**
- ✅ Zero configuração
- ✅ Criptografia transparente (AES-256)
- ✅ Performance excelente
- ✅ Backup simples (arquivo único)
- ✅ Funcionamento offline completo
- ✅ Sem dependências externas

**Alternativas consideradas:**
- **PostgreSQL local**: Complexidade desnecessária
- **MongoDB**: Overhead para dados relacionais
- **IndexedDB**: Limitações de performance

### Supabase para Sync
**Vantagens:**
- ✅ PostgreSQL robusto
- ✅ Auth integrado
- ✅ RLS (Row Level Security)
- ✅ Real-time subscriptions
- ✅ Storage para documentos
- ✅ Edge Functions para lógica

**Alternativas consideradas:**
- **Firebase**: Vendor lock-in, menos flexível
- **AWS**: Complexidade de setup
- **Self-hosted**: Overhead de manutenção

### Criptografia Cliente-side
**Vantagens:**
- ✅ Dados nunca em texto claro na nuvem
- ✅ Conformidade LGPD
- ✅ Controle total sobre chaves
- ✅ Zero-knowledge architecture

## Consequences

### Positivas:
- ✅ Segurança máxima dos dados
- ✅ Funcionamento offline robusto
- ✅ Sincronização confiável
- ✅ Backup e restore simples
- ✅ Conformidade LGPD
- ✅ Performance excelente

### Negativas:
- ❌ Complexidade de sincronização
- ❌ Resolução de conflitos manual
- ❌ Dependência de Supabase
- ❌ Overhead de criptografia

## Implementation

### Fase 1: Banco Local
1. Setup SQLite + SQLCipher
2. Migrations e schema
3. CRUD básico
4. Criptografia de campos sensíveis

### Fase 2: Sincronização
1. Integração Supabase
2. Sync bidirecional
3. Resolução de conflitos
4. Real-time updates

### Fase 3: Documentos
1. Upload criptografado
2. Metadados no banco
3. Download e descriptografia
4. Versionamento

## Security Considerations
- Chaves de criptografia derivadas de senha mestre
- IV e salt únicos por documento
- Hash SHA-256 para integridade
- Audit log completo
- Backup criptografado

## References
- [SQLCipher documentation](https://www.zetetic.net/sqlcipher/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [LGPD compliance](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
