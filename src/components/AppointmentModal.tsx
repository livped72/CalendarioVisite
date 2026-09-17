import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, Trash2, Calendar, Tag, Check } from 'lucide-react';
import { Appuntamento, CategoriaAppuntamento } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: Appuntamento) => void;
  onDelete?: (id: string) => void;
  editingAppointment: Appuntamento | null;
  defaultDate?: string;
  settimanaId?: string;
}

const CATEGORIE_OPTIONS: { id: CategoriaAppuntamento; label: string; color: string }[] = [
  { id: 'servizio', label: 'Servizio', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'adunanza', label: 'Adunanza', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'anziani', label: 'Anziani', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'pionieri', label: 'Pionieri', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'pastorale', label: 'Pastorale', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'discorso', label: 'Discorso', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'pranzo', label: 'Pranzo', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'altro', label: 'Altro', color: 'bg-stone-100 text-stone-700 border-stone-300' },
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingAppointment,
  defaultDate,
  settimanaId,
}) => {
  const [titolo, setTitolo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaAppuntamento>('servizio');
  const [data, setData] = useState('');
  const [oraInizio, setOraInizio] = useState('09:30');
  const [luogo, setLuogo] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingAppointment) {
      setTitolo(editingAppointment.titolo || '');
      setCategoria(editingAppointment.categoria || 'servizio');
      setData(editingAppointment.data || defaultDate || new Date().toISOString().slice(0, 10));
      setOraInizio(editingAppointment.oraInizio || '09:30');
      setLuogo(editingAppointment.luogo || '');
      setNote(editingAppointment.note || '');
    } else {
      setTitolo('');
      setCategoria('servizio');
      setData(defaultDate || new Date().toISOString().slice(0, 10));
      setOraInizio('09:30');
      setLuogo('');
      setNote('');
    }
  }, [isOpen, editingAppointment, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || !data) return;

    const saved: Appuntamento = {
      id: editingAppointment ? editingAppointment.id : `app_${Date.now()}`,
      settimanaId: editingAppointment?.settimanaId || settimanaId,
      titolo: titolo.trim(),
      categoria,
      data,
      oraInizio: oraInizio.trim() || '09:00',
      luogo: luogo.trim() || undefined,
      note: note.trim() || undefined,
    };

    onSave(saved);
    onClose();
  };

  const handleDelete = () => {
    if (!editingAppointment || !onDelete) return;
    if (confirm(`Eliminare l'appuntamento "${editingAppointment.titolo}"?`)) {
      onDelete(editingAppointment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332] z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EBE8E2] bg-[#FAF9F7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] text-[#475E50] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2F3332]">
                {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
              </h3>
              <p className="text-[11px] text-[#7C8B82] font-medium">
                {editingAppointment ? 'Aggiorna i dettagli dell’evento' : 'Inserisci i dettagli dell’impegno'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#888] hover:text-[#2F3332] hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Titolo */}
          <div>
            <label className="block text-[11px] font-bold text-[#444] uppercase tracking-wider mb-1.5">
              Titolo / Descrizione *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="es. Servizio di campo, Incontro Anziani, ecc."
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D2CA] text-sm focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 bg-white font-medium text-[#2F3332] transition-all"
            />
          </div>

          {/* Data e Ora Inizio — 2 colonne perfettamente bilanciate */}
          <div className="grid grid-cols-2 gap-3">
            {/* Data */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#444] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-[#7C8B82]" />
                <span>Data *</span>
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5D2CA] text-xs bg-white font-medium focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 text-[#2F3332] transition-all"
              />
            </div>

            {/* Ora Inizio */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#444] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#7C8B82]" />
                <span>Orario *</span>
              </label>
              <input
                type="time"
                required
                value={oraInizio}
                onChange={(e) => setOraInizio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5D2CA] text-xs bg-white font-medium focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 text-[#2F3332] transition-all"
              />
            </div>
          </div>

          {/* Selezione Categoria */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#444] uppercase tracking-wider mb-2">
              <Tag className="w-3.5 h-3.5 text-[#7C8B82]" />
              <span>Categoria</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIE_OPTIONS.map((cat) => {
                const isSelected = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? `${cat.color} ring-1 ring-current shadow-2xs font-bold`
                        : 'bg-[#F9F8F5] text-[#666] border-[#E0DED9] hover:border-[#CCC]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Luogo */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#444] uppercase tracking-wider mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#7C8B82]" />
              <span>Luogo / Indirizzo</span>
            </label>
            <input
              type="text"
              placeholder="es. Sala del Regno, Piazza Duomo, Casa famiglia..."
              value={luogo}
              onChange={(e) => setLuogo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5D2CA] text-xs focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 bg-white font-medium text-[#2F3332] transition-all"
            />
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#444] uppercase tracking-wider mb-1.5">
              <FileText className="w-3.5 h-3.5 text-[#7C8B82]" />
              <span>Note / Dettagli</span>
            </label>
            <textarea
              rows={2}
              placeholder="Dettagli specifici o promemoria..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5D2CA] text-xs focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 bg-white font-medium text-[#2F3332] resize-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EBE8E2] mt-2 shrink-0">
            {editingAppointment && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold text-[#666] hover:text-[#2F3332] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] active:scale-[0.98] rounded-xl transition-all shadow-xs cursor-pointer"
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
