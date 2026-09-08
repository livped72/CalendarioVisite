// Modulo Crittografia End-to-End (E2EE) ad alta sicurezza tramite Web Crypto API nativa
// Algoritmo: AES-GCM 256-bit con derivazione chiave PBKDF2 (100.000 iterazioni SHA-256)

// Converte Uint8Array in stringa Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Converte stringa Base64 in Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Deriva una chiave AES-GCM a 256 bit da una password testuale usando PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPackage {
  encrypted: true;
  version: 1;
  salt: string;       // Base64
  iv: string;         // Base64
  ciphertext: string; // Base64
}

/**
 * Cifra qualsiasi dato JavaScript con password tramite AES-256-GCM
 * Restituisce una stringa JSON contenente il pacchetto cifrato con salt e iv
 */
export async function encryptData(data: any, password: string): Promise<string> {
  if (!password || password.length < 1) {
    throw new Error('Password di crittografia mancante.');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(data));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    plaintextBytes
  );

  const pkg: EncryptedPackage = {
    encrypted: true,
    version: 1,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
  };

  return JSON.stringify(pkg);
}

/**
 * Decifra un pacchetto cifrato tramite la password
 * Se la password è errata o i dati sono manomessi, genera un errore
 */
export async function decryptData<T = any>(encryptedString: string, password: string): Promise<T> {
  if (!password || password.length < 1) {
    throw new Error('Password mancante.');
  }

  let pkg: EncryptedPackage;
  try {
    pkg = JSON.parse(encryptedString);
  } catch {
    throw new Error('Formato pacchetto cifrato non valido.');
  }

  if (!pkg.encrypted || !pkg.salt || !pkg.iv || !pkg.ciphertext) {
    // Se non è cifrato, restituisce direttamente se era già JSON
    return pkg as any;
  }

  const salt = base64ToBuffer(pkg.salt);
  const iv = base64ToBuffer(pkg.iv);
  const ciphertext = base64ToBuffer(pkg.ciphertext);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
      },
      key,
      ciphertext as any
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedBuffer);
    return JSON.parse(decryptedText) as T;
  } catch (err) {
    throw new Error('Impossibile decifrare: la password inserita è errata oppure i dati sono stati compromessi.');
  }
}
