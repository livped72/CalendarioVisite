// Sistema di autenticazione e sicurezza locale (Zero Firebase, 100% privato e gratuito)

const STORAGE_KEYS = {
  PASSWORD_HASH: 'calendario_visite_pwd_hash',
  SESSION_AUTH: 'calendario_visite_session_unlocked',
  SESSION_PWD: 'calendario_visite_session_pwd',
  PIN: 'calendario_visite_pin', // per retrocompatibilità
};

// Funzione di hash per verifica password locale
function hashPassword(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `cv_salt_${Math.abs(hash)}_${pwd.length}`;
}

/** Verifica se è configurata una password per l'accesso */
export function isPasswordConfigured(): boolean {
  return Boolean(
    localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH) ||
    localStorage.getItem(STORAGE_KEYS.PIN)
  );
}

/** Verifica la password inserita e, se corretta, la salva nella sessione per la crittografia E2EE */
export function verifyPassword(inputPwd: string): boolean {
  const storedHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
  let isValid = false;
  if (storedHash) {
    isValid = storedHash === hashPassword(inputPwd);
  } else {
    const storedPin = localStorage.getItem(STORAGE_KEYS.PIN);
    if (storedPin) {
      isValid = storedPin === inputPwd;
    } else {
      isValid = true; // Nessuna password impostata
    }
  }

  if (isValid) {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_PWD, inputPwd);
    setSessionUnlocked(true);
  }

  return isValid;
}

/** Imposta o aggiorna la password */
export function setPassword(newPwd: string): void {
  const hash = hashPassword(newPwd);
  localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash);
  localStorage.removeItem(STORAGE_KEYS.PIN);
  sessionStorage.setItem(STORAGE_KEYS.SESSION_PWD, newPwd);
  setSessionUnlocked(true);
}

/** Cambia la password verificando quella attuale */
export function changePassword(currentPwd: string, newPwd: string): { success: boolean; error?: string } {
  if (isPasswordConfigured()) {
    if (!verifyPassword(currentPwd)) {
      return { success: false, error: 'La password attuale non è corretta.' };
    }
  }
  if (!newPwd || newPwd.length < 4) {
    return { success: false, error: 'La nuova password deve avere almeno 4 caratteri.' };
  }
  setPassword(newPwd);
  return { success: true };
}

/** Rimuove la protezione con password */
export function removePassword(): void {
  localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
  localStorage.removeItem(STORAGE_KEYS.PIN);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_PWD);
  setSessionUnlocked(true);
}

/** Restituisce la password attiva della sessione per la crittografia E2EE */
export function getActiveSessionPassword(): string {
  return sessionStorage.getItem(STORAGE_KEYS.SESSION_PWD) || 'default_calendario_visite_key';
}

/** Imposta la password di sessione (usata ad esempio dopo sincronizzazione) */
export function setActiveSessionPassword(pwd: string): void {
  sessionStorage.setItem(STORAGE_KEYS.SESSION_PWD, pwd);
}

/** Stato sblocco sessione corrente */
export function isSessionUnlocked(): boolean {
  if (!isPasswordConfigured()) return true;
  return sessionStorage.getItem(STORAGE_KEYS.SESSION_AUTH) === 'true';
}

export function setSessionUnlocked(unlocked: boolean): void {
  if (unlocked) {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_AUTH, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_AUTH);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_PWD);
  }
}
