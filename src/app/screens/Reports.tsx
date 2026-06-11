import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, Badge, Button, Select } from "../components/ui";
import { mockSpendingByMonth, mockCategoryBreakdown } from "../data/mockData";
import { useApp } from "../context/AppContext";

type ReportScreen = "home" | "monthly" | "category" | "yearreview" | "custom";

export function Reports() {
  const { convertAndFormat, addNotification, currency } = useApp();
  const [screen, setScreen] = useState<ReportScreen>("home");
  const [customStart, setCustomStart] = useState("2026-01-01");
  const [customEnd, setCustomEnd] = useState("2026-06-11");
  const [customCat, setCustomCat] = useState("All");

  const triggerExport = (formatType: "PDF" | "Excel" | "CSV") => {
    addNotification({
      id: "notif_export_" + Date.now(),
      type: "insight",
      message: `📥 spendwise_report_${Date.now().toString().slice(-4)}.${formatType.toLowerCase() === "excel" ? "xlsx" : formatType.toLowerCase()} downloaded successfully in ${currency}!`,
      time: "Just now",
      read: false,
    });
  };

  // Screen 25: Reports Home
  if (screen === "home") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Reports</h2>
          <button onClick={() => setScreen("custom")} className="text-primary text-sm font-semibold">Custom →</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "📅", title: "Monthly Report", desc: "June spending breakdown", screen: "monthly" as ReportScreen },
            { icon: "🥧", title: "Category Report", desc: "By spending category", screen: "category" as ReportScreen },
            { icon: "🌟", title: "Year in Review", desc: "2026 financial summary", screen: "yearreview" as ReportScreen },
            { icon: "🔧", title: "Custom Report", desc: "Build your own view", screen: "custom" as ReportScreen },
          ].map(r => (
            <Card key={r.title} hover onClick={() => setScreen(r.screen)} className="flex flex-col gap-2 py-5">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <p className="text-foreground text-sm font-semibold">{r.title}</p>
                <p className="text-muted-foreground text-xs">{r.desc}</p>
              </div>
            </Card>
          ))}
        </div>
        {/* Quick Stats */}
        <div>
          <h3 className="text-foreground mb-3 font-semibold text-sm">2026 at a Glance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Income", value: convertAndFormat(26650), color: "#10b981" },
              { label: "Total Expenses", value: convertAndFormat(17920), color: "#ef4444" },
              { label: "Net Savings", value: convertAndFormat(8730), color: "#6366f1" },
              { label: "Savings Rate", value: "32.8%", color: "#f59e0b" },
            ].map(s => (
              <Card key={s.label}>
                <p className="text-muted-foreground text-xs">{s.label}</p>
                <p className="font-mono text-base font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </Card>
            ))}
          </div>
        </div>
        <Card>
          <p className="text-foreground text-sm font-medium mb-3">Monthly Trend (2026)</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSpendingByMonth} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <XAxis dataKey="month" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="expenses" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  }

  // Screen 26: Monthly Report
  if (screen === "monthly") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">June 2026 Report</h2>
          <button onClick={() => triggerExport("PDF")} className="ml-auto text-primary text-sm font-semibold hover:underline">Export PDF</button>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #0f1628 0%, #1a2035 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-muted-foreground text-sm mb-4">Monthly Summary</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Income", value: convertAndFormat(4300), color: "#10b981" },
              { label: "Expenses", value: convertAndFormat(2723), color: "#ef4444" },
              { label: "Saved", value: convertAndFormat(1577), color: "#6366f1" },
            ].map(s => (
              <div key={s.label} className="text-center w-full">
                <p className="font-mono text-base font-bold truncate" style={{ color: s.color }}>{s.value}</p>
                <p className="text-muted-foreground text-[10px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Card>
          <p className="text-foreground text-sm mb-3 font-medium">Spending by Week</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { week: "Wk 1", amount: 623 },
                { week: "Wk 2", amount: 741 },
                { week: "Wk 3", amount: 892 },
                { week: "Wk 4 (so far)", amount: 467 },
              ]} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="week" tick={{ fill: "#6b7494", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {[623, 741, 892, 467].map((_, i) => (
                    <Cell key={i} fill={i === 2 ? "#ef4444" : "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div>
          <h3 className="text-foreground mb-3 font-semibold text-sm">Top Spending Categories</h3>
          <div className="flex flex-col gap-2">
            {mockCategoryBreakdown.slice(0, 5).map(cat => (
              <Card key={cat.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-foreground text-sm font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(cat.value / 2723) * 100}%`, backgroundColor: cat.color }} />
                  </div>
                  <span className="font-mono text-foreground text-sm">{convertAndFormat(cat.value)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => triggerExport("PDF")}>📄 PDF Export</Button>
          <Button variant="secondary" fullWidth onClick={() => triggerExport("Excel")}>📊 Excel Export</Button>
        </div>
      </div>
    );
  }

  // Screen 27: Category Breakdown
  if (screen === "category") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Category Breakdown</h2>
        </div>
        <Card className="flex flex-col items-center">
          <div className="h-52">
            <ResponsiveContainer width={240} height="100%">
              <PieChart>
                <Pie data={mockCategoryBreakdown} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={2}>
                  {mockCategoryBreakdown.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full px-2 pb-2">
            {mockCategoryBreakdown.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-muted-foreground text-xs truncate">{c.name}</span>
                <span className="font-mono text-foreground text-xs ml-auto font-semibold">{convertAndFormat(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="flex flex-col gap-2">
          {mockCategoryBreakdown.map(cat => (
            <Card key={cat.name} className="py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground text-sm font-semibold">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{((cat.value / 2723) * 100).toFixed(1)}%</span>
                  <span className="font-mono text-foreground text-sm font-semibold">{convertAndFormat(cat.value)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(cat.value / 2723) * 100}%`, backgroundColor: cat.color }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 28: Year in Review
  if (screen === "yearreview") {
    const milestones = [
      { month: "Jan", event: "Started SpendWise AI", icon: "🚀" },
      { month: "Mar", event: "Paid off credit card debt", icon: "🎉" },
      { month: "Apr", event: "Got a raise — income up 20%", icon: "💰" },
      { month: "May", event: "Opened investment account", icon: "📈" },
      { month: "Jun", event: "Emergency fund 68% complete", icon: "🛡️" },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">2026 Year in Review</h2>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #6366f1 0%, #3730a3 100%)" }}>
          <p className="text-white/70 text-sm mb-2">Jan → Jun 2026</p>
          <p className="font-mono text-4xl text-white font-bold mb-1">+{convertAndFormat(8730)}</p>
          <p className="text-white/70 text-sm font-medium">Net saved so far this year</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Best Month", value: "April", sub: `+${convertAndFormat(1950)} saved`, color: "#10b981" },
            { label: "Worst Month", value: "March", sub: `+${convertAndFormat(900)} saved`, color: "#ef4444" },
            { label: "Avg Monthly", value: convertAndFormat(1455), sub: "saved per month", color: "#6366f1" },
            { label: "Biggest Win", value: "Debt-Free", sub: `Paid ${convertAndFormat(3200)} balance`, color: "#f59e0b" },
          ].map(s => (
            <Card key={s.label}>
              <p className="text-muted-foreground text-xs">{s.label}</p>
              <p className="font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">{s.sub}</p>
            </Card>
          ))}
        </div>
        <div>
          <h3 className="text-foreground mb-3 font-semibold text-sm">Milestones</h3>
          <div className="flex flex-col gap-2">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm">{m.icon}</div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-6 bg-border mt-1" />}
                </div>
                <div className="pb-2">
                  <p className="text-muted-foreground text-xs">{m.month} 2026</p>
                  <p className="text-foreground text-sm font-medium">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Screen 29: Custom Report Builder
  if (screen === "custom") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Custom Report</h2>
        </div>
        <Card>
          <p className="text-foreground text-sm font-medium mb-3">Report Parameters</p>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Start Date</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary/60 text-sm font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">End Date</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary/60 text-sm font-mono" />
              </div>
            </div>
            <Select
              label="Category"
              value={customCat}
              onChange={setCustomCat}
              options={[{ value: "All", label: "All Categories" }, ...["Groceries", "Food & Drink", "Transportation", "Entertainment", "Shopping"].map(c => ({ value: c, label: c }))]}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Include</p>
              {["Transactions", "Charts", "Category Breakdown", "AI Insights"].map(item => (
                <label key={item} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                  <span className="text-foreground text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>
        <Button fullWidth size="lg" onClick={() => setScreen("monthly")}>Generate Report</Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" fullWidth onClick={() => triggerExport("PDF")}>📄 Save as PDF</Button>
          <Button variant="secondary" fullWidth onClick={() => triggerExport("CSV")}>📊 Export CSV</Button>
        </div>
      </div>
    );
  }

  return null;
}
