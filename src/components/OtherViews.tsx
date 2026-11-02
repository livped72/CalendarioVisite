import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Cloud,
  CloudUpload,
  CloudDownload,
  Key,
  User,
  LogOut,
  Pencil,
  Trash2,
  Plus,
  Fingerprint,
} from 'lucide-react';
import { Congregazione, Settimana, UserProfile, Appuntamento } from '../types';
import { exportBackupJSON, importBackupJSON, resetToDefaults } from '../lib/storage';
import { abbreviateMonths } from '../lib/dateUtils';
import {
  getCurrentUser,
  changeAccountPassword,
  syncAccountData,
  pullAccountData,
  getAccountLastSyncTime,
  logoutAccount,
  getSessionPassword,
} from '../lib/accountAuth';
import {
  isBiometricsSupported,
  isBiometricsEnrolled,
  getBiometricUserLabel,
  enrollBiometrics,
  loginWithBiometrics,
  removeBiometrics,
  updateBiometricPassword,
} from '../lib/biometrics';
import { CongregazioneModal } from './CongregazioneModal';
import { WeeklyCalendarView } from './WeeklyCalendarView';

// Congregazioni Tab View - Layout a singola colonna per inserimento, modifica ed eliminazione
export const CongregazioniView: React.FC<{
  congregazioni: Congregazione[];
  onSaveCongregazioni: (data: Congregazione[]) => void;
  onOpenNewWeekWithCongregazione: (nome: string) => void;
}> = ({ congregazioni, onSaveCongregazioni }) => {
  const [newNome, setNewNome] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [editingCongregazione, setEditingCongregazione] = useState<Congregazione | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNome.trim();
    if (!trimmed) return;

    // Controlla se esiste già
    if (congregazioni.some((c) => c.nome.toLowerCase() === trimmed.toLowerCase())) {
      alert(`La congregazione "${trimmed}" è già presente nell'elenco.`);
      return;
    }

    const nuova: Congregazione = {
      id: `c_${Date.now()}`,
      nome: trimmed,
      ultimaVisita: 'Da definire',
      ultimaVisitaDate: new Date().toISOString().slice(0, 10),
      settimaneTrascorse: 0,
      totaleVisite: 0,
    };

    onSaveCongregazioni([...congregazioni, nuova]);
    setNewNome('');
  };

  const handleEdit = (c: Congregazione) => {
    setEditingCongregazione(c);
    setIsModalOpen(true);
  };

  const handleSaveModal = (savedCong: Congregazione) => {
    const exists = congregazioni.some((c) => c.id === savedCong.id);
    if (exists) {
      onSaveCongregazioni(congregazioni.map((c) => (c.id === savedCong.id ? savedCong : c)));
    } else {
      onSaveCongregazioni([...congregazioni, savedCong]);
    }
    setIsModalOpen(false);
    setEditingCongregazione(null);
  };

  const handleDeleteModal = (id: string) => {
    onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
    setIsModalOpen(false);
    setEditingCongregazione(null);
  };

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Sei sicuro di voler eliminare la congregazione "${nome}"?`)) {
      onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
    }
  };

  const visibleCongregazioni = congregazioni
    .filter((c) => {
      const q = searchFilter.toLowerCase();
      return (
        c.nome.toLowerCase().includes(q) ||
        (c.citta && c.citta.toLowerCase().includes(q)) ||
        (c.contatto && c.contatto.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Box Inserimento Nuova Congregazione */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Gestione Congregazioni
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inserisci nuove congregazioni, modificale o eliminale dalla circoscrizione.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCongregazione(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Nuova con dettagli</span>
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
            placeholder="Nome nuova congregazione (es. Salerno Fratte)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 font-medium transition-all"
          />
          <button
            type="submit"
            disabled={!newNome.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Inserisci</span>
          </button>
        </form>
      </div>

      {/* Elenco Congregazioni su UNA SOLA COLONNA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Elenco Congregazioni
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700">
              {congregazioni.length}
            </span>
          </div>

          {congregazioni.length > 3 && (
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cerca per nome, città, contatto..."
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
            />
          )}
        </div>

        {visibleCongregazioni.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            {congregazioni.length === 0
              ? 'Nessuna congregazione presente. Inseriscine una dal modulo sopra.'
              : 'Nessuna congregazione corrisponde alla ricerca.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleCongregazioni.map((c, index) => (
              <div
                key={c.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => handleEdit(c)}
                  title={`Clicca per modificare ${c.nome}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-800 truncate block group-hover:text-blue-700 transition-colors">
                      {c.nome}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-500 truncate mt-0.5">
                      {c.citta && <span className="truncate">{c.citta}</span>}
                      {c.citta && c.contatto && <span>•</span>}
                      {c.contatto && <span className="truncate">{c.contatto}</span>}
                      {(c.citta || c.contatto) && c.ultimaVisita && c.ultimaVisita !== 'Da definire' && <span>•</span>}
                      {c.ultimaVisita && c.ultimaVisita !== 'Da definire' && (
                        <span className="text-[11px] text-slate-400 shrink-0">Ultima: {c.ultimaVisita}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Azioni: Modifica ed Elimina congregazione */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-200 transition-all cursor-pointer shrink-0 shadow-2xs"
                    title={`Modifica ${c.nome}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.nome)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer shrink-0"
                    title={`Elimina ${c.nome}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal di Modifica / Nuova Congregazione */}
      <CongregazioneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCongregazione(null);
        }}
        onSave={handleSaveModal}
        onDelete={handleDeleteModal}
        editingCongregazione={editingCongregazione}
      />
    </div>
  );
};

