# 🚀 Migração para Sistema 100% Online com Supabase

## 📋 Visão Geral

Este documento detalha o plano completo para migrar o Sistema Dra. Bruna de um modelo híbrido (local + nuvem) para um sistema **100% online** usando Supabase como backend principal.

## 🎯 Objetivos

- ✅ Eliminar dependência de banco local SQLite
- ✅ Centralizar todos os dados no Supabase
- ✅ Simplificar arquitetura de sincronização
- ✅ Melhorar segurança e conformidade
- ✅ Facilitar manutenção e updates
- ✅ Permitir acesso multi-dispositivo

---

## 📊 Análise da Situação Atual

### 🔍 Estrutura Atual Identificada

#### **Módulos de Sincronização (Para Remoção)**
- `hybrid_sync.rs` - Sistema híbrido complexo
- `hybrid_sync_simple.rs` - Versão simplificada
- `auto_sync.rs` - Sincronização automática
- `storage_sync.rs` - Sincronização de arquivos
- `medical_records_sync.rs` - Sincronização de prontuários
- `tombstone_cleanup.rs` - Limpeza de registros deletados
- `sync_audit.rs` - Auditoria de sincronização
- `offline_queue.rs` - Fila offline
- `entity_rules.rs` - Regras de entidades
- `merge_utils.rs` - Utilitários de merge
- `deduplication.rs` - Deduplicação
- `integrity_checks.rs` - Verificações de integridade
- `field_merge.rs` - Merge de campos
- `restore_window.rs` - Janela de restauração

#### **Banco de Dados Local (Para Remoção)**
- `database.rs` - Interface SQLite
- `database_cipher.rs` - Versão criptografada
- `commands_database.rs` - Comandos de banco local
- `dpapi.rs` - Proteção de credenciais Windows
- `crypto.rs` - Criptografia local

#### **Estruturas de Dados Atuais**
```sql
-- Tabelas SQLite (para migração)
patients (id, name, email, phone, birth_date, address, notes, created_at, updated_at)
appointments (id, patient_id, date, time, status, notes, created_at, updated_at)
documents (id, patient_id, appointment_id, filename, file_type, file_size, encrypted, content_hash, created_at, updated_at)
document_content (document_id, encrypted_content, nonce, tag)
audit_logs (id, user_id, user_email, action, resource_type, resource_id, description, ip_address, user_agent, created_at)
sync_status (id, last_sync, sync_type, status, records_synced, created_at)
```

#### **Sistema de Autenticação Atual**
- ✅ Supabase Auth já implementado
- ✅ RLS (Row Level Security) configurado
- ✅ Sistema de perfis e roles
- ✅ Permissões granulares definidas

---

## 🗂️ TODO List - Migração Completa

### **FASE 1: Preparação e Análise** ⏱️ 2-3 dias

#### 1.1 Análise de Dados Existentes
- [ ] **Auditoria de dados locais**
  - [ ] Exportar todos os dados do SQLite atual
  - [ ] Verificar integridade dos dados
  - [ ] Identificar dependências entre tabelas
  - [ ] Documentar mapeamento de campos

#### 1.2 Planejamento do Esquema Supabase
- [ ] **Design do novo esquema**
  - [ ] Criar diagrama ER completo
  - [ ] Definir políticas RLS para cada tabela
  - [ ] Planejar índices e otimizações
  - [ ] Definir triggers e funções

#### 1.3 Backup e Segurança
- [ ] **Backup completo do sistema atual**
  - [ ] Backup do banco SQLite
  - [ ] Backup de todos os documentos
  - [ ] Backup de configurações
  - [ ] Teste de restauração

### **FASE 2: Criação do Esquema Supabase** ⏱️ 3-4 dias

#### 2.1 Tabelas Principais
- [ ] **Pacientes**
  ```sql
  CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
  );
  ```

- [ ] **Agendamentos**
  ```sql
  CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
  );
  ```

- [ ] **Documentos**
  ```sql
  CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    storage_path TEXT NOT NULL, -- Caminho no Supabase Storage
    content_hash TEXT,
    encrypted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
  );
  ```

