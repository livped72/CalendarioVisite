import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { isUserLoggedIn, getCurrentUser, logoutAccount, syncAccountData, pullAccountData, } from './lib/accountAuth';
import { getStoredSettimane, saveStoredSettimane, getAllStoredSettimane, getStoredCongregazioni, saveStoredCongregazioni, getStoredAppuntamenti, saveStoredAppuntamenti, } from './lib/storage';
import { currentAnnoSemestre, nextPeriodo, prevPeriodo, periodoKey, } from './lib/periodoUtils';
import { computeServiceYearVisitNumbers } from './lib/visitNumbering';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WeekTable } from './components/WeekTable';
import { WeekModal } from './components/WeekModal';
import { AllCongregationsModal } from './components/AllCongregationsModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SummaryCards } from './components/SummaryCards';
import { CongregazioniView, AppuntamentiView, ImpostazioniView, AiutoView, } from './components/OtherViews';
// ── KPI Statistics Helper ──
function computeKpiStats(settimane, congregazioni) {
    const total = settimane.length;
    const visiteCong = settimane.filter((w) => w.evento === 'congregazione');
    const congVisitate = new Set(visiteCong.map((w) => w.dettagli?.trim().toLowerCase()).filter(Boolean));
    // Average weeks between congregation visits
    const settimaneTrascorseList = congregazioni
        .filter((c) => c.settimaneTrascorse > 0)
        .map((c) => c.settimaneTrascorse);
    const mediaSettimane = settimaneTrascorseList.length > 0
        ? settimaneTrascorseList.reduce((a, b) => a + b, 0) / settimaneTrascorseList.length
        : 0;
    // Next future or current week
    const today = new Date().toISOString().slice(0, 10);
    const currentWeek = settimane.find((w) => w.startDate && w.endDate && today >= w.startDate && today <= w.endDate);
    const prossima = currentWeek ||
        [...settimane]
            .filter((w) => (w.endDate ? w.endDate >= today : Boolean(w.startDate && w.startDate >= today)))
            .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))[0] ||
        settimane[0];
    return {
        settimaneProgrammate: visiteCong.length,
        totaleSettimane: total,
        congregazioniVisitate: congVisitate.size,
        totaleCongregazioni: congregazioni.length,
        mediaSettimane,
        prossimaSettimana: {
            periodo: prossima?.periodo ?? 'Da pianificare',
            stato: prossima
                ? `${prossima.evento === 'congregazione' ? '📍 ' + prossima.dettagli : prossima.evento}`
                : 'Nessuna settimana pianificata →',
        },
    };
}
export const App = () => {
    // ── Account State ──
    const [isLoggedIn, setIsLoggedIn] = useState(() => isUserLoggedIn());
    const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
    // ── Period Navigation (Infinite Years) ──
    const [periodo, setPeriodo] = useState(currentAnnoSemestre);
    // ── Navigation ──
    const [currentTab, setCurrentTab] = useState('calendario');
    // ── User Profile for UI ──
    const user = {
        nome: currentUser?.nome || 'Livio Pedrini',
        email: currentUser?.email || 'odglivio',
        avatarInitials: (currentUser?.nome || 'LP')
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'LP',
    };
    // ── Data State ──
    const [allSettimaneMap, setAllSettimaneMap] = useState(() => getAllStoredSettimane());
    const [settimane, setSettimane] = useState([]);
    const [congregazioni, setCongregazioni] = useState([]);
    const [appuntamenti, setAppuntamenti] = useState([]);
    // ── Unified Service Year Visit Numbering ──
    const visitNumberMap = useMemo(() => computeServiceYearVisitNumbers(periodo.anno, allSettimaneMap), [periodo.anno, allSettimaneMap]);
    // ── Tutte le settimane di tutti i periodi (per banner S-302) ──
    const allSettimaneFlat = useMemo(() => Object.values(allSettimaneMap).flat(), [allSettimaneMap]);
    // ── Settimana attiva o prossima (per bacheca nella home) ──
    const activeOrNextSettimana = useMemo(() => {
        if (settimane.length === 0)
            return undefined;
        const today = new Date().toISOString().slice(0, 10);
        const current = settimane.find((w) => w.startDate && w.endDate && today >= w.startDate && today <= w.endDate);
        if (current)
            return current;
        const upcoming = [...settimane]
            .filter((w) => (w.endDate ? w.endDate >= today : Boolean(w.startDate && w.startDate >= today)))
            .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))[0];
        if (upcoming)
            return upcoming;
        return [...settimane].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))[0];
    }, [settimane]);
    // ── Sync State ──
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const syncTimeoutRef = useRef(null);
    // ── Online status tracking ──
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    // ── Load local data when period changes ──
    useEffect(() => {
        const raw = getStoredSettimane(periodo.anno, periodo.semestre);
        setSettimane([...raw].sort((a, b) => {
            if (a.startDate && b.startDate)
                return a.startDate.localeCompare(b.startDate);
            if (a.startDate)
                return -1;
            if (b.startDate)
                return 1;
            return 0;
        }));
    }, [periodo]);
    useEffect(() => {
        setCongregazioni(getStoredCongregazioni());
        setAppuntamenti(getStoredAppuntamenti());
    }, []);
    // ── On login success or initial load, pull latest from account cloud ──
    useEffect(() => {
        if (isLoggedIn && isOnline) {
            setIsSyncing(true);
            pullAccountData()
                .then((res) => {
                if (res.success) {
                    setAllSettimaneMap(getAllStoredSettimane());
                    const raw = getStoredSettimane(periodo.anno, periodo.semestre);
                    setSettimane([...raw].sort((a, b) => {
                        if (a.startDate && b.startDate)
                            return a.startDate.localeCompare(b.startDate);
                        if (a.startDate)
                            return -1;
                        if (b.startDate)
                            return 1;
                        return 0;
                    }));
                    setCongregazioni(getStoredCongregazioni());
                    setAppuntamenti(getStoredAppuntamenti());
                }
            })
                .finally(() => setIsSyncing(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);
    // ── Auto-sync with account cloud (debounced 2s) ──
    const scheduleAccountSync = useCallback(() => {
        if (!isLoggedIn)
            return;
        setIsSyncing(true);
        if (syncTimeoutRef.current)
            clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                await syncAccountData();
            }
            catch (e) {
                console.warn('Auto cloud sync failed:', e);
            }
            finally {
                setIsSyncing(false);
            }
        }, 2000);
    }, [isLoggedIn]);
    // ── Data mutation helpers ──
    const handleUpdateSettimane = (newSettimane) => {
        setSettimane(newSettimane);
        saveStoredSettimane(periodo.anno, periodo.semestre, newSettimane);
        const key = periodoKey(periodo.anno, periodo.semestre);
        setAllSettimaneMap((prev) => ({
            ...prev,
            [key]: newSettimane,
        }));
        scheduleAccountSync();
    };
    const handleUpdateCongregazioni = (newCong) => {
        setCongregazioni(newCong);
        saveStoredCongregazioni(newCong);
        scheduleAccountSync();
    };
    const handleUpdateAppuntamenti = (newApps) => {
        setAppuntamenti(newApps);
        saveStoredAppuntamenti(newApps);
        scheduleAccountSync();
    };
    const sortSettimane = (list) => [...list].sort((a, b) => {
        if (a.startDate && b.startDate)
            return a.startDate.localeCompare(b.startDate);
        if (a.startDate)
            return -1;
        if (b.startDate)
            return 1;
        return 0;
    });
    const handleSaveWeek = (saved) => {
        const idx = settimane.findIndex((w) => w.id === saved.id);
        let updated;
        if (idx >= 0) {
            updated = [...settimane];
            updated[idx] = saved;
        }
        else {
            updated = [...settimane, saved];
        }
        handleUpdateSettimane(sortSettimane(updated));
    };
    const handleDeleteWeek = (id) => {
        handleUpdateSettimane(settimane.filter((w) => w.id !== id));
    };
    const handleDuplicateWeek = (item) => {
        const dup = { ...item, id: `week_${Date.now()}` };
        handleUpdateSettimane(sortSettimane([...settimane, dup]));
    };
    const handleSaveAppuntamento = (saved) => {
        const idx = appuntamenti.findIndex((a) => a.id === saved.id);
        let updated;
        if (idx >= 0) {
            updated = [...appuntamenti];
            updated[idx] = saved;
        }
        else {
            updated = [...appuntamenti, saved];
        }
        handleUpdateAppuntamenti(updated);
    };
    const handleDeleteAppuntamento = (id) => {
        handleUpdateAppuntamenti(appuntamenti.filter((a) => a.id !== id));
    };
    const handleRefreshData = () => {
        setAllSettimaneMap(getAllStoredSettimane());
        setSettimane(getStoredSettimane(periodo.anno, periodo.semestre));
        setCongregazioni(getStoredCongregazioni());
        setAppuntamenti(getStoredAppuntamenti());
    };
    const handleLogout = () => {
        logoutAccount();
        setIsLoggedIn(false);
        setCurrentUser(null);
    };
    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setCurrentUser(getCurrentUser());
    };
    // ── Modal States ──
    const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
    const [editingWeek, setEditingWeek] = useState(null);
    const [isAllCongregationsOpen, setIsAllCongregationsOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    /** ID settimana su cui il calendario deve scrollare/selezionare dopo navigazione da congregazione */
    const [jumpToSettimanaId, setJumpToSettimanaId] = useState(null);
    const handleNavigateToSettimana = (settimanaId) => {
        setJumpToSettimanaId(settimanaId ?? null);
        setCurrentTab('appuntamenti');
    };
    // ── If not logged in, display AuthScreen ──
    if (!isLoggedIn) {
        return _jsx(AuthScreen, { onSuccess: handleLoginSuccess });
    }
    return (_jsxs("div", { className: "min-h-screen flex text-slate-800 selection:bg-blue-600 selection:text-white pb-24 lg:pb-8", children: [_jsx(Sidebar, { currentTab: currentTab, onSelectTab: setCurrentTab, user: user, isOpenMobile: isMobileMenuOpen, onCloseMobile: () => setIsMobileMenuOpen(false), onOpenSecurity: () => setIsSecurityOpen(true), onLogout: handleLogout }), _jsxs("main", { className: "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full", children: [_jsx(Header, { periodo: periodo, onPrev: () => setPeriodo((p) => prevPeriodo(p)), onNext: () => setPeriodo((p) => nextPeriodo(p)), onToday: () => setPeriodo(currentAnnoSemestre()), onNewWeek: () => { setEditingWeek(null); setIsWeekModalOpen(true); }, onOpenSecurity: () => setIsSecurityOpen(true), onOpenMobileMenu: () => setIsMobileMenuOpen(true), username: user.email || 'odglivio', isSyncing: isSyncing, isOnline: isOnline }), _jsxs("div", { className: "mt-5", children: [currentTab === 'calendario' && (_jsxs("div", { className: "space-y-5", children: [_jsx(SummaryCards, { stats: computeKpiStats(settimane, congregazioni), nextSettimana: activeOrNextSettimana, settimane: settimane, appuntamenti: appuntamenti, congregazioni: congregazioni, onPlanNextWeek: () => { setEditingWeek(null); setIsWeekModalOpen(true); }, onSaveAppuntamento: handleSaveAppuntamento, onDeleteAppuntamento: handleDeleteAppuntamento, onNavigateToAppuntamenti: handleNavigateToSettimana, senderName: user.nome }), _jsx(WeekTable, { settimane: settimane, onEditWeek: (w) => { setEditingWeek(w); setIsWeekModalOpen(true); }, onDeleteWeek: handleDeleteWeek, onDuplicateWeek: handleDuplicateWeek, visitNumberMap: visitNumberMap, onViewAppuntamenti: handleNavigateToSettimana, senderName: user.nome })] })), currentTab === 'congregazioni' && (_jsx(CongregazioniView, { congregazioni: congregazioni, onSaveCongregazioni: handleUpdateCongregazioni, onOpenNewWeekWithCongregazione: () => {
                                    setEditingWeek(null);
                                    setCurrentTab('calendario');
                                    setIsWeekModalOpen(true);
                                } })), (currentTab === 'appuntamenti' || currentTab === 'situazione') && (_jsx(AppuntamentiView, { congregazioni: congregazioni, settimane: settimane, appuntamenti: appuntamenti, onSaveAppuntamento: handleSaveAppuntamento, onDeleteAppuntamento: handleDeleteAppuntamento, initialSettimanaId: jumpToSettimanaId || undefined, onJumpConsumed: () => setJumpToSettimanaId(null) })), currentTab === 'impostazioni' && (_jsx(ImpostazioniView, { user: user, onUpdateUser: () => { }, onRefreshData: handleRefreshData, onOpenSecurity: () => setIsSecurityOpen(true), onLogout: handleLogout })), currentTab === 'aiuto' && _jsx(AiutoView, {})] })] }), _jsx(MobileBottomNav, { currentTab: currentTab, onSelectTab: setCurrentTab, onOpenMore: () => setIsMobileMenuOpen(true) }), _jsx(WeekModal, { isOpen: isWeekModalOpen, onClose: () => { setIsWeekModalOpen(false); setEditingWeek(null); }, onSave: handleSaveWeek, onDelete: handleDeleteWeek, editingWeek: editingWeek, congregazioni: congregazioni, periodo: periodo, settimane: settimane, allSettimaneMap: allSettimaneMap, senderName: user.nome }), _jsx(AllCongregationsModal, { isOpen: isAllCongregationsOpen, onClose: () => setIsAllCongregationsOpen(false), congregazioni: congregazioni, onSaveCongregazioni: handleUpdateCongregazioni }), _jsx(SecurityPrivacyModal, { isOpen: isSecurityOpen, onClose: () => setIsSecurityOpen(false), onDataReset: handleRefreshData })] }));
};
export default App;
