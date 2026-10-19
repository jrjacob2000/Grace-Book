import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  PieChart,
  CheckCircle,
  Clock,
  Building,
  HelpCircle,
  Upload,
  FlaskConical,
  Rocket,
  Cloud,
  UserCheck,
  Download,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenRecordCollection: () => void;
  onOpenRecordExpense: () => void;
  onOpenTransfer: () => void;
  onOpenHelp?: () => void;
  onOpenImport?: () => void;
  onOpenDataMode?: () => void;
  onOpenProfile?: () => void;
  onOpenDrive?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenRecordCollection,
  onOpenRecordExpense,
  onOpenTransfer,
  onOpenHelp,
  onOpenImport,
  onOpenDataMode,
  onOpenProfile,
  onOpenDrive,
}) => {
  const {
    data,
    totalCashInAccounts,
    totalFundBalances,
    isReconciled,
    reconciliationDifference,
    monthCollections,
    monthExpenses,
    monthNet,
    ytdCollections,
    ytdExpenses,
    ytdNet,
    selectedYear,
    selectedMonth,
    isCurrentYearClosed,
    isDemoData,
    isDriveConnected,
    exportJsonFile,
  } = useChurchFinance();

  const currency = data.profile.currencySymbol || '₱';
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  // Calculate Budget Totals
  const totalMonthlyIncomeBudget = useMemo(() => {
    return data.budget
      .filter((b) => b.type === 'income')
      .reduce((sum, b) => sum + (b.monthlyBudget || 0), 0);
  }, [data.budget]);

  const totalMonthlyExpenseBudget = useMemo(() => {
    return data.budget
      .filter((b) => b.type === 'expense')
      .reduce((sum, b) => sum + (b.monthlyBudget || 0), 0);
  }, [data.budget]);

  // Income & Expense percentages
  const incomeBudgetPercent = totalMonthlyIncomeBudget > 0
    ? Math.round((monthCollections / totalMonthlyIncomeBudget) * 100)
    : 0;

  const expenseBudgetPercent = totalMonthlyExpenseBudget > 0
    ? Math.round((monthExpenses / totalMonthlyExpenseBudget) * 100)
    : 0;

  // Month string for filtering recent items
  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const currentMonthCollections = useMemo(() => {
    return data.collections
      .filter((c) => c.date.startsWith(monthStr))
      .slice(0, 5);
  }, [data.collections, monthStr]);

  const currentMonthExpenses = useMemo(() => {
    return data.expenses
      .filter((e) => e.date.startsWith(monthStr))
      .slice(0, 5);
  }, [data.expenses, monthStr]);

  // Budget status by department
  const departmentBudgetBreakdown = useMemo(() => {
    const departments = ['Pastoral & Ministry', 'Facilities & Operations', 'Missions & Outreach', 'Christian Education', 'Administration'];
    
    return departments.map((dept) => {
      const budgetItems = data.budget.filter((b) => b.department === dept && b.type === 'expense');
      const monthlyBudget = budgetItems.reduce((acc, b) => acc + (b.monthlyBudget || 0), 0);
      
      const actualSpent = data.expenses
        .filter((e) => e.department === dept && e.date.startsWith(monthStr) && e.status !== 'void')
        .reduce((acc, e) => acc + e.amount, 0);

      const percent = monthlyBudget > 0 ? Math.round((actualSpent / monthlyBudget) * 100) : 0;
      
      let statusColor = 'bg-emerald-500';
      let textColor = 'text-emerald-700';
      let statusLabel = 'On Track';

      if (percent > 100) {
        statusColor = 'bg-rose-500';
        textColor = 'text-rose-700';
        statusLabel = 'Over Budget';
      } else if (percent >= 85) {
        statusColor = 'bg-amber-500';
        textColor = 'text-amber-700';
        statusLabel = 'Caution (85%+)';
      }

      return {
        department: dept,
        monthlyBudget,
        actualSpent,
        percent,
        statusColor,
        textColor,
        statusLabel,
      };
    });
  }, [data.budget, data.expenses, monthStr]);

  // Fund filter state
  const [fundFilter, setFundFilter] = useState<'all' | 'unrestricted' | 'restricted'>('all');

  const filteredFunds = useMemo(() => {
    if (fundFilter === 'all') return data.funds;
    if (fundFilter === 'unrestricted') return data.funds.filter((f) => f.type === 'unrestricted');
    return data.funds.filter((f) => f.type !== 'unrestricted');
  }, [data.funds, fundFilter]);

  const operatingFundsCount = useMemo(() => {
    return data.funds.filter((f) => f.type === 'unrestricted').length;
  }, [data.funds]);

  const restrictedFundsCount = useMemo(() => {
    return data.funds.filter((f) => f.type !== 'unrestricted').length;
  }, [data.funds]);

  const departmentsOnTrackCount = useMemo(() => {
    return departmentBudgetBreakdown.filter((d) => d.percent <= 100).length;
  }, [departmentBudgetBreakdown]);

  const remainingOperatingBudget = useMemo(() => {
    return Math.max(0, totalMonthlyExpenseBudget - monthExpenses);
  }, [totalMonthlyExpenseBudget, monthExpenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {monthName} {selectedYear} Financial Stewardship
            </h2>
            {isDemoData ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-amber-700" />
                <span>Demo Data</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Ledger</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cash flow, fund balances, and board budget governance.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenRecordCollection}
            disabled={isCurrentYearClosed}
            title={isCurrentYearClosed ? `Fiscal Year ${selectedYear} is closed` : 'Record new offering'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Offering</span>
          </button>

          <button
            onClick={onOpenRecordExpense}
            disabled={isCurrentYearClosed}
            title={isCurrentYearClosed ? `Fiscal Year ${selectedYear} is closed` : 'Record new disbursement'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
            <span>Disburse Expense</span>
          </button>

          <button
            onClick={onOpenTransfer}
            disabled={isCurrentYearClosed}
            title={isCurrentYearClosed ? `Fiscal Year ${selectedYear} is closed` : 'Record inter-fund transfer'}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => onNavigate('board-report')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Board Report</span>
          </button>

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Data</span>
            </button>
          )}

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Demonstration Mode Notice Banner */}
      {isDemoData ? (
        <div className="p-4 bg-amber-50/90 border border-amber-300/90 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-200/80 text-amber-900 rounded-lg shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 text-sm">Demonstration Mode Active</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  Sample Data
                </span>
              </div>
              <p className="text-amber-900/80 mt-0.5">
                You are currently viewing benchmark sample church financial records for demonstration and training.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenDataMode && (
              <button
                onClick={onOpenDataMode}
                className="px-3.5 py-2 bg-amber-900 hover:bg-slate-900 text-amber-100 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-300" />
                <span>Switch to Live Production Ledger</span>
              </button>
            )}
            {onOpenImport && (
              <button
                onClick={onOpenImport}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV/JSON</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Live Production Ledger Active</strong>: Recording real financial transactions for {data.profile.name || 'your church'}.</span>
          </div>
          {onOpenDataMode && (
            <button
              onClick={onOpenDataMode}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
            >
              Manage Ledger Options
            </button>
          )}
        </div>
      )}

      {/* Reconciliation Alert Banner if Discrepancy */}
      {!isReconciled && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-sm block">Account to Fund Balance Discrepancy Detected</span>
              Total bank accounts ({currency}{totalCashInAccounts.toLocaleString()}) differ from fund balances ({currency}{totalFundBalances.toLocaleString()}) by {currency}{Math.abs(reconciliationDifference).toLocaleString()}.
            </div>
          </div>
          <button
            onClick={() => onNavigate('funds')}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 rounded-lg transition-colors shrink-0"
          >
            Reconcile Now
          </button>
        </div>
      )}

      {/* Live Church Rollout & Governance Readiness Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Church Rollout & Internal Control Readiness
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportJsonFile}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Download instant offline JSON backup"
            >
              <Download className="w-3 h-3" />
              <span>Download Offline Backup</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Church Profile & Dual Auditors */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/30 transition-colors flex items-start justify-between gap-2"
          >
            <div>
              <span className="font-semibold text-slate-800 block text-[11px]">1. Church Profile & Signees</span>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-[180px]">
                {data.profile.name} • {data.profile.auditor1 && data.profile.auditor2 ? '2 Auditors Set' : 'Set Auditors'}
              </span>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          </button>

          {/* 2. Ledger Mode */}
          <button
            type="button"
            onClick={onOpenDataMode}
            className={`text-left p-2.5 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
              !isDemoData
                ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
            }`}
          >
            <div>
              <span className="font-semibold text-slate-800 block text-[11px]">2. Ledger Operating Mode</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">
                {!isDemoData ? 'Live Production Ledger Active' : 'Sample Mode (Click to Go Live)'}
              </span>
            </div>
            {!isDemoData ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Rocket className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
          </button>

          {/* 3. Fund vs Bank Golden Rule */}
          <button
            type="button"
            onClick={() => onNavigate('funds')}
            className={`text-left p-2.5 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
              isReconciled
                ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                : 'border-rose-200 bg-rose-50/50 hover:bg-rose-50'
            }`}
          >
            <div>
              <span className="font-semibold text-slate-800 block text-[11px]">3. Bank & Fund Balance</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">
                {isReconciled ? 'Golden Rule Reconciled (₱0.00 diff)' : `Variance: ${currency}${Math.abs(reconciliationDifference).toLocaleString()}`}
              </span>
            </div>
            {isReconciled ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
          </button>

          {/* 4. Cloud Backup & Dual Custody */}
          <button
            type="button"
            onClick={onOpenDrive}
            className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/30 transition-colors flex items-start justify-between gap-2"
          >
            <div>
              <span className="font-semibold text-slate-800 block text-[11px]">4. Cloud Sync & Backup</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {isDriveConnected ? 'Google Drive Connected' : 'Local Storage (Click for Drive Sync)'}
              </span>
            </div>
            <Cloud className={`w-4 h-4 shrink-0 mt-0.5 ${isDriveConnected ? 'text-emerald-600' : 'text-blue-500'}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash Reserves */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Church Cash
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {currency}{totalCashInAccounts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Across {data.accounts.length} Accounts</span>
              {isReconciled ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reconciled
                </span>
              ) : (
                <span className="text-amber-600 font-medium">Discrepancy</span>
              )}
            </div>
          </div>
        </div>

        {/* Month Collections / Giving */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {monthName} Giving
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-700">
              {currency}{monthCollections.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Budget: {currency}{totalMonthlyIncomeBudget.toLocaleString()}</span>
              <span className={`font-semibold ${incomeBudgetPercent >= 100 ? 'text-emerald-600' : 'text-slate-600'}`}>
                {incomeBudgetPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Month Disbursements / Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {monthName} Expenses
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {currency}{monthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Budget: {currency}{totalMonthlyExpenseBudget.toLocaleString()}</span>
              <span className={`font-semibold ${expenseBudgetPercent > 100 ? 'text-rose-600' : 'text-slate-600'}`}>
                {expenseBudgetPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Month Net Surplus / Deficit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {monthName} Net Position
            </span>
            <div className={`p-2 rounded-lg ${monthNet >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono ${monthNet >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {monthNet >= 0 ? '+' : ''}{currency}{monthNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">YTD Net:</span>
              <span className={`font-mono font-semibold ${ytdNet >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {ytdNet >= 0 ? '+' : ''}{currency}{ytdNet.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME BUDGET VISUALIZATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Budget vs Actual Visual Bars */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden h-full">
          <div className="p-6 space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Real-Time Budget Status & Stewardship Overview
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking monthly departmental caps and collection targets
                </p>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Configure Budgets →
              </button>
            </div>

            {/* High-level gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Income Progress Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Total Monthly Receipts</span>
                  <span className="font-mono font-bold text-emerald-700">{incomeBudgetPercent}% of Target</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(incomeBudgetPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
                  <span>Actual: {currency}{monthCollections.toLocaleString()}</span>
                  <span>Budget: {currency}{totalMonthlyIncomeBudget.toLocaleString()}</span>
                </div>
              </div>

              {/* Expense Consumption Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Operating Budget Consumed</span>
                  <span className={`font-mono font-bold ${expenseBudgetPercent > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {expenseBudgetPercent}% Spent
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      expenseBudgetPercent > 100 ? 'bg-rose-500' : expenseBudgetPercent > 85 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(expenseBudgetPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
                  <span>Disbursed: {currency}{monthExpenses.toLocaleString()}</span>
                  <span>Cap: {currency}{totalMonthlyExpenseBudget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Departmental Progress Bars */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Departmental Budget Status ({monthName})
              </h4>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {departmentBudgetBreakdown.map((dept) => (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{dept.department}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-600">
                          {currency}{dept.actualSpent.toLocaleString()} / {currency}{dept.monthlyBudget.toLocaleString()}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          dept.percent > 100 ? 'bg-rose-100 text-rose-800' : dept.percent >= 85 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {dept.percent}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${dept.statusColor}`}
                        style={{ width: `${Math.min(dept.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Departmental Summary Footer */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs mt-auto">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-700">
                <strong className="text-slate-900 font-semibold">{departmentsOnTrackCount} of {departmentBudgetBreakdown.length}</strong> departments on track
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500">Remaining Operating Cap:</span>
              <span className="font-bold text-slate-800">
                {currency}{remainingOperatingBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Fund Balances Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">Fund Balances</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {data.funds.length} Funds
                  </span>
                </div>
                <p className="text-xs text-slate-500">Designated & Operating Reserves</p>
              </div>
              <button
                onClick={() => onNavigate('funds')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Manage →
              </button>
            </div>

            {/* Fund Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs my-3">
              <button
                onClick={() => setFundFilter('all')}
                className={`flex-1 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  fundFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({data.funds.length})
              </button>
              <button
                onClick={() => setFundFilter('unrestricted')}
                className={`flex-1 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  fundFilter === 'unrestricted'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operating ({operatingFundsCount})
              </button>
              <button
                onClick={() => setFundFilter('restricted')}
                className={`flex-1 py-1 rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                  fundFilter === 'restricted'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Restricted ({restrictedFundsCount})
              </button>
            </div>

            {/* Scrollable Fund Cards Container filling available height */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-[260px] max-h-[360px] lg:max-h-[380px]">
              {filteredFunds.map((fund) => {
                const percentOfTotal = totalFundBalances > 0
                  ? Math.round((fund.balance / totalFundBalances) * 100)
                  : 0;
                const hasTarget = fund.targetBalance && fund.targetBalance > 0;
                const targetPercent = hasTarget
                  ? Math.min(100, Math.round((fund.balance / fund.targetBalance!) * 100))
                  : null;

                return (
                  <div
                    key={fund.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: fund.color || '#3b82f6' }}
                          />
                          <span className="font-semibold text-slate-800 text-xs truncate">
                            {fund.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-4.5 mt-0.5 text-[10px]">
                          <span className="text-slate-500">
                            {fund.type === 'unrestricted' ? 'Operating' : 'Restricted'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">
                            {percentOfTotal}% of total
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs shrink-0">
                        {currency}{fund.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {targetPercent !== null && (
                      <div className="mt-2 ml-4.5">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Target: {currency}{fund.targetBalance?.toLocaleString()}</span>
                          <span className="font-semibold">{targetPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${targetPercent}%`,
                              backgroundColor: fund.color || '#3b82f6',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pinned Equity Footer */}
          <div className="pt-3 border-t border-slate-100 mt-auto">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Total Fund Equity:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {currency}{totalFundBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT COLLECTIONS & EXPENSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Offering Records</h3>
            </div>
            <button
              onClick={() => onNavigate('collections')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All ({data.collections.length}) →
            </button>
          </div>

          {currentMonthCollections.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No offerings recorded for {monthName} yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentMonthCollections.map((col) => {
                const fund = data.funds.find((f) => f.id === col.fundId);
                return (
                  <div key={col.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        <span>{col.category}</span>
                        {col.batchNumber && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {col.batchNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {col.date} • {fund?.name || 'General Fund'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700">
                        +{currency}{col.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Cash: {currency}{col.cashAmount.toLocaleString()} | Checks: {currency}{col.checksAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Disbursements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Disbursements & Checks</h3>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All ({data.expenses.length}) →
            </button>
          </div>

          {currentMonthExpenses.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No disbursements recorded for {monthName} yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentMonthExpenses.map((exp) => {
                return (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        <span>{exp.payee}</span>
                        {exp.checkNumber && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            Check #{exp.checkNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {exp.date} • {exp.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        -{currency}{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {exp.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
