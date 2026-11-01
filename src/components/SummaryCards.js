import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Calendar, MapPin, Download, Mail, Loader2, CalendarDays, Plus, Clock, Pencil, LayoutGrid, List, ExternalLink, ChevronLeft, ChevronRight, Info, } from 'lucide-react';
import { downloadS302Pdf, emailS302Pdf } from '../lib/pdfGenerator';
import { AppointmentModal } from './AppointmentModal';
const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
export const SummaryCards = ({ stats, nextSettimana, settimane = [], appuntamenti = [], congregazioni = [], onPlanNextWeek, onSaveAppuntamento, onDeleteAppuntamento, onNavigateToAppuntamenti, senderName, }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);
    // Selezione della settimana attiva visualizzata nel pannello
    const [selectedWeekId, setSelectedWeekId] = useState(null);
    // Modal per creazione e modifica appuntamento
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [modalDate, setModalDate] = useState('');
    // Switch vista bacheca (a 7 colonne / kanban) vs lista agenda
    const [boardView, setBoardView] = useState('board');
    // Determina la settimana attiva da mostrare
    const activeWeek = useMemo(() => {
        if (selectedWeekId) {
            const found = settimane.find((w) => w.id === selectedWeekId);
            if (found)
                return found;
        }
        return nextSettimana || settimane[0];
    }, [selectedWeekId, nextSettimana, settimane]);
    const activeWeekIndex = useMemo(() => {
        if (!activeWeek)
            return -1;
        return settimane.findIndex((w) => w.id === activeWeek.id);
    }, [activeWeek, settimane]);
    const handlePrevWeek = () => {
        if (activeWeekIndex > 0) {
            setSelectedWeekId(settimane[activeWeekIndex - 1].id);
        }
    };
    const handleNextWeek = () => {
        if (activeWeekIndex >= 0 && activeWeekIndex < settimane.length - 1) {
            setSelectedWeekId(settimane[activeWeekIndex + 1].id);
        }
    };
    const isCongregazioneActive = activeWeek && activeWeek.evento === 'congregazione';
    // Calcolo dei 7 giorni della settimana (da Lunedì a Domenica)
    const weekDays = useMemo(() => {
        if (!activeWeek?.startDate) {
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(today.setDate(diff));
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const iso = d.toISOString().slice(0, 10);
                return {
                    iso,
                    dayName: DAY_NAMES[i],
                    dayShort: DAY_SHORT[i],
                    dayNumber: d.getDate(),
                    monthShort: d.toLocaleDateString('it-IT', { month: 'short' }),
                    isToday: iso === new Date().toISOString().slice(0, 10),
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
    // Appuntamenti associati a questa settimana (per ID settimana o per data compresa nei 7 giorni)
    const weekAppuntamenti = useMemo(() => {
        if (!activeWeek)
            return [];
        const weekIsoSet = new Set(weekDays.map((d) => d.iso));
        return appuntamenti.filter((a) => weekIsoSet.has(a.data) || (activeWeek.id && a.settimanaId === activeWeek.id));
    }, [appuntamenti, activeWeek, weekDays]);
    // Indicatore se la visita è attualmente in corso
    const todayIso = new Date().toISOString().slice(0, 10);
    const isCurrentWeekUnderway = Boolean(activeWeek?.startDate &&
        activeWeek?.endDate &&
        todayIso >= activeWeek.startDate &&
        todayIso <= activeWeek.endDate);
    // Apertura modale nuovo appuntamento
    const handleAddAppointment = (dateIso) => {
        setEditingApp(null);
        setModalDate(dateIso || weekDays[0]?.iso || todayIso);
        setIsAppModalOpen(true);
    };
    // Apertura modale modifica appuntamento
    const handleEditAppointment = (app) => {
        setEditingApp(app);
        setModalDate(app.data);
        setIsAppModalOpen(true);
    };
    const handleDownloadS302 = async () => {
        if (!activeWeek)
            return;
        setIsDownloading(true);
        try {
            await downloadS302Pdf(activeWeek);
        }
        catch (err) {
            console.error('Errore durante la generazione del PDF:', err);
            alert('Errore durante la generazione del modulo S-302');
        }
        finally {
            setIsDownloading(false);
        }
    };
    const handleEmailS302 = async () => {
        if (!activeWeek)
            return;
        setIsEmailing(true);
        try {
            await emailS302Pdf(activeWeek, undefined, senderName);
        }
        catch (err) {
            console.error('Errore durante la preparazione email S-302:', err);
            alert('Errore durante la preparazione dell\'email S-302');
        }
        finally {
            setIsEmailing(false);
        }
    };
    return (_jsxs("div", { className: "space-y-2 pt-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Informazioni periodo corrente" }), settimane.length > 1 && (_jsxs("div", { className: "flex items-center gap-1.5", children: [selectedWeekId && selectedWeekId !== nextSettimana?.id && (_jsx("button", { type: "button", onClick: () => setSelectedWeekId(null), className: "text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer", children: "Torna a prossima" })), _jsxs("div", { className: "flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs", children: [_jsx("button", { type: "button", onClick: handlePrevWeek, disabled: activeWeekIndex <= 0, className: "p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors", title: "Settimana precedente", "aria-label": "Settimana precedente", children: _jsx(ChevronLeft, { className: "w-3.5 h-3.5" }) }), _jsxs("span", { className: "text-[10px] font-bold text-slate-600 px-1", children: ["Sett. ", activeWeekIndex + 1, "/", settimane.length] }), _jsx("button", { type: "button", onClick: handleNextWeek, disabled: activeWeekIndex >= settimane.length - 1, className: "p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors", title: "Settimana successiva", "aria-label": "Settimana successiva", children: _jsx(ChevronRight, { className: "w-3.5 h-3.5" }) })] })] }))] }), _jsxs("div", { className: "bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col gap-4 hover:shadow-md transition-all", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx("div", { className: "w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs", children: _jsx(Calendar, { className: "w-5 h-5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs font-black text-slate-500 uppercase tracking-wider", children: isCurrentWeekUnderway ? 'Visita in corso' : 'Prossima visita' }), isCurrentWeekUnderway && (_jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase", children: "In corso" })), activeWeek?.numero && activeWeek.numero > 0 ? (_jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black", children: ["Visita #", activeWeek.numero] })) : null] }), _jsx("div", { className: "text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight leading-snug", children: activeWeek ? activeWeek.periodo : stats.prossimaSettimana.periodo }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-sm font-bold text-blue-600", children: [_jsx(MapPin, { className: "w-4 h-4 shrink-0 text-blue-600" }), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "hover:underline text-left truncate cursor-pointer text-blue-600 hover:text-blue-800", title: "Modifica o visualizza dettagli settimana", children: activeWeek
                                                            ? activeWeek.evento === 'congregazione'
                                                                ? activeWeek.dettagli
                                                                : activeWeek.evento
                                                            : stats.prossimaSettimana.stato.replace(/^📍\s*/, '') })] })] })] }), activeWeek && (_jsxs("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: [isCongregazioneActive && (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: handleDownloadS302, disabled: isDownloading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100 active:scale-95 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50", title: "Scarica avviso S-302 compilato per questa visita", children: [isDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-blue-600" })) : (_jsx(Download, { className: "w-3.5 h-3.5 text-blue-600" })), _jsx("span", { children: "S-302" })] }), _jsxs("button", { type: "button", onClick: handleEmailS302, disabled: isEmailing || isDownloading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95", title: "Prepara email S-302 per la congregazione", children: [isEmailing ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Email" })] })] })), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs", title: "Modifica impostazioni della settimana", children: "Modifica" })] }))] }), _jsxs("div", { className: "pt-4 border-t border-slate-100 flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0", children: _jsx(CalendarDays, { className: "w-3.5 h-3.5" }) }), _jsxs("h4", { className: "text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx("span", { children: "Bacheca del calendario" }), _jsxs("span", { className: "px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold", children: [weekAppuntamenti.length, " ", weekAppuntamenti.length === 1 ? 'appuntamento' : 'appuntamenti'] })] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsxs("div", { className: "flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs", children: [_jsxs("button", { type: "button", onClick: () => setBoardView('board'), className: `px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${boardView === 'board'
                                                            ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                                                            : 'text-slate-500 hover:text-slate-800'}`, title: "Vista Bacheca Settimanale (7 colonne)", children: [_jsx(LayoutGrid, { className: "w-3 h-3" }), _jsx("span", { children: "Bacheca" })] }), _jsxs("button", { type: "button", onClick: () => setBoardView('list'), className: `px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${boardView === 'list'
                                                            ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                                                            : 'text-slate-500 hover:text-slate-800'}`, title: "Vista Elenco / Agenda", children: [_jsx(List, { className: "w-3 h-3" }), _jsx("span", { children: "Elenco" })] })] }), _jsxs("button", { type: "button", onClick: () => handleAddAppointment(), className: "inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95", title: "Aggiungi appuntamento a questa settimana", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Aggiungi" })] }), onNavigateToAppuntamenti && activeWeek && (_jsxs("button", { type: "button", onClick: () => onNavigateToAppuntamenti(activeWeek.id), className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all shadow-2xs cursor-pointer", title: "Visualizza e gestisci nel calendario completo", children: [_jsx("span", { className: "hidden sm:inline", children: "Calendario completo" }), _jsx(ExternalLink, { className: "w-3 h-3 text-slate-400" })] }))] })] }), _jsx("div", { className: "flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar", children: weekDays.map((d) => {
                                    const count = weekAppuntamenti.filter((a) => a.data === d.iso).length;
                                    return (_jsxs("button", { type: "button", onClick: () => {
                                            const el = document.getElementById(`day-col-${d.iso}`);
                                            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                        }, className: `shrink-0 px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${d.isToday
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                            : count > 0
                                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                : 'bg-slate-50 text-slate-600 border-slate-200'}`, children: [_jsxs("span", { children: [d.dayShort, " ", d.dayNumber] }), count > 0 && (_jsx("span", { className: `w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black ${d.isToday ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`, children: count }))] }, d.iso));
                                }) }), boardView === 'board' ? (_jsx("div", { className: "flex lg:grid lg:grid-cols-7 gap-2.5 overflow-x-auto pb-2 pt-1 -mx-1 px-1 snap-x scroll-smooth", children: weekDays.map((day) => {
                                    const dayApps = weekAppuntamenti
                                        .filter((a) => a.data === day.iso)
                                        .sort((a, b) => (a.oraInizio || '').localeCompare(b.oraInizio || ''));
                                    return (_jsxs("div", { id: `day-col-${day.iso}`, className: `min-w-[155px] sm:min-w-[175px] lg:min-w-0 flex-1 shrink-0 snap-start rounded-2xl border flex flex-col transition-all p-2.5 ${day.isToday
                                            ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                                            : 'bg-slate-50/80 border-slate-200/90 hover:border-slate-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-1 pb-2 border-b border-slate-200/70", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: `text-[11px] font-black uppercase tracking-wider truncate ${day.isToday ? 'text-blue-700' : 'text-slate-600'}`, children: day.dayShort }), day.isToday && (_jsx("span", { className: "px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black uppercase", children: "Oggi" }))] }), _jsxs("div", { className: "text-sm font-black text-slate-900 mt-0.5 leading-none", children: [day.dayNumber, ' ', _jsx("span", { className: "text-[11px] font-medium text-slate-400", children: day.monthShort })] })] }), _jsx("button", { type: "button", onClick: () => handleAddAppointment(day.iso), className: "w-6 h-6 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0", title: `Aggiungi appuntamento a ${day.dayName} ${day.dayNumber}`, children: _jsx(Plus, { className: "w-3.5 h-3.5" }) })] }), _jsx("div", { className: "space-y-2 pt-2 flex-1 flex flex-col justify-start", children: dayApps.length === 0 ? (_jsxs("button", { type: "button", onClick: () => handleAddAppointment(day.iso), className: "w-full min-h-[60px] flex-1 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-blue-600 transition-all p-2 cursor-pointer group/empty", title: `Aggiungi appuntamento per ${day.dayName}`, children: [_jsx(Plus, { className: "w-3.5 h-3.5 text-slate-300 group-hover/empty:text-blue-600 transition-colors" }), _jsx("span", { className: "text-[10px] font-medium text-slate-400 group-hover/empty:text-blue-600", children: "Nessun evento" })] })) : (dayApps.map((app) => (_jsxs("div", { onClick: () => handleEditAppointment(app), className: "p-2.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group/card relative text-left", title: "Clicca per visualizzare o modificare", children: [_jsxs("div", { className: "flex items-center justify-between gap-1 mb-1.5", children: [_jsxs("span", { className: "inline-flex items-center gap-1 font-extrabold text-[10px] text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded-md", children: [_jsx(Clock, { className: "w-2.5 h-2.5 text-blue-600" }), app.oraInizio, app.oraFine && ` - ${app.oraFine}`] }), _jsx(Pencil, { className: "w-2.5 h-2.5 text-slate-400 opacity-0 group-hover/card:opacity-100 transition-opacity" })] }), _jsx("div", { className: "font-extrabold text-slate-900 text-xs leading-snug group-hover/card:text-blue-700 transition-colors line-clamp-2", children: app.titolo }), app.luogo && (_jsxs("div", { className: "flex items-center gap-1 text-[10px] text-slate-500 mt-1.5 truncate", children: [_jsx(MapPin, { className: "w-2.5 h-2.5 text-blue-500 shrink-0" }), _jsx("span", { className: "truncate", children: app.luogo })] })), app.note && (_jsx("div", { className: "text-[10px] text-slate-400 italic line-clamp-1 mt-1", children: app.note }))] }, app.id)))) })] }, day.iso));
                                }) })) : (
                            /* ── VISUALIZZAZIONE ELENCO / AGENDA ── */
                            _jsx("div", { className: "divide-y divide-slate-100 border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs", children: weekDays.map((day) => {
                                    const dayApps = weekAppuntamenti
                                        .filter((a) => a.data === day.iso)
                                        .sort((a, b) => (a.oraInizio || '').localeCompare(b.oraInizio || ''));
                                    return (_jsxs("div", { className: `p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${day.isToday ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'}`, children: [_jsxs("div", { className: "flex items-center gap-3 w-40 shrink-0", children: [_jsxs("div", { className: "text-center w-10", children: [_jsx("span", { className: "block text-[10px] font-black uppercase text-blue-600", children: day.dayShort }), _jsx("span", { className: "block text-base font-black text-slate-900 leading-none", children: day.dayNumber })] }), _jsxs("div", { className: "min-w-0", children: [_jsx("span", { className: "text-xs font-bold text-slate-800 block truncate", children: day.dayName }), day.isToday && (_jsx("span", { className: "inline-block px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black uppercase", children: "Oggi" }))] })] }), _jsx("div", { className: "flex-1 min-w-0", children: dayApps.length === 0 ? (_jsx("span", { className: "text-xs text-slate-400 italic", children: "Nessun appuntamento in programma" })) : (_jsx("div", { className: "flex flex-wrap gap-2", children: dayApps.map((app) => (_jsxs("button", { type: "button", onClick: () => handleEditAppointment(app), className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs text-left cursor-pointer transition-all", children: [_jsxs("span", { className: "inline-flex items-center gap-1 font-extrabold text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md", children: [_jsx(Clock, { className: "w-2.5 h-2.5 text-blue-600" }), app.oraInizio] }), _jsx("span", { className: "text-xs font-bold text-slate-800", children: app.titolo }), app.luogo && (_jsxs("span", { className: "text-[10px] text-slate-400 hidden sm:inline", children: ["\u2022 ", app.luogo] }))] }, app.id))) })) }), _jsx("button", { type: "button", onClick: () => handleAddAppointment(day.iso), className: "self-end md:self-center p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer", title: `Aggiungi a ${day.dayName}`, children: _jsx(Plus, { className: "w-4 h-4" }) })] }, day.iso));
                                }) })), weekAppuntamenti.length === 0 && (_jsxs("div", { className: "p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-blue-800", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Info, { className: "w-4 h-4 text-blue-600 shrink-0" }), _jsx("span", { className: "text-[11px] sm:text-xs", children: "Nessun appuntamento inserito per questa settimana di visita. Tocca un giorno per pianificare il programma." })] }), _jsxs("button", { type: "button", onClick: () => handleAddAppointment(), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer active:scale-95", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Aggiungi primo evento" })] })] }))] })] }), isAppModalOpen && (_jsx(AppointmentModal, { isOpen: isAppModalOpen, onClose: () => {
                    setIsAppModalOpen(false);
                    setEditingApp(null);
                }, onSave: (saved) => {
                    onSaveAppuntamento?.(saved);
                    setIsAppModalOpen(false);
                    setEditingApp(null);
                }, onDelete: (id) => {
                    onDeleteAppuntamento?.(id);
                    setIsAppModalOpen(false);
                    setEditingApp(null);
                }, editingAppointment: editingApp, defaultDate: modalDate, settimanaId: activeWeek?.id }))] }));
};
