import React, { createContext, useContext, useState, useEffect } from "react";
import {
  mockUser as initialUser,
  mockAccounts as initialAccounts,
  mockTransactions as initialTransactions,
  mockBudgets as initialBudgets,
  mockSpendingByMonth as initialSpending,
  mockCategoryBreakdown as initialCategoryBreakdown,
  mockAIInsights as initialInsights,
  mockNotifications as initialNotifications,
  mockGoals as initialGoals,
  mockBills as initialBills,
  categories,
} from "../data/mockData";

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
  category: string;
  amount: number; // Base amount in USD
  account: string;
  icon: string;
  status: string;
}

export interface Budget {
  id: string;
  category: string;
  budgeted: number; // Base amount in USD
  spent: number;    // Base amount in USD
  color: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  financialScore: number;
}

interface AppContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  accounts: Account[];
  addAccount: (acc: Omit<Account, "id">) => void;
  removeAccount: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
  budgets: Budget[];
  addBudget: (b: Omit<Budget, "id" | "spent">) => void;
  updateBudget: (id: string, budgeted: number) => void;
  notifications: any[];
  addNotification: (n: any) => void;
  markNotifAsRead: (id: string) => void;
  clearAllNotifs: () => void;
  convertAndFormat: (amount: number, overrideCurrency?: CurrencyType) => string;
  convertRaw: (amount: number) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const EXCHANGE_RATES: Record<CurrencyType, number> = {
  USD: 1.0,
  INR: 83.0,
  EUR: 0.92,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>("USD");
  const [user, setUser] = useState<UserProfile>({
    name: initialUser.name,
    email: initialUser.email,
    phone: "+91 98765 43210", // Realistic initial Indian contact if they toggle
    avatar: initialUser.avatar,
    memberSince: initialUser.memberSince,
    financialScore: initialUser.financialScore,
  });

  // Inject Indian Bank accounts initially along with the mock accounts
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const defaultAccounts = [...initialAccounts];
    // Check if Indian accounts already exist. If not, append them.
    const hasIndian = defaultAccounts.some(acc => acc.bank.includes("HDFC") || acc.bank.includes("SBI"));
    if (!hasIndian) {
      return [
        ...defaultAccounts,
        {
          id: "ind1",
          name: "HDFC Savings Account",
          type: "checking",
          balance: 1813.25, // ₹1,50,500 approx at 83 INR/USD
          bank: "HDFC Bank",
          last4: "4920",
          color: "#1e3a8a",
        },
        {
          id: "ind2",
          name: "SBI Salary Account",
          type: "checking",
          balance: 544.58, // ₹45,200 approx at 83 INR/USD
          bank: "State Bank of India",
          last4: "8120",
          color: "#0284c7",
        },
        {
          id: "ind3",
          name: "ICICI Amex Credit Card",
          type: "credit",
          balance: -222.89, // -₹18,500 approx
          bank: "ICICI Bank",
          last4: "3321",
          color: "#ea580c",
        }
      ];
    }
    return defaultAccounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [notifications, setNotifications] = useState<any[]>(initialNotifications);

  // Recalculate transaction totals per category to sync budget.spent automatically!
  useEffect(() => {
    setBudgets(prevBudgets => {
      return prevBudgets.map(b => {
        // Find transactions in this category (negative amounts represent expenses)
        const totalSpentUSD = transactions
          .filter(t => t.category.toLowerCase() === b.category.toLowerCase() && t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          ...b,
          spent: Math.round(totalSpentUSD),
        };
      });
    });
  }, [transactions]);

  // Convert & format utility helper
  const convertAndFormat = (amount: number, overrideCurrency?: CurrencyType) => {
    const cur = overrideCurrency || currency;
    const rate = EXCHANGE_RATES[cur];
    const converted = amount * rate;
    const isNegative = converted < 0;
    const absConverted = Math.abs(converted);

    if (cur === "INR") {
      // Use Indian regional grouping (e.g. ₹1,50,000)
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

  const addAccount = (acc: Omit<Account, "id">) => {
    const newAcc: Account = {
      ...acc,
      id: "acc_" + Date.now(),
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addTransaction = (tx: Omit<Transaction, "id" | "date">) => {
    const newTx: Transaction = {
      ...tx,
      id: "tx_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update account balance
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.name === tx.account) {
          return {
            ...acc,
            balance: acc.balance + tx.amount,
          };
        }
        return acc;
      })
    );

    // Notify user if budget approaches limit (e.g., if spent reaches >80%)
    if (tx.amount < 0) {
      const categoryBudget = budgets.find(b => b.category.toLowerCase() === tx.category.toLowerCase());
      if (categoryBudget) {
        const nextSpent = categoryBudget.spent + Math.abs(tx.amount);
        const pctUsed = (nextSpent / categoryBudget.budgeted) * 100;
        if (pctUsed >= 100) {
          addNotification({
            id: "notif_" + Date.now(),
            type: "alert",
            message: `⚠️ Budget Exceeded for ${categoryBudget.category}! Used ${Math.round(pctUsed)}%`,
            time: "Just now",
            read: false,
          });
        } else if (pctUsed >= 85) {
          addNotification({
            id: "notif_" + Date.now(),
            type: "alert",
            message: `⚡ Budget Approaching limit for ${categoryBudget.category}. Used ${Math.round(pctUsed)}%`,
            time: "Just now",
            read: false,
          });
        }
      }
    }
  };

  const addBudget = (b: Omit<Budget, "id" | "spent">) => {
    // Generate color dynamically if not selected
    const colors = ["#10b981", "#f59e0b", "#3b82f6", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6", "#ef4444"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newB: Budget = {
      ...b,
      id: "b_" + Date.now(),
      spent: 0,
      color: b.color || randomColor,
    };
    setBudgets(prev => [...prev, newB]);
    addNotification({
      id: "notif_" + Date.now(),
      type: "insight",
      message: `🎯 New budget created for ${b.category}! Limit set to ${convertAndFormat(b.budgeted)}`,
      time: "Just now",
      read: false,
    });
  };

  const updateBudget = (id: string, budgeted: number) => {
    setBudgets(prev =>
      prev.map(b => (b.id === id ? { ...b, budgeted } : b))
    );
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

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        user,
        setUser,
        accounts,
        addAccount,
        removeAccount,
        transactions,
        addTransaction,
        budgets,
        addBudget,
        updateBudget,
        notifications,
        addNotification,
        markNotifAsRead,
        clearAllNotifs,
        convertAndFormat,
        convertRaw,
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
