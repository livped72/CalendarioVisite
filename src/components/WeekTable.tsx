import React, { useState, useMemo, useEffect } from 'react';
import {
  Pencil,
  MoreVertical,
  Trash2,
  Copy,
  ChevronRight,
  CalendarDays,
  FileDown,
  Mail,
  Loader2,
  CalendarCheck,
} from 'lucide-react';
import { Settimana } from '../types';
import { EventBadge } from './EventBadge';
import { abbreviateMonths, getMonthInfoFromWeek, isWeekCurrent } from '../lib/dateUtils';
import { downloadS302Pdf, emailS302Pdf } from '../lib/pdfGenerator';

interface WeekTableProps {
  settimane: Settimana[];
  onEditWeek: (settimana: Settimana) => void;
  onDeleteWeek: (id: string) => void;
  onDuplicateWeek: (settimana: Settimana) => void;
  visitNumberMap?: Map<string, { numero: number; isReset?: boolean; motivazione?: string }>;
  /** Naviga al tab appuntamenti per questa settimana */
  onViewAppuntamenti?: (settimanaId: string) => void;
  senderName?: string;
  todayTrigger?: number;
}

const BADGE_COLORS = [
  'bg-blue-600', 'bg-slate-700', 'bg-indigo-600', 'bg-blue-700',
  'bg-sky-800', 'bg-indigo-700', 'bg-blue-800', 'bg-slate-600',
  'bg-blue-500', 'bg-indigo-800', 'bg-cyan-800', 'bg-blue-900',
];

/** Colori header mese — uno per ciascun mese dell'anno (1-12) */
const MONTH_COLORS: Record<number, { bg: string; text: string; subtext: string; badge: string; badgeText: string }> = {
  1:  { bg: 'bg-slate-700',   text: 'text-white', subtext: 'text-slate-300',   badge: 'bg-white', badgeText: 'text-slate-700' },
  2:  { bg: 'bg-sky-700',     text: 'text-white', subtext: 'text-sky-200',     badge: 'bg-white', badgeText: 'text-sky-700'   },
  3:  { bg: 'bg-emerald-700', text: 'text-white', subtext: 'text-emerald-200', badge: 'bg-white', badgeText: 'text-emerald-700' },
  4:  { bg: 'bg-teal-700',    text: 'text-white', subtext: 'text-teal-200',    badge: 'bg-white', badgeText: 'text-teal-700'  },
  5:  { bg: 'bg-cyan-700',    text: 'text-white', subtext: 'text-cyan-200',    badge: 'bg-white', badgeText: 'text-cyan-700'  },
  6:  { bg: 'bg-amber-600',   text: 'text-white', subtext: 'text-amber-200',   badge: 'bg-white', badgeText: 'text-amber-700' },
  7:  { bg: 'bg-orange-600',  text: 'text-white', subtext: 'text-orange-200',  badge: 'bg-white', badgeText: 'text-orange-700' },
  8:  { bg: 'bg-rose-600',    text: 'text-white', subtext: 'text-rose-200',    badge: 'bg-white', badgeText: 'text-rose-700'  },
  9:  { bg: 'bg-indigo-700',  text: 'text-white', subtext: 'text-indigo-200',  badge: 'bg-white', badgeText: 'text-indigo-700' },
  10: { bg: 'bg-violet-700',  text: 'text-white', subtext: 'text-violet-200',  badge: 'bg-white', badgeText: 'text-violet-700' },
  11: { bg: 'bg-blue-700',    text: 'text-white', subtext: 'text-blue-200',    badge: 'bg-white', badgeText: 'text-blue-700'  },
  12: { bg: 'bg-slate-800',   text: 'text-white', subtext: 'text-slate-300',   badge: 'bg-white', badgeText: 'text-slate-700' },
};

