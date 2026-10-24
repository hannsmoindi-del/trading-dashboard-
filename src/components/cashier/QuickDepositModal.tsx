import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import {
  X,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Coins,
  CreditCard
} from 'lucide-react';
import {
  ABEPAY_PRIMARY_PHONE,
  ABEPAY_SECONDARY_PHONE,
  ABEPAY_URL,
  KES_PER_USD
} from './AbePayDepositCard';

interface QuickDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickDepositModal: React.FC<QuickDepositModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { deposit } = useDeriv();
  const [gateway, setGateway] = useState('AbePay.com M-Pesa (0119437680 / 0103942534)');
  const [amount, setAmount] = useState('50.00');
  const [copied, setCopied] = useState<string | null>(null);
  const [txnCode, setTxnCode] = useState('');

  if (!isOpen) return null;

  const parsedVal = parseFloat(amount) || 0;
  const calculatedKes = Math.round(parsedVal * KES_PER_USD);

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedVal > 0) {
      const selectedGateway = gateway.includes('AbePay')
        ? `AbePay.com M-Pesa ${txnCode ? `[${txnCode.toUpperCase()}]` : ''}`
        : gateway;
      deposit(selectedGateway, parsedVal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#1b263b] border border-[#293548] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8592a6] hover:text-white p-1 rounded-lg hover:bg-[#0e1726] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#00c853]/20 text-[#00c853] flex items-center justify-center border border-[#00c853]/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Deposit to USD Real Wallet
            </h3>
            <p className="text-xs text-[#8592a6]">Instant zero-fee wallet funding via AbePay & M-Pesa</p>
          </div>
        </div>

        {/* AbePay Official Deposit Numbers Spotlight */}
        <div className="mb-4 p-3.5 rounded-xl bg-[#0e1726] border border-[#293548]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00c853]" />
              Official Deposit Numbers:
            </span>
            <a
              href={ABEPAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2962ff] hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>abepay.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#111927] border border-[#293548] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#00c853] font-bold">M-Pesa Primary</div>
                <div className="font-mono font-bold text-white">{ABEPAY_PRIMARY_PHONE}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ABEPAY_PRIMARY_PHONE, 'modal-p1')}
                className="p-1 rounded hover:bg-[#293548] text-[#8592a6] hover:text-white cursor-pointer"
              >
                {copied === 'modal-p1' ? <Check className="w-3.5 h-3.5 text-[#00c853]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-[#111927] border border-[#293548] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#2962ff] font-bold">M-Pesa Secondary</div>
                <div className="font-mono font-bold text-white">{ABEPAY_SECONDARY_PHONE}</div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ABEPAY_SECONDARY_PHONE, 'modal-p2')}
                className="p-1 rounded hover:bg-[#293548] text-[#8592a6] hover:text-white cursor-pointer"
              >
                {copied === 'modal-p2' ? <Check className="w-3.5 h-3.5 text-[#00c853]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white">Payment Method</label>
            <select
              value={gateway}
              onChange={e => setGateway(e.target.value)}
              className="bg-[#0e1726] border border-[#293548] text-white p-3 rounded-lg text-xs focus:outline-none focus:border-[#00c853]"
            >
              <option>AbePay.com M-Pesa (0119437680 / 0103942534)</option>
              <option>Cryptocurrency (Tether TRC20 / BTC)</option>
              <option>Credit / Debit Card (Visa/Mastercard)</option>
              <option>E-Wallet (Sticpay / Skrill / Neteller)</option>
              <option>Deriv Peer-to-Peer (P2P)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white">Quick Select</label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toFixed(2))}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                    amount === val.toFixed(2)
                      ? 'bg-[#00c853] text-black border-[#00c853]'
                      : 'bg-[#0e1726] text-[#8592a6] border-[#293548] hover:text-white'
                  }`}
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[#8592a6] text-sm font-mono">$</span>
                <input
                  type="number"
                  step="any"
                  min="5"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-[#0e1726] border border-[#293548] text-white pl-8 pr-4 py-2.5 rounded-lg text-sm font-mono focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Approx KES</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[#8592a6] text-xs font-mono">KES</span>
                <input
                  type="text"
                  readOnly
                  value={calculatedKes.toLocaleString()}
                  className="w-full bg-[#0e1726] border border-[#293548] text-[#00c853] font-bold pl-11 pr-4 py-2.5 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {gateway.includes('AbePay') && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">M-Pesa Transaction Code (Optional)</label>
              <input
                type="text"
                value={txnCode}
                onChange={e => setTxnCode(e.target.value.toUpperCase())}
                placeholder="e.g. SK84LM92A"
                className="w-full bg-[#0e1726] border border-[#293548] text-white px-3.5 py-2.5 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-[#00c853]"
              />
            </div>
          )}

          <div className="p-3 bg-[#0e1726] rounded-xl border border-[#293548] text-[11px] text-[#8592a6] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00c853] shrink-0" />
            <span>Instant credit to USD Real Wallet (CR984210) with 0% deposit commission.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#293548]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#8592a6] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-[#00c853] hover:bg-[#00c853]/90 text-black rounded-lg transition-colors cursor-pointer shadow-md shadow-[#00c853]/25"
            >
              Confirm & Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
