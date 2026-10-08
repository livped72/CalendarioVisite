import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, MapPin, Download, Loader2 } from 'lucide-react';
import { downloadS302Pdf, isWithin90Days } from '../lib/pdfGenerator';
export const SummaryCards = ({ stats, nextSettimana, onPlanNextWeek, }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const canDownloadS302 = nextSettimana &&
        nextSettimana.evento === 'congregazione' &&
        isWithin90Days(nextSettimana.startDate);
    const handleDownloadS302 = async () => {
        if (!nextSettimana)
            return;
        setIsDownloading(true);
        try {
            await downloadS302Pdf(nextSettimana);
        }
        catch (err) {
            console.error('Errore durante la generazione del PDF:', err);
            alert('Errore durante la generazione del modulo S-302');
        }
        finally {
            setIsDownloading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-2 pt-2", children: [_jsx("h3", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider", children: "Informazioni periodo corrente" }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-200 transition-all", children: [_jsxs("div", { className: "flex items-start sm:items-center gap-4 min-w-0", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs", children: _jsx(Calendar, { className: "w-6 h-6" }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Prossima visita" }), canDownloadS302 && (_jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200", children: "Entro 90 giorni" }))] }), _jsx("div", { className: "text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight", children: stats.prossimaSettimana.periodo }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-sm font-semibold text-purple-700", children: [_jsx(MapPin, { className: "w-4 h-4 shrink-0 text-purple-500" }), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "hover:underline text-left truncate cursor-pointer", title: "Dettagli settimana", children: stats.prossimaSettimana.stato.replace(/^📍\s*/, '') })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0", children: [canDownloadS302 && (_jsxs("button", { type: "button", onClick: handleDownloadS302, disabled: isDownloading, className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50", title: "Scarica avviso S-302 compilato per questa visita", children: [isDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Download, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Scarica Avviso S-302" })] })), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer", children: "Modifica / Dettagli" })] })] })] }));
};
