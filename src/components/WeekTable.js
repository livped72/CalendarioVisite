import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Pencil, MoreVertical, ChevronDown, ChevronUp, Trash2, Copy, ChevronRight } from 'lucide-react';
import { EventBadge } from './EventBadge';
import { abbreviateMonths } from '../lib/dateUtils';
const BADGE_COLORS = [
    'bg-[#7C8B82]', 'bg-[#68766E]', 'bg-[#5B6760]', 'bg-[#8D9B92]',
    'bg-[#5A7365]', 'bg-[#6E8276]', 'bg-[#4F6357]', 'bg-[#7A8C81]',
    'bg-[#65796E]', 'bg-[#74877C]', 'bg-[#5E7267]', 'bg-[#82958A]',
];
export const WeekTable = ({ settimane, onEditWeek, onDeleteWeek, onDuplicateWeek, }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const displayItems = isExpanded ? settimane : settimane.slice(0, 10);
    const hasMore = settimane.length > 10;
    // Visit counter: sequential number ONLY for 'congregazione' events
    const visitCountMap = new Map();
    let visitCounter = 0;
    for (const w of settimane) {
        if (w.evento === 'congregazione') {
            visitCounter++;
            visitCountMap.set(w.id, visitCounter);
        }
    }
    const getBadgeColor = (visitNum) => BADGE_COLORS[(visitNum - 1) % BADGE_COLORS.length];
    const renderEventCell = (item) => {
        if (item.evento === 'congregazione') {
            const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';
            return _jsx(EventBadge, { tipo: "congregazione", customLabel: congName, size: "sm" });
        }
        const customLabel = item.dettagli && item.dettagli !== '-' &&
            ['congresso', 'evento_personalizzato', 'assemblea_circoscrizione'].includes(item.evento)
            ? item.dettagli
            : undefined;
        return _jsx(EventBadge, { tipo: item.evento, customLabel: customLabel, size: "sm" });
    };
    if (settimane.length === 0) {
        return (_jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-10 text-center", children: [_jsx("p", { className: "text-sm text-[#888] font-medium", children: "Nessuna settimana pianificata per questo periodo." }), _jsx("p", { className: "text-xs text-[#AAA] mt-1", children: "Premi \"+ Nuovo\" per aggiungere la prima settimana." })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs overflow-hidden", children: [_jsx("div", { className: "hidden lg:block overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-[#E0DED9] bg-[#FAF9F7] text-[#2F3332] font-bold uppercase tracking-wider text-[11px]", children: [_jsx("th", { className: "py-3 px-4 w-16 text-center", children: "#" }), _jsx("th", { className: "py-3 px-4 w-52", children: "Periodo (Mar \u2013 Dom)" }), _jsx("th", { className: "py-3 px-4 w-64", children: "Evento" }), _jsx("th", { className: "py-3 px-4", children: "Note" }), _jsx("th", { className: "py-3 px-3 w-16 text-right pr-4" })] }) }), _jsx("tbody", { className: "divide-y divide-[#EFECE6] text-[#2F3332]", children: displayItems.map((item) => {
                                const isMenuOpen = activeMenuId === item.id;
                                const visitNum = visitCountMap.get(item.id);
                                const isCong = item.evento === 'congregazione';
                                return (_jsxs("tr", { className: "hover:bg-[#FAF9F7] transition-colors group", children: [_jsx("td", { className: "py-3 px-4 text-center", children: isCong && visitNum != null ? (_jsx("span", { className: `inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold shadow-2xs ${getBadgeColor(visitNum)}`, children: visitNum })) : (_jsx("span", { className: "inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3F0EA] text-[#AAA] text-[10px]", children: "\u2014" })) }), _jsx("td", { className: "py-3 px-4 font-bold text-[#2F3332] whitespace-nowrap", children: abbreviateMonths(item.periodo) }), _jsx("td", { className: "py-3 px-4 whitespace-nowrap", children: renderEventCell(item) }), _jsx("td", { className: "py-3 px-4 text-[#666] text-xs", children: item.note && item.note !== '-'
                                                ? item.note
                                                : _jsx("span", { className: "text-[#CCC]", children: "\u2014" }) }), _jsx("td", { className: "py-3 px-3 text-right pr-4 whitespace-nowrap relative", children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [_jsx("button", { onClick: () => onEditWeek(item), className: "p-1.5 rounded-lg text-[#888] hover:text-[#5B6760] hover:bg-[#FAF9F7] transition-colors cursor-pointer", title: "Modifica", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setActiveMenuId(isMenuOpen ? null : item.id), className: "p-1.5 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-[#FAF9F7] transition-colors cursor-pointer", children: _jsx(MoreVertical, { className: "w-3.5 h-3.5" }) }), isMenuOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setActiveMenuId(null) }), _jsxs("div", { className: "absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-[#E0DED9] py-1 z-50 text-xs animate-in fade-in zoom-in-95", children: [_jsxs("button", { onClick: () => { setActiveMenuId(null); onEditWeek(item); }, className: "w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FAF9F7] text-left font-semibold cursor-pointer text-[#2F3332]", children: [_jsx(Pencil, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), " Modifica"] }), _jsxs("button", { onClick: () => { setActiveMenuId(null); onDuplicateWeek(item); }, className: "w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FAF9F7] text-left font-semibold cursor-pointer text-[#2F3332]", children: [_jsx(Copy, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), " Duplica"] }), _jsx("div", { className: "border-t border-[#E0DED9] my-1" }), _jsxs("button", { onClick: () => { setActiveMenuId(null); onDeleteWeek(item.id); }, className: "w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-700 text-left font-semibold cursor-pointer", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), " Elimina"] })] })] }))] })] }) })] }, item.id));
                            }) })] }) }), _jsx("div", { className: "lg:hidden divide-y divide-[#EFECE6]", children: displayItems.map((item) => {
                    const visitNum = visitCountMap.get(item.id);
                    const isCong = item.evento === 'congregazione';
                    return (_jsxs("div", { onClick: () => onEditWeek(item), className: "p-3.5 hover:bg-[#FAF9F7] transition-colors flex items-center justify-between gap-3 cursor-pointer", children: [_jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [isCong && visitNum != null ? (_jsx("span", { className: `w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${getBadgeColor(visitNum)}`, children: visitNum })) : (_jsx("span", { className: "w-6 h-6 rounded-full bg-[#F3F0EA] text-[#AAA] text-[10px] flex items-center justify-center shrink-0 mt-0.5", children: "\u2014" })), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-1", children: [_jsx("span", { className: "font-bold text-xs text-[#2F3332]", children: abbreviateMonths(item.periodo) }), renderEventCell(item)] }), item.note && item.note !== '-' && (_jsx("div", { className: "text-xs text-[#666] truncate", children: item.note }))] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-[#AAA] shrink-0" })] }, item.id));
                }) }), hasMore && (_jsx("div", { className: "p-3 border-t border-[#E0DED9] bg-[#FAF9F7]/70 text-center", children: _jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5B6760] hover:text-[#2F3332] transition-colors py-1 px-3 rounded-lg hover:bg-white cursor-pointer", children: [isExpanded ? 'Mostra meno' : `Mostra altre ${settimane.length - 10} settimane`, isExpanded ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" })] }) }))] }));
};
