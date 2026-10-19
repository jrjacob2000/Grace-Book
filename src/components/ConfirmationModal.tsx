import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';

export const ConfirmationModal: React.FC = () => {
  const { pendingConfirmation, closeConfirmation } = useChurchFinance();

  if (!pendingConfirmation || !pendingConfirmation.isOpen) {
    return null;
  }

  const { title, message, affectedItem, confirmLabel, isDestructive, onConfirm } = pendingConfirmation;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className={`p-4 border-b flex items-start justify-between ${isDestructive ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDestructive ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
              {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500">Google Drive & Ledger Stewardship Action</p>
            </div>
          </div>
          <button
            onClick={closeConfirmation}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">{message}</p>

          {affectedItem && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 break-all">
              <span className="font-semibold text-slate-800 block mb-0.5">Target item:</span>
              {affectedItem}
            </div>
          )}

          {isDestructive && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/80">
              Note: This action modifies or replaces records. Please confirm to proceed.
            </p>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={closeConfirmation}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-xs ${
              isDestructive
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500/50'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
