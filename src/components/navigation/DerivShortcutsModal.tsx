import React from 'react';
import { Keyboard, X, Zap, Compass, ShieldCheck } from 'lucide-react';

interface DerivShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DerivShortcutsModal: React.FC<DerivShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navigation & Hub Views',
      icon: <Compass className="w-4 h-4 text-[#2962ff]" />,
      shortcuts: [
        { keys: ['Ctrl', 'K'], desc: 'Open Command Palette & symbol search' },
        { keys: ['Ctrl', '1'], desc: "Jump to Trader's Dashboard" },
        { keys: ['Ctrl', '2'], desc: 'Jump to Wallet & Cashier' },
        { keys: ['Ctrl', '3'], desc: 'Jump to Trading Platforms (DTrader / MT5)' },
        { keys: ['Ctrl', '4'], desc: 'Jump to DBot Strategy Studio' },
        { keys: ['Ctrl', '5'], desc: 'Jump to MT5 Python Bot Studio' },
        { keys: ['Ctrl', '6'], desc: 'Jump to Account Settings' },
      ],
    },
    {
      title: 'Controls & General',
      icon: <Zap className="w-4 h-4 text-[#ff444f]" />,
      shortcuts: [
        { keys: ['?'], desc: 'Open Keyboard Shortcuts cheatsheet' },
        { keys: ['Esc'], desc: 'Close open dialogs, drawers, or palettes' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#1b263b] border border-[#293548] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8592a6] hover:text-white p-1 rounded-lg hover:bg-[#0e1726] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#ff444f]/20 text-[#ff444f] flex items-center justify-center border border-[#ff444f]/30">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Deriv Pro Keyboard Shortcuts
            </h3>
            <p className="text-xs text-[#8592a6]">
              Rapid navigation and terminal controls for professional traders
            </p>
          </div>
        </div>

        {/* Groups */}
        <div className="flex flex-col gap-4">
          {shortcutGroups.map(group => (
            <div key={group.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                {group.icon}
                <span>{group.title}</span>
              </div>
              <div className="bg-[#0e1726] border border-[#293548] rounded-xl p-3 flex flex-col gap-2">
                {group.shortcuts.map(s => (
                  <div
                    key={s.desc}
                    className="flex items-center justify-between text-xs py-0.5"
                  >
                    <span className="text-[#8592a6]">{s.desc}</span>
                    <div className="flex items-center gap-1 font-mono">
                      {s.keys.map(k => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 bg-[#1b263b] text-white border border-[#293548] rounded text-[11px] font-semibold"
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

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#ff444f] hover:bg-[#ff444f]/90 text-white rounded-lg transition-colors cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
