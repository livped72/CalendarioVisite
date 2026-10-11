import React, { useState } from 'react';
import { Mail, FileDown, Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Settimana } from '../types';
import { downloadS302Pdf, emailS302Pdf, getS302TargetMonth, getS302TargetMonthAlerts, downloadAll90DaysS302 } from '../lib/pdfGenerator';

interface S302AlertBannerProps {
  /** Tutte le settimane di tutti i periodi (allSettimaneMap appiattita) */
  allSettimane: Settimana[];
}

export const S302AlertBanner: React.FC<S302AlertBannerProps> = ({ allSettimane }) => {
  const [expanded, setExpanded] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [emailingAll, setEmailingAll] = useState(false);

  const { label: monthLabel } = getS302TargetMonth();
  const alerts = getS302TargetMonthAlerts(allSettimane);

  // Niente da mostrare se non ci sono visite nel mese target
  if (alerts.length === 0) return null;

  const handleDownload = async (item: Settimana) => {
    setDownloadingId(item.id);
    try {
      await downloadS302Pdf(item);
    } catch {
      alert('Errore nella generazione del PDF S-302.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEmail = async (item: Settimana) => {
    setEmailingId(item.id);
    try {
      await emailS302Pdf(item);
    } catch {
      alert("Errore nella preparazione dell'email S-302.");
    } finally {
      setEmailingId(null);
    }
  };

  const handleEmailAll = async () => {
    setEmailingAll(true);
    try {
      for (let i = 0; i < alerts.length; i++) {
        await emailS302Pdf(alerts[i]);
        if (i < alerts.length - 1) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    } catch {
      alert('Errore durante l\'invio email multiplo S-302.');
    } finally {
      setEmailingAll(false);
    }
  };

  return (
    <div
      className="rounded-2xl border border-indigo-200 bg-indigo-50 shadow-sm overflow-hidden"
      role="alert"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-indigo-900 uppercase tracking-wide">
                Moduli S-302 — {monthLabel}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                {alerts.length} {alerts.length === 1 ? 'visita' : 'visite'}
              </span>
            </div>
            <p className="text-xs mt-0.5 text-indigo-700 font-medium">
              Invia i moduli S-302 per le visite di {monthLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Invia tutti via email */}
          <button
            type="button"
            onClick={handleEmailAll}
            disabled={emailingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title={`Invia email S-302 per tutte le ${alerts.length} visite di ${monthLabel}`}
          >
            {emailingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Invia tutte ({alerts.length})</span>
            <span className="sm:hidden">Email</span>
          </button>

          {/* Espandi/comprimi */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-2 rounded-xl bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title={expanded ? 'Comprimi' : 'Espandi'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Lista visite */}
      {expanded && (
        <div className="px-4 pb-4 space-y-1.5">
          {alerts.map((item) => {
            const isDownloading = downloadingId === item.id;
            const isEmailing = emailingId === item.id;
            const dateLabel = item.startDate
              ? new Date(item.startDate).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : item.periodo;
            const congName =
              item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white border border-indigo-100 shadow-xs"
              >
                {/* Info */}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-indigo-900 truncate">{congName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{dateLabel}</div>
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Scarica PDF */}
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    disabled={isDownloading || isEmailing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                    title="Scarica PDF S-302"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>PDF</span>
                  </button>

                  {/* Invia email */}
                  <button
                    type="button"
                    onClick={() => handleEmail(item)}
                    disabled={isEmailing || isDownloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    title="Scarica PDF e prepara email S-302"
                  >
                    {isEmailing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>Invia Email</span>
                  </button>
                </div>
              </div>
            );
          })}

          <p className="text-[11px] text-indigo-600 mt-2 leading-relaxed">
            ℹ️ Il PDF viene scaricato automaticamente, poi si apre il programma email pre-compilato. Allega il PDF prima di inviare.
          </p>
        </div>
      )}
    </div>
  );
};
