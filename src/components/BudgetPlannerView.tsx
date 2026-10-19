import React, { useState, useMemo } from 'react';
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  X,
  Target,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { BudgetItem } from '../types/finance';

export const BudgetPlannerView: React.FC = () => {
  const {
    data,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    selectedYear,
    selectedMonth,
  } = useChurchFinance();

  const currency = data.profile.currencySymbol || '₱';
  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form State
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState('');
  const [formDepartment, setFormDepartment] = useState('Facilities & Operations');
  const [formFundId, setFormFundId] = useState(data.funds[0]?.id || '');
  const [formMonthlyBudget, setFormMonthlyBudget] = useState<number>(0);
  const [formAnnualBudget, setFormAnnualBudget] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');

  const openNewModal = (type: 'income' | 'expense') => {
    setEditingItem(null);
    setFormType(type);
    setFormCategory('');
    setFormDepartment(type === 'income' ? 'General Stewardship' : 'Facilities & Operations');
    setFormFundId(data.funds[0]?.id || '');
    setFormMonthlyBudget(0);
    setFormAnnualBudget(0);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormCategory(item.category);
    setFormDepartment(item.department);
    setFormFundId(item.fundId);
    setFormMonthlyBudget(item.monthlyBudget);
    setFormAnnualBudget(item.annualBudget);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateBudgetItem({
        ...editingItem,
        type: formType,
        category: formCategory,
        department: formDepartment,
        fundId: formFundId,
        monthlyBudget: Number(formMonthlyBudget),
        annualBudget: Number(formAnnualBudget) || Number(formMonthlyBudget) * 12,
        notes: formNotes,
      });
    } else {
      addBudgetItem({
        type: formType,
        category: formCategory,
        department: formDepartment,
        fundId: formFundId,
        monthlyBudget: Number(formMonthlyBudget),
        annualBudget: Number(formAnnualBudget) || Number(formMonthlyBudget) * 12,
        notes: formNotes,
      });
    }
    setIsModalOpen(false);
  };

  // Grouped items
  const incomeBudgets = useMemo(() => {
    return data.budget.filter((b) => b.type === 'income');
  }, [data.budget]);

  const expenseBudgets = useMemo(() => {
    return data.budget.filter((b) => b.type === 'expense');
  }, [data.budget]);

  // Aggregate totals
  const totalMonthlyIncomeTarget = incomeBudgets.reduce((sum, b) => sum + b.monthlyBudget, 0);
  const totalMonthlyExpenseBudget = expenseBudgets.reduce((sum, b) => sum + b.monthlyBudget, 0);

  // Actual MTD giving by category
  const getActualIncomeForCategory = (category: string) => {
    return data.collections
      .filter((c) => c.category === category && c.date.startsWith(monthStr))
      .reduce((sum, c) => sum + c.totalAmount, 0);
  };

  // Actual MTD expense by category
  const getActualExpenseForCategory = (category: string) => {
    return data.expenses
      .filter((e) => e.category === category && e.date.startsWith(monthStr) && e.status !== 'void')
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Church Budget Planning & Real-Time Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Governing collection goals and operational expenditure allocations for {monthName} {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openNewModal('income')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income Goal</span>
          </button>
          <button
            onClick={() => openNewModal('expense')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add Expense Line</span>
          </button>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Income Target</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {currency}{totalMonthlyIncomeTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Annualized: {currency}{(totalMonthlyIncomeTarget * 12).toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Expense Budget</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {currency}{totalMonthlyExpenseBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Annualized: {currency}{(totalMonthlyExpenseBudget * 12).toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Planned Operating Margin</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-blue-700 mt-1">
            {currency}{(totalMonthlyIncomeTarget - totalMonthlyExpenseBudget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Target monthly reserve accumulation
          </span>
        </div>
      </div>

      {/* EXPENSE BUDGETS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Operating & Ministry Expense Budgets</h3>
            <p className="text-xs text-slate-500">Real-time spend against monthly authorized department limits</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total Cap: {currency}{totalMonthlyExpenseBudget.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase">
                <th className="py-2.5 px-3">Category & Department</th>
                <th className="py-2.5 px-3">Fund</th>
                <th className="py-2.5 px-3 text-right">Monthly Budget</th>
                <th className="py-2.5 px-3 text-right">Actual Spent</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3 text-center w-36">Budget Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenseBudgets.map((item) => {
                const actual = getActualExpenseForCategory(item.category);
                const remaining = item.monthlyBudget - actual;
                const percent = item.monthlyBudget > 0 ? Math.round((actual / item.monthlyBudget) * 100) : 0;
                const fund = data.funds.find((f) => f.id === item.fundId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{item.category}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{item.department}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-600">{fund?.name || 'General Fund'}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {currency}{item.monthlyBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      {currency}{actual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-medium ${remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {remaining >= 0 ? '' : '-'}{currency}{Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            percent > 100 ? 'bg-rose-500' : percent >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold ${
                        percent > 100 ? 'text-rose-700' : percent >= 85 ? 'text-amber-700' : 'text-slate-500'
                      }`}>
                        {percent}% consumed
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove budget line for "${item.category}"?`)) {
                              deleteBudgetItem(item.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INCOME BUDGETS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Offerings & Collection Targets</h3>
            <p className="text-xs text-slate-500">Stewardship goals for weekly giving and capital campaigns</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Target: {currency}{totalMonthlyIncomeTarget.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase">
                <th className="py-2.5 px-3">Offering Category</th>
                <th className="py-2.5 px-3">Designated Fund</th>
                <th className="py-2.5 px-3 text-right">Monthly Goal</th>
                <th className="py-2.5 px-3 text-right">Actual Received</th>
                <th className="py-2.5 px-3 text-right">Goal Variance</th>
                <th className="py-2.5 px-3 text-center w-36">Progress</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomeBudgets.map((item) => {
                const actual = getActualIncomeForCategory(item.category);
                const variance = actual - item.monthlyBudget;
                const percent = item.monthlyBudget > 0 ? Math.round((actual / item.monthlyBudget) * 100) : 0;
                const fund = data.funds.find((f) => f.id === item.fundId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {fund?.name || 'General Fund'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {currency}{item.monthlyBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                      {currency}{actual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-medium ${variance >= 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {variance >= 0 ? '+' : ''}{currency}{variance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-emerald-600"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">{percent}% of goal</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove budget goal for "${item.category}"?`)) {
                              deleteBudgetItem(item.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Edit Budget Item' : `Add ${formType === 'income' ? 'Income Target' : 'Expense Line'}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'income' | 'expense')}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="expense">Expense Budget</option>
                    <option value="income">Income Target</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="General Stewardship">General Stewardship</option>
                    <option value="Pastoral & Ministry">Pastoral & Ministry</option>
                    <option value="Facilities & Operations">Facilities & Operations</option>
                    <option value="Missions & Outreach">Missions & Outreach</option>
                    <option value="Christian Education">Christian Education</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category / Ledger Line</label>
                <input
                  type="text"
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Utilities: Electric, Sound System, Food Pantry"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Fund</label>
                <select
                  value={formFundId}
                  onChange={(e) => setFormFundId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  {data.funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Monthly Budget (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formMonthlyBudget}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormMonthlyBudget(val);
                      setFormAnnualBudget(val * 12);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Annual Budget (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formAnnualBudget}
                    onChange={(e) => setFormAnnualBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Stewardship Guidance Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Guidelines for spending or expected donors"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Save Budget Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
