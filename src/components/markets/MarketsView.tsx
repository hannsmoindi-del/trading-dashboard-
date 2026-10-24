import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { AssetCategory } from '../../types/trading';
import { Search, TrendingUp, TrendingDown, ArrowUpDown, ChevronRight } from 'lucide-react';

interface MarketsViewProps {
  onSelectAssetAndTrade: (symbol: string) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({ onSelectAssetAndTrade }) => {
  const { assets } = useTrading();
  const [filter, setFilter] = useState<'all' | AssetCategory>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'symbol' | 'price' | 'change24h' | 'volume24h'>('volume24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredAssets = assets
    .filter(a => {
      const matchCat = filter === 'all' || a.category === filter;
      const matchSearch = a.symbol.toLowerCase().includes(search.toLowerCase()) ||
                          a.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'symbol') comparison = a.symbol.localeCompare(b.symbol);
      else if (sortField === 'price') comparison = a.price - b.price;
      else if (sortField === 'change24h') comparison = a.change24h - b.change24h;
      else if (sortField === 'volume24h') comparison = a.volume24h - b.volume24h;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'symbol' | 'price' | 'change24h' | 'volume24h') => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Market KPIs
  const topGainer = [...assets].sort((a, b) => b.change24h - a.change24h)[0];
  const topLoser = [...assets].sort((a, b) => a.change24h - b.change24h)[0];
  const totalVolume = assets.reduce((sum, a) => sum + a.volume24h, 0);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Markets Explorer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time price feeds, volume analytics, and execution pairs across global markets.
        </p>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">24h Aggregate Volume</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">
            ${(totalVolume / 1_000_000_000).toFixed(2)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active across 8 instrument pairs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Top Performer (24h)</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-slate-100">{topGainer?.symbol}</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              +{topGainer?.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">${topGainer?.price.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Top Pullback (24h)</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-slate-100">{topLoser?.symbol}</span>
            <span className="text-base font-bold font-mono text-rose-400">
              {topLoser?.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">${topLoser?.price.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'all' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Assets ({assets.length})
            </button>
            <button
              onClick={() => setFilter('crypto')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'crypto' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cryptocurrency
            </button>
            <button
              onClick={() => setFilter('stocks')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'stocks' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Equities / Stocks
            </button>
            <button
              onClick={() => setFilter('forex')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'forex' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Forex Currencies
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol or name..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Screener Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-3 font-medium cursor-pointer hover:text-slate-200 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Instrument</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-3 font-medium text-right cursor-pointer hover:text-slate-200 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change24h')}
                  className="py-3 px-3 font-medium text-right cursor-pointer hover:text-slate-200 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">24h High / Low</th>
                <th
                  onClick={() => handleSort('volume24h')}
                  className="py-3 px-3 font-medium text-right cursor-pointer hover:text-slate-200 select-none hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAssets.map(asset => {
                const isPositive = asset.change24h >= 0;
                return (
                  <tr key={asset.symbol} className="hover:bg-slate-800/40 transition-colors">
                    {/* Name & Symbol */}
                    <td className="py-3 px-3 font-sans">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 text-sm">{asset.symbol}</span>
                        <span className="text-xs text-slate-400">{asset.name}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-bold text-slate-100 text-sm">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals, maximumFractionDigits: asset.decimals })}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold text-xs ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </td>

                    {/* 24h High / Low */}
                    <td className="py-3 px-3 text-right text-slate-300 hidden sm:table-cell">
                      <div className="text-emerald-400/90">${asset.high24h.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })}</div>
                      <div className="text-rose-400/90">${asset.low24h.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })}</div>
                    </td>

                    {/* 24h Volume */}
                    <td className="py-3 px-3 text-right text-slate-300 hidden md:table-cell">
                      ${(asset.volume24h / 1_000_000).toFixed(2)}M
                    </td>

                    {/* Trade Now CTA */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectAssetAndTrade(asset.symbol)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <span>Trade</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
