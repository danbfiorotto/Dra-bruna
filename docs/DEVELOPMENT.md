# Guia de Desenvolvimento - Sistema Dra. Bruna

Este documento fornece informações técnicas detalhadas para desenvolvedores do Sistema Dra. Bruna.

## 📋 Índice

- [Arquitetura Geral](#arquitetura-geral)
- [Site Vitrine](#site-vitrine)
- [App Desktop](#app-desktop)
- [Banco de Dados](#banco-de-dados)
- [Segurança](#segurança)
- [CI/CD](#cicd)
- [Debugging](#debugging)
- [Performance](#performance)

## 🏗️ Arquitetura Geral

### Visão de Alto Nível
```
┌─────────────────┐    ┌─────────────────┐
│   Site Vitrine  │    │   App Desktop   │
│   (Next.js)     │    │   (Tauri)       │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Vercel/       │    │   SQLite +      │
│   Netlify       │    │   SQLCipher     │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Supabase      │
                       │   (Sync)        │
                       └─────────────────┘
```

### Mono-repo Structure
```
sistema-dra-bruna/
├── package.json              # Root workspace
├── site-bruna/              # Next.js site
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── lib/            # Utilities
│   │   └── styles/         # Global styles
│   └── package.json
├── app-bruna/              # Tauri app
│   ├── src/                # React frontend
│   ├── src-tauri/          # Rust backend
│   └── package.json
└── docs/                   # Documentation
```

## 🌐 Site Vitrine

### Tecnologias
- **Framework**: Next.js 14 (SSG)
- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Deploy**: Vercel

### Estrutura
```typescript
// pages/_app.tsx
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// pages/index.tsx
export default function Home() {
  return (
    <div>
      <Head>
        <title>Dra. Bruna - Clínica Especializada</title>
        <meta name="description" content="..." />
      </Head>
      {/* Conteúdo */}
    </div>
  );
}
```

### Configuração
```javascript
// next.config.js
const nextConfig = {
  output: 'export',           // Static export
  trailingSlash: true,        // SEO friendly
  images: {
    unoptimized: true,        // Static export compatibility
  },
};
```

### Componentes UI
```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
  }
);
```

## 🖥️ App Desktop

### Tecnologias
- **Core**: Tauri 1.5 + Rust
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: SQLite + SQLCipher

### Estrutura Frontend
```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        {/* ... */}
      </Routes>
    </Layout>
  );
}
```

### Estrutura Backend (Rust)
```rust
// src-tauri/src/main.rs
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            database::init_database(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_patients,
            commands::create_patient,
            // ...
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Commands (Tauri)
```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub async fn get_patients(app_handle: tauri::AppHandle) -> Result<Vec<Patient>, String> {
    let database_url = database::get_database_url(&app_handle)?;
    let pool = SqlitePool::connect(&database_url).await?;
    
    let rows = sqlx::query("SELECT * FROM patients ORDER BY name")
        .fetch_all(&pool)
        .await?;
    
    // Convert rows to Patient structs
    Ok(patients)
}
```

## 🗄️ Banco de Dados

### Schema SQLite
```sql
-- Pacientes
CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Consultas
CREATE TABLE appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients (id)
);

-- Prontuários
CREATE TABLE medical_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    appointment_id TEXT,
    anamnesis TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Financeiro
CREATE TABLE financial_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    appointment_id TEXT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Auditoria
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    timestamp TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);
```

### Criptografia
```rust
// src-tauri/src/crypto.rs
use ring::aead::{AES_256_GCM, LessSafeKey, UnboundKey};

pub struct CryptoService {
    key: LessSafeKey,
}

impl CryptoService {
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<String> {
        // Generate random nonce
        let mut nonce_bytes = [0u8; 12];
        SystemRandom::new().fill(&mut nonce_bytes)?;
        
        // Encrypt with AES-256-GCM
        let nonce = Nonce::assume_unique_for_key(nonce_bytes);
        let mut ciphertext = plaintext.to_vec();
        let tag = self.key.seal_in_place_separate_tag(nonce, Aad::empty(), &mut ciphertext)?;
        
        // Combine nonce + ciphertext + tag
        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);
        result.extend_from_slice(tag.as_ref());
        
        Ok(base64::encode(result))
    }
}
```

## 🔒 Segurança

### Criptografia de Dados
- **Banco Local**: SQLCipher (AES-256)
- **Documentos**: AES-256-GCM (cliente-side)
- **Chaves**: Derivação PBKDF2 + Argon2
- **Sessões**: Windows DPAPI

### Controle de Acesso
```rust
// Row Level Security (RLS) no Supabase
CREATE POLICY "Users can only see their own data" ON patients
    FOR ALL USING (auth.uid() = user_id);
```

### Auditoria
```rust
// src-tauri/src/audit.rs
pub async fn log_action(
    pool: &SqlitePool,
    user_id: &str,
    action: &str,
    entity_type: &str,
    entity_id: &str,
    details: Option<&str>,
) -> Result<()> {
    sqlx::query(
        "INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(Uuid::new_v4().to_string())
    .bind(user_id)
    .bind(action)
    .bind(entity_type)
    .bind(entity_id)
    .bind(details)
    .bind(chrono::Utc::now().to_rfc3339())
    .execute(pool)
    .await?;
    
    Ok(())
}
```

## 🚀 CI/CD

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  site-bruna:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --workspace=site-bruna
      - run: npm run build --workspace=site-bruna

  app-bruna:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - uses: dtolnay/rust-toolchain@stable
      - run: npm ci
      - run: npm run lint --workspace=app-bruna
      - run: npm run tauri:build --workspace=app-bruna
```

### Cache Strategy
```yaml
# Cache Node modules
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Cache Rust dependencies
- uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/bin/
      ~/.cargo/registry/index/
      app-bruna/src-tauri/target/
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```

## 🐛 Debugging

### Frontend (React)
```typescript
// Debug hooks
import { useEffect, useState } from 'react';

function useDebug(value: any, label?: string) {
  useEffect(() => {
    console.log(`[DEBUG] ${label || 'Value'}:`, value);
  }, [value, label]);
}

// Error boundaries
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

### Backend (Rust)
```rust
// Logging
use log::{info, warn, error};

#[tauri::command]
pub async fn create_patient(request: CreatePatientRequest) -> Result<Patient, String> {
    info!("Creating patient: {}", request.name);
    
    match database::create_patient(&request).await {
        Ok(patient) => {
            info!("Patient created successfully: {}", patient.id);
            Ok(patient)
        }
        Err(e) => {
            error!("Failed to create patient: {}", e);
            Err(format!("Database error: {}", e))
        }
    }
}
```

### Tauri DevTools
```bash
# Enable devtools in development
# tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "shell": {
        "open": true
      }
    }
  }
}
```

## ⚡ Performance

### Frontend Optimization
```typescript
// Lazy loading
const Patients = lazy(() => import('./pages/Patients'));

// Memoization
const PatientCard = memo(({ patient }: { patient: Patient }) => {
  return <div>{patient.name}</div>;
});

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

function PatientList({ patients }: { patients: Patient[] }) {
  return (
    <List
      height={600}
      itemCount={patients.length}
      itemSize={80}
      itemData={patients}
    >
      {({ index, style, data }) => (
        <div style={style}>
          <PatientCard patient={data[index]} />
        </div>
      )}
    </List>
  );
}
```

### Backend Optimization
```rust
// Connection pooling
use sqlx::{sqlite::SqlitePool, Pool, Sqlite};

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new() -> Result<Self> {
        let pool = SqlitePool::connect("sqlite:clinic.db").await?;
        Ok(Self { pool })
    }
}

// Batch operations
pub async fn create_patients_batch(
    pool: &SqlitePool,
    patients: Vec<CreatePatientRequest>,
) -> Result<Vec<Patient>> {
    let mut tx = pool.begin().await?;
    
    for patient in patients {
        sqlx::query("INSERT INTO patients ...")
            .bind(&patient.name)
            .execute(&mut *tx)
            .await?;
    }
    
    tx.commit().await?;
    Ok(created_patients)
}
```

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);

-- Query optimization
EXPLAIN QUERY PLAN
SELECT p.*, a.date, a.time
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE a.date >= '2024-01-01'
ORDER BY a.date;
```

## 📊 Monitoring

### Error Tracking
```typescript
// Frontend error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send to monitoring service
});
```

### Performance Monitoring
```typescript
// Performance metrics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
    }
  }
});

observer.observe({ entryTypes: ['navigation'] });
```

---

Este guia deve ser atualizado conforme o sistema evolui. Para dúvidas específicas, consulte os ADRs ou abra uma issue.
