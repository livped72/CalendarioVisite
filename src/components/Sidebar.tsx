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
    <aside className="w-64 bg-white/95 backdrop-blur-md text-slate-700 flex flex-col h-full select-none shadow-lg border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-slate-900 font-extrabold text-base leading-tight tracking-tight">Calendario</span>
          <span className="text-blue-600 font-bold text-xs leading-tight">Visite</span>
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
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Security Quick Button & User Profile Footer */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        {onOpenSecurity && (
          <button
            onClick={() => { onOpenSecurity(); onCloseMobile?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Sicurezza &amp; Privacy</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('impostazioni')}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all text-left group cursor-pointer border border-transparent hover:border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-extrabold text-blue-700 shrink-0">
            {user.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate leading-tight">{user.nome}</div>
            <div className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">{user.email}</div>
          </div>
        </button>

        {onLogout && (
          <button
            onClick={() => { onLogout(); onCloseMobile?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
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
