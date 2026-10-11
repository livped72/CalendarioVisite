import React, { useState } from 'react';
import { AlertTriangle, FileDown, Mail, X, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Settimana } from '../types';
import { daysUntilVisit, downloadS302Pdf, emailS302Pdf, downloadAll90DaysS302 } from '../lib/pdfGenerator';

interface S302AlertBannerProps {
  /** Lista delle visite entro i 90 giorni che richiedono l'invio dell'S-302 */
  alerts: Settimana[];
}

function urgencyLabel(days: number): { text: string; className: string } {
  if (days <= 7) return { text: 'URGENTE', className: 'bg-red-600 text-white' };
  if (days <= 30) return { text: 'PRIORITÀ ALTA', className: 'bg-orange-500 text-white' };
  return { text: 'DA INVIARE', className: 'bg-blue-700 text-white' };
}

export const S302AlertBanner: React.FC<S302AlertBannerProps> = ({ alerts }) => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  if (dismissed || alerts.length === 0) return null;

  const mostUrgent = alerts[0];
  const daysLeft = daysUntilVisit(mostUrgent.startDate);

  const handleDownload = async (item: Settimana) => {
    setDownloadingId(item.id);
    try {
      await downloadS302Pdf(item);
    } catch (err) {
      alert('Errore nella generazione del PDF S-302.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEmail = async (item: Settimana) => {
    setEmailingId(item.id);
    try {
      await emailS302Pdf(item);
    } catch (err) {
      alert('Errore nella preparazione dell\'email S-302.');
    } finally {
      setEmailingId(null);
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      await downloadAll90DaysS302(alerts);
    } catch (err) {
      alert('Errore nel download multiplo S-302.');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Choose banner style based on urgency
  const isUrgent = daysLeft <= 7;
  const isHigh = daysLeft <= 30;

  const bannerBg = isUrgent
    ? 'bg-red-50 border-red-300'
    : isHigh
    ? 'bg-orange-50 border-orange-300'
    : 'bg-blue-50 border-blue-300';

  const iconColor = isUrgent ? 'text-red-600' : isHigh ? 'text-orange-500' : 'text-blue-700';
  const titleColor = isUrgent ? 'text-red-800' : isHigh ? 'text-orange-800' : 'text-blue-800';
  const subtitleColor = isUrgent ? 'text-red-700' : isHigh ? 'text-orange-700' : 'text-blue-700';
  const badgeBg = isUrgent
    ? 'bg-red-100 text-red-700 border-red-300'
    : isHigh
    ? 'bg-orange-100 text-orange-700 border-orange-300'
    : 'bg-blue-100 text-blue-700 border-blue-300';

  const btnPrimary = isUrgent
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : isHigh
    ? 'bg-orange-500 hover:bg-orange-600 text-white'
    : 'bg-blue-700 hover:bg-blue-800 text-white';

  const btnSecondary = isUrgent
    ? 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
    : isHigh
    ? 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-50'
    : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50';

  return (
    <div
      className={`rounded-2xl border-2 shadow-md overflow-hidden transition-all ${bannerBg}`}
      role="alert"
      aria-live="polite"
    >
      {/* Header barra */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icona pulsante */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isUrgent ? 'bg-red-100' : isHigh ? 'bg-orange-100' : 'bg-blue-100'
            }`}
          >
            {isUrgent ? (
              <AlertTriangle className={`w-5 h-5 ${iconColor} animate-pulse`} />
            ) : (
              <Clock className={`w-5 h-5 ${iconColor}`} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-black uppercase tracking-wide ${titleColor}`}>
                {alerts.length === 1
                  ? '⚠️ Invio S-302 richiesto'
                  : `⚠️ ${alerts.length} moduli S-302 da inviare`}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${urgencyLabel(daysLeft).className}`}
              >
                {urgencyLabel(daysLeft).text}
              </span>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${subtitleColor}`}>
              {alerts.length === 1
                ? `Visita a ${mostUrgent.dettagli || 'congregazione'} — ${
                    daysLeft <= 0
                      ? 'questa settimana!'
                      : daysLeft === 1
                      ? 'domani!'
                      : `tra ${daysLeft} giorni`
                  } — invia l'S-302 entro il termine dei 90 giorni.`
                : `Prossima: ${mostUrgent.dettagli || 'congregazione'} tra ${daysLeft > 0 ? daysLeft : 0} giorni. Controlla e invia tutti i moduli.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle espandi/comprimi */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`p-2 rounded-xl transition-colors ${btnSecondary} cursor-pointer`}
            title={expanded ? 'Comprimi dettagli' : 'Espandi dettagli'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {/* Chiudi banner */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={`p-2 rounded-xl transition-colors ${btnSecondary} cursor-pointer`}
            title="Chiudi avviso (temporaneamente)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dettaglio espandibile */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {/* Riga download tutti */}
          {alerts.length > 1 && (
            <div
              className={`flex flex-wrap items-center gap-2 p-3 rounded-xl border mb-1 ${
                isUrgent
                  ? 'bg-red-100/60 border-red-200'
                  : isHigh
                  ? 'bg-orange-100/60 border-orange-200'
                  : 'bg-blue-100/60 border-blue-200'
              }`}
            >
              <span className={`text-xs font-semibold flex-1 ${subtitleColor}`}>
                Scarica tutti i {alerts.length} moduli S-302 in una volta
              </span>
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 ${btnPrimary}`}
              >
                {downloadingAll ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>Scarica tutti ({alerts.length})</span>
              </button>
            </div>
          )}

          {/* Lista visite */}
          <div className="space-y-1.5">
            {alerts.map((item) => {
              const days = daysUntilVisit(item.startDate);
              const { className: urgClass } = urgencyLabel(days);
              const isThisDownloading = downloadingId === item.id;
              const isThisEmailing = emailingId === item.id;

              // Format dates nicely
              const startLabel = item.startDate
                ? new Date(item.startDate).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : item.periodo;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-white/80 ${badgeBg.replace('text-', 'border-').replace('bg-', '')}`}
                  style={{ borderColor: isUrgent ? '#fca5a5' : isHigh ? '#fdba74' : '#93c5fd' }}
                >
                  {/* Info visita */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${urgClass}`}
                    >
                      {days <= 0 ? 'OGGI' : `${days}gg`}
                    </span>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${titleColor}`}>
                        {item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{startLabel}</div>
                    </div>
                  </div>

                  {/* Azioni per questa visita */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {/* Scarica PDF */}
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      disabled={isThisDownloading}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 ${btnPrimary}`}
                      title="Scarica modulo S-302 compilato"
                    >
                      {isThisDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Scarica</span>
                      <span className="sm:hidden">PDF</span>
                    </button>

                    {/* Invia via Email */}
                    <button
                      type="button"
                      onClick={() => handleEmail(item)}
                      disabled={isThisEmailing || isThisDownloading}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 ${btnSecondary}`}
                      title="Scarica PDF e apri l'email pre-compilata"
                    >
                      {isThisEmailing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Invia Email</span>
                      <span className="sm:hidden">Email</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota informativa */}
          <p className={`text-[11px] leading-relaxed mt-2 ${subtitleColor}`}>
            ℹ️ <strong>Come funziona "Invia Email":</strong> Il PDF viene scaricato automaticamente, poi si apre il programma email con il messaggio pre-compilato. Allega il PDF scaricato prima di inviare.
          </p>
        </div>
      )}
    </div>
  );
};
