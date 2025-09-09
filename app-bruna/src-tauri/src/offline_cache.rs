use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use chrono::{DateTime, Utc};
use tokio::fs;
use tokio::sync::RwLock;

// =====================================================
// OFFLINE CACHE SYSTEM
// =====================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub key: String,
    pub data: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub ttl_seconds: u64,
    pub version: u32,
    pub sync_status: SyncStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncStatus {
    Synced,
    Pending,
    Failed,
    Conflict,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheMetrics {
    pub total_entries: u32,
    pub memory_usage_mb: f64,
    pub hit_rate: f64,
    pub miss_rate: f64,
    pub pending_sync: u32,
    pub failed_sync: u32,
    pub last_cleanup: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfflineOperation {
    pub id: String,
    pub operation: String, // CREATE, UPDATE, DELETE
    pub table: String,
    pub data: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub retry_count: u32,
    pub max_retries: u32,
}

// Global cache state
type CacheStore = Arc<RwLock<HashMap<String, CacheEntry>>>;
type PendingOperations = Arc<Mutex<Vec<OfflineOperation>>>;

static mut CACHE: Option<CacheStore> = None;
static mut PENDING_OPERATIONS: Option<PendingOperations> = None;
static mut CACHE_METRICS: Option<CacheMetrics> = None;

// =====================================================
// INITIALIZATION
// =====================================================

pub async fn initialize_cache() -> Result<()> {
    println!("💾 Inicializando cache offline...");
    
    // Initialize cache store
    unsafe {
        CACHE = Some(Arc::new(RwLock::new(HashMap::new())));
        PENDING_OPERATIONS = Some(Arc::new(Mutex::new(Vec::new())));
        CACHE_METRICS = Some(CacheMetrics {
            total_entries: 0,
            memory_usage_mb: 0.0,
            hit_rate: 0.0,
            miss_rate: 0.0,
            pending_sync: 0,
            failed_sync: 0,
            last_cleanup: None,
        });
    }
    
    // Load cache from disk
    load_cache_from_disk().await?;
    
    // Start background tasks
    tokio::spawn(start_cache_cleanup());
    // Start sync processor in a separate task
    tokio::task::spawn_blocking(|| {
        tokio::runtime::Handle::current().block_on(async {
            start_sync_processor().await;
        });
    });
    tokio::spawn(start_metrics_updater());
    
    println!("✅ Cache offline inicializado");
    Ok(())
}

// =====================================================
// CACHE OPERATIONS
// =====================================================

pub async fn get_from_cache(key: &str) -> Result<Option<CacheEntry>> {
    unsafe {
        if let Some(cache) = &CACHE {
            let cache_guard = cache.read().await;
            
            if let Some(entry) = cache_guard.get(key) {
                // Check if entry is expired
                let now = Utc::now();
                let age = now.signed_duration_since(entry.timestamp);
                
                if age.num_seconds() < entry.ttl_seconds as i64 {
                    update_cache_metrics(true).await;
                    return Ok(Some(entry.clone()));
                } else {
                    // Entry expired, remove it
                    drop(cache_guard);
                    let mut cache_guard = cache.write().await;
                    cache_guard.remove(key);
                }
            }
        }
    }
    
    update_cache_metrics(false).await;
    Ok(None)
}

pub async fn set_cache(key: &str, data: serde_json::Value, ttl_seconds: u64) -> Result<()> {
    let entry = CacheEntry {
        key: key.to_string(),
        data,
        timestamp: Utc::now(),
        ttl_seconds,
        version: 1,
        sync_status: SyncStatus::Synced,
    };
    
    unsafe {
        if let Some(cache) = &CACHE {
            let mut cache_guard = cache.write().await;
            cache_guard.insert(key.to_string(), entry);
        }
    }
    
    // Save to disk
    save_cache_to_disk().await?;
    
    Ok(())
}

pub async fn remove_from_cache(key: &str) -> Result<()> {
    unsafe {
        if let Some(cache) = &CACHE {
            let mut cache_guard = cache.write().await;
            cache_guard.remove(key);
        }
    }
    
    // Save to disk
    save_cache_to_disk().await?;
    
    Ok(())
}

pub async fn clear_cache() -> Result<()> {
    unsafe {
        if let Some(cache) = &CACHE {
            let mut cache_guard = cache.write().await;
            cache_guard.clear();
        }
        
        if let Some(operations) = &PENDING_OPERATIONS {
            let mut ops_guard = operations.lock().unwrap();
            ops_guard.clear();
        }
    }
    
    // Clear disk cache
    if let Err(e) = fs::remove_file("cache.json").await {
        if e.kind() != std::io::ErrorKind::NotFound {
            return Err(e.into());
        }
    }
    
    Ok(())
}

// =====================================================
// OFFLINE OPERATIONS
// =====================================================

pub async fn queue_offline_operation(
    operation: String,
    table: String,
    data: serde_json::Value,
) -> Result<String> {
    let operation_id = uuid::Uuid::new_v4().to_string();
    let offline_op = OfflineOperation {
        id: operation_id.clone(),
        operation,
        table,
        data,
        timestamp: Utc::now(),
        retry_count: 0,
        max_retries: 3,
    };
    
    unsafe {
        if let Some(operations) = &PENDING_OPERATIONS {
            let mut ops_guard = operations.lock().unwrap();
            ops_guard.push(offline_op);
        }
    }
    
    // Update metrics
    update_pending_operations_count().await;
    
    Ok(operation_id)
}

pub async fn get_pending_operations() -> Result<Vec<OfflineOperation>> {
    unsafe {
        if let Some(operations) = &PENDING_OPERATIONS {
            let ops_guard = operations.lock().unwrap();
            Ok(ops_guard.clone())
        } else {
            Ok(vec![])
        }
    }
}

pub async fn remove_pending_operation(operation_id: &str) -> Result<()> {
    unsafe {
        if let Some(operations) = &PENDING_OPERATIONS {
            let mut ops_guard = operations.lock().unwrap();
            ops_guard.retain(|op| op.id != operation_id);
        }
    }
    
    update_pending_operations_count().await;
    Ok(())
}

// =====================================================
// SYNC PROCESSOR
// =====================================================

async fn start_sync_processor() {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
    
    loop {
        interval.tick().await;
        
        if let Err(e) = process_pending_operations().await {
            eprintln!("Erro ao processar operações pendentes: {}", e);
        }
    }
}

async fn process_pending_operations() -> Result<()> {
    let operations = get_pending_operations().await?;
    
    for operation in operations {
        match process_single_operation(operation.clone()).await {
            Ok(_) => {
                remove_pending_operation(&operation.id).await?;
                println!("✅ Operação offline processada: {}", operation.id);
            }
            Err(e) => {
                println!("❌ Erro ao processar operação offline: {} - {}", operation.id, e);
                
                // Increment retry count
                unsafe {
                    if let Some(operations) = &PENDING_OPERATIONS {
                        let mut ops_guard = operations.lock().unwrap();
                        if let Some(op) = ops_guard.iter_mut().find(|op| op.id == operation.id) {
                            op.retry_count += 1;
                            
                            // Remove if max retries reached
                            if op.retry_count >= op.max_retries {
                                ops_guard.retain(|op| op.id != operation.id);
                                update_failed_sync_count().await;
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(())
}

async fn process_single_operation(operation: OfflineOperation) -> Result<()> {
    // This would integrate with Supabase to sync the operation
    // For now, simulate processing
    
    match operation.operation.as_str() {
        "CREATE" => {
            println!("🔄 Sincronizando criação: {} - {}", operation.table, operation.id);
            // Simulate API call
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        "UPDATE" => {
            println!("🔄 Sincronizando atualização: {} - {}", operation.table, operation.id);
            // Simulate API call
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        "DELETE" => {
            println!("🔄 Sincronizando exclusão: {} - {}", operation.table, operation.id);
            // Simulate API call
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        _ => {
            return Err(anyhow::anyhow!("Operação desconhecida: {}", operation.operation));
        }
    }
    
    Ok(())
}

// =====================================================
// CACHE CLEANUP
// =====================================================

async fn start_cache_cleanup() {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(300)); // 5 minutes
    
    loop {
        interval.tick().await;
        
        if let Err(e) = cleanup_expired_entries().await {
            eprintln!("Erro na limpeza do cache: {}", e);
        }
    }
}

async fn cleanup_expired_entries() -> Result<()> {
    let now = Utc::now();
    let mut expired_keys = Vec::new();
    
    unsafe {
        if let Some(cache) = &CACHE {
            let cache_guard = cache.read().await;
            
            for (key, entry) in cache_guard.iter() {
                let age = now.signed_duration_since(entry.timestamp);
                if age.num_seconds() >= entry.ttl_seconds as i64 {
                    expired_keys.push(key.clone());
                }
            }
        }
    }
    
    // Remove expired entries
    for key in expired_keys {
        remove_from_cache(&key).await?;
    }
    
    // Update cleanup timestamp
    unsafe {
        if let Some(metrics) = &mut CACHE_METRICS {
            metrics.last_cleanup = Some(Utc::now());
        }
    }
    
    Ok(())
}

// =====================================================
// METRICS UPDATER
// =====================================================

async fn start_metrics_updater() {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));
    
    loop {
        interval.tick().await;
        update_all_metrics().await;
    }
}

async fn update_all_metrics() {
    // Update cache metrics
    unsafe {
        if let Some(cache) = &CACHE {
            let cache_guard = cache.read().await;
            let total_entries = cache_guard.len() as u32;
            
            if let Some(metrics) = &mut CACHE_METRICS {
                metrics.total_entries = total_entries;
                metrics.memory_usage_mb = (total_entries as f64) * 0.1; // Estimate
            }
        }
    }
    
    update_pending_operations_count().await;
}

async fn update_cache_metrics(hit: bool) {
    unsafe {
        if let Some(metrics) = &mut CACHE_METRICS {
            if hit {
                metrics.hit_rate = (metrics.hit_rate + 1.0) / 2.0;
            } else {
                metrics.miss_rate = (metrics.miss_rate + 1.0) / 2.0;
            }
        }
    }
}

async fn update_pending_operations_count() {
    unsafe {
        if let Some(operations) = &PENDING_OPERATIONS {
            let ops_guard = operations.lock().unwrap();
            let count = ops_guard.len() as u32;
            
            if let Some(metrics) = &mut CACHE_METRICS {
                metrics.pending_sync = count;
            }
        }
    }
}

async fn update_failed_sync_count() {
    unsafe {
        if let Some(metrics) = &mut CACHE_METRICS {
            metrics.failed_sync += 1;
        }
    }
}

// =====================================================
// PERSISTENCE
// =====================================================

async fn save_cache_to_disk() -> Result<()> {
    unsafe {
        if let Some(cache) = &CACHE {
            let cache_guard = cache.read().await;
            let entries: Vec<CacheEntry> = cache_guard.values().cloned().collect();
            
            let json = serde_json::to_string_pretty(&entries)?;
            fs::write("cache.json", json).await?;
        }
    }
    
    Ok(())
}

async fn load_cache_from_disk() -> Result<()> {
    match fs::read_to_string("cache.json").await {
        Ok(json) => {
            let entries: Vec<CacheEntry> = serde_json::from_str(&json)?;
            
            unsafe {
                if let Some(cache) = &CACHE {
                    let mut cache_guard = cache.write().await;
                    for entry in &entries {
                        cache_guard.insert(entry.key.clone(), entry.clone());
                    }
                }
            }
            
            let entries_count = entries.len();
            println!("📁 Cache carregado do disco: {} entradas", entries_count);
        }
        Err(_) => {
            println!("📁 Nenhum cache encontrado no disco");
        }
    }
    
    Ok(())
}

// =====================================================
// PUBLIC API
// =====================================================

pub async fn get_cache_metrics() -> Result<CacheMetrics> {
    unsafe {
        if let Some(metrics) = &CACHE_METRICS {
            Ok(metrics.clone())
        } else {
            Err(anyhow::anyhow!("Cache metrics not initialized"))
        }
    }
}

pub async fn get_cache_size() -> Result<usize> {
    unsafe {
        if let Some(cache) = &CACHE {
            let cache_guard = cache.read().await;
            Ok(cache_guard.len())
        } else {
            Ok(0)
        }
    }
}

pub async fn is_cache_healthy() -> bool {
    unsafe {
        if let Some(metrics) = &CACHE_METRICS {
            metrics.hit_rate > 0.8 && metrics.failed_sync < 10
        } else {
            false
        }
    }
}