// Appuntamenti Tab View (Formato Calendario Settimanale)
export const AppuntamentiView: React.FC<{
  congregazioni: Congregazione[];
  settimane: Settimana[];
  appuntamenti: Appuntamento[];
  onSaveAppuntamento: (app: Appuntamento) => void;
  onDeleteAppuntamento: (id: string) => void;
  initialSettimanaId?: string;
  onJumpConsumed?: () => void;
  onGoToToday?: () => void;
  todayTrigger?: number;
}> = ({
  congregazioni,
  settimane,
  appuntamenti,
  onSaveAppuntamento,
  onDeleteAppuntamento,
  initialSettimanaId,
  onJumpConsumed,
  onGoToToday,
  todayTrigger,
}) => {
  return (
    <WeeklyCalendarView
      settimane={settimane}
      congregazioni={congregazioni}
      appuntamenti={appuntamenti}
      onSaveAppuntamento={onSaveAppuntamento}
      onDeleteAppuntamento={onDeleteAppuntamento}
      initialSettimanaId={initialSettimanaId}
      onJumpConsumed={onJumpConsumed}
      onGoToToday={onGoToToday}
      todayTrigger={todayTrigger}
    />
  );
};

/** Alias di retrocompatibilità */
export const SituazioneVisiteView = AppuntamentiView;


