import { useState } from "react";
import { Card, Badge, Button, Input, Select, ProgressBar } from "../components/ui";
import { useApp, Goal } from "../context/AppContext";

type GoalScreen = "overview" | "create" | "detail" | "edit" | "challenges";

const goalPresets = [
  { name: "Emergency Fund", icon: "🛡️", target: 15000, category: "Emergency", color: "#10b981" },
  { name: "Dream Vacation", icon: "✈️", target: 5000, category: "Travel", color: "#06b6d4" },
  { name: "New Vehicle", icon: "🚗", target: 25000, category: "Vehicle", color: "#3b82f6" },
  { name: "Home Down Payment", icon: "🏡", target: 60000, category: "Real Estate", color: "#8b5cf6" },
  { name: "Higher Education", icon: "🎓", target: 20000, category: "Education", color: "#f59e0b" },
  { name: "Gadgets & Tech", icon: "💻", target: 3000, category: "Personal", color: "#ec4899" },
];

const goalCategories = [
  { value: "Emergency", label: "🛡️ Emergency Fund" },
  { value: "Travel", label: "✈️ Travel & Vacation" },
  { value: "Vehicle", label: "🚗 Vehicle & Transport" },
  { value: "Real Estate", label: "🏡 Real Estate & Home" },
  { value: "Education", label: "🎓 Education & Learning" },
  { value: "Personal", label: "💻 Personal & Lifestyle" },
  { value: "Savings", label: "🎯 General Savings" },
];

