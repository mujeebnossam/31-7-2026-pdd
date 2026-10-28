import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, Badge, Button, Input, Select, ProgressBar } from "../components/ui";
import { categories } from "../data/mockData";
import { useApp, Budget } from "../context/AppContext";

type BudgetScreen = "overview" | "create" | "detail" | "edit" | "history" | "alerts";

const categoryIcons: Record<string, string> = {
  "Food & Drink": "🍔",
  "Housing": "🏠",
  "Utilities": "⚡",
  "Transportation": "🚗",
  "Groceries": "🛒",
  "Entertainment": "🎬",
  "Shopping": "🛍️",
  "Health": "💊",
  "Health & Medical": "💊",
  "Insurance": "🛡️",
  "Travel": "✈️",
  "Home": "🔨",
  "Income": "💰",
  "Other": "📦",
  "Others": "📦",
};

const categoryColors: Record<string, string> = {
  "Food & Drink": "#ec4899",
  "Housing": "#ef4444",
  "Utilities": "#8b5cf6",
  "Transportation": "#3b82f6",
  "Groceries": "#10b981",
  "Entertainment": "#6366f1",
  "Shopping": "#d946ef",
  "Health": "#14b8a6",
  "Health & Medical": "#14b8a6",
  "Insurance": "#10b981",
  "Travel": "#06b6d4",
  "Home": "#f59e0b",
  "Income": "#10b981",
  "Other": "#6b7280",
  "Others": "#6b7280",
};

