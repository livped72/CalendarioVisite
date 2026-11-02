import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Calendar, Clock, MapPin, CalendarDays, Pencil, Table as TableIcon, Phone, Info, Home, } from 'lucide-react';
import { EventBadge } from './EventBadge';
import { AppointmentModal } from './AppointmentModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { abbreviateMonths, findWeekIndexForDate } from '../lib/dateUtils';
const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
export const WeeklyCalendarView = ({ settimane, congregazioni, appuntamenti, onSaveAppuntamento, onDeleteAppuntamento, initialSettimanaId, onJumpConsumed, onGoToToday, todayTrigger, }) => {
    // Selected week index
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [viewMode, setViewMode] = useState('calendar');
    // Jump to initialSettimanaId when provided
    useEffect(() => {
        if (!initialSettimanaId || settimane.length === 0)
            return;
        const idx = settimane.findIndex((w) => w.id === initialSettimanaId);
        if (idx >= 0) {
            setSelectedWeekIndex(idx);
        }
        onJumpConsumed?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSettimanaId]);
    // Modals state
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [modalDate, setModalDate] = useState('');
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    // Congregations map for quick lookup
    const congMap = useMemo(() => {
        const map = new Map();
        congregazioni.forEach((c) => map.set(c.id, c));
        return map;
    }, [congregazioni]);
    // Current selected week
    const activeWeek = settimane[selectedWeekIndex] || settimane[0];
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
        if (todayTrigger === undefined || todayTrigger === 0)
            return;
        handleJumpToToday();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todayTrigger]);
    const openNewAppointment = (dateIso) => {
        setEditingApp(null);
        setModalDate(dateIso || weekDays[0]?.iso || new Date().toISOString().slice(0, 10));
        setIsAppModalOpen(true);
    };
    const openEditAppointment = (app) => {
        setEditingApp(app);
        setModalDate(app.data);
        setIsAppModalOpen(true);
    };
    if (settimane.length === 0) {
        return (_jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center", children: [_jsx(Calendar, { className: "w-10 h-10 text-blue-500 mx-auto mb-3 opacity-80" }), _jsx("h3", { className: "text-sm font-bold text-slate-800 uppercase tracking-wider", children: "Nessuna settimana pianificata" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Aggiungi le settimane dal Calendario Principale per visualizzare e gestire gli appuntamenti." })] }));
    }
    const weekAppsCount = appuntamenti.filter((a) => weekDays.some((d) => d.iso === a.data)).length;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2.5", children: [_jsxs("div", { className: "flex items-center justify-between sm:justify-start gap-1 bg-slate-100 rounded-2xl border border-slate-200 p-1 shrink-0 shadow-2xs", children: [_jsx("button", { onClick: handlePrevWeek, disabled: selectedWeekIndex === 0, className: "p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors", title: "Settimana precedente", "aria-label": "Settimana precedente", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleJumpToToday, className: "px-3 py-1.5 text-xs font-black text-blue-600 hover:text-blue-800 hover:bg-white rounded-xl transition-colors cursor-pointer", children: "Oggi" }), _jsx("button", { onClick: handleNextWeek, disabled: selectedWeekIndex === settimane.length - 1, className: "p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors", title: "Settimana successiva", "aria-label": "Settimana successiva", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "relative flex-1 min-w-0", children: _jsxs("div", { className: "relative", children: [_jsx("select", { value: selectedWeekIndex, onChange: (e) => setSelectedWeekIndex(parseInt(e.target.value, 10)), className: "w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-slate-50 text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs cursor-pointer truncate transition-all", title: "Seleziona la settimana di visita", children: settimane.map((w, idx) => (_jsxs("option", { value: idx, className: "bg-white text-slate-900", children: ["Sett. ", idx + 1, ": ", abbreviateMonths(w.periodo), " \u2014 ", w.dettagli !== '-' ? w.dettagli : w.evento] }, w.id))) }), _jsx("div", { className: "absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500", children: _jsx(ChevronDown, { className: "w-4 h-4" }) })] }) })] }), _jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100", children: [_jsxs("div", { className: "flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-2xs", children: [_jsxs("button", { onClick: () => setViewMode('calendar'), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'calendar'
                                            ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                                            : 'text-slate-500 hover:text-slate-900'}`, children: [_jsx(CalendarDays, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Settimana" })] }), _jsxs("button", { onClick: () => setViewMode('table'), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'table'
                                            ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                                            : 'text-slate-500 hover:text-slate-900'}`, children: [_jsx(TableIcon, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Riepilogo" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setIsSyncModalOpen(true), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer", title: "Sincronizza con Apple Calendar, Google o Outlook", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-blue-600" }), _jsx("span", { className: "hidden sm:inline", children: "Sincronizza" })] }), _jsxs("button", { onClick: () => openNewAppointment(), className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Nuovo Evento" })] })] })] })] }), viewMode === 'calendar' ? (_jsxs(_Fragment, { children: [activeWeek && (_jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [_jsxs("div", { className: "space-y-1.5 min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs font-extrabold text-blue-600 uppercase tracking-wider", children: abbreviateMonths(activeWeek.periodo) }), activeWeek.evento === 'congregazione' && activeWeek.numero > 0 && (_jsxs("span", { className: "inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black shadow-2xs", title: `Visita #${activeWeek.numero}`, children: ["#", activeWeek.numero] })), _jsx(EventBadge, { tipo: activeWeek.evento, customLabel: activeWeek.dettagli !== '-' ? activeWeek.dettagli : undefined, size: "md" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5", children: [congActive?.citta && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-600" }), _jsx("strong", { className: "text-slate-700", children: "Zona:" }), " ", congActive.citta] })), congActive?.contatto && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-blue-600" }), _jsx("strong", { className: "text-slate-700", children: "Referente:" }), " ", congActive.contatto] })), activeWeek.note && activeWeek.note !== '-' && (_jsxs("span", { className: "inline-flex items-center gap-1 italic text-slate-500", children: [_jsx(Info, { className: "w-3.5 h-3.5 text-blue-600" }), activeWeek.note] }))] })] }), _jsx("div", { className: "shrink-0", children: _jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold", children: [_jsx("span", { className: "font-extrabold text-blue-600 text-sm", children: weekAppsCount }), _jsx("span", { children: weekAppsCount === 1 ? 'evento pianificato' : 'eventi pianificati' })] }) })] })), _jsx("div", { className: "space-y-3", children: weekDays.map((day) => {
                            const dayApps = appuntamenti
                                .filter((a) => a.data === day.iso)
                                .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));
                            return (_jsxs("div", { id: day.isToday ? 'day-block-today' : undefined, "data-day": day.iso, className: `rounded-3xl border flex flex-col md:flex-row transition-all overflow-hidden ${day.isToday
                                    ? 'bg-white border-2 border-blue-500 ring-4 ring-blue-500/10 shadow-md'
                                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'}`, children: [_jsxs("div", { className: `p-3.5 sm:p-4 md:w-44 shrink-0 md:border-r border-b md:border-b-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 ${day.isToday
                                            ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                                            : 'bg-slate-50/80 border-slate-200 text-slate-700'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-[11px] font-extrabold uppercase tracking-wider text-blue-600", children: day.dayName }), day.isToday && (_jsx("span", { className: "px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider", children: "Oggi" }))] }), _jsxs("div", { className: "text-xl md:text-2xl font-black mt-0.5 tracking-tight text-slate-900", children: [day.dayNumber, " ", _jsx("span", { className: "text-sm font-semibold text-slate-500", children: day.monthShort })] })] }), _jsxs("button", { onClick: () => openNewAppointment(day.iso), className: "py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-[11px] font-bold text-slate-700 hover:text-blue-700 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs", title: `Aggiungi appuntamento per ${day.dayName}`, children: [_jsx(Plus, { className: "w-3.5 h-3.5 text-blue-600" }), _jsx("span", { children: "Aggiungi" })] })] }), _jsx("div", { className: "p-3 sm:p-4 flex-1", children: dayApps.length === 0 ? (_jsxs("button", { onClick: () => openNewAppointment(day.iso), className: "w-full h-full min-h-[56px] flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-2xl border border-dashed border-slate-200 transition-colors p-3 cursor-pointer group", children: [_jsx(Plus, { className: "w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" }), _jsx("span", { className: "font-medium", children: "Nessun evento in programma. Tocca per aggiungere." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5", children: dayApps.map((app) => {
                                                const appCong = app.congregazioneId ? congMap.get(app.congregazioneId) : undefined;
                                                return (_jsxs("div", { onClick: () => openEditAppointment(app), className: "p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between min-h-[80px]", children: [_jsxs("div", { children: [_jsx("div", { className: "flex items-center justify-between gap-1 mb-2", children: _jsxs("span", { className: "inline-flex items-center gap-1.5 font-black text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-blue-600" }), app.oraInizio] }) }), appCong && (_jsxs("div", { className: "mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 shadow-2xs", children: [_jsx(Home, { className: "w-4 h-4 text-blue-600 shrink-0" }), _jsx("span", { className: "font-extrabold text-sm text-blue-800 leading-tight truncate", children: appCong.nome })] })), _jsx("div", { className: "font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors", children: app.titolo })] }), _jsxs("div", { className: "mt-2 space-y-1", children: [app.luogo && (_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-slate-500 truncate", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-600 shrink-0" }), _jsx("span", { className: "truncate", children: app.luogo })] })), app.note && (_jsx("div", { className: "text-[11px] text-slate-400 line-clamp-1 italic", children: app.note }))] }), _jsx("div", { className: "absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-white border border-slate-200 shadow-xs", children: _jsx(Pencil, { className: "w-3 h-3 text-slate-500" }) })] }, app.id));
                                            }) })) })] }, day.iso));
                        }) })] })) : (
            /* ── TABELLA RIEPILOGO COPERTURA ── */
            _jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2", children: [_jsx("div", { className: "col-span-4", children: "Congregazione" }), _jsx("div", { className: "col-span-3", children: "Ultima Visita" }), _jsx("div", { className: "col-span-3", children: "Tempo Trascorso" }), _jsx("div", { className: "col-span-2 text-right", children: "Stato" })] }), _jsx("div", { className: "divide-y divide-slate-100", children: congregazioni.map((c) => {
                            const isCritical = c.settimaneTrascorse >= 12;
                            const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
                            return (_jsxs("div", { className: "p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition-colors", children: [_jsx("div", { className: "col-span-4 font-bold text-slate-900", children: c.nome }), _jsx("div", { className: "col-span-3 text-slate-600", children: abbreviateMonths(c.ultimaVisita) }), _jsx("div", { className: "col-span-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-slate-700", children: [c.settimaneTrascorse, " sett."] }), _jsx("div", { className: "w-16 bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block", children: _jsx("div", { className: `h-full ${isCritical ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-blue-500'}`, style: { width: `${Math.min(100, (c.settimaneTrascorse / 20) * 100)}%` } }) })] }) }), _jsx("div", { className: "col-span-2 text-right", children: _jsx("span", { className: `inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCritical
                                                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                                : isMedium
                                                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                                                    : 'bg-blue-50 border border-blue-200 text-blue-700'}`, children: isCritical ? 'Urgente' : isMedium ? 'In attesa' : 'Regolare' }) })] }, c.id));
                        }) })] })), _jsx(AppointmentModal, { isOpen: isAppModalOpen, onClose: () => {
                    setIsAppModalOpen(false);
                    setEditingApp(null);
                }, onSave: onSaveAppuntamento, onDelete: onDeleteAppuntamento, editingAppointment: editingApp, defaultDate: modalDate, settimanaId: activeWeek?.id }), _jsx(CalendarSyncModal, { isOpen: isSyncModalOpen, onClose: () => setIsSyncModalOpen(false), settimane: settimane, appuntamenti: appuntamenti, congregazioni: congregazioni, currentWeek: activeWeek })] }));
};
