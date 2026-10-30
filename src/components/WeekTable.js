import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Pencil, MoreVertical, Trash2, Copy, ChevronRight, CalendarDays, FileDown, Mail, Loader2, } from 'lucide-react';
import { EventBadge } from './EventBadge';
import { abbreviateMonths } from '../lib/dateUtils';
import { downloadS302Pdf, emailS302Pdf } from '../lib/pdfGenerator';
const BADGE_COLORS = [
    'bg-blue-600', 'bg-slate-700', 'bg-indigo-600', 'bg-blue-700',
    'bg-sky-800', 'bg-indigo-700', 'bg-blue-800', 'bg-slate-600',
    'bg-blue-500', 'bg-indigo-800', 'bg-cyan-800', 'bg-blue-900',
];
export const WeekTable = ({ settimane, onEditWeek, onDeleteWeek, onDuplicateWeek, visitNumberMap, onViewAppuntamenti, senderName, }) => {
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [emailingId, setEmailingId] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const congCount = settimane.filter((w) => w.evento === 'congregazione').length;
    const altriCount = settimane.length - congCount;
    const displayItems = settimane.filter((w) => {
        if (filterType === 'congregazioni')
            return w.evento === 'congregazione';
        if (filterType === 'altri')
            return w.evento !== 'congregazione';
        return true;
    });
    const handleDownloadSinglePdf = async (item, e) => {
        e?.stopPropagation();
        setDownloadingId(item.id);
        try {
            await downloadS302Pdf(item);
        }
        catch (err) {
            console.error('Errore compilazione PDF S-302:', err);
            alert('Impossibile generare il PDF per questa settimana.');
        }
        finally {
            setDownloadingId(null);
        }
    };
    const handleEmailSinglePdf = async (item, e) => {
        e?.stopPropagation();
        setEmailingId(item.id);
        try {
            await emailS302Pdf(item, undefined, senderName);
        }
        catch (err) {
            console.error('Errore invio email S-302:', err);
            alert('Impossibile preparare l\'email S-302 per questa settimana.');
        }
        finally {
            setEmailingId(null);
        }
    };
    const getVisitInfo = (item) => {
        if (item.evento !== 'congregazione')
            return null;
        if (visitNumberMap?.has(item.id)) {
            return visitNumberMap.get(item.id);
        }
        if (item.numero && item.numero > 0) {
            return { numero: item.numero };
        }
        let localNum = 0;
        for (const w of settimane) {
            if (w.evento === 'congregazione') {
                localNum++;
                if (w.id === item.id)
                    return { numero: localNum };
            }
        }
        return { numero: 1 };
    };
    const getBadgeColor = (visitNum) => BADGE_COLORS[(Math.max(1, visitNum) - 1) % BADGE_COLORS.length];
    const renderEventCell = (item) => {
        if (item.evento === 'congregazione') {
            const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';
            return _jsx(EventBadge, { tipo: "congregazione", customLabel: congName, size: "sm" });
        }
        const customLabel = item.dettagli &&
            item.dettagli !== '-' &&
            ['congresso', 'evento_personalizzato', 'assemblea_circoscrizione'].includes(item.evento)
            ? item.dettagli
            : undefined;
        return _jsx(EventBadge, { tipo: item.evento, customLabel: customLabel, size: "sm" });
    };
    if (settimane.length === 0) {
        return (_jsxs("div", { className: "bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center", children: [_jsx("p", { className: "text-sm text-slate-600 font-bold", children: "Nessuna settimana pianificata per questo periodo." }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Premi \"+ Nuovo\" per aggiungere la prima settimana." })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "px-4 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "text-xs font-black text-slate-700 uppercase tracking-wider", children: ["Settimane del Semestre (", settimane.length, ")"] }) }), _jsxs("div", { className: "flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs", children: [_jsxs("button", { type: "button", onClick: () => setFilterType('all'), className: `px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'all'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`, children: ["Tutte (", settimane.length, ")"] }), _jsxs("button", { type: "button", onClick: () => setFilterType('congregazioni'), className: `px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'congregazioni'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`, children: ["Visite (", congCount, ")"] }), _jsxs("button", { type: "button", onClick: () => setFilterType('altri'), className: `px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === 'altri'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`, children: ["Altri Eventi (", altriCount, ")"] })] })] }), _jsx("div", { className: "hidden lg:block overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]", children: [_jsx("th", { className: "py-3 px-4 w-16 text-center", children: "#" }), _jsx("th", { className: "py-3 px-4 w-48", children: "Periodo (Mar \u2013 Dom)" }), _jsx("th", { className: "py-3 px-4 w-64", children: "Evento / Congregazione" }), _jsx("th", { className: "py-3 px-4", children: "Note" }), _jsx("th", { className: "py-3 px-3 w-52 text-right pr-4", children: "Azioni" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 text-slate-700", children: displayItems.map((item) => {
                                const isMenuOpen = activeMenuId === item.id;
                                const visitInfo = getVisitInfo(item);
                                const visitNum = visitInfo?.numero;
                                const isCong = item.evento === 'congregazione';
                                const isThisDownloading = downloadingId === item.id;
                                const isThisEmailing = emailingId === item.id;
                                return (_jsxs("tr", { className: "hover:bg-blue-50/40 transition-colors group", children: [_jsx("td", { className: "py-3 px-4 text-center", children: isCong && visitNum != null ? (_jsx("span", { className: `inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold shadow-2xs ${getBadgeColor(visitNum)}`, title: visitInfo?.motivazione || `Visita #${visitNum}`, children: visitNum })) : (_jsx("span", { className: "inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px]", children: "\u2014" })) }), _jsx("td", { className: "py-3 px-4 font-bold text-slate-900 whitespace-nowrap", children: onViewAppuntamenti ? (_jsxs("button", { type: "button", onClick: () => onViewAppuntamenti(item.id), className: "group/cell inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer", title: "Vedi appuntamenti di questa settimana", children: [abbreviateMonths(item.periodo), _jsx(CalendarDays, { className: "w-3.5 h-3.5 text-blue-600 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0" })] })) : (abbreviateMonths(item.periodo)) }), _jsx("td", { className: "py-3 px-4 whitespace-nowrap", children: onViewAppuntamenti ? (_jsx("button", { type: "button", onClick: () => onViewAppuntamenti(item.id), className: "cursor-pointer", title: "Vedi appuntamenti di questa settimana", children: renderEventCell(item) })) : (renderEventCell(item)) }), _jsx("td", { className: "py-3 px-4 text-slate-500 text-xs", children: item.note && item.note !== '-'
                                                ? item.note
                                                : _jsx("span", { className: "text-slate-300", children: "\u2014" }) }), _jsx("td", { className: "py-3 px-3 text-right pr-4 whitespace-nowrap relative", children: _jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [isCong && (_jsxs("button", { type: "button", onClick: (e) => handleDownloadSinglePdf(item, e), disabled: isThisDownloading || isThisEmailing, className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200", title: `Compila e scarica modello S-302 per ${item.dettagli}`, children: [isThisDownloading ? (_jsx(Loader2, { className: "w-3 h-3 animate-spin text-blue-600" })) : (_jsx(FileDown, { className: "w-3.5 h-3.5 text-blue-600" })), _jsx("span", { children: "S-302" })] })), _jsx("button", { onClick: () => onEditWeek(item), className: "p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer", title: "Modifica", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setActiveMenuId(isMenuOpen ? null : item.id), className: "p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer", children: _jsx(MoreVertical, { className: "w-3.5 h-3.5" }) }), isMenuOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setActiveMenuId(null) }), _jsxs("div", { className: "absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 text-slate-800", children: [isCong && (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: (e) => {
                                                                                            setActiveMenuId(null);
                                                                                            handleDownloadSinglePdf(item, e);
                                                                                        }, className: "w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-700 text-left font-semibold cursor-pointer", children: [_jsx(FileDown, { className: "w-3.5 h-3.5 text-blue-600" }), " Scarica S-302 (PDF)"] }), _jsxs("button", { onClick: (e) => {
                                                                                            setActiveMenuId(null);
                                                                                            handleEmailSinglePdf(item, e);
                                                                                        }, className: "w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-700 text-left font-semibold cursor-pointer", children: [_jsx(Mail, { className: "w-3.5 h-3.5 text-blue-600" }), " Invia via Email"] }), _jsx("div", { className: "border-t border-slate-100 my-1" })] })), _jsxs("button", { onClick: () => { setActiveMenuId(null); onEditWeek(item); }, className: "w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left font-semibold cursor-pointer text-slate-700", children: [_jsx(Pencil, { className: "w-3.5 h-3.5 text-slate-400" }), " Modifica"] }), _jsxs("button", { onClick: () => { setActiveMenuId(null); onDuplicateWeek(item); }, className: "w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left font-semibold cursor-pointer text-slate-700", children: [_jsx(Copy, { className: "w-3.5 h-3.5 text-slate-400" }), " Duplica"] }), _jsx("div", { className: "border-t border-slate-100 my-1" }), _jsxs("button", { onClick: () => { setActiveMenuId(null); onDeleteWeek(item.id); }, className: "w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-left font-semibold cursor-pointer", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), " Elimina"] })] })] }))] })] }) })] }, item.id));
                            }) })] }) }), _jsx("div", { className: "lg:hidden p-2.5 sm:p-3.5 space-y-2 bg-[#F8FAFC]", children: displayItems.length === 0 ? (_jsx("div", { className: "p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200", children: "Nessuna settimana corrisponde al filtro selezionato." })) : (displayItems.map((item) => {
                    const visitInfo = getVisitInfo(item);
                    const visitNum = visitInfo?.numero;
                    const isCong = item.evento === 'congregazione';
                    const isThisDownloading = downloadingId === item.id;
                    const isThisEmailing = emailingId === item.id;
                    const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione da definire';
                    if (isCong) {
                        return (
                        /* Card Visita Congregazione — Compatta, Chiara, Panoramica Immediata */
                        _jsxs("div", { className: "bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs p-2.5 sm:p-3 transition-all relative overflow-hidden", children: [_jsx("div", { className: `absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 ${visitNum != null ? getBadgeColor(visitNum) : 'bg-blue-600'}` }), _jsxs("div", { className: "pl-1.5 sm:pl-2", children: [_jsxs("div", { className: "flex items-center justify-between gap-1.5 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-1.5 min-w-0 flex-wrap", children: [visitNum != null && (_jsxs("span", { className: `inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-md text-white text-[10px] sm:text-[11px] font-black shrink-0 ${getBadgeColor(visitNum)}`, title: visitInfo?.motivazione || `Visita #${visitNum}`, children: ["#", visitNum] })), _jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md shrink-0", children: [_jsx(CalendarDays, { className: "w-3 h-3 text-slate-500 shrink-0" }), _jsx("span", { children: abbreviateMonths(item.periodo) })] }), visitInfo?.isReset && (_jsx("span", { className: "text-[9px] font-extrabold text-blue-700 uppercase bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded shrink-0", children: "Ciclo 1" }))] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [_jsxs("button", { type: "button", onClick: (e) => handleDownloadSinglePdf(item, e), disabled: isThisDownloading || isThisEmailing, className: "inline-flex items-center gap-1 px-2 py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50", title: "Scarica S-302 (PDF)", children: [isThisDownloading ? (_jsx(Loader2, { className: "w-3 h-3 animate-spin text-blue-600" })) : (_jsx(FileDown, { className: "w-3 h-3 text-blue-600" })), _jsx("span", { children: "S-302" })] }), _jsxs("button", { type: "button", onClick: (e) => handleEmailSinglePdf(item, e), disabled: isThisEmailing || isThisDownloading, className: "inline-flex items-center gap-1 px-2 py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50", title: "Prepara email S-302", children: [isThisEmailing ? (_jsx(Loader2, { className: "w-3 h-3 animate-spin" })) : (_jsx(Mail, { className: "w-3 h-3" })), _jsx("span", { children: "Email" })] }), onViewAppuntamenti && (_jsx("button", { type: "button", onClick: () => onViewAppuntamenti(item.id), className: "p-1 rounded-md sm:rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer", title: "Vedi appuntamenti della settimana", children: _jsx(CalendarDays, { className: "w-3.5 h-3.5" }) })), _jsx("button", { type: "button", onClick: (e) => {
                                                                e.stopPropagation();
                                                                onEditWeek(item);
                                                            }, className: "p-1 rounded-md sm:rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer", title: "Modifica settimana", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) })] })] }), _jsxs("div", { className: "mt-1 cursor-pointer group/title flex items-center justify-between gap-2", onClick: () => (onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)), children: [_jsx("div", { className: "font-bold text-slate-900 text-sm sm:text-base leading-snug truncate group-hover/title:text-blue-700 transition-colors", children: congName }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400 group-hover/title:text-blue-700 group-hover/title:translate-x-0.5 transition-all shrink-0" })] }), item.note && item.note !== '-' && (_jsx("div", { className: "text-[11px] text-slate-500 italic truncate mt-0.5", children: item.note }))] })] }, item.id));
                    }
                    /* Card per Altri Eventi (Settimana Libera, Assemblea, Congresso, ecc.) */
                    return (_jsxs("div", { className: "bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs p-2.5 sm:p-3 transition-all cursor-pointer", onClick: () => (onViewAppuntamenti ? onViewAppuntamenti(item.id) : onEditWeek(item)), children: [_jsxs("div", { className: "flex items-center justify-between gap-1.5 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-1.5 min-w-0 flex-wrap", children: [renderEventCell(item), _jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md shrink-0", children: [_jsx(CalendarDays, { className: "w-3 h-3 text-slate-500 shrink-0" }), _jsx("span", { children: abbreviateMonths(item.periodo) })] })] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [onViewAppuntamenti && (_jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    onViewAppuntamenti(item.id);
                                                }, className: "p-1 rounded-md sm:rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer", title: "Vedi appuntamenti dell'evento", children: _jsx(CalendarDays, { className: "w-3.5 h-3.5" }) })), _jsx("button", { type: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    onEditWeek(item);
                                                }, className: "p-1 rounded-md sm:rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer", title: "Modifica evento", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) })] })] }), item.dettagli && item.dettagli !== '-' && (_jsx("div", { className: "font-semibold text-slate-800 text-xs sm:text-sm mt-1 truncate", children: item.dettagli })), item.note && item.note !== '-' && (_jsx("div", { className: "text-[11px] text-slate-500 italic truncate mt-0.5", children: item.note }))] }, item.id));
                })) })] }));
};
