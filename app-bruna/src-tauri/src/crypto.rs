use anyhow::Result;
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};
use base64::{engine::general_purpose, Engine as _};
use rand::Rng;

pub struct CryptoService {
    cipher: Aes256Gcm,
}

impl CryptoService {
    pub fn new() -> Result<Self> {
        // In production, this should be derived from a master password
        // For now, we'll use a fixed key (this should be changed!)
        let key_bytes = b"DraBrunaClinicKey2024!32bytes"; // 32 bytes for AES-256
        let key = Key::from_slice(key_bytes);
        let cipher = Aes256Gcm::new(key);

        Ok(Self { cipher })
    }

    pub fn encrypt(&self, plaintext: &[u8]) -> Result<String> {
        let mut rng = rand::thread_rng();
        let mut nonce_bytes = [0u8; 12]; // 96 bits for GCM
        rng.fill(&mut nonce_bytes);

        let nonce = Nonce::from_slice(&nonce_bytes);
        let ciphertext = self.cipher
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

        let plaintext = self.cipher
            .decrypt(nonce, ciphertext)
            .map_err(|_| anyhow::anyhow!("Decryption failed"))?;

        Ok(plaintext)
    }
}

impl Default for CryptoService {
    fn default() -> Self {
        Self::new().expect("Failed to initialize crypto service")
    }
}
