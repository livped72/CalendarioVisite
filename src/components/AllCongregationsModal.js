import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Search, Plus, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { abbreviateMonths } from '../lib/dateUtils';
import { CongregazioneModal } from './CongregazioneModal';
export const AllCongregationsModal = ({ isOpen, onClose, congregazioni, onSaveCongregazioni, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('settimane');
    const [isAdding, setIsAdding] = useState(false);
    const [newNome, setNewNome] = useState('');
    const [newCitta, setNewCitta] = useState('');
    const [newContatto, setNewContatto] = useState('');
    const [editingCong, setEditingCong] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    if (!isOpen)
        return null;
    const filtered = congregazioni
        .filter((c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.citta && c.citta.toLowerCase().includes(searchTerm.toLowerCase())))
        .sort((a, b) => {
        if (sortBy === 'settimane')
            return b.settimaneTrascorse - a.settimaneTrascorse;
        if (sortBy === 'nome')
            return a.nome.localeCompare(b.nome);
        return b.totaleVisite - a.totaleVisite;
    });
    const handleAddCongregazione = (e) => {
        e.preventDefault();
        if (!newNome.trim())
            return;
        const newCong = {
            id: `c_${Date.now()}`,
            nome: newNome.trim(),
            citta: newCitta.trim() || undefined,
            contatto: newContatto.trim() || undefined,
            ultimaVisita: 'Da definire',
            ultimaVisitaDate: new Date().toISOString().slice(0, 10),
            settimaneTrascorse: 0,
            totaleVisite: 0,
        };
        onSaveCongregazioni([...congregazioni, newCong]);
        setNewNome('');
        setNewCitta('');
        setNewContatto('');
        setIsAdding(false);
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity", onClick: onClose }), _jsxs("div", { className: "relative bg-[#0F1A30] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#1E3A5F] animate-in fade-in zoom-in-95 duration-150 text-[#F8FAFC]", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-[#1E3A5F] bg-[#0B1426]", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Tutte le Congregazioni" }), _jsxs("p", { className: "text-xs text-blue-300 mt-0.5", children: ["Totale ", congregazioni.length, " congregazioni monitorate nella circoscrizione"] })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#142342] transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-4 border-b border-[#172646] bg-[#0F1A30] flex flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "w-4 h-4 text-blue-400 absolute left-3 top-2.5" }), _jsx("input", { type: "text", placeholder: "Cerca congregazione o citt\u00E0...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs text-slate-200 bg-[#0B1426] focus:outline-none focus:border-blue-500 cursor-pointer", children: [_jsx("option", { value: "settimane", className: "bg-[#0B1426] text-white", children: "Ordina per: Pi\u00F9 tempo trascorso" }), _jsx("option", { value: "nome", className: "bg-[#0B1426] text-white", children: "Ordina per: Nome (A-Z)" }), _jsx("option", { value: "visite", className: "bg-[#0B1426] text-white", children: "Ordina per: Totale visite" })] }), _jsxs("button", { onClick: () => setIsAdding(!isAdding), className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/50 cursor-pointer", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Aggiungi" })] })] })] }), isAdding && (_jsxs("form", { onSubmit: handleAddCongregazione, className: "p-4 bg-[#142342] border-b border-[#1E3A5F] space-y-3", children: [_jsx("div", { className: "text-xs font-bold text-blue-300 uppercase", children: "Nuova Congregazione" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [_jsx("input", { type: "text", placeholder: "Nome (es. Congregazione 19)", value: newNome, onChange: (e) => setNewNome(e.target.value), required: true, className: "px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:border-blue-500" }), _jsx("input", { type: "text", placeholder: "Citt\u00E0 / Zona", value: newCitta, onChange: (e) => setNewCitta(e.target.value), className: "px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:border-blue-500" }), _jsx("input", { type: "text", placeholder: "Contatto referente", value: newContatto, onChange: (e) => setNewContatto(e.target.value), className: "px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:border-blue-500" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setIsAdding(false), className: "px-3 py-1 text-xs text-slate-400 hover:text-white", children: "Annulla" }), _jsx("button", { type: "submit", className: "px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm", children: "Salva" })] })] })), _jsx("div", { className: "max-h-[60vh] overflow-y-auto divide-y divide-[#172646] p-2", children: filtered.length === 0 ? (_jsx("div", { className: "p-8 text-center text-xs text-slate-400", children: "Nessuna congregazione trovata." })) : (filtered.map((c, i) => (_jsxs("div", { className: "p-3 hover:bg-[#142342]/50 rounded-xl flex items-center justify-between gap-4 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-[#0B1426] border border-[#1E3A5F] text-blue-300 flex items-center justify-center font-bold text-xs shrink-0", children: i + 1 }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs font-bold text-white truncate", children: c.nome }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5", children: [c.citta && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3 h-3 text-blue-400" }), c.citta] })), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3 text-blue-400" }), "Ultima visita: ", abbreviateMonths(c.ultimaVisita)] })] })] })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [_jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-xs font-bold text-rose-400", children: [c.settimaneTrascorse, " sett. fa"] }), _jsxs("div", { className: "text-[11px] text-slate-400 mt-0.5", children: [c.totaleVisite, " visite"] })] }), _jsxs("div", { className: "flex items-center gap-1 border-l border-[#1E3A5F] pl-2", children: [_jsx("button", { onClick: () => {
                                                        setEditingCong(c);
                                                        setIsEditModalOpen(true);
                                                    }, className: "p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#142342] border border-[#1E3A5F] transition-colors cursor-pointer", title: "Modifica congregazione", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => {
                                                        if (confirm(`Eliminare definitivamente la "${c.nome}"?`)) {
                                                            onSaveCongregazioni(congregazioni.filter((item) => item.id !== c.id));
                                                        }
                                                    }, className: "p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-[#1E3A5F] transition-colors cursor-pointer", title: "Elimina congregazione", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] })] }, c.id)))) }), _jsx("div", { className: "p-4 border-t border-[#172646] bg-[#0B1426] flex justify-end", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-950/50 cursor-pointer", children: "Chiudi" }) })] }), _jsx(CongregazioneModal, { isOpen: isEditModalOpen, onClose: () => {
                    setIsEditModalOpen(false);
                    setEditingCong(null);
                }, onSave: (saved) => {
                    const idx = congregazioni.findIndex((c) => c.id === saved.id);
                    if (idx >= 0) {
                        const updated = [...congregazioni];
                        updated[idx] = saved;
                        onSaveCongregazioni(updated);
                    }
                    else {
                        onSaveCongregazioni([...congregazioni, saved]);
                    }
                }, onDelete: (id) => {
                    onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
                }, editingCongregazione: editingCong })] }));
};
