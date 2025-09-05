use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use base64::Engine;

#[cfg(target_os = "windows")]
use windows::{

    Win32::Security::Cryptography::{
        CryptProtectData, CryptUnprotectData, CRYPTPROTECT_UI_FORBIDDEN, CRYPT_INTEGER_BLOB,
    },
    Win32::Foundation::{HLOCAL, LocalFree},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecureSession {
    pub user_id: String,
    pub email: String,
    pub role: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: String,
    pub created_at: String,
}

pub struct DpapiService {
    // In-memory cache for decrypted sessions
    sessions: HashMap<String, SecureSession>,
}

impl DpapiService {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
        }
    }

    pub fn store_session(&mut self, session_id: String, session: SecureSession) -> Result<()> {
        // Serialize session data
        let session_data = serde_json::to_string(&session)?;
        
        // Encrypt using DPAPI (Windows) or fallback to base64 encoding
        let _encrypted_data = self.encrypt_data(&session_data)?;
        
        // Store in memory cache
        self.sessions.insert(session_id.clone(), session);
        
        // In a real implementation, you would store the encrypted_data
        // in a secure location (registry, encrypted file, etc.)
        // For now, we'll just use the in-memory cache
        
        Ok(())
    }

    pub fn retrieve_session(&mut self, session_id: &str) -> Result<Option<SecureSession>> {
        // Check in-memory cache first
        if let Some(session) = self.sessions.get(session_id) {
            return Ok(Some(session.clone()));
        }

        // In a real implementation, you would:
        // 1. Retrieve encrypted data from secure storage
        // 2. Decrypt using DPAPI
        // 3. Deserialize and return session
        
        // For now, return None if not in cache
        Ok(None)
    }

    pub fn remove_session(&mut self, session_id: &str) -> Result<()> {
        self.sessions.remove(session_id);
        Ok(())
    }

    pub fn clear_all_sessions(&mut self) -> Result<()> {
        self.sessions.clear();
        Ok(())
    }

    fn encrypt_data(&self, data: &str) -> Result<String> {
        #[cfg(target_os = "windows")]
        {
            self.encrypt_with_dpapi(data)
        }
        #[cfg(not(target_os = "windows"))]
        {
            // Fallback for non-Windows systems
            use base64::{engine::general_purpose, Engine as _};
            Ok(general_purpose::STANDARD.encode(data.as_bytes()))
        }
    }

    fn decrypt_data(&self, encrypted_data: &str) -> Result<String> {
        #[cfg(target_os = "windows")]
        {
            self.decrypt_with_dpapi(encrypted_data)
        }
        #[cfg(not(target_os = "windows"))]
        {
            // Fallback for non-Windows systems
            use base64::{engine::general_purpose, Engine as _};
            let decoded = general_purpose::STANDARD.decode(encrypted_data)?;
            Ok(String::from_utf8(decoded)?)
        }
    }

    #[cfg(target_os = "windows")]
    fn encrypt_with_dpapi(&self, data: &str) -> Result<String> {
        unsafe {
            let data_bytes = data.as_bytes();
            let input_blob = CRYPT_INTEGER_BLOB {
                cbData: data_bytes.len() as u32,
                pbData: data_bytes.as_ptr() as *mut u8,
            };

            let mut output_blob = CRYPT_INTEGER_BLOB {
                cbData: 0,
                pbData: std::ptr::null_mut(),
            };

            let result = CryptProtectData(
                &input_blob,
                None,
                None,
                None,
                None,
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output_blob,
            );

            if result.is_ok() {
                let encrypted_bytes = std::slice::from_raw_parts(
                    output_blob.pbData,
                    output_blob.cbData as usize,
                );
                let encoded = base64::engine::general_purpose::STANDARD.encode(encrypted_bytes);
                
                // Free the allocated memory
                let _ = LocalFree(HLOCAL(output_blob.pbData as *mut std::ffi::c_void));
                
                Ok(encoded)
            } else {
                Err(anyhow::anyhow!("DPAPI encryption failed"))
            }
        }
    }

    #[cfg(target_os = "windows")]
    fn decrypt_with_dpapi(&self, encrypted_data: &str) -> Result<String> {
        unsafe {
            let encrypted_bytes = base64::engine::general_purpose::STANDARD.decode(encrypted_data)?;
            
            let input_blob = CRYPT_INTEGER_BLOB {
                cbData: encrypted_bytes.len() as u32,
                pbData: encrypted_bytes.as_ptr() as *mut u8,
            };

            let mut output_blob = CRYPT_INTEGER_BLOB {
                cbData: 0,
                pbData: std::ptr::null_mut(),
            };

            let result = CryptUnprotectData(
                &input_blob,
                None,
                None,
                None,
                None,
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output_blob,
            );

            if result.is_ok() {
                let decrypted_bytes = std::slice::from_raw_parts(
                    output_blob.pbData,
                    output_blob.cbData as usize,
                );
                let decrypted_string = String::from_utf8(decrypted_bytes.to_vec())?;
                
                // Free the allocated memory
                let _ = LocalFree(HLOCAL(output_blob.pbData as *mut std::ffi::c_void));
                
                Ok(decrypted_string)
            } else {
                Err(anyhow::anyhow!("DPAPI decryption failed"))
            }
        }
    }
}

impl Default for DpapiService {
    fn default() -> Self {
        Self::new()
    }
}
