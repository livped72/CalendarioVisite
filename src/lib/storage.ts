import { Settimana, Congregazione, Semestre, PeriodoKey, Appuntamento } from '../types';
import { initialCongregazioni, initialSettimaneSetFeb, initialSettimaneMarAgo } from '../data/initialData';
import { abbreviateMonths } from './dateUtils';
import { periodoKey } from './periodoUtils';

// Local storage keys
const KEYS = {
  SETTIMANE: 'calendario_visite_settimane',     // Record<PeriodoKey, Settimana[]>
  CONGREGAZIONI: 'calendario_visite_congregazioni',
  APPUNTAMENTI: 'calendario_visite_appuntamenti',
};


// --- Settimane ---

export function getStoredSettimane(anno: number, semestre: Semestre): Settimana[] {
  try {
    const all = getAllStoredSettimane();
    const key = periodoKey(anno, semestre);
    if (all[key]) {
      return all[key].map((w) => ({ ...w, periodo: abbreviateMonths(w.periodo) }));
    }
    // Seed with initial data for the "current" known period
    const defaults =
      anno === 2026 && semestre === 'set-feb'
        ? initialSettimaneSetFeb
        : anno === 2026 && semestre === 'mar-ago'
        ? initialSettimaneMarAgo
        : [];
    all[key] = defaults;
    localStorage.setItem(KEYS.SETTIMANE, JSON.stringify(all));
    return defaults;
  } catch {
    return [];
  }
}

