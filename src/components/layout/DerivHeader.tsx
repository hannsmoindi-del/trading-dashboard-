import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import {
  Menu,
  ChevronDown,
  PlusCircle,
  Bell,
  X,
  Wallet,
  Zap,
  TrendingUp,
  TrendingDown,
  Check,
  User,
  UserPlus,
  LogIn,
  LogOut,
  ShieldCheck,
  Coins
} from 'lucide-react';

interface DerivHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCashierDeposit: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
}

export const DerivHeader: React.FC<DerivHeaderProps> = ({
  onOpenMobileMenu,
  onOpenCashierDeposit,
  onOpenCommandPalette,
  onOpenShortcuts,
}) => {
  const {
    accountType,
    setAccountType,
    realAccountId,
    demoAccountId,
    resetDemoBalance,
    balances,
    activeWallet,
    setActiveWallet,
    selectedAsset,
    notification,
    clearNotification,
    user,
    openAuthModal,
    logoutAccount,
  } = useDeriv();

  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isReal = accountType === 'real';
  const activeAccountId = isReal ? realAccountId : demoAccountId;
  const displayBalance = isReal
    ? (activeWallet === 'usd' ? balances.usdReal : activeWallet === 'btc' ? balances.btcReal : balances.usdtReal)
    : balances.usdDemo;

  return (
    <header className="relative h-[75px] border-b border-[#293548] bg-[#111927] flex items-center justify-between px-6 sm:px-9 z-30 shrink-0">
      {/* Left: Mobile hamburger & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 text-[#8592a6] hover:text-white md:hidden rounded-lg hover:bg-[#1b263b] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{user ? `Welcome Back, ${user.fullName.split(' ')[0]}` : "Welcome to Deriv Hub"}</span>
            {!user && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                Guest Mode
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#8592a6]">
            <span className="hidden sm:inline font-mono">
              {user ? `Account: ${activeAccountId}` : "Create account to execute trades"}
            </span>
            <span className="hidden sm:inline text-[#293548]">•</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-white">
              {selectedAsset.name}: ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: selectedAsset.decimals })}
              <span className={selectedAsset.change24h >= 0 ? 'text-[#00c853]' : 'text-[#ff444f]'}>
                ({selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Account Switcher, Wallet Pill, Auth Buttons & Cashier */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* If Not Registered: High Priority "Create Account" & "Sign In" Buttons */}
        {!user && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openAuthModal('register')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-md shadow-[#00c853]/20 animate-pulse"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-[#1b263b] hover:bg-[#293548] text-white text-xs font-semibold rounded-lg border border-[#293548] transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>Log In</span>
            </button>
          </div>
        )}

        {/* Real / Demo Pill Toggle & Account Badge */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="bg-[#0e1726] p-1 rounded-full border border-[#293548] text-xs font-semibold flex items-center">
            <button
              onClick={() => setAccountType('real')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                isReal
                  ? 'bg-[#ff444f] text-white shadow-sm'
                  : 'text-[#8592a6] hover:text-white'
              }`}
            >
              <span>Real</span>
              <span className="text-[10px] opacity-80 font-mono hidden md:inline">({realAccountId})</span>
            </button>
            <button
              onClick={() => setAccountType('demo')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                !isReal
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#8592a6] hover:text-white'
              }`}
            >
              <span>Demo</span>
              <span className="text-[10px] opacity-80 font-mono hidden md:inline">({demoAccountId})</span>
            </button>
          </div>
        </div>

        {/* Wallet Pill matching HTML specifications: .wallet-pill */}
        <div className="relative">
          <button
            onClick={() => setWalletDropdownOpen(prev => !prev)}
            className="bg-[#1b263b] border border-[#293548] hover:border-[#ff444f]/50 px-4 py-2 rounded-full flex items-center gap-2.5 text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            <span className="text-[#8592a6] hidden sm:inline">
              {isReal ? (activeWallet === 'usd' ? 'USD Real:' : activeWallet === 'btc' ? 'BTC Real:' : 'USDT Real:') : 'Virtual Demo:'}
            </span>
            <span className="text-[#00c853] font-bold font-mono">
              {isReal && activeWallet === 'btc'
                ? `₿ ${displayBalance.toFixed(4)}`
                : `$${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="text-[10px] font-mono text-[#8592a6] bg-[#0e1726] px-1.5 py-0.5 rounded border border-[#293548]">
              {activeAccountId}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8592a6]" />
          </button>

          {/* Wallet Dropdown Popover */}
          {walletDropdownOpen && (
            <div className="absolute right-0 top-12 w-72 bg-[#1b263b] border border-[#293548] rounded-xl shadow-2xl p-2.5 z-50 text-xs">
              <div className="p-2 border-b border-[#293548] flex items-center justify-between text-[#8592a6] font-semibold text-[11px] uppercase tracking-wider">
                <span>Select Active Wallet</span>
                <span className="text-white font-mono">{activeAccountId}</span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <button
                  onClick={() => {
                    setAccountType('real');
                    setActiveWallet('usd');
                    setWalletDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0e1726] text-left transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>USD Real Wallet</span>
                      <span className="text-[10px] text-[#ff444f] bg-[#ff444f]/15 px-1.5 py-0.2 rounded font-bold">REAL</span>
                    </div>
                    <div className="text-[11px] text-[#8592a6]">Account: {realAccountId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#00c853] font-mono font-bold">
                      ${balances.usdReal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    {isReal && activeWallet === 'usd' && (
                      <span className="text-[10px] text-[#ff444f] font-semibold flex items-center justify-end gap-0.5">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setAccountType('real');
                    setActiveWallet('btc');
                    setWalletDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0e1726] text-left transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white">BTC Crypto Wallet</div>
                    <div className="text-[11px] text-[#8592a6]">Bitcoin On-chain</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-mono font-bold">
                      ₿ {balances.btcReal.toFixed(4)}
                    </div>
                    {isReal && activeWallet === 'btc' && (
                      <span className="text-[10px] text-[#ff444f] font-semibold flex items-center justify-end gap-0.5">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setAccountType('demo');
                    setWalletDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0e1726] text-left transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>Virtual Demo Account</span>
                      <span className="text-[10px] text-[#2962ff] bg-[#2962ff]/15 px-1.5 py-0.2 rounded font-bold">DEMO</span>
                    </div>
                    <div className="text-[11px] text-[#8592a6]">Account: {demoAccountId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#2962ff] font-mono font-bold">
                      ${balances.usdDemo.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    {!isReal && (
                      <span className="text-[10px] text-[#2962ff] font-semibold flex items-center justify-end gap-0.5">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Reset Demo Option if in Demo */}
              {!isReal && (
                <div className="pt-2 border-t border-[#293548] flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] text-[#8592a6]">Need more funds?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetDemoBalance();
                      setWalletDropdownOpen(false);
                    }}
                    className="text-[11px] text-[#2962ff] hover:underline font-bold cursor-pointer"
                  >
                    Reset $10,000 Demo
                  </button>
                </div>
              )}

              {/* AbePay Direct Deposit Note */}
              <div className="mt-2 p-2 bg-[#0e1726] rounded-lg border border-[#293548] text-[10px] text-[#8592a6] leading-tight">
                <span className="text-[#00c853] font-bold">AbePay.com Deposit Agent:</span>
                <div className="font-mono text-white mt-0.5 font-bold">0119437680 / 0103942534</div>
                <div className="text-[9px] mt-0.5 text-gray-400">Funds reflect live on phone & trading wallet</div>
              </div>
            </div>
          )}
        </div>

        {/* Deposit Quick Action */}
        <button
          onClick={onOpenCashierDeposit}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ff444f] hover:bg-[#ff444f]/90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm shadow-[#ff444f]/20"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Deposit</span>
        </button>

        {/* User Account Avatar & Popover (if registered) */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(p => !p)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-[#1b263b] hover:bg-[#293548] border border-[#293548] text-white text-xs transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#ff444f] text-white flex items-center justify-center font-bold text-xs">
                {user.fullName.substring(0, 2).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8592a6]" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-11 w-64 bg-[#1b263b] border border-[#293548] rounded-xl shadow-2xl p-3 z-50 text-xs flex flex-col gap-2">
                <div className="pb-2 border-b border-[#293548]">
                  <div className="font-bold text-white text-sm">{user.fullName}</div>
                  <div className="text-[11px] text-[#8592a6] font-mono">{user.email}</div>
                  <div className="text-[10px] text-[#00c853] font-mono mt-0.5">Phone: {user.phoneNumber}</div>
                </div>

                <div className="py-1 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center justify-between text-[#8592a6]">
                    <span>Real Account:</span>
                    <span className="font-mono text-white font-bold">{user.realAccountId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8592a6]">
                    <span>Demo Account:</span>
                    <span className="font-mono text-[#2962ff] font-bold">{user.demoAccountId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8592a6]">
                    <span>Active Mode:</span>
                    <span className="font-bold uppercase text-white">{accountType}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#293548] flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setAccountType(accountType === 'real' ? 'demo' : 'real');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full py-1.5 px-2 bg-[#0e1726] hover:bg-[#151e2e] rounded-lg text-left text-[11px] text-[#8592a6] hover:text-white font-semibold cursor-pointer"
                  >
                    Switch to {accountType === 'real' ? 'Demo Account' : 'Real Account'}
                  </button>
                  <button
                    onClick={() => {
                      logoutAccount();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full py-1.5 px-2 bg-[#ff444f]/10 hover:bg-[#ff444f]/20 rounded-lg text-left text-[11px] text-[#ff444f] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out (Switch to Guest)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Floating Notification Banner */}
      {notification && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 top-20 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium animate-in fade-in duration-200 max-w-lg ${
            notification.type === 'success'
              ? 'bg-[#1b263b] border-[#00c853] text-[#00c853]'
              : notification.type === 'error'
              ? 'bg-[#1b263b] border-[#ff444f] text-[#ff444f]'
              : 'bg-[#1b263b] border-[#2962ff] text-white'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-white">{notification.message}</span>
          <button
            onClick={clearNotification}
            className="p-1 text-[#8592a6] hover:text-white rounded ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
