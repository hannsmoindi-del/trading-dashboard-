import React, { useState } from 'react';
import { DerivProvider, useDeriv } from './context/DerivContext';
import { DerivSidebar, DerivNavTab } from './components/layout/DerivSidebar';
import { DerivHeader } from './components/layout/DerivHeader';
import { DerivDashboardView } from './components/dashboard/DerivDashboardView';
import { CashierView } from './components/cashier/CashierView';
import { PlatformsView } from './components/platforms/PlatformsView';
import { DBotView } from './components/dbot/DBotView';
import { MT5PythonBotView } from './components/mt5bot/MT5PythonBotView';
import { AccountSettingsView } from './components/settings/AccountSettingsView';
import { QuickDepositModal } from './components/cashier/QuickDepositModal';
import { MpesaSmsToast } from './components/cashier/MpesaSmsToast';
import { DerivCommandPalette } from './components/navigation/DerivCommandPalette';
import { DerivShortcutsModal } from './components/navigation/DerivShortcutsModal';
import { TradingAccountModal } from './components/auth/TradingAccountModal';
import { useDerivShortcuts } from './hooks/useDerivShortcuts';

const MainLayout: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useDeriv();
  const [activeTab, setActiveTab] = useState<DerivNavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Setup Global Keyboard Shortcuts
  useDerivShortcuts({
    onToggleCommandPalette: () => setIsCommandPaletteOpen(prev => !prev),
    onNavigateTab: (tab: DerivNavTab) => setActiveTab(tab),
    onToggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    onCloseModals: () => {
      setIsCommandPaletteOpen(false);
      setIsShortcutsOpen(false);
      setIsDepositModalOpen(false);
    },
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0e1726] text-white font-sans antialiased">
      {/* Sidebar Navigation */}
      <DerivSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <DerivHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCashierDeposit={() => setIsDepositModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Scrollable Viewport Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0e1726] pb-12">
          {activeTab === 'dashboard' && (
            <DerivDashboardView
              onNavigateTab={setActiveTab}
              onLaunchDTrader={() => setActiveTab('platforms')}
            />
          )}
          {activeTab === 'cashier' && <CashierView />}
          {activeTab === 'platforms' && <PlatformsView onOpenMT5Bot={() => setActiveTab('mt5bot')} />}
          {activeTab === 'dbot' && <DBotView onOpenMT5Bot={() => setActiveTab('mt5bot')} />}
          {activeTab === 'mt5bot' && <MT5PythonBotView />}
          {activeTab === 'settings' && <AccountSettingsView />}
        </main>
      </div>

      {/* Quick Deposit Modal */}
      <QuickDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      {/* Live Safaricom M-Pesa SMS Alert Toast for 0119437680 & 0103942534 */}
      <MpesaSmsToast />

      {/* Command Palette (Ctrl+K) */}
      <DerivCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
      />

      {/* Pro Keyboard Shortcuts Cheatsheet (?) */}
      <DerivShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Account Creation & Trader Authentication Modal ("One should create account when he or she wants to trade") */}
      <TradingAccountModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultMode={authModalMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <DerivProvider>
      <MainLayout />
    </DerivProvider>
  );
}
