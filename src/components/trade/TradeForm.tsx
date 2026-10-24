import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { OrderSide, OrderType } from '../../types/trading';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const TradeForm: React.FC = () => {
  const {
    assets,
    selectedSymbol,
    setSelectedSymbol,
    currentAsset,
    placeOrder,
    freeMargin,
    cashBalance,
  } = useTrading();

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPrice, setLimitPrice] = useState<string>(currentAsset.price.toString());
  const [amount, setAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync limit price when asset changes
  useEffect(() => {
    setLimitPrice(currentAsset.price.toString());
    setErrorMsg(null);
  }, [currentAsset.symbol, currentAsset.price]);

  // Compute values
  const effectivePrice = orderType === 'market' ? currentAsset.price : (parseFloat(limitPrice) || currentAsset.price);
  const numAmount = parseFloat(amount) || 0;
  const orderValueUsd = numAmount * effectivePrice;
  const requiredMargin = orderValueUsd / leverage;
  const estimatedFee = orderValueUsd * 0.0005;

  // Estimated liquidation price calculation
  const liqOffset = (effectivePrice / leverage) * 0.9;
  const estLiquidation = leverage > 1 
    ? (side === 'buy' ? Math.max(0, effectivePrice - liqOffset) : effectivePrice + liqOffset)
    : 0;

  // Percentage quick-select helper
  const handleQuickPercent = (pct: number) => {
    if (effectivePrice <= 0) return;
    const maxUsd = (freeMargin * pct) / 100 * leverage;
    const calculatedAmount = maxUsd / effectivePrice;
    const precision = currentAsset.precision || 2;
    setAmount(calculatedAmount.toFixed(precision));
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    if (requiredMargin > freeMargin) {
      setErrorMsg(`Insufficient margin. Available: $${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
      return;
    }

    const res = placeOrder({
      symbol: selectedSymbol,
      side,
      type: orderType,
      amount: numAmount,
      price: orderType !== 'market' ? parseFloat(limitPrice) : undefined,
      leverage,
    });

    if (res.success) {
      setAmount('');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-100">Place Order</h3>
          <span className="text-xs text-slate-400">
            Avail: <strong className="text-slate-200 font-mono">${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
        </div>

        {/* Side Tabs (Buy / Sell) */}
        {/* Side Selector with Shortcut hints */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-lg mb-4 border border-slate-700/60">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              side === 'buy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Buy / Long</span>
            <kbd className={`text-[10px] font-mono px-1 rounded ${side === 'buy' ? 'bg-emerald-700/80 text-white' : 'bg-slate-900 text-slate-400'}`}>
              Ctrl+B
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
              side === 'sell'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Sell / Short</span>
            <kbd className={`text-[10px] font-mono px-1 rounded ${side === 'sell' ? 'bg-rose-700/80 text-white' : 'bg-slate-900 text-slate-400'}`}>
              Ctrl+S
            </kbd>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Asset Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Asset</label>
            <select
              value={selectedSymbol}
              onChange={e => setSelectedSymbol(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
            >
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} · {a.name} (${a.price.toLocaleString(undefined, { minimumFractionDigits: a.decimals })})
                </option>
              ))}
            </select>
          </div>

          {/* Order Type Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Order Type</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setOrderType('market')}
                className={`py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                  orderType === 'market' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType('limit')}
                className={`py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                  orderType === 'limit' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Limit
              </button>
              <button
                type="button"
                onClick={() => setOrderType('stop_loss')}
                className={`py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                  orderType === 'stop_loss' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stop
              </button>
            </div>
          </div>

          {/* Limit Price Input if not market */}
          {orderType !== 'market' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">
                {orderType === 'limit' ? 'Limit Price (USD)' : 'Stop Price (USD)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={e => setLimitPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => setLimitPrice(currentAsset.price.toString())}
                  className="absolute right-2 top-2 text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Mid
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Amount</label>
              <span className="text-[11px] text-slate-500 font-mono">
                ≈ ${orderValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400 uppercase">
                {selectedSymbol.split('/')[0]}
              </span>
            </div>
          </div>

          {/* Quick Amount Percentage buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="py-1 text-xs font-mono font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/50 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Leverage Selector */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Leverage</span>
              <span className="font-mono font-bold text-blue-400">{leverage}x</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
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
            {leverage > 10 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 mt-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>High leverage increases liquidation risk.</span>
              </div>
            )}
          </div>

          {/* Order Specs Breakdown */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs flex flex-col gap-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Required Margin</span>
              <span className="text-slate-200">
                ${requiredMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {leverage > 1 && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Est. Liquidation</span>
                <span className="text-amber-400">
                  ${estLiquidation.toLocaleString(undefined, { minimumFractionDigits: currentAsset.decimals })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-400">
              <span>Est. Fee (0.05%)</span>
              <span className="text-slate-200">
                ${estimatedFee.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-sm text-white shadow-md transition-all active:scale-[0.99] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 ${
              side === 'buy'
                ? 'bg-emerald-600 hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-400/30'
                : 'bg-rose-600 hover:bg-rose-500 focus:ring-2 focus:ring-rose-400/30'
            }`}
          >
            <span>{side === 'buy' ? 'Buy / Long' : 'Sell / Short'} {selectedSymbol.split('/')[0]}</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-black/25 text-white/80 border border-white/10">
              {side === 'buy' ? 'Ctrl+B' : 'Ctrl+S'}
            </kbd>
          </button>
        </form>
      </div>
    </div>
  );
};
