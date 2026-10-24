import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { NavigationTab } from './Sidebar';
import { Menu, PlusCircle, TrendingUp, TrendingDown, X, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onQuickDeposit: () => void;
  onOpenAlertsDrawer: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcutsHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onQuickDeposit,
  onOpenAlertsDrawer,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
}) => {
  const {
    totalEquity,
    currentAsset,
    notification,
    clearNotification,
    lastTickSide,
    activeAlertsCount,
    triggeredAlertsCount,
  } = useTrading();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'markets':
        return 'Markets & Screener';
      case 'portfolio':
        return 'Portfolio Analytics';
      case 'wallet':
        return 'Wallet & Capital';
      case 'settings':
        return 'Settings & Preferences';
      default:
        return 'Dashboard Overview';
    }
  };

  const isPositive = currentAsset.change24h >= 0;

  return (
    <header className="relative h-18 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
      {/* Left: Mobile Toggle, Page Title & Live Ticker */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 text-slate-400 hover:text-slate-100 md:hidden rounded-lg hover:bg-slate-800 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-sans tracking-tight">
          {getTitle()}
        </h2>

        {/* Live Active Instrument Ticker Badge */}
        {activeTab === 'dashboard' && (
          <div className="hidden lg:flex items-center gap-2 ml-4 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs">
            <span className="font-semibold text-slate-200">{currentAsset.symbol}</span>
            <span className={`font-mono font-bold transition-colors ${
              lastTickSide === 'up' ? 'text-emerald-400' : (lastTickSide === 'down' ? 'text-rose-400' : 'text-slate-100')
            }`}>
              ${currentAsset.price.toLocaleString(undefined, { minimumFractionDigits: currentAsset.decimals })}
            </span>
            <span className={`inline-flex items-center text-[11px] font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {isPositive ? '+' : ''}{currentAsset.change24h.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Middle/Right: Command Palette search trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-950/70 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
        title="Open Command Palette (Ctrl+K)"
      >
        <span className="font-sans">Search commands or pairs...</span>
        <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono border border-slate-700">
          Ctrl+K
        </kbd>
      </button>

      {/* Right: Shortcuts help, Alerts Bell, Deposit & Balance */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Shortcuts Cheatsheet Button */}
        <button
          onClick={onOpenShortcutsHelp}
          title="Keyboard Shortcuts (?)"
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <kbd className="font-mono text-xs font-bold text-slate-400 hover:text-slate-200 px-1.5 py-0.5 border border-slate-700 rounded bg-slate-950">
            ?
          </kbd>
        </button>

        {/* Price Alerts Bell Button */}
        <button
          onClick={onOpenAlertsDrawer}
          title="View Price Alerts"
          className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {triggeredAlertsCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950 shadow-md">
              {triggeredAlertsCount}
            </span>
          ) : activeAlertsCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
          ) : null}
        </button>

        {/* Quick Deposit Button */}
        <button
          onClick={onQuickDeposit}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Deposit</span>
        </button>

        {/* Total Balance Card from original design */}
        <div className="bg-slate-950/80 px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center text-xs text-slate-400">
          <span className="hidden sm:inline mr-1">Total Balance:</span>
          <span className="text-emerald-400 font-bold font-mono text-sm sm:text-base ml-1">
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 top-20 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-medium animate-in fade-in duration-200 max-w-lg ${
            notification.message.includes('Price Alert')
              ? 'bg-amber-950/95 border-amber-500/50 text-amber-200 shadow-amber-950/40'
              : notification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30'
              : notification.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200 shadow-rose-950/30'
              : 'bg-slate-900/95 border-blue-500/40 text-blue-200 shadow-slate-950/30'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="flex-1">{notification.message}</span>
          {notification.message.includes('Price Alert') && (
            <button
              onClick={() => {
                clearNotification();
                onOpenAlertsDrawer();
              }}
              className="text-[11px] underline text-amber-300 hover:text-white px-1 whitespace-nowrap cursor-pointer"
            >
              View
            </button>
          )}
          <button
            onClick={clearNotification}
            className="p-1 text-slate-400 hover:text-white rounded ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
