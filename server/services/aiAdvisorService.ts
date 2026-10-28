import { GoogleGenAI } from '@google/genai';
import { FinancialAnalysisService, FinancialSummary } from './financialAnalysisService';
import { PredictionService, FinancialPredictions } from './predictionService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIAdvisorService {
  // Category Suggestion Helper
  public static suggestCategory(merchantName: string): { category: string; confidence: number; icon: string } {
    const name = (merchantName || '').toLowerCase().trim();

    if (!name) return { category: 'Other', confidence: 0.1, icon: '📄' };

    // Food & Dining
    if (/(swiggy|zomato|starbucks|mcdonald|subway|domino|kfc|burger|pizza|diner|cafe|coffee|restaurant|bistro|bakery|blinkit|instamart|zepto|grocery|trader joe|whole foods|supermarket)/.test(name)) {
      return { category: 'Food & Drink', confidence: 0.95, icon: '🍔' };
    }

    // Transportation
    if (/(uber|lyft|ola|gas|petrol|diesel|fuel|shell|chevron|bp|exxon|mobil|subway|metro|transit|bus|train|parking|toll|tollway)/.test(name)) {
      return { category: 'Transportation', confidence: 0.95, icon: '🚗' };
    }

    // Subscriptions & Entertainment
    if (/(netflix|spotify|prime|disney|hulu|apple tv|youtube|hbo|paramount|audible|gym|fitness|cinema|theater|game|steam|playstation|xbox)/.test(name)) {
      return { category: 'Subscriptions', confidence: 0.95, icon: '📱' };
    }

    // Utilities & Power
    if (/(electric|power|water|utility|internet|wifi|broadband|airtel|jio|verizon|at&t|t-mobile|comcast|spectrum)/.test(name)) {
      return { category: 'Utilities', confidence: 0.92, icon: '⚡' };
    }

    // Housing & Rent
    if (/(rent|mortgage|landlord|housing|apartment|condo|hoa|property)/.test(name)) {
      return { category: 'Housing', confidence: 0.95, icon: '🏠' };
    }

    // Shopping & Retail
    if (/(amazon|flipkart|walmart|target|best buy|ebay|aliexpress|zara|h&m|nike|adidas|store|clothing|mall)/.test(name)) {
      return { category: 'Shopping', confidence: 0.90, icon: '🛍️' };
    }

    // Health & Medical
    if (/(pharmacy|cvs|walgreens|doctor|hospital|clinic|dental|optometry|medical|medicine|health)/.test(name)) {
      return { category: 'Health', confidence: 0.92, icon: '🏥' };
    }

    // Insurance
    if (/(insurance|geico|state farm|progressive|allstate|metlife|prudential|aetna)/.test(name)) {
      return { category: 'Insurance', confidence: 0.95, icon: '🛡️' };
    }

    // Income & Salary
    if (/(salary|payroll|deposit|dividend|interest|freelance|consulting|stripe|paypal|client)/.test(name)) {
      return { category: 'Income', confidence: 0.90, icon: '💰' };
    }

    return { category: 'Other', confidence: 0.3, icon: '📄' };
  }

  // Generate complete advisor response with real financial context
  public static async generateAdvisorResponse(
    userId: string,
    prompt: string,
    history: ChatMessage[] = []
  ): Promise<string> {
    const summary = await FinancialAnalysisService.getFinancialSummary(userId);
    const predictions = await PredictionService.getFinancialPredictions(userId, summary);

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

    // Structured Financial Data Context
    const contextPrompt = `
=== AUTHENTICATED USER FINANCIAL DATA (REAL POSTGRESQL LEDGER) ===
User ID: ${userId}
Total Net Worth: ${summary.netWorth.toFixed(2)}
Connected Accounts (${summary.accounts.length}):
${summary.accounts.map(a => `- ${a.name} (${a.type}): ${a.balance.toFixed(2)} ${a.currency}`).join('\n') || 'None'}

Current Month (${summary.currentMonth.label}):
- Inflows (Income): ${summary.currentMonth.income.toFixed(2)}
- Outflows (Expenses): ${summary.currentMonth.expenses.toFixed(2)}
- Net Cash Flow: ${summary.currentMonth.net.toFixed(2)}
- Savings Rate: ${summary.currentMonth.savingsRate}%
- Daily Average Expense: ${summary.currentMonth.dailyAverage.toFixed(2)}/day

Previous Month (${summary.previousMonth.label}):
- Inflows: ${summary.previousMonth.income.toFixed(2)}
- Outflows: ${summary.previousMonth.expenses.toFixed(2)}
- Net: ${summary.previousMonth.net.toFixed(2)}
- MoM Outflow Change: ${summary.momChange.expensePercent >= 0 ? '+' : ''}${summary.momChange.expensePercent}% (${summary.momChange.expenseDelta.toFixed(2)})

Top Spending Categories (Current Month):
${summary.topCategories.map(c => `- ${c.category}: ${c.amount.toFixed(2)} (${c.percentage}% of expenses, ${c.transactionCount} transactions)`).join('\n') || 'No transactions logged'}

Budgets Utilization:
${summary.budgets.map(b => `- ${b.category}: Limit ${b.budgeted.toFixed(2)}, Spent ${b.spent.toFixed(2)} (${b.percentUsed}% used)${b.isOverBudget ? ' [OVER BUDGET!]' : ''}`).join('\n') || 'No budgets configured'}

Goals Status:
${summary.goals.map(g => `- ${g.name}: Target ${g.target.toFixed(2)}, Current ${g.current.toFixed(2)} (${g.progressPercent}%), Remaining ${g.remaining.toFixed(2)}, Required/mo ${g.requiredMonthlyContribution.toFixed(2)}`).join('\n') || 'No active goals'}

Bills & Recurring Obligations:
- Upcoming: ${summary.upcomingBillsCount} bills (${summary.upcomingBillsTotal.toFixed(2)})
- Overdue: ${summary.overdueBillsCount} bills (${summary.overdueBillsTotal.toFixed(2)})
- Monthly Recurring Outflow: ${summary.monthlyRecurringOutflow.toFixed(2)}/mo
- Active Subscriptions (${summary.subscriptions.length}): ${summary.subscriptions.map(s => `${s.name} (${s.amount}/${s.frequency})`).join(', ') || 'None'}
- Annual Subscription Cost: ${summary.totalSubscriptionAnnualCost.toFixed(2)}/yr

Predictions & Trajectory:
- Next Month Predicted Outflow: ${predictions.nextMonth.predictedExpenses.toFixed(2)}
- Next Month Predicted Inflows: ${predictions.nextMonth.predictedIncome.toFixed(2)}
- Predicted Net Flow: ${predictions.nextMonth.predictedNetCashFlow.toFixed(2)}
- Financial Trajectory: ${predictions.trajectory.trend.toUpperCase()} (${predictions.trajectory.reason})
- Financial Health Score: ${summary.financialHealth.score}/850 (${summary.financialHealth.grade})
=== END FINANCIAL DATA ===
`;

    const systemPrompt = `You are SpendWise AI, an expert personal financial intelligence advisor.
Core Principles:
1. Ground all numerical figures strictly in the supplied REAL FINANCIAL DATA above. Never invent transactions, accounts, income, expenses, budgets, or goal numbers.
2. If data is unavailable or empty, explicitly state that more transaction logs are needed.
3. Distinguish historical facts from predictive estimates. Remind the user that projections are estimates based on historical patterns.
4. Keep answers structured, highly concise, and readable for mobile screens.
5. Use bullet points and **bold** formatting for numbers and key takeaways.
6. Do not provide regulated investment, tax, or legal advice.`;

    // 1. Try Groq or Gemini if API Key is available
    if (apiKey && apiKey.trim().length > 0) {
      try {
        if (apiKey.startsWith('gsk_')) {
          const messagesPayload: any[] = [
            { role: 'system', content: `${systemPrompt}\n\n${contextPrompt}` },
          ];

          // Include last 6 messages of conversation history
          history.slice(-6).forEach(h => {
            messagesPayload.push({
              role: h.role === 'assistant' ? 'assistant' : 'user',
              content: h.content,
            });
          });

          messagesPayload.push({ role: 'user', content: prompt });

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: messagesPayload,
              temperature: 0.6,
              max_tokens: 800,
            }),
          });

          if (groqRes.ok) {
            const data: any = await groqRes.json();
            const text = data.choices?.[0]?.message?.content;
            if (text && text.trim().length > 0) {
              return text;
            }
          }
        } else {
          // Gemini Fallback
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'spendwise-ai' } },
          });
          const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\nUser Question: ${prompt}`;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.6,
            },
          });
          if (response.text) {
            return response.text;
          }
        }
      } catch (err: any) {
        console.warn('AI LLM Provider error, falling back to deterministic intelligence engine:', err.message);
      }
    }

    // 2. Deterministic AI Rule-Based Response Engine (Ensures 100% reliability with zero crashes)
    return this.generateDeterministicResponse(prompt, summary, predictions);
  }

  // Deterministic response generator fallback
  private static generateDeterministicResponse(
    prompt: string,
    summary: FinancialSummary,
    predictions: FinancialPredictions
  ): string {
    const q = prompt.toLowerCase();

    // Spending / Outflows
    if (q.includes('spend') || q.includes('expense') || q.includes('outflow') || q.includes('how much did i')) {
      const topCat = summary.topCategories[0];
      return `### 📊 Monthly Spending Analysis

