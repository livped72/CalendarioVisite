export type TipoEvento =
  | 'congregazione'
  | 'settimana_libera'
  | 'assenza'
  | 'scuola_pionieri'
  | 'settimana_pioniere'
  | 'assemblea_circoscrizione'
  | 'congresso'
  | 'evento_personalizzato';

export interface AnnoSemestre {
  anno: number;
  semestre: 'set-feb' | 'mar-ago';
}

/** Chiave stringa per identificare univocamente un periodo, es. "2026-set-feb" */
export type PeriodoKey = string; // `${anno}-${'set-feb'|'mar-ago'}`

export type Semestre = 'set-feb' | 'mar-ago';

export interface Settimana {
  id: string;
  numero: number;       // numero progressivo visita (solo per congregazioni)
  periodo: string;      // es. "1 – 6 set 2026"
  startDate: string;    // ISO date
  endDate: string;      // ISO date
  semestre: Semestre;
  anno: number;
  evento: TipoEvento;
  dettagli: string;
  congregazioneId?: string;
  note: string;
}

export interface Congregazione {
  id: string;
  nome: string;
  ultimaVisita: string;
  ultimaVisitaDate: string;
  settimaneTrascorse: number;
  totaleVisite: number;
  citta?: string;
  contatto?: string;
  note?: string;
}

export interface EventoConfig {
  tipo: TipoEvento;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconName: string;
}

export interface UserProfile {
  nome: string;
  email: string;
  avatarInitials: string;
}

export interface KPIStats {
  settimaneProgrammate: number;
  totaleSettimane: number;
  congregazioniVisitate: number;
  totaleCongregazioni: number;
  mediaSettimane: number;
  prossimaSettimana: {
    periodo: string;
    stato: string;
  };
}

export type TabNav =
  | 'calendario'
  | 'congregazioni'
  | 'situazione'
  | 'eventi_personalizzati'
  | 'impostazioni'
  | 'aiuto';

export type CategoriaAppuntamento =
  | 'servizio'
  | 'adunanza'
  | 'anziani'
  | 'servitori'
  | 'pionieri'
  | 'pastorale'
  | 'discorso'
  | 'pranzo'
  | 'personale'
  | 'altro';

export interface Appuntamento {
  id: string;
  settimanaId?: string;       // ID settimana corrispondente (se collegata)
  congregazioneId?: string;   // ID congregazione (opzionale)
  data: string;               // ISO "YYYY-MM-DD"
  oraInizio: string;          // es. "09:30"
  oraFine?: string;           // es. "11:30"
  titolo: string;
  categoria: CategoriaAppuntamento;
  luogo?: string;
  note?: string;
}

/** Struttura dati cloud sincronizzata */
export interface CalendarioData {
  /** Mappa periodoKey → array di settimane */
  settimane: Record<PeriodoKey, Settimana[]>;
  congregazioni: Congregazione[];
  appuntamenti?: Appuntamento[];
  updatedAt: number;
  ownerId: string;
}

