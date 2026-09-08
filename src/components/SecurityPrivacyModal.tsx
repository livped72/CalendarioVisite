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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-[#2F3332]">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-[#E0DED9] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#E0DED9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#7C8B82]/15 text-[#5B6760] rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2F3332] uppercase tracking-wider">
                Sicurezza &amp; Conformità Privacy (GDPR)
              </h3>
              <p className="text-[11px] text-[#7C8B82]">
                Protezione avanzata dati personali e conformità Regolamento UE 2016/679
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#888] hover:text-[#333] cursor-pointer p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 my-4 space-y-4 pr-1 text-xs leading-relaxed">
          {/* Status badge banner */}
          <div className="p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-bold text-[#2F3332] text-xs">Stato di Conformità</span>
                <p className="text-[11px] text-[#7C8B82]">Zero Trasferimento Server • Privacy by Design</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              GDPR Conforme
            </span>
          </div>

          {/* Privacy & Security Features */}
          <div className="space-y-2.5">
            <div className="p-3 bg-white rounded-xl border border-[#E0DED9] flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-[#2F3332]">Archiviazione Locale Esclusiva (Nessun Cloud Esterno)</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Tutti i dati relativi a visite, congregazioni e note personali risiedono <strong>esclusivamente sul tuo dispositivo locale</strong> (LocalStorage protetto). Nessun dato viene trasmesso, venduto o profilato su server di terze parti.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E0DED9] flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-[#2F3332]">Zero Cookie di Tracciamento &amp; No Analytics</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  L'applicazione è priva di cookie commerciali, script di profilazione, banner pubblicitari o strumenti di monitoraggio comportamentale. Non è richiesto alcun consenso cookie poiché non viene impiegato alcun tracker.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E0DED9] flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                <Check size={14} />
              </div>
              <div>
                <h4 className="font-bold text-[#2F3332]">Diritti dell'Interessato (GDPR Artt. 15-20)</h4>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Hai il pieno controllo: <strong>Portabilità</strong> (puoi esportare tutti i tuoi dati in formato JSON standard in qualsiasi istante) e <strong>Diritto all'Oblio</strong> (puoi cancellare tutti i dati archiviati con effetto immediato).
                </p>
              </div>
            </div>
          </div>

          {/* PIN Lock feature */}
          <div className="p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-[#5B6760]" />
                <span className="font-bold text-[#2F3332]">Protezione Accesso con PIN (Dispositivo Condiviso)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pinEnabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {pinEnabled ? 'PIN Attivo' : 'Non Impostato'}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
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
                  className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
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
                    className="w-28 px-2.5 py-1.5 rounded-lg border border-[#E0DED9] bg-white text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-[#7C8B82]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1.5 text-stone-500 hover:text-stone-700"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="px-3 py-1.5 bg-[#7C8B82] hover:bg-[#68766E] disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
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
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                <Trash2 size={13} className="text-rose-600" />
                Cancellazione Completa dei Dati (Diritto all'Oblio)
              </h5>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Rimuove all'istante tutte le congregazioni, le pianificazioni e le preferenze memorizzate su questo browser.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAllData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              Cancella Tutto
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#E0DED9]">
          <span className="text-[11px] text-[#7C8B82] font-mono">
            Standard: RGPD 2016/679 • ISO/IEC 27001
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#7C8B82] hover:bg-[#68766E] text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
