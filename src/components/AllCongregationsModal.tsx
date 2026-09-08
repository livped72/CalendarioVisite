import React, { useState } from 'react';
import { X, Search, Plus, MapPin, Calendar } from 'lucide-react';
import { Congregazione } from '../types';
import { abbreviateMonths } from '../lib/dateUtils';

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]">
          <div>
            <h3 className="text-sm font-bold text-[#2F3332] uppercase tracking-wider">
              Tutte le Congregazioni
            </h3>
            <p className="text-xs text-[#7C8B82] mt-0.5">
              Totale {congregazioni.length} congregazioni monitorate nella circoscrizione
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0DED9] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#888] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cerca congregazione o città..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs focus:outline-none focus:border-[#7C8B82]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs text-[#2F3332] bg-white focus:outline-none focus:border-[#7C8B82]"
            >
              <option value="settimane">Ordina per: Più tempo trascorso</option>
              <option value="nome">Ordina per: Nome (A-Z)</option>
              <option value="visite">Ordina per: Totale visite</option>
            </select>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#7C8B82] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#68766E] transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi</span>
            </button>
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAddCongregazione} className="p-4 bg-[#FAF9F7] border-b border-[#E0DED9] space-y-3">
            <div className="text-xs font-bold text-[#2F3332] uppercase">Nuova Congregazione</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nome (es. Congregazione 19)"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                required
                className="px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:border-[#7C8B82]"
              />
              <input
                type="text"
                placeholder="Città / Zona"
                value={newCitta}
                onChange={(e) => setNewCitta(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:border-[#7C8B82]"
              />
              <input
                type="text"
                placeholder="Contatto referente"
                value={newContatto}
                onChange={(e) => setNewContatto(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:border-[#7C8B82]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-[#666] hover:text-[#2F3332]"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold text-white bg-[#7C8B82] rounded-lg hover:bg-[#68766E]"
              >
                Salva
              </button>
            </div>
          </form>
        )}

        {/* List of Congregations */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#EFECE6] p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#888]">
              Nessuna congregazione trovata.
            </div>
          ) : (
            filtered.map((c, i) => (
              <div
                key={c.id}
                className="p-3 hover:bg-[#FAF9F7] rounded-xl flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF9F7] border border-[#E0DED9] text-[#2F3332] flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2F3332] truncate">{c.nome}</div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#666] mt-0.5">
                      {c.citta && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#7C8B82]" />
                          {c.citta}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#7C8B82]" />
                        Ultima visita: {abbreviateMonths(c.ultimaVisita)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-rose-700">
                    {c.settimaneTrascorse} sett. fa
                  </div>
                  <div className="text-[11px] text-[#888] mt-0.5">
                    {c.totaleVisite} visite
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E0DED9] bg-[#FAF9F7] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] rounded-xl transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
