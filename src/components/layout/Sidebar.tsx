import React from 'react';
import { LayoutDashboard, BarChart2, Briefcase, Wallet, Settings, TrendingUp, X, Keyboard, Search } from 'lucide-react';

export type NavigationTab = 'dashboard' | 'markets' | 'portfolio' | 'wallet' | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, shortcut: 'Ctrl+1' },
    { id: 'markets', label: 'Markets', icon: <BarChart2 className="w-4 h-4" />, shortcut: 'Ctrl+2' },
    { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-4 h-4" />, shortcut: 'Ctrl+3' },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" />, shortcut: 'Ctrl+4' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, shortcut: 'Ctrl+5' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight font-sans">
                Apex<span className="text-blue-500">Trade</span>
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Command Palette Launcher */}
          {onOpenCommandPalette && (
            <button
              onClick={() => {
                onOpenCommandPalette();
                onClose();
              }}
              className="w-full mb-4 flex items-center justify-between px-3 py-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                <span className="font-sans">Command Palette</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700">
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <kbd className="text-[10px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800 px-1.5 py-0.2 rounded hidden sm:inline">
                    {item.shortcut}
                  </kbd>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status Widget & Shortcuts helper */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
          {onOpenShortcutsHelp && (
            <button
              onClick={() => {
                onOpenShortcutsHelp();
                onClose();
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/60 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-sans text-[11px]">Pro Hotkeys</span>
              </div>
              <kbd className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
                ?
              </kbd>
            </button>
          )}

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Server Engine</span>
              <span className="text-emerald-400 text-[11px] font-mono">Live Sync</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-slate-400 text-[11px]">Matching Engine</span>
              <span className="text-slate-300 text-[11px] font-mono">0.05% Maker</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center font-mono">
            ApexTrade Pro v2.4
          </div>
        </div>
      </aside>
    </>
  );
};
