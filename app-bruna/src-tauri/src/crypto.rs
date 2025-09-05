use anyhow::Result;
use aes_gcm::{Aes256Gcm, Key, Nonce, KeyInit};
use aes_gcm::aead::Aead;
use base64::{engine::general_purpose, Engine as _};
use rand::Rng;
use sha2::{Sha256, Digest};
use pbkdf2::pbkdf2_hmac;
use argon2::{Argon2, PasswordHasher, password_hash::{SaltString, rand_core::OsRng}};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedDocument {
    pub content: String, // Base64 encoded encrypted content
    pub iv: String,      // Base64 encoded IV
    pub salt: String,    // Base64 encoded salt
    pub tag: String,     // Base64 encoded authentication tag
    pub file_hash: String, // SHA-256 hash of original file
}

pub struct CryptoService {
    master_key: [u8; 32],
}

impl CryptoService {
    pub fn new(master_password: &str) -> Result<Self> {
        // Derive master key from password using Argon2
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(master_password.as_bytes(), &salt)
            .map_err(|e| anyhow::anyhow!("Password hashing failed: {}", e))?;
        
        // Use the hash as master key (first 32 bytes)
        let mut master_key = [0u8; 32];
        let hash = password_hash.hash.unwrap();
        let hash_bytes = hash.as_bytes();
        master_key.copy_from_slice(&hash_bytes[..32]);
        
        Ok(Self { master_key })
    }

    pub fn new_with_key(master_key: [u8; 32]) -> Self {
        Self { master_key }
    }

    pub fn encrypt_document(&self, content: &[u8], _filename: &str) -> Result<EncryptedDocument> {
        // Generate unique salt for this document
        let mut salt = [0u8; 32];
        rand::thread_rng().fill(&mut salt[..]);
        
        // Derive content key using PBKDF2
        let mut content_key = [0u8; 32];
        pbkdf2_hmac::<Sha256>(&self.master_key, &salt, 100000, &mut content_key);
        
        // Generate random IV
        let mut iv = [0u8; 12];
        rand::thread_rng().fill(&mut iv[..]);
        
        // Create cipher
        let key = Key::<aes_gcm::Aes256Gcm>::from_slice(&content_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&iv);
        
        // Encrypt content
        let ciphertext = cipher
            .encrypt(nonce, content)
            .map_err(|_| anyhow::anyhow!("Document encryption failed"))?;
        
        // Calculate file hash
        let mut hasher = Sha256::new();
        hasher.update(content);
        let file_hash = format!("{:x}", hasher.finalize());
        
        // Extract tag (last 16 bytes of ciphertext)
        let tag = &ciphertext[ciphertext.len() - 16..];
        let content_without_tag = &ciphertext[..ciphertext.len() - 16];
        
        Ok(EncryptedDocument {
            content: general_purpose::STANDARD.encode(content_without_tag),
            iv: general_purpose::STANDARD.encode(iv),
            salt: general_purpose::STANDARD.encode(salt),
            tag: general_purpose::STANDARD.encode(tag),
            file_hash,
        })
    }

    pub fn decrypt_document(&self, encrypted_doc: &EncryptedDocument) -> Result<Vec<u8>> {
        // Decode components
        let salt = general_purpose::STANDARD.decode(&encrypted_doc.salt)?;
        let iv = general_purpose::STANDARD.decode(&encrypted_doc.iv)?;
        let content = general_purpose::STANDARD.decode(&encrypted_doc.content)?;
        let tag = general_purpose::STANDARD.decode(&encrypted_doc.tag)?;
        
        // Derive content key using same salt
        let mut content_key = [0u8; 32];
        pbkdf2_hmac::<Sha256>(&self.master_key, &salt, 100000, &mut content_key);
        
        // Reconstruct ciphertext with tag
        let mut ciphertext = content;
        ciphertext.extend_from_slice(&tag);
        
        // Create cipher
        let key = Key::<aes_gcm::Aes256Gcm>::from_slice(&content_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&iv);
        
        // Decrypt content
        let plaintext = cipher
            .decrypt(nonce, ciphertext.as_slice())
            .map_err(|_| anyhow::anyhow!("Document decryption failed"))?;
        
        // Verify file hash
        let mut hasher = Sha256::new();
        hasher.update(&plaintext);
        let calculated_hash = format!("{:x}", hasher.finalize());
        
        if calculated_hash != encrypted_doc.file_hash {
            return Err(anyhow::anyhow!("File hash verification failed - document may be corrupted"));
        }
        
        Ok(plaintext)
    }

    pub fn verify_document_integrity(&self, encrypted_doc: &EncryptedDocument, original_content: &[u8]) -> Result<bool> {
        let mut hasher = Sha256::new();
        hasher.update(original_content);
        let calculated_hash = format!("{:x}", hasher.finalize());
        
        Ok(calculated_hash == encrypted_doc.file_hash)
    }

    // Legacy methods for backward compatibility
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<String> {
        let mut rng = rand::thread_rng();
        let mut nonce_bytes = [0u8; 12]; // 96 bits for GCM
        rng.fill(&mut nonce_bytes);

        let key = Key::<aes_gcm::Aes256Gcm>::from_slice(&self.master_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let ciphertext = cipher
            .encrypt(nonce, plaintext)
            .map_err(|_| anyhow::anyhow!("Encryption failed"))?;

        // Combine nonce + ciphertext
        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);

        Ok(general_purpose::STANDARD.encode(result))
    }

    pub fn decrypt(&self, encrypted_data: &str) -> Result<Vec<u8>> {
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

        let key = Key::<aes_gcm::Aes256Gcm>::from_slice(&self.master_key);
        let cipher = Aes256Gcm::new(key);
        
        let plaintext = cipher
            .decrypt(nonce, ciphertext)
            .map_err(|_| anyhow::anyhow!("Decryption failed"))?;

        Ok(plaintext)
    }
}

impl Default for CryptoService {
    fn default() -> Self {
        // Use a default master password for development
        // In production, this should be provided by the user
        Self::new("DraBrunaClinic2024!DefaultPassword").expect("Failed to initialize crypto service")
    }
}
