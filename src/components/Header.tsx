import React from 'react';
import {
  Church,
  Cloud,
  CloudCheck,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  AlertCircle,
  LogOut,
  User as UserIcon,
  Archive,
  ArrowRightCircle,
  FileCode,
  HelpCircle,
  Upload,
  FlaskConical,
  Rocket,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { APP_VERSION } from '../constants/version';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDriveModal: () => void;
  onOpenProfileModal: () => void;
  onOpenRolloverModal: () => void;
  onOpenHelpModal: () => void;
  onOpenImportModal: () => void;
  onOpenDataModeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDriveModal,
  onOpenProfileModal,
  onOpenRolloverModal,
  onOpenHelpModal,
  onOpenImportModal,
  onOpenDataModeModal,
}) => {
  const {
    data,
    user,
    syncStatus,
    activeFileName,
    loginWithGoogle,
    logout,
    saveToGoogleDrive,
    exportJsonFile,
    selectedYear,
    selectedMonth,
    availableYears,
    isCurrentYearClosed,
    isDemoData,
    setSelectedYear,
    setSelectedMonth,
  } = useChurchFinance();

  const months = [
    { num: 1, name: 'Jan' },
    { num: 2, name: 'Feb' },
    { num: 3, name: 'Mar' },
    { num: 4, name: 'Apr' },
    { num: 5, name: 'May' },
    { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' },
    { num: 8, name: 'Aug' },
    { num: 9, name: 'Sep' },
    { num: 10, name: 'Oct' },
    { num: 11, name: 'Nov' },
    { num: 12, name: 'Dec' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Budget Dashboard' },
    { id: 'collections', label: 'Collections' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'funds', label: 'Funds & Accounts' },
    { id: 'budget', label: 'Budget Planning' },
    { id: 'board-report', label: 'Board Monthly Report', highlight: true },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Church Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <Church className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            {/* Title & Badges */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="font-bold text-base sm:text-lg text-white tracking-tight truncate max-w-[200px] xs:max-w-[280px] sm:max-w-[360px]">
                {data.profile.name || 'Grace Fellowship Community Church'}
              </h1>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v{APP_VERSION}
                </span>
                {isDemoData ? (
                  <button
                    onClick={onOpenDataModeModal}
                    title="Demonstration Mode Active — Click to Switch to Live Production Ledger"
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <FlaskConical className="w-2.5 h-2.5 text-amber-400" />
                    <span>Demo Data</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenDataModeModal}
                    title="Live Production Ledger Active — Click to manage data options"
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Ledger</span>
                  </button>
                )}
                <button
                  onClick={onOpenProfileModal}
                  title="Edit Church Profile"
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subtitle & Active File */}
            <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span className="truncate max-w-[180px] sm:max-w-[260px]">{data.profile.district || 'Central Valley District'}</span>
              <span className="text-slate-600 shrink-0">•</span>
              <span className="font-mono text-blue-300 text-[11px] bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 flex items-center gap-1 shrink-0 max-w-[200px] sm:max-w-[280px]">
                <FileCode className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{activeFileName}</span>
              </span>
              {isCurrentYearClosed && (
                <span className="text-amber-300 bg-amber-950/60 border border-amber-700/60 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1 shrink-0">
                  <Archive className="w-2.5 h-2.5" />
                  <span>Closed Year</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Month & Year Selection Bar with Rollover Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-400 ml-2 mr-1" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-medium px-2 py-1 rounded hover:bg-slate-700 focus:outline-hidden cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num} className="bg-slate-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
            <span className="text-slate-600">/</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-bold px-2 py-1 rounded hover:bg-slate-700 focus:outline-hidden cursor-pointer font-mono"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y} {y === selectedYear ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Close Year & Rollover Button */}
          <button
            onClick={onOpenRolloverModal}
            title="Close this fiscal year and roll balances forward to new year file"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-blue-900/40 text-blue-300 text-xs font-medium rounded-lg border border-slate-700 hover:border-blue-700 transition-colors"
          >
            <ArrowRightCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Rollover Year</span>
          </button>
        </div>

        {/* Right Section: Google Drive Status & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Help & Guide Button */}
          <button
            onClick={onOpenHelpModal}
            title="Church Finance Manual & Remittance Guide (Press ?)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Help & Guide</span>
            <kbd className="hidden lg:inline px-1 py-0.2 text-[9px] bg-slate-900 text-slate-400 border border-slate-700 rounded font-mono">?</kbd>
          </button>

          {/* Direct JSON Local Backup */}
          <button
            onClick={exportJsonFile}
            title={`Download ${activeFileName} locally`}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          {/* Import Data (JSON or CSV) */}
          <button
            onClick={onOpenImportModal}
            title="Import financial data from JSON backup or CSV"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Import Data</span>
          </button>

          {/* Google Drive Status & Login */}
          {!user ? (
            <button
              onClick={loginWithGoogle}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg shadow-sm transition-colors border border-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Connect Drive</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDriveModal}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50'
                    : syncStatus === 'unsaved_changes'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/50'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-950/60 text-blue-300 border-blue-800/80 hover:bg-blue-900/50'
                    : syncStatus === 'error'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Google Drive Storage Settings"
              >
                {syncStatus === 'synced' && <CloudCheck className="w-4 h-4 text-emerald-400" />}
                {syncStatus === 'unsaved_changes' && <Cloud className="w-4 h-4 text-amber-400" />}
                {syncStatus === 'syncing' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {syncStatus === 'idle' && <Cloud className="w-4 h-4 text-slate-400" />}

                <span className="hidden sm:inline">
                  {syncStatus === 'synced' && 'Drive Synced'}
                  {syncStatus === 'unsaved_changes' && 'Unsaved'}
                  {syncStatus === 'syncing' && 'Syncing...'}
                  {syncStatus === 'error' && 'Drive Alert'}
                  {syncStatus === 'idle' && 'Drive Ready'}
                </span>
              </button>

              {syncStatus === 'unsaved_changes' && (
                <button
                  onClick={() => saveToGoogleDrive(false)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  title="Save current state to Google Drive"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={logout}
                  title={`Sign out (${user.email || user.displayName})`}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : item.highlight
                    ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
