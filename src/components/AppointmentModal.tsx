import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, FileText, Tag, Trash2, Calendar } from 'lucide-react';
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

const CATEGORIE: { id: CategoriaAppuntamento; label: string; bg: string; text: string; border: string }[] = [
  { id: 'servizio', label: 'Servizio di campo', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  { id: 'adunanza', label: 'Adunanza', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  { id: 'anziani', label: 'Incontro Anziani', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { id: 'pionieri', label: 'Incontro Pionieri', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  { id: 'servitori', label: 'Incontro Servitori', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  { id: 'pastorale', label: 'Visita Pastorale', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  { id: 'discorso', label: 'Discorso Pubblico', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  { id: 'pranzo', label: 'Pranzo / Ospitalità', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  { id: 'personale', label: 'Studio / Personale', bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' },
  { id: 'altro', label: 'Altro evento', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
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
  const [oraFine, setOraFine] = useState('11:30');
  const [luogo, setLuogo] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingAppointment) {
      setTitolo(editingAppointment.titolo || '');
      setCategoria(editingAppointment.categoria || 'servizio');
      setData(editingAppointment.data || defaultDate || new Date().toISOString().slice(0, 10));
      setOraInizio(editingAppointment.oraInizio || '09:30');
      setOraFine(editingAppointment.oraFine || '');
      setLuogo(editingAppointment.luogo || '');
      setNote(editingAppointment.note || '');
    } else {
      setTitolo('');
      setCategoria('servizio');
      setData(defaultDate || new Date().toISOString().slice(0, 10));
      setOraInizio('09:30');
      setOraFine('11:30');
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
      oraFine: oraFine.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7C8B82]" />
            <h3 className="text-sm font-bold text-[#2F3332] uppercase tracking-wider">
              {editingAppointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento / Evento'}
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
          {/* Titolo */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
              Titolo Appuntamento *
            </label>
            <input
              type="text"
              required
              placeholder="es. Servizio di campo, Incontro Anziani, ecc."
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white font-medium"
            />
          </div>

          {/* Categoria Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#7C8B82]" /> Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CATEGORIE.map((cat) => {
                const isSelected = categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoria(cat.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer truncate ${
                      isSelected
                        ? `${cat.bg} ${cat.text} ${cat.border} ring-2 ring-[#7C8B82]`
                        : 'bg-white text-[#666] border-[#E0DED9] hover:bg-stone-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data e Orari */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#7C8B82]" /> Data
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7C8B82]" /> Inizio
              </label>
              <input
                type="time"
                value={oraInizio}
                onChange={(e) => setOraInizio(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7C8B82]" /> Fine (opz.)
              </label>
              <input
                type="time"
                value={oraFine}
                onChange={(e) => setOraFine(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
              />
            </div>
          </div>

          {/* Luogo */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#7C8B82]" /> Luogo / Indirizzo
            </label>
            <input
              type="text"
              placeholder="es. Sala del Regno, Piazza Duomo, Casa famiglia..."
              value={luogo}
              onChange={(e) => setLuogo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#7C8B82]" /> Note / Dettagli
            </label>
            <textarea
              rows={2}
              placeholder="Dettagli specifici o promemoria per l'evento..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E0DED9]">
            {editingAppointment && onDelete ? (
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
