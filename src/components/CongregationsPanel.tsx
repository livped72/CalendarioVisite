import React, { useState } from 'react';
import { Info, ExternalLink, ArrowRight } from 'lucide-react';
import { Congregazione, Settimana } from '../types';
import { abbreviateMonths } from '../lib/dateUtils';

interface CongregationsPanelProps {
  congregazioni: Congregazione[];
  settimane: Settimana[];
  onViewAll: () => void;
  onSelectCongregazione?: (c: Congregazione) => void;
  /** Naviga al tab appuntamenti, opzionalmente su una settimana specifica */
  onNavigateToSettimana?: (settimanaId?: string) => void;
}

export const CongregationsPanel: React.FC<CongregationsPanelProps> = ({
  congregazioni,
  settimane,
  onViewAll,
  onSelectCongregazione,
  onNavigateToSettimana,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Sort by weeks elapsed descending (highest urgency first)
  const sorted = [...congregazioni].sort((a, b) => b.settimaneTrascorse - a.settimaneTrascorse);
  const topList = sorted.slice(0, 8);

  /** Trova la prossima settimana futura legata a questa congregazione */
  const findSettimanaForCong = (congId: string): Settimana | undefined => {
    const today = new Date().toISOString().slice(0, 10);
    const future = settimane
      .filter((s) => s.congregazioneId === congId && s.startDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (future.length > 0) return future[0];
    // fallback: ultima passata
    const past = settimane
      .filter((s) => s.congregazioneId === congId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return past[0];
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
      case 1:
        return {
          badgeBg: 'bg-rose-600 text-white shadow-xs',
          textClass: 'text-rose-400 font-bold',
          borderClass: 'border-rose-900/60 bg-[#171E36]',
          linkClass: 'text-rose-300 hover:text-rose-200',
        };
      case 2:
      case 3:
        return {
          badgeBg: 'bg-amber-600 text-white shadow-xs',
          textClass: 'text-amber-400 font-bold',
          borderClass: 'border-amber-900/60 bg-[#16223C]',
          linkClass: 'text-amber-300 hover:text-amber-200',
        };
      default:
        return {
          badgeBg: 'bg-blue-600 text-white shadow-xs',
          textClass: 'text-blue-400 font-bold',
          borderClass: 'border-[#1E3A5F] bg-[#142342]',
          linkClass: 'text-blue-300 hover:text-white',
        };
    }
  };

  return (
    <div className="bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-2xs p-5 text-[#F8FAFC]">
      {/* Header with Title and "Vedi tutte" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172646] mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Congregazioni per tempo dall'ultima visita
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
              title="Informazioni classifica"
            >
              <Info className="w-4 h-4" />
            </button>
            {showInfo && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowInfo(false)} />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 p-3 bg-[#0B1426] text-slate-200 text-xs rounded-2xl shadow-xl z-30 leading-relaxed border border-[#1E3A5F]">
                  Le congregazioni sono ordinate in base al numero di settimane trascorse dall'ultima visita completata.
                  I colori evidenziano l'urgenza di ripianificazione.
                  Clicca sul nome per navigare direttamente alla settimana pianificata nel calendario.
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors hover:underline cursor-pointer self-start sm:self-auto"
        >
          <span>Vedi tutte le {congregazioni.length} congregazioni</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid: sempre 2 colonne */}
      <div className="grid grid-cols-2 gap-3">
        {topList.map((c, index) => {
          const style = getRankStyle(index);
          const formattedUltimaVisita = abbreviateMonths(c.ultimaVisita);
          const linkedSettimana = findSettimanaForCong(c.id);

          return (
            <div
              key={c.id}
              className={`p-3 rounded-2xl border transition-all group flex flex-col gap-1.5 ${style.borderClass}`}
            >
              {/* Riga superiore: badge numero + nome congregazione (cliccabile) */}
              <div className="flex items-start gap-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs mt-0.5 ${style.badgeBg}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {/* Nome congregazione — cliccabile, naviga SEMPRE agli appuntamenti */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToSettimana) {
                        onNavigateToSettimana(linkedSettimana?.id);
                      } else if (onSelectCongregazione) {
                        onSelectCongregazione(c);
                      }
                    }}
                    className={`text-xs font-bold truncate block w-full text-left transition-colors underline decoration-dotted underline-offset-2 cursor-pointer ${
                      onNavigateToSettimana ? style.linkClass : 'text-white hover:text-blue-300'
                    }`}
                    title={linkedSettimana ? `Vai alla settimana: ${linkedSettimana.periodo}` : 'Vai agli appuntamenti'}
                  >
                    {c.nome}
                  </button>
                  <div className="text-[10px] text-slate-400">
                    Ultima: {formattedUltimaVisita}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs ${style.textClass}`}>
                    {c.settimaneTrascorse}
                    <span className="font-normal text-[10px] text-slate-400"> s.</span>
                  </span>
                </div>
              </div>

              {/* Link navigazione settimana pianificata */}
              {linkedSettimana && onNavigateToSettimana && (
                <button
                  type="button"
                  onClick={() => onNavigateToSettimana(linkedSettimana.id)}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${style.linkClass} opacity-80 hover:opacity-100`}
                  title={`Vai alla settimana: ${linkedSettimana.periodo}`}
                >
                  <ArrowRight className="w-3 h-3" />
                  <span className="truncate">{abbreviateMonths(linkedSettimana.periodo)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
