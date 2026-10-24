import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { ABEPAY_URL, KES_PER_USD } from './AbePayDepositCard';

export const MpesaReflectionWidget: React.FC = () => {
  const {
    accountType,
    setAccountType,
    realAccountId,
    demoAccountId,
    mpesaPrimaryPhone,
    mpesaSecondaryPhone,
    mpesaBalanceKes,
    mpesaReceipts,
    depositViaAbePayMpesa,
  } = useDeriv();

  const [activePhone, setActivePhone] = useState<string>(mpesaPrimaryPhone);
  const [copied, setCopied] = useState<string | null>(null);
  const [testAmountUsd, setTestAmountUsd] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleQuickDeposit = (usd: number) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      depositViaAbePayMpesa(activePhone, usd, undefined, accountType);
    }, 600);
  };

  const isReal = accountType === 'real';

  return (
    <div className="bg-[#111927] border border-[#26354a] rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#00c853]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26354a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00c853]/15 border border-[#00c853]/30 flex items-center justify-center text-[#00c853] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Live M-Pesa Reflection Terminal
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#00c853] bg-[#00c853]/15 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] animate-pulse" />
                Live Float
              </span>
            </div>
            <p className="text-xs text-[#8592a6]">
              All deposits sent to <strong className="text-white font-mono">{activePhone}</strong> via{' '}
              <a href={ABEPAY_URL} target="_blank" rel="noopener noreferrer" className="text-[#2962ff] hover:underline">
                AbePay.com
              </a>{' '}
              reflect here instantly
            </p>
          </div>
        </div>

        {/* Real / Demo Target Account Selector */}
        <div className="flex items-center gap-1.5 bg-[#0e1726] p-1 rounded-xl border border-[#293548] text-xs">
          <span className="text-[11px] text-[#8592a6] px-2 hidden sm:inline">Deposit Destination:</span>
          <button
            type="button"
            onClick={() => setAccountType('real')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              isReal
                ? 'bg-[#ff444f] text-white shadow-sm'
                : 'text-[#8592a6] hover:text-white'
            }`}
          >
            Real ({realAccountId})
          </button>
          <button
            type="button"
            onClick={() => setAccountType('demo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              !isReal
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-[#8592a6] hover:text-white'
            }`}
          >
            Demo ({demoAccountId})
          </button>
        </div>
      </div>

      {/* Phone Selection & Float Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Active M-Pesa Number Card */}
        <div className="bg-[#151e2e] border border-[#293548] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8592a6] mb-1.5">
              <span>Selected M-Pesa Deposit Number</span>
              <span className="text-[#00c853] font-bold text-[10px] bg-[#00c853]/10 px-2 py-0.5 rounded">
                Safaricom / Airtel
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setActivePhone(mpesaPrimaryPhone)}
                className={`flex-1 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  activePhone === mpesaPrimaryPhone
                    ? 'bg-[#1b263b] border-[#00c853] shadow-xs'
                    : 'bg-[#0e1726] border-[#293548] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] text-[#00c853] font-bold uppercase">Primary</div>
                <div className="font-mono font-bold text-white text-sm">{mpesaPrimaryPhone}</div>
              </button>

              <button
                type="button"
                onClick={() => setActivePhone(mpesaSecondaryPhone)}
                className={`flex-1 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  activePhone === mpesaSecondaryPhone
                    ? 'bg-[#1b263b] border-[#2962ff] shadow-xs'
                    : 'bg-[#0e1726] border-[#293548] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] text-[#2962ff] font-bold uppercase">Secondary</div>
                <div className="font-mono font-bold text-white text-sm">{mpesaSecondaryPhone}</div>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#293548] flex items-center justify-between">
            <span className="text-xs text-[#8592a6]">Account ID to reference:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-white text-xs bg-[#0e1726] px-2 py-0.5 rounded border border-[#293548]">
                {isReal ? realAccountId : demoAccountId}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(isReal ? realAccountId : demoAccountId, 'acc-copy')}
                className="p-1 text-[#8592a6] hover:text-white"
                title="Copy Reference"
              >
                {copied === 'acc-copy' ? <Check className="w-3 h-3 text-[#00c853]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live M-Pesa Float Balance Card */}
        <div className="bg-[#151e2e] border border-[#293548] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8592a6] mb-1">
              <span>Live Float on {activePhone}</span>
              <span className="text-[11px] font-mono text-[#00c853]">Updated Real-time</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#00c853] tracking-tight">
              Ksh {mpesaBalanceKes.toLocaleString()}.00
            </div>
            <div className="text-xs text-[#8592a6] mt-1 flex items-center gap-1">
              <span>≈ ${(mpesaBalanceKes / KES_PER_USD).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD Float</span>
              <span>•</span>
              <span className="text-[#00c853]">Linked to AbePay</span>
            </div>
          </div>

          {/* Quick Instant Test Reflection Buttons */}
          <div className="mt-3 pt-3 border-t border-[#293548]">
            <div className="text-[11px] text-[#8592a6] mb-1.5 flex items-center justify-between">
              <span>Simulate Live Deposit to Reflect:</span>
              <span className="text-[#00c853] text-[10px]">Instant SMS</span>
            </div>
            <div className="flex items-center gap-2">
              {[10, 20, 50, 100].map(usd => (
                <button
                  key={usd}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleQuickDeposit(usd)}
                  className="flex-1 py-1.5 bg-[#0e1726] hover:bg-[#293548] border border-[#293548] hover:border-[#00c853] rounded text-xs font-mono font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                  title={`Deposit $${usd} (${Math.round(usd * KES_PER_USD).toLocaleString()} KES)`}
                >
                  +${usd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live M-Pesa Statements / Incoming Transaction SMS Feed */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[#8592a6] mb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00c853]" />
            Recent Incoming M-Pesa Reflection Feed ({activePhone}):
          </span>
          <span className="text-[11px]">Safaricom M-Pesa Gateway</span>
        </div>

        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {mpesaReceipts.slice(0, 4).map((rcpt, idx) => (
            <div
              key={rcpt.code + idx}
              className="bg-[#0e1726] border border-[#293548] hover:border-[#00c853]/40 rounded-xl p-3 text-xs transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#00c853] bg-[#00c853]/10 px-1.5 py-0.5 rounded text-[11px]">
                    {rcpt.code}
                  </span>
                  <span className="text-white font-mono font-semibold">
                    +Ksh {rcpt.amountKes.toLocaleString()}.00
                  </span>
                  <span className="text-[#8592a6] font-mono text-[11px]">
                    (+${rcpt.amountUsd.toFixed(2)} USD)
                  </span>
                </div>
                <span className="text-[10px] text-[#8592a6]">{rcpt.timestamp}</span>
              </div>
              <p className="text-[11px] text-[#8592a6] font-mono leading-relaxed bg-[#111927] p-2 rounded border border-[#1b263b]">
                {rcpt.smsText}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