- [ ] **Prontuários Médicos**
  ```sql
  CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    anamnesis TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
  );
  ```

- [ ] **Financeiro**
  ```sql
  CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
  );
  ```

- [ ] **Logs de Auditoria**
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

#### 2.2 Políticas RLS (Row Level Security)
- [ ] **Políticas para cada tabela**
  - [ ] Política de leitura: usuários autenticados podem ler
  - [ ] Política de escrita: apenas criador ou admin pode modificar
  - [ ] Política de deleção: apenas admin pode deletar
  - [ ] Política de auditoria: todos podem ler logs

#### 2.3 Índices e Otimizações
- [ ] **Índices de performance**
  - [ ] Índices em campos de busca frequente
  - [ ] Índices compostos para queries complexas
  - [ ] Índices parciais para dados ativos

#### 2.4 Triggers e Funções
- [ ] **Triggers automáticos**
  - [ ] Atualização de `updated_at`
  - [ ] Log de auditoria automático
  - [ ] Validação de dados
  - [ ] Cálculos de campos derivados

### **FASE 3: Migração de Dados** ⏱️ 2-3 dias

#### 3.1 Script de Migração
- [ ] **Script Python/Node.js para migração**
  - [ ] Conectar ao SQLite local
  - [ ] Conectar ao Supabase
  - [ ] Mapear e transformar dados
  - [ ] Migrar em lotes com rollback
  - [ ] Validar integridade pós-migração

#### 3.2 Migração de Documentos
- [ ] **Upload para Supabase Storage**
  - [ ] Criar buckets organizados
  - [ ] Upload de todos os documentos
  - [ ] Manter estrutura de pastas
  - [ ] Atualizar referências no banco

#### 3.3 Validação e Testes
- [ ] **Testes de integridade**
  - [ ] Contagem de registros
  - [ ] Verificação de relacionamentos
  - [ ] Teste de performance
  - [ ] Validação de permissões

### **FASE 4: Refatoração do Frontend** ⏱️ 4-5 dias

#### 4.1 Remoção de Dependências Locais
- [ ] **Arquivos para deletar**
  - [ ] `src-tauri/src/database.rs`
  - [ ] `src-tauri/src/database_cipher.rs`
  - [ ] `src-tauri/src/commands_database.rs`
  - [ ] `src-tauri/src/dpapi.rs`
  - [ ] `src-tauri/src/crypto.rs`
  - [ ] `src-tauri/src/auto_sync.rs`
  - [ ] `src-tauri/src/hybrid_sync.rs`
  - [ ] `src-tauri/src/hybrid_sync_simple.rs`
  - [ ] `src-tauri/src/storage_sync.rs`
  - [ ] `src-tauri/src/medical_records_sync.rs`
  - [ ] `src-tauri/src/tombstone_cleanup.rs`
  - [ ] `src-tauri/src/sync_audit.rs`
  - [ ] `src-tauri/src/offline_queue.rs`
  - [ ] `src-tauri/src/entity_rules.rs`
  - [ ] `src-tauri/src/merge_utils.rs`
  - [ ] `src-tauri/src/deduplication.rs`
  - [ ] `src-tauri/src/integrity_checks.rs`
  - [ ] `src-tauri/src/field_merge.rs`
  - [ ] `src-tauri/src/restore_window.rs`
  - [ ] `src-tauri/src/commands_sync.rs`

#### 4.2 Criação de Serviços Supabase
- [ ] **Novos serviços**
  - [ ] `src/services/supabase/patients.ts`
  - [ ] `src/services/supabase/appointments.ts`
  - [ ] `src/services/supabase/documents.ts`
  - [ ] `src/services/supabase/medicalRecords.ts`
  - [ ] `src/services/supabase/financial.ts`
  - [ ] `src/services/supabase/audit.ts`

