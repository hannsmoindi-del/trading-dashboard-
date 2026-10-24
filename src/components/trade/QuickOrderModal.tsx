import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide } from '../../types/trading';
import { X, Zap, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface QuickOrderModalProps {
  isOpen: boolean;
  side: OrderSide;
  onClose: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  side,
  onClose,
}) => {
  const { currentAsset, freeMargin, placeOrder } = useTrading();
  const [amount, setAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const price = currentAsset.price;
  const numAmount = parseFloat(amount) || 0;
  const orderValueUsd = numAmount * price;
  const requiredMargin = orderValueUsd / leverage;

  // Reset or preset default amount when opened
  useEffect(() => {
    if (isOpen) {
      // Default to 10% of free margin
      const defaultVal = (freeMargin * 0.1 * leverage) / (price || 1);
      setAmount(Number(defaultVal.toFixed(currentAsset.precision || 2)).toString());
      setErrorMsg(null);
    }
  }, [isOpen, currentAsset, freeMargin, leverage, price]);

  if (!isOpen) return null;

  const handleQuickPercent = (pct: number) => {
    const maxUsd = (freeMargin * pct) / 100 * leverage;
    const calc = maxUsd / (price || 1);
    setAmount(calc.toFixed(currentAsset.precision || 2));
    setErrorMsg(null);
  };

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid order size');
      return;
    }
    if (requiredMargin > freeMargin) {
      setErrorMsg(`Insufficient margin ($${freeMargin.toLocaleString()} available)`);
      return;
    }

    const res = placeOrder({
      symbol: currentAsset.symbol,
      side,
      type: 'market',
      amount: numAmount,
      leverage,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              side === 'buy'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 font-sans">
                Quick {side === 'buy' ? 'Buy / Long' : 'Sell / Short'}
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                {side === 'buy' ? 'Ctrl+B' : 'Ctrl+S'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Instant market order execution for {currentAsset.symbol}
            </p>
          </div>
        </div>

        {/* Current Market Price Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800 mb-4 font-mono text-xs">
          <div>
            <span className="text-slate-400 font-sans text-[11px] block">Market Price</span>
            <span className="text-slate-100 font-bold text-sm">
              ${price.toLocaleString(undefined, { minimumFractionDigits: currentAsset.decimals })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-sans text-[11px] block">Available Margin</span>
            <span className="text-emerald-400 font-bold">
              ${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleExecute} className="flex flex-col gap-4">
          {/* Amount Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-400 font-medium">Order Quantity</label>
              <span className="text-slate-400 font-mono text-[11px]">
                ≈ ${orderValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                autoFocus
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 uppercase">
                {currentAsset.symbol.split('/')[0]}
              </span>
            </div>
          </div>

          {/* Quick Percentage Presets */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Leverage Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Leverage</span>
              <span className="font-mono font-bold text-blue-400">{leverage}x</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 5, 10, 20].map(lev => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-1 text-xs font-mono font-medium rounded transition-colors ${
                    leverage === lev
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary Specs */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs flex flex-col gap-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">Required Margin</span>
              <span className="text-slate-200 font-semibold">
                ${requiredMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">Est. Execution Fee</span>
              <span className="text-slate-300">
                ${(orderValueUsd * 0.0005).toFixed(2)}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel (Esc)
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer shadow-md flex items-center gap-1.5 ${
                side === 'buy'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {side === 'buy' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>Execute {side === 'buy' ? 'Buy' : 'Sell'} Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
