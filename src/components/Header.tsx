import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  Cloud,
  CloudOff,
  Menu,
  UserCircle2,
  Calendar,
} from 'lucide-react';
import { AnnoSemestre } from '../types';
import { periodoLabel } from '../lib/periodoUtils';

interface HeaderProps {
  periodo: AnnoSemestre;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewWeek: () => void;
  onOpenSecurity: () => void;
  onOpenMobileMenu: () => void;
  username: string;
  isSyncing: boolean;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  periodo,
  onPrev,
  onNext,
  onToday,
  onNewWeek,
  onOpenSecurity,
  onOpenMobileMenu,
  username,
  isSyncing,
  isOnline,
}) => {
  const label = periodoLabel(periodo);

  return (
    <div className="mb-4">
      {/* ── MOBILE LAYOUT (< sm) ── */}
      <div className="sm:hidden flex flex-col gap-2.5">
        {/* Mobile Top Bar: Menu / Logo + Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Menu Hamburger + Titolo App */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl text-[#555] hover:text-[#2F3332] bg-white border border-[#E0DED9] hover:bg-[#FAF9F7] active:scale-95 transition-all cursor-pointer shrink-0 shadow-2xs"
              aria-label="Menu di navigazione"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-[#2F3332] tracking-tight">
                Calendario Visite
              </span>
            </div>
          </div>

          {/* Right Mobile Actions: Sync + Security + Nuovo */}
          <div className="flex items-center gap-1.5">
            {/* Sync Pill Icon */}
            <div
              className={`p-1.5 rounded-xl border text-[10px] font-bold transition-colors ${
                isSyncing
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : isOnline
                  ? 'bg-[#EBF1ED] border-[#D5E1D9] text-[#3E5949]'
                  : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}
              title={isSyncing ? 'Sincronizzazione in corso…' : isOnline ? 'Dati sincronizzati' : 'Offline – dati in locale'}
            >
              {isOnline ? (
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
              ) : (
                <CloudOff className="w-4 h-4" />
              )}
            </div>

            {/* Security */}
            <button
              onClick={onOpenSecurity}
              className="p-1.5 rounded-xl bg-white border border-[#E0DED9] text-[#5B6760] hover:bg-[#FAF9F7] active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="Sicurezza & Privacy"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* + Nuovo */}
            <button
              onClick={onNewWeek}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#7C8B82] hover:bg-[#68766E] text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuovo</span>
            </button>
          </div>
        </div>

        {/* Mobile Period Navigator: Full-Width Clean Pill */}
        <div className="flex items-center justify-between bg-white border border-[#E0DED9] rounded-2xl p-1 shadow-2xs">
          <button
            onClick={onPrev}
            className="p-2 rounded-xl text-[#777] hover:text-[#2F3332] hover:bg-[#FAF9F7] active:bg-[#F2EFEB] transition-colors cursor-pointer shrink-0"
            title="Periodo precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2 text-center min-w-0">
            <Calendar className="w-3.5 h-3.5 text-[#7C8B82] shrink-0" />
            <span className="text-xs font-extrabold text-[#2F3332] truncate">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToday}
              className="px-2.5 py-1 text-[11px] font-bold text-[#5B6760] hover:text-[#2F3332] hover:bg-[#FAF9F7] rounded-lg transition-colors cursor-pointer"
            >
              Oggi
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-xl text-[#777] hover:text-[#2F3332] hover:bg-[#FAF9F7] active:bg-[#F2EFEB] transition-colors cursor-pointer shrink-0"
              title="Periodo successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP & TABLET LAYOUT (>= sm) ── */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        {/* Left: mobile hamburger (tablet) + periodo navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#888] hover:text-[#2F3332] bg-white border border-[#E0DED9] hover:bg-[#FAF9F7] transition-all cursor-pointer shrink-0 shadow-2xs"
            aria-label="Menu di navigazione"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Period Navigation */}
          <div className="flex items-center gap-1 bg-white border border-[#E0DED9] rounded-2xl px-2 py-1.5 shadow-2xs">
            <button
              onClick={onPrev}
              className="p-1.5 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-[#FAF9F7] transition-colors cursor-pointer shrink-0"
              title="Periodo precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 text-center min-w-[170px] truncate">
              <span className="text-xs font-bold text-[#2F3332] tracking-wide">{label}</span>
            </div>

            <button
              onClick={onNext}
              className="p-1.5 rounded-lg text-[#888] hover:text-[#2F3332] hover:bg-[#FAF9F7] transition-colors cursor-pointer shrink-0"
              title="Periodo successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today button */}
          <button
            onClick={onToday}
            className="inline-flex items-center px-3 py-2 rounded-xl bg-white border border-[#E0DED9] text-xs font-bold text-[#5B6760] hover:bg-[#FAF9F7] transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            Oggi
          </button>
        </div>

        {/* Right: sync badge + user + security + new week */}
        <div className="flex items-center gap-2">
          {/* Sync status indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
              isSyncing
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : isOnline
                ? 'bg-[#EBF1ED] border-[#D5E1D9] text-[#3E5949]'
                : 'bg-stone-50 border-stone-200 text-stone-500'
            }`}
            title={isSyncing ? 'Sincronizzazione in corso…' : isOnline ? 'Dati sincronizzati' : 'Offline – dati in locale'}
          >
            {isOnline ? (
              <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse' : ''}`} />
            ) : (
              <CloudOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">
              {isSyncing ? 'Sincronizzazione…' : isOnline ? 'Sincronizzato' : 'Offline'}
            </span>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EBF1ED] rounded-xl border border-[#D5E1D9] text-xs font-bold text-[#3E5949]">
            <UserCircle2 className="w-4 h-4" />
            <span className="hidden md:inline">{username}</span>
          </div>

          {/* Security / Privacy */}
          <button
            id="btn-security"
            onClick={onOpenSecurity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E0DED9] text-xs font-bold text-[#5B6760] hover:bg-[#FAF9F7] transition-colors cursor-pointer shadow-2xs"
            title="Sicurezza & Privacy"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden lg:inline">Sicurezza</span>
          </button>

          {/* New week */}
          <button
            id="btn-new-week"
            onClick={onNewWeek}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C8B82] hover:bg-[#68766E] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