#### 4.3 Atualização de Hooks
- [ ] **Refatoração de hooks**
  - [ ] `useAuth.ts` - Simplificar para apenas Supabase
  - [ ] `usePatients.ts` - Usar Supabase diretamente
  - [ ] `useAppointments.ts` - Usar Supabase diretamente
  - [ ] `useDocuments.ts` - Usar Supabase Storage
  - [ ] `useFinancial.ts` - Novo hook para financeiro
  - [ ] `useMedicalRecords.ts` - Novo hook para prontuários

#### 4.4 Atualização de Componentes
- [ ] **Componentes para atualizar**
  - [ ] `Patients.tsx` - Remover lógica de cache local
  - [ ] `Appointments.tsx` - Usar Supabase em tempo real
  - [ ] `Documents.tsx` - Integrar com Supabase Storage
  - [ ] `Financial.tsx` - Implementar funcionalidades completas
  - [ ] `MedicalRecords.tsx` - Novo componente
  - [ ] `AuditLogs.tsx` - Atualizar para Supabase

### **FASE 5: Refatoração do Backend Tauri** ⏱️ 3-4 dias

#### 5.1 Simplificação do Backend
- [ ] **Manter apenas**
  - [ ] `auth.rs` - Autenticação Supabase
  - [ ] `supabase.rs` - Cliente Supabase
  - [ ] `config.rs` - Configurações
  - [ ] `main.rs` - Simplificado

#### 5.2 Remoção de Comandos Tauri
- [ ] **Comandos para deletar**
  - [ ] Todos os comandos de `commands_database.rs`
  - [ ] Todos os comandos de `commands_sync.rs`
  - [ ] Comandos de criptografia local
  - [ ] Comandos de sincronização

#### 5.3 Novos Comandos (se necessário)
- [ ] **Comandos essenciais**
  - [ ] `get_auth_status` - Status de autenticação
  - [ ] `logout` - Logout do sistema
  - [ ] `get_app_info` - Informações do app

### **FASE 6: Implementação de Funcionalidades Online** ⏱️ 5-6 dias

#### 6.1 Sistema Financeiro Completo
- [ ] **Funcionalidades financeiras**
  - [ ] CRUD de transações
  - [ ] Categorias de receitas/despesas
  - [ ] Relatórios financeiros
  - [ ] Dashboard financeiro
  - [ ] Exportação de relatórios

#### 6.2 Sistema de Prontuários
- [ ] **Prontuários médicos**
  - [ ] CRUD de prontuários
  - [ ] Versionamento de prontuários
  - [ ] Templates de prontuários
  - [ ] Busca em prontuários
  - [ ] Relatórios médicos

#### 6.3 Sistema de Documentos Avançado
- [ ] **Gestão de documentos**
  - [ ] Upload para Supabase Storage
  - [ ] Organização por pastas
  - [ ] Busca de documentos
  - [ ] Preview de documentos
  - [ ] Compartilhamento seguro

#### 6.4 Sistema de Relatórios
- [ ] **Relatórios diversos**
  - [ ] Relatório de pacientes
  - [ ] Relatório de agendamentos
  - [ ] Relatório financeiro
  - [ ] Relatório de auditoria
  - [ ] Exportação em PDF/CSV

### **FASE 7: Segurança e Conformidade** ⏱️ 2-3 dias

#### 7.1 Políticas de Segurança
- [ ] **Configuração de RLS**
  - [ ] Políticas por tabela
  - [ ] Políticas por usuário
  - [ ] Políticas por role
  - [ ] Testes de segurança

#### 7.2 Auditoria e Logs
- [ ] **Sistema de auditoria**
  - [ ] Log automático de ações
  - [ ] Rastreamento de mudanças
  - [ ] Relatórios de auditoria
  - [ ] Retenção de logs

#### 7.3 Conformidade LGPD
- [ ] **Conformidade legal**
  - [ ] Política de privacidade
  - [ ] Termos de uso
  - [ ] Consentimento de dados
  - [ ] Direito ao esquecimento

### **FASE 8: Testes e Validação** ⏱️ 3-4 dias

