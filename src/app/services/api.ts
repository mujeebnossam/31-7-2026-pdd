// SpendWise AI — Frontend API Service
// All HTTP requests to the Express backend are made through this module.
// The JWT token is automatically attached to protected requests.

const API_BASE = '/api';

// ─── Token Helpers ─────────────────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem('sw_token');
export const setToken = (token: string): void => localStorage.setItem('sw_token', token);
export const clearToken = (): void => localStorage.removeItem('sw_token');

// ─── Core Fetch Wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server returned an invalid response');
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  financialScore: number;
  memberSince: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<AuthUser>('/auth/me'),
  deleteAccount: () => apiFetch<{ message: string }>('/auth/account', { method: 'DELETE' }),
};

// ─── Accounts ─────────────────────────────────────────────────────────────

export interface ApiAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  bank: string;
  last4: string;
  color: string;
}

export const accountsApi = {
  getAll: () => apiFetch<ApiAccount[]>('/accounts'),

  create: (data: Omit<ApiAccount, 'id'>) =>
    apiFetch<ApiAccount>('/accounts', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Omit<ApiAccount, 'id'>>) =>
    apiFetch<ApiAccount>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/accounts/${id}`, { method: 'DELETE' }),
};

// ─── Transactions ─────────────────────────────────────────────────────────

export interface ApiTransaction {
  id: string;
  title: string;
  merchant?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon?: string;
  status?: string;
  notes?: string;
  accountId?: string;
  source?: string;
  externalTransactionId?: string;
}

export const transactionsApi = {
  getAll: (params?: { type?: string; category?: string; accountId?: string; limit?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiFetch<ApiTransaction[]>(`/transactions${qs}`);
  },

  create: (data: Omit<ApiTransaction, 'id'>) =>
    apiFetch<ApiTransaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Omit<ApiTransaction, 'id'>>) =>
    apiFetch<ApiTransaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' }),
};

// ─── Budgets ──────────────────────────────────────────────────────────────

export interface ApiBudget {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  period?: string;
  color?: string;
  icon?: string;
}

export const budgetsApi = {
  getAll: (month?: string) => {
    const qs = month ? `?month=${encodeURIComponent(month)}` : '';
    return apiFetch<ApiBudget[]>(`/budgets${qs}`);
  },

  create: (data: { category: string; budgeted: number; color?: string; icon?: string; period?: string }) =>
    apiFetch<ApiBudget>('/budgets', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ category?: string; budgeted?: number; color?: string; icon?: string; period?: string }>) =>
    apiFetch<ApiBudget>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/budgets/${id}`, { method: 'DELETE' }),
};

// ─── Goals ────────────────────────────────────────────────────────────────

export interface ApiGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  category?: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const goalsApi = {
  getAll: () => apiFetch<ApiGoal[]>('/goals'),

