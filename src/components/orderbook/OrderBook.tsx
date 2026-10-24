import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';

export const OrderBook: React.FC = () => {
  const { currentAsset, orderBook, recentTrades } = useTrading();
  const [viewTab, setViewTab] = useState<'orderbook' | 'trades'>('orderbook');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col h-full">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewTab('orderbook')}
            className={`px-3 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              viewTab === 'orderbook' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Order Book
          </button>
          <button
            onClick={() => setViewTab('trades')}
            className={`px-3 py-1 font-medium rounded transition-colors whitespace-nowrap ${
              viewTab === 'trades' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent Trades
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          {currentAsset.symbol}
        </span>
      </div>

      {viewTab === 'orderbook' ? (
        <div className="flex flex-col flex-1 pt-2 font-mono text-xs">
          {/* Column Header */}
          <div className="grid grid-cols-3 text-slate-400 text-[11px] pb-1.5 px-1 font-sans">
            <span>Price (USD)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell Orders - Red) */}
          <div className="flex flex-col gap-0.5">
            {orderBook.asks.map((ask, idx) => (
              <div
                key={`ask_${idx}`}
                className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-slate-800/50 cursor-pointer rounded transition-colors group"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none rounded-r"
                  style={{ width: `${ask.depthPercent}%` }}
                />
                <span className="text-rose-400 font-medium relative z-10">
                  {ask.price.toFixed(currentAsset.decimals)}
                </span>
                <span className="text-right text-slate-300 relative z-10">
                  {ask.amount.toFixed(2)}
                </span>
                <span className="text-right text-slate-400 relative z-10">
                  {ask.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Mid Spread Indicator */}
          <div className="my-2 py-1 px-2 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Spread</span>
            <span className="text-slate-300 font-mono">
              ${orderBook.spread.toFixed(currentAsset.decimals)} ({orderBook.spreadPercent}%)
            </span>
          </div>

          {/* Bids (Buy Orders - Green) */}
          <div className="flex flex-col gap-0.5">
            {orderBook.bids.map((bid, idx) => (
              <div
                key={`bid_${idx}`}
                className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-slate-800/50 cursor-pointer rounded transition-colors group"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none rounded-r"
                  style={{ width: `${bid.depthPercent}%` }}
                />
                <span className="text-emerald-400 font-medium relative z-10">
                  {bid.price.toFixed(currentAsset.decimals)}
                </span>
                <span className="text-right text-slate-300 relative z-10">
                  {bid.amount.toFixed(2)}
                </span>
                <span className="text-right text-slate-400 relative z-10">
                  {bid.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Recent Trades Stream */
        <div className="flex flex-col flex-1 pt-2 font-mono text-xs">
          <div className="grid grid-cols-3 text-slate-400 text-[11px] pb-1.5 px-1 font-sans">
            <span>Price (USD)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Time</span>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] pr-1">
            {recentTrades.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-3 py-0.5 px-1 hover:bg-slate-800/40 rounded transition-colors text-[11px]"
              >
                <span className={t.side === 'buy' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {t.price.toFixed(currentAsset.decimals)}
                </span>
                <span className="text-right text-slate-300">
                  {t.amount.toFixed(3)}
                </span>
                <span className="text-right text-slate-400">
                  {t.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
