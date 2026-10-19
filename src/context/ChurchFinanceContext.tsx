import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChurchFinancialData,
  CollectionItem,
  ExpenseItem,
  Fund,
  Account,
  BudgetItem,
  FundTransfer,
  ChurchProfile,
  BoardReportMeta,
} from '../types/finance';
import {
  INITIAL_CHURCH_DATA,
  DEFAULT_COLLECTION_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from '../data/initialData';
import {
  findDriveFileForYear,
  listAllAnnualDriveFiles,
  readFinancialDataFromDrive,
  createFinancialDataFileInDrive,
  updateFinancialDataInDrive,
  deleteFinancialDataFileFromDrive,
  DriveFileInfo,
  DriveFolderInfo,
  getDriveFileNameForYear,
  getOrCreateDedicatedFolder,
  GRACEBOOKS_FOLDER_NAME,
} from '../lib/driveService';
import {
  User,
  initAuth,
  googleSignIn,
  logout as authLogout,
  getAccessToken,
  markNeedsDriveConsentPrompt,
} from '../lib/firebaseAuth';
import {
  safeJsonParse,
  sanitizeFinancialData,
  toSafeFiscalYear,
} from '../lib/security';

export const getStorageKeyForYear = (year: number) =>
  `gracebooks_cfgp_data_${toSafeFiscalYear(year)}`;

const round2 = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'unsaved_changes';

export interface PendingConfirmation {
  isOpen: boolean;
  title: string;
  message: string;
  affectedItem?: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

interface ChurchFinanceContextType {
  data: ChurchFinancialData;
  user: User | null;
  accessToken: string | null;
  driveFile: DriveFileInfo | null;
  driveFolder: DriveFolderInfo | null;
  driveFolderName: string;
  annualDriveFiles: DriveFileInfo[];
  isDriveConnected: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSavedAt: string | null;
  selectedYear: number;
  selectedMonth: number;
  availableYears: number[];
  isCurrentYearClosed: boolean;
  isDemoData: boolean;
  activeFileName: string;

  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number) => void;
  startFreshLiveLedger: (keepProfile?: boolean) => void;
  reloadDemoData: () => void;

  // Financial calculations
  totalCashInAccounts: number;
  totalFundBalances: number;
  isReconciled: boolean;
  reconciliationDifference: number;
  monthCollections: number;
  monthExpenses: number;
  monthNet: number;
  ytdCollections: number;
  ytdExpenses: number;
  ytdNet: number;

  // Confirmation modal state
  pendingConfirmation: PendingConfirmation | null;
  closeConfirmation: () => void;
  requestUserConfirmation: (opts: {
    title: string;
    message: string;
    affectedItem?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }) => void;

  // Actions
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveToGoogleDrive: (forcePrompt?: boolean) => Promise<boolean>;
  reloadFromGoogleDrive: () => Promise<void>;
  deleteFileFromGoogleDrive: () => Promise<void>;
  exportJsonFile: () => void;
  importJsonFile: (importedData: ChurchFinancialData) => void;
  importCollectionsBatch: (items: Omit<CollectionItem, 'id' | 'createdAt'>[]) => void;
  importExpensesBatch: (items: Omit<ExpenseItem, 'id' | 'createdAt'>[]) => void;
  resetToSampleData: () => void;
  closeYearAndRollover: (targetNextYear: number) => Promise<void>;

  // Data mutations
  addCollection: (collection: Omit<CollectionItem, 'id' | 'createdAt'>) => void;
  updateCollection: (collection: CollectionItem) => void;
  deleteCollection: (id: string) => void;

  addExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: ExpenseItem) => void;
  deleteExpense: (id: string) => void;

  addFund: (fund: Omit<Fund, 'id'>) => void;
  updateFund: (fund: Fund) => void;
  deleteFund: (id: string) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  transferFunds: (transfer: Omit<FundTransfer, 'id' | 'createdAt'>) => void;
  deleteTransfer: (id: string) => void;

  isMonthApproved: (dateOrMonthKey: string) => boolean;
  isSelectedMonthApproved: boolean;
  reopenClosedYear: () => void;

  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (item: BudgetItem) => void;
  deleteBudgetItem: (id: string) => void;

  updateChurchProfile: (profile: Partial<ChurchProfile>) => void;
  updateBoardReportMeta: (monthKey: string, meta: Partial<BoardReportMeta>) => void;

  addCollectionCategory: (cat: string) => void;
  deleteCollectionCategory: (cat: string) => void;
  addExpenseCategory: (cat: string) => void;
  deleteExpenseCategory: (cat: string) => void;
}

const ChurchFinanceContext = createContext<ChurchFinanceContextType | undefined>(undefined);

