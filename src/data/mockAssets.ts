import { Asset, Candle, Timeframe } from '../types/trading';

export const INITIAL_ASSETS: Asset[] = [
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'crypto',
    price: 67420.00,
    change24h: 3.45,
    high24h: 68150.00,
    low24h: 65120.00,
    volume24h: 28450120000,
    sparkline: [65200, 65800, 65400, 66100, 66800, 66400, 67100, 67420],
    decimals: 2,
    precision: 4,
    description: 'The pioneering decentralized digital asset and store of value.',
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    category: 'crypto',
    price: 3510.20,
    change24h: 1.82,
    high24h: 3585.50,
    low24h: 3420.00,
    volume24h: 14820300000,
    sparkline: [3430, 3450, 3420, 3480, 3500, 3470, 3520, 3510],
    decimals: 2,
    precision: 3,
    description: 'Decentralized global computing platform for smart contracts and DeFi.',
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana',
    category: 'crypto',
    price: 154.80,
    change24h: 5.64,
    high24h: 158.20,
    low24h: 146.10,
    volume24h: 4120900000,
    sparkline: [146, 148, 147, 150, 153, 151, 156, 154.8],
    decimals: 2,
    precision: 2,
    description: 'High-speed layer 1 blockchain designed for mass consumer adoption.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'stocks',
    price: 242.50,
    change24h: -0.95,
    high24h: 248.10,
    low24h: 240.20,
    volume24h: 8930400000,
    sparkline: [246, 245, 247, 244, 243, 244, 241, 242.5],
    decimals: 2,
    precision: 2,
    description: 'Electric vehicle and clean energy leader with advanced autonomy development.',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    category: 'stocks',
    price: 128.40,
    change24h: 4.12,
    high24h: 130.25,
    low24h: 123.60,
    volume24h: 18230500000,
    sparkline: [123, 124, 126, 125, 127, 126, 129, 128.4],
    decimals: 2,
    precision: 2,
    description: 'Global pioneer in GPU computing, AI acceleration hardware, and data centers.',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stocks',
    price: 224.30,
    change24h: 0.65,
    high24h: 226.00,
    low24h: 222.80,
    volume24h: 6410200000,
    sparkline: [222, 223, 223.5, 224, 223.8, 224.5, 224, 224.3],
    decimals: 2,
    precision: 2,
    description: 'Consumer technology ecosystem with global services and silicon architecture.',
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    price: 1.0842,
    change24h: -0.18,
    high24h: 1.0875,
    low24h: 1.0830,
    volume24h: 38400000000,
    sparkline: [1.086, 1.0865, 1.085, 1.084, 1.0845, 1.0835, 1.084, 1.0842],
    decimals: 4,
    precision: 1,
    description: 'The most traded currency pair representing the eurozone and US economies.',
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'forex',
    price: 1.2985,
    change24h: 0.32,
    high24h: 1.3020,
    low24h: 1.2940,
    volume24h: 22100000000,
    sparkline: [1.294, 1.296, 1.295, 1.297, 1.299, 1.297, 1.300, 1.2985],
    decimals: 4,
    precision: 1,
    description: 'Cable currency pair reflecting UK and US macroeconomic momentum.',
  },
];

/**
 * Generates realistic candlestick history for an asset and timeframe
 */
export function generateCandleHistory(basePrice: number, count: number = 80, timeframe: Timeframe = '1h'): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  // Interval in milliseconds
  let intervalMs = 60 * 60 * 1000; // default 1h
  if (timeframe === '1m') intervalMs = 60 * 1000;
  else if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
  else if (timeframe === '15m') intervalMs = 15 * 60 * 1000;
  else if (timeframe === '4h') intervalMs = 4 * 60 * 60 * 1000;
  else if (timeframe === '1D') intervalMs = 24 * 60 * 60 * 1000;

  // Volatility scale according to price level
  const volatility = basePrice * 0.0035;
  let currentPrice = basePrice * (1 - 0.02); // start slightly lower for an uptrend

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * intervalMs;
    // Random walk with mean reversion
    const drift = (basePrice - currentPrice) * 0.05 + (Math.random() - 0.49) * volatility;
    const open = currentPrice;
    const close = Math.max(open * 0.5, open + drift);
    
    const highWick = Math.random() * volatility * 0.8;
    const lowWick = Math.random() * volatility * 0.8;
    const high = Math.max(open, close) + highWick;
    const low = Math.min(open, close) - lowWick;
    
    const baseVolume = basePrice > 1000 ? 15 + Math.random() * 45 : 120 + Math.random() * 300;
    const volume = Math.round(baseVolume * (1 + Math.abs(close - open) / (volatility || 1)));

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  // Ensure last candle close matches current basePrice closely
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);
  }

  return candles;
}
