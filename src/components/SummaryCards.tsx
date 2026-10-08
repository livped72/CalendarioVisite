import React, { useState } from 'react';
import { Calendar, MapPin, Download, Loader2 } from 'lucide-react';
import { KPIStats, Settimana } from '../types';
import { downloadS302Pdf, isWithin90Days } from '../lib/pdfGenerator';

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

  return (
    <div className="space-y-2 pt-2">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Informazioni periodo corrente
      </h3>

      {/* Visualizzazione unica della visita successiva */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-200 transition-all">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Prossima visita
              </span>
              {canDownloadS302 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Entro 90 giorni
                </span>
              )}
            </div>

            <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight">
              {stats.prossimaSettimana.periodo}
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-purple-700">
              <MapPin className="w-4 h-4 shrink-0 text-purple-500" />
              <button
                type="button"
                onClick={onPlanNextWeek}
                className="hover:underline text-left truncate cursor-pointer"
                title="Dettagli settimana"
              >
                {stats.prossimaSettimana.stato.replace(/^📍\s*/, '')}
              </button>
            </div>
          </div>
        </div>

        {/* Azioni rapide */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          {canDownloadS302 && (
            <button
              type="button"
              onClick={handleDownloadS302}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Scarica avviso S-302 compilato per questa visita"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Scarica Avviso S-302</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPlanNextWeek}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Modifica / Dettagli
          </button>
        </div>
      </div>
    </div>
  );
};
