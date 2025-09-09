@echo off
REM Script para executar testes de integração do sistema híbrido de sincronização

echo 🧪 Executando testes de integração do sistema híbrido...

REM Verificar se estamos no diretório correto
if not exist "src-tauri\Cargo.toml" (
    echo ❌ Erro: Execute este script a partir do diretório raiz do projeto (app-bruna/)
    exit /b 1
)

REM Navegar para o diretório do Tauri
cd src-tauri

echo 📦 Compilando projeto...
cargo build --release

if %errorlevel% neq 0 (
    echo ❌ Erro na compilação
    exit /b 1
)

echo ✅ Compilação bem-sucedida

echo 🧪 Executando testes de integração...
cargo test --test integration_tests -- --nocapture

if %errorlevel% neq 0 (
    echo ❌ Alguns testes falharam
    exit /b 1
)

echo 🎉 Todos os testes passaram!

echo 📊 Executando testes unitários dos módulos híbridos...
cargo test hybrid_sync merge_utils deduplication tombstone_cleanup sync_audit offline_queue integrity_checks field_merge restore_window entity_rules medical_records_sync storage_sync -- --nocapture

if %errorlevel% neq 0 (
    echo ❌ Alguns testes unitários falharam
    exit /b 1
)

echo 🎉 Todos os testes unitários passaram!

echo ✅ Todos os testes foram executados com sucesso!
echo 📈 Sistema híbrido de sincronização está funcionando corretamente

pause
