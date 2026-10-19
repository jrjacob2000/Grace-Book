import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ArrowDownRight,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Ban,
  X,
  CreditCard,
  FileCheck,
  Building,
  Upload,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { ExpenseItem, PaymentMethod, ExpenseStatus } from '../types/finance';
import { DEFAULT_EXPENSE_CATEGORIES } from '../data/initialData';

interface ExpensesViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onOpenImport?: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  isModalOpen,
  setIsModalOpen,
  onOpenImport,
}) => {
  const {
    data,
    addExpense,
    updateExpense,
    deleteExpense,
    selectedYear,
    selectedMonth,
  } = useChurchFinance();

  const currency = data.profile.currencySymbol || '₱';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedFundFilter, setSelectedFundFilter] = useState('all');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');

  // Edit State
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  // Form Fields
  const defaultDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-05`;
  const [formDate, setFormDate] = useState(defaultDate);
  const [formPayee, setFormPayee] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDepartment, setFormDepartment] = useState('Pastoral & Ministry');
  const [formCategory, setFormCategory] = useState('Pastoral Salary & Housing Allowance');
  const [formFundId, setFormFundId] = useState(data.funds[0]?.id || '');
  const [formAccountId, setFormAccountId] = useState(data.accounts[0]?.id || '');
  const [formMethod, setFormMethod] = useState<PaymentMethod>('ach_transfer');
  const [formCheckNumber, setFormCheckNumber] = useState('');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formApprovedBy, setFormApprovedBy] = useState('Treasurer');
  const [formStatus, setFormStatus] = useState<ExpenseStatus>('cleared');

  const openNewModal = () => {
    setEditingItem(null);
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
    setFormPayee('');
    setFormAmount(0);
    setFormDepartment('Facilities & Operations');
    setFormCategory('Utilities: Electricity & Heating');
    setFormFundId(data.funds[0]?.id || '');
    setFormAccountId(data.accounts[0]?.id || '');
    setFormMethod('check');
    setFormCheckNumber('');
    setFormInvoiceNumber('');
    setFormDescription('');
    setFormApprovedBy(data.profile.treasurer || 'Treasurer');
    setFormStatus('cleared');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    setEditingItem(item);
    setFormDate(item.date);
    setFormPayee(item.payee);
    setFormAmount(item.amount);
    setFormDepartment(item.department);
    setFormCategory(item.category);
    setFormFundId(item.fundId);
    setFormAccountId(item.accountId);
    setFormMethod(item.paymentMethod);
    setFormCheckNumber(item.checkNumber || '');
    setFormInvoiceNumber(item.invoiceNumber || '');
    setFormDescription(item.description);
    setFormApprovedBy(item.approvedBy);
    setFormStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      updateExpense({
        ...editingItem,
        date: formDate,
        payee: formPayee,
        amount: Number(formAmount),
        department: formDepartment,
        category: formCategory,
        fundId: formFundId,
        accountId: formAccountId,
        paymentMethod: formMethod,
        checkNumber: formCheckNumber,
        invoiceNumber: formInvoiceNumber,
        description: formDescription,
        approvedBy: formApprovedBy,
        status: formStatus,
      });
    } else {
      addExpense({
        date: formDate,
        payee: formPayee,
        amount: Number(formAmount),
        department: formDepartment,
        category: formCategory,
        fundId: formFundId,
        accountId: formAccountId,
        paymentMethod: formMethod,
        checkNumber: formCheckNumber,
        invoiceNumber: formInvoiceNumber,
        description: formDescription,
        approvedBy: formApprovedBy,
        status: formStatus,
      });
    }
    setIsModalOpen(false);
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return data.expenses.filter((exp) => {
      const matchesSearch =
        exp.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.checkNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDeptFilter === 'all' || exp.department === selectedDeptFilter;
      const matchesFund = selectedFundFilter === 'all' || exp.fundId === selectedFundFilter;
      const matchesMethod = selectedMethodFilter === 'all' || exp.paymentMethod === selectedMethodFilter;

      return matchesSearch && matchesDept && matchesFund && matchesMethod;
    });
  }, [data.expenses, searchQuery, selectedDeptFilter, selectedFundFilter, selectedMethodFilter]);

  const totalDisbursed = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.status !== 'void')
      .reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Disbursements & Church Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry operations, staff support, utilities, facilities, and missions remittances
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg border border-rose-300 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-rose-600" />
              <span>Import CSV</span>
            </button>
          )}
          <button
            onClick={openNewModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Record New Disbursement</span>
          </button>
        </div>
      </div>

      {/* Aggregate summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Filtered Disbursements</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {currency}{totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Checks / ACH</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {filteredExpenses.filter((e) => e.paymentMethod === 'check' || e.paymentMethod === 'ach_transfer').length} Transactions
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Audit Status</span>
          <p className="text-xs font-medium text-emerald-700 mt-2 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>All disbursements logged with designated approvals</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by payee, check #, invoice, or memo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Pastoral & Ministry">Pastoral & Ministry</option>
            <option value="Facilities & Operations">Facilities & Operations</option>
            <option value="Missions & Outreach">Missions & Outreach</option>
            <option value="Christian Education">Christian Education</option>
            <option value="Administration">Administration</option>
          </select>

          {/* Fund Filter */}
          <select
            value={selectedFundFilter}
            onChange={(e) => setSelectedFundFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Funds</option>
            {data.funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedMethodFilter}
            onChange={(e) => setSelectedMethodFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Methods</option>
            <option value="check">Check</option>
            <option value="ach_transfer">ACH Direct Transfer</option>
            <option value="debit_card">Debit Card</option>
            <option value="cash">Petty Cash</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payee & Memo</th>
                <th className="py-3 px-4">Department & Category</th>
                <th className="py-3 px-4">Fund & Account</th>
                <th className="py-3 px-4">Ref / Check</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No expense records matching filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const fund = data.funds.find((f) => f.id === exp.fundId);
                  const acct = data.accounts.find((a) => a.id === exp.accountId);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{exp.payee}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {exp.description}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">{exp.category}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{exp.department}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: fund?.color || '#3b82f6' }}
                          />
                          <span className="truncate max-w-[130px]">{fund?.name || 'General Fund'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-3.5">
                          {acct?.name || 'Checking'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {exp.checkNumber ? (
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            Check #{exp.checkNumber}
                          </span>
                        ) : exp.invoiceNumber ? (
                          <span className="text-slate-500 text-[11px]">{exp.invoiceNumber}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px] capitalize">{exp.paymentMethod}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {currency}{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        {exp.status === 'cleared' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Cleared
                          </span>
                        ) : exp.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <Ban className="w-3 h-3" /> Void
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 truncate max-w-[120px]">
                        {exp.approvedBy}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            title="Edit Disbursement"
                            className="p-1 text-slate-500 hover:text-amber-600 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this expense? Fund and account balances will be restored.')) {
                                deleteExpense(exp.id);
                              }
                            }}
                            title="Delete Disbursement"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingItem ? 'Edit Church Disbursement' : 'Record Church Disbursement / Bill'}
                  </h3>
                  <p className="text-xs text-slate-500">Fund deduction and bank check authorization</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payee / Vendor / Recipient</label>
                <input
                  type="text"
                  required
                  value={formPayee}
                  onChange={(e) => setFormPayee(e.target.value)}
                  placeholder="e.g. City Water, Light & Power, or Pastor David Miller"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ministry Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="Pastoral & Ministry">Pastoral & Ministry</option>
                    <option value="Facilities & Operations">Facilities & Operations</option>
                    <option value="Missions & Outreach">Missions & Outreach</option>
                    <option value="Christian Education">Christian Education</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expense Category Dropdown</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white font-medium"
                  >
                    {(data.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!((data.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES).includes(formCategory)) && formCategory && (
                      <option value={formCategory}>{formCategory} (Custom)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Fund and Account Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Charge Against Fund</label>
                  <select
                    value={formFundId}
                    onChange={(e) => setFormFundId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    {data.funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({currency}{f.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Disburse From Bank Account</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({currency}{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="check">Church Check</option>
                    <option value="ach_transfer">ACH Direct Transfer</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="cash">Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Check Number</label>
                  <input
                    type="text"
                    value={formCheckNumber}
                    onChange={(e) => setFormCheckNumber(e.target.value)}
                    placeholder="e.g. 4412"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Invoice / Receipt #</label>
                  <input
                    type="text"
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-9902"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Memo / Purpose Description</label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed purpose, congregational approval reference or invoice itemization"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Authorized / Approved By</label>
                  <input
                    type="text"
                    required
                    value={formApprovedBy}
                    onChange={(e) => setFormApprovedBy(e.target.value)}
                    placeholder="e.g. Trustee Board, Pastor, Treasurer"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Audit Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ExpenseStatus)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="cleared">Cleared (Reconciled with Bank)</option>
                    <option value="pending">Pending (Check in-transit / uncashed)</option>
                    <option value="void">Void</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {editingItem ? 'Update Disbursement' : 'Post Disbursement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
