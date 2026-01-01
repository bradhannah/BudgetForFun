// BudgetForFun Type Definitions
// All entity interfaces, enums, and union types for the application

// ============================================================================
// Enums
// ============================================================================

type BillingPeriod = 'monthly' | 'bi_weekly' | 'weekly' | 'semi_annually';

type PaymentSourceType = 'bank_account' | 'credit_card' | 'cash';

type CategoryType = 'bill' | 'income';

type UndoEntityType = 
  | 'bill' 
  | 'income' 
  | 'variable_expense' 
  | 'free_flowing_expense' 
  | 'payment_source' 
  | 'bill_instance' 
  | 'income_instance';

// ============================================================================
// Entity Interfaces
// ============================================================================

interface Bill {
  id: string;
  name: string;
  amount: number;
  billing_period: BillingPeriod;
  start_date?: string; // ISO date string (YYYY-MM-DD), required for bi_weekly/weekly/semi_annually
  // For monthly billing: specify EITHER day_of_month OR (recurrence_week + recurrence_day)
  day_of_month?: number;      // 1-31 (use 31 for "last day of month")
  recurrence_week?: number;   // 1-5 (1st, 2nd, 3rd, 4th, 5th/last weekday of month)
  recurrence_day?: number;    // 0=Sunday, 1=Monday, ..., 6=Saturday
  payment_source_id: string;
  category_id?: string;
  due_day?: number;           // NEW: Day of month when due (1-31)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Income {
  id: string;
  name: string;
  amount: number;
  billing_period: BillingPeriod;
  start_date?: string; // ISO date string (YYYY-MM-DD), required for bi_weekly/weekly/semi_annually
  // For monthly billing: specify EITHER day_of_month OR (recurrence_week + recurrence_day)
  day_of_month?: number;      // 1-31 (use 31 for "last day of month")
  recurrence_week?: number;   // 1-5 (1st, 2nd, 3rd, 4th, 5th/last weekday of month)
  recurrence_day?: number;    // 0=Sunday, 1=Monday, ..., 6=Saturday
  payment_source_id: string;
  category_id?: string;       // NEW: Reference to income category
  due_day?: number;           // NEW: Day of month when expected (1-31)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Payment (for partial payment tracking)
// ============================================================================

interface Payment {
  id: string;
  amount: number;
  date: string;          // ISO date (YYYY-MM-DD)
  created_at: string;
}

// ============================================================================
// Instance Interfaces (Extended for Detailed Monthly View)
// ============================================================================

interface BillInstance {
  id: string;
  bill_id: string | null;     // null for ad-hoc bills
  month: string;
  amount: number;             // DEPRECATED: use expected_amount
  expected_amount: number;    // From default bill (read-only in Detailed View)
  actual_amount?: number;     // User-entered actual (for non-partial)
  payments: Payment[];        // Array of partial payments
  is_default: boolean;
  is_paid: boolean;           // DEPRECATED: use is_closed instead
  is_closed: boolean;         // True = no more transactions expected
  is_adhoc: boolean;          // True for one-time ad-hoc items
  due_date?: string;          // Calculated from Bill.due_day + month
  closed_date?: string;       // ISO date when closed (YYYY-MM-DD)
  name?: string;              // For ad-hoc items (bill_id is null)
  category_id?: string;       // For ad-hoc items (no bill reference)
  payment_source_id?: string; // For ad-hoc items (no bill reference)
  created_at: string;
  updated_at: string;
}

interface IncomeInstance {
  id: string;
  income_id: string | null;   // null for ad-hoc income
  month: string;
  amount: number;             // DEPRECATED: use expected_amount
  expected_amount: number;    // From default income
  actual_amount?: number;     // User-entered actual
  payments: Payment[];        // Array of partial receipts (transactions)
  is_default: boolean;
  is_paid: boolean;           // DEPRECATED: use is_closed instead
  is_closed: boolean;         // True = no more transactions expected
  is_adhoc: boolean;          // True for one-time ad-hoc items
  due_date?: string;          // Calculated from Income.due_day + month
  closed_date?: string;       // ISO date when closed (YYYY-MM-DD)
  name?: string;              // For ad-hoc items (income_id is null)
  category_id?: string;       // For ad-hoc items (no income reference)
  payment_source_id?: string; // For ad-hoc items (no income reference)
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Other Entity Interfaces
// ============================================================================

interface VariableExpense {
  id: string;
  name: string;
  amount: number;
  payment_source_id: string;
  month: string;
  created_at: string;
  updated_at: string;
}

interface FreeFlowingExpense {
  id: string;
  name: string;
  amount: number;
  payment_source_id: string;
  month: string;
  created_at: string;
  updated_at: string;
}

interface PaymentSource {
  id: string;
  name: string;
  type: PaymentSourceType;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  is_predefined: boolean;
  sort_order: number;         // NEW: Display order (0 = first)
  color: string;              // NEW: Hex color for header accent (e.g., "#3b82f6")
  type: CategoryType;         // NEW: 'bill' | 'income'
  created_at: string;
  updated_at: string;
}

interface MonthlyData {
  month: string;
  bill_instances: BillInstance[];
  income_instances: IncomeInstance[];
  variable_expenses: VariableExpense[];
  free_flowing_expenses: FreeFlowingExpense[];
  bank_balances: Record<string, number>;
  created_at: string;
  updated_at: string;
}

interface UndoEntry {
  id: string;
  entity_type: UndoEntityType;
  entity_id: string;
  old_value: any;
  new_value: any;
  timestamp: string;
}

interface BackupFileData {
  export_date: string;
  bills: Bill[];
  incomes: Income[];
  payment_sources: PaymentSource[];
  categories: Category[];
  months: MonthlyData[];
}

// ============================================================================
// Detailed View Types (for API responses)
// ============================================================================

interface SectionTally {
  expected: number;
  actual: number;
  remaining: number;
}

interface CategorySection {
  category: {
    id: string;
    name: string;
    color: string;
    sort_order: number;
  };
  items: BillInstanceDetailed[] | IncomeInstanceDetailed[];
  subtotal: {
    expected: number;
    actual: number;
  };
}

interface BillInstanceDetailed {
  id: string;
  bill_id: string | null;
  name: string;
  expected_amount: number;
  actual_amount: number | null;
  payments: Payment[];
  total_paid: number;
  remaining: number;
  is_paid: boolean;           // DEPRECATED: use is_closed instead
  is_closed: boolean;         // True = no more transactions expected
  is_adhoc: boolean;
  due_date: string | null;
  closed_date: string | null; // ISO date when closed
  is_overdue: boolean;
  days_overdue: number | null;
  payment_source: {
    id: string;
    name: string;
  } | null;
  category_id: string;
}

interface IncomeInstanceDetailed {
  id: string;
  income_id: string | null;
  name: string;
  expected_amount: number;
  actual_amount: number | null;
  payments: Payment[];        // Array of partial receipts (transactions)
  total_received: number;     // Sum of all payments
  remaining: number;          // expected - total_received
  is_paid: boolean;           // DEPRECATED: use is_closed instead
  is_closed: boolean;         // True = no more transactions expected
  is_adhoc: boolean;
  due_date: string | null;
  closed_date: string | null; // ISO date when closed
  is_overdue: boolean;
  payment_source: {
    id: string;
    name: string;
  } | null;
  category_id: string;
}

interface LeftoverBreakdown {
  bankBalances: number;
  actualIncome: number;
  actualBills: number;
  variableExpenses: number;
  freeFlowingExpenses: number;
  totalExpenses: number;
  leftover: number;
  hasActuals: boolean;
}

interface DetailedMonthResponse {
  month: string;
  billSections: CategorySection[];
  incomeSections: CategorySection[];
  tallies: {
    bills: SectionTally;           // Regular bills (with expected amounts)
    adhocBills: SectionTally;      // Ad-hoc bills (actual only)
    totalExpenses: SectionTally;   // Combined total
    income: SectionTally;          // Regular income
    adhocIncome: SectionTally;     // Ad-hoc income
    totalIncome: SectionTally;     // Combined total
  };
  leftover: number;
  leftoverBreakdown: LeftoverBreakdown;
  bankBalances: Record<string, number>;
  lastUpdated: string;
}

// ============================================================================
// Union Types (for convenience)
// ============================================================================

type Expense = VariableExpense | FreeFlowingExpense;

type Entity = 
  | Bill 
  | BillInstance 
  | Income 
  | IncomeInstance 
  | VariableExpense 
  | FreeFlowingExpense 
  | PaymentSource 
  | Category;

type DefaultEntity = Bill | Income | PaymentSource | Category;

type InstanceEntity = BillInstance | IncomeInstance;

// ============================================================================
// Validation Types
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Exports
// ============================================================================

export type {
  BillingPeriod,
  PaymentSourceType,
  CategoryType,
  UndoEntityType,
  Bill,
  Income,
  Payment,
  BillInstance,
  IncomeInstance,
  VariableExpense,
  FreeFlowingExpense,
  PaymentSource,
  Category,
  MonthlyData,
  UndoEntry,
  BackupFileData,
  SectionTally,
  CategorySection,
  BillInstanceDetailed,
  IncomeInstanceDetailed,
  LeftoverBreakdown,
  DetailedMonthResponse,
  Expense,
  Entity,
  DefaultEntity,
  InstanceEntity,
  ValidationResult
};
