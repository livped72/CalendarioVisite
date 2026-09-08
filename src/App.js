import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { isUserLoggedIn, getCurrentUser, logoutAccount, syncAccountData, pullAccountData, } from './lib/accountAuth';
import { getStoredSettimane, saveStoredSettimane, getStoredCongregazioni, saveStoredCongregazioni, getStoredAppuntamenti, saveStoredAppuntamenti, } from './lib/storage';
import { currentAnnoSemestre, nextPeriodo, prevPeriodo, } from './lib/periodoUtils';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WeekTable } from './components/WeekTable';
import { CongregationsPanel } from './components/CongregationsPanel';
import { WeekModal } from './components/WeekModal';
import { AllCongregationsModal } from './components/AllCongregationsModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CongregazioniView, SituazioneVisiteView, ImpostazioniView, AiutoView, } from './components/OtherViews';
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
    const [settimane, setSettimane] = useState([]);
    const [congregazioni, setCongregazioni] = useState([]);
    const [appuntamenti, setAppuntamenti] = useState([]);
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
    // ── If not logged in, display AuthScreen ──
    if (!isLoggedIn) {
        return _jsx(AuthScreen, { onSuccess: handleLoginSuccess });
    }
    return (_jsxs("div", { className: "min-h-screen flex bg-[#F7F6F2] text-[#2F3332] selection:bg-[#7C8B82] selection:text-white pb-16 lg:pb-0", children: [_jsx(Sidebar, { currentTab: currentTab, onSelectTab: setCurrentTab, user: user, isOpenMobile: isMobileMenuOpen, onCloseMobile: () => setIsMobileMenuOpen(false), onOpenSecurity: () => setIsSecurityOpen(true), onLogout: handleLogout }), _jsxs("main", { className: "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full", children: [_jsx(Header, { periodo: periodo, onPrev: () => setPeriodo((p) => prevPeriodo(p)), onNext: () => setPeriodo((p) => nextPeriodo(p)), onToday: () => setPeriodo(currentAnnoSemestre()), onNewWeek: () => { setEditingWeek(null); setIsWeekModalOpen(true); }, onOpenSecurity: () => setIsSecurityOpen(true), onOpenMobileMenu: () => setIsMobileMenuOpen(true), username: user.email || 'odglivio', isSyncing: isSyncing, isOnline: isOnline }), _jsxs("div", { className: "mt-5", children: [currentTab === 'calendario' && (_jsxs("div", { className: "space-y-6", children: [_jsx(WeekTable, { settimane: settimane, onEditWeek: (w) => { setEditingWeek(w); setIsWeekModalOpen(true); }, onDeleteWeek: handleDeleteWeek, onDuplicateWeek: handleDuplicateWeek }), _jsx(CongregationsPanel, { congregazioni: congregazioni, onViewAll: () => setIsAllCongregationsOpen(true), onSelectCongregazione: () => { setEditingWeek(null); setIsWeekModalOpen(true); } })] })), currentTab === 'congregazioni' && (_jsx(CongregazioniView, { congregazioni: congregazioni, onSaveCongregazioni: handleUpdateCongregazioni, onOpenNewWeekWithCongregazione: () => {
                                    setEditingWeek(null);
                                    setCurrentTab('calendario');
                                    setIsWeekModalOpen(true);
                                } })), currentTab === 'situazione' && (_jsx(SituazioneVisiteView, { congregazioni: congregazioni, settimane: settimane, appuntamenti: appuntamenti, onSaveAppuntamento: handleSaveAppuntamento, onDeleteAppuntamento: handleDeleteAppuntamento })), currentTab === 'impostazioni' && (_jsx(ImpostazioniView, { user: user, onUpdateUser: () => { }, onRefreshData: handleRefreshData, onOpenSecurity: () => setIsSecurityOpen(true), onLogout: handleLogout })), currentTab === 'aiuto' && _jsx(AiutoView, {})] })] }), _jsx(MobileBottomNav, { currentTab: currentTab, onSelectTab: setCurrentTab, onOpenMore: () => setIsMobileMenuOpen(true) }), _jsx(WeekModal, { isOpen: isWeekModalOpen, onClose: () => { setIsWeekModalOpen(false); setEditingWeek(null); }, onSave: handleSaveWeek, onDelete: handleDeleteWeek, editingWeek: editingWeek, congregazioni: congregazioni, periodo: periodo, settimane: settimane }), _jsx(AllCongregationsModal, { isOpen: isAllCongregationsOpen, onClose: () => setIsAllCongregationsOpen(false), congregazioni: congregazioni, onSaveCongregazioni: handleUpdateCongregazioni }), _jsx(SecurityPrivacyModal, { isOpen: isSecurityOpen, onClose: () => setIsSecurityOpen(false), onDataReset: handleRefreshData })] }));
};
export default App;
