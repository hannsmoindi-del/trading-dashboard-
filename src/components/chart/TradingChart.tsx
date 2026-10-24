import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Candle, Timeframe, ChartType } from '../../types/trading';
import { BarChart3, LineChart, ZoomIn, ZoomOut, RotateCcw, Bell } from 'lucide-react';

export const TradingChart: React.FC = () => {
  const {
    currentAsset,
    candles,
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    indicators,
    toggleIndicator,
    alerts,
    openCreateAlertModal,
  } = useTrading();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Timeframes available
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

  // Slice visible candles based on zoom level
  const visibleCandles = useMemo(() => {
    const total = candles.length;
    const count = Math.max(25, Math.min(total, Math.round(55 / zoomLevel)));
    return candles.slice(-count);
  }, [candles, zoomLevel]);

  // Compute Simple Moving Average (SMA)
  const sma20 = useMemo(() => {
    const period = 20;
    return visibleCandles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [visibleCandles]);

  // Compute EMA 50
  const ema50 = useMemo(() => {
    const period = Math.min(30, visibleCandles.length);
    const k = 2 / (period + 1);
    let prevEma: number | null = null;
    return visibleCandles.map((c, idx) => {
      if (idx === 0) {
        prevEma = c.close;
        return prevEma;
      }
      prevEma = c.close * k + (prevEma ?? c.close) * (1 - k);
      return prevEma;
    });
  }, [visibleCandles]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Layout configuration
    const paddingRight = 65; // Price scale
    const paddingBottom = 26; // Time scale
    const chartWidth = width - paddingRight;
    const chartHeight = height - paddingBottom;
    const volumeHeight = indicators.volume ? chartHeight * 0.18 : 0;
    const priceChartHeight = chartHeight - volumeHeight;

    // Background
    ctx.fillStyle = '#0b1120'; // deep obsidian slate
    ctx.fillRect(0, 0, width, height);

    if (visibleCandles.length < 2) return;

    // Calculate Price Min & Max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    // Add 4% buffer to top and bottom
    const priceSpan = maxPrice - minPrice || 1;
    minPrice -= priceSpan * 0.04;
    maxPrice += priceSpan * 0.04;
    const priceRange = maxPrice - minPrice;

    // Helpers to project coordinates
    const candleWidth = chartWidth / visibleCandles.length;
    const getY = (price: number) => {
      return priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
    };
    const getX = (index: number) => {
      return index * candleWidth + candleWidth / 2;
    };

    // 1. Draw Grid lines (Horizontal & Vertical)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)'; // slate-700 subtle hairline
    ctx.setLineDash([3, 4]);

    const numHorizontalLines = 5;
    for (let i = 0; i <= numHorizontalLines; i++) {
      const y = (priceChartHeight / numHorizontalLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right axis price text
      const priceAtY = maxPrice - (i / numHorizontalLines) * priceRange;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceAtY.toFixed(currentAsset.decimals), chartWidth + 6, y + 3);
    }

    // Vertical time grid lines
    const timeStep = Math.max(1, Math.floor(visibleCandles.length / 5));
    for (let i = 0; i < visibleCandles.length; i += timeStep) {
      const x = getX(i);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      const c = visibleCandles[i];
      const date = new Date(c.time);
      const timeStr = timeframe === '1D' 
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, height - 8);
    }
    ctx.setLineDash([]); // reset dash

    // 2. Draw Volume Bars
    if (indicators.volume && maxVolume > 0) {
      visibleCandles.forEach((c, i) => {
        const x = getX(i);
        const barW = Math.max(2, candleWidth * 0.7);
        const barH = (c.volume / maxVolume) * (volumeHeight - 8);
        const y = chartHeight - barH;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x - barW / 2, y, barW, barH);
      });
    }

    // 3. Draw Candlesticks or Line Chart
    if (chartType === 'candles') {
      visibleCandles.forEach((c, i) => {
        const x = getX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#ef4444'; // emerald vs red

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(1.5, Math.abs(closeY - openY));
        const bodyW = Math.max(3, candleWidth * 0.72);

        ctx.fillStyle = color;
        ctx.fillRect(x - bodyW / 2, bodyY, bodyW, bodyH);
      });
    } else {
      // Line / Mountain Chart
      ctx.beginPath();
      visibleCandles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Area fill gradient
      const lastX = getX(visibleCandles.length - 1);
      const firstX = getX(0);
      ctx.lineTo(lastX, priceChartHeight);
      ctx.lineTo(firstX, priceChartHeight);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, priceChartHeight);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.00)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 4. Overlays: SMA 20
    if (indicators.ma20) {
      ctx.beginPath();
      let started = false;
      sma20.forEach((val, i) => {
        if (val === null) return;
        const x = getX(i);
        const y = getY(val);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = '#f59e0b'; // amber-500
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 5. Overlays: EMA 50
    if (indicators.ema50) {
      ctx.beginPath();
      ema50.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#a855f7'; // purple-500
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Current Price Line (Live pulse beacon on right axis)
    const currentPriceY = getY(currentAsset.price);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = currentAsset.change24h >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(chartWidth, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right axis price badge
    const badgeColor = currentAsset.change24h >= 0 ? '#10b981' : '#ef4444';
    ctx.fillStyle = badgeColor;
    ctx.fillRect(chartWidth + 2, currentPriceY - 9, paddingRight - 4, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    // 7. Active Price Alert Markers for current asset
    const activeAlerts = alerts.filter(a => a.symbol === currentAsset.symbol && a.status === 'active');
    activeAlerts.forEach(alt => {
      if (alt.targetPrice >= minPrice && alt.targetPrice <= maxPrice) {
        const altY = getY(alt.targetPrice);
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#f59e0b'; // amber-500
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, altY);
        ctx.lineTo(chartWidth, altY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Right axis alert badge
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(chartWidth + 2, altY - 8, paddingRight - 4, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`🔔${alt.targetPrice.toFixed(currentAsset.decimals)}`, chartWidth + (paddingRight - 4) / 2 + 2, altY + 3.5);
      }
    });

    // 8. Interactive Crosshair & Tooltip
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth && mousePos.y >= 0 && mousePos.y <= height) {
      // Find closest candle
      const candleIndex = Math.min(
        visibleCandles.length - 1,
        Math.max(0, Math.floor(mousePos.x / candleWidth))
      );
      const activeCandle = visibleCandles[candleIndex];
      const candleX = getX(candleIndex);

      // Vertical line
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(candleX, 0);
      ctx.lineTo(candleX, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis badge at mousePos.y
      const mousePrice = maxPrice - (mousePos.y / priceChartHeight) * priceRange;
      ctx.fillStyle = '#334155';
      ctx.fillRect(chartWidth + 2, mousePos.y - 8, paddingRight - 4, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(mousePrice.toFixed(currentAsset.decimals), chartWidth + (paddingRight - 4) / 2 + 2, mousePos.y + 3.5);

      // X-axis badge at candleX
      const dt = new Date(activeCandle.time);
      const timeStr = `${dt.toLocaleDateString()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      ctx.fillStyle = '#334155';
      const badgeW = 90;
      ctx.fillRect(candleX - badgeW / 2, chartHeight + 4, badgeW, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, candleX, chartHeight + 15);
    }
  }, [visibleCandles, currentAsset, chartType, indicators, mousePos, timeframe, sma20, ema50, zoomLevel, alerts]);

  // Handle Mouse Events for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const chartWidth = rect.width - 65;
    const candleWidth = chartWidth / visibleCandles.length;
    const index = Math.min(
      visibleCandles.length - 1,
      Math.max(0, Math.floor(x / candleWidth))
    );
    setHoveredCandle(visibleCandles[index]);
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(z => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel(z => Math.max(0.6, z - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  // Active or latest candle for header HUD
  const activeCandle = hoveredCandle || visibleCandles[visibleCandles.length - 1];
  const isUp = activeCandle ? activeCandle.close >= activeCandle.open : true;
  const candleChange = activeCandle ? ((activeCandle.close - activeCandle.open) / (activeCandle.open || 1)) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Chart Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        {/* Left: Asset Title & OHLC HUD */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
            <span>{currentAsset.symbol}</span>
            <span className="text-slate-400 font-normal text-xs">{currentAsset.name}</span>
          </div>

          {activeCandle && (
            <div className="hidden lg:flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <div>
                O: <span className="text-slate-200">{activeCandle.open.toFixed(currentAsset.decimals)}</span>
              </div>
              <div>
                H: <span className="text-emerald-400">{activeCandle.high.toFixed(currentAsset.decimals)}</span>
              </div>
              <div>
                L: <span className="text-rose-400">{activeCandle.low.toFixed(currentAsset.decimals)}</span>
              </div>
              <div>
                C: <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{activeCandle.close.toFixed(currentAsset.decimals)}</span>
              </div>
              <div>
                Chg: <span className={candleChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {candleChange >= 0 ? '+' : ''}{candleChange.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeframe, Chart style, Indicators, Alerts & Zoom */}
        <div className="flex items-center gap-2">
          {/* Quick Alert Button */}
          <button
            onClick={() => openCreateAlertModal(currentAsset.symbol, currentAsset.price)}
            title="Set Price Alert for this asset"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-sans">Set Alert</span>
          </button>

          {/* Timeframe Buttons */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 font-mono text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setChartType('candles')}
              title="Candlestick Chart"
              className={`p-1 rounded transition-colors ${
                chartType === 'candles' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Line Chart"
              className={`p-1 rounded transition-colors ${
                chartType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicators Bar */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-[10px]">
            <button
              onClick={() => toggleIndicator('ma20')}
              className={`px-1.5 py-1 rounded font-medium transition-colors ${
                indicators.ma20 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MA 20
            </button>
            <button
              onClick={() => toggleIndicator('ema50')}
              className={`px-1.5 py-1 rounded font-medium transition-colors ${
                indicators.ema50 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => toggleIndicator('volume')}
              className={`px-1.5 py-1 rounded font-medium transition-colors ${
                indicators.volume ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VOL
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-[340px] max-h-[460px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
};
