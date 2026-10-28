import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, Badge, Button, Input } from "../components/ui";
import { mockInvestments, mockPortfolioHistory } from "../data/mockData";

type InvScreen = "overview" | "detail" | "add" | "history" | "invgoals";

export function Investments() {
  const [screen, setScreen] = useState<InvScreen>("overview");
  const [selected, setSelected] = useState(mockInvestments[0]);
  const [newInv, setNewInv] = useState({ ticker: "", shares: "", price: "" });

  const totalValue = mockInvestments.reduce((s, i) => s + i.value, 0);
  const totalGain = 3240;

  // Screen 30: Portfolio Overview
  if (screen === "overview") {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Investments</h2>
              <Badge variant="primary" className="text-[10px]">Portfolio Simulator</Badge>
            </div>
            <p className="text-muted-foreground text-sm">Monitor simulated asset allocations, ETF holdings, and returns.</p>
          </div>
          <button onClick={() => setScreen("add")} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 shadow-md shadow-primary/10 transition-colors">+ Add Position</button>
        </div>

        {/* Desktop Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6 font-sans">
            
            {/* Portfolio Value Summary Card */}
            <div className="rounded-2xl p-6 relative overflow-hidden bg-secondary border border-border">
              <p className="text-muted-foreground text-sm mb-1 font-medium">Aggregate Portfolio Value</p>
              <p className="font-mono text-4xl text-foreground font-black mb-3">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" className="font-semibold text-xs">+${totalGain.toLocaleString()} return</Badge>
                <Badge variant="success" className="font-semibold text-xs">+10.3% all time</Badge>
              </div>
            </div>

            {/* Performance Interactive Chart */}
            <Card className="p-0 overflow-hidden border border-border">
              <div className="p-5 border-b border-border bg-secondary/10">
                <p className="text-foreground font-semibold">Portfolio Valuation Trend</p>
                <p className="text-muted-foreground text-xs">Returns over the last 6 calendar months</p>
              </div>
              <div className="h-60 px-2 pt-4 pb-2 bg-background/50">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockPortfolioHistory} margin={{ top: 0, right: 10, bottom: 0, left: -25 }}>
                    <defs>
                      <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#portGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Asset Allocation Layout */}
            <Card className="p-5">
              <p className="text-foreground font-semibold mb-4">Diversification and Class Allocation</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex justify-center py-2 bg-secondary/15 rounded-xl border border-border/60">
                  <PieChart width={140} height={140}>
                    <Pie data={mockInvestments} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {mockInvestments.map((inv, i) => <Cell key={i} fill={inv.color} />)}
                    </Pie>
                  </PieChart>
                </div>
                <div className="flex flex-col gap-3 justify-center">
                  {mockInvestments.map(inv => (
                    <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10 border border-border/40">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: inv.color }} />
                      <span className="text-foreground text-xs font-semibold flex-1">{inv.ticker} ({inv.name})</span>
                      <span className="text-muted-foreground text-xs font-mono">{((inv.value / totalValue) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

          </div>

          {/* Secondary Column (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Holdings section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Active Holdings</h3>
                <button onClick={() => setScreen("history")} className="text-primary text-xs font-medium hover:underline">Ledger History →</button>
              </div>
              <div className="flex flex-col gap-2.5">
                {mockInvestments.map(inv => (
                  <Card key={inv.id} hover onClick={() => { setSelected(inv); setScreen("detail"); }} className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black uppercase" style={{ backgroundColor: inv.color + "15", color: inv.color, border: `1px solid ${inv.color}35` }}>
                        {inv.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-semibold">{inv.ticker}</p>
                        <p className="text-muted-foreground text-[11px]">{inv.shares} shares · ${inv.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-foreground text-sm font-bold">${inv.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                      <p className={`text-xs font-semibold ${inv.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {inv.change >= 0 ? "+" : ""}{inv.changePercent}%
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Target milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-foreground font-semibold">Investments Goals</h3>
                <button onClick={() => setScreen("invgoals")} className="text-primary text-xs font-medium hover:underline">View All →</button>
              </div>
              
              <Card hover onClick={() => setScreen("invgoals")} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-semibold">Retirement Fund</p>
                    <p className="text-muted-foreground text-xs">Progress: $34,590 of $500,000</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "7%" }} />
                </div>
              </Card>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Screen 31: Stock/Asset Detail
  if (screen === "detail") {
    const inv = selected;
    const histData = [
      { date: "Jan", price: inv.price * 0.88 },
      { date: "Feb", price: inv.price * 0.91 },
      { date: "Mar", price: inv.price * 0.87 },
      { date: "Apr", price: inv.price * 0.93 },
      { date: "May", price: inv.price * 0.97 },
      { date: "Jun", price: inv.price },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: inv.color + "20", color: inv.color }}>
              {inv.ticker.slice(0, 2)}
            </div>
            <h2 className="text-xl">{inv.ticker}</h2>
          </div>
        </div>
        <div className="flex flex-col items-center py-6 bg-secondary rounded-2xl gap-2">
          <p className="font-mono text-4xl font-bold text-foreground">${inv.price.toFixed(2)}</p>
          <div className="flex gap-2">
            <Badge variant={inv.change >= 0 ? "success" : "danger"}>
              {inv.change >= 0 ? "+" : ""}{inv.change} ({inv.changePercent}%)
            </Badge>
            <Badge variant="neutral">Today</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{inv.name}</p>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="h-48 px-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={histData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={inv.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={inv.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="price" stroke={inv.change >= 0 ? "#10b981" : "#ef4444"} fill="url(#stockGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Shares Owned", value: inv.shares.toString() },
            { label: "Total Value", value: `$${inv.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
            { label: "Avg Cost Basis", value: `$${(inv.price * 0.91).toFixed(2)}` },
            { label: "Unrealized Gain", value: `+$${(inv.value * 0.09).toFixed(0)}` },
          ].map(s => (
            <Card key={s.label}>
              <p className="text-muted-foreground text-xs">{s.label}</p>
              <p className="font-mono text-foreground font-semibold mt-1">{s.value}</p>
            </Card>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="primary" fullWidth>Buy More</Button>
          <Button variant="danger" fullWidth>Sell</Button>
        </div>
      </div>
    );
  }

  // Screen 32: Add Investment
  if (screen === "add") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Add Investment</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Input label="Stock / ETF Ticker" placeholder="e.g. AAPL, VOO, BTC" value={newInv.ticker} onChange={v => setNewInv(p => ({ ...p, ticker: v }))} />
          <Input label="Number of Shares" placeholder="10" value={newInv.shares} onChange={v => setNewInv(p => ({ ...p, shares: v }))} type="number" />
          <Input label="Purchase Price per Share" placeholder="200.00" value={newInv.price} onChange={v => setNewInv(p => ({ ...p, price: v }))} type="number" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Purchase Date</label>
            <input type="date" defaultValue="2026-06-11" className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/60" />
          </div>
        </div>
        {newInv.ticker && newInv.shares && newInv.price && (
          <Card className="border-primary/20 bg-primary/5">
            <p className="text-primary text-sm font-medium mb-2">Investment Summary</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Total Cost</span>
              <span className="font-mono text-foreground">${(parseFloat(newInv.shares || "0") * parseFloat(newInv.price || "0")).toFixed(2)}</span>
            </div>
          </Card>
        )}
        <Button fullWidth size="lg" disabled={!newInv.ticker || !newInv.shares || !newInv.price} onClick={() => setScreen("overview")}>
          Add to Portfolio
        </Button>
      </div>
    );
  }

  // Screen 33: Investment History
  if (screen === "history") {
    const events = [
      { date: "Jun 10, 2026", action: "Buy", ticker: "VOO", shares: 5, price: 519.50, total: 2597.50 },
      { date: "May 22, 2026", action: "Buy", ticker: "AAPL", shares: 3, price: 208.20, total: 624.60 },
      { date: "Apr 15, 2026", action: "Buy", ticker: "MSFT", shares: 2, price: 421.00, total: 842.00 },
      { date: "Mar 5, 2026", action: "Sell", ticker: "TSLA", shares: 2, price: 195.00, total: 390.00 },
      { date: "Feb 1, 2026", action: "Buy", ticker: "IBIT", shares: 20, price: 46.00, total: 920.00 },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Investment History</h2>
        </div>
        <div className="flex flex-col gap-2">
          {events.map((e, i) => (
            <Card key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${e.action === "Buy" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {e.action === "Buy" ? "↓" : "↑"}
                </div>
                <div>
                  <p className="text-foreground text-sm">{e.action} {e.ticker}</p>
                  <p className="text-muted-foreground text-xs">{e.shares} shares · ${e.price} · {e.date}</p>
                </div>
              </div>
              <p className={`font-mono text-sm ${e.action === "Buy" ? "text-red-400" : "text-emerald-400"}`}>
                {e.action === "Buy" ? "-" : "+"}${e.total.toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 34: Investment Goals
  if (screen === "invgoals") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Investment Goals</h2>
        </div>
        {[
          { name: "Retirement Fund", target: 500000, current: 34590, by: "2055", icon: "🌴" },
          { name: "Reach $50K Portfolio", target: 50000, current: 34590, by: "Dec 2027", icon: "📈" },
          { name: "Max Roth IRA 2026", target: 7000, current: 4200, by: "Dec 2026", icon: "🏦" },
        ].map(g => {
          const pct = (g.current / g.target) * 100;
          return (
            <Card key={g.name}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <p className="text-foreground">{g.name}</p>
                    <p className="text-muted-foreground text-xs">Target: {g.by}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-foreground text-sm">${g.current.toLocaleString()}</p>
                  <p className="text-muted-foreground text-xs">of ${g.target.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className="text-muted-foreground text-xs mt-2">{pct.toFixed(1)}% complete</p>
            </Card>
          );
        })}
        <Button fullWidth onClick={() => setScreen("overview")}>+ Add Goal</Button>
      </div>
    );
  }

  return null;
}
