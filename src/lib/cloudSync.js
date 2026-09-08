// Servizio di Sincronizzazione Multi-Dispositivo con Crittografia End-to-End (E2EE)
// Algoritmo: AES-GCM 256-bit — I dati vengono cifrati nel browser prima dell'invio.
// Nel cloud non viaggia MAI testo in chiaro. Nessun server terzo può leggerli.
import { getAllStoredSettimane, saveAllStoredSettimane, getStoredCongregazioni, saveStoredCongregazioni } from './storage';
import { encryptData, decryptData } from './crypto';
import { getActiveSessionPassword } from './auth';
const SYNC_STORAGE_KEYS = {
    SYNC_CODE: 'calendario_visite_sync_code',
    LAST_SYNC: 'calendario_visite_last_sync_timestamp',
    AUTO_SYNC: 'calendario_visite_auto_sync_enabled',
};
// Endpoint cloud store pubblico per sincronizzazione cifrata (Key-Value relay)
const CLOUD_VAULT_URL = 'https://kvdb.io/M8bT36rR42uE8xK2wKqDq9/';
/** Genera un codice di sincronizzazione alfanumerico casuale di 6 caratteri */
export function generateRandomSyncCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CV-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
/** Ottiene il codice di sincronizzazione salvato nel dispositivo */
export function getSavedSyncCode() {
    return localStorage.getItem(SYNC_STORAGE_KEYS.SYNC_CODE) || '';
}
/** Salva il codice di sincronizzazione nel dispositivo */
export function setSavedSyncCode(code) {
    if (code.trim()) {
        localStorage.setItem(SYNC_STORAGE_KEYS.SYNC_CODE, code.trim().toUpperCase());
        localStorage.setItem(SYNC_STORAGE_KEYS.AUTO_SYNC, 'true');
    }
    else {
        localStorage.removeItem(SYNC_STORAGE_KEYS.SYNC_CODE);
    }
}
/** Restituisce l'orario dell'ultima sincronizzazione riuscita */
export function getLastSyncTime() {
    const ts = localStorage.getItem(SYNC_STORAGE_KEYS.LAST_SYNC);
    if (!ts)
        return 'Mai';
    try {
        const d = new Date(parseInt(ts, 10));
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    catch {
        return 'Mai';
    }
}
/**
 * Invia (Push) i dati al Cloud Vault DOPO AVERLI CIFRATI con AES-256-GCM.
 * Anche se intercettato, il cloud contiene solo caratteri cifrati indecifrabili.
 */
export async function pushDataToCloud(syncCode, encryptionPassword) {
    const code = (syncCode || getSavedSyncCode()).trim().toUpperCase();
    if (!code) {
        return { success: false, error: 'Codice di sincronizzazione non impostato.' };
    }
    const pwd = encryptionPassword || getActiveSessionPassword();
    const plainPayload = {
        settimane: getAllStoredSettimane(),
        congregazioni: getStoredCongregazioni(),
        updatedAt: Date.now(),
        ownerId: code,
    };
    try {
        // 🛡️ Cifratura End-to-End con AES-GCM 256-bit nel browser
        const encryptedString = await encryptData(plainPayload, pwd);
        const cloudPayload = {
            isEncrypted: true,
            updatedAt: Date.now(),
            payload: encryptedString,
        };
        const res = await fetch(`${CLOUD_VAULT_URL}${encodeURIComponent(code)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cloudPayload),
        });
        if (!res.ok) {
            throw new Error(`Errore HTTP ${res.status}`);
        }
        localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC, Date.now().toString());
        return { success: true };
    }
    catch (err) {
        console.warn('Errore push sincronizzazione cloud E2EE:', err);
        return { success: false, error: 'Impossibile inviare i dati cifrati al cloud. Verifica la connessione internet.' };
    }
}
/**
 * Scarica (Pull) i dati dal Cloud Vault e li DECIFRA localmente tramite la password.
 */
export async function pullDataFromCloud(syncCode, decryptionPassword) {
    const code = (syncCode || getSavedSyncCode()).trim().toUpperCase();
    if (!code) {
        return { success: false, error: 'Codice di sincronizzazione non impostato.' };
    }
    const pwd = decryptionPassword || getActiveSessionPassword();
    try {
        const res = await fetch(`${CLOUD_VAULT_URL}${encodeURIComponent(code)}?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        if (res.status === 404) {
            return {
                success: false,
                error: 'Nessun dato trovato per questo codice. Assicurati che sia stato caricato dal primo dispositivo.',
            };
        }
        if (!res.ok) {
            throw new Error(`Errore HTTP ${res.status}`);
        }
        const cloudResponse = await res.json();
        let decryptedData;
        // Se è un pacchetto cifrato E2EE
        if (cloudResponse && cloudResponse.isEncrypted && cloudResponse.payload) {
            try {
                decryptedData = await decryptData(cloudResponse.payload, pwd);
            }
            catch (decErr) {
                return {
                    success: false,
                    error: 'Password errata: impossibile decifrare i dati protetti di questo calendario.',
                };
            }
        }
        else if (cloudResponse && cloudResponse.settimane) {
            // Retrocompatibilità per dati pre-crittografia
            decryptedData = cloudResponse;
        }
        else {
            return { success: false, error: 'Formato dei dati cloud non riconosciuto.' };
        }
        if (decryptedData && decryptedData.settimane) {
            saveAllStoredSettimane(decryptedData.settimane);
            if (decryptedData.congregazioni) {
                saveStoredCongregazioni(decryptedData.congregazioni);
            }
            localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC, Date.now().toString());
            return { success: true, data: decryptedData };
        }
        return { success: false, error: 'Dati decifrati non validi.' };
    }
    catch (err) {
        console.warn('Errore pull sincronizzazione cloud E2EE:', err);
        return {
            success: false,
            error: err.message || 'Impossibile recuperare i dati dal cloud. Verifica connessione o codice.',
        };
    }
}
