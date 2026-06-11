import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  FolderMinus, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Trash2,
  Download,
  PlusCircle,
  FileCheck2,
  Sparkle
} from 'lucide-react';
import { Transaction, CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../utils/mockData';
import LucideIcon from './LucideIcon';

interface DashboardViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onSimulatePayday: () => void;
  onOpenAdd: () => void;
  userName?: string;
  onLogout?: () => void;
}

export default function DashboardView({ 
  transactions, 
  onDeleteTransaction, 
  onSimulatePayday,
  onOpenAdd,
  userName,
  onLogout
}: DashboardViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Math totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Export Data to JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `Mujeeb_ExpenseTracker_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Safe category color finder
  const getCategoryTheme = (categoryName: string): { color: string, bgColor: string, icon: string } => {
    const cat = INITIAL_CATEGORIES.find(c => c.name === categoryName);
    if (cat) return { color: cat.color, bgColor: cat.bgColor, icon: cat.iconName };
    return { color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)', icon: 'DollarSign' };
  };

  // Get current greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  return (
    <div className="space-y-6 pb-28">
      
      {/* Greetings Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs text-[#A1A1AA] font-mono tracking-wider uppercase">{getGreeting()}</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA] flex items-center gap-1.5 font-sans">
            Hello, {userName || 'Mujeeb'}!
            <Sparkle size={18} className="text-[#2DD4BF] fill-[#2DD4BF] animate-pulse" />
          </h1>
        </div>
        
        {/* Simple User Profile Icon and Sign Out action */}
        <div className="flex items-center gap-2.5">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-[10px] font-mono font-bold bg-[#18181B] hover:bg-rose-950/20 text-[#A1A1AA] hover:text-[#F43F5E] rounded-lg border border-[#27272A] hover:border-[#F43F5E]/30 transition-all cursor-pointer"
              title="Sign Out Session"
              id="dashboard-logout-btn"
            >
              Sign out
            </button>
          )}
          <div className="w-10 h-10 rounded-full border border-[#27272A] bg-[#18181B] flex items-center justify-center text-[#2DD4BF] font-mono font-bold text-sm">
            {(userName || 'Mujeeb').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Grid wrapper for Desktop full screen layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column on Desktop (Balance & Quick Actions) */}
        <div className="md:col-span-5 space-y-6">
          {/* Holographic Balance Platinum Card */}
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-tr from-[#2DD4BF] via-[#2E1065] to-[#09090B] border border-[#27272A] p-6 shadow-xl shadow-black/40">
            {/* Background ambient lighting */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#2DD4BF]/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2E1065]/40 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-mono tracking-wider text-[#A1A1AA] uppercase">NET BALANCE</span>
                <div className="text-3xl font-mono font-bold tracking-tight text-white">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              {/* Card Label style */}
              <div className="text-[10px] font-mono tracking-widest text-[#2DD4BF] bg-[#18181B]/90 px-2.5 py-1 rounded-full border border-[#27272A]">
                PLATINUM DEBIT
              </div>
            </div>

            {/* Card Number Mock */}
            <div className="mt-6 mb-8 relative z-10">
              <span className="text-sm font-mono tracking-widest text-zinc-300 font-medium">
                ••••  ••••  ••••  2026
              </span>
            </div>

            {/* Divider line */}
            <div className="h-px bg-white/10 my-4 relative z-10" />

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                  <ArrowDownRight size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block tracking-wider uppercase">INCOME</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F43F5E]/10 flex items-center justify-center text-[#F43F5E]">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-[#A1A1AA] block tracking-wider uppercase">EXPENSES</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={onOpenAdd}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] transition-all text-xs font-semibold text-white gap-1.5 focus:outline-none cursor-pointer"
              id="action-add-expense"
            >
              <div className="w-8 h-8 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                <PlusCircle size={16} />
              </div>
              Add Item
            </button>

            <button
              onClick={onSimulatePayday}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] transition-all text-xs font-semibold text-white gap-1.5 focus:outline-none cursor-pointer"
              id="action-payday-simulation"
            >
              <div className="w-8 h-8 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] animate-pulse">
                <TrendingUp size={16} />
              </div>
              Get Paid
            </button>

            <button
              onClick={handleExportData}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] transition-all text-xs font-semibold text-white gap-1.5 focus:outline-none cursor-pointer"
              id="action-export-json"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[#A1A1AA]">
                <Download size={16} />
              </div>
              Export Data
            </button>
          </div>
        </div>

        {/* Right Column on Desktop (Transactions & Filter list) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h2>
            <span className="text-xs text-[#2DD4BF] font-mono tracking-wider uppercase font-semibold">
              {filteredTransactions.length} Items Match
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search stores, tags, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF] transition-colors placeholder:text-zinc-600"
              id="search-transactions-field"
            />
          </div>

          {/* Horizontal Category Pill selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                selectedCategory === null
                  ? 'bg-[#2DD4BF] text-[#09090B] border-[#2DD4BF]'
                  : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white'
              }`}
            >
              All Categories
            </button>
            
            {INITIAL_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                    isSelected
                      ? 'text-[#09090B] border-[#2DD4BF]'
                      : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:text-white'
                  }`}
                  style={{ backgroundColor: isSelected ? '#2DD4BF' : undefined }}
                >
                  <span className={isSelected ? 'text-[#09090B]' : ''} style={{ color: isSelected ? '#09090B' : cat.color }}>•</span>
                  <span className={isSelected ? 'text-[#09090B] font-bold' : ''}>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Transactions Stack */}
          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center bg-[#18181B] rounded-2xl border border-dashed border-[#27272A] flex flex-col items-center justify-center gap-3">
                <FolderMinus size={36} className="text-zinc-600" />
                <p className="text-[#A1A1AA] text-sm">No transaction items found matching "{search}"</p>
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const theme = getCategoryTheme(t.category);
                return (
                  <motion.div
                    key={t.id}
                    layoutId={`transaction-card-${t.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative h-[76px] bg-[#18181B] border border-[#27272A] hover:border-[#2DD4BF]/55 rounded-2xl p-4 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Category Icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: theme.bgColor }}
                      >
                        <LucideIcon name={theme.icon} className="text-white" size={18} style={{ color: theme.color }} />
                      </div>

                      {/* Meta info */}
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-white group-hover:text-[#2DD4BF] transition-colors block leading-tight">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#A1A1AA] tracking-wide font-medium">
                            {t.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[11px] text-[#71717A] font-mono">
                            {t.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right hand side context */}
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-mono font-bold tracking-tight ${
                        t.type === 'income' ? 'text-[#2DD4BF]' : 'text-zinc-100'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>

                      {/* Delete trigger */}
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-[#F43F5E] hover:text-rose-300 transition-all focus:opacity-100 focus:outline-none cursor-pointer"
                        title="Delete Transaction"
                        id={`delete-btn-${t.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
