import React, { useState } from 'react';
import {
  X,
  Calendar,
  Download,
  ExternalLink,
  Smartphone,
  Laptop,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Settimana, Appuntamento, Congregazione } from '../types';
import { generateICalendar, downloadICalFile, generateGoogleCalendarUrl } from '../lib/icalExport';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settimane: Settimana[];
  appuntamenti: Appuntamento[];
  congregazioni: Congregazione[];
  currentWeek?: Settimana | null;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  settimane,
  appuntamenti,
  congregazioni,
  currentWeek,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeGuide, setActiveGuide] = useState<'apple' | 'google' | 'mac' | 'outlook'>('apple');

  if (!isOpen) return null;

  const handleDownloadICS = () => {
    const icsContent = generateICalendar(settimane, appuntamenti, congregazioni);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadICalFile(`calendario_visite_${dateStr}.ics`, icsContent);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleOpenGoogleCurrentWeek = () => {
    if (!currentWeek) return;
    const cong = congregazioni.find((c) => c.id === currentWeek.congregazioneId);
    const url = generateGoogleCalendarUrl({
      title:
        currentWeek.evento === 'congregazione'
          ? `Visita: ${currentWeek.dettagli || 'Congregazione'}`
          : currentWeek.dettagli || currentWeek.evento,
      startDate: currentWeek.startDate,
      endDate: currentWeek.endDate,
      details: currentWeek.note || 'Visita circoscrizione',
      location: cong?.citta || '',
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#E0DED9] animate-in fade-in zoom-in-95 duration-150 text-[#2F3332]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED9] bg-[#FAF9F7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C8B82]/15 flex items-center justify-center text-[#47574E]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2F3332] uppercase tracking-wider">
                Sincronizza con Calendario Personale
              </h3>
              <p className="text-xs text-[#7C8B82]">
                Google Calendar, Apple Calendar (iPhone, Mac), Outlook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main Action: Export .ics */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF9F7] to-[#F2EFE9] border border-[#E0DED9] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-[#2F3332] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7C8B82]" />
                  Esportazione Universale iCalendar (.ics)
                </div>
                <div className="text-[11px] text-[#666] mt-0.5">
                  Include <strong>{settimane.length}</strong> settimane/visite e{' '}
                  <strong>{appuntamenti.length}</strong> appuntamenti con orari precisi.
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadICS}
              className="w-full py-3 px-4 rounded-xl bg-[#7C8B82] hover:bg-[#68766E] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>File .ics Scaricato con Successo!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Scarica File Calendario (.ics)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-[#777] text-center">
              Compatibile al 100% con Apple Calendar, Google Calendar e Microsoft Outlook.
            </p>
          </div>

          {/* Quick Action: Current Week to Google Calendar */}
          {currentWeek && (
            <div className="p-3.5 bg-white rounded-xl border border-[#E0DED9] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#2F3332] truncate">
                  Aggiungi questa settimana a Google Calendar
                </div>
                <div className="text-[11px] text-[#666] truncate">
                  {currentWeek.dettagli || 'Visita'} ({currentWeek.periodo})
                </div>
              </div>
              <button
                onClick={handleOpenGoogleCurrentWeek}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E0DED9] hover:border-[#7C8B82] bg-stone-50 hover:bg-white text-xs font-bold text-[#2F3332] transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#7C8B82]" />
                <span>Apri Google</span>
              </button>
            </div>
          )}

          {/* Guides / Instructions Tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#2F3332]">
              <HelpCircle className="w-4 h-4 text-[#7C8B82]" />
              Come importare sui tuoi dispositivi
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#FAF9F7] rounded-xl border border-[#E0DED9]">
              <button
                onClick={() => setActiveGuide('apple')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'apple'
                    ? 'bg-white text-[#2F3332] shadow-2xs font-bold'
                    : 'text-[#777] hover:text-[#2F3332]'
                }`}
              >
                iPhone / iPad
              </button>
              <button
                onClick={() => setActiveGuide('mac')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'mac'
                    ? 'bg-white text-[#2F3332] shadow-2xs font-bold'
                    : 'text-[#777] hover:text-[#2F3332]'
                }`}
              >
                Mac (macOS)
              </button>
              <button
                onClick={() => setActiveGuide('google')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'google'
                    ? 'bg-white text-[#2F3332] shadow-2xs font-bold'
                    : 'text-[#777] hover:text-[#2F3332]'
                }`}
              >
                Google Cal
              </button>
              <button
                onClick={() => setActiveGuide('outlook')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'outlook'
                    ? 'bg-white text-[#2F3332] shadow-2xs font-bold'
                    : 'text-[#777] hover:text-[#2F3332]'
                }`}
              >
                Outlook
              </button>
            </div>

            {/* Guide Content */}
            <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E0DED9] text-xs text-[#555] leading-relaxed">
              {activeGuide === 'apple' && (
                <div className="space-y-2">
                  <div className="font-bold text-[#2F3332] flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#7C8B82]" /> Sincronizzazione con iPhone o iPad:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[#666]">
                    <li>
                      Premi il pulsante <strong>"Scarica File Calendario (.ics)"</strong> qui sopra usando Safari sul tuo iPhone o iPad.
                    </li>
                    <li>
                      Quando Safari chiede se scaricare o aprire il file, tocca <strong>"Apri in Calendario"</strong> oppure apri il file scaricato.
                    </li>
                    <li>
                      Tocca <strong>"Aggiungi tutto"</strong> in alto a destra per inserire tutte le visite e gli appuntamenti nel tuo calendario Apple o iCloud.
                    </li>
                    <li>
                      Gli eventi appariranno subito su iPhone, iPad e Apple Watch con le rispettive notifiche e promemoria!
                    </li>
                  </ol>
                </div>
              )}

              {activeGuide === 'mac' && (
                <div className="space-y-2">
                  <div className="font-bold text-[#2F3332] flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-[#7C8B82]" /> Sincronizzazione con Mac (Calendario.app):
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[#666]">
                    <li>Scarica il file <strong>.ics</strong> tramite il pulsante in alto.</li>
                    <li>
                      Fai doppio clic sul file scaricato nella cartella <em>Download</em> del tuo Mac.
                    </li>
                    <li>
                      L'app <strong>Calendario</strong> si aprirà automaticamente chiedendoti in quale calendario aggiungere gli eventi (es. Personale o iCloud).
                    </li>
                    <li>
                      Conferma con <strong>"OK"</strong>. Se hai iCloud attivo, gli eventi si sincronizzeranno in automatico anche sul tuo telefono!
                    </li>
                  </ol>
                </div>
              )}

              {activeGuide === 'google' && (
                <div className="space-y-2">
                  <div className="font-bold text-[#2F3332] flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-[#7C8B82]" /> Sincronizzazione con Google Calendar:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[#666]">
                    <li>Scarica il file <strong>.ics</strong> dal pulsante in alto.</li>
                    <li>
                      Accedi a{' '}
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7C8B82] underline font-semibold"
                      >
                        calendar.google.com
                      </a>
                      .
                    </li>
                    <li>
                      In alto a destra fai clic sull'icona delle <strong>Impostazioni</strong> (ingranaggio) → <strong>Impostazioni</strong>.
                    </li>
                    <li>
                      Nel menu a sinistra seleziona <strong>"Importa ed esporta"</strong>.
                    </li>
                    <li>
                      Carica il file <code>.ics</code> scaricato e clicca su <strong>"Importa"</strong>.
                    </li>
                  </ol>
                </div>
              )}

              {activeGuide === 'outlook' && (
                <div className="space-y-2">
                  <div className="font-bold text-[#2F3332] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#7C8B82]" /> Sincronizzazione con Microsoft Outlook:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[#666]">
                    <li>Scarica il file <strong>.ics</strong> dal pulsante in alto.</li>
                    <li>In Outlook fai clic su <strong>File</strong> → <strong>Apri ed esporta</strong>.</li>
                    <li>
                      Seleziona <strong>Importa/Esporta</strong> → <strong>Importa file iCalendar (.ics)</strong>.
                    </li>
                    <li>
                      Scegli se aggiungere gli eventi al tuo calendario principale o creare un nuovo calendario dedicato.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E0DED9] bg-[#FAF9F7] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#7C8B82] hover:bg-[#68766E] rounded-xl transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
