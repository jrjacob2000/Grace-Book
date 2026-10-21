import React, { useState } from 'react';
import {
  FileText,
  Scale,
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import {
  APP_NAME,
  APP_VERSION,
  APP_REPO_URL,
  APP_ISSUES_URL,
  APP_TERMS_URL,
} from '../constants/version';

interface TermsOfServiceViewProps {
  onNavigate: (tab: string) => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onNavigate }) => {
  const [copiedUrlType, setCopiedUrlType] = useState<'github' | 'spa' | null>(null);

  const spaTermsUrl = 'https://jrjacob2000.github.io/Grace-Book/?page=terms';

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
              onClick={() => onNavigate('privacy')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Privacy Policy</span>
            </button>
            <a
              href="./terms.html"
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
              {APP_TERMS_URL}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopy(APP_TERMS_URL, 'github')}
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
                  <span>Copy Terms URL</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleCopy(spaTermsUrl, 'spa')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Copy in-app query link"
            >
              {copiedUrlType === 'spa' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <span>Copy ?page=terms</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Terms of Service Document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Official Terms of Service &amp; User Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Terms of Service — {APP_NAME}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <span><strong>Effective Date:</strong> January 1, 2025</span>
            <span>•</span>
            <span><strong>Last Updated:</strong> October 2026 (v{APP_VERSION})</span>
            <span>•</span>
            <span><strong>License:</strong> Free for Churches &amp; Non-Profit Ministries</span>
          </div>
        </div>

        {/* Terms Body */}
        <div className="p-6 sm:p-8 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p>
              By accessing or using <strong>{APP_NAME}</strong> (&ldquo;GraceBooks&rdquo;, &ldquo;the Application&rdquo;, &ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service and our Privacy Policy. If you are using the Application on behalf of a local church, congregation, or ministry organization, you represent that you are authorized to accept these terms on behalf of that organization.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>2. Description of Service &amp; Local-First Operation</span>
            </h2>
            <p>
              {APP_NAME} is a browser-based church fund accounting, tithe &amp; offering collection tracker, expense voucher generator, and monthly board reporting application.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Client-Side Execution:</strong> All financial calculations, fund reconciliations, and report generations occur directly inside your web browser.
              </li>
              <li>
                <strong>Optional Google Drive Sync:</strong> Users may optionally connect a Google Account to back up and synchronize their church ledger JSON files directly to their own Google Drive using the restricted <code>drive.file</code> scope.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900">
              3. User Responsibilities, Data Ownership &amp; Backups
            </h2>
            <p>
              Your congregation retains <strong>100% ownership and stewardship responsibility</strong> over all financial records, member names, and accounting entries created in {APP_NAME}. Because we do not store copies of your ledger on our own servers, you agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Regular Backups:</strong> You are solely responsible for maintaining regular backups of your financial data (either by exporting JSON backup files to a secure drive or enabling Google Drive Cloud Sync).Clearing your browser cache or site data without a backup will permanently erase unsynced local records.
              </li>
              <li>
                <strong>Account &amp; Device Security:</strong> You are responsible for securing access to the computers, browsers, and Google Accounts used by your church treasurers and finance officers.
              </li>
              <li>
                <strong>Donor &amp; Member Privacy:</strong> When entering member or donor names into the Application, you agree to comply with applicable local data privacy laws and church governance policies—including never uploading live member data to public bug trackers.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5 p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>4. No Professional Accounting, Tax, or Legal Advice</span>
            </h2>
            <p className="text-slate-800">
              {APP_NAME} is a bookkeeping calculation and reporting tool provided for convenience and ministry stewardship. <strong>The Application does not constitute certified public accounting (CPA), tax, audit, or legal advice.</strong> Church treasurers and boards remain responsible for verifying the accuracy of all financial reports, tax-exempt filings, and denominational remittances in accordance with their local regulations and bylaws.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900">
              5. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <p>
              {APP_NAME} is provided completely free of charge on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis, without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              To the maximum extent permitted by applicable law, the authors, contributors, and maintainers of {APP_NAME} shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to loss of financial data, accounting discrepancies, browser storage failures, or third-party service interruptions (such as Google Drive API downtime).
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2.5">
            <h2 className="text-lg font-bold text-slate-900">
              6. Third-Party Services (Google APIs)
            </h2>
            <p>
              When you choose to use Google Sign-In or Google Drive Sync, your use of those features is also subject to Google&apos;s Terms of Service and Google Privacy Policy. You may disconnect your Google Account or stop using {APP_NAME} at any time.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              7. Changes to Terms &amp; Contact Information
            </h2>
            <p>
              We may update these Terms of Service from time to time as new accounting features are released. Continued use of {APP_NAME} constitutes acceptance of the updated terms. For questions or feedback, please visit:
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
