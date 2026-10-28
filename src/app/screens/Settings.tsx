import { useState } from "react";
import { Card, Badge, Button, Input, Toggle, Avatar } from "../components/ui";
import { useApp } from "../context/AppContext";
import { authApi } from "../services/api";

type SettingsScreen = "home" | "profile" | "notifications" | "security" | "accounts" | "preferences" | "help" | "about";

export function Settings() {
  const [screen, setScreen] = useState<SettingsScreen>("home");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const {
    user,
    setUser,
    currency,
    setCurrency,
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    addNotification,
    logout,
    convertAndFormat,
  } = useApp();

  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [notifs, setNotifs] = useState({
    budgetAlerts: true,
    largeTransactions: true,
    billReminders: true,
    weeklyReport: false,
    aiInsights: true,
    goalUpdates: true,
  });

  const [prefs, setPrefs] = useState({
    theme: "dark",
    biometric: true,
    autoSync: true,
  });

  // Accounts state
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isAddingCustomAccount, setIsAddingCustomAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [accError, setAccError] = useState<string | null>(null);
  const [isAccSaving, setIsAccSaving] = useState(false);

  const [customAcc, setCustomAcc] = useState({
    name: "",
    bank: "",
    type: "checking",
    balance: "",
    last4: "",
    color: "#3b82f6",
  });

  const [editAccData, setEditAccData] = useState({
    name: "",
    bank: "",
    type: "checking",
    balance: "",
    last4: "",
    color: "#3b82f6",
  });

  // Screen 43: Settings Home
  if (screen === "home") {
    const sections = [
      {
        title: "Account",
        items: [
          { icon: "👤", label: "Profile & Account", screen: "profile" as SettingsScreen, desc: "Name, email, plan" },
          { icon: "🔗", label: "Connected Accounts", screen: "accounts" as SettingsScreen, desc: `${accounts.length} accounts linked` },
        ],
      },
      {
        title: "Preferences",
        items: [
          { icon: "🔔", label: "Notifications", screen: "notifications" as SettingsScreen, desc: "Alerts & reminders" },
          { icon: "🎨", label: "Preferences", screen: "preferences" as SettingsScreen, desc: "Theme, currency, language" },
          { icon: "🔒", label: "Security & Privacy", screen: "security" as SettingsScreen, desc: "Password, biometric, data" },
        ],
      },
      {
        title: "Support",
        items: [
          { icon: "❓", label: "Help & Support", screen: "help" as SettingsScreen, desc: "FAQs, contact us" },
          { icon: "ℹ️", label: "About SpendWise", screen: "about" as SettingsScreen, desc: "Version, credits, legal" },
        ],
      },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6 bg-background">
        <h2 className="text-xl">Settings</h2>
        {/* Profile card */}
        <Card hover onClick={() => setScreen("profile")} className="flex items-center gap-4 py-4">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1">
            <p className="text-foreground font-medium">{user.name}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <Badge variant="primary" className="mt-1">Pro Plan</Badge>
          </div>
          <span className="text-muted-foreground">→</span>
        </Card>
        {sections.map(section => (
          <div key={section.title}>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">{section.title}</p>
            <Card className="p-0 overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => setScreen(item.screen)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors text-left ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <span className="text-xl w-8 text-center">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                  <span className="text-muted-foreground text-sm">→</span>
                </button>
              ))}
            </Card>
          </div>
        ))}
        <div className="pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={logout}
            className="border border-border hover:bg-secondary flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground font-medium"
          >
            <span>🚪</span> Log Out
          </Button>
        </div>
      </div>
    );
  }

  // Screen 44: Profile & Account
  if (screen === "profile") {
    const handleDeleteAccount = async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        await authApi.deleteAccount();
        logout();
      } catch (err: any) {
        console.error('Failed to delete account:', err);
        setDeleteError(err.message || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    };

    const handleLogout = () => {
      logout();
    };

    const handleSave = () => {
      setUser({
        ...user,
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        avatar: profileName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
      });
      addNotification({
        id: "notif_profile_" + Date.now(),
        type: "insight",
        message: "Profile updated successfully!",
        time: "Just now",
        read: false,
      });
      setScreen("home");
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Profile & Account</h2>
        </div>
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="relative">
            <Avatar name={user.name} size="lg" />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">✏️</button>
          </div>
          <p className="text-foreground font-medium">{user.name}</p>
          <Badge variant="primary">Pro Plan · Member since {user.memberSince || "Recent"}</Badge>
        </div>

        {deleteError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{deleteError}</span>
          </div>
        )}

        <Card>
          <div className="flex flex-col gap-4">
            <Input label="Full Name" value={profileName} onChange={setProfileName} />
            <Input label="Email Address" value={profileEmail} onChange={setProfileEmail} />
            <Input label="Phone Number" placeholder="+91 98765 43210" value={profilePhone} onChange={setProfilePhone} />
          </div>
        </Card>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Plan</p>
          <Card className="border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">SpendWise Pro</p>
                <p className="text-muted-foreground text-xs">$9.99/month · Unlimited everything</p>
              </div>
              <Button size="sm" variant="secondary">Manage</Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button fullWidth onClick={handleSave}>Save Changes</Button>

          {/* Clearly visible Log Out button */}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleLogout}
            className="border border-border hover:bg-secondary flex items-center justify-center gap-2 text-foreground font-medium"
          >
            <span>🚪</span> Log Out
          </Button>

          {/* Delete Account confirmation dialog / button */}
          {showDeleteConfirm ? (
            <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-red-400">Permanently Delete Account?</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  This will permanently delete your account and remove all associated bank accounts, transactions, budgets, goals, and bills. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting Account..." : "Yes, Delete Account"}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              Delete Account
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Screen 45: Notifications
  if (screen === "notifications") {
    const items = [
      { key: "budgetAlerts", label: "Budget Alerts", desc: "When approaching or exceeding limits" },
      { key: "largeTransactions", label: "Large Transactions", desc: "Transactions over $100" },
      { key: "billReminders", label: "Bill Reminders", desc: "3 days before bills are due" },
      { key: "weeklyReport", label: "Weekly Report", desc: "Sunday evening summary" },
      { key: "aiInsights", label: "AI Insights", desc: "New personalized recommendations" },
      { key: "goalUpdates", label: "Goal Updates", desc: "Milestones and progress updates" },
    ] as { key: keyof typeof notifs; label: string; desc: string }[];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Notifications</h2>
        </div>
        <Card className="p-0 overflow-hidden">
          {items.map((item, i) => (
            <div key={item.key} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
              <div>
                <p className="text-foreground text-sm">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
              <Toggle
                checked={notifs[item.key]}
                onChange={v => setNotifs(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </Card>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Delivery Method</p>
          <Card className="p-0 overflow-hidden">
            {[
              { label: "Push Notifications", enabled: true },
              { label: "Email", enabled: true },
              { label: "SMS", enabled: false },
            ].map((m, i) => (
              <div key={m.label} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <p className="text-foreground text-sm">{m.label}</p>
                <Toggle checked={m.enabled} onChange={() => {}} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  // Screen 46: Security & Privacy
  if (screen === "security") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Security & Privacy</h2>
        </div>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-emerald-400 font-medium">Your account is secure</p>
              <p className="text-muted-foreground text-xs">256-bit encryption · Last login Jun 11, 2026</p>
            </div>
          </div>
        </Card>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Authentication</p>
          <Card className="p-0 overflow-hidden">
            {[
              { label: "Face ID / Biometric", desc: "Unlock with your face or fingerprint", enabled: prefs.biometric, key: "biometric" as keyof typeof prefs },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-foreground text-sm">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
                <Toggle checked={item.enabled as boolean} onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
            {[
              { label: "Change Password", action: () => {} },
              { label: "Two-Factor Authentication", action: () => {} },
              { label: "Active Sessions", action: () => {} },
            ].map((item, i) => (
              <button key={item.label} onClick={item.action} className="w-full flex items-center justify-between px-4 py-3.5 border-t border-border hover:bg-accent transition-colors text-left">
                <p className="text-foreground text-sm">{item.label}</p>
                <span className="text-muted-foreground text-sm">→</span>
              </button>
            ))}
          </Card>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Data & Privacy</p>
          <Card className="p-0 overflow-hidden">
            {["Download My Data", "Privacy Policy", "Data Sharing Settings"].map((item, i) => (
              <button key={item} className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors text-left ${i > 0 ? "border-t border-border" : ""}`}>
                <p className="text-foreground text-sm">{item}</p>
                <span className="text-muted-foreground text-sm">→</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  // Screen 47: Connected Accounts
  if (screen === "accounts") {
    const handleAddPreset = async (bankPreset: { name: string, bank: string, balance: number, last4: string, color: string, type: string }) => {
      setIsAccSaving(true);
      setAccError(null);
      try {
        await addAccount(bankPreset);
        addNotification({
          id: "notif_acc_" + Date.now(),
          type: "insight",
          message: `🏦 Connected new ${bankPreset.bank} account successfully!`,
          time: "Just now",
          read: false,
        });
        setIsAddingAccount(false);
      } catch (err: any) {
        setAccError(err.message || 'Failed to add account');
      } finally {
        setIsAccSaving(false);
      }
    };

    const handleCreateCustomAccount = async () => {
      if (!customAcc.name.trim()) {
        setAccError('Please enter an account name');
        return;
      }
      setIsAccSaving(true);
      setAccError(null);
      try {
        const bal = parseFloat(customAcc.balance) || 0;
        await addAccount({
          name: customAcc.name.trim(),
          bank: customAcc.bank.trim() || 'Bank',
          type: customAcc.type,
          balance: bal,
          last4: customAcc.last4.trim() || '0000',
          color: customAcc.color || '#3b82f6',
        });
        setCustomAcc({
          name: "",
          bank: "",
          type: "checking",
          balance: "",
          last4: "",
          color: "#3b82f6",
        });
        setIsAddingCustomAccount(false);
      } catch (err: any) {
        setAccError(err.message || 'Failed to create account');
      } finally {
        setIsAccSaving(false);
      }
    };

    const handleStartEdit = (acc: any) => {
      setEditingAccount(acc);
      setEditAccData({
        name: acc.name,
        bank: acc.bank || '',
        type: acc.type || 'checking',
        balance: String(acc.balance),
        last4: acc.last4 || '',
        color: acc.color || '#3b82f6',
      });
      setAccError(null);
    };

    const handleSaveEdit = async () => {
      if (!editingAccount) return;
      if (!editAccData.name.trim()) {
        setAccError('Account name cannot be empty');
        return;
      }
      setIsAccSaving(true);
      setAccError(null);
      try {
        await updateAccount(editingAccount.id, {
          name: editAccData.name.trim(),
          bank: editAccData.bank.trim() || 'Bank',
          type: editAccData.type,
          balance: parseFloat(editAccData.balance) || 0,
          last4: editAccData.last4.trim() || '0000',
          color: editAccData.color,
        });
        setEditingAccount(null);
      } catch (err: any) {
        setAccError(err.message || 'Failed to update account');
      } finally {
        setIsAccSaving(false);
      }
    };

    const handleDeleteAcc = async (id: string, name: string) => {
      if (!window.confirm(`Are you sure you want to remove "${name}"? Transactions associated with this account will remain in your ledger.`)) {
        return;
      }
      setIsAccSaving(true);
      setAccError(null);
      try {
        await removeAccount(id);
      } catch (err: any) {
        setAccError(err.message || 'Failed to remove account');
      } finally {
        setIsAccSaving(false);
      }
    };

    const totalLiquid = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
            <h2 className="text-xl">Accounts & Wallets</h2>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setIsAddingAccount(!isAddingAccount); setIsAddingCustomAccount(false); }}>
              {isAddingAccount ? "Cancel" : "⚡ Presets"}
            </Button>
            <Button size="sm" onClick={() => { setIsAddingCustomAccount(!isAddingCustomAccount); setIsAddingAccount(false); }}>
              {isAddingCustomAccount ? "Cancel" : "+ Custom"}
            </Button>
          </div>
        </div>

        {/* Total Liquid Summary Banner */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Accounts Balance</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{convertAndFormat(totalLiquid)}</p>
            </div>
            <Badge variant="primary">{accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}</Badge>
          </div>
        </Card>

        {accError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{accError}</span>
          </div>
        )}

        {/* Custom Account Form */}
        {isAddingCustomAccount && (
          <Card className="border-primary/40 bg-accent/30 flex flex-col gap-4 py-4">
            <h3 className="text-sm font-semibold text-foreground">Add New Account or Wallet</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Account Name"
                placeholder="e.g. Main Checking, Cash Wallet"
                value={customAcc.name}
                onChange={v => setCustomAcc(p => ({ ...p, name: v }))}
              />
              <Input
                label="Institution / Bank"
                placeholder="e.g. Chase, HDFC, Cash"
                value={customAcc.bank}
                onChange={v => setCustomAcc(p => ({ ...p, bank: v }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Account Type</label>
                <select
                  value={customAcc.type}
                  onChange={e => setCustomAcc(p => ({ ...p, type: e.target.value }))}
                  className="bg-input-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60 text-sm"
                >
                  <option value="checking">🏦 Checking / Current</option>
                  <option value="savings">💰 Savings Account</option>
                  <option value="credit">💳 Credit Card</option>
                  <option value="cash">💵 Cash / Wallet</option>
                  <option value="investment">📈 Investment Account</option>
                  <option value="other">📁 Other</option>
                </select>
              </div>
              <Input
                label="Initial Balance ($)"
                placeholder="0.00"
                type="number"
                value={customAcc.balance}
                onChange={v => setCustomAcc(p => ({ ...p, balance: v }))}
              />
              <Input
                label="Last 4 Digits (Optional)"
                placeholder="1234"
                value={customAcc.last4}
                onChange={v => setCustomAcc(p => ({ ...p, last4: v.slice(0, 4) }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Color Theme</label>
                <div className="flex items-center gap-2 pt-1">
                  {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomAcc(p => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${customAcc.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateCustomAccount} disabled={isAccSaving || !customAcc.name.trim()} className="flex-1">
                {isAccSaving ? "Creating Account..." : "Save Account"}
              </Button>
              <Button variant="secondary" onClick={() => setIsAddingCustomAccount(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Edit Account Modal / Card */}
        {editingAccount && (
          <Card className="border-primary/50 bg-primary/5 flex flex-col gap-4 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Edit Account: {editingAccount.name}</h3>
              <button onClick={() => setEditingAccount(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Account Name"
                value={editAccData.name}
                onChange={v => setEditAccData(p => ({ ...p, name: v }))}
              />
              <Input
                label="Institution / Bank"
                value={editAccData.bank}
                onChange={v => setEditAccData(p => ({ ...p, bank: v }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Account Type</label>
                <select
                  value={editAccData.type}
                  onChange={e => setEditAccData(p => ({ ...p, type: e.target.value }))}
                  className="bg-input-background border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:border-primary/60 text-sm"
                >
                  <option value="checking">🏦 Checking / Current</option>
                  <option value="savings">💰 Savings Account</option>
                  <option value="credit">💳 Credit Card</option>
                  <option value="cash">💵 Cash / Wallet</option>
                  <option value="investment">📈 Investment Account</option>
                  <option value="other">📁 Other</option>
                </select>
              </div>
              <Input
                label="Current Balance ($)"
                type="number"
                value={editAccData.balance}
                onChange={v => setEditAccData(p => ({ ...p, balance: v }))}
              />
              <Input
                label="Last 4 Digits"
                value={editAccData.last4}
                onChange={v => setEditAccData(p => ({ ...p, last4: v }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Color Theme</label>
                <div className="flex items-center gap-2 pt-1">
                  {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditAccData(p => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${editAccData.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveEdit} disabled={isAccSaving || !editAccData.name.trim()} className="flex-1">
                {isAccSaving ? "Saving..." : "Update Account"}
              </Button>
              <Button variant="secondary" onClick={() => setEditingAccount(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Presets */}
        {isAddingAccount && (
          <Card className="border-primary/40 bg-accent/30 flex flex-col gap-3 py-4">
            <p className="text-sm font-semibold text-foreground">Select a Bank Preset to link instantly:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { name: "Chase Total Checking", bank: "Chase", balance: 3500, last4: "8821", color: "#3b82f6", type: "checking" },
                { name: "HDFC Priority Savings", bank: "HDFC Bank", balance: 2500, last4: "9820", color: "#1e3a8a", type: "savings" },
                { name: "SBI Maxima Savings", bank: "State Bank of India", balance: 950, last4: "7124", color: "#0284c7", type: "savings" },
                { name: "Amex Gold Card", bank: "American Express", balance: -450, last4: "3004", color: "#ea580c", type: "credit" },
                { name: "Cash Wallet", bank: "Cash", balance: 200, last4: "0000", color: "#10b981", type: "cash" },
                { name: "Vanguard Index", bank: "Vanguard", balance: 8000, last4: "5512", color: "#8b5cf6", type: "investment" },
              ].map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(b)}
                  disabled={isAccSaving}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition"
                >
                  <span className="text-xl">
                    {b.type === "checking" ? "🏦" : b.type === "savings" ? "💰" : b.type === "credit" ? "💳" : b.type === "cash" ? "💵" : "📈"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.bank} · ••••{b.last4}</p>
                  </div>
                  <Badge variant="primary">Add</Badge>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl">🏦</span>
            <div>
              <p className="text-foreground font-semibold">No accounts found</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-xs">
                Link an account or add cash/card wallets to start recording transactions and tracking your net worth.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => setIsAddingCustomAccount(true)}>+ Add Custom Account</Button>
              <Button size="sm" variant="secondary" onClick={() => setIsAddingAccount(true)}>⚡ Quick Presets</Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {accounts.map(acc => (
              <Card key={acc.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: (acc.color || '#3b82f6') + "20", border: `1px solid ${(acc.color || '#3b82f6')}40` }}
                  >
                    {acc.type === "checking" ? "🏦" : acc.type === "savings" ? "💰" : acc.type === "credit" ? "💳" : acc.type === "cash" ? "💵" : "📈"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-sm font-semibold truncate">{acc.name}</p>
                      <Badge variant="neutral" className="text-[10px] py-0 capitalize">{acc.type}</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{acc.bank} · ••••{acc.last4}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="font-mono text-sm font-bold text-foreground">
                      {convertAndFormat(acc.balance)}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartEdit(acc)}
                        className="text-primary text-xs hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAcc(acc.id, acc.name)}
                        className="text-red-400 text-xs hover:underline font-mono"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 text-xs text-center">🔒 All account records are stored securely and isolated to your authenticated profile.</p>
        </Card>
      </div>
    );
  }

  // Screen 48: Preferences
  if (screen === "preferences") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Preferences</h2>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Display</p>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="text-foreground text-sm">Theme</p>
              <select className="bg-secondary text-foreground text-sm rounded-lg px-2 py-1 border-0 focus:outline-none">
                <option>Dark</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
              <div>
                <p className="text-foreground text-sm">Currency Format</p>
                <p className="text-muted-foreground text-xs">Converts all views automatically</p>
              </div>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="bg-primary text-white text-sm rounded-lg px-3 py-1.5 border-0 focus:outline-none font-semibold"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
              <p className="text-foreground text-sm">Date Format</p>
              <select className="bg-secondary text-foreground text-sm rounded-lg px-2 py-1 border-0 focus:outline-none">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </Card>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Behavior</p>
          <Card className="p-0 overflow-hidden">
            {[
              { label: "Auto-sync accounts", key: "autoSync" as keyof typeof prefs },
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                <p className="text-foreground text-sm">{item.label}</p>
                <Toggle checked={prefs[item.key] as boolean} onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
              </div>
            ))}
          </Card>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Language & Region</p>
          <Card className="p-0 overflow-hidden">
            {[
              { label: "Language", value: "English (US)" },
              { label: "Time Zone", value: "Eastern Time (ET)" },
              { label: "First Day of Week", value: "Sunday" },
            ].map((item, i) => (
              <button key={item.label} className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors text-left ${i > 0 ? "border-t border-border" : ""}`}>
                <p className="text-foreground text-sm">{item.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{item.value}</span>
                  <span className="text-muted-foreground text-xs">→</span>
                </div>
              </button>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  // Screen 49: Help & Support
  if (screen === "help") {
    const faqs = [
      { q: "How do I connect my bank account?", a: "Go to Settings → Connected Accounts → Connect New Account. We use Plaid for secure connections." },
      { q: "How does AI categorization work?", a: "Our AI uses merchant data and spending patterns to auto-categorize. You can always edit categories." },
      { q: "Is my financial data secure?", a: "Yes. We use 256-bit AES encryption and never store your banking credentials." },
      { q: "How do I export my data?", a: "Go to Reports → any report → Export as PDF or CSV." },
    ];
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">Help & Support</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "💬", label: "Live Chat", desc: "Talk to us now" },
            { icon: "📧", label: "Email Support", desc: "Reply within 24h" },
            { icon: "📖", label: "Documentation", desc: "Full guides" },
            { icon: "🎥", label: "Video Tutorials", desc: "Step-by-step" },
          ].map(s => (
            <Card key={s.label} hover className="flex items-center gap-3 py-4">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-foreground text-sm">{s.label}</p>
                <p className="text-muted-foreground text-xs">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
        <div>
          <h3 className="text-foreground mb-3">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <Card key={i} hover onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground text-sm">{faq.q}</p>
                  <span className="text-muted-foreground text-sm flex-shrink-0">{expandedFaq === i ? "−" : "+"}</span>
                </div>
                {expandedFaq === i && (
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed border-t border-border pt-3">{faq.a}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Screen 50: About & Credits
  if (screen === "about") {
    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
          <h2 className="text-xl">About SpendWise AI</h2>
        </div>
        <div className="flex flex-col items-center py-8 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-4xl">
            💎
          </div>
          <div className="text-center">
            <p className="text-foreground font-semibold text-xl">SpendWise AI</p>
            <p className="text-muted-foreground text-sm">Version 2.4.1 (Build 2024)</p>
          </div>
        </div>
        <Card>
          {[
            { label: "Version", value: "2.4.1" },
            { label: "Build", value: "2024061100" },
            { label: "Platform", value: "iOS 17 · Android 14 · Web" },
            { label: "AI Model", value: "SpendWise AI v3.2" },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="text-muted-foreground text-sm">{row.label}</span>
              <span className="text-foreground text-sm font-mono">{row.value}</span>
            </div>
          ))}
        </Card>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Legal</p>
          <Card className="p-0 overflow-hidden">
            {["Terms of Service", "Privacy Policy", "Open Source Licenses", "GDPR / CCPA Rights"].map((item, i) => (
              <button key={item} className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors text-left ${i > 0 ? "border-t border-border" : ""}`}>
                <p className="text-foreground text-sm">{item}</p>
                <span className="text-muted-foreground text-sm">→</span>
              </button>
            ))}
          </Card>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2 px-1">Third-Party Services</p>
          <Card>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bank connections powered by <span className="text-foreground">Plaid</span>. Market data by <span className="text-foreground">Polygon.io</span>. Charts by <span className="text-foreground">Recharts</span>. AI powered by <span className="text-foreground">Anthropic Claude</span>.
            </p>
          </Card>
        </div>
        <p className="text-center text-muted-foreground text-xs">Made with 💙 by the SpendWise team<br />© 2026 SpendWise AI Inc.</p>
      </div>
    );
  }

  return null;
}
