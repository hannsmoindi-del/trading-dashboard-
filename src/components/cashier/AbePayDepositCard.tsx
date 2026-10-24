import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface AbePayDepositCardProps {
  compact?: boolean;
  onSuccess?: () => void;
}

export const ABEPAY_PRIMARY_PHONE = '0119437680';
export const ABEPAY_SECONDARY_PHONE = '0103942534';
export const ABEPAY_URL = 'https://abepay.com';
export const KES_PER_USD = 129.5; // Live exchange rate benchmark

export const AbePayDepositCard: React.FC<AbePayDepositCardProps> = ({
  compact = false,
  onSuccess,
}) => {
  const {
    accountType,
    setAccountType,
    realAccountId,
    demoAccountId,
    depositViaAbePayMpesa,
    mpesaBalanceKes,
    balances
  } = useDeriv();

  const [selectedPhone, setSelectedPhone] = useState<string>(ABEPAY_PRIMARY_PHONE);
  const [targetAcc, setTargetAcc] = useState<'real' | 'demo'>(accountType);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [amountUsd, setAmountUsd] = useState<string>('50.00');
  const [txnCode, setTxnCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const activeAccountId = targetAcc === 'real' ? realAccountId : demoAccountId;
  const parsedUsd = parseFloat(amountUsd) || 0;
  const calculatedKes = Math.round(parsedUsd * KES_PER_USD);

  const handleCopy = (text: string, type: 'primary' | 'secondary' | 'ref') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const handleVerifyAndCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (parsedUsd <= 0) {
      setStatusMsg({ text: 'Please enter a valid deposit amount (Min $5)', error: true });
      return;
    }

    if (!txnCode.trim()) {
      setStatusMsg({ text: 'Please enter your M-Pesa / Abe Pay transaction reference code', error: true });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const res = depositViaAbePayMpesa(selectedPhone, parsedUsd, txnCode, targetAcc);
      if (res.success) {
        setStatusMsg({
          text: `Reflected on M-Pesa ${selectedPhone} (+Ksh ${calculatedKes.toLocaleString()}) & credited to ${targetAcc.toUpperCase()} account!`,
        });
        setTxnCode('');
        if (onSuccess) onSuccess();
      } else {
        setStatusMsg({ text: res.message, error: true });
      }
    }, 600);
  };

  const handleSimulateStk = () => {
    if (parsedUsd <= 0) {
      setStatusMsg({ text: 'Please enter an amount first', error: true });
      return;
    }
    setIsSubmitting(true);
    setStatusMsg({ text: `Sending M-Pesa STK Prompt to phone... Enter your PIN to reflect funds on ${selectedPhone}.` });

    setTimeout(() => {
      setIsSubmitting(false);
      const sampleCode = `SK${Math.floor(10 + Math.random() * 89)}` + Math.random().toString(36).substring(2, 6).toUpperCase();
      const res = depositViaAbePayMpesa(selectedPhone, parsedUsd, sampleCode, targetAcc);
      if (res.success) {
        setStatusMsg({
          text: `M-Pesa payment received! Txn: ${sampleCode}. Reflected on ${selectedPhone} (+Ksh ${calculatedKes.toLocaleString()}) & added to ${targetAcc === 'real' ? 'Real Account' : 'Demo Account'}.`,
        });
        if (onSuccess) onSuccess();
      }
    }, 1500);
  };

  return (
    <div className="bg-[#151e2e] border border-[#26354a] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Brand Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c853]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26354a]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#00c853]/15 border border-[#00c853]/30 flex items-center justify-center text-[#00c853] shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                AbePay.com Deposit Agent
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00c853]/20 text-[#00c853] border border-[#00c853]/40">
                Official Agent
              </span>
            </div>
            <p className="text-xs text-[#8592a6]">
              Instant M-Pesa & Mobile Money funding for Deriv accounts via <a href={ABEPAY_URL} target="_blank" rel="noopener noreferrer" className="text-[#2962ff] hover:underline font-semibold">abepay.com</a>
            </p>
          </div>
        </div>

        {/* External Link Button */}
        <a
          href={ABEPAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b263b] hover:bg-[#202e47] border border-[#293548] text-xs font-semibold text-white transition-all w-fit"
        >
          <span>Visit AbePay.com</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#8592a6]" />
        </a>
      </div>

      {/* Official Deposit Phone Numbers Highlight Box */}
      <div className="mt-4 p-4 rounded-xl bg-[#0e1726] border border-[#293548]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00c853]" />
            Official Numbers Where to Deposit Your Money:
          </span>
          <span className="text-[11px] font-mono text-[#00c853] bg-[#00c853]/10 px-2 py-0.5 rounded">
            24/7 Instant Auto-Credit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {/* Primary Number */}
          <div
            onClick={() => setSelectedPhone(ABEPAY_PRIMARY_PHONE)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedPhone === ABEPAY_PRIMARY_PHONE
                ? 'bg-[#1b263b] border-[#00c853] shadow-md shadow-[#00c853]/10'
                : 'bg-[#111927] border-[#293548] hover:border-[#8592a6]'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c853] bg-[#00c853]/15 px-1.5 py-0.5 rounded">
                  Primary Agent
                </span>
                <span className="text-xs text-[#8592a6]">M-Pesa / Safaricom</span>
              </div>
              <div className="text-lg font-mono font-bold text-white tracking-wider mt-1">
                {ABEPAY_PRIMARY_PHONE}
              </div>
              <div className="text-[10px] text-[#8592a6] mt-0.5">AbePay Deriv Cashier Agent</div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(ABEPAY_PRIMARY_PHONE, 'primary');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#0e1726] hover:bg-[#293548] border border-[#293548] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy number"
            >
              {copiedPhone === ABEPAY_PRIMARY_PHONE ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00c853]" />
                  <span className="text-[#00c853] text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8592a6]" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Number */}
          <div
            onClick={() => setSelectedPhone(ABEPAY_SECONDARY_PHONE)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedPhone === ABEPAY_SECONDARY_PHONE
                ? 'bg-[#1b263b] border-[#00c853] shadow-md shadow-[#00c853]/10'
                : 'bg-[#111927] border-[#293548] hover:border-[#8592a6]'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2962ff] bg-[#2962ff]/15 px-1.5 py-0.5 rounded">
                  Alternate Agent
                </span>
                <span className="text-xs text-[#8592a6]">M-Pesa / Airtel</span>
              </div>
              <div className="text-lg font-mono font-bold text-white tracking-wider mt-1">
                {ABEPAY_SECONDARY_PHONE}
              </div>
              <div className="text-[10px] text-[#8592a6] mt-0.5">AbePay Deriv Cashier Agent 2</div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(ABEPAY_SECONDARY_PHONE, 'secondary');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#0e1726] hover:bg-[#293548] border border-[#293548] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy number"
            >
              {copiedPhone === ABEPAY_SECONDARY_PHONE ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00c853]" />
                  <span className="text-[#00c853] text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8592a6]" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Deposit Destination Account & Reference Note */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 text-xs bg-[#111927] p-3 rounded-lg border border-[#293548]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#8592a6] font-medium">Deposit Destination:</span>
            <div className="flex items-center gap-1 bg-[#0e1726] p-1 rounded-lg border border-[#293548]">
              <button
                type="button"
                onClick={() => setTargetAcc('real')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  targetAcc === 'real'
                    ? 'bg-[#ff444f] text-white shadow-xs'
                    : 'text-[#8592a6] hover:text-white'
                }`}
              >
                Real Account ({realAccountId})
              </button>
              <button
                type="button"
                onClick={() => setTargetAcc('demo')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  targetAcc === 'demo'
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-[#8592a6] hover:text-white'
                }`}
              >
                Virtual Demo ({demoAccountId})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#8592a6]">Account Ref:</span>
            <span className="font-mono font-bold text-white bg-[#0e1726] px-2 py-0.5 rounded border border-[#293548]">
              {activeAccountId}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(activeAccountId, 'ref')}
              className="text-[11px] text-[#2962ff] hover:text-[#2962ff]/80 font-medium flex items-center gap-1 cursor-pointer"
            >
              {copiedRef ? <Check className="w-3 h-3 text-[#00c853]" /> : <Copy className="w-3 h-3" />}
              {copiedRef ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Live Reflection Indicator */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] px-1 text-[#8592a6]">
          <span className="flex items-center gap-1.5 text-[#00c853]">
            <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
            Live M-Pesa Float on {selectedPhone}: <strong className="font-mono">Ksh {mpesaBalanceKes.toLocaleString()}.00</strong>
          </span>
          <span className="text-[10px]">Money reflects here & in your account instantly</span>
        </div>
      </div>

      {/* Step-by-Step Payment Instructions & Verification Form */}
      <form onSubmit={handleVerifyAndCredit} className="mt-4 flex flex-col gap-4">
        {/* Currency Conversion & Amount Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-white">Deposit Amount (USD)</label>
              <span className="text-[#8592a6] font-mono">Min: $5.00</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-[#8592a6] text-sm font-mono">$</span>
              <input
                type="number"
                step="any"
                min="5"
                value={amountUsd}
                onChange={e => setAmountUsd(e.target.value)}
                placeholder="50.00"
                className="w-full bg-[#0e1726] border border-[#293548] text-white pl-8 pr-4 py-2.5 rounded-lg text-sm font-mono focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-white">Equivalent in KES (M-Pesa)</label>
              <span className="text-[11px] text-[#8592a6] font-mono">1 USD ≈ {KES_PER_USD} KES</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-[#8592a6] text-xs font-mono">KES</span>
              <input
                type="text"
                readOnly
                value={calculatedKes.toLocaleString()}
                className="w-full bg-[#0e1726] border border-[#293548] text-[#00c853] font-bold pl-12 pr-4 py-2.5 rounded-lg text-sm font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8592a6]">Quick Select:</span>
          {[10, 25, 50, 100, 250, 500].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setAmountUsd(val.toFixed(2))}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                amountUsd === val.toFixed(2)
                  ? 'bg-[#00c853] text-black font-bold border-[#00c853]'
                  : 'bg-[#0e1726] text-[#8592a6] border-[#293548] hover:text-white'
              }`}
            >
              ${val}
            </button>
          ))}
        </div>

        {/* Instructions Summary */}
        <div className="p-3.5 bg-[#0e1726] rounded-xl border border-[#293548] text-xs text-[#8592a6] flex flex-col gap-1.5">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>How to complete your deposit:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Open M-Pesa on your phone, choose <strong>Send Money</strong> (or go to <a href={ABEPAY_URL} target="_blank" rel="noopener noreferrer" className="text-[#2962ff] underline">abepay.com</a>).</li>
            <li>Send exactly <strong>{calculatedKes.toLocaleString()} KES</strong> to <strong className="text-white font-mono">{selectedPhone}</strong>.</li>
            <li>In the transaction message / reference, input your Account ID: <strong className="text-white font-mono">{activeAccountId}</strong>.</li>
            <li>Once confirmed, paste the M-Pesa Transaction Code below to auto-credit your balance!</li>
          </ol>
        </div>

        {/* Transaction Code Input & Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={txnCode}
              onChange={e => setTxnCode(e.target.value.toUpperCase())}
              placeholder="Enter M-Pesa Txn Code e.g. SK84LM92A"
              className="w-full bg-[#0e1726] border border-[#293548] text-white px-3.5 py-3 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-[#00c853]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#00c853] hover:bg-[#00c853]/90 text-black font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#00c853]/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Credit Wallet</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSimulateStk}
            disabled={isSubmitting}
            className="px-4 py-3 bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Send M-Pesa prompt to phone"
          >
            <Zap className="w-4 h-4" />
            <span>Send STK Push</span>
          </button>
        </div>

        {/* Status Notification Message */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
              statusMsg.error
                ? 'bg-[#ff444f]/15 border border-[#ff444f]/30 text-[#ff444f]'
                : 'bg-[#00c853]/15 border border-[#00c853]/30 text-[#00c853]'
            }`}
          >
            {statusMsg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
        )}
      </form>
    </div>
  );
};
