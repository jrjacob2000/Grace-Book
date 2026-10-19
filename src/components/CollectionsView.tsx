import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Printer,
  Trash2,
  Edit2,
  CheckCircle,
  FileText,
  Calendar,
  X,
  UserCheck,
  CreditCard,
  Banknote,
  Upload,
  Download,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { CollectionItem, ServiceType, CashBreakdown } from '../types/finance';
import { DEFAULT_COLLECTION_CATEGORIES } from '../data/initialData';
import { escapeCsvCell, toSafeNumber } from '../lib/security';

interface CollectionsViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onOpenImport?: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  isModalOpen,
  setIsModalOpen,
  onOpenImport,
}) => {
  const {
    data,
    addCollection,
    updateCollection,
    deleteCollection,
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
  const [selectedFundFilter, setSelectedFundFilter] = useState('all');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');

  // Edit / Count Slip states
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [countSlipItem, setCountSlipItem] = useState<CollectionItem | null>(null);

  // Form state
  const defaultDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const [formDate, setFormDate] = useState(defaultDate);
  const [formService, setFormService] = useState<ServiceType>('sunday_morning');
  const [formFundId, setFormFundId] = useState(data.funds[0]?.id || '');
  const [formAccountId, setFormAccountId] = useState(data.accounts[0]?.id || '');
  const [formCategory, setFormCategory] = useState('Tithes & General Offerings');
  const [formChecksAmount, setFormChecksAmount] = useState<number>(0);
  const [formDigitalAmount, setFormDigitalAmount] = useState<number>(0);
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formCounter1, setFormCounter1] = useState('');
  const [formCounter2, setFormCounter2] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Cash Breakdown state for Philippine Peso currency count sheet
  const [cashCounts, setCashCounts] = useState<CashBreakdown>({
    thousands: 0,
    fiveHundreds: 0,
    twoHundreds: 0,
    hundreds: 0,
    fifties: 0,
    twenties: 0,
    tens: 0,
    fives: 0,
    ones: 0,
    coins: 0,
  });

  // Calculate Cash Total from Philippine Peso breakdown
  const computedCashTotal = useMemo(() => {
    return (
      (cashCounts.thousands || 0) * 1000 +
      (cashCounts.fiveHundreds || 0) * 500 +
      (cashCounts.twoHundreds || 0) * 200 +
      (cashCounts.hundreds || 0) * 100 +
      (cashCounts.fifties || 0) * 50 +
      (cashCounts.twenties || 0) * 20 +
      (cashCounts.tens || 0) * 10 +
      (cashCounts.fives || 0) * 5 +
      (cashCounts.ones || 0) * 1 +
      Number(cashCounts.coins || 0)
    );
  }, [cashCounts]);

  const computedTotalOffering = useMemo(() => {
    return computedCashTotal + Number(formChecksAmount || 0) + Number(formDigitalAmount || 0);
  }, [computedCashTotal, formChecksAmount, formDigitalAmount]);

  const initializeNewForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormDate(today);
    setFormService('sunday_morning');
    setFormFundId(data.funds[0]?.id || '');
    setFormAccountId(data.accounts[0]?.id || '');
    setFormCategory('Tithes & General Offerings');
    setCashCounts({
      thousands: 0,
      fiveHundreds: 0,
      twoHundreds: 0,
      hundreds: 0,
      fifties: 0,
      twenties: 0,
      tens: 0,
      fives: 0,
      ones: 0,
      coins: 0,
    });
    setFormChecksAmount(0);
    setFormDigitalAmount(0);
    setFormBatchNumber(`SUN-${today.replace(/-/g, '')}`);
    setFormCounter1(data.profile.auditor1 || '');
    setFormCounter2(data.profile.auditor2 || '');
    setFormNotes('');
  };

  // Ensure form defaults are populated if modal is opened directly from Dashboard quick action
  useEffect(() => {
    if (isModalOpen && !editingItem) {
      initializeNewForm();
    }
  }, [isModalOpen]);

  const openNewModal = () => {
    setEditingItem(null);
    initializeNewForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: CollectionItem) => {
    setEditingItem(item);
    setFormDate(item.date);
    setFormService(item.serviceType);
    setFormFundId(item.fundId);
    setFormAccountId(item.accountId);
    setFormCategory(item.category);
    setCashCounts(
      item.cashBreakdown || {
        thousands: 0,
        fiveHundreds: 0,
        twoHundreds: 0,
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        ones: 0,
        coins: item.cashAmount || 0,
      }
    );
    setFormChecksAmount(item.checksAmount);
    setFormDigitalAmount(item.digitalAmount);
    setFormBatchNumber(item.batchNumber || '');
    setFormCounter1(item.counters[0] || '');
    setFormCounter2(item.counters[1] || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const counters = [formCounter1, formCounter2].filter(Boolean);

    const safeChecks = Math.max(0, toSafeNumber(formChecksAmount, 0));
    const safeDigital = Math.max(0, toSafeNumber(formDigitalAmount, 0));
    const safeCash = Math.max(0, toSafeNumber(computedCashTotal, 0));
    const safeTotal = safeCash + safeChecks + safeDigital;

    if (editingItem) {
      updateCollection({
        ...editingItem,
        date: formDate,
        serviceType: formService,
        fundId: formFundId,
        accountId: formAccountId,
        category: formCategory,
        totalAmount: safeTotal,
        cashAmount: safeCash,
        checksAmount: safeChecks,
        digitalAmount: safeDigital,
        cashBreakdown: cashCounts,
        batchNumber: formBatchNumber,
        counters,
        notes: formNotes,
      });
    } else {
      addCollection({
        date: formDate,
        serviceType: formService,
        fundId: formFundId,
        accountId: formAccountId,
        category: formCategory,
        totalAmount: safeTotal,
        cashAmount: safeCash,
        checksAmount: safeChecks,
        digitalAmount: safeDigital,
        cashBreakdown: cashCounts,
        batchNumber: formBatchNumber,
        counters,
        notes: formNotes,
      });
    }
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // Filtered collections
  const filteredCollections = useMemo(() => {
    return data.collections.filter((col) => {
      const matchesSearch =
        col.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.counters.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPeriod = periodFilter === 'all' || col.date.startsWith(monthPrefix);
      const matchesFund = selectedFundFilter === 'all' || col.fundId === selectedFundFilter;
      const matchesService = selectedServiceFilter === 'all' || col.serviceType === selectedServiceFilter;

      return matchesSearch && matchesPeriod && matchesFund && matchesService;
    });
  }, [data.collections, searchQuery, periodFilter, monthPrefix, selectedFundFilter, selectedServiceFilter]);

  const handleExportCollectionsCsv = () => {
    const headers = [
      'Date',
      'Service Type',
      'Batch Number',
      'Category',
      'Fund',
      'Bank Account',
      'Cash Amount',
      'Checks Amount',
      'Digital Amount',
      'Total Offering',
      'First Auditor/Counter',
      'Second Auditor/Counter',
      'Notes',
    ];
    const rows = filteredCollections.map((c) => {
      const fundName = data.funds.find((f) => f.id === c.fundId)?.name || c.fundId;
      const acctName = data.accounts.find((a) => a.id === c.accountId)?.name || c.accountId;
      return [
        escapeCsvCell(c.date),
        escapeCsvCell(c.serviceType),
        escapeCsvCell(c.batchNumber || ''),
        escapeCsvCell(c.category),
        escapeCsvCell(fundName),
        escapeCsvCell(acctName),
        c.cashAmount.toFixed(2),
        c.checksAmount.toFixed(2),
        c.digitalAmount.toFixed(2),
        c.totalAmount.toFixed(2),
        escapeCsvCell(c.counters[0] || ''),
        escapeCsvCell(c.counters[1] || ''),
        escapeCsvCell(c.notes || ''),
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `church_collections_${periodFilter === 'month' ? monthPrefix : selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Aggregate stats
  const totalCollections = useMemo(() => {
    return filteredCollections.reduce((acc, c) => acc + c.totalAmount, 0);
  }, [filteredCollections]);

  const totalCash = useMemo(() => {
    return filteredCollections.reduce((acc, c) => acc + c.cashAmount, 0);
  }, [filteredCollections]);

  const totalChecks = useMemo(() => {
    return filteredCollections.reduce((acc, c) => acc + c.checksAmount, 0);
  }, [filteredCollections]);

  const totalDigital = useMemo(() => {
    return filteredCollections.reduce((acc, c) => acc + c.digitalAmount, 0);
  }, [filteredCollections]);

  return (
    <div className="space-y-6 pb-12">
      <div className={countSlipItem ? 'print:hidden space-y-6' : 'space-y-6'}>
      {/* Audit Lock Banner when Year is Closed or Month Report is Approved */}
      {(isCurrentYearClosed || isSelectedMonthApproved) && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {isCurrentYearClosed ? (
                <>
                  <strong>Fiscal Year {selectedYear} is Closed & Audited:</strong> Modifying historical collection records is restricted to preserve year-end rolled-forward balances.
                </>
              ) : (
                <>
                  <strong>{monthName} {selectedYear} Board Report is Approved:</strong> Collection records in {monthName} have been formally approved by the Elder Board. Any edits will require audit confirmation.
                </>
              )}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold text-[10px] uppercase shrink-0">
            Audit Protected
          </span>
        </div>
      )}
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tithe & Offering Collections
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sunday count sheets, designated envelopes, dual-counter verification, and fund allocation
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCollectionsCsv}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-xs"
            title="Export filtered collections to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import CSV</span>
            </button>
          )}
          <button
            onClick={openNewModal}
            disabled={isCurrentYearClosed}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Offering</span>
          </button>
        </div>
      </div>

      {/* Aggregate breakdown chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Offerings</span>
          <p className="text-lg font-bold font-mono text-emerald-700 mt-1">
            {currency}{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cash Count</span>
          </span>
          <p className="text-lg font-bold font-mono text-slate-800 mt-1">
            {currency}{totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Checks Deposited</span>
          </span>
          <p className="text-lg font-bold font-mono text-slate-800 mt-1">
            {currency}{totalChecks.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>Digital / Online</span>
          </span>
          <p className="text-lg font-bold font-mono text-slate-800 mt-1">
            {currency}{totalDigital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search collections by note, batch, or counter..."
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
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
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
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Year ({selectedYear} YTD)
            </button>
          </div>

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

          {/* Service Filter */}
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Services</option>
            <option value="sunday_morning">Sunday Morning</option>
            <option value="sunday_evening">Sunday Evening</option>
            <option value="midweek_prayer">Midweek Service</option>
            <option value="special_event">Special Event</option>
            <option value="online_giving">Online Giving</option>
          </select>
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Service & Batch</th>
                <th className="py-3 px-4">Target Fund</th>
                <th className="py-3 px-4 text-right">Cash</th>
                <th className="py-3 px-4 text-right">Checks</th>
                <th className="py-3 px-4 text-right">Digital</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Total Offering</th>
                <th className="py-3 px-4">Counters</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No collection records matching filters.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((item) => {
                  const fund = data.funds.find((f) => f.id === item.fundId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-800">
                        {item.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 capitalize">
                          {item.serviceType.replace(/_/g, ' ')}
                        </div>
                        {item.batchNumber && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {item.batchNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: fund?.color || '#3b82f6' }}
                          />
                          <span>{fund?.name || 'General Fund'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {currency}{item.cashAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {currency}{item.checksAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {currency}{item.digitalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {currency}{item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.counters.length > 0 ? (
                          <div className="flex items-center gap-1.5 text-[11px]" title={item.counters.join(' & ')}>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800 truncate max-w-[150px]">{item.counters.join(', ')}</span>
                              <span className="text-[10px] text-emerald-700 font-medium">Dual Auditors Verified</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None logged</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setCountSlipItem(item)}
                            title="View/Print Count Slip"
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (isMonthApproved(item.date)) {
                                requestUserConfirmation({
                                  title: 'Edit Collection in Approved Month?',
                                  message: `The Board Report for ${item.date.slice(0, 7)} has already been marked as Approved. Are you sure you want to unlock and edit this collection record?`,
                                  affectedItem: `${item.category} (${item.date})`,
                                  confirmLabel: 'Unlock & Edit',
                                  isDestructive: false,
                                  onConfirm: () => openEditModal(item),
                                });
                              } else {
                                openEditModal(item);
                              }
                            }}
                            disabled={isCurrentYearClosed}
                            title="Edit Record"
                            className="p-1 text-slate-500 hover:text-amber-600 disabled:opacity-40 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const approvedNote = isMonthApproved(item.date)
                                ? ' NOTE: This record belongs to an Elder Board Approved monthly report!'
                                : '';
                              requestUserConfirmation({
                                title: 'Delete Collection Record?',
                                message: `Delete the ${currency}${item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} collection from ${item.date}? Target fund and bank account balances will be adjusted automatically.${approvedNote}`,
                                affectedItem: `${item.category} (${item.date})`,
                                confirmLabel: 'Delete Collection',
                                isDestructive: true,
                                onConfirm: () => deleteCollection(item.id),
                              });
                            }}
                            disabled={isCurrentYearClosed}
                            title="Delete Record"
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

      {/* RECORD / EDIT OFFERING MODAL with SUNDAY COUNT SHEET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingItem ? 'Edit Collection Record' : 'Record Sunday Tithes & Offerings'}
                  </h3>
                  <p className="text-xs text-slate-500">Official Teller Count Sheet & Fund Allocation</p>
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

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Service Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Service Type</label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value as ServiceType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
                  >
                    <option value="sunday_morning">Sunday Morning Service</option>
                    <option value="sunday_evening">Sunday Evening Service</option>
                    <option value="midweek_prayer">Midweek Prayer Gathering</option>
                    <option value="youth_service">NextGen Youth Service</option>
                    <option value="special_event">Special Concert / Guest Service</option>
                    <option value="online_giving">Online Platform Remittance</option>
                    <option value="mail_in">Mail-in Stewardship Check</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    placeholder="e.g. SUN-2026-10-W3"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Collection Category Selector */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Giving Category Dropdown</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs bg-white font-medium"
                >
                  {(data.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {!((data.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES).includes(formCategory)) && formCategory && (
                    <option value={formCategory}>{formCategory} (Custom)</option>
                  )}
                </select>
              </div>

              {/* Fund & Account Destinations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designated Fund</label>
                  <select
                    value={formFundId}
                    onChange={(e) => setFormFundId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    {data.funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.type === 'unrestricted' ? 'Operating' : 'Restricted'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Deposited To Bank Account</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.institution})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currency Count Sheet in Philippine Peso */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Philippine Peso Cash Count Sheet</span>
                  </h4>
                  <span className="font-mono font-bold text-emerald-700">
                    Cash Subtotal: {currency}{computedCashTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">₱1,000 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={cashCounts.thousands || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, thousands: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">₱500 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={cashCounts.fiveHundreds || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, fiveHundreds: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">₱200 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={cashCounts.twoHundreds || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, twoHundreds: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">₱100 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={cashCounts.hundreds || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, hundreds: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">₱50 Bills</label>
                    <input
                      type="number"
                      min="0"
                      value={cashCounts.fifties || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, fifties: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">₱20 Bills / Coins</label>
                    <input
                      type="number"
                      min="0"
                      value={cashCounts.twenties || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, twenties: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-0.5">Coins Total Value (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashCounts.coins || ''}
                      onChange={(e) => setCashCounts({ ...cashCounts, coins: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Checks & Digital Amounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Total Checks Deposited (₱)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formChecksAmount || ''}
                    onChange={(e) => setFormChecksAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    <span>Digital / Online (GCash, Maya, Bank) (₱)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formDigitalAmount || ''}
                    onChange={(e) => setFormDigitalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Dual Auditor Verification (Both Auditors Required) */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-800" />
                    <span className="font-semibold text-amber-900 text-xs">
                      Dual Counters / Auditors Verification
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 bg-amber-100/90 font-medium px-2 py-0.5 rounded-full border border-amber-300">
                    Dual Custody Required
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-amber-900 mb-0.5 font-medium">
                      First Teller / Auditor <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCounter1}
                      onChange={(e) => setFormCounter1(e.target.value)}
                      placeholder="e.g. Deacon Samuel Brooks"
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-amber-900 mb-0.5 font-medium">
                      Second Teller / Auditor <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formCounter2}
                      onChange={(e) => setFormCounter2(e.target.value)}
                      placeholder="e.g. Claire Bennett"
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-800/80 italic">
                  Dual-custody verification: Two designated counters/auditors must verify the physical count sheet before fund posting.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Service & Stewardship Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Attendance 245. Communion Sunday special missions plate."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Grand Total Summary Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-900">Computed Deposit Total</span>
                  <p className="text-[11px] text-emerald-700">
                    Cash ({currency}{computedCashTotal.toFixed(2)}) + Checks ({currency}{(formChecksAmount || 0).toFixed(2)}) + Digital ({currency}{(formDigitalAmount || 0).toFixed(2)})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-emerald-800">
                    {currency}{computedTotalOffering.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {editingItem ? 'Update Offering' : 'Verify & Post Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE SUNDAY COUNT SLIP MODAL */}
      {countSlipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:static print:inset-auto print:bg-transparent print:p-0">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print:max-w-none print:max-h-none print:border-slate-400 print:shadow-none">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
              <span className="font-bold text-slate-800 text-sm">Official Sunday Offering Verification Slip</span>
              <button
                onClick={() => setCountSlipItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans print:p-0">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900">{data.profile.name}</h3>
                <p className="text-[11px] text-slate-500">Tithe & Offering Count Certificate</p>
                <p className="font-mono text-slate-600 mt-1">Batch: {countSlipItem.batchNumber || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Date: <strong className="font-mono">{countSlipItem.date}</strong></div>
                <div>Service: <strong className="capitalize">{countSlipItem.serviceType.replace(/_/g, ' ')}</strong></div>
                <div>Fund: <strong>{data.funds.find((f) => f.id === countSlipItem.fundId)?.name}</strong></div>
                <div>Account: <strong>{data.accounts.find((a) => a.id === countSlipItem.accountId)?.name}</strong></div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Cash Subtotal:</span>
                  <span>{currency}{countSlipItem.cashAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Checks Subtotal:</span>
                  <span>{currency}{countSlipItem.checksAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Digital / Electronic:</span>
                  <span>{currency}{countSlipItem.digitalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-1.5 font-bold text-slate-900 text-sm">
                  <span>Total Deposit:</span>
                  <span>{currency}{countSlipItem.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {countSlipItem.notes && (
                <div className="text-slate-600 italic text-[11px]">
                  Notes: "{countSlipItem.notes}"
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 text-[11px]">Dual Auditor Certification & Sign-offs:</p>
                  <span className="text-[10px] text-emerald-700 font-medium">Dual Custody Verification</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-t border-slate-400 pt-1 text-center">
                    <p className="font-medium text-slate-800">{countSlipItem.counters[0] || 'First Auditor'}</p>
                    <span className="text-[10px] text-slate-500">First Auditor Signature & Date</span>
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-center">
                    <p className="font-medium text-slate-800">{countSlipItem.counters[1] || 'Second Auditor'}</p>
                    <span className="text-[10px] text-slate-500">Second Auditor Signature & Date</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setCountSlipItem(null)}
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
