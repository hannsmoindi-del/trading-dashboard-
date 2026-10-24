import React, { useEffect } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { MessageSquare, X, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';

export const MpesaSmsToast: React.FC = () => {
  const { latestMpesaSms, clearMpesaSms } = useDeriv();

  useEffect(() => {
    if (!latestMpesaSms) return;
    const timer = setTimeout(() => {
      clearMpesaSms();
    }, 8000);
    return () => clearTimeout(timer);
  }, [latestMpesaSms, clearMpesaSms]);

  if (!latestMpesaSms) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full p-4 bg-[#0a121e] border-2 border-[#00c853] rounded-2xl shadow-2xl text-white animate-in slide-in-from-top-4 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00c853] text-black font-extrabold flex items-center justify-center text-xs shrink-0 shadow-md">
            M-PESA
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white">Safaricom M-PESA Alert</span>
              <span className="text-[10px] font-mono font-bold text-[#00c853] bg-[#00c853]/15 px-1.5 py-0.5 rounded">
                {latestMpesaSms.phone}
              </span>
            </div>
            <div className="text-[11px] text-[#8592a6]">Transaction Reflected Instantly</div>
          </div>
        </div>

        <button
          onClick={clearMpesaSms}
          className="text-[#8592a6] hover:text-white p-1 rounded-lg hover:bg-[#1b263b] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 p-3 bg-[#050a12] rounded-xl border border-[#1b263b] text-xs font-mono leading-relaxed text-[#00c853]">
        <div className="text-white font-bold mb-1 flex items-center justify-between">
          <span>Incoming Deposit Received:</span>
          <span className="text-[#00c853] font-bold text-sm">
            +Ksh {latestMpesaSms.amountKes.toLocaleString()}.00
          </span>
        </div>
        <div className="text-[11px] text-gray-300">
          {latestMpesaSms.smsText}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8592a6]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00c853]" />
          Verified by AbePay.com Payment Agent
        </span>
        <span className="text-white font-mono">
          Float: Ksh {latestMpesaSms.balanceKes.toLocaleString()}.00
        </span>
      </div>
    </div>
  );
};
