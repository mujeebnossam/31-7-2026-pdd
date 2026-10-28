import { useState } from "react";
import { Button, Input, Card } from "../components/ui";
import { useApp } from "../context/AppContext";
import { authApi, setToken } from "../services/api";

type OnboardingScreen = "splash" | "welcome" | "signin" | "signup" | "connect" | "goals";

interface OnboardingProps {
  onComplete?: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState<OnboardingScreen>("splash");
  const { setUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Screen 1: Splash
  if (screen === "splash") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-4xl shadow-2xl shadow-primary/20">
            💎
          </div>
          <div>
            <h1 className="text-4xl text-foreground mb-2" style={{ letterSpacing: "-0.03em" }}>SpendWise AI</h1>
            <p className="text-muted-foreground">Intelligent expense tracking & financial predictions powered by AI</p>
          </div>
          <Button fullWidth size="lg" onClick={() => { setAuthError(null); setScreen("welcome"); }}>
            Get Started
          </Button>
          <button onClick={() => { setAuthError(null); setScreen("signin"); }} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Already have an account? <span className="text-primary">Sign in</span>
          </button>
        </div>
      </div>
    );
  }

  // Screen 2: Welcome / Value Props
  if (screen === "welcome") {
    const features = [
      { icon: "🤖", title: "AI-Powered Insights", desc: "Get personalized recommendations to optimize your spending" },
      { icon: "📊", title: "Smart Predictions", desc: "Forecast your finances months ahead with precision" },
      { icon: "🔒", title: "Bank-Level Security", desc: "256-bit encryption protects all your financial data" },
      { icon: "⚡", title: "Real-Time Sync", desc: "Transactions update instantly across all accounts" },
    ];
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-12">
        <button onClick={() => { setAuthError(null); setScreen("splash"); }} className="text-muted-foreground hover:text-foreground mb-8 self-start text-sm flex items-center gap-1">
          ← Back
        </button>
        <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
          <h1 className="text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>Everything you need to master your finances</h1>
          <p className="text-muted-foreground mb-8">Join 500,000+ people who trust SpendWise AI with their financial future.</p>
          <div className="flex flex-col gap-4 mb-10">
            {features.map(f => (
              <div key={f.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-foreground font-medium">{f.title}</p>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button fullWidth size="lg" onClick={() => { setAuthError(null); setScreen("signup"); }}>
            Create Free Account
          </Button>
          <p className="text-center text-muted-foreground text-xs mt-4">No credit card required • Free forever plan available</p>
        </div>
      </div>
    );
  }

  // Screen 3: Sign Up
  if (screen === "signup") {
    const handleRegister = async () => {
      setIsSubmitting(true);
      setAuthError(null);
      try {
        const res = await authApi.register(name, email, password);
        setToken(res.token);
        setUser(res.user);
        setScreen('connect');
      } catch (err: any) {
        console.error('Registration failed', err);
        setAuthError(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-12">
        <button onClick={() => { setAuthError(null); setScreen("welcome"); }} className="text-muted-foreground hover:text-foreground mb-8 self-start text-sm flex items-center gap-1">
          ← Back
        </button>
        <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
          <h1 className="text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>Create your account</h1>
          <p className="text-muted-foreground mb-6">Start tracking smarter in minutes.</p>

          {authError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 mb-6">
            <Input label="Full name" placeholder="Alex Morgan" value={name} onChange={setName} />
            <Input label="Email address" placeholder="alex@email.com" value={email} onChange={setEmail} type="email" />
            <Input label="Password" placeholder="6+ characters" value={password} onChange={setPassword} type="password" />
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={handleRegister}
            disabled={!name || !email || !password || isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <Button fullWidth variant="secondary" onClick={() => setScreen("connect")}>
            <span>🍎</span> Continue with Apple
          </Button>
          <p className="text-center text-muted-foreground text-xs mt-6">
            Already have an account?{" "}
            <button onClick={() => { setAuthError(null); setScreen("signin"); }} className="text-primary hover:underline">Sign in</button>
          </p>
          <p className="text-center text-muted-foreground text-xs mt-2">
            By creating an account, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // Screen 4: Sign In
  if (screen === "signin") {
    const handleLogin = async () => {
      setIsSubmitting(true);
      setAuthError(null);
      try {
        const res = await authApi.login(email, password);
        setToken(res.token);
        setUser(res.user);
        onComplete?.();
      } catch (err: any) {
        console.error('Login failed', err);
        setAuthError(err.message || 'Invalid email or password');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-12">
        <button onClick={() => { setAuthError(null); setScreen("splash"); }} className="text-muted-foreground hover:text-foreground mb-8 self-start text-sm flex items-center gap-1">
          ← Back
        </button>
        <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
          <h1 className="text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p className="text-muted-foreground mb-6">Sign in to your SpendWise account.</p>

          {authError && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 mb-6">
            <Input label="Email address" placeholder="alex@email.com" value={email} onChange={setEmail} type="email" />
            <Input label="Password" placeholder="••••••••" value={password} onChange={setPassword} type="password" />
          </div>
          <button className="text-primary text-sm self-end mb-6 hover:text-primary/80">Forgot password?</button>
          <Button
            fullWidth
            size="lg"
            onClick={handleLogin}
            disabled={!email || !password || isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <Button fullWidth variant="secondary" onClick={() => onComplete?.()}>
            <span>🍎</span> Continue with Apple
          </Button>
          <p className="text-center text-muted-foreground text-xs mt-6">
            Don't have an account?{" "}
            <button onClick={() => { setAuthError(null); setScreen("signup"); }} className="text-primary hover:underline">Create one</button>
          </p>
        </div>
      </div>
    );
  }

  // Screen 5: Connect Bank
  if (screen === "connect") {
    const banks = [
      { id: "chase", name: "Chase", icon: "🏦", users: "12M+" },
      { id: "bofa", name: "Bank of America", icon: "🏛️", users: "9M+" },
      { id: "wells", name: "Wells Fargo", icon: "🐴", users: "7M+" },
      { id: "citi", name: "Citibank", icon: "🌐", users: "5M+" },
      { id: "cap1", name: "Capital One", icon: "💳", users: "8M+" },
      { id: "usaa", name: "USAA", icon: "🛡️", users: "2M+" },
    ];
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setScreen("signup")} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <span className="text-muted-foreground text-sm">Step 1 of 2</span>
        </div>
        <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
          <h1 className="text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>Connect your bank</h1>
          <p className="text-muted-foreground mb-6">Securely link your accounts. We use 256-bit encryption — we can never move money.</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {banks.map(b => (
              <Card
                key={b.id}
                hover
                onClick={() => setSelectedBank(b.id)}
                className={`flex flex-col items-center gap-2 py-4 text-center transition-all ${selectedBank === b.id ? "border-primary/60 bg-primary/10" : ""}`}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-sm text-foreground">{b.name}</span>
                <span className="text-xs text-muted-foreground">{b.users} users</span>
              </Card>
            ))}
          </div>
          <Button
            fullWidth
            size="lg"
            disabled={!selectedBank}
            onClick={() => setScreen("goals")}
          >
            Connect Securely →
          </Button>
          <button onClick={() => setScreen("goals")} className="text-muted-foreground text-sm text-center mt-4 hover:text-foreground">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // Screen 6 (Onboarding): Set Financial Goals
  if (screen === "goals") {
    const goals = [
      { id: "emergency", label: "Build emergency fund", icon: "🛡️" },
      { id: "debt", label: "Pay off debt", icon: "💳" },
      { id: "save", label: "Save for something big", icon: "🎯" },
      { id: "invest", label: "Grow investments", icon: "📈" },
      { id: "budget", label: "Stick to a budget", icon: "📊" },
      { id: "retire", label: "Plan for retirement", icon: "🌴" },
    ];
    const toggle = (id: string) => setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setScreen("connect")} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <span className="text-muted-foreground text-sm">Step 2 of 2</span>
        </div>
        <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
          <h1 className="text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>What are your financial goals?</h1>
          <p className="text-muted-foreground mb-6">Select all that apply. We'll personalize your experience.</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {goals.map(g => {
              const sel = selectedGoals.includes(g.id);
              return (
                <Card
                  key={g.id}
                  hover
                  onClick={() => toggle(g.id)}
                  className={`flex flex-col items-center gap-2 py-4 text-center ${sel ? "border-primary/60 bg-primary/10" : ""}`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-sm text-foreground text-center">{g.label}</span>
                </Card>
              );
            })}
          </div>
          <Button
            fullWidth
            size="lg"
            disabled={selectedGoals.length === 0}
            onClick={onComplete}
          >
            Start Using SpendWise →
          </Button>
          <button onClick={onComplete} className="text-muted-foreground text-sm text-center mt-4 hover:text-foreground">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return null;
}
