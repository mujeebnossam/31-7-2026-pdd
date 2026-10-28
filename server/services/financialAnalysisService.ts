import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { Goal } from '../models/Goal';
import { Bill } from '../models/Bill';

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  icon?: string;
  color?: string;
}

export interface BudgetUtilization {
  id: string;
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  color?: string;
  icon?: string;
}

export interface GoalStatus {
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
}

export interface BillSummary {
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
}

export interface AnomalyItem {
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
}

export interface MonthTrend {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export interface FinancialSummary {
  userId: string;
  netWorth: number;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
  }[];

  // Current Month ($M_0$)
  currentMonth: {
    key: string;
    label: string;
    income: number;
    expenses: number;
    net: number;
    savingsRate: number; // percentage 0-100
    dailyAverage: number;
  };

  // Previous Month ($M_{-1}$)
  previousMonth: {
    key: string;
    label: string;
    income: number;
    expenses: number;
    net: number;
  };

  // Month-over-Month Comparisons
  momChange: {
    expenseDelta: number;
    expensePercent: number;
    incomeDelta: number;
    incomePercent: number;
    netDelta: number;
    netPercent: number;
  };

  // 6-Month Trend History
  trendHistory: MonthTrend[];

  // Spending Breakdown & Analytics
  categorySpending: CategorySpending[];
  topCategories: CategorySpending[];
  averageMonthlyExpense: number;
  totalTransactionsCount: number;

  // Budgets
  budgets: BudgetUtilization[];
  totalBudgeted: number;
  totalBudgetSpent: number;
  overBudgetCategories: string[];

  // Goals
  goals: GoalStatus[];
  totalGoalTarget: number;
  totalGoalCurrent: number;
  totalMonthlyGoalRequired: number;

  // Bills & Subscriptions
  bills: BillSummary[];
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

  // Transactions & Anomalies
  largeTransactions: {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
  }[];
  anomalies: AnomalyItem[];

  // Financial Health Score
  financialHealth: {
    score: number; // 300 - 850
    grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
    composite0to100: number;
    savingsRateScore: number;
    cushionScore: number;
    spendRatioScore: number;
    stabilityScore: number;
    recommendation: string;
  };
}

