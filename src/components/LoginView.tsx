import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Key, Mail, Wallet, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, userName: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoUnlock = () => {
    setEmail('mujeeb.ledger@auden.com');
    setPassword('demopass123');
    setName('Mujeeb Nossam');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your Ledger Email and Passkey.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate luxury ledger authorization
    setTimeout(() => {
      setIsLoading(false);
      const displayName = name.trim() || 'Mujeeb';
      onLogin(email, displayName);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#09090B] flex items-center justify-center text-gray-100 font-sans overflow-hidden py-6 px-4 md:px-0">
      
      {/* Decorative full screen element and gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2DD4BF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E1065]/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Dual Container */}
      <div className="w-full max-w-5xl bg-[#0F0F11] border border-[#27272A] rounded-3xl overflow-hidden shadow-2xl relative grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        
        {/* Left Side: Editorial Premium Panel (Desktop Only) */}
        <div className="hidden md:flex md:col-span-6 bg-gradient-to-br from-[#18181B] to-[#0A0A0C] p-12 flex-col justify-between relative border-r border-[#27272A]">
          {/* Subtle light guide */}
          <div className="absolute inset-0 bg-radial-gradient from-[#2DD4BF]/5 via-transparent to-transparent opacity-60" />
          
          {/* Top Logo branding */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] border border-[#2DD4BF]/20">
              <Wallet size={16} />
            </div>
            <span className="text-sm font-mono tracking-widest text-[#FAFAFA] font-bold">AUDEN LEDGER</span>
          </div>

          {/* Core Concept Display */}
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              A crafted space for <br />
              <span className="text-[#2DD4BF]">wealth intelligence.</span>
            </h1>
            <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-sm">
              Track live expenses, configure budget targets dynamically, and let our custom AI engine optimize your personal cash flows.
            </p>

            {/* Quick Micro Stat Cards for luxury layout feel */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-[#18181B] border border-[#27272A]/70 rounded-xl space-y-1">
                <span className="text-[10px] text-[#A1A1AA] font-mono block">LEDGER STATUS</span>
                <span className="text-xs font-semibold text-[#2DD4BF] flex items-center gap-1.5">
                  <ShieldCheck size={12} /> SECURED
                </span>
              </div>
              <div className="p-4 bg-[#18181B] border border-[#27272A]/70 rounded-xl space-y-1">
                <span className="text-[10px] text-[#A1A1AA] font-mono block">MODEL ENGINE</span>
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> GEMINI v3.5
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Branding / Trademark footer */}
          <div className="relative z-10 text-[10px] font-mono text-[#71717A] tracking-wider uppercase">
            Designed for Desktop & Mobile • Version 2026.1
          </div>
        </div>

        {/* Right Side: Secure Authenticators Form Form */}
        <div className="col-span-1 md:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-[#0F0F11]">
          
          <div className="space-y-6 max-w-sm mx-auto w-full">
            
            {/* Mobile Header Logo fallback */}
            <div className="flex md:hidden items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] border border-[#2DD4BF]/20">
                  <Wallet size={16} />
                </div>
                <span className="text-sm font-mono tracking-widest text-[#FAFAFA] font-bold">AUDEN LEDGER</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500">2026</span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">Log in to Ledger</h2>
              <p className="text-xs text-[#A1A1AA]">
                Enter details to sync your personal wealth ledger.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-[#F43F5E] font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Optional Name field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">YOUR ACCOUNT NAME</label>
                <div className="relative">
                  <UserCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Mujeeb Nossam (Optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF] transition-colors placeholder:text-zinc-600"
                    id="login-name-input"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">LEDGER IDENTIFIER / EMAIL</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="name@auden.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF] transition-colors placeholder:text-zinc-600"
                    id="login-email-input"
                  />
                </div>
              </div>

              {/* Secure Password Key */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">LEDGER PASSWORD KEY</label>
                  <span className="text-[10px] text-[#2DD4BF] font-mono">Demo mode active</span>
                </div>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white text-xs focus:outline-none focus:border-[#2DD4BF] transition-colors placeholder:text-zinc-600"
                    id="login-password-input"
                  />
                </div>
              </div>

              {/* Submit Trigger BTN */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#09090B] font-bold rounded-xl text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-all shadow-lg shadow-teal-500/10 active:scale-98 disabled:opacity-60 cursor-pointer mt-2"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                    <span>Synchronizing Logs...</span>
                  </>
                ) : (
                  <>
                    <span>Decrypt Vault</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Assist Unlock Link block */}
            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2.5">
              <span className="text-[10px] text-[#A1A1AA] text-center font-mono">OR SIMULATE AN INSTANT ENTRANCE</span>
              <button
                type="button"
                onClick={handleDemoUnlock}
                className="w-full py-2.5 bg-[#18181B] hover:bg-zinc-800 text-white border border-[#27272A] hover:border-[#2DD4BF]/50 text-[11px] font-bold font-mono rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98"
                id="login-demo-helper-btn"
              >
                <Sparkles size={12} className="text-[#2DD4BF]" />
                Autofill Mujeeb's Demo Credentials
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
