import React from 'react';
import {
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  CalendarCheck2,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { TabNav, UserProfile } from '../types';

interface SidebarProps {
  currentTab: TabNav;
  onSelectTab: (tab: TabNav) => void;
  user: UserProfile;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSecurity?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isOpenMobile = false,
  onCloseMobile,
  onOpenSecurity,
  onLogout,
}) => {
  const navItems = [
    { id: 'calendario' as TabNav, label: 'Calendario', icon: CalendarDays },
    { id: 'congregazioni' as TabNav, label: 'Congregazioni', icon: Users },
    { id: 'situazione' as TabNav, label: 'Situazione visite', icon: BarChart3 },
    { id: 'impostazioni' as TabNav, label: 'Impostazioni', icon: Settings },
    { id: 'aiuto' as TabNav, label: 'Aiuto', icon: HelpCircle },
  ];

  const content = (
    <aside className="w-64 bg-[#18201D] text-[#D4DDD8] flex flex-col h-full select-none shadow-xl border-r border-[#26312C]">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-[#26312C]">
        <div className="w-10 h-10 rounded-xl bg-[#7C8B82] flex items-center justify-center text-white shadow-md ring-1 ring-white/10">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-base leading-tight tracking-tight">Calendario</span>
          <span className="text-[#9BAAA2] font-medium text-xs leading-tight">Visite</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-[#7C8B82] text-white shadow-md shadow-[#7C8B82]/20'
                  : 'text-[#B8C4BD] hover:text-white hover:bg-[#26312C]/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8E9E95]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Security Quick Button & User Profile Footer */}
      <div className="p-3 border-t border-[#26312C] space-y-2 bg-[#141A18]/80">
        {onOpenSecurity && (
          <button
            onClick={() => { onOpenSecurity(); onCloseMobile?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#26312C]/60 text-[#B8C4BD] hover:bg-[#26312C] hover:text-white transition-colors cursor-pointer border border-[#324039]"
          >
            <ShieldCheck className="w-4 h-4 text-[#7C8B82]" />
            <span>Sicurezza &amp; Privacy</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('impostazioni')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#26312C]/60 transition-colors text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#7C8B82]/30 border border-[#7C8B82] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate leading-tight">{user.nome}</div>
            <div className="text-[11px] text-[#8E9E95] truncate leading-tight mt-0.5">{user.email}</div>
          </div>
        </button>

        {onLogout && (
          <button
            onClick={() => { onLogout(); onCloseMobile?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-900/30 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci (Logout)</span>
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">{content}</div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