export class FinancialAnalysisService {
  public static async getFinancialSummary(userId: string): Promise<FinancialSummary> {
    const [accounts, transactions, budgets, goals, bills] = await Promise.all([
      Account.findAll({ where: { userId }, order: [['balance', 'DESC']] }),
      Transaction.findAll({ where: { userId }, order: [['date', 'DESC'], ['createdAt', 'DESC']] }),
      Budget.findAll({ where: { userId }, order: [['budgeted', 'DESC']] }),
      Goal.findAll({ where: { userId }, order: [['target', 'DESC']] }),
      Bill.findAll({ where: { userId }, order: [['dueDate', 'ASC'], ['createdAt', 'ASC']] }),
    ]);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDayOfMonth = Math.max(1, now.getDate());

    const formatMonthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`;
    const formatMonthLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const currentMonthKey = formatMonthKey(currentYear, currentMonth);
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthKey = formatMonthKey(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

    // ─── 1. Accounts & Net Worth ──────────────────────────────────────────────
    const accountsData = accounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: Number(a.balance) || 0,
      currency: 'USD',
    }));

    const netWorth = accountsData.reduce((sum, a) => sum + a.balance, 0);

    // ─── 2. Transaction Inflow / Outflow Filtering ───────────────────────────
    const parseTxAmount = (t: Transaction): number => Math.abs(Number(t.amount) || 0);
    const isTxExpense = (t: Transaction): boolean => t.type === 'expense' || Number(t.amount) < 0;
    const isTxIncome = (t: Transaction): boolean => t.type === 'income' || (Number(t.amount) > 0 && t.type !== 'expense');

    // Current month transactions
    const currentMonthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonthKey));
    const currentMonthIncome = currentMonthTxs
      .filter(isTxIncome)
      .reduce((sum, t) => sum + parseTxAmount(t), 0);
    const currentMonthExpenses = currentMonthTxs
      .filter(isTxExpense)
      .reduce((sum, t) => sum + parseTxAmount(t), 0);
    const currentMonthNet = currentMonthIncome - currentMonthExpenses;

    const currentMonthSavingsRate = currentMonthIncome > 0
      ? Math.max(0, Math.round(((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100))
      : 0;

    const currentMonthDailyAverage = Math.round((currentMonthExpenses / currentDayOfMonth) * 100) / 100;

    // Previous month transactions
    const prevMonthTxs = transactions.filter(t => t.date && t.date.startsWith(prevMonthKey));
    const prevMonthIncome = prevMonthTxs
      .filter(isTxIncome)
      .reduce((sum, t) => sum + parseTxAmount(t), 0);
    const prevMonthExpenses = prevMonthTxs
      .filter(isTxExpense)
      .reduce((sum, t) => sum + parseTxAmount(t), 0);
    const prevMonthNet = prevMonthIncome - prevMonthExpenses;

    // Month-over-Month Comparisons
    const expenseDelta = currentMonthExpenses - prevMonthExpenses;
    const expensePercent = prevMonthExpenses > 0
      ? Math.round(((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100)
      : currentMonthExpenses > 0 ? 100 : 0;

    const incomeDelta = currentMonthIncome - prevMonthIncome;
    const incomePercent = prevMonthIncome > 0
      ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100)
      : currentMonthIncome > 0 ? 100 : 0;

    const netDelta = currentMonthNet - prevMonthNet;
    const netPercent = prevMonthNet !== 0
      ? Math.round(((currentMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100)
      : currentMonthNet > 0 ? 100 : currentMonthNet < 0 ? -100 : 0;

    // ─── 3. Dynamic 6-Month Trend ─────────────────────────────────────────────
    const trendHistory: MonthTrend[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const mKey = formatMonthKey(d.getFullYear(), d.getMonth());
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });

      const mTxs = transactions.filter(t => t.date && t.date.startsWith(mKey));
      const mIncome = mTxs.filter(isTxIncome).reduce((sum, t) => sum + parseTxAmount(t), 0);
      const mExpenses = mTxs.filter(isTxExpense).reduce((sum, t) => sum + parseTxAmount(t), 0);

      trendHistory.push({
        monthKey: mKey,
        label: mLabel,
        income: Math.round(mIncome * 100) / 100,
        expenses: Math.round(mExpenses * 100) / 100,
        net: Math.round((mIncome - mExpenses) * 100) / 100,
      });
    }

    const activeMonths = trendHistory.filter(m => m.income > 0 || m.expenses > 0);
    const averageMonthlyExpense = activeMonths.length > 0
      ? Math.round((activeMonths.reduce((sum, m) => sum + m.expenses, 0) / activeMonths.length) * 100) / 100
      : currentMonthExpenses;

    // ─── 4. Category Spending Breakdown (Current Month & Overall) ─────────────
    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    const categoryHistorical: Record<string, { total: number; count: number; amounts: number[] }> = {};

    transactions.forEach(t => {
      if (isTxExpense(t)) {
        const cat = t.category || 'Other';
        const amt = parseTxAmount(t);

        if (!categoryHistorical[cat]) {
          categoryHistorical[cat] = { total: 0, count: 0, amounts: [] };
        }
        categoryHistorical[cat].total += amt;
        categoryHistorical[cat].count += 1;
        categoryHistorical[cat].amounts.push(amt);

        if (t.date && t.date.startsWith(currentMonthKey)) {
          if (!categoryTotals[cat]) {
            categoryTotals[cat] = { amount: 0, count: 0 };
          }
          categoryTotals[cat].amount += amt;
          categoryTotals[cat].count += 1;
        }
      }
    });

    // If current month has no transactions yet, fallback to all-time category distribution
    const sourceCategoryTotals = Object.keys(categoryTotals).length > 0
      ? categoryTotals
      : Object.fromEntries(
          Object.entries(categoryHistorical).map(([k, v]) => [k, { amount: v.total, count: v.count }])
        );

    const totalExpenseBasis = Object.values(sourceCategoryTotals).reduce((sum, v) => sum + v.amount, 0);

    const categorySpending: CategorySpending[] = Object.entries(sourceCategoryTotals)
      .map(([cat, data]) => ({
        category: cat,
        amount: Math.round(data.amount * 100) / 100,
        percentage: totalExpenseBasis > 0 ? Math.round((data.amount / totalExpenseBasis) * 100) : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategories = categorySpending.slice(0, 5);

    // ─── 5. Budgets Utilization ───────────────────────────────────────────────
    const overBudgetCategories: string[] = [];
    let totalBudgeted = 0;
    let totalBudgetSpent = 0;

    const budgetsData: BudgetUtilization[] = budgets.map(b => {
      const budgeted = Number(b.budgeted) || 0;
      totalBudgeted += budgeted;

      // Real spending for this category in current month
      const spent = transactions
        .filter(t =>
          t.date &&
          t.date.startsWith(currentMonthKey) &&
          t.category.toLowerCase().trim() === b.category.toLowerCase().trim() &&
          isTxExpense(t)
        )
        .reduce((sum, t) => sum + parseTxAmount(t), 0);

      totalBudgetSpent += spent;
      const remaining = Math.max(0, budgeted - spent);
      const percentUsed = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
      const isOverBudget = spent > budgeted;

      if (isOverBudget) {
        overBudgetCategories.push(b.category);
      }

      return {
        id: b.id,
        category: b.category,
        budgeted: Math.round(budgeted * 100) / 100,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentUsed,
        isOverBudget,
        color: b.color,
        icon: b.icon,
      };
    });

    // ─── 6. Goals Status ──────────────────────────────────────────────────────
    let totalGoalTarget = 0;
    let totalGoalCurrent = 0;
    let totalMonthlyGoalRequired = 0;

    const goalsData: GoalStatus[] = goals.map(g => {
      const target = Number(g.target) || 0;
      const current = Number(g.current) || 0;
      const remaining = Math.max(0, target - current);
      const progressPercent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      const isCompleted = current >= target;

      totalGoalTarget += target;
      totalGoalCurrent += current;

      let requiredMonthlyContribution = 0;
      if (!isCompleted && g.deadline) {
        const parts = g.deadline.split('-');
        let targetYear = currentYear;
        let targetMonth = currentMonth;
        if (parts.length >= 2) {
          targetYear = parseInt(parts[0], 10) || currentYear;
          targetMonth = (parseInt(parts[1], 10) - 1);
        }
        const monthsRemaining = Math.max(
          1,
          (targetYear - currentYear) * 12 + (targetMonth - currentMonth)
        );
        requiredMonthlyContribution = Math.round((remaining / monthsRemaining) * 100) / 100;
        totalMonthlyGoalRequired += requiredMonthlyContribution;
      }

      return {
        id: g.id,
        name: g.name,
        target,
        current,
        remaining,
        progressPercent,
        deadline: g.deadline,
        requiredMonthlyContribution,
        isCompleted,
        category: g.category,
      };
    });

    // ─── 7. Bills & Subscriptions Summary ─────────────────────────────────────
    const today = new Date(currentYear, currentMonth, currentDayOfMonth);
    let upcomingBillsCount = 0;
    let upcomingBillsTotal = 0;
    let overdueBillsCount = 0;
    let overdueBillsTotal = 0;
    let dueSoonBillsCount = 0;
    let monthlyRecurringOutflow = 0;

    const subscriptions: {
      id: string;
      name: string;
      amount: number;
      frequency: string;
      monthlyEquivalent: number;
      annualCost: number;
    }[] = [];

    const billsData: BillSummary[] = bills.map(b => {
      const amount = Number(b.amount) || 0;
      const freq = (b.frequency || 'monthly').toLowerCase();

      let monthlyEquivalent = amount;
      let annualCost = amount * 12;

      if (freq === 'weekly') {
        monthlyEquivalent = amount * 4.33;
        annualCost = amount * 52;
      } else if (freq === 'quarterly') {
        monthlyEquivalent = amount / 3;
        annualCost = amount * 4;
      } else if (freq === 'yearly') {
        monthlyEquivalent = amount / 12;
        annualCost = amount;
      }

      monthlyRecurringOutflow += monthlyEquivalent;

      let targetDate: Date;
      if (b.dueDate) {
        targetDate = new Date(b.dueDate);
        if (isNaN(targetDate.getTime())) {
          targetDate = new Date(currentYear, currentMonth, b.dueDay || 1);
        }
      } else if (b.dueDay) {
        targetDate = new Date(currentYear, currentMonth, b.dueDay);
      } else {
        targetDate = new Date(currentYear, currentMonth, 1);
      }
      targetDate.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isPaid = b.status === 'paid';
      const isOverdue = !isPaid && diffDays < 0;
      const isDueSoon = !isPaid && diffDays >= 0 && diffDays <= 3;
      const isUpcoming = !isPaid && diffDays >= 0;

      if (isOverdue) {
        overdueBillsCount++;
        overdueBillsTotal += amount;
      } else if (isUpcoming) {
        upcomingBillsCount++;
        upcomingBillsTotal += amount;
        if (isDueSoon) dueSoonBillsCount++;
      }

      const isSub =
        b.category.toLowerCase().includes('sub') ||
        b.category.toLowerCase().includes('entertain') ||
        b.name.toLowerCase().includes('sub') ||
        b.name.toLowerCase().includes('netflix') ||
        b.name.toLowerCase().includes('spotify') ||
        b.name.toLowerCase().includes('prime') ||
        b.name.toLowerCase().includes('disney') ||
        b.name.toLowerCase().includes('youtube');

      if (isSub) {
        subscriptions.push({
          id: b.id,
          name: b.name,
          amount,
          frequency: freq,
          monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
          annualCost: Math.round(annualCost * 100) / 100,
        });
      }

      return {
        id: b.id,
        name: b.name,
        amount,
        dueDate: targetDate.toISOString().split('T')[0],
        dueDay: b.dueDay,
        category: b.category,
        frequency: freq,
        status: b.status,
        autopay: Boolean(b.autopay),
        isOverdue,
        isDueSoon,
        isPaid,
        monthlyEquivalent: Math.round(monthlyEquivalent * 100) / 100,
      };
    });

    const totalSubscriptionAnnualCost = subscriptions.reduce((sum, s) => sum + s.annualCost, 0);

    // ─── 8. Large Transactions & Anomaly Detection ───────────────────────────
    const expenseTxs = transactions.filter(isTxExpense);
    const avgTxAmount = expenseTxs.length > 0
      ? expenseTxs.reduce((sum, t) => sum + parseTxAmount(t), 0) / expenseTxs.length
      : 0;

    const largeTransactions = expenseTxs
      .filter(t => parseTxAmount(t) >= Math.max(200, avgTxAmount * 2.5))
      .slice(0, 10)
      .map(t => ({
        id: t.id,
        title: t.title || t.merchant || 'Expense',
        amount: parseTxAmount(t),
        category: t.category,
        date: t.date || '',
      }));

    const anomalies: AnomalyItem[] = [];
    expenseTxs.forEach(t => {
      const cat = t.category || 'Other';
      const hist = categoryHistorical[cat];
      const amt = parseTxAmount(t);

      if (hist && hist.count >= 2) {
        const otherTotal = hist.total - amt;
        const otherCount = hist.count - 1;
        const baselineAvg = otherCount > 0 ? otherTotal / otherCount : hist.total / hist.count;

        if (baselineAvg > 0 && amt >= Math.max(100, baselineAvg * 2.0)) {
          const multiplier = Math.round((amt / baselineAvg) * 10) / 10;
          anomalies.push({
            transactionId: t.id,
            title: t.title || t.merchant || 'Expense',
            merchant: t.merchant || t.title || 'Merchant',
            amount: amt,
            category: cat,
            date: t.date || '',
            typicalAverage: Math.round(baselineAvg * 100) / 100,
            multiplier,
            severity: multiplier >= 4 ? 'high' : multiplier >= 2.5 ? 'medium' : 'low',
            reason: `${multiplier}x higher than your usual ${cat} average (${baselineAvg.toFixed(2)})`,
          });
        }
      }
    });

    // ─── 9. Financial Health Score (300 to 850) ───────────────────────────────
    // Pillar 1: Savings Rate (30%)
    let savingsRateScore = 50;
    if (currentMonthIncome > 0) {
      if (currentMonthSavingsRate >= 30) savingsRateScore = 100;
      else if (currentMonthSavingsRate >= 20) savingsRateScore = 85;
      else if (currentMonthSavingsRate >= 10) savingsRateScore = 70;
      else if (currentMonthSavingsRate > 0) savingsRateScore = 50;
      else savingsRateScore = 25;
    }

    // Pillar 2: Cushion / Liquidity Buffer (25%)
    let cushionScore = 50;
    if (currentMonthExpenses > 0) {
      const monthsOfBuffer = netWorth / currentMonthExpenses;
      if (monthsOfBuffer >= 6) cushionScore = 100;
      else if (monthsOfBuffer >= 3) cushionScore = 85;
      else if (monthsOfBuffer >= 1) cushionScore = 65;
      else if (monthsOfBuffer > 0) cushionScore = 40;
      else cushionScore = 15;
    } else if (netWorth > 0) {
      cushionScore = 90;
    }

    // Pillar 3: Spend Ratio (25%)
    let spendRatioScore = 50;
    if (currentMonthIncome > 0) {
      const spendRatio = currentMonthExpenses / currentMonthIncome;
      if (spendRatio <= 0.5) spendRatioScore = 100;
      else if (spendRatio <= 0.7) spendRatioScore = 85;
      else if (spendRatio <= 0.9) spendRatioScore = 65;
      else if (spendRatio <= 1.0) spendRatioScore = 45;
      else spendRatioScore = 20;
    }

    // Pillar 4: Cashflow Stability over 6 months (20%)
    let stabilityScore = 60;
    if (activeMonths.length > 0) {
      const positiveMonths = activeMonths.filter(m => m.income >= m.expenses).length;
      const positiveRatio = positiveMonths / activeMonths.length;
      if (positiveRatio >= 0.8) stabilityScore = 95;
      else if (positiveRatio >= 0.5) stabilityScore = 75;
      else stabilityScore = 45;
    }

    const composite0to100 = Math.round(
      0.30 * savingsRateScore +
      0.25 * cushionScore +
      0.25 * spendRatioScore +
      0.20 * stabilityScore
    );

    const score = Math.round(300 + (composite0to100 / 100) * 550);
    const grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' =
      score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 550 ? 'Fair' : 'Needs Attention';

    let recommendation = 'Maintain consistent income logging and keep discretionary spending within budgeted targets.';
    if (overBudgetCategories.length > 0) {
      recommendation = `Review spending in ${overBudgetCategories.join(', ')} to bring outflows back within target limits.`;
    } else if (currentMonthSavingsRate >= 20) {
      recommendation = `Strong savings rate of ${currentMonthSavingsRate}%. Consider allocating surplus towards your active financial goals.`;
    } else if (currentMonthNet < 0) {
      recommendation = `Current monthly expenses exceed income by ${Math.abs(currentMonthNet).toFixed(2)}. Review large transactions and trim non-essential outflows.`;
    }

    return {
      userId,
      netWorth: Math.round(netWorth * 100) / 100,
      accounts: accountsData,
      currentMonth: {
        key: currentMonthKey,
        label: formatMonthLabel(now),
        income: Math.round(currentMonthIncome * 100) / 100,
        expenses: Math.round(currentMonthExpenses * 100) / 100,
        net: Math.round(currentMonthNet * 100) / 100,
        savingsRate: currentMonthSavingsRate,
        dailyAverage: currentMonthDailyAverage,
      },
      previousMonth: {
        key: prevMonthKey,
        label: formatMonthLabel(prevMonthDate),
        income: Math.round(prevMonthIncome * 100) / 100,
        expenses: Math.round(prevMonthExpenses * 100) / 100,
        net: Math.round(prevMonthNet * 100) / 100,
      },
      momChange: {
        expenseDelta: Math.round(expenseDelta * 100) / 100,
        expensePercent,
        incomeDelta: Math.round(incomeDelta * 100) / 100,
        incomePercent,
        netDelta: Math.round(netDelta * 100) / 100,
        netPercent,
      },
      trendHistory,
      categorySpending,
      topCategories,
      averageMonthlyExpense,
      totalTransactionsCount: transactions.length,
      budgets: budgetsData,
      totalBudgeted: Math.round(totalBudgeted * 100) / 100,
      totalBudgetSpent: Math.round(totalBudgetSpent * 100) / 100,
      overBudgetCategories,
      goals: goalsData,
      totalGoalTarget: Math.round(totalGoalTarget * 100) / 100,
      totalGoalCurrent: Math.round(totalGoalCurrent * 100) / 100,
      totalMonthlyGoalRequired: Math.round(totalMonthlyGoalRequired * 100) / 100,
      bills: billsData,
      upcomingBillsCount,
      upcomingBillsTotal: Math.round(upcomingBillsTotal * 100) / 100,
      overdueBillsCount,
      overdueBillsTotal: Math.round(overdueBillsTotal * 100) / 100,
      dueSoonBillsCount,
      monthlyRecurringOutflow: Math.round(monthlyRecurringOutflow * 100) / 100,
      subscriptions,
      totalSubscriptionAnnualCost: Math.round(totalSubscriptionAnnualCost * 100) / 100,
      largeTransactions,
      anomalies,
      financialHealth: {
        score,
        grade,
        composite0to100,
        savingsRateScore,
        cushionScore,
        spendRatioScore,
        stabilityScore,
        recommendation,
      },
    };
  }
}
