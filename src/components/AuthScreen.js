import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { ShieldCheck, Lock, LogIn, AlertCircle, Eye, EyeOff, UserPlus, Mail, User, CheckCircle2, KeyRound, } from 'lucide-react';
import { loginAccount, registerAccount } from '../lib/accountAuth';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        if (!email || !password) {
            setError('Inserisci sia l\'email che la password.');
            return;
        }
        setLoading(true);
        const res = await loginAccount(email, password);
        setLoading(false);
        if (res.success) {
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
    return (_jsx("div", { className: "min-h-screen bg-[#F7F6F2] flex flex-col justify-center items-center p-4 text-[#2F3332]", children: _jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl border border-[#E0DED9] shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "flex flex-col items-center mb-6", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-[#7C8B82]/15 flex items-center justify-center border border-[#7C8B82]/30 mb-3 shadow-inner", children: _jsx(ShieldCheck, { size: 36, className: "text-[#5B6760]" }) }), _jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#7C8B82] uppercase bg-[#FAF9F7] px-3 py-1 rounded-full border border-[#E0DED9] mb-1.5 flex items-center gap-1", children: _jsx("span", { children: "\uD83D\uDEE1\uFE0F Portale Riservato & Cifrato" }) }), _jsx("h1", { className: "text-xl font-black text-[#2F3332]", children: "Calendario Visite" }), _jsx("p", { className: "text-xs text-[#777] text-center mt-1", children: mode === 'login'
                                ? 'Accedi con le tue credenziali autorizzate'
                                : 'Registrazione ad accesso protetto: codice invito richiesto' })] }), _jsxs("div", { className: "grid grid-cols-2 p-1 bg-[#FAF9F7] rounded-2xl border border-[#E0DED9] mb-5", children: [_jsx("button", { type: "button", onClick: () => { setMode('login'); setError(null); }, className: `py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${mode === 'login'
                                ? 'bg-white text-[#2F3332] shadow-xs'
                                : 'text-[#888] hover:text-[#2F3332]'}`, children: "Accedi" }), _jsxs("button", { type: "button", onClick: () => { setMode('register'); setError(null); }, className: `py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${mode === 'register'
                                ? 'bg-white text-[#2F3332] shadow-xs'
                                : 'text-[#888] hover:text-[#2F3332]'}`, children: [_jsx("span", { children: "Registrati" }), _jsx(Lock, { className: "w-3 h-3 text-[#7C8B82]" })] })] }), error && (_jsxs("div", { className: "mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in", children: [_jsx(AlertCircle, { size: 16, className: "shrink-0 mt-0.5" }), _jsx("span", { className: "leading-relaxed", children: error })] })), successMsg && (_jsxs("div", { className: "mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium animate-in fade-in", children: [_jsx(CheckCircle2, { size: 16, className: "shrink-0 text-emerald-600" }), _jsx("span", { children: successMsg })] })), mode === 'login' && (_jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-3 w-4 h-4 text-[#7C8B82]" }), _jsx("input", { type: "email", value: email, autoFocus: true, required: true, autoComplete: "email", onChange: (e) => setEmail(e.target.value), placeholder: "tua@email.it", className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5D2CA] text-sm bg-white focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 transition-all" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-3 w-4 h-4 text-[#7C8B82]" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, required: true, autoComplete: "current-password", onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D5D2CA] text-sm bg-white focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 transition-all" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-3 text-[#888] hover:text-[#2F3332] cursor-pointer", "aria-label": "Mostra o nascondi password", children: showPassword ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]", children: loading ? (_jsx("span", { className: "w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { size: 15 }), " Accedi al tuo Account"] })) })] })), mode === 'register' && (_jsxs("form", { onSubmit: handleRegister, className: "space-y-3.5", children: [_jsxs("div", { className: "p-3 bg-[#FAF9F7] rounded-2xl border border-[#E0DED9] space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs font-black text-[#2F3332] uppercase tracking-wider", children: [_jsx(KeyRound, { className: "w-4 h-4 text-[#7C8B82]" }), _jsx("span", { children: "Codice Autorizzazione Amministratore *" })] }), _jsx("p", { className: "text-[11px] text-[#777] leading-tight", children: "La registrazione autonoma \u00E8 disabilitata. Inserisci il codice segreto fornito dall'amministratore." }), _jsx("input", { type: "password", required: true, value: codiceInvito, onChange: (e) => setCodiceInvito(e.target.value), placeholder: "Codice autorizzazione...", className: "w-full px-3.5 py-2 rounded-xl border border-[#D5D2CA] text-xs sm:text-sm bg-white font-bold tracking-wider focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20 text-[#2F3332]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Nome e Cognome *" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-[#7C8B82]" }), _jsx("input", { type: "text", value: nome, required: true, autoComplete: "name", onChange: (e) => setNome(e.target.value), placeholder: "es. Livio Pedrini", className: "w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5D2CA] text-sm bg-white focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Email *" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-[#7C8B82]" }), _jsx("input", { type: "email", value: email, required: true, autoComplete: "email", onChange: (e) => setEmail(e.target.value), placeholder: "tua@email.it", className: "w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5D2CA] text-sm bg-white focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Password (min. 6 caratteri) *" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-[#7C8B82]" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, required: true, minLength: 6, autoComplete: "new-password", onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-10 py-2 rounded-xl border border-[#D5D2CA] text-sm bg-white focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-2.5 text-[#888] hover:text-[#2F3332] cursor-pointer", "aria-label": "Mostra o nascondi password", children: showPassword ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#2F3332] uppercase mb-1", children: "Conferma Password *" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3.5 top-2.5 w-4 h-4 text-[#7C8B82]" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: confirmPassword, required: true, autoComplete: "new-password", onChange: (e) => setConfirmPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5D2CA] text-sm bg-white focus:outline-none focus:border-[#7C8B82] focus:ring-2 focus:ring-[#7C8B82]/20" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]", children: loading ? (_jsx("span", { className: "w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { size: 15 }), " Valida Codice e Crea Account"] })) })] })), _jsx("div", { className: "mt-5 pt-4 border-t border-[#E0DED9] text-center text-xs text-[#777]", children: mode === 'login' ? (_jsxs("span", { children: ["Hai un codice di autorizzazione per registrarti?", ' ', _jsx("button", { onClick: () => { setMode('register'); setError(null); }, className: "text-[#5B6760] font-bold hover:underline cursor-pointer", children: "Registrati qui" })] })) : (_jsxs("span", { children: ["Hai gi\u00E0 un account registrato?", ' ', _jsx("button", { onClick: () => { setMode('login'); setError(null); }, className: "text-[#5B6760] font-bold hover:underline cursor-pointer", children: "Torna al Login" })] })) }), _jsx("p", { className: "mt-4 text-[10px] text-[#AAA] text-center leading-relaxed", children: "Accesso riservato e protetto da crittografia AES-256. L'amministratore del sistema rilascia le autorizzazioni di accesso." })] }) }));
};
