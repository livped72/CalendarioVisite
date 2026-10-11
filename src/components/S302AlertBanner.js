import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertTriangle, FileDown, Mail, X, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { daysUntilVisit, downloadS302Pdf, emailS302Pdf, downloadAll90DaysS302 } from '../lib/pdfGenerator';
function urgencyLabel(days) {
    if (days <= 7)
        return { text: 'URGENTE', className: 'bg-red-600 text-white' };
    if (days <= 30)
        return { text: 'PRIORITÀ ALTA', className: 'bg-orange-500 text-white' };
    return { text: 'DA INVIARE', className: 'bg-blue-700 text-white' };
}
export const S302AlertBanner = ({ alerts }) => {
    const [dismissed, setDismissed] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [emailingId, setEmailingId] = useState(null);
    const [downloadingAll, setDownloadingAll] = useState(false);
    if (dismissed || alerts.length === 0)
        return null;
    const mostUrgent = alerts[0];
    const daysLeft = daysUntilVisit(mostUrgent.startDate);
    const handleDownload = async (item) => {
        setDownloadingId(item.id);
        try {
            await downloadS302Pdf(item);
        }
        catch (err) {
            alert('Errore nella generazione del PDF S-302.');
        }
        finally {
            setDownloadingId(null);
        }
    };
    const handleEmail = async (item) => {
        setEmailingId(item.id);
        try {
            await emailS302Pdf(item);
        }
        catch (err) {
            alert('Errore nella preparazione dell\'email S-302.');
        }
        finally {
            setEmailingId(null);
        }
    };
    const handleDownloadAll = async () => {
        setDownloadingAll(true);
        try {
            await downloadAll90DaysS302(alerts);
        }
        catch (err) {
            alert('Errore nel download multiplo S-302.');
        }
        finally {
            setDownloadingAll(false);
        }
    };
    // Choose banner style based on urgency
    const isUrgent = daysLeft <= 7;
    const isHigh = daysLeft <= 30;
    const bannerBg = isUrgent
        ? 'bg-red-50 border-red-300'
        : isHigh
            ? 'bg-orange-50 border-orange-300'
            : 'bg-blue-50 border-blue-300';
    const iconColor = isUrgent ? 'text-red-600' : isHigh ? 'text-orange-500' : 'text-blue-700';
    const titleColor = isUrgent ? 'text-red-800' : isHigh ? 'text-orange-800' : 'text-blue-800';
    const subtitleColor = isUrgent ? 'text-red-700' : isHigh ? 'text-orange-700' : 'text-blue-700';
    const badgeBg = isUrgent
        ? 'bg-red-100 text-red-700 border-red-300'
        : isHigh
            ? 'bg-orange-100 text-orange-700 border-orange-300'
            : 'bg-blue-100 text-blue-700 border-blue-300';
    const btnPrimary = isUrgent
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : isHigh
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-blue-700 hover:bg-blue-800 text-white';
    const btnSecondary = isUrgent
        ? 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
        : isHigh
            ? 'bg-white border border-orange-300 text-orange-700 hover:bg-orange-50'
            : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50';
    return (_jsxs("div", { className: `rounded-2xl border-2 shadow-md overflow-hidden transition-all ${bannerBg}`, role: "alert", "aria-live": "polite", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isUrgent ? 'bg-red-100' : isHigh ? 'bg-orange-100' : 'bg-blue-100'}`, children: isUrgent ? (_jsx(AlertTriangle, { className: `w-5 h-5 ${iconColor} animate-pulse` })) : (_jsx(Clock, { className: `w-5 h-5 ${iconColor}` })) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: `text-sm font-black uppercase tracking-wide ${titleColor}`, children: alerts.length === 1
                                                    ? '⚠️ Invio S-302 richiesto'
                                                    : `⚠️ ${alerts.length} moduli S-302 da inviare` }), _jsx("span", { className: `text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${urgencyLabel(daysLeft).className}`, children: urgencyLabel(daysLeft).text })] }), _jsx("p", { className: `text-xs mt-0.5 font-medium ${subtitleColor}`, children: alerts.length === 1
                                            ? `Visita a ${mostUrgent.dettagli || 'congregazione'} — ${daysLeft <= 0
                                                ? 'questa settimana!'
                                                : daysLeft === 1
                                                    ? 'domani!'
                                                    : `tra ${daysLeft} giorni`} — invia l'S-302 entro il termine dei 90 giorni.`
                                            : `Prossima: ${mostUrgent.dettagli || 'congregazione'} tra ${daysLeft > 0 ? daysLeft : 0} giorni. Controlla e invia tutti i moduli.` })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [_jsx("button", { type: "button", onClick: () => setExpanded((v) => !v), className: `p-2 rounded-xl transition-colors ${btnSecondary} cursor-pointer`, title: expanded ? 'Comprimi dettagli' : 'Espandi dettagli', children: expanded ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })) }), _jsx("button", { type: "button", onClick: () => setDismissed(true), className: `p-2 rounded-xl transition-colors ${btnSecondary} cursor-pointer`, title: "Chiudi avviso (temporaneamente)", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), expanded && (_jsxs("div", { className: "px-4 pb-4 space-y-2", children: [alerts.length > 1 && (_jsxs("div", { className: `flex flex-wrap items-center gap-2 p-3 rounded-xl border mb-1 ${isUrgent
                            ? 'bg-red-100/60 border-red-200'
                            : isHigh
                                ? 'bg-orange-100/60 border-orange-200'
                                : 'bg-blue-100/60 border-blue-200'}`, children: [_jsxs("span", { className: `text-xs font-semibold flex-1 ${subtitleColor}`, children: ["Scarica tutti i ", alerts.length, " moduli S-302 in una volta"] }), _jsxs("button", { type: "button", onClick: handleDownloadAll, disabled: downloadingAll, className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 ${btnPrimary}`, children: [downloadingAll ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(FileDown, { className: "w-3.5 h-3.5" })), _jsxs("span", { children: ["Scarica tutti (", alerts.length, ")"] })] })] })), _jsx("div", { className: "space-y-1.5", children: alerts.map((item) => {
                            const days = daysUntilVisit(item.startDate);
                            const { className: urgClass } = urgencyLabel(days);
                            const isThisDownloading = downloadingId === item.id;
                            const isThisEmailing = emailingId === item.id;
                            // Format dates nicely
                            const startLabel = item.startDate
                                ? new Date(item.startDate).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })
                                : item.periodo;
                            return (_jsxs("div", { className: `flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-white/80 ${badgeBg.replace('text-', 'border-').replace('bg-', '')}`, style: { borderColor: isUrgent ? '#fca5a5' : isHigh ? '#fdba74' : '#93c5fd' }, children: [_jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [_jsx("span", { className: `text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${urgClass}`, children: days <= 0 ? 'OGGI' : `${days}gg` }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: `text-xs font-bold truncate ${titleColor}`, children: item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione' }), _jsx("div", { className: "text-[11px] text-slate-500 truncate", children: startLabel })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0 flex-wrap", children: [_jsxs("button", { type: "button", onClick: () => handleDownload(item), disabled: isThisDownloading, className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 ${btnPrimary}`, title: "Scarica modulo S-302 compilato", children: [isThisDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(FileDown, { className: "w-3.5 h-3.5" })), _jsx("span", { className: "hidden sm:inline", children: "Scarica" }), _jsx("span", { className: "sm:hidden", children: "PDF" })] }), _jsxs("button", { type: "button", onClick: () => handleEmail(item), disabled: isThisEmailing || isThisDownloading, className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all disabled:opacity-50 ${btnSecondary}`, title: "Scarica PDF e apri l'email pre-compilata", children: [isThisEmailing ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsx("span", { className: "hidden sm:inline", children: "Invia Email" }), _jsx("span", { className: "sm:hidden", children: "Email" })] })] })] }, item.id));
                        }) }), _jsxs("p", { className: `text-[11px] leading-relaxed mt-2 ${subtitleColor}`, children: ["\u2139\uFE0F ", _jsx("strong", { children: "Come funziona \"Invia Email\":" }), " Il PDF viene scaricato automaticamente, poi si apre il programma email con il messaggio pre-compilato. Allega il PDF scaricato prima di inviare."] })] }))] }));
};
