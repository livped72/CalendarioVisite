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
  Home,
} from 'lucide-react';
import { Settimana, Congregazione, Appuntamento } from '../types';
import { EventBadge } from './EventBadge';
import { AppointmentModal } from './AppointmentModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { abbreviateMonths, findWeekIndexForDate } from '../lib/dateUtils';

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
  /** Callback esterna per il pulsante Oggi (es. dall'Header) */
  onGoToToday?: () => void;
  /** Trigger esterno per saltare ad oggi (incrementato dall'esterno) */
  todayTrigger?: number;
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
  onGoToToday,
  todayTrigger,
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
    // Use the smart finder that handles Monday gaps and calendar-week overlaps
    const idx = findWeekIndexForDate(settimane);
    if (idx >= 0) {
      setSelectedWeekIndex(idx);
    }
    // Scroll today's day block into view after a brief paint delay
    requestAnimationFrame(() => {
      const todayEl = document.getElementById('day-block-today');
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    // If parent provided a callback, also notify it
    onGoToToday?.();
  };

  // React to external todayTrigger (e.g., Header "Oggi" button)
  useEffect(() => {
    if (todayTrigger === undefined || todayTrigger === 0) return;
    handleJumpToToday();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayTrigger]);

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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
        <Calendar className="w-10 h-10 text-blue-500 mx-auto mb-3 opacity-80" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nessuna settimana pianificata</h3>
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
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
        {/* Riga 1: Selettore Settimana Evidenziato & Pulsanti Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Pulsanti Step: < Oggi > */}
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-100 rounded-2xl border border-slate-200 p-1 shrink-0 shadow-2xs">
            <button
              onClick={handlePrevWeek}
              disabled={selectedWeekIndex === 0}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Settimana precedente"
              aria-label="Settimana precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 text-xs font-black text-blue-600 hover:text-blue-800 hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={handleNextWeek}
              disabled={selectedWeekIndex === settimane.length - 1}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
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
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-slate-50 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs cursor-pointer truncate transition-all"
                title="Seleziona la settimana di visita"
              >
                {settimane.map((w, idx) => (
                  <option key={w.id} value={idx} className="bg-white text-slate-900">
                    Sett. {idx + 1}: {abbreviateMonths(w.periodo)} — {w.dettagli !== '-' ? w.dettagli : w.evento}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Riga 2: Pulsanti di Azione e Switcher Vista per Mobile & Desktop */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
          {/* Switcher Vista Settimana / Riepilogo */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Settimana</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Riepilogo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sincronizza Calendario */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Sincronizza con Apple Calendar, Google o Outlook"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sincronizza</span>
            </button>

            {/* + Nuovo Evento */}
            <button
              onClick={() => openNewAppointment()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
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

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                  {congActive?.citta && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <strong className="text-slate-700">Zona:</strong> {congActive.citta}
                    </span>
                  )}
                  {congActive?.contatto && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <strong className="text-slate-700">Referente:</strong> {congActive.contatto}
                    </span>
                  )}
                  {activeWeek.note && activeWeek.note !== '-' && (
                    <span className="inline-flex items-center gap-1 italic text-slate-500">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      {activeWeek.note}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold">
                  <span className="font-extrabold text-blue-600 text-sm">{weekAppsCount}</span>
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
                  id={day.isToday ? 'day-block-today' : undefined}
                  data-day={day.iso}
                  className={`rounded-3xl border flex flex-col md:flex-row transition-all overflow-hidden ${
                    day.isToday
                      ? 'bg-white border-2 border-blue-500 ring-4 ring-blue-500/10 shadow-md'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* Testata Giorno (Desktop: Colonna Sinistra | Mobile: Barra Superiore) */}
                  <div
                    className={`p-3.5 sm:p-4 md:w-44 shrink-0 md:border-r border-b md:border-b-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 ${
                      day.isToday
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                          {day.dayName}
                        </span>
                        {day.isToday && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                            Oggi
                          </span>
                        )}
                      </div>
                      <div className="text-xl md:text-2xl font-black mt-0.5 tracking-tight text-slate-900">
                        {day.dayNumber} <span className="text-sm font-semibold text-slate-500">{day.monthShort}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openNewAppointment(day.iso)}
                      className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-[11px] font-bold text-slate-700 hover:text-blue-700 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title={`Aggiungi appuntamento per ${day.dayName}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Aggiungi</span>
                    </button>
                  </div>

                  {/* Griglia Appuntamenti del Giorno — SENZA CATEGORIE */}
                  <div className="p-3 sm:p-4 flex-1">
                    {dayApps.length === 0 ? (
                      <button
                        onClick={() => openNewAppointment(day.iso)}
                        className="w-full h-full min-h-[56px] flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-2xl border border-dashed border-slate-200 transition-colors p-3 cursor-pointer group"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium">Nessun evento in programma. Tocca per aggiungere.</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {dayApps.map((app) => {
                          const appCong = app.congregazioneId ? congMap.get(app.congregazioneId) : undefined;
                          return (
                          <div
                            key={app.id}
                            onClick={() => openEditAppointment(app)}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between min-h-[80px]"
                          >
                            <div>
                              {/* Orario di inizio */}
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span className="inline-flex items-center gap-1.5 font-black text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  {app.oraInizio}
                                </span>
                              </div>

                              {/* Congregazione — badge grande evidenziato */}
                              {appCong && (
                                <div className="mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs">
                                  <Home className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-extrabold text-sm text-blue-800 leading-tight truncate">
                                    {appCong.nome}
                                  </span>
                                </div>
                              )}

                              {/* Titolo Appuntamento */}
                              <div className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                                {app.titolo}
                              </div>
                            </div>

                            <div className="mt-2 space-y-1">
                              {/* Luogo */}
                              {app.luogo && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
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
                            <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                              <Pencil className="w-3 h-3 text-slate-500" />
                            </div>
                          </div>
                          );
                        })}
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
            <div className="col-span-4">Congregazione</div>
            <div className="col-span-3">Ultima Visita</div>
            <div className="col-span-3">Tempo Trascorso</div>
            <div className="col-span-2 text-right">Stato</div>
          </div>
          <div className="divide-y divide-slate-100">
            {congregazioni.map((c) => {
              const isCritical = c.settimaneTrascorse >= 12;
              const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
              return (
                <div key={c.id} className="p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-4 font-bold text-slate-900">{c.nome}</div>
                  <div className="col-span-3 text-slate-600">{abbreviateMonths(c.ultimaVisita)}</div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{c.settimaneTrascorse} sett.</span>
                      <div className="w-16 bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
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
                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                          : isMedium
                          ? 'bg-amber-50 border border-amber-200 text-amber-800'
                          : 'bg-blue-50 border border-blue-200 text-blue-700'
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
