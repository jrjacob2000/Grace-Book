import React from 'react';
import {
  X,
  FlaskConical,
  CheckCircle2,
  Rocket,
  Upload,
  RotateCcw,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';

interface DataModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportModal?: () => void;
}

export const DataModeModal: React.FC<DataModeModalProps> = ({
  isOpen,
  onClose,
  onOpenImportModal,
}) => {
  const {
    data,
    isDemoData,
    selectedYear,
    startFreshLiveLedger,
    reloadDemoData,
  } = useChurchFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isDemoData
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
            }`}>
              {isDemoData ? <FlaskConical className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">Ledger Data Mode & Live Switcher</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isDemoData
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {isDemoData ? 'Demo Mode' : 'Live Ledger'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {data.profile.name || 'Church'} • Fiscal Year {selectedYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Active Status Card */}
          <div className={`p-4 rounded-xl border ${
            isDemoData
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start gap-3">
              {isDemoData ? (
                <FlaskConical className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-sm">
                  {isDemoData
                    ? 'Demonstration Mode Currently Active'
                    : 'Live Production Ledger Active'}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {isDemoData
                    ? `You are exploring GraceBooks with benchmark demonstration records for ${data.profile.name || 'your church'}. Use this mode for treasurer training, staff practice, or board presentations.`
                    : `You are recording real live church transactions for ${data.profile.name || 'your church'} for fiscal year ${selectedYear}. All collections and disbursements reflect real financial records.`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              Data Management & Mode Options
            </h4>

            {/* Option 1: Start Live Ledger */}
            <div className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl space-y-2.5 transition-colors shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Rocket className="w-4 h-4 text-emerald-600" />
                    <span>Option 1: Start Blank Live Production Ledger</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Clears sample demonstration transactions and initializes all designated fund balances and bank accounts to zero starting balances so you can start recording real live church tithes, offerings, and vendor disbursements for {selectedYear}. Preserves your active Church Profile details.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  startFreshLiveLedger(true);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Rocket className="w-4 h-4" />
                <span>Start Blank Live Production Ledger</span>
              </button>
            </div>

            {/* Option 2: Import Real Church Records */}
            {onOpenImportModal && (
              <div className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl space-y-2.5 transition-colors shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Option 2: Import Real Church Records (CSV or JSON)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Already have church spreadsheets or a previous system backup? Bulk upload tithes and disbursements from Excel CSV files or restore an entire annual JSON system backup file.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenImportModal();
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Open Import Data Tool</span>
                </button>
              </div>
            )}

            {/* Option 3: Restore Demo Data */}
            <div className="p-4 bg-white border border-slate-200 hover:border-amber-300 rounded-xl space-y-2.5 transition-colors shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Option 3: Reload Demonstration Sample Data</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Resets the {selectedYear} ledger back to the benchmark sample dataset with pre-filled Sunday collections, vendor vouchers, and balanced fund equity. Great for practice and training.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  reloadDemoData();
                  onClose();
                }}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 border border-slate-300 transition-colors"
              >
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <span>Reload Demonstration Sample Dataset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Local &amp; Drive Storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
