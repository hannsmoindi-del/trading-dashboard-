import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { DerivNavTab } from '../layout/DerivSidebar';
import { PortfolioHeatmap } from './PortfolioHeatmap';
import {
  TrendingUp,
  Layers,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Copy,
  Check,
  UserPlus,
  Zap
} from 'lucide-react';
import {
  ABEPAY_PRIMARY_PHONE,
  ABEPAY_SECONDARY_PHONE,
  ABEPAY_URL
} from '../cashier/AbePayDepositCard';

interface DerivDashboardViewProps {
  onNavigateTab: (tab: DerivNavTab) => void;
  onLaunchDTrader: () => void;
}

export const DerivDashboardView: React.FC<DerivDashboardViewProps> = ({
  onNavigateTab,
  onLaunchDTrader,
}) => {
  const {
    accountType,
    setAccountType,
    realAccountId,
    demoAccountId,
    mpesaBalanceKes,
    balances,
    deposit,
    withdraw,
    transfer,
    transactions,
    currentRsi,
    selectedAsset,
    isBotRunning,
    toggleBot,
    botProfit,
    botRuns,
    botWins,
    user,
    openAuthModal,
  } = useDeriv();

  // Cashier module local state
  const [cashierTab, setCashierTab] = useState<'deposit' | 'withdrawal' | 'transfer'>('deposit');
  const [gateway, setGateway] = useState<string>('AbePay.com M-Pesa (0119437680 / 0103942534)');
  const [amountInput, setAmountInput] = useState<string>('500.00');
  const [transferFrom, setTransferFrom] = useState<keyof typeof balances>('usdReal');
  const [transferTo, setTransferTo] = useState<keyof typeof balances>('mt5Derived');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Activity filter state
  const [activityFilter, setActivityFilter] = useState<'All' | 'Deposits' | 'Withdrawals' | 'Trades'>('All');

  const handleCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const num = parseFloat(amountInput);

    if (!num || num <= 0) {
      setStatusMsg({ text: 'Please enter a valid amount greater than $0', error: true });
      return;
    }

    if (cashierTab === 'deposit') {
      const res = deposit(gateway, num);
      if (res.success) {
        setStatusMsg({ text: `Successfully credited +$${num.toFixed(2)} to USD Real Wallet` });
      }
    } else if (cashierTab === 'withdrawal') {
      const res = withdraw(gateway, num);
      if (res.success) {
        setStatusMsg({ text: `Withdrawal request for -$${num.toFixed(2)} processed successfully` });
      } else {
        setStatusMsg({ text: res.message, error: true });
      }
    } else if (cashierTab === 'transfer') {
      const res = transfer(transferFrom, transferTo, num);
      if (res.success) {
        setStatusMsg({ text: `Successfully transferred $${num.toFixed(2)}` });
      } else {
        setStatusMsg({ text: res.message, error: true });
      }
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activityFilter === 'All') return true;
    if (activityFilter === 'Deposits') return t.type === 'Deposit';
    if (activityFilter === 'Withdrawals') return t.type === 'Withdrawal';
    if (activityFilter === 'Trades') return t.type === 'CFD Trade P/L' || t.type === 'DBot Trade P/L' || t.type === 'Options Contract';
    return true;
  });

  const isRsiConditionMet = currentRsi <= 30;

  return (
    <div className="p-6 sm:p-9 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Onboarding Account Banner if Guest */}
      {!user && (
        <div className="bg-gradient-to-r from-[#1b263b] via-[#162235] to-[#121c2c] border border-[#ff444f]/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ff444f]/15 border border-[#ff444f]/30 flex items-center justify-center text-[#ff444f] shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Create Your Trading Account to Start Trading
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30">
                  Real & Demo Ready
                </span>
              </div>
              <p className="text-xs text-[#8592a6] mt-1 max-w-2xl leading-relaxed">
                Create an account to execute contracts, trade synthetic volatility indices, or practice with a <strong className="text-white">$10,000 Demo Account</strong>. Direct M-Pesa & AbePay deposits reflect live on <strong className="text-white font-mono">0119437680</strong> and <strong className="text-white font-mono">0103942534</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAuthModal('register', 'Start Trading on Deriv Hub')}
              className="px-4 py-2.5 bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-[#00c853]/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2.5 bg-[#1b263b] hover:bg-[#293548] text-white font-semibold text-xs rounded-xl border border-[#293548] transition-colors cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Trader Hub Platform Cards */}
      <div>
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Trading Ecosystem & Platforms
          </h2>
          <span className="text-xs text-[#8592a6] hidden sm:inline">
            Choose your preferred Deriv execution environment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Platform Card 1: DTrader */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-[#ff444f]/40 transition-all shadow-md group">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ff444f]/15 text-[#ff444f]">
                  Deriv Web
                </span>
                <span className="text-[11px] text-[#00c853] font-mono">Popular</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1 group-hover:text-[#ff444f] transition-colors">
                Deriv DTrader
              </h4>
              <p className="text-xs text-[#8592a6] leading-relaxed">
                Options & Multipliers. Clean browser interface with advanced visual charts, fast order barrier execution, and up to x100 multiplier leverage.
              </p>
            </div>
            <button
              onClick={() => {
                onLaunchDTrader();
              }}
              className="w-full text-center py-2.5 px-4 rounded-lg border border-[#ff444f] text-[#ff444f] hover:bg-[#ff444f] hover:text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Launch DTrader</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Platform Card 2: Deriv MT5 */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-[#2962ff]/40 transition-all shadow-md group">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#2962ff]/15 text-[#2962ff]">
                  MetaTrader 5
                </span>
                <span className="text-[11px] text-[#8592a6] font-mono">1:1000 Max</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1 group-hover:text-[#2962ff] transition-colors">
                Deriv MT5
              </h4>
              <p className="text-xs text-[#8592a6] leading-relaxed">
                Advanced CFDs. Professional multi-asset terminal with automated technical indicators, synthetic 24/7 volatility indices, and tight spreads.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('platforms')}
              className="w-full text-center py-2.5 px-4 rounded-lg border border-[#2962ff] text-[#2962ff] hover:bg-[#2962ff] hover:text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Open MT5 Account</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Platform Card 3: Deriv DBot */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-[#00c853]/40 transition-all shadow-md group">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#00c853]/15 text-[#00c853]">
                  Code-Free Bot
                </span>
                <span className="text-[11px] text-[#00c853] font-mono">Automated</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1 group-hover:text-[#00c853] transition-colors">
                Deriv DBot
              </h4>
              <p className="text-xs text-[#8592a6] leading-relaxed">
                Automated Strategy Builder. Drag-and-drop code-free bot execution blocks with built-in money management and martingale multipliers.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('dbot')}
              className="w-full text-center py-2.5 px-4 rounded-lg border border-[#00c853] text-[#00c853] hover:bg-[#00c853] hover:text-white font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Configure DBot</span>
              <Bot className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Platform Card 4: MT5 Python Bot (Risk-Managed Forex) */}
          <div className="bg-[#1b263b] border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-emerald-500 transition-all shadow-md group bg-gradient-to-b from-[#1b263b] to-emerald-950/20">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Python 3.10+
                </span>
                <span className="text-[11px] text-amber-400 font-mono">Magic #234000</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                MT5 Python Bot
              </h4>
              <p className="text-xs text-[#8592a6] leading-relaxed">
                Risk-Managed Forex. EUR/USD M15 MA Crossover with dynamic lot calculation and 3.0% daily drawdown circuit breaker protection.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('mt5bot')}
              className="w-full text-center py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <span>Launch Python Bot</span>
              <Zap className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Portfolio Performance Heatmap */}
      <PortfolioHeatmap
        onSelectAssetForTrade={(assetId) => {
          onLaunchDTrader();
        }}
        onNavigatePlatforms={onLaunchDTrader}
      />

      {/* Section 3: Wallet Operations & Cashier Flow (Grid 2fr 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashier Deposit / Withdrawal Module (2 columns wide) */}
        <div className="lg:col-span-2 bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Wallet Cashier System</h3>
                <p className="text-xs text-[#8592a6]">Manage deposits, withdrawals, and inter-platform fund transfers</p>
              </div>
              <span className="text-xs font-mono text-[#00c853] bg-[#00c853]/10 border border-[#00c853]/30 px-2.5 py-1 rounded-full">
                0% Fee Guarantee
              </span>
            </div>

            {/* Cashier Tabs */}
            <div className="flex gap-2.5 mb-5">
              {(['deposit', 'withdrawal', 'transfer'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setCashierTab(tab);
                    setStatusMsg(null);
                  }}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    cashierTab === tab
                      ? 'bg-[#ff444f] text-white shadow-sm border border-[#ff444f]'
                      : 'bg-[#0e1726] border border-[#293548] text-[#8592a6] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Real vs Demo Account Indicator & Switcher */}
            <div className="flex items-center justify-between p-2.5 mb-4 rounded-xl bg-[#0e1726] border border-[#293548] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#8592a6]">Active Account:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${accountType === 'real' ? 'bg-[#00c853]' : 'bg-[#2962ff]'}`} />
                  {accountType === 'real' ? `Real (${realAccountId})` : `Demo (${demoAccountId})`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAccountType(accountType === 'real' ? 'demo' : 'real')}
                  className="px-2.5 py-1 rounded bg-[#1b263b] hover:bg-[#202e47] border border-[#293548] text-[#8592a6] hover:text-white font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Switch to {accountType === 'real' ? 'Demo' : 'Real'}
                </button>
              </div>
            </div>

            {/* AbePay Official Numbers Spotlight Card */}
            <div className="mb-4 p-3 rounded-xl bg-[#0e1726] border border-[#293548] text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#00c853]" />
                  AbePay Deposit Numbers:
                </span>
                <a
                  href={ABEPAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2962ff] hover:underline font-bold text-[11px] flex items-center gap-0.5"
                >
                  abepay.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between bg-[#111927] p-2 rounded-lg border border-[#293548]">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#00c853]">Primary No.</div>
                    <div className="font-mono font-bold text-white text-xs">{ABEPAY_PRIMARY_PHONE}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) navigator.clipboard.writeText(ABEPAY_PRIMARY_PHONE);
                      setCopiedNumber(ABEPAY_PRIMARY_PHONE);
                      setTimeout(() => setCopiedNumber(null), 2000);
                    }}
                    className="p-1 rounded hover:bg-[#293548] text-[#8592a6] hover:text-white cursor-pointer"
                    title="Copy 0119437680"
                  >
                    {copiedNumber === ABEPAY_PRIMARY_PHONE ? <Check className="w-3.5 h-3.5 text-[#00c853]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#111927] p-2 rounded-lg border border-[#293548]">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#2962ff]">Secondary No.</div>
                    <div className="font-mono font-bold text-white text-xs">{ABEPAY_SECONDARY_PHONE}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) navigator.clipboard.writeText(ABEPAY_SECONDARY_PHONE);
                      setCopiedNumber(ABEPAY_SECONDARY_PHONE);
                      setTimeout(() => setCopiedNumber(null), 2000);
                    }}
                    className="p-1 rounded hover:bg-[#293548] text-[#8592a6] hover:text-white cursor-pointer"
                    title="Copy 0103942534"
                  >
                    {copiedNumber === ABEPAY_SECONDARY_PHONE ? <Check className="w-3.5 h-3.5 text-[#00c853]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-[#8592a6] flex items-center justify-between">
                <span>Reflects on M-Pesa float: <strong className="text-[#00c853] font-mono">Ksh {mpesaBalanceKes.toLocaleString()}</strong></span>
                <span className="text-[#00c853] font-semibold">0% Free Fee</span>
              </div>
            </div>

            <form onSubmit={handleCashierSubmit} className="flex flex-col gap-4">
              {cashierTab !== 'transfer' ? (
                <>
                  {/* Select Payment Gateway */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#8592a6]">Select Payment Gateway</label>
                    <select
                      value={gateway}
                      onChange={e => setGateway(e.target.value)}
                      className="bg-[#0e1726] border border-[#293548] text-white p-3 rounded-lg text-sm focus:outline-none focus:border-[#ff444f] transition-colors"
                    >
                      <option>AbePay.com M-Pesa (0119437680 / 0103942534)</option>
                      <option>Credit / Debit Card (Visa/Mastercard)</option>
                      <option>Cryptocurrency (Tether TRC20 / BTC)</option>
                      <option>E-Wallet (Sticpay / Skrill / Neteller)</option>
                      <option>Deriv Peer-to-Peer (P2P)</option>
                    </select>
                  </div>

                  {/* Amount (USD) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-[#8592a6]">Amount (USD)</label>
                      <span className="text-[#8592a6] font-mono">
                        Available: ${balances.usdReal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-[#8592a6] text-sm font-mono">$</span>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        value={amountInput}
                        onChange={e => setAmountInput(e.target.value)}
                        placeholder="Enter amount e.g. 500.00"
                        className="w-full bg-[#0e1726] border border-[#293548] text-white pl-8 pr-4 py-3 rounded-lg text-sm font-mono focus:outline-none focus:border-[#ff444f] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8592a6]">Quick Select:</span>
                    {[100, 250, 500, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmountInput(val.toFixed(2))}
                        className="px-2.5 py-1 bg-[#0e1726] hover:bg-[#293548] border border-[#293548] text-[#8592a6] hover:text-white rounded text-xs font-mono transition-colors cursor-pointer"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Transfer Mode */
                <div className="flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#8592a6]">Transfer From</label>
                      <select
                        value={transferFrom}
                        onChange={e => setTransferFrom(e.target.value as any)}
                        className="bg-[#0e1726] border border-[#293548] text-white p-2.5 rounded-lg text-xs"
                      >
                        <option value="usdReal">USD Real Wallet (${balances.usdReal.toLocaleString()})</option>
                        <option value="mt5Derived">MT5 Derived Account (${balances.mt5Derived.toLocaleString()})</option>
                        <option value="mt5Financial">MT5 Financial Account (${balances.mt5Financial.toLocaleString()})</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#8592a6]">Transfer To</label>
                      <select
                        value={transferTo}
                        onChange={e => setTransferTo(e.target.value as any)}
                        className="bg-[#0e1726] border border-[#293548] text-white p-2.5 rounded-lg text-xs"
                      >
                        <option value="mt5Derived">MT5 Derived Account (${balances.mt5Derived.toLocaleString()})</option>
                        <option value="mt5Financial">MT5 Financial Account (${balances.mt5Financial.toLocaleString()})</option>
                        <option value="usdReal">USD Real Wallet (${balances.usdReal.toLocaleString()})</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#8592a6]">Transfer Amount (USD)</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                      className="bg-[#0e1726] border border-[#293548] text-white p-3 rounded-lg text-sm font-mono focus:outline-none focus:border-[#ff444f]"
                    />
                  </div>
                </div>
              )}

              {statusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    statusMsg.error
                      ? 'bg-[#ff444f]/10 border border-[#ff444f]/30 text-[#ff444f]'
                      : 'bg-[#00c853]/10 border border-[#00c853]/30 text-[#00c853]'
                  }`}
                >
                  {statusMsg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#ff444f] hover:bg-[#ff444f]/90 text-white font-bold py-3 rounded-lg text-sm transition-all cursor-pointer shadow-md shadow-[#ff444f]/20 active:scale-[0.99]"
              >
                Proceed with Transaction
              </button>
            </form>
          </div>
        </div>

        {/* Strategy Pipeline Flowchart Card (1 column wide) */}
        <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Strategy Pipeline Flowchart</h3>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                isRsiConditionMet
                  ? 'bg-[#00c853]/20 text-[#00c853] font-bold border border-[#00c853]/30'
                  : 'bg-[#0e1726] text-[#8592a6]'
              }`}>
                RSI: {currentRsi}
              </span>
            </div>

            {/* Strategy Flow List matching HTML specifications */}
            <div className="flex flex-col gap-2.5">
              {/* Step 1 */}
              <div className="flex items-center justify-between bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <div>
                  <strong className="text-xs text-white block">1. Asset Selection</strong>
                  <p className="text-[11px] text-[#8592a6]">{selectedAsset.name}</p>
                </div>
                <span className="bg-[#2962ff]/15 text-[#2962ff] px-2 py-0.5 rounded text-[11px] font-bold">
                  Step 1
                </span>
              </div>

              {/* Step 2 */}
              <div className={`flex items-center justify-between bg-[#0e1726] p-3 rounded-lg border transition-all ${
                isRsiConditionMet ? 'border-[#00c853]/50 bg-[#00c853]/5' : 'border-[#293548]'
              }`}>
                <div>
                  <strong className="text-xs text-white block">2. Trigger Condition</strong>
                  <p className="text-[11px] text-[#8592a6]">RSI Indicator drops below 30</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isRsiConditionMet ? 'bg-[#00c853] text-black font-extrabold' : 'bg-[#2962ff]/15 text-[#2962ff]'
                }`}>
                  {isRsiConditionMet ? 'TRIGGERED' : 'Logic'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <div>
                  <strong className="text-xs text-white block">3. Risk Management</strong>
                  <p className="text-[11px] text-[#8592a6]">Take Profit: $50 | Stop Loss: $20</p>
                </div>
                <span className="bg-[#2962ff]/15 text-[#2962ff] px-2 py-0.5 rounded text-[11px] font-bold">
                  Safety
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex items-center justify-between bg-[#0e1726] p-3 rounded-lg border border-[#293548]">
                <div>
                  <strong className="text-xs text-white block">4. Automated Execution</strong>
                  <p className="text-[11px] text-[#8592a6]">DBot executes 'Rise/Fall' contract</p>
                </div>
                <span className="bg-[#00c853]/15 text-[#00c853] px-2 py-0.5 rounded text-[11px] font-bold">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Bot Simulation Trigger Button */}
          <div className="mt-4 pt-4 border-t border-[#293548]">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[#8592a6]">Bot Engine Status:</span>
              <span className={`font-mono font-bold ${isBotRunning ? 'text-[#00c853]' : 'text-[#8592a6]'}`}>
                {isBotRunning ? 'RUNNING (Auto Trade)' : 'IDLE'}
              </span>
            </div>

            {isBotRunning && (
              <div className="mb-2 p-2 bg-[#0e1726] rounded border border-[#293548] text-[11px] flex justify-between">
                <span className="text-[#8592a6]">Runs: <span className="text-white font-mono">{botRuns}</span></span>
                <span className="text-[#8592a6]">Wins: <span className="text-[#00c853] font-mono">{botWins}</span></span>
                <span className="text-[#8592a6]">P/L: <span className={`font-mono font-bold ${botProfit >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'}`}>
                  {botProfit >= 0 ? '+' : ''}${botProfit.toFixed(2)}
                </span></span>
              </div>
            )}

            <button
              onClick={toggleBot}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isBotRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 shadow-sm'
              }`}
            >
              {isBotRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isBotRunning ? 'Pause Strategy Runner' : 'Simulate Live Strategy Flow'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Recent Transactions History Table */}
      <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Wallet & Trading Activity</h3>
            <p className="text-xs text-[#8592a6]">Real-time audit log of deposits, withdrawals, CFDs, and DBot contracts</p>
          </div>

          {/* Activity Filters */}
          <div className="flex gap-1.5 bg-[#0e1726] p-1 rounded-lg border border-[#293548] text-xs">
            {(['All', 'Deposits', 'Withdrawals', 'Trades'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  activityFilter === f
                    ? 'bg-[#1b263b] text-white shadow-xs'
                    : 'text-[#8592a6] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#293548] text-[#8592a6] text-xs">
                <th className="py-3 px-3 font-semibold">Transaction ID</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Gateway / Platform</th>
                <th className="py-3 px-3 font-semibold">Amount</th>
                <th className="py-3 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293548] text-xs font-mono">
              {filteredTransactions.map(txn => {
                const isPositive = txn.amount >= 0;
                return (
                  <tr key={txn.id} className="hover:bg-[#0e1726]/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {txn.id}
                      <span className="block text-[10px] text-[#8592a6] font-sans">{txn.timestamp}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        txn.type === 'Deposit'
                          ? 'bg-[#00c853]/15 text-[#00c853]'
                          : txn.type === 'Withdrawal'
                          ? 'bg-[#ff444f]/15 text-[#ff444f]'
                          : 'bg-[#2962ff]/15 text-[#2962ff]'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-white">
                      {txn.gateway}
                      {txn.details && (
                        <span className="block text-[11px] text-[#8592a6]">{txn.details}</span>
                      )}
                    </td>
                    <td className={`py-3 px-3 font-bold ${isPositive ? 'text-[#00c853]' : 'text-[#ff444f]'}`}>
                      {isPositive ? '+' : '-'}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        txn.status === 'Successful' || txn.status === 'Closed'
                          ? 'bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30'
                          : txn.status === 'Processing'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-[#ff444f]/15 text-[#ff444f] border border-[#ff444f]/30'
                      }`}>
                        {txn.status}
                      </span>
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
