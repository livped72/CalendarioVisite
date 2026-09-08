import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { abbreviateMonths } from '../lib/dateUtils';
export const CongregationsPanel = ({ congregazioni, onViewAll, onSelectCongregazione, }) => {
    const [showInfo, setShowInfo] = useState(false);
    // Sort by weeks elapsed descending (highest urgency first)
    const sorted = [...congregazioni].sort((a, b) => b.settimaneTrascorse - a.settimaneTrascorse);
    const topList = sorted.slice(0, 8);
    const getRankStyle = (index) => {
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
    return (_jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-5", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E0DED9] mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-xs font-bold text-[#2F3332] uppercase tracking-wider", children: "Congregazioni per tempo dall'ultima visita" }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowInfo(!showInfo), className: "text-[#888] hover:text-[#2F3332] transition-colors p-1 cursor-pointer", title: "Informazioni classifica", children: _jsx(Info, { className: "w-4 h-4" }) }), showInfo && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-20", onClick: () => setShowInfo(false) }), _jsx("div", { className: "absolute left-0 sm:left-auto sm:right-0 mt-1 w-72 p-3 bg-[#2F3332] text-white text-xs rounded-xl shadow-xl z-30 leading-relaxed border border-[#444]", children: "Le congregazioni sono ordinate in base al numero di settimane trascorse dall'ultima visita completata. I colori evidenziano l'urgenza di ripianificazione." })] }))] })] }), _jsxs("button", { onClick: onViewAll, className: "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#5B6760] hover:text-[#2F3332] transition-colors hover:underline cursor-pointer self-start sm:self-auto", children: [_jsxs("span", { children: ["Vedi tutte le ", congregazioni.length, " congregazioni"] }), _jsx(ExternalLink, { className: "w-3.5 h-3.5" })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: topList.map((c, index) => {
                    const style = getRankStyle(index);
                    const formattedUltimaVisita = abbreviateMonths(c.ultimaVisita);
                    return (_jsxs("div", { onClick: () => onSelectCongregazione && onSelectCongregazione(c), className: `p-3 rounded-xl border transition-all cursor-pointer hover:border-[#7C8B82] hover:shadow-xs group flex items-center justify-between gap-3 ${style.borderClass}`, children: [_jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [_jsx("span", { className: `w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs ${style.badgeBg}`, children: index + 1 }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs font-bold text-[#2F3332] truncate group-hover:text-[#5B6760] transition-colors", children: c.nome }), _jsxs("div", { className: "text-[11px] text-[#777] truncate", children: ["Ultima: ", formattedUltimaVisita] })] })] }), _jsx("div", { className: "text-right shrink-0", children: _jsxs("span", { className: `text-xs ${style.textClass}`, children: [c.settimaneTrascorse, ' ', _jsx("span", { className: "font-normal text-[10px]", children: c.settimaneTrascorse === 1 ? 'sett.' : 'sett.' })] }) })] }, c.id));
                }) })] }));
};
