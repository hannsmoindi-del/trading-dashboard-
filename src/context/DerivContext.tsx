import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AccountType,
  WalletBalances,
  DerivTransaction,
  SyntheticAsset,
  SyntheticAssetId,
  DBotStrategyConfig,
  DBotLogEntry,
  DTraderContract,
  TradingMode,
  TerminalOrder,
  OrderExecutionType,
  MpesaReceipt,
  UserProfile
} from '../types/deriv';

export const INITIAL_ASSETS: SyntheticAsset[] = [
  {
    id: 'R_75',
    name: 'Volatility 75 Index',
    category: 'Synthetics',
    price: 75412.30,
    change24h: 2.34,
    change1w: 6.42,
    change1m: 18.25,
    change1y: 42.10,
    decimals: 2,
    volatility: 1.5,
    holdingQty: 0.05,
    holdingValueUsd: 3770.62,
    allocationPct: 25.8,
    pnlUsd: 342.10,
    sparkline: [72100, 73400, 72800, 74100, 74900, 75100, 75412],
    high24h: 76100.00,
    low24h: 73920.00,
    volume24h: '$148.5M',
  },
  {
    id: 'BOOM_1000',
    name: 'Boom 1000 Index',
    category: 'Synthetics',
    price: 10452.80,
    change24h: 4.82,
    change1w: 11.20,
    change1m: 24.50,
    change1y: 56.40,
    decimals: 2,
    volatility: 2.2,
    holdingQty: 0.25,
    holdingValueUsd: 2613.20,
    allocationPct: 17.9,
    pnlUsd: 218.40,
    sparkline: [9800, 9950, 10100, 10050, 10220, 10380, 10452],
    high24h: 10620.00,
    low24h: 9940.00,
    volume24h: '$94.2M',
  },
  {
    id: 'CRY_BTCUSD',
    name: 'BTC/USD Crypto',
    category: 'Crypto',
    price: 68120.00,
    change24h: 3.12,
    change1w: 8.90,
    change1m: 21.40,
    change1y: 84.50,
    decimals: 2,
    volatility: 2.5,
    holdingQty: 0.035,
    holdingValueUsd: 2384.20,
    allocationPct: 16.3,
    pnlUsd: 185.60,
    sparkline: [64200, 65100, 64800, 66300, 67200, 67800, 68120],
    high24h: 68950.00,
    low24h: 65900.00,
    volume24h: '$420.8M',
  },
  {
    id: 'R_100',
    name: 'Volatility 100',
    category: 'Synthetics',
    price: 4892.10,
    change24h: 1.12,
    change1w: 3.10,
    change1m: 8.40,
    change1y: 22.10,
    decimals: 2,
    volatility: 2.0,
    holdingQty: 1.2,
    holdingValueUsd: 5870.52,
    allocationPct: 15.0,
    pnlUsd: 65.20,
    sparkline: [4810, 4845, 4830, 4850, 4870, 4885, 4892],
    high24h: 4920.00,
    low24h: 4820.00,
    volume24h: '$86.3M',
  },
  {
    id: 'CMD_GOLD',
    name: 'XAU/USD',
    category: 'Commodities',
    price: 2340.50,
    change24h: 0.55,
    change1w: 2.45,
    change1m: 6.80,
    change1y: 28.50,
    decimals: 2,
    volatility: 0.8,
    holdingQty: 0.6,
    holdingValueUsd: 1404.30,
    allocationPct: 10.9,
    pnlUsd: 38.40,
    sparkline: [2310, 2325, 2320, 2338, 2342, 2339, 2340.5],
    high24h: 2355.00,
    low24h: 2325.00,
    volume24h: '$112.4M',
  },
  {
    id: 'CRASH_1000',
    name: 'Crash 1000 Index',
    category: 'Synthetics',
    price: 9845.20,
    change24h: -3.40,
    change1w: -4.80,
    change1m: -8.20,
    change1y: 14.20,
    decimals: 2,
    volatility: 2.2,
    holdingQty: 0.15,
    holdingValueUsd: 1476.78,
    allocationPct: 10.1,
    pnlUsd: -94.50,
    sparkline: [10200, 10150, 10080, 9950, 10020, 9910, 9845],
    high24h: 10180.00,
    low24h: 9790.00,
    volume24h: '$78.9M',
  },
  {
    id: 'CRY_ETHUSD',
    name: 'ETH/USD Crypto',
    category: 'Crypto',
    price: 3540.00,
    change24h: 1.85,
    change1w: 5.40,
    change1m: 15.30,
    change1y: 62.10,
    decimals: 2,
    volatility: 2.4,
    holdingQty: 0.4,
    holdingValueUsd: 1416.00,
    allocationPct: 9.7,
    pnlUsd: 72.80,
    sparkline: [3380, 3420, 3400, 3490, 3510, 3525, 3540],
    high24h: 3590.00,
    low24h: 3460.00,
    volume24h: '$195.4M',
  },
  {
    id: 'R_50',
    name: 'Volatility 50 Index',
    category: 'Synthetics',
    price: 324.50,
    change24h: 1.10,
    change1w: 2.80,
    change1m: 5.20,
    change1y: 19.40,
    decimals: 2,
    volatility: 1.2,
    holdingQty: 3.0,
    holdingValueUsd: 973.50,
    allocationPct: 6.7,
    pnlUsd: 38.20,
    sparkline: [318, 320, 319, 322, 323, 323.5, 324.5],
    high24h: 328.00,
    low24h: 320.50,
    volume24h: '$42.1M',
  },
  {
    id: 'BOOM_500',
    name: 'Boom 500 Index',
    category: 'Synthetics',
    price: 4210.60,
    change24h: 6.15,
    change1w: 14.20,
    change1m: 32.10,
    change1y: 68.50,
    decimals: 2,
    volatility: 2.6,
    holdingQty: 0.2,
    holdingValueUsd: 842.12,
    allocationPct: 5.8,
    pnlUsd: 88.40,
    sparkline: [3850, 3920, 4010, 4060, 4120, 4180, 4210],
    high24h: 4290.00,
    low24h: 3950.00,
    volume24h: '$51.8M',
  },
  {
    id: 'R_25',
    name: 'Volatility 25 Index',
    category: 'Synthetics',
    price: 1420.10,
    change24h: -0.65,
    change1w: 1.20,
    change1m: 3.80,
    change1y: 16.20,
    decimals: 2,
    volatility: 0.9,
    holdingQty: 0.5,
    holdingValueUsd: 710.05,
    allocationPct: 4.9,
    pnlUsd: -12.40,
    sparkline: [1422, 1430, 1425, 1428, 1424, 1422, 1420],
    high24h: 1435.00,
    low24h: 1415.00,
    volume24h: '$36.2M',
  },
  {
    id: 'STEP_INDEX',
    name: 'Step Index',
    category: 'Synthetics',
    price: 8124.00,
    change24h: 0.85,
    change1w: 3.40,
    change1m: 7.90,
    change1y: 26.50,
    decimals: 2,
    volatility: 1.1,
    holdingQty: 0.08,
    holdingValueUsd: 649.92,
    allocationPct: 4.5,
    pnlUsd: 22.10,
    sparkline: [8020, 8060, 8090, 8080, 8100, 8115, 8124],
    high24h: 8160.00,
    low24h: 8070.00,
    volume24h: '$29.4M',
  },
  {
    id: 'CRASH_500',
    name: 'Crash 500 Index',
    category: 'Synthetics',
    price: 6120.40,
    change24h: -2.85,
    change1w: -5.60,
    change1m: -1.20,
    change1y: 18.40,
    decimals: 2,
    volatility: 2.4,
    holdingQty: 0.1,
    holdingValueUsd: 612.04,
    allocationPct: 4.2,
    pnlUsd: -34.80,
    sparkline: [6350, 6300, 6260, 6220, 6190, 6150, 6120],
    high24h: 6380.00,
    low24h: 6090.00,
    volume24h: '$44.6M',
  },
  {
    id: 'FRX_EURUSD',
    name: 'EUR/USD',
    category: 'Forex',
    price: 1.08540,
    change24h: 0.24,
    change1w: 0.65,
    change1m: -0.42,
    change1y: -2.10,
    decimals: 5,
    volatility: 0.4,
    holdingQty: 500,
    holdingValueUsd: 542.70,
    allocationPct: 3.7,
    pnlUsd: 6.80,
    sparkline: [1.0825, 1.0832, 1.0838, 1.0845, 1.0848, 1.0851, 1.0854],
    high24h: 1.08720,
    low24h: 1.08180,
    volume24h: '$380.5M',
  },
  {
    id: 'FRX_GBPJPY',
    name: 'GBP/JPY',
    category: 'Forex',
    price: 192.310,
    change24h: -0.15,
    change1w: -0.45,
    change1m: 1.20,
    change1y: 8.40,
    decimals: 3,
    volatility: 0.7,
    holdingQty: 250,
    holdingValueUsd: 1250.00,
    allocationPct: 4.4,
    pnlUsd: -12.40,
    sparkline: [192.6, 192.5, 192.4, 192.35, 192.38, 192.32, 192.31],
    high24h: 193.100,
    low24h: 191.850,
    volume24h: '$175.2M',
  },
  {
    id: 'FRX_GBPUSD',
    name: 'GBP/USD',
    category: 'Forex',
    price: 1.2980,
    change24h: 0.42,
    change1w: 1.10,
    change1m: 2.15,
    change1y: 4.50,
    decimals: 4,
    volatility: 0.5,
    holdingQty: 400,
    holdingValueUsd: 519.20,
    allocationPct: 3.6,
    pnlUsd: 14.50,
    sparkline: [1.288, 1.291, 1.293, 1.294, 1.296, 1.297, 1.298],
    high24h: 1.3015,
    low24h: 1.2930,
    volume24h: '$260.1M',
  },
];