  create: (data: Omit<ApiGoal, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiFetch<ApiGoal>('/goals', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Omit<ApiGoal, 'id' | 'createdAt' | 'updatedAt'>>) =>
    apiFetch<ApiGoal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  contribute: (id: string, amount: number, type: 'deposit' | 'withdrawal' = 'deposit', accountId?: string) =>
    apiFetch<{ message: string; goal: ApiGoal; accountBalanceAfter?: number }>(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount, type, accountId }),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/goals/${id}`, { method: 'DELETE' }),
};

// ─── Bills ────────────────────────────────────────────────────────────────

export interface ApiBill {
  id: string;
  name: string;
  amount: number;
  dueDay?: number;
  dueDate?: string;
  category: string;
  frequency?: string;
  status?: string;
  autopay?: boolean;
  paidDate?: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const billsApi = {
  getAll: () => apiFetch<ApiBill[]>('/bills'),

  create: (data: Omit<ApiBill, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiFetch<ApiBill>('/bills', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Omit<ApiBill, 'id' | 'createdAt' | 'updatedAt'>>) =>
    apiFetch<ApiBill>(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  pay: (id: string, accountId?: string) =>
    apiFetch<{ message: string; bill: ApiBill }>(`/bills/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/bills/${id}`, { method: 'DELETE' }),
};

// ─── AI Intelligence ──────────────────────────────────────────────────────

export interface ApiAIInsight {
  id: string;
  type: 'spending' | 'saving' | 'budget' | 'goal' | 'bill' | 'subscription' | 'anomaly' | 'cashflow' | 'progress' | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  category: string;
  supportingMetric?: string;
  action: string;
  impact?: number;
  icon: string;
}

export interface ApiFinancialSummary {
  userId: string;
  netWorth: number;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
  }[];
  currentMonth: {
    key: string;
    label: string;
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
    dailyAverage: number;
  };
  previousMonth: {
    key: string;
    label: string;
    income: number;
    expenses: number;
    net: number;
  };
  momChange: {
    expenseDelta: number;
    expensePercent: number;
    incomeDelta: number;
    incomePercent: number;
    netDelta: number;
    netPercent: number;
  };
  trendHistory: {
    monthKey: string;
    label: string;
    income: number;
    expenses: number;
    net: number;
  }[];
  categorySpending: {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }[];
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }[];
  averageMonthlyExpense: number;
  totalTransactionsCount: number;
  budgets: {
    id: string;
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    isOverBudget: boolean;
    color?: string;
    icon?: string;
  }[];
  totalBudgeted: number;
  totalBudgetSpent: number;
  overBudgetCategories: string[];
  goals: {
    id: string;
    name: string;
    target: number;
    current: number;
    remaining: number;
    progressPercent: number;
    deadline?: string;
    requiredMonthlyContribution: number;
    isCompleted: boolean;
    category?: string;
  }[];
  totalGoalTarget: number;
  totalGoalCurrent: number;
  totalMonthlyGoalRequired: number;
  bills: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    dueDay?: number;
    category: string;
    frequency: string;
    status: string;
    autopay: boolean;
    isOverdue: boolean;
    isDueSoon: boolean;
    isPaid: boolean;
    monthlyEquivalent: number;
  }[];
  upcomingBillsCount: number;
  upcomingBillsTotal: number;
  overdueBillsCount: number;
  overdueBillsTotal: number;
  dueSoonBillsCount: number;
  monthlyRecurringOutflow: number;
  subscriptions: {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    monthlyEquivalent: number;
    annualCost: number;
  }[];
  totalSubscriptionAnnualCost: number;
  largeTransactions: {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
  }[];
  anomalies: {
    transactionId: string;
    title: string;
    merchant: string;
    amount: number;
    category: string;
    date: string;
    typicalAverage: number;
    multiplier: number;
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }[];
  financialHealth: {
    score: number;
    grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
    composite0to100: number;
    savingsRateScore: number;
    cushionScore: number;
    spendRatioScore: number;
    stabilityScore: number;
    recommendation: string;
  };
}

export interface ApiFinancialPredictions {
  userId: string;
  disclaimer: string;
  confidence: 'low' | 'medium' | 'high';
  confidenceReason: string;
  nextMonth: {
    monthLabel: string;
    predictedIncome: number;
    predictedExpenses: number;
    predictedNetCashFlow: number;
    predictedSavingsRate: number;
  };
  trajectory: {
    trend: 'improving' | 'stable' | 'declining';
    reason: string;
    projected3MonthSavings: number;
    projectedYearEndNetWorth: number;
  };
  categoryPredictions: {
    category: string;
    historicalAverage: number;
    predictedAmount: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
    confidence: 'low' | 'medium' | 'high';
  }[];
  goalPredictions: {
    goalId: string;
    name: string;
    target: number;
    current: number;
    remaining: number;
    requiredMonthlySavings: number;
    projectedMonthlySavings: number;
    status: 'on_track' | 'at_risk' | 'likely_late' | 'completed';
    estimatedCompletionMonth: string;
    monthsToComplete: number;
    recommendation: string;
  }[];
  recurringProjections: {
    monthlyRecurringOutflow: number;
    quarterlyProjectedBills: number;
    annualProjectedBills: number;
    subscriptionAnnualDrain: number;
  };
}

export const aiApi = {
  getSummary: () => apiFetch<ApiFinancialSummary>('/ai/summary'),

  getInsights: () => apiFetch<ApiAIInsight[]>('/ai/insights'),

  getPredictions: () => apiFetch<ApiFinancialPredictions>('/ai/predictions'),

  chat: (prompt: string, conversationId?: string) =>
    apiFetch<{ response: string; conversationId: string; messageId: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, conversationId }),
    }),

  getConversations: () => apiFetch<any[]>('/ai/conversations'),

  clearConversations: () => apiFetch<{ message: string }>('/ai/conversations', { method: 'DELETE' }),

  suggestCategory: (merchant: string) =>
    apiFetch<{ category: string; confidence: number; icon: string }>('/ai/suggest-category', {
      method: 'POST',
      body: JSON.stringify({ merchant }),
    }),
};

// ─── Automated Ingestion & Data Providers ──────────────────────────────────

export interface ApiDataProvider {
  id: string;
  name: string;
  type: 'MANUAL' | 'CSV_IMPORT' | 'BANK' | 'UPI' | 'DEMO';
  status: 'ACTIVE' | 'PREPARED_DEMO' | 'PLANNED_FUTURE';
  description: string;
  capabilities: string[];
  isConfigured: boolean;
}

export interface ApiNormalizedTransaction {
  id?: string;
  externalTransactionId?: string | null;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  title: string;
  category: string;
  rawDescription?: string | null;
  confidence: number;
  source: string;
  accountId?: string | null;
  isDuplicate: boolean;
  duplicateReason?: string | null;
  isValid: boolean;
  validationErrors: string[];
}

export interface ApiCSVParseResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  totalIncome: number;
  totalExpense: number;
  detectedColumns: string[];
  columnMapping: Record<string, string>;
  rows: ApiNormalizedTransaction[];
}

export interface ApiBatchImportResult {
  totalRows: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  invalidCount: number;
  totalInflow: number;
  totalOutflow: number;
  importedTransactions: any[];
  accountBalanceAfter: number;
  accountName: string;
}

export interface ApiDemoIngestionResult {
  transaction: any;
  merchant: string;
  category: string;
  confidence: number;
  accountName: string;
  balanceBefore: number;
  balanceAfter: number;
  budgetStatus?: {
    category: string;
    budgeted: number;
    spentBefore: number;
    spentAfter: number;
    percentUsed: number;
    isOverBudget: boolean;
  };
  notification: {
    type: 'transaction' | 'alert' | 'budget';
    title: string;
    message: string;
  };
  aiInsightRecommendation: string;
}

export const ingestionApi = {
  getProviders: () => apiFetch<ApiDataProvider[]>('/ingestion/providers'),

  parseCsv: (csvContent: string, accountId?: string) =>
    apiFetch<ApiCSVParseResult>('/ingestion/csv/parse', {
      method: 'POST',
      body: JSON.stringify({ csvContent, accountId }),
    }),

  confirmCsvImport: (transactions: ApiNormalizedTransaction[], accountId: string, skipDuplicates: boolean = true) =>
    apiFetch<ApiBatchImportResult>('/ingestion/csv/confirm', {
      method: 'POST',
      body: JSON.stringify({ transactions, accountId, skipDuplicates }),
    }),

  simulateDemo: (payload: {
    merchant?: string;
    amount?: number;
    type?: 'expense' | 'income';
    rawDescription?: string;
    accountId?: string;
    source?: 'demo' | 'upi' | 'bank';
    category?: string;
  }) =>
    apiFetch<ApiDemoIngestionResult>('/ingestion/demo', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};


