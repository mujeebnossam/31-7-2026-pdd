/* MARKER-MAKE-KIT-INVOKED */
import { useState } from "react";
import { Onboarding } from "./screens/Onboarding";
import { Dashboard } from "./screens/Dashboard";
import { Transactions } from "./screens/Transactions";
import { Budgets } from "./screens/Budgets";
import { AIInsights } from "./screens/AIInsights";
import { Reports } from "./screens/Reports";
import { Investments } from "./screens/Investments";
import { Bills } from "./screens/Bills";
import { Goals } from "./screens/Goals";
import { Settings } from "./screens/Settings";
import { Badge } from "./components/ui";
import { AppProvider, useApp } from "./context/AppContext";

type Section = "dashboard" | "transactions" | "budgets" | "insights" | "reports" | "investments" | "bills" | "goals" | "settings";

const navItems: { id: Section; icon: string; label: string }[] = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "transactions", icon: "💳", label: "Transactions" },
  { id: "budgets", icon: "📊", label: "Budgets" },
  { id: "insights", icon: "🤖", label: "AI" },
  { id: "investments", icon: "📈", label: "Invest" },
];

const moreItems: { id: Section; icon: string; label: string }[] = [
  { id: "reports", icon: "📋", label: "Reports" },
  { id: "bills", icon: "📅", label: "Bills" },
  { id: "goals", icon: "🎯", label: "Goals" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

const menuItems = [...navItems, ...moreItems];

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [section, setSection] = useState<Section>("dashboard");
  const [showMobileMore, setShowMobileMore] = useState(false);

  if (!authed) {
    return <Onboarding onComplete={() => setAuthed(true)} />;
  }

  return (
    <AppProvider>
      <AppContent
        section={section}
        setSection={setSection}
        showMobileMore={showMobileMore}
        setShowMobileMore={setShowMobileMore}
      />
    </AppProvider>
  );
}

function AppContent({
  section,
  setSection,
  showMobileMore,
  setShowMobileMore,
}: {
  section: Section;
  setSection: (s: Section) => void;
  showMobileMore: boolean;
  setShowMobileMore: (b: boolean) => void;
}) {
  const { user, notifications } = useApp();

  const navigate = (s: string) => {
    setSection(s as Section);
    setShowMobileMore(false);
  };

  const activeItem = menuItems.find(item => item.id === section);
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-card border-r border-border shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-primary/20">
            💎
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-tight tracking-tight text-lg">SpendWise AI</h1>
            <p className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">Premium Intelligence</p>
          </div>
        </div>

        {/* User Info card */}
        <div className="px-4 py-4 border-b border-border bg-background/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-sm">
            {user.avatar || user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-sm font-semibold truncate text-foreground">{user.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected to Vault" />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Core Features</p>
          {menuItems.slice(0, 5).map(item => {
            const isSel = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isSel ? "bg-primary text-white shadow-lg shadow-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span className={`text-lg transition-transform ${isSel ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}

          <p className="px-3 pt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Planning & Analysis</p>
          {menuItems.slice(5).map(item => {
            const isSel = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isSel ? "bg-primary text-white shadow-lg shadow-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span className={`text-lg transition-transform ${isSel ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-border bg-sidebar text-xs text-muted-foreground font-mono flex items-center justify-between">
          <span>v2.4.0 Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </aside>

      {/* 2. Mobile Slick Header */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="text-xl">💎</span>
          <span className="font-bold tracking-tight text-foreground">SpendWise AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="neutral" className="bg-primary/10 text-primary border-primary/20 text-xs py-1">
            {activeItem?.label}
          </Badge>
          <button
            onClick={() => setShowMobileMore(!showMobileMore)}
            className="p-1 px-2.5 border border-border rounded-lg text-sm bg-secondary text-foreground"
          >
            ☰ Menu
          </button>
        </div>
      </header>

      {/* 3. Mobile Navigation Slider Panel */}
      {showMobileMore && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-64 max-w-full bg-card h-full p-6 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-foreground">Navigation</span>
                <button
                  onClick={() => setShowMobileMore(false)}
                  className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                {menuItems.map(item => {
                  const isSel = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSection(item.id);
                        setShowMobileMore(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${
                        isSel ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground font-mono">Connected as</p>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Fluid, expansive Work area */}
      <div className="flex-1 flex flex-col min-h-0 bg-background overflow-x-hidden">
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <div className="max-w-7xl mx-auto w-full">
            {section === "dashboard" && <Dashboard onNavigate={navigate} />}
            {section === "transactions" && <Transactions />}
            {section === "budgets" && <Budgets />}
            {section === "insights" && <AIInsights />}
            {section === "reports" && <Reports />}
            {section === "investments" && <Investments />}
            {section === "bills" && <Bills />}
            {section === "goals" && <Goals />}
            {section === "settings" && <Settings />}
          </div>
        </main>
      </div>

      {/* 5. Mobile Sticky Bottom Navigation (Core views only) */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-card border-t border-border select-none">
        <div className="grid grid-cols-5 items-center">
          {menuItems.slice(0, 4).map(item => {
            const isSel = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex flex-col items-center gap-1 py-2.5 transition-all relative ${isSel ? "text-primary" : "text-muted-foreground"}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px]">{item.label.split(" ")[0]}</span>
                {isSel && (
                  <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
          {/* Quick-action view switcher representing More */}
          <button
            onClick={() => setShowMobileMore(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground hover:text-foreground"
          >
            <span className="text-lg">📁</span>
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
