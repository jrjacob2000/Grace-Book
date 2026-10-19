import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { ChurchProfile } from '../types/finance';
import {
  DEFAULT_COLLECTION_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from '../data/initialData';
import { APP_VERSION, APP_NAME } from '../constants/version';

interface ChurchProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDataModeModal?: () => void;
}

export const ChurchProfileModal: React.FC<ChurchProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenDataModeModal,
}) => {
  const {
    data,
    updateChurchProfile,
    isDemoData,
    addCollectionCategory,
    deleteCollectionCategory,
    addExpenseCategory,
    deleteExpenseCategory,
  } = useChurchFinance();
  const [profile, setProfile] = useState<ChurchProfile>({ ...data.profile });
  const [newCollectionCat, setNewCollectionCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProfile({ ...data.profile });
    }
  }, [isOpen, data.profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateChurchProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Church & Stewardship Profile</h2>
              <p className="text-xs text-slate-500">Official Board Details & District Affiliation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Denomination / National Organization</label>
            <input
              type="text"
              required
              value={profile.denomination}
              onChange={(e) => setProfile({ ...profile, denomination: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
              placeholder="e.g. GRACE CHRISTIAN FELLOWSHIP INTERNATIONAL"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">National Office Headquarters Address</label>
            <input
              type="text"
              value={profile.headquartersAddress || ''}
              onChange={(e) => setProfile({ ...profile, headquartersAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
              placeholder="e.g. 120 Heritage Boulevard, Suite 400, Metro City"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Local Church / Congregation Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-semibold"
              placeholder="e.g. Grace Fellowship Community Church"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Church Address / Barangay</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. 450 Hope Avenue, Greenfield District"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">District / Field</label>
              <input
                type="text"
                value={profile.district || ''}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. Central Valley District"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pastor / Minister-in-Charge</label>
              <input
                type="text"
                value={profile.seniorPastor}
                onChange={(e) => setProfile({ ...profile, seniorPastor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. Rev. Daniel S. Mercer"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Church Treasurer</label>
              <input
                type="text"
                value={profile.treasurer}
                onChange={(e) => setProfile({ ...profile, treasurer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. Hannah L. Collins"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Church Auditor 1</label>
              <input
                type="text"
                value={profile.auditor1 || ''}
                onChange={(e) => setProfile({ ...profile, auditor1: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. Deacon Samuel T. Brooks"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Church Auditor 2</label>
              <input
                type="text"
                value={profile.auditor2 || ''}
                onChange={(e) => setProfile({ ...profile, auditor2: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
                placeholder="e.g. Claire M. Bennett"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Currency Symbol</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={profile.currencySymbol || '₱'}
                  onChange={(e) => setProfile({ ...profile, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm font-mono"
                  placeholder="₱ or Php"
                />
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, currencySymbol: '₱' })}
                  className="px-2 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 whitespace-nowrap"
                  title="Use Philippine Peso (₱)"
                >
                  ₱ Peso
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Fiscal Year Start</label>
              <select
                value={profile.fiscalYearStartMonth}
                onChange={(e) => setProfile({ ...profile, fiscalYearStartMonth: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-sm"
              >
                <option value={1}>January</option>
                <option value={7}>July</option>
                <option value={9}>September</option>
              </select>
            </div>
          </div>

          {/* Category Dropdown Manager */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Form Category Dropdown Manager
                </h3>
                <p className="text-[11px] text-slate-500">
                  Add, edit, or remove dropdown choices for Collections and Expense forms
                </p>
              </div>
            </div>

            {/* Collection Categories */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Collection (Giving) Dropdown Options</span>
              <div className="flex flex-wrap gap-1.5">
                {(data.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 shadow-2xs"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => deleteCollectionCategory(cat)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newCollectionCat}
                  onChange={(e) => setNewCollectionCat(e.target.value)}
                  placeholder="New collection category..."
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCollectionCat.trim()) {
                      addCollectionCategory(newCollectionCat.trim());
                      setNewCollectionCat('');
                    }
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  + Add Category
                </button>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Expense (Disbursement) Dropdown Options</span>
              <div className="flex flex-wrap gap-1.5">
                {(data.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 shadow-2xs"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => deleteExpenseCategory(cat)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newExpenseCat}
                  onChange={(e) => setNewExpenseCat(e.target.value)}
                  placeholder="New expense category..."
                  className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newExpenseCat.trim()) {
                      addExpenseCategory(newExpenseCat.trim());
                      setNewExpenseCat('');
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  + Add Category
                </button>
              </div>
            </div>
          </div>

          {/* Data Mode Status Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block text-xs">Ledger Data Mode</span>
              <span className="text-[11px] text-slate-500">
                {isDemoData ? '🧪 Demonstration Mode (Sample Data)' : '🟢 Live Production Ledger Active'}
              </span>
            </div>
            {onOpenDataModeModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDataModeModal();
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              >
                Manage Data Mode
              </button>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between gap-2.5 border-t border-slate-200">
            <span className="text-[11px] text-slate-400 font-mono">
              {APP_NAME} <span className="font-semibold text-blue-600">v{APP_VERSION}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
