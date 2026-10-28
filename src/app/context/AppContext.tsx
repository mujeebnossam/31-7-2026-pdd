import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, accountsApi, transactionsApi, budgetsApi, goalsApi, billsApi, clearToken, getToken } from "../services/api";

export type CurrencyType = "USD" | "INR" | "EUR";

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number; // Base amount in USD
  bank: string;
  last4: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  title?: string;
  category: string;
  amount: number; // Signed amount: negative for expense, positive for income
  account: string;
  accountId?: string;
  icon: string;
  status: string;
  type: 'income' | 'expense';
  notes?: string;
  source?: string;
  externalTransactionId?: string;
}

export interface Budget {
  id: string;
  category: string;
  budgeted: number; // Base amount in USD
  spent: number;    // Base amount in USD
  period?: string;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
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

export interface Bill {
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

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince?: string;
  financialScore?: number;
}

interface AppContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  accounts: Account[];
  addAccount: (acc: Omit<Account, "id">) => Promise<any>;
  updateAccount: (id: string, data: Partial<Omit<Account, "id">>) => Promise<any>;
  removeAccount: (id: string) => Promise<boolean>;
  transactions: Transaction[];
  addTransaction: (tx: {
    merchant?: string;
    title?: string;
    amount: number;
    type?: 'income' | 'expense';
    category: string;
    account?: string;
    accountId?: string;
    date?: string;
    icon?: string;
    notes?: string;
  }) => Promise<any>;
  updateTransaction: (id: string, data: Partial<{
    merchant?: string;
    title?: string;
    amount?: number;
    type?: 'income' | 'expense';
    category?: string;
    account?: string;
    accountId?: string;
    date?: string;
    icon?: string;
    notes?: string;
  }>) => Promise<any>;
  deleteTransaction: (id: string) => Promise<boolean>;
  budgets: Budget[];
  addBudget: (b: { category: string; budgeted: number; color?: string; icon?: string; period?: string }) => Promise<any>;
  updateBudget: (id: string, data: Partial<{ category?: string; budgeted?: number; color?: string; icon?: string; period?: string }>) => Promise<any>;
  deleteBudget: (id: string) => Promise<boolean>;
  goals: Goal[];
  addGoal: (g: {
    name: string;
    target: number;
    current?: number;
    deadline?: string;
    category?: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => Promise<any>;
  updateGoal: (
    id: string,
    data: Partial<{
      name?: string;
      target?: number;
      current?: number;
      deadline?: string;
      category?: string;
      description?: string;
      icon?: string;
      color?: string;
    }>
  ) => Promise<any>;
  deleteGoal: (id: string) => Promise<boolean>;
  contributeGoal: (id: string, amount: number, type?: 'deposit' | 'withdrawal', accountId?: string) => Promise<any>;
  bills: Bill[];
  addBill: (b: {
    name: string;
    amount: number;
    dueDay?: number;
    dueDate?: string;
    category?: string;
    frequency?: string;
    autopay?: boolean;
    description?: string;
    icon?: string;
    color?: string;
  }) => Promise<any>;
  updateBill: (
    id: string,
    data: Partial<{
      name?: string;
      amount?: number;
      dueDay?: number;
      dueDate?: string;
      category?: string;
      frequency?: string;
      status?: string;
      autopay?: boolean;
      paidDate?: string;
      description?: string;
      icon?: string;
      color?: string;
    }>
  ) => Promise<any>;
  deleteBill: (id: string) => Promise<boolean>;
  payBill: (id: string, accountId?: string) => Promise<any>;
  notifications: any[];
  addNotification: (n: any) => void;
  markNotifAsRead: (id: string) => void;
  clearAllNotifs: () => void;
  convertAndFormat: (amount: number, overrideCurrency?: CurrencyType) => string;
  convertRaw: (amount: number) => number;
  logout: () => void;
  refreshFinancialData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const EXCHANGE_RATES: Record<CurrencyType, number> = {
  USD: 1.0,
  INR: 83.0,
  EUR: 0.92,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>("USD");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const normalizeTransactions = (rawTxs: any[], accList: Account[]): Transaction[] => {
    return rawTxs.map(tx => {
      const isExpense = tx.type === 'expense';
      const rawAmt = Math.abs(parseFloat(tx.amount) || 0);
      const signedAmt = isExpense ? -rawAmt : rawAmt;
      const matchedAcc = accList.find(a => a.id === tx.accountId);
      return {
        id: tx.id,
        date: tx.date || new Date().toISOString().split('T')[0],
        merchant: tx.merchant || tx.title || 'Transaction',
        title: tx.title || tx.merchant || 'Transaction',
        category: tx.category || 'Other',
        amount: signedAmt,
        account: matchedAcc ? matchedAcc.name : (tx.account || 'General Account'),
        accountId: tx.accountId || undefined,
        icon: tx.icon || (isExpense ? '💳' : '💰'),
        status: tx.status || 'cleared',
        type: (tx.type === 'income' || tx.type === 'expense') ? tx.type : (signedAmt < 0 ? 'expense' : 'income'),
        notes: tx.notes || '',
      };
    });
  };

  // Recalculate transaction totals per category to sync budget.spent automatically!
  useEffect(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    setBudgets(prevBudgets => {
      return prevBudgets.map(b => {
        const targetMonth = (b.period && b.period.length === 7) ? b.period : currentMonthKey;
        // Find transactions in this category for this month (expenses)
        const totalSpentUSD = transactions
          .filter(t =>
            t.date?.startsWith(targetMonth) &&
            t.category.toLowerCase().trim() === b.category.toLowerCase().trim() &&
            (t.type === 'expense' || t.amount < 0)
          )
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          ...b,
          spent: Math.round(totalSpentUSD * 100) / 100,
        };
      });
    });
  }, [transactions]);

  // Convert & format utility helper
  const convertAndFormat = (amount: number, overrideCurrency?: CurrencyType) => {
    const cur = overrideCurrency || currency;
    const rate = EXCHANGE_RATES[cur];
    const converted = amount * rate;

    if (cur === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted);
    } else if (cur === "EUR") {
      return new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    }
  };

