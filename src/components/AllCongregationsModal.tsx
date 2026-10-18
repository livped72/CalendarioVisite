import React, { useState } from 'react';
import { X, Search, Plus, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Congregazione } from '../types';
import { abbreviateMonths } from '../lib/dateUtils';
import { CongregazioneModal } from './CongregazioneModal';

interface AllCongregationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  congregazioni: Congregazione[];
  onSaveCongregazioni: (data: Congregazione[]) => void;
}

export const AllCongregationsModal: React.FC<AllCongregationsModalProps> = ({
  isOpen,
  onClose,
  congregazioni,
  onSaveCongregazioni,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'settimane' | 'nome' | 'visite'>('settimane');
  const [isAdding, setIsAdding] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newCitta, setNewCitta] = useState('');
  const [newContatto, setNewContatto] = useState('');
  const [editingCong, setEditingCong] = useState<Congregazione | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen) return null;


  const filtered = congregazioni
    .filter(
      (c) =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.citta && c.citta.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'settimane') return b.settimaneTrascorse - a.settimaneTrascorse;
      if (sortBy === 'nome') return a.nome.localeCompare(b.nome);
      return b.totaleVisite - a.totaleVisite;
    });

  const handleAddCongregazione = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) return;

    const newCong: Congregazione = {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-[#0F1A30] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#1E3A5F] animate-in fade-in zoom-in-95 duration-150 text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3A5F] bg-[#0B1426]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tutte le Congregazioni
            </h3>
            <p className="text-xs text-blue-300 mt-0.5">
              Totale {congregazioni.length} congregazioni monitorate nella circoscrizione
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#142342] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#172646] bg-[#0F1A30] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cerca congregazione o città..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs text-slate-200 bg-[#0B1426] focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="settimane" className="bg-[#0B1426] text-white">Ordina per: Più tempo trascorso</option>
              <option value="nome" className="bg-[#0B1426] text-white">Ordina per: Nome (A-Z)</option>
              <option value="visite" className="bg-[#0B1426] text-white">Ordina per: Totale visite</option>
            </select>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi</span>
            </button>
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAddCongregazione} className="p-4 bg-[#142342] border-b border-[#1E3A5F] space-y-3">
            <div className="text-xs font-bold text-blue-300 uppercase">Nuova Congregazione</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nome (es. Congregazione 19)"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                required
                className="px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Città / Zona"
                value={newCitta}
                onChange={(e) => setNewCitta(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Contatto referente"
                value={newContatto}
                onChange={(e) => setNewContatto(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm"
              >
                Salva
              </button>
            </div>
          </form>
        )}

        {/* List of Congregations */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#172646] p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nessuna congregazione trovata.
            </div>
          ) : (
            filtered.map((c, i) => (
              <div
                key={c.id}
                className="p-3 hover:bg-[#142342]/50 rounded-xl flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0B1426] border border-[#1E3A5F] text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{c.nome}</div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      {c.citta && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          {c.citta}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        Ultima visita: {abbreviateMonths(c.ultimaVisita)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-400">
                      {c.settimaneTrascorse} sett. fa
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {c.totaleVisite} visite
                    </div>
                  </div>

                  <div className="flex items-center gap-1 border-l border-[#1E3A5F] pl-2">
                    <button
                      onClick={() => {
                        setEditingCong(c);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#142342] border border-[#1E3A5F] transition-colors cursor-pointer"
                      title="Modifica congregazione"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare definitivamente la "${c.nome}"?`)) {
                          onSaveCongregazioni(congregazioni.filter((item) => item.id !== c.id));
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-[#1E3A5F] transition-colors cursor-pointer"
                      title="Elimina congregazione"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#172646] bg-[#0B1426] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-950/50 cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>

      <CongregazioneModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCong(null);
        }}
        onSave={(saved) => {
          const idx = congregazioni.findIndex((c) => c.id === saved.id);
          if (idx >= 0) {
            const updated = [...congregazioni];
            updated[idx] = saved;
            onSaveCongregazioni(updated);
          } else {
            onSaveCongregazioni([...congregazioni, saved]);
          }
        }}
        onDelete={(id) => {
          onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
        }}
        editingCongregazione={editingCong}
      />
    </div>
  );
};
