import { ReactNode, HTMLAttributes } from "react";
import { useApp } from "../context/AppContext";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e?: any) => void;
  hover?: boolean;
  key?: any;
  style?: any;
}

export function Card({ children, className = "", onClick, hover, ...props }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 ${hover ? "cursor-pointer hover:border-primary/40 hover:bg-accent transition-all" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "danger" | "warning" | "neutral" | "primary";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    danger: "bg-red-500/15 text-red-400 border-red-500/20",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    neutral: "bg-secondary text-secondary-foreground border-border",
    primary: "bg-primary/15 text-primary border-primary/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({ children, variant = "primary", size = "md", onClick, className = "", disabled, fullWidth }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent border border-border",
    ghost: "bg-transparent text-foreground hover:bg-accent border border-transparent",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  icon?: ReactNode;
  className?: string;
}

export function Input({ label, placeholder, value, onChange, type = "text", icon, className = "" }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm text-muted-foreground">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-input-background border border-border rounded-lg py-2.5 pr-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all ${icon ? "pl-10" : "pl-3"}`}
        />
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = "#6366f1", className = "", showLabel }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: isOver ? "#ef4444" : color }}
        />
      </div>
      {showLabel && <span className="text-xs text-muted-foreground min-w-[36px] text-right">{Math.round(pct)}%</span>}
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <div className={`border-t border-border ${className}`} />;
}

export function AmountDisplay({ amount, className = "" }: { amount: number; className?: string }) {
  const { convertAndFormat } = useApp();
  const isPositive = amount >= 0;
  return (
    <span className={`font-mono font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"} ${className}`}>
      {convertAndFormat(amount)}
    </span>
  );
}

export function StatCard({ label, value, change, color, icon }: { label: string; value: string; change?: string; color?: string; icon?: ReactNode }) {
  const isPos = change?.startsWith("+");
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <span className="font-mono text-xl font-semibold" style={{ color }}>{value}</span>
        {change && (
          <span className={`text-xs ${isPos ? "text-emerald-400" : "text-red-400"}`}>{change}</span>
        )}
      </div>
    </Card>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold border border-primary/30`}>
      {initials}
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-switch-background"}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function Select({ label, value, onChange, options, className = "" }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm text-muted-foreground">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-input-background border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-primary/60 appearance-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }: { icon: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs">{subtitle}</p>
      {action}
    </div>
  );
}
