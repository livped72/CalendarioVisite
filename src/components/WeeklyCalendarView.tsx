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
      <div className="bg-white rounded-3xl border border-[#E0DED9] shadow-2xs p-12 text-center">
        <Calendar className="w-10 h-10 text-[#7C8B82] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-bold text-[#2F3332] uppercase">Nessuna settimana pianificata</h3>
        <p className="text-xs text-[#888] mt-1">
          Aggiungi le settimane dal Calendario Principale per visualizzare e gestire gli appuntamenti.
        </p>
      </div>
    );
  }

  const weekAppsCount = appuntamenti.filter((a) => weekDays.some((d) => d.iso === a.data)).length;

  return (
    <div className="space-y-4">
      {/* ── TOP CONTROL BAR EVOLUTA ── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E0DED9] shadow-xs space-y-3.5">
        {/* Riga 1: Selettore Settimana Evidenziato & Pulsanti Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Pulsanti Step: < Oggi > */}
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#FAF9F7] rounded-2xl border border-[#D5D2CA] p-1 shrink-0 shadow-2xs">
            <button
              onClick={handlePrevWeek}
              disabled={selectedWeekIndex === 0}
              className="p-2 rounded-xl text-[#555] hover:text-[#2F3332] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Settimana precedente"
              aria-label="Settimana precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 text-xs font-extrabold text-[#47574E] hover:text-[#2F3332] hover:bg-white rounded-xl transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={handleNextWeek}
              disabled={selectedWeekIndex === settimane.length - 1}
              className="p-2 rounded-xl text-[#555] hover:text-[#2F3332] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
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
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-2xl border-2 border-[#7C8B82] bg-[#FAF9F7] hover:bg-white text-xs sm:text-sm font-black text-[#2F3332] focus:outline-none focus:ring-3 focus:ring-[#7C8B82]/20 shadow-xs cursor-pointer truncate transition-all"
                title="Seleziona la settimana di visita"
              >
                {settimane.map((w, idx) => (
                  <option key={w.id} value={idx}>
                    Sett. {idx + 1}: {abbreviateMonths(w.periodo)} — {w.dettagli !== '-' ? w.dettagli : w.evento}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5B6760]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Riga 2: Pulsanti di Azione e Switcher Vista per Mobile & Desktop */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#EFECE6]">
          {/* Switcher Vista Settimana / Riepilogo */}
          <div className="flex items-center bg-[#FAF9F7] p-1 rounded-2xl border border-[#D5D2CA] text-xs font-bold shadow-2xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#2F3332] shadow-2xs font-extrabold'
                  : 'text-[#666] hover:text-[#2F3332]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#7C8B82]" />
              <span>Settimana</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#2F3332] shadow-2xs font-extrabold'
                  : 'text-[#666] hover:text-[#2F3332]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-[#7C8B82]" />
              <span>Riepilogo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sincronizza Calendario */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5D2CA] hover:border-[#7C8B82] bg-white text-xs font-bold text-[#2F3332] transition-colors shadow-2xs cursor-pointer"
              title="Sincronizza con Apple Calendar, Google o Outlook"
            >
              <Calendar className="w-3.5 h-3.5 text-[#7C8B82]" />
              <span className="hidden sm:inline">Sincronizza</span>
            </button>

            {/* + Nuovo Evento */}
            <button
              onClick={() => openNewAppointment()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C8B82] hover:bg-[#68766E] text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-[#E0DED9] shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[#7C8B82] uppercase tracking-wider">
                    {abbreviateMonths(activeWeek.periodo)}
                  </span>
                  {activeWeek.evento === 'congregazione' && activeWeek.numero > 0 && (
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-[#7C8B82] text-white text-[11px] font-black shadow-2xs"
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

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#666] pt-0.5">
                  {congActive?.citta && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7C8B82]" />
                      <strong>Zona:</strong> {congActive.citta}
                    </span>
                  )}
                  {congActive?.contatto && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#7C8B82]" />
                      <strong>Referente:</strong> {congActive.contatto}
                    </span>
                  )}
                  {activeWeek.note && activeWeek.note !== '-' && (
                    <span className="inline-flex items-center gap-1 italic text-[#777]">
                      <Info className="w-3.5 h-3.5 text-[#7C8B82]" />
                      {activeWeek.note}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F7] border border-[#E0DED9] text-xs text-[#555]">
                  <span className="font-extrabold text-[#2F3332] text-sm">{weekAppsCount}</span>
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
                      ? 'bg-white border-[#7C8B82] ring-2 ring-[#7C8B82]/20 shadow-xs'
                      : 'bg-white border-[#E0DED9] shadow-2xs hover:border-[#C5C2BA]'
                  }`}
                >
                  {/* Testata Giorno (Desktop: Colonna Sinistra | Mobile: Barra Superiore) */}
                  <div
                    className={`p-3.5 sm:p-4 md:w-44 shrink-0 md:border-r border-b md:border-b-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 ${
                      day.isToday
                        ? 'bg-[#F2F5F3] border-[#7C8B82]/30 text-[#3C4A42]'
                        : 'bg-[#FAF9F7] border-[#E0DED9] text-[#2F3332]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7C8B82]">
                          {day.dayName}
                        </span>
                        {day.isToday && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#7C8B82] text-white text-[9px] font-black uppercase tracking-wider">
                            Oggi
                          </span>
                        )}
                      </div>
                      <div className="text-xl md:text-2xl font-black mt-0.5 tracking-tight text-[#2F3332]">
                        {day.dayNumber} <span className="text-sm font-semibold text-[#666]">{day.monthShort}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openNewAppointment(day.iso)}
                      className="py-1.5 px-2.5 rounded-xl border border-dashed border-[#B8B2A6] hover:border-[#7C8B82] bg-white hover:bg-white text-[11px] font-bold text-[#555] hover:text-[#2F3332] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title={`Aggiungi appuntamento per ${day.dayName}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-[#7C8B82]" />
                      <span>Aggiungi</span>
                    </button>
                  </div>

                  {/* Griglia Appuntamenti del Giorno — SENZA CATEGORIE */}
                  <div className="p-3 sm:p-4 flex-1">
                    {dayApps.length === 0 ? (
                      <button
                        onClick={() => openNewAppointment(day.iso)}
                        className="w-full h-full min-h-[56px] flex items-center justify-center gap-2 text-xs text-[#999] hover:text-[#5B6760] hover:bg-[#FAF9F7] rounded-2xl border border-dashed border-[#E5E2DC] transition-colors p-3 cursor-pointer group"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#AAA] group-hover:text-[#7C8B82] transition-colors" />
                        <span className="font-medium">Nessun evento in programma. Tocca per aggiungere.</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {dayApps.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => openEditAppointment(app)}
                            className="p-3.5 rounded-2xl border border-[#E0DED9] bg-white hover:border-[#7C8B82] hover:shadow-xs transition-all cursor-pointer group relative flex flex-col justify-between min-h-[80px]"
                          >
                            <div>
                              {/* Orario di inizio */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="inline-flex items-center gap-1.5 font-black text-xs text-[#2F3332] bg-[#FAF9F7] border border-[#E0DED9] px-2 py-0.5 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-[#7C8B82]" />
                                  {app.oraInizio}
                                </span>
                              </div>

                              {/* Titolo Appuntamento */}
                              <div className="font-extrabold text-[#2F3332] text-sm leading-snug group-hover:text-[#5B6760] transition-colors">
                                {app.titolo}
                              </div>
                            </div>

                            <div className="mt-2 space-y-1">
                              {/* Luogo */}
                              {app.luogo && (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#666] truncate">
                                  <MapPin className="w-3.5 h-3.5 text-[#7C8B82] shrink-0" />
                                  <span className="truncate">{app.luogo}</span>
                                </div>
                              )}

                              {/* Note */}
                              {app.note && (
                                <div className="text-[11px] text-[#777] line-clamp-1 italic">
                                  {app.note}
                                </div>
                              )}
                            </div>

                            {/* Icona modifica su hover */}
                            <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-[#FAF9F7] border border-[#E0DED9] shadow-xs">
                              <Pencil className="w-3 h-3 text-[#666]" />
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
        <div className="bg-white rounded-3xl border border-[#E0DED9] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E0DED9] bg-[#FAF9F7] font-bold text-xs text-[#2F3332] uppercase tracking-wider grid grid-cols-12 gap-2">
            <div className="col-span-4">Congregazione</div>
            <div className="col-span-3">Ultima Visita</div>
            <div className="col-span-3">Tempo Trascorso</div>
            <div className="col-span-2 text-right">Stato</div>
          </div>
          <div className="divide-y divide-[#EFECE6]">
            {congregazioni.map((c) => {
              const isCritical = c.settimaneTrascorse >= 12;
              const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
              return (
                <div key={c.id} className="p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-[#FAF9F7]">
                  <div className="col-span-4 font-bold text-[#2F3332]">{c.nome}</div>
                  <div className="col-span-3 text-[#555]">{abbreviateMonths(c.ultimaVisita)}</div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2F3332]">{c.settimaneTrascorse} sett.</span>
                      <div className="w-16 bg-[#E0DED9] h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${
                            isCritical ? 'bg-rose-600' : isMedium ? 'bg-amber-600' : 'bg-[#7C8B82]'
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
                          ? 'bg-rose-100 text-rose-800'
                          : isMedium
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#EBF1ED] text-[#475E50]'
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
