import { useState } from "react";
import { Card, Badge, Button, Input, Select, Toggle } from "../components/ui";
import { mockBills, mockSubscriptions } from "../data/mockData";
import { useApp } from "../context/AppContext";

type BillScreen = "overview" | "subscriptions" | "detail" | "add";

export function Bills() {
  const { convertAndFormat, addNotification } = useApp();
  const [screen, setScreen] = useState<BillScreen>("overview");
  const [bills, setBills] = useState(mockBills);
  const [selectedBill, setSelectedBill] = useState(mockBills[0]);
  const [autopay, setAutopay] = useState<Record<string, boolean>>(Object.fromEntries(mockBills.map(b => [b.id, b.autopay])));
  const [addForm, setAddForm] = useState({ name: "", amount: "", dueDay: "1", category: "Utilities" });

  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);
  const totalSubs = mockSubscriptions.reduce((s, b) => s + b.amount, 0);

  // Screen 35: Bills Overview
  if (screen === "overview") {
    const today = 11;
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Bills</h2>
          <div className="flex gap-2">
            <button onClick={() => setScreen("subscriptions")} className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground">Subscriptions</button>
            <button onClick={() => setScreen("add")} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">+</button>
          </div>
        </div>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-amber-400 text-sm font-semibold">📅 Due Soon</p>
            <Badge variant="warning">2 upcoming</Badge>
          </div>
          <p className="text-foreground font-medium">Electric Bill due in 4 days ({convertAndFormat(142.50)})</p>
          <p className="text-muted-foreground text-xs mt-1">Jun 15 — Chase Checking — Autopay ON</p>
        </Card>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-semibold">Monthly Bills</h3>
            <p className="text-muted-foreground text-xs font-mono font-semibold">{convertAndFormat(totalMonthly)}/mo total</p>
          </div>
          {[...bills].sort((a, b) => a.dueDay - b.dueDay).map(bill => {
            const daysLeft = bill.dueDay - today;
            const isPast = daysLeft < 0;
            return (
              <Card key={bill.id} hover onClick={() => { setSelectedBill(bill); setScreen("detail"); }} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: bill.color + "20", border: `1px solid ${bill.color}20` }}>
                    {bill.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground text-sm font-semibold">{bill.name}</p>
                      <p className="font-mono text-foreground text-sm font-bold">{convertAndFormat(bill.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-muted-foreground text-xs">
                        Due {isPast ? "Jun " + bill.dueDay + " (paid)" : `Jun ${bill.dueDay} (${daysLeft}d)`}
                      </p>
                      <div className="flex gap-1">
                        {autopay[bill.id] && <Badge variant="success">Autopay</Badge>}
                        {isPast && <Badge variant="neutral">Paid</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center py-4">
            <p className="text-muted-foreground text-xs mb-1">Bills/month</p>
            <p className="font-mono text-foreground font-bold">{convertAndFormat(totalMonthly)}</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-muted-foreground text-xs mb-1">Subscriptions/mo</p>
            <p className="font-mono text-foreground font-bold">{convertAndFormat(totalSubs)}</p>
          </Card>
        </div>
      </div>
    );
  }

  // Screen 36: Subscription Manager
  if (screen === "subscriptions") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Subscriptions</h2>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <p className="text-primary text-sm font-semibold mb-1">💡 AI Tip</p>
          <p className="text-muted-foreground text-sm">You could save {convertAndFormat(26)}/month by switching to Apple One Family instead of Netflix + Spotify + Apple Music separately.</p>
        </Card>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{mockSubscriptions.length} active subscriptions</p>
          <p className="font-mono text-foreground font-bold">{convertAndFormat(totalSubs)}/mo · {convertAndFormat(totalSubs * 12)}/yr</p>
        </div>
        <div className="flex flex-col gap-3">
          {mockSubscriptions.map(sub => (
            <Card key={sub.id} className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: sub.color + "20", border: `1px solid ${sub.color}20` }}>
                {sub.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-foreground text-sm font-semibold">{sub.name}</p>
                  <p className="font-mono text-foreground text-sm font-bold">{convertAndFormat(sub.amount)}/mo</p>
                </div>
                <p className="text-muted-foreground text-xs">Next bill: {sub.nextBill} · {sub.category}</p>
              </div>
              <button className="text-muted-foreground hover:text-destructive transition-colors text-sm font-semibold">Cancel</button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 37: Bill Detail
  if (screen === "detail") {
    const b = selectedBill;
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">{b.name}</h2>
          <button className="ml-auto text-primary text-sm font-semibold">Edit</button>
        </div>
        <div className="flex flex-col items-center py-8 bg-secondary rounded-2xl gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: b.color + "20", border: `1px solid ${b.color}30` }}>
            {b.icon}
          </div>
          <p className="font-mono text-4xl font-extrabold text-foreground">{convertAndFormat(b.amount)}</p>
          <p className="text-muted-foreground text-sm">Due every month on the {b.dueDay}th</p>
        </div>
        <Card>
          {[
            { label: "Category", value: b.category },
            { label: "Next Due Date", value: `June ${b.dueDay}, 2026` },
            { label: "Account", value: "Chase Checking ••••4521" },
            { label: "Annual Total", value: convertAndFormat(b.amount * 12) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="text-muted-foreground text-sm">{row.label}</span>
              <span className="text-foreground text-sm font-semibold">{row.value}</span>
            </div>
          ))}
        </Card>
        <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
          <div>
            <p className="text-foreground text-sm font-semibold">Autopay</p>
            <p className="text-muted-foreground text-xs">Never miss a payment</p>
          </div>
          <Toggle checked={autopay[b.id]} onChange={v => setAutopay(prev => ({ ...prev, [b.id]: v }))} />
        </div>
        <div>
          <h3 className="text-foreground mb-3 font-semibold text-sm">Payment History</h3>
          {["May 1", "Apr 1", "Mar 1"].map(d => (
            <Card key={d} className="flex items-center justify-between py-2.5 mb-2">
              <span className="text-muted-foreground text-sm">{d}, 2026</span>
              <div className="flex items-center gap-2">
                <Badge variant="success">Paid</Badge>
                <span className="font-mono text-foreground text-sm font-semibold">{convertAndFormat(b.amount)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Screen 38: Add Bill
  if (screen === "add") {
    const form = addForm;
    const setForm = setAddForm;

    const handleAdd = () => {
      const amt = parseFloat(form.amount);
      if (isNaN(amt) || amt <= 0) return;

      const icons: Record<string, string> = {
        "Housing": "🏠",
        "Utilities": "⚡",
        "Insurance": "🛡️",
        "Health": "🏥",
        "Entertainment": "🎬",
        "Other": "📦"
      };

      const newBill = {
        id: "bill_" + Date.now(),
        name: form.name,
        amount: amt,
        dueDay: parseInt(form.dueDay) || 1,
        category: form.category,
        icon: icons[form.category] || "💸",
        color: "#6366f1",
        autopay: true,
      };

      setBills(prev => [newBill, ...prev]);
      addNotification({
        id: "notif_bill_" + Date.now(),
        type: "insight",
        message: `📅 New bill created for ${form.name}! Due on the ${form.dueDay}th of every month.`,
        time: "Just now",
        read: false,
      });

      setForm({ name: "", amount: "", dueDay: "1", category: "Utilities" });
      setScreen("overview");
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Add Bill</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Input label="Bill Name" placeholder="e.g. Electric, Rent, Internet" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-lg py-2.5 pl-7 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>
          <Select
            label="Due Day (of month)"
            value={form.dueDay}
            onChange={v => setForm(p => ({ ...p, dueDay: v }))}
            options={Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} of every month` }))}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={v => setForm(p => ({ ...p, category: v }))}
            options={["Housing", "Utilities", "Insurance", "Health", "Entertainment", "Other"].map(c => ({ value: c, label: c }))}
          />
          <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
            <div>
              <p className="text-foreground text-sm font-semibold">Enable Autopay</p>
              <p className="text-muted-foreground text-xs">Never miss a payment</p>
            </div>
            <Toggle checked={true} onChange={() => {}} />
          </div>
        </div>
        <Button fullWidth size="lg" disabled={!form.name || !form.amount} onClick={handleAdd}>
          Add Bill
        </Button>
      </div>
    );
  }

  return null;
}
