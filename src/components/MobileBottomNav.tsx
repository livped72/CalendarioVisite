import React from 'react';
import { CalendarDays, Users, CalendarCheck2, MoreHorizontal } from 'lucide-react';
import { TabNav } from '../types';

interface MobileBottomNavProps {
  currentTab: TabNav;
  onSelectTab: (tab: TabNav) => void;
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMore,
}) => {
  const isAppuntamenti = currentTab === 'appuntamenti' || currentTab === ('situazione' as TabNav);

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0C1424]/95 backdrop-blur-md border-t border-[#192744] z-40 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.6rem)] px-3 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onSelectTab('calendario')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[64px] ${
          currentTab === 'calendario' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Calendario</span>
      </button>

      <button
        onClick={() => onSelectTab('congregazioni')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[64px] ${
          currentTab === 'congregazioni' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Congregazioni</span>
      </button>

      <button
        onClick={() => onSelectTab('appuntamenti')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[64px] ${
          isAppuntamenti ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
        }`}
      >
        <CalendarCheck2 className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Appuntamenti</span>
      </button>

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer min-w-[64px]"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Altro</span>
      </button>
    </div>
  );
};