#### 8.1 Testes Funcionais
- [ ] **Testes de funcionalidades**
  - [ ] CRUD de todas as entidades
  - [ ] Autenticação e autorização
  - [ ] Upload/download de documentos
  - [ ] Geração de relatórios
  - [ ] Performance e responsividade

#### 8.2 Testes de Segurança
- [ ] **Testes de segurança**
  - [ ] Teste de permissões
  - [ ] Teste de RLS
  - [ ] Teste de auditoria
  - [ ] Teste de criptografia

#### 8.3 Testes de Performance
- [ ] **Testes de performance**
  - [ ] Tempo de carregamento
  - [ ] Tempo de resposta
  - [ ] Uso de memória
  - [ ] Escalabilidade

### **FASE 9: Deploy e Migração** ⏱️ 2-3 dias

#### 9.1 Preparação para Deploy
- [ ] **Configuração de produção**
  - [ ] Variáveis de ambiente
  - [ ] Configuração do Supabase
  - [ ] Configuração de domínio
  - [ ] Certificados SSL

#### 9.2 Migração de Produção
- [ ] **Migração final**
  - [ ] Backup final do sistema atual
  - [ ] Migração de dados de produção
  - [ ] Validação em produção
  - [ ] Rollback plan

#### 9.3 Monitoramento
- [ ] **Monitoramento pós-deploy**
  - [ ] Logs de aplicação
  - [ ] Métricas de performance
  - [ ] Alertas de erro
  - [ ] Monitoramento de segurança

---

## 🗂️ Arquivos para Deletar

### **Backend Rust (Tauri)**
```
src-tauri/src/
├── database.rs                    ❌ DELETAR
├── database_cipher.rs             ❌ DELETAR
├── commands_database.rs           ❌ DELETAR
├── dpapi.rs                       ❌ DELETAR
├── crypto.rs                      ❌ DELETAR
├── auto_sync.rs                   ❌ DELETAR
├── hybrid_sync.rs                 ❌ DELETAR
├── hybrid_sync_simple.rs          ❌ DELETAR
├── storage_sync.rs                ❌ DELETAR
├── medical_records_sync.rs        ❌ DELETAR
├── tombstone_cleanup.rs           ❌ DELETAR
├── sync_audit.rs                  ❌ DELETAR
├── offline_queue.rs               ❌ DELETAR
├── entity_rules.rs                ❌ DELETAR
├── merge_utils.rs                 ❌ DELETAR
├── deduplication.rs               ❌ DELETAR
├── integrity_checks.rs            ❌ DELETAR
├── field_merge.rs                 ❌ DELETAR
├── restore_window.rs              ❌ DELETAR
├── commands_sync.rs               ❌ DELETAR
└── medical_record.rs              ❌ DELETAR (mover para frontend)
```

### **Frontend - Componentes para Refatorar**
```
src/
├── hooks/
│   ├── useAuth.ts                 🔄 REFATORAR
│   ├── usePatients.ts             🔄 REFATORAR
│   ├── useAppointments.ts         🔄 REFATORAR
│   └── useDocuments.ts            🔄 REFATORAR
├── services/
│   ├── database.ts                ❌ DELETAR
│   ├── sync.ts                    ❌ DELETAR
│   └── crypto.ts                  ❌ DELETAR
└── components/
    ├── Patients.tsx               🔄 REFATORAR
    ├── Appointments.tsx           🔄 REFATORAR
    ├── Documents.tsx              🔄 REFATORAR
    └── Financial.tsx              🔄 REFATORAR
```

---

## 🏗️ Nova Arquitetura

### **Estrutura Simplificada**
```
app-bruna/
├── src/                           # Frontend React
│   ├── services/
│   │   └── supabase/              # Serviços Supabase
│   │       ├── patients.ts
│   │       ├── appointments.ts
│   │       ├── documents.ts
│   │       ├── medicalRecords.ts
│   │       ├── financial.ts
│   │       └── audit.ts
│   ├── hooks/                     # Hooks React
│   ├── components/                # Componentes UI
│   └── pages/                     # Páginas da aplicação
├── src-tauri/src/                 # Backend Tauri (minimal)
│   ├── auth.rs                    # Autenticação
│   ├── supabase.rs                # Cliente Supabase
│   ├── config.rs                  # Configurações
│   └── main.rs                    # Entry point
└── supabase/                      # Configuração Supabase
    ├── migrations/                # Migrações SQL
    ├── functions/                 # Edge Functions
    └── seed.sql                   # Dados iniciais
```

