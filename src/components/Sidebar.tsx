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
    { id: 'appuntamenti' as TabNav, label: 'Appuntamenti', icon: CalendarCheck2 },
    { id: 'impostazioni' as TabNav, label: 'Impostazioni', icon: Settings },
    { id: 'aiuto' as TabNav, label: 'Aiuto', icon: HelpCircle },
  ];

  const content = (
    <aside className="w-64 bg-[#0A101D] text-[#CBD5E1] flex flex-col h-full select-none shadow-2xl border-r border-[#192744]">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-[#192744]">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-950/50 ring-1 ring-white/10">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-base leading-tight tracking-tight">Calendario</span>
          <span className="text-blue-400 font-medium text-xs leading-tight">Visite</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id || (item.id === 'appuntamenti' && currentTab === ('situazione' as TabNav));
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#142342]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400/80'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Security Quick Button & User Profile Footer */}
      <div className="p-3 border-t border-[#192744] space-y-2 bg-[#070D18]">
        {onOpenSecurity && (
          <button
            onClick={() => { onOpenSecurity(); onCloseMobile?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#101D36] text-blue-200 hover:bg-[#16274A] hover:text-white transition-colors cursor-pointer border border-[#1E3A5F]"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Sicurezza &amp; Privacy</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('impostazioni')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#101D36] transition-colors text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate leading-tight">{user.nome}</div>
            <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">{user.email}</div>
          </div>
        </button>

        {onLogout && (
          <button
            onClick={() => { onLogout(); onCloseMobile?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
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
