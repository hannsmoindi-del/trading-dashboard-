import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import {
  Wallet,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface PortfolioViewProps {
  onGoToTrade: () => void;
  onGoToWallet: () => void;
}

type PerformanceTimeframe = '24H' | '7D' | '30D' | '90D' | '1Y';

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onGoToTrade, onGoToWallet }) => {
  const {
    cashBalance,
    totalEquity,
    totalUnrealizedPnl,
    marginUsed,
    freeMargin,
    positions,
    tradeHistory,
    closePosition,
  } = useTrading();

  const [perfTimeframe, setPerfTimeframe] = useState<PerformanceTimeframe>('7D');

  const isProfitable = totalUnrealizedPnl >= 0;
  const pnlPercent = (totalUnrealizedPnl / (cashBalance || 1)) * 100;

  // Asset breakdown calculations
  const cryptoPositions = positions.filter(p => p.symbol.includes('/USD') && (p.symbol.startsWith('BTC') || p.symbol.startsWith('ETH') || p.symbol.startsWith('SOL')));
  const stockPositions = positions.filter(p => !p.symbol.includes('/'));
  const forexPositions = positions.filter(p => p.symbol.startsWith('EUR') || p.symbol.startsWith('GBP'));

  const cryptoMargin = cryptoPositions.reduce((sum, p) => sum + p.margin, 0);
  const stockMargin = stockPositions.reduce((sum, p) => sum + p.margin, 0);
  const forexMargin = forexPositions.reduce((sum, p) => sum + p.margin, 0);

  const denom = totalEquity || 1;
  const cashPct = Math.round((freeMargin / denom) * 100);
  const cryptoPct = Math.round((cryptoMargin / denom) * 100);
  const stockPct = Math.round((stockMargin / denom) * 100);
  const forexPct = Math.round((forexMargin / denom) * 100);

  // Data for Recharts Donut Chart
  const allocationData = useMemo(() => {
    return [
      {
        name: 'USD Free Cash',
        value: freeMargin,
        percent: cashPct,
        color: '#3b82f6', // blue-500
      },
      {
        name: 'Crypto Margin',
        value: cryptoMargin,
        percent: cryptoPct,
        color: '#10b981', // emerald-500
      },
      {
        name: 'Equities Margin',
        value: stockMargin,
        percent: stockPct,
        color: '#f59e0b', // amber-500
      },
      {
        name: 'Forex Margin',
        value: forexMargin,
        percent: forexPct,
        color: '#a855f7', // purple-500
      },
    ].filter(item => item.value > 0);
  }, [freeMargin, cryptoMargin, stockMargin, forexMargin, cashPct, cryptoPct, stockPct, forexPct]);

  // Historical performance generator based on current equity
  const performanceData = useMemo(() => {
    const points: { time: string; equity: number; timestamp: number }[] = [];
    const now = Date.now();

    let count = 24;
    let intervalMs = 3600 * 1000;

    if (perfTimeframe === '7D') {
      count = 28;
      intervalMs = (7 * 24 * 3600 * 1000) / count;
    } else if (perfTimeframe === '30D') {
      count = 30;
      intervalMs = (30 * 24 * 3600 * 1000) / count;
    } else if (perfTimeframe === '90D') {
      count = 30;
      intervalMs = (90 * 24 * 3600 * 1000) / count;
    } else if (perfTimeframe === '1Y') {
      count = 36;
      intervalMs = (365 * 24 * 3600 * 1000) / count;
    }

    const startCapital = 24500;
    const totalDelta = totalEquity - startCapital;
    const stepDrift = totalDelta / count;

    for (let i = 0; i < count; i++) {
      const t = now - (count - 1 - i) * intervalMs;
      const d = new Date(t);
      let timeLabel = '';

      if (perfTimeframe === '24H') {
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (perfTimeframe === '7D' || perfTimeframe === '30D') {
        timeLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        timeLabel = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }

      if (i === count - 1) {
        points.push({ time: timeLabel, equity: totalEquity, timestamp: t });
      } else {
        const base = startCapital + stepDrift * i;
        const noise = (Math.sin(i * 0.75) + (Math.random() - 0.49) * 0.5) * 160;
        const val = Math.max(1000, Number((base + noise).toFixed(2)));
        points.push({ time: timeLabel, equity: val, timestamp: t });
      }
    }

    return points;
  }, [totalEquity, perfTimeframe]);

  // Overall gain/loss from start of timeframe
  const firstPoint = performanceData[0]?.equity || totalEquity;
  const netPeriodChange = totalEquity - firstPoint;
  const netPeriodChangePct = (netPeriodChange / (firstPoint || 1)) * 100;
  const isPeriodPositive = netPeriodChange >= 0;

  // Recharts Custom Tooltip for Donut
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 font-sans font-semibold text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300 mt-1 font-mono">
            Amount: <strong className="text-slate-100">${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            Share: <strong className="text-slate-200">{data.percent}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  // Recharts Custom Tooltip for Line / Area Performance Graph
  const CustomPerformanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const diffFromStart = val - firstPoint;
      const diffPct = (diffFromStart / (firstPoint || 1)) * 100;
      const isPos = diffFromStart >= 0;

      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-slate-400 text-[11px] font-sans">{label}</div>
          <div className="text-slate-100 font-bold text-sm mt-0.5">
            ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPos ? '+' : ''}${diffFromStart.toFixed(2)} ({isPos ? '+' : ''}{diffPct.toFixed(2)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans">Portfolio Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time equity valuation, asset exposure breakdown, and position risk monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGoToWallet}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Manage Wallet
          </button>
          <button
            onClick={onGoToTrade}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Open New Position
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Account Equity</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cash + Open PnL</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Unrealized Profit & Loss</span>
            {isProfitable ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
          </div>
          <div className={`text-2xl font-bold font-mono mt-2 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfitable ? '+' : ''}${totalUnrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isProfitable ? '+' : ''}{pnlPercent.toFixed(2)}% on active margin
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Available Free Margin</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            ${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for order deployment</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Margin In Use</span>
            <PieChartIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            ${marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {positions.length} active leveraged positions
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid: Recharts Performance Graph + Recharts Asset Allocation Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Historical Performance Line Graph (Recharts Area/Line Chart) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100 font-sans">Historical Equity Performance</h3>
                <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  isPeriodPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                }`}>
                  {isPeriodPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isPeriodPositive ? '+' : ''}{netPeriodChangePct.toFixed(2)}% ({isPeriodPositive ? '+' : ''}${netPeriodChange.toFixed(2)})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Portfolio net value trajectory over time</p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['24H', '7D', '30D', '90D', '1Y'] as PerformanceTimeframe[]).map(tf => (
                <button
                  key={tf}
                  onClick={() => setPerfTimeframe(tf)}
                  className={`px-2.5 py-1 font-mono text-xs font-medium rounded transition-colors cursor-pointer ${
                    perfTimeframe === tf
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Area / Line Chart Container */}
          <div className="w-full h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPeriodPositive ? '#10b981' : '#3b82f6'}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPeriodPositive ? '#10b981' : '#3b82f6'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  orientation="right"
                  domain={['auto', 'auto']}
                  fontFamily="JetBrains Mono, monospace"
                  tickFormatter={val => `$${(val / 1000).toFixed(1)}k`}
                />
                <RechartsTooltip content={<CustomPerformanceTooltip />} />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={isPeriodPositive ? '#10b981' : '#3b82f6'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Asset Allocation Donut Chart (Recharts PieChart) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-100 font-sans">Asset Allocation</h3>
              <span className="text-xs text-slate-400 font-mono">
                {allocationData.length} Classes
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mb-2">Capital exposure distribution</p>

            {/* Recharts PieChart Donut Container */}
            <div className="relative w-full h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Overlay Net Equity Figure */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-slate-400 font-sans">Total</span>
                <span className="text-sm font-bold font-mono text-slate-100">
                  ${(totalEquity / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
            {allocationData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-sans text-xs">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-200 font-semibold">{item.percent}%</span>
                  <span className="text-slate-400 text-[11px] ml-1.5 font-normal">
                    (${item.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Positions & Holdings Detail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans">Active Holdings & Positions</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Live market exposure currently deployed</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{positions.length} Positions</span>
        </div>

        <div className="overflow-x-auto">
          {positions.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3 text-right">Entry Price</th>
                  <th className="py-2.5 px-3 text-right">Mark Price</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                  <th className="py-2.5 px-3 text-right">Unrealized PnL</th>
                  <th className="py-2.5 px-3 text-center font-sans">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map(p => {
                  const isPositive = p.pnl >= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-100 font-sans">
                        {p.symbol}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.side === 'buy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {p.side} {p.size} ({p.leverage}x)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ${p.entryPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-100 font-semibold">
                        ${p.markPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        ${p.margin.toLocaleString()}
                      </td>
                      <td className={`py-3 px-3 text-right font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}${p.pnl.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => closePosition(p.id)}
                          className="px-2.5 py-1 text-xs font-sans font-medium bg-slate-800 hover:bg-rose-600/80 hover:text-white text-slate-300 border border-slate-700/60 rounded transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-slate-400 font-sans">
              <p className="text-sm">No active holdings</p>
              <button
                onClick={onGoToTrade}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Start Trading
              </button>
            </div>
          )}
        </div>

        {/* Historical Metrics Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-sans">Total Closed Trades:</span>{' '}
            <strong className="text-slate-200 font-mono">{tradeHistory.length}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-sans">Trading Commission:</span>{' '}
            <strong className="text-slate-200 font-mono">0.05% Tier 1</strong>
          </div>
          <div>
            <span className="text-slate-400 font-sans">Account Health:</span>{' '}
            <strong className="text-emerald-400 font-sans font-semibold">Optimal (Low Risk)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
