import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, AmountDisplay, Button, StatCard } from "../components/ui";
import { mockSpendingByMonth, mockAIInsights } from "../data/mockData";
import { useApp } from "../context/AppContext";

type DashboardScreen = "main" | "health" | "quickactions" | "notifications";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "income" ? "Income" : "Expenses"}: ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [screen, setScreen] = useState<DashboardScreen>("main");
  const { user, accounts, transactions, notifications, convertAndFormat, convertRaw } = useApp();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthIncome = 4300;
  const monthExpenses = 2723;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Screen 6: Main Dashboard
  if (screen === "main") {
    return (
      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold text-foreground">{user.name} 👋</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScreen("notifications")}
              className="relative w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setScreen("quickactions")}
              className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
                  <p className="font-mono text-4xl font-bold text-white leading-none" style={{ letterSpacing: "-0.03em" }}>
                    {convertAndFormat(totalBalance)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="bg-white/20 text-white border-white/20">
                      +{convertAndFormat(1246)} this month
                    </Badge>
                    <Badge variant="success" className="bg-white/20 text-white border-white/20">
                      +2.3% ↑
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Twin Stat Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label="Income (Jun)" value={convertAndFormat(monthIncome)} change="+0" color="#10b981" icon="💰" />
              <StatCard label="Expenses (Jun)" value={convertAndFormat(monthExpenses)} change={`+${convertAndFormat(127)}`} color="#ef4444" icon="💸" />
            </div>

            {/* Income vs Expenses Chart Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Income vs Expenses Analysis</h3>
                <span className="text-muted-foreground text-xs font-mono">6-Month Trend</span>
              </div>
              <Card className="p-0 overflow-hidden">
                <div className="h-64 px-2 pt-6 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockSpendingByMonth} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
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
                </div>
                <div className="flex gap-4 px-4 pb-4 border-t border-border pt-3 bg-secondary/15">
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-400 rounded" /><span className="text-xs text-muted-foreground">Monthly Inflows</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-1 bg-primary rounded" /><span className="text-xs text-muted-foreground">Monthly Outflows</span></div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions List Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Recent Activity</h3>
                <button onClick={() => onNavigate("transactions")} className="text-primary text-sm hover:underline">View Ledger →</button>
              </div>
              <div className="flex flex-col gap-2">
                {transactions.slice(0, 5).map(tx => (
                  <Card key={tx.id} hover className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-base">
                        {tx.icon}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">{tx.merchant}</p>
                        <p className="text-muted-foreground text-xs">{tx.category} · {tx.date}</p>
                      </div>
                    </div>
                    <AmountDisplay amount={tx.amount} />
                  </Card>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: Secondary Context, Accounts, AI Advice, Actions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Financial Health Overview Card */}
            <div>
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-2">Metrics</p>
              <Card hover onClick={() => setScreen("health")} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center bg-emerald-500/10">
                    <span className="font-mono font-bold text-emerald-400">742</span>
                  </div>
                  <div>
                    <h4 className="text-foreground text-sm font-semibold">Credit & Health Score</h4>
                    <p className="text-muted-foreground text-xs">Excellent · Up 12 pts this month</p>
                  </div>
                </div>
                <span className="text-muted-foreground hover:text-foreground text-lg transition-transform hover:translate-x-1">→</span>
              </Card>
            </div>

            {/* List of Connected Bank Accounts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Liquid Accounts</h3>
                <button onClick={() => onNavigate("settings")} className="text-primary text-xs hover:underline">Manage</button>
              </div>
              <div className="flex flex-col gap-2">
                {accounts.map(acc => (
                  <Card key={acc.id} hover className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: acc.color + "20", border: `1px solid ${acc.color}30` }}>
                        {acc.type === "checking" ? "🏦" : acc.type === "savings" ? "💰" : acc.type === "credit" ? "💳" : "📈"}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">{acc.name}</p>
                        <p className="text-muted-foreground text-[11px] font-mono">••••{acc.last4}</p>
                      </div>
                    </div>
                    <AmountDisplay amount={acc.balance} />
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Insight Teaser Card */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">Advisor Recommendation</h3>
              <Card className="border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">AI Financial Intelligence</p>
                    <p className="text-sm text-foreground font-medium leading-normal">{mockAIInsights[0].title}</p>
                    <button onClick={() => onNavigate("insights")} className="text-primary text-xs font-semibold mt-3 hover:underline inline-flex items-center gap-1">
                      Consult AI Assistant <span>→</span>
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Short quickactions grid right inside dashboard so they can access things without clicking setting */}
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
      { label: "Savings Rate", score: 88, desc: "Saving 18% of income — excellent", color: "#10b981" },
      { label: "Debt-to-Income", score: 72, desc: "DTI ratio of 28% — good range", color: "#6366f1" },
      { label: "Emergency Fund", score: 68, desc: "$10,240 of $15,000 goal", color: "#f59e0b" },
      { label: "Budget Adherence", score: 81, desc: "On budget in 6 of 8 categories", color: "#3b82f6" },
      { label: "Spending Trends", score: 74, desc: "Stable spending month over month", color: "#10b981" },
    ];
    const score = 742;
    const scoreColor = score >= 750 ? "#10b981" : score >= 600 ? "#f59e0b" : "#ef4444";
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("main")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Financial Health Score</h2>
        </div>
        <div className="flex flex-col items-center py-8 gap-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #0f1628 0%, #1a2035 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ border: `6px solid ${scoreColor}`, boxShadow: `0 0 30px ${scoreColor}40` }}>
            <div className="text-center">
              <p className="font-mono text-4xl font-bold" style={{ color: scoreColor }}>{score}</p>
              <p className="text-muted-foreground text-xs">out of 850</p>
            </div>
          </div>
          <Badge variant="success">Excellent</Badge>
          <p className="text-muted-foreground text-sm text-center px-6">Your financial health is in great shape. Keep maintaining your savings rate.</p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-foreground">Score Breakdown</h3>
          {metrics.map(m => (
            <Card key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground text-sm">{m.label}</span>
                <span className="font-mono text-sm" style={{ color: m.color }}>{m.score}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: m.color }} />
              </div>
              <p className="text-muted-foreground text-xs mt-2">{m.desc}</p>
            </Card>
          ))}
        </div>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 text-sm font-medium mb-1">💡 How to improve</p>
          <ul className="text-muted-foreground text-sm space-y-1">
            <li>• Complete your emergency fund (+8 pts)</li>
            <li>• Pay down credit card balance (+12 pts)</li>
            <li>• Maintain budget for 3 more months (+6 pts)</li>
          </ul>
        </Card>
      </div>
    );
  }

  // Screen 8: Quick Actions
  if (screen === "quickactions") {
    const actions = [
      { icon: "➕", label: "Add Transaction", desc: "Log a manual expense", onClick: () => onNavigate("transactions") },
      { icon: "📤", label: "Transfer Money", desc: "Move between accounts", onClick: () => {} },
      { icon: "🎯", label: "Create Goal", desc: "Set a savings target", onClick: () => onNavigate("goals") },
      { icon: "📊", label: "View Reports", desc: "Monthly spending breakdown", onClick: () => onNavigate("reports") },
      { icon: "💳", label: "Add Bill", desc: "Track upcoming payments", onClick: () => onNavigate("bills") },
      { icon: "🤖", label: "Ask AI", desc: "Get financial advice", onClick: () => onNavigate("insights") },
      { icon: "📁", label: "Export Data", desc: "Download transactions CSV", onClick: () => {} },
      { icon: "🔗", label: "Link Account", desc: "Connect a new bank", onClick: () => onNavigate("settings") },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("main")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(a => (
            <Card key={a.label} hover onClick={a.onClick} className="flex flex-col gap-2 py-5">
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
    const all = [
      ...notifications,
      { id: "n5", type: "alert", message: "Car insurance due in 5 days ($167)", time: "3 days ago", read: true },
      { id: "n6", type: "success", message: "Budget reset for July — new month starting!", time: "5 days ago", read: true },
    ];
    const typeIcon: Record<string, string> = { alert: "⚠️", insight: "🤖", goal: "🎯", transaction: "💳", success: "✅" };
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("main")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Notifications</h2>
          <Badge variant="danger" className="ml-auto">{all.filter(n => !n.read).length} new</Badge>
        </div>
        <div className="flex flex-col gap-2">
          {all.map(n => (
            <Card key={n.id} className={`flex gap-3 py-3 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
              <span className="text-xl mt-0.5">{typeIcon[n.type] || "🔔"}</span>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.message}</p>
                <p className="text-muted-foreground text-xs mt-1">{n.time}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
            </Card>
          ))}
        </div>
        <Button variant="secondary" onClick={() => setScreen("main")}>Mark all as read</Button>
      </div>
    );
  }

  return null;
}
