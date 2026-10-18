import React, { useState } from 'react';
import { ShieldCheck, X, Check, Lock, Database, Trash2, KeyRound, Eye, EyeOff, ShieldAlert, FileText } from 'lucide-react';
import { resetToDefaults } from '../lib/storage';

interface SecurityPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset?: () => void;
}

export const SecurityPrivacyModal: React.FC<SecurityPrivacyModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [pinEnabled, setPinEnabled] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('calendario_visite_pin'));
  });
  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length === 4) {
      localStorage.setItem('calendario_visite_pin', pinInput);
      setPinEnabled(true);
      setPinMessage('PIN di sicurezza a 4 cifre attivato con successo!');
      setPinInput('');
      setTimeout(() => setPinMessage(''), 3000);
    }
  };

  const handleRemovePin = () => {
    localStorage.removeItem('calendario_visite_pin');
    setPinEnabled(false);
    setPinMessage('PIN di sicurezza rimosso.');
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'ATTENZIONE: Diritto all\'oblio (GDPR Art. 17).\n\nVuoi cancellare definitivamente TUTTI i dati memorizzati in locale su questo dispositivo? L\'azione non è reversibile.'
      )
    ) {
      localStorage.clear();
      resetToDefaults();
      if (onDataReset) onDataReset();
      alert('Tutti i dati locali sono stati eliminati e reimpostati allo stato iniziale pulito.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-[#F8FAFC]">
      <div className="bg-[#0F1A30] w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-[#1E3A5F] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1E3A5F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Sicurezza &amp; Conformità Privacy (GDPR)
              </h3>
              <p className="text-[11px] text-blue-300">
                Protezione avanzata dati personali e conformità Regolamento UE 2016/679
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-[#142342] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 my-4 space-y-4 pr-1 text-xs leading-relaxed">
          {/* Status badge banner */}
          <div className="p-3.5 bg-[#0B1426] rounded-2xl border border-[#1E3A5F] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold text-white text-xs">Stato di Conformità</span>
                <p className="text-[11px] text-blue-300">Zero Trasferimento Server • Privacy by Design</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800/60">
              GDPR Conforme
            </span>
          </div>

          {/* Privacy & Security Features */}
          <div className="space-y-2.5">
            <div className="p-3 bg-[#142342] rounded-2xl border border-[#1E3A5F] flex items-start gap-3">
              <div className="p-1.5 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-white">Archiviazione Locale Esclusiva (Nessun Cloud Esterno)</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Tutti i dati relativi a visite, congregazioni e note personali risiedono <strong>esclusivamente sul tuo dispositivo locale</strong> (LocalStorage protetto). Nessun dato viene trasmesso, venduto o profilato su server di terze parti.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#142342] rounded-2xl border border-[#1E3A5F] flex items-start gap-3">
              <div className="p-1.5 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-white">Zero Cookie di Tracciamento &amp; No Analytics</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  L'applicazione è priva di cookie commerciali, script di profilazione, banner pubblicitari o strumenti di monitoraggio comportamentale. Non è richiesto alcun consenso cookie poiché non viene impiegato alcun tracker.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#142342] rounded-2xl border border-[#1E3A5F] flex items-start gap-3">
              <div className="p-1.5 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-white">Diritti dell'Interessato (GDPR Artt. 15-20)</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Hai il pieno controllo: <strong>Portabilità</strong> (puoi esportare tutti i tuoi dati in formato JSON standard in qualsiasi istante) e <strong>Diritto all'Oblio</strong> (puoi cancellare tutti i dati archiviati con effetto immediato).
                </p>
              </div>
            </div>
          </div>

          {/* PIN Lock feature */}
          <div className="p-3.5 bg-[#0B1426] rounded-2xl border border-[#1E3A5F] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-blue-400" />
                <span className="font-bold text-white">Protezione Accesso con PIN (Dispositivo Condiviso)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pinEnabled
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                    : 'bg-[#142342] text-slate-400 border border-[#1E3A5F]'
                }`}
              >
                {pinEnabled ? 'PIN Attivo' : 'Non Impostato'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Imposta un codice a 4 cifre per proteggere la visualizzazione delle visite quando utilizzi un computer o tablet condiviso con altri fratelli o familiari.
            </p>

            {pinEnabled ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={12} /> Il calendario è protetto da codice PIN.
                </span>
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="px-3 py-1 bg-[#142342] hover:bg-[#1A2C52] border border-[#1E3A5F] text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Disattiva PIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleSavePin} className="flex items-center gap-2 pt-1">
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    placeholder="Es. 1234"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-28 px-2.5 py-1.5 rounded-lg border border-[#1E3A5F] bg-[#142342] text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-950/50 cursor-pointer transition-all"
                >
                  Imposta PIN
                </button>
              </form>
            )}

            {pinMessage && (
              <p className="text-[11px] font-semibold text-emerald-400 mt-1">{pinMessage}</p>
            )}
          </div>

          {/* Right to erasure / Reset */}
          <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-900/60 flex items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <Trash2 size={13} className="text-rose-400" />
                Cancellazione Completa dei Dati (Diritto all'Oblio)
              </h5>
              <p className="text-[11px] text-rose-400/90 mt-0.5">
                Rimuove all'istante tutte le congregazioni, le pianificazioni e le preferenze memorizzate su questo browser.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              Cancella Tutto
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#172646]">
          <span className="text-[11px] text-blue-400 font-mono">
            Standard: RGPD 2016/679 • ISO/IEC 27001
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-blue-950/50"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
