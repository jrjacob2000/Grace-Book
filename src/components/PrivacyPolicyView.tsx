import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  HardDrive,
  FileText,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  UserCheck,
  Trash2,
  Globe,
} from 'lucide-react';
import {
  APP_NAME,
  APP_VERSION,
  APP_REPO_URL,
  APP_ISSUES_URL,
  APP_PRIVACY_URL,
} from '../constants/version';

interface PrivacyPolicyViewProps {
  onNavigate: (tab: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
  const [copiedUrlType, setCopiedUrlType] = useState<'github' | 'spa' | null>(null);

  const spaPrivacyUrl = 'https://jrjacob2000.github.io/Grace-Book/?page=privacy';

  const handleCopy = (url: string, type: 'github' | 'spa') => {
    navigator.clipboard.writeText(url);
    setCopiedUrlType(type);
    setTimeout(() => setCopiedUrlType(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Verification URL Helper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('terms')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>View Terms of Service</span>
            </button>
            <a
              href="./privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
            >
              <span>Static HTML Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Google Cloud OAuth Verification URL Copy Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Google OAuth Verification Link (GitHub Pages)</span>
            </div>
            <p className="text-[11px] font-mono text-blue-800 break-all">
              {APP_PRIVACY_URL}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(APP_PRIVACY_URL, 'github')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {copiedUrlType === 'github' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Privacy URL</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleCopy(spaPrivacyUrl, 'spa')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Copy in-app query link"
            >
              {copiedUrlType === 'spa' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <span>Copy ?page=privacy</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Privacy Policy Document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Privacy Policy &amp; Google API Disclosure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Privacy Policy — {APP_NAME}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <span><strong>Effective Date:</strong> January 1, 2025</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> October 2026 (v{APP_VERSION})</span>
            <span>•</span>
            <span><strong>Architecture:</strong> Local-First &amp; Zero-Knowledge</span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="p-6 sm:p-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>1. Overview &amp; Local-First Privacy Commitment</span>
            </h2>
            <p>
              <strong>{APP_NAME}</strong> (&ldquo;GraceBooks&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Application&rdquo;) is a free, open-source, local-first church fund accounting and financial stewardship web application designed for church treasurers, finance committees, and ministry boards.
            </p>
            <p>
              We operate on a strict <strong>Zero-Knowledge, Local-First architecture</strong>. We do not operate centralized backend servers that collect, harvest, read, or monetize your congregation&apos;s financial transactions, donor lists, or accounting records. All church ledger data remains strictly under your control in your local web browser and, only when explicitly enabled by you, in your personal or church Google Drive account.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>2. Information We Access &amp; Collect</span>
            </h2>
            <p>
              Depending on how you use {APP_NAME}, the Application processes two categories of information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  A. Local Church Ledger Data (Stored on Device)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Includes church profile settings, ministry fund balances, bank/petty cash accounts, collection records, donor/member names, expense vouchers, and annual budgets. This data is stored locally inside your browser&apos;s <code>localStorage</code> and never leaves your device unless you export a backup or initiate a Google Drive sync.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm">
                  B. Google Account &amp; Drive Data (Optional Sync)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If you choose to sign in with Google to back up or sync your church ledger across devices, the Application requests your basic profile information (name, email address, and profile photo) via Google Sign-In and restricted access to app-created files in your Google Drive.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Google API Services Disclosure */}
          <section className="space-y-3 p-5 rounded-2xl bg-blue-50/60 border border-blue-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600 shrink-0" />
              <span>3. Google User Data &amp; Google Drive API Scope Disclosure</span>
            </h2>
            <p>
              When you voluntarily connect your Google Account to use the Cloud Sync &amp; Backup feature, {APP_NAME} requests authorization for the following specific Google OAuth 2.0 scopes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <li>
                <code className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-900 font-mono text-xs">
                  openid
                </code>
                ,{' '}
                <code className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-900 font-mono text-xs">
                  email
                </code>
                , and{' '}
                <code className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-900 font-mono text-xs">
                  profile
                </code>
                : Used solely to display your signed-in account name, email address, and avatar inside the application header and sync modal so you know which Google account is connected.
              </li>
              <li>
                <code className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-900 font-mono text-xs">
                  https://www.googleapis.com/auth/drive.file
                </code>{' '}
                <strong>(Per-File Restricted Google Drive Access)</strong>: Used exclusively to create, read, update, and list your church ledger backup files (e.g., <code>gracebooks_church_finance_db.json</code> and fiscal year archive files) inside your Google Drive.
              </li>
            </ul>
            <div className="p-3.5 rounded-xl bg-white border border-blue-200/90 text-xs text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-900">
                Strict Scope Limitation Guarantee:
              </p>
              <p>
                Because {APP_NAME} only uses the non-broad <code>drive.file</code> scope, the Application <strong>cannot see, list, read, modify, or delete any other personal or organizational files, photos, or documents</strong> stored in your Google Drive. It can only access the specific JSON ledger files created directly by {APP_NAME}.
              </p>
            </div>
          </section>

          {/* Section 4 - Limited Use Compliance */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>4. Google API Services User Data Policy (Limited Use Disclosure)</span>
            </h2>
            <p className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 font-medium">
              {APP_NAME}&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p>
              Specifically, in compliance with Google&apos;s Limited Use requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li>We <strong>do not</strong> transfer, sell, rent, or share your Google user data or church financial data with any third parties, advertisers, or data brokers.</li>
              <li>We <strong>do not</strong> use Google user data for serving advertisements, retargeting, or marketing.</li>
              <li>We <strong>do not</strong> use Google user data or your financial ledger files to train artificial intelligence (AI) or machine learning models.</li>
              <li>No human at {APP_NAME} reads your Google Drive files or local ledger data unless you explicitly share a sanitized snippet when requesting technical support.</li>
            </ul>
          </section>

          {/* Section 5 - Data Storage & Security */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900">
              5. How Your Data Is Stored &amp; Protected
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Direct Browser-to-Google HTTPS Transmission:</strong> When syncing with Google Drive, your browser communicates directly with Google&apos;s official APIs (<code>googleapis.com</code>) over TLS/HTTPS encryption. Your ledger files do not pass through any intermediate third-party storage server.
              </li>
              <li>
                <strong>Input Sanitization &amp; Integrity Checks:</strong> Imported JSON backup files and CSV spreadsheets are validated and sanitized locally in your browser to guard against prototype pollution, malformed schemas, and spreadsheet formula injection (DDE payloads).
              </li>
              <li>
                <strong>Audit Period Locking:</strong> Treasurers can lock completed monthly accounting periods to prevent accidental edits to finalized church financial reports.
              </li>
            </ul>
          </section>

          {/* Section 6 - Data Retention, Revocation & Deletion */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600 shrink-0" />
              <span>6. Data Retention, Access Revocation &amp; Deletion Rights</span>
            </h2>
            <p>
              Because you own 100% of your data, you can inspect, export, or permanently delete your data at any time without needing to contact us:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Deleting Local Browser Data:</strong> You can clear or reset your local ledger at any time from the <em>Data Mode Settings</em> modal inside the Application or by clearing your browser&apos;s site data.
              </li>
              <li>
                <strong>Deleting Google Drive Backups:</strong> Because your cloud backups are stored directly inside your own Google Drive account, you can view, move, or permanently delete <code>gracebooks_church_finance_db.json</code> at any time directly within Google Drive.
              </li>
              <li>
                <strong>Revoking Google OAuth Permissions:</strong> You can sign out inside the Application&apos;s Cloud Sync modal or revoke {APP_NAME}&apos;s access at any time via your{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Google Account Third-Party Access &amp; Permissions page
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 7 - Contact Info */}
          <section className="space-y-2 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              7. Contact Us &amp; Open-Source Repository
            </h2>
            <p>
              If you have questions about this Privacy Policy, our Google Drive integration, or data security practices, please reach out through our official project channels:
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm">
              <a
                href={APP_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold"
              >
                <span>GitHub Repository ({APP_REPO_URL})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span>•</span>
              <a
                href={APP_ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold"
              >
                <span>Support &amp; Issue Tracker</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
