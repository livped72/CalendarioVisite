import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnnoSemestre, TabNav, Settimana, Congregazione, UserProfile, Appuntamento } from './types';
import {
  isUserLoggedIn,
  getCurrentUser,
  logoutAccount,
  syncAccountData,
  pullAccountData,
} from './lib/accountAuth';
import {
  getStoredSettimane,
  saveStoredSettimane,
  getStoredCongregazioni,
  saveStoredCongregazioni,
  getStoredAppuntamenti,
  saveStoredAppuntamenti,
} from './lib/storage';
import {
  currentAnnoSemestre,
  nextPeriodo,
  prevPeriodo,
} from './lib/periodoUtils';

import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WeekTable } from './components/WeekTable';
import { CongregationsPanel } from './components/CongregationsPanel';
import { WeekModal } from './components/WeekModal';
import { AllCongregationsModal } from './components/AllCongregationsModal';
import { SecurityPrivacyModal } from './components/SecurityPrivacyModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  CongregazioniView,
  SituazioneVisiteView,
  ImpostazioniView,
  AiutoView,
} from './components/OtherViews';

export const App: React.FC = () => {
  // ── Account State ──
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isUserLoggedIn());
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // ── Period Navigation (Infinite Years) ──
  const [periodo, setPeriodo] = useState<AnnoSemestre>(currentAnnoSemestre);

  // ── Navigation ──
  const [currentTab, setCurrentTab] = useState<TabNav>('calendario');

  // ── User Profile for UI ──
  const user: UserProfile = {
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
  const [settimane, setSettimane] = useState<Settimana[]>([]);
  const [congregazioni, setCongregazioni] = useState<Congregazione[]>([]);
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);

  // ── Sync State ──
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setSettimane(getStoredSettimane(periodo.anno, periodo.semestre));
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
            setSettimane(getStoredSettimane(periodo.anno, periodo.semestre));
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
    if (!isLoggedIn) return;

    setIsSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await syncAccountData();
      } catch (e) {
        console.warn('Auto cloud sync failed:', e);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);
  }, [isLoggedIn]);

  // ── Data mutation helpers ──
  const handleUpdateSettimane = (newSettimane: Settimana[]) => {
    setSettimane(newSettimane);
    saveStoredSettimane(periodo.anno, periodo.semestre, newSettimane);
    scheduleAccountSync();
  };

  const handleUpdateCongregazioni = (newCong: Congregazione[]) => {
    setCongregazioni(newCong);
    saveStoredCongregazioni(newCong);
    scheduleAccountSync();
  };

  const handleUpdateAppuntamenti = (newApps: Appuntamento[]) => {
    setAppuntamenti(newApps);
    saveStoredAppuntamenti(newApps);
    scheduleAccountSync();
  };

  const handleSaveWeek = (saved: Settimana) => {
    const idx = settimane.findIndex((w) => w.id === saved.id);
    let updated: Settimana[];
    if (idx >= 0) {
      updated = [...settimane];
      updated[idx] = saved;
    } else {
      updated = [...settimane, saved];
    }
    handleUpdateSettimane(updated);
  };

  const handleDeleteWeek = (id: string) => {
    handleUpdateSettimane(settimane.filter((w) => w.id !== id));
  };

  const handleDuplicateWeek = (item: Settimana) => {
    const dup: Settimana = { ...item, id: `week_${Date.now()}` };
    handleUpdateSettimane([...settimane, dup]);
  };

  const handleSaveAppuntamento = (saved: Appuntamento) => {
    const idx = appuntamenti.findIndex((a) => a.id === saved.id);
    let updated: Appuntamento[];
    if (idx >= 0) {
      updated = [...appuntamenti];
      updated[idx] = saved;
    } else {
      updated = [...appuntamenti, saved];
    }
    handleUpdateAppuntamenti(updated);
  };

  const handleDeleteAppuntamento = (id: string) => {
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
  const [editingWeek, setEditingWeek] = useState<Settimana | null>(null);
  const [isAllCongregationsOpen, setIsAllCongregationsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── If not logged in, display AuthScreen ──
  if (!isLoggedIn) {
    return <AuthScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-[#F7F6F2] text-[#2F3332] selection:bg-[#7C8B82] selection:text-white pb-16 lg:pb-0">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Header
          periodo={periodo}
          onPrev={() => setPeriodo((p) => prevPeriodo(p))}
          onNext={() => setPeriodo((p) => nextPeriodo(p))}
          onToday={() => setPeriodo(currentAnnoSemestre())}
          onNewWeek={() => { setEditingWeek(null); setIsWeekModalOpen(true); }}
          onOpenSecurity={() => setIsSecurityOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          username={user.email || 'odglivio'}
          isSyncing={isSyncing}
          isOnline={isOnline}
        />

        <div className="mt-5">
          {currentTab === 'calendario' && (
            <div className="space-y-6">
              <WeekTable
                settimane={settimane}
                onEditWeek={(w) => { setEditingWeek(w); setIsWeekModalOpen(true); }}
                onDeleteWeek={handleDeleteWeek}
                onDuplicateWeek={handleDuplicateWeek}
              />
              <CongregationsPanel
                congregazioni={congregazioni}
                onViewAll={() => setIsAllCongregationsOpen(true)}
                onSelectCongregazione={() => { setEditingWeek(null); setIsWeekModalOpen(true); }}
              />
            </div>
          )}

          {currentTab === 'congregazioni' && (
            <CongregazioniView
              congregazioni={congregazioni}
              onSaveCongregazioni={handleUpdateCongregazioni}
              onOpenNewWeekWithCongregazione={() => {
                setEditingWeek(null);
                setCurrentTab('calendario');
                setIsWeekModalOpen(true);
              }}
            />
          )}

          {currentTab === 'situazione' && (
            <SituazioneVisiteView
              congregazioni={congregazioni}
              settimane={settimane}
              appuntamenti={appuntamenti}
              onSaveAppuntamento={handleSaveAppuntamento}
              onDeleteAppuntamento={handleDeleteAppuntamento}
            />
          )}

          {currentTab === 'impostazioni' && (
            <ImpostazioniView
              user={user}
              onUpdateUser={() => {}}
              onRefreshData={handleRefreshData}
              onOpenSecurity={() => setIsSecurityOpen(true)}
              onLogout={handleLogout}
            />
          )}

          {currentTab === 'aiuto' && <AiutoView />}
        </div>
      </main>

      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMore={() => setIsMobileMenuOpen(true)}
      />

      {/* Modals */}
      <WeekModal
        isOpen={isWeekModalOpen}
        onClose={() => { setIsWeekModalOpen(false); setEditingWeek(null); }}
        onSave={handleSaveWeek}
        onDelete={handleDeleteWeek}
        editingWeek={editingWeek}
        congregazioni={congregazioni}
        periodo={periodo}
      />

      <AllCongregationsModal
        isOpen={isAllCongregationsOpen}
        onClose={() => setIsAllCongregationsOpen(false)}
        congregazioni={congregazioni}
        onSaveCongregazioni={handleUpdateCongregazioni}
      />

      <SecurityPrivacyModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        onDataReset={handleRefreshData}
      />
    </div>
  );
};

export default App;