export const ChurchFinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Selected fiscal period
  const [selectedYear, setSelectedYearState] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August 2026 default

  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026, 2027]);

  // Load state for selected year
  const loadYearDataFromStorage = (year: number): ChurchFinancialData => {
    const safeYear = toSafeFiscalYear(year, 2026);
    try {
      const key = getStorageKeyForYear(safeYear);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = safeJsonParse<any>(saved);
        // Auto-upgrade cached demo data from earlier template versions to the new fictional sample data
        if (
          parsed &&
          parsed.isDemoData &&
          parsed.version !== INITIAL_CHURCH_DATA.version
        ) {
          if (safeYear === 2026) {
            localStorage.setItem(key, JSON.stringify(INITIAL_CHURCH_DATA));
            return INITIAL_CHURCH_DATA;
          }
        }
        if (parsed && Array.isArray(parsed.funds) && parsed.funds.length > 0) {
          return sanitizeFinancialData(parsed, safeYear);
        }
      }
    } catch (e) {
      console.warn(`Could not read cached data for ${safeYear}:`, e);
    }
    // Default to INITIAL_CHURCH_DATA for 2026
    if (year === 2026) {
      return INITIAL_CHURCH_DATA;
    }
    // Check if 2026 data exists in storage to inherit church profile, categories, and live/demo mode
    let inheritedProfile = INITIAL_CHURCH_DATA.profile;
    let inheritedCategories = INITIAL_CHURCH_DATA.categories;
    let inheritedIsDemo = false;
    try {
      const ref2026 = localStorage.getItem(getStorageKeyForYear(2026));
      if (ref2026) {
        const parsedRef = JSON.parse(ref2026);
        if (parsedRef?.profile) inheritedProfile = parsedRef.profile;
        if (parsedRef?.categories) inheritedCategories = parsedRef.categories;
        if (parsedRef?.isDemoData !== undefined) inheritedIsDemo = parsedRef.isDemoData;
      }
    } catch {
      // ignore
    }
    return {
      ...INITIAL_CHURCH_DATA,
      fiscalYear: year,
      isDemoData: inheritedIsDemo,
      profile: inheritedProfile,
      categories: inheritedCategories,
      funds: INITIAL_CHURCH_DATA.funds.map((f) => ({ ...f, balance: 0 })),
      accounts: INITIAL_CHURCH_DATA.accounts.map((a) => ({ ...a, balance: 0 })),
      collections: [],
      expenses: [],
      transfers: [],
      boardReports: {},
      lastModified: new Date().toISOString(),
    };
  };

  const [data, setData] = useState<ChurchFinancialData>(() => loadYearDataFromStorage(2026));
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveFile, setDriveFile] = useState<DriveFileInfo | null>(null);
  const [driveFolder, setDriveFolder] = useState<DriveFolderInfo | null>(null);
  const [annualDriveFiles, setAnnualDriveFiles] = useState<DriveFileInfo[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Active file name
  const activeFileName = useMemo(() => getDriveFileNameForYear(selectedYear), [selectedYear]);

  // Confirmation modal state
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const closeConfirmation = useCallback(() => {
    setPendingConfirmation(null);
  }, []);

  const requestUserConfirmation = useCallback((opts: {
    title: string;
    message: string;
    affectedItem?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }) => {
    setPendingConfirmation({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      affectedItem: opts.affectedItem,
      confirmLabel: opts.confirmLabel || 'Proceed',
      isDestructive: opts.isDestructive !== undefined ? opts.isDestructive : true,
      onConfirm: async () => {
        setPendingConfirmation(null);
        await opts.onConfirm();
      },
    });
  }, []);

  // Persist locally for current year
  const persistLocally = useCallback((newData: ChurchFinancialData, year: number) => {
    try {
      localStorage.setItem(getStorageKeyForYear(year), JSON.stringify(newData));
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('LocalStorage persist error:', err);
    }
  }, []);

  const updateData = useCallback(
    (updater: (prev: ChurchFinancialData) => ChurchFinancialData) => {
      setData((prev) => {
        const next = updater(prev);
        next.lastModified = new Date().toISOString();
        persistLocally(next, selectedYear);
        if (accessToken) {
          setSyncStatus('unsaved_changes');
        }
        return next;
      });
    },
    [persistLocally, accessToken, selectedYear]
  );

  // Search Drive for file for the active year
  const checkDriveForYearFile = useCallback(async (token: string, year: number) => {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      try {
        const folder = await getOrCreateDedicatedFolder(token);
        setDriveFolder(folder);
      } catch (fe) {
        console.warn('Could not initialize dedicated folder:', fe);
      }

      const file = await findDriveFileForYear(token, year);
      if (file) {
        setDriveFile(file);
        const remoteData = await readFinancialDataFromDrive(token, file.id);
        if (remoteData && remoteData.funds) {
          setData(remoteData);
          persistLocally(remoteData, year);
          setSyncStatus('synced');
          setLastSavedAt(new Date(file.modifiedTime).toLocaleTimeString());
        }
      } else {
        setDriveFile(null);
        setSyncStatus('idle');
      }

      // Refresh list of all annual files
      const allFiles = await listAllAnnualDriveFiles(token);
      setAnnualDriveFiles(allFiles);

      // Extract years from file names
      const discoveredYears = allFiles
        .map((f) => {
          const match = f.name.match(/\d{4}/);
          return match ? parseInt(match[0]) : null;
        })
        .filter((y): y is number => y !== null);

      if (discoveredYears.length > 0) {
        setAvailableYears((prev) => Array.from(new Set([...prev, ...discoveredYears])).sort((a, b) => b - a));
      }
    } catch (err: any) {
      console.error(`Drive lookup error for year ${year}:`, err);
      setSyncError(err.message || 'Unable to read from Google Drive');
      setSyncStatus('error');
    }
  }, [persistLocally]);

  // Year Switcher Handler
  const setSelectedYear = useCallback((newYear: number) => {
    setSelectedYearState(newYear);
    const localData = loadYearDataFromStorage(newYear);
    setData(localData);

    if (accessToken) {
      checkDriveForYearFile(accessToken, newYear);
    }
  }, [accessToken, checkDriveForYearFile]);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDriveFile(null);
        setSyncStatus('idle');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) {
      checkDriveForYearFile(accessToken, selectedYear);
    }
  }, [accessToken, selectedYear, checkDriveForYearFile]);

  // Google Login Flow
  const loginWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      setSyncError(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await checkDriveForYearFile(res.accessToken, selectedYear);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setSyncError(err.message || 'Failed to authenticate with Google');
      setSyncStatus('error');
    }
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    setAccessToken(null);
    setDriveFile(null);
    setDriveFolder(null);
    setSyncStatus('idle');
  };

  // Perform Drive save for active year file
  const executeSaveToDrive = async (): Promise<boolean> => {
    const token = accessToken || (await getAccessToken());
    if (!token) {
      setSyncError('Google Drive session expired. Please sign in again.');
      setSyncStatus('error');
      return false;
    }

    setSyncStatus('syncing');
    setSyncError(null);

    try {
      if (driveFile) {
        const updated = await updateFinancialDataInDrive(token, driveFile.id, data);
        setDriveFile(updated);
      } else {
        const created = await createFinancialDataFileInDrive(token, data, activeFileName);
        setDriveFile(created);
      }
      setSyncStatus('synced');
      setLastSavedAt(new Date().toLocaleTimeString());

      const allFiles = await listAllAnnualDriveFiles(token);
      setAnnualDriveFiles(allFiles);
      return true;
    } catch (err: any) {
      console.error('Drive save error:', err);
      setSyncError(err.message || `Error saving ${activeFileName} to Google Drive`);
      setSyncStatus('error');
      return false;
    }
  };

  const saveToGoogleDrive = async (forcePrompt: boolean = false): Promise<boolean> => {
    if (!accessToken) {
      await loginWithGoogle();
      return false;
    }

    if (driveFile && forcePrompt) {
      return new Promise<boolean>((resolve) => {
        requestUserConfirmation({
          title: `Update ${activeFileName} in Google Drive?`,
          message: `This will update the annual ledger for fiscal year ${selectedYear} in your Google Drive with latest collections, disbursements, and fund balances.`,
          affectedItem: `Google Drive File: ${driveFile.name} (File ID: ${driveFile.id})`,
          confirmLabel: 'Save Annual File',
          isDestructive: false,
          onConfirm: async () => {
            const success = await executeSaveToDrive();
            resolve(success);
          },
        });
      });
    }

    return executeSaveToDrive();
  };

  // Reload data from Drive for current year
  const reloadFromGoogleDrive = async () => {
    if (!accessToken || !driveFile) return;

    requestUserConfirmation({
      title: `Reload ${driveFile.name} from Google Drive?`,
      message: `This will replace your current browser session state for fiscal year ${selectedYear} with the copy stored in your Google Drive.`,
      affectedItem: driveFile.name,
      confirmLabel: 'Reload from Drive',
      isDestructive: true,
      onConfirm: async () => {
        setSyncStatus('syncing');
        try {
          const freshData = await readFinancialDataFromDrive(accessToken, driveFile.id);
          setData(freshData);
          persistLocally(freshData, selectedYear);
          setSyncStatus('synced');
          setLastSavedAt(new Date(freshData.lastModified || Date.now()).toLocaleTimeString());
        } catch (err: any) {
          setSyncError(err.message || 'Could not load from Google Drive');
          setSyncStatus('error');
        }
      },
    });
  };

  // Delete annual file from Drive
  const deleteFileFromGoogleDrive = async () => {
    if (!accessToken || !driveFile) return;

    requestUserConfirmation({
      title: `Permanently Delete ${driveFile.name} from Google Drive?`,
      message: `Are you sure you want to permanently delete the ${selectedYear} ledger file from your Google Drive? Your local cache will be retained, but Drive sync will be disconnected for this year.`,
      affectedItem: driveFile.name,
      confirmLabel: 'Permanently Delete File',
      isDestructive: true,
      onConfirm: async () => {
        setSyncStatus('syncing');
        try {
          await deleteFinancialDataFileFromDrive(accessToken, driveFile.id);
          setDriveFile(null);
          setSyncStatus('idle');
          const allFiles = await listAllAnnualDriveFiles(accessToken);
          setAnnualDriveFiles(allFiles);
        } catch (err: any) {
          setSyncError(err.message || 'Failed to delete file from Google Drive');
          setSyncStatus('error');
        }
      },
    });
  };

  // Close Year and Rollover Balances to Next Year
  const closeYearAndRollover = async (targetNextYear: number) => {
    const confirmMessage = `This will officially close Fiscal Year ${selectedYear} and roll forward ending balances for all ${data.funds.length} funds and ${data.accounts.length} bank accounts as the beginning balances for Fiscal Year ${targetNextYear}. A new file "${getDriveFileNameForYear(targetNextYear)}" will be initialized.`;

    requestUserConfirmation({
      title: `Close Fiscal Year ${selectedYear} & Rollover to ${targetNextYear}?`,
      message: confirmMessage,
      confirmLabel: `Close ${selectedYear} & Start ${targetNextYear}`,
      isDestructive: false,
      onConfirm: async () => {
        // 1. Mark current year as closed
        const closedCurrentYearData: ChurchFinancialData = {
          ...data,
          isYearClosed: true,
          closedAt: new Date().toISOString(),
          closedBy: `${data.profile.treasurer || 'Treasurer'} & Church Board`,
          lastModified: new Date().toISOString(),
        };
        setData(closedCurrentYearData);
        persistLocally(closedCurrentYearData, selectedYear);

        // If connected to Drive, save closed current year
        if (accessToken) {
          if (driveFile) {
            await updateFinancialDataInDrive(accessToken, driveFile.id, closedCurrentYearData);
          } else {
            await createFinancialDataFileInDrive(accessToken, closedCurrentYearData, activeFileName);
          }
        }

        // 2. Prepare next year rollover dataset
        const nextYearFunds: Fund[] = data.funds.map((f) => ({
          ...f,
          balance: f.balance, // Current ending balance becomes next year's beginning balance!
        }));

        const nextYearAccounts: Account[] = data.accounts.map((a) => ({
          ...a,
          balance: a.balance, // Bank cash carries forward
          lastReconciledDate: `${targetNextYear}-01-01`,
        }));

        const nextYearData: ChurchFinancialData = {
          version: INITIAL_CHURCH_DATA.version,
          fiscalYear: targetNextYear,
          isYearClosed: false,
          isDemoData: data.isDemoData,
          profile: { ...data.profile },
          categories: data.categories
            ? {
                collectionCategories: [...data.categories.collectionCategories],
                expenseCategories: [...data.categories.expenseCategories],
              }
            : undefined,
          funds: nextYearFunds,
          accounts: nextYearAccounts,
          collections: [], // Fresh collections for the new year
          expenses: [],    // Fresh disbursements for the new year
          transfers: [],   // Fresh transfers
          budget: [...data.budget], // Budget targets carry forward
          boardReports: {},
          lastModified: new Date().toISOString(),
        };

        // 3. Save new year data locally
        persistLocally(nextYearData, targetNextYear);

        // 4. Update available years list
        setAvailableYears((prev) => Array.from(new Set([...prev, targetNextYear])).sort((a, b) => b - a));

        // 5. Switch active year to targetNextYear and month to January
        setSelectedYearState(targetNextYear);
        setSelectedMonth(1);
        setData(nextYearData);

        // 6. Create next year file on Google Drive if connected
        if (accessToken) {
          try {
            const newFile = await createFinancialDataFileInDrive(
              accessToken,
              nextYearData,
              getDriveFileNameForYear(targetNextYear)
            );
            setDriveFile(newFile);
            setSyncStatus('synced');
            setLastSavedAt(new Date().toLocaleTimeString());

            const allFiles = await listAllAnnualDriveFiles(accessToken);
            setAnnualDriveFiles(allFiles);
          } catch (e: any) {
            console.error('Failed to create new year file on Google Drive:', e);
            setSyncError(`New year local ledger started, but failed to create Drive file: ${e.message}`);
          }
        }
      },
    });
  };

  // Export raw JSON file for active year
  const exportJsonFile = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `church_financial_data_${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import raw JSON file
  const importJsonFile = (importedData: ChurchFinancialData) => {
    const sanitized = sanitizeFinancialData(importedData, selectedYear);
    const fileYear = toSafeFiscalYear(sanitized.fiscalYear, selectedYear);
    requestUserConfirmation({
      title: `Import Church Financial Data (${fileYear})?`,
      message: `Importing this file will load ledger data for "${sanitized.profile?.name || 'Imported Church'}" into fiscal year ${fileYear}.`,
      confirmLabel: 'Import & Replace',
      isDestructive: true,
      onConfirm: () => {
        setAvailableYears((prev) => Array.from(new Set([...prev, fileYear])).sort((a, b) => b - a));
        setSelectedYearState(fileYear);
        setData(sanitized);
        persistLocally(sanitized, fileYear);
        if (accessToken) {
          setSyncStatus('unsaved_changes');
        }
      },
    });
  };

  // Bulk import collections from CSV
  const importCollectionsBatch = (newItems: Omit<CollectionItem, 'id' | 'createdAt'>[]) => {
    if (!newItems || newItems.length === 0) return;
    const now = new Date().toISOString();
    const prepared: CollectionItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `col-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
    }));

    updateData((prev) => {
      const fundMap: Record<string, number> = {};
      const accountMap: Record<string, number> = {};

      prepared.forEach((item) => {
        fundMap[item.fundId] = (fundMap[item.fundId] || 0) + (Number(item.totalAmount) || 0);
        accountMap[item.accountId] = (accountMap[item.accountId] || 0) + (Number(item.totalAmount) || 0);
      });

      const updatedFunds = prev.funds.map((f) =>
        fundMap[f.id] ? { ...f, balance: round2(f.balance + fundMap[f.id]) } : f
      );
      const updatedAccounts = prev.accounts.map((a) =>
        accountMap[a.id] ? { ...a, balance: round2(a.balance + accountMap[a.id]) } : a
      );

      return {
        ...prev,
        funds: updatedFunds,
        accounts: updatedAccounts,
        collections: [...prepared, ...prev.collections],
      };
    });
  };

  // Bulk import expenses from CSV
  const importExpensesBatch = (newItems: Omit<ExpenseItem, 'id' | 'createdAt'>[]) => {
    if (!newItems || newItems.length === 0) return;
    const now = new Date().toISOString();
    const prepared: ExpenseItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `exp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
    }));

    updateData((prev) => {
      const fundMap: Record<string, number> = {};
      const accountMap: Record<string, number> = {};

      prepared.forEach((item) => {
        if (item.status === 'void') return;
        fundMap[item.fundId] = (fundMap[item.fundId] || 0) + (Number(item.amount) || 0);
        accountMap[item.accountId] = (accountMap[item.accountId] || 0) + (Number(item.amount) || 0);
      });

      const updatedFunds = prev.funds.map((f) =>
        fundMap[f.id] ? { ...f, balance: round2(f.balance - fundMap[f.id]) } : f
      );
      const updatedAccounts = prev.accounts.map((a) =>
        accountMap[a.id] ? { ...a, balance: round2(a.balance - accountMap[a.id]) } : a
      );

      return {
        ...prev,
        funds: updatedFunds,
        accounts: updatedAccounts,
        expenses: [...prepared, ...prev.expenses],
      };
    });
  };

  const resetToSampleData = () => {
    requestUserConfirmation({
      title: 'Reset to Fictional Sample Dataset?',
      message: `This will reset all designated funds, bank accounts, collections, expenses, and categories for ${selectedYear} back to the fictional demonstration dataset.`,
      confirmLabel: 'Load Sample Data',
      isDestructive: true,
      onConfirm: () => {
        const resetData: ChurchFinancialData = {
          ...INITIAL_CHURCH_DATA,
          fiscalYear: selectedYear,
          isDemoData: true,
          profile: data.isDemoData
            ? { ...INITIAL_CHURCH_DATA.profile }
            : {
                ...INITIAL_CHURCH_DATA.profile,
                ...data.profile,
              },
        };
        setData(resetData);
        persistLocally(resetData, selectedYear);
        if (accessToken) {
          setSyncStatus('unsaved_changes');
        }
      },
    });
  };

  const startFreshLiveLedger = (keepProfile: boolean = true) => {
    const churchName = data.profile?.name || 'Church';
    requestUserConfirmation({
      title: `Start Blank Live Production Ledger for ${churchName}?`,
      message: `This will clear all demonstration transactions (collections, expenses, transfers) and reset fund & bank account balances to zero so you can record real live church transactions for fiscal year ${selectedYear}.`,
      confirmLabel: 'Start Live Production Ledger',
      isDestructive: true,
      onConfirm: () => {
        const liveData: ChurchFinancialData = {
          ...data,
          isDemoData: false,
          collections: [],
          expenses: [],
          transfers: [],
          boardReports: {},
          funds: data.funds.map((f) => ({ ...f, balance: 0 })),
          accounts: data.accounts.map((a) => ({ ...a, balance: 0 })),
          lastModified: new Date().toISOString(),
          profile: keepProfile ? data.profile : INITIAL_CHURCH_DATA.profile,
        };
        setData(liveData);
        persistLocally(liveData, selectedYear);
        if (accessToken) {
          setSyncStatus('unsaved_changes');
        }
      },
    });
  };

  const reloadDemoData = () => {
    resetToSampleData();
  };

  // Data mutations
  const addCollection = (item: Omit<CollectionItem, 'id' | 'createdAt'>) => {
    const id = `col-${Date.now()}`;
    const newItem: CollectionItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };

    updateData((prev) => {
      const updatedFunds = prev.funds.map((f) =>
        f.id === item.fundId ? { ...f, balance: round2(f.balance + item.totalAmount) } : f
      );
      const updatedAccounts = prev.accounts.map((a) =>
        a.id === item.accountId ? { ...a, balance: round2(a.balance + item.totalAmount) } : a
      );

      return {
        ...prev,
        funds: updatedFunds,
        accounts: updatedAccounts,
        collections: [newItem, ...prev.collections],
      };
    });
  };

  const updateCollection = (updatedItem: CollectionItem) => {
    updateData((prev) => {
      const oldItem = prev.collections.find((c) => c.id === updatedItem.id);
      if (!oldItem) return prev;

      let funds = [...prev.funds];
      if (oldItem.fundId === updatedItem.fundId) {
        const diff = updatedItem.totalAmount - oldItem.totalAmount;
        funds = funds.map((f) => (f.id === updatedItem.fundId ? { ...f, balance: round2(f.balance + diff) } : f));
      } else {
        funds = funds.map((f) => {
          if (f.id === oldItem.fundId) return { ...f, balance: round2(f.balance - oldItem.totalAmount) };
          if (f.id === updatedItem.fundId) return { ...f, balance: round2(f.balance + updatedItem.totalAmount) };
          return f;
        });
      }

      let accounts = [...prev.accounts];
      if (oldItem.accountId === updatedItem.accountId) {
        const diff = updatedItem.totalAmount - oldItem.totalAmount;
        accounts = accounts.map((a) =>
          a.id === updatedItem.accountId ? { ...a, balance: round2(a.balance + diff) } : a
        );
      } else {
        accounts = accounts.map((a) => {
          if (a.id === oldItem.accountId) return { ...a, balance: round2(a.balance - oldItem.totalAmount) };
          if (a.id === updatedItem.accountId) return { ...a, balance: round2(a.balance + updatedItem.totalAmount) };
          return a;
        });
      }

      return {
        ...prev,
        funds,
        accounts,
        collections: prev.collections.map((c) => (c.id === updatedItem.id ? updatedItem : c)),
      };
    });
  };

  const deleteCollection = (id: string) => {
    updateData((prev) => {
      const item = prev.collections.find((c) => c.id === id);
      if (!item) return prev;

      const funds = prev.funds.map((f) =>
        f.id === item.fundId ? { ...f, balance: round2(f.balance - item.totalAmount) } : f
      );
      const accounts = prev.accounts.map((a) =>
        a.id === item.accountId ? { ...a, balance: round2(a.balance - item.totalAmount) } : a
      );

      return {
        ...prev,
        funds,
        accounts,
        collections: prev.collections.filter((c) => c.id !== id),
      };
    });
  };

  const addExpense = (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const id = `exp-${Date.now()}`;
    const newItem: ExpenseItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };
    const effectiveDeduction = item.status === 'void' ? 0 : item.amount;

    updateData((prev) => {
      const funds = prev.funds.map((f) =>
        f.id === item.fundId ? { ...f, balance: round2(f.balance - effectiveDeduction) } : f
      );
      const accounts = prev.accounts.map((a) =>
        a.id === item.accountId ? { ...a, balance: round2(a.balance - effectiveDeduction) } : a
      );

      return {
        ...prev,
        funds,
        accounts,
        expenses: [newItem, ...prev.expenses],
      };
    });
  };

  const updateExpense = (updatedItem: ExpenseItem) => {
    updateData((prev) => {
      const oldItem = prev.expenses.find((e) => e.id === updatedItem.id);
      if (!oldItem) return prev;

      const oldDeduction = oldItem.status === 'void' ? 0 : oldItem.amount;
      const newDeduction = updatedItem.status === 'void' ? 0 : updatedItem.amount;

      let funds = [...prev.funds];
      if (oldItem.fundId === updatedItem.fundId) {
        const diff = newDeduction - oldDeduction;
        funds = funds.map((f) => (f.id === updatedItem.fundId ? { ...f, balance: round2(f.balance - diff) } : f));
      } else {
        funds = funds.map((f) => {
          if (f.id === oldItem.fundId) return { ...f, balance: round2(f.balance + oldDeduction) };
          if (f.id === updatedItem.fundId) return { ...f, balance: round2(f.balance - newDeduction) };
          return f;
        });
      }

      let accounts = [...prev.accounts];
      if (oldItem.accountId === updatedItem.accountId) {
        const diff = newDeduction - oldDeduction;
        accounts = accounts.map((a) =>
          a.id === updatedItem.accountId ? { ...a, balance: round2(a.balance - diff) } : a
        );
      } else {
        accounts = accounts.map((a) => {
          if (a.id === oldItem.accountId) return { ...a, balance: round2(a.balance + oldDeduction) };
          if (a.id === updatedItem.accountId) return { ...a, balance: round2(a.balance - newDeduction) };
          return a;
        });
      }

      return {
        ...prev,
        funds,
        accounts,
        expenses: prev.expenses.map((e) => (e.id === updatedItem.id ? updatedItem : e)),
      };
    });
  };

  const deleteExpense = (id: string) => {
    updateData((prev) => {
      const item = prev.expenses.find((e) => e.id === id);
      if (!item) return prev;

      const restoredAmount = item.status === 'void' ? 0 : item.amount;

      const funds = prev.funds.map((f) =>
        f.id === item.fundId ? { ...f, balance: round2(f.balance + restoredAmount) } : f
      );
      const accounts = prev.accounts.map((a) =>
        a.id === item.accountId ? { ...a, balance: round2(a.balance + restoredAmount) } : a
      );

      return {
        ...prev,
        funds,
        accounts,
        expenses: prev.expenses.filter((e) => e.id !== id),
      };
    });
  };

  const addFund = (fund: Omit<Fund, 'id'>) => {
    const id = `fund-${Date.now()}`;
    updateData((prev) => ({
      ...prev,
      funds: [...prev.funds, { ...fund, id }],
    }));
  };

  const updateFund = (fund: Fund) => {
    updateData((prev) => ({
      ...prev,
      funds: prev.funds.map((f) => (f.id === fund.id ? fund : f)),
    }));
  };

  const deleteFund = (id: string) => {
    updateData((prev) => ({
      ...prev,
      funds: prev.funds.filter((f) => f.id !== id),
    }));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const id = `acct-${Date.now()}`;
    updateData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, { ...account, id }],
    }));
  };

  const updateAccount = (account: Account) => {
    updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === account.id ? account : a)),
    }));
  };

  const deleteAccount = (id: string) => {
    updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
    }));
  };

  const transferFunds = (transfer: Omit<FundTransfer, 'id' | 'createdAt'>) => {
    const id = `tr-${Date.now()}`;
    const newTransfer: FundTransfer = {
      ...transfer,
      id,
      createdAt: new Date().toISOString(),
    };

    updateData((prev) => {
      const funds = prev.funds.map((f) => {
        if (f.id === transfer.fromFundId) return { ...f, balance: round2(f.balance - transfer.amount) };
        if (f.id === transfer.toFundId) return { ...f, balance: round2(f.balance + transfer.amount) };
        return f;
      });

      const accounts = prev.accounts.map((a) => {
        if (a.id === transfer.fromAccountId) return { ...a, balance: round2(a.balance - transfer.amount) };
        if (a.id === transfer.toAccountId) return { ...a, balance: round2(a.balance + transfer.amount) };
        return a;
      });

      return {
        ...prev,
        funds,
        accounts,
        transfers: [newTransfer, ...prev.transfers],
      };
    });
  };

  const deleteTransfer = (id: string) => {
    updateData((prev) => {
      const tr = prev.transfers.find((t) => t.id === id);
      if (!tr) return prev;

      const funds = prev.funds.map((f) => {
        if (f.id === tr.fromFundId) return { ...f, balance: round2(f.balance + tr.amount) };
        if (f.id === tr.toFundId) return { ...f, balance: round2(f.balance - tr.amount) };
        return f;
      });

      const accounts = prev.accounts.map((a) => {
        if (a.id === tr.fromAccountId) return { ...a, balance: round2(a.balance + tr.amount) };
        if (a.id === tr.toAccountId) return { ...a, balance: round2(a.balance - tr.amount) };
        return a;
      });

      return {
        ...prev,
        funds,
        accounts,
        transfers: prev.transfers.filter((t) => t.id !== id),
      };
    });
  };

  const isMonthApproved = useCallback(
    (dateOrMonthKey: string) => {
      const monthKey = dateOrMonthKey.slice(0, 7);
      return data.boardReports?.[monthKey]?.motionStatus === 'approved';
    },
    [data.boardReports]
  );

  const reopenClosedYear = () => {
    updateData((prev) => ({
      ...prev,
      isYearClosed: false,
    }));
  };

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const id = `bud-${Date.now()}`;
    updateData((prev) => ({
      ...prev,
      budget: [...prev.budget, { ...item, id }],
    }));
  };

  const updateBudgetItem = (item: BudgetItem) => {
    updateData((prev) => ({
      ...prev,
      budget: prev.budget.map((b) => (b.id === item.id ? item : b)),
    }));
  };

  const deleteBudgetItem = (id: string) => {
    updateData((prev) => ({
      ...prev,
      budget: prev.budget.filter((b) => b.id !== id),
    }));
  };

  const updateChurchProfile = (profileUpdate: Partial<ChurchProfile>) => {
    updateData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profileUpdate },
    }));
  };

  const updateBoardReportMeta = (monthKey: string, meta: Partial<BoardReportMeta>) => {
    updateData((prev) => {
      const existing = prev.boardReports[monthKey] || {
        month: selectedMonth,
        year: selectedYear,
        preparedBy: prev.profile.treasurer,
        presentedDate: new Date().toISOString().split('T')[0],
        boardChairNotes: '',
        treasurerComments: '',
        motionStatus: 'draft',
      };

      return {
        ...prev,
        boardReports: {
          ...prev.boardReports,
          [monthKey]: {
            ...existing,
            ...meta,
          },
        },
      };
    });
  };

  const addCollectionCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    updateData((prev) => {
      const currentCats = prev.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES;
      if (currentCats.includes(trimmed)) return prev;
      return {
        ...prev,
        categories: {
          collectionCategories: [...currentCats, trimmed],
          expenseCategories: prev.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES,
        },
      };
    });
  };

  const deleteCollectionCategory = (cat: string) => {
    updateData((prev) => {
      const currentCats = prev.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES;
      return {
        ...prev,
        categories: {
          collectionCategories: currentCats.filter((c) => c !== cat),
          expenseCategories: prev.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES,
        },
      };
    });
  };

  const addExpenseCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    updateData((prev) => {
      const currentCats = prev.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES;
      if (currentCats.includes(trimmed)) return prev;
      return {
        ...prev,
        categories: {
          collectionCategories: prev.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES,
          expenseCategories: [...currentCats, trimmed],
        },
      };
    });
  };

  const deleteExpenseCategory = (cat: string) => {
    updateData((prev) => {
      const currentCats = prev.categories?.expenseCategories || DEFAULT_EXPENSE_CATEGORIES;
      return {
        ...prev,
        categories: {
          collectionCategories: prev.categories?.collectionCategories || DEFAULT_COLLECTION_CATEGORIES,
          expenseCategories: currentCats.filter((c) => c !== cat),
        },
      };
    });
  };

  // Reactive Totals
  const totalCashInAccounts = useMemo(() => {
    return data.accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  }, [data.accounts]);

  const totalFundBalances = useMemo(() => {
    return data.funds.reduce((acc, f) => acc + (f.balance || 0), 0);
  }, [data.funds]);

  const reconciliationDifference = useMemo(() => {
    return Number((totalCashInAccounts - totalFundBalances).toFixed(2));
  }, [totalCashInAccounts, totalFundBalances]);

  const isReconciled = useMemo(() => {
    return Math.abs(reconciliationDifference) < 0.01;
  }, [reconciliationDifference]);

  const monthString = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  }, [selectedYear, selectedMonth]);

  const isSelectedMonthApproved = useMemo(() => {
    return data.boardReports?.[monthString]?.motionStatus === 'approved';
  }, [data.boardReports, monthString]);

  const monthCollections = useMemo(() => {
    return data.collections
      .filter((c) => c.date.startsWith(monthString))
      .reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  }, [data.collections, monthString]);

  const monthExpenses = useMemo(() => {
    return data.expenses
      .filter((e) => e.date.startsWith(monthString) && e.status !== 'void')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [data.expenses, monthString]);

  const monthNet = useMemo(() => {
    return monthCollections - monthExpenses;
  }, [monthCollections, monthExpenses]);

  const yearString = useMemo(() => `${selectedYear}-`, [selectedYear]);

  const ytdCollections = useMemo(() => {
    return data.collections
      .filter((c) => c.date.startsWith(yearString))
      .reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  }, [data.collections, yearString]);

  const ytdExpenses = useMemo(() => {
    return data.expenses
      .filter((e) => e.date.startsWith(yearString) && e.status !== 'void')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [data.expenses, yearString]);

  const ytdNet = useMemo(() => {
    return ytdCollections - ytdExpenses;
  }, [ytdCollections, ytdExpenses]);

  return (
    <ChurchFinanceContext.Provider
      value={{
        data,
        user,
        accessToken,
        driveFile,
        driveFolder,
        driveFolderName: GRACEBOOKS_FOLDER_NAME,
        annualDriveFiles,
        isDriveConnected: !!user && !!accessToken,
        syncStatus,
        syncError,
        lastSavedAt,
        selectedYear,
        selectedMonth,
        availableYears,
        isCurrentYearClosed: !!data.isYearClosed,
        isDemoData: data.isDemoData !== false,
        activeFileName,
        setSelectedYear,
        setSelectedMonth,
        startFreshLiveLedger,
        reloadDemoData,
        totalCashInAccounts,
        totalFundBalances,
        isReconciled,
        reconciliationDifference,
        monthCollections,
        monthExpenses,
        monthNet,
        ytdCollections,
        ytdExpenses,
        ytdNet,
        pendingConfirmation,
        closeConfirmation,
        requestUserConfirmation,
        loginWithGoogle,
        logout,
        saveToGoogleDrive,
        reloadFromGoogleDrive,
        deleteFileFromGoogleDrive,
        exportJsonFile,
        importJsonFile,
        importCollectionsBatch,
        importExpensesBatch,
        resetToSampleData,
        closeYearAndRollover,
        addCollection,
        updateCollection,
        deleteCollection,
        addExpense,
        updateExpense,
        deleteExpense,
        addFund,
        updateFund,
        deleteFund,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        deleteTransfer,
        isMonthApproved,
        isSelectedMonthApproved,
        reopenClosedYear,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        updateChurchProfile,
        updateBoardReportMeta,
        addCollectionCategory,
        deleteCollectionCategory,
        addExpenseCategory,
        deleteExpenseCategory,
      }}
    >
      {children}
    </ChurchFinanceContext.Provider>
  );
};

export const useChurchFinance = () => {
  const context = useContext(ChurchFinanceContext);
  if (!context) {
    throw new Error('useChurchFinance must be used within a ChurchFinanceProvider');
  }
  return context;
};
