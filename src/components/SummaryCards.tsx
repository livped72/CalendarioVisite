import React, { useState } from 'react';
import { Calendar, MapPin, Download, Mail, Loader2 } from 'lucide-react';
import { KPIStats, Settimana } from '../types';
import { downloadS302Pdf, emailS302Pdf, isWithin90Days } from '../lib/pdfGenerator';

interface SummaryCardsProps {
  stats: KPIStats;
  nextSettimana?: Settimana;
  onPlanNextWeek?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  nextSettimana,
  onPlanNextWeek,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const canDownloadS302 =
    nextSettimana &&
    nextSettimana.evento === 'congregazione' &&
    isWithin90Days(nextSettimana.startDate);

  const handleDownloadS302 = async () => {
    if (!nextSettimana) return;
    setIsDownloading(true);
    try {
      await downloadS302Pdf(nextSettimana);
    } catch (err) {
      console.error('Errore durante la generazione del PDF:', err);
      alert('Errore durante la generazione del modulo S-302');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailS302 = async () => {
    if (!nextSettimana) return;
    setIsEmailing(true);
    try {
      await emailS302Pdf(nextSettimana);
    } catch (err) {
      console.error('Errore durante la preparazione email S-302:', err);
      alert('Errore durante la preparazione dell\'email S-302');
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
        Informazioni periodo corrente
      </h3>

      {/* Card prossima visita */}
      <div className="bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-4 sm:p-5 flex flex-col gap-4 hover:border-blue-500/50 transition-all">
        {/* Riga superiore: icona + testo */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Prossima visita
              </span>
              {canDownloadS302 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/60">
                  S-302 entro 90 giorni
                </span>
              )}
            </div>

            <div className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight leading-snug">
              {stats.prossimaSettimana.periodo}
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-blue-300">
              <MapPin className="w-4 h-4 shrink-0 text-blue-400" />
              <button
                type="button"
                onClick={onPlanNextWeek}
                className="hover:underline text-left truncate cursor-pointer text-blue-300 hover:text-blue-100"
                title="Dettagli settimana"
              >
                {stats.prossimaSettimana.stato.replace(/^📍\s*/, '')}
              </button>
            </div>
          </div>
        </div>

        {/* Riga inferiore: azioni S-302 */}
        {canDownloadS302 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 font-medium mr-auto hidden sm:block">
              Modulo S-302 disponibile per questa visita
            </span>
            <button
              type="button"
              onClick={handleDownloadS302}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-950/50 cursor-pointer disabled:opacity-50"
              title="Scarica avviso S-302 compilato per questa visita"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Scarica S-302</span>
            </button>

            <button
              type="button"
              onClick={handleEmailS302}
              disabled={isEmailing || isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#142342] border border-[#1E3A5F] text-blue-200 hover:bg-[#1A2C52] hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Scarica PDF e apri email pre-compilata per invio"
            >
              {isEmailing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span>Invia via Email</span>
            </button>
          </div>
        )}

        {/* Azioni base quando non è periodo S-302 */}
        {!canDownloadS302 && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#1E3A5F]">
            <button
              type="button"
              onClick={onPlanNextWeek}
              className="px-3.5 py-2 rounded-xl bg-[#142342] hover:bg-[#1A2C52] text-blue-200 border border-[#1E3A5F] text-xs font-bold transition-colors cursor-pointer"
            >
              Modifica / Dettagli
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
