import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Asset, Candle, Order, OrderSide, OrderType, Position, RecentTrade, OrderBookEntry, WalletTransaction, Timeframe, ChartType, PriceAlert } from '../types/trading';
import { INITIAL_ASSETS, generateCandleHistory } from '../data/mockAssets';

interface TradingContextType {
  assets: Asset[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  currentAsset: Asset;
  candles: Candle[];
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  indicators: {
    ma20: boolean;
    ema50: boolean;
    bollinger: boolean;
    volume: boolean;
  };
  toggleIndicator: (indicator: 'ma20' | 'ema50' | 'bollinger' | 'volume') => void;
  // Balances
  cashBalance: number;
  totalEquity: number;
  totalUnrealizedPnl: number;
  marginUsed: number;
  freeMargin: number;
  // Positions & Orders
  positions: Position[];
  openOrders: Order[];
  tradeHistory: Order[];
  transactions: WalletTransaction[];
  orderBook: { asks: OrderBookEntry[]; bids: OrderBookEntry[]; spread: number; spreadPercent: number };
  recentTrades: RecentTrade[];
  // Actions
  placeOrder: (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    amount: number;
    price?: number;
    leverage?: number;
  }) => { success: boolean; message: string };
  closePosition: (positionId: string) => void;
  cancelOrder: (orderId: string) => void;
  depositFunds: (amount: number) => void;
  withdrawFunds: (amount: number) => { success: boolean; message: string };
  resetDemoAccount: () => void;
  // Price Alerts
  alerts: PriceAlert[];
  activeAlertsCount: number;
  triggeredAlertsCount: number;
  createAlert: (params: { symbol: string; targetPrice: number; condition?: 'above' | 'below'; note?: string }) => void;
  updateAlert: (id: string, updates: Partial<Omit<PriceAlert, 'id' | 'createdAt'>>) => void;
  rearmAlert: (id: string, newTargetPrice?: number) => void;
  deleteAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  clearTriggeredAlerts: () => void;
  isAlertModalOpen: boolean;
  setIsAlertModalOpen: (open: boolean) => void;
  alertPrefillSymbol: string;
  setAlertPrefillSymbol: (symbol: string) => void;
  alertPrefillPrice?: number;
  setAlertPrefillPrice: (price?: number) => void;
  openCreateAlertModal: (symbol?: string, price?: number) => void;
  // Sound & notification state
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  lastTickSide: 'up' | 'down' | null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  clearNotification: () => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

// Web Audio synthesizer for crisp UI audio cues
function playAudioCue(type: 'fill' | 'cancel' | 'error' | 'alert') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'fill') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'cancel') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'alert') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12); // D6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USD');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastTickSide, setLastTickSide] = useState<'up' | 'down' | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alt_1',
      symbol: 'BTC/USD',
      targetPrice: 68000.00,
      condition: 'above',
      initialPrice: 67420.00,
      status: 'active',
      createdAt: Date.now() - 3600000,
      note: 'Key breakout resistance level',
    },
    {
      id: 'alt_2',
      symbol: 'ETH/USD',
      targetPrice: 3450.00,
      condition: 'below',
      initialPrice: 3510.20,
      status: 'active',
      createdAt: Date.now() - 7200000,
      note: 'Support dip retest entry',
    },
  ]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertPrefillSymbol, setAlertPrefillSymbol] = useState<string>('BTC/USD');
  const [alertPrefillPrice, setAlertPrefillPrice] = useState<number | undefined>(undefined);

  // Indicators toggle
  const [indicators, setIndicators] = useState({
    ma20: true,
    ema50: false,
    bollinger: false,
    volume: true,
  });

  const toggleIndicator = (ind: 'ma20' | 'ema50' | 'bollinger' | 'volume') => {
    setIndicators(prev => ({ ...prev, [ind]: !prev[ind] }));
  };

  const clearNotification = () => setNotification(null);

  // Cash balance matching user's initial template: $24,850.40
  const [cashBalance, setCashBalance] = useState<number>(24850.40);
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 'pos_init_1',
      symbol: 'BTC/USD',
      side: 'buy',
      size: 0.15,
      entryPrice: 66800.00,
      markPrice: 67420.00,
      leverage: 5,
      margin: 2004.00,
      liquidationPrice: 53440.00,
      pnl: 93.00,
      pnlPercent: 4.64,
      timestamp: Date.now() - 3600000 * 2,
    },
    {
      id: 'pos_init_2',
      symbol: 'ETH/USD',
      side: 'buy',
      size: 1.5,
      entryPrice: 3480.00,
      markPrice: 3510.20,
      leverage: 3,
      margin: 1740.00,
      liquidationPrice: 2320.00,
      pnl: 45.30,
      pnlPercent: 2.60,
      timestamp: Date.now() - 3600000 * 5,
    }
  ]);

  const [openOrders, setOpenOrders] = useState<Order[]>([
    {
      id: 'ord_init_1',
      symbol: 'BTC/USD',
      side: 'buy',
      type: 'limit',
      price: 66000.00,
      amount: 0.2,
      totalUsd: 13200.00,
      leverage: 5,
      status: 'open',
      timestamp: Date.now() - 1800000,
    }
  ]);

  const [tradeHistory, setTradeHistory] = useState<Order[]>([
    {
      id: 'hist_1',
      symbol: 'SOL/USD',
      side: 'buy',
      type: 'market',
      price: 148.50,
      amount: 10,
      totalUsd: 1485.00,
      leverage: 2,
      status: 'filled',
      timestamp: Date.now() - 86400000,
    },
    {
      id: 'hist_2',
      symbol: 'TSLA',
      side: 'sell',
      type: 'market',
      price: 245.20,
      amount: 15,
      totalUsd: 3678.00,
      leverage: 1,
      status: 'filled',
      timestamp: Date.now() - 172800000,
    }
  ]);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    {
      id: 'tx_init_1',
      type: 'deposit',
      amount: 25000.00,
      asset: 'USD',
      timestamp: Date.now() - 86400000 * 7,
      note: 'Wire transfer incoming deposit',
    },
    {
      id: 'tx_init_2',
      type: 'fee',
      amount: -12.40,
      asset: 'USD',
      timestamp: Date.now() - 86400000 * 2,
      note: 'Trading execution commission',
    }
  ]);

  // Current selected asset object
  const currentAsset = useMemo(() => {
    return assets.find(a => a.symbol === selectedSymbol) || assets[0];
  }, [assets, selectedSymbol]);

  // Candle history storage per asset & timeframe
  const [candles, setCandles] = useState<Candle[]>(() => {
    return generateCandleHistory(currentAsset.price, 75, timeframe);
  });

  // Re-generate candles on asset or timeframe switch
  useEffect(() => {
    setCandles(generateCandleHistory(currentAsset.price, 75, timeframe));
  }, [selectedSymbol, timeframe]);

  // Real-time market tick engine
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setAssets(prevAssets => {
        return prevAssets.map(asset => {
          // Probability of tick for this asset in this frame
          const shouldTick = Math.random() > 0.35;
          if (!shouldTick) return asset;

          // Volatility factor
          const volFactor = asset.category === 'crypto' ? 0.0012 : (asset.category === 'stocks' ? 0.0007 : 0.0002);
          const percentDelta = (Math.random() - 0.495) * volFactor;
          const deltaPrice = asset.price * percentDelta;
          const newPrice = Math.max(0.0001, Number((asset.price + deltaPrice).toFixed(asset.decimals)));
          
          if (asset.symbol === selectedSymbol) {
            setLastTickSide(newPrice >= asset.price ? 'up' : 'down');
          }

          const newHigh = Math.max(asset.high24h, newPrice);
          const newLow = Math.min(asset.low24h, newPrice);
          const newChange = Number((asset.change24h + percentDelta * 100).toFixed(2));

          return {
            ...asset,
            price: newPrice,
            high24h: newHigh,
            low24h: newLow,
            change24h: newChange,
            volume24h: asset.volume24h + Math.floor(Math.random() * 5000),
          };
        });
      });
    }, 1800);

    return () => clearInterval(tickInterval);
  }, [selectedSymbol]);

  // Update current candle and check limit orders on price update
  useEffect(() => {
    const asset = assets.find(a => a.symbol === selectedSymbol);
    if (!asset) return;

    setCandles(prevCandles => {
      if (prevCandles.length === 0) return prevCandles;
      const last = { ...prevCandles[prevCandles.length - 1] };
      last.close = asset.price;
      last.high = Math.max(last.high, asset.price);
      last.low = Math.min(last.low, asset.price);
      return [...prevCandles.slice(0, -1), last];
    });

    // Check open limit orders for execution
    setOpenOrders(prevOrders => {
      const remaining: Order[] = [];
      prevOrders.forEach(order => {
        let trigger = false;
        if (order.symbol === asset.symbol) {
          if (order.side === 'buy' && asset.price <= order.price) {
            trigger = true;
          } else if (order.side === 'sell' && asset.price >= order.price) {
            trigger = true;
          }
        }

        if (trigger) {
          // Fill the order!
          if (soundEnabled) playAudioCue('fill');
          setNotification({
            message: `Limit ${order.side.toUpperCase()} order filled for ${order.amount} ${order.symbol} at $${asset.price.toLocaleString()}`,
            type: 'success',
          });

          // Add to trade history
          setTradeHistory(h => [{ ...order, status: 'filled', price: asset.price, timestamp: Date.now() }, ...h]);

          // Open Position
          const margin = (order.amount * asset.price) / order.leverage;
          const liqOffset = (asset.price / order.leverage) * 0.9;
          const liqPrice = order.side === 'buy' ? Math.max(0, asset.price - liqOffset) : asset.price + liqOffset;

          setPositions(p => [
            {
              id: `pos_${Date.now()}`,
              symbol: order.symbol,
              side: order.side,
              size: order.amount,
              entryPrice: asset.price,
              markPrice: asset.price,
              leverage: order.leverage,
              margin,
              liquidationPrice: Number(liqPrice.toFixed(asset.decimals)),
              pnl: 0,
              pnlPercent: 0,
              timestamp: Date.now(),
            },
            ...p,
          ]);
        } else {
          remaining.push(order);
        }
      });
      return remaining;
    });
  }, [assets, selectedSymbol, soundEnabled]);

  // Monitor active price alerts against all live market asset ticks
  useEffect(() => {
    setAlerts(prevAlerts => {
      let changed = false;
      const updated = prevAlerts.map(alert => {
        if (alert.status !== 'active') return alert;
        const asset = assets.find(a => a.symbol === alert.symbol);
        if (!asset) return alert;

        let triggered = false;
        if (alert.condition === 'above' && asset.price >= alert.targetPrice) {
          triggered = true;
        } else if (alert.condition === 'below' && asset.price <= alert.targetPrice) {
          triggered = true;
        }

        if (triggered) {
          changed = true;
          if (soundEnabled) playAudioCue('alert');
          setNotification({
            message: `🔔 Price Alert: ${alert.symbol} reached $${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })} (${alert.condition === 'above' ? '≥' : '≤'} $${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })})`,
            type: 'info',
          });
          return {
            ...alert,
            status: 'triggered' as const,
            triggeredAt: Date.now(),
          };
        }
        return alert;
      });

      return changed ? updated : prevAlerts;
    });
  }, [assets, soundEnabled]);

  // Alert management actions
  const openCreateAlertModal = useCallback((symbol?: string, price?: number) => {
    setAlertPrefillSymbol(symbol || selectedSymbol);
    setAlertPrefillPrice(price);
    setIsAlertModalOpen(true);
  }, [selectedSymbol]);

  const createAlert = useCallback(({
    symbol,
    targetPrice,
    condition,
    note,
  }: {
    symbol: string;
    targetPrice: number;
    condition?: 'above' | 'below';
    note?: string;
  }) => {
    const asset = assets.find(a => a.symbol === symbol);
    const currentPrice = asset ? asset.price : targetPrice;
    const cond = condition || (targetPrice >= currentPrice ? 'above' : 'below');

    const newAlert: PriceAlert = {
      id: `alt_${Date.now()}`,
      symbol,
      targetPrice,
      condition: cond,
      initialPrice: currentPrice,
      status: 'active',
      createdAt: Date.now(),
      note: note || undefined,
    };

    setAlerts(prev => [newAlert, ...prev]);
    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: `🔔 Price alert set for ${symbol} when price ${cond === 'above' ? 'rises to or above' : 'drops to or below'} $${targetPrice.toLocaleString(undefined, { minimumFractionDigits: asset?.decimals || 2 })}`,
      type: 'info',
    });
  }, [assets, soundEnabled]);

  const updateAlert = useCallback((id: string, updates: Partial<Omit<PriceAlert, 'id' | 'createdAt'>>) => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== id) return a;
      return { ...a, ...updates };
    }));
    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: 'Price alert updated successfully',
      type: 'info',
    });
  }, [soundEnabled]);

  const rearmAlert = useCallback((id: string, newTargetPrice?: number) => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const asset = assets.find(item => item.symbol === a.symbol);
      const target = newTargetPrice !== undefined ? newTargetPrice : a.targetPrice;
      const current = asset ? asset.price : a.initialPrice;
      const cond = target >= current ? 'above' : 'below';

      return {
        ...a,
        targetPrice: target,
        condition: cond,
        status: 'active',
        triggeredAt: undefined,
        initialPrice: current,
      };
    }));
    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: 'Alert re-armed to active status',
      type: 'success',
    });
  }, [assets, soundEnabled]);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    if (soundEnabled) playAudioCue('cancel');
  }, [soundEnabled]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearTriggeredAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(a => a.status === 'active'));
  }, []);

  const activeAlertsCount = useMemo(() => alerts.filter(a => a.status === 'active').length, [alerts]);
  const triggeredAlertsCount = useMemo(() => alerts.filter(a => a.status === 'triggered').length, [alerts]);

  // Recalculate positions PnL with current mark prices
  useEffect(() => {
    setPositions(prevPositions => {
      return prevPositions.map(pos => {
        const asset = assets.find(a => a.symbol === pos.symbol);
        if (!asset) return pos;
        const markPrice = asset.price;
        const priceDiff = pos.side === 'buy' ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
        const pnl = priceDiff * pos.size * (pos.leverage > 1 ? 1 : 1);
        const pnlPercent = (pnl / (pos.margin || 1)) * 100;
        return {
          ...pos,
          markPrice,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
        };
      });
    });
  }, [assets]);

  // Total unrealized PnL & Equity calculation
  const totalUnrealizedPnl = useMemo(() => {
    return Number(positions.reduce((sum, p) => sum + p.pnl, 0).toFixed(2));
  }, [positions]);

  const marginUsed = useMemo(() => {
    return Number(positions.reduce((sum, p) => sum + p.margin, 0).toFixed(2));
  }, [positions]);

  const totalEquity = useMemo(() => {
    return Number((cashBalance + totalUnrealizedPnl).toFixed(2));
  }, [cashBalance, totalUnrealizedPnl]);

  const freeMargin = useMemo(() => {
    return Math.max(0, Number((cashBalance - marginUsed).toFixed(2)));
  }, [cashBalance, marginUsed]);

  // Order Book calculation based on currentAsset price
  const orderBook = useMemo(() => {
    const p = currentAsset.price;
    const dec = currentAsset.decimals;
    const step = p * 0.0004;

    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];

    let askTotal = 0;
    for (let i = 6; i >= 1; i--) {
      const price = Number((p + i * step).toFixed(dec));
      const amount = Number((Math.random() * (p > 1000 ? 0.8 : 50) + 0.1).toFixed(3));
      askTotal += amount;
      asks.push({ price, amount, total: Number(askTotal.toFixed(3)), depthPercent: 0 });
    }
    // calculate depth percents
    asks.forEach(a => { a.depthPercent = Math.min(100, Math.round((a.total / (askTotal || 1)) * 100)); });

    let bidTotal = 0;
    for (let i = 1; i <= 6; i++) {
      const price = Number((p - i * step).toFixed(dec));
      const amount = Number((Math.random() * (p > 1000 ? 0.8 : 50) + 0.1).toFixed(3));
      bidTotal += amount;
      bids.push({ price, amount, total: Number(bidTotal.toFixed(3)), depthPercent: 0 });
    }
    bids.forEach(b => { b.depthPercent = Math.min(100, Math.round((b.total / (bidTotal || 1)) * 100)); });

    const bestAsk = asks[asks.length - 1]?.price || p;
    const bestBid = bids[0]?.price || p;
    const spread = Number((bestAsk - bestBid).toFixed(dec));
    const spreadPercent = Number(((spread / p) * 100).toFixed(3));

    return { asks, bids, spread, spreadPercent };
  }, [currentAsset.price, currentAsset.decimals]);

  // Recent Trades stream
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>(() => {
    const initialTrades: RecentTrade[] = [];
    const p = currentAsset.price;
    for (let i = 0; i < 12; i++) {
      const side: OrderSide = Math.random() > 0.48 ? 'buy' : 'sell';
      const offset = (Math.random() - 0.5) * p * 0.001;
      const d = new Date(Date.now() - i * 4000);
      initialTrades.push({
        id: `tr_${i}`,
        price: Number((p + offset).toFixed(currentAsset.decimals)),
        amount: Number((Math.random() * (p > 1000 ? 0.5 : 30) + 0.05).toFixed(3)),
        side,
        time: d.toTimeString().split(' ')[0],
      });
    }
    return initialTrades;
  });

  // Push new recent trade on tick
  useEffect(() => {
    const interval = setInterval(() => {
      const side: OrderSide = Math.random() > 0.48 ? 'buy' : 'sell';
      const p = currentAsset.price;
      const offset = (Math.random() - 0.5) * p * 0.0003;
      const now = new Date();
      setRecentTrades(prev => [
        {
          id: `tr_${Date.now()}`,
          price: Number((p + offset).toFixed(currentAsset.decimals)),
          amount: Number((Math.random() * (p > 1000 ? 0.6 : 35) + 0.05).toFixed(3)),
          side,
          time: now.toTimeString().split(' ')[0],
        },
        ...prev.slice(0, 24),
      ]);
    }, 2400);

    return () => clearInterval(interval);
  }, [currentAsset]);

  // Place Order handler
  const placeOrder = useCallback(({
    symbol,
    side,
    type,
    amount,
    price,
    leverage = 1,
  }: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    amount: number;
    price?: number;
    leverage?: number;
  }): { success: boolean; message: string } => {
    const asset = assets.find(a => a.symbol === symbol);
    if (!asset) return { success: false, message: 'Invalid asset' };

    const execPrice = type === 'market' ? asset.price : (price || asset.price);
    const totalUsd = amount * execPrice;
    const requiredMargin = totalUsd / leverage;

    if (requiredMargin > freeMargin) {
      if (soundEnabled) playAudioCue('error');
      setNotification({
        message: `Insufficient margin! Available: $${freeMargin.toLocaleString()}, required: $${requiredMargin.toLocaleString()}`,
        type: 'error',
      });
      return { success: false, message: 'Insufficient margin' };
    }

    const orderId = `ord_${Date.now()}`;
    const fee = totalUsd * 0.0005; // 0.05% trading fee

    if (type === 'market') {
      // Execute immediately
      const liqOffset = (execPrice / leverage) * 0.9;
      const liqPrice = side === 'buy' ? Math.max(0, execPrice - liqOffset) : execPrice + liqOffset;

      const newPos: Position = {
        id: `pos_${Date.now()}`,
        symbol,
        side,
        size: amount,
        entryPrice: execPrice,
        markPrice: execPrice,
        leverage,
        margin: requiredMargin,
        liquidationPrice: Number(liqPrice.toFixed(asset.decimals)),
        pnl: 0,
        pnlPercent: 0,
        timestamp: Date.now(),
      };

      setPositions(prev => [newPos, ...prev]);
      setCashBalance(c => Number((c - fee).toFixed(2)));

      setTradeHistory(h => [
        {
          id: orderId,
          symbol,
          side,
          type,
          price: execPrice,
          amount,
          totalUsd,
          leverage,
          status: 'filled',
          timestamp: Date.now(),
        },
        ...h,
      ]);

      setTransactions(txs => [
        {
          id: `fee_${Date.now()}`,
          type: 'fee',
          amount: -fee,
          asset: 'USD',
          timestamp: Date.now(),
          note: `Trading fee for ${side.toUpperCase()} ${amount} ${symbol}`,
        },
        ...txs,
      ]);

      if (soundEnabled) playAudioCue('fill');
      setNotification({
        message: `Executed Market ${side.toUpperCase()} ${amount} ${symbol} @ $${execPrice.toLocaleString()}`,
        type: 'success',
      });

      return { success: true, message: 'Market order executed' };
    } else {
      // Limit order placed
      const newOrder: Order = {
        id: orderId,
        symbol,
        side,
        type,
        price: execPrice,
        amount,
        totalUsd,
        leverage,
        status: 'open',
        timestamp: Date.now(),
      };

      setOpenOrders(prev => [newOrder, ...prev]);

      if (soundEnabled) playAudioCue('fill');
      setNotification({
        message: `Limit ${side.toUpperCase()} order placed at $${execPrice.toLocaleString()}`,
        type: 'info',
      });

      return { success: true, message: 'Limit order placed' };
    }
  }, [assets, freeMargin, soundEnabled]);

  // Close position handler
  const closePosition = useCallback((positionId: string) => {
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    const realizedPnl = pos.pnl;
    const fee = pos.size * pos.markPrice * 0.0005;
    const netReturn = realizedPnl - fee;

    setCashBalance(c => Number((c + netReturn).toFixed(2)));
    setPositions(prev => prev.filter(p => p.id !== positionId));

    setTransactions(txs => [
      {
        id: `tx_${Date.now()}`,
        type: realizedPnl >= 0 ? 'trade_profit' : 'trade_loss',
        amount: realizedPnl,
        asset: 'USD',
        timestamp: Date.now(),
        note: `Closed ${pos.side.toUpperCase()} ${pos.size} ${pos.symbol} @ $${pos.markPrice.toLocaleString()}`,
      },
      ...txs,
    ]);

    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: `Closed ${pos.symbol} position with ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)} PnL`,
      type: realizedPnl >= 0 ? 'success' : 'info',
    });
  }, [positions, soundEnabled]);

  // Cancel limit order
  const cancelOrder = useCallback((orderId: string) => {
    setOpenOrders(prev => prev.filter(o => o.id !== orderId));
    if (soundEnabled) playAudioCue('cancel');
    setNotification({
      message: 'Order cancelled successfully',
      type: 'info',
    });
  }, [soundEnabled]);

  // Wallet operations
  const depositFunds = useCallback((amount: number) => {
    setCashBalance(c => Number((c + amount).toFixed(2)));
    setTransactions(txs => [
      {
        id: `dep_${Date.now()}`,
        type: 'deposit',
        amount,
        asset: 'USD',
        timestamp: Date.now(),
        note: 'Instant demo faucet deposit',
      },
      ...txs,
    ]);
    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: `Successfully deposited $${amount.toLocaleString()} into wallet`,
      type: 'success',
    });
  }, [soundEnabled]);

  const withdrawFunds = useCallback((amount: number) => {
    if (amount > freeMargin) {
      if (soundEnabled) playAudioCue('error');
      setNotification({
        message: `Cannot withdraw more than available free margin ($${freeMargin.toLocaleString()})`,
        type: 'error',
      });
      return { success: false, message: 'Insufficient free margin' };
    }

    setCashBalance(c => Number((c - amount).toFixed(2)));
    setTransactions(txs => [
      {
        id: `wth_${Date.now()}`,
        type: 'withdraw',
        amount: -amount,
        asset: 'USD',
        timestamp: Date.now(),
        note: 'Simulated USD withdrawal to bank account',
      },
      ...txs,
    ]);
    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: `Successfully processed withdrawal of $${amount.toLocaleString()}`,
      type: 'info',
    });
    return { success: true, message: 'Withdrawal successful' };
  }, [freeMargin, soundEnabled]);

  const resetDemoAccount = useCallback(() => {
    setCashBalance(24850.40);
    setPositions([]);
    setOpenOrders([]);
    setTradeHistory([]);
    setTransactions([
      {
        id: `tx_${Date.now()}`,
        type: 'deposit',
        amount: 24850.40,
        asset: 'USD',
        timestamp: Date.now(),
        note: 'Account reset to initial balance',
      }
    ]);
    if (soundEnabled) playAudioCue('fill');
    setNotification({
      message: 'Account reset to starting demo balance ($24,850.40)',
      type: 'info',
    });
  }, [soundEnabled]);

  return (
    <TradingContext.Provider
      value={{
        assets,
        selectedSymbol,
        setSelectedSymbol,
        currentAsset,
        candles,
        timeframe,
        setTimeframe,
        chartType,
        setChartType,
        indicators,
        toggleIndicator,
        cashBalance,
        totalEquity,
        totalUnrealizedPnl,
        marginUsed,
        freeMargin,
        positions,
        openOrders,
        tradeHistory,
        transactions,
        orderBook,
        recentTrades,
        placeOrder,
        closePosition,
        cancelOrder,
        depositFunds,
        withdrawFunds,
        resetDemoAccount,
        soundEnabled,
        setSoundEnabled,
        lastTickSide,
        notification,
        clearNotification,
        // Alerts
        alerts,
        activeAlertsCount,
        triggeredAlertsCount,
        createAlert,
        updateAlert,
        rearmAlert,
        deleteAlert,
        dismissAlert,
        clearTriggeredAlerts,
        isAlertModalOpen,
        setIsAlertModalOpen,
        alertPrefillSymbol,
        setAlertPrefillSymbol,
        alertPrefillPrice,
        setAlertPrefillPrice,
        openCreateAlertModal,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
};
