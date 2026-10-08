// Gestione Accesso Biometrico Veloce (Touch ID / Face ID / Windows Hello)
// Utilizza la Web Authentication API (WebAuthn) con Platform Authenticator nativo del dispositivo.

import { loginAccount } from './accountAuth';

const BIOMETRIC_KEYS = {
  CREDENTIAL_ID: 'cv_bio_cred_id',
  ENCRYPTED_VAULT: 'cv_bio_vault',
  SALT: 'cv_bio_salt',
  IV: 'cv_bio_iv',
  USER_LABEL: 'cv_bio_user_label',
  ENABLED: 'cv_bio_enabled',
};

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getEffectiveRpId(): string {
  if (typeof window === 'undefined') return 'localhost';
  const host = window.location.hostname;
  return host === '127.0.0.1' ? 'localhost' : host;
}

/**
 * Verifica se il dispositivo e il browser supportano l'autenticazione biometrica (Touch ID / Face ID / Windows Hello)
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(available);
    }
    return false;
  } catch (e) {
    console.warn('Verifica biometrica non supportata:', e);
    return false;
  }
}

/**
 * Verifica se l'utente ha già abilitato l'accesso biometrico su questo dispositivo
 */
export function isBiometricsEnrolled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(BIOMETRIC_KEYS.ENABLED) === 'true' &&
    Boolean(localStorage.getItem(BIOMETRIC_KEYS.CREDENTIAL_ID)) &&
    Boolean(localStorage.getItem(BIOMETRIC_KEYS.ENCRYPTED_VAULT))
  );
}

/**
 * Restituisce il nome utente o email salvato per l'accesso biometrico su questo dispositivo
 */
export function getBiometricUserLabel(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(BIOMETRIC_KEYS.USER_LABEL) || '';
}

/**
 * Registra e abilita l'accesso biometrico (Touch ID / Face ID) sul dispositivo corrente
 */
export async function enrollBiometrics(
  email: string,
  password: string,
  userDisplayName = 'Livio Pedrini'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supported = await isBiometricsSupported();
    if (!supported) {
      return {
        success: false,
        error: 'Il tuo browser o dispositivo non dispone di un sensore biometrico compatibile (Touch ID, Face ID o Windows Hello).',
      };
    }

    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const userId = window.crypto.getRandomValues(new Uint8Array(16));
    const rpId = getEffectiveRpId();

    const creationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Calendario Visite',
        id: rpId,
      },
      user: {
        id: userId,
        name: email,
        displayName: userDisplayName || email,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: creationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Registrazione biometrica non completata.' };
    }

    // Crittografa i dati di accesso (email + password) derivando la chiave da rawId
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      credential.rawId,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const payload = JSON.stringify({ email, password });
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      new TextEncoder().encode(payload)
    );

    // Salva le informazioni nel vault locale
    localStorage.setItem(BIOMETRIC_KEYS.CREDENTIAL_ID, bufferToBase64(credential.rawId));
    localStorage.setItem(BIOMETRIC_KEYS.SALT, bufferToBase64(salt));
    localStorage.setItem(BIOMETRIC_KEYS.IV, bufferToBase64(iv));
    localStorage.setItem(BIOMETRIC_KEYS.ENCRYPTED_VAULT, bufferToBase64(encrypted));
    localStorage.setItem(BIOMETRIC_KEYS.USER_LABEL, email);
    localStorage.setItem(BIOMETRIC_KEYS.ENABLED, 'true');

    return { success: true };
  } catch (err: any) {
    console.error('Errore registrazione biometrica:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Operazione biometrica annullata o rifiutata.' };
    }
    return { success: false, error: err.message || 'Impossibile configurare l\'accesso biometrico.' };
  }
}

/**
 * Esegue il login rapido tramite Touch ID / Face ID
 */
export async function loginWithBiometrics(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isBiometricsEnrolled()) {
      return { success: false, error: 'Accesso biometrico non ancora configurato su questo dispositivo.' };
    }

    const credIdBase64 = localStorage.getItem(BIOMETRIC_KEYS.CREDENTIAL_ID);
    const saltBase64 = localStorage.getItem(BIOMETRIC_KEYS.SALT);
    const ivBase64 = localStorage.getItem(BIOMETRIC_KEYS.IV);
    const vaultBase64 = localStorage.getItem(BIOMETRIC_KEYS.ENCRYPTED_VAULT);

    if (!credIdBase64 || !saltBase64 || !ivBase64 || !vaultBase64) {
      return { success: false, error: 'Configurazione biometrica incompleta o corrotta.' };
    }

    const credentialId = base64ToBuffer(credIdBase64);
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const rpId = getEffectiveRpId();

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId,
      allowCredentials: [
        {
          id: credentialId,
          type: 'public-key',
        },
      ],
      userVerification: 'preferred',
      timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
      publicKey: requestOptions,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return { success: false, error: 'Riconoscimento biometrico annullato.' };
    }

    // Ricostruisci la chiave di decifratura a partire da rawId dell'asserzione
    const salt = new Uint8Array(base64ToBuffer(saltBase64));
    const iv = new Uint8Array(base64ToBuffer(ivBase64));
    const encryptedBytes = base64ToBuffer(vaultBase64);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      assertion.rawId,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encryptedBytes
    );

    const { email, password } = JSON.parse(new TextDecoder().decode(decrypted));

    // Esegue il login standard con le credenziali decifrate
    return await loginAccount(email, password);
  } catch (err: any) {
    console.error('Errore accesso biometrico:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Riconoscimento biometrico annullato o rifiutato.' };
    }
    return { success: false, error: err.message || 'Errore durante la scansione biometrica.' };
  }
}

/**
 * Aggiorna la password salvata nel vault biometrico (es. dopo il cambio password)
 */
export async function updateBiometricPassword(newPassword: string): Promise<boolean> {
  try {
    if (!isBiometricsEnrolled()) return false;
    const credIdBase64 = localStorage.getItem(BIOMETRIC_KEYS.CREDENTIAL_ID);
    const userLabel = localStorage.getItem(BIOMETRIC_KEYS.USER_LABEL) || 'pedrinilivio@gmail.com';
    if (!credIdBase64) return false;

    const credentialRawId = base64ToBuffer(credIdBase64);
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      credentialRawId,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const payload = JSON.stringify({ email: userLabel, password: newPassword });
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      new TextEncoder().encode(payload)
    );

    localStorage.setItem(BIOMETRIC_KEYS.SALT, bufferToBase64(salt));
    localStorage.setItem(BIOMETRIC_KEYS.IV, bufferToBase64(iv));
    localStorage.setItem(BIOMETRIC_KEYS.ENCRYPTED_VAULT, bufferToBase64(encrypted));
    return true;
  } catch (e) {
    console.warn('Impossibile aggiornare vault biometrico con la nuova password:', e);
    return false;
  }
}

/**
 * Disabilita e rimuove la configurazione biometrica da questo dispositivo
 */
export function removeBiometrics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BIOMETRIC_KEYS.CREDENTIAL_ID);
  localStorage.removeItem(BIOMETRIC_KEYS.SALT);
  localStorage.removeItem(BIOMETRIC_KEYS.IV);
  localStorage.removeItem(BIOMETRIC_KEYS.ENCRYPTED_VAULT);
  localStorage.removeItem(BIOMETRIC_KEYS.USER_LABEL);
  localStorage.removeItem(BIOMETRIC_KEYS.ENABLED);
}