  const convertRaw = (amount: number) => {
    return amount * EXCHANGE_RATES[currency];
  };

  const refreshFinancialData = async () => {
    try {
      const [accs, txs, buds, gls, bls] = await Promise.all([
        accountsApi.getAll(),
        transactionsApi.getAll(),
        budgetsApi.getAll(),
        goalsApi.getAll(),
        billsApi.getAll(),
      ]);
      setAccounts(accs);
      setTransactions(normalizeTransactions(txs, accs));
      setBudgets(buds);
      setGoals(gls);
      setBills(bls);
    } catch (e) {
      console.error('Failed to refresh financial data', e);
    }
  };

  const addAccount = async (acc: Omit<Account, "id">) => {
    try {
      const created = await accountsApi.create(acc);
      await refreshFinancialData();
      return created;
    } catch (e) {
      console.error('Failed to create account', e);
      throw e;
    }
  };

  const updateAccount = async (id: string, data: Partial<Omit<Account, "id">>) => {
    try {
      const updated = await accountsApi.update(id, data);
      await refreshFinancialData();
      return updated;
    } catch (e) {
      console.error('Failed to update account', e);
      throw e;
    }
  };

  const removeAccount = async (id: string) => {
    try {
      await accountsApi.delete(id);
      await refreshFinancialData();
      return true;
    } catch (e) {
      console.error('Failed to delete account', e);
      throw e;
    }
  };

  const addTransaction = async (txData: {
    merchant?: string;
    title?: string;
    amount: number;
    type?: 'income' | 'expense';
    category: string;
    account?: string;
    accountId?: string;
    date?: string;
    icon?: string;
    notes?: string;
  }) => {
    try {
      const rawAmt = Math.abs(txData.amount);
      const resolvedType = txData.type || (txData.amount < 0 ? 'expense' : 'income');
      let resolvedAccId = txData.accountId;
      if (!resolvedAccId && txData.account) {
        const match = accounts.find(a => a.name.toLowerCase() === txData.account?.toLowerCase() || a.id === txData.account);
        if (match) resolvedAccId = match.id;
      }

      const created = await transactionsApi.create({
        title: txData.title || txData.merchant || 'Transaction',
        merchant: txData.merchant || txData.title || 'Transaction',
        amount: rawAmt,
        type: resolvedType,
        category: txData.category,
        date: txData.date || new Date().toISOString().split('T')[0],
        icon: txData.icon,
        notes: txData.notes,
        accountId: resolvedAccId,
      });

      await refreshFinancialData();
      return created;
    } catch (e) {
      console.error('Failed to add transaction', e);
      throw e;
    }
  };

  const updateTransaction = async (id: string, data: Partial<{
    merchant?: string;
    title?: string;
    amount?: number;
    type?: 'income' | 'expense';
    category?: string;
    account?: string;
    accountId?: string;
    date?: string;
    icon?: string;
    notes?: string;
  }>) => {
    try {
      let resolvedAccId = data.accountId;
      if (resolvedAccId === undefined && data.account) {
        const match = accounts.find(a => a.name.toLowerCase() === data.account?.toLowerCase() || a.id === data.account);
        if (match) resolvedAccId = match.id;
      }

      const rawAmt = data.amount !== undefined ? Math.abs(data.amount) : undefined;
      const resolvedType = data.type !== undefined ? data.type : (data.amount !== undefined ? (data.amount < 0 ? 'expense' : 'income') : undefined);

      const updated = await transactionsApi.update(id, {
        title: data.title || data.merchant,
        merchant: data.merchant || data.title,
        amount: rawAmt,
        type: resolvedType,
        category: data.category,
        date: data.date,
        icon: data.icon,
        notes: data.notes,
        accountId: resolvedAccId,
      });

      await refreshFinancialData();
      return updated;
    } catch (e) {
      console.error('Failed to update transaction', e);
      throw e;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      await refreshFinancialData();
      return true;
    } catch (e) {
      console.error('Failed to delete transaction', e);
      throw e;
    }
  };

