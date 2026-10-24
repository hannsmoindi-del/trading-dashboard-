import React, { useState, useEffect, useRef } from 'react';
import { useTrading } from '../../context/TradingContext';
import { NavigationTab } from '../layout/Sidebar';
import {
  Search,
  LayoutDashboard,
  BarChart2,
  Briefcase,
  Wallet,
  Settings,
  TrendingUp,
  TrendingDown,
  Bell,
  PlusCircle,
  BarChart3,
  Volume2,
  Keyboard,
  ArrowRight,
  Zap,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenQuickBuy: () => void;
  onOpenQuickSell: () => void;
  onOpenDeposit: () => void;
  onOpenAlertsDrawer: () => void;
  onOpenShortcutsHelp: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Trade Actions' | 'Instruments' | 'Tools';
  label: string;
  sublabel?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenQuickBuy,
  onOpenQuickSell,
  onOpenDeposit,
  onOpenAlertsDrawer,
  onOpenShortcutsHelp,
}) => {
  const {
    assets,
    setSelectedSymbol,
    openCreateAlertModal,
    chartType,
    setChartType,
    soundEnabled,
    setSoundEnabled,
  } = useTrading();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Build command items list
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      label: 'Go to Dashboard',
      sublabel: 'Trading terminal & active chart',
      shortcut: 'Ctrl+1',
      icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />,
      action: () => {
        setActiveTab('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-markets',
      category: 'Navigation',
      label: 'Go to Markets Screener',
      sublabel: 'Overview of all trading pairs & volumes',
      shortcut: 'Ctrl+2',
      icon: <BarChart2 className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab('markets');
        onClose();
      },
    },
    {
      id: 'nav-portfolio',
      category: 'Navigation',
      label: 'Go to Portfolio Analytics',
      sublabel: 'Allocation donut & historical performance',
      shortcut: 'Ctrl+3',
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
      action: () => {
        setActiveTab('portfolio');
        onClose();
      },
    },
    {
      id: 'nav-wallet',
      category: 'Navigation',
      label: 'Go to Wallet & Funding',
      sublabel: 'Deposit test funds & transaction ledger',
      shortcut: 'Ctrl+4',
      icon: <Wallet className="w-4 h-4 text-purple-400" />,
      action: () => {
        setActiveTab('wallet');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      label: 'Go to Settings',
      sublabel: 'Terminal preferences & audio alerts',
      shortcut: 'Ctrl+5',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      action: () => {
        setActiveTab('settings');
        onClose();
      },
    },

    // Trade Actions
    {
      id: 'act-buy',
      category: 'Trade Actions',
      label: 'Quick Buy / Long Order',
      sublabel: 'Instant execution at market price',
      shortcut: 'Ctrl+B',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onClose();
        onOpenQuickBuy();
      },
    },
    {
      id: 'act-sell',
      category: 'Trade Actions',
      label: 'Quick Sell / Short Order',
      sublabel: 'Instant execution at market price',
      shortcut: 'Ctrl+S',
      icon: <Zap className="w-4 h-4 text-rose-400" />,
      action: () => {
        onClose();
        onOpenQuickSell();
      },
    },
    {
      id: 'act-alert',
      category: 'Trade Actions',
      label: 'Create Price Alert',
      sublabel: 'Set visual trigger for market crossing',
      shortcut: 'Alt+A',
      icon: <Bell className="w-4 h-4 text-amber-400" />,
      action: () => {
        onClose();
        openCreateAlertModal();
      },
    },

    // Instruments
    ...assets.map(asset => ({
      id: `asset-${asset.symbol}`,
      category: 'Instruments' as const,
      label: `Switch to ${asset.symbol}`,
      sublabel: `${asset.name} · $${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })} (${asset.change24h >= 0 ? '+' : ''}${asset.change24h}%)`,
      icon: asset.change24h >= 0 ? (
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      ) : (
        <TrendingDown className="w-4 h-4 text-rose-400" />
      ),
      action: () => {
        setSelectedSymbol(asset.symbol);
        setActiveTab('dashboard');
        onClose();
      },
    })),

    // Tools
    {
      id: 'tool-deposit',
      category: 'Tools',
      label: 'Deposit Test Demo Capital',
      sublabel: 'Add funds to wallet via instant faucet',
      icon: <PlusCircle className="w-4 h-4 text-blue-400" />,
      action: () => {
        onClose();
        onOpenDeposit();
      },
    },
    {
      id: 'tool-alerts-drawer',
      category: 'Tools',
      label: 'Open Price Alerts Drawer',
      sublabel: 'Review active and triggered price alerts',
      icon: <Bell className="w-4 h-4 text-amber-400" />,
      action: () => {
        onClose();
        onOpenAlertsDrawer();
      },
    },
    {
      id: 'tool-chart-toggle',
      category: 'Tools',
      label: `Switch Chart to ${chartType === 'candles' ? 'Line Mountain' : 'Candlestick'}`,
      sublabel: 'Toggle technical chart visual mode',
      icon: <BarChart3 className="w-4 h-4 text-slate-300" />,
      action: () => {
        setChartType(chartType === 'candles' ? 'line' : 'candles');
        onClose();
      },
    },
    {
      id: 'tool-sound-toggle',
      category: 'Tools',
      label: `Turn Audio Cues ${soundEnabled ? 'Off' : 'On'}`,
      sublabel: 'Toggle synthesized Web Audio feedback',
      icon: <Volume2 className="w-4 h-4 text-slate-300" />,
      action: () => {
        setSoundEnabled(!soundEnabled);
        onClose();
      },
    },
    {
      id: 'tool-shortcuts-help',
      category: 'Tools',
      label: 'Keyboard Shortcuts Cheatsheet',
      sublabel: 'View all terminal hotkeys and controls',
      shortcut: '?',
      icon: <Keyboard className="w-4 h-4 text-slate-400" />,
      action: () => {
        onClose();
        onOpenShortcutsHelp();
      },
    },
  ];

  // Filter commands by query
  const filteredCommands = commands.filter(cmd => {
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      (cmd.sublabel && cmd.sublabel.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation within the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search symbol (e.g., BTC, Buy, Portfolio)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 flex flex-col gap-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'hover:bg-slate-800/60 text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-slate-800 rounded-lg shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="flex flex-col min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-sans truncate text-slate-100">
                          {cmd.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 font-sans hidden sm:inline">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.sublabel && (
                        <span className="text-[11px] text-slate-400 truncate font-sans">
                          {cmd.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 rounded shrink-0 ml-2">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 font-sans">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs">No matching commands or assets found</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Try searching for 'Buy', 'Markets', 'BTC', or 'Deposit'
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Help */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">↓</kbd>
              <span className="font-sans ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px]">↵</kbd>
              <span className="font-sans ml-0.5">Select</span>
            </span>
          </div>
          <span className="font-sans text-slate-500 hidden sm:inline">
            ApexTrade Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
