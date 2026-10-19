import React, { useState } from 'react';
import {
  Wallet,
  Building,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  FileText,
  Calendar,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { Fund, Account, FundTransfer, FundType, AccountType } from '../types/finance';

interface FundsAndAccountsViewProps {
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
}

export const FundsAndAccountsView: React.FC<FundsAndAccountsViewProps> = ({
  isTransferModalOpen,
  setIsTransferModalOpen,
}) => {
  const {
    data,
    totalCashInAccounts,
    totalFundBalances,
    isReconciled,
    reconciliationDifference,
    addFund,
    updateFund,
    deleteFund,
    addAccount,
    updateAccount,
    deleteAccount,
    transferFunds,
  } = useChurchFinance();

  const currency = data.profile.currencySymbol || '₱';

  // Reconciliation Assistant Modal State
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [selectedBalancingAccountId, setSelectedBalancingAccountId] = useState<string>(
    data.accounts[0]?.id || ''
  );

  // Fund Modal State
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [fundName, setFundName] = useState('');
  const [fundCode, setFundCode] = useState('');
  const [fundType, setFundType] = useState<FundType>('unrestricted');
  const [fundDescription, setFundDescription] = useState('');
  const [fundBalance, setFundBalance] = useState<number>(0);
  const [fundTarget, setFundTarget] = useState<number>(0);
  const [fundColor, setFundColor] = useState('#2563eb');

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [accountInstitution, setAccountInstitution] = useState('');
  const [accountLast4, setAccountLast4] = useState('');
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [accountReconciledDate, setAccountReconciledDate] = useState('');

  // Transfer Form State
  const [fromFundId, setFromFundId] = useState(data.funds[0]?.id || '');
  const [toFundId, setToFundId] = useState(data.funds[1]?.id || data.funds[0]?.id || '');
  const [fromAccountId, setFromAccountId] = useState(data.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(data.accounts[1]?.id || data.accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferReason, setTransferReason] = useState('');
  const [transferAuthorizedBy, setTransferAuthorizedBy] = useState('Elder Board Resolution');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Open Fund Modal
  const openNewFundModal = () => {
    setEditingFund(null);
    setFundName('');
    setFundCode(`${(data.funds.length + 1) * 100}`);
    setFundType('temporarily_restricted');
    setFundDescription('');
    setFundBalance(0);
    setFundTarget(0);
    setFundColor('#0d9488');
    setIsFundModalOpen(true);
  };

  const openEditFundModal = (fund: Fund) => {
    setEditingFund(fund);
    setFundName(fund.name);
    setFundCode(fund.code);
    setFundType(fund.type);
    setFundDescription(fund.description);
    setFundBalance(fund.balance);
    setFundTarget(fund.targetBalance || 0);
    setFundColor(fund.color || '#2563eb');
    setIsFundModalOpen(true);
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFund) {
      updateFund({
        ...editingFund,
        name: fundName,
        code: fundCode,
        type: fundType,
        description: fundDescription,
        balance: Number(fundBalance),
        targetBalance: Number(fundTarget) || undefined,
        color: fundColor,
      });
    } else {
      addFund({
        name: fundName,
        code: fundCode,
        type: fundType,
        description: fundDescription,
        balance: Number(fundBalance),
        targetBalance: Number(fundTarget) || undefined,
        color: fundColor,
      });
    }
    setIsFundModalOpen(false);
  };

  // Open Account Modal
  const openNewAccountModal = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccountType('checking');
    setAccountInstitution('');
    setAccountLast4('');
    setAccountBalance(0);
    setAccountReconciledDate(new Date().toISOString().split('T')[0]);
    setIsAccountModalOpen(true);
  };

  const openEditAccountModal = (acct: Account) => {
    setEditingAccount(acct);
    setAccountName(acct.name);
    setAccountType(acct.type);
    setAccountInstitution(acct.institution);
    setAccountLast4(acct.accountNumberLast4);
    setAccountBalance(acct.balance);
    setAccountReconciledDate(acct.lastReconciledDate);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateAccount({
        ...editingAccount,
        name: accountName,
        type: accountType,
        institution: accountInstitution,
        accountNumberLast4: accountLast4,
        balance: Number(accountBalance),
        lastReconciledDate: accountReconciledDate,
      });
    } else {
      addAccount({
        name: accountName,
        type: accountType,
        institution: accountInstitution,
        accountNumberLast4: accountLast4,
        balance: Number(accountBalance),
        lastReconciledDate: accountReconciledDate,
      });
    }
    setIsAccountModalOpen(false);
  };

  // Handle Transfer
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmount <= 0) {
      alert('Transfer amount must be greater than zero');
      return;
    }

    transferFunds({
      date: transferDate,
      fromFundId,
      toFundId,
      fromAccountId,
      toAccountId,
      amount: Number(transferAmount),
      reason: transferReason,
      authorizedBy: transferAuthorizedBy,
    });
    setIsTransferModalOpen(false);
  };

  // Reconciliation Variance Calculations
  const reconciliationDiff = totalCashInAccounts - totalFundBalances;
  const generalFund =
    data.funds.find((f) => f.id === 'fund-general' || f.name.toLowerCase().includes('general')) ||
    data.funds[0];
  const newGenFundBalance = generalFund
    ? Math.round((generalFund.balance + reconciliationDiff) * 100) / 100
    : 0;

  const balancingAccount =
    data.accounts.find((a) => a.id === selectedBalancingAccountId) || data.accounts[0];
  const newAccountBalance = balancingAccount
    ? Math.round((balancingAccount.balance - reconciliationDiff) * 100) / 100
    : 0;

  const handleFixViaGeneralFund = () => {
    if (!generalFund) return;
    updateFund({
      ...generalFund,
      balance: newGenFundBalance,
    });
    setIsReconcileModalOpen(false);
  };

  const handleFixViaAccount = () => {
    if (!balancingAccount) return;
    updateAccount({
      ...balancingAccount,
      balance: newAccountBalance,
    });
    setIsReconcileModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Church Fund Accounting & Banking Reconciliations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distinct tracking of restricted/operating funds against physical bank checking and savings accounts
          </p>
        </div>
        <button
          onClick={() => {
            setFromFundId(data.funds[0]?.id || '');
            setToFundId(data.funds[1]?.id || data.funds[0]?.id || '');
            setFromAccountId(data.accounts[0]?.id || '');
            setToAccountId(data.accounts[1]?.id || data.accounts[0]?.id || '');
            setTransferAmount(0);
            setTransferReason('');
            setIsTransferModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Inter-Fund Transfer</span>
        </button>
      </div>

      {/* MASTER CHURCH RECONCILIATION CARD */}
      <div className={`p-5 rounded-xl border shadow-xs ${
        isReconciled
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/70 border-amber-300 text-amber-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isReconciled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isReconciled ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm">
                  {isReconciled ? 'Church Ledger in Perfect Balance' : 'Discrepancy Between Bank Cash & Fund Equity'}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isReconciled ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isReconciled ? 'Audit Reconciled' : 'Attention Required'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Golden Rule: Total Cash in Accounts ({currency}{totalCashInAccounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}) = Total Designated Fund Balances ({currency}{totalFundBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-amber-200">
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-500 block">Variance / Difference</span>
              <span className={`text-xl font-bold font-mono ${isReconciled ? 'text-emerald-700' : 'text-amber-700'}`}>
                {currency}{Math.abs(reconciliationDifference).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {!isReconciled && (
              <button
                onClick={() => setIsReconcileModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Fix Discrepancy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: FUNDS (LEFT) vs ACCOUNTS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FUNDS COLUMN */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Funds (Stewardship Equity)</h3>
                <p className="text-[11px] text-slate-500">Unrestricted Operating vs Restricted Designated</p>
              </div>
            </div>
            <button
              onClick={openNewFundModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Fund</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.funds.map((fund) => {
              const targetPercent = fund.targetBalance
                ? Math.min(100, Math.round((fund.balance / fund.targetBalance) * 100))
                : null;

              return (
                <div
                  key={fund.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: fund.color || '#3b82f6' }}
                        />
                        <span className="font-bold text-slate-900 text-xs">{fund.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          Code {fund.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{fund.description}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {fund.type === 'unrestricted'
                          ? 'Unrestricted (Operating)'
                          : fund.type === 'temporarily_restricted'
                          ? 'Designated / Temporarily Restricted'
                          : 'Permanently Restricted Endowment'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {currency}{fund.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <button
                          onClick={() => openEditFundModal(fund)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="Edit Fund"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete fund "${fund.name}"? Only do this if balance is zero or transferred.`)) {
                              deleteFund(fund.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete Fund"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {targetPercent !== null && (
                    <div className="mt-3 pt-2 border-t border-slate-200/70">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Campaign Target: {currency}{fund.targetBalance?.toLocaleString()}</span>
                        <span className="font-semibold text-slate-700">{targetPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full"
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

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Total Funds Balance:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {currency}{totalFundBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* BANK ACCOUNTS COLUMN */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Bank Accounts & Depositories</h3>
                <p className="text-[11px] text-slate-500">Checking, High-Yield Savings, Petty Cash, Online In-Transit</p>
              </div>
            </div>
            <button
              onClick={openNewAccountModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.accounts.map((acct) => {
              return (
                <div
                  key={acct.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{acct.name}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {acct.institution} • Ending in ...{acct.accountNumberLast4}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {acct.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • Reconciled: {acct.lastReconciledDate || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {currency}{acct.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <button
                          onClick={() => openEditAccountModal(acct)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="Edit Account"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete account "${acct.name}"? Only do this if account balance is zero.`)) {
                              deleteAccount(acct.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Total Cash in Depository Accounts:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {currency}{totalCashInAccounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* INTER-FUND TRANSFERS AUDIT HISTORY */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-slate-500" />
          <span>Inter-Fund Transfers Audit Trail</span>
        </h3>

        {data.transfers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No inter-fund transfers recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">From Fund</th>
                  <th className="py-2.5 px-3">To Fund</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Purpose & Board Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.transfers.map((tr) => {
                  const fromFund = data.funds.find((f) => f.id === tr.fromFundId);
                  const toFund = data.funds.find((f) => f.id === tr.toFundId);

                  return (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-800">{tr.date}</td>
                      <td className="py-2.5 px-3 text-slate-700">{fromFund?.name || tr.fromFundId}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{toFund?.name || tr.toFundId}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {currency}{tr.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span>{tr.reason}</span>
                        {tr.authorizedBy && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Auth: {tr.authorizedBy}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INTER-FUND TRANSFER MODAL */}
      {/* INTER-FUND TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Inter-Fund Transfer</h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Transfer Date</label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Transfer Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={transferAmount || ''}
                    onChange={(e) => setTransferAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Fund Source & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Source Fund (From)</label>
                  <select
                    value={fromFundId}
                    onChange={(e) => setFromFundId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  >
                    {data.funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({currency}{f.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Destination Fund (To)</label>
                  <select
                    value={toFundId}
                    onChange={(e) => setToFundId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  >
                    {data.funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({currency}{f.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Source & Destination (Optional bank transfer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Source Bank Account</label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Destination Bank Account</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Stewardship Reason / Purpose</label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Monthly sanctuary reserve allocation or emergency benevolence funding"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Authorized By</label>
                <input
                  type="text"
                  required
                  value={transferAuthorizedBy}
                  onChange={(e) => setTransferAuthorizedBy(e.target.value)}
                  placeholder="e.g. Elder Board Resolution 2026-04, Pastor & Treasurer"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT FUND MODAL */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base">{editingFund ? 'Edit Fund' : 'Create New Fund'}</h3>
              <button onClick={() => setIsFundModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFund} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fund Name</label>
                <input
                  type="text"
                  required
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="e.g. Building Expansion Fund"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Fund Code</label>
                  <input
                    type="text"
                    required
                    value={fundCode}
                    onChange={(e) => setFundCode(e.target.value)}
                    placeholder="200"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={fundType}
                    onChange={(e) => setFundType(e.target.value as FundType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="unrestricted">Unrestricted (Operating)</option>
                    <option value="temporarily_restricted">Temporarily Restricted</option>
                    <option value="permanently_restricted">Permanently Restricted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Stewardship Description</label>
                <textarea
                  rows={2}
                  value={fundDescription}
                  onChange={(e) => setFundDescription(e.target.value)}
                  placeholder="Intended purpose for this fund"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Starting Balance (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fundBalance}
                    onChange={(e) => setFundBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Target Balance Goal (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fundTarget}
                    onChange={(e) => setFundTarget(parseFloat(e.target.value) || 0)}
                    placeholder="Optional goal"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT ACCOUNT MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-900 text-base">{editingAccount ? 'Edit Account' : 'Add Bank Account'}</h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Operating Checking"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="money_market">Money Market</option>
                    <option value="petty_cash">Petty Cash Safe</option>
                    <option value="online_clearing">Online Clearing</option>
                  </select>
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    value={accountLast4}
                    onChange={(e) => setAccountLast4(e.target.value)}
                    placeholder="4192"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Banking Institution</label>
                <input
                  type="text"
                  required
                  value={accountInstitution}
                  onChange={(e) => setAccountInstitution(e.target.value)}
                  placeholder="e.g. First National Bank"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Reconciled Balance (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block font-medium text-slate-700 mb-1">Last Reconciled Date</label>
                  <input
                    type="date"
                    value={accountReconciledDate}
                    onChange={(e) => setAccountReconciledDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECONCILIATION ASSISTANT MODAL */}
      {isReconcileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reconciliation Assistant</h3>
                  <p className="text-xs text-slate-600">Balance physical bank accounts with designated fund equities</p>
                </div>
              </div>
              <button
                onClick={() => setIsReconcileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Summary of Current Discrepancy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Bank Cash</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {currency}{totalCashInAccounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Fund Equity</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {currency}{totalFundBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
                  <span className="text-[11px] text-amber-700 font-semibold block">Variance</span>
                  <span className="font-mono font-bold text-sm text-amber-700">
                    {reconciliationDiff > 0 ? '+' : ''}{currency}{reconciliationDiff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Context Note */}
              <div className="text-slate-600 leading-relaxed text-xs">
                {reconciliationDiff > 0 ? (
                  <p>
                    Your physical bank cash is <strong>{currency}{Math.abs(reconciliationDiff).toLocaleString('en-US', { minimumFractionDigits: 2 })} higher</strong> than your tracked funds. This usually means you have unallocated cash surplus or unrecorded bank interest.
                  </p>
                ) : (
                  <p>
                    Your designated fund equities are <strong>{currency}{Math.abs(reconciliationDiff).toLocaleString('en-US', { minimumFractionDigits: 2 })} higher</strong> than actual physical bank cash. This usually happens if an expense/bill was paid or if starting fund balances were set higher than physical bank deposits.
                  </p>
                )}
              </div>

              {/* Solution 1: Adjust General Operating Fund */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                        Recommended
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Option 1: Balance via General Operating Fund
                      </h4>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1">
                      Adjusts your primary operating fund ({generalFund?.name || 'General Fund'}) so that total fund equity perfectly equals physical cash in the bank.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-blue-200/80 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Balance</span>
                    <span className="text-slate-700">{currency}{generalFund?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="text-right">
                    <span className="text-blue-600 text-[10px] block font-sans font-semibold">New Balanced Balance</span>
                    <span className="font-bold text-blue-700">{currency}{newGenFundBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={handleFixViaGeneralFund}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update {generalFund?.name || 'General Fund'} & Balance Ledger</span>
                </button>
              </div>

              {/* Solution 2: Adjust a Bank Account */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Option 2: Balance via Physical Bank Account
                  </h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Select a bank account or cash safe whose recorded balance should be updated to match the church fund equity.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-medium text-slate-700">Select Account to Adjust</label>
                  <select
                    value={selectedBalancingAccountId}
                    onChange={(e) => setSelectedBalancingAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {data.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Current: {currency}{a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Balance</span>
                    <span className="text-slate-700">{currency}{balancingAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="text-right">
                    <span className="text-emerald-700 text-[10px] block font-sans font-semibold">New Balanced Balance</span>
                    <span className="font-bold text-emerald-700">{currency}{newAccountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={handleFixViaAccount}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Selected Account & Balance Ledger</span>
                </button>
              </div>

              {/* Option 3: Manual Investigation Guide */}
              <div className="p-3.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Prefer to fix manually?</span>
                </span>
                <p>
                  1. Check your real-life bank statements or passbook for each account.
                </p>
                <p>
                  2. In the <strong>Physical Bank Accounts</strong> column, click the edit icon (✏️) on any account to update its balance.
                </p>
                <p>
                  3. In the <strong>Funds</strong> column, click the edit icon (✏️) on any designated fund to adjust its balance.
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsReconcileModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-medium"
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
