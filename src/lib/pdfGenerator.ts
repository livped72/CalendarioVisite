import { PDFDocument } from 'pdf-lib';
import { Settimana } from '../types';

/**
 * Formats a date from "YYYY-MM-DD" to "DD-MM-YY" (e.g. "2026-10-13" -> "13-10-26")
 */
export function formatDateToS302(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const year = parts[0].slice(-2);
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
  // Fallback for Date objects or other formats
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

/**
 * Verifica se una data di inizio visita è entro i 90 giorni da oggi
 * (inclusa la settimana in corso e i successivi 90 giorni)
 */
export function isWithin90Days(startDate?: string): boolean {
  if (!startDate) return false;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Differenza in giorni tra la data di visita e la data odierna
  const diffTime = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Consideriamo da -7 giorni (visita della settimana corrente) fino a 90 giorni futuri
  return diffDays >= -7 && diffDays <= 90;
}

/**
 * Genera il buffer del PDF S-302 compilato per una determinata settimana di visita
 */
export async function generateS302PdfBytes(settimana: Settimana): Promise<Uint8Array> {
  const response = await fetch('/S-302-template.pdf');
  if (!response.ok) {
    throw new Error('Impossibile caricare il modello PDF S-302');
  }
  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Nome congregazione
  const congName = (settimana.dettagli && settimana.dettagli !== '-' ? settimana.dettagli : 'CONGREGAZIONE')
    .trim()
    .toUpperCase();

  try {
    const dd = form.getDropdown('Dropdown1');
    const options = dd.getOptions();
    if (!options.includes(congName)) {
      dd.addOptions([congName]);
    }
    dd.select(congName);
  } catch (e) {
    console.warn('Dropdown1 non trovato o errore:', e);
  }

  // Date
  const startFormatted = formatDateToS302(settimana.startDate);
  const endFormatted = formatDateToS302(settimana.endDate);

  try {
    const d1 = form.getTextField('Date1_af_date.0.0');
    d1.setText(startFormatted);
  } catch (e) {
    console.warn('Campo data inizio non trovato:', e);
  }

  try {
    const d2 = form.getTextField('Date1_af_date.0.1');
    d2.setText(endFormatted);
  } catch (e) {
    console.warn('Campo data fine non trovato:', e);
  }

  // Se ci sono altri campi per il sorvegliante o la firma
  try {
    const tSorvegliante = form.getTextField('Text1');
    if (tSorvegliante) tSorvegliante.setText('Livio Pedrini');
  } catch (_) {}

  return await pdfDoc.save();
}

/**
 * Avvia il download del PDF S-302 per una singola settimana
 */
export async function downloadS302Pdf(settimana: Settimana): Promise<void> {
  const bytes = await generateS302PdfBytes(settimana);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const sanitizedName = (settimana.dettagli || 'visita').replace(/[/\\?%*:|"<>]/g, '_');
  a.href = url;
  a.download = `S-302-${sanitizedName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Scarica automaticamente tutti i moduli S-302 per le visite entro 90 giorni
 */
export async function downloadAll90DaysS302(settimane: Settimana[]): Promise<number> {
  const eligible = settimane.filter(
    (w) => w.evento === 'congregazione' && isWithin90Days(w.startDate)
  );

  for (let i = 0; i < eligible.length; i++) {
    await downloadS302Pdf(eligible[i]);
    // Breve pausa per evitare blocchi del browser sui download multipli
    if (i < eligible.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  return eligible.length;
}
