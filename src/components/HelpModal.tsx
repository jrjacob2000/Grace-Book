import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  Calculator,
  ShieldCheck,
  FileText,
  Printer,
  Cloud,
  Coins,
  ArrowRightLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Upload,
  Settings,
  FileCheck,
  Compass,
  Rocket,
  Lock,
  Download,
  Bug,
  ExternalLink,
} from 'lucide-react';
import { APP_VERSION, APP_ISSUES_URL } from '../constants/version';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenProfile?: () => void;
  onOpenRollover?: () => void;
  onOpenDrive?: () => void;
  onOpenImport?: () => void;
  onOpenDataMode?: () => void;
}

interface HelpTopic {
  id: string;
  category:
    | 'getting-started'
    | 'quickstart'
    | 'governance'
    | 'remittance'
    | 'auditing'
    | 'funds'
    | 'cloud'
    | 'faq';
  title: string;
  summary: string;
  tags: string[];
  content: React.ReactNode;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenProfile,
  onOpenRollover,
  onOpenDrive,
  onOpenImport,
  onOpenDataMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started & Rollout', icon: Compass },
    { id: 'quickstart', label: 'Weekly & Monthly Routine', icon: Calendar },
    { id: 'governance', label: 'Audit Lock & Check Vouchers', icon: Lock },
    { id: 'remittance', label: 'Monthly Board & Remittances', icon: Calculator },
    { id: 'auditing', label: 'Cash Counting & Dual Custody', icon: ShieldCheck },
    { id: 'funds', label: 'Funds, Transfers & Reconciliation', icon: Coins },
    { id: 'cloud', label: 'Import, Export & Cloud Sync', icon: Cloud },
    { id: 'faq', label: 'Common Questions (FAQ)', icon: HelpCircle },
  ];

  const topics: HelpTopic[] = useMemo(
    () => [
      // CATEGORY: GETTING STARTED & LIVE ROLLOUT
      {
        id: 'first-time-setup',
        category: 'getting-started',
        title: 'Live Church Rollout & First-Time Setup Guide (4 Steps)',
        summary:
          'How to configure your church profile, switch from sample demonstration data to a clean live ledger, verify reconciliation, and enable backups.',
        tags: [
          'start',
          'setup',
          'getting started',
          'profile',
          'church',
          'live',
          'rollout',
          'mode',
          'drive',
          'readiness',
        ],
        content: (
          <div className="space-y-4 text-slate-700 text-xs">
            <p className="text-slate-600">
              Welcome to <strong>GraceBooks Church Finance</strong>! You can track your congregation&apos;s rollout progress anytime using the <strong>Live Church Rollout &amp; Internal Control Readiness</strong> checklist on the Dashboard, or follow these four steps:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Configure Church Profile &amp; Signees</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Enter your official local church name, address, district affiliation, Tax ID, Senior Pastor, Treasurer, Board Chair, and appointed Auditors so all printed vouchers and board reports carry accurate signatory blocks.
                </p>
                {onOpenProfile && (
                  <button
                    onClick={() => {
                      onOpenProfile();
                      onClose();
                    }}
                    className="mt-1 text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Open Church Profile Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Switch to Live Production Mode</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The app starts in <strong>Demonstration Mode</strong> with fictional sample data (Grace Fellowship Community Church) for safe training. When ready for live operations, switch to <strong>Live Production Mode</strong> with a zeroed ledger or your opening balances.
                </p>
                {onOpenDataMode && (
                  <button
                    onClick={() => {
                      onOpenDataMode();
                      onClose();
                    }}
                    className="mt-1 text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Open Data Mode &amp; Live Switcher</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Set Opening Fund &amp; Bank Balances</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  In <strong>Funds &amp; Accounts</strong>, set your physical bank and petty cash balances to match your bank statements, and allocate matching equity across your designated funds so the Golden Rule check shows <strong>₱0.00 variance</strong>.
                </p>
                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      onNavigateToTab('funds');
                      onClose();
                    }}
                    className="mt-1 text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Open Funds &amp; Accounts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Step 4 */}
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-purple-950 text-sm">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Connect Google Drive or Offline Backup</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Connect your church Google Drive to auto-sync annual ledger files inside a dedicated <strong>GraceBooks Church Finance</strong> folder, or download JSON/CSV backups directly from the Dashboard or top bar.
                </p>
                {onOpenDrive && (
                  <button
                    onClick={() => {
                      onOpenDrive();
                      onClose();
                    }}
                    className="mt-1 text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center gap-1"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Configure Google Drive Storage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'system-overview',
        category: 'getting-started',
        title: 'Core System Modules & Navigation Tour',
        summary:
          'A quick tour of the 6 core financial modules: Dashboard, Collections, Expenses, Funds & Accounts, Budget Planning, and Monthly Board Report.',
        tags: [
          'overview',
          'navigation',
          'modules',
          'dashboard',
          'collections',
          'expenses',
          'funds',
          'budget',
          'reports',
        ],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p className="text-slate-600">
              GraceBooks is structured into 6 primary modules accessible from the top navigation bar (click any module card below to jump directly to it):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                {
                  tab: 'dashboard',
                  title: '1. Executive Dashboard',
                  desc: 'Live Rollout Readiness checklist, real-time cash & fund equity totals, monthly/YTD performance charts, and discrepancy alerts.',
                },
                {
                  tab: 'collections',
                  title: '2. Collections (Giving)',
                  desc: 'Tally Sunday tithes, offerings, and digital transfers with denomination count sheets, dual-auditor slips, period filters, and CSV export.',
                },
                {
                  tab: 'expenses',
                  title: '3. Expenses (Disbursements)',
                  desc: 'Record vendor payments, pastoral compensation, utilities, and remittances with printable Check/Disbursement Vouchers and 1-click check clearing.',
                },
                {
                  tab: 'funds',
                  title: '4. Funds & Accounts',
                  desc: 'Manage designated church funds, bank accounts, 1-click statement verification stamps, inter-fund transfers (with reversal support), and reconciliation.',
                },
                {
                  tab: 'budget',
                  title: '5. Budget Planning',
                  desc: 'Set annual and monthly department targets across common church categories to monitor spending variance throughout the fiscal year.',
                },
                {
                  tab: 'board-report',
                  title: '6. Board Monthly Report',
                  desc: 'Generate printable monthly financial statements, denominational & district remittance schedules, and lock approved monthly periods.',
                },
              ].map((m) => (
                <button
                  key={m.tab}
                  type="button"
                  onClick={() => {
                    if (onNavigateToTab) {
                      onNavigateToTab(m.tab);
                      onClose();
                    }
                  }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition-colors group"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <strong className="text-slate-900 group-hover:text-blue-700 font-bold">
                      {m.title}
                    </strong>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-slate-600">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'managing-categories',
        category: 'getting-started',
        title: 'Common Church Collection & Expense Categories',
        summary:
          'How standard giving categories, ministry departments, and budget line items are organized across the ledger.',
        tags: [
          'category',
          'categories',
          'line item',
          'expense',
          'collection',
          'giving',
          'department',
          'budget',
        ],
        content: (
          <div className="space-y-4 text-slate-700 text-xs">
            <p className="text-slate-600">
              GraceBooks uses clear, common church accounting categories and department tags to keep unrestricted and restricted funds properly segregated:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Collection Categories */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                <strong className="font-bold text-emerald-950 text-sm block">
                  1. Collection (Giving) Categories
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  When recording a Sunday count sheet or digital offering in <strong>Collections</strong>, entries are categorized by common giving purposes:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li>
                    <strong>Tithes &amp; General Offerings</strong>: Credited to the General Operating Fund (101).
                  </li>
                  <li>
                    <strong>Missions &amp; Outreach Offering</strong>: Credited to the Missions &amp; Outreach Fund (102).
                  </li>
                  <li>
                    <strong>Building &amp; Capital Fund Offering</strong>: Credited to the Building &amp; Facilities Fund (103).
                  </li>
                  <li>
                    <strong>Benevolence, Youth, Children, Worship &amp; Special Events</strong>: Credited to their respective designated ministry funds.
                  </li>
                </ul>
              </div>

              {/* Expense Categories & Departments */}
              <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2">
                <strong className="font-bold text-rose-950 text-sm block">
                  2. Expense Categories &amp; Departments
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  When recording a payment voucher in <strong>Expenses</strong>, assign both the <strong>Department</strong> and <strong>Category</strong>:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li>
                    <strong>Pastoral &amp; Ministry</strong>: Pastoral salary &amp; housing allowance, staff compensation, worship &amp; media supplies.
                  </li>
                  <li>
                    <strong>Facilities &amp; Operations</strong>: Electricity, water &amp; internet utilities, building &amp; facility maintenance, equipment.
                  </li>
                  <li>
                    <strong>Administration</strong>: Office supplies, printing, software, denominational remittances, insurance &amp; legal fees.
                  </li>
                  <li>
                    <strong>Missions, Benevolence &amp; NextGen</strong>: Missions &amp; outreach support, benevolence aid, children &amp; youth ministry programs, fellowship hospitality.
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-slate-700 space-y-1">
              <strong className="text-blue-950 font-bold block">
                Customizing Monthly Targets in Budget Planning
              </strong>
              <p className="text-slate-600">
                Open the <strong>Budget Planning</strong> tab to add, edit, or adjust monthly budget allocations for any department and category across the fiscal year.
              </p>
            </div>
          </div>
        ),
      },

      // CATEGORY: QUICKSTART ROUTINES
      {
        id: 'sunday-routine',
        category: 'quickstart',
        title: 'Weekly Sunday Counting & Deposit Routine',
        summary:
          'Step-by-step workflow for tellers and treasurers to count offerings, print dual-certified count slips, and deposit funds.',
        tags: ['routine', 'sunday', 'workflow', 'collection', 'count', 'deposit', 'teller'],
        content: (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="text-slate-600">
              Follow this standard internal control workflow after every worship service:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Gather Offering Envelopes &amp; Loose Cash</strong>: At least twounrelated tellers/auditors bring the offering bags directly to the counting room.
              </li>
              <li>
                <strong>Tally Currency Bills, Coins, Checks &amp; Digital Giving</strong>: Open the <em>Collections</em> tab, click <strong>Record Collection Batch</strong>, and enter bill/coin quantities (₱1,000 down to coins) plus any checks or verified digital bank/e-wallet transfers.
              </li>
              <li>
                <strong>Dual Custody Certification</strong>: Select or enter both the <strong>Primary Counter / Teller</strong> and the <strong>Secondary Witness / Auditor</strong>.
              </li>
              <li>
                <strong>Print Official Count Slip</strong>: Click the printer/slip icon on the saved batch to print the <strong>Official Cash &amp; Tithe Count Slip</strong>, have both counters sign it in ink, and attach the deposit slip.
              </li>
              <li>
                <strong>Filter or Export Anytime</strong>: Use the <strong>Selected Month vs. Full Year (YTD)</strong> toggle and <strong>Export CSV</strong> button in Collections to review or archive giving summaries.
              </li>
            </ol>
            {onNavigateToTab && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onNavigateToTab('collections');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Go to Collections &amp; Giving</span>
                </button>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'monthly-closing',
        category: 'quickstart',
        title: 'Month-End Closing, Reconciliation & Board Lock Procedure',
        summary:
          'How to reconcile bank statements, clear checks, present the Monthly Board Report, and lock the month against post-audit edits.',
        tags: ['month', 'closing', 'board', 'report', 'reconciliation', 'lock', 'approve'],
        content: (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="text-slate-600">
              At the close of each calendar month (e.g. before the monthly Church Board meeting):
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Verify All Expenses &amp; Mark Cleared Checks</strong>: In the <em>Expenses</em> tab, ensure all utility bills, pastoral compensation, and vendor vouchers for the month are recorded. Click the checkmark icon on pending checks that have cleared your bank statement.
              </li>
              <li>
                <strong>Stamp Bank Statements &amp; Check Golden Rule Balance</strong>: In <em>Funds &amp; Accounts</em>, compare each account against your bank statement, click <strong>Verify Statement Today</strong> on each account card, and confirm the green <em>&quot;Church Ledger in Perfect Balance&quot;</em> banner (₱0.00 variance).
              </li>
              <li>
                <strong>Review &amp; Print the Monthly Board Report</strong>: Open <em>Board Monthly Report</em> to verify beginning balances, monthly receipts, disbursements, ending fund balances, and denominational remittances. Click <strong>Print Report</strong> or <strong>Export CSV</strong> for the board packet.
              </li>
              <li>
                <strong>Approve &amp; Lock the Month</strong>: Once the Church Board approves the report, click <strong>Approve &amp; Lock Month</strong> in the Board Governance Status Bar at the top of the report. This seals that month&apos;s collections and expenses from accidental edits or deletions.
              </li>
            </ol>
            {onNavigateToTab && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onNavigateToTab('board-report');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Monthly Board Report</span>
                </button>
              </div>
            )}
          </div>
        ),
      },

      // CATEGORY: GOVERNANCE, AUDIT LOCK & CHECK VOUCHERS
      {
        id: 'board-approval-period-lock',
        category: 'governance',
        title: 'Monthly Board Approval & Period Audit Lock',
        summary:
          'How locking an approved month protects historical collections and expenses from unauthorized or accidental changes.',
        tags: [
          'lock',
          'unlock',
          'approved',
          'board',
          'audit',
          'period',
          'governance',
          'amendment',
          'draft',
        ],
        content: (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="text-slate-600">
              To maintain audit-grade financial integrity, GraceBooks includes a <strong>Board Governance Status &amp; Period Lock</strong> workflow on the <strong>Board Monthly Report</strong> tab:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <strong className="text-slate-900 block">1. Working Draft / Presented</strong>
                <p className="text-slate-600">
                  While a month is in <em>Working Draft</em> or <em>Presented to Board</em> status, the Treasurer can freely add, edit, or delete collections and expenses for that month.
                </p>
              </div>
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1">
                <strong className="text-emerald-950 block">2. Approved &amp; Audit Locked</strong>
                <p className="text-slate-600">
                  Clicking <strong>Approve &amp; Lock Month</strong> (or setting Motion Status to <em>Approved &amp; Locked</em>) activates an audit lock across <em>Collections</em> and <em>Expenses</em> for that calendar month.
                </p>
              </div>
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1">
                <strong className="text-amber-950 block">3. Unlock for Amendment</strong>
                <p className="text-slate-600">
                  If a post-audit correction is authorized by the Board, click <strong>Unlock for Amendment</strong> in the Board Report bar to switch status to <em>Amended</em> and make the adjustment.
                </p>
              </div>
            </div>
            <p className="text-slate-500 italic">
              Note: When viewing a locked month in Collections or Expenses, an emerald <strong>Board-Approved &amp; Audit-Locked Month</strong> banner is displayed and edit/delete buttons for records in that month are automatically disabled.
            </p>
          </div>
        ),
      },
      {
        id: 'disbursement-check-vouchers',
        category: 'governance',
        title: 'Printable Check / Disbursement Vouchers & Check Clearing',
        summary:
          'How to print official paper payment vouchers for signatures and reconcile pending vs. cleared checks.',
        tags: [
          'voucher',
          'check',
          'disbursement',
          'print',
          'payee',
          'signature',
          'cleared',
          'pending',
          'expenses',
        ],
        content: (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="text-slate-600">
              Every church expenditure should be backed by a signed paper <strong>Check / Disbursement Voucher (CV)</strong> attached to the vendor invoice or official receipt:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                <strong className="text-blue-950 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Printing an Official Disbursement Voucher</span>
                </strong>
                <p className="text-slate-600">
                  In the <strong>Expenses</strong> table, click the <strong>Printer (🖨️)</strong> icon in the Actions column of any disbursement. A print-ready voucher modal opens displaying your church header, CV reference number, payee, payment method, check/ref #, fund and bank account charged, budget category, and a 4-column signature block (<em>Prepared By Treasurer</em>, <em>Audited &amp; Verified By</em>, <em>Approved By Senior Pastor / Board Chair</em>, and <em>Payment Received By Payee</em>).
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                <strong className="text-emerald-950 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1-Click Check Clearing for Bank Reconciliation</span>
                </strong>
                <p className="text-slate-600">
                  When issuing a check that hasn&apos;t been cashed yet, set its status to <strong>Pending Check</strong>. Once the check appears on your monthly bank statement, simply click the green <strong>Checkmark</strong> icon in the Expenses table to mark it <strong>Cleared</strong> in one click.
                </p>
              </div>
            </div>
            {onNavigateToTab && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onNavigateToTab('expenses');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Go to Expenses &amp; Vouchers</span>
                </button>
              </div>
            )}
          </div>
        ),
      },

      // CATEGORY: REMITTANCE & BOARD REPORT
      {
        id: 'denominational-remittance-formulas',
        category: 'remittance',
        title: 'Monthly Board Report & Remittance Formulas Explained',
        summary:
          'How National Office, District Office, and Ministry Auxiliary remittance shares are calculated and customized.',
        tags: [
          'remittance',
          'national',
          'district',
          'tithe',
          'board report',
          'formulas',
          'auxiliary',
          'pastor',
        ],
        content: (
          <div className="space-y-3 text-xs text-slate-700">
            <p className="text-slate-600">
              The <strong>Board Monthly Report</strong> automatically compiles monthly receipts, disbursements, and running balances across all funds, and computes standard denominational and district remittance shares:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                <h4 className="font-bold text-amber-900">National Office Remittance Share</h4>
                <ul className="space-y-1 text-slate-700 list-disc pl-4 text-[11px]">
                  <li>
                    <strong>District Tithe Base</strong>: 10% of General Operating Fund monthly receipts.
                  </li>
                  <li>
                    <strong>National Office Share (2%)</strong>: 2% of General Operating Fund monthly receipts.
                  </li>
                  <li>
                    <strong>National Portion of District Tithe</strong>: 20% of the 10% District Tithe base.
                  </li>
                  <li>
                    <strong>Missions Offering (20%)</strong>: 20% of monthly Missions &amp; Outreach Fund collections.
                  </li>
                  <li>
                    <strong>Children &amp; Sunday School (1% Share)</strong>: 10% of the 10% Sunday School tithe.
                  </li>
                  <li>
                    <strong>Credentialing, Retirement &amp; Special Funds</strong>: 100% pass-through of designated national offerings.
                  </li>
                  <li>
                    <strong>Ministry Auxiliaries (Youth, Men, Women)</strong>: 10% of 10% national auxiliary share.
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <h4 className="font-bold text-blue-900">District Office Remittance Share</h4>
                <ul className="space-y-1 text-slate-700 list-disc pl-4 text-[11px]">
                  <li>
                    <strong>District Tithe (80% of 10%)</strong>: 80% of the calculated District Tithe base.
                  </li>
                  <li>
                    <strong>District Missions (80%)</strong>: 80% of monthly Missions &amp; Outreach Fund collections.
                  </li>
                  <li>
                    <strong>Children &amp; Sunday School (90% of 10%)</strong>: Remaining 90% of the Sunday School tithe.
                  </li>
                  <li>
                    <strong>Pastoral Tithe Allocation</strong>: 10% of Senior Pastor honorarium/compensation.
                  </li>
                  <li>
                    <strong>District Auxiliary Shares</strong>: Remaining 90% of 10% auxiliary tithes for District Youth, Men&apos;s, and Women&apos;s ministries.
                  </li>
                  <li>
                    <strong>Bible College &amp; Seminary</strong>: Monthly local church support commitment.
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-slate-500 italic">
              Need custom amounts or local overrides? Click <strong>Edit Report Details</strong> on the Board Monthly Report to customize any remittance line item, check number, or board governance note.
            </p>
          </div>
        ),
      },

      // CATEGORY: AUDITING
      {
        id: 'dual-auditor-procedure',
        category: 'auditing',
        title: 'Dual Custody & Auditor Verification Protocol',
        summary:
          'Best financial stewardship practices for counting tithes, certifying slips, and protecting church volunteers.',
        tags: ['auditor', 'counters', 'dual', 'custody', 'witness', 'slip', 'stewardship'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p className="text-slate-600">
              In sound church financial governance, <strong>dual custody</strong> protects pastors, treasurers, and volunteer tellers from misunderstanding and prevents counting errors:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Primary Counter / Teller</strong>: The individual responsible for physically sorting and tallying currency bills, coins, and offering envelopes.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Secondary Witness / Auditor</strong>: A second independent volunteer, deacon, or finance committee member who verifies each denomination stack before the batch is recorded and sealed for deposit.
                </div>
              </div>
            </div>
            <p className="text-slate-600">
              Printed Count Slips include physical signature blocks for both counters plus the receiving Church Treasurer. You can configure your default appointed auditors in <strong>Church Profile Settings</strong>.
            </p>
          </div>
        ),
      },

      // CATEGORY: FUNDS, TRANSFERS & RECONCILIATION
      {
        id: 'fund-accounting-rule',
        category: 'funds',
        title: 'The Golden Rule of Church Fund Accounting & Transfers',
        summary:
          'Understanding why Designated Fund Equity must equal Physical Bank Accounts, and how to manage or reverse Inter-Fund Transfers.',
        tags: [
          'funds',
          'accounts',
          'equity',
          'reconciled',
          'golden rule',
          'transfers',
          'reverse',
          'delete transfer',
        ],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p className="text-slate-600">
              Churches operate on <strong>Designated Fund Accounting</strong> to honor donor intent alongside physical bank accounts:
            </p>
            <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-lg text-emerald-950 font-semibold">
              Golden Rule: Total Cash Across All Physical Bank Accounts = Total Balances of All Designated Church Funds
            </div>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Unrestricted Operating Fund (General Fund)</strong>: Used for day-to-day ministry operations, utilities, pastoral compensation, and regular maintenance.
              </li>
              <li>
                <strong>Restricted &amp; Designated Funds (Missions, Building, Benevolence, Youth, Children)</strong>: Offerings designated for a specific ministry purpose are tracked separately so restricted balances are never accidentally spent on general bills.
              </li>
              <li>
                <strong>Inter-Fund Transfers &amp; Reversals</strong>: When moving money between funds or bank accounts (e.g., transferring board-approved operating surplus to the Building Fund), record an <em>Inter-Fund Transfer</em> with the authorizing Board Resolution. If a transfer was entered in error, click the <strong>Trash / Reverse</strong> icon in the <em>Inter-Fund Transfers Audit Trail</em> table to cleanly reverse both fund and bank account balances.
              </li>
              <li>
                <strong>1-Click Bank Statement Verification Stamp</strong>: On each physical bank account card in <em>Funds &amp; Accounts</em>, click <strong>Verify Statement Today</strong> after checking your bank passbook or online statement to log the exact reconciliation date.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'fix-discrepancy-guide',
        category: 'funds',
        title: 'How to Fix a Fund & Bank Discrepancy (Variance)',
        summary:
          'Step-by-step resolution using the automated Reconciliation Assistant or manual balance adjustments.',
        tags: ['fix', 'discrepancy', 'variance', 'difference', 'reconciliation', 'balance', 'audit'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p>
              When the banner displays <strong>&quot;Discrepancy Between Bank Cash &amp; Fund Equity&quot;</strong>, the sum of your physical bank accounts differs from the sum of your designated funds (for example, if an opening balance was edited on one side only).
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg">
                <strong className="text-amber-950 block mb-1">
                  Method 1: Use the Reconciliation Assistant (1-Click)
                </strong>
                <p>
                  1. Go to the <strong>Funds &amp; Accounts</strong> tab (or click <strong>Reconcile Now</strong> on the Dashboard).
                  <br />
                  2. On the yellow discrepancy banner, click <strong>Fix Discrepancy</strong>.
                  <br />
                  3. Select <strong>Option 1 (Recommended)</strong> to align the General Operating Fund with your physical bank total, or <strong>Option 2</strong> to adjust a specific bank account.
                  <br />
                  4. The ledger immediately balances to ₱0.00 variance.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">
                  Method 2: Manual Audit Verification
                </strong>
                <p>
                  Compare each card under <strong>Physical Bank Accounts</strong> with your actual bank statements, edit any misstated account or fund balance using the pencil icon (✏️), and click <strong>Verify Statement Today</strong> once confirmed.
                </p>
              </div>
            </div>
            {onNavigateToTab && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onNavigateToTab('funds');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs inline-flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Open Funds &amp; Accounts to Reconcile</span>
                </button>
              </div>
            )}
          </div>
        ),
      },

      // CATEGORY: CLOUD & DATA IMPORT/EXPORT
      {
        id: 'import-export-guide',
        category: 'cloud',
        title: 'How to Import & Export Church Data (JSON & CSV)',
        summary:
          'Restore full annual ledger backups, bulk-upload CSV spreadsheets, or export filtered monthly/annual CSV reports.',
        tags: [
          'import',
          'export',
          'csv',
          'json',
          'backup',
          'restore',
          'spreadsheet',
          'excel',
          'upload',
          'download',
        ],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p>
              GraceBooks provides full data portability so your church always owns and controls its financial records:
            </p>
            <div className="space-y-2.5">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <strong className="text-blue-950 block mb-1">
                  1. Full Annual Ledger Backup &amp; Restore (JSON)
                </strong>
                <p className="text-slate-600">
                  Click the <strong>Export JSON</strong> download icon in the top bar (or <strong>Backup JSON</strong> on the Dashboard) to save a complete annual file (<code>church_financial_data_[year].json</code>). You can restore it anytime via the <strong>Import Data</strong> tool.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <strong className="text-emerald-950 block mb-1">
                  2. Filtered Collections &amp; Expenses CSV Export
                </strong>
                <p className="text-slate-600">
                  Inside both the <strong>Collections</strong> and <strong>Expenses</strong> tabs, filter by <em>Selected Month</em> or <em>Full Year (YTD)</em>, fund, or search keyword, then click <strong>Export CSV</strong> to download an Excel-ready spreadsheet of those exact records.
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                <strong className="text-rose-950 block mb-1">
                  3. Bulk CSV Import Templates (Giving &amp; Disbursements)
                </strong>
                <p className="text-slate-600">
                  Migrating from Excel? Open the <strong>Import Data</strong> modal to download pre-formatted CSV templates for Collections or Expenses, paste your rows, and bulk-import them with automatic fund and bank account balance updates.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {onOpenImport && (
                <button
                  onClick={() => {
                    onOpenImport();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Open Import Data Tool</span>
                </button>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'drive-and-rollover',
        category: 'cloud',
        title: 'Google Drive Sync, Year-End Rollover & Unsealing Closed Years',
        summary:
          'How annual ledger files are synced to Google Drive, how to close a fiscal year into the next year, and how to reopen a closed year if needed.',
        tags: ['drive', 'cloud', 'backup', 'rollover', 'yearly', 'json', 'closed', 'reopen', 'unseal'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p>
              To keep your ledger fast and audit-ready, GraceBooks stores each fiscal year in its own dedicated file:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <strong className="text-blue-950 block mb-1">
                  Dedicated Folder: &quot;GraceBooks Church Finance&quot;
                </strong>
                <span>
                  When connected to Google Drive, all annual ledgers (e.g. <code>church_financial_data_2026.json</code>) are automatically organized inside a dedicated <strong>GraceBooks Church Finance</strong> folder in your Google Drive.
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">
                  Year-End Rollover &amp; Unsealing Closed Years
                </strong>
                <span>
                  At the end of December, click the <strong>Year Selector / Rollover</strong> button in the header to carry forward ending fund and bank balances into January 1 of the new year and seal the prior year as <strong>Closed</strong>. If an auditor later requires an adjustment in a closed year, open the <strong>Year Rollover</strong> modal while viewing that year to unseal/reopen it.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {onOpenDrive && (
                <button
                  onClick={() => {
                    onOpenDrive();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Configure Google Drive</span>
                </button>
              )}
              {onOpenRollover && (
                <button
                  onClick={() => {
                    onOpenRollover();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-700"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Year Rollover &amp; Archive Settings</span>
                </button>
              )}
            </div>
          </div>
        ),
      },

      // CATEGORY: COMMON FAQS
      {
        id: 'faq-locked-buttons',
        category: 'faq',
        title: 'Why are the Edit, Delete, or Record buttons disabled on Collections or Expenses?',
        summary:
          'Understanding Monthly Board Approval Locks and Closed Fiscal Year protections.',
        tags: ['disabled', 'locked', 'cannot edit', 'cannot delete', 'approved', 'closed year'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              GraceBooks protects historical records in two ways:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Board-Approved &amp; Audit-Locked Month</strong>: If the selected month has been marked <em>Approved &amp; Locked</em> in the <strong>Board Monthly Report</strong>, collections and expenses dated in that month are locked against edits or deletions. To make an authorized adjustment, open the <strong>Board Monthly Report</strong> for that month and click <strong>Unlock for Amendment</strong>.
              </li>
              <li>
                <strong>Closed Fiscal Year</strong>: If an entire fiscal year was sealed during Year-End Rollover, all months in that year are read-only until reopened from the <strong>Year Rollover</strong> settings modal.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'faq-currency',
        category: 'faq',
        title: 'How do I change currency, Church Name, or Board Signatories?',
        summary: 'Updating church legal name, tax ID, senior pastor, treasurer, auditors, and currency symbol.',
        tags: ['currency', 'peso', 'php', 'profile', 'address', 'pastor', 'treasurer', 'signatories'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              Click the gear icon <Settings className="w-3.5 h-3.5 inline text-slate-500" /> in the top navigation bar to open <strong>Church Profile Settings</strong>.
            </p>
            <p>From there you can customize:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Church Name, Denomination Affiliation &amp; District Name</li>
              <li>Local Church Address, Headquarters Address &amp; Tax / SEC Registration ID</li>
              <li>Senior Pastor, Church Treasurer, Board Chair / Secretary &amp; Appointed Auditors</li>
              <li>System Currency Symbol (₱, $, €, £, etc.)</li>
            </ul>
            {onOpenProfile && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    onOpenProfile();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold"
                >
                  Open Church Profile Settings
                </button>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'faq-print-tips',
        category: 'faq',
        title: 'Tips for Printing Board Reports, Count Slips & Check Vouchers',
        summary: 'How to print crisp, single-page certificates and reports without browser URL clutter.',
        tags: ['print', 'printer', 'export', 'pdf', 'csv', 'paper', 'voucher', 'slip'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              When printing the <strong>Monthly Board Report</strong>, <strong>Tithe Count Slip</strong>, or <strong>Check / Disbursement Voucher</strong>:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Click the <strong>Print Report</strong>, <strong>Print Slip</strong>, or <strong>Print Voucher</strong> button inside the app.
              </li>
              <li>
                In your browser&apos;s Print preview dialog:
                <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                  <li>
                    Set <strong>Destination</strong> to your office printer or <em>Save as PDF</em>.
                  </li>
                  <li>
                    Under <strong>More Settings</strong>, enable <em>Background graphics</em> so signature boxes and status badges render cleanly.
                  </li>
                  <li>
                    Uncheck <em>Headers and footers</em> to remove browser URLs and timestamps from the top/bottom margins.
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        ),
      },
      {
        id: 'faq-offline',
        category: 'faq',
        title: 'Can I use GraceBooks offline without Internet?',
        summary: 'Offline local caching and syncing when Internet is restored.',
        tags: ['offline', 'internet', 'backup', 'local', 'storage'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              <strong>Yes!</strong> All ledger entries are saved immediately to your browser&apos;s local storage as you work. Tellers can count Sunday offerings and treasurers can prepare vouchers even when church Wi-Fi is unavailable.
            </p>
            <p>
              Once you reconnect to the Internet, click the <strong>Cloud Sync</strong> icon in the top bar to upload the latest annual ledger to your church Google Drive, or click <strong>Export JSON</strong> anytime to save a backup file to a flash drive.
            </p>
          </div>
        ),
      },
      {
        id: 'faq-report-issue-bug',
        category: 'faq',
        title: 'How do I report a bug, log an issue, or request a feature?',
        summary: 'Submit bug reports, issues, or ministry feature requests via our official GitHub issue tracker.',
        tags: ['bug', 'issue', 'error', 'support', 'feedback', 'github', 'feature', 'request', 'problem', 'log'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p>
              If you encounter a software bug, calculation issue, or have a suggestion for improving <strong>GraceBooks Church Finance</strong>, you can log an issue directly on our GitHub repository:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Official Issue &amp; Bug Tracker</div>
                <div className="font-mono text-[11px] text-blue-600 break-all">{APP_ISSUES_URL}</div>
              </div>
              <a
                href={APP_ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Issue / Bug</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
            <p className="text-slate-500">
              <strong>Privacy Note:</strong> When logging an issue on GitHub, please include your app version (<code>v{APP_VERSION}</code>) and steps to reproduce, but <strong>never attach live church JSON or CSV backups</strong> containing confidential member giving records.
            </p>
          </div>
        ),
      },
    ],
    [onNavigateToTab, onClose, onOpenProfile, onOpenRollover, onOpenDrive, onOpenImport, onOpenDataMode]
  );

  // Filter topics based on search query and category
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSummary = t.summary.toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchTitle || matchSummary || matchTags;
    });
  }, [topics, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  GraceBooks Church Finance — Help &amp; Operations Manual
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live church rollout guide, internal audit controls, voucher workflows &amp; reconciliation manual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, controls, or procedures (e.g. voucher, lock, rollout, remittance, transfer, discrepancy)..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scroll-smooth touch-pan-x select-none">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics List Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0 bg-slate-50/50">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="text-sm font-semibold">
                No help topics found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-slate-400">
                Try searching for keywords like &quot;voucher&quot;, &quot;lock&quot;, &quot;rollout&quot;, &quot;import&quot;, or &quot;discrepancy&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block"
              >
                View all topics
              </button>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-3.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{topic.summary}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider shrink-0">
                    {topic.category}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">{topic.content}</div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Tip: Press{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-xs">
                ?
              </kbd>{' '}
              or{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-xs">
                F1
              </kbd>{' '}
              anywhere to open this manual.
            </span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <a
              href={APP_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              <span>Report Issue / Bug</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
