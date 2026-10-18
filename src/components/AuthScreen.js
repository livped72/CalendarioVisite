import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, LogIn, AlertCircle, Eye, EyeOff, UserPlus, Mail, User, CheckCircle2, KeyRound, Fingerprint, } from 'lucide-react';
import { loginAccount, registerAccount } from '../lib/accountAuth';
import { isBiometricsSupported, isBiometricsEnrolled, getBiometricUserLabel, loginWithBiometrics, enrollBiometrics, removeBiometrics, } from '../lib/biometrics';
// Codici di autorizzazione preconfigurati per consentire la registrazione solo a persone autorizzate
const VALID_INVITE_CODES = ['CV2026', 'VISITE2026', 'PEDRINI2026', 'ODG2026'];
export const AuthScreen = ({ onSuccess }) => {
    const [mode, setMode] = useState('login');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codiceInvito, setCodiceInvito] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    // Biometric states
    const [bioSupported, setBioSupported] = useState(false);
    const [bioEnrolled, setBioEnrolled] = useState(false);
    const [bioUserLabel, setBioUserLabel] = useState('');
    const [bioLoading, setBioLoading] = useState(false);
    const [enableBiometricsCheckbox, setEnableBiometricsCheckbox] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    useEffect(() => {
        let isMounted = true;
        isBiometricsSupported().then((supported) => {
            if (!isMounted)
                return;
            setBioSupported(supported);
            if (supported && isBiometricsEnrolled()) {
                setBioEnrolled(true);
                setBioUserLabel(getBiometricUserLabel());
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);
    const handleBiometricLogin = async () => {
        setError(null);
        setSuccessMsg(null);
        setBioLoading(true);
        const res = await loginWithBiometrics();
        setBioLoading(false);
        if (res.success) {
            onSuccess();
        }
        else {
            setError(res.error || 'Autenticazione biometrica non riuscita. Puoi inserire la password sotto.');
        }
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        if (!email || !password) {
            setError('Inserisci sia lo username/email che la password.');
            return;
        }
        setLoading(true);
        const res = await loginAccount(email, password);
        setLoading(false);
        if (res.success) {
            if (bioSupported && !bioEnrolled && enableBiometricsCheckbox) {
                try {
                    await enrollBiometrics(email, password, 'Livio Pedrini');
                }
                catch (e) {
                    console.warn('Registrazione biometrica saltata:', e);
                }
            }
            onSuccess();
        }
        else {
            setError(res.error || 'Credenziali non valide. Riprova.');
        }
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        // Verifica di sicurezza: blocco registrazione autonoma senza codice amministratore
        const normalizedCode = codiceInvito.trim().toUpperCase();
        const customAdminCode = localStorage.getItem('cv_custom_admin_invite_code')?.trim().toUpperCase();
        const isAuthorized = VALID_INVITE_CODES.includes(normalizedCode) ||
            (customAdminCode && normalizedCode === customAdminCode);
        if (!isAuthorized) {
            setError('Codice di autorizzazione non valido. La registrazione autonoma è disabilitata per proteggere il portale. Contatta l’amministratore per ottenere l’autorizzazione.');
            return;
        }
        if (!nome.trim()) {
            setError('Inserisci il tuo nome e cognome.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Inserisci un indirizzo email valido.');
            return;
        }
        if (password.length < 6) {
            setError('La password deve contenere almeno 6 caratteri.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Le due password non corrispondono.');
            return;
        }
        setLoading(true);
        const res = await registerAccount(email, password, nome);
        setLoading(false);
        if (res.success) {
            setSuccessMsg('Account autorizzato e creato con successo! Accesso in corso…');
            setTimeout(() => onSuccess(), 900);
        }
        else {
            setError(res.error || 'Impossibile creare l\'account. Riprova.');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-[#090E17] flex flex-col justify-center items-center p-4 text-[#F8FAFC]", children: _jsxs("div", { className: "w-full max-w-md bg-[#0F1A30] rounded-3xl border border-[#1E3A5F] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "flex flex-col items-center mb-6", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-blue-950/80 flex items-center justify-center border border-blue-800/60 mb-3 shadow-lg shadow-blue-950/50", children: _jsx(ShieldCheck, { size: 36, className: "text-blue-400" }) }), _jsx("span", { className: "text-[10px] font-bold tracking-widest text-blue-300 uppercase bg-[#0B1426] px-3 py-1 rounded-full border border-[#1E3A5F] mb-1.5 flex items-center gap-1", children: _jsx("span", { children: "\uD83D\uDEE1\uFE0F Portale Riservato & Cifrato" }) }), _jsx("h1", { className: "text-xl font-black text-white", children: "Calendario Visite" }), _jsx("p", { className: "text-xs text-slate-400 text-center mt-1", children: mode === 'login'
                                ? 'Accedi con le tue credenziali autorizzate'
                                : 'Registrazione ad accesso protetto: codice invito richiesto' })] }), _jsxs("div", { className: "grid grid-cols-2 p-1 bg-[#0B1426] rounded-2xl border border-[#1E3A5F] mb-5", children: [_jsx("button", { type: "button", onClick: () => { setMode('login'); setError(null); }, className: `py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${mode === 'login'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                                : 'text-slate-400 hover:text-white'}`, children: "Accedi" }), _jsxs("button", { type: "button", onClick: () => { setMode('register'); setError(null); }, className: `py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${mode === 'register'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                                : 'text-slate-400 hover:text-white'}`, children: [_jsx("span", { children: "Registrati" }), _jsx(Lock, { className: "w-3 h-3 text-blue-300" })] })] }), error && (_jsxs("div", { className: "mb-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in", children: [_jsx(AlertCircle, { size: 16, className: "shrink-0 mt-0.5 text-rose-400" }), _jsx("span", { className: "leading-relaxed", children: error })] })), successMsg && (_jsxs("div", { className: "mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-in fade-in", children: [_jsx(CheckCircle2, { size: 16, className: "shrink-0 text-emerald-400" }), _jsx("span", { children: successMsg })] })), mode === 'login' && (_jsxs("div", { className: "space-y-4", children: [bioEnrolled && (_jsxs("div", { className: "p-4 rounded-2xl bg-[#142342] text-white shadow-md border border-[#1E3A5F] animate-in fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400", children: _jsx(Fingerprint, { size: 22 }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xs font-bold uppercase tracking-wider text-white", children: "Accesso Biometrico" }), _jsx("p", { className: "text-[11px] text-slate-300", children: bioUserLabel ? `Dispositivo autorizzato per ${bioUserLabel}` : 'Touch ID / Face ID configurato' })] })] }), _jsx("span", { className: "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60", children: "Pronto" })] }), _jsx("button", { type: "button", onClick: handleBiometricLogin, disabled: bioLoading, className: "w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75", children: bioLoading ? (_jsx("span", { className: "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" })) : (_jsxs(_Fragment, { children: [_jsx(Fingerprint, { size: 16, className: "text-white" }), _jsx("span", { children: "Accedi con Face ID / Touch ID" })] })) }), _jsxs("div", { className: "mt-2.5 flex items-center justify-between text-[10px] text-slate-400", children: [_jsx("span", { children: "Sblocco rapido senza password" }), _jsx("button", { type: "button", onClick: () => {
                                                removeBiometrics();
                                                setBioEnrolled(false);
                                                setBioUserLabel('');
                                            }, className: "hover:text-blue-300 underline cursor-pointer", children: "Rimuovi da questo dispositivo" })] })] })), bioEnrolled && (_jsxs("div", { className: "relative my-2 flex items-center justify-center", children: [_jsx("div", { className: "border-t border-[#172646] w-full" }), _jsx("span", { className: "bg-[#0F1A30] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute", children: "oppure con credenziali" })] })), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase mb-1", children: "Username o Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-3 w-4 h-4 text-blue-400" }), _jsx("input", { type: "text", value: email, autoFocus: !bioEnrolled, required: true, autoComplete: "username", onChange: (e) => setEmail(e.target.value), placeholder: "odglivio oppure la tua email", className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1E3A5F] text-sm bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase mb-1", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-3 w-4 h-4 text-blue-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, required: true, autoComplete: "current-password", onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#1E3A5F] text-sm bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer", "aria-label": "Mostra o nascondi password", children: showPassword ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), bioSupported && !bioEnrolled && (_jsxs("label", { className: "flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B1426] border border-[#1E3A5F] cursor-pointer hover:bg-[#142342] transition-colors select-none", children: [_jsx("input", { type: "checkbox", checked: enableBiometricsCheckbox, onChange: (e) => setEnableBiometricsCheckbox(e.target.checked), className: "w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer shrink-0" }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-200", children: [_jsx(Fingerprint, { className: "w-4 h-4 text-blue-400 shrink-0" }), _jsxs("span", { children: ["Attiva ", _jsx("strong", { children: "Face ID / Touch ID" }), " per i prossimi accessi"] })] })] })), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-950/50 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]", children: loading ? (_jsx("span", { className: "w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { size: 15 }), " Accedi al tuo Account"] })) })] })] })), mode === 'register' && (_jsxs("form", { onSubmit: handleRegister, className: "space-y-3.5", children: [_jsxs("div", { className: "p-3 bg-[#0B1426] rounded-2xl border border-[#1E3A5F] space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider", children: [_jsx(KeyRound, { className: "w-4 h-4 text-blue-400" }), _jsx("span", { children: "Codice Autorizzazione Amministratore *" })] }), _jsx("p", { className: "text-[11px] text-slate-400 leading-tight", children: "La registrazione autonoma \u00E8 disabilitata. Inserisci il codice segreto fornito dall'amministratore." }), _jsx("input", { type: "password", required: true, value: codiceInvito, onChange: (e) => setCodiceInvito(e.target.value), placeholder: "Codice autorizzazione...", className: "w-full px-3.5 py-2 rounded-xl border border-[#1E3A5F] text-xs sm:text-sm bg-[#142342] font-bold tracking-wider focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase mb-1", children: "Nome e Cognome *" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-blue-400" }), _jsx("input", { type: "text", value: nome, required: true, autoComplete: "name", onChange: (e) => setNome(e.target.value), placeholder: "es. Livio Pedrini", className: "w-full pl-10 pr-4 py-2 rounded-xl border border-[#1E3A5F] text-sm bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase mb-1", children: "Email *" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-blue-400" }), _jsx("input", { type: "email", value: email, required: true, autoComplete: "email", onChange: (e) => setEmail(e.target.value), placeholder: "tua@email.it", className: "w-full pl-10 pr-4 py-2 rounded-xl border border-[#1E3A5F] text-sm bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase mb-1", children: "Password (min. 6 caratteri) *" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-blue-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, required: true, minLength: 6, autoComplete: "new-password", onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-10 py-2 rounded-xl border border-[#1E3A5F] text-sm bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer", "aria-label": "Mostra o nascondi password", children: showPassword ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-300 uppercase mb-1", children: "Conferma Password *" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-blue-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: confirmPassword, required: true, autoComplete: "new-password", onChange: (e) => setConfirmPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-4 py-2 rounded-xl border border-[#1E3A5F] text-sm bg-[#0B1426] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-950/50 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]", children: loading ? (_jsx("span", { className: "w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { size: 15 }), " Valida Codice e Crea Account"] })) })] })), _jsx("div", { className: "mt-5 pt-4 border-t border-[#172646] text-center text-xs text-slate-400", children: mode === 'login' ? (_jsxs("span", { children: ["Hai un codice di autorizzazione per registrarti?", ' ', _jsx("button", { onClick: () => { setMode('register'); setError(null); }, className: "text-blue-400 font-bold hover:underline cursor-pointer", children: "Registrati qui" })] })) : (_jsxs("span", { children: ["Hai gi\u00E0 un account registrato?", ' ', _jsx("button", { onClick: () => { setMode('login'); setError(null); }, className: "text-blue-400 font-bold hover:underline cursor-pointer", children: "Torna al Login" })] })) }), _jsx("p", { className: "mt-4 text-[10px] text-slate-500 text-center leading-relaxed", children: "Accesso riservato e protetto da crittografia AES-256. L'amministratore del sistema rilascia le autorizzazioni di accesso." })] }) }));
};
