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
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);

  const displayItems = settimane;

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
      await emailS302Pdf(item);
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
      <div className="bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-10 text-center">
        <p className="text-sm text-slate-400 font-medium">Nessuna settimana pianificata per questo periodo.</p>
        <p className="text-xs text-slate-500 mt-1">Premi "+ Nuovo" per aggiungere la prima settimana.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg overflow-hidden">
      {/* Intestazione Semestre */}
      <div className="px-4 py-3 bg-[#142342] border-b border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
            Settimane del Semestre ({settimane.length})
          </span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E3A5F] bg-[#142342]/90 text-blue-200 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16 text-center">#</th>
              <th className="py-3 px-4 w-48">Periodo (Mar – Dom)</th>
              <th className="py-3 px-4 w-60">Evento</th>
              <th className="py-3 px-4">Note</th>
              <th className="py-3 px-3 w-52 text-right pr-4">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172646] text-[#E2E8F0]">
            {displayItems.map((item) => {
              const isMenuOpen = activeMenuId === item.id;
              const visitInfo = getVisitInfo(item);
              const visitNum = visitInfo?.numero;
              const isCong = item.evento === 'congregazione';
              const isThisDownloading = downloadingId === item.id;
              const isThisEmailing = emailingId === item.id;

              return (
                <tr key={item.id} className="hover:bg-[#162544] transition-colors group">
                  {/* Badge numerico */}
                  <td className="py-3 px-4 text-center">
                    {isCong && visitNum != null ? (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold shadow-sm ${getBadgeColor(visitNum)}`}
                        title={visitInfo?.motivazione || `Visita #${visitNum}`}
                      >
                        {visitNum}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#162544] text-slate-500 text-[10px]">
                        —
                      </span>
                    )}
                  </td>

                  {/* Periodo */}
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {onViewAppuntamenti ? (
                      <button
                        type="button"
                        onClick={() => onViewAppuntamenti(item.id)}
                        className="group/cell inline-flex items-center gap-1.5 font-bold text-white hover:text-blue-300 transition-colors cursor-pointer"
                        title="Vedi appuntamenti di questa settimana"
                      >
                        {abbreviateMonths(item.periodo)}
                        <CalendarDays className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0" />
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

                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {item.note && item.note !== '-'
                      ? item.note
                      : <span className="text-slate-600">—</span>}
                  </td>

                  {/* Actions & S-302 */}
                  <td className="py-3 px-3 text-right pr-4 whitespace-nowrap relative">
                    <div className="flex items-center justify-end gap-1.5">
                      {isCong && (
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSinglePdf(item, e)}
                          disabled={isThisDownloading || isThisEmailing}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer bg-[#142342] text-blue-200 hover:bg-[#1A2C52] hover:text-white border border-[#1E3A5F]"
                          title={`Compila e scarica modello S-302 per ${item.dettagli}`}
                        >
                          {isThisDownloading ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>S-302</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEditWeek(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162544] transition-colors cursor-pointer"
                        title="Modifica"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162544] transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-[#0F1A30] rounded-xl shadow-2xl border border-[#1E3A5F] py-1 z-50 text-xs animate-in fade-in zoom-in-95 text-[#E2E8F0]">
                              {isCong && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleDownloadSinglePdf(item, e);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#162544] text-blue-300 hover:text-white text-left font-semibold cursor-pointer"
                                  >
                                    <FileDown className="w-3.5 h-3.5 text-blue-400" /> Scarica S-302 (PDF)
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleEmailSinglePdf(item, e);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#162544] text-blue-300 hover:text-white text-left font-semibold cursor-pointer"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Invia via Email
                                  </button>
                                  <div className="border-t border-[#1E3A5F] my-1" />
                                </>
                              )}
                              <button
                                onClick={() => { setActiveMenuId(null); onEditWeek(item); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#162544] text-left font-semibold cursor-pointer text-slate-200 hover:text-white"
                              >
                                <Pencil className="w-3.5 h-3.5 text-blue-400" /> Modifica
                              </button>
                              <button
                                onClick={() => { setActiveMenuId(null); onDuplicateWeek(item); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#162544] text-left font-semibold cursor-pointer text-slate-200 hover:text-white"
                              >
                                <Copy className="w-3.5 h-3.5 text-blue-400" /> Duplica
                              </button>
                              <div className="border-t border-[#1E3A5F] my-1" />
                              <button
                                onClick={() => { setActiveMenuId(null); onDeleteWeek(item.id); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-left font-semibold cursor-pointer"
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

      {/* Mobile / Tablet Cards */}
      <div className="lg:hidden divide-y divide-[#172646]">
        {displayItems.map((item) => {
          const visitInfo = getVisitInfo(item);
          const visitNum = visitInfo?.numero;
          const isCong = item.evento === 'congregazione';
          const isThisDownloading = downloadingId === item.id;
          const isThisEmailing = emailingId === item.id;

          return (
            <div
              key={item.id}
              className="p-4 hover:bg-[#142342] active:bg-[#162544] transition-colors"
            >
              {/* Riga principale: badge + info + freccia */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)}
                >
                  {/* Badge numero visita */}
                  {isCong && visitNum != null ? (
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <span
                        className={`w-8 h-8 rounded-xl text-white text-xs font-extrabold flex items-center justify-center shadow-sm ring-2 ring-[#0F1A30] ${getBadgeColor(visitNum)}`}
                      >
                        {visitNum}
                      </span>
                    </div>
                  ) : (
                    <span className="w-8 h-8 rounded-xl bg-[#162544] text-slate-400 text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-[#0F1A30] mt-0.5">
                      —
                    </span>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[12px] font-bold text-white uppercase tracking-wider">
                        {abbreviateMonths(item.periodo)}
                      </span>
                      {visitInfo?.isReset && (
                        <span className="text-[9px] font-extrabold text-blue-300 uppercase bg-blue-950/80 border border-blue-800 px-1.5 py-0.5 rounded-md">
                          Ciclo 1
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderEventCell(item)}
                    </div>

                    {item.note && item.note !== '-' && (
                      <div className="text-[11px] text-slate-400 truncate mt-1">
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Freccia navigazione */}
                <div
                  onClick={() => onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)}
                  className="p-1 cursor-pointer text-slate-500 hover:text-blue-300 transition-colors shrink-0 mt-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Riga azioni S-302 (solo per congregazioni) */}
              {isCong && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#172646] flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSinglePdf(item, e)}
                    disabled={isThisDownloading || isThisEmailing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex-1 justify-center bg-[#142342] text-blue-200 border-[#1E3A5F] hover:bg-[#1A2C52] hover:text-white disabled:opacity-50"
                    title="Scarica S-302 (PDF)"
                  >
                    {isThisDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>Scarica S-302</span>
                  </button>

                  {/* Invia Email */}
                  <button
                    type="button"
                    onClick={(e) => handleEmailSinglePdf(item, e)}
                    disabled={isThisEmailing || isThisDownloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex-1 justify-center shadow-md shadow-blue-950/50 disabled:opacity-50"
                    title="Scarica PDF e apri email"
                  >
                    {isThisEmailing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    <span>Invia Email</span>
                  </button>

                  {/* Modifica */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWeek(item);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] active:bg-[#162544] transition-colors cursor-pointer border border-[#1E3A5F]"
                    title="Modifica settimana"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Riga azione solo modifica per eventi non-congregazione */}
              {!isCong && (
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#172646]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWeek(item);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] active:bg-[#162544] transition-colors cursor-pointer border border-[#1E3A5F]"
                    title="Modifica settimana"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
