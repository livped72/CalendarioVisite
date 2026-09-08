import React, { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Congregazione } from '../types';
import { abbreviateMonths } from '../lib/dateUtils';

interface CongregationsPanelProps {
  congregazioni: Congregazione[];
  onViewAll: () => void;
  onSelectCongregazione?: (c: Congregazione) => void;
}

export const CongregationsPanel: React.FC<CongregationsPanelProps> = ({
  congregazioni,
  onViewAll,
  onSelectCongregazione,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  // Sort by weeks elapsed descending (highest urgency first)
  const sorted = [...congregazioni].sort((a, b) => b.settimaneTrascorse - a.settimaneTrascorse);
  const topList = sorted.slice(0, 8);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
      case 1:
        return {
          badgeBg: 'bg-rose-700 text-white',
          textClass: 'text-rose-700 font-bold',
          borderClass: 'border-rose-200/80 bg-rose-50/20',
        };
      case 2:
      case 3:
        return {
          badgeBg: 'bg-amber-700 text-white',
          textClass: 'text-amber-800 font-bold',
          borderClass: 'border-amber-200/80 bg-amber-50/20',
        };
      case 4:
        return {
          badgeBg: 'bg-[#5B6760] text-white',
          textClass: 'text-[#5B6760] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
        };
      case 5:
        return {
          badgeBg: 'bg-[#7C8B82] text-white',
          textClass: 'text-[#68766E] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
        };
      case 6:
        return {
          badgeBg: 'bg-[#8D9B92] text-white',
          textClass: 'text-[#5B6760] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
        };
      default:
        return {
          badgeBg: 'bg-[#A3B0A7] text-white',
          textClass: 'text-[#5B6760] font-bold',
          borderClass: 'border-[#E0DED9] bg-white',
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

      {/* Grid of congregations placed under the schedule table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topList.map((c, index) => {
          const style = getRankStyle(index);
          const formattedUltimaVisita = abbreviateMonths(c.ultimaVisita);

          return (
            <div
              key={c.id}
              onClick={() => onSelectCongregazione && onSelectCongregazione(c)}
              className={`p-3 rounded-xl border transition-all cursor-pointer hover:border-[#7C8B82] hover:shadow-xs group flex items-center justify-between gap-3 ${style.borderClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs ${style.badgeBg}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2F3332] truncate group-hover:text-[#5B6760] transition-colors">
                    {c.nome}
                  </div>
                  <div className="text-[11px] text-[#777] truncate">
                    Ultima: {formattedUltimaVisita}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs ${style.textClass}`}>
                  {c.settimaneTrascorse}{' '}
                  <span className="font-normal text-[10px]">
                    {c.settimaneTrascorse === 1 ? 'sett.' : 'sett.'}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
