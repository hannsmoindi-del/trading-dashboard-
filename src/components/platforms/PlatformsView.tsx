import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { SyntheticAssetId } from '../../types/deriv';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowUp,
  ArrowDown,
  Terminal,
  Bot
} from 'lucide-react';

interface PlatformsViewProps {
  onOpenMT5Bot?: () => void;
}

export const PlatformsView: React.FC<PlatformsViewProps> = ({ onOpenMT5Bot }) => {
  const {
    assets,
    selectedAsset,
    setSelectedAssetId,
    recentTicks,
    balances,
    buyContract,
    openContracts,
    accountType,
    user,
    openAuthModal,
    requireTradingAccount,
  } = useDeriv();

  const [contractType, setContractType] = useState<'Rise' | 'Fall'>('Rise');
  const [stake, setStake] = useState<string>('20.00');
  const [durationSecs, setDurationSecs] = useState<number>(5);
  const [multiplierVal, setMultiplierVal] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<'dtrader' | 'mt5'>('dtrader');

  const numStake = parseFloat(stake) || 0;
  const estPayout = Number((numStake * 1.95).toFixed(2));

  const handleBuy = (type: 'Rise' | 'Fall') => {
    requireTradingAccount(
      () => buyContract(type, numStake, durationSecs),
      `${type} Contract on ${selectedAsset.name} ($${numStake.toFixed(2)})`
    );
  };

  // SVG Chart bounds
  const minTick = Math.min(...recentTicks) * 0.9998;
  const maxTick = Math.max(...recentTicks) * 1.0002;
  const range = maxTick - minTick || 1;

  const points = recentTicks
    .map((val, idx) => {
      const x = (idx / (recentTicks.length - 1 || 1)) * 500;
      const y = 200 - ((val - minTick) / range) * 180;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="p-6 sm:p-9 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Deriv Trading Platforms
          </h2>
          <p className="text-xs text-[#8592a6]">
            Trade synthetic volatility indices, CFDs, and options with millisecond execution
          </p>
        </div>

        <div className="flex bg-[#1b263b] p-1 rounded-lg border border-[#293548] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dtrader')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
              activeTab === 'dtrader'
                ? 'bg-[#ff444f] text-white shadow-xs'
                : 'text-[#8592a6] hover:text-white'
            }`}
          >
            Deriv DTrader (Options)
          </button>
          <button
            onClick={() => setActiveTab('mt5')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
              activeTab === 'mt5'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#8592a6] hover:text-white'
            }`}
          >
            Deriv MT5 (CFDs)
          </button>
        </div>
      </div>

      {activeTab === 'dtrader' ? (
        /* DTrader Execution Terminal */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart & Live Ticker (2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Asset Ribbon */}
            <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <select
                  value={selectedAsset.id}
                  onChange={e => setSelectedAssetId(e.target.value as SyntheticAssetId)}
                  className="bg-[#0e1726] border border-[#293548] text-white font-bold text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-[#ff444f] cursor-pointer"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white">
                    ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: selectedAsset.decimals })}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${selectedAsset.change24h >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'}`}>
                    {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8592a6] font-mono">
                <span>Volatility: <span className="text-white font-bold">{selectedAsset.volatility}x</span></span>
                <span>Market: <span className="text-[#00c853] font-bold">Open 24/7</span></span>
              </div>
            </div>

            {/* Live Visual Chart */}
            <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 shadow-md flex flex-col justify-between h-[340px] relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#8592a6] mb-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c853] animate-ping" />
                  <span className="font-semibold text-white">Live Synthetic Tick Stream</span>
                </div>
                <span className="font-mono text-xs">Interval: 1.2s · High: ${maxTick.toFixed(selectedAsset.decimals)}</span>
              </div>

              {/* Chart SVG Canvas */}
              <div className="w-full h-[220px] relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff444f" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ff444f" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#293548" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#293548" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#293548" strokeDasharray="3 3" />

                  {/* Area fill */}
                  <polygon
                    points={`0,200 ${points} 500,200`}
                    fill="url(#chartGrad)"
                  />

                  {/* Main tick line */}
                  <polyline
                    fill="none"
                    stroke="#ff444f"
                    strokeWidth="2.5"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Current price marker */}
                  {recentTicks.length > 0 && (
                    <circle
                      cx="500"
                      cy={200 - ((recentTicks[recentTicks.length - 1] - minTick) / range) * 180}
                      r="5"
                      fill="#00c853"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8592a6] font-mono border-t border-[#293548] pt-2">
                <span>Synthetic Random Walk Generator</span>
                <span className="text-white">Current Barrier: ${selectedAsset.price.toFixed(selectedAsset.decimals)}</span>
              </div>
            </div>

            {/* Active & Running Contracts List */}
            <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 shadow-md">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                <span>Active DTrader Contracts ({openContracts.length})</span>
                <span className="text-xs text-[#8592a6] font-mono font-normal">Auto-settling</span>
              </h4>

              {openContracts.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {openContracts.slice(0, 4).map(c => {
                    const isWinning = c.type === 'Rise' ? selectedAsset.price > c.entryPrice : selectedAsset.price < c.entryPrice;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 bg-[#0e1726] rounded-lg border border-[#293548] text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            c.type === 'Rise' ? 'bg-[#00c853]/20 text-[#00c853]' : 'bg-[#ff444f]/20 text-[#ff444f]'
                          }`}>
                            {c.type}
                          </span>
                          <div>
                            <div className="text-white font-semibold font-sans">{c.id}</div>
                            <div className="text-[10px] text-[#8592a6]">Entry: ${c.entryPrice.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="text-center font-sans">
                          {c.status === 'running' ? (
                            <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>{c.remainingSeconds}s left</span>
                            </div>
                          ) : (
                            <span className={c.status === 'won' ? 'text-[#00c853] font-bold' : 'text-[#ff444f] font-bold'}>
                              {c.status.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-white">Stake: ${c.stake.toFixed(2)}</div>
                          <div className={`font-bold ${isWinning ? 'text-[#00c853]' : 'text-[#ff444f]'}`}>
                            Payout: ${c.payout.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#8592a6]">
                  No active contracts. Choose Rise or Fall to trade options now.
                </div>
              )}
            </div>
          </div>

          {/* Trade Execution Panel (1 column) */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col justify-between">
            <div className="flex flex-col gap-5">
              <div className="border-b border-[#293548] pb-3">
                <h3 className="text-base font-bold text-white">Options Execution</h3>
                <p className="text-xs text-[#8592a6]">Predict market direction within duration</p>
              </div>

              {/* Duration Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 30].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDurationSecs(s)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        durationSecs === s
                          ? 'bg-[#ff444f] text-white shadow-xs'
                          : 'bg-[#0e1726] border border-[#293548] text-[#8592a6] hover:text-white'
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Stake Amount */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-white">Stake (USD)</label>
                  <span className="text-[#8592a6] font-mono">
                    Bal: ${balances.usdReal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-[#8592a6] text-sm font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={stake}
                    onChange={e => setStake(e.target.value)}
                    className="w-full bg-[#0e1726] border border-[#293548] text-white pl-8 pr-4 py-3 rounded-lg text-sm font-mono focus:outline-none focus:border-[#ff444f]"
                  />
                </div>
              </div>

              {/* Quick Stake Chips */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStake(v.toFixed(2))}
                    className="py-1.5 bg-[#0e1726] hover:bg-[#293548] border border-[#293548] rounded text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    ${v}
                  </button>
                ))}
              </div>

              {/* Payout & Return Summary */}
              <div className="bg-[#0e1726] border border-[#293548] rounded-xl p-4 flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between text-[#8592a6]">
                  <span className="font-sans">Potential Return:</span>
                  <span className="text-[#00c853] font-bold font-mono">95.0%</span>
                </div>
                <div className="flex justify-between text-[#8592a6]">
                  <span className="font-sans">Expected Payout:</span>
                  <span className="text-white font-bold">${estPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8592a6]">
                  <span className="font-sans">Net Profit:</span>
                  <span className="text-[#00c853] font-bold">+${(estPayout - numStake).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Account Mode Indicator & Account Required Notice */}
            {!user ? (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-white">Account Required to Trade</span>
                  <span className="text-[11px] text-amber-400/80">Create an account to execute contracts on Real or Demo.</span>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('register', 'Start Trading Options on DTrader')}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] cursor-pointer"
                >
                  Create
                </button>
              </div>
            ) : (
              <div className="mt-4 px-3 py-2 bg-[#0e1726] border border-[#293548] rounded-xl text-xs flex items-center justify-between">
                <span className="text-[#8592a6]">Trading On:</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${accountType === 'real' ? 'text-[#ff444f]' : 'text-[#2962ff]'}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {accountType.toUpperCase()} WALLET
                </span>
              </div>
            )}

            {/* Execute Rise / Fall Buttons */}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#293548]">
              <button
                type="button"
                onClick={() => handleBuy('Rise')}
                className="w-full bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 font-bold py-3.5 rounded-lg text-sm transition-all cursor-pointer shadow-md shadow-[#00c853]/20 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" />
                <span>Purchase Higher / Rise (${stake})</span>
              </button>

              <button
                type="button"
                onClick={() => handleBuy('Fall')}
                className="w-full bg-[#ff444f] hover:bg-[#ff444f]/90 text-white font-bold py-3.5 rounded-lg text-sm transition-all cursor-pointer shadow-md shadow-[#ff444f]/25 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ArrowDown className="w-4 h-4 stroke-[3]" />
                <span>Purchase Lower / Fall (${stake})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MT5 CFDs Overview */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MT5 Derived */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col justify-between gap-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-[#ff444f]/15 text-[#ff444f] font-bold text-xs px-2.5 py-1 rounded">
                  Deriv MT5 Derived
                </span>
                <span className="text-xs text-[#00c853] font-mono">Real Account</span>
              </div>
              <h3 className="text-lg font-bold text-white">Synthetics & Volatility Indices</h3>
              <p className="text-xs text-[#8592a6] mt-1">
                Trade 24/7 crash, boom, step, and continuous volatility indices free from real-world market hours.
              </p>

              <div className="mt-4 p-4 bg-[#0e1726] rounded-lg border border-[#293548] flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8592a6]">Account Login ID:</span>
                  <span className="text-white font-bold">50492810</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8592a6]">Server:</span>
                  <span className="text-white">Deriv-SVG-Real</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8592a6]">Leverage:</span>
                  <span className="text-white font-bold">1:1000</span>
                </div>
                <div className="flex justify-between border-t border-[#293548] pt-2">
                  <span className="text-[#8592a6]">Account Equity:</span>
                  <span className="text-[#00c853] font-bold text-sm">
                    ${balances.mt5Derived.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                requireTradingAccount(() => {
                  window.dispatchEvent(new CustomEvent('deriv-notify', { detail: 'Connecting to Deriv Web MT5 Terminal...' }));
                }, 'Launch Deriv Web MT5 Terminal');
              }}
              className="w-full py-3 bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-[#2962ff]/20 flex items-center justify-center gap-1.5"
            >
              <span>Launch WebTrader MT5</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MT5 Financial */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col justify-between gap-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-[#2962ff]/15 text-[#2962ff] font-bold text-xs px-2.5 py-1 rounded">
                  Deriv MT5 Financial
                </span>
                <span className="text-xs text-[#00c853] font-mono">Real Account</span>
              </div>
              <h3 className="text-lg font-bold text-white">Forex, Commodities & Cryptos</h3>
              <p className="text-xs text-[#8592a6] mt-1">
                Trade major, minor, and exotic forex pairs, gold, silver, crude oil, and crypto CFDs with ultra-low raw spreads.
              </p>

              <div className="mt-4 p-4 bg-[#0e1726] rounded-lg border border-[#293548] flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8592a6]">Account Login ID:</span>
                  <span className="text-white font-bold">50819234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8592a6]">Server:</span>
                  <span className="text-white">Deriv-BVI-Real</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8592a6]">Leverage:</span>
                  <span className="text-white font-bold">1:500</span>
                </div>
                <div className="flex justify-between border-t border-[#293548] pt-2">
                  <span className="text-[#8592a6]">Account Equity:</span>
                  <span className="text-[#00c853] font-bold text-sm">
                    ${balances.mt5Financial.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                requireTradingAccount(() => {
                  window.dispatchEvent(new CustomEvent('deriv-notify', { detail: 'Connecting to Deriv Web MT5 Terminal...' }));
                }, 'Launch Deriv Web MT5 Financial Terminal');
              }}
              className="w-full py-3 bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-[#2962ff]/20 flex items-center justify-center gap-1.5"
            >
              <span>Launch WebTrader MT5</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MT5 Python Risk-Managed Bot Highlight Card */}
          <div className="md:col-span-2 bg-[#1b263b] border border-emerald-500/30 rounded-xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-gradient-to-r from-[#1b263b] to-emerald-950/20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 font-bold text-xs px-2.5 py-0.5 rounded">
                  MT5 Python Bot Studio
                </span>
                <span className="text-xs text-amber-400 font-mono">Magic #234000</span>
              </div>
              <h3 className="text-lg font-bold text-white">Automate MetaTrader 5 via Python Algorithm</h3>
              <p className="text-xs text-[#8592a6] mt-1 max-w-2xl">
                Run the EUR/USD M15 Moving Average Crossover (Fast MA 9 / Slow MA 21) strategy with automated dynamic lot calculation, 3.0% daily drawdown circuit breaker, and 1:2 risk-reward execution.
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenMT5Bot) {
                  onOpenMT5Bot();
                }
              }}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch MT5 Python Bot Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
