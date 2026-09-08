import React, { useState } from 'react';
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
} from '../lib/accountAuth';
import { CongregazioneModal } from './CongregazioneModal';
import { WeeklyCalendarView } from './WeeklyCalendarView';

// Congregazioni Tab View
export const CongregazioniView: React.FC<{
  congregazioni: Congregazione[];
  onSaveCongregazioni: (data: Congregazione[]) => void;
  onOpenNewWeekWithCongregazione: (nome: string) => void;
}> = ({ congregazioni, onSaveCongregazioni, onOpenNewWeekWithCongregazione }) => {
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCong, setEditingCong] = useState<Congregazione | null>(null);

  const filtered = congregazioni.filter((c) => {
    if (filterUrgency === 'high') return c.settimaneTrascorse >= 12;
    if (filterUrgency === 'medium') return c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
    if (filterUrgency === 'low') return c.settimaneTrascorse < 6;
    return true;
  });

  const handleOpenNew = () => {
    setEditingCong(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Congregazione) => {
    setEditingCong(c);
    setIsModalOpen(true);
  };

  const handleSave = (saved: Congregazione) => {
    const idx = congregazioni.findIndex((c) => c.id === saved.id);
    if (idx >= 0) {
      const updated = [...congregazioni];
      updated[idx] = saved;
      onSaveCongregazioni(updated);
    } else {
      onSaveCongregazioni([...congregazioni, saved]);
    }
  };

  const handleDelete = (id: string) => {
    onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#2F3332] uppercase tracking-wider">
            Elenco Congregazioni della Circoscrizione
          </h2>
          <p className="text-xs text-[#7C8B82] mt-1">
            Gestisci e modifica i dettagli delle congregazioni o pianifica la prossima visita.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C8B82] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#68766E] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuova Congregazione</span>
          </button>

          <button
            onClick={() => setFilterUrgency('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
              filterUrgency === 'all'
                ? 'bg-[#7C8B82] text-white'
                : 'bg-white border border-[#E0DED9] text-[#2F3332]'
            }`}
          >
            Tutte ({congregazioni.length})
          </button>
          <button
            onClick={() => setFilterUrgency('high')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
              filterUrgency === 'high'
                ? 'bg-rose-700 text-white'
                : 'bg-white border border-[#E0DED9] text-rose-800'
            }`}
          >
            Urgenza alta (&gt;12 sett.)
          </button>
          <button
            onClick={() => setFilterUrgency('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
              filterUrgency === 'low'
                ? 'bg-[#5B6760] text-white'
                : 'bg-white border border-[#E0DED9] text-[#5B6760]'
            }`}
          >
            Recenti (&lt;6 sett.)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-4 flex flex-col justify-between hover:border-[#7C8B82] transition-colors group relative"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-[#2F3332] text-sm">{c.nome}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    c.settimaneTrascorse >= 12
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : c.settimaneTrascorse >= 6
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-[#EBF1ED] text-[#475E50] border border-[#D5E1D9]'
                  }`}
                >
                  {c.settimaneTrascorse} sett. fa
                </span>
              </div>
              <div className="text-xs text-[#666] space-y-1">
                <div>
                  Ultima visita: <strong className="text-[#2F3332]">{abbreviateMonths(c.ultimaVisita)}</strong>
                </div>
                {c.citta && (
                  <div>
                    Località: <span className="text-[#2F3332]">{c.citta}</span>
                  </div>
                )}
                {c.contatto && (
                  <div>
                    Referente: <span className="text-[#2F3332]">{c.contatto}</span>
                  </div>
                )}
                {c.note && <div className="text-[#888] italic text-[11px] mt-1">{c.note}</div>}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#EFECE6] flex items-center justify-between">
              <span className="text-[11px] text-[#888]">{c.totaleVisite} visite registrate</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-[#666] hover:text-[#2F3332] hover:bg-[#FAF9F7] border border-[#E0DED9] transition-colors cursor-pointer"
                  title="Modifica congregazione"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Eliminare la "${c.nome}"?`)) {
                      handleDelete(c.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-[#888] hover:text-rose-700 hover:bg-rose-50 border border-[#E0DED9] transition-colors cursor-pointer"
                  title="Elimina congregazione"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenNewWeekWithCongregazione(c.nome)}
                  className="text-xs font-bold text-[#5B6760] hover:text-[#2F3332] hover:underline cursor-pointer ml-1"
                >
                  Pianifica →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CongregazioneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCong(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        editingCongregazione={editingCong}
      />
    </div>
  );
};

// Situazione Visite Tab View (Formato Calendario Settimanale)
export const SituazioneVisiteView: React.FC<{
  congregazioni: Congregazione[];
  settimane: Settimana[];
  appuntamenti: Appuntamento[];
  onSaveAppuntamento: (app: Appuntamento) => void;
  onDeleteAppuntamento: (id: string) => void;
}> = ({
  congregazioni,
  settimane,
  appuntamenti,
  onSaveAppuntamento,
  onDeleteAppuntamento,
}) => {
  return (
    <WeeklyCalendarView
      settimane={settimane}
      congregazioni={congregazioni}
      appuntamenti={appuntamenti}
      onSaveAppuntamento={onSaveAppuntamento}
      onDeleteAppuntamento={onDeleteAppuntamento}
    />
  );
};

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
