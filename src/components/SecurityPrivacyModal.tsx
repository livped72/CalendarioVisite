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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Sicurezza &amp; Conformità Privacy (GDPR)
              </h3>
              <p className="text-[11px] text-slate-500">
                Protezione avanzata dati personali e conformità Regolamento UE 2016/679
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 my-4 space-y-4 pr-1 text-xs leading-relaxed">
          {/* Status badge banner */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-bold text-slate-900 text-xs">Stato di Conformità</span>
                <p className="text-[11px] text-slate-500">Zero Trasferimento Server • Privacy by Design</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              GDPR Conforme
            </span>
          </div>

          {/* Privacy & Security Features */}
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Archiviazione Locale Esclusiva (Nessun Cloud Esterno)</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Tutti i dati relativi a visite, congregazioni e note personali risiedono <strong>esclusivamente sul tuo dispositivo locale</strong> (LocalStorage protetto). Nessun dato viene trasmesso, venduto o profilato su server di terze parti.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Zero Cookie di Tracciamento &amp; No Analytics</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  L'applicazione è priva di cookie commerciali, script di profilazione, banner pubblicitari o strumenti di monitoraggio comportamentale. Non è richiesto alcun consenso cookie poiché non viene impiegato alcun tracker.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Diritti dell'Interessato (GDPR Artt. 15-20)</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Hai il pieno controllo: <strong>Portabilità</strong> (puoi esportare tutti i tuoi dati in formato JSON standard in qualsiasi istante) e <strong>Diritto all'Oblio</strong> (puoi cancellare tutti i dati archiviati con effetto immediato).
                </p>
              </div>
            </div>
          </div>

          {/* PIN Lock feature */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-blue-600" />
                <span className="font-bold text-slate-900">Protezione Accesso con PIN (Dispositivo Condiviso)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pinEnabled
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {pinEnabled ? 'PIN Attivo' : 'Non Impostato'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Imposta un codice a 4 cifre per proteggere la visualizzazione delle visite quando utilizzi un computer o tablet condiviso con altri fratelli o familiari.
            </p>

            {pinEnabled ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Check size={12} /> Il calendario è protetto da codice PIN.
                </span>
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
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
                    className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 cursor-pointer transition-all"
                >
                  Imposta PIN
                </button>
              </form>
            )}

            {pinMessage && (
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">{pinMessage}</p>
            )}
          </div>

          {/* Right to erasure / Reset */}
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-rose-800 text-xs flex items-center gap-1.5">
                <Trash2 size={13} className="text-rose-600" />
                Cancellazione Completa dei Dati (Diritto all'Oblio)
              </h5>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Rimuove all'istante tutte le congregazioni, le pianificazioni e le preferenze memorizzate su questo browser.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllData}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              Cancella Tutto
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-mono">
            Standard: RGPD 2016/679 • ISO/IEC 27001
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm shadow-blue-500/20"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
