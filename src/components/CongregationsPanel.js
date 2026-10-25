import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Info, ExternalLink, ArrowRight } from 'lucide-react';
import { abbreviateMonths } from '../lib/dateUtils';
export const CongregationsPanel = ({ congregazioni, settimane, onViewAll, onSelectCongregazione, onNavigateToSettimana, }) => {
    const [showInfo, setShowInfo] = useState(false);
    // Sort by weeks elapsed descending (highest urgency first)
    const sorted = [...congregazioni].sort((a, b) => b.settimaneTrascorse - a.settimaneTrascorse);
    const topList = sorted.slice(0, 8);
    /** Trova la prossima settimana futura legata a questa congregazione */
    const findSettimanaForCong = (congId) => {
        const today = new Date().toISOString().slice(0, 10);
        const future = settimane
            .filter((s) => s.congregazioneId === congId && s.startDate >= today)
            .sort((a, b) => a.startDate.localeCompare(b.startDate));
        if (future.length > 0)
            return future[0];
        // fallback: ultima passata
        const past = settimane
            .filter((s) => s.congregazioneId === congId)
            .sort((a, b) => b.startDate.localeCompare(a.startDate));
        return past[0];
    };
    const getRankStyle = (index) => {
        switch (index) {
            case 0:
            case 1:
                return {
                    badgeBg: 'bg-rose-500 text-white shadow-2xs',
                    textClass: 'text-rose-600 font-bold',
                    borderClass: 'border-rose-200/80 bg-rose-50/50 hover:bg-rose-50/80',
                    linkClass: 'text-rose-700 hover:text-rose-800',
                };
            case 2:
            case 3:
                return {
                    badgeBg: 'bg-amber-500 text-white shadow-2xs',
                    textClass: 'text-amber-600 font-bold',
                    borderClass: 'border-amber-200/80 bg-amber-50/50 hover:bg-amber-50/80',
                    linkClass: 'text-amber-700 hover:text-amber-800',
                };
            default:
                return {
                    badgeBg: 'bg-blue-600 text-white shadow-2xs',
                    textClass: 'text-blue-600 font-bold',
                    borderClass: 'border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70',
                    linkClass: 'text-slate-800 hover:text-blue-600',
                };
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 text-slate-800", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Congregazioni per tempo dall'ultima visita" }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowInfo(!showInfo), className: "text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer", title: "Informazioni classifica", children: _jsx(Info, { className: "w-4 h-4" }) }), showInfo && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-20", onClick: () => setShowInfo(false) }), _jsx("div", { className: "absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 p-3 bg-white text-slate-700 text-xs rounded-2xl shadow-xl z-30 leading-relaxed border border-slate-200", children: "Le congregazioni sono ordinate in base al numero di settimane trascorse dall'ultima visita completata. I colori evidenziano l'urgenza di ripianificazione. Clicca sul nome per navigare direttamente alla settimana pianificata nel calendario." })] }))] })] }), _jsxs("button", { onClick: onViewAll, className: "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors hover:underline cursor-pointer self-start sm:self-auto", children: [_jsxs("span", { children: ["Vedi tutte le ", congregazioni.length, " congregazioni"] }), _jsx(ExternalLink, { className: "w-3.5 h-3.5" })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: topList.map((c, index) => {
                    const style = getRankStyle(index);
                    const formattedUltimaVisita = abbreviateMonths(c.ultimaVisita);
                    const linkedSettimana = findSettimanaForCong(c.id);
                    return (_jsxs("div", { className: `p-3 rounded-2xl border transition-all group flex flex-col gap-1.5 ${style.borderClass}`, children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: `w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs mt-0.5 ${style.badgeBg}`, children: index + 1 }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("button", { type: "button", onClick: () => {
                                                    if (onNavigateToSettimana) {
                                                        onNavigateToSettimana(linkedSettimana?.id);
                                                    }
                                                    else if (onSelectCongregazione) {
                                                        onSelectCongregazione(c);
                                                    }
                                                }, className: `text-xs font-bold truncate block w-full text-left transition-colors underline decoration-dotted underline-offset-2 cursor-pointer ${onNavigateToSettimana ? style.linkClass : 'text-slate-800 hover:text-blue-600'}`, title: linkedSettimana ? `Vai alla settimana: ${linkedSettimana.periodo}` : 'Vai agli appuntamenti', children: c.nome }), _jsxs("div", { className: "text-[10px] text-slate-500", children: ["Ultima: ", formattedUltimaVisita] })] }), _jsx("div", { className: "shrink-0 text-right", children: _jsxs("span", { className: `text-xs ${style.textClass}`, children: [c.settimaneTrascorse, _jsx("span", { className: "font-normal text-[10px] text-slate-400", children: " s." })] }) })] }), linkedSettimana && onNavigateToSettimana && (_jsxs("button", { type: "button", onClick: () => onNavigateToSettimana(linkedSettimana.id), className: `inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${style.linkClass} opacity-80 hover:opacity-100`, title: `Vai alla settimana: ${linkedSettimana.periodo}`, children: [_jsx(ArrowRight, { className: "w-3 h-3" }), _jsx("span", { className: "truncate", children: abbreviateMonths(linkedSettimana.periodo) })] }))] }, c.id));
                }) })] }));
};
