import React, { useState, useMemo } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { SyntheticAsset, SyntheticAssetId } from '../../types/deriv';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Search,
  Maximize2,
  ExternalLink,
  ChevronRight,
  X,
  PieChart,
  Grid3X3,
  BarChart2
} from 'lucide-react';

interface PortfolioHeatmapProps {
  onSelectAssetForTrade?: (assetId: SyntheticAssetId) => void;
  onNavigatePlatforms?: () => void;
}

type HeatmapTimeframe = '24h' | '1w' | '1m' | '1y';
type CategoryFilter = 'all' | 'Synthetics' | 'Forex' | 'Crypto' | 'Commodities';
type ViewLayout = 'matrix' | 'weighted';

export const PortfolioHeatmap: React.FC<PortfolioHeatmapProps> = ({
  onSelectAssetForTrade,
  onNavigatePlatforms,
}) => {
  const { assets, setSelectedAssetId, selectedAsset } = useDeriv();

  const [timeframe, setTimeframe] = useState<HeatmapTimeframe>('24h');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('matrix');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedAsset, setInspectedAsset] = useState<SyntheticAsset | null>(null);

  // Helper to extract the percentage change based on active timeframe
  const getAssetChange = (asset: SyntheticAsset, tf: HeatmapTimeframe): number => {
    switch (tf) {
      case '1w':
        return asset.change1w ?? asset.change24h * 1.8;
      case '1m':
        return asset.change1m ?? asset.change24h * 3.5;
      case '1y':
        return asset.change1y ?? asset.change24h * 7.2;
      case '24h':
      default:
        return asset.change24h;
    }
  };

  // Color gradient calculator for financial heatmaps
  const getHeatmapColorClasses = (change: number) => {
    if (change >= 5.0) {
      return {
        bg: 'bg-emerald-500/30 hover:bg-emerald-500/40',
        border: 'border-emerald-400/70',
        text: 'text-emerald-300',
        badge: 'bg-emerald-500 text-slate-950',
        glow: 'shadow-emerald-500/20 shadow-md',
      };
    } else if (change >= 2.0) {
      return {
        bg: 'bg-emerald-600/20 hover:bg-emerald-600/30',
        border: 'border-emerald-500/45',
        text: 'text-emerald-400',
        badge: 'bg-emerald-600/30 text-emerald-300',
        glow: 'shadow-emerald-600/10 shadow-sm',
      };
    } else if (change >= 0.5) {
      return {
        bg: 'bg-emerald-900/20 hover:bg-emerald-900/30',
        border: 'border-emerald-600/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-900/40 text-emerald-400',
        glow: '',
      };
    } else if (change > -0.5 && change < 0.5) {
      return {
        bg: 'bg-[#111927] hover:bg-[#162234]',
        border: 'border-[#293548]',
        text: 'text-slate-300',
        badge: 'bg-[#1b263b] text-slate-400',
        glow: '',
      };
    } else if (change > -2.0) {
      return {
        bg: 'bg-rose-950/20 hover:bg-rose-950/30',
        border: 'border-rose-700/30',
        text: 'text-rose-400',
        badge: 'bg-rose-950/40 text-rose-300',
        glow: '',
      };
    } else if (change > -5.0) {
      return {
        bg: 'bg-[#ff444f]/20 hover:bg-[#ff444f]/30',
        border: 'border-[#ff444f]/50',
        text: 'text-[#ff444f]',
        badge: 'bg-[#ff444f]/30 text-white',
        glow: 'shadow-[#ff444f]/15 shadow-sm',
      };
    } else {
      return {
        bg: 'bg-[#ff444f]/35 hover:bg-[#ff444f]/45',
        border: 'border-[#ff444f]/80',
        text: 'text-[#ff444f]',
        badge: 'bg-[#ff444f] text-white',
        glow: 'shadow-[#ff444f]/30 shadow-md',
      };
    }
  };

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesCategory = category === 'all' || asset.category === category;
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [assets, category, searchQuery]);

  // Aggregated KPIs
  const kpis = useMemo(() => {
    let totalValue = 0;
    let weightedChangeSum = 0;
    let gainersCount = 0;
    let losersCount = 0;
    let topGainer: { asset: SyntheticAsset; change: number } | null = null;
    let topLoser: { asset: SyntheticAsset; change: number } | null = null;

    assets.forEach(asset => {
      const chg = getAssetChange(asset, timeframe);
      const val = asset.holdingValueUsd || 0;
      totalValue += val;
      weightedChangeSum += chg * (asset.allocationPct || 5);

      if (chg >= 0) gainersCount++;
      else losersCount++;

      if (!topGainer || chg > topGainer.change) {
        topGainer = { asset, change: chg };
      }
      if (!topLoser || chg < topLoser.change) {
        topLoser = { asset, change: chg };
      }
    });

    const netChangePct = totalValue > 0 ? weightedChangeSum / 100 : 0;
    const netPnlUsd = (totalValue * netChangePct) / 100;

    return {
      totalValue,
      netChangePct,
      netPnlUsd,
      gainersCount,
      losersCount,
      topGainer,
      topLoser,
    };
  }, [assets, timeframe]);

  const handleAssetClick = (asset: SyntheticAsset) => {
    setInspectedAsset(asset);
  };

  const handleLaunchTrade = (asset: SyntheticAsset) => {
    setSelectedAssetId(asset.id);
    if (onSelectAssetForTrade) {
      onSelectAssetForTrade(asset.id);
    }
    if (onNavigatePlatforms) {
      onNavigatePlatforms();
    }
  };

  return (
    <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col gap-5">
      {/* Header bar with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00c853] animate-pulse"></span>
              Portfolio Performance Heatmap
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ff444f]/15 text-[#ff444f] border border-[#ff444f]/30">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-[#8592a6] mt-0.5">
            Real-time visual gain/loss matrix across Deriv synthetics, forex, and crypto holdings
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8592a6]" />
            <input
              type="text"
              placeholder="Search asset..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0e1726] border border-[#293548] text-white pl-8 pr-3 py-1.5 rounded-lg text-xs placeholder:text-[#8592a6] focus:outline-none focus:border-[#ff444f] w-36 sm:w-44 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#8592a6] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#0e1726] p-0.5 rounded-lg border border-[#293548]">
            {(
              [
                { id: '24h', label: '1D' },
                { id: '1w', label: '1W' },
                { id: '1m', label: '1M' },
                { id: '1y', label: '1Y' },
              ] as const
            ).map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-[#ff444f] text-white shadow-xs'
                    : 'text-[#8592a6] hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Layout Mode Toggle */}
          <div className="flex items-center bg-[#0e1726] p-0.5 rounded-lg border border-[#293548]">
            <button
              onClick={() => setViewLayout('matrix')}
              title="Matrix View"
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewLayout === 'matrix'
                  ? 'bg-[#1b263b] text-white shadow-xs border border-[#293548]'
                  : 'text-[#8592a6] hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('weighted')}
              title="Allocation Weighted View"
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewLayout === 'weighted'
                  ? 'bg-[#1b263b] text-white shadow-xs border border-[#293548]'
                  : 'text-[#8592a6] hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Top Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#293548]/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All Assets' },
              { id: 'Synthetics', label: 'Synthetics' },
              { id: 'Forex', label: 'Forex' },
              { id: 'Crypto', label: 'Crypto' },
              { id: 'Commodities', label: 'Commodities' },
            ] as const
          ).map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                category === cat.id
                  ? 'bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/50'
                  : 'bg-[#0e1726] border border-[#293548] text-[#8592a6] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* High-level performance stat chips */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-[#0e1726] px-2.5 py-1 rounded-md border border-[#293548] flex items-center gap-1.5">
            <span className="text-[#8592a6]">Market Breadth:</span>
            <span className="text-[#00c853] font-bold">{kpis.gainersCount}▲</span>
            <span className="text-[#ff444f] font-bold">{kpis.losersCount}▼</span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1 font-bold ${
              kpis.netChangePct >= 0
                ? 'bg-[#00c853]/15 text-[#00c853] border-[#00c853]/30'
                : 'bg-[#ff444f]/15 text-[#ff444f] border-[#ff444f]/30'
            }`}
          >
            {kpis.netChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {kpis.netChangePct >= 0 ? '+' : ''}
              {kpis.netChangePct.toFixed(2)}% ({timeframe.toUpperCase()})
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Area */}
      {filteredAssets.length === 0 ? (
        <div className="py-12 text-center text-[#8592a6] text-xs">
          No instruments found matching '{searchQuery}'. Try another search.
        </div>
      ) : viewLayout === 'matrix' ? (
        /* Uniform Grid Matrix View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {filteredAssets.map(asset => {
            const change = getAssetChange(asset, timeframe);
            const style = getHeatmapColorClasses(change);
            const isSelected = selectedAsset.id === asset.id;

            return (
              <div
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className={`relative group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  style.bg
                } ${style.border} ${style.glow} ${
                  isSelected ? 'ring-2 ring-white/50 scale-[1.02]' : ''
                }`}
              >
                {/* Top: Symbol & Category */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white truncate block">
                      {asset.id.replace('FRX_', '').replace('CRY_', '').replace('CMD_', '').replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#8592a6] block truncate">
                      {asset.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      change >= 0 ? 'bg-[#00c853]/25 text-[#00c853]' : 'bg-[#ff444f]/25 text-[#ff444f]'
                    }`}
                  >
                    {change >= 0 ? '+' : ''}
                    {change.toFixed(2)}%
                  </span>
                </div>

                {/* Price Display */}
                <div className="my-1.5">
                  <div className="text-sm font-bold text-white font-mono tracking-tight">
                    ${asset.price.toLocaleString(undefined, {
                      minimumFractionDigits: asset.decimals,
                      maximumFractionDigits: asset.decimals,
                    })}
                  </div>
                  {asset.holdingValueUsd && (
                    <div className="text-[10px] text-[#8592a6] font-mono flex items-center justify-between mt-0.5">
                      <span>Hold: ${asset.holdingValueUsd.toFixed(0)}</span>
                      <span className="text-slate-400 font-semibold">{asset.allocationPct}%</span>
                    </div>
                  )}
                </div>

                {/* Mini SVG Sparkline */}
                {asset.sparkline && asset.sparkline.length > 0 && (
                  <div className="mt-2 h-6 w-full opacity-80 group-hover:opacity-100 transition-opacity">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
                      {(() => {
                        const min = Math.min(...asset.sparkline);
                        const max = Math.max(...asset.sparkline);
                        const rng = max - min || 1;
                        const pts = asset.sparkline
                          .map((val, i) => {
                            const x = (i / (asset.sparkline!.length - 1)) * 100;
                            const y = 22 - ((val - min) / rng) * 20;
                            return `${x},${y}`;
                          })
                          .join(' ');
                        return (
                          <polyline
                            fill="none"
                            stroke={change >= 0 ? '#00c853' : '#ff444f'}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={pts}
                          />
                        );
                      })()}
                    </svg>
                  </div>
                )}

                {/* Quick inspect hint overlay on hover */}
                <div className="absolute inset-x-2 bottom-1 text-[9px] text-center text-white/70 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded py-0.5 backdrop-blur-xs">
                  Inspect & Trade
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Weighted Treemap-like Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredAssets.map(asset => {
            const change = getAssetChange(asset, timeframe);
            const style = getHeatmapColorClasses(change);
            const weight = asset.allocationPct || 5;

            return (
              <div
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                style={{
                  gridColumn: weight > 15 ? 'span 2' : 'span 1',
                }}
                className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  style.bg
                } ${style.border} ${style.glow}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                      {asset.name}
                    </h4>
                    <span className="text-[11px] text-[#8592a6] font-mono">
                      Allocation: <strong className="text-white">{weight}%</strong> ({asset.category})
                    </span>
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-0.5 ${
                      change >= 0 ? 'bg-[#00c853]/25 text-[#00c853]' : 'bg-[#ff444f]/25 text-[#ff444f]'
                    }`}
                  >
                    {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-[#8592a6] block">Market Price</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      ${asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: asset.decimals,
                        maximumFractionDigits: asset.decimals,
                      })}
                    </span>
                  </div>

                  {asset.holdingValueUsd && (
                    <div className="text-right">
                      <span className="text-[11px] text-[#8592a6] block">Position Value</span>
                      <span className="text-sm font-bold text-white font-mono">
                        ${asset.holdingValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Heatmap Spectrum Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#293548]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8592a6] uppercase tracking-wider">
            Heatmap Scale:
          </span>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="text-[#ff444f] font-bold">&lt; -5%</span>
            <div className="flex h-3 w-36 sm:w-56 rounded-md overflow-hidden border border-[#293548]">
              <div className="flex-1 bg-[#ff444f] opacity-80" title="< -5%" />
              <div className="flex-1 bg-[#ff444f] opacity-40" title="-2% to -5%" />
              <div className="flex-1 bg-rose-950 opacity-60" title="-0.5% to -2%" />
              <div className="flex-1 bg-[#111927]" title="-0.5% to +0.5%" />
              <div className="flex-1 bg-emerald-950 opacity-60" title="+0.5% to +2%" />
              <div className="flex-1 bg-emerald-600 opacity-50" title="+2% to +5%" />
              <div className="flex-1 bg-emerald-500 opacity-90" title="> +5%" />
            </div>
            <span className="text-[#00c853] font-bold">&gt; +5%</span>
          </div>
        </div>

        <div className="text-[11px] text-[#8592a6] flex items-center gap-3">
          <span>Click any block to inspect details or execute DTrader options</span>
        </div>
      </div>

      {/* Inspection Modal */}
      {inspectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1b263b] border border-[#293548] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setInspectedAsset(null)}
              className="absolute top-4 right-4 text-[#8592a6] hover:text-white p-1 rounded-lg bg-[#0e1726] border border-[#293548]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="p-3 bg-[#0e1726] rounded-xl border border-[#293548]">
                <Activity className="w-6 h-6 text-[#ff444f]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{inspectedAsset.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2962ff]/15 text-[#2962ff]">
                    {inspectedAsset.category}
                  </span>
                </div>
                <p className="text-xs text-[#8592a6] font-mono mt-0.5">
                  Symbol ID: {inspectedAsset.id} | Volatility Index: {inspectedAsset.volatility}x
                </p>
              </div>
            </div>

            {/* Price & Change Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              <div className="bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <span className="text-[10px] text-[#8592a6] uppercase font-bold block">Current Price</span>
                <span className="text-sm font-extrabold text-white font-mono mt-0.5 block">
                  ${inspectedAsset.price.toLocaleString(undefined, {
                    minimumFractionDigits: inspectedAsset.decimals,
                  })}
                </span>
              </div>

              <div className="bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <span className="text-[10px] text-[#8592a6] uppercase font-bold block">24h Change</span>
                <span
                  className={`text-sm font-extrabold font-mono mt-0.5 block ${
                    inspectedAsset.change24h >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'
                  }`}
                >
                  {inspectedAsset.change24h >= 0 ? '+' : ''}
                  {inspectedAsset.change24h}%
                </span>
              </div>

              <div className="bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <span className="text-[10px] text-[#8592a6] uppercase font-bold block">7D Performance</span>
                <span
                  className={`text-sm font-extrabold font-mono mt-0.5 block ${
                    (inspectedAsset.change1w ?? 0) >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'
                  }`}
                >
                  {(inspectedAsset.change1w ?? 0) >= 0 ? '+' : ''}
                  {inspectedAsset.change1w ?? 0}%
                </span>
              </div>

              <div className="bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <span className="text-[10px] text-[#8592a6] uppercase font-bold block">30D Performance</span>
                <span
                  className={`text-sm font-extrabold font-mono mt-0.5 block ${
                    (inspectedAsset.change1m ?? 0) >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'
                  }`}
                >
                  {(inspectedAsset.change1m ?? 0) >= 0 ? '+' : ''}
                  {inspectedAsset.change1m ?? 0}%
                </span>
              </div>
            </div>

            {/* Position & Portfolio Info */}
            <div className="bg-[#0e1726] p-4 rounded-xl border border-[#293548] mb-5">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>Your Holding & Position Status</span>
                <span className="text-[#00c853] font-mono">{inspectedAsset.allocationPct}% of Portfolio</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#8592a6] text-[10px] block">Units Owned</span>
                  <span className="text-white font-bold">{inspectedAsset.holdingQty || '0.00'}</span>
                </div>
                <div>
                  <span className="text-[#8592a6] text-[10px] block">Market Value</span>
                  <span className="text-white font-bold">
                    ${(inspectedAsset.holdingValueUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[#8592a6] text-[10px] block">Unrealized P&L</span>
                  <span
                    className={`font-bold ${
                      (inspectedAsset.pnlUsd || 0) >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'
                    }`}
                  >
                    {(inspectedAsset.pnlUsd || 0) >= 0 ? '+' : ''}$
                    {(inspectedAsset.pnlUsd || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedAssetId(inspectedAsset.id);
                  setInspectedAsset(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#0e1726] hover:bg-[#293548] border border-[#293548] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Set as Active Market
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLaunchTrade(inspectedAsset);
                  setInspectedAsset(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#ff444f] hover:bg-[#ff444f]/90 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#ff444f]/25 flex items-center justify-center gap-1.5"
              >
                <span>Trade on DTrader</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
