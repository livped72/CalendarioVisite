import React, { useState, useEffect } from 'react';
import { X, Building2, CalendarDays } from 'lucide-react';
import { Settimana, TipoEvento, Congregazione, Semestre, AnnoSemestre } from '../types';
import { EventBadge } from './EventBadge';
import { abbreviateMonths } from '../lib/dateUtils';

interface WeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settimana: Settimana) => void;
  onDelete?: (id: string) => void;
  editingWeek: Settimana | null;
  congregazioni: Congregazione[];
  periodo: AnnoSemestre;
  settimane?: Settimana[];
}

const ALTRO_EVENTO_OPTIONS: { tipo: TipoEvento; label: string }[] = [
  { tipo: 'settimana_libera', label: 'Settimana libera' },
  { tipo: 'settimana_pioniere', label: 'Settimana pioniere' },
  { tipo: 'assenza', label: 'Assenza' },
  { tipo: 'scuola_pionieri', label: 'Scuola pionieri' },
  { tipo: 'assemblea_circoscrizione', label: 'Assemblea di circoscrizione' },
  { tipo: 'congresso', label: 'Congresso' },
  { tipo: 'evento_personalizzato', label: 'Evento personalizzato' },
];

export const WeekModal: React.FC<WeekModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingWeek,
  congregazioni,
  periodo,
  settimane = [],
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [isCongregazione, setIsCongregazione] = useState(true);
  const [selectedCongregazione, setSelectedCongregazione] = useState('');
  const [altroEvento, setAltroEvento] = useState<TipoEvento>('settimana_libera');
  const [extraDettaglio, setExtraDettaglio] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingWeek) {
      setSelectedStartDate(editingWeek.startDate || new Date().toISOString().slice(0, 10));
      if (editingWeek.evento === 'congregazione') {
        setIsCongregazione(true);
        setSelectedCongregazione(editingWeek.dettagli || congregazioni[0]?.nome || '');
        setAltroEvento('settimana_libera');
        setExtraDettaglio('');
      } else {
        setIsCongregazione(false);
        setAltroEvento(editingWeek.evento);
        setExtraDettaglio(editingWeek.dettagli !== '-' ? editingWeek.dettagli : '');
      }
      setNote(editingWeek.note !== '-' ? editingWeek.note : '');
    } else {
      // Calculate next week based on existing weeks
      let nextDate = new Date();
      // Ensure default is a Tuesday (2 = Tuesday)
      const day = nextDate.getDay();
      const diff = nextDate.getDate() - day + (day === 0 ? -5 : 2 - day);
      nextDate.setDate(diff);

      if (settimane.length > 0) {
        // Sort to find the latest week by startDate
        const sorted = [...settimane].sort((a, b) => {
          if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
          return 0;
        });
        const lastWeek = sorted[sorted.length - 1];
        if (lastWeek && lastWeek.startDate) {
          nextDate = new Date(lastWeek.startDate);
          nextDate.setDate(nextDate.getDate() + 7); // Next week Tuesday
        }
      }

      setSelectedStartDate(nextDate.toISOString().slice(0, 10));
      setIsCongregazione(true);
      setSelectedCongregazione(congregazioni[0]?.nome || '');
      setAltroEvento('settimana_libera');
      setExtraDettaglio('');
      setNote('');
    }
  }, [isOpen, editingWeek, congregazioni, settimane]);

  const computePeriodoPreview = (isoDate: string) => {
    if (!isoDate) return '';
    const start = new Date(isoDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 5);

    const startMonth = start.toLocaleDateString('it-IT', { month: 'short' });
    const endMonth = end.toLocaleDateString('it-IT', { month: 'short' });
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${start.getDate()} – ${end.getDate()} ${startMonth} ${year}`;
    } else {
      return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${year}`;
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedStr = computePeriodoPreview(selectedStartDate);
    const formattedPeriodo = abbreviateMonths(computedStr || 'Data da definire');
    
    const start = new Date(selectedStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 5);
    
    const evento: TipoEvento = isCongregazione ? 'congregazione' : altroEvento;
    const dettagli = isCongregazione
      ? selectedCongregazione.trim() || 'Congregazione'
      : extraDettaglio.trim() || '-';

    // Numero is only meaningful for congregazione; use 0 as placeholder for others
    const newWeek: Settimana = {
      id: editingWeek ? editingWeek.id : `week_${Date.now()}`,
      numero: editingWeek ? editingWeek.numero : 0,
      periodo: formattedPeriodo,
      startDate: selectedStartDate,
      endDate: end.toISOString().slice(0, 10),
      semestre: periodo.semestre,
      anno: periodo.anno,
      evento,
      dettagli,
      note: note.trim() || '-',
    };

    onSave(newWeek);
    onClose();
  };

  const hasExtraDetail = ['assemblea_circoscrizione', 'congresso', 'evento_personalizzato'].includes(altroEvento);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]">
          <h3 className="text-sm font-bold text-[#2F3332] uppercase tracking-wider">
            {editingWeek ? 'Modifica Settimana' : 'Aggiungi Settimana'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#888] hover:text-[#333] hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Periodo */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
              Data Inizio Settimana (Martedì)
            </label>
            <input
              type="date"
              value={selectedStartDate}
              onChange={(e) => setSelectedStartDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] transition-colors"
            />
            {selectedStartDate && (
              <p className="text-xs text-[#666] mt-1.5 ml-1">
                Periodo calcolato: <strong className="text-[#2F3332]">{computePeriodoPreview(selectedStartDate)}</strong>
              </p>
            )}
          </div>

          {/* Tipo attività: 2 big buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2F3332] uppercase">Tipo di Attività</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCongregazione(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isCongregazione
                    ? 'border-[#7C8B82] bg-[#7C8B82]/15 text-[#3C4A42] ring-1 ring-[#7C8B82]'
                    : 'border-[#E0DED9] bg-white text-[#666] hover:bg-[#FAF9F7]'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#5B6760]" />
                <span>Visita Congregazione</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCongregazione(false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  !isCongregazione
                    ? 'border-[#7C8B82] bg-[#FAF9F7] text-[#2F3332] ring-1 ring-[#7C8B82]'
                    : 'border-[#E0DED9] bg-white text-[#666] hover:bg-[#FAF9F7]'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-[#7C8B82]" />
                <span>Altro Evento</span>
              </button>
            </div>
          </div>

          {/* Congregation selector */}
          {isCongregazione ? (
            <div className="space-y-2 p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E0DED9]">
              <label className="block text-xs font-bold text-[#2F3332] uppercase">Nome Congregazione</label>
              <select
                value={selectedCongregazione}
                onChange={(e) => setSelectedCongregazione(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] bg-white font-semibold"
              >
                {congregazioni.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome} (Ultima: {c.ultimaVisita})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Oppure inserisci un altro nome..."
                value={selectedCongregazione}
                onChange={(e) => setSelectedCongregazione(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
              />
            </div>
          ) : (
            /* Alternative events panel */
            <div className="space-y-3 p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E0DED9]">
              <label className="block text-xs font-bold text-[#2F3332] uppercase">Evento Sostitutivo</label>
              <div className="grid grid-cols-2 gap-2">
                {ALTRO_EVENTO_OPTIONS.map((opt) => (
                  <label
                    key={opt.tipo}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      altroEvento === opt.tipo
                        ? 'border-[#7C8B82] bg-white ring-1 ring-[#7C8B82] font-bold'
                        : 'border-[#E0DED9] bg-white hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="altroEvento"
                      value={opt.tipo}
                      checked={altroEvento === opt.tipo}
                      onChange={() => setAltroEvento(opt.tipo)}
                      className="sr-only"
                    />
                    <EventBadge tipo={opt.tipo} size="sm" />
                  </label>
                ))}
              </div>

              {hasExtraDetail && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#555] mb-1">
                    Dettaglio opzionale
                  </label>
                  <input
                    type="text"
                    value={extraDettaglio}
                    onChange={(e) => setExtraDettaglio(e.target.value)}
                    placeholder={
                      altroEvento === 'assemblea_circoscrizione' ? 'es. Milano'
                      : altroEvento === 'congresso' ? 'es. Congresso 2026 – Roma'
                      : 'es. Visita Betel'
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs bg-white focus:outline-none focus:border-[#7C8B82]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">Note</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="es. Portare il materiale..."
              className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:outline-none focus:border-[#7C8B82] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E0DED9]">
            {editingWeek && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Eliminare questa settimana?')) {
                    onDelete(editingWeek.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                Elimina
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#666] hover:bg-stone-100 rounded-xl cursor-pointer">
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] rounded-xl shadow-xs cursor-pointer"
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
