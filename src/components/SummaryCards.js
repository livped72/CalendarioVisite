import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, MapPin, Download, Mail, Loader2 } from 'lucide-react';
import { downloadS302Pdf, emailS302Pdf, isWithin90Days } from '../lib/pdfGenerator';
export const SummaryCards = ({ stats, nextSettimana, onPlanNextWeek, }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);
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
    const handleEmailS302 = async () => {
        if (!nextSettimana)
            return;
        setIsEmailing(true);
        try {
            await emailS302Pdf(nextSettimana);
        }
        catch (err) {
            console.error('Errore durante la preparazione email S-302:', err);
            alert('Errore durante la preparazione dell\'email S-302');
        }
        finally {
            setIsEmailing(false);
        }
    };
    return (_jsxs("div", { className: "space-y-2 pt-2", children: [_jsx("h3", { className: "text-xs font-bold text-slate-700 uppercase tracking-wider", children: "Informazioni periodo corrente" }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col gap-4 hover:border-blue-200 transition-all", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm", children: _jsx(Calendar, { className: "w-5 h-5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Prossima visita" }), canDownloadS302 && (_jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200", children: "S-302 entro 90 giorni" }))] }), _jsx("div", { className: "text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight leading-snug", children: stats.prossimaSettimana.periodo }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-sm font-semibold text-blue-700", children: [_jsx(MapPin, { className: "w-4 h-4 shrink-0 text-blue-500" }), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "hover:underline text-left truncate cursor-pointer", title: "Dettagli settimana", children: stats.prossimaSettimana.stato.replace(/^📍\s*/, '') })] })] })] }), canDownloadS302 && (_jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100", children: [_jsx("span", { className: "text-[11px] text-slate-500 font-medium mr-auto hidden sm:block", children: "Modulo S-302 disponibile per questa visita" }), _jsxs("button", { type: "button", onClick: handleDownloadS302, disabled: isDownloading, className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50", title: "Scarica avviso S-302 compilato per questa visita", children: [isDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Download, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Scarica S-302" })] }), _jsxs("button", { type: "button", onClick: handleEmailS302, disabled: isEmailing || isDownloading, className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50", title: "Scarica PDF e apri email pre-compilata per invio", children: [isEmailing ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Invia via Email" })] })] })), !canDownloadS302 && (_jsx("div", { className: "flex items-center gap-2 pt-3 border-t border-slate-100", children: _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer", children: "Modifica / Dettagli" }) }))] })] }));
};
