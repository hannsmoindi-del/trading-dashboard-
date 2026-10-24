import React from 'react';
import { Keyboard, X, Zap, Compass, BarChart2, ShieldCheck } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Quick Order Execution',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      shortcuts: [
        { keys: ['Ctrl', 'B'], desc: 'Open Quick Buy / Long dialog' },
        { keys: ['Ctrl', 'S'], desc: 'Open Quick Sell / Short dialog' },
        { keys: ['Alt', 'A'], desc: 'Set Price Alert for active asset' },
      ],
    },
    {
      title: 'Global Navigation & Search',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      shortcuts: [
        { keys: ['Ctrl', 'K'], desc: 'Open Command Palette & symbol search' },
        { keys: ['Ctrl', '1'], desc: 'Jump to Dashboard Overview' },
        { keys: ['Ctrl', '2'], desc: 'Jump to Markets Screener' },
        { keys: ['Ctrl', '3'], desc: 'Jump to Portfolio Analytics' },
        { keys: ['Ctrl', '4'], desc: 'Jump to Wallet & Capital' },
        { keys: ['Ctrl', '5'], desc: 'Jump to Settings & Preferences' },
      ],
    },
    {
      title: 'Chart & General Controls',
      icon: <BarChart2 className="w-4 h-4 text-amber-400" />,
      shortcuts: [
        { keys: ['C'], desc: 'Toggle Candlestick / Line chart style' },
        { keys: ['?'], desc: 'Open Keyboard Shortcuts cheatsheet' },
        { keys: ['Esc'], desc: 'Close open dialogs, drawers, or palettes' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans">
              Pro Keyboard Shortcuts
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Rapid navigation and order execution controls for professional traders
            </p>
          </div>
        </div>

        {/* Groups */}
        <div className="flex flex-col gap-5">
          {shortcutGroups.map(group => (
            <div key={group.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-sans">
                {group.icon}
                <span>{group.title}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
                {group.shortcuts.map(s => (
                  <div
                    key={s.desc}
                    className="flex items-center justify-between text-xs py-0.5"
                  >
                    <span className="text-slate-400 font-sans">{s.desc}</span>
                    <div className="flex items-center gap-1 font-mono">
                      {s.keys.map(k => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] font-semibold shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-5 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-sans">
            On macOS, <kbd className="px-1 py-0.2 bg-slate-800 rounded font-mono text-[10px]">Cmd ⌘</kbd> can be used interchangeably with <kbd className="px-1 py-0.2 bg-slate-800 rounded font-mono text-[10px]">Ctrl</kbd>.
          </span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
