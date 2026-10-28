import { useState, useEffect } from "react";
import { Card, Badge, AmountDisplay, Button, Input, Select } from "../components/ui";
import { categories } from "../data/mockData";
import { useApp } from "../context/AppContext";
import {
  aiApi,
  ingestionApi,
  ApiDataProvider,
  ApiCSVParseResult,
  ApiNormalizedTransaction,
  ApiDemoIngestionResult,
} from "../services/api";

type TxScreen = "list" | "detail" | "add" | "edit" | "search" | "categories" | "csv_import" | "demo_ingest";

const categoryIcons: Record<string, string> = {
  "Food & Drink": "🍔",
  "Housing": "🏠",
  "Utilities": "⚡",
  "Transportation": "🚗",
  "Groceries": "🛒",
  "Entertainment": "🎬",
  "Shopping": "🛍️",
  "Health & Medical": "💊",
  "Insurance": "🛡️",
  "Salary": "💰",
  "Investments": "📈",
  "Other": "💸",
};

const sampleCsvTemplate = `Date,Description,Amount,Type,Category,Reference
2026-08-15,Whole Foods Market,84.50,expense,Groceries,REF-WF-9921
2026-08-15,Swiggy Food Delivery,28.00,expense,Food & Drink,REF-SW-8812
2026-08-14,Uber Ride Metro,19.50,expense,Transportation,REF-UB-7711
2026-08-14,Direct Deposit Salary,3200.00,income,Salary,SAL-AUG-001
2026-08-13,Netflix Subscription,15.99,expense,Entertainment,SUB-NF-1029`;

