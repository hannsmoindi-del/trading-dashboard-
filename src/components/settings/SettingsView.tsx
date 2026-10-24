import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Volume2, VolumeX, Shield, Sliders, Keyboard, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { soundEnabled, setSoundEnabled, chartType, setChartType, timeframe, setTimeframe } = useTrading();
  const [slippage, setSlippage] = useState<string>('0.5');
  const [oneClick, setOneClick] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Trading Preferences & Terminal Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize order execution parameters, chart behaviors, audio alerts, and interface ergonomics.
        </p>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium">
          <Check className="w-4 h-4" />
          <span>Terminal preferences saved successfully.</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Audio Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Audio Cues & Sound Effects</h3>
                <p className="text-xs text-slate-400">Plays synthesized sound effects on order fill, rejection, and cancellations.</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                soundEnabled ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Execution Slippage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Slippage Tolerance</h3>
              <p className="text-xs text-slate-400">Maximum price fluctuation tolerated for instant market fills.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['0.1', '0.5', '1.0'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setSlippage(val)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                  slippage === val
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        {/* Chart Defaults */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-100">Chart Defaults</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-medium">Default Chart Style</label>
              <select
                value={chartType}
                onChange={e => setChartType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
              >
                <option value="candles">Candlesticks (OHLC)</option>
                <option value="line">Line Mountain Chart</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-medium">Default Timeframe</label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1D">1 Day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <span>Terminal Hotkeys & Shortcuts</span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans">Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[10px]">?</kbd> anywhere for help</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Command Palette & Search</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 text-[11px]">Ctrl+K</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Quick Buy / Long Dialog</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded border border-slate-700 text-[11px]">Ctrl+B</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Quick Sell / Short Dialog</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-rose-400 rounded border border-slate-700 text-[11px]">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Create Price Alert</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-amber-400 rounded border border-slate-700 text-[11px]">Alt+A</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Toggle Candlestick / Line</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 text-[11px]">C</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Switch Tabs (Dashboard..Settings)</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 text-[11px]">Ctrl+1 .. 5</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Shortcuts Cheatsheet</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 text-[11px]">?</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800/80">
              <span className="text-slate-400 font-sans">Close Modals / Drawers</span>
              <kbd className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 text-[11px]">Esc</kbd>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer self-start shadow-sm"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
