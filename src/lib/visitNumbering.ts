import { Settimana, PeriodoKey, Semestre } from '../types';
import { periodoKey } from './periodoUtils';

/**
 * Normalizza il nome della congregazione per confronti sicuri (case-insensitive, senza spazi superflui)
 */
export function normalizeCongName(name?: string): string {
  if (!name) return '';
  return name.trim().toLowerCase();
}

export interface VisitNumberResult {
  /** Numero progressivo assegnato (1, 2, 3...) */
  numero: number;
  /** Se questa visita ha fatto ripartire la numerazione da 1 */
  isReset: boolean;
  /** Motivazione descrittiva del numero assegnato */
  motivazione: string;
}

/**
 * Calcola i numeri progressivi di visita per tutte le settimane dell'anno di servizio teocratico.
 * 
 * Regole stabilite:
 * 1. L'anno di servizio comprende 1° semestre (set-feb) e 2° semestre (mar-ago).
 * 2. La prima congregazione inserita/visitata riceve il numero 1 (diventa la congregazione di riferimento del ciclo).
 * 3. Le congregazioni successive nel 1° semestre ricevono 2, 3, 4...
 * 4. Nel 2° semestre (mar-ago), la numerazione prosegue da quella del 1° semestre (es. 15, 16, 17...).
 * 5. Se durante il percorso viene inserita nuovamente la PRIMA congregazione del ciclo,
 *    la numerazione si azzera e riparte da 1, continuando poi progressivamente (2, 3...).
 * 6. È supportato anche il flag manuale `resetNumerazione: true` impostabile dall'utente.
 * 
 * @returns Mappa con `idSettimana -> VisitNumberResult`
 */
export function computeServiceYearVisitNumbers(
  anno: number,
  allSettimaneMap: Record<PeriodoKey, Settimana[]>
): Map<string, VisitNumberResult> {
  const keySetFeb = periodoKey(anno, 'set-feb');
  const keyMarAgo = periodoKey(anno, 'mar-ago');

  const weeksSetFeb = (allSettimaneMap[keySetFeb] || []).map((w) => ({
    ...w,
    semestre: 'set-feb' as Semestre,
    anno,
  }));
  const weeksMarAgo = (allSettimaneMap[keyMarAgo] || []).map((w) => ({
    ...w,
    semestre: 'mar-ago' as Semestre,
    anno,
  }));

  // Ordina cronologicamente tutte le settimane dell'anno di servizio
  const allYearWeeks = [...weeksSetFeb, ...weeksMarAgo].sort((a, b) => {
    if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
    if (a.startDate) return -1;
    if (b.startDate) return 1;
    return 0;
  });

  const resultMap = new Map<string, VisitNumberResult>();

  // Filtra le settimane di visita a una congregazione
  const congWeeks = allYearWeeks.filter((w) => w.evento === 'congregazione');

  if (congWeeks.length === 0) {
    return resultMap;
  }

  // Nome della prima congregazione inserita/pianificata nel ciclo
  let firstCongName = '';
  let currentCounter = 0;
  let hasFirstCongBeenIdentified = false;
  let hasResetOccurred = false;

  for (let i = 0; i < congWeeks.length; i++) {
    const week = congWeeks[i];
    const norm = normalizeCongName(week.dettagli);

    if (!hasFirstCongBeenIdentified) {
      // Prima congregazione assoluta del ciclo
      firstCongName = norm;
      hasFirstCongBeenIdentified = true;
      currentCounter = 1;
      resultMap.set(week.id, {
        numero: 1,
        isReset: false,
        motivazione: 'Prima congregazione del ciclo (Visita #1)',
      });
      continue;
    }

    // Se la settimana ha un reset manuale forzato
    if (week.resetNumerazione) {
      firstCongName = norm; // Nuova congregazione di inizio ciclo
      currentCounter = 1;
      hasResetOccurred = true;
      resultMap.set(week.id, {
        numero: 1,
        isReset: true,
        motivazione: 'Reset manuale richiesto: riparte da 1',
      });
      continue;
    }

    // Se incontra nuovamente la PRIMA congregazione inserita nel ciclo
    if (norm && norm === firstCongName) {
      currentCounter = 1;
      hasResetOccurred = true;
      resultMap.set(week.id, {
        numero: 1,
        isReset: true,
        motivazione: `Riprende dalla prima congregazione inserita (${week.dettagli}): la numerazione riparte da 1`,
      });
      continue;
    }

    // Altrimenti prosegue normalmente la numerazione (anche dal 1° al 2° semestre)
    currentCounter++;
    const isSecondSemester = week.semestre === 'mar-ago';
    resultMap.set(week.id, {
      numero: currentCounter,
      isReset: false,
      motivazione: hasResetOccurred
        ? `Visita progressiva #${currentCounter} (Nuovo ciclo)`
        : isSecondSemester
        ? `Continua la numerazione dal 1° semestre (#${currentCounter})`
        : `Visita progressiva #${currentCounter}`,
    });
  }

  return resultMap;
}

/**
 * Predice il numero di visita per una nuova settimana o una settimana modificata
 * prima ancora di salvarla.
 */
export function predictVisitNumber(params: {
  anno: number;
  semestre: Semestre;
  targetStartDate: string;
  targetCongregazioneNome: string;
  editingWeekId?: string;
  forceReset?: boolean;
  allSettimaneMap: Record<PeriodoKey, Settimana[]>;
}): VisitNumberResult {
  const {
    anno,
    semestre,
    targetStartDate,
    targetCongregazioneNome,
    editingWeekId,
    forceReset,
    allSettimaneMap,
  } = params;

  // Crea una copia virtuale delle settimane inserendo o aggiornando questa settimana
  const simulatedMap: Record<PeriodoKey, Settimana[]> = {};
  for (const [key, weeks] of Object.entries(allSettimaneMap)) {
    simulatedMap[key] = weeks.map((w) => ({ ...w }));
  }

  const pKey = periodoKey(anno, semestre);
  if (!simulatedMap[pKey]) {
    simulatedMap[pKey] = [];
  }

  const targetId = editingWeekId || '__temp_predict_id__';
  const simulatedWeek: Settimana = {
    id: targetId,
    numero: 0,
    periodo: '',
    startDate: targetStartDate,
    endDate: '',
    semestre,
    anno,
    evento: 'congregazione',
    dettagli: targetCongregazioneNome,
    note: '',
    resetNumerazione: forceReset,
  };

  const existingIdx = simulatedMap[pKey].findIndex((w) => w.id === targetId);
  if (existingIdx >= 0) {
    simulatedMap[pKey][existingIdx] = simulatedWeek;
  } else {
    simulatedMap[pKey].push(simulatedWeek);
  }

  const calculatedMap = computeServiceYearVisitNumbers(anno, simulatedMap);
  const result = calculatedMap.get(targetId);

  if (result) {
    return result;
  }

  return {
    numero: 1,
    isReset: false,
    motivazione: 'Prima congregazione',
  };
}
