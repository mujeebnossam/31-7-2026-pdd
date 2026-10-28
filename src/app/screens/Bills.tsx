import { useState } from "react";
import { Card, Badge, Button, Input, Select, Toggle } from "../components/ui";
import { useApp, Bill } from "../context/AppContext";

type BillScreen = "overview" | "subscriptions" | "detail" | "add" | "edit";
type FilterTab = "all" | "upcoming" | "overdue" | "paid";

const categoryIcons: Record<string, string> = {
  Housing: "🏠",
  "Rent & Mortgage": "🏠",
  Utilities: "⚡",
  Insurance: "🛡️",
  Health: "🏥",
  "Health & Medical": "💊",
  Entertainment: "🎬",
  Subscriptions: "📱",
  "Internet & Cable": "🌐",
  "Phone & Mobile": "📞",
  "Credit Card": "💳",
  Loan: "🏦",
  Transportation: "🚗",
  Other: "📄",
};

const billPresets = [
  { name: "Electricity", category: "Utilities", icon: "⚡", amount: 120, frequency: "monthly", color: "#8b5cf6" },
  { name: "House Rent", category: "Housing", icon: "🏠", amount: 1500, frequency: "monthly", color: "#ef4444" },
  { name: "High-Speed Internet", category: "Utilities", icon: "🌐", amount: 70, frequency: "monthly", color: "#3b82f6" },
  { name: "Mobile Plan", category: "Utilities", icon: "📞", amount: 45, frequency: "monthly", color: "#06b6d4" },
  { name: "Health Insurance", category: "Insurance", icon: "🛡️", amount: 250, frequency: "monthly", color: "#10b981" },
  { name: "Netflix", category: "Entertainment", icon: "🎬", amount: 15.99, frequency: "monthly", color: "#ec4899" },
  { name: "Spotify Premium", category: "Entertainment", icon: "🎵", amount: 10.99, frequency: "monthly", color: "#10b981" },
  { name: "Amazon Prime", category: "Subscriptions", icon: "📦", amount: 139, frequency: "yearly", color: "#f59e0b" },
];

const billCategories = [
  { value: "Utilities", label: "⚡ Utilities & Power" },
  { value: "Housing", label: "🏠 Housing & Rent" },
  { value: "Insurance", label: "🛡️ Insurance & Security" },
  { value: "Health", label: "🏥 Health & Medical" },
  { value: "Entertainment", label: "🎬 Entertainment & Media" },
  { value: "Subscriptions", label: "📱 Digital Subscriptions" },
  { value: "Transportation", label: "🚗 Transportation & Auto" },
  { value: "Other", label: "📄 Other Bills" },
];

const frequencyOptions = [
  { value: "monthly", label: "Monthly (Every month)" },
  { value: "weekly", label: "Weekly (Every 7 days)" },
  { value: "quarterly", label: "Quarterly (Every 3 months)" },
  { value: "yearly", label: "Yearly (Every 12 months)" },
];

