import { ChurchFinancialData } from '../types/finance';
import {
  INITIAL_CHURCH_DATA,
  DEFAULT_COLLECTION_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from '../data/initialData';

/**
 * Protects exported CSV cells against CSV Formula Injection (CWE-1236 / DDE Injection)
 * in Excel, Google Sheets, and LibreOffice Calc, while properly escaping double quotes.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  // If string starts with =, +, -, @, tab, or CR (and isn't a plain negative number like "-123.45"),
  // prefix with a single quote so spreadsheet software treats it strictly as text.
  if (/^[=+\-@\t\r]/.test(str) && !/^-\d+(\.\d+)?$/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Sanitizes free-text fields imported from external CSV files to strip spreadsheet formula prefixes.
 */
export function sanitizeCsvTextField(value: string | undefined, maxLength = 500): string {
  if (!value) return '';
  let cleaned = value.trim();
  // Strip leading spreadsheet formula triggers (=, +, @, tab, CR) or leading '-/+= combos
  cleaned = cleaned.replace(/^['"]?[=+@\t\r]+/, '');
  return cleaned.slice(0, maxLength);
}

/**
 * Safely parses JSON while stripping __proto__, constructor, and prototype keys
 * to prevent Prototype Pollution attacks from untrusted backup files.
 */
export function safeJsonParse<T = unknown>(text: string): T {
  return JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  }) as T;
}

/**
 * Ensures a numeric value is a finite number, defaulting to fallback (0) if NaN or Infinity.
 */
export function toSafeNumber(val: unknown, fallback = 0): number {
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? Math.round((num + Number.EPSILON) * 100) / 100 : fallback;
}

/**
 * Validates and normalizes a fiscal year integer within a safe range (2000 - 2100).
 */
export function toSafeFiscalYear(val: unknown, fallback = 2026): number {
  const num = typeof val === 'number' ? Math.trunc(val) : parseInt(String(val), 10);
  if (Number.isInteger(num) && num >= 2000 && num <= 2100) {
    return num;
  }
  return fallback;
}

/**
 * Validates Google Drive File/Folder IDs to prevent path traversal or query injection.
 */
export function isValidDriveId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{5,128}$/.test(id);
}

/**
 * Escapes single quotes and backslashes inside Google Drive API `q` query strings.
 */
export function escapeDriveQueryString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Ensures a Google Drive webViewLink points strictly to a trusted Google domain.
 */
