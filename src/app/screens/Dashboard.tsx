import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, AmountDisplay, Button, StatCard } from "../components/ui";
import { useApp } from "../context/AppContext";

type DashboardScreen = "main" | "health" | "quickactions" | "notifications";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [screen, setScreen] = useState<DashboardScreen>("main");
  const { user, accounts, transactions, notifications, convertAndFormat, convertRaw } = useApp();

  // ─── 1. Core Totals & Dates ──────────────────────────────────────────────
  const totalBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)

  const formatMonthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;

  const currentMonthKey = formatMonthKey(currentYear, currentMonth);
  const currentMonthName = now.toLocaleDateString("en-US", { month: "short" });

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthKey = formatMonthKey(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

  // ─── 2. Current Month vs Previous Month Calculations ───────────────────────
  const currentMonthIncome = transactions
    .filter(t => t.date?.startsWith(currentMonthKey) && (t.type === "income" || t.amount > 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentMonthExpenses = transactions
    .filter(t => t.date?.startsWith(currentMonthKey) && (t.type === "expense" || t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentMonthNet = currentMonthIncome - currentMonthExpenses;

  const prevMonthIncome = transactions
    .filter(t => t.date?.startsWith(prevMonthKey) && (t.type === "income" || t.amount > 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const prevMonthExpenses = transactions
    .filter(t => t.date?.startsWith(prevMonthKey) && (t.type === "expense" || t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const prevMonthNet = prevMonthIncome - prevMonthExpenses;

  // Monthly Net Change / Growth Percentage
  let netGrowthPct = 0;
  if (prevMonthNet !== 0) {
    netGrowthPct = Math.round(((currentMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100);
  } else if (currentMonthNet > 0) {
    netGrowthPct = 100;
  } else if (currentMonthNet < 0) {
    netGrowthPct = -100;
  }

  // Expense Delta vs Previous Month
  const expenseDelta = currentMonthExpenses - prevMonthExpenses;
  const expenseChangeText = expenseDelta === 0
    ? "No change vs last mo"
    : expenseDelta > 0
    ? `+${convertAndFormat(expenseDelta)} vs last mo`
    : `-${convertAndFormat(Math.abs(expenseDelta))} vs last mo`;

  // Income Delta vs Previous Month
  const incomeDelta = currentMonthIncome - prevMonthIncome;
  const incomeChangeText = incomeDelta === 0
    ? "No change vs last mo"
    : incomeDelta > 0
    ? `+${convertAndFormat(incomeDelta)} vs last mo`
    : `-${convertAndFormat(Math.abs(incomeDelta))} vs last mo`;

  // ─── 3. Dynamic 6-Month Trend Data ───────────────────────────────────────
  const sixMonthTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const mKey = formatMonthKey(d.getFullYear(), d.getMonth());
    const label = d.toLocaleDateString("en-US", { month: "short" });

    const mInc = transactions
      .filter(t => t.date?.startsWith(mKey) && (t.type === "income" || t.amount > 0))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const mExp = transactions
      .filter(t => t.date?.startsWith(mKey) && (t.type === "expense" || t.amount < 0))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    sixMonthTrend.push({
      month: label,
      monthKey: mKey,
      income: Math.round(convertRaw(mInc)),
      expenses: Math.round(convertRaw(mExp)),
      rawIncome: mInc,
      rawExpenses: mExp,
    });
  }

  const hasChartData = sixMonthTrend.some(m => m.rawIncome > 0 || m.rawExpenses > 0);

  // ─── 4. Deterministic Financial Health Score ──────────────────────────────
  // Factor 1: Savings Rate (30% weight)
  let savingsRateScore = 70;
  let savingsRateDesc = "No transactions logged this month";
  if (currentMonthIncome > 0) {
    const savingsRatio = (currentMonthIncome - currentMonthExpenses) / currentMonthIncome;
    const savingsPct = Math.round(savingsRatio * 100);
    if (savingsRatio >= 0.30) {
      savingsRateScore = 95;
      savingsRateDesc = `Saving ${savingsPct}% of monthly income — excellent`;
    } else if (savingsRatio >= 0.20) {
      savingsRateScore = 85;
      savingsRateDesc = `Saving ${savingsPct}% of monthly income — good`;
    } else if (savingsRatio >= 0.10) {
      savingsRateScore = 70;
      savingsRateDesc = `Saving ${savingsPct}% of monthly income — moderate`;
    } else if (savingsRatio >= 0) {
      savingsRateScore = 55;
      savingsRateDesc = `Saving ${savingsPct}% of monthly income — tight`;
    } else {
      savingsRateScore = Math.max(20, Math.round(50 + savingsRatio * 50));
      savingsRateDesc = `Expenses exceed income by ${Math.abs(savingsPct)}%`;
    }
  } else if (currentMonthExpenses > 0) {
    savingsRateScore = 30;
    savingsRateDesc = "Outflows recorded with no monthly income logged";
  }

  // Factor 2: Emergency Cushion / Liquidity Ratio (25% weight)
  let cushionScore = 65;
  let cushionDesc = "Maintain liquid cash reserve";
  const monthlyBurn = currentMonthExpenses > 0 ? currentMonthExpenses : 1000;
  const cushionMonths = totalBalance / monthlyBurn;
  if (totalBalance <= 0) {
    cushionScore = 25;
    cushionDesc = "Zero or negative total liquid balance";
  } else if (cushionMonths >= 6) {
    cushionScore = 98;
    cushionDesc = `${cushionMonths.toFixed(1)} months reserve cushion (${convertAndFormat(totalBalance)})`;
  } else if (cushionMonths >= 3) {
    cushionScore = 85;
    cushionDesc = `${cushionMonths.toFixed(1)} months of expenses covered`;
  } else if (cushionMonths >= 1) {
    cushionScore = 70;
    cushionDesc = `${cushionMonths.toFixed(1)} months of liquid reserve`;
  } else {
    cushionScore = 45;
    cushionDesc = `Under 1 month of reserve (${convertAndFormat(totalBalance)})`;
  }

  // Factor 3: Expense-to-Income Discipline (25% weight)
  let spendRatioScore = 70;
  let spendRatioDesc = "Balanced spending discipline";
  if (currentMonthIncome > 0) {
    const spendRatio = currentMonthExpenses / currentMonthIncome;
    const spendPct = Math.round(spendRatio * 100);
    if (spendRatio <= 0.50) {
      spendRatioScore = 95;
      spendRatioDesc = `Spending only ${spendPct}% of income — outstanding`;
    } else if (spendRatio <= 0.75) {
      spendRatioScore = 82;
      spendRatioDesc = `Spending ${spendPct}% of income — well managed`;
    } else if (spendRatio <= 0.90) {
      spendRatioScore = 68;
      spendRatioDesc = `Spending ${spendPct}% of income — watch discretionary costs`;
    } else if (spendRatio <= 1.0) {
      spendRatioScore = 52;
      spendRatioDesc = `Spending ${spendPct}% of income — near break-even`;
    } else {
      spendRatioScore = Math.max(15, Math.round(50 - (spendRatio - 1) * 50));
      spendRatioDesc = `Spending ${spendPct}% of income — deficit spending`;
    }
  } else if (currentMonthExpenses === 0) {
    spendRatioScore = 70;
    spendRatioDesc = "No expenses logged this month";
  } else {
    spendRatioScore = 30;
    spendRatioDesc = "Expenses active without logged income";
  }

  // Factor 4: Cashflow Stability over 6 months (20% weight)
  const activeMonths = sixMonthTrend.filter(m => m.rawIncome > 0 || m.rawExpenses > 0);
  let stabilityScore = 60;
  let stabilityDesc = "Establishing cashflow history";
  if (activeMonths.length > 0) {
    const positiveMonths = activeMonths.filter(m => m.rawIncome >= m.rawExpenses).length;
    const positiveRatio = positiveMonths / activeMonths.length;
    if (positiveRatio >= 0.8) {
      stabilityScore = 95;
      stabilityDesc = `Positive net cashflow in ${positiveMonths} of ${activeMonths.length} active months`;
    } else if (positiveRatio >= 0.5) {
      stabilityScore = 75;
      stabilityDesc = `Positive net cashflow in ${positiveMonths} of ${activeMonths.length} active months`;
    } else {
      stabilityScore = 45;
      stabilityDesc = `Negative net flow in ${activeMonths.length - positiveMonths} of ${activeMonths.length} active months`;
    }
  }

  const composite0to100 = Math.round(
    0.30 * savingsRateScore +
    0.25 * cushionScore +
    0.25 * spendRatioScore +
    0.20 * stabilityScore
  );

  const financialScore = Math.round(300 + (composite0to100 / 100) * 550);
  const healthGrade = financialScore >= 750 ? "Excellent" : financialScore >= 650 ? "Good" : financialScore >= 550 ? "Fair" : "Needs Attention";
  const healthColor = financialScore >= 750 ? "#10b981" : financialScore >= 650 ? "#3b82f6" : financialScore >= 550 ? "#f59e0b" : "#ef4444";

  // ─── 5. Dynamic AI Advice Teaser ──────────────────────────────────────────
  let aiTeaser = "Link your accounts and record transactions to receive customized AI financial intelligence.";
  if (transactions.length > 0) {
    const categoryExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.date?.startsWith(currentMonthKey) && (t.type === "expense" || t.amount < 0))
      .forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + Math.abs(t.amount);
      });
    
    const topCatEntry = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];

    if (topCatEntry && currentMonthExpenses > 0) {
      const topCatName = topCatEntry[0];
      const topCatAmount = topCatEntry[1];
      const catPct = Math.round((topCatAmount / currentMonthExpenses) * 100);
      aiTeaser = `You spent ${convertAndFormat(topCatAmount)} on ${topCatName} this month (${catPct}% of outflows). Consider setting a budget to optimize savings.`;
    } else if (currentMonthNet > 0) {
      aiTeaser = `Great cashflow management! You have retained ${convertAndFormat(currentMonthNet)} in surplus this month. Consider allocating it to your emergency reserve.`;
    } else if (currentMonthExpenses > 0 && currentMonthNet < 0) {
      aiTeaser = `Your expenses exceeded income by ${convertAndFormat(Math.abs(currentMonthNet))} this month. Review your recent transactions to trim discretionary spending.`;
    } else {
      aiTeaser = `You have ${accounts.length} connected account${accounts.length !== 1 ? "s" : ""} with a total balance of ${convertAndFormat(totalBalance)}. Keep logging transactions to unlock predictive insights.`;
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-xl">
          <p className="text-muted-foreground mb-1 font-medium">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="font-mono">
              {p.name === "income" ? "Inflows" : "Outflows"}: {convertAndFormat(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Screen 6: Main Dashboard
  if (screen === "main") {
    return (
      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold text-foreground">{user?.name || "there"} 👋</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScreen("notifications")}
              className="relative w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setScreen("quickactions")}
              className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Quick Actions"
            >
              ⚡
            </button>
          </div>
        </div>

        {/* Dynamic Responsive Multi-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1 & 2: Primary Financial Trends and Information */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Total Net Worth Card */}
            <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-tr from-primary via-violet-600 to-indigo-800 shadow-xl shadow-primary/10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
              <div className="relative">
                <p className="text-primary-foreground/75 text-sm mb-1 font-medium">Total Net Worth</p>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                  <p className="font-mono text-4xl font-bold text-white leading-none" style={{ letterSpacing: "-0.03em" }}>
                    {convertAndFormat(totalBalance)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="bg-white/20 text-white border-white/20">
                      {currentMonthNet >= 0 ? `+${convertAndFormat(currentMonthNet)}` : `-${convertAndFormat(Math.abs(currentMonthNet))}`} this month
                    </Badge>
                    <Badge variant="success" className="bg-white/20 text-white border-white/20">
                      {netGrowthPct >= 0 ? `+${netGrowthPct}% ↑` : `${netGrowthPct}% ↓`}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Twin Stat Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                label={`Income (${currentMonthName})`}
                value={convertAndFormat(currentMonthIncome)}
                change={incomeChangeText}
                color="#10b981"
                icon="💰"
              />
              <StatCard
                label={`Expenses (${currentMonthName})`}
                value={convertAndFormat(currentMonthExpenses)}
                change={expenseChangeText}
                color="#ef4444"
                icon="💸"
              />
            </div>

            {/* Income vs Expenses Chart Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Income vs Expenses Analysis</h3>
                <span className="text-muted-foreground text-xs font-mono">6-Month Trend</span>
              </div>
              <Card className="p-0 overflow-hidden">
                <div className="h-64 px-2 pt-6 pb-2">
                  {hasChartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sixMonthTrend} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                        <Area type="monotone" dataKey="expenses" stroke="#6366f1" fill="url(#primaryGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <span className="text-3xl mb-2">📊</span>
                      <p className="text-foreground text-sm font-medium">No 6-Month Activity Recorded</p>
                      <p className="text-muted-foreground text-xs mt-1 max-w-xs">
                        Start recording income and expenses to visualize your 6-month cashflow trend.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 px-4 pb-4 border-t border-border pt-3 bg-secondary/15">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-emerald-400 rounded" />
                    <span className="text-xs text-muted-foreground">Monthly Inflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-primary rounded" />
                    <span className="text-xs text-muted-foreground">Monthly Outflows</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions List Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Recent Activity</h3>
                <button onClick={() => onNavigate("transactions")} className="text-primary text-sm hover:underline">
                  View Ledger →
                </button>
              </div>
              {transactions.length === 0 ? (
                <Card className="py-8 text-center text-muted-foreground text-sm">
                  No transactions recorded yet. Click ➕ in Quick Actions or navigate to Ledger.
                </Card>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactions.slice(0, 5).map(tx => (
                    <Card key={tx.id} hover onClick={() => onNavigate("transactions")} className="flex items-center justify-between py-3 cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-base flex-shrink-0">
                          {tx.icon || (tx.type === "income" ? "💰" : "💳")}
                        </div>
                        <div className="truncate min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{tx.merchant || tx.title}</p>
                          <p className="text-muted-foreground text-xs truncate">{tx.category} · {tx.date}</p>
                        </div>
                      </div>
                      <AmountDisplay amount={tx.amount} />
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Column 3: Secondary Context, Accounts, AI Advice, Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Financial Health Overview Card */}
            <div>
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-2">Metrics</p>
              <Card hover onClick={() => setScreen("health")} className="flex items-center justify-between py-4 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: healthColor, backgroundColor: `${healthColor}15` }}
                  >
                    <span className="font-mono font-bold text-sm" style={{ color: healthColor }}>
                      {financialScore}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-foreground text-sm font-semibold">Financial Health Score</h4>
                    <p className="text-muted-foreground text-xs">{healthGrade} · Real-time calculation</p>
                  </div>
                </div>
                <span className="text-muted-foreground hover:text-foreground text-lg transition-transform hover:translate-x-1">→</span>
              </Card>
            </div>

            {/* List of Connected Bank Accounts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Liquid Accounts</h3>
                <button onClick={() => onNavigate("settings")} className="text-primary text-xs hover:underline">
                  Manage
                </button>
              </div>
              {accounts.length === 0 ? (
                <Card className="py-6 text-center text-muted-foreground text-xs">
                  No accounts linked yet. Click Manage to link your first bank account or wallet.
                </Card>
              ) : (
                <div className="flex flex-col gap-2">
                  {accounts.map(acc => (
                    <Card key={acc.id} hover onClick={() => onNavigate("settings")} className="flex items-center justify-between py-3 cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: (acc.color || "#3b82f6") + "20", border: `1px solid ${(acc.color || "#3b82f6")}30` }}>
                          {acc.type === "checking" ? "🏦" : acc.type === "savings" ? "💰" : acc.type === "credit" ? "💳" : acc.type === "cash" ? "💵" : "📈"}
                        </div>
                        <div className="truncate min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{acc.name}</p>
                          <p className="text-muted-foreground text-[11px] font-mono">••••{acc.last4 || "0000"}</p>
                        </div>
                      </div>
                      <AmountDisplay amount={acc.balance} />
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insight Teaser Card */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">Advisor Recommendation</h3>
              <Card className="border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">AI Financial Intelligence</p>
                    <p className="text-sm text-foreground font-medium leading-normal">{aiTeaser}</p>
                    <button onClick={() => onNavigate("insights")} className="text-primary text-xs font-semibold mt-3 hover:underline inline-flex items-center gap-1">
                      Consult AI Assistant <span>→</span>
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Short quickactions grid */}
            <div>
              <h3 className="text-foreground font-semibold mb-3 font-mono text-xs uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onNavigate("transactions")} className="p-3 bg-secondary/55 border border-border rounded-xl text-center hover:bg-secondary hover:border-primary/30 transition-all">
                  <span className="text-lg block mb-1">➕</span>
                  <span className="text-xs text-foreground font-medium">Add Cash Flow</span>
                </button>
                <button onClick={() => onNavigate("goals")} className="p-3 bg-secondary/55 border border-border rounded-xl text-center hover:bg-secondary hover:border-primary/30 transition-all">
                  <span className="text-lg block mb-1">🎯</span>
                  <span className="text-xs text-foreground font-medium">Set Target</span>
                </button>
                <button onClick={() => onNavigate("insights")} className="p-3 bg-secondary/55 border border-border rounded-xl text-center hover:bg-secondary hover:border-primary/30 transition-all">
                  <span className="text-lg block mb-1">🤖</span>
                  <span className="text-xs text-foreground font-medium">Ask Advice</span>
                </button>
                <button onClick={() => onNavigate("bills")} className="p-3 bg-secondary/55 border border-border rounded-xl text-center hover:bg-secondary hover:border-primary/30 transition-all">
                  <span className="text-lg block mb-1">📅</span>
                  <span className="text-xs text-foreground font-medium">View Bills</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Screen 7: Financial Health Score
  if (screen === "health") {
    const metrics = [
      { label: "Savings Rate", score: savingsRateScore, desc: savingsRateDesc, color: "#10b981" },
      { label: "Emergency Cushion", score: cushionScore, desc: cushionDesc, color: "#6366f1" },
      { label: "Spending Discipline", score: spendRatioScore, desc: spendRatioDesc, color: "#3b82f6" },
      { label: "Cashflow Stability", score: stabilityScore, desc: stabilityDesc, color: "#f59e0b" },
    ];

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("main")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Financial Health Score</h2>
        </div>
        <div className="flex flex-col items-center py-8 gap-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #0f1628 0%, #1a2035 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ border: `6px solid ${healthColor}`, boxShadow: `0 0 30px ${healthColor}40` }}>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold" style={{ color: healthColor }}>{financialScore}</p>
              <p className="text-muted-foreground text-xs">out of 850</p>
            </div>
          </div>
          <Badge variant={financialScore >= 750 ? "success" : financialScore >= 650 ? "primary" : financialScore >= 550 ? "warning" : "danger"}>
            {healthGrade}
          </Badge>
          <p className="text-muted-foreground text-sm text-center px-6">
            {financialScore >= 700
              ? "Your financial health is in great shape. Keep maintaining your savings rate and positive cashflow."
              : "Review the breakdown below to enhance your savings cushion and reduce discretionary outflows."}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-foreground">Score Breakdown</h3>
          {metrics.map(m => (
            <Card key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground text-sm font-medium">{m.label}</span>
                <span className="font-mono text-sm font-bold" style={{ color: m.color }}>{m.score}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.score}%`, backgroundColor: m.color }} />
              </div>
              <p className="text-muted-foreground text-xs mt-2">{m.desc}</p>
            </Card>
          ))}
        </div>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 text-sm font-medium mb-1">💡 Real Financial Formula</p>
          <ul className="text-muted-foreground text-xs space-y-1">
            <li>• Savings Rate (30%): Net surplus percentage from monthly inflows</li>
            <li>• Emergency Cushion (25%): Total liquid accounts coverage vs monthly burn</li>
            <li>• Spending Discipline (25%): Ratio of outflows to total inflows</li>
            <li>• Cashflow Stability (20%): Monthly surplus consistency over the past 6 months</li>
          </ul>
        </Card>
      </div>
    );
  }

  // Screen 8: Quick Actions
  if (screen === "quickactions") {
    const actions = [
      { icon: "➕", label: "Add Transaction", desc: "Log income or expense", onClick: () => onNavigate("transactions") },
      { icon: "🎯", label: "Create Goal", desc: "Set a savings target", onClick: () => onNavigate("goals") },
      { icon: "📊", label: "View Reports", desc: "Monthly spending breakdown", onClick: () => onNavigate("reports") },
      { icon: "💳", label: "Add Bill", desc: "Track upcoming payments", onClick: () => onNavigate("bills") },
      { icon: "🤖", label: "Ask AI", desc: "Get financial advice", onClick: () => onNavigate("insights") },
      { icon: "🔗", label: "Link Account", desc: "Connect a new bank or wallet", onClick: () => onNavigate("settings") },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("main")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(a => (
            <Card key={a.label} hover onClick={a.onClick} className="flex flex-col gap-2 py-5 cursor-pointer">
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="text-foreground text-sm font-medium">{a.label}</p>
                <p className="text-muted-foreground text-xs">{a.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen: Notifications
  if (screen === "notifications") {
    const typeIcon: Record<string, string> = { alert: "⚠️", insight: "🤖", goal: "🎯", transaction: "💳", success: "✅" };
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("main")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Notifications</h2>
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="danger" className="ml-auto">{notifications.filter(n => !n.read).length} new</Badge>
          )}
        </div>
        {notifications.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl">🔔</span>
            <div>
              <p className="text-foreground font-semibold">No new notifications</p>
              <p className="text-muted-foreground text-xs mt-1">You're all caught up with your financial alerts and activity.</p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map(n => (
              <Card key={n.id} className={`flex gap-3 py-3 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
                <span className="text-xl mt-0.5">{typeIcon[n.type] || "🔔"}</span>
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? "text-foreground font-medium" : "text-muted-foreground"}`}>{n.message}</p>
                  <p className="text-muted-foreground text-xs mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
              </Card>
            ))}
          </div>
        )}
        {notifications.length > 0 && (
          <Button variant="secondary" onClick={() => setScreen("main")}>Back to Dashboard</Button>
        )}
      </div>
    );
  }

  return null;
}
