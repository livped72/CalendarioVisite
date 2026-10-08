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

// Congregazioni Tab View - Layout a singola colonna per inserimento ed eliminazione
export const CongregazioniView: React.FC<{
  congregazioni: Congregazione[];
  onSaveCongregazioni: (data: Congregazione[]) => void;
  onOpenNewWeekWithCongregazione: (nome: string) => void;
}> = ({ congregazioni, onSaveCongregazioni }) => {
  const [newNome, setNewNome] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

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

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Sei sicuro di voler eliminare la congregazione "${nome}"?`)) {
      onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
    }
  };

  const visibleCongregazioni = congregazioni
    .filter((c) => c.nome.toLowerCase().includes(searchFilter.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Box Inserimento Nuova Congregazione */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E0DED9] shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-black text-[#2F3332] uppercase tracking-wider">
            Gestione Congregazioni
          </h2>
          <p className="text-xs text-[#7C8B82] mt-0.5">
            Inserisci nuove congregazioni o elimina quelle esistenti dalla circoscrizione.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#EFECE6]">
          <input
            type="text"
            value={newNome}
            onChange={(e) => setNewNome(e.target.value)}
            placeholder="Nome nuova congregazione (es. Salerno Fratte)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5D2CA] text-sm focus:outline-none focus:ring-2 focus:ring-[#7C8B82] bg-[#FAF9F7]"
          />
          <button
            type="submit"
            disabled={!newNome.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7C8B82] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#68766E] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Inserisci</span>
          </button>
        </form>
      </div>

      {/* Elenco Congregazioni su UNA SOLA COLONNA */}
      <div className="bg-white rounded-3xl border border-[#E0DED9] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E0DED9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F7]/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">
              Elenco Congregazioni
            </span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#EBF1ED] text-[#475E50]">
              {congregazioni.length}
            </span>
          </div>

          {congregazioni.length > 5 && (
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cerca congregazione..."
              className="px-3 py-1.5 rounded-lg border border-[#D5D2CA] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#7C8B82] w-full sm:w-56"
            />
          )}
        </div>

        {visibleCongregazioni.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#888]">
            {congregazioni.length === 0
              ? 'Nessuna congregazione presente. Inseriscine una dal modulo sopra.'
              : 'Nessuna congregazione corrisponde alla ricerca.'}
          </div>
        ) : (
          <div className="divide-y divide-[#EFECE6]">
            {visibleCongregazioni.map((c, index) => (
              <div
                key={c.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF9F7] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-[#FAF9F7] text-[#7C8B82] border border-[#E0DED9] text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-[#2F3332] truncate block">
                      {c.nome}
                    </span>
                    {c.citta && (
                      <span className="text-xs text-[#7C8B82] block truncate">
                        {c.citta}
                      </span>
                    )}
                  </div>
                </div>

                {/* Unica azione permessa: Elimina congregazione */}
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.nome)}
                  className="p-2 rounded-xl text-[#888] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer shrink-0"
                  title={`Elimina ${c.nome}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
}> = ({
  congregazioni,
  settimane,
  appuntamenti,
  onSaveAppuntamento,
  onDeleteAppuntamento,
  initialSettimanaId,
  onJumpConsumed,
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
    <div className="space-y-6 max-w-2xl text-[#2F3332]">
      <div>
        <h2 className="text-base font-bold text-[#2F3332] uppercase tracking-wider">
          Impostazioni Account &amp; Sincronizzazione
        </h2>
        <p className="text-xs text-[#7C8B82] mt-1">
          Gestisci il tuo profilo, la sicurezza della password e la sincronizzazione cloud.
        </p>
      </div>

      {/* Scheda Account Attivo */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#7C8B82]/20 text-[#5B6760] border border-[#7C8B82]/30 flex items-center justify-center font-bold text-base shadow-2xs">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#2F3332]">{account?.nome || user.nome}</h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Account Attivo
                </span>
              </div>
              <p className="text-xs text-[#777] font-mono mt-0.5">{account?.email || user.email}</p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span>Esci</span>
            </button>
          )}
        </div>
      </div>

      {/* Accesso Rapido Biometrico (Touch ID / Face ID) */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C8B82]/20 text-[#5B6760] flex items-center justify-center shrink-0">
              <Fingerprint size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">
                  Accesso Rapido Biometrico
                </h3>
                {bioEnrolled ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Attivo
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                    {bioSupported ? 'Disponibile' : 'Non rilevato'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#777] mt-0.5">
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

        <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] space-y-3">
          {bioEnrolled ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#666]">Stato sensore su questo dispositivo:</span>
                <span className="font-bold text-emerald-700">
                  Configurato per {bioUserLabel || account?.email || user.email}
                </span>
              </div>
              <p className="text-[11px] text-[#666] leading-relaxed">
                Alla schermata di accesso potrai utilizzare il pulsante rapido per entrare istantaneamente con l'impronta digitale o il volto.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestBiometrics}
                  disabled={bioLoading}
                  className="px-4 py-2 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Fingerprint size={15} />
                  <span>{bioLoading ? 'Scansione…' : 'Testa Riconoscimento'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisableBiometrics}
                  className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
                >
                  Disattiva su questo dispositivo
                </button>
              </div>
            </div>
          ) : bioSupported ? (
            <div className="space-y-3">
              <p className="text-[11px] text-[#666] leading-relaxed">
                Il tuo dispositivo dispone di un sensore biometrico compatibile (Touch ID, Face ID o Windows Hello). Puoi abilitare l'accesso rapido adesso con un solo tocco!
              </p>

              {showManualBioInput ? (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-[#2F3332]">
                    Inserisci la password del tuo account per confermare:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={manualBioPwd}
                      onChange={(e) => setManualBioPwd(e.target.value)}
                      placeholder="Password account..."
                      className="px-3 py-2 text-xs rounded-xl border border-[#D5D2CA] bg-white flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleEnableBiometrics(manualBioPwd)}
                      disabled={bioLoading || !manualBioPwd}
                      className="px-4 py-2 bg-[#7C8B82] hover:bg-[#68766E] text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50 cursor-pointer"
                    >
                      {bioLoading ? 'Configurazione…' : 'Conferma'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualBioInput(false)}
                      className="px-3 py-2 text-xs text-[#888] hover:text-[#2F3332] cursor-pointer"
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
                    className="px-4 py-2 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Fingerprint size={15} />
                    <span>{bioLoading ? 'Registrazione sensore…' : 'Attiva Face ID / Touch ID adesso'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-[#888] italic">
              Il browser o il dispositivo corrente non supporta l'autenticazione biometrica della piattaforma o il protocollo WebAuthn.
            </p>
          )}
        </div>
      </div>

      {/* Sincronizzazione Cloud Multi-Dispositivo */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C8B82]/20 text-[#5B6760] flex items-center justify-center shrink-0">
            <Cloud size={22} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">
              Sincronizzazione Automatica Multi-Dispositivo
            </h3>
            <p className="text-[11px] text-[#777] mt-0.5">
              I dati vengono sincronizzati con il tuo account usando la crittografia <strong>AES-256 (Zero-Knowledge)</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#666]">Stato sincronizzazione:</span>
            <span className="font-bold text-[#2F3332]">
              Ultimo salvataggio: {getAccountLastSyncTime()}
            </span>
          </div>

          <p className="text-[11px] text-[#666] leading-relaxed">
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
              className="px-4 py-2 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CloudUpload size={15} />
              <span>{isSyncSaving ? 'Invio in corso…' : 'Salva su Cloud'}</span>
            </button>

            <button
              type="button"
              onClick={handleManualPullSync}
              disabled={isSyncSaving}
              className="px-4 py-2 bg-white border border-[#E0DED9] hover:bg-[#FAF9F7] text-[#2F3332] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CloudDownload size={15} />
              <span>Scarica dal Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cambio Password Account */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-[#7C8B82]" />
            <h3 className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">
              Sicurezza &amp; Modifica Password
            </h3>
          </div>
          <button
            type="button"
            onClick={() => { setShowPwdForm(!showPwdForm); setPwdError(null); setPwdSuccess(false); }}
            className="text-xs font-bold text-[#5B6760] hover:text-[#2F3332] hover:underline cursor-pointer"
          >
            {showPwdForm ? 'Annulla' : 'Modifica Password'}
          </button>
        </div>

        {!showPwdForm && (
          <p className="text-xs text-[#888]">
            Puoi modificare la password del tuo account in qualsiasi momento. La nuova password verrà usata per ricifrare in sicurezza i dati del calendario.
          </p>
        )}

        {showPwdForm && (
          <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
            {pwdError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{pwdError}</div>
            )}
            {pwdSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password aggiornata e dati ricifrati con successo!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-[#2F3332] mb-1">
                Password Attuale
              </label>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:border-[#7C8B82] bg-[#FAF9F7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2F3332] mb-1">
                Nuova Password (min. 6 caratteri)
              </label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Almeno 6 caratteri"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:border-[#7C8B82] bg-[#FAF9F7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2F3332] mb-1">
                Conferma Nuova Password
              </label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Ripeti la nuova password"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:border-[#7C8B82] bg-[#FAF9F7]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-5 py-2 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {pwdLoading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />}
                Aggiorna Password
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Backup e Ripristino JSON su File */}
      <div className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#2F3332] uppercase tracking-wider">Copia di Sicurezza su File</h3>
        <p className="text-xs text-[#666]">
          Puoi scaricare una copia di sicurezza del calendario in formato JSON oppure ripristinare un backup locale.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportBackupJSON}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F3332] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E2421] transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Esporta Backup JSON</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E0DED9] text-[#2F3332] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF9F7] transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-4 h-4 text-[#7C8B82]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF9F7] border border-[#E0DED9] text-[#666] text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer"
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
    <div className="space-y-6 max-w-2xl text-[#2F3332]">
      <div>
        <h2 className="text-base font-bold text-[#2F3332] uppercase tracking-wider">
          Guida e Supporto Calendario Visite
        </h2>
        <p className="text-xs text-[#7C8B82] mt-1">
          Istruzioni sull'uso e sul funzionamento della pianificazione semestrale.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E0DED9] shadow-2xs">
          <h3 className="font-bold text-[#2F3332] text-xs uppercase tracking-wider mb-1">Come funziona la sincronizzazione con l'account?</h3>
          <p className="text-xs text-[#666] leading-relaxed">
            Ogni volta che aggiungi, modifichi o elimini una visita o congregazione, i tuoi dati vengono cifrati sul tuo browser con la tua password e sincronizzati automaticamente con il tuo account. Quando accedi da un altro dispositivo con la tua email e password, tutto il calendario viene scaricato e decifrato all'istante.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0DED9] shadow-2xs">
          <h3 className="font-bold text-[#2F3332] text-xs uppercase tracking-wider mb-1">I miei dati sono protetti?</h3>
          <p className="text-xs text-[#666] leading-relaxed">
            Sì, utilizziamo una crittografia End-to-End (AES-256-GCM). Solo chi è in possesso della tua password può decifrare e visualizzare il calendario.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0DED9] shadow-2xs">
          <h3 className="font-bold text-[#2F3332] text-xs uppercase tracking-wider mb-1">Come viene calcolato il numero della settimana?</h3>
          <p className="text-xs text-[#666] leading-relaxed">
            Il numero progressivo (1, 2, 3...) si applica <strong>esclusivamente alle visite alle congregazioni</strong>. Per tutti gli altri eventi (come settimana libera, settimana pioniere, assenze o assemblee), non viene assegnato il numero progressivo di visita.
          </p>
        </div>
      </div>
    </div>
  );
};
