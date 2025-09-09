#!/bin/bash

# Script para executar testes de integração do sistema híbrido de sincronização

echo "🧪 Executando testes de integração do sistema híbrido..."

# Verificar se estamos no diretório correto
if [ ! -f "src-tauri/Cargo.toml" ]; then
    echo "❌ Erro: Execute este script a partir do diretório raiz do projeto (app-bruna/)"
    exit 1
fi

# Navegar para o diretório do Tauri
cd src-tauri

echo "📦 Compilando projeto..."
cargo build --release

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação"
    exit 1
fi

echo "✅ Compilação bem-sucedida"

echo "🧪 Executando testes de integração..."
cargo test --test integration_tests -- --nocapture

if [ $? -eq 0 ]; then
    echo "🎉 Todos os testes passaram!"
else
    echo "❌ Alguns testes falharam"
    exit 1
fi

echo "📊 Executando testes unitários dos módulos híbridos..."
cargo test hybrid_sync merge_utils deduplication tombstone_cleanup sync_audit offline_queue integrity_checks field_merge restore_window entity_rules medical_records_sync storage_sync -- --nocapture

if [ $? -eq 0 ]; then
    echo "🎉 Todos os testes unitários passaram!"
else
    echo "❌ Alguns testes unitários falharam"
    exit 1
fi

echo "✅ Todos os testes foram executados com sucesso!"
echo "📈 Sistema híbrido de sincronização está funcionando corretamente"
