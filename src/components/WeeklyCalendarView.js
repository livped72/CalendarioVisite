import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, CalendarDays, Pencil, Table as TableIcon, Phone, Info, } from 'lucide-react';
import { EventBadge } from './EventBadge';
import { AppointmentModal } from './AppointmentModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { abbreviateMonths } from '../lib/dateUtils';
const CATEGORY_STYLES = {
    servizio: { bg: 'bg-emerald-50/90', text: 'text-emerald-900', border: 'border-emerald-200/80', label: 'Servizio' },
    adunanza: { bg: 'bg-indigo-50/90', text: 'text-indigo-900', border: 'border-indigo-200/80', label: 'Adunanza' },
    anziani: { bg: 'bg-amber-50/90', text: 'text-amber-900', border: 'border-amber-200/80', label: 'Anziani' },
    pionieri: { bg: 'bg-purple-50/90', text: 'text-purple-900', border: 'border-purple-200/80', label: 'Pionieri' },
    servitori: { bg: 'bg-teal-50/90', text: 'text-teal-900', border: 'border-teal-200/80', label: 'Servitori' },
    pastorale: { bg: 'bg-rose-50/90', text: 'text-rose-900', border: 'border-rose-200/80', label: 'Pastorale' },
    discorso: { bg: 'bg-blue-50/90', text: 'text-blue-900', border: 'border-blue-200/80', label: 'Discorso' },
    pranzo: { bg: 'bg-orange-50/90', text: 'text-orange-900', border: 'border-orange-200/80', label: 'Pranzo' },
    personale: { bg: 'bg-stone-100/90', text: 'text-stone-900', border: 'border-stone-300/80', label: 'Personale' },
    altro: { bg: 'bg-gray-100/90', text: 'text-gray-900', border: 'border-gray-300/80', label: 'Altro' },
};
const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
export const WeeklyCalendarView = ({ settimane, congregazioni, appuntamenti, onSaveAppuntamento, onDeleteAppuntamento, }) => {
    // Selected week index
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [viewMode, setViewMode] = useState('calendar');
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
            // Fallback: create 7 days starting today
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
        // Parse activeWeek.startDate
        const start = new Date(activeWeek.startDate);
        // Find Monday of this week (Monday = 1, Sunday = 0 in JS)
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
        // Find week that covers today
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
        return (_jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-12 text-center", children: [_jsx(Calendar, { className: "w-10 h-10 text-[#7C8B82] mx-auto mb-3 opacity-60" }), _jsx("h3", { className: "text-sm font-bold text-[#2F3332] uppercase", children: "Nessuna settimana pianificata" }), _jsx("p", { className: "text-xs text-[#888] mt-1", children: "Aggiungi le settimane dal Calendario Principale per visualizzare e gestire gli appuntamenti." })] }));
    }
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E0DED9] shadow-2xs", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("div", { className: "flex items-center bg-[#FAF9F7] rounded-xl border border-[#E0DED9] p-0.5", children: [_jsx("button", { onClick: handlePrevWeek, disabled: selectedWeekIndex === 0, className: "p-1.5 rounded-lg text-[#555] hover:text-[#2F3332] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors", title: "Settimana precedente", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleJumpToToday, className: "px-2.5 py-1 text-xs font-bold text-[#47574E] hover:text-[#2F3332] hover:bg-white rounded-lg transition-colors cursor-pointer", children: "Oggi" }), _jsx("button", { onClick: handleNextWeek, disabled: selectedWeekIndex === settimane.length - 1, className: "p-1.5 rounded-lg text-[#555] hover:text-[#2F3332] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors", title: "Settimana successiva", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }), _jsx("select", { value: selectedWeekIndex, onChange: (e) => setSelectedWeekIndex(parseInt(e.target.value, 10)), className: "px-3 py-1.5 rounded-xl border border-[#E0DED9] text-xs font-bold text-[#2F3332] bg-white focus:outline-none focus:border-[#7C8B82] max-w-[260px] truncate", children: settimane.map((w, idx) => (_jsxs("option", { value: idx, children: ["Sett. ", idx + 1, ": ", abbreviateMonths(w.periodo), " (", w.dettagli !== '-' ? w.dettagli : w.evento, ")"] }, w.id))) }), _jsxs("span", { className: "text-xs font-bold text-[#7C8B82]", children: [selectedWeekIndex + 1, " di ", settimane.length] })] }), _jsxs("div", { className: "flex items-center flex-wrap gap-2", children: [_jsxs("div", { className: "flex items-center bg-[#FAF9F7] p-1 rounded-xl border border-[#E0DED9] text-xs font-semibold", children: [_jsxs("button", { onClick: () => setViewMode('calendar'), className: `flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'calendar'
                                            ? 'bg-white text-[#2F3332] font-bold shadow-2xs'
                                            : 'text-[#666] hover:text-[#2F3332]'}`, children: [_jsx(CalendarDays, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), _jsx("span", { children: "Settimana" })] }), _jsxs("button", { onClick: () => setViewMode('table'), className: `flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${viewMode === 'table'
                                            ? 'bg-white text-[#2F3332] font-bold shadow-2xs'
                                            : 'text-[#666] hover:text-[#2F3332]'}`, children: [_jsx(TableIcon, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), _jsx("span", { children: "Riepilogo Copertura" })] })] }), _jsxs("button", { onClick: () => setIsSyncModalOpen(true), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0DED9] hover:border-[#7C8B82] bg-white text-xs font-bold text-[#2F3332] transition-colors shadow-2xs cursor-pointer", title: "Sincronizza con Apple Calendar, Google o Outlook", children: [_jsx(Calendar, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), _jsx("span", { children: "Sincronizza Calendario" })] }), _jsxs("button", { onClick: () => openNewAppointment(), className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C8B82] hover:bg-[#68766E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Nuovo Appuntamento" })] })] })] }), viewMode === 'calendar' ? (_jsxs(_Fragment, { children: [activeWeek && (_jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [_jsx("span", { className: "text-xs font-extrabold text-[#7C8B82] uppercase tracking-wider", children: abbreviateMonths(activeWeek.periodo) }), _jsx(EventBadge, { tipo: activeWeek.evento, customLabel: activeWeek.dettagli !== '-' ? activeWeek.dettagli : undefined, size: "md" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-[#666] pt-1", children: [congActive?.citta && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), _jsx("strong", { children: "Zona:" }), " ", congActive.citta] })), congActive?.contatto && (_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), _jsx("strong", { children: "Referente:" }), " ", congActive.contatto] })), activeWeek.note && activeWeek.note !== '-' && (_jsxs("span", { className: "inline-flex items-center gap-1 italic text-[#777]", children: [_jsx(Info, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), activeWeek.note] }))] })] }), _jsx("div", { className: "shrink-0 flex items-center gap-2 text-xs text-[#888]", children: _jsxs("div", { className: "px-3 py-1.5 rounded-xl bg-[#FAF9F7] border border-[#E0DED9]", children: [_jsx("span", { className: "font-bold text-[#2F3332]", children: appuntamenti.filter((a) => weekDays.some((d) => d.iso === a.data)).length }), ' ', "appuntamenti questa settimana"] }) })] })), _jsx("div", { className: "space-y-3", children: weekDays.map((day) => {
                            // Appointments for this specific date
                            const dayApps = appuntamenti
                                .filter((a) => a.data === day.iso)
                                .sort((a, b) => a.oraInizio.localeCompare(b.oraInizio));
                            return (_jsxs("div", { className: `rounded-2xl border flex flex-col md:flex-row transition-all overflow-hidden min-h-[120px] ${day.isToday
                                    ? 'bg-[#FCFBFA] border-[#7C8B82] ring-1 ring-[#7C8B82] shadow-xs'
                                    : 'bg-white border-[#E0DED9] shadow-2xs hover:border-[#C5C2BA]'}`, children: [_jsxs("div", { className: `p-4 md:w-48 shrink-0 md:border-r border-b md:border-b-0 flex md:flex-col items-center md:items-start justify-between md:justify-start ${day.isToday
                                            ? 'bg-[#7C8B82]/15 border-[#7C8B82]/30 text-[#3C4A42]'
                                            : 'bg-[#FAF9F7] border-[#E0DED9] text-[#2F3332]'}`, children: [_jsxs("div", { children: [_jsx("div", { className: "text-[11px] font-bold uppercase tracking-wider text-[#7C8B82]", children: day.dayName }), _jsxs("div", { className: "text-xl md:text-2xl font-extrabold mt-0.5", children: [day.dayNumber, " ", day.monthShort] })] }), _jsxs("div", { className: "flex md:flex-col items-center md:items-start gap-2 mt-0 md:mt-3", children: [day.isToday && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-[#7C8B82] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs", children: "Oggi" })), _jsxs("button", { onClick: () => openNewAppointment(day.iso), className: "py-1.5 px-3 rounded-xl border border-dashed border-[#A8A196] hover:border-[#7C8B82] bg-white hover:bg-white text-[11px] font-bold text-[#555] hover:text-[#2F3332] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: "Aggiungi" })] })] })] }), _jsx("div", { className: "p-3 md:p-4 flex-1", children: dayApps.length === 0 ? (_jsx("div", { className: "h-full min-h-[60px] flex items-center text-[13px] text-[#AAA] italic px-2", children: "Nessun impegno programmato" })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3", children: dayApps.map((app) => {
                                                const style = CATEGORY_STYLES[app.categoria] || CATEGORY_STYLES.altro;
                                                return (_jsxs("div", { onClick: () => openEditAppointment(app), className: `p-3 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-xs group relative flex flex-col justify-between min-h-[100px] ${style.bg} ${style.border}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between gap-1 mb-2", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5 font-bold text-[11px] text-[#2F3332]", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-[#7C8B82]" }), app.oraInizio, app.oraFine ? ` - ${app.oraFine}` : ''] }), _jsx("span", { className: `text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${style.bg} ${style.text}`, children: style.label })] }), _jsx("div", { className: "font-bold text-[#2F3332] text-sm leading-tight group-hover:text-[#5B6760] transition-colors mb-1.5", children: app.titolo })] }), _jsxs("div", { children: [app.luogo && (_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-[#666] mt-2 truncate", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#7C8B82] shrink-0" }), _jsx("span", { className: "truncate", children: app.luogo })] })), app.note && (_jsx("div", { className: "text-[11px] text-[#777] mt-1.5 line-clamp-1 italic", children: app.note }))] }), _jsx("div", { className: "absolute right-2 top-2 hidden group-hover:flex items-center gap-0.5 bg-white/90 backdrop-blur-xs rounded-md shadow-xs p-1", children: _jsx(Pencil, { className: "w-3 h-3 text-[#555] hover:text-[#2F3332]" }) })] }, app.id));
                                            }) })) })] }, day.iso));
                        }) })] })) : (
            /* Summary Table View of Congregation Coverage */
            _jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-[#E0DED9] bg-[#FAF9F7] font-bold text-xs text-[#2F3332] uppercase tracking-wider grid grid-cols-12 gap-2", children: [_jsx("div", { className: "col-span-4", children: "Congregazione" }), _jsx("div", { className: "col-span-3", children: "Ultima Visita" }), _jsx("div", { className: "col-span-3", children: "Tempo Trascorso" }), _jsx("div", { className: "col-span-2 text-right", children: "Stato" })] }), _jsx("div", { className: "divide-y divide-[#EFECE6]", children: congregazioni.map((c) => {
                            const isCritical = c.settimaneTrascorse >= 12;
                            const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
                            return (_jsxs("div", { className: "p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-[#FAF9F7]", children: [_jsx("div", { className: "col-span-4 font-bold text-[#2F3332]", children: c.nome }), _jsx("div", { className: "col-span-3 text-[#555]", children: abbreviateMonths(c.ultimaVisita) }), _jsx("div", { className: "col-span-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-[#2F3332]", children: [c.settimaneTrascorse, " sett."] }), _jsx("div", { className: "w-16 bg-[#E0DED9] h-1.5 rounded-full overflow-hidden hidden sm:block", children: _jsx("div", { className: `h-full ${isCritical ? 'bg-rose-600' : isMedium ? 'bg-amber-600' : 'bg-[#7C8B82]'}`, style: { width: `${Math.min(100, (c.settimaneTrascorse / 20) * 100)}%` } }) })] }) }), _jsx("div", { className: "col-span-2 text-right", children: _jsx("span", { className: `inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCritical
                                                ? 'bg-rose-100 text-rose-800'
                                                : isMedium
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-[#EBF1ED] text-[#475E50]'}`, children: isCritical ? 'Urgente' : isMedium ? 'In attesa' : 'Regolare' }) })] }, c.id));
                        }) })] })), _jsx(AppointmentModal, { isOpen: isAppModalOpen, onClose: () => {
                    setIsAppModalOpen(false);
                    setEditingApp(null);
                }, onSave: onSaveAppuntamento, onDelete: onDeleteAppuntamento, editingAppointment: editingApp, defaultDate: modalDate, settimanaId: activeWeek?.id }), _jsx(CalendarSyncModal, { isOpen: isSyncModalOpen, onClose: () => setIsSyncModalOpen(false), settimane: settimane, appuntamenti: appuntamenti, congregazioni: congregazioni, currentWeek: activeWeek })] }));
};
