import React from 'react';
import {
  Church,
  ShieldCheck,
  Scale,
  Lock,
  Cloud,
  FileSpreadsheet,
  Calculator,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Layers,
  Award,
  FileCheck,
  Database,
  Sparkles,
  Calendar,
  Building2,
  HeartHandshake,
  HelpCircle,
  Settings,
  Rocket,
  FlaskConical,
  Bug,
  ExternalLink,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import {
  APP_VERSION,
  APP_BUILD_DATE,
  APP_NAME,
  APP_LEDGER_VERSION,
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
  onOpenDrive,
}) => {
  const {
    data,
    selectedYear,
    isReconciled,
    isDemoData,
    isDriveConnected,
    activeFileName,
  } = useChurchFinance();

  const corePillars = [
    {
      icon: Scale,
      title: 'True Fund Accounting & Reconciliation',
      badge: 'Centavo-Accurate',
      description:
        'Every financial transaction is tracked across two parallel dimensions: physical custody (Bank & Cash Accounts) and designated purpose (General, Building, Missions, and Restricted Ministry Funds). Real-time balance verification guarantees that total cash on hand always equals total fund equity.',
      color: 'blue',
    },
    {
      icon: ShieldCheck,
      title: 'Ecclesiastical Internal Controls',
      badge: 'Dual Custody',
      description:
        'Built around established church auditing standards: dual-counter offering verification, itemized bill and coin denomination sheets, printable check disbursement vouchers with signatory blocks, and Monthly Board Audit Period Locks to protect approved reports.',
      color: 'emerald',
    },
    {
      icon: Calculator,
      title: 'National & District Remittance Engine',
      badge: 'Automated Formulas',
      description:
        'Automatically computes monthly National Office (2% share, 20% of District Tithe, 20% Missions, and auxiliary shares) and District Office (80% of District Tithe, 80% Missions, 10% Pastoral Tithe, and Bible College) remittance schedules from monthly receipts, with support for manual overrides.',
      color: 'amber',
    },
    {
      icon: Lock,
      title: 'Zero-Server Privacy & Local Ownership',
      badge: '100% Congregation Owned',
      description:
        'Your congregation’s financial ledger is never transmitted to third-party analytics or proprietary cloud databases. Data resides strictly in your local browser storage, portable JSON/CSV archives, and your church’s own Google Drive folder.',
      color: 'indigo',
    },
  ];

  const modules = [
    {
      id: 'dashboard',
      title: 'Budget & Stewardship Dashboard',
      summary:
        'Executive overview of monthly and YTD collections vs. expenses, live fund-to-account reconciliation status, and the 4-step Live Church Rollout readiness checklist.',
      highlights: ['Monthly & YTD KPIs', 'Live Reconciliation Monitor', 'Rollout Readiness Checklist'],
    },
    {
      id: 'collections',
      title: 'Collections & Cash Denomination Count',
      summary:
        'Record Sunday services, tithes, offerings, and designated gifts with an integrated Philippine Peso bill & coin denomination calculator and printable Count Slip.',
      highlights: ['Bill & Coin Breakdown', 'Dual-Counter Sign-Off', 'Printable Count Slip & CSV Export'],
    },
    {
      id: 'expenses',
      title: 'Expenses & Check Disbursement Vouchers',
      summary:
        'Track operational bills, pastoral support, and ministry disbursements with check/invoice numbers, 1-click pending check clearing, and printable Check Vouchers.',
      highlights: ['Printable Check Vouchers (CV)', '1-Click Pending Check Clearing', 'Filtered CSV Export & Import'],
    },
    {
      id: 'funds',
      title: 'Funds, Bank Accounts & Inter-Fund Transfers',
      summary:
        'Manage restricted and unrestricted church funds alongside physical cash/bank accounts, with 1-click bank statement verification stamps and reversible inter-fund transfers.',
      highlights: ['1-Click Reconciliation Assistant', 'Statement Verification Stamps', 'Reversible Inter-Fund Transfers'],
    },
    {
      id: 'budget',
      title: 'Annual Ministry Budget Planner',
      summary:
        'Establish monthly and annual income targets and expense ceilings mapped directly to collection and expense categories for variance tracking.',
      highlights: ['Monthly & Annual Ceilings', 'Department & Category Variance', 'Surplus / Deficit Forecasting'],
    },
    {
      id: 'board-report',
      title: 'Board Monthly Financial Report',
      summary:
        'Generate formal, print-ready monthly statements for the Church Board and congregation, including remittance schedules, historical month back-out math, and signatory blocks.',
      highlights: ['Monthly Board Audit Lock', 'National & District Remittances', 'Formal Signatory Blocks'],
    },
  ];

  const securitySpecs = [
    {
      title: 'Least-Privilege Google Drive Sync (drive.file)',
      detail:
        'When connected to Google Drive, GraceBooks requests only the narrow drive.file OAuth scope—meaning it can only read and write the specific ledger files it creates inside your "GraceBooks Church Finance" folder, with zero access to any other personal or church Drive documents.',
    },
    {
      title: 'Spreadsheet Formula Injection Defense (CWE-1236)',
      detail:
        'All exported CSV reports (Collections, Expenses, and Monthly Board Statements) and bulk CSV imports automatically neutralize dangerous spreadsheet formula prefixes (=, +, -, @) to protect treasurers opening files in Excel or Google Sheets.',
    },
    {
      title: 'Strict Schema & Prototype-Pollution Sanitization',
      detail:
        'Every imported JSON backup file and cloud-synced ledger undergoes deep structural validation, numeric bounds checking, and prototype-key stripping before entering the application state.',
    },
    {
      title: 'Immutable Fiscal Year & Monthly Audit Locks',
      detail:
        'Treasurers can lock individual calendar months once approved by the Church Board (with authorized unlock for amendments), or seal an entire fiscal year during Year-End Rollover to prevent accidental retroactive edits.',
    },
  ];

  const releaseHistory = [
    {
      version: 'v2.3.0',
      stage: 'Security, About & Free Pledge',
      tag: 'Current Release',
      highlights: [
        'Added the About GraceBooks workspace with live System & Ledger Status diagnostics, module directory, direct GitHub Issue & Bug Tracker integration, and explicit 100% Free for Churches & Ministries commitment (₱0.00/mo, zero licensing fees).',
        'Security hardening (src/lib/security.ts): CSV Formula Injection defense (CWE-1236) across all CSV exports and imports, prototype-pollution-safe JSON parsing, and deep schema/numeric bounds sanitization.',
        'Hardened Google Drive integration with strict file/folder ID validation, query-string escaping, and trusted-domain URL verification.',
      ],
    },
    {
      version: 'v2.2.0',
      stage: 'Live Rollout & Audit Controls',
      tag: 'Governance & QA',
      highlights: [
        'Implemented the 4-Step Live Church Rollout & Internal Control Readiness interactive checklist on the Dashboard.',
        'Added Monthly Board Approval & Period Audit Lock (Approve & Lock Month / Unlock for Amendment) to freeze collections and expenses in approved months, plus ability to reopen/unseal a closed fiscal year.',
        'Added printable Check / Disbursement Vouchers (CV) with 4-signatory blocks and 1-Click Pending Check Clearing in Expenses.',
        'Added Inter-Fund Transfer reversals/deletion with automatic dual-ledger balance restoration, 1-Click Bank Statement Verification stamps, and Month vs. YTD filtered CSV exports.',
        'Fixed historical month balance back-out math in Board Monthly Report and centavo floating-point precision across all balance mutations.',
      ],
    },
    {
      version: 'v2.1.0',
      stage: 'Standard Categories & Demo Data',
      tag: 'Data Model',
      highlights: [
        'Replaced template-specific church data with a fictional demonstration congregation (Grace Fellowship Community Church) and 10 standard church funds (General, Missions, Building, Benevolence, Youth, Children, Worship, Adult/Family, Events, Reserve).',
        'Standardized common church Collection & Expense categories and added custom category management inside Church Profile settings.',
        'Updated the searchable Help & Operations Manual to reflect universal church fund accounting categories and workflows.',
      ],
    },
    {
      version: 'v2.0.0',
      stage: 'Multi-Year, CSV & Live Switcher',
      tag: 'Architecture',
      highlights: [
        'Multi-Year Fiscal Rollover engine (church_financial_data_YYYY.json) carrying forward ending bank and fund balances into new fiscal year files.',
        'Added Bulk CSV Import Wizard with downloadable CSV templates for Collections and Expenses alongside full JSON backup/restore.',
        'Added Demonstration Mode vs. Live Production Ledger switcher (DataModeModal) and dedicated "GraceBooks Church Finance" Google Drive folder management.',
      ],
    },
    {
      version: 'v1.0.0',
      stage: 'Initial Foundation',
      tag: 'Core Ledger',
      highlights: [
        'Dual-ledger Church Fund Accounting & Bank Account Reconciliation engine (Golden Rule verification and 1-Click Reconciliation Assistant).',
        'Sunday Collections & Giving tracker with Philippine Peso (₱) bill & coin denomination calculator, dual-counter sign-off, and printable Official Count Slips.',
        'Expenses & Disbursements ledger, Annual Ministry Budget Planner, Board Monthly Financial Report with National & District remittance formulas, and Google Drive (drive.file) sync.',
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  <Church className="w-3.5 h-3.5 text-blue-400" />
                  <span>Stewardship &amp; Fund Accounting System</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-blue-200">v{APP_VERSION}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Free for Churches &amp; Ministries</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {APP_NAME}
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                A <strong className="text-white font-semibold">completely free</strong>, transparent, and audit-ready church fund accounting and financial governance platform crafted for local congregations, church treasurers, finance committees, and governing boards. Designed to uphold biblical financial integrity through dual-custody cash controls, centavo-accurate fund reconciliation, and formal monthly board reporting—with zero subscription fees or licensing costs.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenHelp}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Finance Manual &amp; Guide</span>
                </button>

                <button
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Church Profile &amp; Signees</span>
                </button>

                <button
                  onClick={onOpenDataMode}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  {isDemoData ? (
                    <>
                      <Rocket className="w-4 h-4 text-emerald-400" />
                      <span>Switch to Live Church Ledger</span>
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-4 h-4 text-amber-400" />
                      <span>Manage Ledger Data Mode</span>
                    </>
                  )}
                </button>

                <a
                  href={APP_ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors"
                >
                  <Bug className="w-4 h-4 text-rose-400" />
                  <span>Report Issue / Bug</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* System & Active Ledger Snapshot Card */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-5 min-w-[280px] sm:min-w-[320px] space-y-3.5 shrink-0">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  System &amp; Ledger Status
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  Schema v{APP_LEDGER_VERSION}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Congregation:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {data.profile.name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Active Fiscal Year:</span>
                  <span className="font-mono font-bold text-blue-300">{selectedYear}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Active File:</span>
                  <span className="font-mono text-slate-200 truncate max-w-[180px]">
                    {activeFileName}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Ledger Mode:</span>
                  {isDemoData ? (
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5" />
                      Sample Demo Data
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live Production
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Fund Reconciliation:</span>
                  {isReconciled ? (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Balanced &amp; Verified
                    </span>
                  ) : (
                    <span className="text-rose-300 font-semibold">Discrepancy Detected</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Google Drive Backup:</span>
                  <button
                    onClick={onOpenDrive}
                    className="text-blue-300 hover:text-blue-200 font-medium underline underline-offset-2 cursor-pointer"
                  >
                    {isDriveConnected ? 'Connected' : 'Local Only (Connect)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 100% Free Ministry Commitment Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                  100% Free for Every Congregation — Forever
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-200/80 text-emerald-900">
                  Zero Cost • No Subscriptions
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed max-w-4xl">
                {APP_NAME} is provided <strong className="font-semibold">completely free of charge</strong> as a stewardship resource for churches, missions, and faith-based ministries. There are no monthly subscription tiers, no licensing fees, no paywalled features, and no transaction charges—ensuring that every peso of your congregation’s tithes and offerings goes directly toward Kingdom ministry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 pt-2 md:pt-0">
            <div className="px-3 py-2 rounded-xl bg-white border border-emerald-200/90 text-center">
              <div className="text-xs font-bold text-emerald-900">₱0.00 / mo</div>
              <div className="text-[10px] text-emerald-700 font-medium">No License Fees</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white border border-emerald-200/90 text-center">
              <div className="text-xs font-bold text-emerald-900">Unlimited</div>
              <div className="text-[10px] text-emerald-700 font-medium">Records &amp; Fiscal Years</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Stewardship Pillars */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-blue-600" />
              <span>Foundational Principles of Church Financial Stewardship</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Why GraceBooks is architected specifically for churches rather than generic small-business bookkeeping.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {corePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {pillar.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{pillar.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application Modules & Capabilities */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Integrated Financial Modules</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Explore the six core workspaces that power weekly counting, expense vouchers, and monthly board reporting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-4 hover:border-blue-300 hover:bg-blue-50/20 transition-colors"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{mod.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{mod.summary}</p>
                <ul className="space-y-1 pt-1">
                  {mod.highlights.map((item) => (
                    <li
                      key={item}
                      className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onNavigate(mod.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-2 border-t border-slate-100 cursor-pointer"
              >
                <span>Open {mod.title.split(' ')[0]} Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security, Privacy & Data Governance + Version History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security & Data Protection */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Security, Privacy &amp; Audit Hardening</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Enterprise-grade client-side safeguards protecting your congregation’s financial records and spreadsheets.
            </p>
          </div>

          <div className="space-y-3">
            {securitySpecs.map((spec) => (
              <div
                key={spec.title}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
              >
                <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{spec.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{spec.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Version History & Release Notes */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Release History &amp; Changelog</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Active Release v{APP_VERSION} • Ledger Schema v{APP_LEDGER_VERSION} ({APP_BUILD_DATE})
              </p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[540px] overflow-y-auto pr-1">
            {releaseHistory.map((rel, idx) => (
              <div
                key={rel.version}
                className={`p-3.5 rounded-xl border space-y-2 ${
                  idx === 0
                    ? 'border-blue-200 bg-blue-50/40'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded text-white ${
                        idx === 0 ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      {rel.version}
                    </span>
                    <span className="text-xs text-slate-800 font-semibold">{rel.stage}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      idx === 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {rel.tag}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {rel.highlights.map((h) => (
                    <li key={h} className="leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
