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
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Building2, { className: "w-4 h-4 text-[#7C8B82]" }), _jsx("h3", { className: "text-sm font-bold text-[#2F3332] uppercase tracking-wider", children: editingCongregazione ? 'Modifica Congregazione' : 'Nuova Congregazione' })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-stone-100 transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 max-h-[80vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Nome Congregazione *" }), _jsx("input", { type: "text", required: true, placeholder: "es. Congregazione Milano Est", value: nome, onChange: (e) => setNome(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white font-medium" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), " Citt\u00E0 / Zona"] }), _jsx("input", { type: "text", placeholder: "es. Milano Centro", value: citta, onChange: (e) => setCitta(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1", children: [_jsx(User, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), " Referente / Contatto"] }), _jsx("input", { type: "text", placeholder: "es. Fr. Andrea Rossi", value: contatto, onChange: (e) => setContatto(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white" })] })] }), _jsxs("div", { className: "p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] space-y-3", children: [_jsxs("div", { className: "text-xs font-bold text-[#2F3332] uppercase flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), " Dati Visita & Statistiche"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#555] mb-1", children: "Data Ultima Visita" }), _jsx("input", { type: "date", value: ultimaVisitaDate, onChange: (e) => setUltimaVisitaDate(e.target.value), className: "w-full px-2.5 py-1.5 rounded-lg border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#555] mb-1", children: "Settimane trascorse" }), _jsx("input", { type: "number", min: "0", value: settimaneTrascorse, onChange: (e) => setSettimaneTrascorse(parseInt(e.target.value, 10) || 0), className: "w-full px-2.5 py-1.5 rounded-lg border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-[#555] mb-1", children: "Totale visite" }), _jsx("input", { type: "number", min: "0", value: totaleVisite, onChange: (e) => setTotaleVisite(parseInt(e.target.value, 10) || 0), className: "w-full px-2.5 py-1.5 rounded-lg border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1", children: [_jsx(FileText, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), " Note / Sala del Regno"] }), _jsx("textarea", { rows: 3, placeholder: "Indirizzo Sala del Regno, orari adunanze o dettagli utili...", value: note, onChange: (e) => setNote(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white resize-none" })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-[#E0DED9]", children: [editingCongregazione && onDelete ? (_jsxs("button", { type: "button", onClick: handleDelete, className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Elimina" })] })) : (_jsx("div", {})), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-xs font-bold text-[#666] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer", children: "Annulla" }), _jsx("button", { type: "submit", className: "px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] rounded-xl transition-colors shadow-2xs cursor-pointer", children: "Salva" })] })] })] })] })] }));
};
