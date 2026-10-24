import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { ArrowDownLeft, ArrowUpRight, DollarSign, RotateCcw, ShieldCheck } from 'lucide-react';

export const WalletView: React.FC = () => {
  const {
    cashBalance,
    freeMargin,
    marginUsed,
    totalEquity,
    depositFunds,
    withdrawFunds,
    resetDemoAccount,
    transactions,
  } = useTrading();

  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('1000');
  const [actionTab, setActionTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (!val || val <= 0) return;
    depositFunds(val);
    setMessage({ text: `Successfully deposited $${val.toLocaleString()}`, type: 'success' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (!val || val <= 0) return;
    const res = withdrawFunds(val);
    if (res.success) {
      setMessage({ text: `Withdrawal of $${val.toLocaleString()} submitted`, type: 'success' });
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Wallet & Funding</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your trading capital, instant demo faucet deposits, and view full transaction receipts.
          </p>
        </div>
        <button
          onClick={resetDemoAccount}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Balance</span>
        </button>
      </div>

      {/* Balances Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Total Account Equity</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Net asset liquidation value</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Free Available Cash</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for withdrawals or trading</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Active Position Margin</div>
          <div className="text-2xl font-bold font-mono text-slate-300 mt-2">
            ${marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Locked in live market orders</div>
        </div>
      </div>

      {/* Main Grid: Faucet / Transfer + Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit / Withdraw Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            {/* Action Segmented Control */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs mb-4">
              <button
                onClick={() => setActionTab('deposit')}
                className={`py-2 font-semibold rounded-md transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  actionTab === 'deposit' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Deposit Funds
              </button>
              <button
                onClick={() => setActionTab('withdraw')}
                className={`py-2 font-semibold rounded-md transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  actionTab === 'withdraw' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Withdraw
              </button>
            </div>

            {message && (
              <div className={`p-2.5 rounded-lg text-xs mb-3 font-medium ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message.text}
              </div>
            )}

            {actionTab === 'deposit' ? (
              <form onSubmit={handleDeposit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Select Instant Faucet Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 5000, 10000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt.toString())}
                        className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                          depositAmount === amt.toString()
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        +${amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Custom Deposit (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="1000.00"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs pl-7 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant demo faucet credits simulator. Adds virtual capital directly to your margin balance.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
                >
                  Deposit Test Funds
                </button>
              </form>
            ) : (
              <form onSubmit={handleWithdraw} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-slate-400">Withdrawal Amount</label>
                    <span className="text-slate-400 font-mono">Max: ${freeMargin.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="1"
                      max={freeMargin}
                      step="any"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder="500.00"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs pl-7 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Destination Account</label>
                  <input
                    type="text"
                    disabled
                    value="Apex Bank Wire (Routing: ••••4921)"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 text-xs px-3 py-2 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm"
                >
                  Simulate Withdrawal
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100">Transaction History</h3>
            <span className="text-xs text-slate-400 font-mono">{transactions.length} records</span>
          </div>

          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Date & Time</th>
                    <th className="py-2.5 px-3 text-center font-sans">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map(tx => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-sans font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                            tx.type === 'withdraw' ? 'bg-blue-500/20 text-blue-400' :
                            tx.type === 'trade_profit' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-sans">
                          {tx.note}
                        </td>
                        <td className={`py-3 px-3 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                          {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-3 text-center font-sans">
                          <span className="text-[11px] text-emerald-400">Completed</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400 font-sans">
                <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transaction records yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