interface DerivContextType {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  balances: WalletBalances;
  activeWallet: 'usd' | 'btc' | 'usdt';
  setActiveWallet: (w: 'usd' | 'btc' | 'usdt') => void;
  transactions: DerivTransaction[];
  assets: SyntheticAsset[];
  selectedAsset: SyntheticAsset;
  setSelectedAssetId: (id: SyntheticAssetId) => void;
  currentRsi: number;
  recentTicks: number[];

  // Cashier Operations
  deposit: (gateway: string, amount: number) => { success: boolean; message: string };
  withdraw: (gateway: string, amount: number, destination?: string) => { success: boolean; message: string };
  transfer: (
    from: keyof WalletBalances,
    to: keyof WalletBalances,
    amount: number
  ) => { success: boolean; message: string };

  // DBot Strategy Engine
  dbotConfig: DBotStrategyConfig;
  updateDBotConfig: (updates: Partial<DBotStrategyConfig>) => void;
  isBotRunning: boolean;
  toggleBot: () => void;
  botProfit: number;
  botRuns: number;
  botWins: number;
  botLosses: number;
  botLogs: DBotLogEntry[];
  resetBotStats: () => void;

  // DTrader Options Execution
  openContracts: DTraderContract[];
  buyContract: (type: 'Rise' | 'Fall' | 'Multiplier', stake: number, durationSeconds?: number) => { success: boolean; message: string };

