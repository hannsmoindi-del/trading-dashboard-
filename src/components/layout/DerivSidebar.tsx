import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Bot,
  Settings,
  Zap,
  X,
  Keyboard,
  ShieldCheck,
  Search
} from 'lucide-react';

export type DerivNavTab = 'dashboard' | 'cashier' | 'platforms' | 'dbot' | 'mt5bot' | 'settings';

interface DerivSidebarProps {
  activeTab: DerivNavTab;
  setActiveTab: (tab: DerivNavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
}

export const DerivSidebar: React.FC<DerivSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenCommandPalette,
  onOpenShortcuts,
}) => {
  const navItems: { id: DerivNavTab; label: string; icon: React.ReactNode; shortcut: string; badge?: string }[] = [
    {
      id: 'dashboard',
      label: "Trader's Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      shortcut: 'Ctrl+1',
    },
    {
      id: 'cashier',
      label: 'Wallet & Cashier',
      icon: <Wallet className="w-4 h-4" />,
      shortcut: 'Ctrl+2',
    },
    {
      id: 'platforms',
      label: 'Trading Platforms',
      icon: <TrendingUp className="w-4 h-4" />,
      shortcut: 'Ctrl+3',
    },
    {
      id: 'dbot',
      label: 'DBot Strategies',
      icon: <Bot className="w-4 h-4" />,
      shortcut: 'Ctrl+4',
    },
    {
      id: 'mt5bot',
      label: 'MT5 Python Bot',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      shortcut: 'Ctrl+5',
      badge: 'PRO',
    },
    {
      id: 'settings',
      label: 'Account Settings',
      icon: <Settings className="w-4 h-4" />,
      shortcut: 'Ctrl+6',
    },
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

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#111927] border-r border-[#293548] flex flex-col justify-between p-6 transform transition-transform duration-200 ease-in-out md:translate-x-0 shrink-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Area */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5 text-xl font-extrabold text-[#ff444f] tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff444f]/15 text-[#ff444f] border border-[#ff444f]/30">
                <Zap className="w-5 h-5 fill-current" />
              </span>
              <span>Deriv <span className="text-white font-medium text-base">Hub</span></span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 text-[#8592a6] hover:text-white md:hidden rounded-lg hover:bg-[#1b263b]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search / Command Palette shortcut trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={() => {
                onOpenCommandPalette();
                onClose();
              }}
              className="w-full mb-4 flex items-center justify-between px-3 py-2 bg-[#0e1726] hover:bg-[#1b263b] border border-[#293548] text-[#8592a6] hover:text-white rounded-lg text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#8592a6] group-hover:text-[#ff444f] transition-colors" />
                <span>Search hub...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-[#1b263b] text-[#8592a6] rounded text-[10px] font-mono border border-[#293548]">
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Nav Menu */}
          <ul className="flex flex-col gap-2 list-none">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#ff444f]/10 text-[#ff444f] font-semibold border-l-3 border-[#ff444f]'
                        : 'text-[#8592a6] hover:text-white hover:bg-[#1b263b]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span className="flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </div>
                    <kbd className="text-[10px] font-mono text-[#8592a6]/70 bg-[#0e1726] px-1.5 py-0.5 rounded border border-[#293548] hidden sm:inline">
                      {item.shortcut}
                    </kbd>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Status Card */}
        <div className="pt-4 border-t border-[#293548] flex flex-col gap-2.5">
          {onOpenShortcuts && (
            <button
              onClick={() => {
                onOpenShortcuts();
                onClose();
              }}
              className="flex items-center justify-between p-2 rounded-lg bg-[#0e1726]/60 hover:bg-[#1b263b] text-[#8592a6] hover:text-white border border-[#293548] text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-[#2962ff]" />
                <span className="text-[11px]">Pro Hotkeys</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-[#1b263b] border border-[#293548] rounded text-[10px] font-mono text-white">
                ?
              </kbd>
            </button>
          )}

          <div className="bg-[#1b263b]/60 border border-[#293548] rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#8592a6] text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse"></span>
                Deriv Server
              </span>
              <span className="text-[#00c853] font-mono text-[11px]">Online</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#8592a6]">Account CR:</span>
              <span className="text-white font-mono">CR984210</span>
            </div>
          </div>
          <div className="text-[11px] text-[#8592a6] text-center font-mono">
            Trader's Hub v3.2
          </div>
        </div>
      </aside>
    </>
  );
};
