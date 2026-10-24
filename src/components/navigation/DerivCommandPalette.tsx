import React, { useState, useEffect, useRef } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { DerivNavTab } from '../layout/DerivSidebar';
import { SyntheticAssetId } from '../../types/deriv';
import {
  Search,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Bot,
  Settings,
  PlusCircle,
  Play,
  Pause,
  X,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DerivCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: DerivNavTab) => void;
  onOpenDeposit: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Trading & Synthetics' | 'Cashier' | 'DBot Automations';
  label: string;
  sublabel?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const DerivCommandPalette: React.FC<DerivCommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenDeposit,
}) => {
  const {
    assets,
    setSelectedAssetId,
    isBotRunning,
    toggleBot,
  } = useDeriv();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dash',
      category: 'Navigation',
      label: "Trader's Dashboard",
      sublabel: 'Overview of platforms, cashier & strategy flowchart',
      shortcut: 'Ctrl+1',
      icon: <LayoutDashboard className="w-4 h-4 text-[#ff444f]" />,
      action: () => {
        setActiveTab('dashboard');
        onClose();
      },
    },
    {
      id: 'nav-cashier',
      category: 'Navigation',
      label: 'Wallet & Cashier',
      sublabel: 'Deposit, withdrawal, and internal multi-wallet transfers',
      shortcut: 'Ctrl+2',
      icon: <Wallet className="w-4 h-4 text-[#00c853]" />,
      action: () => {
        setActiveTab('cashier');
        onClose();
      },
    },
    {
      id: 'nav-platforms',
      category: 'Navigation',
      label: 'Trading Platforms (DTrader & MT5)',
      sublabel: 'Options terminal, multipliers, and CFDs',
      shortcut: 'Ctrl+3',
      icon: <TrendingUp className="w-4 h-4 text-[#2962ff]" />,
      action: () => {
        setActiveTab('platforms');
        onClose();
      },
    },
    {
      id: 'nav-dbot',
      category: 'Navigation',
      label: 'DBot Strategy Studio',
      sublabel: 'Algorithmic strategy builder & autonomous execution',
      shortcut: 'Ctrl+4',
      icon: <Bot className="w-4 h-4 text-[#00c853]" />,
      action: () => {
        setActiveTab('dbot');
        onClose();
      },
    },
    {
      id: 'nav-mt5bot',
      category: 'Navigation',
      label: 'MT5 Python Bot (Risk-Managed Forex)',
      sublabel: 'EURUSD M15 MA crossover with 3% daily drawdown guard & dynamic lots',
      shortcut: 'Ctrl+5',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setActiveTab('mt5bot');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      label: 'Account Settings & Verification',
      sublabel: 'API tokens, proof of identity, and audio preferences',
      shortcut: 'Ctrl+6',
      icon: <Settings className="w-4 h-4 text-[#8592a6]" />,
      action: () => {
        setActiveTab('settings');
        onClose();
      },
    },

    // Cashier Actions
    {
      id: 'act-deposit',
      category: 'Cashier',
      label: 'Instant Cashier Deposit',
      sublabel: 'Fund wallet via Card, Crypto (Tether/BTC) or E-Wallets',
      icon: <PlusCircle className="w-4 h-4 text-[#ff444f]" />,
      action: () => {
        onClose();
        onOpenDeposit();
      },
    },

    // DBot Actions
    {
      id: 'act-bot',
      category: 'DBot Automations',
      label: isBotRunning ? 'Pause DBot Engine' : 'Start Automated DBot Strategy',
      sublabel: 'Execute Martingale Rise/Fall on RSI < 30',
      icon: isBotRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-[#00c853]" />,
      action: () => {
        toggleBot();
        onClose();
      },
    },

    // Synthetic Instruments
    ...assets.map(asset => ({
      id: `asset-${asset.id}`,
      category: 'Trading & Synthetics' as const,
      label: `Switch to ${asset.name}`,
      sublabel: `$${asset.price.toFixed(asset.decimals)} · ${asset.category} (${asset.change24h >= 0 ? '+' : ''}${asset.change24h}%)`,
      icon: <Zap className="w-4 h-4 text-[#ff444f]" />,
      action: () => {
        setSelectedAssetId(asset.id);
        setActiveTab('platforms');
        onClose();
      },
    })),
  ];

  const filtered = commands.filter(c => {
    const q = query.toLowerCase();
    return (
      c.label.toLowerCase().includes(q) ||
      (c.sublabel && c.sublabel.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#1b263b] border border-[#293548] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#293548] bg-[#0e1726]">
          <Search className="w-5 h-5 text-[#8592a6] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Deriv hub, synthetics, cashier, or DBot..."
            className="w-full bg-transparent text-sm text-white placeholder:text-[#8592a6] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#8592a6] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#8592a6] bg-[#1b263b] border border-[#293548] rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2 flex flex-col gap-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#ff444f]/15 text-[#ff444f] border border-[#ff444f]/30'
                      : 'hover:bg-[#0e1726] text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-[#0e1726] rounded-lg shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate text-white">
                          {item.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0e1726] text-[#8592a6] hidden sm:inline">
                          {item.category}
                        </span>
                      </div>
                      {item.sublabel && (
                        <span className="text-[11px] text-[#8592a6] truncate">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <kbd className="px-2 py-0.5 text-[10px] font-mono text-[#8592a6] bg-[#0e1726] border border-[#293548] rounded shrink-0 ml-2">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#8592a6]">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No matching commands or synthetics found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0e1726] border-t border-[#293548] flex items-center justify-between text-[11px] text-[#8592a6] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#1b263b] rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#1b263b] rounded text-[10px]">↓</kbd>
              <span className="font-sans ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#1b263b] rounded text-[10px]">↵</kbd>
              <span className="font-sans ml-0.5">Select</span>
            </span>
          </div>
          <span className="font-sans text-[#8592a6] hidden sm:inline">
            Deriv Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