  // TradeMatrix Global Terminal Execution & Orders
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  terminalOrders: TerminalOrder[];
  executeTerminalOrder: (order: {
    type: OrderExecutionType;
    assetId: SyntheticAssetId;
    investment: number;
    targetOrExpiry: string;
    durationSeconds?: number;
    leverage?: string;
  }) => { success: boolean; message: string };
  closeTerminalOrder: (orderId: string) => void;
  netAssetValue: number;

  // Account Identification & Switching (Real vs Demo)
  realAccountId: string;
  demoAccountId: string;
  resetDemoBalance: () => void;

  // AbePay & M-Pesa Live Reflection on 0119437680 & 0103942534
  mpesaPrimaryPhone: string;
  mpesaSecondaryPhone: string;
  mpesaBalanceKes: number;
  mpesaReceipts: MpesaReceipt[];
  latestMpesaSms: MpesaReceipt | null;
  clearMpesaSms: () => void;
  depositViaAbePayMpesa: (
    phone: string,
    amountUsd: number,
    mpesaTxnCode?: string,
    targetAccount?: AccountType
  ) => { success: boolean; message: string; receipt?: MpesaReceipt };

  // Audio & Notification
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  clearNotification: () => void;

  // Trader Authentication & Account Creation ("One should create account when he or she wants to trade")
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'register' | 'login';
  authPendingIntent: string | null;
  openAuthModal: (mode?: 'register' | 'login', intentDescription?: string) => void;
  closeAuthModal: () => void;
  registerAccount: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    country?: string;
    preferredAccount: AccountType;
  }) => { success: boolean; message: string };
  loginAccount: (emailOrId: string, password?: string) => { success: boolean; message: string };
  logoutAccount: () => void;
  requireTradingAccount: (tradeAction: () => void, intentDescription?: string) => boolean;
}

const DerivContext = createContext<DerivContextType | undefined>(undefined);

// Web Audio synthesizer for Deriv actions
function playAudio(type: 'cashier' | 'win' | 'loss' | 'tick') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'cashier') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'loss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // audio unavailable
  }
}

