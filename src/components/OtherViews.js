import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Download, Upload, RefreshCw, CheckCircle2, ShieldCheck, Cloud, CloudUpload, CloudDownload, Key, LogOut, Trash2, Plus, Fingerprint, } from 'lucide-react';
import { exportBackupJSON, importBackupJSON, resetToDefaults } from '../lib/storage';
import { getCurrentUser, changeAccountPassword, syncAccountData, pullAccountData, getAccountLastSyncTime, getSessionPassword, } from '../lib/accountAuth';
import { isBiometricsSupported, isBiometricsEnrolled, getBiometricUserLabel, enrollBiometrics, loginWithBiometrics, removeBiometrics, updateBiometricPassword, } from '../lib/biometrics';
import { WeeklyCalendarView } from './WeeklyCalendarView';
// Congregazioni Tab View - Layout a singola colonna per inserimento ed eliminazione
export const CongregazioniView = ({ congregazioni, onSaveCongregazioni }) => {
    const [newNome, setNewNome] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const handleAdd = (e) => {
        e.preventDefault();
        const trimmed = newNome.trim();
        if (!trimmed)
            return;
        // Controlla se esiste già
        if (congregazioni.some((c) => c.nome.toLowerCase() === trimmed.toLowerCase())) {
            alert(`La congregazione "${trimmed}" è già presente nell'elenco.`);
            return;
        }
        const nuova = {
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
    const handleDelete = (id, nome) => {
        if (confirm(`Sei sicuro di voler eliminare la congregazione "${nome}"?`)) {
            onSaveCongregazioni(congregazioni.filter((c) => c.id !== id));
        }
    };
    const visibleCongregazioni = congregazioni
        .filter((c) => c.nome.toLowerCase().includes(searchFilter.toLowerCase()))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    return (_jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [_jsxs("div", { className: "bg-[#0F1A30] p-5 sm:p-6 rounded-3xl border border-[#1E3A5F] shadow-lg space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-black text-white uppercase tracking-wider", children: "Gestione Congregazioni" }), _jsx("p", { className: "text-xs text-blue-300/80 mt-0.5", children: "Inserisci nuove congregazioni o elimina quelle esistenti dalla circoscrizione." })] }), _jsxs("form", { onSubmit: handleAdd, className: "flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#1E3A5F]", children: [_jsx("input", { type: "text", value: newNome, onChange: (e) => setNewNome(e.target.value), placeholder: "Nome nuova congregazione (es. Salerno Fratte)...", className: "flex-1 px-4 py-2.5 rounded-xl border border-[#1E3A5F] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#0B1426] text-white placeholder-slate-500" }), _jsxs("button", { type: "submit", disabled: !newNome.trim(), className: "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-950/50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Inserisci" })] })] })] }), _jsxs("div", { className: "bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-lg overflow-hidden", children: [_jsxs("div", { className: "p-4 sm:p-5 border-b border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#142342]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-bold text-blue-200 uppercase tracking-wider", children: "Elenco Congregazioni" }), _jsx("span", { className: "text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300", children: congregazioni.length })] }), congregazioni.length > 5 && (_jsx("input", { type: "text", value: searchFilter, onChange: (e) => setSearchFilter(e.target.value), placeholder: "Cerca congregazione...", className: "px-3 py-1.5 rounded-lg border border-[#1E3A5F] text-xs bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-56" }))] }), visibleCongregazioni.length === 0 ? (_jsx("div", { className: "p-8 text-center text-xs text-slate-400", children: congregazioni.length === 0
                            ? 'Nessuna congregazione presente. Inseriscine una dal modulo sopra.'
                            : 'Nessuna congregazione corrisponde alla ricerca.' })) : (_jsx("div", { className: "divide-y divide-[#172646]", children: visibleCongregazioni.map((c, index) => (_jsxs("div", { className: "p-4 flex items-center justify-between gap-3 hover:bg-[#162544] transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("span", { className: "w-7 h-7 rounded-lg bg-[#142342] text-blue-300 border border-[#1E3A5F] text-xs font-bold flex items-center justify-center shrink-0", children: index + 1 }), _jsxs("div", { className: "min-w-0", children: [_jsx("span", { className: "text-sm font-bold text-white truncate block", children: c.nome }), c.citta && (_jsx("span", { className: "text-xs text-slate-400 block truncate", children: c.citta }))] })] }), _jsx("button", { type: "button", onClick: () => handleDelete(c.id, c.nome), className: "p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer shrink-0", title: `Elimina ${c.nome}`, children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, c.id))) }))] })] }));
};
// Appuntamenti Tab View (Formato Calendario Settimanale)
export const AppuntamentiView = ({ congregazioni, settimane, appuntamenti, onSaveAppuntamento, onDeleteAppuntamento, initialSettimanaId, onJumpConsumed, }) => {
    return (_jsx(WeeklyCalendarView, { settimane: settimane, congregazioni: congregazioni, appuntamenti: appuntamenti, onSaveAppuntamento: onSaveAppuntamento, onDeleteAppuntamento: onDeleteAppuntamento, initialSettimanaId: initialSettimanaId, onJumpConsumed: onJumpConsumed }));
};
/** Alias di retrocompatibilità */
export const SituazioneVisiteView = AppuntamentiView;
// Impostazioni Tab View
export const ImpostazioniView = ({ user, onUpdateUser, onRefreshData, onOpenSecurity, onLogout }) => {
    const account = getCurrentUser();
    // Cloud Sync State
    const [isSyncSaving, setIsSyncSaving] = useState(false);
    const [syncStatusMsg, setSyncStatusMsg] = useState(null);
    const [isSyncSuccess, setIsSyncSuccess] = useState(true);
    // Biometrics State
    const [bioSupported, setBioSupported] = useState(false);
    const [bioEnrolled, setBioEnrolled] = useState(() => isBiometricsEnrolled());
    const [bioUserLabel, setBioUserLabel] = useState(() => getBiometricUserLabel());
    const [bioLoading, setBioLoading] = useState(false);
    const [bioMsg, setBioMsg] = useState(null);
    const [bioError, setBioError] = useState(null);
    const [manualBioPwd, setManualBioPwd] = useState('');
    const [showManualBioInput, setShowManualBioInput] = useState(false);
    useEffect(() => {
        isBiometricsSupported().then((supported) => {
            setBioSupported(supported);
            setBioEnrolled(isBiometricsEnrolled());
            setBioUserLabel(getBiometricUserLabel());
        });
    }, []);
    const handleEnableBiometrics = async (pwdToUse) => {
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
        }
        else {
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
        }
        else {
            setBioError(res.error || 'Test biometrico non superato.');
        }
    };
    // Password Change State
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState(null);
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
        }
        else {
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
        }
        else {
            setIsSyncSuccess(false);
            setSyncStatusMsg(res.error || 'Errore durante il recupero dei dati.');
        }
    };
    const handleChangePassword = async (e) => {
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
        }
        else {
            setPwdError(res.error || 'Errore durante il cambio password.');
        }
    };
    const handleFileImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const ok = await importBackupJSON(file);
        if (ok) {
            alert('Backup ripristinato con successo!');
            onRefreshData();
        }
        else {
            alert('File di backup non valido.');
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-2xl text-white", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-white uppercase tracking-wider", children: "Impostazioni Account & Sincronizzazione" }), _jsx("p", { className: "text-xs text-blue-300/80 mt-1", children: "Gestisci il tuo profilo, la sicurezza della password e la sincronizzazione cloud." })] }), _jsx("div", { className: "bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-6", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-blue-900/60 text-blue-300 border border-blue-500/50 flex items-center justify-center font-bold text-base shadow-sm", children: user.avatarInitials }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-bold text-sm text-white", children: account?.nome || user.nome }), _jsx("span", { className: "text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full", children: "Account Attivo" })] }), _jsx("p", { className: "text-xs text-slate-400 font-mono mt-0.5", children: account?.email || user.email })] })] }), onLogout && (_jsxs("button", { type: "button", onClick: onLogout, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/60 text-rose-400 bg-rose-950/40 hover:bg-rose-900/40 text-xs font-bold transition-colors cursor-pointer", children: [_jsx(LogOut, { size: 13 }), _jsx("span", { children: "Esci" })] }))] }) }), _jsxs("div", { className: "bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-6 space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center justify-center shrink-0", children: _jsx(Fingerprint, { size: 22 }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-xs font-bold text-white uppercase tracking-wider", children: "Accesso Rapido Biometrico" }), bioEnrolled ? (_jsxs("span", { className: "text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1", children: [_jsx(CheckCircle2, { size: 12, className: "text-emerald-400" }), " Attivo"] })) : (_jsx("span", { className: "text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full", children: bioSupported ? 'Disponibile' : 'Non rilevato' }))] }), _jsx("p", { className: "text-[11px] text-slate-400 mt-0.5", children: "Accedi istantaneamente con Face ID, Touch ID o Windows Hello senza digitare la password." })] })] }) }), bioMsg && (_jsxs("div", { className: "p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2", children: [_jsx(CheckCircle2, { size: 16, className: "text-emerald-400 shrink-0" }), _jsx("span", { children: bioMsg })] })), bioError && (_jsxs("div", { className: "p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2", children: [_jsx(ShieldCheck, { size: 16, className: "text-rose-400 shrink-0" }), _jsx("span", { children: bioError })] })), _jsx("div", { className: "p-4 bg-[#142342] rounded-xl border border-[#1E3A5F] space-y-3", children: bioEnrolled ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs", children: [_jsx("span", { className: "text-slate-300", children: "Stato sensore su questo dispositivo:" }), _jsxs("span", { className: "font-bold text-emerald-400", children: ["Configurato per ", bioUserLabel || account?.email || user.email] })] }), _jsx("p", { className: "text-[11px] text-slate-300 leading-relaxed", children: "Alla schermata di accesso potrai utilizzare il pulsante rapido per entrare istantaneamente con l'impronta digitale o il volto." }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-1", children: [_jsxs("button", { type: "button", onClick: handleTestBiometrics, disabled: bioLoading, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-blue-950/50 flex items-center gap-1.5", children: [_jsx(Fingerprint, { size: 15 }), _jsx("span", { children: bioLoading ? 'Scansione…' : 'Testa Riconoscimento' })] }), _jsx("button", { type: "button", onClick: handleDisableBiometrics, className: "px-4 py-2 bg-[#0B1426] border border-rose-900/60 hover:bg-rose-950/40 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs", children: "Disattiva su questo dispositivo" })] })] })) : bioSupported ? (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-[11px] text-slate-300 leading-relaxed", children: "Il tuo dispositivo dispone di un sensore biometrico compatibile (Touch ID, Face ID o Windows Hello). Puoi abilitare l'accesso rapido adesso con un solo tocco!" }), showManualBioInput ? (_jsxs("div", { className: "space-y-2 pt-1", children: [_jsx("label", { className: "block text-xs font-bold text-blue-200", children: "Inserisci la password del tuo account per confermare:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "password", value: manualBioPwd, onChange: (e) => setManualBioPwd(e.target.value), placeholder: "Password account...", className: "px-3 py-2 text-xs rounded-xl border border-[#1E3A5F] bg-[#0B1426] text-white flex-1" }), _jsx("button", { type: "button", onClick: () => handleEnableBiometrics(manualBioPwd), disabled: bioLoading || !manualBioPwd, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50 cursor-pointer shadow-md shadow-blue-950/50", children: bioLoading ? 'Configurazione…' : 'Conferma' }), _jsx("button", { type: "button", onClick: () => setShowManualBioInput(false), className: "px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer", children: "Annulla" })] })] })) : (_jsx("div", { className: "pt-1", children: _jsxs("button", { type: "button", onClick: () => handleEnableBiometrics(), disabled: bioLoading, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-blue-950/50 flex items-center gap-1.5", children: [_jsx(Fingerprint, { size: 15 }), _jsx("span", { children: bioLoading ? 'Registrazione sensore…' : 'Attiva Face ID / Touch ID adesso' })] }) }))] })) : (_jsx("p", { className: "text-[11px] text-slate-500 italic", children: "Il browser o il dispositivo corrente non supporta l'autenticazione biometrica della piattaforma o il protocollo WebAuthn." })) })] }), _jsxs("div", { className: "bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800 flex items-center justify-center shrink-0", children: _jsx(Cloud, { size: 22 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-bold text-white uppercase tracking-wider", children: "Sincronizzazione Automatica Multi-Dispositivo" }), _jsxs("p", { className: "text-[11px] text-slate-400 mt-0.5", children: ["I dati vengono sincronizzati con il tuo account usando la crittografia ", _jsx("strong", { children: "AES-256 (Zero-Knowledge)" }), "."] })] })] }), _jsxs("div", { className: "p-4 bg-[#142342] rounded-xl border border-[#1E3A5F] space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs", children: [_jsx("span", { className: "text-slate-300", children: "Stato sincronizzazione:" }), _jsxs("span", { className: "font-bold text-white", children: ["Ultimo salvataggio: ", getAccountLastSyncTime()] })] }), _jsxs("p", { className: "text-[11px] text-slate-300 leading-relaxed", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Come continuare il lavoro su un altro dispositivo:" }), " Apri Calendario Visite sullo smartphone, tablet o su un altro computer e clicca su ", _jsx("strong", { children: "Accedi" }), " inserendo la tua email (", _jsx("em", { children: account?.email }), ") e la tua password. Tutti i dati compariranno all'istante!"] }), syncStatusMsg && (_jsxs("div", { className: `p-3 rounded-xl border text-xs flex items-center gap-2 ${isSyncSuccess
                                    ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                                    : 'bg-rose-950/70 border-rose-800 text-rose-300'}`, children: [isSyncSuccess ? _jsx(CheckCircle2, { size: 16 }) : _jsx(ShieldCheck, { size: 16 }), _jsx("span", { children: syncStatusMsg })] })), _jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-1", children: [_jsxs("button", { type: "button", onClick: handleManualPushSync, disabled: isSyncSaving, className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-md shadow-blue-950/50 flex items-center gap-1.5", children: [_jsx(CloudUpload, { size: 15 }), _jsx("span", { children: isSyncSaving ? 'Invio in corso…' : 'Salva su Cloud' })] }), _jsxs("button", { type: "button", onClick: handleManualPullSync, disabled: isSyncSaving, className: "px-4 py-2 bg-[#0B1426] border border-[#1E3A5F] hover:bg-[#1A2C52] text-blue-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5", children: [_jsx(CloudDownload, { size: 15 }), _jsx("span", { children: "Scarica dal Cloud" })] })] })] })] }), _jsxs("div", { className: "bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-6 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Key, { size: 18, className: "text-blue-400" }), _jsx("h3", { className: "text-xs font-bold text-white uppercase tracking-wider", children: "Sicurezza & Modifica Password" })] }), _jsx("button", { type: "button", onClick: () => { setShowPwdForm(!showPwdForm); setPwdError(null); setPwdSuccess(false); }, className: "text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer", children: showPwdForm ? 'Annulla' : 'Modifica Password' })] }), !showPwdForm && (_jsx("p", { className: "text-xs text-slate-400", children: "Puoi modificare la password del tuo account in qualsiasi momento. La nuova password verr\u00E0 usata per ricifrare in sicurezza i dati del calendario." })), showPwdForm && (_jsxs("form", { onSubmit: handleChangePassword, className: "space-y-3 pt-2", children: [pwdError && (_jsx("div", { className: "p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs", children: pwdError })), pwdSuccess && (_jsxs("div", { className: "p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 font-medium", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-400" }), " Password aggiornata e dati ricifrati con successo!"] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-blue-200 mb-1", children: "Password Attuale" }), _jsx("input", { type: "password", value: currentPwd, onChange: (e) => setCurrentPwd(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, className: "w-full px-3 py-2 rounded-xl border border-[#1E3A5F] text-sm focus:border-blue-500 bg-[#0B1426] text-white placeholder-slate-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-blue-200 mb-1", children: "Nuova Password (min. 6 caratteri)" }), _jsx("input", { type: "password", value: newPwd, onChange: (e) => setNewPwd(e.target.value), placeholder: "Almeno 6 caratteri", required: true, minLength: 6, className: "w-full px-3 py-2 rounded-xl border border-[#1E3A5F] text-sm focus:border-blue-500 bg-[#0B1426] text-white placeholder-slate-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-blue-200 mb-1", children: "Conferma Nuova Password" }), _jsx("input", { type: "password", value: confirmPwd, onChange: (e) => setConfirmPwd(e.target.value), placeholder: "Ripeti la nuova password", required: true, className: "w-full px-3 py-2 rounded-xl border border-[#1E3A5F] text-sm focus:border-blue-500 bg-[#0B1426] text-white placeholder-slate-500" })] }), _jsx("div", { className: "flex justify-end pt-1", children: _jsxs("button", { type: "submit", disabled: pwdLoading, className: "px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-blue-950/50 flex items-center gap-1.5", children: [pwdLoading && _jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" }), "Aggiorna Password"] }) })] }))] }), _jsxs("div", { className: "bg-[#0F1A30] rounded-2xl border border-[#1E3A5F] shadow-lg p-6 space-y-4", children: [_jsx("h3", { className: "text-xs font-bold text-white uppercase tracking-wider", children: "Copia di Sicurezza su File" }), _jsx("p", { className: "text-xs text-slate-400", children: "Puoi scaricare una copia di sicurezza del calendario in formato JSON oppure ripristinare un backup locale." }), _jsxs("div", { className: "flex flex-wrap gap-3 pt-2", children: [_jsxs("button", { onClick: exportBackupJSON, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors shadow-md shadow-blue-950/50 cursor-pointer", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Esporta Backup JSON" })] }), _jsxs("label", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142342] border border-[#1E3A5F] text-blue-200 text-xs font-bold uppercase tracking-wider hover:bg-[#1A2C52] hover:text-white transition-colors shadow-2xs cursor-pointer", children: [_jsx(Upload, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Ripristina da File" }), _jsx("input", { type: "file", accept: ".json", onChange: handleFileImport, className: "sr-only" })] }), _jsxs("button", { onClick: () => {
                                    if (confirm('Vuoi davvero ripristinare i dati di esempio originali?')) {
                                        resetToDefaults();
                                        onRefreshData();
                                        alert('Dati ripristinati con successo!');
                                    }
                                }, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1426] border border-[#1E3A5F] text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-900/50 transition-colors shadow-2xs cursor-pointer", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Ripristina Dati Iniziali" })] })] })] })] }));
};
// Aiuto Tab View
export const AiutoView = () => {
    return (_jsxs("div", { className: "space-y-6 max-w-2xl text-white", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-white uppercase tracking-wider", children: "Guida e Supporto Calendario Visite" }), _jsx("p", { className: "text-xs text-blue-300/80 mt-1", children: "Istruzioni sull'uso e sul funzionamento della pianificazione semestrale." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-[#0F1A30] p-5 rounded-2xl border border-[#1E3A5F] shadow-lg", children: [_jsx("h3", { className: "font-bold text-white text-xs uppercase tracking-wider mb-1", children: "Come funziona la sincronizzazione con l'account?" }), _jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: "Ogni volta che aggiungi, modifichi o elimini una visita o congregazione, i tuoi dati vengono cifrati sul tuo browser con la tua password e sincronizzati automaticamente con il tuo account. Quando accedi da un altro dispositivo con la tua email e password, tutto il calendario viene scaricato e decifrato all'istante." })] }), _jsxs("div", { className: "bg-[#0F1A30] p-5 rounded-2xl border border-[#1E3A5F] shadow-lg", children: [_jsx("h3", { className: "font-bold text-white text-xs uppercase tracking-wider mb-1", children: "I miei dati sono protetti?" }), _jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: "S\u00EC, utilizziamo una crittografia End-to-End (AES-256-GCM). Solo chi \u00E8 in possesso della tua password pu\u00F2 decifrare e visualizzare il calendario." })] }), _jsxs("div", { className: "bg-[#0F1A30] p-5 rounded-2xl border border-[#1E3A5F] shadow-lg", children: [_jsx("h3", { className: "font-bold text-white text-xs uppercase tracking-wider mb-1", children: "Come viene calcolato il numero della settimana?" }), _jsxs("p", { className: "text-xs text-slate-300 leading-relaxed", children: ["Il numero progressivo (1, 2, 3...) si applica ", _jsx("strong", { children: "esclusivamente alle visite alle congregazioni" }), ". Per tutti gli altri eventi (come settimana libera, settimana pioniere, assenze o assemblee), non viene assegnato il numero progressivo di visita."] })] })] })] }));
};
