import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Bell, X, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

export const AlertModal: React.FC = () => {
  const {
    assets,
    isAlertModalOpen,
    setIsAlertModalOpen,
    alertPrefillSymbol,
    alertPrefillPrice,
    createAlert,
  } = useTrading();

  const [symbol, setSymbol] = useState<string>(alertPrefillSymbol || 'BTC/USD');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAsset = assets.find(a => a.symbol === symbol) || assets[0];

  // Whenever modal opens or prefill changes, sync
  useEffect(() => {
    if (isAlertModalOpen) {
      const sym = alertPrefillSymbol || 'BTC/USD';
      setSymbol(sym);
      const asset = assets.find(a => a.symbol === sym) || assets[0];
      const initialTarget = alertPrefillPrice ? alertPrefillPrice.toString() : (asset.price * 1.01).toFixed(asset.decimals);
      setTargetPrice(initialTarget);
      setCondition(Number(initialTarget) >= asset.price ? 'above' : 'below');
      setNote('');
      setErrorMsg(null);
    }
  }, [isAlertModalOpen, alertPrefillSymbol, alertPrefillPrice, assets]);

  if (!isAlertModalOpen) return null;

  const currentPrice = selectedAsset.price;

  // Quick percentage offset helper
  const handlePercentOffset = (percent: number) => {
    const newTarget = currentPrice * (1 + percent / 100);
    setTargetPrice(newTarget.toFixed(selectedAsset.decimals));
    setCondition(percent >= 0 ? 'above' : 'below');
    setErrorMsg(null);
  };

  const handlePriceChange = (val: string) => {
    setTargetPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setCondition(num >= currentPrice ? 'above' : 'below');
    }
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const num = parseFloat(targetPrice);

    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid target price');
      return;
    }

    createAlert({
      symbol,
      targetPrice: num,
      condition,
      note: note.trim() || undefined,
    });

    setIsAlertModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={() => setIsAlertModalOpen(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Create Price Alert</h3>
            <p className="text-xs text-slate-400">Get instant visual alerts and audio cues when price triggers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Asset Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Asset</label>
            <select
              value={symbol}
              onChange={e => {
                const newSym = e.target.value;
                setSymbol(newSym);
                const asset = assets.find(a => a.symbol === newSym);
                if (asset) {
                  const defaultTarget = (asset.price * 1.01).toFixed(asset.decimals);
                  setTargetPrice(defaultTarget);
                  setCondition('above');
                }
              }}
              className="bg-slate-950 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
            >
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} · {a.name} (${a.price.toLocaleString(undefined, { minimumFractionDigits: a.decimals })})
                </option>
              ))}
            </select>
          </div>

          {/* Current Price Reference */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs font-mono">
            <span className="text-slate-400 font-sans">Current Market Price:</span>
            <span className="text-slate-100 font-bold">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: selectedAsset.decimals, maximumFractionDigits: selectedAsset.decimals })}
            </span>
          </div>

          {/* Target Price Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Target Trigger Price (USD)</label>
              {targetPrice && !isNaN(parseFloat(targetPrice)) && (
                <span className="text-[11px] font-mono text-slate-400">
                  {(((parseFloat(targetPrice) - currentPrice) / currentPrice) * 100).toFixed(2)}% from now
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-mono">$</span>
              <input
                type="number"
                step="any"
                min="0"
                value={targetPrice}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm pl-8 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Offset Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[-2, -1, 1, 2].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentOffset(pct)}
                className="py-1 text-xs font-mono font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-colors"
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
          </div>

          {/* Trigger Condition Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Trigger Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                  condition === 'above'
                    ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Rises to or above (≥)</span>
              </button>

              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                  condition === 'below'
                    ? 'bg-rose-600/15 border-rose-500/40 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Drops to or below (≤)</span>
              </button>
            </div>
          </div>

          {/* Note Label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Note (Optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Resistance level / Take profit"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Set Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
