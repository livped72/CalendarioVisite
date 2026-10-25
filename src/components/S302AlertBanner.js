import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Mail, FileDown, Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadS302Pdf, emailS302Pdf, getS302TargetMonth, getS302TargetMonthAlerts } from '../lib/pdfGenerator';
export const S302AlertBanner = ({ allSettimane, senderName }) => {
    const [expanded, setExpanded] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [emailingId, setEmailingId] = useState(null);
    const [emailingAll, setEmailingAll] = useState(false);
    const { label: monthLabel } = getS302TargetMonth();
    const alerts = getS302TargetMonthAlerts(allSettimane);
    // Niente da mostrare se non ci sono visite nel mese target
    if (alerts.length === 0)
        return null;
    const handleDownload = async (item) => {
        setDownloadingId(item.id);
        try {
            await downloadS302Pdf(item);
        }
        catch {
            alert('Errore nella generazione del PDF S-302.');
        }
        finally {
            setDownloadingId(null);
        }
    };
    const handleEmail = async (item) => {
        setEmailingId(item.id);
        try {
            await emailS302Pdf(item, undefined, senderName);
        }
        catch {
            alert("Errore nella preparazione dell'email S-302.");
        }
        finally {
            setEmailingId(null);
        }
    };
    const handleEmailAll = async () => {
        setEmailingAll(true);
        try {
            for (let i = 0; i < alerts.length; i++) {
                await emailS302Pdf(alerts[i], undefined, senderName);
                if (i < alerts.length - 1) {
                    await new Promise((r) => setTimeout(r, 600));
                }
            }
        }
        catch {
            alert('Errore durante l\'invio email multiplo S-302.');
        }
        finally {
            setEmailingAll(false);
        }
    };
    return (_jsxs("div", { className: "rounded-2xl border border-blue-200 bg-blue-50/90 shadow-sm overflow-hidden", role: "alert", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0", children: _jsx(Send, { className: "w-4 h-4 text-blue-600" }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "text-sm font-black text-blue-950 uppercase tracking-wide", children: ["Moduli S-302 \u2014 ", monthLabel] }), _jsxs("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs", children: [alerts.length, " ", alerts.length === 1 ? 'visita' : 'visite'] })] }), _jsxs("p", { className: "text-xs mt-0.5 text-blue-800 font-medium", children: ["Invia i moduli S-302 per le visite di ", monthLabel] })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [_jsxs("button", { type: "button", onClick: handleEmailAll, disabled: emailingAll, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50", title: `Invia email S-302 per tutte le ${alerts.length} visite di ${monthLabel}`, children: [emailingAll ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsxs("span", { className: "hidden sm:inline", children: ["Invia tutte (", alerts.length, ")"] }), _jsx("span", { className: "sm:hidden", children: "Email" })] }), _jsx("button", { type: "button", onClick: () => setExpanded((v) => !v), className: "p-2 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/70 transition-colors cursor-pointer", title: expanded ? 'Comprimi' : 'Espandi', children: expanded ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] })] }), expanded && (_jsxs("div", { className: "px-4 pb-4 space-y-1.5", children: [alerts.map((item) => {
                        const isDownloading = downloadingId === item.id;
                        const isEmailing = emailingId === item.id;
                        const dateLabel = item.startDate
                            ? new Date(item.startDate).toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })
                            : item.periodo;
                        const congName = item.dettagli && item.dettagli !== '-' ? item.dettagli : 'Congregazione';
                        return (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white border border-blue-200/80 shadow-2xs", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs font-black text-slate-900 truncate", children: congName }), _jsx("div", { className: "text-[11px] text-slate-500 truncate", children: dateLabel })] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0 flex-wrap", children: [_jsxs("button", { type: "button", onClick: () => handleDownload(item), disabled: isDownloading || isEmailing, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50", title: "Scarica PDF S-302", children: [isDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(FileDown, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "PDF" })] }), _jsxs("button", { type: "button", onClick: () => handleEmail(item), disabled: isEmailing || isDownloading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-sm disabled:opacity-50", title: "Scarica PDF e prepara email S-302", children: [isEmailing ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Invia Email" })] })] })] }, item.id));
                    }), _jsx("p", { className: "text-[11px] text-blue-900/80 mt-2 leading-relaxed", children: "\u2139\uFE0F Il PDF viene scaricato automaticamente, poi si apre il programma email pre-compilato. Allega il PDF prima di inviare." })] }))] }));
};
