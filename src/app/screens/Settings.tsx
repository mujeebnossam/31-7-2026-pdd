import { useState } from "react";
import { Card, Badge, Button, Input, Toggle, Avatar } from "../components/ui";
import { useApp } from "../context/AppContext";

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
    removeAccount,
    addNotification,
  } = useApp();

  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone);

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

  // Modal or custom form to add a new bank account
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccData, setNewAccData] = useState({
    name: "HDFC Savings Account",
    bank: "HDFC Bank",
    type: "checking",
    balance: "150000",
    last4: "4920",
    color: "#1e3a8a",
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
        <Button variant="danger" fullWidth onClick={() => {}}>Sign Out</Button>
      </div>
    );
  }

  // Screen 44: Profile & Account
  if (screen === "profile") {
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
          <Badge variant="primary">Pro Plan · Member since {user.memberSince}</Badge>
        </div>
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
        <Button fullWidth onClick={handleSave}>Save Changes</Button>
        <Button variant="danger" fullWidth>Delete Account</Button>
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
    const handleAddPreset = (bankPreset: { name: string, bank: string, balance: number, last4: string, color: string, type: string }) => {
      addAccount(bankPreset);
      addNotification({
        id: "notif_acc_" + Date.now(),
        type: "insight",
        message: `🏦 Connected new ${bankPreset.bank} account successfully!`,
        time: "Just now",
        read: false,
      });
      setIsAddingAccount(false);
    };

    return (
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("home")} className="text-muted-foreground hover:text-foreground">←</button>
            <h2 className="text-xl">Connected Accounts</h2>
          </div>
          <Button size="sm" onClick={() => setIsAddingAccount(!isAddingAccount)}>
            {isAddingAccount ? "Cancel" : "+ Quick Link"}
          </Button>
        </div>

        {isAddingAccount && (
          <Card className="border-primary/40 bg-accent/30 flex flex-col gap-3 py-4">
            <p className="text-sm font-semibold text-foreground">Select an Indian Bank Account to link instantly:</p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { name: "HDFC Priority Savings", bank: "HDFC Bank", balance: 2500, last4: "9820", color: "#1e3a8a", type: "checking" },
                { name: "SBI Maxima Savings", bank: "State Bank of India", balance: 950, last4: "7124", color: "#0284c7", type: "checking" },
                { name: "ICICI Coral Card", bank: "ICICI Bank", balance: -350, last4: "4410", color: "#ea580c", type: "credit" },
                { name: "Axis Prestige Account", bank: "Axis Bank", balance: 1400, last4: "1093", color: "#800020", type: "checking" },
              ].map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(b)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition"
                >
                  <span className="text-xl">🏦</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.bank} · ••••{b.last4}</p>
                  </div>
                  <Badge variant="primary">Link Now</Badge>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <p className="text-emerald-400 text-sm">🔒 All connections secured with 256-bit encryption via Plaid</p>
        </Card>

        <div className="flex flex-col gap-3">
          {accounts.map(acc => (
            <Card key={acc.id} className="py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: acc.color + "20", border: `1px solid ${acc.color}30` }}>
                  {acc.type === "checking" ? "🏦" : acc.type === "savings" ? "💰" : acc.type === "credit" ? "💳" : "📈"}
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">{acc.name}</p>
                  <p className="text-muted-foreground text-xs">{acc.bank} · ••••{acc.last4}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="success">Connected</Badge>
                  <button onClick={() => removeAccount(acc.id)} className="text-red-400 text-xs hover:underline mt-1 font-mono">Remove</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-muted-foreground text-xs text-center">Connections powered by Plaid. We never store your banking credentials.</p>
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