// Impostazioni Tab View
export const ImpostazioniView: React.FC<{
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onRefreshData: () => void;
  onOpenSecurity: () => void;
  onLogout?: () => void;
}> = ({ user, onUpdateUser, onRefreshData, onOpenSecurity, onLogout }) => {
  const account = getCurrentUser();

  // Cloud Sync State
  const [isSyncSaving, setIsSyncSaving] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isSyncSuccess, setIsSyncSuccess] = useState(true);

  // Biometrics State
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnrolled, setBioEnrolled] = useState(() => isBiometricsEnrolled());
  const [bioUserLabel, setBioUserLabel] = useState(() => getBiometricUserLabel());
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [manualBioPwd, setManualBioPwd] = useState('');
  const [showManualBioInput, setShowManualBioInput] = useState(false);

  useEffect(() => {
    isBiometricsSupported().then((supported) => {
      setBioSupported(supported);
      setBioEnrolled(isBiometricsEnrolled());
      setBioUserLabel(getBiometricUserLabel());
    });
  }, []);

  const handleEnableBiometrics = async (pwdToUse?: string) => {
    setBioError(null);
    setBioMsg(null);
    const pwd = pwdToUse || getSessionPassword() || manualBioPwd;
    if (!pwd) {
      setShowManualBioInput(true);
      return;
    }

    setBioLoading(true);
    const res = await enrollBiometrics(account?.email || user.email, pwd, account?.nome || user.nome);
    setBioLoading(false);

    if (res.success) {
      setBioEnrolled(true);
      setBioUserLabel(account?.email || user.email);
      setBioMsg('Accesso biometrico configurato con successo su questo dispositivo!');
      setShowManualBioInput(false);
      setManualBioPwd('');
    } else {
      setBioError(res.error || 'Impossibile configurare l\'accesso biometrico.');
    }
  };

  const handleDisableBiometrics = () => {
    removeBiometrics();
    setBioEnrolled(false);
    setBioUserLabel('');
    setBioMsg('Accesso biometrico rimosso da questo dispositivo.');
    setBioError(null);
  };

  const handleTestBiometrics = async () => {
    setBioError(null);
    setBioMsg(null);
    setBioLoading(true);
    const res = await loginWithBiometrics();
    setBioLoading(false);
    if (res.success) {
      setBioMsg('Riconoscimento biometrico verificato con successo!');
    } else {
      setBioError(res.error || 'Test biometrico non superato.');
    }
  };

  // Password Change State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);

  const handleManualPushSync = async () => {
    setIsSyncSaving(true);
    setSyncStatusMsg(null);
    const res = await syncAccountData();
    setIsSyncSaving(false);
    if (res.success) {
      setIsSyncSuccess(true);
      setSyncStatusMsg('Dati sincronizzati con il tuo account sul cloud!');
    } else {
      setIsSyncSuccess(false);
      setSyncStatusMsg(res.error || 'Errore durante la sincronizzazione.');
    }
  };

  const handleManualPullSync = async () => {
    setIsSyncSaving(true);
    setSyncStatusMsg(null);
    const res = await pullAccountData();
    setIsSyncSaving(false);
    if (res.success) {
      setIsSyncSuccess(true);
      setSyncStatusMsg('Dati più recenti scaricati dal tuo account!');
      onRefreshData();
    } else {
      setIsSyncSuccess(false);
      setSyncStatusMsg(res.error || 'Errore durante il recupero dei dati.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (newPwd !== confirmPwd) {
      setPwdError('Le nuove password non corrispondono.');
      return;
    }
    if (newPwd.length < 6) {
      setPwdError('La nuova password deve avere almeno 6 caratteri.');
      return;
    }

    setPwdLoading(true);
    const res = await changeAccountPassword(currentPwd, newPwd);
    setPwdLoading(false);

    if (res.success) {
      if (isBiometricsEnrolled()) {
        updateBiometricPassword(newPwd);
      }
      setPwdSuccess(true);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => {
        setPwdSuccess(false);
        setShowPwdForm(false);
      }, 2500);
    } else {
      setPwdError(res.error || 'Errore durante il cambio password.');
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await importBackupJSON(file);
    if (ok) {
      alert('Backup ripristinato con successo!');
      onRefreshData();
    } else {
      alert('File di backup non valido.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl text-slate-800">
      <div>
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
          Impostazioni Account &amp; Sincronizzazione
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Gestisci il tuo profilo, la sicurezza della password e la sincronizzazione cloud.
        </p>
      </div>

      {/* Scheda Account Attivo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-base shadow-xs">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{account?.nome || user.nome}</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Account Attivo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{account?.email || user.email}</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Esci</span>
            </button>
          )}
        </div>
      </div>

      {/* Accesso Rapido Biometrico (Touch ID / Face ID) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Fingerprint size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Accesso Rapido Biometrico
                </h3>
                {bioEnrolled ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Attivo
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    {bioSupported ? 'Disponibile' : 'Non rilevato'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Accedi istantaneamente con Face ID, Touch ID o Windows Hello senza digitare la password.
              </p>
            </div>
          </div>
        </div>

        {bioMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{bioMsg}</span>
          </div>
        )}

        {bioError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <ShieldCheck size={16} className="text-rose-600 shrink-0" />
            <span>{bioError}</span>
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          {bioEnrolled ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600">Stato sensore su questo dispositivo:</span>
                <span className="font-bold text-emerald-700">
                  Configurato per {bioUserLabel || account?.email || user.email}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Alla schermata di accesso potrai utilizzare il pulsante rapido per entrare istantaneamente con l'impronta digitale o il volto.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestBiometrics}
                  disabled={bioLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Fingerprint size={15} />
                  <span>{bioLoading ? 'Scansione…' : 'Testa Riconoscimento'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisableBiometrics}
                  className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
                >
                  Disattiva su questo dispositivo
                </button>
              </div>
            </div>
          ) : bioSupported ? (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Il tuo dispositivo dispone di un sensore biometrico compatibile (Touch ID, Face ID o Windows Hello). Puoi abilitare l'accesso rapido adesso con un solo tocco!
              </p>

              {showManualBioInput ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Inserisci la password del tuo account per confermare:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={manualBioPwd}
                      onChange={(e) => setManualBioPwd(e.target.value)}
                      placeholder="Password account..."
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnableBiometrics(manualBioPwd)}
                      disabled={bioLoading || !manualBioPwd}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-500/20"
                    >
                      {bioLoading ? 'Configurazione…' : 'Conferma'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualBioInput(false)}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleEnableBiometrics()}
                    disabled={bioLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    <Fingerprint size={15} />
                    <span>{bioLoading ? 'Registrazione sensore…' : 'Attiva Face ID / Touch ID adesso'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Il browser o il dispositivo corrente non supporta l'autenticazione biometrica della piattaforma o il protocollo WebAuthn.
            </p>
          )}
        </div>
      </div>

      {/* Sincronizzazione Cloud Multi-Dispositivo */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Cloud size={22} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sincronizzazione Automatica Multi-Dispositivo
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              I dati vengono sincronizzati con il tuo account usando la crittografia <strong>AES-256 (Zero-Knowledge)</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600">Stato sincronizzazione:</span>
            <span className="font-bold text-slate-900">
              Ultimo salvataggio: {getAccountLastSyncTime()}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            💡 <strong>Come continuare il lavoro su un altro dispositivo:</strong> Apri Calendario Visite sullo smartphone, tablet o su un altro computer e clicca su <strong>Accedi</strong> inserendo la tua email (<em>{account?.email}</em>) e la tua password. Tutti i dati compariranno all'istante!
          </p>

          {syncStatusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isSyncSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {isSyncSuccess ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
              <span>{syncStatusMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleManualPushSync}
              disabled={isSyncSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
            >
              <CloudUpload size={15} />
              <span>{isSyncSaving ? 'Invio in corso…' : 'Salva su Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleManualPullSync}
              disabled={isSyncSaving}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CloudDownload size={15} />
              <span>Scarica dal Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cambio Password Account */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sicurezza &amp; Modifica Password
            </h3>
          </div>
          <button
            type="button"
            onClick={() => { setShowPwdForm(!showPwdForm); setPwdError(null); setPwdSuccess(false); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {showPwdForm ? 'Annulla' : 'Modifica Password'}
          </button>
        </div>

        {!showPwdForm && (
          <p className="text-xs text-slate-500">
            Puoi modificare la password del tuo account in qualsiasi momento. La nuova password verrà usata per ricifrare in sicurezza i dati del calendario.
          </p>
        )}

        {showPwdForm && (
          <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
            {pwdError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{pwdError}</div>
            )}
            {pwdSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password aggiornata e dati ricifrati con successo!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Password Attuale
              </label>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nuova Password (min. 6 caratteri)
              </label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Almeno 6 caratteri"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Conferma Nuova Password
              </label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Ripeti la nuova password"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
              >
                {pwdLoading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />}
                Aggiorna Password
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Backup e Ripristino JSON su File */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Copia di Sicurezza su File</h3>
        <p className="text-xs text-slate-500">
          Puoi scaricare una copia di sicurezza del calendario in formato JSON oppure ripristinare un backup locale.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportBackupJSON}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Esporta Backup JSON</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Ripristina da File</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="sr-only" />
          </label>

          <button
            onClick={() => {
              if (confirm('Vuoi davvero ripristinare i dati di esempio originali?')) {
                resetToDefaults();
                onRefreshData();
                alert('Dati ripristinati con successo!');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-wider hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Ripristina Dati Iniziali</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Aiuto Tab View
export const AiutoView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl text-slate-800">
      <div>
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
          Guida e Supporto Calendario Visite
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Istruzioni sull'uso e sul funzionamento della pianificazione semestrale.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Come funziona la sincronizzazione con l'account?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ogni volta che aggiungi, modifichi o elimini una visita o congregazione, i tuoi dati vengono cifrati sul tuo browser con la tua password e sincronizzati automaticamente con il tuo account. Quando accedi da un altro dispositivo con la tua email e password, tutto il calendario viene scaricato e decifrato all'istante.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">I miei dati sono protetti?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sì, utilizziamo una crittografia End-to-End (AES-256-GCM). Solo chi è in possesso della tua password può decifrare e visualizzare il calendario.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Come viene calcolato il numero della settimana?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Il numero progressivo (1, 2, 3...) si applica <strong>esclusivamente alle visite alle congregazioni</strong>. Per tutti gli altri eventi (come settimana libera, settimana pioniere, assenze o assemblee), non viene assegnato il numero progressivo di visita.
          </p>
        </div>
      </div>
    </div>
  );
};
