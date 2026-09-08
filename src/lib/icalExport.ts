import { Settimana, Appuntamento, Congregazione } from '../types';

/**
 * Converte una data e un orario ("YYYY-MM-DD" e "HH:MM") in stringa iCal locale "YYYYMMDDTHHMMSS"
 */
function toICalDateTime(dateStr: string, timeStr?: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) {
    return `${cleanDate}T090000`;
  }
  const parts = timeStr.trim().split(':');
  const hh = (parts[0] || '09').padStart(2, '0');
  const mm = (parts[1] || '00').padStart(2, '0');
  return `${cleanDate}T${hh}${mm}00`;
}

/**
 * Restituisce il giorno successivo in formato "YYYYMMDD" per gli eventi all-day inclusivi RFC 5545
 */
function getNextDayICal(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  } catch {
    return dateStr.replace(/-/g, '');
  }
}

/**
 * Pulisce e formatta le stringhe per iCal (escape di virgole, punti e virgola, ritorni a capo)
 */
function escapeICalText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Genera il contenuto completo in formato standard RFC 5545 iCalendar (.ics)
 */
export function generateICalendar(
  settimane: Settimana[],
  appuntamenti: Appuntamento[] = [],
  congregazioni: Congregazione[] = []
): string {
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const congMap = new Map<string, Congregazione>(congregazioni.map((c) => [c.id, c]));

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendario Visite//Circoscrizione//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Calendario Visite & Appuntamenti',
    'X-WR-TIMEZONE:Europe/Rome',
  ];

  // 1. Aggiungi le settimane / visite pianificate
  for (const s of settimane) {
    if (!s.startDate || !s.endDate) continue;

    const startICal = s.startDate.replace(/-/g, '');
    const endICal = getNextDayICal(s.endDate);
    const cong = s.congregazioneId ? congMap.get(s.congregazioneId) : undefined;

    let summary = s.dettagli && s.dettagli !== '-' ? s.dettagli : s.evento.toUpperCase();
    if (s.evento === 'congregazione') {
      summary = `Visita: ${summary}`;
    }

    let description = `Periodo: ${s.periodo}\\nTipo: ${s.evento}`;
    if (s.note && s.note !== '-') {
      description += `\\nNote: ${escapeICalText(s.note)}`;
    }
    if (cong?.contatto) {
      description += `\\nReferente: ${escapeICalText(cong.contatto)}`;
    }

    const location = escapeICalText(cong?.citta || cong?.note || '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:settimana-${s.id}-${startICal}@calendariovisite.local`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${startICal}`);
    lines.push(`DTEND;VALUE=DATE:${endICal}`);
    lines.push(`SUMMARY:${escapeICalText(summary)}`);
    lines.push(`DESCRIPTION:${description}`);
    if (location) lines.push(`LOCATION:${location}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT');
    lines.push('END:VEVENT');
  }

  // 2. Aggiungi i singoli appuntamenti ed eventi
  for (const a of appuntamenti) {
    if (!a.data) continue;

    const startDT = toICalDateTime(a.data, a.oraInizio);
    const endDT = toICalDateTime(a.data, a.oraFine || (a.oraInizio ? addHourToTime(a.oraInizio) : undefined));

    let description = `Categoria: ${a.categoria}`;
    if (a.note) {
      description += `\\nNote: ${escapeICalText(a.note)}`;
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:app-${a.id}-${startDT}@calendariovisite.local`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${startDT}`);
    lines.push(`DTEND:${endDT}`);
    lines.push(`SUMMARY:${escapeICalText(a.titolo)}`);
    lines.push(`DESCRIPTION:${description}`);
    if (a.luogo) lines.push(`LOCATION:${escapeICalText(a.luogo)}`);
    lines.push(`CATEGORIES:${escapeICalText(a.categoria.toUpperCase())}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function addHourToTime(timeStr: string): string {
  const parts = timeStr.split(':');
  let h = parseInt(parts[0] || '0', 10) + 1;
  if (h > 23) h = 23;
  return `${String(h).padStart(2, '0')}:${parts[1] || '00'}`;
}

/**
 * Avvia il download del file .ics nel browser dell'utente
 */
export function downloadICalFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Crea un link diretto per aggiungere un evento o visita a Google Calendar
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  details?: string;
  location?: string;
}): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.details || '');
  const location = encodeURIComponent(event.location || '');

  let datesParam = '';
  if (event.startTime) {
    const sDate = event.startDate.replace(/-/g, '');
    const sTime = event.startTime.replace(/:/g, '') + '00';
    const eDate = (event.endDate || event.startDate).replace(/-/g, '');
    const eTime = (event.endTime ? event.endTime.replace(/:/g, '') : addHourToTime(event.startTime).replace(/:/g, '')) + '00';
    datesParam = `${sDate}T${sTime}/${eDate}T${eTime}`;
  } else {
    // All day
    const sDate = event.startDate.replace(/-/g, '');
    const eDate = getNextDayICal(event.endDate || event.startDate);
    datesParam = `${sDate}/${eDate}`;
  }

  return `${base}&text=${text}&dates=${datesParam}&details=${details}&location=${location}`;
}
