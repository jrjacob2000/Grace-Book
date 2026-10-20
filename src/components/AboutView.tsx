import React from 'react';
import {
  Church,
  ShieldCheck,
  Scale,
  Lock,
  Calculator,
  BookOpen,
  HeartHandshake,
  Settings,
  Rocket,
  FlaskConical,
  Bug,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import {
  APP_VERSION,
  APP_NAME,
  APP_ISSUES_URL,
} from '../constants/version';

interface AboutViewProps {
  onNavigate: (tab: string) => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  onOpenDataMode: () => void;
  onOpenDrive: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigate,
  onOpenHelp,
  onOpenProfile,
  onOpenDataMode,
}) => {
  const { isDemoData } = useChurchFinance();

  const features = [
    {
      icon: Scale,
      title: 'Fund & Bank Reconciliation',
      description:
        'Tracks both physical bank/cash accounts and designated ministry funds so total cash always matches total fund balances.',
      tab: 'funds',
      linkLabel: 'Open Funds & Accounts',
    },
    {
      icon: ShieldCheck,
      title: 'Collections & Cash Count Slips',
      description:
        'Record tithes and offerings with a built-in bill & coin denomination counter and printable dual-counter verification slips.',
      tab: 'collections',
      linkLabel: 'Open Collections',
    },
    {
      icon: Calculator,
      title: 'Expenses & Check Vouchers',
      description:
        'Track church expenses, clear pending checks, and print formal Check Disbursement Vouchers with signatory blocks.',
      tab: 'expenses',
      linkLabel: 'Open Expenses',
    },
    {
      icon: BookOpen,
      title: 'Monthly Board Reports',
      description:
        'Generate print-ready monthly financial statements with automated National & District remittance calculations and audit locks.',
      tab: 'board-report',
      linkLabel: 'Open Board Report',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Main Hero Card */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Church className="w-3.5 h-3.5 text-blue-400" />
            <span>v{APP_VERSION}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free for Churches &amp; Ministries</span>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {APP_NAME}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          A simple, transparent, and completely free church fund accounting and stewardship tool designed for local church treasurers, finance committees, and boards.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={onOpenHelp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Finance Manual &amp; Guide</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Church Profile</span>
          </button>

          <button
            onClick={onOpenDataMode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            {isDemoData ? (
              <>
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>Switch to Live Ledger</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>Data Mode Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => onNavigate(item.tab)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>{item.linkLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Privacy & Data Security Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              100% Congregation-Owned &amp; Data Security Architecture
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              GraceBooks is built on a strict <strong>Local-First &amp; Zero-Knowledge Privacy</strong> architecture. Here is how your church's financial records are kept safe and private:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs sm:text-sm">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1. Local Browser Sandboxing</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All financial transactions, donor records, and fund balances reside strictly inside your browser&#39;s secure local storage. No external servers or cloud databases ever collect, store, or inspect your church books.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>2. Restricted Google Drive Sync</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When syncing to the cloud, GraceBooks requests the minimal <code>drive.file</code> OAuth scope. The app can <strong>only</strong> access files it creates (your church ledger files) and cannot view or touch any other personal files in your Drive.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs sm:text-sm">
              <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>3. Backup Sanitization &amp; Defense</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              JSON backups and CSV imports are rigorously sanitized using secure parsing against prototype pollution and formula injection (DDE attacks), ensuring your ledger files remain safe and uncorrupted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
              <span>4. Complete Treasurer Control</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You maintain total ownership. You can export a full JSON backup, switch between demo practice data and live production mode, or wipe records at any time directly from your settings.
            </p>
          </div>
        </div>
      </div>

      {/* Bug Reports, Issue Tracker & Feature Requests Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Found a Bug, Issue, or Have a Ministry Feature Request?
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  GitHub Issue Tracker
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Help us improve {APP_NAME} for congregations everywhere. If you encounter a calculation bug, UI issue, or would like to request a new church accounting or reporting feature, please log an issue directly on our official GitHub repository.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500">
                <span>
                  <strong className="text-slate-700">Include Version:</strong>{' '}
                  <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                    v{APP_VERSION}
                  </code>
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-700">Privacy Reminder:</strong> Never attach live church JSON/CSV files containing confidential member names to public bug reports.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
            <a
              href={APP_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Log an Issue or Bug on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href={APP_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-blue-600 hover:text-blue-800 hover:underline text-center lg:text-right break-all"
            >
              {APP_ISSUES_URL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
