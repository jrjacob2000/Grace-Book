import React, { useState } from 'react';
import {
  X,
  Calendar,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Building,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';

interface YearRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YearRolloverModal: React.FC<YearRolloverModalProps> = ({ isOpen, onClose }) => {
  const {
    data,
    selectedYear,
    totalCashInAccounts,
    totalFundBalances,
    isReconciled,
    ytdCollections,
    ytdExpenses,
    closeYearAndRollover,
  } = useChurchFinance();

  const [targetYear, setTargetYear] = useState<number>(selectedYear + 1);
  const currency = data.profile.currencySymbol || '₱';

  if (!isOpen) return null;

  const handleRollover = async () => {
    await closeYearAndRollover(targetYear);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fiscal Year-End Closing & Annual File Rollover
              </h2>
              <p className="text-xs text-slate-500">
                Close Fiscal Year {selectedYear} & Start New Annual Google Drive File
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Transition Visual */}
          <div className="flex items-center justify-center gap-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Closing Year</span>
              <div className="text-2xl font-bold font-mono text-slate-900">{selectedYear}</div>
              <span className="text-[10px] text-slate-500 font-mono">church_financial_data_{selectedYear}.json</span>
            </div>

            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="text-center">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">New Fiscal Year</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">{targetYear}</div>
              <span className="text-[10px] text-emerald-600 font-mono">church_financial_data_{targetYear}.json</span>
            </div>
          </div>

          {/* Current Year Closing Financial Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
              Year {selectedYear} Final Closing Position
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Fund Equity to Carry Forward:</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {currency}{totalFundBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Across {data.funds.length} Funds</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Bank Cash to Carry Forward:</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {currency}{totalCashInAccounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Across {data.accounts.length} Accounts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                <span className="text-slate-500">Year {selectedYear} Total Offerings:</span>
                <span className="font-mono font-semibold text-emerald-700 ml-1">
                  {currency}{ytdCollections.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                <span className="text-slate-500">Year {selectedYear} Total Disbursements:</span>
                <span className="font-mono font-semibold text-rose-700 ml-1">
                  {currency}{ytdExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Target Year Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Target New Fiscal Year</label>
            <input
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(parseInt(e.target.value) || selectedYear + 1)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-bold"
            />
          </div>

          {/* Explanation Checklist */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <h4 className="font-semibold text-blue-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>What Happens During Rollover:</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-blue-950/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Annual Separation:</strong> Fiscal Year {selectedYear} is marked <em>Closed & Audited</em> and preserved as an archived file.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Balance Roll-Forward:</strong> December 31 ending balances for all {data.funds.length} designated funds and bank accounts automatically become the January 1 beginning balances for {targetYear}.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Fresh Ledger:</strong> Collections and disbursements start clean for {targetYear}, while your budget categories carry forward as templates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>New Google Drive File:</strong> Creates <code className="font-mono bg-blue-100/60 px-1 rounded">church_financial_data_{targetYear}.json</code> in your Google Drive.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRollover}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Close {selectedYear} & Initialize {targetYear}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
