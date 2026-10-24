export type AssetCategory = 'crypto' | 'stocks' | 'forex';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  sparkline: number[];
  decimals: number;
  precision: number;
  description: string;
}

export interface Candle {
  time: number; // timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type OrderType = 'market' | 'limit' | 'stop_loss';
export type OrderSide = 'buy' | 'sell';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number; // in asset quantity
  totalUsd: number;
  leverage: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  size: number; // asset quantity
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  amount: number;
  side: OrderSide;
  time: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  depthPercent: number;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade_profit' | 'trade_loss' | 'fee';
  amount: number;
  asset: string;
  timestamp: number;
  note: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';
export type ChartType = 'candles' | 'line';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  initialPrice: number;
  status: 'active' | 'triggered';
  createdAt: number;
  triggeredAt?: number;
  note?: string;
}
