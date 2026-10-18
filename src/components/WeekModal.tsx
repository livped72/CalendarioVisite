import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  CalendarDays,
  Calendar,
  BookMarked,
  Plane,
  BookOpen,
  Users,
  Star,
  FileDown,
  Mail,
} from 'lucide-react';
import { Settimana, TipoEvento, Congregazione, Semestre, AnnoSemestre, PeriodoKey } from '../types';
import { abbreviateMonths } from '../lib/dateUtils';
import { predictVisitNumber } from '../lib/visitNumbering';
import { getAllStoredSettimane } from '../lib/storage';
import { downloadS302Pdf, emailS302Pdf } from '../lib/pdfGenerator';

interface WeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settimana: Settimana) => void;
  onDelete?: (id: string) => void;
  editingWeek: Settimana | null;
  congregazioni: Congregazione[];
  periodo: AnnoSemestre;
  settimane?: Settimana[];
  allSettimaneMap?: Record<PeriodoKey, Settimana[]>;
}

interface AltroEventoOption {
  tipo: TipoEvento;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  border: string;
  text: string;
  selectedStyle: string;
}

const ALTRO_EVENTO_OPTIONS: AltroEventoOption[] = [
  {
    tipo: 'settimana_libera',
    label: 'SETTIMANA LIBERA',
    icon: Calendar,
    bg: 'bg-emerald-950/60 hover:bg-emerald-900/60',
    border: 'border-emerald-800',
    text: 'text-emerald-300',
    selectedStyle: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-900/80 font-extrabold shadow-sm',
  },
  {
    tipo: 'settimana_pioniere',
    label: 'SETTIMANA PIONIERE',
    icon: BookMarked,
    bg: 'bg-indigo-950/60 hover:bg-indigo-900/60',
    border: 'border-indigo-800',
    text: 'text-indigo-300',
    selectedStyle: 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-900/80 font-extrabold shadow-sm',
  },
  {
    tipo: 'assenza',
    label: 'ASSENZA',
    icon: Plane,
    bg: 'bg-sky-950/60 hover:bg-sky-900/60',
    border: 'border-sky-800',
    text: 'text-sky-300',
    selectedStyle: 'ring-2 ring-sky-500 border-sky-400 bg-sky-900/80 font-extrabold shadow-sm',
  },
  {
    tipo: 'scuola_pionieri',
    label: 'SCUOLA PIONIERI',
    icon: BookOpen,
    bg: 'bg-purple-950/60 hover:bg-purple-900/60',
    border: 'border-purple-800',
    text: 'text-purple-300',
    selectedStyle: 'ring-2 ring-purple-500 border-purple-400 bg-purple-900/80 font-extrabold shadow-sm',
  },
  {
    tipo: 'assemblea_circoscrizione',
    label: 'ASSEMBLEA CIRCOSCRIZIONE',
    icon: Users,
    bg: 'bg-amber-950/60 hover:bg-amber-900/60',
    border: 'border-amber-800',
    text: 'text-amber-300',
    selectedStyle: 'ring-2 ring-amber-500 border-amber-400 bg-amber-900/80 font-extrabold shadow-sm',
  },
  {
    tipo: 'congresso',
    label: 'CONGRESSO',
    icon: Users,
    bg: 'bg-rose-950/60 hover:bg-rose-900/60',
    border: 'border-rose-800',
    text: 'text-rose-300',
    selectedStyle: 'ring-2 ring-rose-500 border-rose-400 bg-rose-900/80 font-extrabold shadow-sm',
  },
  {
    tipo: 'evento_personalizzato',
    label: 'EVENTO PERSONALIZZATO',
    icon: Star,
    bg: 'bg-slate-800/80 hover:bg-slate-700/80',
    border: 'border-slate-700',
    text: 'text-slate-200',
    selectedStyle: 'ring-2 ring-slate-400 border-slate-300 bg-slate-800 font-extrabold shadow-sm',
  },
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
  allSettimaneMap,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [isCongregazione, setIsCongregazione] = useState(true);
  const [selectedCongregazione, setSelectedCongregazione] = useState('');
  const [altroEvento, setAltroEvento] = useState<TipoEvento>('settimana_libera');
  const [extraDettaglio, setExtraDettaglio] = useState('');
  const [note, setNote] = useState('');
  const [forceResetNumerazione, setForceResetNumerazione] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingWeek) {
      setSelectedStartDate(editingWeek.startDate || new Date().toISOString().slice(0, 10));
      setForceResetNumerazione(!!editingWeek.resetNumerazione);
      if (editingWeek.evento === 'congregazione') {
        setIsCongregazione(true);
        setSelectedCongregazione(editingWeek.dettagli || 'Da definire');
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
      setSelectedCongregazione('Da definire');
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

  const effectiveAllSettimane = allSettimaneMap || getAllStoredSettimane();
  const visitPrediction = isCongregazione
    ? predictVisitNumber({
        anno: periodo.anno,
        semestre: periodo.semestre,
        targetStartDate: selectedStartDate,
        targetCongregazioneNome: selectedCongregazione || 'Da definire',
        editingWeekId: editingWeek?.id,
        forceReset: forceResetNumerazione,
        allSettimaneMap: effectiveAllSettimane,
      })
    : null;

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

    const calculatedNumero = isCongregazione && visitPrediction ? visitPrediction.numero : 0;
    const newWeek: Settimana = {
      id: editingWeek ? editingWeek.id : `week_${Date.now()}`,
      numero: calculatedNumero,
      resetNumerazione: isCongregazione ? (forceResetNumerazione || !!visitPrediction?.isReset) : false,
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#0F1A30] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#1E3A5F] animate-in fade-in zoom-in-95 duration-150 text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3A5F] bg-[#142342]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {editingWeek ? 'Modifica Settimana' : 'Aggiungi Settimana'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2C52] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Periodo */}
          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase mb-1">
              Data Inizio Settimana (Martedì)
            </label>
            <input
              type="date"
              value={selectedStartDate}
              onChange={(e) => setSelectedStartDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#1E3A5F] bg-[#0B1426] text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {selectedStartDate && (
              <p className="text-xs text-slate-400 mt-1.5 ml-1">
                Periodo calcolato: <strong className="text-blue-300">{computePeriodoPreview(selectedStartDate)}</strong>
              </p>
            )}
          </div>

          {/* Tipo attività: 2 big buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-blue-200 uppercase">Tipo di Attività</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsCongregazione(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                  isCongregazione
                    ? 'border-blue-500 bg-blue-950/80 text-blue-200 ring-2 ring-blue-500 shadow-sm'
                    : 'border-[#1E3A5F] bg-[#0B1426] text-slate-400 hover:bg-[#142342] hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>VISITA CONGREGAZIONE</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCongregazione(false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                  !isCongregazione
                    ? 'border-blue-500 bg-blue-950/80 text-blue-200 ring-2 ring-blue-500 shadow-sm'
                    : 'border-[#1E3A5F] bg-[#0B1426] text-slate-400 hover:bg-[#142342] hover:text-white'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-blue-400" />
                <span>ALTRO EVENTO</span>
              </button>
            </div>
          </div>

          {/* Congregation selector */}
          {isCongregazione ? (
            <div className="space-y-2 p-3.5 bg-[#142342] rounded-xl border border-[#1E3A5F]">
              <label className="block text-xs font-bold text-blue-200 uppercase">Nome Congregazione</label>
              <select
                value={selectedCongregazione}
                onChange={(e) => setSelectedCongregazione(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#1E3A5F] text-sm focus:outline-none focus:border-blue-500 bg-[#0B1426] text-white font-semibold"
              >
                <option value="Da definire">DA DEFINIRE</option>
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
                className="w-full px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />

              {/* Box Numerazione Visita Calcolata */}
              {visitPrediction && (
                <div className="p-3 bg-[#0B1426] rounded-xl border border-[#1E3A5F] space-y-2 mt-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Numero Visita Calcolato
                    </span>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-extrabold shadow-2xs">
                      #{visitPrediction.numero}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {visitPrediction.motivazione}
                  </p>
                  <label className="flex items-center gap-2 pt-1.5 border-t border-[#1E3A5F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceResetNumerazione}
                      onChange={(e) => setForceResetNumerazione(e.target.checked)}
                      className="rounded border-[#1E3A5F] text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Riavvia la numerazione da 1 per questa visita
                    </span>
                  </label>
                </div>
              )}
            </div>
          ) : (
            /* Alternative events panel */
            <div className="space-y-3 p-3.5 bg-[#142342] rounded-xl border border-[#1E3A5F]">
              <label className="block text-xs font-bold text-blue-200 uppercase">Evento Sostitutivo</label>
              <div className="grid grid-cols-2 gap-2">
                {ALTRO_EVENTO_OPTIONS.map((opt, idx) => {
                  const isSelected = altroEvento === opt.tipo;
                  const Icon = opt.icon;
                  const isLast = idx === ALTRO_EVENTO_OPTIONS.length - 1;

                  return (
                    <label
                      key={opt.tipo}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isLast ? 'col-span-2' : 'col-span-1'
                      } ${opt.bg} ${opt.border} ${opt.text} ${
                        isSelected
                          ? opt.selectedStyle
                          : 'opacity-70 hover:opacity-100 hover:shadow-2xs'
                      }`}
                    >
                      <input
                        type="radio"
                        name="altroEvento"
                        value={opt.tipo}
                        checked={isSelected}
                        onChange={() => setAltroEvento(opt.tipo)}
                        className="sr-only"
                      />
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="font-bold tracking-tight text-center leading-tight truncate">
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {hasExtraDetail && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
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
                    className="w-full px-3 py-1.5 rounded-xl border border-[#1E3A5F] text-xs bg-[#0B1426] text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase mb-1">Note</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="es. Portare il materiale..."
              className="w-full px-3 py-2 rounded-xl border border-[#1E3A5F] text-sm focus:outline-none focus:border-blue-500 bg-[#0B1426] text-white resize-none placeholder-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1E3A5F] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {editingWeek && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Eliminare questa settimana?')) {
                      onDelete(editingWeek.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl cursor-pointer"
                >
                  Elimina
                </button>
              )}
              {editingWeek && isCongregazione && (
                <>
                  <button
                    type="button"
                    onClick={() => downloadS302Pdf({
                      ...editingWeek,
                      dettagli: selectedCongregazione || editingWeek.dettagli,
                      startDate: selectedStartDate || editingWeek.startDate,
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-200 bg-[#142342] hover:bg-[#1A2C52] hover:text-white border border-[#1E3A5F] rounded-xl cursor-pointer"
                    title="Scarica il modulo S-302 compilato per questa visita"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-400" />
                    <span>Scarica S-302</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => emailS302Pdf({
                      ...editingWeek,
                      dettagli: selectedCongregazione || editingWeek.dettagli,
                      startDate: selectedStartDate || editingWeek.startDate,
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer shadow-md shadow-blue-950/50"
                    title="Scarica il PDF e prepara l'email S-302"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Invia Email</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-[#142342] rounded-xl cursor-pointer">
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-950/50 cursor-pointer"
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
