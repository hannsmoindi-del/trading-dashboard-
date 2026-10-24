import { useEffect } from 'react';
import { NavigationTab } from '../components/layout/Sidebar';

interface UseGlobalShortcutsOptions {
  onToggleCommandPalette: () => void;
  onQuickBuy: () => void;
  onQuickSell: () => void;
  onToggleShortcutsHelp: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onQuickAlert: () => void;
  onCloseModals: () => void;
  onToggleChartType: () => void;
}

export function useGlobalShortcuts({
  onToggleCommandPalette,
  onQuickBuy,
  onQuickSell,
  onToggleShortcutsHelp,
  onNavigateTab,
  onQuickAlert,
  onCloseModals,
  onToggleChartType,
}: UseGlobalShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Escape always closes open modals/palettes regardless of focus
      if (e.key === 'Escape') {
        onCloseModals();
        return;
      }

      // Command Palette (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        onToggleCommandPalette();
        return;
      }

      // If user is currently typing in an input field, do not trigger single-key or standard letter shortcuts
      if (isInput) return;

      // Quick Buy: Ctrl+B or Cmd+B
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        onQuickBuy();
        return;
      }

      // Quick Sell: Ctrl+S or Cmd+S (prevents default browser Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        onQuickSell();
        return;
      }

      // Quick Alert: Alt+A or Ctrl+Shift+A
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        onQuickAlert();
        return;
      }

      // Navigation: Ctrl+1 through Ctrl+5
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          onNavigateTab('dashboard');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          onNavigateTab('markets');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          onNavigateTab('portfolio');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          onNavigateTab('wallet');
          return;
        }
        if (e.key === '5') {
          e.preventDefault();
          onNavigateTab('settings');
          return;
        }
      }

      // Cheatsheet: ?
      if (e.key === '?') {
        e.preventDefault();
        onToggleShortcutsHelp();
        return;
      }

      // Toggle Chart: C
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onToggleChartType();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onToggleCommandPalette,
    onQuickBuy,
    onQuickSell,
    onToggleShortcutsHelp,
    onNavigateTab,
    onQuickAlert,
    onCloseModals,
    onToggleChartType,
  ]);
}
