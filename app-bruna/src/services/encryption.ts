/**
 * Serviço de criptografia para documentos médicos
 * Implementa AES-GCM para criptografia cliente-side
 */

export interface EncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  tag: Uint8Array;
  salt: Uint8Array;
}

export interface DecryptionData {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  tag: Uint8Array;
  salt: Uint8Array;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits para GCM
  private static readonly SALT_LENGTH = 16; // 128 bits

  /**
   * Gera uma chave de criptografia a partir de uma senha
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Gera um salt aleatório
   */
  private static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
  }

  /**
   * Gera um IV aleatório
   */
  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
  }

  /**
   * Criptografa dados usando AES-GCM
   */
  static async encrypt(data: ArrayBuffer, password: string): Promise<EncryptionResult> {
    try {
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = await this.deriveKey(password, salt);

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: new Uint8Array(iv)
        },
        key,
        data
      );

      // Para AES-GCM, o tag está incluído no encryptedData
      // Precisamos separá-lo
      const tagLength = 16; // 128 bits para GCM
      const ciphertext = encryptedData.slice(0, encryptedData.byteLength - tagLength);
      const tag = new Uint8Array(encryptedData.slice(encryptedData.byteLength - tagLength));

      return {
        encryptedData: ciphertext,
        iv: iv,
        tag: tag,
        salt: salt
      };
    } catch (error) {
      console.error('Erro na criptografia:', error);
      throw new Error('Falha na criptografia dos dados');
    }
  }

  /**
   * Descriptografa dados usando AES-GCM
   */
  static async decrypt(encryptionData: DecryptionData, password: string): Promise<ArrayBuffer> {
    try {
      const key = await this.deriveKey(password, encryptionData.salt);

      // Reconstruir o encryptedData com o tag
      const encryptedWithTag = new Uint8Array(
        encryptionData.encryptedData.byteLength + encryptionData.tag.byteLength
      );
      encryptedWithTag.set(new Uint8Array(encryptionData.encryptedData), 0);
      encryptedWithTag.set(encryptionData.tag, encryptionData.encryptedData.byteLength);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: new Uint8Array(encryptionData.iv)
        },
        key,
        encryptedWithTag
      );

      return decryptedData;
    } catch (error) {
      console.error('Erro na descriptografia:', error);
      throw new Error('Falha na descriptografia dos dados. Verifique a senha.');
    }
  }

  /**
   * Criptografa um arquivo File
   */
  static async encryptFile(file: File, password: string): Promise<{
    encryptedData: ArrayBuffer;
    iv: Uint8Array;
    tag: Uint8Array;
    salt: Uint8Array;
    originalName: string;
    originalType: string;
    originalSize: number;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const encryptionResult = await this.encrypt(arrayBuffer, password);

    return {
      ...encryptionResult,
      originalName: file.name,
      originalType: file.type,
      originalSize: file.size
    };
  }

  /**
   * Descriptografa um arquivo e retorna como Blob
   */
  static async decryptFile(
    encryptedData: ArrayBuffer,
    iv: Uint8Array,
    tag: Uint8Array,
    salt: Uint8Array,
    password: string,
    mimeType: string
  ): Promise<Blob> {
    const decryptedData = await this.decrypt(
      { encryptedData, iv, tag, salt },
      password
    );

    return new Blob([decryptedData], { type: mimeType });
  }

  /**
   * Gera um hash SHA-256 de um arquivo
   */
  static async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Converte ArrayBuffer para base64
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converte base64 para ArrayBuffer
   */
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Serializa dados de criptografia para armazenamento
   */
  static serializeEncryptionData(data: EncryptionResult): string {
    return JSON.stringify({
      encryptedData: this.arrayBufferToBase64(data.encryptedData),
      iv: Array.from(data.iv),
      tag: Array.from(data.tag),
      salt: Array.from(data.salt)
    });
  }

  /**
   * Deserializa dados de criptografia do armazenamento
   */
  static deserializeEncryptionData(serialized: string): DecryptionData {
    const parsed = JSON.parse(serialized);
    return {
      encryptedData: this.base64ToArrayBuffer(parsed.encryptedData),
      iv: new Uint8Array(parsed.iv),
      tag: new Uint8Array(parsed.tag),
      salt: new Uint8Array(parsed.salt)
    };
  }
}