- **Current Month Expenses:** **${summary.currentMonth.expenses.toFixed(2)}**
- **Daily Average Spending:** **${summary.currentMonth.dailyAverage.toFixed(2)}/day**
- **Top Spending Category:** **${topCat ? `${topCat.category} (${topCat.amount.toFixed(2)} - ${topCat.percentage}%)` : 'No transactions recorded'}**
- **Month-over-Month Change:** **${summary.momChange.expensePercent >= 0 ? '+' : ''}${summary.momChange.expensePercent}%** vs last month (${summary.previousMonth.expenses.toFixed(2)})

💡 *Recommendation:* ${topCat ? `Trimming 10% from **${topCat.category}** would boost your monthly savings by **${(topCat.amount * 0.1).toFixed(2)}**.` : 'Log your daily expenses to receive deeper category insights.'}`;
    }

    // Savings / Surplus
    if (q.includes('save') || q.includes('saving') || q.includes('surplus') || q.includes('can i afford')) {
      return `### 💰 Savings & Cash Flow Overview

- **Current Inflows (Income):** **${summary.currentMonth.income.toFixed(2)}**
- **Current Outflows (Expenses):** **${summary.currentMonth.expenses.toFixed(2)}**
- **Retained Surplus:** **${summary.currentMonth.net.toFixed(2)}**
- **Current Savings Rate:** **${summary.currentMonth.savingsRate}%** (Benchmark: 20%+)

