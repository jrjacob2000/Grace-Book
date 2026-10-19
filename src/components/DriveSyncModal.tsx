import React, { useRef } from 'react';
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
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';

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
    data,
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

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.funds && parsed.collections) {
          importJsonFile(parsed);
          onClose();
        } else {
          alert('Invalid church financial JSON format.');
        }
      } catch (err) {
        alert('Could not parse JSON file. Please check file syntax.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Annual Google Drive Ledgers</h2>
              <p className="text-xs text-slate-500">
                Fiscal Year {selectedYear} File: <span className="font-mono font-semibold text-blue-700">{activeFileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Drive Status Banner */}
          <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Google Drive Connection
                </span>
                <p className="text-base font-semibold text-slate-800 mt-0.5">
                  {user ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Connected as {user.email || user.displayName}
                    </span>
                  ) : (
                    <span className="text-slate-600">Not connected to Google Drive</span>
                  )}
                </p>
              </div>

              {!user ? (
                <button
                  onClick={loginWithGoogle}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Connect Drive
                </button>
              ) : (
                <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Drive Active
                </span>
              )}
            </div>

            {user && (
              <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-3">
                {/* Dedicated Folder Info Card */}
                <div className="p-3 bg-white border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md shrink-0">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                        Dedicated Google Drive Folder
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {driveFolderName}
                      </span>
                    </div>
                  </div>

                  {driveFolder && (
                    <a
                      href={driveFolder.webViewLink || `https://drive.google.com/drive/folders/${driveFolder.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                    >
                      <span>Open Folder in Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Current Annual File:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeFileName}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {driveFile ? `File ID: ${driveFile.id.substring(0, 14)}...` : '(Ready to create in Drive)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Last Synced:</span>
                    <span className="text-slate-800">
                      {lastSavedAt || (driveFile ? new Date(driveFile.modifiedTime).toLocaleTimeString() : 'Not yet synced')}
                    </span>
                  </div>
                  {driveFile && driveFile.webViewLink && (
                    <div className="sm:col-span-2 pt-0.5">
                      <a
                        href={driveFile.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs font-medium"
                      >
                        <span>Open {activeFileName} file directly</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {syncError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{syncError}</span>
              </div>
            )}
          </div>

          {/* ALL ANNUAL FILES ON GOOGLE DRIVE */}
          {user && annualDriveFiles.length > 0 && (
            <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Annual Ledger Files in Your Google Drive</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {annualDriveFiles.length} file(s) found
                </span>
              </h3>

              <div className="divide-y divide-slate-200/80 max-h-36 overflow-y-auto">
                {annualDriveFiles.map((file) => {
                  const match = file.name.match(/\d{4}/);
                  const fileYear = match ? parseInt(match[0]) : null;
                  const isCurrent = file.name === activeFileName;

                  return (
                    <div key={file.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileCode className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className={`font-mono font-medium ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-800'}`}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded">
                            Active
                          </span>
                        ) : fileYear ? (
                          <button
                            onClick={() => {
                              setSelectedYear(fileYear);
                              onClose();
                            }}
                            className="px-2 py-1 text-[11px] bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium"
                          >
                            Switch to {fileYear}
                          </button>
                        ) : null}

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Open in Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drive Actions for Current Annual File */}
          {user && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Current File Operations ({activeFileName})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={async () => {
                    const success = await saveToGoogleDrive(true);
                    if (success) onClose();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-blue-900 font-medium text-xs text-left transition-colors"
                >
                  <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-semibold">Save {selectedYear} to Drive</div>
                    <div className="text-[11px] text-blue-700/80">Push changes to {activeFileName}</div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    await reloadFromGoogleDrive();
                    onClose();
                  }}
                  disabled={!driveFile}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-xs text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <div className="font-semibold">Reload from Drive</div>
                    <div className="text-[11px] text-slate-500">Pull latest cloud copy of {selectedYear}</div>
                  </div>
                </button>
              </div>

              {onOpenRolloverModal && (
                <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-blue-900 block">End of Fiscal Year?</span>
                    <span className="text-[11px] text-blue-700/80">
                      Close {selectedYear} and roll balances into a new annual file.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRolloverModal();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Rollover Year
                  </button>
                </div>
              )}

              {driveFile && (
                <div className="pt-1">
                  <button
                    onClick={async () => {
                      await deleteFileFromGoogleDrive();
                      onClose();
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1.5 font-medium hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently delete {activeFileName} from Google Drive</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Local JSON Backup & Restore */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span>Offline JSON Backups</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download the current annual ledger file directly to your computer or restore from a downloaded file.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={exportJsonFile}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download {selectedYear} JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Restore from File</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Sample Data Reset */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-700">Need starter demonstration data?</p>
              <p className="text-[11px] text-slate-500">
                Reset {selectedYear} to official sample template for {data.profile.name || 'your church'}.
              </p>
            </div>
            <button
              onClick={() => {
                resetToSampleData();
                onClose();
              }}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset {selectedYear} Template</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