export const DerivProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountType, setAccountType] = useState<AccountType>('real');
  const [activeWallet, setActiveWallet] = useState<'usd' | 'btc' | 'usdt'>('usd');

  // User Authentication & Trading Gate ("One should create account when he or she wants to trade")
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('deriv_trader_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');
  const [authPendingIntent, setAuthPendingIntent] = useState<string | null>(null);
  const pendingTradeRef = useRef<(() => void) | null>(null);

  const realAccountId = user?.realAccountId || 'CR984210';
  const demoAccountId = user?.demoAccountId || 'VRTC104921';
  const mpesaPrimaryPhone = '0119437680';
  const mpesaSecondaryPhone = '0103942534';

  const [mpesaBalanceKes, setMpesaBalanceKes] = useState<number>(184500);
  const [latestMpesaSms, setLatestMpesaSms] = useState<MpesaReceipt | null>(null);
  const [mpesaReceipts, setMpesaReceipts] = useState<MpesaReceipt[]>([
    {
      code: 'SK829X1402',
      phone: '0119437680',
      amountKes: 12950,
      amountUsd: 100,
      balanceKes: 184500,
      senderOrAccount: 'CR984210 (Real Account)',
      type: 'deposit_received',
      timestamp: 'Today, 08:30 AM',
      smsText: 'SK829X1402 Confirmed. You have received Ksh 12,950.00 from Deriv Trader Hub on 0119437680. New M-PESA balance is Ksh 184,500.00. Processed via AbePay.com.',
    },
    {
      code: 'SK710Q9341',
      phone: '0103942534',
      amountKes: 6475,
      amountUsd: 50,
      balanceKes: 171550,
      senderOrAccount: 'CR984210 (Real Account)',
      type: 'deposit_received',
      timestamp: 'Yesterday, 04:15 PM',
      smsText: 'SK710Q9341 Confirmed. You have received Ksh 6,475.00 from Deriv Trader Hub on 0103942534. New M-PESA balance is Ksh 171,550.00. Processed via AbePay.com.',
    },
  ]);

  // Balances initialized according to Deriv HTML specification ($14,580.50)
  const [balances, setBalances] = useState<WalletBalances>({
    usdReal: 14580.50,
    usdDemo: 10000.00,
    btcReal: 0.428,
    usdtReal: 2500.00,
    mt5Derived: 3210.00,
    mt5Financial: 1450.00,
  });

  // Recent transactions table with original HTML items
  const [transactions, setTransactions] = useState<DerivTransaction[]>([
    {
      id: '#TXN-984210',
      type: 'Deposit',
      gateway: 'Tether (USDT)',
      amount: 1000.00,
      status: 'Successful',
      timestamp: 'Today, 08:30 AM',
      details: 'Instant crypto credit to USD Real Wallet',
    },
    {
      id: '#TXN-983512',
      type: 'CFD Trade P/L',
      gateway: 'Deriv MT5',
      amount: 245.50,
      status: 'Closed',
      timestamp: 'Yesterday, 11:15 PM',
      details: 'Synthetic Volatility 75 Buy Position Closed',
    },
    {
      id: '#TXN-981023',
      type: 'Withdrawal',
      gateway: 'Bank Wire Transfer',
      amount: -500.00,
      status: 'Successful',
      timestamp: 'Oct 14, 02:45 PM',
      details: 'Sent to registered bank account ending in 4921',
    },
  ]);

  const [assets, setAssets] = useState<SyntheticAsset[]>(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState<SyntheticAssetId>('R_75');
  const [recentTicks, setRecentTicks] = useState<number[]>(() => {
    // Initial 20 ticks around 75412
    const base = 75412.30;
    const ticks: number[] = [];
    let cur = base;
    for (let i = 0; i < 25; i++) {
      cur += (Math.random() - 0.49) * 2.5;
      ticks.push(Number(cur.toFixed(2)));
    }
    return ticks;
  });

  const [currentRsi, setCurrentRsi] = useState<number>(29.4); // Starts below 30 to showcase trigger

  // DBot Strategy Engine State
  const [dbotConfig, setDbotConfig] = useState<DBotStrategyConfig>({
    assetId: 'R_75',
    contractType: 'rise_fall',
    indicator: 'RSI',
    indicatorParam: 30,
    stake: 10,
    takeProfit: 50,
    stopLoss: 20,
    martingaleMultiplier: 2,
    durationTicks: 3,
  });

  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botProfit, setBotProfit] = useState<number>(0);
  const [botRuns, setBotRuns] = useState<number>(0);
  const [botWins, setBotWins] = useState<number>(0);
  const [botLosses, setBotLosses] = useState<number>(0);
  const [botLogs, setBotLogs] = useState<DBotLogEntry[]>([
    {
      id: 'log-0',
      timestamp: '08:00:00',
      type: 'info',
      message: 'DBot Strategy Engine ready. Strategy: RSI < 30 on Volatility 75 Index.',
    },
  ]);

  // DTrader Active Contracts
  const [openContracts, setOpenContracts] = useState<DTraderContract[]>([]);

  // Sound & Toast State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const clearNotification = useCallback(() => setNotification(null), []);

  const triggerNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Market tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets =>
        prevAssets.map(asset => {
          const delta = (Math.random() - 0.495) * (asset.price * (asset.volatility / 1000));
          const newPrice = Math.max(0.0001, Number((asset.price + delta).toFixed(asset.decimals)));
          const newChange = Number((asset.change24h + (delta > 0 ? 0.02 : -0.02)).toFixed(2));
          return {
            ...asset,
            price: newPrice,
            change24h: newChange,
          };
        })
      );

      // Update recent ticks for active asset
      setRecentTicks(prev => {
        const last = prev[prev.length - 1] || selectedAsset.price;
        const tickDelta = (Math.random() - 0.49) * (last * (selectedAsset.volatility / 1200));
        const nextTick = Number((last + tickDelta).toFixed(selectedAsset.decimals));
        const updated = [...prev.slice(-30), nextTick];
        return updated;
      });

      // Update synthetic RSI oscillating realistically
      setCurrentRsi(prev => {
        const rsiDelta = (Math.random() - 0.48) * 3.2;
        let next = prev + rsiDelta;
        if (next < 15) next = 18;
        if (next > 85) next = 82;
        return Number(next.toFixed(1));
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Reset Demo Account
  const resetDemoBalance = useCallback(() => {
    setBalances(prev => ({
      ...prev,
      usdDemo: 10000.00,
    }));
    triggerNotification('Demo Account (VRTC104921) reset to $10,000.00 virtual practice funds', 'info');
  }, [triggerNotification]);

  const clearMpesaSms = useCallback(() => {
    setLatestMpesaSms(null);
  }, []);

  // Deposit via AbePay & M-Pesa with live reflection on phone numbers
  const depositViaAbePayMpesa = useCallback((
    phone: string,
    amountUsd: number,
    mpesaTxnCode?: string,
    targetAccount: AccountType = 'real'
  ) => {
    if (amountUsd <= 0) {
      triggerNotification('Please enter an amount greater than $0', 'error');
      return { success: false, message: 'Invalid amount' };
    }

    const calculatedKes = Math.round(amountUsd * 129.5);
    const txnCode = mpesaTxnCode && mpesaTxnCode.trim()
      ? mpesaTxnCode.trim().toUpperCase()
      : `SK${Math.floor(10 + Math.random() * 89)}` + Math.random().toString(36).substring(2, 6).toUpperCase();

    const targetPhone = phone || mpesaPrimaryPhone;
    const targetAccId = targetAccount === 'real' ? realAccountId : demoAccountId;

    setMpesaBalanceKes(prev => {
      const updated = prev + calculatedKes;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sms = `${txnCode} Confirmed. You have received Ksh ${calculatedKes.toLocaleString()}.00 from Deriv Trader Hub (${targetAccId}) on ${targetPhone} at ${timeStr}. New M-PESA balance is Ksh ${updated.toLocaleString()}.00. Linked via AbePay.com.`;

      const receipt: MpesaReceipt = {
        code: txnCode,
        phone: targetPhone,
        amountKes: calculatedKes,
        amountUsd,
        balanceKes: updated,
        senderOrAccount: targetAccId,
        type: 'deposit_received',
        timestamp: 'Just now',
        smsText: sms,
      };

      setMpesaReceipts(r => [receipt, ...r]);
      setLatestMpesaSms(receipt);
      return updated;
    });

    if (targetAccount === 'real') {
      setBalances(prev => ({
        ...prev,
        usdReal: Number((prev.usdReal + amountUsd).toFixed(2)),
      }));
    } else {
      setBalances(prev => ({
        ...prev,
        usdDemo: Number((prev.usdDemo + amountUsd).toFixed(2)),
      }));
    }

    const newTxn: DerivTransaction = {
      id: `#TXN-${txnCode}`,
      type: 'Deposit',
      gateway: `AbePay.com M-Pesa (${targetPhone})`,
      amount: amountUsd,
      status: 'Successful',
      timestamp: 'Just now',
      details: `Reflected on ${targetPhone} (+Ksh ${calculatedKes.toLocaleString()}) → ${targetAccId}`,
    };
    setTransactions(prev => [newTxn, ...prev]);

    if (soundEnabled) playAudio('cashier');
    triggerNotification(
      `Deposit of +$${amountUsd.toFixed(2)} reflected on M-Pesa ${targetPhone} (Ksh ${calculatedKes.toLocaleString()}) & credited to ${targetAccount === 'real' ? 'Real Account' : 'Demo Account'}!`,
      'success'
    );

    return {
      success: true,
      message: `Deposit reflected on M-Pesa ${targetPhone} and credited successfully to ${targetAccId}`,
    };
  }, [mpesaPrimaryPhone, realAccountId, demoAccountId, soundEnabled, triggerNotification]);

  // Cashier: Deposit
  const deposit = useCallback((gateway: string, amount: number) => {
    if (amount <= 0) {
      triggerNotification('Please enter an amount greater than $0', 'error');
      return { success: false, message: 'Invalid amount' };
    }

    // Check if AbePay or M-Pesa
    const isAbePayOrMpesa = gateway.includes('AbePay') || gateway.includes('M-Pesa') || gateway.includes(mpesaPrimaryPhone) || gateway.includes(mpesaSecondaryPhone);
    const targetPhone = gateway.includes(mpesaSecondaryPhone) ? mpesaSecondaryPhone : mpesaPrimaryPhone;

    if (isAbePayOrMpesa) {
      return depositViaAbePayMpesa(targetPhone, amount, undefined, accountType);
    }

    if (accountType === 'real') {
      setBalances(prev => ({
        ...prev,
        usdReal: Number((prev.usdReal + amount).toFixed(2)),
      }));
    } else {
      setBalances(prev => ({
        ...prev,
        usdDemo: Number((prev.usdDemo + amount).toFixed(2)),
      }));
    }

    const txnId = `#TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: DerivTransaction = {
      id: txnId,
      type: 'Deposit',
      gateway,
      amount,
      status: 'Successful',
      timestamp: 'Just now',
      details: `Funded via ${gateway} to ${accountType === 'real' ? realAccountId : demoAccountId}`,
    };

    setTransactions(prev => [newTxn, ...prev]);
    if (soundEnabled) playAudio('cashier');
    triggerNotification(`Successfully deposited +$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} via ${gateway}`, 'success');

    return { success: true, message: 'Deposit successful' };
  }, [accountType, depositViaAbePayMpesa, mpesaPrimaryPhone, mpesaSecondaryPhone, realAccountId, demoAccountId, soundEnabled, triggerNotification]);

  // Cashier: Withdraw
  const withdraw = useCallback((gateway: string, amount: number, destination?: string) => {
    if (amount <= 0) {
      triggerNotification('Please enter a valid withdrawal amount', 'error');
      return { success: false, message: 'Invalid amount' };
    }

    if (amount > balances.usdReal) {
      triggerNotification(`Insufficient balance ($${balances.usdReal.toLocaleString()} available)`, 'error');
      return { success: false, message: 'Insufficient funds' };
    }

    setBalances(prev => ({
      ...prev,
      usdReal: Number((prev.usdReal - amount).toFixed(2)),
    }));

    const txnId = `#TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: DerivTransaction = {
      id: txnId,
      type: 'Withdrawal',
      gateway,
      amount: -amount,
      status: 'Successful',
      timestamp: 'Just now',
      details: destination ? `Sent to ${destination}` : `Processed via ${gateway}`,
    };

    setTransactions(prev => [newTxn, ...prev]);
    if (soundEnabled) playAudio('cashier');
    triggerNotification(`Withdrawal of -$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} initiated via ${gateway}`, 'success');

    return { success: true, message: 'Withdrawal successful' };
  }, [balances.usdReal, soundEnabled, triggerNotification]);

  // Cashier: Transfer between internal accounts
  const transfer = useCallback((
    from: keyof WalletBalances,
    to: keyof WalletBalances,
    amount: number
  ) => {
    if (amount <= 0) {
      triggerNotification('Transfer amount must be greater than 0', 'error');
      return { success: false, message: 'Invalid amount' };
    }

    if (balances[from] < amount) {
      triggerNotification(`Source account has insufficient funds ($${balances[from].toLocaleString()} available)`, 'error');
      return { success: false, message: 'Insufficient funds' };
    }

    setBalances(prev => ({
      ...prev,
      [from]: Number((prev[from] - amount).toFixed(2)),
      [to]: Number((prev[to] + amount).toFixed(2)),
    }));

    const labels: Record<keyof WalletBalances, string> = {
      usdReal: 'USD Real Wallet',
      usdDemo: 'Demo Account',
      btcReal: 'BTC Real Wallet',
      usdtReal: 'USDT Real Wallet',
      mt5Derived: 'MT5 Derived Account',
      mt5Financial: 'MT5 Financial Account',
    };

    const txnId = `#TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: DerivTransaction = {
      id: txnId,
      type: 'Transfer',
      gateway: `${labels[from]} ➔ ${labels[to]}`,
      amount,
      status: 'Successful',
      timestamp: 'Just now',
      details: 'Instant 0% fee internal transfer',
    };

    setTransactions(prev => [newTxn, ...prev]);
    if (soundEnabled) playAudio('cashier');
    triggerNotification(`Transferred $${amount.toLocaleString()} from ${labels[from]} to ${labels[to]}`, 'success');

    return { success: true, message: 'Transfer successful' };
  }, [balances, soundEnabled, triggerNotification]);

  // DBot Strategy Configuration
  const updateDBotConfig = useCallback((updates: Partial<DBotStrategyConfig>) => {
    setDbotConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetBotStats = useCallback(() => {
    setBotProfit(0);
    setBotRuns(0);
    setBotWins(0);
    setBotLosses(0);
    setBotLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: 'Bot statistics reset. Ready for new strategy execution.',
      },
    ]);
  }, []);

  // Authentication & Trading Gate ("One should create account when he or she wants to trade")
  const openAuthModal = useCallback((mode: 'register' | 'login' = 'register', intentDescription?: string) => {
    setAuthModalMode(mode);
    setAuthPendingIntent(intentDescription || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPendingIntent(null);
    pendingTradeRef.current = null;
  }, []);

  const requireTradingAccount = useCallback((tradeAction: () => void, intentDescription?: string): boolean => {
    if (user) {
      tradeAction();
      return true;
    }
    pendingTradeRef.current = tradeAction;
    setAuthPendingIntent(intentDescription || 'Execute Market Trade');
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
    triggerNotification('Create a Real or Demo account to start trading!', 'info');
    return false;
  }, [user, triggerNotification]);

  const registerAccount = useCallback((data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    country?: string;
    preferredAccount: AccountType;
  }) => {
    const newRealId = `CR${Math.floor(100000 + Math.random() * 900000)}`;
    const newDemoId = `VRTC${Math.floor(100000 + Math.random() * 900000)}`;

    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || mpesaPrimaryPhone,
      country: data.country || 'Kenya',
      preferredCurrency: 'USD',
      realAccountId: newRealId,
      demoAccountId: newDemoId,
      isVerified: true,
      verificationTier: 'Tier 1',
      registeredAt: new Date().toLocaleDateString(),
    };

    setUser(profile);
    try {
      localStorage.setItem('deriv_trader_user', JSON.stringify(profile));
    } catch {
      // ignore
    }
    setAccountType(data.preferredAccount);
    setIsAuthModalOpen(false);

    if (soundEnabled) playAudio('win');
    triggerNotification(
      `🎉 Welcome, ${profile.fullName}! Created Real (${newRealId}) & Demo (${newDemoId}) accounts.`,
      'success'
    );

    // If there was a pending trade action, execute it!
    if (pendingTradeRef.current) {
      const pendingAction = pendingTradeRef.current;
      pendingTradeRef.current = null;
      setTimeout(() => {
        pendingAction();
      }, 400);
    }
    setAuthPendingIntent(null);

    return { success: true, message: 'Account created successfully' };
  }, [soundEnabled, triggerNotification, mpesaPrimaryPhone]);

  const loginAccount = useCallback((emailOrId: string, _password?: string) => {
    const isRealPref = emailOrId.toUpperCase().includes('CR');
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: emailOrId.includes('@') ? emailOrId.split('@')[0] : 'Trader ' + emailOrId,
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase()}@derivhub.com`,
      phoneNumber: mpesaPrimaryPhone,
      country: 'Kenya',
      preferredCurrency: 'USD',
      realAccountId: isRealPref ? emailOrId : 'CR984210',
      demoAccountId: 'VRTC104921',
      isVerified: true,
      verificationTier: 'Tier 2',
      registeredAt: '2026-09-01',
    };

    setUser(profile);
    try {
      localStorage.setItem('deriv_trader_user', JSON.stringify(profile));
    } catch {
      // ignore
    }
    setAccountType(isRealPref ? 'real' : 'demo');
    setIsAuthModalOpen(false);

    if (soundEnabled) playAudio('win');
    triggerNotification(`Welcome back, ${profile.fullName}!`, 'success');

    if (pendingTradeRef.current) {
      const pendingAction = pendingTradeRef.current;
      pendingTradeRef.current = null;
      setTimeout(() => {
        pendingAction();
      }, 400);
    }
    setAuthPendingIntent(null);

    return { success: true, message: 'Logged in successfully' };
  }, [soundEnabled, triggerNotification, mpesaPrimaryPhone]);

  const logoutAccount = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('deriv_trader_user');
    } catch {
      // ignore
    }
    triggerNotification('Signed out of trading account. Switched to Guest mode.', 'info');
  }, [triggerNotification]);

  const toggleBot = useCallback(() => {
    if (!user && !isBotRunning) {
      requireTradingAccount(() => toggleBot(), 'Start Automated DBot Strategy Engine');
      return;
    }

    setIsBotRunning(prev => {
      const nextState = !prev;
      const now = new Date().toLocaleTimeString();
      if (nextState) {
        setBotLogs(logs => [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            type: 'info',
            message: `🤖 DBot started! Monitoring ${selectedAsset.name} for ${dbotConfig.indicator} < ${dbotConfig.indicatorParam} trigger...`,
          },
          ...logs.slice(0, 40),
        ]);
        triggerNotification('DBot automated strategy started', 'info');
      } else {
        setBotLogs(logs => [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            type: 'info',
            message: '⏸️ DBot paused by user.',
          },
          ...logs.slice(0, 40),
        ]);
        triggerNotification('DBot automated strategy paused', 'info');
      }
      return nextState;
    });
  }, [user, isBotRunning, requireTradingAccount, selectedAsset.name, dbotConfig.indicator, dbotConfig.indicatorParam, triggerNotification]);

  // DBot Autonomous Execution Loop
  useEffect(() => {
    if (!isBotRunning) return;

    // Check every 3 seconds for condition trigger
    const timer = setInterval(() => {
      // Condition: RSI < 30 (or indicatorParam)
      const isTriggered = currentRsi <= dbotConfig.indicatorParam;

      if (isTriggered) {
        const isWin = Math.random() > 0.42; // realistic edge
        const payoutProfit = isWin ? Number((dbotConfig.stake * 0.95).toFixed(2)) : -dbotConfig.stake;
        const now = new Date().toLocaleTimeString();

        setBotRuns(r => r + 1);
        if (isWin) {
          setBotWins(w => w + 1);
          setBotProfit(p => Number((p + payoutProfit).toFixed(2)));
          if (soundEnabled) playAudio('win');
        } else {
          setBotLosses(l => l + 1);
          setBotProfit(p => Number((p + payoutProfit).toFixed(2)));
          if (soundEnabled) playAudio('loss');
        }

        // Adjust real wallet balance
        setBalances(b => ({
          ...b,
          usdReal: Number((b.usdReal + payoutProfit).toFixed(2)),
        }));

        // Log entry
        setBotLogs(logs => [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            type: isWin ? 'win' : 'loss',
            message: isWin
              ? `🎯 [WIN] RSI=${currentRsi} triggered Rise contract. Payout: +$${payoutProfit.toFixed(2)}`
              : `⚠️ [LOSS] RSI=${currentRsi} contract expired out-of-the-money. -$${dbotConfig.stake.toFixed(2)}`,
            pnl: payoutProfit,
          },
          ...logs.slice(0, 50),
        ]);

        // Add to main activity table
        const txnId = `#TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        setTransactions(txns => [
          {
            id: txnId,
            type: 'DBot Trade P/L',
            gateway: 'Deriv DBot',
            amount: payoutProfit,
            status: 'Closed',
            timestamp: 'Just now',
            details: `Auto ${dbotConfig.contractType} contract on ${selectedAsset.name}`,
          },
          ...txns.slice(0, 30),
        ]);

        // Check Take Profit or Stop Loss
        setBotProfit(p => {
          if (p >= dbotConfig.takeProfit) {
            setIsBotRunning(false);
            triggerNotification(`🎉 DBot reached Take Profit target (+$${p})! Bot stopped safely.`, 'success');
          } else if (p <= -dbotConfig.stopLoss) {
            setIsBotRunning(false);
            triggerNotification(`🛑 DBot hit Stop Loss threshold (-$${Math.abs(p)})! Bot stopped to protect capital.`, 'error');
          }
          return p;
        });
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [isBotRunning, currentRsi, dbotConfig, selectedAsset.name, soundEnabled, triggerNotification]);

  // DTrader Manual Contract Execution
  const buyContract = useCallback((type: 'Rise' | 'Fall' | 'Multiplier', stake: number, durationSeconds: number = 5) => {
    // Intercept if user has not created/signed into an account yet ("One should create account when he or she wants to trade")
    if (!user) {
      requireTradingAccount(
        () => buyContract(type, stake, durationSeconds),
        `${type} Contract on ${selectedAsset.name} ($${stake.toFixed(2)})`
      );
      return { success: false, message: 'Account creation required to trade' };
    }

    if (stake <= 0) {
      triggerNotification('Please enter a valid stake amount', 'error');
      return { success: false, message: 'Invalid stake' };
    }

    const availableBal = accountType === 'real' ? balances.usdReal : balances.usdDemo;
    if (availableBal < stake) {
      triggerNotification(
        `Insufficient ${accountType === 'real' ? 'USD Real' : 'Demo'} balance ($${availableBal.toLocaleString()} available)`,
        'error'
      );
      return { success: false, message: 'Insufficient funds' };
    }

    // Deduct stake upfront from respective Real or Demo wallet
    const balanceKey = accountType === 'real' ? 'usdReal' : 'usdDemo';
    setBalances(b => ({
      ...b,
      [balanceKey]: Number((b[balanceKey] - stake).toFixed(2)),
    }));

    const contractId = `CTR-${Math.floor(100000 + Math.random() * 900000)}`;
    const entryPrice = selectedAsset.price;
    const estPayout = Number((stake * 1.95).toFixed(2));

    const newContract: DTraderContract = {
      id: contractId,
      assetId: selectedAsset.id,
      type,
      stake,
      entryPrice,
      currentPrice: entryPrice,
      durationSeconds,
      remainingSeconds: durationSeconds,
      payout: estPayout,
      profit: -stake,
      status: 'running',
    };

    setOpenContracts(prev => [newContract, ...prev]);
    triggerNotification(`Opened ${type} contract on ${selectedAsset.name} for $${stake.toFixed(2)} (${accountType.toUpperCase()})`, 'info');

    // Simulate countdown and settlement
    const contractTimer = setInterval(() => {
      setOpenContracts(contracts =>
        contracts.map(c => {
          if (c.id !== contractId || c.status !== 'running') return c;

          const remaining = c.remainingSeconds - 1;
          const livePrice = selectedAsset.price;

          if (remaining <= 0) {
            clearInterval(contractTimer);
            const isWon = type === 'Rise' ? livePrice > c.entryPrice : livePrice < c.entryPrice;
            const netProfit = isWon ? Number((c.payout - c.stake).toFixed(2)) : -c.stake;

            // Credit respective wallet if won
            if (isWon) {
              setBalances(b => ({
                ...b,
                [balanceKey]: Number((b[balanceKey] + c.payout).toFixed(2)),
              }));
              if (soundEnabled) playAudio('win');
              triggerNotification(`🏆 Won ${type} contract! Payout: +$${c.payout.toFixed(2)} (${accountType.toUpperCase()})`, 'success');
            } else {
              if (soundEnabled) playAudio('loss');
              triggerNotification(`Contract expired out-of-the-money. -$${c.stake.toFixed(2)} (${accountType.toUpperCase()})`, 'error');
            }

            // Record in transaction table
            const txnId = `#TXN-${Math.floor(100000 + Math.random() * 900000)}`;
            setTransactions(t => [
              {
                id: txnId,
                type: 'Options Contract',
                gateway: `Deriv DTrader (${accountType.toUpperCase()})`,
                amount: isWon ? netProfit : -c.stake,
                status: 'Closed',
                timestamp: 'Just now',
                details: `${type} on ${selectedAsset.name} (Entry: ${c.entryPrice}, Exit: ${livePrice})`,
              },
              ...t,
            ]);

            return {
              ...c,
              remainingSeconds: 0,
              currentPrice: livePrice,
              exitPrice: livePrice,
              status: isWon ? 'won' : 'lost',
              profit: isWon ? netProfit : -c.stake,
            };
          }

          return {
            ...c,
            remainingSeconds: remaining,
            currentPrice: livePrice,
          };
        })
      );
    }, 1000);

    return { success: true, message: 'Contract opened' };
  }, [user, requireTradingAccount, selectedAsset, accountType, balances.usdReal, balances.usdDemo, soundEnabled, triggerNotification]);

  return (
    <DerivContext.Provider
      value={{
        accountType,
        setAccountType,
        balances,
        activeWallet,
        setActiveWallet,
        realAccountId,
        demoAccountId,
        resetDemoBalance,
        mpesaPrimaryPhone,
        mpesaSecondaryPhone,
        mpesaBalanceKes,
        mpesaReceipts,
        latestMpesaSms,
        clearMpesaSms,
        depositViaAbePayMpesa,
        transactions,
        assets,
        selectedAsset,
        setSelectedAssetId,
        currentRsi,
        recentTicks,
        deposit,
        withdraw,
        transfer,
        dbotConfig,
        updateDBotConfig,
        isBotRunning,
        toggleBot,
        botProfit,
        botRuns,
        botWins,
        botLosses,
        botLogs,
        resetBotStats,
        openContracts,
        buyContract,
        tradingMode: 'binary',
        setTradingMode: () => {},
        terminalOrders: [],
        executeTerminalOrder: () => ({ success: true, message: 'Executed' }),
        closeTerminalOrder: () => {},
        netAssetValue: accountType === 'real' ? balances.usdReal : balances.usdDemo,
        soundEnabled,
        setSoundEnabled,
        notification,
        clearNotification,
        user,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        authModalMode,
        authPendingIntent,
        openAuthModal,
        closeAuthModal,
        registerAccount,
        loginAccount,
        logoutAccount,
        requireTradingAccount,
      }}
    >
      {children}
    </DerivContext.Provider>
  );
};

export const useDeriv = () => {
  const context = useContext(DerivContext);
  if (!context) {
    throw new Error('useDeriv must be used within a DerivProvider');
  }
  return context;
};
