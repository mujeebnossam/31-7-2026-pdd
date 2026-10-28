import { FinancialSummary } from './financialAnalysisService';
import { FinancialPredictions } from './predictionService';

export interface AIInsight {
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

export class AIInsightEngine {
  public static generateFinancialInsights(
    summary: FinancialSummary,
    predictions: FinancialPredictions
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    let idCounter = 1;
    const nextId = (prefix: string) => `ins_${prefix}_${idCounter++}`;

    // ─── 1. Bill Reminders (High Priority) ──────────────────────────────────
    if (summary.overdueBillsCount > 0) {
      insights.push({
        id: nextId('bill_overdue'),
        type: 'bill',
        title: `${summary.overdueBillsCount} Overdue Bill${summary.overdueBillsCount > 1 ? 's' : ''} Detected`,
        description: `You have ${summary.overdueBillsCount} bill(s) past due totaling ${summary.overdueBillsTotal.toFixed(2)}. Late fees may apply.`,
        severity: 'danger',
        category: 'Bills & Obligations',
        supportingMetric: `Total overdue: ${summary.overdueBillsTotal.toFixed(2)}`,
        action: 'Review and settle overdue bills in the Bills & Subscriptions tab immediately.',
        impact: summary.overdueBillsTotal,
        icon: '🚨',
      });
    }

    if (summary.dueSoonBillsCount > 0 && summary.overdueBillsCount === 0) {
      insights.push({
        id: nextId('bill_duesoon'),
        type: 'bill',
        title: `${summary.dueSoonBillsCount} Bill${summary.dueSoonBillsCount > 1 ? 's' : ''} Due in Next 3 Days`,
        description: `Upcoming obligations due shortly. Ensure sufficient balance in your checking account to cover debits.`,
        severity: 'warning',
        category: 'Bills & Obligations',
        supportingMetric: `Due soon: ${summary.dueSoonBillsCount} payments`,
        action: 'Check scheduled due dates to avoid accidental overdrafts or late charges.',
        icon: '📅',
      });
    }

    // ─── 2. Cash Flow Warnings or Positive Highlights ───────────────────────
    if (summary.currentMonth.net < 0 && summary.currentMonth.income > 0) {
      insights.push({
        id: nextId('cashflow_deficit'),
        type: 'cashflow',
        title: 'Monthly Cashflow Deficit',
        description: `Outflows exceed income by ${Math.abs(summary.currentMonth.net).toFixed(2)} this month (Spend ratio: ${((summary.currentMonth.expenses / summary.currentMonth.income) * 100).toFixed(0)}%).`,
        severity: 'danger',
        category: 'Cash Flow',
        supportingMetric: `Net Flow: -${Math.abs(summary.currentMonth.net).toFixed(2)}`,
        action: 'Temporarily freeze discretionary spending until the start of the next cycle.',
        impact: Math.abs(summary.currentMonth.net),
        icon: '📉',
      });
    } else if (summary.currentMonth.savingsRate >= 25 && summary.currentMonth.income > 0) {
      insights.push({
        id: nextId('cashflow_positive'),
        type: 'progress',
        title: 'Outstanding Savings Rate',
        description: `You are currently saving ${summary.currentMonth.savingsRate}% of all inflows this month, exceeding the recommended 20% benchmark.`,
        severity: 'success',
        category: 'Cash Flow',
        supportingMetric: `Savings Rate: ${summary.currentMonth.savingsRate}%`,
        action: 'Deploy retained surplus into your high-priority financial goals or emergency buffer.',
        impact: summary.currentMonth.net,
        icon: '⭐',
      });
    }

    // ─── 3. Budget Warnings ─────────────────────────────────────────────────
    summary.budgets.forEach(b => {
      if (b.isOverBudget) {
        const overAmt = b.spent - b.budgeted;
        insights.push({
          id: nextId('budget_exceeded'),
          type: 'budget',
          title: `Over Budget in ${b.category}`,
          description: `You have exceeded your ${b.category} budget by ${overAmt.toFixed(2)} (${b.percentUsed}% used).`,
          severity: 'danger',
          category: 'Budgets',
          supportingMetric: `${b.spent.toFixed(2)} / ${b.budgeted.toFixed(2)} limit`,
          action: `Avoid additional non-essential purchases in ${b.category} for the remainder of the month.`,
          impact: overAmt,
          icon: '⚠️',
        });
      } else if (b.percentUsed >= 85) {
        insights.push({
          id: nextId('budget_warning'),
          type: 'budget',
          title: `${b.category} Budget Near Limit`,
          description: `You have utilized ${b.percentUsed}% of your ${b.category} budget with ${b.remaining.toFixed(2)} remaining.`,
          severity: 'warning',
          category: 'Budgets',
          supportingMetric: `${b.remaining.toFixed(2)} remaining of ${b.budgeted.toFixed(2)}`,
          action: `Pace your remaining ${b.category} expenses to stay within your allocation.`,
          icon: '📊',
        });
      }
    });

    // ─── 4. Spending Insights & MoM Spikes ──────────────────────────────────
    if (summary.topCategories.length > 0 && summary.currentMonth.expenses > 0) {
      const topCat = summary.topCategories[0];
      insights.push({
        id: nextId('spending_topcat'),
        type: 'spending',
        title: `Primary Outflow: ${topCat.category}`,
        description: `${topCat.category} represents ${topCat.percentage}% of all your monthly expenditures (${topCat.amount.toFixed(2)} across ${topCat.transactionCount} transactions).`,
        severity: 'info',
        category: 'Spending Patterns',
        supportingMetric: `${topCat.percentage}% of total expenses`,
        action: `Trimming just 10% of ${topCat.category} can save ${(topCat.amount * 0.1).toFixed(2)} every month.`,
        impact: Math.round(topCat.amount * 0.1 * 12),
        icon: '💳',
      });
    }

    if (summary.momChange.expensePercent >= 20 && summary.previousMonth.expenses > 0) {
      insights.push({
        id: nextId('spending_spike'),
        type: 'spending',
        title: `Expenses Jumped +${summary.momChange.expensePercent}% vs Last Month`,
        description: `Total monthly outflows increased from ${summary.previousMonth.expenses.toFixed(2)} to ${summary.currentMonth.expenses.toFixed(2)} (+${summary.momChange.expenseDelta.toFixed(2)}).`,
        severity: 'warning',
        category: 'Spending Patterns',
        supportingMetric: `+${summary.momChange.expensePercent}% MoM`,
        action: 'Review recent transaction log to identify one-time versus recurring spikes.',
        impact: summary.momChange.expenseDelta,
        icon: '📈',
      });
    }

    // ─── 5. Saving Opportunities ────────────────────────────────────────────
    if (summary.categorySpending.length > 0) {
      const discretionary = summary.categorySpending.find(
        c => ['Entertainment', 'Dining', 'Food & Drink', 'Shopping', 'Lifestyle'].includes(c.category)
      );
      if (discretionary && discretionary.amount > 100) {
        const potentialMonthly = Math.round(discretionary.amount * 0.2 * 100) / 100;
        const potentialAnnual = potentialMonthly * 12;
        insights.push({
          id: nextId('saving_discretionary'),
          type: 'saving',
          title: `Optimizing ${discretionary.category} Outflows`,
          description: `Reducing ${discretionary.category} by 20% would redirect ${potentialMonthly.toFixed(2)}/month directly into savings.`,
          severity: 'info',
          category: 'Savings Opportunities',
          supportingMetric: `Potential: +${potentialAnnual.toFixed(2)}/yr`,
          action: `Set a weekly limit of ${(discretionary.amount * 0.8 / 4).toFixed(2)} on ${discretionary.category}.`,
          impact: potentialAnnual,
          icon: '💡',
        });
      }
    }

    // ─── 6. Subscription Optimization ───────────────────────────────────────
    if (summary.subscriptions.length >= 2) {
      insights.push({
        id: nextId('sub_optimization'),
        type: 'subscription',
        title: `Subscription Portfolio Audit`,
        description: `You maintain ${summary.subscriptions.length} active recurring subscriptions costing ${summary.totalSubscriptionAnnualCost.toFixed(2)} annually.`,
        severity: 'info',
        category: 'Subscriptions',
        supportingMetric: `${summary.subscriptions.length} active (${summary.totalSubscriptionAnnualCost.toFixed(2)}/yr)`,
        action: 'Audit services in the Subscription Manager tab and cancel inactive accounts.',
        impact: Math.round(summary.totalSubscriptionAnnualCost * 0.25),
        icon: '📱',
      });
    }

    // ─── 7. Unusual Spending Anomalies ───────────────────────────────────────
    if (summary.anomalies.length > 0) {
      const topAnomaly = summary.anomalies[0];
      insights.push({
        id: nextId('anomaly_detected'),
        type: 'anomaly',
        title: `Unusual Transaction Detected: ${topAnomaly.merchant}`,
        description: `A ${topAnomaly.amount.toFixed(2)} charge in ${topAnomaly.category} on ${topAnomaly.date} was ${topAnomaly.multiplier}x higher than your usual ${topAnomaly.category} average (${topAnomaly.typicalAverage.toFixed(2)}).`,
        severity: 'warning',
        category: 'Anomaly Detection',
        supportingMetric: `${topAnomaly.multiplier}x typical spend`,
        action: 'Verify this transaction in your history to confirm accuracy.',
        impact: topAnomaly.amount,
        icon: '🔍',
      });
    }

    // ─── 8. Goal Recommendations ────────────────────────────────────────────
    const activeGoals = summary.goals.filter(g => !g.isCompleted);
    if (activeGoals.length > 0) {
      const g = activeGoals[0];
      const goalPred = predictions.goalPredictions.find(gp => gp.goalId === g.id);

      if (goalPred?.status === 'on_track') {
        insights.push({
          id: nextId('goal_ontrack'),
          type: 'goal',
          title: `Goal On Track: ${g.name}`,
          description: `At your current savings pace, "${g.name}" (${g.current.toFixed(2)}/${g.target.toFixed(2)}) is projected to complete by ${goalPred.estimatedCompletionMonth}.`,
          severity: 'success',
          category: 'Financial Goals',
          supportingMetric: `${g.progressPercent}% achieved`,
          action: `Keep maintaining monthly allocations of ${g.requiredMonthlyContribution.toFixed(2)}.`,
          icon: '🎯',
        });
      } else if (goalPred?.status === 'at_risk' || goalPred?.status === 'likely_late') {
        insights.push({
          id: nextId('goal_risk'),
          type: 'goal',
          title: `Pacing Warning for Goal: ${g.name}`,
          description: `To hit your target of ${g.target.toFixed(2)} on schedule, an estimated ${g.requiredMonthlyContribution.toFixed(2)}/month is needed.`,
          severity: 'warning',
          category: 'Financial Goals',
          supportingMetric: `Needed: ${g.requiredMonthlyContribution.toFixed(2)}/mo`,
          action: goalPred.recommendation,
          icon: '🎯',
        });
      }
    }

    // ─── 9. Personalized Recommendation ─────────────────────────────────────
    insights.push({
      id: nextId('personal_recommendation'),
      type: 'recommendation',
      title: `Financial Health Advisory (${summary.financialHealth.grade})`,
      description: summary.financialHealth.recommendation,
      severity: summary.financialHealth.score >= 700 ? 'success' : summary.financialHealth.score >= 550 ? 'info' : 'warning',
      category: 'Health & Advisory',
      supportingMetric: `Health Score: ${summary.financialHealth.score}/850`,
      action: 'Track daily transactions consistently to boost automated predictive intelligence.',
      icon: '🧠',
    });

    return insights;
  }
}
