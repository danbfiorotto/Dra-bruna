# 🗄️ Diagrama do Esquema de Banco de Dados - Sistema Dra. Bruna

## 📊 Relacionamentos entre Tabelas

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   auth.users    │    │    patients     │    │  appointments   │
│                 │    │                 │    │                 │
│ • id (PK)       │◄───┤ • created_by    │    │ • id (PK)       │
│ • email         │    │ • updated_by    │    │ • patient_id(FK)│
│ • role          │    │ • name          │    │ • date          │
│ • created_at    │    │ • email         │    │ • time          │
│ • updated_at    │    │ • phone         │    │ • status        │
└─────────────────┘    │ • birth_date    │    │ • notes         │
                       │ • address       │    │ • created_by    │
                       │ • notes         │    │ • updated_by    │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                │ 1:N                   │ 1:N
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   documents     │    │ medical_records │
                       │                 │    │                 │
                       │ • id (PK)       │    │ • id (PK)       │
                       │ • patient_id(FK)│    │ • patient_id(FK)│
                       │ • appointment_id│    │ • appointment_id│
                       │ • filename      │    │ • anamnesis     │
                       │ • file_type     │    │ • diagnosis     │
                       │ • storage_path  │    │ • treatment_plan│
                       │ • encrypted     │    │ • version       │
                       │ • created_by    │    │ • created_by    │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                │ N:1                   │ N:1
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │financial_trans. │    │financial_categ. │
                       │                 │    │                 │
                       │ • id (PK)       │    │ • id (PK)       │
                       │ • patient_id(FK)│    │ • name          │
                       │ • appointment_id│    │ • type          │
                       │ • type          │    │ • description   │
                       │ • category      │    │ • color         │
                       │ • amount        │    └─────────────────┘
                       │ • description   │
                       │ • transaction_date│
                       │ • created_by    │
                       └─────────────────┘
                                │
                                │ N:1
                                ▼
                       ┌─────────────────┐
                       │   audit_logs    │
                       │                 │
                       │ • id (PK)       │
                       │ • user_id(FK)   │
                       │ • action        │
                       │ • resource_type │
                       │ • resource_id   │
                       │ • details(JSON) │
                       │ • ip_address    │
                       │ • user_agent    │
                       └─────────────────┘
```

## 🔗 Relacionamentos Detalhados

### **1. Usuários (auth.users)**
- **Relacionamento**: 1:N com todas as tabelas principais
- **Campos de referência**: `created_by`, `updated_by`
- **Função**: Rastreamento de quem criou/modificou registros

### **2. Pacientes (patients)**
- **Relacionamento**: 1:N com appointments, documents, medical_records, financial_transactions
- **Campos únicos**: email (opcional)
- **Índices**: name, email, created_at

### **3. Agendamentos (appointments)**
- **Relacionamento**: N:1 com patients, 1:N com documents, medical_records, financial_transactions
- **Status**: scheduled, confirmed, completed, cancelled, no_show
- **Índices**: date, patient_id, status, created_at

### **4. Documentos (documents)**
- **Relacionamento**: N:1 com patients, appointments
- **Storage**: Supabase Storage (campo storage_path)
- **Criptografia**: Campo encrypted (true/false)
- **Índices**: patient_id, appointment_id, filename, created_at

### **5. Prontuários (medical_records)**
- **Relacionamento**: N:1 com patients, appointments
- **Versionamento**: Campo version para controle de versões
- **Índices**: patient_id, appointment_id, created_at

### **6. Transações Financeiras (financial_transactions)**
- **Relacionamento**: N:1 com patients, appointments, financial_categories
- **Tipos**: income, expense
- **Valor**: DECIMAL(10,2) para precisão monetária
- **Índices**: patient_id, type, category, transaction_date, created_at

### **7. Categorias Financeiras (financial_categories)**
- **Relacionamento**: 1:N com financial_transactions
- **Tipos**: income, expense
- **Personalização**: Campo color para interface
- **Acesso**: Apenas admins podem gerenciar

### **8. Logs de Auditoria (audit_logs)**
- **Relacionamento**: N:1 com auth.users
- **Dados**: JSONB para flexibilidade
- **Rastreamento**: IP, user_agent, timestamp
- **Acesso**: Todos os usuários podem visualizar

## 🔐 Políticas de Segurança (RLS)

### **Níveis de Acesso**
1. **Autenticado**: Pode visualizar e criar registros
2. **Admin**: Pode deletar registros
3. **Sistema**: Pode criar logs de auditoria

### **Políticas por Tabela**
- **Visualização**: Todos os usuários autenticados
- **Criação**: Todos os usuários autenticados
- **Atualização**: Todos os usuários autenticados
- **Exclusão**: Apenas administradores

## 📈 Views e Funções

### **Views Úteis**
1. **appointments_with_patient**: Agendamentos com dados do paciente
2. **monthly_financial_summary**: Resumo financeiro mensal
3. **patient_stats**: Estatísticas de pacientes

### **Funções Úteis**
1. **search_patients()**: Busca de pacientes por nome/email/telefone
2. **get_dashboard_stats()**: Estatísticas para dashboard
3. **update_updated_at_column()**: Atualização automática de timestamps
4. **create_audit_log()**: Criação automática de logs de auditoria

## 🚀 Benefícios do Novo Esquema

### **Performance**
- ✅ Índices otimizados para consultas frequentes
- ✅ Views materializadas para relatórios
- ✅ Funções armazenadas para operações complexas

### **Segurança**
- ✅ RLS em todas as tabelas
- ✅ Auditoria automática de mudanças
- ✅ Controle de acesso granular

### **Escalabilidade**
- ✅ UUIDs para chaves primárias
- ✅ Timestamps com timezone
- ✅ JSONB para dados flexíveis

### **Manutenibilidade**
- ✅ Triggers automáticos
- ✅ Funções reutilizáveis
- ✅ Comentários e documentação

## 📋 Próximos Passos

1. **Aplicar o esquema** no Supabase
2. **Configurar RLS** e políticas
3. **Testar funcionalidades** básicas
4. **Migrar dados** existentes (se houver)
5. **Implementar frontend** com novo esquema
