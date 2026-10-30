import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, MapPin, Download, Mail, Loader2 } from 'lucide-react';
import { downloadS302Pdf, emailS302Pdf } from '../lib/pdfGenerator';
export const SummaryCards = ({ stats, nextSettimana, onPlanNextWeek, senderName, }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);
    const isCongregazioneNext = nextSettimana && nextSettimana.evento === 'congregazione';
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
            await emailS302Pdf(nextSettimana, undefined, senderName);
        }
        catch (err) {
            console.error('Errore durante la preparazione email S-302:', err);
            alert('Errore durante la preparazione dell\'email S-302');
        }
        finally {
            setIsEmailing(false);
        }
    };
    return (_jsxs("div", { className: "space-y-2 pt-2", children: [_jsx("h3", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Informazioni periodo corrente" }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col gap-4 hover:shadow-md transition-all", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs", children: _jsx(Calendar, { className: "w-5 h-5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "flex flex-wrap items-center gap-2", children: _jsx("span", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Prossima visita" }) }), _jsx("div", { className: "text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight leading-snug", children: stats.prossimaSettimana.periodo }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-sm font-bold text-blue-600", children: [_jsx(MapPin, { className: "w-4 h-4 shrink-0 text-blue-600" }), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "hover:underline text-left truncate cursor-pointer text-blue-600 hover:text-blue-800", title: "Dettagli settimana", children: stats.prossimaSettimana.stato.replace(/^📍\s*/, '') })] })] })] }), isCongregazioneNext ? (_jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100", children: [_jsxs("button", { type: "button", onClick: handleDownloadS302, disabled: isDownloading, className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100 active:scale-95 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50", title: "Scarica avviso S-302 compilato per questa visita", children: [isDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-blue-600" })) : (_jsx(Download, { className: "w-3.5 h-3.5 text-blue-600" })), _jsx("span", { children: "Scarica S-302" })] }), _jsxs("button", { type: "button", onClick: handleEmailS302, disabled: isEmailing || isDownloading, className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95", title: "Prepara email S-302", children: [isEmailing ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Invia via Email" })] }), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "ml-auto px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs", children: "Modifica" })] })) : (_jsx("div", { className: "flex items-center gap-2 pt-3 border-t border-slate-100", children: _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs", children: "Modifica / Dettagli" }) }))] })] }));
};
