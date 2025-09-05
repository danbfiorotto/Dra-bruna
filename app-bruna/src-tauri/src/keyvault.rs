use anyhow::Result;
use std::collections::HashMap;
use aes_gcm::{Aes256Gcm, Key, Nonce, KeyInit};
use aes_gcm::aead::Aead;
use base64::{engine::general_purpose, Engine as _};
use rand::Rng;
use sha2::{Sha256, Digest};

#[cfg(target_os = "windows")]
use windows::{
    core::PCSTR,
    Win32::Security::Cryptography::{
        CryptProtectData, CryptUnprotectData, CRYPTPROTECT_UI_FORBIDDEN,
        DATA_BLOB, CRYPT_INTEGER_BLOB,
    },
};

pub struct KeyVault {
    master_key: Vec<u8>,
    key_cache: HashMap<String, Vec<u8>>,
}

impl KeyVault {
    pub fn new() -> Result<Self> {
        let master_key = Self::get_or_create_master_key()?;
        Ok(Self {
            master_key,
            key_cache: HashMap::new(),
        })
    }

    fn get_or_create_master_key() -> Result<Vec<u8>> {
        // Try to load existing key from DPAPI
        if let Ok(key) = Self::load_key_from_dpapi("dra_bruna_master_key") {
            return Ok(key);
        }

        // Generate new master key
        let mut key = [0u8; 32];
        rand::thread_rng().fill(&mut key);
        
        // Store in DPAPI
        Self::store_key_in_dpapi("dra_bruna_master_key", &key)?;
        
        Ok(key.to_vec())
    }

    #[cfg(target_os = "windows")]
    fn store_key_in_dpapi(key_name: &str, data: &[u8]) -> Result<()> {
        let data_blob = DATA_BLOB {
            cbData: data.len() as u32,
            pbData: data.as_ptr() as *mut u8,
        };

        let mut encrypted_blob = DATA_BLOB::default();
        let result = unsafe {
            CryptProtectData(
                &data_blob,
                PCSTR::from_raw(format!("Dra Bruna Clinic - {}", key_name).as_ptr() as *const u8),
                None,
                None,
                None,
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut encrypted_blob,
            )
        };

        if result.is_err() {
            return Err(anyhow::anyhow!("Failed to encrypt data with DPAPI"));
        }

        // Store encrypted data in registry or file system
        // For now, we'll use a simple file-based approach
        let app_data = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("Failed to get app data directory"))?
            .join("DraBrunaClinic");
        
        std::fs::create_dir_all(&app_data)?;
        
        let key_file = app_data.join(format!("{}.key", key_name));
        std::fs::write(key_file, unsafe {
            std::slice::from_raw_parts(encrypted_blob.pbData, encrypted_blob.cbData as usize)
        })?;

        Ok(())
    }

    #[cfg(target_os = "windows")]
    fn load_key_from_dpapi(key_name: &str) -> Result<Vec<u8>> {
        let app_data = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("Failed to get app data directory"))?
            .join("DraBrunaClinic");
        
        let key_file = app_data.join(format!("{}.key", key_name));
        
        if !key_file.exists() {
            return Err(anyhow::anyhow!("Key file not found"));
        }

        let encrypted_data = std::fs::read(key_file)?;
        
        let encrypted_blob = DATA_BLOB {
            cbData: encrypted_data.len() as u32,
            pbData: encrypted_data.as_ptr() as *mut u8,
        };

        let mut decrypted_blob = DATA_BLOB::default();
        let result = unsafe {
            CryptUnprotectData(
                &encrypted_blob,
                None,
                None,
                None,
                None,
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut decrypted_blob,
            )
        };

        if result.is_err() {
            return Err(anyhow::anyhow!("Failed to decrypt data with DPAPI"));
        }

        let decrypted_data = unsafe {
            std::slice::from_raw_parts(decrypted_blob.pbData, decrypted_blob.cbData as usize)
        };

        Ok(decrypted_data.to_vec())
    }

    #[cfg(not(target_os = "windows"))]
    fn store_key_in_dpapi(_key_name: &str, _data: &[u8]) -> Result<()> {
        // Fallback for non-Windows systems
        // In production, you'd want to use platform-specific key storage
        Err(anyhow::anyhow!("DPAPI not available on this platform"))
    }

    #[cfg(not(target_os = "windows"))]
    fn load_key_from_dpapi(_key_name: &str) -> Result<Vec<u8>> {
        // Fallback for non-Windows systems
        Err(anyhow::anyhow!("DPAPI not available on this platform"))
    }

    pub fn derive_key(&mut self, purpose: &str) -> Result<Vec<u8>> {
        if let Some(cached_key) = self.key_cache.get(purpose) {
            return Ok(cached_key.clone());
        }

        let mut hasher = Sha256::new();
        hasher.update(&self.master_key);
        hasher.update(purpose.as_bytes());
        let derived_key = hasher.finalize().to_vec();

        self.key_cache.insert(purpose.to_string(), derived_key.clone());
        Ok(derived_key)
    }

    pub fn encrypt_data(&mut self, data: &[u8], purpose: &str) -> Result<String> {
        let key_bytes = self.derive_key(purpose)?;
        let key = Key::from_slice(&key_bytes);
        let cipher = Aes256Gcm::new(key);

        let mut rng = rand::thread_rng();
        let mut nonce_bytes = [0u8; 12];
        rng.fill(&mut nonce_bytes);

        let nonce = Nonce::from_slice(&nonce_bytes);
        let ciphertext = cipher
            .encrypt(nonce, data)
            .map_err(|_| anyhow::anyhow!("Encryption failed"))?;

        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);

        Ok(general_purpose::STANDARD.encode(result))
    }

    pub fn decrypt_data(&mut self, encrypted_data: &str, purpose: &str) -> Result<Vec<u8>> {
        let key_bytes = self.derive_key(purpose)?;
        let key = Key::from_slice(&key_bytes);
        let cipher = Aes256Gcm::new(key);

        let data = general_purpose::STANDARD
            .decode(encrypted_data)
            .map_err(|_| anyhow::anyhow!("Invalid base64 data"))?;

        if data.len() < 12 {
            return Err(anyhow::anyhow!("Invalid encrypted data length"));
        }

        let nonce_bytes: [u8; 12] = data[0..12].try_into()
            .map_err(|_| anyhow::anyhow!("Invalid nonce"))?;
        let nonce = Nonce::from_slice(&nonce_bytes);
        let ciphertext = &data[12..];

        let plaintext = cipher
            .decrypt(nonce, ciphertext)
            .map_err(|_| anyhow::anyhow!("Decryption failed"))?;

        Ok(plaintext)
    }
}

impl Default for KeyVault {
    fn default() -> Self {
        Self::new().expect("Failed to initialize KeyVault")
    }
}
