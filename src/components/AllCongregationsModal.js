import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Search, Plus, MapPin, Calendar } from 'lucide-react';
import { abbreviateMonths } from '../lib/dateUtils';
export const AllCongregationsModal = ({ isOpen, onClose, congregazioni, onSaveCongregazioni, }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('settimane');
    const [isAdding, setIsAdding] = useState(false);
    const [newNome, setNewNome] = useState('');
    const [newCitta, setNewCitta] = useState('');
    const [newContatto, setNewContatto] = useState('');
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
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity", onClick: onClose }), _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-[#2F3332] uppercase tracking-wider", children: "Tutte le Congregazioni" }), _jsxs("p", { className: "text-xs text-[#7C8B82] mt-0.5", children: ["Totale ", congregazioni.length, " congregazioni monitorate nella circoscrizione"] })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-stone-100 transition-colors cursor-pointer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-4 border-b border-[#E0DED9] flex flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "w-4 h-4 text-[#888] absolute left-3 top-2.5" }), _jsx("input", { type: "text", placeholder: "Cerca congregazione o citt\u00E0...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs focus:outline-none focus:border-[#7C8B82]" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs text-[#2F3332] bg-white focus:outline-none focus:border-[#7C8B82]", children: [_jsx("option", { value: "settimane", children: "Ordina per: Pi\u00F9 tempo trascorso" }), _jsx("option", { value: "nome", children: "Ordina per: Nome (A-Z)" }), _jsx("option", { value: "visite", children: "Ordina per: Totale visite" })] }), _jsxs("button", { onClick: () => setIsAdding(!isAdding), className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#7C8B82] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#68766E] transition-colors shadow-2xs cursor-pointer", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Aggiungi" })] })] })] }), isAdding && (_jsxs("form", { onSubmit: handleAddCongregazione, className: "p-4 bg-[#FAF9F7] border-b border-[#E0DED9] space-y-3", children: [_jsx("div", { className: "text-xs font-bold text-[#2F3332] uppercase", children: "Nuova Congregazione" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [_jsx("input", { type: "text", placeholder: "Nome (es. Congregazione 19)", value: newNome, onChange: (e) => setNewNome(e.target.value), required: true, className: "px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:border-[#7C8B82]" }), _jsx("input", { type: "text", placeholder: "Citt\u00E0 / Zona", value: newCitta, onChange: (e) => setNewCitta(e.target.value), className: "px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:border-[#7C8B82]" }), _jsx("input", { type: "text", placeholder: "Contatto referente", value: newContatto, onChange: (e) => setNewContatto(e.target.value), className: "px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:border-[#7C8B82]" })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setIsAdding(false), className: "px-3 py-1 text-xs text-[#666] hover:text-[#2F3332]", children: "Annulla" }), _jsx("button", { type: "submit", className: "px-3 py-1 text-xs font-bold text-white bg-[#7C8B82] rounded-lg hover:bg-[#68766E]", children: "Salva" })] })] })), _jsx("div", { className: "max-h-[60vh] overflow-y-auto divide-y divide-[#EFECE6] p-2", children: filtered.length === 0 ? (_jsx("div", { className: "p-8 text-center text-xs text-[#888]", children: "Nessuna congregazione trovata." })) : (filtered.map((c, i) => (_jsxs("div", { className: "p-3 hover:bg-[#FAF9F7] rounded-xl flex items-center justify-between gap-4 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-[#FAF9F7] border border-[#E0DED9] text-[#2F3332] flex items-center justify-center font-bold text-xs shrink-0", children: i + 1 }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-xs font-bold text-[#2F3332] truncate", children: c.nome }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-[11px] text-[#666] mt-0.5", children: [c.citta && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3 h-3 text-[#7C8B82]" }), c.citta] })), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3 text-[#7C8B82]" }), "Ultima visita: ", abbreviateMonths(c.ultimaVisita)] })] })] })] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsxs("div", { className: "text-xs font-bold text-rose-700", children: [c.settimaneTrascorse, " sett. fa"] }), _jsxs("div", { className: "text-[11px] text-[#888] mt-0.5", children: [c.totaleVisite, " visite"] })] })] }, c.id)))) }), _jsx("div", { className: "p-4 border-t border-[#E0DED9] bg-[#FAF9F7] flex justify-end", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] rounded-xl transition-colors cursor-pointer", children: "Chiudi" }) })] })] }));
};