export function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, convertAndFormat, addNotification } = useApp();
  const [screen, setScreen] = useState<GoalScreen>("overview");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    category: "Savings",
    description: "",
    icon: "🎯",
    color: "#10b981",
  });

  const [editGoal, setEditGoal] = useState({
    id: "",
    name: "",
    target: "",
    current: "",
    deadline: "",
    category: "Savings",
    description: "",
    icon: "🎯",
    color: "#10b981",
  });

  const [contributionAmount, setContributionAmount] = useState("");
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [contributionType, setContributionType] = useState<"add" | "withdraw">("add");
  const [goalError, setGoalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Challenges state (interactive)
  const [challenges, setChallenges] = useState([
    { id: "c1", name: "52-Week Challenge", desc: "Save $1 in week 1, $2 in week 2... ending with $1,378 saved!", progress: 24, total: 52, reward: "$1,378", icon: "📅", joined: true },
    { id: "c2", name: "No-Spend Weekend", desc: "Spend $0 every Saturday/Sunday this month on non-essentials.", progress: 3, total: 4, reward: "Discipline Badge", icon: "🎯", joined: true },
    { id: "c3", name: "$5 Bill Challenge", desc: "Save every physical or digital $5 reward received into savings.", progress: 12, total: 20, reward: "Cash Cushion", icon: "💵", joined: false },
    { id: "c4", name: "1% Raise Challenge", desc: "Save 1% more of income each month towards your top goal.", progress: 4, total: 12, reward: "+12% Growth", icon: "📈", joined: false },
  ]);

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || goals[0] || null;

  // Helper calculations for any goal
  const computeGoalMetrics = (g: Goal) => {
    const target = Number(g.target) || 1;
    const current = Number(g.current) || 0;
    const pct = Math.min(100, Math.max(0, (current / target) * 100));
    const remaining = Math.max(0, target - current);

    let daysRemaining = 0;
    let hasDeadline = false;
    if (g.deadline) {
      const d = new Date(g.deadline);
      if (!isNaN(d.getTime())) {
        hasDeadline = true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        const diffMs = d.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    }

    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    const monthlySavingNeeded = daysRemaining <= 0 || remaining <= 0 ? 0 : Math.ceil(remaining / monthsRemaining);
    const dailySavingNeeded = daysRemaining <= 0 || remaining <= 0 ? 0 : Math.ceil(remaining / daysRemaining);

    let status: "Completed" | "Overdue" | "At Risk" | "On Track" = "On Track";
    let badgeVariant: "success" | "danger" | "warning" | "primary" = "primary";

    if (current >= target) {
      status = "Completed";
      badgeVariant = "success";
    } else if (hasDeadline && daysRemaining < 0) {
      status = "Overdue";
      badgeVariant = "danger";
    } else if (hasDeadline && ((daysRemaining <= 30 && pct < 50) || (daysRemaining <= 60 && pct < 25))) {
      status = "At Risk";
      badgeVariant = "warning";
    } else {
      status = "On Track";
      badgeVariant = "success";
    }

    return {
      target,
      current,
      pct,
      remaining,
      daysRemaining,
      hasDeadline,
      monthsRemaining,
      monthlySavingNeeded,
      dailySavingNeeded,
      status,
      badgeVariant,
    };
  };

  const totalSaved = goals.reduce((s, g) => s + (Number(g.current) || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (Number(g.target) || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  const completedCount = goals.filter(g => (Number(g.current) || 0) >= (Number(g.target) || 1)).length;
  const atRiskCount = goals.filter(g => {
    const m = computeGoalMetrics(g);
    return m.status === "At Risk" || m.status === "Overdue";
  }).length;
  const onTrackCount = goals.filter(g => {
    const m = computeGoalMetrics(g);
    return m.status === "On Track";
  }).length;

  // Screen 1: Goals Overview
  if (screen === "overview") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Financial Goals</h2>
            <p className="text-muted-foreground text-xs">Set and track milestone savings</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScreen("challenges")}
              className="px-3 py-1.5 bg-secondary border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              🏆 Challenges
            </button>
            <button
              onClick={() => {
                setGoalError(null);
                setNewGoal({
                  name: "",
                  target: "",
                  current: "",
                  deadline: "",
                  category: "Savings",
                  description: "",
                  icon: "🎯",
                  color: "#10b981",
                });
                setScreen("create");
              }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow hover:opacity-90 transition"
              title="Create Goal"
            >
              +
            </button>
          </div>
        </div>

        {/* Overall Progress Banner */}
        {goals.length > 0 && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4 animate-fade-in shadow-md"
            style={{
              background: "linear-gradient(135deg, #090d16 0%, #111827 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex-1">
              <p className="text-muted-foreground text-xs mb-1 font-medium">Total Saved across {goals.length} Goals</p>
              <p className="font-mono text-2xl text-foreground font-extrabold">{convertAndFormat(totalSaved)}</p>
              <p className="text-muted-foreground text-xs mt-0.5">of {convertAndFormat(totalTarget)} target</p>
            </div>
            <div className="w-16 h-16 relative flex-shrink-0">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeDasharray={`${(2 * Math.PI * 22 * overallPct) / 100} ${2 * Math.PI * 22}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-emerald-400">{overallPct}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick status counter pills */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
              <p className="font-mono text-base font-bold text-emerald-400">{completedCount}</p>
              <p className="text-[11px] text-muted-foreground">Completed</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
              <p className="font-mono text-base font-bold text-indigo-400">{onTrackCount}</p>
              <p className="text-[11px] text-muted-foreground">On Track</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
              <p className="font-mono text-base font-bold text-amber-400">{atRiskCount}</p>
              <p className="text-[11px] text-muted-foreground">At Risk / Overdue</p>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl">🎯</span>
            <div>
              <p className="text-foreground font-semibold">No financial goals yet</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-xs leading-relaxed">
                Set target savings goals for vacations, emergency funds, or big purchases to track your progress automatically.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setGoalError(null);
                setNewGoal({
                  name: "",
                  target: "",
                  current: "",
                  deadline: "",
                  category: "Savings",
                  description: "",
                  icon: "🎯",
                  color: "#10b981",
                });
                setScreen("create");
              }}
              className="mt-2"
            >
              + Create Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map(g => {
              const m = computeGoalMetrics(g);
              return (
                <Card
                  key={g.id}
                  hover
                  onClick={() => {
                    setSelectedGoalId(g.id);
                    setGoalError(null);
                    setScreen("detail");
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">{g.icon || "🎯"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-foreground text-sm font-semibold truncate">{g.name}</p>
                        <Badge variant={m.badgeVariant} className="flex-shrink-0">
                          {m.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-mono text-sm font-bold" style={{ color: g.color || "#10b981" }}>
                          {convertAndFormat(m.current)}{" "}
                          <span className="text-muted-foreground text-xs font-normal">/ {convertAndFormat(m.target)}</span>
                        </p>
                        <p className="text-muted-foreground text-xs font-mono">
                          {m.hasDeadline
                            ? m.daysRemaining >= 0
                              ? `${m.daysRemaining}d left`
                              : "Overdue"
                            : "No deadline"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ProgressBar value={m.current} max={m.target} color={g.color || "#10b981"} showLabel />
                  <div className="flex justify-between items-center text-xs mt-2 text-muted-foreground font-mono">
                    <span>
                      {m.current >= m.target
                        ? "🎉 Goal Reached!"
                        : `${convertAndFormat(m.remaining)} remaining`}
                    </span>
                    <span>{m.pct.toFixed(0)}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Screen 2: Create Goal
  if (screen === "create") {
    const handleCreate = async () => {
      const targetVal = parseFloat(newGoal.target);
      if (!newGoal.name.trim()) {
        setGoalError("Please enter a goal name");
        return;
      }
      if (isNaN(targetVal) || targetVal <= 0) {
        setGoalError("Target amount must be a positive number greater than zero");
        return;
      }

      const initialVal = newGoal.current ? parseFloat(newGoal.current) : 0;
      if (isNaN(initialVal) || initialVal < 0) {
        setGoalError("Initial saved amount cannot be negative");
        return;
      }

      setIsSubmitting(true);
      setGoalError(null);

      try {
        await addGoal({
          name: newGoal.name.trim(),
          target: targetVal,
          current: initialVal,
          deadline: newGoal.deadline || undefined,
          category: newGoal.category,
          description: newGoal.description.trim(),
          icon: newGoal.icon || "🎯",
          color: newGoal.color || "#10b981",
        });

        addNotification({
          id: "notif_goal_" + Date.now(),
          type: "success",
          message: `🎯 Created goal "${newGoal.name}" with target ${convertAndFormat(targetVal)}!`,
          time: "Just now",
          read: false,
        });

        setScreen("overview");
      } catch (err: any) {
        setGoalError(err.message || "Failed to create goal");
      } finally {
        setIsSubmitting(false);
      }
    };

    const targetVal = parseFloat(newGoal.target) || 0;
    let daysToDate = 0;
    if (newGoal.deadline) {
      const d = new Date(newGoal.deadline);
      if (!isNaN(d.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        daysToDate = Math.max(1, Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      }
    }
    const monthsToDate = Math.max(1, Math.ceil(daysToDate / 30));
    const projectedMonthly = targetVal > 0 && monthsToDate > 0 ? Math.ceil(targetVal / monthsToDate) : 0;

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold">Create Financial Goal</h2>
        </div>

        {goalError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{goalError}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <p className="text-muted-foreground text-xs font-medium mb-2">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            {goalPresets.map(p => (
              <Card
                key={p.name}
                hover
                onClick={() => {
                  setNewGoal(prev => ({
                    ...prev,
                    name: p.name,
                    target: String(p.target),
                    category: p.category,
                    icon: p.icon,
                    color: p.color,
                  }));
                }}
                className={`flex items-center gap-2.5 py-2.5 cursor-pointer ${
                  newGoal.name === p.name ? "border-primary/60 bg-primary/10" : ""
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <div className="truncate min-w-0">
                  <p className="text-foreground text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-muted-foreground text-[11px] font-mono">{convertAndFormat(p.target)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Goal Name *"
            placeholder="e.g. Emergency Fund, Summer Trip"
            value={newGoal.name}
            onChange={v => setNewGoal(p => ({ ...p, name: v }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Target Amount ($) *</label>
              <input
                type="number"
                min="1"
                placeholder="10,000"
                value={newGoal.target}
                onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Initial Saved ($)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={newGoal.current}
                onChange={e => setNewGoal(p => ({ ...p, current: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Target Deadline</label>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
              className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/60"
            />
          </div>

          <Select
            label="Category"
            value={newGoal.category}
            onChange={v => setNewGoal(p => ({ ...p, category: v }))}
            options={goalCategories}
          />

          <Input
            label="Description / Motivation (Optional)"
            placeholder="Why is this goal important to you?"
            value={newGoal.description}
            onChange={v => setNewGoal(p => ({ ...p, description: v }))}
          />
        </div>

        {newGoal.name && targetVal > 0 && newGoal.deadline && (
          <Card className="border-primary/20 bg-primary/5">
            <p className="text-primary text-xs font-semibold mb-1">🤖 AI Milestone Calculation</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              To reach <span className="text-foreground font-bold">{convertAndFormat(targetVal)}</span> by{" "}
              {new Date(newGoal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}, you should save approximately{" "}
              <span className="text-emerald-400 font-bold">{convertAndFormat(projectedMonthly)}/month</span> ({daysToDate} days remaining).
            </p>
          </Card>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!newGoal.name || !newGoal.target || isSubmitting}
          onClick={handleCreate}
        >
          {isSubmitting ? "Creating Goal..." : "Create Goal"}
        </Button>
      </div>
    );
  }

  // Screen 3: Goal Detail
  if (screen === "detail") {
    if (!selectedGoal) {
      setScreen("overview");
      return null;
    }

    const g = selectedGoal;
    const m = computeGoalMetrics(g);

    const handleSaveContribution = async () => {
      const amt = parseFloat(contributionAmount);
      if (isNaN(amt) || amt <= 0) {
        setGoalError("Please enter a valid contribution amount greater than zero");
        return;
      }

      setIsSubmitting(true);
      setGoalError(null);

      try {
        const newCurrent = contributionType === "add"
          ? (Number(g.current) || 0) + amt
          : Math.max(0, (Number(g.current) || 0) - amt);

        await updateGoal(g.id, { current: newCurrent });

        addNotification({
          id: "notif_contrib_" + Date.now(),
          type: "success",
          message: contributionType === "add"
            ? `💰 Added ${convertAndFormat(amt)} to "${g.name}" goal!`
            : `💸 Withdrew ${convertAndFormat(amt)} from "${g.name}" goal.`,
          time: "Just now",
          read: false,
        });

        setContributionAmount("");
        setIsContributionModalOpen(false);
      } catch (err: any) {
        setGoalError(err.message || "Failed to update contribution");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDeleteGoal = async () => {
      if (!window.confirm(`Are you sure you want to permanently delete the goal "${g.name}"?`)) {
        return;
      }

      setIsSubmitting(true);
      setGoalError(null);

      try {
        await deleteGoal(g.id);
        setScreen("overview");
      } catch (err: any) {
        setGoalError(err.message || "Failed to delete goal");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleStartEdit = () => {
      setEditGoal({
        id: g.id,
        name: g.name,
        target: String(g.target),
        current: String(g.current),
        deadline: g.deadline || "",
        category: g.category || "Savings",
        description: g.description || "",
        icon: g.icon || "🎯",
        color: g.color || "#10b981",
      });
      setGoalError(null);
      setScreen("edit");
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold truncate">{g.name}</h2>
          <button onClick={handleStartEdit} className="ml-auto text-primary text-sm font-semibold hover:underline">
            Edit
          </button>
        </div>

        {goalError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{goalError}</span>
          </div>
        )}

        {/* Hero Card */}
        <div className="flex flex-col items-center py-7 bg-secondary rounded-2xl gap-4 border border-border/40 text-center px-4">
          <span className="text-5xl">{g.icon || "🎯"}</span>
          <div>
            <p className="font-mono text-3xl font-extrabold" style={{ color: g.color || "#10b981" }}>
              {convertAndFormat(m.current)}
            </p>
            <p className="text-muted-foreground text-xs font-medium mt-0.5">of {convertAndFormat(m.target)} target</p>
          </div>
          <div className="w-full max-w-xs">
            <ProgressBar value={m.current} max={m.target} color={g.color || "#10b981"} showLabel />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={m.badgeVariant}>{m.status}</Badge>
            {m.hasDeadline && (
              <Badge variant="neutral">
                Target: {new Date(g.deadline!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Badge>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
            <p className="text-[11px] text-muted-foreground">Remaining</p>
            <p className="font-mono text-xs text-foreground mt-1 font-bold truncate">
              {convertAndFormat(m.remaining)}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
            <p className="text-[11px] text-muted-foreground">Monthly Need</p>
            <p className="font-mono text-xs text-emerald-400 mt-1 font-bold truncate">
              {convertAndFormat(m.monthlySavingNeeded)}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
            <p className="text-[11px] text-muted-foreground">Time Left</p>
            <p className="font-mono text-xs text-foreground mt-1 font-bold truncate">
              {m.hasDeadline ? (m.daysRemaining >= 0 ? `${m.daysRemaining} days` : "Overdue") : "Flexible"}
            </p>
          </div>
        </div>

        {/* Quick Contribution Action */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm font-semibold">Goal Balance & Contributions</p>
              <p className="text-muted-foreground text-xs">Directly adjust your saved amount</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setContributionType("withdraw");
                  setContributionAmount("");
                  setIsContributionModalOpen(true);
                }}
              >
                Withdraw
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setContributionType("add");
                  setContributionAmount("");
                  setIsContributionModalOpen(true);
                }}
              >
                + Add Funds
              </Button>
            </div>
          </div>

          {isContributionModalOpen && (
            <div className="p-4 bg-background/80 rounded-xl border border-primary/30 flex flex-col gap-3 mt-2">
              <p className="text-foreground text-xs font-semibold">
                {contributionType === "add" ? "Deposit Contribution" : "Withdraw / Adjust Saved Funds"}
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Amount ($)"
                  value={contributionAmount}
                  onChange={e => setContributionAmount(e.target.value)}
                  className="flex-1 bg-input-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                />
                <Button size="sm" onClick={handleSaveContribution} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Confirm"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsContributionModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {g.description && (
          <Card>
            <p className="text-foreground text-xs font-semibold mb-1">Notes & Motivation</p>
            <p className="text-muted-foreground text-xs leading-relaxed">{g.description}</p>
          </Card>
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="secondary" fullWidth onClick={handleStartEdit}>
            ✏️ Edit Goal
          </Button>
          <Button variant="danger" fullWidth onClick={handleDeleteGoal} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "🗑️ Delete Goal"}
          </Button>
        </div>
      </div>
    );
  }

  // Screen 4: Edit Goal
  if (screen === "edit") {
    if (!selectedGoal) {
      setScreen("overview");
      return null;
    }

    const handleSaveEdit = async () => {
      const targetVal = parseFloat(editGoal.target);
      if (!editGoal.name.trim()) {
        setGoalError("Goal name is required");
        return;
      }
      if (isNaN(targetVal) || targetVal <= 0) {
        setGoalError("Target amount must be greater than zero");
        return;
      }

      const currentVal = parseFloat(editGoal.current) || 0;
      if (isNaN(currentVal) || currentVal < 0) {
        setGoalError("Current amount cannot be negative");
        return;
      }

      setIsSubmitting(true);
      setGoalError(null);

      try {
        await updateGoal(editGoal.id, {
          name: editGoal.name.trim(),
          target: targetVal,
          current: currentVal,
          deadline: editGoal.deadline || undefined,
          category: editGoal.category,
          description: editGoal.description.trim(),
          icon: editGoal.icon,
          color: editGoal.color,
        });

        setScreen("detail");
      } catch (err: any) {
        setGoalError(err.message || "Failed to update goal");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("detail")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold truncate">Edit Goal: {editGoal.name}</h2>
        </div>

        {goalError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{goalError}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="Goal Name"
            value={editGoal.name}
            onChange={v => setEditGoal(p => ({ ...p, name: v }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Target Amount ($)</label>
              <input
                type="number"
                min="1"
                value={editGoal.target}
                onChange={e => setEditGoal(p => ({ ...p, target: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Current Amount ($)</label>
              <input
                type="number"
                min="0"
                value={editGoal.current}
                onChange={e => setEditGoal(p => ({ ...p, current: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Target Deadline</label>
            <input
              type="date"
              value={editGoal.deadline}
              onChange={e => setEditGoal(p => ({ ...p, deadline: e.target.value }))}
              className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/60"
            />
          </div>

          <Select
            label="Category"
            value={editGoal.category}
            onChange={v => setEditGoal(p => ({ ...p, category: v }))}
            options={goalCategories}
          />

          <Input
            label="Description"
            value={editGoal.description}
            onChange={v => setEditGoal(p => ({ ...p, description: v }))}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <Button fullWidth size="lg" disabled={!editGoal.name || !editGoal.target || isSubmitting} onClick={handleSaveEdit}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setScreen("detail")}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Screen 5: Savings Challenges
  if (screen === "challenges") {
    const toggleJoinChallenge = (id: string) => {
      setChallenges(prev =>
        prev.map(c => (c.id === id ? { ...c, joined: !c.joined } : c))
      );
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <div>
            <h2 className="text-xl font-bold">Savings Challenges</h2>
            <p className="text-muted-foreground text-xs">Gamified habits to accelerate your goals</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {challenges.map(c => (
            <Card key={c.id}>
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground text-sm font-semibold">{c.name}</p>
                    <button
                      onClick={() => toggleJoinChallenge(c.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                        c.joined
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      {c.joined ? "Active" : "+ Join"}
                    </button>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{c.desc}</p>
                  {c.joined && c.total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground font-mono mb-1">
                        <span>Milestone {c.progress}</span>
                        <span>{c.total} steps</span>
                      </div>
                      <ProgressBar value={c.progress} max={c.total} color="#6366f1" />
                    </div>
                  )}
                  <p className="text-emerald-400 text-xs mt-2.5 font-medium">💰 Reward: {c.reward}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