export function getAllStoredSettimane(): Record<PeriodoKey, Settimana[]> {
  try {
    const raw = localStorage.getItem(KEYS.SETTIMANE);
    if (!raw) {
      // Migrate old data
      const legacySetFeb = localStorage.getItem('calendario_visite_settimane_set_feb');
      const legacyMarAgo = localStorage.getItem('calendario_visite_settimane_mar_ago');
      const result: Record<PeriodoKey, Settimana[]> = {};
      if (legacySetFeb) result[periodoKey(2026, 'set-feb')] = JSON.parse(legacySetFeb);
      if (legacyMarAgo) result[periodoKey(2026, 'mar-ago')] = JSON.parse(legacyMarAgo);
      if (Object.keys(result).length) {
        localStorage.setItem(KEYS.SETTIMANE, JSON.stringify(result));
        return result;
      }
      // Default seed
      const seed: Record<PeriodoKey, Settimana[]> = {
        [periodoKey(2026, 'set-feb')]: initialSettimaneSetFeb,
        [periodoKey(2026, 'mar-ago')]: initialSettimaneMarAgo,
      };
      localStorage.setItem(KEYS.SETTIMANE, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredSettimane(anno: number, semestre: Semestre, data: Settimana[]): void {
  try {
    const all = getAllStoredSettimane();
    all[periodoKey(anno, semestre)] = data;
    localStorage.setItem(KEYS.SETTIMANE, JSON.stringify(all));
  } catch (e) {
    console.error('Error saving settimane:', e);
  }
}

export function saveAllStoredSettimane(data: Record<PeriodoKey, Settimana[]>): void {
  try {
    localStorage.setItem(KEYS.SETTIMANE, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving all settimane:', e);
  }
}

// --- Congregazioni ---

export function getStoredCongregazioni(): Congregazione[] {
  try {
    const raw = localStorage.getItem(KEYS.CONGREGAZIONI);
    if (!raw) {
      localStorage.setItem(KEYS.CONGREGAZIONI, JSON.stringify(initialCongregazioni));
      return initialCongregazioni;
    }
    return (JSON.parse(raw) as Congregazione[]).map((c) => ({
      ...c,
      ultimaVisita: abbreviateMonths(c.ultimaVisita),
    }));
  } catch {
    return initialCongregazioni;
  }
}

export function saveStoredCongregazioni(data: Congregazione[]): void {
  try {
    localStorage.setItem(KEYS.CONGREGAZIONI, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving congregazioni:', e);
  }
}

// --- Appuntamenti ---

export const initialAppuntamenti: Appuntamento[] = [
  {
    id: 'app_1',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-01',
    oraInizio: '18:00',
    oraFine: '19:00',
    titolo: 'Incontro con i Pionieri',
    categoria: 'pionieri',
    luogo: 'Sala del Regno',
    note: 'Incoraggiamento all\'inizio dell\'anno di servizio.',
  },
  {
    id: 'app_2',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-01',
    oraInizio: '19:30',
    oraFine: '20:45',
    titolo: 'Adunanza infrasettimanale & Discorso di servizio',
    categoria: 'adunanza',
    luogo: 'Sala del Regno',
    note: 'Discorso conclusivo di servizio del sorvegliante.',
  },
  {
    id: 'app_3',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-02',
    oraInizio: '09:30',
    oraFine: '12:00',
    titolo: 'Servizio di campo',
    categoria: 'servizio',
    luogo: 'Ritrovo Sala del Regno',
    note: 'Predicazione di casa in casa nel territorio.',
  },
  {
    id: 'app_4',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-02',
    oraInizio: '13:00',
    oraFine: '14:30',
    titolo: 'Pranzo di ospitalità',
    categoria: 'pranzo',
    luogo: 'Famiglia Rossi',
    note: 'Pranzo con i proclamatori della congregazione.',
  },
  {
    id: 'app_5',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-02',
    oraInizio: '15:30',
    oraFine: '17:00',
    titolo: 'Visita Pastorale',
    categoria: 'pastorale',
    luogo: 'Via Roma 15',
    note: 'Visita di incoraggiamento.',
  },
  {
    id: 'app_6',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-04',
    oraInizio: '19:00',
    oraFine: '20:30',
    titolo: 'Incontro con il Corpo degli Anziani',
    categoria: 'anziani',
    luogo: 'Sala del Regno - Biblioteca',
    note: 'Analisi bisogni spirituali della congregazione.',
  },
  {
    id: 'app_7',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-05',
    oraInizio: '09:30',
    oraFine: '12:00',
    titolo: 'Servizio di campo del fine settimana',
    categoria: 'servizio',
    luogo: 'Piazza Centrale',
    note: 'Testimonianza pubblica e di casa in casa.',
  },
  {
    id: 'app_8',
    settimanaId: 'w1',
    congregazioneId: 'c1',
    data: '2026-09-06',
    oraInizio: '10:00',
    oraFine: '11:45',
    titolo: 'Discorso Pubblico & Studio Torre di Guardia',
    categoria: 'discorso',
    luogo: 'Sala del Regno',
    note: 'Discorso speciale della visita e conclusioni.',
  },
];

export function getStoredAppuntamenti(): Appuntamento[] {
  try {
    const raw = localStorage.getItem(KEYS.APPUNTAMENTI);
    if (!raw) {
      localStorage.setItem(KEYS.APPUNTAMENTI, JSON.stringify(initialAppuntamenti));
      return initialAppuntamenti;
    }
    return JSON.parse(raw) as Appuntamento[];
  } catch {
    return initialAppuntamenti;
  }
}

export function saveStoredAppuntamenti(data: Appuntamento[]): void {
  try {
    localStorage.setItem(KEYS.APPUNTAMENTI, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving appuntamenti:', e);
  }
}

// --- Backup / Restore ---

export function exportBackupJSON(): void {
  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    settimane: getAllStoredSettimane(),
    congregazioni: getStoredCongregazioni(),
    appuntamenti: getStoredAppuntamenti(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_calendario_visite_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importBackupJSON(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.settimane && typeof parsed.settimane === 'object') {
          saveAllStoredSettimane(parsed.settimane);
        }
        if (parsed.congregazioni && Array.isArray(parsed.congregazioni)) {
          saveStoredCongregazioni(parsed.congregazioni);
        }
        if (parsed.appuntamenti && Array.isArray(parsed.appuntamenti)) {
          saveStoredAppuntamenti(parsed.appuntamenti);
        }
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
}

export function resetToDefaults(): void {
  localStorage.setItem(
    KEYS.SETTIMANE,
    JSON.stringify({
      [periodoKey(2026, 'set-feb')]: initialSettimaneSetFeb,
      [periodoKey(2026, 'mar-ago')]: initialSettimaneMarAgo,
    })
  );
  localStorage.setItem(KEYS.CONGREGAZIONI, JSON.stringify(initialCongregazioni));
  localStorage.setItem(KEYS.APPUNTAMENTI, JSON.stringify(initialAppuntamenti));
}

