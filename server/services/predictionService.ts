import { FinancialAnalysisService, FinancialSummary } from './financialAnalysisService';

export interface CategoryPrediction {
  category: string;
  historicalAverage: number;
  predictedAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface GoalPrediction {
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
}

export interface FinancialPredictions {
  userId: string;
  disclaimer: string;
  confidence: 'low' | 'medium' | 'high';
  confidenceReason: string;

  // Monthly Overview Predictions
  nextMonth: {
    monthLabel: string;
    predictedIncome: number;
    predictedExpenses: number;
    predictedNetCashFlow: number;
    predictedSavingsRate: number;
  };

  // Trajectory & Trend
  trajectory: {
    trend: 'improving' | 'stable' | 'declining';
    reason: string;
    projected3MonthSavings: number;
    projectedYearEndNetWorth: number;
  };

  // Category Forecasts
  categoryPredictions: CategoryPrediction[];

  // Goal Projections
  goalPredictions: GoalPrediction[];

  // Recurring Obligation Burden Projections
  recurringProjections: {
    monthlyRecurringOutflow: number;
    quarterlyProjectedBills: number;
    annualProjectedBills: number;
    subscriptionAnnualDrain: number;
  };
}

export class PredictionService {
  public static async getFinancialPredictions(
    userId: string,
    existingSummary?: FinancialSummary
  ): Promise<FinancialPredictions> {
    const summary = existingSummary || (await FinancialAnalysisService.getFinancialSummary(userId));

    const activeMonths = summary.trendHistory.filter(m => m.income > 0 || m.expenses > 0);
    const monthsCount = activeMonths.length;

    let confidence: 'low' | 'medium' | 'high' = 'low';
    let confidenceReason = 'Limited transaction history (less than 2 active months). Predictions are baseline estimates.';

    if (monthsCount >= 4) {
      confidence = 'high';
      confidenceReason = `Based on ${monthsCount} months of comprehensive transaction patterns.`;
    } else if (monthsCount >= 2) {
      confidence = 'medium';
      confidenceReason = `Based on ${monthsCount} months of active financial history.`;
    }

    // ─── 1. Next Month Expense & Income Prediction ────────────────────────────
    let predictedExpenses = 0;
    let predictedIncome = 0;

    if (monthsCount >= 3) {
      const m1 = activeMonths[activeMonths.length - 1]; // most recent
      const m2 = activeMonths[activeMonths.length - 2];
      const m3 = activeMonths[activeMonths.length - 3];

      predictedExpenses = Math.round((0.5 * m1.expenses + 0.3 * m2.expenses + 0.2 * m3.expenses) * 100) / 100;
      predictedIncome = Math.round((0.5 * m1.income + 0.3 * m2.income + 0.2 * m3.income) * 100) / 100;
    } else if (monthsCount === 2) {
      const m1 = activeMonths[1];
      const m2 = activeMonths[0];

      predictedExpenses = Math.round((0.6 * m1.expenses + 0.4 * m2.expenses) * 100) / 100;
      predictedIncome = Math.round((0.6 * m1.income + 0.4 * m2.income) * 100) / 100;
    } else if (monthsCount === 1) {
      predictedExpenses = activeMonths[0].expenses;
      predictedIncome = activeMonths[0].income;
    } else {
      predictedExpenses = summary.currentMonth.expenses;
      predictedIncome = summary.currentMonth.income;
    }

    // Factor in minimum recurring bill requirements
    predictedExpenses = Math.max(predictedExpenses, summary.monthlyRecurringOutflow);

    const predictedNetCashFlow = Math.round((predictedIncome - predictedExpenses) * 100) / 100;
    const predictedSavingsRate = predictedIncome > 0
      ? Math.max(0, Math.round(((predictedIncome - predictedExpenses) / predictedIncome) * 100))
      : 0;

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextMonthLabel = nextDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // ─── 2. Category Predictions ──────────────────────────────────────────────
    const categoryPredictions: CategoryPrediction[] = summary.categorySpending.map(cat => {
      let predictedAmount = cat.amount;
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let changePercent = 0;

      // Adjust based on historical MoM momentum
      if (summary.momChange.expensePercent > 10) {
        predictedAmount = Math.round(cat.amount * 1.05 * 100) / 100;
        trend = 'increasing';
        changePercent = 5;
      } else if (summary.momChange.expensePercent < -10) {
        predictedAmount = Math.round(cat.amount * 0.95 * 100) / 100;
        trend = 'decreasing';
        changePercent = -5;
      }

      return {
        category: cat.category,
        historicalAverage: cat.amount,
        predictedAmount,
        trend,
        changePercent,
        confidence,
      };
    });

    // ─── 3. Goal Completion Predictions ───────────────────────────────────────
    const historicalAverageSurplus = Math.max(0, predictedNetCashFlow);

    const goalPredictions: GoalPrediction[] = summary.goals.map(g => {
      if (g.isCompleted) {
        return {
          goalId: g.id,
          name: g.name,
          target: g.target,
          current: g.current,
          remaining: 0,
          requiredMonthlySavings: 0,
          projectedMonthlySavings: 0,
          status: 'completed',
          estimatedCompletionMonth: 'Completed',
          monthsToComplete: 0,
          recommendation: `🎉 Goal achieved! Target of ${g.target} reached.`,
        };
      }

      const remaining = g.remaining;
      const required = g.requiredMonthlyContribution;
      const availablePace = summary.goals.length > 0 ? historicalAverageSurplus / summary.goals.length : historicalAverageSurplus;

      let status: 'on_track' | 'at_risk' | 'likely_late' = 'at_risk';
      let monthsToComplete = 999;

      if (availablePace > 0) {
        monthsToComplete = Math.ceil(remaining / availablePace);
      }

      const estDate = new Date();
      estDate.setMonth(estDate.getMonth() + Math.min(120, monthsToComplete));
      const estimatedCompletionMonth = monthsToComplete < 120
        ? estDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Indefinite';

      if (availablePace >= required && required > 0) {
        status = 'on_track';
      } else if (availablePace > 0 && availablePace < required) {
        status = 'at_risk';
      } else {
        status = 'likely_late';
      }

      let recommendation = `Maintain monthly contribution of ${required.toFixed(2)} to meet deadline.`;
      if (status === 'likely_late') {
        recommendation = `Estimated surplus (${availablePace.toFixed(2)}/mo) is insufficient. Consider trimming discretionary expenses by ${(required - availablePace).toFixed(2)}/mo.`;
      } else if (status === 'at_risk') {
        recommendation = `Current saving pace is slightly below target. Boost monthly allocation by ${(required - availablePace).toFixed(2)} to ensure on-time completion.`;
      }

      return {
        goalId: g.id,
        name: g.name,
        target: g.target,
        current: g.current,
        remaining,
        requiredMonthlySavings: required,
        projectedMonthlySavings: Math.round(availablePace * 100) / 100,
        status,
        estimatedCompletionMonth,
        monthsToComplete,
        recommendation,
      };
    });

    // ─── 4. Trajectory & Long-Term Trend ──────────────────────────────────────
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    let trendReason = 'Financial cash flow and savings rate are holding steady.';

    if (summary.currentMonth.savingsRate >= 20 && summary.momChange.netDelta >= 0) {
      trend = 'improving';
      trendReason = `Healthy savings rate (${summary.currentMonth.savingsRate}%) and expanding monthly net cash flow.`;
    } else if (summary.currentMonth.net < 0 || (summary.momChange.expensePercent > 20 && summary.momChange.incomePercent <= 0)) {
      trend = 'declining';
      trendReason = `Outflows exceed inflows or have jumped +${summary.momChange.expensePercent}% without matching income growth.`;
    }

    const projected3MonthSavings = Math.round(Math.max(0, predictedNetCashFlow * 3) * 100) / 100;
    const monthsRemainingInYear = Math.max(1, 12 - (new Date().getMonth() + 1));
    const projectedYearEndNetWorth = Math.round((summary.netWorth + predictedNetCashFlow * monthsRemainingInYear) * 100) / 100;

    return {
      userId,
      disclaimer: 'Estimates and projections are calculated from historical patterns and scheduled recurring obligations. Not a financial guarantee.',
      confidence,
      confidenceReason,
      nextMonth: {
        monthLabel: nextMonthLabel,
        predictedIncome,
        predictedExpenses,
        predictedNetCashFlow,
        predictedSavingsRate,
      },
      trajectory: {
        trend,
        reason: trendReason,
        projected3MonthSavings,
        projectedYearEndNetWorth,
      },
      categoryPredictions,
      goalPredictions,
      recurringProjections: {
        monthlyRecurringOutflow: summary.monthlyRecurringOutflow,
        quarterlyProjectedBills: Math.round(summary.monthlyRecurringOutflow * 3 * 100) / 100,
        annualProjectedBills: Math.round(summary.monthlyRecurringOutflow * 12 * 100) / 100,
        subscriptionAnnualDrain: summary.totalSubscriptionAnnualCost,
      },
    };
  }
}
