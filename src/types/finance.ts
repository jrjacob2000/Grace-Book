export type FundType = 'unrestricted' | 'temporarily_restricted' | 'permanently_restricted';

export interface Fund {
  id: string;
  name: string;
  code: string;
  type: FundType;
  description: string;
  balance: number;
  targetBalance?: number;
  color: string;
}

export type AccountType = 'checking' | 'savings' | 'money_market' | 'petty_cash' | 'online_clearing';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  accountNumberLast4: string;
  balance: number;
  lastReconciledDate: string;
}

export type ServiceType = 
  | 'sunday_morning' 
  | 'sunday_evening' 
  | 'midweek_prayer' 
  | 'youth_service' 
  | 'special_event' 
  | 'online_giving' 
  | 'mail_in'
  | 'other';

export interface CashBreakdown {
  thousands?: number;    // ₱1,000 bills
  fiveHundreds?: number; // ₱500 bills
  twoHundreds?: number;  // ₱200 bills
  hundreds?: number;     // ₱100 bills
  fifties?: number;      // ₱50 bills
  twenties?: number;     // ₱20 bills
  tens?: number;         // ₱10 coins / bills
  fives?: number;        // ₱5 coins
  ones?: number;         // ₱1 coins
  coins: number;         // Loose coins total (₱)
}

export interface CollectionItem {
  id: string;
  date: string; // YYYY-MM-DD
  serviceType: ServiceType;
  fundId: string;
  accountId: string;
  category: string; // e.g. "Tithes", "General Offering", "Building Pledge", "Missions", "Sunday School"
  totalAmount: number;
  cashAmount: number;
  checksAmount: number;
  digitalAmount: number;
  cashBreakdown?: CashBreakdown;
  batchNumber?: string;
  counters: string[]; // e.g. ["John Elder", "Mary Deacon"]
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 'check' | 'ach_transfer' | 'debit_card' | 'cash' | 'credit_card';
export type ExpenseStatus = 'cleared' | 'pending' | 'void';

export interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  payee: string;
  amount: number;
  category: string; // e.g., "Pastoral Support", "Utilities: Electric", "Facilities Maintenance", "Worship & AV", "Youth Ministry", "World Missions", "Benevolence Food Pantry", "Office Supplies"
  department: string; // e.g., "Administration", "Pastoral & Ministry", "Facilities & Operations", "Missions & Outreach", "Christian Education"
  fundId: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  invoiceNumber?: string;
  description: string;
  status: ExpenseStatus;
  approvedBy: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  department: string;
  type: 'income' | 'expense';
  fundId: string;
  monthlyBudget: number;
  annualBudget: number;
  notes?: string;
}

export interface FundTransfer {
  id: string;
  date: string;
  fromFundId: string;
  toFundId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reason: string;
  authorizedBy: string;
  createdAt: string;
}

export interface ChurchProfile {
  name: string;
  denomination: string;
  headquartersAddress?: string;
  address: string;
  district: string;
  taxId: string;
  seniorPastor: string;
  treasurer: string;
  boardChair: string;
  auditor1?: string;
  auditor2?: string;
  currencySymbol: string;
  fiscalYearStartMonth: number; // 1 = January
}

export interface FoursquareRemittanceSummary {
  // National Office
  districtTitheBase?: number;
  nos2Percent?: number;
  dt20Of10?: number;
  missionOffering20?: number;
  sundaySchool10Of10?: number;
  cap100Percent?: number;
  wbf100Percent?: number;
  credencialFee100?: number;
  mrp100Percent?: number;
  gff10Of10?: number;
  skc10Of10?: number;
  ufm10Of10?: number;
  ufw10Of10?: number;
  nationalTotalManual?: number;

  // District Office
  dt80Of10?: number;
  mission80?: number;
  sundaySchoolTithes?: number;
  pastorTithes?: number;
  ufmDistrict?: number;
  ufwDistrict?: number;
  fbcRemittance?: number;
  districtTotalManual?: number;
}

export interface BoardReportMeta {
  month: number; // 1-12
  year: number;
  preparedBy: string;
  presentedDate: string;
  boardChairNotes: string;
  treasurerComments: string;
  motionStatus: 'draft' | 'presented' | 'approved' | 'amended';
  approvedDate?: string;
  approvalSignees?: string;
  remittance?: FoursquareRemittanceSummary;
}

export interface CategoryOptions {
  collectionCategories: string[];
  expenseCategories: string[];
}

export interface ChurchFinancialData {
  version: string;
  fiscalYear: number;
  isDemoData?: boolean;
  isYearClosed?: boolean;
  closedAt?: string;
  closedBy?: string;
  profile: ChurchProfile;
  categories?: CategoryOptions;
  funds: Fund[];
  accounts: Account[];
  collections: CollectionItem[];
  expenses: ExpenseItem[];
  budget: BudgetItem[];
  transfers: FundTransfer[];
  boardReports: Record<string, BoardReportMeta>; // key: "YYYY-MM"
  lastModified: string;
}
