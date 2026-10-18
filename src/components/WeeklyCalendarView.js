import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Calendar, Clock, MapPin, CalendarDays, Pencil, Table as TableIcon, Phone, Info, } from 'lucide-react';
import { EventBadge } from './EventBadge';
import { AppointmentModal } from './AppointmentModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { abbreviateMonths } from '../lib/dateUtils';
const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
export const WeeklyCalendarView = ({ settimane, congregazioni, appuntamenti, onSaveAppuntamento, onDeleteAppuntamento, initialSettimanaId, onJumpConsumed, }) => {
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
        const todayIso = new Date().toISOString().slice(0, 10);
        const idx = settimane.findIndex((w) => w.startDate && w.endDate && todayIso >= w.startDate && todayIso <= w.endDate);
        if (idx >= 0) {
            setSelectedWeekIndex(idx);
        }
        else {
            setSelectedWeekIndex(0);
        }
    };
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
        return (_jsxs("div", { className: "bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-2xs p-12 text-center", children: [_jsx(Calendar, { className: "w-10 h-10 text-blue-400 mx-auto mb-3 opacity-80" }), _jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Nessuna settimana pianificata" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Aggiungi le settimane dal Calendario Principale per visualizzare e gestire gli appuntamenti." })] }));
    }
    const weekAppsCount = appuntamenti.filter((a) => weekDays.some((d) => d.iso === a.data)).length;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-[#0F1A30] p-4 sm:p-5 rounded-3xl border border-[#1E3A5F] shadow-xs space-y-3.5", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2.5", children: [_jsxs("div", { className: "flex items-center justify-between sm:justify-start gap-1 bg-[#0B1426] rounded-2xl border border-[#1E3A5F] p-1 shrink-0 shadow-2xs", children: [_jsx("button", { onClick: handlePrevWeek, disabled: selectedWeekIndex === 0, className: "p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors", title: "Settimana precedente", "aria-label": "Settimana precedente", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleJumpToToday, className: "px-3 py-1.5 text-xs font-extrabold text-blue-400 hover:text-blue-300 hover:bg-[#142342] rounded-xl transition-colors cursor-pointer", children: "Oggi" }), _jsx("button", { onClick: handleNextWeek, disabled: selectedWeekIndex === settimane.length - 1, className: "p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142342] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors", title: "Settimana successiva", "aria-label": "Settimana successiva", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "relative flex-1 min-w-0", children: _jsxs("div", { className: "relative", children: [_jsx("select", { value: selectedWeekIndex, onChange: (e) => setSelectedWeekIndex(parseInt(e.target.value, 10)), className: "w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-2xl border-2 border-[#1E3A5F] hover:border-blue-500 bg-[#0B1426] text-xs sm:text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs cursor-pointer truncate transition-all", title: "Seleziona la settimana di visita", children: settimane.map((w, idx) => (_jsxs("option", { value: idx, className: "bg-[#0B1426] text-white", children: ["Sett. ", idx + 1, ": ", abbreviateMonths(w.periodo), " \u2014 ", w.dettagli !== '-' ? w.dettagli : w.evento] }, w.id))) }), _jsx("div", { className: "absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400", children: _jsx(ChevronDown, { className: "w-4 h-4" }) })] }) })] }), _jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-[#172646]", children: [_jsxs("div", { className: "flex items-center bg-[#0B1426] p-1 rounded-2xl border border-[#1E3A5F] text-xs font-bold shadow-2xs", children: [_jsxs("button", { onClick: () => setViewMode('calendar'), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'calendar'
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-extrabold'
                                            : 'text-slate-400 hover:text-white'}`, children: [_jsx(CalendarDays, { className: "w-3.5 h-3.5 text-blue-300" }), _jsx("span", { children: "Settimana" })] }), _jsxs("button", { onClick: () => setViewMode('table'), className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'table'
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-extrabold'
                                            : 'text-slate-400 hover:text-white'}`, children: [_jsx(TableIcon, { className: "w-3.5 h-3.5 text-blue-300" }), _jsx("span", { children: "Riepilogo" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setIsSyncModalOpen(true), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E3A5F] hover:border-blue-400 bg-[#142342] hover:bg-[#1A2C52] text-xs font-bold text-blue-200 transition-colors shadow-2xs cursor-pointer", title: "Sincronizza con Apple Calendar, Google o Outlook", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("span", { className: "hidden sm:inline", children: "Sincronizza" })] }), _jsxs("button", { onClick: () => openNewAppointment(), className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-blue-950/50 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Nuovo Evento" })] })] })] })] }), viewMode === 'calendar' ? (_jsxs(_Fragment, { children: [activeWeek && (_jsxs("div", { className: "bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [_jsxs("div", { className: "space-y-1.5 min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs font-extrabold text-blue-400 uppercase tracking-wider", children: abbreviateMonths(activeWeek.periodo) }), activeWeek.evento === 'congregazione' && activeWeek.numero > 0 && (_jsxs("span", { className: "inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black shadow-2xs", title: `Visita #${activeWeek.numero}`, children: ["#", activeWeek.numero] })), _jsx(EventBadge, { tipo: activeWeek.evento, customLabel: activeWeek.dettagli !== '-' ? activeWeek.dettagli : undefined, size: "md" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5", children: [congActive?.citta && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("strong", { className: "text-slate-300", children: "Zona:" }), " ", congActive.citta] })), congActive?.contatto && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("strong", { className: "text-slate-300", children: "Referente:" }), " ", congActive.contatto] })), activeWeek.note && activeWeek.note !== '-' && (_jsxs("span", { className: "inline-flex items-center gap-1 italic text-slate-400", children: [_jsx(Info, { className: "w-3.5 h-3.5 text-blue-400" }), activeWeek.note] }))] })] }), _jsx("div", { className: "shrink-0", children: _jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1426] border border-[#1E3A5F] text-xs text-slate-300", children: [_jsx("span", { className: "font-extrabold text-blue-400 text-sm", children: weekAppsCount }), _jsx("span", { children: weekAppsCount === 1 ? 'evento pianificato' : 'eventi pianificati' })] }) })] })), _jsx("div", { className: "space-y-3", children: weekDays.map((day) => {
                            const dayApps = appuntamenti
                                .filter((a) => a.data === day.iso)
                                .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));
                            return (_jsxs("div", { className: `rounded-3xl border flex flex-col md:flex-row transition-all overflow-hidden ${day.isToday
                                    ? 'bg-[#0F1A30] border-blue-500 ring-2 ring-blue-500/30 shadow-md shadow-blue-950/40'
                                    : 'bg-[#0F1A30] border-[#1E3A5F] shadow-2xs hover:border-blue-500/50'}`, children: [_jsxs("div", { className: `p-3.5 sm:p-4 md:w-44 shrink-0 md:border-r border-b md:border-b-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 ${day.isToday
                                            ? 'bg-[#142342] border-blue-500/30 text-blue-200'
                                            : 'bg-[#0B1426] border-[#1E3A5F] text-slate-200'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-[11px] font-extrabold uppercase tracking-wider text-blue-400", children: day.dayName }), day.isToday && (_jsx("span", { className: "px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider", children: "Oggi" }))] }), _jsxs("div", { className: "text-xl md:text-2xl font-black mt-0.5 tracking-tight text-white", children: [day.dayNumber, " ", _jsx("span", { className: "text-sm font-semibold text-slate-400", children: day.monthShort })] })] }), _jsxs("button", { onClick: () => openNewAppointment(day.iso), className: "py-1.5 px-2.5 rounded-xl border border-dashed border-[#1E3A5F] hover:border-blue-400 bg-[#142342] hover:bg-[#1A2C52] text-[11px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs", title: `Aggiungi appuntamento per ${day.dayName}`, children: [_jsx(Plus, { className: "w-3.5 h-3.5 text-blue-400" }), _jsx("span", { children: "Aggiungi" })] })] }), _jsx("div", { className: "p-3 sm:p-4 flex-1", children: dayApps.length === 0 ? (_jsxs("button", { onClick: () => openNewAppointment(day.iso), className: "w-full h-full min-h-[56px] flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-blue-300 hover:bg-[#142342]/40 rounded-2xl border border-dashed border-[#1E3A5F] transition-colors p-3 cursor-pointer group", children: [_jsx(Plus, { className: "w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" }), _jsx("span", { className: "font-medium", children: "Nessun evento in programma. Tocca per aggiungere." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5", children: dayApps.map((app) => (_jsxs("div", { onClick: () => openEditAppointment(app), className: "p-3.5 rounded-2xl border border-[#1E3A5F] bg-[#142342] hover:border-blue-400 hover:bg-[#1A2C52] hover:shadow-md hover:shadow-blue-950/40 transition-all cursor-pointer group relative flex flex-col justify-between min-h-[80px]", children: [_jsxs("div", { children: [_jsx("div", { className: "flex items-center justify-between gap-1 mb-1.5", children: _jsxs("span", { className: "inline-flex items-center gap-1.5 font-black text-xs text-blue-300 bg-[#0B1426] border border-[#1E3A5F] px-2 py-0.5 rounded-lg", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-blue-400" }), app.oraInizio] }) }), _jsx("div", { className: "font-extrabold text-white text-sm leading-snug group-hover:text-blue-200 transition-colors", children: app.titolo })] }), _jsxs("div", { className: "mt-2 space-y-1", children: [app.luogo && (_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-slate-300 truncate", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-400 shrink-0" }), _jsx("span", { className: "truncate", children: app.luogo })] })), app.note && (_jsx("div", { className: "text-[11px] text-slate-400 line-clamp-1 italic", children: app.note }))] }), _jsx("div", { className: "absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-[#0B1426] border border-[#1E3A5F] shadow-xs", children: _jsx(Pencil, { className: "w-3 h-3 text-slate-300" }) })] }, app.id))) })) })] }, day.iso));
                        }) })] })) : (
            /* ── TABELLA RIEPILOGO COPERTURA ── */
            _jsxs("div", { className: "bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-xs overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-[#1E3A5F] bg-[#0B1426] font-bold text-xs text-slate-300 uppercase tracking-wider grid grid-cols-12 gap-2", children: [_jsx("div", { className: "col-span-4", children: "Congregazione" }), _jsx("div", { className: "col-span-3", children: "Ultima Visita" }), _jsx("div", { className: "col-span-3", children: "Tempo Trascorso" }), _jsx("div", { className: "col-span-2 text-right", children: "Stato" })] }), _jsx("div", { className: "divide-y divide-[#172646]", children: congregazioni.map((c) => {
                            const isCritical = c.settimaneTrascorse >= 12;
                            const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
                            return (_jsxs("div", { className: "p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-[#142342]/40 transition-colors", children: [_jsx("div", { className: "col-span-4 font-bold text-white", children: c.nome }), _jsx("div", { className: "col-span-3 text-slate-300", children: abbreviateMonths(c.ultimaVisita) }), _jsx("div", { className: "col-span-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-slate-200", children: [c.settimaneTrascorse, " sett."] }), _jsx("div", { className: "w-16 bg-[#0B1426] border border-[#1E3A5F] h-1.5 rounded-full overflow-hidden hidden sm:block", children: _jsx("div", { className: `h-full ${isCritical ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-blue-500'}`, style: { width: `${Math.min(100, (c.settimaneTrascorse / 20) * 100)}%` } }) })] }) }), _jsx("div", { className: "col-span-2 text-right", children: _jsx("span", { className: `inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCritical
                                                ? 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                                                : isMedium
                                                    ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                                                    : 'bg-blue-950/60 border border-blue-800/60 text-blue-300'}`, children: isCritical ? 'Urgente' : isMedium ? 'In attesa' : 'Regolare' }) })] }, c.id));
                        }) })] })), _jsx(AppointmentModal, { isOpen: isAppModalOpen, onClose: () => {
                    setIsAppModalOpen(false);
                    setEditingApp(null);
                }, onSave: onSaveAppuntamento, onDelete: onDeleteAppuntamento, editingAppointment: editingApp, defaultDate: modalDate, settimanaId: activeWeek?.id }), _jsx(CalendarSyncModal, { isOpen: isSyncModalOpen, onClose: () => setIsSyncModalOpen(false), settimane: settimane, appuntamenti: appuntamenti, congregazioni: congregazioni, currentWeek: activeWeek })] }));
};
