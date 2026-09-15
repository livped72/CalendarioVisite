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
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E0DED9] z-40 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.6rem)] px-3 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onSelectTab('calendario')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[64px] ${
          currentTab === 'calendario' ? 'text-[#5B6760] font-bold' : 'text-[#888] hover:text-[#2F3332]'
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Calendario</span>
      </button>

      <button
        onClick={() => onSelectTab('congregazioni')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[64px] ${
          currentTab === 'congregazioni' ? 'text-[#5B6760] font-bold' : 'text-[#888] hover:text-[#2F3332]'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Congregazioni</span>
      </button>

      <button
        onClick={() => onSelectTab('appuntamenti')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[64px] ${
          isAppuntamenti ? 'text-[#5B6760] font-bold' : 'text-[#888] hover:text-[#2F3332]'
        }`}
      >
        <CalendarCheck2 className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Appuntamenti</span>
      </button>

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[#888] hover:text-[#2F3332] transition-colors cursor-pointer min-w-[64px]"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Altro</span>
      </button>
    </div>
  );
};
