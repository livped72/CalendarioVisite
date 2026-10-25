import React, { useState } from 'react';
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
} from 'lucide-react';
import { Settimana } from '../types';
import { EventBadge } from './EventBadge';
import { abbreviateMonths } from '../lib/dateUtils';
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
}

const BADGE_COLORS = [
  'bg-blue-600', 'bg-blue-700', 'bg-indigo-600', 'bg-sky-600',
  'bg-blue-800', 'bg-cyan-700', 'bg-indigo-700', 'bg-blue-500',
  'bg-sky-700', 'bg-indigo-500', 'bg-blue-900', 'bg-cyan-600',
];

export const WeekTable: React.FC<WeekTableProps> = ({
  settimane,
  onEditWeek,
  onDeleteWeek,
  onDuplicateWeek,
  visitNumberMap,
  onViewAppuntamenti,
  senderName,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'congregazioni' | 'altri'>('all');

  const congCount = settimane.filter((w) => w.evento === 'congregazione').length;
  const altriCount = settimane.length - congCount;

  const displayItems = settimane.filter((w) => {
    if (filterType === 'congregazioni') return w.evento === 'congregazione';
    if (filterType === 'altri') return w.evento !== 'congregazione';
    return true;
  });

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

  const renderEventCell = (item: Settimana) => {
    if (item.evento === 'congregazione') {
      const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';
      return <EventBadge tipo="congregazione" customLabel={congName} size="sm" />;
    }
    const customLabel =
      item.dettagli &&
      item.dettagli !== '-' &&
      ['congresso', 'evento_personalizzato', 'assemblea_circoscrizione'].includes(item.evento)
        ? item.dettagli
        : undefined;
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

              return (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
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
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSinglePdf(item, e)}
                          disabled={isThisDownloading || isThisEmailing}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          title={`Compila e scarica modello S-302 per ${item.dettagli}`}
                        >
                          {isThisDownloading ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>S-302</span>
                        </button>
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

      {/* ── MOBILE / SMARTPHONE CARDS (MOLTO PIÙ LEGGIBILI E INTUITIVE) ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3 bg-[#F8FAFC]">
        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Nessuna settimana corrisponde al filtro selezionato.
          </div>
        ) : (
          displayItems.map((item) => {
            const visitInfo = getVisitInfo(item);
            const visitNum = visitInfo?.numero;
            const isCong = item.evento === 'congregazione';
            const isThisDownloading = downloadingId === item.id;
            const isThisEmailing = emailingId === item.id;
            const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione da definire';

            if (isCong) {
              return (
                /* Card Visita Congregazione — Evidenziata, Chiara, Spaziosa */
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-blue-100/90 shadow-xs hover:shadow-md p-4 transition-all relative overflow-hidden"
                >
                  {/* Bordo colorato verticale a sinistra per identificare a colpo d'occhio la congregazione */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${visitNum != null ? getBadgeColor(visitNum) : 'bg-blue-600'}`} />

                  {/* Riga 1: Badge Visita # + Periodo Data */}
                  <div className="flex items-center justify-between gap-2 pl-1 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {visitNum != null && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-xs font-black shadow-2xs ${getBadgeColor(visitNum)}`}
                        >
                          Visita #{visitNum}
                        </span>
                      )}
                      {visitInfo?.isReset && (
                        <span className="text-[10px] font-extrabold text-blue-700 uppercase bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          Ciclo 1
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{abbreviateMonths(item.periodo)}</span>
                    </div>
                  </div>

                  {/* Riga 2: NOME CONGREGAZIONE IN EVIDENZA (GRANDE, NERO, LEGGIBILISSIMO) */}
                  <div
                    className="pl-1 py-1 cursor-pointer group/title"
                    onClick={() => onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                      <span>Congregazione</span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5 group-hover/title:text-blue-600 transition-colors flex items-center justify-between gap-2">
                      <span className="truncate">{congName}</span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover/title:text-blue-600 shrink-0 transition-transform group-hover/title:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Note se presenti */}
                  {item.note && item.note !== '-' && (
                    <div className="pl-1 mt-2">
                      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 italic">
                        {item.note}
                      </div>
                    </div>
                  )}

                  {/* Riga 3: Barra Azioni Mobile (PDF S-302, Invia Email, Appuntamenti, Modifica) */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 pl-1 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadSinglePdf(item, e)}
                      disabled={isThisDownloading || isThisEmailing}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer flex-1 justify-center active:scale-95 disabled:opacity-50"
                      title="Scarica S-302 (PDF)"
                    >
                      {isThisDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>S-302 (PDF)</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleEmailSinglePdf(item, e)}
                      disabled={isThisEmailing || isThisDownloading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer flex-1 justify-center shadow-sm active:scale-95 disabled:opacity-50"
                      title="Scarica PDF e prepara email"
                    >
                      {isThisEmailing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>Invia Email</span>
                    </button>

                    {onViewAppuntamenti && (
                      <button
                        type="button"
                        onClick={() => onViewAppuntamenti(item.id)}
                        className="p-2 rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        title="Vedi programma appuntamenti della settimana"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditWeek(item);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                      title="Modifica settimana"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            /* Card per Altri Eventi (Settimana Libera, Assemblea, Congresso, ecc.) */
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:p-4 hover:border-slate-300 transition-all cursor-pointer"
                onClick={() => onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderEventCell(item)}
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {abbreviateMonths(item.periodo)}
                      </span>
                    </div>

                    {item.dettagli && item.dettagli !== '-' && (
                      <div className="text-sm font-bold text-slate-800">
                        {item.dettagli}
                      </div>
                    )}

                    {item.note && item.note !== '-' && (
                      <div className="text-xs text-slate-500 italic mt-0.5">
                        {item.note}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditWeek(item);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                      title="Modifica evento"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-1 text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
