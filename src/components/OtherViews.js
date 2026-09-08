import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Download, Upload, RefreshCw, CheckCircle2, ShieldCheck, Cloud, CloudUpload, CloudDownload, Key, LogOut, } from 'lucide-react';
import { exportBackupJSON, importBackupJSON, resetToDefaults } from '../lib/storage';
import { abbreviateMonths } from '../lib/dateUtils';
import { getCurrentUser, changeAccountPassword, syncAccountData, pullAccountData, getAccountLastSyncTime, } from '../lib/accountAuth';
// Congregazioni Tab View
export const CongregazioniView = ({ congregazioni, onOpenNewWeekWithCongregazione }) => {
    const [filterUrgency, setFilterUrgency] = useState('all');
    const filtered = congregazioni.filter((c) => {
        if (filterUrgency === 'high')
            return c.settimaneTrascorse >= 12;
        if (filterUrgency === 'medium')
            return c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
        if (filterUrgency === 'low')
            return c.settimaneTrascorse < 6;
        return true;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-[#2F3332] uppercase tracking-wider", children: "Elenco Congregazioni della Circoscrizione" }), _jsx("p", { className: "text-xs text-[#7C8B82] mt-1", children: "Gestisci i dettagli delle congregazioni e pianifica la prossima visita." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setFilterUrgency('all'), className: `px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${filterUrgency === 'all'
                                    ? 'bg-[#7C8B82] text-white'
                                    : 'bg-white border border-[#E0DED9] text-[#2F3332]'}`, children: ["Tutte (", congregazioni.length, ")"] }), _jsx("button", { onClick: () => setFilterUrgency('high'), className: `px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${filterUrgency === 'high'
                                    ? 'bg-rose-700 text-white'
                                    : 'bg-white border border-[#E0DED9] text-rose-800'}`, children: "Urgenza alta (>12 sett.)" }), _jsx("button", { onClick: () => setFilterUrgency('low'), className: `px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${filterUrgency === 'low'
                                    ? 'bg-[#5B6760] text-white'
                                    : 'bg-white border border-[#E0DED9] text-[#5B6760]'}`, children: "Recenti (<6 sett.)" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: filtered.map((c) => (_jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-4 flex flex-col justify-between hover:border-[#7C8B82] transition-colors", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between gap-2 mb-2", children: [_jsx("span", { className: "font-bold text-[#2F3332] text-sm", children: c.nome }), _jsxs("span", { className: `text-[11px] font-bold px-2 py-0.5 rounded-full ${c.settimaneTrascorse >= 12
                                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                : c.settimaneTrascorse >= 6
                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                    : 'bg-[#EBF1ED] text-[#475E50] border border-[#D5E1D9]'}`, children: [c.settimaneTrascorse, " sett. fa"] })] }), _jsxs("div", { className: "text-xs text-[#666] space-y-1", children: [_jsxs("div", { children: ["Ultima visita: ", _jsx("strong", { className: "text-[#2F3332]", children: abbreviateMonths(c.ultimaVisita) })] }), c.citta && (_jsxs("div", { children: ["Localit\u00E0: ", _jsx("span", { className: "text-[#2F3332]", children: c.citta })] })), c.contatto && (_jsxs("div", { children: ["Referente: ", _jsx("span", { className: "text-[#2F3332]", children: c.contatto })] })), c.note && _jsx("div", { className: "text-[#888] italic text-[11px] mt-1", children: c.note })] })] }), _jsxs("div", { className: "pt-3 mt-3 border-t border-[#EFECE6] flex items-center justify-between", children: [_jsxs("span", { className: "text-[11px] text-[#888]", children: [c.totaleVisite, " visite registrate"] }), _jsx("button", { onClick: () => onOpenNewWeekWithCongregazione(c.nome), className: "text-xs font-bold text-[#5B6760] hover:text-[#2F3332] hover:underline cursor-pointer", children: "Pianifica visita \u2192" })] })] }, c.id))) })] }));
};
// Situazione Visite Tab View
export const SituazioneVisiteView = ({ congregazioni }) => {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-[#2F3332] uppercase tracking-wider", children: "Situazione e Copertura Visite" }), _jsx("p", { className: "text-xs text-[#7C8B82] mt-1", children: "Quadro sinottico del completamento delle visite per ciascuna congregazione." })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-[#E0DED9] bg-[#FAF9F7] font-bold text-xs text-[#2F3332] uppercase tracking-wider grid grid-cols-12 gap-2", children: [_jsx("div", { className: "col-span-4", children: "Congregazione" }), _jsx("div", { className: "col-span-3", children: "Ultima Visita" }), _jsx("div", { className: "col-span-3", children: "Tempo Trascorso" }), _jsx("div", { className: "col-span-2 text-right", children: "Stato" })] }), _jsx("div", { className: "divide-y divide-[#EFECE6]", children: congregazioni.map((c) => {
                            const isCritical = c.settimaneTrascorse >= 12;
                            const isMedium = c.settimaneTrascorse >= 6 && c.settimaneTrascorse < 12;
                            return (_jsxs("div", { className: "p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-[#FAF9F7]", children: [_jsx("div", { className: "col-span-4 font-bold text-[#2F3332]", children: c.nome }), _jsx("div", { className: "col-span-3 text-[#555]", children: abbreviateMonths(c.ultimaVisita) }), _jsx("div", { className: "col-span-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-[#2F3332]", children: [c.settimaneTrascorse, " sett."] }), _jsx("div", { className: "w-16 bg-[#E0DED9] h-1.5 rounded-full overflow-hidden hidden sm:block", children: _jsx("div", { className: `h-full ${isCritical ? 'bg-rose-600' : isMedium ? 'bg-amber-600' : 'bg-[#7C8B82]'}`, style: { width: `${Math.min(100, (c.settimaneTrascorse / 20) * 100)}%` } }) })] }) }), _jsx("div", { className: "col-span-2 text-right", children: _jsx("span", { className: `inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCritical
                                                ? 'bg-rose-100 text-rose-800'
                                                : isMedium
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-[#EBF1ED] text-[#475E50]'}`, children: isCritical ? 'Urgente' : isMedium ? 'In attesa' : 'Regolare' }) })] }, c.id));
                        }) })] })] }));
};
// Impostazioni Tab View
export const ImpostazioniView = ({ user, onUpdateUser, onRefreshData, onOpenSecurity, onLogout }) => {
    const account = getCurrentUser();
    // Cloud Sync State
    const [isSyncSaving, setIsSyncSaving] = useState(false);
    const [syncStatusMsg, setSyncStatusMsg] = useState(null);
    const [isSyncSuccess, setIsSyncSuccess] = useState(true);
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
    return (_jsxs("div", { className: "space-y-6 max-w-2xl text-[#2F3332]", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-[#2F3332] uppercase tracking-wider", children: "Impostazioni Account & Sincronizzazione" }), _jsx("p", { className: "text-xs text-[#7C8B82] mt-1", children: "Gestisci il tuo profilo, la sicurezza della password e la sincronizzazione cloud." })] }), _jsx("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-[#7C8B82]/20 text-[#5B6760] border border-[#7C8B82]/30 flex items-center justify-center font-bold text-base shadow-2xs", children: user.avatarInitials }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-bold text-sm text-[#2F3332]", children: account?.nome || user.nome }), _jsx("span", { className: "text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full", children: "Account Attivo" })] }), _jsx("p", { className: "text-xs text-[#777] font-mono mt-0.5", children: account?.email || user.email })] })] }), onLogout && (_jsxs("button", { type: "button", onClick: onLogout, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer", children: [_jsx(LogOut, { size: 13 }), _jsx("span", { children: "Esci" })] }))] }) }), _jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-[#7C8B82]/20 text-[#5B6760] flex items-center justify-center shrink-0", children: _jsx(Cloud, { size: 22 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs font-bold text-[#2F3332] uppercase tracking-wider", children: "Sincronizzazione Automatica Multi-Dispositivo" }), _jsxs("p", { className: "text-[11px] text-[#777] mt-0.5", children: ["I dati vengono sincronizzati con il tuo account usando la crittografia ", _jsx("strong", { children: "AES-256 (Zero-Knowledge)" }), "."] })] })] }), _jsxs("div", { className: "p-4 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs", children: [_jsx("span", { className: "text-[#666]", children: "Stato sincronizzazione:" }), _jsxs("span", { className: "font-bold text-[#2F3332]", children: ["Ultimo salvataggio: ", getAccountLastSyncTime()] })] }), _jsxs("p", { className: "text-[11px] text-[#666] leading-relaxed", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Come continuare il lavoro su un altro dispositivo:" }), " Apri Calendario Visite sullo smartphone, tablet o su un altro computer e clicca su ", _jsx("strong", { children: "Accedi" }), " inserendo la tua email (", _jsx("em", { children: account?.email }), ") e la tua password. Tutti i dati compariranno all'istante!"] }), syncStatusMsg && (_jsxs("div", { className: `p-3 rounded-xl border text-xs flex items-center gap-2 ${isSyncSuccess
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border-rose-200 text-rose-800'}`, children: [isSyncSuccess ? _jsx(CheckCircle2, { size: 16 }) : _jsx(ShieldCheck, { size: 16 }), _jsx("span", { children: syncStatusMsg })] })), _jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-1", children: [_jsxs("button", { type: "button", onClick: handleManualPushSync, disabled: isSyncSaving, className: "px-4 py-2 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5", children: [_jsx(CloudUpload, { size: 15 }), _jsx("span", { children: isSyncSaving ? 'Invio in corso…' : 'Salva su Cloud' })] }), _jsxs("button", { type: "button", onClick: handleManualPullSync, disabled: isSyncSaving, className: "px-4 py-2 bg-white border border-[#E0DED9] hover:bg-[#FAF9F7] text-[#2F3332] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5", children: [_jsx(CloudDownload, { size: 15 }), _jsx("span", { children: "Scarica dal Cloud" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Key, { size: 18, className: "text-[#7C8B82]" }), _jsx("h3", { className: "text-xs font-bold text-[#2F3332] uppercase tracking-wider", children: "Sicurezza & Modifica Password" })] }), _jsx("button", { type: "button", onClick: () => { setShowPwdForm(!showPwdForm); setPwdError(null); setPwdSuccess(false); }, className: "text-xs font-bold text-[#5B6760] hover:text-[#2F3332] hover:underline cursor-pointer", children: showPwdForm ? 'Annulla' : 'Modifica Password' })] }), !showPwdForm && (_jsx("p", { className: "text-xs text-[#888]", children: "Puoi modificare la password del tuo account in qualsiasi momento. La nuova password verr\u00E0 usata per ricifrare in sicurezza i dati del calendario." })), showPwdForm && (_jsxs("form", { onSubmit: handleChangePassword, className: "space-y-3 pt-2", children: [pwdError && (_jsx("div", { className: "p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs", children: pwdError })), pwdSuccess && (_jsxs("div", { className: "p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5 font-medium", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-600" }), " Password aggiornata e dati ricifrati con successo!"] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-[#2F3332] mb-1", children: "Password Attuale" }), _jsx("input", { type: "password", value: currentPwd, onChange: (e) => setCurrentPwd(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:border-[#7C8B82] bg-[#FAF9F7]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-[#2F3332] mb-1", children: "Nuova Password (min. 6 caratteri)" }), _jsx("input", { type: "password", value: newPwd, onChange: (e) => setNewPwd(e.target.value), placeholder: "Almeno 6 caratteri", required: true, minLength: 6, className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:border-[#7C8B82] bg-[#FAF9F7]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-[#2F3332] mb-1", children: "Conferma Nuova Password" }), _jsx("input", { type: "password", value: confirmPwd, onChange: (e) => setConfirmPwd(e.target.value), placeholder: "Ripeti la nuova password", required: true, className: "w-full px-3 py-2 rounded-xl border border-[#E0DED9] text-sm focus:border-[#7C8B82] bg-[#FAF9F7]" })] }), _jsx("div", { className: "flex justify-end pt-1", children: _jsxs("button", { type: "submit", disabled: pwdLoading, className: "px-5 py-2 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5", children: [pwdLoading && _jsx("span", { className: "w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" }), "Aggiorna Password"] }) })] }))] }), _jsxs("div", { className: "bg-white rounded-2xl border border-[#E0DED9] shadow-2xs p-6 space-y-4", children: [_jsx("h3", { className: "text-xs font-bold text-[#2F3332] uppercase tracking-wider", children: "Copia di Sicurezza su File" }), _jsx("p", { className: "text-xs text-[#666]", children: "Puoi scaricare una copia di sicurezza del calendario in formato JSON oppure ripristinare un backup locale." }), _jsxs("div", { className: "flex flex-wrap gap-3 pt-2", children: [_jsxs("button", { onClick: exportBackupJSON, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F3332] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E2421] transition-colors shadow-2xs cursor-pointer", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Esporta Backup JSON" })] }), _jsxs("label", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E0DED9] text-[#2F3332] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF9F7] transition-colors shadow-2xs cursor-pointer", children: [_jsx(Upload, { className: "w-4 h-4 text-[#7C8B82]" }), _jsx("span", { children: "Ripristina da File" }), _jsx("input", { type: "file", accept: ".json", onChange: handleFileImport, className: "sr-only" })] }), _jsxs("button", { onClick: () => {
                                    if (confirm('Vuoi davvero ripristinare i dati di esempio originali?')) {
                                        resetToDefaults();
                                        onRefreshData();
                                        alert('Dati ripristinati con successo!');
                                    }
                                }, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF9F7] border border-[#E0DED9] text-[#666] text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Ripristina Dati Iniziali" })] })] })] })] }));
};
// Aiuto Tab View
export const AiutoView = () => {
    return (_jsxs("div", { className: "space-y-6 max-w-2xl text-[#2F3332]", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-[#2F3332] uppercase tracking-wider", children: "Guida e Supporto Calendario Visite" }), _jsx("p", { className: "text-xs text-[#7C8B82] mt-1", children: "Istruzioni sull'uso e sul funzionamento della pianificazione semestrale." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white p-5 rounded-2xl border border-[#E0DED9] shadow-2xs", children: [_jsx("h3", { className: "font-bold text-[#2F3332] text-xs uppercase tracking-wider mb-1", children: "Come funziona la sincronizzazione con l'account?" }), _jsx("p", { className: "text-xs text-[#666] leading-relaxed", children: "Ogni volta che aggiungi, modifichi o elimini una visita o congregazione, i tuoi dati vengono cifrati sul tuo browser con la tua password e sincronizzati automaticamente con il tuo account. Quando accedi da un altro dispositivo con la tua email e password, tutto il calendario viene scaricato e decifrato all'istante." })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-[#E0DED9] shadow-2xs", children: [_jsx("h3", { className: "font-bold text-[#2F3332] text-xs uppercase tracking-wider mb-1", children: "I miei dati sono protetti?" }), _jsx("p", { className: "text-xs text-[#666] leading-relaxed", children: "S\u00EC, utilizziamo una crittografia End-to-End (AES-256-GCM). Solo chi \u00E8 in possesso della tua password pu\u00F2 decifrare e visualizzare il calendario." })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-[#E0DED9] shadow-2xs", children: [_jsx("h3", { className: "font-bold text-[#2F3332] text-xs uppercase tracking-wider mb-1", children: "Come viene calcolato il numero della settimana?" }), _jsxs("p", { className: "text-xs text-[#666] leading-relaxed", children: ["Il numero progressivo (1, 2, 3...) si applica ", _jsx("strong", { children: "esclusivamente alle visite alle congregazioni" }), ". Per tutti gli altri eventi (come settimana libera, settimana pioniere, assenze o assemblee), non viene assegnato il numero progressivo di visita."] })] })] })] }));
};