export function Bills() {
  const { bills, accounts, addBill, updateBill, deleteBill, payBill, convertAndFormat, addNotification } = useApp();
  const [screen, setScreen] = useState<BillScreen>("overview");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  const [addForm, setAddForm] = useState({
    name: "",
    amount: "",
    dueDay: "1",
    dueDate: "",
    category: "Utilities",
    frequency: "monthly",
    autopay: false,
    description: "",
    icon: "📄",
    color: "#6366f1",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    amount: "",
    dueDay: "1",
    dueDate: "",
    category: "Utilities",
    frequency: "monthly",
    autopay: false,
    description: "",
    icon: "📄",
    color: "#6366f1",
  });

  const [billError, setBillError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBill = bills.find(b => b.id === selectedBillId) || bills[0] || null;

  // Helper calculations for any bill
  const computeBillMetrics = (b: Bill) => {
    const amount = Number(b.amount) || 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let targetDate: Date;
    if (b.dueDate) {
      targetDate = new Date(b.dueDate);
      if (isNaN(targetDate.getTime())) {
        targetDate = new Date(now.getFullYear(), now.getMonth(), b.dueDay || 1);
      }
    } else if (b.dueDay) {
      targetDate = new Date(now.getFullYear(), now.getMonth(), b.dueDay);
    } else {
      targetDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const isPaid = b.status === "paid";
    const isOverdue = !isPaid && diffDays < 0;
    const isDueToday = !isPaid && diffDays === 0;
    const isDueSoon = !isPaid && diffDays > 0 && diffDays <= 3;
    const isUpcoming = !isPaid && diffDays > 3;

    let statusText = "Upcoming";
    let badgeVariant: "success" | "danger" | "warning" | "primary" | "neutral" = "primary";

    if (isPaid) {
      statusText = "Paid";
      badgeVariant = "success";
    } else if (isOverdue) {
      statusText = `Overdue (${Math.abs(diffDays)}d)`;
      badgeVariant = "danger";
    } else if (isDueToday) {
      statusText = "Due Today";
      badgeVariant = "warning";
    } else if (isDueSoon) {
      statusText = `Due in ${diffDays}d`;
      badgeVariant = "warning";
    } else {
      statusText = `Due in ${diffDays}d`;
      badgeVariant = "primary";
    }

    const freq = (b.frequency || "monthly").toLowerCase();
    let monthlyEquivalent = amount;
    let annualCost = amount * 12;

    if (freq === "weekly") {
      monthlyEquivalent = amount * 4.33;
      annualCost = amount * 52;
    } else if (freq === "quarterly") {
      monthlyEquivalent = amount / 3;
      annualCost = amount * 4;
    } else if (freq === "yearly") {
      monthlyEquivalent = amount / 12;
      annualCost = amount;
    }

    const formattedDueDate = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      amount,
      targetDate,
      diffDays,
      isPaid,
      isOverdue,
      isDueToday,
      isDueSoon,
      isUpcoming,
      statusText,
      badgeVariant,
      monthlyEquivalent,
      annualCost,
      formattedDueDate,
    };
  };

  // Aggregated totals
  const totalMonthlyRecurring = bills.reduce((sum, b) => {
    return sum + computeBillMetrics(b).monthlyEquivalent;
  }, 0);

  const upcomingBills = bills.filter(b => {
    const m = computeBillMetrics(b);
    return !m.isPaid && m.diffDays >= 0;
  });

  const overdueBills = bills.filter(b => {
    const m = computeBillMetrics(b);
    return !m.isPaid && m.diffDays < 0;
  });

  const paidBills = bills.filter(b => {
    const m = computeBillMetrics(b);
    return m.isPaid;
  });

  const dueSoonBills = bills.filter(b => {
    const m = computeBillMetrics(b);
    return !m.isPaid && m.diffDays >= 0 && m.diffDays <= 3;
  });

  const totalAmountDue = upcomingBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalOverdueAmount = overdueBills.reduce((s, b) => s + (Number(b.amount) || 0), 0);

  // Subscriptions filter
  const subscriptionBills = bills.filter(b =>
    b.category.toLowerCase().includes("sub") ||
    b.category.toLowerCase().includes("entertain") ||
    b.frequency === "monthly" ||
    b.frequency === "yearly"
  );
  const totalSubMonthly = subscriptionBills.reduce((s, b) => s + computeBillMetrics(b).monthlyEquivalent, 0);

  // Filtered bills for display
  const displayedBills = bills.filter(b => {
    const m = computeBillMetrics(b);
    if (filterTab === "upcoming") return !m.isPaid && m.diffDays >= 0;
    if (filterTab === "overdue") return !m.isPaid && m.diffDays < 0;
    if (filterTab === "paid") return m.isPaid;
    return true;
  }).sort((a, b) => {
    const ma = computeBillMetrics(a);
    const mb = computeBillMetrics(b);
    if (ma.isOverdue && !mb.isOverdue) return -1;
    if (!ma.isOverdue && mb.isOverdue) return 1;
    return ma.targetDate.getTime() - mb.targetDate.getTime();
  });

  // Action: Mark bill as paid
  const handlePayBill = async (billId: string, billName: string) => {
    setIsSubmitting(true);
    setBillError(null);
    try {
      await payBill(billId, accounts[0]?.id);
      addNotification({
        id: "notif_pay_" + Date.now(),
        type: "success",
        message: `✅ Paid bill "${billName}". Ledger updated & next recurrence scheduled!`,
        time: "Just now",
        read: false,
      });
    } catch (err: any) {
      setBillError(err.message || "Failed to mark bill as paid");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Screen 1: Overview
  if (screen === "overview") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Bills & Subscriptions</h2>
            <p className="text-muted-foreground text-xs">Recurring payments and schedule</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScreen("subscriptions")}
              className="px-3 py-1.5 bg-secondary border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              📱 Subscriptions
            </button>
            <button
              onClick={() => {
                setBillError(null);
                setAddForm({
                  name: "",
                  amount: "",
                  dueDay: "1",
                  dueDate: "",
                  category: "Utilities",
                  frequency: "monthly",
                  autopay: false,
                  description: "",
                  icon: "📄",
                  color: "#6366f1",
                });
                setScreen("add");
              }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow hover:opacity-90 transition"
              title="Add Bill"
            >
              +
            </button>
          </div>
        </div>

        {billError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{billError}</span>
          </div>
        )}

        {/* Overdue Warning Alert Banner */}
        {overdueBills.length > 0 && (
          <Card className="border-red-500/30 bg-red-500/10 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="text-red-400 text-sm font-semibold">
                    {overdueBills.length} Overdue Bill{overdueBills.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Total overdue: <span className="font-mono text-red-400 font-bold">{convertAndFormat(totalOverdueAmount)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterTab("overdue")}
                className="text-xs px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg font-semibold hover:bg-red-500/30 transition"
              >
                View
              </button>
            </div>
          </Card>
        )}

        {/* Due Soon Reminder Banner */}
        {dueSoonBills.length > 0 && overdueBills.length === 0 && (
          <Card className="border-amber-500/20 bg-amber-500/5 py-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm font-semibold">📅 Due in Next 3 Days</p>
                <p className="text-foreground text-xs mt-0.5 font-medium">
                  {dueSoonBills[0].name} ({convertAndFormat(dueSoonBills[0].amount)}) due {computeBillMetrics(dueSoonBills[0]).formattedDueDate}
                </p>
              </div>
              <Badge variant="warning">{dueSoonBills.length} upcoming</Badge>
            </div>
          </Card>
        )}

        {/* Quick Metrics */}
        {bills.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="text-center py-3">
              <p className="text-muted-foreground text-[11px] font-medium">Total Due (Upcoming)</p>
              <p className="font-mono text-base font-extrabold text-foreground mt-0.5">{convertAndFormat(totalAmountDue)}</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-muted-foreground text-[11px] font-medium">Monthly Outflow Est.</p>
              <p className="font-mono text-base font-extrabold text-indigo-400 mt-0.5">{convertAndFormat(totalMonthlyRecurring)}</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-muted-foreground text-[11px] font-medium">Overdue</p>
              <p className="font-mono text-base font-extrabold text-red-400 mt-0.5">{overdueBills.length}</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-muted-foreground text-[11px] font-medium">Paid / Settled</p>
              <p className="font-mono text-base font-extrabold text-emerald-400 mt-0.5">{paidBills.length}</p>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        {bills.length > 0 && (
          <div className="flex gap-1.5 p-1 bg-secondary/80 rounded-xl border border-border/40 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterTab("all")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition whitespace-nowrap ${
                filterTab === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({bills.length})
            </button>
            <button
              onClick={() => setFilterTab("upcoming")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition whitespace-nowrap ${
                filterTab === "upcoming" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming ({upcomingBills.length})
            </button>
            <button
              onClick={() => setFilterTab("overdue")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition whitespace-nowrap ${
                filterTab === "overdue" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overdue ({overdueBills.length})
            </button>
            <button
              onClick={() => setFilterTab("paid")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition whitespace-nowrap ${
                filterTab === "paid" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Paid ({paidBills.length})
            </button>
          </div>
        )}

        {/* Bills List */}
        {bills.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl">📄</span>
            <div>
              <p className="text-foreground font-semibold">No bills or subscriptions yet</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-xs leading-relaxed">
                Add your recurring obligations like rent, electricity, internet, and subscriptions to receive smart due date reminders.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setBillError(null);
                setAddForm({
                  name: "",
                  amount: "",
                  dueDay: "1",
                  dueDate: "",
                  category: "Utilities",
                  frequency: "monthly",
                  autopay: false,
                  description: "",
                  icon: "📄",
                  color: "#6366f1",
                });
                setScreen("add");
              }}
              className="mt-2"
            >
              + Add Your First Bill
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {displayedBills.map(b => {
              const m = computeBillMetrics(b);
              return (
                <Card
                  key={b.id}
                  hover
                  onClick={() => {
                    setSelectedBillId(b.id);
                    setBillError(null);
                    setScreen("detail");
                  }}
                  className="py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${b.color || "#6366f1"}20`, border: `1px solid ${b.color || "#6366f1"}30` }}
                    >
                      {b.icon || categoryIcons[b.category] || "📄"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-foreground text-sm font-semibold truncate">{b.name}</p>
                        <p className="font-mono text-sm font-bold text-foreground flex-shrink-0">
                          {convertAndFormat(m.amount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <p className="truncate">
                          Due {m.formattedDueDate} · <span className="capitalize">{b.frequency || "monthly"}</span>
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          {b.autopay && <Badge variant="success">Autopay</Badge>}
                          <Badge variant={m.badgeVariant}>{m.statusText}</Badge>
                          {!m.isPaid && (
                            <button
                              onClick={() => handlePayBill(b.id, b.name)}
                              disabled={isSubmitting}
                              className="text-[11px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md font-semibold hover:bg-emerald-500/25 transition ml-1"
                              title="Mark as paid"
                            >
                              ✓ Pay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Screen 2: Subscriptions View
  if (screen === "subscriptions") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <div>
            <h2 className="text-xl font-bold">Subscription Manager</h2>
            <p className="text-muted-foreground text-xs">Manage all your recurring software & entertainment</p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <p className="text-primary text-xs font-semibold mb-1">💡 AI Subscription Intelligence</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            You have <span className="text-foreground font-bold">{subscriptionBills.length} active subscriptions</span> totaling{" "}
            <span className="text-indigo-400 font-bold">{convertAndFormat(totalSubMonthly)}/month</span> ({convertAndFormat(totalSubMonthly * 12)}/year). Audit unused plans to optimize monthly savings.
          </p>
        </Card>

        {subscriptionBills.length === 0 ? (
          <Card className="py-10 text-center text-muted-foreground text-xs">
            No active subscriptions categorized yet. Add services like Netflix, Spotify, or cloud storage.
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {subscriptionBills.map(sub => {
              const m = computeBillMetrics(sub);
              return (
                <Card
                  key={sub.id}
                  hover
                  onClick={() => {
                    setSelectedBillId(sub.id);
                    setBillError(null);
                    setScreen("detail");
                  }}
                  className="flex items-center gap-3 py-3 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${sub.color || "#6366f1"}20`, border: `1px solid ${sub.color || "#6366f1"}30` }}
                  >
                    {sub.icon || "📱"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-foreground text-sm font-semibold truncate">{sub.name}</p>
                      <p className="font-mono text-foreground text-sm font-bold flex-shrink-0">
                        {convertAndFormat(sub.amount)}
                        <span className="text-muted-foreground text-xs font-normal">/{sub.frequency === "yearly" ? "yr" : "mo"}</span>
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Next billing: {m.formattedDueDate} · {sub.category}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Screen 3: Add Bill
  if (screen === "add") {
    const handleCreate = async () => {
      const amt = parseFloat(addForm.amount);
      if (!addForm.name.trim()) {
        setBillError("Please enter a bill name");
        return;
      }
      if (isNaN(amt) || amt <= 0) {
        setBillError("Please enter a valid bill amount greater than zero");
        return;
      }

      setIsSubmitting(true);
      setBillError(null);

      try {
        await addBill({
          name: addForm.name.trim(),
          amount: amt,
          dueDay: addForm.dueDay ? parseInt(addForm.dueDay, 10) : 1,
          dueDate: addForm.dueDate || undefined,
          category: addForm.category,
          frequency: addForm.frequency,
          autopay: addForm.autopay,
          description: addForm.description.trim(),
          icon: addForm.icon || categoryIcons[addForm.category] || "📄",
          color: addForm.color || "#6366f1",
        });

        addNotification({
          id: "notif_add_bill_" + Date.now(),
          type: "insight",
          message: `📅 Added recurring bill: ${addForm.name} (${convertAndFormat(amt)}/${addForm.frequency})`,
          time: "Just now",
          read: false,
        });

        setScreen("overview");
      } catch (err: any) {
        setBillError(err.message || "Failed to create bill");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold">Add Recurring Bill</h2>
        </div>

        {billError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{billError}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div>
          <p className="text-muted-foreground text-xs font-medium mb-2">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            {billPresets.map(p => (
              <Card
                key={p.name}
                hover
                onClick={() => {
                  setAddForm(prev => ({
                    ...prev,
                    name: p.name,
                    amount: String(p.amount),
                    category: p.category,
                    frequency: p.frequency,
                    icon: p.icon,
                    color: p.color,
                  }));
                }}
                className={`flex items-center gap-2.5 py-2.5 cursor-pointer ${
                  addForm.name === p.name ? "border-primary/60 bg-primary/10" : ""
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <div className="truncate min-w-0">
                  <p className="text-foreground text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-muted-foreground text-[11px] font-mono">{convertAndFormat(p.amount)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Bill / Service Name *"
            placeholder="e.g. Electric Bill, Rent, Internet"
            value={addForm.name}
            onChange={v => setAddForm(p => ({ ...p, name: v }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Amount ($) *</label>
              <input
                type="number"
                min="1"
                placeholder="0.00"
                value={addForm.amount}
                onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Due Date</label>
              <input
                type="date"
                value={addForm.dueDate}
                onChange={e => setAddForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={addForm.category}
              onChange={v => setAddForm(p => ({ ...p, category: v }))}
              options={billCategories}
            />
            <Select
              label="Billing Frequency"
              value={addForm.frequency}
              onChange={v => setAddForm(p => ({ ...p, frequency: v }))}
              options={frequencyOptions}
            />
          </div>

          <div className="flex items-center justify-between bg-secondary rounded-xl p-4 border border-border/40">
            <div>
              <p className="text-foreground text-sm font-semibold">Enable Autopay</p>
              <p className="text-muted-foreground text-xs">Track whether this bill is paid automatically</p>
            </div>
            <Toggle
              checked={addForm.autopay}
              onChange={v => setAddForm(p => ({ ...p, autopay: v }))}
            />
          </div>

          <Input
            label="Notes / Account Details (Optional)"
            placeholder="Account number, portal login info, or notes"
            value={addForm.description}
            onChange={v => setAddForm(p => ({ ...p, description: v }))}
          />
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={!addForm.name || !addForm.amount || isSubmitting}
          onClick={handleCreate}
        >
          {isSubmitting ? "Creating Bill..." : "Add Bill"}
        </Button>
      </div>
    );
  }

  // Screen 4: Bill Detail
  if (screen === "detail") {
    if (!selectedBill) {
      setScreen("overview");
      return null;
    }

    const b = selectedBill;
    const m = computeBillMetrics(b);

    const handleDelete = async () => {
      if (!window.confirm(`Are you sure you want to delete the bill "${b.name}"?`)) {
        return;
      }
      setIsSubmitting(true);
      setBillError(null);
      try {
        await deleteBill(b.id);
        setScreen("overview");
      } catch (err: any) {
        setBillError(err.message || "Failed to delete bill");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleStartEdit = () => {
      setEditForm({
        id: b.id,
        name: b.name,
        amount: String(b.amount),
        dueDay: String(b.dueDay || 1),
        dueDate: b.dueDate || "",
        category: b.category || "Utilities",
        frequency: b.frequency || "monthly",
        autopay: Boolean(b.autopay),
        description: b.description || "",
        icon: b.icon || "📄",
        color: b.color || "#6366f1",
      });
      setBillError(null);
      setScreen("edit");
    };

    const handleToggleAutopay = async (checked: boolean) => {
      try {
        await updateBill(b.id, { autopay: checked });
      } catch (e) {
        console.error("Failed to toggle autopay", e);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("overview")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold truncate">{b.name}</h2>
          <button onClick={handleStartEdit} className="ml-auto text-primary text-sm font-semibold hover:underline">
            Edit
          </button>
        </div>

        {billError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{billError}</span>
          </div>
        )}

        {/* Hero Card */}
        <div className="flex flex-col items-center py-7 bg-secondary rounded-2xl gap-3 border border-border/40 text-center px-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${b.color || "#6366f1"}20`, border: `1px solid ${b.color || "#6366f1"}30` }}
          >
            {b.icon || categoryIcons[b.category] || "📄"}
          </div>
          <p className="font-mono text-4xl font-extrabold text-foreground">{convertAndFormat(m.amount)}</p>
          <p className="text-muted-foreground text-xs font-medium">
            Due {m.formattedDueDate} ({b.frequency || "monthly"})
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={m.badgeVariant}>{m.statusText}</Badge>
            {b.autopay && <Badge variant="success">Autopay Active</Badge>}
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <Card>
          <div className="flex items-center justify-between py-2.5 border-b border-border text-xs">
            <span className="text-muted-foreground">Category</span>
            <span className="text-foreground font-semibold">{b.category}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border text-xs">
            <span className="text-muted-foreground">Next Due Date</span>
            <span className="text-foreground font-semibold font-mono">{m.formattedDueDate}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border text-xs">
            <span className="text-muted-foreground">Frequency</span>
            <span className="text-foreground font-semibold capitalize">{b.frequency || "monthly"}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border text-xs">
            <span className="text-muted-foreground">Monthly Normalized</span>
            <span className="text-indigo-400 font-bold font-mono">{convertAndFormat(m.monthlyEquivalent)}/mo</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border text-xs">
            <span className="text-muted-foreground">Annual Estimated Cost</span>
            <span className="text-foreground font-semibold font-mono">{convertAndFormat(m.annualCost)}/yr</span>
          </div>
          {b.paidDate && (
            <div className="flex items-center justify-between py-2.5 border-b border-border text-xs">
              <span className="text-muted-foreground">Last Paid On</span>
              <span className="text-emerald-400 font-semibold font-mono">{b.paidDate}</span>
            </div>
          )}
        </Card>

        {/* Autopay Toggle */}
        <div className="flex items-center justify-between bg-secondary rounded-xl p-4 border border-border/40">
          <div>
            <p className="text-foreground text-sm font-semibold">Autopay</p>
            <p className="text-muted-foreground text-xs">Automated debit tracker</p>
          </div>
          <Toggle checked={Boolean(b.autopay)} onChange={handleToggleAutopay} />
        </div>

        {b.description && (
          <Card>
            <p className="text-foreground text-xs font-semibold mb-1">Notes</p>
            <p className="text-muted-foreground text-xs leading-relaxed">{b.description}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 mt-2">
          {!m.isPaid ? (
            <Button
              fullWidth
              size="lg"
              disabled={isSubmitting}
              onClick={() => handlePayBill(b.id, b.name)}
            >
              {isSubmitting ? "Processing..." : "✓ Mark as Paid"}
            </Button>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-400 text-xs font-semibold">
              🎉 Bill is currently marked as paid. Next occurrence is scheduled!
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={handleStartEdit}>
              ✏️ Edit Bill
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "🗑️ Delete Bill"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Screen 5: Edit Bill
  if (screen === "edit") {
    if (!selectedBill) {
      setScreen("overview");
      return null;
    }

    const handleSaveEdit = async () => {
      const amt = parseFloat(editForm.amount);
      if (!editForm.name.trim()) {
        setBillError("Bill name is required");
        return;
      }
      if (isNaN(amt) || amt <= 0) {
        setBillError("Bill amount must be greater than zero");
        return;
      }

      setIsSubmitting(true);
      setBillError(null);

      try {
        await updateBill(editForm.id, {
          name: editForm.name.trim(),
          amount: amt,
          dueDay: editForm.dueDay ? parseInt(editForm.dueDay, 10) : undefined,
          dueDate: editForm.dueDate || undefined,
          category: editForm.category,
          frequency: editForm.frequency,
          autopay: editForm.autopay,
          description: editForm.description.trim(),
          icon: editForm.icon,
          color: editForm.color,
        });

        setScreen("detail");
      } catch (err: any) {
        setBillError(err.message || "Failed to update bill");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("detail")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl font-bold truncate">Edit Bill: {editForm.name}</h2>
        </div>

        {billError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{billError}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Input
            label="Bill Name"
            value={editForm.name}
            onChange={v => setEditForm(p => ({ ...p, name: v }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Amount ($)</label>
              <input
                type="number"
                min="1"
                value={editForm.amount}
                onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Due Date</label>
              <input
                type="date"
                value={editForm.dueDate}
                onChange={e => setEditForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-input-background border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={editForm.category}
              onChange={v => setEditForm(p => ({ ...p, category: v }))}
              options={billCategories}
            />
            <Select
              label="Frequency"
              value={editForm.frequency}
              onChange={v => setEditForm(p => ({ ...p, frequency: v }))}
              options={frequencyOptions}
            />
          </div>

          <div className="flex items-center justify-between bg-secondary rounded-xl p-4 border border-border/40">
            <div>
              <p className="text-foreground text-sm font-semibold">Enable Autopay</p>
              <p className="text-muted-foreground text-xs">Automated payment indicator</p>
            </div>
            <Toggle
              checked={editForm.autopay}
              onChange={v => setEditForm(p => ({ ...p, autopay: v }))}
            />
          </div>

          <Input
            label="Notes"
            value={editForm.description}
            onChange={v => setEditForm(p => ({ ...p, description: v }))}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <Button fullWidth size="lg" disabled={!editForm.name || !editForm.amount || isSubmitting} onClick={handleSaveEdit}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setScreen("detail")}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
