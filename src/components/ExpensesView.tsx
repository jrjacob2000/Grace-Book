import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  Printer,
  Lock,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { ExpenseItem, PaymentMethod, ExpenseStatus } from '../types/finance';
import { DEFAULT_EXPENSE_CATEGORIES } from '../data/initialData';
import { escapeCsvCell } from '../lib/security';

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
    isCurrentYearClosed,
    isSelectedMonthApproved,
    isMonthApproved,
    requestUserConfirmation,
  } = useChurchFinance();

  const currency = data.profile.currencySymbol || '₱';
  const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month'>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedFundFilter, setSelectedFundFilter] = useState('all');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');

  // Edit & Voucher States
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [voucherItem, setVoucherItem] = useState<ExpenseItem | null>(null);

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

  const initializeNewExpenseForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
    setFormPayee('');
    setFormAmount(0);
    setFormDepartment('Facilities & Operations');
    setFormCategory('Utilities: Electricity, Water & Internet');
    setFormFundId(data.funds[0]?.id || '');
    setFormAccountId(data.accounts[0]?.id || '');
    setFormMethod('check');
    setFormCheckNumber('');
    setFormInvoiceNumber('');
    setFormDescription('');
    setFormApprovedBy(data.profile.treasurer || 'Treasurer');
    setFormStatus('cleared');
  };

  useEffect(() => {
    if (isModalOpen && !editingItem) {
      initializeNewExpenseForm();
    }
  }, [isModalOpen]);

  const openNewModal = () => {
    setEditingItem(null);
    initializeNewExpenseForm();
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
    setEditingItem(null);
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

      const matchesPeriod = periodFilter === 'all' || exp.date.startsWith(monthPrefix);
      const matchesDept = selectedDeptFilter === 'all' || exp.department === selectedDeptFilter;
      const matchesFund = selectedFundFilter === 'all' || exp.fundId === selectedFundFilter;
      const matchesMethod = selectedMethodFilter === 'all' || exp.paymentMethod === selectedMethodFilter;

      return matchesSearch && matchesPeriod && matchesDept && matchesFund && matchesMethod;
    });
  }, [data.expenses, searchQuery, periodFilter, monthPrefix, selectedDeptFilter, selectedFundFilter, selectedMethodFilter]);

  const handleExportExpensesCsv = () => {
    const headers = [
      'Date',
      'Payee',
      'Description',
      'Department',
      'Category',
      'Fund',
      'Bank Account',
      'Payment Method',
      'Check Number',
      'Invoice Number',
      'Amount',
      'Status',
      'Approved By',
    ];
    const rows = filteredExpenses.map((e) => {
      const fundName = data.funds.find((f) => f.id === e.fundId)?.name || e.fundId;
      const acctName = data.accounts.find((a) => a.id === e.accountId)?.name || e.accountId;
      return [
        escapeCsvCell(e.date),
        escapeCsvCell(e.payee),
        escapeCsvCell(e.description),
        escapeCsvCell(e.department),
        escapeCsvCell(e.category),
        escapeCsvCell(fundName),
        escapeCsvCell(acctName),
        escapeCsvCell(e.paymentMethod),
        escapeCsvCell(e.checkNumber || ''),
        escapeCsvCell(e.invoiceNumber || ''),
        e.amount.toFixed(2),
        escapeCsvCell(e.status),
        escapeCsvCell(e.approvedBy),
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `church_expenses_${periodFilter === 'month' ? monthPrefix : selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalDisbursed = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.status !== 'void')
      .reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 pb-12">
      <div className={voucherItem ? 'print:hidden space-y-6' : 'space-y-6'}>
      {/* Audit Lock Banner when Year is Closed or Month Report is Approved */}
      {(isCurrentYearClosed || isSelectedMonthApproved) && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {isCurrentYearClosed ? (
                <>
                  <strong>Fiscal Year {selectedYear} is Closed & Audited:</strong> Modifying historical disbursement records is restricted to preserve year-end rolled-forward balances.
                </>
              ) : (
                <>
                  <strong>{monthName} {selectedYear} Board Report is Approved:</strong> Disbursement records in {monthName} have been formally approved by the Elder Board. Any edits will require audit confirmation.
                </>
              )}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold text-[10px] uppercase shrink-0">
            Audit Protected
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Disbursements & Church Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry operations, staff support, utilities, facilities, and printable check vouchers
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExpensesCsv}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-xs"
            title="Export filtered expenses to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
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
            disabled={isCurrentYearClosed}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
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
          {/* Period Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setPeriodFilter('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                periodFilter === 'month'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {monthName} {selectedYear}
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                periodFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Year ({selectedYear} YTD)
            </button>
          </div>

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
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                            {!isCurrentYearClosed && (
                              <button
                                onClick={() =>
                                  updateExpense({
                                    ...exp,
                                    status: 'cleared',
                                  })
                                }
                                title="Mark check/transfer as Cleared on bank statement"
                                className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/80 px-1.5 py-0.5 rounded transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </div>
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
                            onClick={() => setVoucherItem(exp)}
                            title="View / Print Disbursement Check Voucher"
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (isMonthApproved(exp.date)) {
                                requestUserConfirmation({
                                  title: 'Edit Disbursement in Approved Month?',
                                  message: `The Board Report for ${exp.date.slice(0, 7)} has already been marked as Approved. Are you sure you want to unlock and edit this disbursement record?`,
                                  affectedItem: `${exp.payee} (${exp.date})`,
                                  confirmLabel: 'Unlock & Edit',
                                  isDestructive: false,
                                  onConfirm: () => openEditModal(exp),
                                });
                              } else {
                                openEditModal(exp);
                              }
                            }}
                            disabled={isCurrentYearClosed}
                            title="Edit Disbursement"
                            className="p-1 text-slate-500 hover:text-amber-600 disabled:opacity-40 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const approvedNote = isMonthApproved(exp.date)
                                ? ' NOTE: This record belongs to an Elder Board Approved monthly report!'
                                : '';
                              requestUserConfirmation({
                                title: 'Delete Disbursement Record?',
                                message: `Delete the ${currency}${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} disbursement to "${exp.payee}"? Fund and bank account balances will be restored automatically.${approvedNote}`,
                                affectedItem: `${exp.payee} (${exp.date})`,
                                confirmLabel: 'Delete Disbursement',
                                isDestructive: true,
                                onConfirm: () => deleteExpense(exp.id),
                              });
                            }}
                            disabled={isCurrentYearClosed}
                            title="Delete Disbursement"
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-40 rounded hover:bg-slate-100"
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
      </div>

      {/* RECORD / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
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
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(false);
                }}
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
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(false);
                  }}
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

      {/* PRINTABLE OFFICIAL DISBURSEMENT / CHECK VOUCHER MODAL */}
      {voucherItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:static print:inset-auto print:bg-transparent print:p-0">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-w-none print:max-h-none print:border-slate-400 print:shadow-none">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
              <span className="font-bold text-slate-800 text-sm">
                Official Church Disbursement / Check Voucher (CV)
              </span>
              <button
                onClick={() => setVoucherItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans overflow-y-auto print:p-0">
              {/* Church Voucher Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {data.profile.denomination || 'GRACE CHRISTIAN FELLOWSHIP INTERNATIONAL'}
                </p>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  {data.profile.name || 'Grace Fellowship Community Church'}
                </h3>
                <p className="text-[11px] text-slate-600">
                  {data.profile.address}
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white font-bold text-[11px] tracking-widest uppercase rounded">
                  Cash / Check Disbursement Voucher
                </div>
              </div>

              {/* Payee & Voucher Metadata */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-semibold">Payee / Recipient</span>
                  <span className="font-bold text-slate-900 text-sm">{voucherItem.payee}</span>
                  <span className="text-[11px] text-slate-600 block mt-1">
                    Dept: <strong>{voucherItem.department}</strong>
                  </span>
                </div>
                <div className="text-right font-mono space-y-0.5">
                  <div>
                    <span className="text-[10px] font-sans uppercase text-slate-500">Voucher Date: </span>
                    <strong className="text-slate-900">{voucherItem.date}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans uppercase text-slate-500">Check / Ref #: </span>
                    <strong className="text-slate-900">
                      {voucherItem.checkNumber || voucherItem.invoiceNumber || voucherItem.paymentMethod.toUpperCase()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans uppercase text-slate-500">Status: </span>
                    <strong className="uppercase text-slate-800">{voucherItem.status}</strong>
                  </div>
                </div>
              </div>

              {/* Fund & Account Allocation */}
              <div className="grid grid-cols-2 gap-2 text-slate-700 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Charged to Designated Fund</span>
                  <strong>{data.funds.find((f) => f.id === voucherItem.fundId)?.name || 'General Fund'}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Disbursed From Depository Account</span>
                  <strong>{data.accounts.find((a) => a.id === voucherItem.accountId)?.name || 'Checking Account'}</strong>
                </div>
              </div>

              {/* Particulars Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase text-[10px]">
                      <th className="py-2 px-3">Particulars / Expense Description</th>
                      <th className="py-2 px-3">Ledger Category</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-3 px-3 text-slate-800">{voucherItem.description}</td>
                      <td className="py-3 px-3 text-slate-600">{voucherItem.category}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {currency}{voucherItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-[11px]">
                        Total Amount Disbursed:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm">
                        {currency}{voucherItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4-Block Governance Signatures */}
              <div className="pt-4 grid grid-cols-2 gap-x-6 gap-y-6 text-center">
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-900">
                    {data.profile.treasurer || 'Church Treasurer'}
                  </p>
                  <span className="text-[10px] text-slate-500">Prepared By (Church Treasurer)</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-900">
                    {data.profile.auditor1 || 'Church Auditor'}
                  </p>
                  <span className="text-[10px] text-slate-500">Audited & Verified By (Auditor)</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-900">
                    {voucherItem.approvedBy || data.profile.seniorPastor || 'Senior Pastor / Board'}
                  </p>
                  <span className="text-[10px] text-slate-500">Approved For Payment By</span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-900">{voucherItem.payee}</p>
                  <span className="text-[10px] text-slate-500">Payment Received By (Signature & Date)</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Check Voucher</span>
              </button>
              <button
                onClick={() => setVoucherItem(null)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
