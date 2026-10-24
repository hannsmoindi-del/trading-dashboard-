import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Order, OrderSide } from '../../types/trading';
import {
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  History,
  Filter
} from 'lucide-react';

export const RecentTradesWidget: React.FC = () => {
  const { tradeHistory, openOrders, cancelOrder, assets } = useTrading();
  const [statusFilter, setStatusFilter] = useState<'all' | 'filled' | 'pending'>('all');

  // Combine filled orders (tradeHistory) and pending orders (openOrders)
  const combinedUserTrades = useMemo(() => {
    const list: (Order & { isPending: boolean })[] = [
      ...openOrders.map(o => ({ ...o, isPending: true })),
      ...tradeHistory.map(o => ({ ...o, isPending: false })),
    ];

    // Sort newest first
    list.sort((a, b) => b.timestamp - a.timestamp);

    if (statusFilter === 'filled') return list.filter(o => !o.isPending);
    if (statusFilter === 'pending') return list.filter(o => o.isPending);
    return list;
  }, [openOrders, tradeHistory, statusFilter]);

  const filledCount = tradeHistory.length;
  const pendingCount = openOrders.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Recent Trades</h3>
          <span className="text-[11px] font-mono text-slate-400">
            ({openOrders.length + tradeHistory.length})
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('filled')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              statusFilter === 'filled' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Filled ({filledCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              statusFilter === 'pending' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Trades List */}
      <div className="flex flex-col gap-2 pt-3 max-h-[340px] overflow-y-auto pr-1">
        {combinedUserTrades.length > 0 ? (
          combinedUserTrades.map(trade => {
            const isBuy = trade.side === 'buy';
            const isPending = trade.isPending;
            const asset = assets.find(a => a.symbol === trade.symbol);
            const decimals = asset?.decimals || 2;

            return (
              <div
                key={trade.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isPending
                    ? 'bg-amber-950/15 border-amber-500/25 hover:border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {/* Top Row: Asset, Side, Status Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-100 font-sans">
                      {trade.symbol}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                        isBuy
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      {isBuy ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {trade.side}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {trade.type}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock className="w-2.5 h-2.5 animate-pulse" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Filled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Price, Amount, Total & Time */}
                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Price</span>
                      <span className="text-slate-200 font-semibold">
                        ${trade.price.toLocaleString(undefined, { minimumFractionDigits: decimals })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Amount</span>
                      <span className="text-slate-300">
                        {trade.amount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Total</span>
                      <span className="text-slate-200">
                        ${trade.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Timestamp or Cancel Action if Pending */}
                  <div className="flex flex-col items-end">
                    {isPending ? (
                      <button
                        onClick={() => cancelOrder(trade.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-sans"
                        title="Cancel Pending Order"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {trade.leverage}x Lev
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-400 font-sans">
            <History className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-medium">No order executions found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Execute a market or limit trade to see real-time updates here.
            </p>
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Execution Rate: <strong className="text-emerald-400">100%</strong></span>
        <span>Maker Fee: <strong className="text-slate-300">0.05%</strong></span>
      </div>
    </div>
  );
};
