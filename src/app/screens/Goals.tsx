import { useState } from "react";
import { Card, Badge, Button, Input, ProgressBar } from "../components/ui";
import { mockGoals } from "../data/mockData";
import { useApp } from "../context/AppContext";

type GoalScreen = "overview" | "create" | "detail" | "challenges";

export function Goals() {
  const { convertAndFormat, addNotification } = useApp();
  const [screen, setScreen] = useState<GoalScreen>("overview");
  const [goals, setGoals] = useState(mockGoals);
  const [selected, setSelected] = useState(mockGoals[0]);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", deadline: "" });

  // Screen 39: Goals Overview
  if (screen === "overview") {
    const totalSaved = goals.reduce((s, g) => s + g.current, 0);
    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Goals</h2>
          <div className="flex gap-2">
            <button onClick={() => setScreen("challenges")} className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground">Challenges</button>
            <button onClick={() => setScreen("create")} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">+</button>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex items-center gap-4 animate-fade-in" style={{ background: "linear-gradient(135deg, #090d16 0%, #111827 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex-1">
            <p className="text-muted-foreground text-xs mb-1">Total across {goals.length} goals</p>
            <p className="font-mono text-2xl text-foreground font-extrabold">{convertAndFormat(totalSaved)}</p>
            <p className="text-muted-foreground text-xs">of {convertAndFormat(totalTarget)} total</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
              <circle
                cx="28" cy="28" r="22" fill="none"
                stroke="#6366f1" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 22 * totalSaved / totalTarget} ${2 * Math.PI * 22}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono text-primary">{Math.round(totalSaved / totalTarget * 100)}%</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {goals.map(goal => {
            const pct = (goal.current / goal.target) * 100;
            return (
              <Card key={goal.id} hover onClick={() => { setSelected(goal); setScreen("detail"); }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground">{goal.name}</p>
                      <p className="text-muted-foreground text-xs">{goal.deadline}</p>
                    </div>
                    <p className="font-mono text-sm mt-0.5" style={{ color: goal.color }}>
                      {convertAndFormat(goal.current)} <span className="text-muted-foreground">/ {convertAndFormat(goal.target)}</span>
                    </p>
                  </div>
                </div>
                <ProgressBar value={goal.current} max={goal.target} color={goal.color} showLabel />
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Screen 40: Create Goal
  if (screen === "create") {
    const presets = [
      { name: "Emergency Fund", icon: "🛡️", target: 15000 },
      { name: "Vacation", icon: "✈️", target: 3000 },
      { name: "New Car", icon: "🚗", target: 25000 },
      { name: "Home Down Payment", icon: "🏡", target: 60000 },
    ];

    const handleCreate = () => {
      const targetVal = parseFloat(newGoal.target);
      if (!newGoal.name || isNaN(targetVal) || targetVal <= 0) return;

      const randomPreset = presets.find(p => p.name === newGoal.name);
      const icon = randomPreset?.icon || "🎯";

      const createdGoal = {
        id: "goal_" + Date.now(),
        name: newGoal.name,
        target: targetVal,
        current: 0,
        deadline: newGoal.deadline ? new Date(newGoal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Dec 2026",
        icon,
        color: "#6366f1"
      };

      setGoals(prev => [...prev, createdGoal]);
      addNotification({
        id: "notif_goal_" + Date.now(),
        type: "success",
        message: `🎯 Created new goal: ${newGoal.name}! Target set to ${convertAndFormat(targetVal)}.`,
        time: "Just now",
        read: false,
      });

      setNewGoal({ name: "", target: "", deadline: "" });
      setScreen("overview");
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Create Goal</h2>
        </div>
        <div>
          <p className="text-muted-foreground text-sm mb-3">Quick presets</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <Card
                key={p.name}
                hover
                onClick={() => setNewGoal(prev => ({ ...prev, name: p.name, target: String(p.target) }))}
                className={`flex items-center gap-2 py-3 ${newGoal.name === p.name ? "border-primary/60 bg-primary/10" : ""}`}
              >
                <span className="text-xl">{p.icon}</span>
                <div>
                  <p className="text-foreground text-sm font-semibold">{p.name}</p>
                  <p className="text-muted-foreground text-xs font-mono">{convertAndFormat(p.target)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Input label="Goal Name" placeholder="What are you saving for?" value={newGoal.name} onChange={v => setNewGoal(p => ({ ...p, name: v }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Target Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                placeholder="10,000"
                value={newGoal.target}
                onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-lg py-2.5 pl-7 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Target Date</label>
            <input type="date" value={newGoal.deadline} onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))} className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/60" />
          </div>
        </div>
        {newGoal.name && newGoal.target && newGoal.deadline && (
          <Card className="border-primary/20 bg-primary/5">
            <p className="text-primary text-sm font-medium mb-1">🤖 AI Recommendation</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To reach {convertAndFormat(parseFloat(newGoal.target))} by {new Date(newGoal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}, save approximately <span className="text-foreground font-semibold">{convertAndFormat(Math.ceil(parseFloat(newGoal.target) / 12))}/month</span>.
            </p>
          </Card>
        )}
        <Button fullWidth size="lg" disabled={!newGoal.name || !newGoal.target} onClick={handleCreate}>
          Create Goal
        </Button>
      </div>
    );
  }

  // Screen 41: Goal Detail
  if (screen === "detail") {
    const g = selected;
    const pct = (g.current / g.target) * 100;
    const monthlyNeeded = Math.ceil((g.target - g.current) / 6);
    const contributions = [
      { date: "Jun 11", amount: 400, note: "Auto-transfer" },
      { date: "May 11", amount: 400, note: "Auto-transfer" },
      { date: "Apr 11", amount: 350, note: "Auto-transfer" },
      { date: "Mar 11", amount: 400, note: "Auto-transfer" },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-semibold">{g.name}</h2>
          <button className="ml-auto text-primary text-sm font-semibold">Edit</button>
        </div>
        <div className="flex flex-col items-center py-8 bg-secondary rounded-2xl gap-4">
          <span className="text-5xl">{g.icon}</span>
          <div className="text-center">
            <p className="font-mono text-4xl font-extrabold" style={{ color: g.color }}>{convertAndFormat(g.current)}</p>
            <p className="text-muted-foreground text-sm font-medium">of {convertAndFormat(g.target)} goal</p>
          </div>
          <div className="w-48">
            <ProgressBar value={g.current} max={g.target} color={g.color} showLabel />
          </div>
          <Badge variant="neutral">Due {g.deadline}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Remaining", value: convertAndFormat(g.target - g.current) },
            { label: "Need/mo", value: convertAndFormat(monthlyNeeded) },
            { label: "On Track", value: pct > 15 ? "✅ Yes" : "⚠️ No" },
          ].map(s => (
            <Card key={s.label} className="text-center py-3">
              <p className="text-muted-foreground text-xs font-semibold">{s.label}</p>
              <p className="text-foreground text-xs font-extrabold mt-1 font-mono">{s.value}</p>
            </Card>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground font-semibold text-sm">Contributions</h3>
            <Button size="sm" onClick={() => {}}>Add Funds</Button>
          </div>
          {contributions.map((c, i) => (
            <Card key={i} className="flex items-center justify-between py-2.5 mb-2">
              <div>
                <p className="text-foreground text-sm font-semibold">{c.note}</p>
                <p className="text-muted-foreground text-xs">{c.date}</p>
              </div>
              <span className="font-mono text-emerald-400 text-sm font-bold">+{convertAndFormat(c.amount)}</span>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 42: Savings Challenges
  if (screen === "challenges") {
    const challenges = [
      { name: "52-Week Challenge", desc: "Save $1 in week 1, $2 in week 2... ending with $1,378 saved!", progress: 23, total: 52, reward: "$1,378", icon: "📅", joined: true },
      { name: "No-Spend Weekend", desc: "Spend $0 every Saturday/Sunday this month.", progress: 2, total: 4, reward: "Badge", icon: "🎯", joined: true },
      { name: "$5 Bill Challenge", desc: "Save every $5 bill you receive. Build a cash reserve.", progress: 0, total: 0, reward: "Variable", icon: "💵", joined: false },
      { name: "1% Raise Challenge", desc: "Save 1% more of income each month for a year.", progress: 0, total: 12, reward: "+12% savings", icon: "📈", joined: false },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Savings Challenges</h2>
        </div>
        <div className="flex flex-col gap-3">
          {challenges.map(c => (
            <Card key={c.name}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground font-medium">{c.name}</p>
                    {c.joined ? <Badge variant="primary">Active</Badge> : <Badge variant="neutral">Join</Badge>}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{c.desc}</p>
                  {c.joined && c.total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Week {c.progress}</span>
                        <span>{c.total} weeks</span>
                      </div>
                      <ProgressBar value={c.progress} max={c.total} color="#6366f1" />
                    </div>
                  )}
                  <p className="text-emerald-400 text-xs mt-2">💰 Reward: {c.reward}</p>
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
