import { PDFDocument } from 'pdf-lib';
/**
 * Formats a date from "YYYY-MM-DD" to "DD-MM-YY" (e.g. "2026-10-13" -> "13-10-26")
 */
export function formatDateToS302(dateStr) {
    if (!dateStr)
        return '';
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
        const year = parts[0].slice(-2);
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}-${month}-${year}`;
    }
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
 * Verifica se una visita richiede l'invio dell'S-302 adesso:
 * la visita è futura (o della settimana corrente) ed è entro 90 giorni da oggi.
 * Esempio: visita a febbraio 2027 → alert attivo da inizio novembre 2026 (90gg prima).
 */
export function isWithin90Days(startDate) {
    if (!startDate)
        return false;
    const start = new Date(startDate);
    if (isNaN(start.getTime()))
        return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Da -7 giorni (settimana in corso) fino a 90 giorni nel futuro
    return diffDays >= -7 && diffDays <= 90;
}
/**
 * Calcola il numero di giorni che mancano alla visita (negativo = già passata)
 */
export function daysUntilVisit(startDate) {
    if (!startDate)
        return Infinity;
    const start = new Date(startDate);
    if (isNaN(start.getTime()))
        return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
/**
 * Restituisce tutte le visite a congregazione che richiedono l'invio dell'S-302
 * entro 90 giorni, ordinate per data crescente.
 */
export function getUpcomingS302Alerts(settimane) {
    return settimane
        .filter((w) => w.evento === 'congregazione' && isWithin90Days(w.startDate))
        .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
}
/**
 * Genera il buffer del PDF S-302 compilato per una determinata settimana di visita
 */
export async function generateS302PdfBytes(settimana) {
    const response = await fetch('/S-302-template.pdf');
    if (!response.ok) {
        throw new Error('Impossibile caricare il modello PDF S-302');
    }
    const templateBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
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
    }
    catch (e) {
        console.warn('Dropdown1 non trovato o errore:', e);
    }
    const startFormatted = formatDateToS302(settimana.startDate);
    const endFormatted = formatDateToS302(settimana.endDate);
    try {
        const d1 = form.getTextField('Date1_af_date.0.0');
        d1.setText(startFormatted);
    }
    catch (e) {
        console.warn('Campo data inizio non trovato:', e);
    }
    try {
        const d2 = form.getTextField('Date1_af_date.0.1');
        d2.setText(endFormatted);
    }
    catch (e) {
        console.warn('Campo data fine non trovato:', e);
    }
    try {
        const tSorvegliante = form.getTextField('Text1');
        if (tSorvegliante)
            tSorvegliante.setText('Livio Pedrini');
    }
    catch (_) { }
    return await pdfDoc.save();
}
/**
 * Avvia il download del PDF S-302 per una singola settimana
 */
export async function downloadS302Pdf(settimana) {
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
export async function downloadAll90DaysS302(settimane) {
    const eligible = getUpcomingS302Alerts(settimane);
    for (let i = 0; i < eligible.length; i++) {
        await downloadS302Pdf(eligible[i]);
        if (i < eligible.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 400));
        }
    }
    return eligible.length;
}
/**
 * Invia il modulo S-302 via email.
 * Prima genera e scarica il PDF localmente, poi apre il client email pre-compilato.
 * L'utente dovrà allegare manualmente il PDF scaricato (limitazione dei browser).
 */
export async function emailS302Pdf(settimana, recipientEmail) {
    // Scarica prima il PDF sul dispositivo
    await downloadS302Pdf(settimana);
    const congName = settimana.dettagli && settimana.dettagli !== '-' ? settimana.dettagli : 'Congregazione';
    const fmt = (d) => d
        ? new Date(d).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
        : '';
    const sanitizedName = congName.replace(/[/\\?%*:|"<>]/g, '_');
    const subject = encodeURIComponent(`Avviso S-302 – ${congName} – ${fmt(settimana.startDate)}`);
    const body = encodeURIComponent(`Gentile Sorvegliante,\n\n` +
        `Le invio in allegato il modulo S-302 compilato per la visita alla congregazione di ${congName}.\n\n` +
        `Periodo visita: ${fmt(settimana.startDate)} – ${fmt(settimana.endDate)}\n\n` +
        `Il file "S-302-${sanitizedName}.pdf" è stato scaricato automaticamente sul suo dispositivo.\n` +
        `La preghiamo di allegarlo a questa email prima di inviarla.\n\n` +
        `Cordiali saluti,\nLivio Pedrini\nSorvegliante di Circoscrizione`);
    const mailto = `mailto:${recipientEmail || ''}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
}