export const WeekTable: React.FC<WeekTableProps> = ({
  settimane,
  onEditWeek,
  onDeleteWeek,
  onDuplicateWeek,
  visitNumberMap,
  onViewAppuntamenti,
  senderName,
  todayTrigger,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'congregazioni' | 'altri'>('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Se Oggi viene premuto nell'Header o altrove, scrolla alla settimana corrente
  useEffect(() => {
    if (todayTrigger) {
      setTimeout(() => {
        const el = document.querySelector('[data-current-week="true"]');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }
  }, [todayTrigger]);

  const congCount = settimane.filter((w) => w.evento === 'congregazione').length;
  const altriCount = settimane.length - congCount;

  // Mesi univoci del semestre
  const monthsInSemester = useMemo(() => {
    const map = new Map<string, { key: string; name: string; year: number }>();
    settimane.forEach((w) => {
      const info = getMonthInfoFromWeek(w);
      if (!map.has(info.monthKey)) {
        map.set(info.monthKey, { key: info.monthKey, name: info.monthName, year: info.year });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [settimane]);

  const displayItems = useMemo(() => {
    return settimane.filter((w) => {
      if (filterType === 'congregazioni' && w.evento !== 'congregazione') return false;
      if (filterType === 'altri' && w.evento === 'congregazione') return false;
      if (selectedMonthFilter !== 'all') {
        const info = getMonthInfoFromWeek(w);
        if (info.monthKey !== selectedMonthFilter) return false;
      }
      return true;
    });
  }, [settimane, filterType, selectedMonthFilter]);

  // Raggruppamento settimane per mese (per visualizzazione iPad & iPhone)
  const groupedByMonth = useMemo(() => {
    const groups: Array<{
      key: string;
      name: string;
      year: number;
      isCurrentMonth: boolean;
      items: Settimana[];
      congCount: number;
    }> = [];

    const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    monthsInSemester.forEach((m) => {
      if (selectedMonthFilter !== 'all' && selectedMonthFilter !== m.key) return;

      const items = displayItems.filter((w) => {
        const info = getMonthInfoFromWeek(w);
        return info.monthKey === m.key;
      });

      if (items.length > 0) {
        groups.push({
          key: m.key,
          name: m.name,
          year: m.year,
          isCurrentMonth: m.key === currentMonthKey,
          items,
          congCount: items.filter((w) => w.evento === 'congregazione').length,
        });
      }
    });

    return groups;
  }, [monthsInSemester, displayItems, selectedMonthFilter]);

  const handleDownloadSinglePdf = async (item: Settimana, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDownloadingId(item.id);
    try {
      await downloadS302Pdf(item);
    } catch (err) {
      console.error('Errore compilazione PDF S-302:', err);
      alert('Impossibile generare il PDF per questa settimana.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEmailSinglePdf = async (item: Settimana, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmailingId(item.id);
    try {
      await emailS302Pdf(item, undefined, senderName);
    } catch (err) {
      console.error('Errore invio email S-302:', err);
      alert('Impossibile preparare l\'email S-302 per questa settimana.');
    } finally {
      setEmailingId(null);
    }
  };

  const getVisitInfo = (item: Settimana): { numero: number; isReset?: boolean; motivazione?: string } | null => {
    if (item.evento !== 'congregazione') return null;
    if (visitNumberMap?.has(item.id)) {
      return visitNumberMap.get(item.id)!;
    }
    if (item.numero && item.numero > 0) {
      return { numero: item.numero };
    }
    let localNum = 0;
    for (const w of settimane) {
      if (w.evento === 'congregazione') {
        localNum++;
        if (w.id === item.id) return { numero: localNum };
      }
    }
    return { numero: 1 };
  };

  const getBadgeColor = (visitNum: number) =>
    BADGE_COLORS[(Math.max(1, visitNum) - 1) % BADGE_COLORS.length];

  const formatMobilePeriodo = (periodoStr: string): string => {
    const abbr = abbreviateMonths(periodoStr);
    return abbr.replace(/\s+\d{4}$/, '');
  };

  const renderEventCell = (item: Settimana, isMobile = false) => {
    if (item.evento === 'congregazione') {
      const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';
      return <EventBadge tipo="congregazione" customLabel={congName} size="sm" />;
    }
    let customLabel: string | undefined = undefined;
    if (
      item.dettagli &&
      item.dettagli !== '-' &&
      ['congresso', 'evento_personalizzato', 'assemblea_circoscrizione'].includes(item.evento)
    ) {
      customLabel = item.dettagli;
    } else if (isMobile && item.evento === 'assemblea_circoscrizione') {
      customLabel = 'ASSEMBLEA CIRC.';
    }
    return <EventBadge tipo={item.evento} customLabel={customLabel} size="sm" />;
  };

  if (settimane.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
        <p className="text-sm text-slate-600 font-bold">Nessuna settimana pianificata per questo periodo.</p>
        <p className="text-xs text-slate-400 mt-1">Premi "+ Nuovo" per aggiungere la prima settimana.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Intestazione Semestre con Filtri Rapidi */}
      <div className="px-4 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Settimane del Semestre ({settimane.length})
          </span>
        </div>

        {/* Filtri rapidi per smartphone e desktop */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tutte ({settimane.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('congregazioni')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'congregazioni'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Visite ({congCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('altri')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'altri'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Altri Eventi ({altriCount})
          </button>
        </div>
      </div>

      {/* ── BARRA SELETTORE MESI RAPIDO PER IPAD, IPHONE E DESKTOP ── */}
      {monthsInSemester.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 no-scrollbar">
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 shrink-0 mr-1">
            Mese:
          </span>
          <button
            type="button"
            onClick={() => setSelectedMonthFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedMonthFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Tutti ({settimane.length})
          </button>
          {monthsInSemester.map((m) => {
            const isCur = m.key === new Date().toISOString().slice(0, 7);
            const isSel = selectedMonthFilter === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMonthFilter(m.key)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCur
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{m.name} {m.year}</span>
                {isCur && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-blue-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16 text-center">#</th>
              <th className="py-3 px-4 w-48">Periodo (Mar – Dom)</th>
              <th className="py-3 px-4 w-64">Evento / Congregazione</th>
              <th className="py-3 px-4">Note</th>
              <th className="py-3 px-3 w-52 text-right pr-4">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {displayItems.map((item) => {
              const isMenuOpen = activeMenuId === item.id;
              const visitInfo = getVisitInfo(item);
              const visitNum = visitInfo?.numero;
              const isCong = item.evento === 'congregazione';
              const isThisDownloading = downloadingId === item.id;
              const isThisEmailing = emailingId === item.id;
              const isCurrent = isWeekCurrent(item.startDate, item.endDate);

              return (
                <tr
                  key={item.id}
                  data-current-week={isCurrent ? "true" : undefined}
                  className={`transition-colors group ${
                    isCurrent
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-600 font-semibold'
                      : 'hover:bg-blue-50/40'
                  }`}
                >
                  {/* Badge numerico */}
                  <td className="py-3 px-4 text-center">
                    {isCong && visitNum != null ? (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold shadow-2xs ${getBadgeColor(visitNum)}`}
                        title={visitInfo?.motivazione || `Visita #${visitNum}`}
                      >
                        {visitNum}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px]">
                        —
                      </span>
                    )}
                  </td>

                  {/* Periodo */}
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                          Oggi
                        </span>
                      )}
                      {onViewAppuntamenti ? (
                        <button
                          type="button"
                          onClick={() => onViewAppuntamenti(item.id)}
                          className="group/cell inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Vedi appuntamenti di questa settimana"
                        >
                          {abbreviateMonths(item.periodo)}
                          <CalendarDays className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ) : (
                        abbreviateMonths(item.periodo)
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    {onViewAppuntamenti ? (
                      <button
                        type="button"
                        onClick={() => onViewAppuntamenti(item.id)}
                        className="cursor-pointer"
                        title="Vedi appuntamenti di questa settimana"
                      >
                        {renderEventCell(item)}
                      </button>
                    ) : (
                      renderEventCell(item)
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {item.note && item.note !== '-'
                      ? item.note
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Actions & S-302 */}
                  <td className="py-3 px-3 text-right pr-4 whitespace-nowrap relative">
                    <div className="flex items-center justify-end gap-1.5">
                      {isCong && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleDownloadSinglePdf(item, e)}
                            disabled={isThisDownloading || isThisEmailing}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 active:scale-95 disabled:opacity-50"
                            title={`Scarica S-302 (PDF) per ${item.dettagli}`}
                          >
                            {isThisDownloading ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span>S-302</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleEmailSinglePdf(item, e)}
                            disabled={isThisEmailing || isThisDownloading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-2xs active:scale-95 disabled:opacity-50"
                            title={`Prepara email S-302 per ${item.dettagli}`}
                          >
                            {isThisEmailing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            <span>Email</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onEditWeek(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Modifica"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 text-slate-800">
                              {isCong && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleDownloadSinglePdf(item, e);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-700 text-left font-semibold cursor-pointer"
                                  >
                                    <FileDown className="w-3.5 h-3.5 text-blue-600" /> Scarica S-302 (PDF)
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleEmailSinglePdf(item, e);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-700 text-left font-semibold cursor-pointer"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Invia via Email
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                </>
                              )}
                              <button
                                onClick={() => { setActiveMenuId(null); onEditWeek(item); }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left font-semibold cursor-pointer text-slate-700"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-400" /> Modifica
                              </button>
                              <button
                                onClick={() => { setActiveMenuId(null); onDuplicateWeek(item); }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left font-semibold cursor-pointer text-slate-700"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplica
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => { setActiveMenuId(null); onDeleteWeek(item.id); }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-left font-semibold cursor-pointer"
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

      {/* ── MOBILE / SMARTPHONE & TABLET CARDS (ORGANIZZATI PER MESE E SETTIMANA) ── */}
      <div className="lg:hidden p-2.5 sm:p-4 space-y-4 bg-[#F8FAFC]">
        {groupedByMonth.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Nessuna settimana corrisponde al filtro selezionato.
          </div>
        ) : (
          groupedByMonth.map((group) => (
            <div key={group.key} className="space-y-2">
              {/* Intestazione Mese chiara e visibile a colpo d'occhio */}
              {(() => {
                const monthNum = group.key ? parseInt(group.key.split('-')[1], 10) : 11;
                const mc = MONTH_COLORS[monthNum] || MONTH_COLORS[11];
                return (
                  <div
                    className={`sticky top-0 z-20 px-3.5 py-2.5 rounded-2xl shadow-xs flex flex-col gap-1 transition-all ${mc.bg}`}
                  >
                    {/* Riga superiore: icona + nome mese + badge corrente */}
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`w-4 h-4 shrink-0 ${mc.subtext}`} />
                      <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${mc.text}`}>
                        {group.name} {group.year}
                      </span>
                      {group.isCurrentMonth && (
                        <span className={`ml-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 ${mc.badge} ${mc.badgeText}`}>
                          Mese Corrente
                        </span>
                      )}
                    </div>
                    {/* Riga inferiore: conteggio settimane */}
                    <div className={`text-[11px] font-bold pl-6 ${mc.subtext}`}>
                      {group.items.length} {group.items.length === 1 ? 'settimana' : 'settimane'} • {group.congCount} visite
                    </div>
                  </div>
                );
              })()}

              {/* Elenco card delle settimane del mese */}
              <div className="space-y-2">
                {group.items.map((item) => {
                  const visitInfo = getVisitInfo(item);
                  const visitNum = visitInfo?.numero;
                  const isCong = item.evento === 'congregazione';
                  const isThisDownloading = downloadingId === item.id;
                  const isThisEmailing = emailingId === item.id;
                  const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione da definire';
                  const isCurrent = isWeekCurrent(item.startDate, item.endDate);
                  const weekNum = settimane.findIndex((w) => w.id === item.id) + 1;

                  if (isCong) {
                    return (
                      <div
                        key={item.id}
                        id={`week-card-${item.id}`}
                        data-current-week={isCurrent ? "true" : undefined}
                        className={`bg-white rounded-2xl border transition-all relative overflow-hidden px-3 py-2.5 sm:p-3.5 ${
                          isCurrent
                            ? 'border-2 border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10 shadow-sm'
                            : 'border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        {/* Bordo colorato verticale a sinistra */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            isCurrent ? 'bg-blue-600' : visitNum != null ? getBadgeColor(visitNum) : 'bg-blue-500'
                          }`}
                        />

                        <div className="pl-2">
                          {/* Riga 1a: Badge visita + Data colorata + badge In corso */}
                          {(() => {
                            const mNum = item.startDate ? parseInt(item.startDate.split('-')[1], 10) : 11;
                            const mc = MONTH_COLORS[mNum] || MONTH_COLORS[11];
                            return (
                              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                {visitNum != null && (
                                  <span
                                    className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-md text-white text-[10px] font-black shrink-0 ${getBadgeColor(visitNum)}`}
                                    title={visitInfo?.motivazione || `Visita #${visitNum}`}
                                  >
                                    #{visitNum}
                                  </span>
                                )}

                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${mc.bg} text-white`}>
                                  <CalendarDays className="w-3 h-3 opacity-80 shrink-0" />
                                  <span>{formatMobilePeriodo(item.periodo)}</span>
                                </span>

                                {isCurrent && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 animate-pulse">
                                    In corso
                                  </span>
                                )}

                                {visitInfo?.isReset && (
                                  <span className="text-[9px] font-extrabold text-blue-700 uppercase bg-blue-50 border border-blue-200 px-1 py-0.5 rounded shrink-0 whitespace-nowrap">
                                    Ciclo 1
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          {/* Riga 1b: Nome Congregazione — subito sotto la data */}
                          <div
                            className="mt-1.5 cursor-pointer group/title flex items-center justify-between gap-2"
                            onClick={() => (onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item))}
                          >
                            <div className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate group-hover/title:text-blue-700 transition-colors">
                              {congName}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover/title:text-blue-700 group-hover/title:translate-x-0.5 transition-all shrink-0" />
                          </div>

                          {item.note && item.note !== '-' && (
                            <div className="text-[11px] text-slate-500 italic truncate mt-0.5">
                              {item.note}
                            </div>
                          )}

                          {/* Riga 1c: Pulsanti azione */}
                          <div className="flex items-center gap-1 mt-2 flex-wrap border-t border-slate-100 pt-2">
                            <button
                              type="button"
                              onClick={(e) => handleDownloadSinglePdf(item, e)}
                              disabled={isThisDownloading || isThisEmailing}
                              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                              title="Scarica S-302 (PDF)"
                            >
                              {isThisDownloading ? (
                                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                              ) : (
                                <FileDown className="w-3 h-3 text-blue-600" />
                              )}
                              <span>S-302</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleEmailSinglePdf(item, e)}
                              disabled={isThisEmailing || isThisDownloading}
                              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 shrink-0"
                              title="Prepara email S-302"
                            >
                              {isThisEmailing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              <span>Email</span>
                            </button>

                            {onViewAppuntamenti && (
                              <button
                                type="button"
                                onClick={() => onViewAppuntamenti(item.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                                title="Vedi appuntamenti della settimana"
                              >
                                <CalendarDays className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditWeek(item);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                              title="Modifica settimana"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  /* Card Altri Eventi */
                  return (
                    <div
                      key={item.id}
                      id={`week-card-${item.id}`}
                      data-current-week={isCurrent ? "true" : undefined}
                      className={`bg-white rounded-2xl border transition-all cursor-pointer px-3 py-2.5 sm:p-3.5 ${
                        isCurrent
                          ? 'border-2 border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10 shadow-sm'
                          : 'border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                      }`}
                      onClick={() => (onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item))}
                    >
                      <div className="flex items-center justify-between gap-1 flex-nowrap w-full">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          {renderEventCell(item, true)}
                          {(() => {
                            const mNum = item.startDate ? parseInt(item.startDate.split('-')[1], 10) : 11;
                            const mc = MONTH_COLORS[mNum] || MONTH_COLORS[11];
                            return (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${mc.bg} text-white`}>
                                <CalendarDays className="w-3 h-3 opacity-80 shrink-0" />
                                <span>{formatMobilePeriodo(item.periodo)}</span>
                              </span>
                            );
                          })()}
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 animate-pulse">
                              In corso
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onViewAppuntamenti && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewAppuntamenti(item.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                              title="Vedi appuntamenti dell'evento"
                            >
                              <CalendarDays className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditWeek(item);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                            title="Modifica evento"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.dettagli && item.dettagli !== '-' && (
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm mt-1 truncate">
                          {item.dettagli}
                        </div>
                      )}

                      {item.note && item.note !== '-' && (
                        <div className="text-[11px] text-slate-500 italic truncate mt-0.5">
                          {item.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
