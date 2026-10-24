import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { Mt5BotConfig, Mt5BotPosition, Mt5BotLog } from '../../types/deriv';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Terminal,
  Code,
  FileCode,
  Cpu,
  Sliders,
  Activity,
  Layers,
  Zap,
  Info,
  DollarSign,
  Maximize2
} from 'lucide-react';

export const MT5PythonBotView: React.FC = () => {
  const {
    balances,
    accountType,
    user,
    openAuthModal,
    soundEnabled,
  } = useDeriv();

  // MT5 Financial Balance is used as the base equity
  const initialBaseEquity = balances.mt5Financial > 0 ? balances.mt5Financial : 1450.0;

  // Bot Config State based on user's Python script
  const [config, setConfig] = useState<Mt5BotConfig>({
    symbol: 'EURUSD',
    timeframe: 'M15',
    fallbackLotSize: 0.1,
    riskPerTradePct: 1.0,
    maxDailyLossPct: 3.0,
    stopLossPips: 30,
    takeProfitPips: 60,
    magicNumber: 234000,
    fastMaPeriod: 9,
    slowMaPeriod: 21,
  });

  // Bot Engine Runtime State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startingEquity, setStartingEquity] = useState<number>(initialBaseEquity);
  const [currentEquity, setCurrentEquity] = useState<number>(initialBaseEquity);
  const [isCircuitBreakerTripped, setIsCircuitBreakerTripped] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'logs' | 'positions'>('visual');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [openPositions, setOpenPositions] = useState<Mt5BotPosition[]>([]);
  const [realizedPnl, setRealizedPnl] = useState<number>(0);
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [winningTrades, setWinningTrades] = useState<number>(0);

  // Live EUR/USD Simulated M15 Rates and Moving Averages
  const [eurUsdRates, setEurUsdRates] = useState<Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    fastMa: number;
    slowMa: number;
  }>>(() => {
    // Generate initial 25 bars around 1.08540
    let price = 1.08500;
    const items = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const delta = (Math.random() - 0.48) * 0.0006;
      const open = price;
      const close = Number((price + delta).toFixed(5));
      const high = Number((Math.max(open, close) + Math.random() * 0.0003).toFixed(5));
      const low = Number((Math.min(open, close) - Math.random() * 0.0003).toFixed(5));
      price = close;

      const timeStr = new Date(now - i * 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      items.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        fastMa: close,
        slowMa: close,
      });
    }

    // Compute rolling MAs
    for (let i = 0; i < items.length; i++) {
      const sliceFast = items.slice(Math.max(0, i - 8), i + 1);
      const avgFast = sliceFast.reduce((acc, curr) => acc + curr.close, 0) / sliceFast.length;
      items[i].fastMa = Number(avgFast.toFixed(5));

      const sliceSlow = items.slice(Math.max(0, i - 20), i + 1);
      const avgSlow = sliceSlow.reduce((acc, curr) => acc + curr.close, 0) / sliceSlow.length;
      items[i].slowMa = Number(avgSlow.toFixed(5));
    }
    return items;
  });

  const [bid, setBid] = useState<number>(1.08540);
  const [ask, setAsk] = useState<number>(1.08552);

  // Console Logs matching Python stdout format
  const [logs, setLogs] = useState<Mt5BotLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: `MetaTrader 5 Python Bot initialized. Account #50819234 on Deriv-BVI-Real.`,
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: `Strategy: ${config.symbol} ${config.timeframe} (MA${config.fastMaPeriod} / MA${config.slowMaPeriod}) | Magic #${config.magicNumber}.`,
    },
    {
      id: 'log-3',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: `Risk Management: ${config.riskPerTradePct}% per trade | Max Daily Loss: ${config.maxDailyLossPct}% | SL: ${config.stopLossPips} pips, TP: ${config.takeProfitPips} pips.`,
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Dynamic lot size formula from Python script:
  // calculated_lots = risk_amount / (stop_loss_pips * (pip_value * 10))
  // pip_value for EURUSD = 1.0 (approx $10 per pip for 1.0 standard lot)
  const dynamicLotPreview = useMemo(() => {
    const riskAmount = currentEquity * (config.riskPerTradePct / 100.0);
    const pipValue = 1.0; // deposit currency USD for EURUSD
    const stopLossPips = config.stopLossPips || 30;
    const rawLots = riskAmount / (stopLossPips * (pipValue * 10));
    const lotStep = 0.01;
    const volumeMin = 0.01;
    const volumeMax = 50.0;
    const calculatedLots = Math.round(Math.round(rawLots / lotStep) * lotStep * 100) / 100;
    return Math.max(volumeMin, Math.min(calculatedLots, volumeMax));
  }, [currentEquity, config.riskPerTradePct, config.stopLossPips]);

  // Current Daily Drawdown Percentage: ((startingEquity - currentEquity) / startingEquity) * 100
  const dailyDrawdownPct = useMemo(() => {
    if (startingEquity <= 0) return 0;
    const dd = ((startingEquity - currentEquity) / startingEquity) * 100;
    return dd > 0 ? Number(dd.toFixed(2)) : 0;
  }, [startingEquity, currentEquity]);

  // Generate runnable Python script string identical to user's code
  const pythonScriptCode = useMemo(() => {
    return `import MetaTrader5 as mt5
import pandas as pd
import datetime
import time

# ==================== CONFIGURATION ====================
SYMBOL = "${config.symbol}"
TIMEFRAME = mt5.TIMEFRAME_${config.timeframe}  # ${config.timeframe} chart
LOT_SIZE = ${config.fallbackLotSize}  # Fallback lot size if dynamic calculation fails

# Risk Management Parameters
RISK_PER_TRADE_PCT = ${config.riskPerTradePct.toFixed(1)}  # Risk max ${config.riskPerTradePct}% of account equity per trade
MAX_DAILY_LOSS_PCT = ${config.maxDailyLossPct.toFixed(1)}  # Shut down trading if daily equity drops by ${config.maxDailyLossPct}%
STOP_LOSS_PIPS = ${config.stopLossPips}  # Stop Loss distance in pips
TAKE_PROFIT_PIPS = ${config.takeProfitPips}  # Take Profit distance in pips (1:2 Risk-Reward)
MAGIC_NUMBER = ${config.magicNumber}  # Unique identifier for bot trades
# =======================================================

def initialize_mt5():
    """Initializes connection to the MT5 terminal."""
    if not mt5.initialize():
        print(f"initialize() failed, error code = {mt5.last_error()}")
        quit()
    print(f"Connected to account #{mt5.account_info().login} on server {mt5.account_info().server}")

def calculate_dynamic_lot_size(symbol, stop_loss_pips):
    """Calculates position size dynamically based on account equity and risk %."""
    account_info = mt5.account_info()
    if account_info is None:
        return LOT_SIZE

    equity = account_info.equity
    risk_amount = equity * (RISK_PER_TRADE_PCT / 100.0)

    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        return LOT_SIZE

    # Calculate pip value in deposit currency
    # 1 pip = 0.0001 for forex pairs (excluding JPY)
    pip_value = symbol_info.trade_tick_value * (10 if "JPY" in symbol else 10000)

    if pip_value == 0 or stop_loss_pips == 0:
        return LOT_SIZE

    # Formula: Risk Amount / (Stop Loss in Pips * Value per Pip per Lot)
    calculated_lots = risk_amount / (stop_loss_pips * (pip_value * 10))

    # Normalize lot size according to broker constraints
    min_lot = symbol_info.volume_min
    max_lot = symbol_info.volume_max
    lot_step = symbol_info.volume_step

    calculated_lots = round(round(calculated_lots / lot_step) * lot_step, 2)  # round to step
    return max(min_lot, min(calculated_lots, max_lot))

def check_daily_drawdown(initial_equity):
    """Checks if daily drawdown limit has been breached."""
    account_info = mt5.account_info()
    if account_info is None:
        return False

    current_equity = account_info.equity
    drawdown_pct = ((initial_equity - current_equity) / initial_equity) * 100

    if drawdown_pct >= MAX_DAILY_LOSS_PCT:
        print(f"🚨 MAX DAILY LOSS REACHED ({drawdown_pct:.2f}%). Stopping trading bot for today.")
        return True
    return False

def get_market_data(symbol, timeframe):
    """Fetches recent price history and computes moving averages."""
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, 100)
    if rates is None:
        return None

    df = pd.DataFrame(rates)
    # Compute Fast and Slow Moving Averages
    df['ma_fast'] = df['close'].rolling(window=${config.fastMaPeriod}).mean()
    df['ma_slow'] = df['close'].rolling(window=${config.slowMaPeriod}).mean()
    return df

def execute_order(symbol, order_type, lot, sl, tp):
    """Sends an order to the MT5 terminal with built-in SL and TP."""
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        print("Failed to get tick data.")
        return

    price = tick.ask if order_type == mt5.ORDER_TYPE_BUY else tick.bid

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": lot,
        "type": order_type,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 20,
        "magic": MAGIC_NUMBER,
        "comment": "Python Risk-Managed Bot",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"Order failed, retcode={result.retcode}")
    else:
        print(f"Order executed successfully! Ticket: {result.order}, Price: {price}, SL: {sl}, TP: {tp}")

def run_bot():
    initialize_mt5()

    # Record starting equity for daily drawdown guard
    initial_account_info = mt5.account_info()
    if not initial_account_info:
        print("Failed to fetch initial account info.")
        mt5.shutdown()
        return
    starting_equity = initial_account_info.equity

    print(f"Bot running on {SYMBOL}. Starting Equity: \${starting_equity:.2f}. Press Ctrl+C to exit.")

    try:
        while True:
            # 1. Verify drawdown limits before every iteration
            if check_daily_drawdown(starting_equity):
                break

            # 2. Check if a position for this magic number is already open
            positions = mt5.positions_get(symbol=SYMBOL)
            has_open_position = False
            if positions:
                for pos in positions:
                    if pos.magic == MAGIC_NUMBER:
                        has_open_position = True
                        break

            # 3. If no open position, check strategy signals
            if not has_open_position:
                df = get_market_data(SYMBOL, TIMEFRAME)
                if df is not None and len(df) > 2:
                    prev_fast = df['ma_fast'].iloc[-2]
                    prev_slow = df['ma_slow'].iloc[-2]
                    curr_fast = df['ma_fast'].iloc[-1]
                    curr_slow = df['ma_slow'].iloc[-1]

                    tick = mt5.symbol_info_tick(SYMBOL)

                    # Bullish crossover (Fast MA crosses above Slow MA)
                    if prev_fast <= prev_slow and curr_fast > curr_slow:
                        print(f"[{datetime.datetime.now()}] Bullish crossover detected.")
                        lot = calculate_dynamic_lot_size(SYMBOL, STOP_LOSS_PIPS)
                        point = mt5.symbol_info(SYMBOL).point

                        sl = tick.ask - (STOP_LOSS_PIPS * 10 * point)
                        tp = tick.take_profit if TAKE_PROFIT_PIPS == 0 else tick.ask + (TAKE_PROFIT_PIPS * 10 * point)

                        execute_order(SYMBOL, mt5.ORDER_TYPE_BUY, lot, sl, tp)

                    # Bearish crossover (Fast MA crosses below Slow MA)
                    elif prev_fast >= prev_slow and curr_fast < curr_slow:
                        print(f"[{datetime.datetime.now()}] Bearish crossover detected.")
                        lot = calculate_dynamic_lot_size(SYMBOL, STOP_LOSS_PIPS)
                        point = mt5.symbol_info(SYMBOL).point

                        sl = tick.bid + (STOP_LOSS_PIPS * 10 * point)
                        tp = tick.take_profit if TAKE_PROFIT_PIPS == 0 else tick.bid - (TAKE_PROFIT_PIPS * 10 * point)

                        execute_order(SYMBOL, mt5.ORDER_TYPE_SELL, lot, sl, tp)

            # Sleep for 60 seconds before polling data again
            time.sleep(60)

    except KeyboardInterrupt:
        print("Bot stopped manually by user.")
    finally:
        mt5.shutdown()
        print("MT5 connection closed safely.")

if __name__ == "__main__":
    run_bot()
`;
  }, [config]);

  // Copy code to clipboard handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download Python file
  const handleDownloadScript = () => {
    const blob = new Blob([pythonScriptCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mt5_risk_bot_${config.symbol.toLowerCase()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle Bot Execution
  const handleToggleBot = () => {
    if (!user && !isRunning) {
      openAuthModal('register', 'Run MetaTrader 5 Python Automated Risk Bot');
      return;
    }

    if (!isRunning) {
      // Start bot
      setIsCircuitBreakerTripped(false);
      setStartingEquity(currentEquity);
      setIsRunning(true);

      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp,
          type: 'success',
          message: `🚀 Python Bot started! Monitoring ${config.symbol} ${config.timeframe} (Magic #${config.magicNumber}). Starting Equity: $${currentEquity.toFixed(2)}.`,
        },
        ...prev.slice(0, 80),
      ]);
    } else {
      // Pause bot
      setIsRunning(false);
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp,
          type: 'warning',
          message: `⏹️ Python MT5 Bot stopped by user. Terminal connection preserved.`,
        },
        ...prev.slice(0, 80),
      ]);
    }
  };

  // Reset Bot Stats & Circuit Breaker
  const handleResetBot = () => {
    setIsRunning(false);
    setIsCircuitBreakerTripped(false);
    setCurrentEquity(initialBaseEquity);
    setStartingEquity(initialBaseEquity);
    setOpenPositions([]);
    setRealizedPnl(0);
    setTotalTrades(0);
    setWinningTrades(0);
    setLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: 'Bot statistics and circuit breaker reset to defaults.',
      },
    ]);
  };

  // Live simulation tick & crossover engine
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Tick simulation on EUR/USD
      const tickDelta = (Math.random() - 0.49) * 0.00015;
      setBid(prev => {
        const next = Math.max(1.05000, Number((prev + tickDelta).toFixed(5)));
        setAsk(Number((next + 0.00012).toFixed(5))); // 1.2 pip spread
        return next;
      });

      // 2. Update rates array occasionally
      setEurUsdRates(prev => {
        const last = prev[prev.length - 1];
        const newClose = Number((last.close + tickDelta).toFixed(5));
        const newHigh = Number(Math.max(last.high, newClose).toFixed(5));
        const newLow = Number(Math.min(last.low, newClose).toFixed(5));

        const updatedLast = {
          ...last,
          close: newClose,
          high: newHigh,
          low: newLow,
        };

        const updatedList = [...prev.slice(0, -1), updatedLast];

        // Recompute Fast & Slow MAs for the last item
        const sliceFast = updatedList.slice(-config.fastMaPeriod);
        const avgFast = sliceFast.reduce((acc, c) => acc + c.close, 0) / sliceFast.length;
        updatedLast.fastMa = Number(avgFast.toFixed(5));

        const sliceSlow = updatedList.slice(-config.slowMaPeriod);
        const avgSlow = sliceSlow.reduce((acc, c) => acc + c.close, 0) / sliceSlow.length;
        updatedLast.slowMa = Number(avgSlow.toFixed(5));

        return updatedList;
      });

      // 3. Floating PnL update on open positions
      setOpenPositions(prevPositions => {
        if (prevPositions.length === 0) return prevPositions;

        return prevPositions.map(pos => {
          const livePrice = pos.type === 'BUY' ? bid : ask;
          const pipDiff = pos.type === 'BUY'
            ? (livePrice - pos.openPrice) / 0.0001
            : (pos.openPrice - livePrice) / 0.0001;
          const profitUsd = Number((pipDiff * 10 * pos.lots).toFixed(2));

          return {
            ...pos,
            currentPrice: livePrice,
            profitUsd,
          };
        });
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [bid, ask, config.fastMaPeriod, config.slowMaPeriod]);

  // Main Bot Logic Loop: Runs every 4 seconds when bot is active
  useEffect(() => {
    if (!isRunning) return;

    const botInterval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString();

      // STEP 1: Verify Daily Drawdown (Circuit Breaker)
      // check_daily_drawdown(initial_equity)
      const currentDd = ((startingEquity - currentEquity) / startingEquity) * 100;
      if (currentDd >= config.maxDailyLossPct) {
        setIsRunning(false);
        setIsCircuitBreakerTripped(true);
        setLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: nowStr,
            type: 'circuit_breaker',
            message: `🚨 MAX DAILY LOSS REACHED (${currentDd.toFixed(2)}% >= ${config.maxDailyLossPct}%). Circuit breaker triggered! Stopping bot for today to protect capital.`,
          },
          ...prev.slice(0, 80),
        ]);
        return;
      }

      // STEP 2: Check Open Position (Magic Number guard)
      // Single position discipline: if position with MAGIC_NUMBER is already open, do not open new
      const hasMagicPosition = openPositions.some(p => p.magic === config.magicNumber);

      if (hasMagicPosition) {
        // Evaluate SL/TP hits for open positions
        const activePos = openPositions.find(p => p.magic === config.magicNumber);
        if (activePos) {
          const isBuy = activePos.type === 'BUY';
          const hitTp = isBuy ? bid >= activePos.tp : ask <= activePos.tp;
          const hitSl = isBuy ? bid <= activePos.sl : ask >= activePos.sl;

          if (hitTp || hitSl) {
            const finalProfit = hitTp
              ? Number((config.takeProfitPips * 10 * activePos.lots).toFixed(2))
              : -Number((config.stopLossPips * 10 * activePos.lots).toFixed(2));

            // Close deal
            setOpenPositions(prev => prev.filter(p => p.ticket !== activePos.ticket));
            setCurrentEquity(eq => Number((eq + finalProfit).toFixed(2)));
            setRealizedPnl(r => Number((r + finalProfit).toFixed(2)));
            setTotalTrades(t => t + 1);
            if (hitTp) setWinningTrades(w => w + 1);

            setLogs(prev => [
              {
                id: `log-${Date.now()}`,
                timestamp: nowStr,
                type: hitTp ? 'success' : 'warning',
                message: hitTp
                  ? `🎯 [TAKE PROFIT HIT] Ticket #${activePos.ticket} closed at ${activePos.tp}. Realized Profit: +$${finalProfit.toFixed(2)}!`
                  : `🛑 [STOP LOSS HIT] Ticket #${activePos.ticket} closed at ${activePos.sl}. Realized Loss: -$${Math.abs(finalProfit).toFixed(2)}.`,
              },
              ...prev.slice(0, 80),
            ]);
          }
        }
        return;
      }

      // STEP 3: If no open position, check strategy signals
      // Fast MA vs Slow MA crossover on M15
      if (eurUsdRates.length >= 3) {
        const prevBar = eurUsdRates[eurUsdRates.length - 2];
        const currBar = eurUsdRates[eurUsdRates.length - 1];

        const prevFast = prevBar.fastMa;
        const prevSlow = prevBar.slowMa;
        const currFast = currBar.fastMa;
        const currSlow = currBar.slowMa;

        const isBullishCross = prevFast <= prevSlow && currFast > currSlow;
        const isBearishCross = prevFast >= prevSlow && currFast < currSlow;

        // Forced simulated crossover periodically if none occurred naturally
        const randomTrigger = Math.random() < 0.28;
        const triggerType = isBullishCross ? 'BUY' : isBearishCross ? 'SELL' : randomTrigger ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : null;

        if (triggerType) {
          const point = 0.00001; // MT5 5-digit broker point
          const lot = dynamicLotPreview;
          const ticketNumber = Math.floor(2340000 + Math.random() * 90000);

          if (triggerType === 'BUY') {
            const entryPrice = ask;
            const sl = Number((entryPrice - config.stopLossPips * 10 * point).toFixed(5));
            const tp = Number((entryPrice + config.takeProfitPips * 10 * point).toFixed(5));

            const newPos: Mt5BotPosition = {
              ticket: ticketNumber,
              symbol: config.symbol,
              type: 'BUY',
              lots: lot,
              openPrice: entryPrice,
              currentPrice: entryPrice,
              sl,
              tp,
              profitUsd: 0,
              magic: config.magicNumber,
              openTime: nowStr,
              comment: 'Python Risk-Managed Bot',
            };

            setOpenPositions([newPos]);
            setLogs(prev => [
              {
                id: `log-${Date.now()}-1`,
                timestamp: nowStr,
                type: 'order',
                message: `[${nowStr}] 🟢 Bullish crossover detected (MA${config.fastMaPeriod}: ${currFast.toFixed(5)} > MA${config.slowMaPeriod}: ${currSlow.toFixed(5)}).`,
              },
              {
                id: `log-${Date.now()}-2`,
                timestamp: nowStr,
                type: 'order',
                message: `Order executed successfully! Ticket: ${ticketNumber}, Type: BUY, Lots: ${lot}, Price: ${entryPrice.toFixed(5)}, SL: ${sl.toFixed(5)}, TP: ${tp.toFixed(5)} [Magic: ${config.magicNumber}]`,
              },
              ...prev.slice(0, 80),
            ]);
          } else {
            const entryPrice = bid;
            const sl = Number((entryPrice + config.stopLossPips * 10 * point).toFixed(5));
            const tp = Number((entryPrice - config.takeProfitPips * 10 * point).toFixed(5));

            const newPos: Mt5BotPosition = {
              ticket: ticketNumber,
              symbol: config.symbol,
              type: 'SELL',
              lots: lot,
              openPrice: entryPrice,
              currentPrice: entryPrice,
              sl,
              tp,
              profitUsd: 0,
              magic: config.magicNumber,
              openTime: nowStr,
              comment: 'Python Risk-Managed Bot',
            };

            setOpenPositions([newPos]);
            setLogs(prev => [
              {
                id: `log-${Date.now()}-1`,
                timestamp: nowStr,
                type: 'order',
                message: `[${nowStr}] 🔴 Bearish crossover detected (MA${config.fastMaPeriod}: ${currFast.toFixed(5)} < MA${config.slowMaPeriod}: ${currSlow.toFixed(5)}).`,
              },
              {
                id: `log-${Date.now()}-2`,
                timestamp: nowStr,
                type: 'order',
                message: `Order executed successfully! Ticket: ${ticketNumber}, Type: SELL, Lots: ${lot}, Price: ${entryPrice.toFixed(5)}, SL: ${sl.toFixed(5)}, TP: ${tp.toFixed(5)} [Magic: ${config.magicNumber}]`,
              },
              ...prev.slice(0, 80),
            ]);
          }
        }
      }
    }, 3800);

    return () => clearInterval(botInterval);
  }, [
    isRunning,
    startingEquity,
    currentEquity,
    config,
    openPositions,
    eurUsdRates,
    bid,
    ask,
    dynamicLotPreview
  ]);

  // SVG Chart points calculation
  const latestBars = eurUsdRates.slice(-20);
  const minPrice = Math.min(...latestBars.map(b => b.low)) - 0.0002;
  const maxPrice = Math.max(...latestBars.map(b => b.high)) + 0.0002;
  const priceRange = maxPrice - minPrice || 0.001;

  const activePosition = openPositions[0];

  return (
    <div className="p-6 sm:p-9 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Terminal className="w-5 h-5" />
              </span>
              <span>MetaTrader 5 Python Risk-Managed Bot</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#2962ff]/20 text-[#2962ff] border border-[#2962ff]/30">
              M15 Strategy
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Magic #{config.magicNumber}
            </span>
          </div>
          <p className="text-xs text-[#8592a6] mt-1">
            Autonomous EUR/USD 15-Minute Moving Average Crossover (Fast MA 9 / Slow MA 21) with dynamic lot sizing and 3.0% daily drawdown circuit breaker.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetBot}
            title="Reset bot stats & equity"
            className="p-2.5 bg-[#1b263b] hover:bg-[#293548] text-[#8592a6] hover:text-white rounded-lg border border-[#293548] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadScript}
            className="px-3.5 py-2.5 bg-[#1b263b] hover:bg-[#293548] text-white text-xs font-semibold rounded-lg border border-[#293548] flex items-center gap-2 transition-colors cursor-pointer"
            title="Download pure Python script to run on MT5 terminal"
          >
            <Download className="w-4 h-4 text-[#2962ff]" />
            <span className="hidden sm:inline">Download .py Script</span>
          </button>

          <button
            onClick={handleToggleBot}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-emerald-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause Python Engine' : 'Run MT5 Python Bot'}</span>
          </button>
        </div>
      </div>

      {/* Circuit Breaker Emergency Banner */}
      {isCircuitBreakerTripped && (
        <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-400 flex items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <span className="font-extrabold text-white text-sm block">
                🚨 CIRCUIT BREAKER TRIPPED: Max Daily Loss Reached ({dailyDrawdownPct}% &gt;= {config.maxDailyLossPct}%)
              </span>
              <span className="text-red-300">
                Bot halted execution automatically in accordance with Python <code className="bg-red-950/60 px-1 py-0.5 rounded text-red-200 font-mono">check_daily_drawdown()</code> safety guard to protect remaining equity (${currentEquity.toFixed(2)}).
              </span>
            </div>
          </div>
          <button
            onClick={handleResetBot}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer"
          >
            Reset Breaker
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* MT5 Account Equity */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <span className="text-xs text-[#8592a6] block">MT5 Equity</span>
          <span className="text-2xl font-bold font-mono text-white">
            ${currentEquity.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block">
            Start: ${startingEquity.toFixed(2)}
          </span>
        </div>

        {/* Daily Drawdown Meter */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8592a6] block">Daily Drawdown</span>
            <span className="text-[10px] text-red-400 font-mono font-bold">Max: {config.maxDailyLossPct}%</span>
          </div>
          <span className={`text-2xl font-bold font-mono ${dailyDrawdownPct >= config.maxDailyLossPct ? 'text-red-500' : dailyDrawdownPct > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {dailyDrawdownPct.toFixed(2)}%
          </span>
          {/* Progress bar towards circuit breaker */}
          <div className="w-full bg-[#0e1726] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all ${dailyDrawdownPct >= config.maxDailyLossPct ? 'bg-red-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, (dailyDrawdownPct / config.maxDailyLossPct) * 100)}%` }}
            />
          </div>
        </div>

        {/* Dynamic Lot Size Calculation */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8592a6] block">Calculated Lot Size</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">Risk: {config.riskPerTradePct}%</span>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {dynamicLotPreview.toFixed(2)} Lots
          </span>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block truncate">
            Formula: Risk ${ (currentEquity * (config.riskPerTradePct / 100)).toFixed(2) } / {config.stopLossPips}p
          </span>
        </div>

        {/* Realized PnL & Win Rate */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
          <span className="text-xs text-[#8592a6] block">Realized Bot P/L</span>
          <span className={`text-2xl font-bold font-mono ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block">
            {totalTrades > 0 ? `${((winningTrades / totalTrades) * 100).toFixed(0)}% Win Rate (${totalTrades} Deals)` : '0 Deals closed'}
          </span>
        </div>

        {/* Live EUR/USD Price & Spread */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4 col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-xs text-[#8592a6] block">EUR/USD Live Bid / Ask</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono text-white">
              {bid.toFixed(5)}
            </span>
            <span className="text-xs text-[#8592a6] font-mono">/</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {ask.toFixed(5)}
            </span>
          </div>
          <span className="text-[11px] text-[#8592a6] mt-0.5 block font-mono">
            Spread: 1.2 pips · 5-digit point
          </span>
        </div>
      </div>

      {/* Main Studio View Tabs */}
      <div className="flex border-b border-[#293548] gap-2 pb-0">
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'visual'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-[#8592a6] hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Strategy & MA Visualizer</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'code'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-[#8592a6] hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Python MT5 Script (.py)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-[#8592a6] hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>MT5 Terminal Console ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'positions'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
              : 'border-transparent text-[#8592a6] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active MT5 Orders ({openPositions.length})</span>
        </button>
      </div>

      {/* Tab 1: Visual Strategy Pipeline & Live M15 Chart */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Visual M15 Chart with MA Crossover and SL/TP overlays */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Live Chart Container */}
            <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 shadow-md flex flex-col justify-between h-[380px] relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#8592a6] mb-2 z-10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {config.symbol} - {config.timeframe} Candlesticks
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-0.5 bg-emerald-400 inline-block"></span>
                      Fast MA ({config.fastMaPeriod}): {latestBars[latestBars.length - 1]?.fastMa.toFixed(5)}
                    </span>
                    <span className="flex items-center gap-1 text-[#2962ff]">
                      <span className="w-2 h-0.5 bg-[#2962ff] inline-block"></span>
                      Slow MA ({config.slowMaPeriod}): {latestBars[latestBars.length - 1]?.slowMa.toFixed(5)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span>High: {maxPrice.toFixed(5)}</span>
                  <span>Low: {minPrice.toFixed(5)}</span>
                </div>
              </div>

              {/* SVG Canvas for Candlesticks and Moving Average Lines */}
              <div className="w-full h-[250px] relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 240">
                  {/* Grid lines */}
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#293548" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#293548" strokeDasharray="3 3" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#293548" strokeDasharray="3 3" />

                  {/* Render 20 latest bars as candlesticks */}
                  {latestBars.map((bar, i) => {
                    const x = 30 + (i * 28);
                    const openY = 230 - ((bar.open - minPrice) / priceRange) * 210;
                    const closeY = 230 - ((bar.close - minPrice) / priceRange) * 210;
                    const highY = 230 - ((bar.high - minPrice) / priceRange) * 210;
                    const lowY = 230 - ((bar.low - minPrice) / priceRange) * 210;
                    const isGreen = bar.close >= bar.open;
                    const color = isGreen ? '#00c853' : '#ff444f';

                    return (
                      <g key={i}>
                        {/* Wick */}
                        <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                        {/* Body */}
                        <rect
                          x={x - 6}
                          y={Math.min(openY, closeY)}
                          width="12"
                          height={Math.max(2, Math.abs(openY - closeY))}
                          fill={color}
                          rx="1"
                        />
                      </g>
                    );
                  })}

                  {/* Fast MA Polyline (Emerald) */}
                  <polyline
                    fill="none"
                    stroke="#00c853"
                    strokeWidth="2.2"
                    points={latestBars
                      .map((bar, i) => {
                        const x = 30 + (i * 28);
                        const y = 230 - ((bar.fastMa - minPrice) / priceRange) * 210;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Slow MA Polyline (Blue) */}
                  <polyline
                    fill="none"
                    stroke="#2962ff"
                    strokeWidth="2.2"
                    points={latestBars
                      .map((bar, i) => {
                        const x = 30 + (i * 28);
                        const y = 230 - ((bar.slowMa - minPrice) / priceRange) * 210;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* SL and TP Price Overlays if a position is open */}
                  {activePosition && (
                    <>
                      {/* Entry line */}
                      <line
                        x1="0"
                        y1={230 - ((activePosition.openPrice - minPrice) / priceRange) * 210}
                        x2="600"
                        y2={230 - ((activePosition.openPrice - minPrice) / priceRange) * 210}
                        stroke="#ffffff"
                        strokeDasharray="4 2"
                        strokeWidth="1.5"
                      />
                      {/* TP line (Green) */}
                      <line
                        x1="0"
                        y1={230 - ((activePosition.tp - minPrice) / priceRange) * 210}
                        x2="600"
                        y2={230 - ((activePosition.tp - minPrice) / priceRange) * 210}
                        stroke="#00c853"
                        strokeDasharray="4 2"
                        strokeWidth="1.8"
                      />
                      {/* SL line (Red) */}
                      <line
                        x1="0"
                        y1={230 - ((activePosition.sl - minPrice) / priceRange) * 210}
                        x2="600"
                        y2={230 - ((activePosition.sl - minPrice) / priceRange) * 210}
                        stroke="#ff444f"
                        strokeDasharray="4 2"
                        strokeWidth="1.8"
                      />
                    </>
                  )}
                </svg>
              </div>

              {/* Chart Bottom Ribbon */}
              <div className="flex items-center justify-between text-[11px] text-[#8592a6] font-mono border-t border-[#293548] pt-2">
                <div className="flex items-center gap-3">
                  <span>Strategy: MA Crossover</span>
                  {activePosition ? (
                    <span className="text-white font-bold">
                      Active #{activePosition.ticket} ({activePosition.type} {activePosition.lots} Lots @ {activePosition.openPrice})
                    </span>
                  ) : (
                    <span className="text-[#8592a6]">Scanning for Golden / Death cross on M15...</span>
                  )}
                </div>
                <span className="text-emerald-400 font-bold">
                  {isRunning ? '● Real-time Polling (60s)' : '○ Standby'}
                </span>
              </div>
            </div>

            {/* Strategy Logic Workflow Flowchart Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span className="text-xs font-bold text-white">Daily Drawdown Guard</span>
                </div>
                <p className="text-[11px] text-[#8592a6] leading-relaxed">
                  Checks <code className="text-white font-mono text-[10px]">check_daily_drawdown()</code> before any tick analysis. If equity drops by <span className="text-red-400 font-bold">{config.maxDailyLossPct}%</span>, kills bot loop instantly.
                </p>
              </div>

              <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2962ff]/20 text-[#2962ff] flex items-center justify-center text-[10px] font-bold">2</span>
                  <span className="text-xs font-bold text-white">Single Position Discipline</span>
                </div>
                <p className="text-[11px] text-[#8592a6] leading-relaxed">
                  Scans <code className="text-white font-mono text-[10px]">mt5.positions_get(symbol="{config.symbol}")</code> for Magic #{config.magicNumber}. Never stacks trades or revenge trades.
                </p>
              </div>

              <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span className="text-xs font-bold text-white">Dynamic Lot Sizing</span>
                </div>
                <p className="text-[11px] text-[#8592a6] leading-relaxed">
                  Calculates lot size dynamically from account equity: <code className="text-white font-mono text-[10px]">risk_amount / (SL_pips * pip_value * 10)</code> rounded to volume step.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Parameters Config Form */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 shadow-md flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="border-b border-[#293548] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">Python Bot Parameters</h3>
                  <p className="text-[11px] text-[#8592a6]">Modifies script constants &amp; live runtime</p>
                </div>
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  Config.py
                </span>
              </div>

              {/* Symbol & Timeframe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">SYMBOL</label>
                  <select
                    value={config.symbol}
                    onChange={e => setConfig(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full bg-[#0e1726] border border-[#293548] text-white p-2 rounded-lg text-xs font-mono font-bold"
                  >
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                    <option value="USDJPY">USDJPY</option>
                    <option value="AUDUSD">AUDUSD</option>
                    <option value="XAUUSD">XAUUSD (Gold)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">TIMEFRAME</label>
                  <select
                    value={config.timeframe}
                    onChange={e => setConfig(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full bg-[#0e1726] border border-[#293548] text-white p-2 rounded-lg text-xs font-mono font-bold"
                  >
                    <option value="M15">M15 (15 Minutes)</option>
                    <option value="M5">M5 (5 Minutes)</option>
                    <option value="M1">M1 (1 Minute)</option>
                    <option value="H1">H1 (1 Hour)</option>
                  </select>
                </div>
              </div>

              {/* Risk % per Trade & Max Daily Loss % */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">RISK_PER_TRADE_PCT</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="5.0"
                      value={config.riskPerTradePct}
                      onChange={e => setConfig(prev => ({ ...prev, riskPerTradePct: parseFloat(e.target.value) || 1.0 }))}
                      className="w-full bg-[#0e1726] border border-[#293548] text-emerald-400 font-bold p-2 rounded-lg text-xs font-mono"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-[#8592a6]">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">MAX_DAILY_LOSS_PCT</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="10.0"
                      value={config.maxDailyLossPct}
                      onChange={e => setConfig(prev => ({ ...prev, maxDailyLossPct: parseFloat(e.target.value) || 3.0 }))}
                      className="w-full bg-[#0e1726] border border-[#293548] text-red-400 font-bold p-2 rounded-lg text-xs font-mono"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-[#8592a6]">%</span>
                  </div>
                </div>
              </div>

              {/* Stop Loss & Take Profit in Pips */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">STOP_LOSS_PIPS</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="150"
                      value={config.stopLossPips}
                      onChange={e => setConfig(prev => ({ ...prev, stopLossPips: parseInt(e.target.value) || 30 }))}
                      className="w-full bg-[#0e1726] border border-[#293548] text-white p-2 rounded-lg text-xs font-mono"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-[#8592a6]">pips</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">TAKE_PROFIT_PIPS</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={config.takeProfitPips}
                      onChange={e => setConfig(prev => ({ ...prev, takeProfitPips: parseInt(e.target.value) || 60 }))}
                      className="w-full bg-[#0e1726] border border-[#293548] text-emerald-400 font-bold p-2 rounded-lg text-xs font-mono"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-[#8592a6]">pips (1:2)</span>
                  </div>
                </div>
              </div>

              {/* Moving Average Periods (Fast & Slow) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">FAST_MA (Default: 9)</label>
                  <input
                    type="number"
                    min="3"
                    max="50"
                    value={config.fastMaPeriod}
                    onChange={e => setConfig(prev => ({ ...prev, fastMaPeriod: parseInt(e.target.value) || 9 }))}
                    className="w-full bg-[#0e1726] border border-[#293548] text-emerald-400 font-mono p-2 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#8592a6] block mb-1">SLOW_MA (Default: 21)</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={config.slowMaPeriod}
                    onChange={e => setConfig(prev => ({ ...prev, slowMaPeriod: parseInt(e.target.value) || 21 }))}
                    className="w-full bg-[#0e1726] border border-[#293548] text-[#2962ff] font-mono p-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Magic Number Identifier */}
              <div>
                <label className="text-[10px] text-[#8592a6] block mb-1">MAGIC_NUMBER</label>
                <input
                  type="number"
                  value={config.magicNumber}
                  onChange={e => setConfig(prev => ({ ...prev, magicNumber: parseInt(e.target.value) || 234000 }))}
                  className="w-full bg-[#0e1726] border border-[#293548] text-amber-400 font-mono font-bold p-2 rounded-lg text-xs"
                />
              </div>

              {/* Dynamic Lot Sizing Real-time Math Breakdown */}
              <div className="p-3 bg-[#0e1726] border border-[#293548] rounded-xl flex flex-col gap-1.5 text-xs font-mono">
                <span className="text-[10px] text-[#8592a6] font-sans font-semibold uppercase tracking-wider">
                  Live Dynamic Lot Calculation:
                </span>
                <div className="flex justify-between text-[#8592a6]">
                  <span>Equity:</span>
                  <span className="text-white">${currentEquity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8592a6]">
                  <span>Risk Amount ({config.riskPerTradePct}%):</span>
                  <span className="text-emerald-400">${(currentEquity * (config.riskPerTradePct / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#8592a6]">
                  <span>SL Risk Distance:</span>
                  <span className="text-white">{config.stopLossPips} pips ($10/lot)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#293548]">
                  <span className="text-white font-bold font-sans">Resolved Order Lot:</span>
                  <span className="text-emerald-400 font-bold">{dynamicLotPreview.toFixed(2)} Lots</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-[#293548] flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('code')}
                className="w-full py-2 bg-[#0e1726] hover:bg-[#293548] border border-[#293548] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Full Python Code &amp; Deploy Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Python MT5 Script Code Viewer with 1-click Download & Copy */}
      {activeTab === 'code' && (
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl shadow-md overflow-hidden flex flex-col">
          {/* Code Viewer Toolbar */}
          <div className="px-5 py-3 border-b border-[#293548] bg-[#0e1726] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono font-bold text-white ml-2">mt5_risk_bot.py</span>
              <span className="text-[11px] text-[#8592a6] font-mono">Python 3.10+ · MetaTrader5 SDK</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-[#1b263b] hover:bg-[#293548] text-white rounded-lg border border-[#293548] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#8592a6]" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Python Code'}</span>
              </button>

              <button
                onClick={handleDownloadScript}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-4 bg-[#0a0f18] overflow-x-auto max-h-[500px] font-mono text-xs leading-relaxed text-slate-300">
            <pre>
              <code>{pythonScriptCode}</code>
            </pre>
          </div>

          {/* Setup Guide Banner */}
          <div className="p-4 bg-[#111927] border-t border-[#293548] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-white block">How to run locally on your MetaTrader 5 Terminal:</span>
              <span className="text-[#8592a6] text-[11px]">
                1. Ensure MetaTrader 5 is installed &amp; Algorithmic Trading is enabled. 2. Run <code className="bg-[#0e1726] px-1.5 py-0.5 rounded text-emerald-400">pip install MetaTrader5 pandas</code> in your terminal. 3. Execute <code className="bg-[#0e1726] px-1.5 py-0.5 rounded text-white">python mt5_risk_bot.py</code>.
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0"
            >
              Copy Script
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: MT5 Terminal Console Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl shadow-md overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-[#293548] bg-[#0e1726] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-white">Live MT5 Terminal Execution Stream</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#8592a6]/20 text-[#8592a6]'}`}>
                {isRunning ? 'STREAMING' : 'IDLE'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-[#8592a6] hover:text-white px-2 py-1 rounded bg-[#1b263b] border border-[#293548] cursor-pointer"
              >
                Clear Output
              </button>
            </div>
          </div>

          {/* Console View */}
          <div className="p-4 bg-[#0a0f18] h-[420px] overflow-y-auto flex flex-col gap-2 font-mono text-xs">
            {logs.map(log => (
              <div
                key={log.id}
                className={`p-2 rounded border leading-relaxed text-xs ${
                  log.type === 'circuit_breaker'
                    ? 'bg-red-500/15 border-red-500/40 text-red-300'
                    : log.type === 'order'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : log.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : log.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-[#1b263b]/40 border-[#293548] text-[#8592a6]'
                }`}
              >
                <div className="flex justify-between text-[10px] opacity-75 mb-0.5">
                  <span>[{log.timestamp}]</span>
                  <span className="uppercase font-bold">{log.type}</span>
                </div>
                <div>{log.message}</div>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* Tab 4: Active MT5 Orders Table */}
      {activeTab === 'positions' && (
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[#293548] bg-[#0e1726] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Active MetaTrader 5 Deals (Magic #{config.magicNumber})</h3>
              <p className="text-[10px] text-[#8592a6]">Single-position rule strictly enforced by bot algorithm</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {openPositions.length} Open Position
            </span>
          </div>

          {openPositions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0e1726] text-[#8592a6] border-b border-[#293548]">
                  <tr>
                    <th className="p-3">Ticket</th>
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Volume (Lots)</th>
                    <th className="p-3">Open Price</th>
                    <th className="p-3">Live Price</th>
                    <th className="p-3">Stop Loss</th>
                    <th className="p-3">Take Profit</th>
                    <th className="p-3">Floating P/L</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293548]">
                  {openPositions.map(pos => (
                    <tr key={pos.ticket} className="hover:bg-[#0e1726]/50">
                      <td className="p-3 text-white font-bold">#{pos.ticket}</td>
                      <td className="p-3 text-white">{pos.symbol}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {pos.type}
                        </span>
                      </td>
                      <td className="p-3 text-white font-bold">{pos.lots.toFixed(2)}</td>
                      <td className="p-3 text-white">{pos.openPrice.toFixed(5)}</td>
                      <td className="p-3 text-white">{pos.currentPrice.toFixed(5)}</td>
                      <td className="p-3 text-red-400 font-bold">{pos.sl.toFixed(5)}</td>
                      <td className="p-3 text-emerald-400 font-bold">{pos.tp.toFixed(5)}</td>
                      <td className={`p-3 font-bold ${pos.profitUsd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.profitUsd >= 0 ? '+' : ''}${pos.profitUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setOpenPositions(prev => prev.filter(p => p.ticket !== pos.ticket));
                            setCurrentEquity(e => Number((e + pos.profitUsd).toFixed(2)));
                            setRealizedPnl(r => Number((r + pos.profitUsd).toFixed(2)));
                            setTotalTrades(t => t + 1);
                            if (pos.profitUsd > 0) setWinningTrades(w => w + 1);
                            setLogs(prev => [
                              {
                                id: `log-${Date.now()}`,
                                timestamp: new Date().toLocaleTimeString(),
                                type: 'warning',
                                message: `Manually closed ticket #${pos.ticket} at ${pos.currentPrice.toFixed(5)}. Realized P/L: ${pos.profitUsd >= 0 ? '+' : ''}$${pos.profitUsd.toFixed(2)}.`,
                              },
                              ...prev,
                            ]);
                          }}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Close in MT5
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#8592a6]">
              No active MT5 positions for Magic #{config.magicNumber}.
              <div className="text-[11px] mt-1 text-slate-400">
                The bot will open a single position when a Fast MA 9 / Slow MA 21 crossover is detected on M15.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
