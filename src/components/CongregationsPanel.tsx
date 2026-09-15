import React, { useState } from 'react';
import { Info, ExternalLink, ArrowRight } from 'lucide-react';
import { Congregazione, Settimana } from '../types';
import { abbreviateMonths } from '../lib/dateUtils';

interface CongregationsPanelProps {
  congregazioni: Congregazione[];
  settimane: Settimana[];
  onViewAll: () => void;
  onSelectCongregazione?: (c: Congregazione) => void;
  /** Navigare direttamente alla settimana legata alla congregazione nel calendario */
  onNavigateToSettimana?: (settimanaId: string) => void;
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
          badgeBg: 'bg-rose-700 text-white',
          textClass: 'text-rose-700 font-bold',
          borderClass: 'border-rose-200/80 bg-rose-50/20',
          linkClass: 'text-rose-600 hover:text-rose-800',
        };
      case 2:
      case 3:
        return {
          badgeBg: 'bg-amber-700 text-white',
          textClass: 'text-amber-800 font-bold',
          borderClass: 'border-amber-200/80 bg-amber-50/20',
          linkClass: 'text-amber-700 hover:text-amber-900',
        };
      case 4:
        return {
          badgeBg: 'bg-[#5B6760] text-white',
          textClass: 'text-[#5B6760] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
          linkClass: 'text-[#5B6760] hover:text-[#2F3332]',
        };
      case 5:
        return {
          badgeBg: 'bg-[#7C8B82] text-white',
          textClass: 'text-[#68766E] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
          linkClass: 'text-[#7C8B82] hover:text-[#2F3332]',
        };
      case 6:
        return {
          badgeBg: 'bg-[#8D9B92] text-white',
          textClass: 'text-[#5B6760] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
          linkClass: 'text-[#7C8B82] hover:text-[#2F3332]',
        };
      default:
        return {
          badgeBg: 'bg-[#A3B0A7] text-white',
          textClass: 'text-[#5B6760] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
          linkClass: 'text-[#7C8B82] hover:text-[#2F3332]',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-5">
      {/* Header with Title and "Vedi tutte" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E0DED9] mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">
            Congregazioni per tempo dall'ultima visita
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-[#888] hover:text-[#2F3332] transition-colors p-1 cursor-pointer"
              title="Informazioni classifica"
            >
              <Info className="w-4 h-4" />
            </button>
            {showInfo && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowInfo(false)} />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 p-3 bg-[#2F3332] text-white text-xs rounded-xl shadow-xl z-30 leading-relaxed border border-[#444]">
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
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#5B6760] hover:text-[#2F3332] transition-colors hover:underline cursor-pointer self-start sm:self-auto"
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
              className={`p-3 rounded-xl border transition-all group flex flex-col gap-1.5 ${style.borderClass}`}
            >
              {/* Riga superiore: badge numero + nome congregazione (cliccabile) */}
              <div className="flex items-start gap-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs mt-0.5 ${style.badgeBg}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {/* Nome congregazione — cliccabile per navigare alla settimana */}
                  {linkedSettimana && onNavigateToSettimana ? (
                    <button
                      type="button"
                      onClick={() => onNavigateToSettimana(linkedSettimana.id)}
                      className={`text-xs font-bold truncate block w-full text-left transition-colors underline decoration-dotted underline-offset-2 cursor-pointer ${style.linkClass}`}
                      title={`Vai alla settimana: ${linkedSettimana.periodo}`}
                    >
                      {c.nome}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectCongregazione && onSelectCongregazione(c)}
                      className="text-xs font-bold text-[#2F3332] truncate block w-full text-left hover:text-[#5B6760] transition-colors cursor-pointer"
                    >
                      {c.nome}
                    </button>
                  )}
                  <div className="text-[10px] text-[#999]">
                    Ultima: {formattedUltimaVisita}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs ${style.textClass}`}>
                    {c.settimaneTrascorse}
                    <span className="font-normal text-[10px]"> s.</span>
                  </span>
                </div>
              </div>

              {/* Link navigazione settimana pianificata */}
              {linkedSettimana && onNavigateToSettimana && (
                <button
                  type="button"
                  onClick={() => onNavigateToSettimana(linkedSettimana.id)}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${style.linkClass} opacity-70 hover:opacity-100`}
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
