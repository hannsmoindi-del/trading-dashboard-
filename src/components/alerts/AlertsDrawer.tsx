import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import {
  Bell,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
  Edit2,
  Check,
  RotateCcw,
  Tag,
  AlertCircle
} from 'lucide-react';
import { PriceAlert } from '../../types/trading';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose }) => {
  const {
    alerts,
    assets,
    updateAlert,
    rearmAlert,
    deleteAlert,
    clearTriggeredAlerts,
    openCreateAlertModal,
    setSelectedSymbol,
  } = useTrading();

  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);

  // Edit form state
  const [editPrice, setEditPrice] = useState<string>('');
  const [editCondition, setEditCondition] = useState<'above' | 'below'>('above');
  const [editNote, setEditNote] = useState<string>('');
  const [editReArm, setEditReArm] = useState<boolean>(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation state for safety
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return a.status === 'active';
    if (filter === 'triggered') return a.status === 'triggered';
    return true;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const triggeredCount = alerts.filter(a => a.status === 'triggered').length;

  const startEditing = (alert: PriceAlert) => {
    setEditingAlertId(alert.id);
    setEditPrice(alert.targetPrice.toString());
    setEditCondition(alert.condition);
    setEditNote(alert.note || '');
    setEditReArm(alert.status === 'triggered');
    setEditError(null);
    setConfirmDeleteId(null);
  };

  const cancelEditing = () => {
    setEditingAlertId(null);
    setEditError(null);
  };

  const handleSaveEdit = (alert: PriceAlert) => {
    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setEditError('Please enter a valid price');
      return;
    }

    const currentAsset = assets.find(a => a.symbol === alert.symbol);
    const currentPrice = currentAsset ? currentAsset.price : alert.initialPrice;

    const updates: Partial<PriceAlert> = {
      targetPrice: numPrice,
      condition: editCondition,
      note: editNote.trim() || undefined,
    };

    if (alert.status === 'triggered' && editReArm) {
      updates.status = 'active';
      updates.triggeredAt = undefined;
      updates.initialPrice = currentPrice;
    }

    updateAlert(alert.id, updates);
    setEditingAlertId(null);
  };

  const handleQuickPercent = (alert: PriceAlert, pct: number) => {
    const asset = assets.find(a => a.symbol === alert.symbol);
    const base = asset ? asset.price : alert.targetPrice;
    const newTarget = base * (1 + pct / 100);
    const decimals = asset ? asset.decimals : 2;
    setEditPrice(newTarget.toFixed(decimals));
    setEditCondition(pct >= 0 ? 'above' : 'below');
    setEditError(null);
  };

  const handleDelete = (id: string) => {
    deleteAlert(id);
    setConfirmDeleteId(null);
    if (editingAlertId === id) {
      setEditingAlertId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/15 text-blue-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">Price Alerts Manager</h2>
              <p className="text-xs text-slate-400">
                {activeCount} active · {triggeredCount} triggered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openCreateAlertModal()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Alert</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                filter === 'active' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('triggered')}
              className={`px-3 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                filter === 'triggered' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Triggered ({triggeredCount})
            </button>
          </div>

          {triggeredCount > 0 && (
            <button
              onClick={clearTriggeredAlerts}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear Triggered
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => {
              const currentAsset = assets.find(a => a.symbol === alert.symbol);
              const currentPrice = currentAsset ? currentAsset.price : alert.initialPrice;
              const isTriggered = alert.status === 'triggered';
              const distancePct = ((alert.targetPrice - currentPrice) / currentPrice) * 100;
              const isEditing = editingAlertId === alert.id;
              const isDeleting = confirmDeleteId === alert.id;

              // EDIT MODE CARD
              if (isEditing) {
                return (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl border border-blue-500/50 bg-slate-950 shadow-md flex flex-col gap-3 ring-1 ring-blue-500/30"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                          Edit Alert
                        </span>
                        <span className="text-xs font-bold text-slate-100 font-sans">
                          {alert.symbol}
                        </span>
                      </div>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                        title="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Target Price Input */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="text-slate-400 font-medium">Target Price (USD)</label>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Now: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: currentAsset?.decimals || 2 })}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">$</span>
                        <input
                          type="number"
                          step="any"
                          value={editPrice}
                          onChange={e => {
                            setEditPrice(e.target.value);
                            setEditError(null);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs pl-7 pr-12 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
                          placeholder="0.00"
                        />
                        <button
                          type="button"
                          onClick={() => setEditPrice(currentPrice.toString())}
                          className="absolute right-2 top-1 text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
                        >
                          Mid
                        </button>
                      </div>
                    </div>

                    {/* Quick Percentage Presets */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[-2, -1, 1, 2].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleQuickPercent(alert, pct)}
                          className="py-1 text-[11px] font-mono font-medium rounded bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60"
                        >
                          {pct > 0 ? `+${pct}%` : `${pct}%`}
                        </button>
                      ))}
                    </div>

                    {/* Condition Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400">Trigger Direction</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setEditCondition('above')}
                          className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                            editCondition === 'above'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>≥ Above</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditCondition('below')}
                          className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                            editCondition === 'below'
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>≤ Below</span>
                        </button>
                      </div>
                    </div>

                    {/* Note Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Trading Note</span>
                      </label>
                      <input
                        type="text"
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        placeholder="e.g. Breakout level, Take profit"
                        className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Re-arm checkbox if triggered */}
                    {alert.status === 'triggered' && (
                      <label className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editReArm}
                          onChange={e => setEditReArm(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                        />
                        <span>Re-arm alert to Active status</span>
                      </label>
                    )}

                    {editError && (
                      <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        {editError}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(alert)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // VIEW MODE CARD
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isTriggered
                      ? 'bg-amber-950/15 border-amber-500/30 shadow-xs'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Asset & Condition */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSymbol(alert.symbol);
                            onClose();
                          }}
                          className="font-bold text-slate-100 hover:text-blue-400 text-sm transition-colors text-left font-sans"
                        >
                          {alert.symbol}
                        </button>
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            alert.condition === 'above'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          }`}
                        >
                          {alert.condition === 'above' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {alert.condition === 'above' ? '≥ Above' : '≤ Below'}
                        </span>
                      </div>

                      {alert.note && (
                        <span className="text-xs text-slate-400 mt-1 font-sans">{alert.note}</span>
                      )}
                    </div>

                    {/* Modify & Delete Actions */}
                    <div className="flex items-center gap-1">
                      {/* Modify Button */}
                      <button
                        onClick={() => startEditing(alert)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Modify Alert"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button / Confirm */}
                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-rose-950/60 p-0.5 rounded-lg border border-rose-500/40 animate-in fade-in">
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded cursor-pointer"
                            title="Confirm Delete"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(alert.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Price Comparison Line */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-sans">Target Price</span>
                      <span className="text-slate-100 font-bold">
                        ${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: currentAsset?.decimals || 2 })}
                      </span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 font-sans">Current Price</span>
                      <span className="text-slate-300">
                        ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: currentAsset?.decimals || 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Status Footer & Re-arm Quick Action */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    {isTriggered ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Triggered{' '}
                            {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => rearmAlert(alert.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded transition-colors cursor-pointer"
                          title="Re-activate alert"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Re-arm</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-400 font-mono">
                        Distance:{' '}
                        <span className={distancePct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {distancePct > 0 ? '+' : ''}{distancePct.toFixed(2)}%
                        </span>
                      </div>
                    )}

                    <span className="text-slate-400 text-[10px] font-sans">
                      Created {new Date(alert.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">No price alerts found</p>
              <p className="text-xs text-slate-400 mt-1">
                Set a price target to receive visual alerts and audio notifications.
              </p>
              <button
                onClick={() => openCreateAlertModal()}
                className="mt-4 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Create Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
