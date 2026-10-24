import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { TradingChart } from '../chart/TradingChart';
import { TradeForm } from '../trade/TradeForm';
import { OrderBook } from '../orderbook/OrderBook';
import { WatchlistTable } from '../watchlist/WatchlistTable';
import { PositionsTable } from '../positions/PositionsTable';
import { RecentTradesWidget } from '../trades/RecentTradesWidget';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { currentAsset, lastTickSide } = useTrading();
  const isPositive = currentAsset.change24h >= 0;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 w-full max-w-[1600px] mx-auto">
      {/* Top Asset Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:px-5 sm:py-3 shadow-xs">
        {/* Price & Name */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400 font-medium">Selected Asset</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-slate-100">{currentAsset.symbol}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">{currentAsset.name}</span>
          </div>
        </div>

        {/* Live Index Price */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400 font-medium">Index Price</span>
          <div className={`text-base font-bold font-mono mt-0.5 transition-colors ${
            lastTickSide === 'up' ? 'text-emerald-400' : (lastTickSide === 'down' ? 'text-rose-400' : 'text-slate-100')
          }`}>
            ${currentAsset.price.toLocaleString(undefined, { minimumFractionDigits: currentAsset.decimals })}
          </div>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400 font-medium">24h Change</span>
          <div className={`flex items-center gap-1 text-base font-bold font-mono mt-0.5 ${
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{currentAsset.change24h.toFixed(2)}%
          </div>
        </div>

        {/* 24h High / Low */}
        <div className="flex flex-col hidden sm:flex">
          <span className="text-[11px] text-slate-400 font-medium">24h Range</span>
          <div className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-1.5">
            <span className="text-rose-400">${currentAsset.low24h.toLocaleString(undefined, { minimumFractionDigits: currentAsset.decimals })}</span>
            <span className="text-slate-600">—</span>
            <span className="text-emerald-400">${currentAsset.high24h.toLocaleString(undefined, { minimumFractionDigits: currentAsset.decimals })}</span>
          </div>
        </div>

        {/* 24h Turnover Volume */}
        <div className="flex flex-col hidden lg:flex">
          <span className="text-[11px] text-slate-400 font-medium">24h Volume</span>
          <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
            ${(currentAsset.volume24h / 1_000_000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Main Terminal Grid: Left (Chart + Watchlist + Positions) & Right (Trade Form + Orderbook + Recent Trades) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column (8 of 12 cols on desktop) */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Live Chart Container */}
          <div className="w-full">
            <TradingChart />
          </div>

          {/* Market Watchlist */}
          <div className="w-full">
            <WatchlistTable />
          </div>

          {/* Positions & Orders Manager */}
          <div className="w-full">
            <PositionsTable />
          </div>
        </div>

        {/* Right Column (4 of 12 cols on desktop) */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Order Placement Form */}
          <TradeForm />

          {/* Live Order Book */}
          <OrderBook />

          {/* User's Recent Trades Widget */}
          <RecentTradesWidget />
        </div>
      </div>
    </div>
  );
};
