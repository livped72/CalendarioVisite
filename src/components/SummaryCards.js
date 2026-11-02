import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, Download, Mail, Loader2, CalendarDays, CalendarCheck, Plus, Clock, Pencil, ExternalLink, ChevronLeft, ChevronRight, } from 'lucide-react';
import { downloadS302Pdf, emailS302Pdf } from '../lib/pdfGenerator';
import { AppointmentModal } from './AppointmentModal';
import { findWeekIndexForDate } from '../lib/dateUtils';
const DAY_NAMES = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const CATEGORY_TAGS = {
    adunanza: { label: 'Adunanza', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    servizio: { label: 'Servizio', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    anziani: { label: 'Anziani', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    servitori: { label: 'Servitori', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    pionieri: { label: 'Pionieri', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    pastorale: { label: 'Pastorale', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    discorso: { label: 'Discorso', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    pranzo: { label: 'Pranzo', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    personale: { label: 'Personale', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
    altro: { label: 'Altro', badge: 'bg-slate-50 text-slate-600 border-slate-200' },
};
export const SummaryCards = ({ stats, nextSettimana, settimane = [], appuntamenti = [], congregazioni = [], onPlanNextWeek, onSaveAppuntamento, onDeleteAppuntamento, onNavigateToAppuntamenti, senderName, todayTrigger, }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEmailing, setIsEmailing] = useState(false);
    // Selezione della settimana attiva visualizzata nel pannello
    const [selectedWeekId, setSelectedWeekId] = useState(null);
    // Se viene cliccato Oggi nel Header o nel genitore, resetta la settimana attiva a oggi
    useEffect(() => {
        if (todayTrigger) {
            setSelectedWeekId(null);
        }
    }, [todayTrigger]);
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
    // Raggruppa esclusivamente i giorni che contengono appuntamenti effettivamente in programma
    const scheduledDays = useMemo(() => {
        const map = new Map();
        weekAppuntamenti.forEach((app) => {
            const list = map.get(app.data) || [];
            list.push(app);
            map.set(app.data, list);
        });
        const sortedDates = Array.from(map.keys()).sort();
        return sortedDates.map((dateIso) => {
            const dayApps = (map.get(dateIso) || []).sort((a, b) => (a.oraInizio || '').localeCompare(b.oraInizio || ''));
            const d = new Date(dateIso + 'T00:00:00');
            const dayIndex = (d.getDay() + 6) % 7;
            return {
                iso: dateIso,
                dayName: DAY_NAMES[dayIndex] || 'Giorno',
                dayShort: DAY_SHORT[dayIndex] || '',
                dayNumber: d.getDate(),
                monthShort: d.toLocaleDateString('it-IT', { month: 'short' }),
                isToday: dateIso === todayIso,
                apps: dayApps,
            };
        });
    }, [weekAppuntamenti, todayIso]);
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
    return (_jsxs("div", { className: "space-y-2 pt-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Informazioni periodo corrente" }), settimane.length > 1 && (_jsxs("div", { className: "flex items-center gap-1.5", children: [selectedWeekId && selectedWeekId !== nextSettimana?.id && (_jsx("button", { type: "button", onClick: () => setSelectedWeekId(null), className: "text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer", children: "Torna a prossima" })), _jsxs("div", { className: "flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-0.5 shadow-2xs", children: [_jsx("button", { type: "button", onClick: handlePrevWeek, disabled: activeWeekIndex <= 0, className: "p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors", title: "Settimana precedente", "aria-label": "Settimana precedente", children: _jsx(ChevronLeft, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => {
                                            const idx = findWeekIndexForDate(settimane);
                                            if (idx >= 0 && settimane[idx]) {
                                                setSelectedWeekId(settimane[idx].id);
                                            }
                                            else {
                                                setSelectedWeekId(null);
                                            }
                                        }, className: "px-2 py-0.5 rounded-lg text-[11px] font-black text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer", title: "Vai alla settimana corrente / Oggi", children: "Oggi" }), _jsxs("span", { className: "text-[10px] font-bold text-slate-600 px-1", children: ["Sett. ", activeWeekIndex + 1, "/", settimane.length] }), _jsx("button", { type: "button", onClick: handleNextWeek, disabled: activeWeekIndex >= settimane.length - 1, className: "p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer transition-colors", title: "Settimana successiva", "aria-label": "Settimana successiva", children: _jsx(ChevronRight, { className: "w-3.5 h-3.5" }) })] })] }))] }), _jsxs("div", { className: "bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 flex flex-col gap-4 hover:shadow-md transition-all", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx("div", { className: "w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs", children: _jsx(Calendar, { className: "w-5 h-5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs font-black text-slate-500 uppercase tracking-wider", children: isCurrentWeekUnderway ? 'Visita in corso' : 'Prossima visita' }), isCurrentWeekUnderway && (_jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase", children: "In corso" })), activeWeek?.numero && activeWeek.numero > 0 ? (_jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black", children: ["Visita #", activeWeek.numero] })) : null] }), _jsx("div", { className: "text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight leading-snug", children: activeWeek ? activeWeek.periodo : stats.prossimaSettimana.periodo }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-sm font-bold text-blue-600", children: [_jsx(MapPin, { className: "w-4 h-4 shrink-0 text-blue-600" }), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "hover:underline text-left truncate cursor-pointer text-blue-600 hover:text-blue-800", title: "Modifica o visualizza dettagli settimana", children: activeWeek
                                                            ? activeWeek.evento === 'congregazione'
                                                                ? activeWeek.dettagli
                                                                : activeWeek.evento
                                                            : stats.prossimaSettimana.stato.replace(/^📍\s*/, '') })] })] })] }), activeWeek && (_jsxs("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: [isCongregazioneActive && (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: handleDownloadS302, disabled: isDownloading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100 active:scale-95 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50", title: "Scarica avviso S-302 compilato per questa visita", children: [isDownloading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-blue-600" })) : (_jsx(Download, { className: "w-3.5 h-3.5 text-blue-600" })), _jsx("span", { children: "S-302" })] }), _jsxs("button", { type: "button", onClick: handleEmailS302, disabled: isEmailing || isDownloading, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95", title: "Prepara email S-302 per la congregazione", children: [isEmailing ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (_jsx(Mail, { className: "w-3.5 h-3.5" })), _jsx("span", { children: "Email" })] })] })), _jsx("button", { type: "button", onClick: onPlanNextWeek, className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs", title: "Modifica impostazioni della settimana", children: "Modifica" })] }))] }), _jsxs("div", { className: "pt-4 border-t border-slate-100 flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0", children: _jsx(CalendarDays, { className: "w-3.5 h-3.5" }) }), _jsxs("h4", { className: "text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx("span", { children: "Appuntamenti in programma" }), _jsxs("span", { className: "px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold", children: [weekAppuntamenti.length, " ", weekAppuntamenti.length === 1 ? 'appuntamento' : 'appuntamenti'] })] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsxs("button", { type: "button", onClick: () => handleAddAppointment(), className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95", title: "Aggiungi appuntamento a questa settimana", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Aggiungi" })] }), onNavigateToAppuntamenti && activeWeek && (_jsxs("button", { type: "button", onClick: () => onNavigateToAppuntamenti(activeWeek.id), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all shadow-2xs cursor-pointer", title: "Visualizza tutti i 7 giorni nel calendario completo", children: [_jsx("span", { children: "Calendario completo" }), _jsx(ExternalLink, { className: "w-3 h-3 text-slate-400" })] }))] })] }), scheduledDays.length === 0 ? (
                            /* Nessun appuntamento in programma */
                            _jsxs("div", { className: "bg-slate-50/70 border border-dashed border-slate-200/90 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-2", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-2xs", children: _jsx(CalendarCheck, { className: "w-5 h-5 text-blue-600" }) }), _jsx("div", { className: "text-sm font-bold text-slate-800 mt-1", children: "Nessun appuntamento in programma per questa visita" }), _jsx("div", { className: "text-xs text-slate-500 max-w-md", children: "I programmi di adunanza, servizio di campo o visite pastorali compariranno qui." }), _jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 mt-2", children: [_jsxs("button", { type: "button", onClick: () => handleAddAppointment(), className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Aggiungi appuntamento" })] }), onNavigateToAppuntamenti && activeWeek && (_jsx("button", { type: "button", onClick: () => onNavigateToAppuntamenti(activeWeek.id), className: "inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer transition-all", children: _jsx("span", { children: "Apri calendario" }) }))] })] })) : (
                            /* Giorni con appuntamenti effettivamente pianificati */
                            _jsx("div", { className: "space-y-4", children: scheduledDays.map((day) => (_jsxs("div", { className: `rounded-2xl border p-3.5 sm:p-4 transition-all ${day.isToday
                                        ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10 shadow-xs'
                                        : 'bg-white border-slate-200/80 shadow-2xs'}`, children: [_jsxs("div", { className: "flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-blue-600" }), _jsxs("span", { className: "text-xs sm:text-sm font-black text-slate-900 capitalize", children: [day.dayName, " ", day.dayNumber, " ", day.monthShort] }), day.isToday && (_jsx("span", { className: "px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider", children: "Oggi" })), _jsxs("span", { className: "text-[11px] font-bold text-slate-400", children: ["(", day.apps.length, " ", day.apps.length === 1 ? 'evento' : 'eventi', ")"] })] }), _jsxs("button", { type: "button", onClick: () => handleAddAppointment(day.iso), className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer", title: `Aggiungi appuntamento a ${day.dayName} ${day.dayNumber}`, children: [_jsx(Plus, { className: "w-3 h-3" }), _jsx("span", { className: "hidden sm:inline", children: "Aggiungi" })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5", children: day.apps.map((app) => {
                                                const tagInfo = CATEGORY_TAGS[app.categoria] || {
                                                    label: app.categoria,
                                                    badge: 'bg-slate-50 text-slate-700 border-slate-200',
                                                };
                                                return (_jsxs("div", { onClick: () => handleEditAppointment(app), className: "p-3 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group/card text-left flex flex-col justify-between", title: "Tocca per visualizzare o modificare", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between gap-1.5 mb-2", children: [_jsxs("span", { className: "inline-flex items-center gap-1 font-black text-[11px] text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md", children: [_jsx(Clock, { className: "w-3 h-3 text-blue-600" }), app.oraInizio, app.oraFine && ` - ${app.oraFine}`] }), _jsxs("div", { className: "flex items-center gap-1", children: [tagInfo.label && (_jsx("span", { className: `text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${tagInfo.badge}`, children: tagInfo.label })), _jsx(Pencil, { className: "w-3 h-3 text-slate-400 opacity-0 group-hover/card:opacity-100 transition-opacity" })] })] }), _jsx("div", { className: "font-extrabold text-slate-900 text-xs sm:text-sm leading-snug group-hover/card:text-blue-700 transition-colors", children: app.titolo })] }), (app.luogo || app.note) && (_jsxs("div", { className: "mt-2 pt-2 border-t border-slate-100 space-y-1", children: [app.luogo && (_jsxs("div", { className: "flex items-center gap-1 text-[11px] text-slate-600 truncate", children: [_jsx(MapPin, { className: "w-3 h-3 text-blue-500 shrink-0" }), _jsx("span", { className: "truncate", children: app.luogo })] })), app.note && (_jsx("div", { className: "text-[10px] text-slate-400 italic line-clamp-1", children: app.note }))] }))] }, app.id));
                                            }) })] }, day.iso))) }))] })] }), isAppModalOpen && (_jsx(AppointmentModal, { isOpen: isAppModalOpen, onClose: () => {
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
