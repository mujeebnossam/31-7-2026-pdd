import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import { Card, Badge, Button } from "../components/ui";
import { mockAIInsights, mockSpendingByMonth } from "../data/mockData";

type InsightScreen = "home" | "predictions" | "savings" | "anomaly" | "forecast";

interface AIInsightsProps {
  transactions?: any[];
  budgets?: any[];
}

export function AIInsights({ transactions = [], budgets = [] }: AIInsightsProps) {
  const [screen, setScreen] = useState<InsightScreen>("home");
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hi Mujeeb! I'm your SpendWise AI assistant. Ask me anything about your finances." },
  ]);

  const sendChat = async () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg;
    setChatMsg("");

    // Add user message to history immediately
    setChatHistory(prev => [...prev, { role: "user", text: msg }]);
    
    // Add temporary loading indicator
    setChatHistory(prev => [...prev, { role: "ai", text: "Thinking... 🤖" }]);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: msg,
          transactions,
          budgets
        })
      });
      const data = await res.json();
      
      setChatHistory(prev => {
        // Remove temporary indicator and append real response
        const filtered = prev.filter(item => item.text !== "Thinking... 🤖");
        return [...filtered, { role: "ai", text: data.text || "Sorry, I could not generate advice at this moment." }];
      });
    } catch (err) {
      setChatHistory(prev => {
        const filtered = prev.filter(item => item.text !== "Thinking... 🤖");
        return [...filtered, { role: "ai", text: "Failed to connect to the financial intelligence server. Please try again." }];
      });
    }
  };

  // Screen 20: AI Insights Home
  if (screen === "home") {
    const typeColor: Record<string, string> = { saving: "#10b981", alert: "#f59e0b", prediction: "#6366f1", goal: "#3b82f6" };
    const typeBg: Record<string, string> = { saving: "border-emerald-500/20 bg-emerald-500/5", alert: "border-amber-500/20 bg-amber-500/5", prediction: "border-primary/20 bg-primary/5", goal: "border-blue-500/20 bg-blue-500/5" };
    return (
      <div className="flex flex-col gap-6 pb-6 select-none font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Insights Hub</h2>
            <p className="text-muted-foreground text-sm">Real-time predictive analytics and conversational intelligence.</p>
          </div>
          <Badge variant="primary" className="px-3 py-1 text-xs">5 active alerts</Badge>
        </div>

        {/* Dynamic Responsive Multi-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Space (Col-span 2): Chat Interface & Interactive Scenarios */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* AI Assistant Chat Section */}
            <Card className="border-primary/20 flex flex-col p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <p className="text-foreground font-bold text-base flex items-center gap-2">
                  <span>🤖</span> Ask SpendWise Financial Intelligence
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  Agent Online
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="bg-muted rounded-xl p-4 mb-4 h-64 overflow-y-auto flex flex-col gap-3 scrollbar-none">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-white" : "bg-secondary text-foreground text-left"}`}>
                      {m.role === "user" ? (
                        m.text
                      ) : (
                        <div className="markdown-body">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message inputs */}
              <div className="flex gap-2">
                <input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Ask me: 'How can I save $200 this month?' or 'Is my grocery bill typical?'..."
                  className="flex-1 bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button onClick={sendChat} className="px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 shadow-md shadow-primary/10 transition-all">Send</button>
              </div>
            </Card>

            {/* Quick Prediction & Forecasting Tools */}
            <div>
              <h3 className="text-foreground font-semibold mb-3 text-sm uppercase tracking-wider font-mono">Analytic Perspectives</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: "📈", label: "Predictions", desc: "Trend modeling", screen: "predictions" as InsightScreen },
                  { icon: "💡", label: "Save Money", desc: "Outflow cuts", screen: "savings" as InsightScreen },
                  { icon: "🚨", label: "Anomalies", desc: "Outliers alerts", screen: "anomaly" as InsightScreen },
                  { icon: "🔮", label: "Forecast", desc: "Next quarter", screen: "forecast" as InsightScreen },
                ].map(item => (
                  <Card key={item.label} hover onClick={() => setScreen(item.screen)} className="flex flex-col items-start gap-2 p-4 cursor-pointer text-left">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className="text-foreground text-sm font-bold">{item.label}</h4>
                      <p className="text-muted-foreground text-[11px]">{item.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Area (Col-span 1): Recommendations and Alerts Feed */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="text-foreground font-semibold text-sm uppercase tracking-wider font-mono">Interactive Insights</h3>
                <span className="text-muted-foreground text-xs">{mockAIInsights.length} suggestions</span>
              </div>

              {mockAIInsights.map(ins => (
                <Card key={ins.id} className={`${typeBg[ins.type]} border p-4.5`}>
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl mt-0.5">{ins.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-foreground text-sm font-semibold leading-snug">{ins.title}</p>
                        <Badge variant="neutral" className="text-[10px] font-mono px-2 py-0 border-white/5 bg-secondary">{ins.confidence}% accuracy</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{ins.description}</p>
                      {ins.impact > 0 && (
                        <p className="mt-2 text-xs font-semibold" style={{ color: typeColor[ins.type] }}>
                          Estimated savings: +${ins.impact}/yr
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Screen 21: Spending Predictions
  if (screen === "predictions") {
    const monthData = [
      { month: "Jun", predicted: 2723, actual: 2723 },
      { month: "Jul", predicted: 2650, actual: null },
      { month: "Aug", predicted: 2580, actual: null },
      { month: "Sep", predicted: 2720, actual: null },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Spending Predictions</h2>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <p className="text-primary text-sm font-medium mb-1">🤖 AI Forecast</p>
          <p className="text-muted-foreground text-sm">Based on 6 months of data, your spending is trending downward. You're likely to save an extra $143 next month if you maintain current habits.</p>
        </Card>
        <Card>
          <p className="text-foreground text-sm mb-3">4-Month Forecast</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData} margin={{ top: 0, right: 0, bottom: 0, left: -15 }}>
                <XAxis dataKey="month" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                  labelStyle={{ color: "#6b7494" }}
                  itemStyle={{ color: "#e8eaf0" }}
                />
                <ReferenceLine y={3000} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                {monthData.map((d, i) => (
                  <Bar key={i} dataKey="predicted" fill={d.actual !== null ? "#6366f1" : "#6366f150"} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="flex flex-col gap-3">
          {[
            { cat: "Food & Drink", predicted: 340, trend: "↑ up 18%", color: "#ef4444" },
            { cat: "Shopping", predicted: 95, trend: "↓ down 9%", color: "#10b981" },
            { cat: "Transportation", predicted: 78, trend: "→ stable", color: "#6b7494" },
            { cat: "Entertainment", predicted: 42, trend: "↓ down 12%", color: "#10b981" },
          ].map(p => (
            <Card key={p.cat} className="flex items-center justify-between py-3">
              <span className="text-foreground text-sm">{p.cat}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: p.color }}>{p.trend}</span>
                <span className="font-mono text-foreground text-sm">${p.predicted}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 22: Saving Opportunities
  if (screen === "savings") {
    const opportunities = [
      { title: "Cancel unused subscriptions", desc: "You haven't used Apple TV+ in 45 days. Cancel to save $9.99/month.", saving: 120, difficulty: "Easy", icon: "📺" },
      { title: "Switch to store-brand groceries", desc: "Switching 30% of branded items could save $40-60/month on groceries.", saving: 600, difficulty: "Easy", icon: "🛒" },
      { title: "Meal prep 3x per week", desc: "Reducing restaurant visits from 8 to 5 per month saves ~$80/month.", saving: 960, difficulty: "Medium", icon: "🍳" },
      { title: "Refinance student loans", desc: "Current rates suggest refinancing could save $47/month.", saving: 564, difficulty: "Hard", icon: "🎓" },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Save Money</h2>
        </div>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 text-sm font-medium mb-1">💡 Total Savings Potential</p>
          <p className="font-mono text-3xl text-emerald-400 font-bold">$2,244<span className="text-lg text-muted-foreground">/yr</span></p>
          <p className="text-muted-foreground text-xs mt-1">If you act on all recommendations below</p>
        </Card>
        <div className="flex flex-col gap-3">
          {opportunities.map(o => (
            <Card key={o.title}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl flex-shrink-0">{o.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground text-sm font-medium">{o.title}</p>
                    <Badge variant={o.difficulty === "Easy" ? "success" : o.difficulty === "Medium" ? "warning" : "neutral"}>
                      {o.difficulty}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{o.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-emerald-400 text-sm font-medium">Save ${o.saving}/yr</span>
                    <button className="text-primary text-xs hover:underline">Take action →</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 23: Anomaly Detection
  if (screen === "anomaly") {
    const anomalies = [
      { merchant: "Shell Gas Station", amount: 62.18, typical: 27, date: "Jun 10", severity: "medium", reason: "2.3x your typical gas spend" },
      { merchant: "Amazon Prime", amount: 14.99, typical: 14.99, date: "Jun 9", severity: "low", reason: "Annual renewal may be upcoming" },
      { merchant: "Cheesecake Factory", amount: 67.20, typical: 20, date: "Jun 5", severity: "high", reason: "3.4x your typical dining spend per visit" },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Anomaly Detection</h2>
        </div>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <p className="text-amber-400 text-sm font-medium mb-1">🔍 AI Analysis</p>
          <p className="text-muted-foreground text-sm">SpendWise AI scans every transaction for unusual patterns. We detected 3 anomalies this month worth reviewing.</p>
        </Card>
        <div className="flex flex-col gap-3">
          {anomalies.map(a => (
            <Card key={a.merchant} className={a.severity === "high" ? "border-red-500/30" : a.severity === "medium" ? "border-amber-500/30" : "border-border"}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.severity === "high" ? "bg-red-400" : a.severity === "medium" ? "bg-amber-400" : "bg-blue-400"}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-foreground text-sm font-medium">{a.merchant}</p>
                    <span className="font-mono text-red-400 text-sm">-${a.amount}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{a.date} · Typical: ${a.typical}</p>
                  <p className="text-amber-400 text-xs mt-1">⚠️ {a.reason}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-xs text-primary hover:underline">Mark as expected</button>
                    <span className="text-muted-foreground">·</span>
                    <button className="text-xs text-destructive hover:underline">Flag as issue</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div>
          <h3 className="text-foreground mb-3">Reviewed This Month</h3>
          <div className="flex flex-col gap-2">
            {[
              { merchant: "Netflix", amount: 15.99, status: "Expected" },
              { merchant: "Planet Fitness", amount: 24.99, status: "Expected" },
            ].map(r => (
              <Card key={r.merchant} className="flex items-center justify-between py-2.5 opacity-60">
                <span className="text-foreground text-sm">{r.merchant}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{r.status}</Badge>
                  <span className="font-mono text-muted-foreground text-sm">${r.amount}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Screen 24: Financial Forecast
  if (screen === "forecast") {
    const forecastData = [
      ...mockSpendingByMonth.map(d => ({ ...d, type: "actual" })),
      { month: "Jul", income: 4300, expenses: 2650, type: "predicted" },
      { month: "Aug", income: 4300, expenses: 2580, type: "predicted" },
      { month: "Sep", income: 4300, expenses: 2720, type: "predicted" },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Financial Forecast</h2>
        </div>
        <Card>
          <div className="flex justify-between items-center mb-3">
            <p className="text-foreground text-sm">9-Month Overview</p>
            <div className="flex gap-3">
              <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-primary rounded" /><span className="text-xs text-muted-foreground">Actual</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-0.5 bg-primary/40 rounded border-dashed border border-primary/40" /><span className="text-xs text-muted-foreground">Predicted</span></div>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="month" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f1628", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Projected savings (next 3mo)", value: "+$4,890", color: "#10b981" },
            { label: "Projected net worth (Dec)", value: "$63,200", color: "#6366f1" },
            { label: "Emergency fund completion", value: "Nov 2026", color: "#f59e0b" },
            { label: "Japan trip funded by", value: "Jul 2026", color: "#3b82f6" },
          ].map(s => (
            <Card key={s.label}>
              <p className="text-muted-foreground text-xs mb-1">{s.label}</p>
              <p className="font-mono text-sm font-semibold" style={{ color: s.color }}>{s.value}</p>
            </Card>
          ))}
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <p className="text-primary text-sm font-medium mb-2">🔮 Year-End Projection</p>
          <p className="text-muted-foreground text-sm">At your current trajectory, you'll end 2026 with an estimated net worth of <span className="text-foreground font-medium">$63,200</span> — up <span className="text-emerald-400">+$20,800 (49%)</span> from the start of the year.</p>
        </Card>
      </div>
    );
  }

  return null;
}
