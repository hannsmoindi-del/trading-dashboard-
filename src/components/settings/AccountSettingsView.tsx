import React, { useState } from 'react';
import { useDeriv } from '../../context/DerivContext';
import {
  User,
  ShieldCheck,
  Key,
  Volume2,
  VolumeX,
  Lock,
  Globe,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

export const AccountSettingsView: React.FC = () => {
  const {
    soundEnabled,
    setSoundEnabled,
    user,
    realAccountId,
    demoAccountId,
    openAuthModal,
    logoutAccount,
    mpesaPrimaryPhone,
    mpesaSecondaryPhone
  } = useDeriv();
  const [tokens, setTokens] = useState<{ id: string; name: string; token: string; scope: string; created: string }[]>([
    {
      id: 'tok-1',
      name: 'DBot Production Trading',
      token: 'driv_live_9f81a7b8e2194c6d88',
      scope: 'Read + Trade',
      created: '2026-09-15',
    },
    {
      id: 'tok-2',
      name: 'Python Algo Webhook',
      token: 'driv_live_12ca9841ef909bc771',
      scope: 'Read Only',
      created: '2026-10-02',
    },
  ]);

  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenScope, setNewTokenScope] = useState('Read + Trade');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    const rand = Math.random().toString(36).substring(2, 14);
    const tokenItem = {
      id: `tok-${Date.now()}`,
      name: newTokenName,
      token: `driv_live_${rand}`,
      scope: newTokenScope,
      created: 'Today',
    };
    setTokens(prev => [tokenItem, ...prev]);
    setNewTokenName('');
  };

  const handleDeleteToken = (id: string) => {
    setTokens(prev => prev.filter(t => t.id !== id));
  };

  const handleCopy = (token: string) => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 sm:p-9 flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Account Settings & Security
        </h2>
        <p className="text-xs text-[#8592a6]">
          Manage your trader profile, identity verification tiers, API security tokens, and sound alerts
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-[#00c853]/15 border border-[#00c853]/30 text-[#00c853] rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Preferences updated and saved securely to your Deriv profile.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Verification */}
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col gap-4">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#ff444f]/20 text-[#ff444f] flex items-center justify-center font-bold text-lg border border-[#ff444f]/30">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{user.fullName}</h3>
                      <span className="text-xs font-mono text-[#00c853]">Real: {user.realAccountId}</span>
                    </div>
                  </div>
                  <button
                    onClick={logoutAccount}
                    className="text-[11px] text-[#ff444f] hover:underline font-semibold cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>

                <div className="border-t border-[#293548] pt-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#293548]">
                    <span className="text-[#8592a6]">Real Account ID:</span>
                    <span className="text-white font-mono font-bold">{user.realAccountId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#293548]">
                    <span className="text-[#8592a6]">Demo Account ID:</span>
                    <span className="text-[#2962ff] font-mono font-bold">{user.demoAccountId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#293548]">
                    <span className="text-[#8592a6]">M-Pesa Phone:</span>
                    <span className="text-[#00c853] font-mono font-bold">{user.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#293548]">
                    <span className="text-[#8592a6]">Registered Email:</span>
                    <span className="text-white font-mono">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#8592a6]">Country of Residence:</span>
                    <span className="text-white">{user.country}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#1b263b] text-[#8592a6] flex items-center justify-center mx-auto border border-[#293548]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Guest Trader Mode</h3>
                  <p className="text-xs text-[#8592a6] mt-1">
                    Create an account to unlock Real & Demo trading, portfolio persistence, and instant M-Pesa deposits.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => openAuthModal('register', 'Set up your trader account')}
                    className="w-full py-2.5 bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-[#00c853]/20"
                  >
                    Create Account (Real & Demo)
                  </button>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-2 bg-[#0e1726] hover:bg-[#293548] text-white text-xs font-semibold rounded-lg border border-[#293548] transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00c853]" />
                Verification Status
              </h4>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#00c853]/15 text-[#00c853]">
                Level 2 Verified
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs mt-2">
              <div className="flex items-center justify-between p-2.5 bg-[#0e1726] rounded-lg border border-[#293548]">
                <span className="text-[#8592a6]">Proof of Identity (POI)</span>
                <span className="text-[#00c853] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0e1726] rounded-lg border border-[#293548]">
                <span className="text-[#8592a6]">Proof of Address (POA)</span>
                <span className="text-[#00c853] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#8592a6] mt-1">
              Your account has full unlimited access to cashier deposits, withdrawals, and 1:1000 MT5 leverage.
            </p>
          </div>
        </div>

        {/* Right Columns: API Tokens & Preferences (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Audio & Terminal Preferences */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md">
            <h3 className="text-base font-bold text-white mb-4">Terminal & Audio Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0e1726] rounded-xl border border-[#293548] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Synthesized Audio Cues</div>
                  <div className="text-[11px] text-[#8592a6]">Sound on deposits, bot wins, and trade fills</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-[#00c853]/15 border-[#00c853]/40 text-[#00c853]'
                      : 'bg-[#1b263b] border-[#293548] text-[#8592a6]'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              <div className="p-4 bg-[#0e1726] rounded-xl border border-[#293548] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Default Account Currency</div>
                  <div className="text-[11px] text-[#8592a6]">Base fiat valuation currency</div>
                </div>
                <select className="bg-[#1b263b] border border-[#293548] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* API Security Tokens for Bots */}
          <div className="bg-[#1b263b] border border-[#293548] rounded-xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#293548] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#ff444f]" />
                  Deriv API Access Tokens
                </h3>
                <p className="text-xs text-[#8592a6]">Create dedicated tokens for automated bots, WebSockets, or MT5 bridges</p>
              </div>
            </div>

            {/* Create new token form */}
            <form onSubmit={handleCreateToken} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0e1726] p-4 rounded-xl border border-[#293548]">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#8592a6]">Token Label / Application</label>
                <input
                  type="text"
                  placeholder="e.g. TradingBot_v2"
                  value={newTokenName}
                  onChange={e => setNewTokenName(e.target.value)}
                  className="bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#8592a6]">Access Scope</label>
                <select
                  value={newTokenScope}
                  onChange={e => setNewTokenScope(e.target.value)}
                  className="bg-[#1b263b] border border-[#293548] text-white p-2 rounded-lg text-xs"
                >
                  <option value="Read + Trade">Read + Trade (Bot Execution)</option>
                  <option value="Read Only">Read Only (Analytics)</option>
                  <option value="Full Access">Full Access (Admin + Cashier)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#ff444f] hover:bg-[#ff444f]/90 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Token</span>
                </button>
              </div>
            </form>

            {/* Existing tokens list */}
            <div className="flex flex-col gap-2">
              {tokens.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-[#0e1726] border border-[#293548] rounded-xl text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-[#8592a6] shrink-0" />
                    <div>
                      <div className="text-white font-bold font-sans">{t.name}</div>
                      <div className="text-[10px] text-[#8592a6] flex items-center gap-2">
                        <span>{t.scope}</span>
                        <span>•</span>
                        <span>Created {t.created}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white bg-[#1b263b] px-2 py-1 rounded border border-[#293548]">
                      {t.token.slice(0, 10)}...{t.token.slice(-4)}
                    </span>
                    <button
                      onClick={() => handleCopy(t.token)}
                      className="p-1.5 text-[#8592a6] hover:text-white rounded bg-[#1b263b] hover:bg-[#293548] cursor-pointer"
                      title="Copy full token"
                    >
                      {copiedToken === t.token ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00c853]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteToken(t.id)}
                      className="p-1.5 text-[#ff444f]/80 hover:text-[#ff444f] rounded bg-[#1b263b] hover:bg-[#293548] cursor-pointer"
                      title="Revoke token"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#00c853] hover:bg-[#00c853]/90 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
