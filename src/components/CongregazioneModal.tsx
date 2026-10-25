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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {editingCongregazione ? 'Modifica Congregazione' : 'Nuova Congregazione'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome Congregazione *
            </label>
            <input
              type="text"
              required
              placeholder="es. Congregazione Milano Est"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Città / Zona e Referente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Città / Zona
              </label>
              <input
                type="text"
                placeholder="es. Milano Centro"
                value={citta}
                onChange={(e) => setCitta(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" /> Referente / Contatto
              </label>
              <input
                type="text"
                placeholder="es. Fr. Andrea Rossi"
                value={contatto}
                onChange={(e) => setContatto(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Ultima Visita e Settimane Trascorse */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Dati Visita & Statistiche
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data Ultima Visita
                </label>
                <input
                  type="date"
                  value={ultimaVisitaDate}
                  onChange={(e) => setUltimaVisitaDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Settimane trascorse
                </label>
                <input
                  type="number"
                  min="0"
                  value={settimaneTrascorse}
                  onChange={(e) => setSettimaneTrascorse(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Totale visite
                </label>
                <input
                  type="number"
                  min="0"
                  value={totaleVisite}
                  onChange={(e) => setTotaleVisite(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Note / Sala del Regno
            </label>
            <textarea
              rows={3}
              placeholder="Indirizzo Sala del Regno, orari adunanze o dettagli utili..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 resize-none font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {editingCongregazione && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
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