💡 *Guidance:* ${summary.currentMonth.net > 0
  ? `You currently have **${summary.currentMonth.net.toFixed(2)}** in retained surplus. You can comfortably allocate funds to your goals or emergency reserve.`
  : `Expenses currently exceed income by **${Math.abs(summary.currentMonth.net).toFixed(2)}**. Focus on trimming discretionary categories before taking on new commitments.`}`;
    }

    // Bills / Subscriptions
    if (q.includes('bill') || q.includes('subscription') || q.includes('due') || q.includes('recurring')) {
      return `### 📅 Bills & Subscriptions Schedule

- **Upcoming Bills:** **${summary.upcomingBillsCount}** (**${summary.upcomingBillsTotal.toFixed(2)}**)
- **Overdue Bills:** **${summary.overdueBillsCount}** (**${summary.overdueBillsTotal.toFixed(2)}**)
- **Monthly Recurring Obligation:** **${summary.monthlyRecurringOutflow.toFixed(2)}/month**
- **Active Subscriptions:** **${summary.subscriptions.length}** (**${summary.totalSubscriptionAnnualCost.toFixed(2)}/year**)

${summary.overdueBillsCount > 0 ? `🚨 **Alert:** Settle your ${summary.overdueBillsCount} overdue bill(s) to avoid penalty charges.` : '✅ All scheduled obligations are on track.'}`;
    }

    // Goals
    if (q.includes('goal') || q.includes('target') || q.includes('emergency fund')) {
      if (summary.goals.length === 0) {
        return `### 🎯 Financial Goals