export function Budgets() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, convertAndFormat, convertRaw } = useApp();
  const [screen, setScreen] = useState<BudgetScreen>("overview");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState({ category: "Groceries", amount: "" });
  const [editBudget, setEditBudget] = useState({ id: "", category: "Groceries", amount: "", color: "#3b82f6", icon: "🎯" });
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId) || budgets[0] || null;

  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7); // 'YYYY-MM'
  const currentMonthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(0, daysInMonth - currentDay);

  const totalBudgeted = budgets.reduce((s, b) => s + (Number(b.budgeted) || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (Number(b.spent) || 0), 0);

  const overBudgets = budgets.filter(b => (Number(b.spent) || 0) > (Number(b.budgeted) || 0));
  const nearLimitBudgets = budgets.filter(b => {
    const lim = Number(b.budgeted) || 1;
    const sp = Number(b.spent) || 0;
    const pct = sp / lim;
    return pct >= 0.75 && sp <= lim;
  });
  const onTrackBudgets = budgets.filter(b => {
    const lim = Number(b.budgeted) || 1;
    const sp = Number(b.spent) || 0;
    return sp / lim < 0.75;
  });

  // Calculate real AI suggested amount based on actual past spending in that category
  const getCategoryHistoryAvg = (catName: string) => {
    const pastTxExpenses = transactions.filter(t =>
      t.category.toLowerCase().trim() === catName.toLowerCase().trim() &&
      (t.type === "expense" || t.amount < 0)
    );
    if (pastTxExpenses.length === 0) return 300;
    const sum = pastTxExpenses.reduce((s, t) => s + Math.abs(t.amount), 0);
    // Rough estimate or monthly average
    return Math.max(50, Math.round(sum));
  };

  // Screen 15: Budget Overview
  if (screen === "overview") {
    const chartData = budgets.map(b => ({
      name: b.category,
      spent: Math.max(1, Math.round(convertRaw(Number(b.spent) || 0))),
      color: b.color || categoryColors[b.category] || "#3b82f6",
    }));

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Category Budgets</h2>
            <p className="text-muted-foreground text-xs">{currentMonthName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScreen("alerts")}
              className="relative w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              title="Budget Alerts"
            >
              🔔
              {overBudgets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {overBudgets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setBudgetError(null);
                setNewBudget({ category: "Groceries", amount: "" });
                setScreen("create");
              }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow hover:opacity-90 transition"
              title="Create Budget"
            >
              +
            </button>
          </div>
        </div>

        {/* Summary Donut & Quick Metrics */}
        {budgets.length > 0 ? (
          <Card className="flex flex-col items-center gap-4 py-6">
            <div className="relative">
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie
                    data={chartData.length > 0 && totalSpent > 0 ? chartData : [{ name: "Budget", spent: 1, color: "#3b82f6" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    dataKey="spent"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {(chartData.length > 0 && totalSpent > 0 ? chartData : [{ name: "Budget", spent: 1, color: "#3b82f6" }]).map((b, i) => (
                      <Cell key={`cell-${i}`} fill={b.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                <p className="font-mono text-base font-bold text-foreground truncate max-w-[130px]">
                  {convertAndFormat(totalSpent)}
                </p>
                <p className="text-muted-foreground text-xs font-medium">of {convertAndFormat(totalBudgeted)}</p>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="font-mono text-emerald-400 font-semibold">{onTrackBudgets.length}</p>
                <p className="text-muted-foreground text-xs">On Track</p>
              </div>
              <div className="border-l border-border" />
              <div>
                <p className="font-mono text-amber-400 font-semibold">{nearLimitBudgets.length}</p>
                <p className="text-muted-foreground text-xs">Near Limit</p>
              </div>
              <div className="border-l border-border" />
              <div>
                <p className="font-mono text-red-400 font-semibold">{overBudgets.length}</p>
                <p className="text-muted-foreground text-xs">Over Limit</p>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Budget list */}
        {budgets.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <p className="text-foreground font-semibold">No budgets created yet</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-xs">
                Set monthly spending limits for categories like Groceries, Dining, and Housing to automatically track expenses against your goals.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setBudgetError(null);
                setNewBudget({ category: "Groceries", amount: "" });
                setScreen("create");
              }}
              className="mt-2"
            >
              + Create Your First Budget
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {budgets.map(b => {
              const bLimit = Number(b.budgeted) || 1;
              const bSpent = Number(b.spent) || 0;
              const pct = (bSpent / bLimit) * 100;
              const isOver = bSpent > bLimit;
              const isNear = pct >= 75 && !isOver;
              const barColor = isOver ? "#ef4444" : isNear ? "#f59e0b" : (b.color || categoryColors[b.category] || "#10b981");

              return (
                <Card
                  key={b.id}
                  hover
                  onClick={() => {
                    setSelectedBudgetId(b.id);
                    setBudgetError(null);
                    setScreen("detail");
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0">{b.icon || categoryIcons[b.category] || "📊"}</span>
                      <span className="text-foreground text-sm font-semibold truncate">{b.category}</span>
                      {isOver && <Badge variant="danger">Exceeded</Badge>}
                      {isNear && <Badge variant="warning">{Math.round(pct)}% used</Badge>}
                      {!isOver && !isNear && <Badge variant="success">On Track</Badge>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-sm font-bold" style={{ color: isOver ? "#ef4444" : barColor }}>
                        {convertAndFormat(bSpent)}
                      </span>
                      <span className="text-muted-foreground text-xs font-mono"> / {convertAndFormat(bLimit)}</span>
                    </div>
                  </div>
                  <ProgressBar value={bSpent} max={bLimit} color={barColor} showLabel />
                  <div className="flex justify-between items-center text-xs mt-2 font-mono">
                    <span className={isOver ? "text-red-400 font-medium" : "text-muted-foreground"}>
                      {isOver
                        ? `+${convertAndFormat(bSpent - bLimit)} over limit`
                        : `${convertAndFormat(bLimit - bSpent)} remaining`}
                    </span>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {budgets.length > 0 && (
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setScreen("history")}>
              📅 View Budget History
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setScreen("alerts")}>
              🔔 View Alerts ({overBudgets.length + nearLimitBudgets.length})
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Screen 16: Create Budget
  if (screen === "create") {
    const handleCreate = async () => {
      const amt = parseFloat(newBudget.amount);
      if (isNaN(amt) || amt <= 0) {
        setBudgetError("Please enter a valid positive budget amount");
        return;
      }
      if (!newBudget.category.trim()) {
        setBudgetError("Please select a budget category");
        return;
      }

      setIsSubmitting(true);
      setBudgetError(null);

      try {
        const cat = newBudget.category.trim();
        const icon = categoryIcons[cat] || "🎯";
        const color = categoryColors[cat] || "#3b82f6";

        await addBudget({
          category: cat,
          budgeted: amt,
          period: currentMonthKey,
          icon,
          color,
        });

        setNewBudget({ category: "Groceries", amount: "" });
        setScreen("overview");
      } catch (err: any) {
        setBudgetError(err.message || "Failed to create budget");
      } finally {
        setIsSubmitting(false);
      }
    };

    const suggestedAmount = getCategoryHistoryAvg(newBudget.category);

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Create Category Budget</h2>
        </div>

        {budgetError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{budgetError}</span>
          </div>
        )}

        <div className="bg-secondary rounded-2xl p-6 text-center border border-border/40">
          <p className="text-muted-foreground text-sm mb-2">Monthly Budget Limit</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground text-3xl font-semibold">$</span>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="0"
              value={newBudget.amount}
              onChange={e => setNewBudget(p => ({ ...p, amount: e.target.value }))}
              className="bg-transparent text-4xl font-mono text-foreground font-extrabold w-48 text-center focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">{currentMonthName}</p>
        </div>

        <Select
          label="Category"
          value={newBudget.category}
          onChange={v => setNewBudget(p => ({ ...p, category: v }))}
          options={categories.map(c => ({ value: c, label: `${categoryIcons[c] || "📦"} ${c}` }))}
        />

        <Card className="border-primary/20 bg-primary/5">
          <p className="text-primary text-sm font-semibold mb-1">🤖 AI History Intelligence</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Based on your transactions history, we suggest a {convertAndFormat(suggestedAmount)}/month budget for {newBudget.category}.
          </p>
          <button
            type="button"
            className="text-primary text-xs font-semibold mt-2 hover:underline inline-block"
            onClick={() => {
              setNewBudget(p => ({ ...p, amount: String(Math.round(suggestedAmount)) }));
            }}
          >
            Use suggestion ({convertAndFormat(suggestedAmount)}) →
          </button>
        </Card>

        <Button
          fullWidth
          size="lg"
          disabled={!newBudget.amount || isSubmitting}
          onClick={handleCreate}
        >
          {isSubmitting ? "Creating Budget..." : "Create Budget"}
        </Button>
      </div>
    );
  }

  // Screen 17: Budget Detail
  if (screen === "detail") {
    if (!selectedBudget) {
      setScreen("overview");
      return null;
    }

    const b = selectedBudget;
    const bLimit = Number(b.budgeted) || 1;
    const bSpent = Number(b.spent) || 0;
    const pct = (bSpent / bLimit) * 100;
    const isOver = bSpent > bLimit;
    const barColor = isOver ? "#ef4444" : (b.color || categoryColors[b.category] || "#10b981");

    const dailyAvg = bSpent / Math.max(currentDay, 1);
    const projectedSpend = dailyAvg * daysInMonth;

    // Real transactions for this category in current month
    const categoryTransactions = transactions.filter(t =>
      t.category.toLowerCase().trim() === b.category.toLowerCase().trim() &&
      t.date?.startsWith(currentMonthKey) &&
      (t.type === "expense" || t.amount < 0)
    );

    const handleStartEdit = () => {
      setEditBudget({
        id: b.id,
        category: b.category,
        amount: String(b.budgeted),
        color: b.color || categoryColors[b.category] || "#3b82f6",
        icon: b.icon || categoryIcons[b.category] || "🎯",
      });
      setBudgetError(null);
      setScreen("edit");
    };

    const handleDelete = async () => {
      if (!window.confirm(`Are you sure you want to remove the budget for "${b.category}"? Your transactions will not be affected.`)) {
        return;
      }
      setIsSubmitting(true);
      setBudgetError(null);
      try {
        await deleteBudget(b.id);
        setScreen("overview");
      } catch (err: any) {
        setBudgetError(err.message || "Failed to delete budget");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold">{b.category} Budget</h2>
          <button onClick={handleStartEdit} className="ml-auto text-primary text-sm font-semibold hover:underline">
            Edit
          </button>
        </div>

        {budgetError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{budgetError}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 bg-secondary rounded-2xl p-6 border border-border/40">
          <span className="text-4xl">{b.icon || categoryIcons[b.category] || "🎯"}</span>
          <div className="w-full">
            <div className="flex justify-between mb-2 items-baseline">
              <span className="font-mono text-2xl font-bold" style={{ color: isOver ? "#ef4444" : barColor }}>
                {convertAndFormat(bSpent)}
              </span>
              <span className="text-muted-foreground font-mono text-sm">of {convertAndFormat(bLimit)}</span>
            </div>
            <ProgressBar value={bSpent} max={bLimit} color={barColor} />
            <div className="flex justify-between mt-2 font-mono text-xs">
              <span className="text-muted-foreground">{pct.toFixed(0)}% used</span>
              <span className={isOver ? "text-red-400 font-semibold" : "text-muted-foreground"}>
                {isOver ? `+${convertAndFormat(bSpent - bLimit)} over budget` : `${convertAndFormat(bLimit - bSpent)} left`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/30">
            <p className="text-[11px] text-muted-foreground">Daily Avg</p>
            <p className="font-mono text-xs text-foreground mt-0.5 font-bold truncate">
              {convertAndFormat(dailyAvg)}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/30">
            <p className="text-[11px] text-muted-foreground">Projected</p>
            <p className={`font-mono text-xs mt-0.5 font-bold truncate ${projectedSpend > bLimit ? "text-red-400" : "text-foreground"}`}>
              {convertAndFormat(projectedSpend)}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/30">
            <p className="text-[11px] text-muted-foreground">Days Left</p>
            <p className="font-mono text-xs text-foreground mt-0.5 font-bold">
              {daysLeft} days
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-foreground font-semibold mb-3">Recent Category Outflows ({currentMonthName})</h3>
          {categoryTransactions.length === 0 ? (
            <Card className="py-6 text-center text-muted-foreground text-xs">
              No expense transactions logged in "{b.category}" for this month.
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {categoryTransactions.map(tx => (
                <Card key={tx.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base flex-shrink-0">{tx.icon || b.icon || "💳"}</span>
                    <div className="truncate min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{tx.merchant || tx.title}</p>
                      <p className="text-muted-foreground text-xs">{tx.date} · {tx.account || "Account"}</p>
                    </div>
                  </div>
                  <span className="font-mono text-red-400 text-sm font-bold flex-shrink-0">
                    -{convertAndFormat(Math.abs(tx.amount))}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <Button variant="secondary" fullWidth onClick={handleStartEdit}>
            ✏️ Edit Limit
          </Button>
          <Button variant="danger" fullWidth onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "🗑️ Delete Budget"}
          </Button>
        </div>
      </div>
    );
  }

  // Screen 16.5: Edit Budget
  if (screen === "edit") {
    if (!selectedBudget) {
      setScreen("overview");
      return null;
    }

    const handleSaveEdit = async () => {
      const amt = parseFloat(editBudget.amount);
      if (isNaN(amt) || amt <= 0) {
        setBudgetError("Please enter a valid positive budget amount");
        return;
      }

      setIsSubmitting(true);
      setBudgetError(null);

      try {
        await updateBudget(editBudget.id, {
          budgeted: amt,
          category: editBudget.category.trim(),
          color: editBudget.color,
          icon: editBudget.icon,
        });
        setScreen("detail");
      } catch (err: any) {
        setBudgetError(err.message || "Failed to update budget");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("detail")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Edit Budget: {editBudget.category}</h2>
        </div>

        {budgetError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{budgetError}</span>
          </div>
        )}

        <div className="bg-secondary rounded-2xl p-6 text-center border border-border/40">
          <p className="text-muted-foreground text-sm mb-2">Monthly Budget Limit ($)</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground text-3xl font-semibold">$</span>
            <input
              type="number"
              step="1"
              min="1"
              value={editBudget.amount}
              onChange={e => setEditBudget(p => ({ ...p, amount: e.target.value }))}
              className="bg-transparent text-4xl font-mono text-foreground font-extrabold w-48 text-center focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <Input
          label="Category Name"
          value={editBudget.category}
          onChange={v => setEditBudget(p => ({ ...p, category: v }))}
        />

        <div className="flex gap-2">
          <Button fullWidth size="lg" disabled={!editBudget.amount || isSubmitting} onClick={handleSaveEdit} className="flex-1">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setScreen("detail")}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Screen 18: Budget History
  if (screen === "history") {
    // Generate past 5 months from real transactions
    const historyMonths = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const monthExpenses = transactions
        .filter(t => t.date?.startsWith(mKey) && (t.type === "expense" || t.amount < 0))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      historyMonths.push({
        month: label,
        spent: monthExpenses,
        limit: totalBudgeted > 0 ? totalBudgeted : 3000,
      });
    }

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Budget History</h2>
        </div>
        <div className="flex flex-col gap-3">
          {historyMonths.map((m) => {
            const isUnder = m.spent <= m.limit;
            return (
              <Card key={m.month} hover>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground text-sm font-medium">{m.month}</span>
                  <div className="flex gap-2 items-center">
                    <Badge variant={isUnder ? "success" : "danger"}>
                      {isUnder ? "Under budget" : "Over limit"}
                    </Badge>
                    <span className="font-mono text-sm text-foreground font-bold">
                      {convertAndFormat(m.spent)}
                    </span>
                  </div>
                </div>
                <ProgressBar value={m.spent} max={m.limit} color={isUnder ? "#10b981" : "#ef4444"} />
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Screen 19: Budget Alerts
  if (screen === "alerts") {
    const alerts: Array<{ budget: string; message: string; severity: "danger" | "warning" | "success"; icon: string }> = [];

    budgets.forEach(b => {
      const bLimit = Number(b.budgeted) || 1;
      const bSpent = Number(b.spent) || 0;
      const pct = Math.round((bSpent / bLimit) * 100);

      if (bSpent > bLimit) {
        alerts.push({
          budget: b.category,
          message: `Exceeded limit by ${convertAndFormat(bSpent - bLimit)} (${pct}% used)`,
          severity: "danger",
          icon: b.icon || categoryIcons[b.category] || "⚠️",
        });
      } else if (pct >= 90) {
        alerts.push({
          budget: b.category,
          message: `${pct}% of ${convertAndFormat(bLimit)} budget used (${convertAndFormat(bLimit - bSpent)} left)`,
          severity: "warning",
          icon: b.icon || categoryIcons[b.category] || "⚠️",
        });
      } else if (pct >= 75) {
        alerts.push({
          budget: b.category,
          message: `${pct}% of ${convertAndFormat(bLimit)} budget used — approaching limit`,
          severity: "warning",
          icon: b.icon || categoryIcons[b.category] || "📊",
        });
      } else {
        alerts.push({
          budget: b.category,
          message: `${pct}% of ${convertAndFormat(bLimit)} budget used — on track`,
          severity: "success",
          icon: b.icon || categoryIcons[b.category] || "🛒",
        });
      }
    });

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Budget Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <Card className="py-10 text-center text-muted-foreground text-sm">
            No active budget alerts. Create category budgets to monitor spending limits.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map(a => (
              <Card key={a.budget}>
                <div className="flex gap-3 items-center">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">{a.budget}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{a.message}</p>
                  </div>
                  <Badge variant={a.severity} className="flex-shrink-0">
                    {a.severity === "danger" ? "Critical" : a.severity === "warning" ? "Warning" : "Good"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
