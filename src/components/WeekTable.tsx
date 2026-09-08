import React, { useState } from 'react';
import { Pencil, MoreVertical, ChevronDown, ChevronUp, Trash2, Copy, ChevronRight } from 'lucide-react';
import { Settimana } from '../types';
import { EventBadge } from './EventBadge';
import { abbreviateMonths } from '../lib/dateUtils';

interface WeekTableProps {
  settimane: Settimana[];
  onEditWeek: (settimana: Settimana) => void;
  onDeleteWeek: (id: string) => void;
  onDuplicateWeek: (settimana: Settimana) => void;
}

const BADGE_COLORS = [
  'bg-[#7C8B82]', 'bg-[#68766E]', 'bg-[#5B6760]', 'bg-[#8D9B92]',
  'bg-[#5A7365]', 'bg-[#6E8276]', 'bg-[#4F6357]', 'bg-[#7A8C81]',
  'bg-[#65796E]', 'bg-[#74877C]', 'bg-[#5E7267]', 'bg-[#82958A]',
];

export const WeekTable: React.FC<WeekTableProps> = ({
  settimane,
  onEditWeek,
  onDeleteWeek,
  onDuplicateWeek,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const displayItems = isExpanded ? settimane : settimane.slice(0, 10);
  const hasMore = settimane.length > 10;

  // Visit counter: sequential number ONLY for 'congregazione' events
  const visitCountMap = new Map<string, number>();
  let visitCounter = 0;
  for (const w of settimane) {
    if (w.evento === 'congregazione') {
      visitCounter++;
      visitCountMap.set(w.id, visitCounter);
    }
  }

  const getBadgeColor = (visitNum: number) =>
    BADGE_COLORS[(visitNum - 1) % BADGE_COLORS.length];

  const renderEventCell = (item: Settimana) => {
    if (item.evento === 'congregazione') {
      const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';
      return <EventBadge tipo="congregazione" customLabel={congName} size="sm" />;
    }
    const customLabel =
      item.dettagli && item.dettagli !== '-' &&
      ['congresso', 'evento_personalizzato', 'assemblea_circoscrizione'].includes(item.evento)
        ? item.dettagli
        : undefined;
    return <EventBadge tipo={item.evento} customLabel={customLabel} size="sm" />;
  };

  if (settimane.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-10 text-center">
        <p className="text-sm text-[#888] font-medium">Nessuna settimana pianificata per questo periodo.</p>
        <p className="text-xs text-[#AAA] mt-1">Premi "+ Nuovo" per aggiungere la prima settimana.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0DED9] bg-[#FAF9F7] text-[#2F3332] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16 text-center">#</th>
              <th className="py-3 px-4 w-52">Periodo (Mar – Dom)</th>
              <th className="py-3 px-4 w-64">Evento</th>
              <th className="py-3 px-4">Note</th>
              <th className="py-3 px-3 w-16 text-right pr-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6] text-[#2F3332]">
            {displayItems.map((item) => {
              const isMenuOpen = activeMenuId === item.id;
              const visitNum = visitCountMap.get(item.id);
              const isCong = item.evento === 'congregazione';

              return (
                <tr key={item.id} className="hover:bg-[#FAF9F7] transition-colors group">
                  {/* Badge: numeric only for congregation visits */}
                  <td className="py-3 px-4 text-center">
                    {isCong && visitNum != null ? (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold shadow-2xs ${getBadgeColor(visitNum)}`}
                      >
                        {visitNum}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F0EA] text-[#AAA] text-[10px]">
                        —
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-bold text-[#2F3332] whitespace-nowrap">
                    {abbreviateMonths(item.periodo)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderEventCell(item)}
                  </td>

                  <td className="py-3 px-4 text-[#666] text-xs">
                    {item.note && item.note !== '-'
                      ? item.note
                      : <span className="text-[#CCC]">—</span>}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right pr-4 whitespace-nowrap relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditWeek(item)}
                        className="p-1.5 rounded-lg text-[#888] hover:text-[#5B6760] hover:bg-[#FAF9F7] transition-colors cursor-pointer"
                        title="Modifica"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                          className="p-1.5 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-[#FAF9F7] transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-[#E0DED9] py-1 z-50 text-xs animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => { setActiveMenuId(null); onEditWeek(item); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FAF9F7] text-left font-semibold cursor-pointer text-[#2F3332]"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#7C8B82]" /> Modifica
                              </button>
                              <button
                                onClick={() => { setActiveMenuId(null); onDuplicateWeek(item); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FAF9F7] text-left font-semibold cursor-pointer text-[#2F3332]"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#7C8B82]" /> Duplica
                              </button>
                              <div className="border-t border-[#E0DED9] my-1" />
                              <button
                                onClick={() => { setActiveMenuId(null); onDeleteWeek(item.id); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-700 text-left font-semibold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Elimina
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-[#EFECE6]">
        {displayItems.map((item) => {
          const visitNum = visitCountMap.get(item.id);
          const isCong = item.evento === 'congregazione';

          return (
            <div
              key={item.id}
              onClick={() => onEditWeek(item)}
              className="p-3.5 hover:bg-[#FAF9F7] transition-colors flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                {isCong && visitNum != null ? (
                  <span className={`w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${getBadgeColor(visitNum)}`}>
                    {visitNum}
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#F3F0EA] text-[#AAA] text-[10px] flex items-center justify-center shrink-0 mt-0.5">—</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-bold text-xs text-[#2F3332]">{abbreviateMonths(item.periodo)}</span>
                    {renderEventCell(item)}
                  </div>
                  {item.note && item.note !== '-' && (
                    <div className="text-xs text-[#666] truncate">{item.note}</div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#AAA] shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse */}
      {hasMore && (
        <div className="p-3 border-t border-[#E0DED9] bg-[#FAF9F7]/70 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5B6760] hover:text-[#2F3332] transition-colors py-1 px-3 rounded-lg hover:bg-white cursor-pointer"
          >
            {isExpanded ? 'Mostra meno' : `Mostra altre ${settimane.length - 10} settimane`}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