---

## 🔐 Segurança e Permissões

### **Sistema de Roles Atual**
- **Admin**: Acesso total ao sistema
- **User**: Acesso limitado (se implementado)

### **Políticas RLS Propostas**
```sql
-- Exemplo para tabela patients
CREATE POLICY "Users can view patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own patients" ON patients
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Only admins can delete patients" ON patients
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

### **Funcionalidades de Segurança**
- ✅ Autenticação via Supabase Auth
- ✅ Autorização via RLS
- ✅ Auditoria completa de ações
- ✅ Criptografia de dados sensíveis
- ✅ Backup automático
- ✅ Conformidade LGPD

---

## 📈 Benefícios da Migração

### **Técnicos**
- ✅ Arquitetura mais simples
- ✅ Menos código para manter
- ✅ Melhor performance
- ✅ Escalabilidade automática
- ✅ Backup automático
- ✅ Atualizações em tempo real

### **Operacionais**
- ✅ Acesso multi-dispositivo
- ✅ Sincronização automática
- ✅ Colaboração em tempo real
- ✅ Backup e recuperação automáticos
- ✅ Monitoramento centralizado

### **Econômicos**
- ✅ Menor custo de manutenção
- ✅ Menor complexidade de deploy
- ✅ Escalabilidade sob demanda
- ✅ Redução de infraestrutura local

---

## ⚠️ Riscos e Mitigações

### **Riscos Identificados**
- ❌ **Dependência de internet**: Sistema não funciona offline
- ❌ **Dependência do Supabase**: Vendor lock-in
- ❌ **Migração de dados**: Possível perda de dados
- ❌ **Performance**: Latência de rede

### **Mitigações**
- ✅ **Cache local**: Implementar cache para dados frequentes
- ✅ **Fallback**: Plano de contingência com backup local
- ✅ **Backup completo**: Múltiplos backups antes da migração
- ✅ **CDN**: Usar CDN para melhor performance
- ✅ **Testes extensivos**: Validação completa antes do deploy

---

## 📅 Cronograma Estimado

| Fase | Duração | Dependências |
|------|---------|--------------|
| Fase 1: Preparação | 2-3 dias | - |
| Fase 2: Esquema Supabase | 3-4 dias | Fase 1 |
| Fase 3: Migração de Dados | 2-3 dias | Fase 2 |
| Fase 4: Refatoração Frontend | 4-5 dias | Fase 3 |
| Fase 5: Refatoração Backend | 3-4 dias | Fase 4 |
| Fase 6: Funcionalidades Online | 5-6 dias | Fase 5 |
| Fase 7: Segurança | 2-3 dias | Fase 6 |
| Fase 8: Testes | 3-4 dias | Fase 7 |
| Fase 9: Deploy | 2-3 dias | Fase 8 |
| **TOTAL** | **26-35 dias** | - |

---

## 🚀 Próximos Passos

1. **Aprovação do plano** - Revisar e aprovar este documento
2. **Setup do ambiente** - Configurar Supabase para desenvolvimento
3. **Início da Fase 1** - Começar com análise e preparação
4. **Comunicação** - Informar stakeholders sobre a migração
5. **Backup completo** - Fazer backup de todo o sistema atual

---

## 📞 Suporte e Dúvidas

Para dúvidas sobre este plano de migração, consulte:
- Documentação do Supabase
- Código atual do sistema
- Este documento de migração
- Equipe de desenvolvimento

---

**Data de Criação**: 9 de Janeiro de 2025  
**Versão**: 1.0  
**Status**: Aguardando Aprovação
