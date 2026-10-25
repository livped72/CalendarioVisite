import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Building2, MapPin, User, Calendar, FileText, Trash2 } from 'lucide-react';
export const CongregazioneModal = ({ isOpen, onClose, onSave, onDelete, editingCongregazione, }) => {
    const [nome, setNome] = useState('');
    const [citta, setCitta] = useState('');
    const [contatto, setContatto] = useState('');
    const [note, setNote] = useState('');
    const [ultimaVisitaDate, setUltimaVisitaDate] = useState('');
    const [settimaneTrascorse, setSettimaneTrascorse] = useState(0);
    const [totaleVisite, setTotaleVisite] = useState(0);
    useEffect(() => {
        if (!isOpen)
            return;
        if (editingCongregazione) {
            setNome(editingCongregazione.nome || '');
            setCitta(editingCongregazione.citta || '');
            setContatto(editingCongregazione.contatto || '');
            setNote(editingCongregazione.note || '');
            setUltimaVisitaDate(editingCongregazione.ultimaVisitaDate || new Date().toISOString().slice(0, 10));
            setSettimaneTrascorse(editingCongregazione.settimaneTrascorse || 0);
            setTotaleVisite(editingCongregazione.totaleVisite || 0);
        }
        else {
            setNome('');
            setCitta('');
            setContatto('');
            setNote('');
            setUltimaVisitaDate(new Date().toISOString().slice(0, 10));
            setSettimaneTrascorse(0);
            setTotaleVisite(0);
        }
    }, [isOpen, editingCongregazione]);
    if (!isOpen)
        return null;
    const formatDateText = (isoDate) => {
        if (!isoDate)
            return 'Da definire';
        try {
            const d = new Date(isoDate);
            return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        catch {
            return isoDate;
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nome.trim())
            return;
        const updated = {
            id: editingCongregazione ? editingCongregazione.id : `c_${Date.now()}`,
            nome: nome.trim(),
            citta: citta.trim() || undefined,
            contatto: contatto.trim() || undefined,
            note: note.trim() || undefined,
            ultimaVisitaDate: ultimaVisitaDate || new Date().toISOString().slice(0, 10),
            ultimaVisita: formatDateText(ultimaVisitaDate),
            settimaneTrascorse: Number(settimaneTrascorse) || 0,
            totaleVisite: Number(totaleVisite) || 0,
        };
        onSave(updated);
        onClose();
    };
    const handleDelete = () => {
        if (!editingCongregazione || !onDelete)
            return;
        if (confirm(`Sei sicuro di voler eliminare definitivamente la "${editingCongregazione.nome}"?`)) {
            onDelete(editingCongregazione.id);
            onClose();
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building2, { className: "w-4 h-4 text-blue-600" }), _jsx("h3", { className: "text-sm font-bold text-slate-900 uppercase tracking-wider", children: editingCongregazione ? 'Modifica Congregazione' : 'Nuova Congregazione' })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-700 uppercase mb-1", children: "Nome Congregazione *" }), _jsx("input", { type: "text", required: true, placeholder: "es. Congregazione Milano Est", value: nome, onChange: (e) => setNome(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 font-medium" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-600" }), " Citt\u00E0 / Zona"] }), _jsx("input", { type: "text", placeholder: "es. Milano Centro", value: citta, onChange: (e) => setCitta(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1", children: [_jsx(User, { className: "w-3.5 h-3.5 text-blue-600" }), " Referente / Contatto"] }), _jsx("input", { type: "text", placeholder: "es. Fr. Andrea Rossi", value: contatto, onChange: (e) => setContatto(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400" })] })] }), _jsxs("div", { className: "p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3", children: [_jsxs("div", { className: "text-xs font-bold text-slate-800 uppercase flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-blue-600" }), " Dati Visita & Statistiche"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-600 mb-1", children: "Data Ultima Visita" }), _jsx("input", { type: "date", value: ultimaVisitaDate, onChange: (e) => setUltimaVisitaDate(e.target.value), className: "w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-600 mb-1", children: "Settimane trascorse" }), _jsx("input", { type: "number", min: "0", value: settimaneTrascorse, onChange: (e) => setSettimaneTrascorse(parseInt(e.target.value, 10) || 0), className: "w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-600 mb-1", children: "Totale visite" }), _jsx("input", { type: "number", min: "0", value: totaleVisite, onChange: (e) => setTotaleVisite(parseInt(e.target.value, 10) || 0), className: "w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1", children: [_jsx(FileText, { className: "w-3.5 h-3.5 text-blue-600" }), " Note / Sala del Regno"] }), _jsx("textarea", { rows: 3, placeholder: "Indirizzo Sala del Regno, orari adunanze o dettagli utili...", value: note, onChange: (e) => setNote(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 resize-none font-medium" })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-100", children: [editingCongregazione && onDelete ? (_jsxs("button", { type: "button", onClick: handleDelete, className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Elimina" })] })) : (_jsx("div", {})), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer", children: "Annulla" }), _jsx("button", { type: "submit", className: "px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer", children: "Salva" })] })] })] })] })] }));
};
