import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { AssetCategory } from '../../types/trading';
import { Search, TrendingUp, TrendingDown, Bell } from 'lucide-react';

export const WatchlistTable: React.FC = () => {
  const { assets, selectedSymbol, setSelectedSymbol, alerts, openCreateAlertModal } = useTrading();
  const [filter, setFilter] = useState<'all' | AssetCategory>('all');
  const [search, setSearch] = useState('');

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = filter === 'all' || asset.category === filter;
    const matchesSearch = asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
                          asset.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <h3 className="text-base font-semibold text-slate-100">Market Watchlist</h3>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs mb-3 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
            filter === 'all' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('crypto')}
          className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
            filter === 'crypto' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Crypto
        </button>
        <button
          onClick={() => setFilter('stocks')}
          className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
            filter === 'stocks' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stocks
        </button>
        <button
          onClick={() => setFilter('forex')}
          className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
            filter === 'forex' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Forex
        </button>
      </div>

      {/* Watchlist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2 px-2.5 font-medium">Asset</th>
              <th className="py-2 px-2.5 font-medium text-right">Price</th>
              <th className="py-2 px-2.5 font-medium text-right">24h Change</th>
              <th className="py-2 px-2.5 font-medium text-right hidden sm:table-cell">24h High / Low</th>
              <th className="py-2 px-2.5 font-medium text-right hidden md:table-cell">24h Volume</th>
              <th className="py-2 px-2 font-medium text-center w-10">Alert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredAssets.map(asset => {
              const isSelected = asset.symbol === selectedSymbol;
              const isPositive = asset.change24h >= 0;
              const hasAlert = alerts.some(a => a.symbol === asset.symbol && a.status === 'active');

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected
                      ? 'bg-blue-600/10 hover:bg-blue-600/15'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Asset Symbol & Name */}
                  <td className="py-2.5 px-2.5 font-sans">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                          {asset.symbol}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {asset.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-2.5 text-right font-semibold text-slate-100">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals, maximumFractionDigits: asset.decimals })}
                  </td>

                  {/* 24h Change */}
                  <td className="py-2.5 px-2.5 text-right">
                    <div className="inline-flex items-center gap-1 font-medium">
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* 24h High / Low */}
                  <td className="py-2.5 px-2.5 text-right text-slate-400 text-[11px] hidden sm:table-cell">
                    <div>${asset.high24h.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })}</div>
                    <div className="text-slate-400">${asset.low24h.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })}</div>
                  </td>

                  {/* 24h Volume */}
                  <td className="py-2.5 px-2.5 text-right text-slate-400 text-[11px] hidden md:table-cell">
                    ${(asset.volume24h / 1_000_000).toFixed(1)}M
                  </td>

                  {/* Alert Action */}
                  <td className="py-2.5 px-2 text-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openCreateAlertModal(asset.symbol, asset.price)}
                      title={hasAlert ? "Active alert set for this asset" : "Set price alert"}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        hasAlert
                          ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25'
                          : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                  No assets match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
