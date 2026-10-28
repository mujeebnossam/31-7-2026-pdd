import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from "recharts";
import { Card, Badge, Button } from "../components/ui";
import {
  aiApi,
  ApiFinancialSummary,
  ApiFinancialPredictions,
  ApiAIInsight,
} from "../services/api";
import { useApp } from "../context/AppContext";

type AIScreenTab = "chat" | "insights" | "predictions" | "anomalies" | "subscriptions";
type InsightFilter = "all" | "alerts" | "savings" | "goals" | "bills";

export function AIInsights() {
  const { user, convertAndFormat } = useApp();
  const [tab, setTab] = useState<AIScreenTab>("chat");
  const [insightFilter, setInsightFilter] = useState<InsightFilter>("all");

  // AI Data State
  const [summary, setSummary] = useState<ApiFinancialSummary | null>(null);
  const [predictions, setPredictions] = useState<ApiFinancialPredictions | null>(null);
  const [insights, setInsights] = useState<ApiAIInsight[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Chat State
  const [chatMsg, setChatMsg] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; text: string; time?: string }[]
  >([
    {
      role: "assistant",
      text: `Hello **${user?.name || "there"}**! I'm **SpendWise AI**, your personal financial intelligence advisor. I have direct real-time access to your ledger. Ask me about your spending patterns, savings opportunities, upcoming bills, goals, or next-month predictions!`,
    },
  ]);

  // Load live AI analysis
  const loadAIData = async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [sum, preds, ins] = await Promise.all([
        aiApi.getSummary(),
        aiApi.getPredictions(),
        aiApi.getInsights(),
      ]);
      setSummary(sum);
      setPredictions(preds);
      setInsights(ins);
    } catch (err: any) {
      console.error("Failed to load AI intelligence data:", err);
      setDataError(err.message || "AI insights temporarily unavailable. Your ledger is safe.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadAIData();
  }, []);

  // Chat Submission Handler
  const sendChat = async (presetPrompt?: string) => {
    const promptToSend = presetPrompt || chatMsg;
    if (!promptToSend.trim() || isThinking) return;

    setChatMsg("");
    setChatHistory(prev => [...prev, { role: "user", text: promptToSend.trim() }]);
    setIsThinking(true);

    try {
      const res = await aiApi.chat(promptToSend.trim(), conversationId);
      if (res.conversationId) setConversationId(res.conversationId);

      setChatHistory(prev => [
        ...prev,
        { role: "assistant", text: res.response || "No response received." },
      ]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ **Error connecting to AI advisor:** ${err.message || "Please check connection."}\n\n*Your local database calculations are still fully active.*`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const clearChat = async () => {
    try {
      await aiApi.clearConversations();
    } catch (e) {
      console.error("Failed to clear conversations", e);
    }
    setConversationId(undefined);
    setChatHistory([
      {
        role: "assistant",
        text: `Conversation cleared. How can I assist you with your finances today?`,
      },
    ]);
  };

  // Filtered Insights
  const filteredInsights = insights.filter(ins => {
    if (insightFilter === "alerts") return ins.severity === "danger" || ins.severity === "warning";
    if (insightFilter === "savings") return ins.type === "saving" || ins.type === "spending";
    if (insightFilter === "goals") return ins.type === "goal";
    if (insightFilter === "bills") return ins.type === "bill" || ins.type === "subscription";
    return true;
  });

  const severityColor: Record<string, string> = {
    danger: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    info: "border-primary/30 bg-primary/10 text-primary",
  };

  // Dynamic Chart for Predictions
  const forecastChartData = [
    ...(summary?.trendHistory || []).map(m => ({
      name: m.label,
      actual: m.expenses,
      predicted: m.expenses,
      income: m.income,
    })),
    {
      name: predictions?.nextMonth.monthLabel.split(" ")[0] || "Next Mo",
      actual: null,
      predicted: predictions?.nextMonth.predictedExpenses || 0,
      income: predictions?.nextMonth.predictedIncome || 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>🤖</span> SpendWise AI Intelligence Hub
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Autonomous financial modeling, anomaly detection & conversational advisor
          </p>
        </div>
        <div className="flex items-center gap-2">
          {summary && (
            <Badge
              variant={
                summary.financialHealth.score >= 700
                  ? "success"
                  : summary.financialHealth.score >= 550
                  ? "primary"
                  : "warning"
              }
              className="font-mono text-xs px-3 py-1"
            >
              Health: {summary.financialHealth.score}/850 ({summary.financialHealth.grade})
            </Badge>
          )}
        </div>
      </div>

      {dataError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{dataError}</span>
          </div>
          <button
            onClick={loadAIData}
            className="px-2.5 py-1 bg-red-500/20 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Core Differentiation Banner */}
      <div className="p-3.5 bg-gradient-to-r from-primary/10 via-violet-500/10 to-transparent border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="text-xl">🧠</span>
          <div>
            <p className="font-bold text-foreground">Financial Intelligence vs Payment Apps</p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Payment applications execute transfers; SpendWise AI unifies multi-source data (Manual, CSV Statements, UPI Feeds) into an autonomous financial intelligence layer with automated budget control, predictive cashflow modeling, anomaly auditing, and wealth recommendations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant="primary" className="text-[10px]">Multi-Source</Badge>
          <Badge variant="success" className="text-[10px]">PostgreSQL Verified</Badge>
        </div>
      </div>

      {/* Top Nav Tabs */}
      <div className="flex gap-2 p-1.5 bg-secondary rounded-2xl border border-border/50 overflow-x-auto scrollbar-none">
        {[
          { id: "chat", icon: "💬", label: "AI Advisor" },
          { id: "insights", icon: "💡", label: `Insights (${insights.length})` },
          { id: "predictions", icon: "🔮", label: "Predictions" },
          { id: "anomalies", icon: "🔍", label: `Anomalies (${summary?.anomalies.length || 0})` },
          { id: "subscriptions", icon: "📱", label: `Subscriptions (${summary?.subscriptions.length || 0})` },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as AIScreenTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              tab === item.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB 1: CONVERSATIONAL ASSISTANT ─────────────────────────────────── */}
      {tab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Chat Stream (Col 2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="p-4 sm:p-6 flex flex-col border-primary/20">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-foreground font-bold text-sm">Auden, Certified AI Wealth Coach</span>
                </div>
                <button
                  onClick={clearChat}
                  className="text-xs text-muted-foreground hover:text-red-400 transition"
                  title="Clear chat history"
                >
                  🗑️ Clear Chat
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto flex flex-col gap-3.5 pr-1 scrollbar-none mb-4">
                {chatHistory.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/10"
                          : "bg-secondary text-foreground rounded-bl-none border border-border/40 text-left"
                      }`}
                    >
                      {m.role === "user" ? (
                        m.text
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none space-y-2">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-foreground text-xs px-4 py-2.5 rounded-2xl rounded-bl-none border border-border flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="text-muted-foreground font-mono">Analyzing PostgreSQL ledger...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt Suggestions */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                {[
                  "📊 Analyze my spending",
                  "💡 How can I save more?",
                  "🔮 Predict next month",
                  "🎯 Am I on track for goals?",
                  "📅 What bills are coming up?",
                  "💎 Financial health summary",
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendChat(prompt)}
                    disabled={isThinking}
                    className="text-[11px] sm:text-xs px-3 py-1.5 bg-secondary border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-xl transition whitespace-nowrap flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Ask Auden anything: 'Where am I spending most?' or 'Can I afford to save $500?'..."
                  disabled={isThinking}
                  className="flex-1 bg-input-background border border-border rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition"
                />
                <Button
                  onClick={() => sendChat()}
                  disabled={!chatMsg.trim() || isThinking}
                  className="px-5 py-3"
                >
                  Send
                </Button>
              </div>
            </Card>
          </div>

          {/* AI Financial Summary Card (Col 1) */}
          <div className="flex flex-col gap-4">
            {summary ? (
              <Card className="p-5 border-primary/20 bg-secondary/40 flex flex-col gap-4">
                <div>
                  <p className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
                    Ledger Snapshot
                  </p>
                  <p className="text-xl font-bold text-foreground font-mono mt-0.5">
                    {convertAndFormat(summary.netWorth)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Net Worth Across Accounts</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/60 p-2.5 rounded-xl border border-border/40">
                    <p className="text-muted-foreground text-[10px]">Inflows (Mo)</p>
                    <p className="font-mono font-bold text-emerald-400 mt-0.5">
                      {convertAndFormat(summary.currentMonth.income)}
                    </p>
                  </div>
                  <div className="bg-background/60 p-2.5 rounded-xl border border-border/40">
                    <p className="text-muted-foreground text-[10px]">Outflows (Mo)</p>
                    <p className="font-mono font-bold text-foreground mt-0.5">
                      {convertAndFormat(summary.currentMonth.expenses)}
                    </p>
                  </div>
                  <div className="bg-background/60 p-2.5 rounded-xl border border-border/40">
                    <p className="text-muted-foreground text-[10px]">Savings Rate</p>
                    <p className="font-mono font-bold text-indigo-400 mt-0.5">
                      {summary.currentMonth.savingsRate}%
                    </p>
                  </div>
                  <div className="bg-background/60 p-2.5 rounded-xl border border-border/40">
                    <p className="text-muted-foreground text-[10px]">Bills Due (Mo)</p>
                    <p className="font-mono font-bold text-amber-400 mt-0.5">
                      {convertAndFormat(summary.upcomingBillsTotal)}
                    </p>
                  </div>
                </div>

                {summary.topCategories.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Top Outflow Category</p>
                    <div className="flex items-center justify-between text-xs bg-background/50 p-2.5 rounded-xl border border-border/30">
                      <span className="font-medium text-foreground truncate">
                        {summary.topCategories[0].category}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {convertAndFormat(summary.topCategories[0].amount)} ({summary.topCategories[0].percentage}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs leading-relaxed text-muted-foreground">
                  💡 <strong className="text-foreground">AI Tip:</strong>{" "}
                  {summary.financialHealth.recommendation}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center text-xs text-muted-foreground">
                Loading financial metrics...
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: STRUCTURED INSIGHTS ───────────────────────────────────────── */}
      {tab === "insights" && (
        <div className="flex flex-col gap-5">
          {/* Sub-Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: `All (${insights.length})` },
              { id: "alerts", label: "🚨 Alerts & Warnings" },
              { id: "savings", label: "💡 Savings & Outflows" },
              { id: "goals", label: "🎯 Goals" },
              { id: "bills", label: "📅 Bills & Subs" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setInsightFilter(f.id as InsightFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  insightFilter === f.id
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredInsights.length === 0 ? (
            <Card className="py-12 text-center text-xs text-muted-foreground">
              No insights found for this filter. As you log more transactions, new opportunities will emerge automatically.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInsights.map(ins => (
                <Card
                  key={ins.id}
                  className={`p-4 border ${severityColor[ins.severity]} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{ins.icon}</span>
                        <div>
                          <p className="text-foreground text-sm font-bold">{ins.title}</p>
                          <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                            {ins.category}
                          </span>
                        </div>
                      </div>
                      <Badge variant={ins.severity === "danger" ? "danger" : ins.severity === "warning" ? "warning" : "success"}>
                        {ins.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed mt-2">{ins.description}</p>
                    {ins.supportingMetric && (
                      <p className="text-xs font-mono font-semibold text-foreground mt-2">
                        📌 {ins.supportingMetric}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">👉 {ins.action}</span>
                    {ins.impact && ins.impact > 0 && (
                      <span className="font-mono font-bold text-emerald-400 ml-2 whitespace-nowrap">
                        {convertAndFormat(ins.impact)}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SPENDING & CASHFLOW PREDICTIONS ─────────────────────────── */}
      {tab === "predictions" && (
        <div className="flex flex-col gap-6">
          {predictions ? (
            <>
              {/* Prediction Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 text-center border-primary/30 bg-primary/5">
                  <p className="text-xs text-muted-foreground font-medium">Predicted Next Month Outflow</p>
                  <p className="font-mono text-2xl font-extrabold text-foreground mt-1">
                    {convertAndFormat(predictions.nextMonth.predictedExpenses)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Weighted historical moving average</p>
                </Card>
                <Card className="p-4 text-center border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-xs text-muted-foreground font-medium">Predicted Next Month Net Flow</p>
                  <p className="font-mono text-2xl font-extrabold text-emerald-400 mt-1">
                    {convertAndFormat(predictions.nextMonth.predictedNetCashFlow)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Savings rate: {predictions.nextMonth.predictedSavingsRate}%
                  </p>
                </Card>
                <Card className="p-4 text-center border-indigo-500/30 bg-indigo-500/5">
                  <p className="text-xs text-muted-foreground font-medium">Financial Trajectory</p>
                  <p className="text-xl font-bold text-indigo-400 uppercase tracking-wider mt-1">
                    {predictions.trajectory.trend}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Confidence: <span className="uppercase font-mono">{predictions.confidence}</span>
                  </p>
                </Card>
              </div>

              {/* 4-Month Forecast Chart */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-foreground font-bold text-sm">Historical vs. Projected Outflow Modeling</h4>
                    <p className="text-muted-foreground text-xs">Based on actual PostgreSQL ledger history</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full" /> Actual
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-primary/40 rounded-full" /> Predicted
                    </span>
                  </div>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastChartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <XAxis dataKey="name" tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7494", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f1628",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        formatter={(val: any) => [convertAndFormat(val), "Outflow"]}
                      />
                      <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="predicted" fill="#6366f160" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Category Spending Projections */}
              <div>
                <h4 className="text-foreground font-bold text-sm mb-3">Predicted Category Outflows</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {predictions.categoryPredictions.map(c => (
                    <Card key={c.category} className="p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-foreground text-xs font-semibold">{c.category}</p>
                        <p className="text-muted-foreground text-[11px]">
                          Trend: <span className="capitalize">{c.trend}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-foreground">
                          {convertAndFormat(c.predictedAmount)}
                        </p>
                        <span
                          className={`text-[10px] font-mono ${
                            c.changePercent > 0
                              ? "text-red-400"
                              : c.changePercent < 0
                              ? "text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {c.changePercent > 0 ? `+${c.changePercent}%` : `${c.changePercent}%`}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-muted-foreground/80 italic text-center">
                ℹ️ {predictions.disclaimer} ({predictions.confidenceReason})
              </p>
            </>
          ) : (
            <Card className="py-12 text-center text-xs text-muted-foreground">
              Loading predictions...
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB 4: ANOMALY DETECTION ────────────────────────────────────────── */}
      {tab === "anomalies" && (
        <div className="flex flex-col gap-5">
          <Card className="p-4 border-amber-500/20 bg-amber-500/5">
            <p className="text-amber-400 text-xs font-semibold mb-1">🔍 Autonomous Outlier Detection</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              SpendWise AI audits every transaction in your PostgreSQL ledger against category historical averages. Any expenditure exceeding 2.5x typical spending is flagged for review.
            </p>
          </Card>

          {summary?.anomalies.length === 0 ? (
            <Card className="py-12 text-center text-xs text-muted-foreground">
              ✅ No spending anomalies detected in your recent transaction history. All outflows are within typical baseline behavior.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {summary?.anomalies.map(a => (
                <Card
                  key={a.transactionId}
                  className={`p-4 border ${
                    a.severity === "high" ? "border-red-500/40 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">🚨</span>
                        <p className="text-foreground text-sm font-bold">{a.title}</p>
                        <Badge variant={a.severity === "high" ? "danger" : "warning"}>
                          {a.multiplier}x typical
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        Category: <strong className="text-foreground">{a.category}</strong> · Date: {a.date}
                      </p>
                      <p className="text-amber-400 text-xs mt-1 font-medium">⚠️ {a.reason}</p>
                    </div>
                    <p className="font-mono text-base font-bold text-red-400 flex-shrink-0">
                      -{convertAndFormat(a.amount)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: SUBSCRIPTION INTELLIGENCE ────────────────────────────────── */}
      {tab === "subscriptions" && (
        <div className="flex flex-col gap-5">
          <Card className="p-4 border-primary/20 bg-primary/5">
            <p className="text-primary text-xs font-semibold mb-1">📱 Subscription Portfolio Intelligence</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You maintain <strong className="text-foreground">{summary?.subscriptions.length || 0} active subscriptions</strong> totaling{" "}
              <strong className="text-indigo-400 font-mono">
                {convertAndFormat(summary?.monthlyRecurringOutflow || 0)}/mo
              </strong>{" "}
              (<span className="font-mono text-foreground">{convertAndFormat(summary?.totalSubscriptionAnnualCost || 0)}/year</span>).
            </p>
          </Card>

          {summary?.subscriptions.length === 0 ? (
            <Card className="py-12 text-center text-xs text-muted-foreground">
              No active recurring subscriptions found. Add subscriptions in the Bills tab to unlock automated subscription auditing.
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary?.subscriptions.map(s => (
                <Card key={s.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-foreground text-sm font-bold">{s.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 capitalize">
                      {s.frequency} billing · {convertAndFormat(s.monthlyEquivalent)}/mo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-foreground">
                      {convertAndFormat(s.annualCost)}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono">/year</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
