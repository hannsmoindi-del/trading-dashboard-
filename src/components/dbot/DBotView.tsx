import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { SyntheticAssetId } from '../../types/deriv';
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Terminal,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface DBotViewProps {
  onOpenMT5Bot?: () => void;
}

export const DBotView: React.FC<DBotViewProps> = ({ onOpenMT5Bot }) => {
  const {
    assets,
    selectedAsset,
    setSelectedAssetId,
    currentRsi,
    dbotConfig,
    updateDBotConfig,
    isBotRunning,
    toggleBot,
    botProfit,
    botRuns,
    botWins,
    botLosses,
    botLogs,
    resetBotStats,
    user,
    openAuthModal,
  } = useDeriv();

  const winRate = botRuns > 0 ? ((botWins / botRuns) * 100).toFixed(1) : '0.0';
  const isTriggered = currentRsi <= dbotConfig.indicatorParam;

  return (
    <div className="p-6 sm:p-9 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Deriv DBot - Automated Strategy Studio
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#00c853]/15 text-[#00c853]">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-[#8592a6]">
            Visual strategy pipeline with algorithmic entry triggers, dynamic martingale risk management, and automated contract execution
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {onOpenMT5Bot && (
            <button
              onClick={onOpenMT5Bot}
              className="px-3.5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Switch to MT5 Python Bot</span>
            </button>
          )}

          <button
            onClick={resetBotStats}
            title="Reset bot statistics"
            className="p-2.5 bg-[#1b263b] hover:bg-[#293548] text-[#8592a6] hover:text-white rounded-lg border border-[#293548] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleBot}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
              isBotRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 shadow-[#00c853]/20 font-extrabold'
            }`}
          >
            {isBotRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isBotRunning ? 'Pause DBot Engine' : 'Start Automated DBot'}</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Bot Notice */}
      {!user && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-white block">Account Required for Algorithmic Automation</span>
            <span className="text-[11px] text-amber-400/80">Create your account to automate contracts on Real or $10,000 Virtual Demo accounts.</span>
          </div>
          <button
            onClick={() => openAuthModal('register', 'Automated Strategy Execution on DBot')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition-all cursor-pointer shadow-xs shrink-0"
          >
            Create Account to Run Bot
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <span className="text-xs text-[#8592a6] block">Net Realized Profit</span>
          <span className={`text-2xl font-bold font-mono ${botProfit >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'}`}>
            {botProfit >= 0 ? '+' : ''}${botProfit.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block">Target: +${dbotConfig.takeProfit}</span>
        </div>

        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <span className="text-xs text-[#8592a6] block">Total Executed Runs</span>
          <span className="text-2xl font-bold font-mono text-white">
            {botRuns}
          </span>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block">{botWins} Wins / {botLosses} Losses</span>
        </div>

        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <span className="text-xs text-[#8592a6] block">Win Rate</span>
          <span className="text-2xl font-bold font-mono text-[#00c853]">
            {winRate}%
          </span>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block">Statistically validated</span>
        </div>

        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <span className="text-xs text-[#8592a6] block">Current Asset RSI</span>
          <span className={`text-2xl font-bold font-mono ${isTriggered ? 'text-[#00c853]' : 'text-white'}`}>
            {currentRsi}
          </span>
          <span className={`text-[11px] font-semibold mt-0.5 block ${isTriggered ? 'text-[#00c853]' : 'text-[#8592a6]'}`}>
            {isTriggered ? '⚡ Trigger Threshold Met!' : 'Scanning next tick...'}
          </span>
        </div>
      </div>

      {/* Main Studio: Strategy Blocks Builder (Left) & Real-time Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Pipeline Blocks */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col gap-4">
          <div className="border-b border-[#293548] pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Visual Strategy Architecture</h3>
              <p className="text-xs text-[#8592a6]">Configure execution rules and risk safeguards</p>
            </div>
            <span className="bg-[#2962ff]/15 text-[#2962ff] text-xs font-bold px-2 py-0.5 rounded">
              Rule Chain
            </span>
          </div>

          {/* Block 1: Market & Asset Selection */}
          <div className="bg-[#0e1726] border border-[#293548] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#ff444f]/20 text-[#ff444f] flex items-center justify-center text-[10px]">1</span>
                Market Asset Selector
              </span>
              <span className="text-[10px] text-[#8592a6] font-mono">24/7 Synthetics</span>
            </div>
            <select
              value={selectedAsset.id}
              onChange={e => setSelectedAssetId(e.target.value as SyntheticAssetId)}
              className="w-full bg-[#1b263b] border border-[#293548] text-white p-2.5 rounded-lg text-xs font-medium"
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (${a.price.toFixed(a.decimals)})
                </option>
              ))}
            </select>
          </div>

          {/* Block 2: Technical Condition Trigger */}
          <div className={`bg-[#0e1726] border rounded-xl p-4 transition-all ${
            isTriggered ? 'border-[#00c853]/60 bg-[#00c853]/5' : 'border-[#293548]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center text-[10px]">2</span>
                Algorithmic Entry Trigger
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isTriggered ? 'bg-[#00c853] text-black font-extrabold' : 'bg-[#2962ff]/20 text-[#2962ff]'
              }`}>
                {isTriggered ? 'ACTIVE TRIGGER' : 'MONITORING'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-[#8592a6] block mb-1">Indicator</label>
                <select
                  value={dbotConfig.indicator}
                  onChange={e => updateDBotConfig({ indicator: e.target.value as any })}
                  className="w-full bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs"
                >
                  <option value="RSI">RSI (Relative Strength)</option>
                  <option value="SMA_CROSS">SMA Fast/Slow Cross</option>
                  <option value="BOLLINGER">Bollinger Lower Band</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#8592a6] block mb-1">Threshold Condition</label>
                <div className="relative">
                  <input
                    type="number"
                    value={dbotConfig.indicatorParam}
                    onChange={e => updateDBotConfig({ indicatorParam: parseFloat(e.target.value) || 30 })}
                    className="w-full bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs font-mono"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-[#8592a6]">&lt; Level</span>
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Contract Type & Duration */}
          <div className="bg-[#0e1726] border border-[#293548] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px]">3</span>
                Contract Execution Type
              </span>
              <span className="text-[10px] text-[#00c853] font-mono">95% Payout</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-[#8592a6] block mb-1">Action</label>
                <select
                  value={dbotConfig.contractType}
                  onChange={e => updateDBotConfig({ contractType: e.target.value as any })}
                  className="w-full bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs"
                >
                  <option value="rise_fall">Rise / Fall (Standard)</option>
                  <option value="higher_lower">Higher / Lower (Barrier)</option>
                  <option value="matches_differs">Matches / Differs</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#8592a6] block mb-1">Contract Duration</label>
                <select
                  value={dbotConfig.durationTicks}
                  onChange={e => updateDBotConfig({ durationTicks: parseInt(e.target.value) || 3 })}
                  className="w-full bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs font-mono"
                >
                  <option value="1">1 Tick (Ultra Fast)</option>
                  <option value="3">3 Ticks (Recommended)</option>
                  <option value="5">5 Ticks</option>
                  <option value="10">10 Ticks</option>
                </select>
              </div>
            </div>
          </div>

          {/* Block 4: Risk & Money Management (Martingale) */}
          <div className="bg-[#0e1726] border border-[#293548] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#00c853]/20 text-[#00c853] flex items-center justify-center text-[10px]">4</span>
                Capital & Martingale Protection
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Auto Safety Limits</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#8592a6] block mb-1">Initial Stake ($)</label>
                <input
                  type="number"
                  value={dbotConfig.stake}
                  onChange={e => updateDBotConfig({ stake: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8592a6] block mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  value={dbotConfig.takeProfit}
                  onChange={e => updateDBotConfig({ takeProfit: parseFloat(e.target.value) || 50 })}
                  className="w-full bg-[#1b263b] border border-[#293548] text-[#00c853] font-bold p-2 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8592a6] block mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  value={dbotConfig.stopLoss}
                  onChange={e => updateDBotConfig({ stopLoss: parseFloat(e.target.value) || 20 })}
                  className="w-full bg-[#1b263b] border border-[#293548] text-[#ff444f] font-bold p-2 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time DBot Terminal Logs */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#293548] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00c853]" />
                <h3 className="text-base font-bold text-white">Live Execution Terminal</h3>
              </div>
              <span className="text-xs text-[#8592a6] font-mono">
                {isBotRunning ? 'Streaming live contracts...' : 'Paused'}
              </span>
            </div>

            {/* Terminal Console View */}
            <div className="bg-[#0e1726] border border-[#293548] rounded-xl p-4 h-[380px] overflow-y-auto flex flex-col gap-2 font-mono text-xs">
              {botLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-2 rounded border text-xs leading-relaxed ${
                    log.type === 'win'
                      ? 'bg-[#00c853]/10 border-[#00c853]/30 text-[#00c853]'
                      : log.type === 'loss'
                      ? 'bg-[#ff444f]/10 border-[#ff444f]/30 text-[#ff444f]'
                      : 'bg-[#1b263b]/50 border-[#293548] text-[#8592a6]'
                  }`}
                >
                  <div className="flex justify-between text-[10px] opacity-75 mb-0.5">
                    <span>{log.timestamp}</span>
                    <span>{log.type.toUpperCase()}</span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#293548] flex justify-between items-center text-xs text-[#8592a6]">
            <span>Algorithm: Martingale v2.1</span>
            <span className="text-white font-mono">
              Auto-Risk Shield: Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