You have not configured any active financial goals yet. Create a goal in the **Goals** tab (such as an *Emergency Fund* or *Savings Target*) to track automated milestone projections.`;
      }

      return `### 🎯 Financial Goals Progress

${summary.goals.map(g => `- **${g.name}:** **${g.current.toFixed(2)}** of **${g.target.toFixed(2)}** (${g.progressPercent}% achieved). Required: **${g.requiredMonthlyContribution.toFixed(2)}/mo**`).join('\n')}

- **Total Goal Target:** **${summary.totalGoalTarget.toFixed(2)}**
- **Total Saved:** **${summary.totalGoalCurrent.toFixed(2)}**
- **Total Required Monthly:** **${summary.totalMonthlyGoalRequired.toFixed(2)}/mo**`;
    }

    // Predictions / Future
    if (q.includes('predict') || q.includes('forecast') || q.includes('future') || q.includes('next month')) {
      return `### 🔮 Predictive Financial Forecast

- **Predicted Next Month Expenses:** **${predictions.nextMonth.predictedExpenses.toFixed(2)}**
- **Predicted Next Month Income:** **${predictions.nextMonth.predictedIncome.toFixed(2)}**
- **Predicted Net Cash Flow:** **${predictions.nextMonth.predictedNetCashFlow.toFixed(2)}**
- **Financial Trajectory:** **${predictions.trajectory.trend.toUpperCase()}** (${predictions.trajectory.reason})
- **Projected 3-Month Surplus:** **${predictions.trajectory.projected3MonthSavings.toFixed(2)}**

ℹ️ *Note:* Predictions are statistical weighted estimates based on ${summary.trendHistory.length} months of historical records.`;
    }

    // Financial Health
    if (q.includes('health') || q.includes('score') || q.includes('grade')) {
      return `### 💎 Financial Health Score: **${summary.financialHealth.score}/850** (${summary.financialHealth.grade})

- **Savings Rate Score:** **${summary.financialHealth.savingsRateScore}/100**
- **Liquidity Buffer Score:** **${summary.financialHealth.cushionScore}/100**
- **Spending Ratio Score:** **${summary.financialHealth.spendRatioScore}/100**
- **Cash Flow Stability Score:** **${summary.financialHealth.stabilityScore}/100**

📋 **Key Action:** ${summary.financialHealth.recommendation}`;
    }

    // Default Complete Summary
    return `### 🤖 SpendWise Financial Intelligence Summary

Here is your current financial snapshot:
- **Net Worth:** **${summary.netWorth.toFixed(2)}** across **${summary.accounts.length}** account(s)
- **This Month Inflows:** **${summary.currentMonth.income.toFixed(2)}** | **Outflows:** **${summary.currentMonth.expenses.toFixed(2)}**
- **Net Cash Flow:** **${summary.currentMonth.net >= 0 ? '+' : ''}${summary.currentMonth.net.toFixed(2)}** (Savings Rate: **${summary.currentMonth.savingsRate}%**)
- **Financial Health:** **${summary.financialHealth.score}/850** (${summary.financialHealth.grade})
- **Upcoming Bills:** **${summary.upcomingBillsCount}** (**${summary.upcomingBillsTotal.toFixed(2)}**)

Ask me about your **spending**, **savings opportunities**, **goals**, **bills**, or **next month predictions**!`;
  }
}