export function Transactions() {
  const {
    transactions,
    accounts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    convertAndFormat,
    refreshFinancialData,
    addNotification,
  } = useApp();

  const [screen, setScreen] = useState<TxScreen>("list");
  const [selectedTx, setSelectedTx] = useState<any | null>(transactions[0] || null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [txError, setTxError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Add Form State
  const [newTx, setNewTx] = useState({
    merchant: "",
    amount: "",
    category: "Groceries",
    accountId: accounts[0]?.id || "",
    account: accounts[0]?.name || "",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "expense" | "income",
    notes: "",
  });

  // Manual Edit Form State
  const [editTx, setEditTx] = useState({
    merchant: "",
    amount: "",
    category: "Groceries",
    accountId: "",
    account: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "expense" | "income",
    notes: "",
  });

  // CSV Import State
  const [csvText, setCsvText] = useState(sampleCsvTemplate);
  const [csvTargetAccount, setCsvTargetAccount] = useState(accounts[0]?.id || "");
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [csvParseResult, setCsvParseResult] = useState<ApiCSVParseResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportSuccess, setCsvImportSuccess] = useState<string | null>(null);

  // Demo Ingestion State
  const [providers, setProviders] = useState<ApiDataProvider[]>([]);
  const [demoMerchant, setDemoMerchant] = useState("Swiggy Order #8921");
  const [demoAmount, setDemoAmount] = useState("450");
  const [demoType, setDemoType] = useState<"expense" | "income">("expense");
  const [demoAccount, setDemoAccount] = useState(accounts[0]?.id || "");
  const [isIngestingDemo, setIsIngestingDemo] = useState(false);
  const [lastDemoResult, setLastDemoResult] = useState<ApiDemoIngestionResult | null>(null);

  // Load registered providers
  useEffect(() => {
    ingestionApi.getProviders().then(setProviders).catch(console.error);
  }, []);

  // Update default accounts when accounts load
  useEffect(() => {
    if (accounts.length > 0) {
      if (!newTx.accountId) setNewTx(p => ({ ...p, accountId: accounts[0].id, account: accounts[0].name }));
      if (!csvTargetAccount) setCsvTargetAccount(accounts[0].id);
      if (!demoAccount) setDemoAccount(accounts[0].id);
    }
  }, [accounts]);

  const filtered = transactions.filter(tx => {
    const matchSearch =
      (tx.merchant || tx.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === "All" || tx.category.toLowerCase() === filterCat.toLowerCase();
    return matchSearch && matchCat;
  });

  const totalExpenseUSD = transactions
    .filter(t => t.amount < 0 || t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncomeUSD = transactions
    .filter(t => t.amount > 0 || t.type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netUSD = totalIncomeUSD - totalExpenseUSD;

  // ─── CSV Handling ──────────────────────────────────────────────────────────
  const handleParseCsv = async () => {
    if (!csvText.trim()) {
      setTxError("Please enter or paste valid CSV content");
      return;
    }
    setIsParsingCsv(true);
    setTxError(null);
    try {
      const res = await ingestionApi.parseCsv(csvText, csvTargetAccount || undefined);
      setCsvParseResult(res);
    } catch (err: any) {
      setTxError(err.message || "Failed to parse CSV file");
    } finally {
      setIsParsingCsv(false);
    }
  };

  const handleConfirmCsvImport = async () => {
    if (!csvParseResult || csvParseResult.rows.length === 0) return;
    if (!csvTargetAccount) {
      setTxError("Please select a target account for imported transactions.");
      return;
    }
    setIsImportingCsv(true);
    setTxError(null);
    try {
      const res = await ingestionApi.confirmCsvImport(
        csvParseResult.rows,
        csvTargetAccount,
        skipDuplicates
      );
      await refreshFinancialData();
      addNotification({
        id: "notif_csv_" + Date.now(),
        type: "transaction",
        message: `📥 Ingested ${res.importedCount} transactions from CSV into ${res.accountName}.`,
        time: "Just now",
        read: false,
      });
      setCsvImportSuccess(`Successfully imported ${res.importedCount} transactions! (${res.skippedDuplicatesCount} skipped as duplicates).`);
      setCsvParseResult(null);
      setTimeout(() => {
        setCsvImportSuccess(null);
        setScreen("list");
      }, 1800);
    } catch (err: any) {
      setTxError(err.message || "Failed to confirm CSV import");
    } finally {
      setIsImportingCsv(false);
    }
  };

  // ─── Demo Ingestion Handling ───────────────────────────────────────────────
  const handleSimulateDemo = async (presetMerchant?: string, presetAmount?: string, presetType?: "expense" | "income") => {
    const merchantToSend = presetMerchant || demoMerchant;
    const amountToSend = parseFloat(presetAmount || demoAmount);
    const typeToSend = presetType || demoType;

    if (!merchantToSend.trim() || isNaN(amountToSend) || amountToSend <= 0) {
      setTxError("Please specify a valid merchant name and positive amount.");
      return;
    }

    setIsIngestingDemo(true);
    setTxError(null);
    try {
      const res = await ingestionApi.simulateDemo({
        merchant: merchantToSend,
        amount: amountToSend,
        type: typeToSend,
        accountId: demoAccount || undefined,
        source: "demo",
      });

      setLastDemoResult(res);
      await refreshFinancialData();

      addNotification({
        id: "notif_demo_" + Date.now(),
        type: res.notification.type,
        message: `${res.notification.title}: ${res.notification.message}`,
        time: "Just now",
        read: false,
      });
    } catch (err: any) {
      setTxError(err.message || "Automated ingestion simulation failed");
    } finally {
      setIsIngestingDemo(false);
    }
  };

  // ─── SCREEN 1: Transaction List ────────────────────────────────────────────
  if (screen === "list") {
    const grouped: Record<string, typeof transactions> = {};
    filtered.forEach(tx => {
      const dateKey = tx.date || "Recent";
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(tx);
    });

    return (
      <div className="flex flex-col gap-4 pb-6 select-none font-sans">
        {/* Header with Ingestion & Creation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Transactions Ledger</h2>
            <p className="text-xs text-muted-foreground">PostgreSQL verified ledger with automated ingestion pipeline</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setTxError(null); setScreen("demo_ingest"); }}
              className="px-3 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 hover:bg-violet-600/25 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Automated Data Ingestion & Demo Simulator"
            >
              <span>⚡</span>
              <span>Auto Ingestion</span>
            </button>
            <button
              onClick={() => { setTxError(null); setCsvParseResult(null); setScreen("csv_import"); }}
              className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Import Bank / UPI CSV Statement"
            >
              <span>📥</span>
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => { setTxError(null); setScreen("search"); }}
              className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition text-sm"
              title="Search transactions"
            >
              🔍
            </button>
            <button
              onClick={() => {
                setTxError(null);
                setNewTx({
                  merchant: "",
                  amount: "",
                  category: "Groceries",
                  accountId: accounts[0]?.id || "",
                  account: accounts[0]?.name || "",
                  date: new Date().toISOString().split("T")[0],
                  type: "expense",
                  notes: "",
                });
                setScreen("add");
              }}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-primary/20 hover:opacity-90 transition"
              title="Record manual transaction"
            >
              <span>+</span>
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categories.slice(0, 6)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                filterCat === cat ? "bg-primary text-white font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setScreen("categories")}
            className="px-3 py-1.5 rounded-lg text-xs bg-secondary text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0"
          >
            All categories →
          </button>
        </div>

        {/* Dynamic Financial Flow Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
            <p className="text-xs text-muted-foreground">Inflows</p>
            <p className="font-mono text-emerald-400 text-sm mt-0.5 font-bold">
              +{convertAndFormat(totalIncomeUSD)}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
            <p className="text-xs text-muted-foreground">Outflows</p>
            <p className="font-mono text-red-400 text-sm mt-0.5 font-bold">
              -{convertAndFormat(totalExpenseUSD)}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center border border-border/40">
            <p className="text-xs text-muted-foreground">Net Cashflow</p>
            <p className={`font-mono text-sm mt-0.5 font-bold ${netUSD >= 0 ? "text-foreground" : "text-red-400"}`}>
              {netUSD >= 0 ? "+" : ""}{convertAndFormat(netUSD)}
            </p>
          </div>
        </div>

        {/* Transactions list or Empty state */}
        {filtered.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl">💳</span>
            <div>
              <p className="text-foreground font-semibold">
                {transactions.length === 0 ? "No transactions recorded yet" : "No matching transactions found"}
              </p>
              <p className="text-muted-foreground text-xs mt-1 max-w-xs">
                {transactions.length === 0
                  ? "Record transactions manually, import a bank CSV, or trigger the automated ingestion pipeline simulator."
                  : `No results for category filter "${filterCat}".`}
              </p>
            </div>
            {transactions.length === 0 && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setScreen("add")}>
                  + Add First Transaction
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setScreen("demo_ingest")}>
                  ⚡ Simulate Automated Ingestion
                </Button>
              </div>
            )}
          </Card>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-muted-foreground text-xs mb-2 font-medium">
                {date !== "Recent" && !isNaN(new Date(date).getTime())
                  ? new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                  : date}
              </p>
              <div className="flex flex-col gap-2">
                {txs.map(tx => (
                  <Card
                    key={tx.id}
                    hover
                    onClick={() => { setSelectedTx(tx); setScreen("detail"); }}
                    className="flex items-center justify-between py-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-base flex-shrink-0">
                        {tx.icon || (tx.type === 'income' ? '💰' : '💳')}
                      </div>
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-foreground text-sm font-medium truncate">{tx.merchant || tx.title}</p>
                          {tx.source && tx.source !== 'manual' && (
                            <Badge
                              variant={tx.source === 'demo' ? 'warning' : tx.source === 'upi' ? 'success' : 'primary'}
                              className="text-[9px] px-1.5 py-0 uppercase font-mono tracking-wider"
                            >
                              {tx.source}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs truncate">
                          {tx.category} · {tx.account || 'Account'}
                        </p>
                      </div>
                    </div>
                    <AmountDisplay amount={tx.amount} />
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // ─── SCREEN 2: CSV Import View ─────────────────────────────────────────────
  if (screen === "csv_import") {
    return (
      <div className="flex flex-col gap-5 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <div>
            <h2 className="text-xl font-bold text-foreground">CSV Statement Ingestion</h2>
            <p className="text-xs text-muted-foreground">Import bank/UPI CSV statement with automated duplicate detection</p>
          </div>
        </div>

        {txError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{txError}</span>
          </div>
        )}

        {csvImportSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <span>✅</span>
            <span>{csvImportSuccess}</span>
          </div>
        )}

        {!csvParseResult ? (
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-semibold text-foreground">Paste CSV Text or Statement Data</label>
              <button
                onClick={() => setCsvText(sampleCsvTemplate)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Insert Sample Bank CSV Template
              </button>
            </div>

            <textarea
              rows={8}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Date,Description,Amount,Type,Category,Reference..."
              className="w-full bg-input-background border border-border rounded-xl p-3 text-xs font-mono text-foreground focus:outline-none focus:border-primary/60"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Target Account for Ingestion</label>
              <select
                value={csvTargetAccount}
                onChange={e => setCsvTargetAccount(e.target.value)}
                className="bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60 text-sm"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({convertAndFormat(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleParseCsv} disabled={isParsingCsv || !csvText.trim()} className="mt-2 py-3">
              {isParsingCsv ? "Analyzing & Validating CSV..." : "Parse & Preview Transactions →"}
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-secondary p-3 rounded-xl border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground">Total Rows</p>
                <p className="font-mono text-base font-bold text-foreground">{csvParseResult.totalRows}</p>
              </div>
              <div className="bg-secondary p-3 rounded-xl border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground">Valid</p>
                <p className="font-mono text-base font-bold text-emerald-400">{csvParseResult.validCount}</p>
              </div>
              <div className="bg-secondary p-3 rounded-xl border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground">Duplicates</p>
                <p className="font-mono text-base font-bold text-amber-400">{csvParseResult.duplicateCount}</p>
              </div>
              <div className="bg-secondary p-3 rounded-xl border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground">Net Outflow</p>
                <p className="font-mono text-base font-bold text-foreground">{convertAndFormat(csvParseResult.totalExpense)}</p>
              </div>
            </div>

            {/* Ingestion Options */}
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Skip Detected Duplicates</p>
                <p className="text-[11px] text-muted-foreground">Prevents inserting transactions that match existing reference IDs or amounts</p>
              </div>
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={e => setSkipDuplicates(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </Card>

            {/* Row-by-Row Preview List */}
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 scrollbar-none">
              {csvParseResult.rows.map((r, i) => (
                <Card key={i} className="p-3 flex items-center justify-between text-xs border border-border/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{categoryIcons[r.category] || "📄"}</span>
                    <div className="truncate min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground truncate">{r.merchant || r.title}</p>
                        {r.isDuplicate && (
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0">DUPLICATE</Badge>
                        )}
                        {!r.isValid && (
                          <Badge variant="danger" className="text-[9px] px-1.5 py-0">INVALID</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {r.date} · Suggested: <strong className="text-foreground">{r.category}</strong>
                        {r.duplicateReason ? ` · ⚠️ ${r.duplicateReason}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold whitespace-nowrap ml-2 ${r.type === 'income' ? 'text-emerald-400' : 'text-foreground'}`}>
                    {r.type === 'income' ? '+' : '-'}{convertAndFormat(r.amount)}
                  </span>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCsvParseResult(null)}
                disabled={isImportingCsv}
                className="flex-1"
              >
                ← Back to Edit
              </Button>
              <Button
                onClick={handleConfirmCsvImport}
                disabled={isImportingCsv || csvParseResult.validCount === 0}
                className="flex-1 py-3"
              >
                {isImportingCsv ? "Ingesting Records..." : `Confirm & Ingest (${csvParseResult.validCount} Items)`}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── SCREEN 3: Automated Ingestion & Demo Simulator ────────────────────────
  if (screen === "demo_ingest") {
    return (
      <div className="flex flex-col gap-6 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>⚡</span> Automated Transaction Ingestion Pipeline
            </h2>
            <p className="text-xs text-muted-foreground">Provider-based architecture for real-time UPI & bank feeds</p>
          </div>
        </div>

        {txError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{txError}</span>
          </div>
        )}

        {/* Data Providers Status Overview */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Registered Financial Providers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map(p => (
              <Card key={p.id} className="p-3.5 border border-border/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-foreground text-xs font-bold">{p.name}</p>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : p.status === 'PREPARED_DEMO' ? 'primary' : 'warning'} className="text-[9px]">
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{p.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap gap-1">
                  {p.capabilities.map(c => (
                    <span key={c} className="text-[9px] px-1.5 py-0.5 bg-secondary/80 rounded text-muted-foreground font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive UPI Simulation Feed */}
        <Card className="p-5 border-violet-500/30 bg-violet-500/5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <h3 className="text-sm font-bold text-foreground">Simulate Incoming UPI Payment Stream</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generates an external UPI transaction event and runs it through the production normalization, classification, duplicate check, and budget synchronization pipeline.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "🍔 Swiggy (₹450)", m: "Swiggy Order #991", a: "450", t: "expense" as const },
              { label: "🚗 Uber Ride (₹280)", m: "Uber Trip Mumbai", a: "280", t: "expense" as const },
              { label: "⚡ Electricity (₹1,850)", m: "State Power Utility", a: "1850", t: "expense" as const },
              { label: "📱 Netflix (₹649)", m: "Netflix India Monthly", a: "649", t: "expense" as const },
              { label: "💰 Salary Wire (₹50,000)", m: "Direct Deposit Salary", a: "50000", t: "income" as const },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => handleSimulateDemo(preset.m, preset.a, preset.t)}
                disabled={isIngestingDemo}
                className="text-xs px-3 py-1.5 bg-secondary border border-border/60 text-foreground hover:border-violet-500/60 rounded-xl transition flex-shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Simulation Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40">
            <Input
              label="Merchant / Raw Description"
              value={demoMerchant}
              onChange={setDemoMerchant}
              placeholder="e.g. Swiggy, Uber, Zara"
            />
            <Input
              label="Amount"
              value={demoAmount}
              onChange={setDemoAmount}
              placeholder="450"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Target Account</label>
              <select
                value={demoAccount}
                onChange={e => setDemoAccount(e.target.value)}
                className="bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60 text-xs"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={() => handleSimulateDemo()}
            disabled={isIngestingDemo}
            className="py-3 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20"
          >
            {isIngestingDemo ? "Processing Ingestion Pipeline..." : "⚡ Ingest Simulated UPI Payment"}
          </Button>
        </Card>

        {/* Live Ingestion Result Stepper */}
        {lastDemoResult && (
          <Card className="p-5 border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Automated Ingestion Pipeline Execution: 100% SUCCESS
                </p>
              </div>
              <Badge variant="success">Stored in PostgreSQL</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-background/60 p-2.5 rounded-xl border border-border/30">
                <p className="text-muted-foreground text-[10px]">Cleaned Merchant</p>
                <p className="font-bold text-foreground mt-0.5">{lastDemoResult.merchant}</p>
              </div>
              <div className="bg-background/60 p-2.5 rounded-xl border border-border/30">
                <p className="text-muted-foreground text-[10px]">Predicted Category</p>
                <p className="font-bold text-primary mt-0.5">{lastDemoResult.category} ({(lastDemoResult.confidence * 100).toFixed(0)}%)</p>
              </div>
              <div className="bg-background/60 p-2.5 rounded-xl border border-border/30">
                <p className="text-muted-foreground text-[10px]">Balance Before → After</p>
                <p className="font-mono font-bold text-foreground mt-0.5">
                  {convertAndFormat(lastDemoResult.balanceBefore)} → {convertAndFormat(lastDemoResult.balanceAfter)}
                </p>
              </div>
              <div className="bg-background/60 p-2.5 rounded-xl border border-border/30">
                <p className="text-muted-foreground text-[10px]">Target Account</p>
                <p className="font-semibold text-foreground mt-0.5 truncate">{lastDemoResult.accountName}</p>
              </div>
            </div>

            {lastDemoResult.budgetStatus && (
              <div className="p-3 bg-secondary/80 rounded-xl border border-border/40 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">
                    {lastDemoResult.budgetStatus.category} Budget Impact:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    Spent {convertAndFormat(lastDemoResult.budgetStatus.spentAfter)} / {convertAndFormat(lastDemoResult.budgetStatus.budgeted)} ({lastDemoResult.budgetStatus.percentUsed}%)
                  </span>
                </div>
                {lastDemoResult.budgetStatus.isOverBudget && (
                  <Badge variant="danger">OVER BUDGET</Badge>
                )}
              </div>
            )}

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-muted-foreground">
              💡 <strong className="text-foreground">AI Ingestion Insight:</strong> {lastDemoResult.aiInsightRecommendation}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ─── SCREEN 4: Transaction Detail ──────────────────────────────────────────
  if (screen === "detail") {
    if (!selectedTx) {
      setScreen("list");
      return null;
    }

    const tx = selectedTx;
    const isExpense = tx.amount < 0 || tx.type === "expense";
    const absAmount = Math.abs(tx.amount);

    const handleStartEdit = () => {
      setEditTx({
        merchant: tx.merchant || tx.title || "",
        amount: String(absAmount),
        category: tx.category || "Other",
        accountId: tx.accountId || (accounts.find(a => a.name === tx.account)?.id || ""),
        account: tx.account || (accounts[0]?.name || ""),
        date: tx.date || new Date().toISOString().split("T")[0],
        type: isExpense ? "expense" : "income",
        notes: tx.notes || "",
      });
      setTxError(null);
      setScreen("edit");
    };

    const handleDelete = async () => {
      if (!window.confirm(`Are you sure you want to delete this transaction for "${tx.merchant || tx.title}"?`)) {
        return;
      }
      setIsSubmitting(true);
      setTxError(null);
      try {
        await deleteTransaction(tx.id);
        setScreen("list");
      } catch (err: any) {
        setTxError(err.message || "Failed to delete transaction");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold text-foreground">Transaction Details</h2>
        </div>

        {txError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{txError}</span>
          </div>
        )}

        <div className="bg-secondary rounded-2xl p-6 text-center border border-border/40">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-2xl mx-auto mb-3">
            {tx.icon || (isExpense ? "💳" : "💰")}
          </div>
          <p className="text-xl font-bold text-foreground">{tx.merchant || tx.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tx.category} · {tx.date}</p>
          <p className={`font-mono text-3xl font-extrabold mt-3 ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
            {isExpense ? "-" : "+"}{convertAndFormat(absAmount)}
          </p>
          {tx.source && (
            <div className="flex justify-center mt-2">
              <Badge variant={tx.source === 'demo' ? 'warning' : tx.source === 'upi' ? 'success' : 'primary'} className="text-[10px] uppercase font-mono">
                Source: {tx.source}
              </Badge>
            </div>
          )}
        </div>

        <Card className="p-4 flex flex-col gap-3 text-xs">
          <div className="flex justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Account</span>
            <span className="text-foreground font-semibold">{tx.account || "Checking"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="success">Cleared</Badge>
          </div>
          {tx.externalTransactionId && (
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-muted-foreground">External Ref</span>
              <span className="text-foreground font-mono">{tx.externalTransactionId}</span>
            </div>
          )}
          {tx.notes && (
            <div className="flex flex-col gap-1 py-1">
              <span className="text-muted-foreground">Notes</span>
              <p className="text-foreground bg-background/50 p-2 rounded-lg">{tx.notes}</p>
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleStartEdit} className="flex-1">
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Deleting..." : "🗑️ Delete"}
          </Button>
        </div>
      </div>
    );
  }

  // ─── SCREEN 5: Add Transaction ─────────────────────────────────────────────
  if (screen === "add") {
    const handleSave = async () => {
      const amt = parseFloat(newTx.amount);
      if (isNaN(amt) || amt <= 0) {
        setTxError("Please enter a valid positive amount");
        return;
      }
      if (!newTx.merchant.trim()) {
        setTxError("Please enter a merchant or transaction title");
        return;
      }

      setIsSubmitting(true);
      setTxError(null);
      try {
        const icon = categoryIcons[newTx.category] || (newTx.type === "income" ? "💰" : "💳");

        await addTransaction({
          merchant: newTx.merchant.trim(),
          title: newTx.merchant.trim(),
          amount: amt,
          type: newTx.type,
          category: newTx.category,
          account: newTx.account,
          accountId: newTx.accountId || undefined,
          date: newTx.date,
          icon,
          notes: newTx.notes,
        });

        setScreen("list");
      } catch (err: any) {
        setTxError(err.message || "Failed to create transaction");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold text-foreground">Record Transaction</h2>
        </div>

        {txError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{txError}</span>
          </div>
        )}

        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {(["expense", "income"] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setNewTx(p => ({ ...p, type: t }))}
              className={`flex-1 py-2.5 rounded-lg text-xs capitalize transition-all font-medium ${
                newTx.type === t ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "expense" ? "💸 Expense" : "💰 Income"}
            </button>
          ))}
        </div>

        <div className="bg-secondary rounded-2xl p-6 text-center border border-border/40">
          <p className="text-muted-foreground text-xs mb-2">Amount</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground text-3xl font-semibold">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={newTx.amount}
              onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))}
              className="bg-transparent text-4xl font-mono text-foreground font-extrabold w-48 text-center focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Input
              label="Merchant / Title"
              placeholder="e.g. Swiggy, Uber, Whole Foods, Netflix"
              value={newTx.merchant}
              onChange={async v => {
                setNewTx(p => ({ ...p, merchant: v }));
                if (v.trim().length >= 3) {
                  try {
                    const res = await aiApi.suggestCategory(v);
                    if (res?.category && categories.includes(res.category as any)) {
                      setNewTx(p => ({ ...p, category: res.category }));
                    }
                  } catch (e) {
                    // silent fallback
                  }
                }
              }}
            />
            <p className="text-[11px] text-muted-foreground mt-1">🤖 AI auto-detects and suggests category as you type.</p>
          </div>
          <Select
            label="Category"
            value={newTx.category}
            onChange={v => setNewTx(p => ({ ...p, category: v }))}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Target Account</label>
            <select
              value={newTx.accountId || (accounts.find(a => a.name === newTx.account)?.id || "")}
              onChange={e => {
                const accId = e.target.value;
                const matched = accounts.find(a => a.id === accId);
                setNewTx(p => ({ ...p, accountId: accId, account: matched ? matched.name : "" }));
              }}
              className="bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60 text-xs"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({convertAndFormat(a.balance)})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={newTx.date}
            onChange={v => setNewTx(p => ({ ...p, date: v }))}
          />
          <Input
            label="Notes (Optional)"
            placeholder="Add memo or transaction details..."
            value={newTx.notes}
            onChange={v => setNewTx(p => ({ ...p, notes: v }))}
          />
        </div>

        <Button onClick={handleSave} disabled={isSubmitting} className="py-3 mt-2">
          {isSubmitting ? "Saving to PostgreSQL..." : "Save Transaction"}
        </Button>
      </div>
    );
  }

  // ─── SCREEN 6: Edit Transaction ────────────────────────────────────────────
  if (screen === "edit") {
    const handleUpdate = async () => {
      const amt = parseFloat(editTx.amount);
      if (isNaN(amt) || amt <= 0) {
        setTxError("Please enter a valid positive amount");
        return;
      }
      if (!editTx.merchant.trim()) {
        setTxError("Please enter a merchant or transaction title");
        return;
      }

      setIsSubmitting(true);
      setTxError(null);
      try {
        const icon = categoryIcons[editTx.category] || (editTx.type === "income" ? "💰" : "💳");

        await updateTransaction(selectedTx.id, {
          merchant: editTx.merchant.trim(),
          title: editTx.merchant.trim(),
          amount: amt,
          type: editTx.type,
          category: editTx.category,
          account: editTx.account,
          accountId: editTx.accountId || undefined,
          date: editTx.date,
          icon,
          notes: editTx.notes,
        });

        setScreen("list");
      } catch (err: any) {
        setTxError(err.message || "Failed to update transaction");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("detail")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold text-foreground">Edit Transaction</h2>
        </div>

        {txError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{txError}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="Merchant / Title"
            value={editTx.merchant}
            onChange={v => setEditTx(p => ({ ...p, merchant: v }))}
          />
          <Input
            label="Amount"
            type="number"
            value={editTx.amount}
            onChange={v => setEditTx(p => ({ ...p, amount: v }))}
          />
          <Select
            label="Category"
            value={editTx.category}
            onChange={v => setEditTx(p => ({ ...p, category: v }))}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <Input
            label="Date"
            type="date"
            value={editTx.date}
            onChange={v => setEditTx(p => ({ ...p, date: v }))}
          />
          <Input
            label="Notes"
            value={editTx.notes}
            onChange={v => setEditTx(p => ({ ...p, notes: v }))}
          />
        </div>

        <Button onClick={handleUpdate} disabled={isSubmitting} className="py-3 mt-2">
          {isSubmitting ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    );
  }

  // ─── SCREEN 7: Search ──────────────────────────────────────────────────────
  if (screen === "search") {
    return (
      <div className="flex flex-col gap-4 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <Input
            placeholder="Search by merchant, category, or note..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map(tx => (
            <Card
              key={tx.id}
              hover
              onClick={() => { setSelectedTx(tx); setScreen("detail"); }}
              className="flex items-center justify-between py-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-base flex-shrink-0">
                  {tx.icon || (tx.type === 'income' ? '💰' : '💳')}
                </div>
                <div className="truncate min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{tx.merchant || tx.title}</p>
                  <p className="text-muted-foreground text-xs truncate">
                    {tx.category} · {tx.date}
                  </p>
                </div>
              </div>
              <AmountDisplay amount={tx.amount} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── SCREEN 8: Categories Breakdown ────────────────────────────────────────
  if (screen === "categories") {
    const catTotals: Record<string, number> = {};
    transactions.forEach(tx => {
      catTotals[tx.category] = (catTotals[tx.category] || 0) + Math.abs(tx.amount);
    });

    return (
      <div className="flex flex-col gap-4 pb-6 font-sans">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold text-foreground">Categories Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map(c => (
            <Card
              key={c}
              hover
              onClick={() => { setFilterCat(c); setScreen("list"); }}
              className="p-3.5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{categoryIcons[c] || "📄"}</span>
                <div>
                  <p className="text-foreground text-xs font-bold">{c}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {transactions.filter(t => t.category === c).length} transactions
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs font-bold text-foreground">
                {convertAndFormat(catTotals[c] || 0)}
              </p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
