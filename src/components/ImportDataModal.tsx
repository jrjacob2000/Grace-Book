import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  X,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  HelpCircle,
  RotateCcw,
  Building,
  Wallet,
  Coins,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import {
  ChurchFinancialData,
  CollectionItem,
  ExpenseItem,
  ServiceType,
  PaymentMethod,
} from '../types/finance';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'json' | 'collections-csv' | 'expenses-csv' | 'sample';
}

// Simple robust CSV line parser handling quotes
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'json',
}) => {
  const {
    data,
    selectedYear,
    importJsonFile,
    importCollectionsBatch,
    importExpensesBatch,
    resetToSampleData,
  } = useChurchFinance();

  const [activeTab, setActiveTab] = useState<'json' | 'collections-csv' | 'expenses-csv' | 'sample'>(
    initialTab
  );

  // JSON Import State
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [parsedJson, setParsedJson] = useState<ChurchFinancialData | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // CSV Collections State
  const [collectionsCsvText, setCollectionsCsvText] = useState('');
  const [collectionsFile, setCollectionsFile] = useState<File | null>(null);
  const [collectionsFallbackFund, setCollectionsFallbackFund] = useState(data.funds[0]?.id || '');
  const [collectionsFallbackAccount, setCollectionsFallbackAccount] = useState(data.accounts[0]?.id || '');
  const [collectionsFeedback, setCollectionsFeedback] = useState<string | null>(null);

  // CSV Expenses State
  const [expensesCsvText, setExpensesCsvText] = useState('');
  const [expensesFile, setExpensesFile] = useState<File | null>(null);
  const [expensesFallbackFund, setExpensesFallbackFund] = useState(data.funds[0]?.id || '');
  const [expensesFallbackAccount, setExpensesFallbackAccount] = useState(data.accounts[0]?.id || '');
  const [expensesFeedback, setExpensesFeedback] = useState<string | null>(null);

  const fileInputRefJson = useRef<HTMLInputElement>(null);
  const fileInputRefCollections = useRef<HTMLInputElement>(null);
  const fileInputRefExpenses = useRef<HTMLInputElement>(null);

  const currency = data.profile.currencySymbol || '₱';

  // Handle JSON file selection
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonFile(file);
    setJsonError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as ChurchFinancialData;

        // Basic schema verification
        if (!parsed.profile || !Array.isArray(parsed.funds) || !Array.isArray(parsed.accounts)) {
          throw new Error('File is missing core church data structures (profile, funds, or accounts).');
        }

        setParsedJson(parsed);
      } catch (err: any) {
        setJsonError(err.message || 'Invalid JSON file format.');
        setParsedJson(null);
      }
    };
    reader.onerror = () => {
      setJsonError('Failed to read selected file.');
      setParsedJson(null);
    };
    reader.readAsText(file);
  };

  // Execute JSON Import
  const handleExecuteJsonImport = () => {
    if (!parsedJson) return;
    importJsonFile(parsedJson);
    onClose();
  };

  // Parse Collections CSV Rows
  const parsedCollections = useMemo(() => {
    if (!collectionsCsvText.trim()) return [];
    const lines = collectionsCsvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('total'));
    const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('type') || h.includes('offering'));
    const fundIdx = headers.findIndex((h) => h.includes('fund'));
    const accountIdx = headers.findIndex((h) => h.includes('account') || h.includes('bank'));
    const cashIdx = headers.findIndex((h) => h.includes('cash'));
    const checksIdx = headers.findIndex((h) => h.includes('check'));
    const digitalIdx = headers.findIndex((h) => h.includes('digital') || h.includes('online') || h.includes('gcash'));
    const countersIdx = headers.findIndex((h) => h.includes('counter') || h.includes('teller') || h.includes('auditor'));
    const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('memo') || h.includes('batch'));

    const items: Array<Omit<CollectionItem, 'id' | 'createdAt'>> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => !c)) continue;

      const rawDate = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().split('T')[0];
      const date = rawDate && rawDate.match(/^\d{4}-\d{2}-\d{2}$/) ? rawDate : new Date().toISOString().split('T')[0];

      const rawAmount = amountIdx >= 0 ? cols[amountIdx].replace(/[^0-9.-]/g, '') : '0';
      const totalAmount = parseFloat(rawAmount) || 0;
      if (totalAmount <= 0) continue;

      // Matching fund
      let fundId = collectionsFallbackFund;
      if (fundIdx >= 0 && cols[fundIdx]) {
        const query = cols[fundIdx].toLowerCase().trim();
        const matched = data.funds.find(
          (f) =>
            f.id.toLowerCase() === query ||
            f.code.toLowerCase() === query ||
            f.name.toLowerCase().includes(query)
        );
        if (matched) fundId = matched.id;
      }

      // Matching account
      let accountId = collectionsFallbackAccount;
      if (accountIdx >= 0 && cols[accountIdx]) {
        const query = cols[accountIdx].toLowerCase().trim();
        const matched = data.accounts.find(
          (a) =>
            a.id.toLowerCase() === query ||
            a.name.toLowerCase().includes(query) ||
            a.accountNumberLast4 === query
        );
        if (matched) accountId = matched.id;
      }

      const category = categoryIdx >= 0 && cols[categoryIdx] ? cols[categoryIdx] : 'Tithes & Offerings';
      const cashAmount = cashIdx >= 0 ? parseFloat(cols[cashIdx].replace(/[^0-9.-]/g, '')) || totalAmount : totalAmount;
      const checksAmount = checksIdx >= 0 ? parseFloat(cols[checksIdx].replace(/[^0-9.-]/g, '')) || 0 : 0;
      const digitalAmount = digitalIdx >= 0 ? parseFloat(cols[digitalIdx].replace(/[^0-9.-]/g, '')) || 0 : 0;
      const counters = countersIdx >= 0 && cols[countersIdx]
        ? cols[countersIdx].split(/[,;/]/).map((c) => c.trim()).filter(Boolean)
        : ['Finance Team'];
      const notes = notesIdx >= 0 ? cols[notesIdx] : 'Imported via CSV';

      items.push({
        date,
        serviceType: 'sunday_morning' as ServiceType,
        fundId,
        accountId,
        category,
        totalAmount,
        cashAmount,
        checksAmount,
        digitalAmount,
        counters,
        notes,
      });
    }

    return items;
  }, [collectionsCsvText, collectionsFallbackFund, collectionsFallbackAccount, data.funds, data.accounts]);

  // Handle Collections CSV File Upload
  const handleCollectionsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCollectionsFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCollectionsCsvText((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Execute Collections CSV Import
  const handleExecuteCollectionsImport = () => {
    if (parsedCollections.length === 0) return;
    importCollectionsBatch(parsedCollections);
    setCollectionsFeedback(`Successfully imported ${parsedCollections.length} collections into ${selectedYear}!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Download Sample Collections CSV
  const downloadSampleCollectionsCsv = () => {
    const csvContent =
      'Date,Service Type,Fund,Bank Account,Category,Total Amount,Cash,Checks,Digital,Counters,Notes\n' +
      `${selectedYear}-08-02,sunday_morning,General Operating Fund,Operating Checking,Tithes & General Offerings,24500.00,16500.00,5000.00,3000.00,Deacon Samuel Brooks / Claire Bennett,First Sunday Tithes & Offerings\n` +
      `${selectedYear}-08-09,sunday_morning,Building & Facilities Fund,Building & Reserve Savings,Building & Capital Fund Offering,9500.00,3500.00,6000.00,0,Deacon Samuel Brooks / Elder Thomas Reed,Sanctuary Improvement Pledges\n` +
      `${selectedYear}-08-16,youth_service,Youth & NextGen Fund,Operating Checking,Youth & Young Adults Ministry,2400.00,1900.00,0,500.00,Lydia Carter / Elder Thomas Reed,Youth Fellowship Offering\n` +
      `${selectedYear}-08-23,sunday_morning,Missions & Outreach Fund,Operating Checking,Missions & Outreach Offering,4200.00,3200.00,0,1000.00,Deacon Samuel Brooks / Claire Bennett,Monthly Missions Sunday\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections_sample_template_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse Expenses CSV Rows
  const parsedExpenses = useMemo(() => {
    if (!expensesCsvText.trim()) return [];
    const lines = expensesCsvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const payeeIdx = headers.findIndex((h) => h.includes('payee') || h.includes('vendor') || h.includes('name'));
    const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('total'));
    const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('purpose'));
    const deptIdx = headers.findIndex((h) => h.includes('department') || h.includes('dept') || h.includes('ministry'));
    const fundIdx = headers.findIndex((h) => h.includes('fund'));
    const accountIdx = headers.findIndex((h) => h.includes('account') || h.includes('bank'));
    const methodIdx = headers.findIndex((h) => h.includes('method') || h.includes('payment'));
    const checkNoIdx = headers.findIndex((h) => h.includes('check') || h.includes('voucher') || h.includes('ref'));
    const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('note') || h.includes('particulars'));
    const approvedIdx = headers.findIndex((h) => h.includes('approved') || h.includes('authoriz'));

    const items: Array<Omit<ExpenseItem, 'id' | 'createdAt'>> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => !c)) continue;

      const rawDate = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString().split('T')[0];
      const date = rawDate && rawDate.match(/^\d{4}-\d{2}-\d{2}$/) ? rawDate : new Date().toISOString().split('T')[0];

      const rawAmount = amountIdx >= 0 ? cols[amountIdx].replace(/[^0-9.-]/g, '') : '0';
      const amount = parseFloat(rawAmount) || 0;
      if (amount <= 0) continue;

      const payee = payeeIdx >= 0 && cols[payeeIdx] ? cols[payeeIdx] : 'Church Expense';

      // Fund match
      let fundId = expensesFallbackFund;
      if (fundIdx >= 0 && cols[fundIdx]) {
        const query = cols[fundIdx].toLowerCase().trim();
        const matched = data.funds.find(
          (f) =>
            f.id.toLowerCase() === query ||
            f.code.toLowerCase() === query ||
            f.name.toLowerCase().includes(query)
        );
        if (matched) fundId = matched.id;
      }

      // Account match
      let accountId = expensesFallbackAccount;
      if (accountIdx >= 0 && cols[accountIdx]) {
        const query = cols[accountIdx].toLowerCase().trim();
        const matched = data.accounts.find(
          (a) =>
            a.id.toLowerCase() === query ||
            a.name.toLowerCase().includes(query) ||
            a.accountNumberLast4 === query
        );
        if (matched) accountId = matched.id;
      }

      const category = categoryIdx >= 0 && cols[categoryIdx] ? cols[categoryIdx] : 'Church Operations';
      const department = deptIdx >= 0 && cols[deptIdx] ? cols[deptIdx] : 'Administration';
      const checkNumber = checkNoIdx >= 0 ? cols[checkNoIdx] : '';
      const description = descIdx >= 0 ? cols[descIdx] : 'Disbursement entry';
      const approvedBy = approvedIdx >= 0 && cols[approvedIdx] ? cols[approvedIdx] : 'Church Council';

      let paymentMethod: PaymentMethod = 'check';
      if (methodIdx >= 0 && cols[methodIdx]) {
        const m = cols[methodIdx].toLowerCase();
        if (m.includes('cash')) paymentMethod = 'cash';
        else if (m.includes('ach') || m.includes('transfer') || m.includes('online')) paymentMethod = 'ach_transfer';
        else if (m.includes('debit') || m.includes('card')) paymentMethod = 'debit_card';
      }

      items.push({
        date,
        payee,
        amount,
        category,
        department,
        fundId,
        accountId,
        paymentMethod,
        checkNumber,
        description,
        status: 'cleared',
        approvedBy,
      });
    }

    return items;
  }, [expensesCsvText, expensesFallbackFund, expensesFallbackAccount, data.funds, data.accounts]);

  // Handle Expenses CSV File Upload
  const handleExpensesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExpensesFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setExpensesCsvText((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Execute Expenses CSV Import
  const handleExecuteExpensesImport = () => {
    if (parsedExpenses.length === 0) return;
    importExpensesBatch(parsedExpenses);
    setExpensesFeedback(`Successfully imported ${parsedExpenses.length} disbursements into ${selectedYear}!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Download Sample Expenses CSV
  const downloadSampleExpensesCsv = () => {
    const csvContent =
      'Date,Payee,Amount,Category,Department,Fund,Bank Account,Payment Method,Check Number,Description,Approved By\n' +
      `${selectedYear}-08-05,Rev. Daniel S. Mercer,25000.00,Pastoral Salary & Housing Allowance,Pastoral & Ministry,General Operating Fund,Operating Checking,ach_transfer,PAY-2026-08,Monthly Pastoral Salary & Housing Allowance,Church Board\n` +
      `${selectedYear}-08-10,Metro City Power & Water Utility,5400.00,Utilities: Electricity Water & Internet,Facilities & Operations,General Operating Fund,Operating Checking,ach_transfer,UTIL-88412,Main Sanctuary Electricity & Water Bill,Hannah L. Collins\n` +
      `${selectedYear}-08-18,Greenfield Hardware & Supply Co.,2850.00,Building & Facility Maintenance,Facilities & Operations,Building & Facilities Fund,Operating Checking,cash,INV-GH-3109,Sanctuary lighting & facility maintenance,Board of Trustees\n` +
      `${selectedYear}-08-25,Central Valley Missions Board,3000.00,Missions & Outreach Support,Missions & Outreach,Missions & Outreach Fund,Operating Checking,check,2041,Monthly Regional Missions & Outreach Support,Missions Committee\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_sample_template_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Import Financial Data</h3>
              <p className="text-xs text-slate-400">
                Restore annual JSON system backups or import giving and disbursements from CSV files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Full System Backup (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('collections-csv')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'collections-csv'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Giving / Collections (CSV)</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses-csv')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'expenses-csv'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-rose-500" />
            <span>Disbursements / Expenses (CSV)</span>
          </button>

          <button
            onClick={() => setActiveTab('sample')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sample'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>Sample Dataset</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0 text-slate-800">
          {/* TAB 1: JSON BACKUP */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Full Annual Ledger Restoration
                </span>
                <p className="text-slate-600">
                  Select a <code>church_financial_data_[year].json</code> file exported previously. This restores all funds, bank balances, collections, expenses, budgets, and monthly board report remittances in one complete record.
                </p>
              </div>

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRefJson.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRefJson}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFileChange}
                  className="hidden"
                />
                <FileJson className="w-12 h-12 text-blue-600 mx-auto mb-2.5 opacity-80" />
                <p className="text-sm font-semibold text-slate-800">
                  {jsonFile ? jsonFile.name : 'Click to select or drag & drop JSON backup file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accepts .json exports from this church finance software</p>
              </div>

              {jsonError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              {/* JSON File Preview Card */}
              {parsedJson && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950">Valid Backup Ledger Detected</h4>
                        <span className="text-xs text-slate-600">
                          {parsedJson.profile?.name || 'Church'} • Fiscal Year {parsedJson.fiscalYear}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold">
                      v{parsedJson.version}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">Funds</span>
                      <span className="font-bold text-slate-900">{parsedJson.funds?.length || 0} Funds</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">Bank Accounts</span>
                      <span className="font-bold text-slate-900">{parsedJson.accounts?.length || 0} Accounts</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">Collections</span>
                      <span className="font-bold text-slate-900">{parsedJson.collections?.length || 0} Records</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block">Disbursements</span>
                      <span className="font-bold text-slate-900">{parsedJson.expenses?.length || 0} Records</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleExecuteJsonImport}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import &amp; Load Ledger ({parsedJson.fiscalYear})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COLLECTIONS CSV */}
          {activeTab === 'collections-csv' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">Bulk Import Giving &amp; Tithes</span>
                  <p className="text-slate-600 mt-0.5">
                    Upload a CSV of tithes and designated gifts. The ledger balances will be automatically credited.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCollectionsCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100/50 rounded-lg font-semibold shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Default Fund & Account Fallbacks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Default Target Fund (If not specified in CSV)
                  </label>
                  <select
                    value={collectionsFallbackFund}
                    onChange={(e) => setCollectionsFallbackFund(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {data.funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Default Bank Account (If not specified in CSV)
                  </label>
                  <select
                    value={collectionsFallbackAccount}
                    onChange={(e) => setCollectionsFallbackAccount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({currency}{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File upload or paste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Upload CSV File or Paste CSV Text</label>
                  <button
                    type="button"
                    onClick={() => fileInputRefCollections.current?.click()}
                    className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{collectionsFile ? collectionsFile.name : 'Choose File...'}</span>
                  </button>
                  <input
                    ref={fileInputRefCollections}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCollectionsFileChange}
                    className="hidden"
                  />
                </div>
                <textarea
                  value={collectionsCsvText}
                  onChange={(e) => setCollectionsCsvText(e.target.value)}
                  placeholder="Date,Service Type,Fund,Bank Account,Category,Total Amount,Cash,Checks,Digital,Counters,Notes..."
                  rows={4}
                  className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {collectionsFeedback && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{collectionsFeedback}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedCollections.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Preview: {parsedCollections.length} Collection Entries Detected
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-700">
                      Total: {currency}
                      {parsedCollections
                        .reduce((sum, item) => sum + item.totalAmount, 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Fund</th>
                          <th className="p-2">Account</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {parsedCollections.slice(0, 10).map((item, idx) => {
                          const fund = data.funds.find((f) => f.id === item.fundId);
                          const account = data.accounts.find((a) => a.id === item.accountId);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-mono">{item.date}</td>
                              <td className="p-2 font-medium">{item.category}</td>
                              <td className="p-2">{fund?.name || 'General'}</td>
                              <td className="p-2">{account?.name || 'Checking'}</td>
                              <td className="p-2 text-right font-mono font-semibold text-emerald-700">
                                {currency}{item.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {parsedCollections.length > 10 && (
                    <p className="text-[11px] text-slate-500 italic text-right">
                      Showing first 10 of {parsedCollections.length} entries.
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleExecuteCollectionsImport}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Import {parsedCollections.length} Collections into {selectedYear}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPENSES CSV */}
          {activeTab === 'expenses-csv' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-rose-950 block">Bulk Import Disbursements &amp; Checks</span>
                  <p className="text-slate-600 mt-0.5">
                    Upload a CSV of payment vouchers, honoraria, utilities, and vendor checks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleExpensesCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-800 border border-rose-300 hover:bg-rose-100/50 rounded-lg font-semibold shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Default Fund & Account Fallbacks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Default Fund (If not specified in CSV)
                  </label>
                  <select
                    value={expensesFallbackFund}
                    onChange={(e) => setExpensesFallbackFund(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {data.funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Default Bank Account (If not specified in CSV)
                  </label>
                  <select
                    value={expensesFallbackAccount}
                    onChange={(e) => setExpensesFallbackAccount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({currency}{a.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File upload or paste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Upload CSV File or Paste CSV Text</label>
                  <button
                    type="button"
                    onClick={() => fileInputRefExpenses.current?.click()}
                    className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{expensesFile ? expensesFile.name : 'Choose File...'}</span>
                  </button>
                  <input
                    ref={fileInputRefExpenses}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleExpensesFileChange}
                    className="hidden"
                  />
                </div>
                <textarea
                  value={expensesCsvText}
                  onChange={(e) => setExpensesCsvText(e.target.value)}
                  placeholder="Date,Payee,Amount,Category,Department,Fund,Bank Account,Payment Method,Check Number,Description,Approved By..."
                  rows={4}
                  className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {expensesFeedback && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{expensesFeedback}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedExpenses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Preview: {parsedExpenses.length} Disbursement Entries Detected
                    </span>
                    <span className="text-xs font-mono font-semibold text-rose-700">
                      Total: {currency}
                      {parsedExpenses
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Payee</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Fund</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {parsedExpenses.slice(0, 10).map((item, idx) => {
                          const fund = data.funds.find((f) => f.id === item.fundId);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-mono">{item.date}</td>
                              <td className="p-2 font-semibold text-slate-900">{item.payee}</td>
                              <td className="p-2">{item.category}</td>
                              <td className="p-2">{fund?.name || 'General'}</td>
                              <td className="p-2 text-right font-mono font-semibold text-rose-700">
                                {currency}{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {parsedExpenses.length > 10 && (
                    <p className="text-[11px] text-slate-500 italic text-right">
                      Showing first 10 of {parsedExpenses.length} entries.
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleExecuteExpensesImport}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Import {parsedExpenses.length} Disbursements into {selectedYear}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAMPLE TEMPLATE RESET */}
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  Restore Fictional Demonstration Dataset
                </span>
                <p className="text-slate-700">
                  This loads a clean, fictional sample dataset for training and exploring {selectedYear} church accounting features:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>10 common church funds (General Operating, Missions, Building, Benevolence, Youth, Children, Worship, Family Ministries, Events, and Reserve).</li>
                  <li>Common giving and disbursement categories with balanced checking, savings, and petty cash accounts.</li>
                  <li>Fictional Sunday service collections with bill, coin, check, and digital breakdown.</li>
                  <li>Sample expense vouchers, utilities, maintenance, and ministry allocations.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">Load Fictional {selectedYear} Sample Data</span>
                  <span className="text-[11px] text-slate-500">Great for treasurer training and board demos</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetToSampleData();
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Ledger</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Active Fiscal Year: <strong>{selectedYear}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
