import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CalendarDays,
  Pencil,
  Table as TableIcon,
  Phone,
  Info,
} from 'lucide-react';
import { Settimana, Congregazione, Appuntamento } from '../types';
import { EventBadge } from './EventBadge';
import { AppointmentModal } from './AppointmentModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { abbreviateMonths } from '../lib/dateUtils';

interface WeeklyCalendarViewProps {
  settimane: Settimana[];
  congregazioni: Congregazione[];
  appuntamenti: Appuntamento[];
  onSaveAppuntamento: (app: Appuntamento) => void;
  onDeleteAppuntamento: (id: string) => void;
  /** ID settimana da selezionare immediatamente alla montatura del componente */
  initialSettimanaId?: string;
  /** Callback chiamata dopo che il jump è stato consumato */
  onJumpConsumed?: () => void;
}

const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  settimane,
  congregazioni,
  appuntamenti,
  onSaveAppuntamento,
  onDeleteAppuntamento,
  initialSettimanaId,
  onJumpConsumed,
}) => {
  // Selected week index
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  // Jump to initialSettimanaId when provided
  useEffect(() => {
    if (!initialSettimanaId || settimane.length === 0) return;
    const idx = settimane.findIndex((w) => w.id === initialSettimanaId);
    if (idx >= 0) {
      setSelectedWeekIndex(idx);
    }
    onJumpConsumed?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSettimanaId]);

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appuntamento | null>(null);
  const [modalDate, setModalDate] = useState<string>('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Congregations map for quick lookup
  const congMap = useMemo(() => {
    const map = new Map<string, Congregazione>();
    congregazioni.forEach((c) => map.set(c.id, c));
    return map;
  }, [congregazioni]);

  // Current selected week
  const activeWeek: Settimana | undefined = settimane[selectedWeekIndex] || settimane[0];
  const congActive = activeWeek?.congregazioneId ? congMap.get(activeWeek.congregazioneId) : undefined;

  // Calculate the 7 days (Monday through Sunday) for the active week
  const weekDays = useMemo(() => {
    if (!activeWeek?.startDate) {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return {
          iso: d.toISOString().slice(0, 10),
          dayName: DAY_NAMES[i],
          dayShort: DAY_SHORT[i],
          dayNumber: d.getDate(),
          monthShort: d.toLocaleDateString('it-IT', { month: 'short' }),
          isToday: d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10),
        };
      });
    }

    const start = new Date(activeWeek.startDate);
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(start);
    monday.setDate(start.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const isToday = iso === new Date().toISOString().slice(0, 10);
      return {
        iso,
        dayName: DAY_NAMES[i],
        dayShort: DAY_SHORT[i],
        dayNumber: d.getDate(),
        monthShort: d.toLocaleDateString('it-IT', { month: 'short' }),
        isToday,
      };
    });
  }, [activeWeek]);

  // Navigation handlers
  const handlePrevWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeekIndex < settimane.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const handleJumpToToday = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const idx = settimane.findIndex(
      (w) => w.startDate && w.endDate && todayIso >= w.startDate && todayIso <= w.endDate
    );
    if (idx >= 0) {
      setSelectedWeekIndex(idx);
    } else {
      setSelectedWeekIndex(0);
    }
  };

  const openNewAppointment = (dateIso?: string) => {
    setEditingApp(null);
    setModalDate(dateIso || weekDays[0]?.iso || new Date().toISOString().slice(0, 10));
    setIsAppModalOpen(true);
  };

  const openEditAppointment = (app: Appuntamento) => {
    setEditingApp(app);
    setModalDate(app.data);
    setIsAppModalOpen(true);
  };

  if (settimane.length === 0) {
    return (
      <div className="bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-2xs p-12 text-center">
        <Calendar className="w-10 h-10 text-blue-400 mx-auto mb-3 opacity-80" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nessuna settimana pianificata</h3>
        <p className="text-xs text-slate-400 mt-1">
          Aggiungi le settimane dal Calendario Principale per visualizzare e gestire gli appuntamenti.
        </p>
      </div>
    );
  }

  const weekAppsCount = appuntamenti.filter((a) => weekDays.some((d) => d.iso === a.data)).length;

  return (
    <div className="space-y-4">
      {/* ── TOP CONTROL BAR EVOLUTA ── */}
      <div className="bg-[#0F1A30] p-4 sm:p-5 rounded-3xl border border-[#1E3A5F] shadow-xs space-y-3.5">
        {/* Riga 1: Selettore Settimana Evidenziato & Pulsanti Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Pulsanti Step: < Oggi > */}
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#0B1426] rounded-2xl border border-[#1E3A5F] p-1 shrink-0 shadow-2xs">
            <button
              onClick={handlePrevWeek}
              disabled={selectedWeekIndex === 0}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Settimana precedente"
              aria-label="Settimana precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 text-xs font-extrabold text-blue-400 hover:text-blue-300 hover:bg-[#142342] rounded-xl transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={handleNextWeek}
              disabled={selectedWeekIndex === settimane.length - 1}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Settimana successiva"
              aria-label="Settimana successiva"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Menu a Tendina Settimana di Visita EVIDENZIATO */}
          <div className="relative flex-1 min-w-0">
            <div className="relative">
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(parseInt(e.target.value, 10))}
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-2xl border-2 border-[#1E3A5F] hover:border-blue-500 bg-[#0B1426] text-xs sm:text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs cursor-pointer truncate transition-all"
                title="Seleziona la settimana di visita"
              >
                {settimane.map((w, idx) => (
                  <option key={w.id} value={idx} className="bg-[#0B1426] text-white">
                    Sett. {idx + 1}: {abbreviateMonths(w.periodo)} — {w.dettagli !== '-' ? w.dettagli : w.evento}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Riga 2: Pulsanti di Azione e Switcher Vista per Mobile & Desktop */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#172646]">
          {/* Switcher Vista Settimana / Riepilogo */}
          <div className="flex items-center bg-[#0B1426] p-1 rounded-2xl border border-[#1E3A5F] text-xs font-bold shadow-2xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
              <span>Settimana</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-blue-300" />
              <span>Riepilogo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sincronizza Calendario */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E3A5F] hover:border-blue-400 bg-[#142342] hover:bg-[#1A2C52] text-xs font-bold text-blue-200 transition-colors shadow-2xs cursor-pointer"
              title="Sincronizza con Apple Calendar, Google o Outlook"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Sincronizza</span>
            </button>

            {/* + Nuovo Evento */}
            <button
              onClick={() => openNewAppointment()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Evento</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* ── BANNER PANORAMICA SETTIMANA ── */}
          {activeWeek && (
            <div className="bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                    {abbreviateMonths(activeWeek.periodo)}
                  </span>
                  {activeWeek.evento === 'congregazione' && activeWeek.numero > 0 && (
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black shadow-2xs"
                      title={`Visita #${activeWeek.numero}`}
                    >
                      #{activeWeek.numero}
                    </span>
                  )}
                  <EventBadge
                    tipo={activeWeek.evento}
                    customLabel={activeWeek.dettagli !== '-' ? activeWeek.dettagli : undefined}
                    size="md"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                  {congActive?.citta && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <strong className="text-slate-300">Zona:</strong> {congActive.citta}
                    </span>
                  )}
                  {congActive?.contatto && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <strong className="text-slate-300">Referente:</strong> {congActive.contatto}
                    </span>
                  )}
                  {activeWeek.note && activeWeek.note !== '-' && (
                    <span className="inline-flex items-center gap-1 italic text-slate-400">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      {activeWeek.note}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1426] border border-[#1E3A5F] text-xs text-slate-300">
                  <span className="font-extrabold text-blue-400 text-sm">{weekAppsCount}</span>
                  <span>{weekAppsCount === 1 ? 'evento pianificato' : 'eventi pianificati'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── GRIGLIA 7 GIORNI SENZA CATEGORIE (LINEARE E ORDINATA) ── */}
          <div className="space-y-3">
            {weekDays.map((day) => {
              const dayApps = appuntamenti
                .filter((a) => a.data === day.iso)
                .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));

              return (
                <div
                  key={day.iso}
                  className={`rounded-3xl border flex flex-col md:flex-row transition-all overflow-hidden ${
                    day.isToday
                      ? 'bg-[#0F1A30] border-blue-500 ring-2 ring-blue-500/30 shadow-md shadow-blue-950/40'
                      : 'bg-[#0F1A30] border-[#1E3A5F] shadow-2xs hover:border-blue-500/50'
                  }`}
                >
                  {/* Testata Giorno (Desktop: Colonna Sinistra | Mobile: Barra Superiore) */}
                  <div
                    className={`p-3.5 sm:p-4 md:w-44 shrink-0 md:border-r border-b md:border-b-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 ${
                      day.isToday
                        ? 'bg-[#142342] border-blue-500/30 text-blue-200'
                        : 'bg-[#0B1426] border-[#1E3A5F] text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
                          {day.dayName}
                        </span>
                        {day.isToday && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                            Oggi
                          </span>
                        )}
                      </div>
                      <div className="text-xl md:text-2xl font-black mt-0.5 tracking-tight text-white">
                        {day.dayNumber} <span className="text-sm font-semibold text-slate-400">{day.monthShort}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openNewAppointment(day.iso)}
                      className="py-1.5 px-2.5 rounded-xl border border-dashed border-[#1E3A5F] hover:border-blue-400 bg-[#142342] hover:bg-[#1A2C52] text-[11px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title={`Aggiungi appuntamento per ${day.dayName}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Aggiungi</span>
                    </button>
                  </div>

                  {/* Griglia Appuntamenti del Giorno — SENZA CATEGORIE */}
                  <div className="p-3 sm:p-4 flex-1">
                    {dayApps.length === 0 ? (
                      <button
                        onClick={() => openNewAppointment(day.iso)}
                        className="w-full h-full min-h-[56px] flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-blue-300 hover:bg-[#142342]/40 rounded-2xl border border-dashed border-[#1E3A5F] transition-colors p-3 cursor-pointer group"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium">Nessun evento in programma. Tocca per aggiungere.</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {dayApps.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => openEditAppointment(app)}
                            className="p-3.5 rounded-2xl border border-[#1E3A5F] bg-[#142342] hover:border-blue-400 hover:bg-[#1A2C52] hover:shadow-md hover:shadow-blue-950/40 transition-all cursor-pointer group relative flex flex-col justify-between min-h-[80px]"
                          >
                            <div>
                              {/* Orario di inizio */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="inline-flex items-center gap-1.5 font-black text-xs text-blue-300 bg-[#0B1426] border border-[#1E3A5F] px-2 py-0.5 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                                  {app.oraInizio}
                                </span>
                              </div>

                              {/* Titolo Appuntamento */}
                              <div className="font-extrabold text-white text-sm leading-snug group-hover:text-blue-200 transition-colors">
                                {app.titolo}
                              </div>
                            </div>

                            <div className="mt-2 space-y-1">
                              {/* Luogo */}
                              {app.luogo && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <span className="truncate">{app.luogo}</span>
                                </div>
                              )}

                              {/* Note */}
                              {app.note && (
                                <div className="text-[11px] text-slate-400 line-clamp-1 italic">
                                  {app.note}
                                </div>
                              )}
                            </div>

                            {/* Icona modifica su hover */}
                            <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-[#0B1426] border border-[#1E3A5F] shadow-xs">
                              <Pencil className="w-3 h-3 text-slate-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* ── TABELLA RIEPILOGO COPERTURA ── */
        <div className="bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#1E3A5F] bg-[#0B1426] font-bold text-xs text-slate-300 uppercase tracking-wider grid grid-cols-12 gap-2">
            <div className="col-span-4">Congregazione</div>
            <div className="col-span-3">Ultima Visita</div>
            <div className="col-span-3">Tempo Trascorso</div>
            <div className="col-span-2 text-right">Stato</div>
          </div>
          <div className="divide-y divide-[#172646]">
            {congregazioni.map((c) => {
              const isCritical = c.settimaneTrascorse >= 12;
              const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
              return (
                <div key={c.id} className="p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-[#142342]/40 transition-colors">
                  <div className="col-span-4 font-bold text-white">{c.nome}</div>
                  <div className="col-span-3 text-slate-300">{abbreviateMonths(c.ultimaVisita)}</div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{c.settimaneTrascorse} sett.</span>
                      <div className="w-16 bg-[#0B1426] border border-[#1E3A5F] h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${
                            isCritical ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, (c.settimaneTrascorse / 20) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                          : isMedium
                          ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                          : 'bg-blue-950/60 border border-blue-800/60 text-blue-300'
                      }`}
                    >
                      {isCritical ? 'Urgente' : isMedium ? 'In attesa' : 'Regolare'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSave={onSaveAppuntamento}
        onDelete={onDeleteAppuntamento}
        editingAppointment={editingApp}
        defaultDate={modalDate}
        settimanaId={activeWeek?.id}
      />

      {/* Calendar Sync Modal */}
      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        settimane={settimane}
        appuntamenti={appuntamenti}
        congregazioni={congregazioni}
        currentWeek={activeWeek}
      />
    </div>
  );
};
