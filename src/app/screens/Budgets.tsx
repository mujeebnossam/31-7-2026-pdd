import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, Button, Input, Select, ProgressBar } from "../components/ui";
import { categories } from "../data/mockData";
import { useApp } from "../context/AppContext";

type BudgetScreen = "overview" | "create" | "detail" | "history" | "alerts";

export function Budgets() {
  const { budgets, addBudget, convertAndFormat, convertRaw } = useApp();
  const [screen, setScreen] = useState<BudgetScreen>("overview");
  const [selectedBudget, setSelectedBudget] = useState(budgets[0] || { id: "1", category: "Food & Drink", budgeted: 500, spent: 320, icon: "🍔", color: "#ec4899" });
  const [newBudget, setNewBudget] = useState({ category: "Groceries", amount: "" });

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  // Screen 15: Budget Overview
  if (screen === "overview") {
    const over = budgets.filter(b => b.spent > b.budgeted);
    const onTrack = budgets.filter(b => b.spent <= b.budgeted * 0.8);
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Budgets</h2>
          <div className="flex gap-2">
            <button onClick={() => setScreen("alerts")} className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">🔔</button>
            <button onClick={() => setScreen("create")} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">+</button>
          </div>
        </div>

        {/* Summary donut */}
        <Card className="flex flex-col items-center gap-4 py-6">
          <div className="relative">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={budgets} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="spent" startAngle={90} endAngle={-270}>
                  {budgets.map(b => <Cell key={b.id} fill={b.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <p className="font-mono text-base font-bold text-foreground truncate max-w-[130px]">{convertAndFormat(totalSpent)}</p>
              <p className="text-muted-foreground text-xs font-medium">of {convertAndFormat(totalBudgeted)}</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="font-mono text-emerald-400 font-semibold">{onTrack.length}</p>
              <p className="text-muted-foreground text-xs">On Track</p>
            </div>
            <div className="border-l border-border" />
            <div>
              <p className="font-mono text-amber-400 font-semibold">{budgets.length - onTrack.length - over.length}</p>
              <p className="text-muted-foreground text-xs">Near Limit</p>
            </div>
            <div className="border-l border-border" />
            <div>
              <p className="font-mono text-red-400 font-semibold">{over.length}</p>
              <p className="text-muted-foreground text-xs">Over Budget</p>
            </div>
          </div>
        </Card>

        {/* Budget list */}
        <div className="flex flex-col gap-3">
          {budgets.map(b => {
            const pct = (b.spent / b.budgeted) * 100;
            const isOver = b.spent > b.budgeted;
            const isNear = pct > 80 && !isOver;
            return (
              <Card
                key={b.id}
                hover
                onClick={() => { setSelectedBudget(b); setScreen("detail"); }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{b.icon}</span>
                    <span className="text-foreground text-sm font-medium">{b.category}</span>
                    {isOver && <Badge variant="danger">Over</Badge>}
                    {isNear && <Badge variant="warning">Near limit</Badge>}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold" style={{ color: isOver ? "#ef4444" : b.color }}>{convertAndFormat(b.spent)}</span>
                    <span className="text-muted-foreground text-xs"> / {convertAndFormat(b.budgeted)}</span>
                  </div>
                </div>
                <ProgressBar value={b.spent} max={b.budgeted} color={isOver ? "#ef4444" : b.color} showLabel />
                <p className="text-muted-foreground text-xs mt-2 font-mono">
                  {isOver ? `${convertAndFormat(b.spent - b.budgeted)} over budget` : `${convertAndFormat(b.budgeted - b.spent)} remaining`}
                </p>
              </Card>
            );
          })}
        </div>
        <Button variant="secondary" fullWidth onClick={() => setScreen("history")}>📅 View Budget History</Button>
      </div>
    );
  }

  // Screen 16: Create Budget
  if (screen === "create") {
    const handleCreate = () => {
      const icons: { [key: string]: string } = {
        "Food & Drink": "🍔",
        "Housing": "🏠",
        "Utilities": "⚡",
        "Transportation": "🚗",
        "Groceries": "🛒",
        "Entertainment": "🎬",
        "Shopping": "🛍️",
        "Insurance": "🛡️",
        "Others": "📦"
      };
      const colors: { [key: string]: string } = {
        "Food & Drink": "#ec4899",
        "Housing": "#3b82f6",
        "Utilities": "#06b6d4",
        "Transportation": "#f59e0b",
        "Groceries": "#10b981",
        "Entertainment": "#8b5cf6",
        "Shopping": "#d946ef",
        "Others": "#6b7280"
      };

      const categoryValue = newBudget.category;
      addBudget({
        category: categoryValue,
        budgeted: Number(newBudget.amount),
        icon: icons[categoryValue] || "📊",
        color: colors[categoryValue] || "#8b5cf6",
      });

      setNewBudget({ category: "Groceries", amount: "" });
      setScreen("overview");
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Create Budget</h2>
        </div>
        <div className="bg-secondary rounded-2xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-2">Monthly Limit</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground text-3xl">$</span>
            <input
              type="number"
              placeholder="0"
              value={newBudget.amount}
              onChange={e => setNewBudget(p => ({ ...p, amount: e.target.value }))}
              className="bg-transparent text-4xl font-mono text-foreground w-40 text-center focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">per month</p>
        </div>
        <Select
          label="Category"
          value={newBudget.category}
          onChange={v => setNewBudget(p => ({ ...p, category: v }))}
          options={categories.map(c => ({ value: c, label: c }))}
        />
        <Card className="border-primary/20 bg-primary/5">
          <p className="text-primary text-sm font-semibold mb-1">🤖 AI Suggestion</p>
          <p className="text-muted-foreground text-sm">
            Based on your spending history, we suggest a {convertAndFormat(newBudget.category === "Groceries" ? 480 : 250)}/month budget for {newBudget.category}.
          </p>
          <button
            className="text-primary text-xs font-semibold mt-2 hover:underline"
            onClick={() => {
              const baseAmt = newBudget.category === "Groceries" ? 480 : 250;
              setNewBudget(p => ({ ...p, amount: String(Math.round(convertRaw(baseAmt))) }));
            }}
          >
            Use suggestion →
          </button>
        </Card>
        <div>
          <p className="text-muted-foreground text-sm mb-3">Alerts</p>
          <div className="flex flex-col gap-2">
            {["Alert at 75% used", "Alert at 90% used", "Alert when over budget"].map(alert => (
              <label key={alert} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                <span className="text-foreground text-sm">{alert}</span>
              </label>
            ))}
          </div>
        </div>
        <Button fullWidth size="lg" disabled={!newBudget.amount} onClick={handleCreate}>
          Create Budget
        </Button>
      </div>
    );
  }

  // Screen 17: Budget Detail
  if (screen === "detail") {
    const b = selectedBudget;
    const pct = (b.spent / b.budgeted) * 100;
    const txs = [
      { merchant: "Whole Foods", amount: 127.43, date: "Jun 11" },
      { merchant: "Trader Joe's", amount: 94.32, date: "Jun 3" },
      { merchant: "Target (food)", amount: 54.80, date: "Jun 6" },
      { merchant: "Costco", amount: 41.65, date: "Jun 1" },
    ].slice(0, Math.floor(b.spent / 50));
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">{b.category} Budget</h2>
          <button className="ml-auto text-primary text-sm">Edit</button>
        </div>
        <div className="flex flex-col items-center gap-4 bg-secondary rounded-2xl p-6">
          <span className="text-4xl">{b.icon}</span>
          <div className="w-full">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-2xl font-bold" style={{ color: b.color }}>{convertAndFormat(b.spent)}</span>
              <span className="text-muted-foreground">of {convertAndFormat(b.budgeted)}</span>
            </div>
            <ProgressBar value={b.spent} max={b.budgeted} color={b.color} />
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground text-xs">{pct.toFixed(0)}% used</span>
              <span className="text-muted-foreground text-xs">{convertAndFormat(b.budgeted - b.spent)} left</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Daily avg</p>
            <p className="font-mono text-xs text-foreground mt-0.5 font-bold truncate">{convertAndFormat(Number((b.spent / 11).toFixed(0)))}</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Projected</p>
            <p className="font-mono text-xs text-foreground mt-0.5 font-bold truncate">{convertAndFormat(Math.round(b.spent / 11 * 30))}</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Days left</p>
            <p className="font-mono text-xs text-foreground mt-0.5 font-bold">19</p>
          </div>
        </div>
        <div>
          <h3 className="text-foreground mb-3">Recent Spending</h3>
          <div className="flex flex-col gap-2">
            {txs.map((tx, i) => (
              <Card key={i} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-base">{b.icon}</span>
                  <div>
                    <p className="text-foreground text-sm">{tx.merchant}</p>
                    <p className="text-muted-foreground text-xs">{tx.date}</p>
                  </div>
                </div>
                <span className="font-mono text-red-400 text-sm">-{convertAndFormat(tx.amount)}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Screen 18: Budget History
  if (screen === "history") {
    const months = ["May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026"];
    const totals = [2680, 3120, 2890, 2560, 2940];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Budget History</h2>
        </div>
        <div className="flex flex-col gap-3">
          {months.map((month, i) => (
            <Card key={month} hover>
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground text-sm">{month}</span>
                <div className="flex gap-2 items-center">
                  <Badge variant={totals[i] < 3000 ? "success" : "warning"}>
                    {totals[i] < 3000 ? "Under budget" : "Near limit"}
                  </Badge>
                  <span className="font-mono text-sm text-foreground">{convertAndFormat(totals[i])}</span>
                </div>
              </div>
              <ProgressBar value={totals[i]} max={3500} color={totals[i] > 3200 ? "#ef4444" : "#10b981"} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 19: Budget Alerts
  if (screen === "alerts") {
    const alerts = [
      { budget: "Food & Drink", message: `95.7% of ${convertAndFormat(300)} budget used`, severity: "danger", icon: "🍔" },
      { budget: "Housing", message: `95.5% of ${convertAndFormat(2200)} budget used`, severity: "warning", icon: "🏠" },
      { budget: "Groceries", message: `63.6% of ${convertAndFormat(500)} budget used — on track`, severity: "success", icon: "🛒" },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Budget Alerts</h2>
        </div>
        <div className="flex flex-col gap-3">
          {alerts.map(a => (
            <Card key={a.budget} className={`border-${a.severity === "danger" ? "red" : a.severity === "warning" ? "amber" : "emerald"}-500/20 bg-${a.severity === "danger" ? "red" : a.severity === "warning" ? "amber" : "emerald"}-500/5`}>
              <div className="flex gap-3 items-start">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className="text-foreground text-sm font-medium">{a.budget}</p>
                  <p className="text-muted-foreground text-sm">{a.message}</p>
                </div>
                <Badge variant={a.severity as "danger" | "warning" | "success"} className="ml-auto">
                  {a.severity === "danger" ? "Critical" : a.severity === "warning" ? "Warning" : "Good"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
        <div>
          <h3 className="text-foreground mb-3">Alert Settings</h3>
          <Card>
            {[
              { label: "75% budget used", enabled: true },
              { label: "90% budget used", enabled: true },
              { label: "Over budget", enabled: true },
              { label: "Weekly summary", enabled: false },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-foreground text-sm">{s.label}</span>
                <div className={`w-10 h-5.5 rounded-full flex items-center ${s.enabled ? "bg-primary" : "bg-secondary"} cursor-pointer px-0.5`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "translate-x-4.5" : ""}`} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
