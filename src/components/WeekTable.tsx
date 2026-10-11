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
  DownloadCloud,
} from 'lucide-react';
import { Settimana } from '../types';
import { EventBadge } from './EventBadge';
import { abbreviateMonths } from '../lib/dateUtils';
import { downloadS302Pdf, emailS302Pdf, isWithin90Days, downloadAll90DaysS302 } from '../lib/pdfGenerator';

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
  'bg-[#7C8B82]', 'bg-[#68766E]', 'bg-[#5B6760]', 'bg-[#8D9B92]',
  'bg-[#5A7365]', 'bg-[#6E8276]', 'bg-[#4F6357]', 'bg-[#7A8C81]',
  'bg-[#65796E]', 'bg-[#74877C]', 'bg-[#5E7267]', 'bg-[#82958A]',
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
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const displayItems = settimane;

  const visitsWithin90Days = displayItems.filter(
    (w) => w.evento === 'congregazione' && isWithin90Days(w.startDate)
  );

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

  const handleDownloadAll90Days = async () => {
    if (visitsWithin90Days.length === 0) return;
    setIsDownloadingAll(true);
    try {
      await downloadAll90DaysS302(displayItems);
    } catch (err) {
      console.error('Errore download cumulativo:', err);
      alert('Errore durante il download dei moduli S-302.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Visit info resolver
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
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm p-10 text-center">
        <p className="text-sm text-[#888] font-medium">Nessuna settimana pianificata per questo periodo.</p>
        <p className="text-xs text-[#AAA] mt-1">Premi "+ Nuovo" per aggiungere la prima settimana.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-sm overflow-hidden">
      {/* Intestazione Semestre */}
      <div className="px-4 py-3 bg-[#FAF9F7] border-b border-[#E0DED9] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">
            Settimane del Semestre ({settimane.length})
          </span>
          {visitsWithin90Days.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {visitsWithin90Days.length} entro 90 gg
            </span>
          )}
        </div>

        {visitsWithin90Days.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadAll90Days}
            disabled={isDownloadingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
            title="Compila e scarica tutti i moduli S-302 per le visite nei prossimi 90 giorni"
          >
            {isDownloadingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>Scarica tutti gli S-302 ({visitsWithin90Days.length})</span>
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0DED9] bg-[#FAF9F7]/70 text-[#2F3332] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-16 text-center">#</th>
              <th className="py-3 px-4 w-48">Periodo (Mar – Dom)</th>
              <th className="py-3 px-4 w-60">Evento</th>
              <th className="py-3 px-4">Note</th>
              <th className="py-3 px-3 w-52 text-right pr-4">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6] text-[#2F3332]">
            {displayItems.map((item) => {
              const isMenuOpen = activeMenuId === item.id;
              const visitInfo = getVisitInfo(item);
              const visitNum = visitInfo?.numero;
              const isCong = item.evento === 'congregazione';
              const is90Days = isCong && isWithin90Days(item.startDate);
              const isThisDownloading = downloadingId === item.id;
              const isThisEmailing = emailingId === item.id;

              return (
                <tr key={item.id} className="hover:bg-[#FAF9F7] transition-colors group">
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
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F0EA] text-[#AAA] text-[10px]">
                        —
                      </span>
                    )}
                  </td>

                  {/* Periodo */}
                  <td className="py-3 px-4 font-bold text-[#2F3332] whitespace-nowrap">
                    {onViewAppuntamenti ? (
                      <button
                        type="button"
                        onClick={() => onViewAppuntamenti(item.id)}
                        className="group/cell inline-flex items-center gap-1.5 font-bold text-[#2F3332] hover:text-[#5B6760] transition-colors cursor-pointer"
                        title="Vedi appuntamenti di questa settimana"
                      >
                        {abbreviateMonths(item.periodo)}
                        <CalendarDays className="w-3.5 h-3.5 text-[#7C8B82] opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0" />
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

                  <td className="py-3 px-4 text-[#666] text-xs">
                    {item.note && item.note !== '-'
                      ? item.note
                      : <span className="text-[#CCC]">—</span>}
                  </td>

                  {/* Actions & S-302 */}
                  <td className="py-3 px-3 text-right pr-4 whitespace-nowrap relative">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Bottone S-302 download */}
                      {isCong && (
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSinglePdf(item, e)}
                          disabled={isThisDownloading || isThisEmailing}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            is90Days
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                          title={`Compila e scarica modello S-302 per ${item.dettagli}${is90Days ? ' (entro 90 giorni)' : ''}`}
                        >
                          {isThisDownloading ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          ) : (
                            <FileDown className={`w-3.5 h-3.5 ${is90Days ? 'text-blue-600' : 'text-slate-500'}`} />
                          )}
                          <span>S-302</span>
                        </button>
                      )}

                      {/* Bottone email S-302 (solo se entro 90gg) */}
                      {isCong && is90Days && (
                        <button
                          type="button"
                          onClick={(e) => handleEmailSinglePdf(item, e)}
                          disabled={isThisEmailing || isThisDownloading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all cursor-pointer shadow-sm"
                          title="Scarica PDF e invia via email"
                        >
                          {isThisEmailing ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          <span>Email</span>
                        </button>
                      )}

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
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#E0DED9] py-1 z-50 text-xs animate-in fade-in zoom-in-95">
                              {isCong && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      setActiveMenuId(null);
                                      handleDownloadSinglePdf(item, e);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-blue-700 text-left font-semibold cursor-pointer"
                                  >
                                    <FileDown className="w-3.5 h-3.5 text-blue-600" /> Scarica S-302 (PDF)
                                  </button>
                                  {is90Days && (
                                    <button
                                      onClick={(e) => {
                                        setActiveMenuId(null);
                                        handleEmailSinglePdf(item, e);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-blue-700 text-left font-semibold cursor-pointer"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-blue-600" /> Invia via Email
                                    </button>
                                  )}
                                  <div className="border-t border-[#E0DED9] my-1" />
                                </>
                              )}
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

      {/* Mobile / Tablet Cards */}
      <div className="lg:hidden divide-y divide-[#EFECE6]">
        {displayItems.map((item) => {
          const visitInfo = getVisitInfo(item);
          const visitNum = visitInfo?.numero;
          const isCong = item.evento === 'congregazione';
          const is90Days = isCong && isWithin90Days(item.startDate);
          const isThisDownloading = downloadingId === item.id;
          const isThisEmailing = emailingId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 hover:bg-[#FAF9F7] active:bg-[#F7F5F0] transition-colors ${
                is90Days ? 'border-l-4 border-l-blue-400' : ''
              }`}
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
                        className={`w-8 h-8 rounded-xl text-white text-xs font-extrabold flex items-center justify-center shadow-sm ring-2 ring-white ${getBadgeColor(visitNum)}`}
                      >
                        {visitNum}
                      </span>
                    </div>
                  ) : (
                    <span className="w-8 h-8 rounded-xl bg-[#F0EEE8] text-[#888] text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-white mt-0.5">
                      —
                    </span>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[12px] font-bold text-[#2F3332] uppercase tracking-wider">
                        {abbreviateMonths(item.periodo)}
                      </span>
                      {visitInfo?.isReset && (
                        <span className="text-[9px] font-extrabold text-[#7C8B82] uppercase bg-[#EBF1ED] px-1.5 py-0.5 rounded-md">
                          Ciclo 1
                        </span>
                      )}
                      {is90Days && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                          S-302 entro 90gg
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderEventCell(item)}
                    </div>

                    {item.note && item.note !== '-' && (
                      <div className="text-[11px] text-[#777] truncate mt-1">
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Freccia navigazione */}
                <div
                  onClick={() => onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)}
                  className="p-1 cursor-pointer text-[#BBB] hover:text-[#5B6760] transition-colors shrink-0 mt-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Riga azioni S-302 (solo per congregazioni) */}
              {isCong && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F0EEE8] flex-wrap">
                  {/* Scarica PDF */}
                  <button
                    type="button"
                    onClick={(e) => handleDownloadSinglePdf(item, e)}
                    disabled={isThisDownloading || isThisEmailing}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex-1 justify-center ${
                      is90Days
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    } disabled:opacity-50`}
                    title="Scarica S-302 (PDF)"
                  >
                    {isThisDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Scarica S-302</span>
                  </button>

                  {/* Invia Email (solo se entro 90gg) */}
                  {is90Days && (
                    <button
                      type="button"
                      onClick={(e) => handleEmailSinglePdf(item, e)}
                      disabled={isThisEmailing || isThisDownloading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all cursor-pointer flex-1 justify-center disabled:opacity-50"
                      title="Scarica PDF e apri email"
                    >
                      {isThisEmailing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>Invia Email</span>
                    </button>
                  )}

                  {/* Modifica */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWeek(item);
                    }}
                    className="p-2 rounded-xl text-[#777] hover:text-[#2F3332] hover:bg-[#FAF9F7] active:bg-[#EFECE6] transition-colors cursor-pointer border border-transparent hover:border-[#E0DED9]"
                    title="Modifica settimana"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Riga azione solo modifica per eventi non-congregazione */}
              {!isCong && (
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#F0EEE8]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWeek(item);
                    }}
                    className="p-2 rounded-xl text-[#777] hover:text-[#2F3332] hover:bg-[#FAF9F7] active:bg-[#EFECE6] transition-colors cursor-pointer"
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
