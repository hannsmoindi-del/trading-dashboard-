export type AccountType = 'real' | 'demo';

export interface WalletBalances {
  usdReal: number;
  usdDemo: number;
  btcReal: number;
  usdtReal: number;
  mt5Derived: number;
  mt5Financial: number;
}

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer' | 'CFD Trade P/L' | 'DBot Trade P/L' | 'Options Contract';

export interface DerivTransaction {
  id: string;
  type: TransactionType;
  gateway: string;
  amount: number;
  status: 'Successful' | 'Processing' | 'Closed' | 'Failed';
  timestamp: string;
  details?: string;
}

export type SyntheticAssetId =
  | 'R_75'
  | 'R_100'
  | 'R_50'
  | 'R_25'
  | 'R_10'
  | 'BOOM_1000'
  | 'BOOM_500'
  | 'CRASH_1000'
  | 'CRASH_500'
  | 'STEP_INDEX'
  | 'FRX_EURUSD'
  | 'FRX_GBPUSD'
  | 'FRX_GBPJPY'
  | 'FRX_USDJPY'
  | 'CRY_BTCUSD'
  | 'CRY_ETHUSD'
  | 'CMD_GOLD';

export interface SyntheticAsset {
  id: SyntheticAssetId;
  name: string;
  category: 'Synthetics' | 'Forex' | 'Crypto' | 'Commodities';
  price: number;
  change24h: number;
  change1w?: number;
  change1m?: number;
  change1y?: number;
  decimals: number;
  volatility: number;
  holdingQty?: number;
  holdingValueUsd?: number;
  allocationPct?: number;
  pnlUsd?: number;
  sparkline?: number[];
  high24h?: number;
  low24h?: number;
  volume24h?: string;
}

export interface DBotStrategyConfig {
  assetId: SyntheticAssetId;
  contractType: 'rise_fall' | 'higher_lower' | 'matches_differs' | 'even_odd';
  indicator: 'RSI' | 'SMA_CROSS' | 'BOLLINGER' | 'MACD';
  indicatorParam: number; // e.g. RSI threshold 30
  stake: number;
  takeProfit: number;
  stopLoss: number;
  martingaleMultiplier: number;
  durationTicks: number;
}

export interface DBotLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'trigger' | 'win' | 'loss';
  message: string;
  pnl?: number;
}

export interface DTraderContract {
  id: string;
  assetId: SyntheticAssetId;
  type: 'Rise' | 'Fall' | 'Multiplier';
  stake: number;
  entryPrice: number;
  exitPrice?: number;
  currentPrice: number;
  barrierPrice?: number;
  durationSeconds: number;
  remainingSeconds: number;
  payout: number;
  profit: number;
  status: 'running' | 'won' | 'lost';
}

export type TradingMode = 'binary' | 'forex';

export type BinaryOrderType = 'CALL' | 'PUT';
export type ForexOrderType = 'BUY' | 'SELL';
export type OrderExecutionType = BinaryOrderType | ForexOrderType;

export interface TerminalOrder {
  id: string;
  type: OrderExecutionType;
  assetId: SyntheticAssetId;
  assetName: string;
  mode: TradingMode;
  investment: number;
  targetOrExpiry: string;
  durationSeconds?: number;
  remainingSeconds?: number;
  entryPrice: number;
  currentPrice: number;
  targetPrice?: number;
  payoutPercent?: number;
  leverage?: string;
  pnl: number;
  status: 'running' | 'won' | 'lost' | 'closed';
  timestamp: string;
}

export interface MpesaReceipt {
  code: string;
  phone: string;
  amountKes: number;
  amountUsd: number;
  balanceKes: number;
  senderOrAccount: string;
  type: 'deposit_received' | 'withdrawal_sent';
  timestamp: string;
  smsText: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  preferredCurrency: 'USD' | 'KES';
  realAccountId: string;
  demoAccountId: string;
  isVerified: boolean;
  verificationTier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  registeredAt: string;
}

export interface Mt5BotConfig {
  symbol: string;
  timeframe: string;
  fallbackLotSize: number;
  riskPerTradePct: number;
  maxDailyLossPct: number;
  stopLossPips: number;
  takeProfitPips: number;
  magicNumber: number;
  fastMaPeriod: number;
  slowMaPeriod: number;
}

export interface Mt5BotPosition {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profitUsd: number;
  magic: number;
  openTime: string;
  comment: string;
}

export interface Mt5BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'order' | 'warning' | 'circuit_breaker' | 'success';
  message: string;
}

