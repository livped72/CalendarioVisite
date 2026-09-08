import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';
import { loginAccount, registerAccount } from '../lib/accountAuth';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
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
    } else {
      setError(res.error || 'Credenziali non valide. Riprova.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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
      setSuccessMsg('Account creato con successo! Accesso in corso…');
      setTimeout(() => onSuccess(), 900);
    } else {
      setError(res.error || 'Impossibile creare l\'account. Riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-center items-center p-4 text-[#2F3332]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E0DED9] shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#7C8B82]/15 flex items-center justify-center border border-[#7C8B82]/30 mb-3 shadow-inner">
            <ShieldCheck size={36} className="text-[#5B6760]" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-[#7C8B82] uppercase bg-[#FAF9F7] px-3 py-1 rounded-full border border-[#E0DED9] mb-1.5 flex items-center gap-1">
            <span>🛡️ Account Cifrato &amp; Sicuro</span>
          </span>
          <h1 className="text-xl font-bold text-[#2F3332]">Calendario Visite</h1>
          <p className="text-xs text-[#777] text-center mt-1">
            {mode === 'login'
              ? 'Accedi per sincronizzare le tue visite su tutti i dispositivi'
              : 'Crea il tuo account per accedere ovunque in totale sicurezza'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#2F3332] shadow-xs'
                : 'text-[#888] hover:text-[#2F3332]'
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#2F3332] shadow-xs'
                : 'text-[#888] hover:text-[#2F3332]'
            }`}
          >
            Registrati
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#7C8B82]" />
                <input
                  type="email"
                  value={email}
                  autoFocus
                  required
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.it"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E0DED9] text-sm bg-[#FAF9F7] focus:outline-none focus:border-[#7C8B82] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#7C8B82]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  required
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E0DED9] text-sm bg-[#FAF9F7] focus:outline-none focus:border-[#7C8B82] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#888] hover:text-[#2F3332] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <>
                  <LogIn size={15} /> Accedi al tuo Account
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM: REGISTRAZIONE */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
                Nome e Cognome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#7C8B82]" />
                <input
                  type="text"
                  value={nome}
                  autoFocus
                  required
                  autoComplete="name"
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="es. Livio Pedrini"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E0DED9] text-sm bg-[#FAF9F7] focus:outline-none focus:border-[#7C8B82] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#7C8B82]" />
                <input
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.it"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E0DED9] text-sm bg-[#FAF9F7] focus:outline-none focus:border-[#7C8B82] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
                Password (min. 6 caratteri)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#7C8B82]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-[#E0DED9] text-sm bg-[#FAF9F7] focus:outline-none focus:border-[#7C8B82] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#888] hover:text-[#2F3332] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F3332] uppercase mb-1">
                Conferma Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#7C8B82]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  required
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E0DED9] text-sm bg-[#FAF9F7] focus:outline-none focus:border-[#7C8B82] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <>
                  <UserPlus size={15} /> Crea Account e Inizia
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-[#E0DED9] text-center text-xs text-[#777]">
          {mode === 'login' ? (
            <span>
              Non hai ancora un account?{' '}
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className="text-[#5B6760] font-bold hover:underline cursor-pointer"
              >
                Registrati gratis
              </button>
            </span>
          ) : (
            <span>
              Hai già un account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="text-[#5B6760] font-bold hover:underline cursor-pointer"
              >
                Accedi qui
              </button>
            </span>
          )}
        </div>

        {/* Privacy badge */}
        <p className="mt-4 text-[10px] text-[#AAA] text-center leading-relaxed">
          I dati del tuo calendario sono cifrati con standard AES-256 e protetti dalla tua password. Nessun tracciamento o condivisione con terze parti.
        </p>
      </div>
    </div>
  );
};
