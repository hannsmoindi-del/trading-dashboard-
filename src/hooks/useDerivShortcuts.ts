import { useEffect } from 'react';
import { DerivNavTab } from '../components/layout/DerivSidebar';

interface UseDerivShortcutsOptions {
  onToggleCommandPalette: () => void;
  onNavigateTab: (tab: DerivNavTab) => void;
  onToggleShortcutsModal: () => void;
  onCloseModals: () => void;
}

export function useDerivShortcuts({
  onToggleCommandPalette,
  onNavigateTab,
  onToggleShortcutsModal,
  onCloseModals,
}: UseDerivShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Escape always closes open overlays
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

      // If user is focused on typing in an input, don't hijack keys
      if (isInput) return;

      // Navigations: Ctrl+1 through Ctrl+5
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          onNavigateTab('dashboard');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          onNavigateTab('cashier');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          onNavigateTab('platforms');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          onNavigateTab('dbot');
          return;
        }
        if (e.key === '5') {
          e.preventDefault();
          onNavigateTab('mt5bot');
          return;
        }
        if (e.key === '6') {
          e.preventDefault();
          onNavigateTab('settings');
          return;
        }
      }

      // Shortcuts Cheatsheet: ?
      if (e.key === '?') {
        e.preventDefault();
        onToggleShortcutsModal();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCommandPalette, onNavigateTab, onToggleShortcutsModal, onCloseModals]);
}
