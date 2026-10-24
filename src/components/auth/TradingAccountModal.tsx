import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import { AccountType } from '../../types/deriv';
import {
  X,
  UserCheck,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Coins
} from 'lucide-react';

interface TradingAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'register' | 'login';
}

export const TradingAccountModal: React.FC<TradingAccountModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'register',
}) => {
  const {
    user,
    registerAccount,
    loginAccount,
    authPendingIntent,
    mpesaPrimaryPhone,
    mpesaSecondaryPhone,
    setAccountType,
  } = useDeriv();

  const [mode, setMode] = useState<'register' | 'login'>(defaultMode);
  const [preferredAccount, setPreferredAccount] = useState<AccountType>('real');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>(mpesaPrimaryPhone);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [country, setCountry] = useState<string>('Kenya');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync mode with prop when opened
  React.useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrorMsg(null);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter your M-Pesa phone number');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Trading Terms of Service');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const res = registerAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        country,
        preferredAccount,
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email or Account ID');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const res = loginAccount(email.trim(), password);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 500);
  };

  const handleQuickDemoCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      registerAccount({
        fullName: `Demo Trader #${randomNum}`,
        email: `demo_trader_${randomNum}@derivhub.com`,
        phoneNumber: mpesaPrimaryPhone,
        preferredAccount: 'demo',
        country: 'Kenya',
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#111927] border border-[#293548] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-[#1b263b] via-[#162235] to-[#111927] border-b border-[#293548] px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff444f]/15 border border-[#ff444f]/30 flex items-center justify-center text-[#ff444f] shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {mode === 'register' ? 'Create Your Trading Account' : 'Sign In to Trade'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30">
                  Real & Demo Ready
                </span>
              </div>
              <p className="text-xs text-[#8592a6] mt-0.5">
                {mode === 'register'
                  ? 'Access Real Account & $10,000 Demo Account with M-Pesa & AbePay deposits'
                  : 'Welcome back! Enter credentials to access your trading portfolio'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8592a6] hover:text-white rounded-lg hover:bg-[#1b263b] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Trading Action Warning / Prompt */}
        {authPendingIntent && (
          <div className="bg-[#ff444f]/10 border-b border-[#ff444f]/30 px-6 py-2.5 flex items-center gap-2.5 text-xs text-[#ff444f]">
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-[#ff444f]" />
            <div className="flex-1 font-medium">
              <span>Account required to trade: </span>
              <strong className="text-white underline">{authPendingIntent}</strong>.
              <span> Create your account below to execute immediately!</span>
            </div>
          </div>
        )}

        {/* Tab Switcher: Register vs Login */}
        <div className="flex border-b border-[#293548] bg-[#0e1726] text-xs font-semibold p-1">
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#1b263b] text-white shadow-sm font-bold border border-[#293548]'
                : 'text-[#8592a6] hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00c853]" />
            <span>Create Account (Real & Demo)</span>
          </button>
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#1b263b] text-white shadow-sm font-bold border border-[#293548]'
                : 'text-[#8592a6] hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>Sign In to Existing Account</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#ff444f]/10 border border-[#ff444f]/30 rounded-xl text-xs text-[#ff444f] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Account Type Preference Card */}
              <div>
                <label className="text-xs font-semibold text-[#8592a6] block mb-2">
                  Select Starting Account Mode:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPreferredAccount('real')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      preferredAccount === 'real'
                        ? 'bg-[#ff444f]/10 border-[#ff444f] ring-1 ring-[#ff444f]/50'
                        : 'bg-[#1b263b]/60 border-[#293548] hover:border-[#8592a6]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00c853] inline-block animate-ping"></span>
                        Real Account
                      </span>
                      <span className="text-[10px] bg-[#ff444f] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8592a6]">
                      Trade synthetic & forex with live AbePay/M-Pesa deposits & withdrawals.
                    </p>
                  </div>

                  <div
                    onClick={() => setPreferredAccount('demo')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      preferredAccount === 'demo'
                        ? 'bg-[#2962ff]/10 border-[#2962ff] ring-1 ring-[#2962ff]/50'
                        : 'bg-[#1b263b]/60 border-[#293548] hover:border-[#8592a6]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#2962ff] inline-block"></span>
                        Demo Account
                      </span>
                      <span className="text-[10px] bg-[#2962ff] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        $10,000
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8592a6]">
                      Practice risk-free with $10,000 virtual balance. Reset anytime.
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-[#8592a6] mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00c853] shrink-0" />
                  <span>Both accounts are automatically created and switchable in 1 click!</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Full Name / Trader Alias <span className="text-[#ff444f]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. John Mwangi"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs placeholder:text-[#8592a6]/50 focus:outline-none focus:border-[#ff444f] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Email Address <span className="text-[#ff444f]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="trader@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs placeholder:text-[#8592a6]/50 focus:outline-none focus:border-[#ff444f] transition-colors"
                  />
                </div>
              </div>

              {/* M-Pesa Phone Number & Quick Agent Number Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white">
                    M-Pesa Phone Number <span className="text-[#ff444f]">*</span>
                  </label>
                  <span className="text-[10px] text-[#00c853] font-mono">
                    Reflects live on M-Pesa
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0119437680 or 0103942534"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs placeholder:text-[#8592a6]/50 focus:outline-none focus:border-[#00c853] transition-colors font-mono"
                  />
                </div>

                {/* Quick Number Selector Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-[#8592a6]">Deposit Agents:</span>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber(mpesaPrimaryPhone)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      phoneNumber === mpesaPrimaryPhone
                        ? 'bg-[#00c853] text-black font-extrabold'
                        : 'bg-[#1b263b] text-[#8592a6] hover:text-white border border-[#293548]'
                    }`}
                  >
                    0119437680 (Agent 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber(mpesaSecondaryPhone)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      phoneNumber === mpesaSecondaryPhone
                        ? 'bg-[#00c853] text-black font-extrabold'
                        : 'bg-[#1b263b] text-[#8592a6] hover:text-white border border-[#293548]'
                    }`}
                  >
                    0103942534 (Agent 2)
                  </button>
                </div>
              </div>

              {/* Password & Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">
                    Password <span className="text-[#ff444f]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs placeholder:text-[#8592a6]/50 focus:outline-none focus:border-[#ff444f] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8592a6] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white block mb-1.5">
                    Country of Residence
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs focus:outline-none focus:border-[#ff444f] transition-colors cursor-pointer appearance-none"
                    >
                      <option value="Kenya">Kenya (M-Pesa Supported)</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Uganda">Uganda</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="International">International (Global)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#8592a6] pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#293548] text-[#ff444f] focus:ring-0 bg-[#0e1726]"
                />
                <span>
                  I confirm that I am 18+ years old and accept the Deriv Trader's Hub Terms of Service, Privacy Policy and Risk Disclosure.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#ff444f] hover:bg-[#ff444f]/90 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#ff444f]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Start Trading</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* One Click Demo Fast Lane */}
              <div className="pt-3 border-t border-[#293548] text-center">
                <p className="text-[11px] text-[#8592a6] mb-2">
                  Want to explore without filling everything right now?
                </p>
                <button
                  type="button"
                  onClick={handleQuickDemoCreate}
                  className="px-4 py-2 bg-[#1b263b] hover:bg-[#293548] text-[#2962ff] hover:text-white rounded-lg text-xs font-bold border border-[#293548] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Start with 1-Click $10,000 Demo Account</span>
                </button>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Email or Account ID (e.g. CR984210 / VRTC104921)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="trader@derivhub.com or CR984210"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs placeholder:text-[#8592a6]/50 focus:outline-none focus:border-[#ff444f] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8592a6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-9 py-2.5 bg-[#0e1726] border border-[#293548] rounded-xl text-white text-xs placeholder:text-[#8592a6]/50 focus:outline-none focus:border-[#ff444f] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8592a6] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Quick Login Helpers */}
              <div className="p-3 bg-[#0e1726] border border-[#293548] rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#8592a6] uppercase tracking-wider font-semibold block">
                  Quick Demo / Existing Accounts:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('john.trader@derivhub.com');
                      setPassword('derivotp123');
                    }}
                    className="px-2.5 py-1 bg-[#1b263b] hover:bg-[#293548] text-white rounded text-[11px] font-mono cursor-pointer"
                  >
                    Use Real Account (CR984210)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('demo.trader@derivhub.com');
                      setPassword('demo12345');
                    }}
                    className="px-2.5 py-1 bg-[#1b263b] hover:bg-[#293548] text-[#2962ff] rounded text-[11px] font-mono cursor-pointer"
                  >
                    Use Demo Account (VRTC104921)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#ff444f] hover:bg-[#ff444f]/90 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#ff444f]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Trade</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-[#8592a6] hover:text-white underline cursor-pointer"
                >
                  Don't have an account yet? Create one now
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="bg-[#0e1726] border-t border-[#293548] px-6 py-3 flex items-center justify-between text-[11px] text-[#8592a6]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00c853]" />
            <span>256-bit SSL Encrypted • Direct AbePay.com API</span>
          </div>
          <span className="font-mono text-white text-[10px]">Agents: 0119437680 / 0103942534</span>
        </div>
      </div>
    </div>
  );
};
