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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sincronizza con Calendario Personale
              </h3>
              <p className="text-xs text-slate-500">
                Google Calendar, Apple Calendar (iPhone, Mac), Outlook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main Action: Export .ics */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Esportazione Universale iCalendar (.ics)
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Include <strong>{settimane.length}</strong> settimane/visite e{' '}
                  <strong>{appuntamenti.length}</strong> appuntamenti con orari precisi.
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadICS}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-500/25 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>File .ics Scaricato con Successo!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Scarica File Calendario (.ics)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Compatibile al 100% con Apple Calendar, Google Calendar e Microsoft Outlook.
            </p>
          </div>

          {/* Quick Action: Current Week to Google Calendar */}
          {currentWeek && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  Aggiungi questa settimana a Google Calendar
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentWeek.dettagli || 'Visita'} ({currentWeek.periodo})
                </div>
              </div>
              <button
                onClick={handleOpenGoogleCurrentWeek}
                className="shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Apri Google</span>
              </button>
            </div>
          )}

          {/* Guides / Instructions Tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-800">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Come importare sui tuoi dispositivi
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setActiveGuide('apple')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'apple'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                iPhone / iPad
              </button>
              <button
                onClick={() => setActiveGuide('mac')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'mac'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mac (macOS)
              </button>
              <button
                onClick={() => setActiveGuide('google')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'google'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Google Cal
              </button>
              <button
                onClick={() => setActiveGuide('outlook')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeGuide === 'outlook'
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Outlook
              </button>
            </div>

            {/* Guide Content */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              {activeGuide === 'apple' && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Sincronizzazione con iPhone o iPad:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
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
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-blue-600" /> Sincronizzazione con Mac (Calendario.app):
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
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
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-600" /> Sincronizzazione con Google Calendar:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Scarica il file <strong>.ics</strong> dal pulsante in alto.</li>
                    <li>
                      Accedi a{' '}
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline font-semibold"
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
                      Carica il file <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-700">.ics</code> scaricato e clicca su <strong>"Importa"</strong>.
                    </li>
                  </ol>
                </div>
              )}

              {activeGuide === 'outlook' && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Sincronizzazione con Microsoft Outlook:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
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
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
