import React from 'react';
import { CalendarDays, Users, BarChart3, MoreHorizontal } from 'lucide-react';
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
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E0DED9] z-40 py-1 px-4 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onSelectTab('calendario')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'calendario' ? 'text-[#5B6760] font-bold' : 'text-[#888] hover:text-[#2F3332]'
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Calendario</span>
      </button>

      <button
        onClick={() => onSelectTab('congregazioni')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'congregazioni' ? 'text-[#5B6760] font-bold' : 'text-[#888] hover:text-[#2F3332]'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Congregazioni</span>
      </button>

      <button
        onClick={() => onSelectTab('situazione')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
          currentTab === 'situazione' ? 'text-[#5B6760] font-bold' : 'text-[#888] hover:text-[#2F3332]'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Situazione</span>
      </button>

      <button
        onClick={onOpenMore}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[#888] hover:text-[#2F3332] transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Altro</span>
      </button>
    </div>
  );
};
