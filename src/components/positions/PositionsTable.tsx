import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { XCircle, CheckCircle2, History, Bell, Plus, Trash2, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';

export const PositionsTable: React.FC = () => {
  const {
    positions,
    openOrders,
    tradeHistory,
    closePosition,
    cancelOrder,
    alerts,
    deleteAlert,
    rearmAlert,
    openCreateAlertModal,
    activeAlertsCount,
    assets,
  } = useTrading();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'alerts'>('positions');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Open Positions</span>
            <span className="px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded text-[10px] font-mono">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Open Orders</span>
            <span className="px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded text-[10px] font-mono">
              {openOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Price Alerts</span>
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px] font-mono">
              {activeAlertsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>History</span>
          </button>
        </div>

        {activeTab === 'alerts' && (
          <button
            onClick={() => openCreateAlertModal()}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Alert</span>
          </button>
        )}
      </div>

      {/* Tab 1: Positions */}
      {activeTab === 'positions' && (
        <div className="overflow-x-auto pt-2">
          {positions.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Asset</th>
                  <th className="py-2.5 px-3 font-medium">Side / Lev</th>
                  <th className="py-2.5 px-3 font-medium text-right">Size</th>
                  <th className="py-2.5 px-3 font-medium text-right">Entry Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Mark Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Liq. Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Margin</th>
                  <th className="py-2.5 px-3 font-medium text-right">Unrealized PnL</th>
                  <th className="py-2.5 px-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {positions.map(pos => {
                  const isPositive = pos.pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-sans font-semibold text-slate-100">
                        {pos.symbol}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          pos.side === 'buy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {pos.side === 'buy' ? 'LONG' : 'SHORT'} {pos.leverage}x
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-200">
                        {pos.size}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ${pos.entryPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-100 font-semibold">
                        ${pos.markPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400/90">
                        {pos.liquidationPrice > 0 ? `$${pos.liquidationPrice.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ${pos.margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold">
                        <div className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? '+' : ''}${pos.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-[11px] ml-1 opacity-80">
                            ({isPositive ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => closePosition(pos.id)}
                          className="px-2.5 py-1 text-xs font-sans font-medium bg-slate-800 hover:bg-rose-600/80 hover:text-white text-slate-300 border border-slate-700/60 rounded transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Market Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-slate-400 font-sans">
              <p className="text-sm">No open positions</p>
              <p className="text-xs text-slate-400 mt-1">Execute a market or limit order using the Place Order panel to trade.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Open Limit Orders */}
      {activeTab === 'orders' && (
        <div className="overflow-x-auto pt-2">
          {openOrders.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Asset</th>
                  <th className="py-2.5 px-3 font-medium">Side / Type</th>
                  <th className="py-2.5 px-3 font-medium text-right">Limit Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium text-right">Total (USD)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Leverage</th>
                  <th className="py-2.5 px-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {openOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-slate-100">
                      {order.symbol}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        order.side === 'buy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {order.side} · {order.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-100 font-semibold">
                      ${order.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200">
                      {order.amount}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      ${order.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-400">
                      {order.leverage}x
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium text-rose-400 hover:bg-rose-500/20 rounded transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-slate-400 font-sans">
              <p className="text-sm">No active limit orders</p>
              <p className="text-xs text-slate-400 mt-1">Pending limit orders awaiting execution will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Trade History */}
      {activeTab === 'history' && (
        <div className="overflow-x-auto pt-2">
          {tradeHistory.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Time</th>
                  <th className="py-2.5 px-3 font-medium">Asset</th>
                  <th className="py-2.5 px-3 font-medium">Side / Type</th>
                  <th className="py-2.5 px-3 font-medium text-right">Exec Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 px-3 font-medium text-right">Total Value</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {tradeHistory.map(hist => (
                  <tr key={hist.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">
                      {hist.symbol}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                        hist.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {hist.side} · {hist.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      ${hist.price.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {hist.amount}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-100">
                      ${hist.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Filled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-slate-400 font-sans">
              <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No trade history yet</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Price Alerts */}
      {activeTab === 'alerts' && (
        <div className="overflow-x-auto pt-2">
          {alerts.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Asset</th>
                  <th className="py-2.5 px-3 font-medium">Condition</th>
                  <th className="py-2.5 px-3 font-medium text-right">Target Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Current Price</th>
                  <th className="py-2.5 px-3 font-medium text-right">Distance</th>
                  <th className="py-2.5 px-3 font-medium">Note</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {alerts.map(alert => {
                  const currentAsset = assets.find(a => a.symbol === alert.symbol);
                  const currentPrice = currentAsset ? currentAsset.price : alert.initialPrice;
                  const distancePct = ((alert.targetPrice - currentPrice) / currentPrice) * 100;
                  const isTriggered = alert.status === 'triggered';

                  return (
                    <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-sans font-semibold text-slate-100">
                        {alert.symbol}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          alert.condition === 'above'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {alert.condition === 'above' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {alert.condition === 'above' ? '≥ Above' : '≤ Below'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        ${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: currentAsset?.decimals || 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: currentAsset?.decimals || 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={distancePct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {distancePct > 0 ? '+' : ''}{distancePct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-400 text-[11px] max-w-[180px] truncate">
                        {alert.note || '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {isTriggered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Triggered
                          </span>
                        ) : (
                          <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isTriggered && (
                            <button
                              onClick={() => rearmAlert(alert.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded cursor-pointer transition-colors"
                              title="Re-arm Alert"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Re-arm</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-slate-400 font-sans">
              <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No price alerts configured</p>
              <button
                onClick={() => openCreateAlertModal()}
                className="mt-2 text-xs text-blue-400 hover:underline"
              >
                Create your first price alert
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
