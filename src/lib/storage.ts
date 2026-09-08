import { Settimana, Congregazione, Semestre, PeriodoKey } from '../types';
import { initialCongregazioni, initialSettimaneSetFeb, initialSettimaneMarAgo } from '../data/initialData';
import { abbreviateMonths } from './dateUtils';
import { periodoKey } from './periodoUtils';

// Local storage keys
const KEYS = {
  SETTIMANE: 'calendario_visite_settimane',     // Record<PeriodoKey, Settimana[]>
  CONGREGAZIONI: 'calendario_visite_congregazioni',
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

// --- Backup / Restore ---

export function exportBackupJSON(): void {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    settimane: getAllStoredSettimane(),
    congregazioni: getStoredCongregazioni(),
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
}