export function getSafeDriveWebUrl(
  webViewLink: string | undefined,
  id?: string,
  isFolder = false
): string {
  if (webViewLink) {
    try {
      const parsed = new URL(webViewLink);
      if (
        parsed.protocol === 'https:' &&
        (parsed.hostname === 'drive.google.com' || parsed.hostname === 'docs.google.com')
      ) {
        return parsed.toString();
      }
    } catch {
      // Fall through to safe fallback
    }
  }
  if (id && isValidDriveId(id)) {
    return isFolder
      ? `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`
      : `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
  }
  return 'https://drive.google.com';
}

/**
 * Validates and normalizes an untrusted ChurchFinancialData payload from JSON import,
 * Google Drive, or localStorage to guarantee structural integrity and finite balances.
 */
export function sanitizeFinancialData(
  raw: unknown,
  fallbackYear = 2026
): ChurchFinancialData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid financial data payload: expected an object.');
  }

  const obj = raw as Record<string, any>;

  if (!Array.isArray(obj.funds) || !Array.isArray(obj.accounts)) {
    throw new Error('Invalid church financial JSON: missing funds or accounts arrays.');
  }

  const fiscalYear = toSafeFiscalYear(obj.fiscalYear, fallbackYear);
  const rawProfile = obj.profile && typeof obj.profile === 'object' ? obj.profile : {};

  const profile = {
    name: String(rawProfile.name || INITIAL_CHURCH_DATA.profile.name).slice(0, 200),
    denomination: String(rawProfile.denomination || INITIAL_CHURCH_DATA.profile.denomination).slice(0, 200),
    headquartersAddress: String(
      rawProfile.headquartersAddress ?? INITIAL_CHURCH_DATA.profile.headquartersAddress ?? ''
    ).slice(0, 300),
    address: String(rawProfile.address || INITIAL_CHURCH_DATA.profile.address).slice(0, 300),
    district: String(rawProfile.district || INITIAL_CHURCH_DATA.profile.district).slice(0, 200),
    taxId: String(rawProfile.taxId || INITIAL_CHURCH_DATA.profile.taxId).slice(0, 100),
    seniorPastor: String(rawProfile.seniorPastor || INITIAL_CHURCH_DATA.profile.seniorPastor).slice(0, 150),
    treasurer: String(rawProfile.treasurer || INITIAL_CHURCH_DATA.profile.treasurer).slice(0, 150),
    boardChair: String(rawProfile.boardChair || INITIAL_CHURCH_DATA.profile.boardChair).slice(0, 150),
    auditor1: String(rawProfile.auditor1 ?? INITIAL_CHURCH_DATA.profile.auditor1 ?? '').slice(0, 150),
    auditor2: String(rawProfile.auditor2 || INITIAL_CHURCH_DATA.profile.auditor2 || '').slice(0, 150),
    currencySymbol:
      !rawProfile.currencySymbol || rawProfile.currencySymbol === '$'
        ? '₱'
        : String(rawProfile.currencySymbol).slice(0, 10),
    fiscalYearStartMonth:
      typeof rawProfile.fiscalYearStartMonth === 'number' &&
      rawProfile.fiscalYearStartMonth >= 1 &&
      rawProfile.fiscalYearStartMonth <= 12
        ? rawProfile.fiscalYearStartMonth
        : 1,
  };

  const funds = obj.funds
    .filter((f: any) => f && typeof f === 'object' && f.id && f.name)
    .map((f: any) => ({
      ...f,
      id: String(f.id).slice(0, 100),
      name: String(f.name).slice(0, 150),
      code: String(f.code || 'FUND').slice(0, 30),
      description: String(f.description || '').slice(0, 500),
      balance: toSafeNumber(f.balance, 0),
      targetBalance: f.targetBalance !== undefined ? toSafeNumber(f.targetBalance, 0) : undefined,
      color: String(f.color || 'blue').slice(0, 30),
    }));

  const accounts = obj.accounts
    .filter((a: any) => a && typeof a === 'object' && a.id && a.name)
    .map((a: any) => ({
      ...a,
      id: String(a.id).slice(0, 100),
      name: String(a.name).slice(0, 150),
      institution: String(a.institution || '').slice(0, 150),
      accountNumberLast4: String(a.accountNumberLast4 || '0000').slice(0, 10),
      balance: toSafeNumber(a.balance, 0),
      lastReconciledDate: String(a.lastReconciledDate || `${fiscalYear}-01-01`).slice(0, 20),
    }));

  const collections = Array.isArray(obj.collections)
    ? obj.collections
        .filter((c: any) => c && typeof c === 'object' && c.id)
        .map((c: any) => ({
          ...c,
          id: String(c.id).slice(0, 100),
          date: String(c.date || `${fiscalYear}-01-01`).slice(0, 20),
          fundId: String(c.fundId || '').slice(0, 100),
          accountId: String(c.accountId || '').slice(0, 100),
          category: String(c.category || 'Tithes & General Offerings').slice(0, 200),
          totalAmount: toSafeNumber(c.totalAmount, 0),
          cashAmount: toSafeNumber(c.cashAmount, 0),
          checksAmount: toSafeNumber(c.checksAmount, 0),
          digitalAmount: toSafeNumber(c.digitalAmount, 0),
          counters: Array.isArray(c.counters)
            ? c.counters.map((cnt: any) => String(cnt).slice(0, 150))
            : [],
          notes: c.notes ? String(c.notes).slice(0, 1000) : undefined,
        }))
    : [];

  const expenses = Array.isArray(obj.expenses)
    ? obj.expenses
        .filter((e: any) => e && typeof e === 'object' && e.id)
        .map((e: any) => ({
          ...e,
          id: String(e.id).slice(0, 100),
          date: String(e.date || `${fiscalYear}-01-01`).slice(0, 20),
          payee: String(e.payee || '').slice(0, 200),
          amount: toSafeNumber(e.amount, 0),
          category: String(e.category || '').slice(0, 200),
          department: String(e.department || '').slice(0, 150),
          fundId: String(e.fundId || '').slice(0, 100),
          accountId: String(e.accountId || '').slice(0, 100),
          description: String(e.description || '').slice(0, 1000),
          approvedBy: String(e.approvedBy || '').slice(0, 150),
        }))
    : [];

  const budget = Array.isArray(obj.budget)
    ? obj.budget
        .filter((b: any) => b && typeof b === 'object' && b.id)
        .map((b: any) => ({
          ...b,
          id: String(b.id).slice(0, 100),
          category: String(b.category || '').slice(0, 200),
          department: String(b.department || '').slice(0, 150),
          fundId: String(b.fundId || '').slice(0, 100),
          monthlyBudget: toSafeNumber(b.monthlyBudget, 0),
          annualBudget: toSafeNumber(b.annualBudget, 0),
        }))
    : [];

  const transfers = Array.isArray(obj.transfers)
    ? obj.transfers
        .filter((t: any) => t && typeof t === 'object' && t.id)
        .map((t: any) => ({
          ...t,
          id: String(t.id).slice(0, 100),
          date: String(t.date || `${fiscalYear}-01-01`).slice(0, 20),
          fromFundId: String(t.fromFundId || '').slice(0, 100),
          toFundId: String(t.toFundId || '').slice(0, 100),
          fromAccountId: String(t.fromAccountId || '').slice(0, 100),
          toAccountId: String(t.toAccountId || '').slice(0, 100),
          amount: toSafeNumber(t.amount, 0),
          reason: String(t.reason || '').slice(0, 500),
          authorizedBy: String(t.authorizedBy || '').slice(0, 150),
        }))
    : [];

  const categories =
    obj.categories &&
    Array.isArray(obj.categories.collectionCategories) &&
    Array.isArray(obj.categories.expenseCategories)
      ? {
          collectionCategories: obj.categories.collectionCategories.map((c: any) =>
            String(c).slice(0, 150)
          ),
          expenseCategories: obj.categories.expenseCategories.map((c: any) =>
            String(c).slice(0, 150)
          ),
        }
      : {
          collectionCategories: DEFAULT_COLLECTION_CATEGORIES,
          expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
        };

  const boardReports =
    obj.boardReports && typeof obj.boardReports === 'object' && !Array.isArray(obj.boardReports)
      ? obj.boardReports
      : {};

  return {
    version: String(obj.version || INITIAL_CHURCH_DATA.version).slice(0, 20),
    fiscalYear,
    isDemoData: Boolean(obj.isDemoData),
    isYearClosed: Boolean(obj.isYearClosed),
    closedAt: obj.closedAt ? String(obj.closedAt).slice(0, 50) : undefined,
    closedBy: obj.closedBy ? String(obj.closedBy).slice(0, 150) : undefined,
    profile,
    categories,
    funds,
    accounts,
    collections,
    expenses,
    budget,
    transfers,
    boardReports,
    lastModified: String(obj.lastModified || new Date().toISOString()).slice(0, 50),
  };
}
