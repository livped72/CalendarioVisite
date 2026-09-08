import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, User, Calendar, FileText, Trash2 } from 'lucide-react';
import { Congregazione } from '../types';

interface CongregazioneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (congregazione: Congregazione) => void;
  onDelete?: (id: string) => void;
  editingCongregazione: Congregazione | null;
}

export const CongregazioneModal: React.FC<CongregazioneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCongregazione,
}) => {
  const [nome, setNome] = useState('');
  const [citta, setCitta] = useState('');
  const [contatto, setContatto] = useState('');
  const [note, setNote] = useState('');
  const [ultimaVisitaDate, setUltimaVisitaDate] = useState('');
  const [settimaneTrascorse, setSettimaneTrascorse] = useState(0);
  const [totaleVisite, setTotaleVisite] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    if (editingCongregazione) {
      setNome(editingCongregazione.nome || '');
      setCitta(editingCongregazione.citta || '');
      setContatto(editingCongregazione.contatto || '');
      setNote(editingCongregazione.note || '');
      setUltimaVisitaDate(editingCongregazione.ultimaVisitaDate || new Date().toISOString().slice(0, 10));
      setSettimaneTrascorse(editingCongregazione.settimaneTrascorse || 0);
      setTotaleVisite(editingCongregazione.totaleVisite || 0);
    } else {
      setNome('');
      setCitta('');
      setContatto('');
      setNote('');
      setUltimaVisitaDate(new Date().toISOString().slice(0, 10));
      setSettimaneTrascorse(0);
      setTotaleVisite(0);
    }
  }, [isOpen, editingCongregazione]);

  if (!isOpen) return null;

  const formatDateText = (isoDate: string): string => {
    if (!isoDate) return 'Da definire';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const updated: Congregazione = {
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
    if (!editingCongregazione || !onDelete) return;
    if (confirm(`Sei sicuro di voler eliminare definitivamente la "${editingCongregazione.nome}"?`)) {
      onDelete(editingCongregazione.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#7C8B82]" />
            <h3 className="text-sm font-bold text-[#2F3332] uppercase tracking-wider">
              {editingCongregazione ? 'Modifica Congregazione' : 'Nuova Congregazione'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
              Nome Congregazione *
            </label>
            <input
              type="text"
              required
              placeholder="es. Congregazione Milano Est"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white font-medium"
            />
          </div>

          {/* Città / Zona e Referente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7C8B82]" /> Città / Zona
              </label>
              <input
                type="text"
                placeholder="es. Milano Centro"
                value={citta}
                onChange={(e) => setCitta(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#7C8B82]" /> Referente / Contatto
              </label>
              <input
                type="text"
                placeholder="es. Fr. Andrea Rossi"
                value={contatto}
                onChange={(e) => setContatto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white"
              />
            </div>
          </div>

          {/* Ultima Visita e Settimane Trascorse */}
          <div className="p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] space-y-3">
            <div className="text-xs font-bold text-[#2F3332] uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7C8B82]" /> Dati Visita & Statistiche
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Data Ultima Visita
                </label>
                <input
                  type="date"
                  value={ultimaVisitaDate}
                  onChange={(e) => setUltimaVisitaDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Settimane trascorse
                </label>
                <input
                  type="number"
                  min="0"
                  value={settimaneTrascorse}
                  onChange={(e) => setSettimaneTrascorse(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#555] mb-1">
                  Totale visite
                </label>
                <input
                  type="number"
                  min="0"
                  value={totaleVisite}
                  onChange={(e) => setTotaleVisite(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#7C8B82]" /> Note / Sala del Regno
            </label>
            <textarea
              rows={3}
              placeholder="Indirizzo Sala del Regno, orari adunanze o dettagli utili..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E0DED9]">
            {editingCongregazione && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#666] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                Salva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
