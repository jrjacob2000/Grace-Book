import React, { useRef, useState } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileCode,
  FolderOpen,
  Save,
  ArrowRightLeft,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import {
  getSafeDriveWebUrl,
  safeJsonParse,
  sanitizeFinancialData,
} from '../lib/security';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRolloverModal?: () => void;
}

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  onOpenRolloverModal,
}) => {
  const {
    user,
    driveFile,
    driveFolder,
    driveFolderName,
    annualDriveFiles,
    syncStatus,
    syncError,
    lastSavedAt,
    selectedYear,
    activeFileName,
    loginWithGoogle,
    saveToGoogleDrive,
    reloadFromGoogleDrive,
    deleteFileFromGoogleDrive,
    exportJsonFile,
    importJsonFile,
    resetToSampleData,
    setSelectedYear,
  } = useChurchFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUnsaved = syncStatus === 'unsaved_changes';
  const isSyncing = syncStatus === 'syncing';

  const handleSaveNow = async () => {
    await saveToGoogleDrive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = safeJsonParse(event.target?.result as string);
        const sanitized = sanitizeFinancialData(raw, selectedYear);
        importJsonFile(sanitized);
        onClose();
      } catch (err: any) {
        setLocalUploadError(
          err?.message || 'Could not parse JSON file. Please verify the file is a valid JSON backup.'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 truncate">
                Annual Google Drive Ledgers
              </h2>
              <p className="text-xs text-slate-500 break-all mt-0.5">
                Fiscal Year {selectedYear} File:{' '}
                <span className="font-mono font-semibold text-blue-700">
                  {activeFileName}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4 text-sm">
          {/* 1. PRIMARY SAVE & SYNC CARD — ALWAYS AT THE VERY TOP */}
          {!user ? (
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/70 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                  <Cloud className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Connect Google Drive to Save Your {selectedYear} Ledger
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your entries are currently stored only in this browser. Connect your Google Drive account to safely back up{' '}
                    <span className="font-mono font-semibold text-slate-800">
                      {activeFileName}
                    </span>{' '}
                    to the cloud.
                  </p>
                </div>
              </div>
              <button
                onClick={loginWithGoogle}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>Connect Google Drive</span>
              </button>
            </div>
          ) : isUnsaved ? (
            /* CLEAR UNSAVED PROMPT WITH ONE PRIMARY SAVE BUTTON */
            <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/90 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                    You have changes ready to save for {selectedYear}
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Your recent changes are saved in your browser, but have not been uploaded to{' '}
                    <span className="font-mono font-semibold">{activeFileName}</span>{' '}
                    in Google Drive yet.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveNow}
                disabled={isSyncing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? `Saving ${selectedYear} to Google Drive...`
                    : `Save ${selectedYear} Ledger to Google Drive`}
                </span>
              </button>
            </div>
          ) : !driveFile ? (
            /* CONNECTED TO DRIVE, BUT NO FILE CREATED FOR THIS YEAR YET */
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                  <Save className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Create {selectedYear} Ledger in Google Drive
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Click below to create{' '}
                    <span className="font-mono font-semibold text-slate-800">{activeFileName}</span>{' '}
                    inside your Google Drive folder.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveNow}
                disabled={isSyncing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? `Saving ${selectedYear} to Google Drive...`
                    : `Save ${selectedYear} Ledger to Google Drive`}
                </span>
              </button>
            </div>
          ) : (
            /* SYNCED STATE CARD AT THE TOP */
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    All {selectedYear} changes are saved in Google Drive
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Last saved:{' '}
                  <strong className="text-slate-700">
                    {lastSavedAt ||
                      new Date(driveFile.modifiedTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleSaveNow}
                  disabled={isSyncing}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className={`w-4 h-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncing ? 'Saving...' : `Save ${selectedYear} to Drive`}
                  </span>
                </button>

                <button
                  onClick={async () => {
                    await reloadFromGoogleDrive();
                    onClose();
                  }}
                  disabled={isSyncing}
                  className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Reload from Drive</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Banner (if any) */}
          {syncError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="break-words min-w-0">{syncError}</span>
            </div>
          )}

          {/* 2. SWITCH FISCAL YEAR / ANNUAL LEDGER FILES IN DRIVE */}
          {user && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 min-w-0">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Annual Ledger Files in Drive</span>
                </h3>
                <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">
                  {annualDriveFiles.length} {annualDriveFiles.length === 1 ? 'year' : 'years'} saved
                </span>
              </div>

              {annualDriveFiles.length > 0 ? (
                <div className="divide-y divide-slate-200/80 max-h-36 overflow-y-auto bg-white rounded-lg border border-slate-200 px-3">
                  {annualDriveFiles.map((file) => {
                    const match = file.name.match(/\d{4}/);
                    const fileYear = match ? parseInt(match[0]) : null;
                    const isCurrent = file.name === activeFileName;

                    return (
                      <div
                        key={file.id}
                        className="py-2 flex items-center justify-between gap-2 text-xs min-w-0"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileCode
                            className={`w-4 h-4 shrink-0 ${
                              isCurrent ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              className={`font-mono block truncate ${
                                isCurrent
                                  ? 'text-blue-700 font-bold'
                                  : 'text-slate-800 font-medium'
                              }`}
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Updated: {new Date(file.modifiedTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCurrent ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded whitespace-nowrap">
                              Current Year
                            </span>
                          ) : fileYear ? (
                            <button
                              onClick={() => {
                                setSelectedYear(fileYear);
                                onClose();
                              }}
                              className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-300 rounded text-slate-700 font-semibold whitespace-nowrap transition-colors cursor-pointer"
                            >
                              Switch to {fileYear}
                            </button>
                          ) : null}

                          {file.webViewLink && (
                            <a
                              href={getSafeDriveWebUrl(file.webViewLink, file.id, false)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                              title="Open file in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                  No annual files saved in Drive yet. Click{' '}
                  <strong>Save {selectedYear} Ledger to Google Drive</strong> above to create your first cloud ledger.
                </p>
              )}

              {onOpenRolloverModal && (
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200/80">
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-800 block">
                      Starting a New Fiscal Year?
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Roll {selectedYear} ending balances into {selectedYear + 1}.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRolloverModal();
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg shadow-2xs shrink-0 transition-colors cursor-pointer"
                  >
                    Rollover Year
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. CONNECTED GOOGLE ACCOUNT & FOLDER DETAILS */}
          {user && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase tracking-wider text-slate-500">
                  Google Drive Folder
                </span>
                <span className="text-slate-600 font-medium truncate">
                  {user.email || user.displayName}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 block truncate">
                      {driveFolderName}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {driveFile
                        ? `Active file: ${activeFileName}`
                        : `${activeFileName} will be created on next save`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUnsaved && driveFile && (
                    <button
                      onClick={async () => {
                        await reloadFromGoogleDrive();
                        onClose();
                      }}
                      disabled={isSyncing}
                      title="Reload last saved copy from Google Drive"
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reload from Drive</span>
                    </button>
                  )}

                  {driveFolder && (
                    <a
                      href={getSafeDriveWebUrl(driveFolder.webViewLink, driveFolder.id, true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 rounded-md text-xs font-semibold transition-colors"
                    >
                      <span>Open Folder</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. OFFLINE COMPUTER BACKUP (JSON) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span>Computer File Backup (.JSON)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={exportJsonFile}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Download {selectedYear} Backup</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Restore from Computer</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {localUploadError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{localUploadError}</span>
              </div>
            )}
          </div>

          {/* 5. RESET / DELETE UTILITIES */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => {
                resetToSampleData();
                onClose();
              }}
              className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset {selectedYear} to Sample Data</span>
            </button>

            {user && driveFile && (
              <button
                onClick={async () => {
                  await deleteFileFromGoogleDrive();
                  onClose();
                }}
                className="text-rose-600 hover:text-rose-800 inline-flex items-center gap-1.5 font-medium hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {activeFileName} from Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