  // Goals API integration
  const addGoal = async (g: {
    name: string;
    target: number;
    current?: number;
    deadline?: string;
    category?: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    try {
      const created = await goalsApi.create({
        ...g,
        current: g.current ?? 0,
      });
      await refreshFinancialData();
      return created;
    } catch (e) {
      console.error('Failed to create goal', e);
      throw e;
    }
  };

  const updateGoal = async (
    id: string,
    data: Partial<{
      name?: string;
      target?: number;
      current?: number;
      deadline?: string;
      category?: string;
      description?: string;
      icon?: string;
      color?: string;
    }>
  ) => {
    try {
      const updated = await goalsApi.update(id, data);
      await refreshFinancialData();
      return updated;
    } catch (e) {
      console.error('Failed to update goal', e);
      throw e;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await goalsApi.delete(id);
      await refreshFinancialData();
      return true;
    } catch (e) {
      console.error('Failed to delete goal', e);
      throw e;
    }
  };

  const contributeGoal = async (id: string, amount: number, type: 'deposit' | 'withdrawal' = 'deposit', accountId?: string) => {
    try {
      const res = await goalsApi.contribute(id, amount, type, accountId);
      await refreshFinancialData();
      return res;
    } catch (e) {
      console.error('Failed to contribute to goal', e);
      throw e;
    }
  };

  const addBudget = async (b: { category: string; budgeted: number; color?: string; icon?: string; period?: string }) => {
    try {
      const created = await budgetsApi.create(b);
      await refreshFinancialData();
      return created;
    } catch (e) {
      console.error('Failed to create budget', e);
      throw e;
    }
  };

  const updateBudget = async (id: string, data: Partial<{ category?: string; budgeted?: number; color?: string; icon?: string; period?: string }>) => {
    try {
      const updated = await budgetsApi.update(id, data);
      await refreshFinancialData();
      return updated;
    } catch (e) {
      console.error('Failed to update budget', e);
      throw e;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await budgetsApi.delete(id);
      await refreshFinancialData();
      return true;
    } catch (e) {
      console.error('Failed to delete budget', e);
      throw e;
    }
  };

  // Bills API integration
  const addBill = async (b: {
    name: string;
    amount: number;
    dueDay?: number;
    dueDate?: string;
    category?: string;
    frequency?: string;
    autopay?: boolean;
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    try {
      const created = await billsApi.create({
        name: b.name,
        amount: b.amount,
        dueDay: b.dueDay,
        dueDate: b.dueDate,
        category: b.category || 'Utilities',
        frequency: b.frequency || 'monthly',
        autopay: b.autopay ?? false,
        description: b.description,
        icon: b.icon,
        color: b.color,
      });
      await refreshFinancialData();
      return created;
    } catch (e) {
      console.error('Failed to create bill', e);
      throw e;
    }
  };

  const updateBill = async (
    id: string,
    data: Partial<{
      name?: string;
      amount?: number;
      dueDay?: number;
      dueDate?: string;
      category?: string;
      frequency?: string;
      status?: string;
      autopay?: boolean;
      paidDate?: string;
      description?: string;
      icon?: string;
      color?: string;
    }>
  ) => {
    try {
      const updated = await billsApi.update(id, data);
      await refreshFinancialData();
      return updated;
    } catch (e) {
      console.error('Failed to update bill', e);
      throw e;
    }
  };

  const deleteBill = async (id: string) => {
    try {
      await billsApi.delete(id);
      await refreshFinancialData();
      return true;
    } catch (e) {
      console.error('Failed to delete bill', e);
      throw e;
    }
  };

  const payBill = async (id: string, accountId?: string) => {
    try {
      const result = await billsApi.pay(id, accountId);
      await refreshFinancialData();
      return result;
    } catch (e) {
      console.error('Failed to pay bill', e);
      throw e;
    }
  };

  const addNotification = (n: any) => {
    setNotifications(prev => [n, ...prev]);
  };

  const markNotifAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifs = () => {
    setNotifications([]);
  };

  // Load initial user session if token exists
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const userData = await authApi.me();
        setUser(userData);
      } catch (e) {
        console.error('Failed to load initial session', e);
        clearToken();
        setUser(null);
      }
    };
    init();
  }, []);

  // Sync accounts, transactions, budgets, goals, and bills when user is active
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setBills([]);
      return;
    }
    refreshFinancialData();
  }, [user?.id, user?.email]);

  const logout = () => {
    clearToken();
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setBills([]);
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        user,
        setUser,
        accounts,
        addAccount,
        updateAccount,
        removeAccount,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeGoal,
        bills,
        addBill,
        updateBill,
        deleteBill,
        payBill,
        notifications,
        addNotification,
        markNotifAsRead,
        clearAllNotifs,
        convertAndFormat,
        convertRaw,
        logout,
        refreshFinancialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
