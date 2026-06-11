import { useState } from "react";
import { Card, Badge, AmountDisplay, Button, Input, Select } from "../components/ui";
import { categories } from "../data/mockData";
import { useApp } from "../context/AppContext";

type TxScreen = "list" | "detail" | "add" | "edit" | "search" | "categories";

export function Transactions() {
  const { transactions, accounts, addTransaction, convertAndFormat } = useApp();
  const [screen, setScreen] = useState<TxScreen>("list");
  const [selectedTx, setSelectedTx] = useState(transactions[0] || { id: "tx1", date: "2026-06-11", merchant: "Starbucks", category: "Food & Drink", amount: -4.50, account: "Chase Checking", icon: "☕", status: "cleared" });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [newTx, setNewTx] = useState({ merchant: "", amount: "", category: "Groceries", account: accounts[0]?.name || "Chase Checking", date: "2026-06-11", type: "expense" });

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.merchant.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || tx.category === filterCat;
    return matchSearch && matchCat;
  });

  const catCounts: Record<string, number> = {};
  const catTotals: Record<string, number> = {};
  transactions.forEach(tx => {
    catCounts[tx.category] = (catCounts[tx.category] || 0) + 1;
    catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
  });

  // Screen 9: Transaction List
  if (screen === "list") {
    const grouped: Record<string, typeof transactions> = {};
    filtered.forEach(tx => {
      if (!grouped[tx.date]) grouped[tx.date] = [];
      grouped[tx.date].push(tx);
    });
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Transactions</h2>
          <div className="flex gap-2">
            <button onClick={() => setScreen("search")} className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
              🔍
            </button>
            <button onClick={() => setScreen("add")} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
              +
            </button>
          </div>
        </div>
        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categories.slice(0, 6)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex-shrink-0 transition-all ${filterCat === cat ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setScreen("categories")}
            className="px-3 py-1.5 rounded-lg text-sm bg-secondary text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0"
          >
            All categories →
          </button>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="font-mono text-emerald-400 text-sm mt-0.5 font-bold">
              +{convertAndFormat(transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0))}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="font-mono text-red-400 text-sm mt-0.5 font-bold">
              -{convertAndFormat(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0))}
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Net</p>
            <p className="font-mono text-foreground text-sm mt-0.5 font-bold">
              {transactions.reduce((sum, t) => sum + t.amount, 0) >= 0 ? "+" : ""}
              {convertAndFormat(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </p>
          </div>
        </div>
        {/* Grouped transactions */}
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="text-muted-foreground text-xs mb-2">{new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            <div className="flex flex-col gap-2">
              {txs.map(tx => (
                <Card
                  key={tx.id}
                  hover
                  onClick={() => { setSelectedTx(tx); setScreen("detail"); }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">{tx.icon}</div>
                    <div>
                      <p className="text-foreground text-sm">{tx.merchant}</p>
                      <p className="text-muted-foreground text-xs">{tx.category} · {tx.account}</p>
                    </div>
                  </div>
                  <AmountDisplay amount={tx.amount} />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Screen 10: Transaction Detail
  if (screen === "detail") {
    const tx = selectedTx;
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Transaction Detail</h2>
          <button onClick={() => setScreen("edit")} className="ml-auto text-primary text-sm font-semibold">Edit</button>
        </div>
        <div className="flex flex-col items-center py-8 gap-3 bg-secondary rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-3xl">{tx.icon}</div>
          <h3 className="text-xl font-semibold">{tx.merchant}</h3>
          <p className={`font-mono text-3xl font-extrabold ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {tx.amount >= 0 ? "+" : ""}{convertAndFormat(tx.amount)}
          </p>
          <Badge variant={tx.status === "cleared" ? "success" : "warning"}>{tx.status}</Badge>
        </div>
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {[
              { label: "Date", value: new Date(tx.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
              { label: "Category", value: tx.category },
              { label: "Account", value: tx.account },
              { label: "Status", value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
              { label: "Transaction ID", value: `#${tx.id.toUpperCase()}` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <span className="text-muted-foreground text-sm">{row.label}</span>
                <span className="text-foreground text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <p className="text-amber-400 text-sm font-semibold mb-1">🤖 AI Note</p>
          <p className="text-muted-foreground text-sm leading-relaxed">This transaction is categorized as {tx.category}. It represents {((Math.abs(tx.amount) / 2723) * 100).toFixed(1)}% of your typical monthly expenses.</p>
        </Card>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setScreen("edit")}>✏️ Edit</Button>
          <Button variant="danger" fullWidth onClick={() => setScreen("list")}>🗑️ Delete</Button>
        </div>
      </div>
    );
  }

  // Screen 11: Add Transaction
  if (screen === "add") {
    const handleSave = () => {
      const amt = parseFloat(newTx.amount);
      if (isNaN(amt) || amt <= 0) return;
      const finalAmt = newTx.type === "expense" ? -amt : amt;

      const categoryIcons: Record<string, string> = {
        "Food & Drink": "🍔",
        "Housing": "🏠",
        "Utilities": "⚡",
        "Transportation": "🚗",
        "Groceries": "🛒",
        "Entertainment": "🎬",
        "Shopping": "🛍️",
        "Insurance": "🛡️",
        "Salary": "💰",
        "Investments": "📈",
      };

      addTransaction({
        merchant: newTx.merchant,
        amount: finalAmt,
        category: newTx.category,
        account: newTx.account,
        icon: categoryIcons[newTx.category] || "💸",
        status: "cleared",
      });

      setNewTx({
        merchant: "",
        amount: "",
        category: "Groceries",
        account: accounts[0]?.name || "Chase Checking",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
      });
      setScreen("list");
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Add Transaction</h2>
        </div>
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {["expense", "income"].map(t => (
            <button
              key={t}
              onClick={() => setNewTx(p => ({ ...p, type: t }))}
              className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${newTx.type === t ? "bg-card text-foreground shadow font-semibold" : "text-muted-foreground"}`}
            >
              {t === "expense" ? "💸 Expense" : "💰 Income"}
            </button>
          ))}
        </div>
        <div className="bg-secondary rounded-2xl p-6 text-center shadow-inner">
          <p className="text-muted-foreground text-sm mb-2">Amount</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground text-3xl font-semibold">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={newTx.amount}
              onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))}
              className="bg-transparent text-4xl font-mono text-foreground font-extrabold w-40 text-center focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Input label="Merchant / Description" placeholder="e.g. Whole Foods Market" value={newTx.merchant} onChange={v => setNewTx(p => ({ ...p, merchant: v }))} />
          <Select
            label="Category"
            value={newTx.category}
            onChange={v => setNewTx(p => ({ ...p, category: v }))}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <Select
            label="Account"
            value={newTx.account}
            onChange={v => setNewTx(p => ({ ...p, account: v }))}
            options={accounts.map(a => ({ value: a.name, label: a.name }))}
          />
          <Input label="Date" type="date" value={newTx.date} onChange={v => setNewTx(p => ({ ...p, date: v }))} />
        </div>
        <Button fullWidth size="lg" disabled={!newTx.merchant || !newTx.amount} onClick={handleSave}>
          Save Transaction
        </Button>
      </div>
    );
  }

  // Screen 12: Edit Transaction
  if (screen === "edit") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("detail")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Edit Transaction</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Input label="Merchant / Description" value={selectedTx.merchant} onChange={() => {}} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                defaultValue={Math.abs(selectedTx.amount)}
                className="w-full bg-input-background border border-border rounded-lg py-2.5 pl-7 pr-3 text-foreground focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>
          <Select
            label="Category"
            value={selectedTx.category}
            onChange={() => {}}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <Select
            label="Account"
            value={selectedTx.account}
            onChange={() => {}}
            options={accounts.map(a => ({ value: a.name, label: a.name }))}
          />
          <Input label="Date" type="date" value={selectedTx.date} onChange={() => {}} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Notes (optional)</label>
            <textarea
              placeholder="Add a note..."
              className="w-full bg-input-background border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 resize-none h-20"
            />
          </div>
        </div>
        <Button fullWidth size="lg" onClick={() => setScreen("detail")}>Save Changes</Button>
      </div>
    );
  }

  // Screen 13: Transaction Search
  if (screen === "search") {
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <div className="flex-1">
            <Input
              placeholder="Search merchants, categories..."
              value={search}
              onChange={setSearch}
              icon="🔍"
            />
          </div>
        </div>
        {search && (
          <p className="text-muted-foreground text-sm">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</p>
        )}
        {!search && (
          <div>
            <p className="text-muted-foreground text-xs mb-3">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {["Starbucks", "Groceries", "Amazon", "Netflix"].map(s => (
                <button
                  key={s}
                  onClick={() => setSearch(s)}
                  className="px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {(search ? filtered : transactions.slice(0, 8)).map(tx => (
            <Card
              key={tx.id}
              hover
              onClick={() => { setSelectedTx(tx); setScreen("detail"); }}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">{tx.icon}</div>
                <div>
                  <p className="text-foreground text-sm">{tx.merchant}</p>
                  <p className="text-muted-foreground text-xs">{tx.date} · {tx.category}</p>
                </div>
              </div>
              <AmountDisplay amount={tx.amount} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 14: Categories
  if (screen === "categories") {
    const cats = Object.entries(catCounts).map(([cat, count]) => ({
      cat,
      count,
      total: catTotals[cat],
    })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("list")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Categories</h2>
        </div>
        <p className="text-muted-foreground text-sm">Your spending breakdown by category this month.</p>
        <div className="flex flex-col gap-2">
          {cats.map(({ cat, count, total }) => {
            const pct = Math.abs(total) / 4823 * 100;
            return (
              <Card
                key={cat}
                hover
                onClick={() => { setFilterCat(cat); setScreen("list"); }}
                className="py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{transactions.find(t => t.category === cat)?.icon || "💰"}</span>
                    <span className="text-foreground text-sm">{cat}</span>
                    <span className="text-muted-foreground text-xs">({count})</span>
                  </div>
                  <AmountDisplay amount={total} />
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
