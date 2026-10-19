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
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Upload,
  Smartphone,
  Wrench,
  FileSpreadsheet,
  Settings,
  AlertTriangle,
  FileCheck,
  Compass,
  Rocket,
} from 'lucide-react';
import { APP_VERSION } from '../constants/version';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenProfile?: () => void;
  onOpenRollover?: () => void;
  onOpenDrive?: () => void;
  onOpenImport?: () => void;
}

interface HelpTopic {
  id: string;
  category: 'getting-started' | 'quickstart' | 'remittance' | 'auditing' | 'funds' | 'cloud' | 'faq';
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'getting-started', label: 'Getting Started & Setup', icon: Compass },
    { id: 'quickstart', label: 'Weekly & Monthly Routine', icon: Calendar },
    { id: 'remittance', label: 'Foursquare Remittances', icon: Calculator },
    { id: 'auditing', label: 'Cash Counting & Dual Auditor', icon: ShieldCheck },
    { id: 'funds', label: 'Fund Accounting & Discrepancies', icon: Coins },
    { id: 'cloud', label: 'Data Import/Export & Drive', icon: Cloud },
    { id: 'faq', label: 'Common Questions (FAQ)', icon: HelpCircle },
  ];

  const topics: HelpTopic[] = useMemo(
    () => [
      // CATEGORY: GETTING STARTED
      {
        id: 'first-time-setup',
        category: 'getting-started',
        title: 'First-Time Church Setup Guide (3 Simple Steps)',
        summary: 'How to configure your local congregation name, district affiliation, board officers, and switch from sample data to live production.',
        tags: ['start', 'setup', 'getting started', 'profile', 'church', 'live', 'mode', 'drive', 'new'],
        content: (
          <div className="space-y-4 text-slate-700 text-xs">
            <p className="text-slate-600">
              Welcome to <strong>GraceBooks Church Finance</strong>! Follow these three simple steps to set up your congregation&apos;s financial accounting:
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Configure Your Church &amp; Board Profile</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Click the Gear icon (<strong>⚙️</strong>) in the top navigation bar or click the button below to enter your official local church name, denomination address, district name, Tax ID, Senior Pastor, Treasurer, and Board Chair names.
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
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Choose Your Data Mode (Sample vs Live)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The app opens in <strong>Demonstration Mode</strong> pre-loaded with benchmark sample data so you can test features and train tellers. When ready to enter real church records, click <strong>Demo Data</strong> in the top bar to start a fresh live ledger or import existing spreadsheets.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-purple-950 text-sm">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Connect Google Drive Cloud Storage (Optional)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Click the Cloud icon (<strong>☁️</strong>) in the top bar to connect your church Google Drive. The app automatically creates a dedicated folder named <strong>GraceBooks Church Finance</strong> in your Drive to store and auto-sync annual financial files (e.g. <code>church_financial_data_2026.json</code>).
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
        title: 'GraceBooks Core System Overview & Navigation',
        summary: 'A quick tour of the 6 core financial modules: Dashboard, Collections, Expenses, Funds, Budget, and Board Monthly Report.',
        tags: ['overview', 'navigation', 'modules', 'dashboard', 'collections', 'expenses', 'funds', 'budget', 'reports'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p className="text-slate-600">
              GraceBooks is structured into 6 primary modules accessible from the top navigation bar:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-0.5 font-bold">1. Budget Dashboard</strong>
                <p className="text-slate-600">Real-time total cash in accounts, fund equity totals, income vs expense charts, and discrepancy alerts.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-0.5 font-bold">2. Collections (Giving)</strong>
                <p className="text-slate-600">Tally Sunday tithes, envelopes, and digital giving with Philippine bill/coin denomination count sheets and teller slips.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-0.5 font-bold">3. Expenses (Disbursements)</strong>
                <p className="text-slate-600">Record vendor payments, pastoral honoraria, utilities, and remittances with check/voucher tracking.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-0.5 font-bold">4. Funds &amp; Accounts</strong>
                <p className="text-slate-600">Manage 27 designated church funds, physical bank accounts, inter-fund transfers, and the 1-click Reconciliation Assistant.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-0.5 font-bold">5. Budget Planning</strong>
                <p className="text-slate-600">Set annual and monthly department targets to track spending compliance across the fiscal year.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-0.5 font-bold">6. Board Monthly Report</strong>
                <p className="text-slate-600">Generate printable Foursquare National (10%) and District Office remittance summaries and board reports.</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'managing-categories',
        category: 'getting-started',
        title: 'Managing Collection & Expense Line Item Categories',
        summary: 'How categories work for tithes, offerings, department expense vouchers, and budget line items.',
        tags: ['category', 'categories', 'line item', 'expense', 'collection', 'giving', 'department', 'budget'],
        content: (
          <div className="space-y-4 text-slate-700 text-xs">
            <p className="text-slate-600">
              GraceBooks uses structured categories and department tags to keep church income and expenditures compliant with Foursquare fund accounting principles:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Collection Categories */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                <strong className="font-bold text-emerald-950 text-sm block">1. Collection (Giving) Categories</strong>
                <p className="text-slate-600 leading-relaxed">
                  When recording a Sunday count sheet or digital offering in <strong>Collections</strong>, entries are categorized by giving purpose and designated fund:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li><strong>Tithes &amp; General Offerings</strong>: Allocated to General Operating Fund (101).</li>
                  <li><strong>Building Pledge &amp; Project</strong>: Assigned to Restricted Building Fund (105).</li>
                  <li><strong>Missions &amp; Outreach</strong>: Allocated to World/Foreign Mission Fund (102).</li>
                  <li><strong>CAP &amp; Auxiliaries</strong>: Assigned to CAP (103), UFM, UFW, SKC, or Children&apos;s Church.</li>
                </ul>
              </div>

              {/* Expense Categories & Departments */}
              <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2">
                <strong className="font-bold text-rose-950 text-sm block">2. Expense Categories &amp; Departments</strong>
                <p className="text-slate-600 leading-relaxed">
                  When issuing a disbursement voucher in <strong>Expenses</strong>, select the <strong>Department</strong> and specific <strong>Category</strong>:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  <li><strong>Pastoral &amp; Ministry</strong>: Pastoral support, honoraria, speaker gifts.</li>
                  <li><strong>Facilities &amp; Operations</strong>: Utilities (Electric/Water), sanctuary repairs, janitorial.</li>
                  <li><strong>Administration &amp; Remittances</strong>: National/District remittances, office supplies, bank fees.</li>
                  <li><strong>Missions &amp; Christian Ed</strong>: Tracts, Sunday School materials, youth retreats.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-slate-700 space-y-1">
              <strong className="text-blue-950 font-bold block">Custom Line Item Budgets in Budget Planning</strong>
              <p className="text-slate-600">
                To add, edit, or adjust monthly budget targets for specific categories, open the <strong>Budget Planning</strong> tab. You can set monthly target allowances for each department and line item.
              </p>
            </div>
          </div>
        ),
      },
      // CATEGORY: QUICKSTART ROUTINES
      {
        id: 'sunday-routine',
        category: 'quickstart',
        title: 'Weekly Sunday Routine (Step-by-Step)',
        summary: 'How church tellers and treasurers should handle Sunday offerings from counting to deposit.',
        tags: ['routine', 'sunday', 'workflow', 'collection', 'count', 'deposit'],
        content: (
          <div className="space-y-3">
            <p className="text-slate-700">
              Follow this standard workflow every Sunday or after every church service:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Gather Offering Envelopes & Loose Cash</strong>: Tellers collect all tithe and offering baskets immediately following the service into the secure counting room.
              </li>
              <li>
                <strong>Count Currency Bills & Coins</strong>: Open the <em>Collections</em> tab and record the exact breakdown of Philippine Peso denominations (₱1,000, ₱500, ₱200, ₱100, ₱50, ₱20, and coins).
              </li>
              <li>
                <strong>Dual Certification</strong>: Both the Primary Auditor/Teller and Secondary Witness certify the count slip by typing their names into the form.
              </li>
              <li>
                <strong>Print the Count Slip</strong>: Click <em>Print Slip</em> to create an archival paper certificate for church records and bank deposit attachment.
              </li>
              <li>
                <strong>Deposit to Physical Bank</strong>: Deposit the cash into your designated checking or savings account (e.g. Landbank, BDO).
              </li>
            </ol>
            {onNavigateToTab && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    onNavigateToTab('collections');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Go to Tithes & Collections</span>
                </button>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'monthly-closing',
        category: 'quickstart',
        title: 'Month-End Closing & Board Report Procedure',
        summary: 'How to verify fund balances and generate the official monthly financial report.',
        tags: ['month', 'closing', 'board', 'report', 'reconciliation'],
        content: (
          <div className="space-y-3">
            <p className="text-slate-700">
              At the close of each calendar month (e.g. October 31):
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Verify All Expenses & Checks</strong>: Ensure all payment vouchers, church utility bills, and pastor honoraria have been entered under the <em>Expenses</em> tab.
              </li>
              <li>
                <strong>Check Master Bank Reconciliation</strong>: Navigate to <em>Funds & Accounts</em> and verify the green &quot;Church Ledger in Perfect Balance&quot; badge, confirming Total Cash in Bank equals Total Designated Fund Balances.
              </li>
              <li>
                <strong>Open Board Monthly Report</strong>: View the auto-populated spreadsheet replica. Verify beginning balances, monthly receipts, disbursements, and remittances.
              </li>
              <li>
                <strong>Print or Export for Elder Board</strong>: Click <em>Print Report</em> for board meetings and district remittance submissions, or <em>Export CSV</em> for spreadsheet analysis.
              </li>
            </ol>
            {onNavigateToTab && (
              <div className="pt-2">
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

      // CATEGORY: REMITTANCE
      {
        id: 'foursquare-remittance-formulas',
        category: 'remittance',
        title: 'Foursquare Remittance Formulas Explained',
        summary: 'The exact percentage formulas used for National and District Office remittances.',
        tags: ['remittance', 'foursquare', 'cfgp', 'national', 'district', 'tithe', 'nos'],
        content: (
          <div className="space-y-3">
            <p className="text-slate-700">
              The application automatically calculates quotas following standard Church of the Foursquare Gospel in the Philippines (CFGP) accounting:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                <h4 className="font-bold text-amber-900 flex items-center gap-1">
                  <span>National Office Share</span>
                </h4>
                <ul className="space-y-1 text-slate-700 list-disc pl-4 text-[11px]">
                  <li><strong>District Tithe Base</strong>: 10% of General Fund monthly receipts.</li>
                  <li><strong>NOS (National Office Share)</strong>: 2% of General Fund monthly receipts.</li>
                  <li><strong>DT 20% of 10%</strong>: 20% of the calculated District Tithe base.</li>
                  <li><strong>Mission Offering</strong>: 20% of monthly Mission Fund collections.</li>
                  <li><strong>Sunday School</strong>: 10% of 10% (1%) of Sunday School collections.</li>
                  <li><strong>C.A.P., W.B.F., Credencial, MRP</strong>: 100% remitted to National Office.</li>
                  <li><strong>Auxiliaries (GFF, SKC, UFM, UFW)</strong>: 10% of 10% of auxiliary collections.</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <h4 className="font-bold text-blue-900 flex items-center gap-1">
                  <span>District Office Share</span>
                </h4>
                <ul className="space-y-1 text-slate-700 list-disc pl-4 text-[11px]">
                  <li><strong>DT 80% of 10%</strong>: 80% of the calculated District Tithe base.</li>
                  <li><strong>Mission 80%</strong>: 80% of monthly Mission Fund collections.</li>
                  <li><strong>Sunday School Tithes</strong>: 90% remaining from Sunday School collection.</li>
                  <li><strong>Pastor Tithes</strong>: 10% of Senior Pastor honorarium/allowance.</li>
                  <li><strong>Auxiliaries (UFM, UFW)</strong>: Remainder remitted to District Department.</li>
                  <li><strong>Foursquare Bible College (FBC)</strong>: Monthly student ministry contribution.</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              Need custom amounts or special offsets? Click <strong>Edit Values</strong> on the Board Report to adjust any quota or formula manually.
            </p>
          </div>
        ),
      },

      // CATEGORY: AUDITING
      {
        id: 'dual-auditor-procedure',
        category: 'auditing',
        title: 'Dual Custody & Auditor Verification Protocol',
        summary: 'Best financial stewardship practices for counting tithes and certifying slips.',
        tags: ['auditor', 'counters', 'dual', 'custody', 'witness', 'slip'],
        content: (
          <div className="space-y-3 text-slate-700">
            <p>
              In biblical stewardship and church non-profit governance, <strong>dual custody</strong> protects church staff from false accusations and prevents counting errors:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Primary Teller / Counter</strong>: The main individual responsible for physically sorting and tallying bills and loose coins.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Secondary Auditor / Witness</strong>: An independent church council member or deacon volunteer who verifies each denomination stack before the batch is sealed.
                </div>
              </div>
            </div>
            <p className="text-xs">
              Slips generated in this app include signature lines for both auditors. If on a particular service only one counter is available, you may certify with the primary auditor and record the reason in the batch notes.
            </p>
          </div>
        ),
      },

      // CATEGORY: FUNDS & DISCREPANCIES
      {
        id: 'fund-accounting-rule',
        category: 'funds',
        title: 'The Golden Rule of Church Fund Accounting',
        summary: 'Understanding why Fund Equity must balance with Physical Bank Accounts.',
        tags: ['funds', 'accounts', 'equity', 'reconciled', 'golden rule', 'transfers'],
        content: (
          <div className="space-y-3 text-slate-700">
            <p>
              Unlike commercial companies that operate with a single cash account, churches maintain <strong>Designated Restricted Funds</strong>:
            </p>
            <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-lg text-emerald-950 font-medium text-xs">
              Golden Rule: Total Cash in All Bank Accounts = Total Balances of All Designated Funds
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong>Unrestricted Operating Fund (General Fund)</strong>: Used for day-to-day operations, utilities, district tithes, pastoral compensation, and regular church maintenance.
              </li>
              <li>
                <strong>Restricted Funds (Building, Mission, Benevolence, Sunday School)</strong>: Funds given by donors for a specific purpose cannot legally or ethically be spent on regular operating expenses without elder board authorization.
              </li>
              <li>
                <strong>Inter-Fund Transfers</strong>: When moving funds (e.g. allocating operating surplus to the Building Expansion fund), always record an <em>Inter-Fund Transfer</em> with the Board Resolution number for audit compliance.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'fix-discrepancy-guide',
        category: 'funds',
        title: 'How to Fix a Fund & Bank Discrepancy (Variance)',
        summary: 'Step-by-step resolution using the automated Reconciliation Assistant or manual edits.',
        tags: ['fix', 'discrepancy', 'variance', 'difference', 'reconciliation', 'balance', 'audit'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p>
              When the banner shows <strong>&quot;Discrepancy Between Bank Cash &amp; Fund Equity&quot;</strong>, it means the total money in all physical bank accounts differs from the total allocated across all church funds.
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg">
                <strong className="text-amber-950 block mb-1">Method 1: Use the Reconciliation Assistant (Instant)</strong>
                <p>
                  1. Go to the <strong>Funds &amp; Accounts</strong> tab (or click &quot;Reconcile Now&quot; on the Dashboard).<br />
                  2. On the yellow discrepancy card, click the <strong>&quot;Fix Discrepancy&quot;</strong> button.<br />
                  3. Choose <strong>Option 1 (Recommended)</strong> to adjust the General Operating Fund to match your physical bank cash, or <strong>Option 2</strong> to adjust a specific bank account.<br />
                  4. The app balances the ledger to ₱0.00 difference instantly.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">Method 2: Manual Audit Resolution</strong>
                <p>
                  1. Compare each account under <strong>Physical Bank Accounts</strong> with your actual latest bank statements or passbook.<br />
                  2. If an account balance in the app is wrong, click the edit icon (✏️) on that account and update its balance.<br />
                  3. If a fund balance was manually altered without updating an account, click the edit icon (✏️) on that fund to correct it.<br />
                  4. Once the totals match, the status automatically turns to the green <em>&quot;Church Ledger in Perfect Balance&quot;</em> badge.
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
        summary: 'Restore full annual ledger backups or bulk-upload giving & disbursements from spreadsheets.',
        tags: ['import', 'export', 'csv', 'json', 'backup', 'restore', 'spreadsheet', 'excel', 'upload'],
        content: (
          <div className="space-y-3 text-slate-700 text-xs">
            <p>
              GraceBooks provides dual data import and export capabilities for complete accounting portability:
            </p>
            <div className="space-y-2.5">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <strong className="text-blue-950 block mb-1">1. Full System Backup (JSON)</strong>
                <p className="text-slate-600">
                  Restore an entire annual ledger file (<code>church_financial_data_[year].json</code>). Restores all 27 fund balances, physical bank accounts, collection count sheets, expense payment vouchers, and monthly board report remittance quotas in a single click.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <strong className="text-emerald-950 block mb-1">2. Giving &amp; Tithes CSV Import</strong>
                <p className="text-slate-600">
                  Bulk upload Sunday collections from Excel or Google Sheets. Download our free CSV template, paste your records, and the system automatically credits designated funds and deposits cash into your designated church accounts.
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                <strong className="text-rose-950 block mb-1">3. Disbursements &amp; Expenses CSV Import</strong>
                <p className="text-slate-600">
                  Bulk upload church expenses, vendor bills, and honoraria payments with payee, check numbers, fund assignments, and voucher departments.
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
        title: 'Google Drive Sync & Yearly File Rollover',
        summary: 'How yearly files keep church records clean and prevent performance slowdowns.',
        tags: ['drive', 'cloud', 'backup', 'rollover', 'yearly', 'json'],
        content: (
          <div className="space-y-3 text-slate-700">
            <p>
              To maintain pristine performance and comply with annual audit records, this system saves your data on a <strong>yearly basis inside a dedicated Google Drive folder</strong>:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <strong className="text-blue-950 block mb-1">Dedicated Folder: &quot;GraceBooks Church Finance&quot;</strong>
                <span>
                  All church annual ledgers and cloud backups are saved inside a dedicated folder named <strong>GraceBooks Church Finance</strong> in your Google Drive, keeping your Drive root organized.
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">Yearly Storage Model</strong>
                <span>
                  Each calendar year is isolated in its own file (e.g. <code>church_financial_data_2026.json</code>). You can switch between historical years using the year selector in the top bar anytime.
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block mb-1">Annual Rollover Process</strong>
                <span>
                  At the end of December, click <strong>Rollover Year</strong>. The system will:
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>Carry forward ending fund and bank balances into January 1 of the new year.</li>
                    <li>Mark the previous year as a sealed/closed audit record.</li>
                    <li>Create the new year file on Google Drive automatically.</li>
                  </ul>
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
                  <span>Year Rollover Settings</span>
                </button>
              )}
            </div>
          </div>
        ),
      },

      // CATEGORY: COMMON FAQS
      {
        id: 'faq-mobile',
        category: 'faq',
        title: 'How do form textboxes and modals work on mobile phones?',
        summary: 'Responsive stacking designed to prevent date pickers and currency textboxes from overlapping on phone screens.',
        tags: ['mobile', 'overlap', 'textbox', 'phone', 'responsive'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              On mobile viewports (&lt;640px), modal forms automatically adapt to a single responsive column (`grid-cols-1`).
            </p>
            <p>
              This ensures that <strong>Transfer Date</strong> and <strong>Transfer Amount</strong> fields stack vertically with generous touch targets, preventing mobile date picker popups from overlapping adjacent textboxes.
            </p>
            <p>
              Similarly, fund and bank account dropdowns take full width on phone screens so that church account titles and balance numbers are legible without truncation.
            </p>
          </div>
        ),
      },
      {
        id: 'faq-report-wrapping',
        category: 'faq',
        title: 'Why was small text or formula descriptions wrapping on the report?',
        summary: 'How the spreadsheet replica was enhanced to protect formulas and small text from line breaks.',
        tags: ['wrapping', 'report', 'board', 'text', 'small', 'formulas'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              In earlier versions, rigid 12-column grid containers caused parenthetical formulas like <code>(Gen. Fund Receipt x 10%)</code> and <code>(10% of 10%)</code> to wrap onto multiple lines even when horizontal space was available.
            </p>
            <p>
              The Financial Board Report has been updated with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dynamic Flex Containers</strong>: Fluid distribution of column space between remittance line descriptions and calculated amounts.</li>
              <li><strong>`whitespace-nowrap` Rules</strong>: Formulas, district percentages, and table headers are locked to single-line display.</li>
              <li><strong>Generous Container Width</strong>: The report canvas now provides <code>min-w-[780px] lg:min-w-[840px]</code> with horizontal scrolling for screens with lower resolution, preventing column compression.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'faq-currency',
        category: 'faq',
        title: 'How do I change currency or Church Profile details?',
        summary: 'Updating church legal name, tax ID, senior pastor, and default currency.',
        tags: ['currency', 'peso', 'php', 'profile', 'address', 'pastor'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              Click the gear icon <Settings className="w-3.5 h-3.5 inline text-slate-500" /> next to your church name in the top navigation bar.
            </p>
            <p>
              From the <strong>Church Profile Settings</strong> modal, you can update:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Church Name & Denomination</li>
              <li>Local Address & Headquarters Address</li>
              <li>District Name (e.g. Romblon Aklan District)</li>
              <li>Senior Pastor, Church Treasurer, and Appointed Auditors</li>
              <li>System Currency Symbol (Preset button for Philippine Peso ₱)</li>
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
        title: 'Tips for Clean Printing & Exporting',
        summary: 'How to print without browser headers or margins cutting off columns.',
        tags: ['print', 'printer', 'export', 'pdf', 'csv', 'paper'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              When printing the <strong>Monthly Board Report</strong> or <strong>Tithe Count Slip</strong>:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click the <strong>Print Report</strong> or <strong>Print Slip</strong> button inside the app.</li>
              <li>In your browser&apos;s Print preview dialog:
                <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                  <li>Set <strong>Destination</strong> to your printer or <em>Save as PDF</em>.</li>
                  <li>Set <strong>Layout</strong> to <em>Portrait</em> (or <em>Landscape</em> for wide spreadsheets).</li>
                  <li>Under <strong>More Settings</strong>, check <em>Background graphics</em> so color banners and borders appear correctly.</li>
                  <li>Uncheck <em>Headers and footers</em> to remove browser URLs and timestamps.</li>
                </ul>
              </li>
            </ol>
          </div>
        ),
      },
      {
        id: 'faq-offline',
        category: 'faq',
        title: 'Can I use this app without Internet?',
        summary: 'Offline capabilities and local device caching.',
        tags: ['offline', 'internet', 'backup', 'local', 'storage'],
        content: (
          <div className="space-y-2 text-slate-700 text-xs">
            <p>
              <strong>Yes!</strong> All data is cached instantly to your browser&apos;s secure local storage as you type. You can record offerings and expenses on a laptop in church even without Wi-Fi.
            </p>
            <p>
              When your device reconnects to the Internet, simply click <strong>Sync with Drive</strong> in the top bar to back up your year file to your church Google Drive folder.
            </p>
            <p>
              You can also click <strong>Export JSON</strong> anytime to download a physical backup file to your USB drive or computer.
            </p>
          </div>
        ),
      },
    ],
    [onNavigateToTab, onClose, onOpenProfile, onOpenRollover, onOpenDrive, onOpenImport]
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
                <h3 className="font-bold text-base sm:text-lg tracking-tight">Church Finance Help & User Guide</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stewardship procedures, Foursquare remittance formulas, and system manual
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
              placeholder="Search topics, formulas, or procedures (e.g. remittance, auditor, rollover, import, discrepancy)..."
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
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
              <p className="text-sm font-semibold">No help topics found matching &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-slate-400">Try searching for keywords like &quot;tithe&quot;, &quot;import&quot;, &quot;auditor&quot;, or &quot;discrepancy&quot;.</p>
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

                <div className="pt-2 border-t border-slate-100">
                  {topic.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-xs">?</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-xs">F1</kbd> anywhere to open this guide.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
