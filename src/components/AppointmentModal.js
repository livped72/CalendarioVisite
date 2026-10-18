import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, Trash2, Calendar } from 'lucide-react';
export const AppointmentModal = ({ isOpen, onClose, onSave, onDelete, editingAppointment, defaultDate, settimanaId, }) => {
    const [titolo, setTitolo] = useState('');
    const [data, setData] = useState('');
    const [oraInizio, setOraInizio] = useState('09:30');
    const [luogo, setLuogo] = useState('');
    const [note, setNote] = useState('');
    useEffect(() => {
        if (!isOpen)
            return;
        if (editingAppointment) {
            setTitolo(editingAppointment.titolo || '');
            setData(editingAppointment.data || defaultDate || new Date().toISOString().slice(0, 10));
            setOraInizio(editingAppointment.oraInizio || '09:30');
            setLuogo(editingAppointment.luogo || '');
            setNote(editingAppointment.note || '');
        }
        else {
            setTitolo('');
            setData(defaultDate || new Date().toISOString().slice(0, 10));
            setOraInizio('09:30');
            setLuogo('');
            setNote('');
        }
    }, [isOpen, editingAppointment, defaultDate]);
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!titolo.trim() || !data)
            return;
        const saved = {
            id: editingAppointment ? editingAppointment.id : `app_${Date.now()}`,
            settimanaId: editingAppointment?.settimanaId || settimanaId,
            titolo: titolo.trim(),
            categoria: 'servizio',
            data,
            oraInizio: oraInizio.trim() || '09:00',
            luogo: luogo.trim() || undefined,
            note: note.trim() || undefined,
        };
        onSave(saved);
        onClose();
    };
    const handleDelete = () => {
        if (!editingAppointment || !onDelete)
            return;
        if (confirm(`Eliminare l'appuntamento "${editingAppointment.titolo}"?`)) {
            onDelete(editingAppointment.id);
            onClose();
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity", onClick: onClose }), _jsxs("div", { className: "relative bg-[#0F1A30] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#1E3A5F] animate-in fade-in zoom-in-95 duration-150 text-[#F8FAFC] z-10 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-[#1E3A5F] bg-[#0B1426] shrink-0", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center shadow-2xs", children: _jsx(Calendar, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-white", children: editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento' }), _jsx("p", { className: "text-[11px] text-blue-300 font-medium", children: editingAppointment ? 'Aggiorna i dettagli dell’evento' : 'Inserisci i dettagli dell’evento' })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] transition-colors cursor-pointer", "aria-label": "Chiudi", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-5 space-y-4 overflow-y-auto flex-1 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5", children: "Titolo / Descrizione *" }), _jsx("input", { type: "text", required: true, autoFocus: true, placeholder: "es. Servizio di campo, Incontro Anziani, ecc.", value: titolo, onChange: (e) => setTitolo(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F] text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 bg-[#0B1426] font-medium text-white placeholder-slate-500 transition-all" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "flex flex-col gap-1.5 min-w-0", children: [_jsxs("label", { className: "flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("span", { children: "Data *" })] }), _jsx("input", { type: "date", required: true, value: data, onChange: (e) => setData(e.target.value), className: "w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-[#1E3A5F] text-xs sm:text-sm bg-[#0B1426] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white transition-all box-border" })] }), _jsxs("div", { className: "flex flex-col gap-1.5 min-w-0", children: [_jsxs("label", { className: "flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("span", { children: "Orario *" })] }), _jsx("input", { type: "time", required: true, value: oraInizio, onChange: (e) => setOraInizio(e.target.value), className: "w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-[#1E3A5F] text-xs sm:text-sm bg-[#0B1426] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white transition-all box-border" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("span", { children: "Luogo / Indirizzo" })] }), _jsx("input", { type: "text", placeholder: "es. Sala del Regno, Piazza Duomo, Casa famiglia...", value: luogo, onChange: (e) => setLuogo(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F] text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 bg-[#0B1426] font-medium text-white placeholder-slate-500 transition-all" })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5", children: [_jsx(FileText, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("span", { children: "Note / Dettagli" })] }), _jsx("textarea", { rows: 3, placeholder: "Dettagli specifici o promemoria...", value: note, onChange: (e) => setNote(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-[#1E3A5F] text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 bg-[#0B1426] font-medium text-white placeholder-slate-500 resize-none transition-all" })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-[#172646] mt-2 shrink-0", children: [editingAppointment && onDelete ? (_jsxs("button", { type: "button", onClick: handleDelete, className: "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer", children: [_jsx(Trash2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Elimina" })] })) : (_jsx("div", {})), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-[#142342] rounded-xl transition-colors cursor-pointer", children: "Annulla" }), _jsx("button", { type: "submit", className: "px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-blue-950/50 cursor-pointer", children: "Salva" })] })] })] })] })] }));
};
