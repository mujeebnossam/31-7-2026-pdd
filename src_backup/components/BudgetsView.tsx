import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Plus, Sparkles, PiggyBank, Edit3, Trash2, ArrowUpRight } from 'lucide-react';
import { Budget, CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../utils/mockData';

interface BudgetsViewProps {
  budgets: Budget[];
  onUpdateBudgetLimit: (category: string, newLimit: number) => void;
  onAddBudget: (category: string, limit: number) => void;
  onDeleteBudget: (category: string) => void;
}

export default function BudgetsView({ 
  budgets, 
  onUpdateBudgetLimit,
  onAddBudget,
  onDeleteBudget
}: BudgetsViewProps) {
  const [newCategory, setNewCategory] = useState('Food & Dining');
  const [newLimitStr, setNewLimitStr] = useState('200');

  // Math totals
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = Math.max(0, totalLimit - totalSpent);
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  // Overspent categories
  const overspentBudgets = budgets.filter(b => b.spent >= b.limit && b.limit > 0);

  // Find unused categories
  const configuredCategories = budgets.map(b => b.category);
  const availableCategories = INITIAL_CATEGORIES.filter(cat => 
    cat.name !== 'Salary' && cat.name !== 'Investments' && !configuredCategories.includes(cat.name)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitVal = parseFloat(newLimitStr);
    if (isNaN(limitVal) || limitVal <= 0) {
      alert('Please enter a valid budget limit');
      return;
    }
    
    onAddBudget(newCategory, limitVal);
    
    // Reset selection to whatever is leftover
    if (availableCategories.length > 1) {
      const nextAvail = availableCategories.find(c => c.name !== newCategory);
      if (nextAvail) {
        setNewCategory(nextAvail.name);
      }
    }
    setNewLimitStr('200');
  };

  const handleQuickAdjust = (category: string, currentLimit: number, adjustment: number) => {
    const updated = Math.max(10, currentLimit + adjustment);
    onUpdateBudgetLimit(category, updated);
  };

  return (
    <div className="space-y-6 pb-28 w-full">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#A1A1AA] font-mono tracking-wider uppercase">LIMIT MONITOR</span>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Budget Control
            <PiggyBank size={18} className="text-[#2DD4BF]" />
          </h1>
        </div>
      </div>

      {/* Visual Indicator / Alert Notification Banner for Overspent Categories */}
      {overspentBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1C0F14] border border-rose-900/40 rounded-[24px] p-5 space-y-4 shadow-xl shadow-black/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#F43F5E]/10 text-[#F43F5E] border border-rose-900/30">
              <AlertCircle size={18} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#F43F5E] font-mono tracking-wider uppercase font-bold">BUDGET EXCEEDANCE ALERTER</span>
              <h3 className="text-sm font-bold text-white">
                Spending Limit Exceeded in {overspentBudgets.length} {overspentBudgets.length === 1 ? 'Category' : 'Categories'}
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                You have exceeded set thresholds. Immediate action is recommended to offset overages or re-adjust limits.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {overspentBudgets.map(b => (
              <div 
                key={`banner-${b.category}`}
                className="flex items-center justify-between p-3.5 bg-[#09090B]/70 border border-rose-950/40 rounded-xl"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">{b.category}</span>
                  <span className="text-[10px] text-[#F43F5E] font-mono font-semibold">
                    Overby: ${(b.spent - b.limit).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(b.category, b.limit, 50)}
                  className="px-2.5 py-1.5 text-[10px] font-mono font-bold bg-[#1F1216] hover:bg-[#F43F5E]/10 text-rose-300 hover:text-white rounded-lg border border-rose-900/30 transition-all cursor-pointer"
                >
                  Restore (+$50)
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid Wrapper for Desktop Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Span 7) - List of Active Budgets & categories */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Categories</h2>

            <div className="space-y-3">
              {budgets.length === 0 ? (
                <div className="py-12 text-center bg-[#18181B] rounded-2xl border border-dashed border-[#27272A] flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={36} className="text-zinc-600" />
                  <p className="text-[#A1A1AA] text-sm">No spend category budgets set. Create one below!</p>
                </div>
              ) : (
                budgets.map((b) => {
                  const fraction = b.limit > 0 ? b.spent / b.limit : 0;
                  const percent = fraction * 100;
                  const isOverspent = b.spent >= b.limit;
                  const isWarningThreshold = percent >= 85 && !isOverspent;
                  const catColor = b.color || '#2DD4BF';

                  return (
                    <motion.div
                      key={b.category}
                      layoutId={`budget-card-${b.category}`}
                      className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-bold text-white">{b.category}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#A1A1AA] font-mono">
                              Spent: ${b.spent.toFixed(2)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className="text-xs text-[#A1A1AA] font-mono">
                              Goal Limit: ${b.limit.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {/* Right action delete */}
                        <button
                          onClick={() => onDeleteBudget(b.category)}
                          className="p-1.5 opacity-60 hover:opacity-100 rounded-lg bg-zinc-800 hover:bg-rose-950/20 text-[#A1A1AA] hover:text-[#F43F5E] hover:border hover:border-rose-900/30 transition-all focus:outline-none cursor-pointer"
                          title="Clear Limit"
                          id={`delete-budget-btn-${b.category}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Progressive indicator slider */}
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-[#09090B] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, percent)}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: isOverspent ? '#F43F5E' : isWarningThreshold ? '#ED8936' : catColor }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-[#71717A] font-medium">
                            {percent.toFixed(0)}% Utilized
                          </span>

                          {/* Over-spent warnings */}
                          {isOverspent ? (
                            <span className="text-[10px] font-bold text-[#F43F5E] bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle size={9} />
                              Overspent by ${(b.spent - b.limit).toFixed(2)}
                            </span>
                          ) : isWarningThreshold ? (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertCircle size={9} />
                              Warning: Approaching Limit
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#2DD4BF] bg-teal-950/25 border border-teal-900/30 px-2 py-0.5 rounded-full">
                              Remaining: ${(b.limit - b.spent).toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Micro Increment / Decrements Adjustments */}
                      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                        <span className="text-[10px] font-semibold text-[#71717A] tracking-wider uppercase mr-1">QUICK ADJUST:</span>
                        <button
                          onClick={() => handleQuickAdjust(b.category, b.limit, -50)}
                          className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#09090B] hover:bg-zinc-800 text-[#F43F5E] rounded-lg border border-[#27272A] transition-all cursor-pointer"
                        >
                          -$50
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(b.category, b.limit, -10)}
                          className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#09090B] hover:bg-zinc-800 text-rose-300 rounded-lg border border-[#27272A] transition-all cursor-pointer"
                        >
                          -$10
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(b.category, b.limit, 10)}
                          className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#09090B] hover:bg-zinc-800 text-[#2DD4BF] rounded-lg border border-[#27272A] transition-all cursor-pointer"
                        >
                          +$10
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(b.category, b.limit, 50)}
                          className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#09090B] hover:bg-zinc-800 text-[#2DD4BF] rounded-lg border border-[#27272A] transition-all cursor-pointer"
                        >
                          +$50
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Span 5) - Global Pool Metrics & Budget creation */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Global Limit Progress Banner */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-[24px] p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A1A1AA] font-mono tracking-wider uppercase">ESTIMATED EXPENDITURE POOL</span>
                <div className="text-2xl font-mono font-bold text-white">
                  ${totalSpent.toLocaleString('en-US', { maximumFractionDigits: 2 })} / ${totalLimit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#71717A] font-mono uppercase">REMAINING POOL</span>
                <div className="text-lg font-mono font-bold text-[#2DD4BF]">
                  ${remainingBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Big visual slider bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-[#09090B] rounded-full overflow-hidden p-0.5 border border-[#27272A]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, totalPercent)}%` }}
                  className={`h-full rounded-full ${
                    totalPercent >= 90 ? 'bg-[#F43F5E]' : totalPercent >= 75 ? 'bg-amber-500' : 'bg-[#2DD4BF]'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#A1A1AA]">
                <span>{totalPercent.toFixed(0)}% Spanned</span>
                <span>{remainingBudget > 0 ? 'Comfort Level' : 'Critical Level Reached'}</span>
              </div>
            </div>
          </div>

          {/* Inline Create Budget Card */}
          {availableCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Create Limit</h3>
              
              <form onSubmit={handleSubmit} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Category picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">CATEGORY</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-3 bg-[#09090B] border border-[#27272A] rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-[#2DD4BF]"
                      id="select-budget-category"
                    >
                      {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Limit input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider block">MONTHLY LIMIT ($)</label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      required
                      placeholder="e.g. 300"
                      value={newLimitStr}
                      onChange={(e) => setNewLimitStr(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-white text-xs font-mono font-semibold focus:outline-none focus:border-[#2DD4BF]"
                      id="input-budget-limit"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#09090B] font-bold rounded-xl text-xs flex items-center justify-center gap-2 tracking-wider uppercase transition-colors shadow-lg active:scale-98 cursor-pointer"
                  id="submit-new-budget-btn"
                >
                  <Plus size={14} />
                  Provision Limit
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
