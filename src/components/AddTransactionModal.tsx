import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Edit3, Plus, Delete } from 'lucide-react';
import { CategoryItem, Transaction } from '../types';
import { INITIAL_CATEGORIES } from '../utils/mockData';
import LucideIcon from './LucideIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amountStr, setAmountStr] = useState('0');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter categories by type
  const displayCategories = INITIAL_CATEGORIES.filter(cat => {
    if (type === 'income') {
      return cat.id === 'salary' || cat.id === 'investment';
    }
    return cat.id !== 'salary';
  });

  // Dynamic set of default categories based on chosen transaction type
  React.useEffect(() => {
    if (type === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Food & Dining');
    }
  }, [type]);

  const handleKeyPress = (val: string) => {
    if (val === 'C') {
      setAmountStr('0');
      return;
    }
    if (val === 'backspace') {
      if (amountStr.length <= 1) {
        setAmountStr('0');
      } else {
        setAmountStr(amountStr.slice(0, -1));
      }
      return;
    }
    if (val === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr(amountStr + '.');
      return;
    }

    // Default digit addition
    if (amountStr === '0') {
      setAmountStr(val);
    } else {
      // Limit decimals to 2 places
      const parts = amountStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      setAmountStr(amountStr + val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amountStr);
    
    if (numericAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title or merchant name');
      return;
    }

    onAdd({
      title: title.trim(),
      amount: numericAmount,
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    });

    // Reset fields
    setAmountStr('0');
    setTitle('');
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="relative w-full max-w-lg bg-[#18181B] border-t sm:border border-[#27272A] rounded-t-[32px] sm:rounded-[24px] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] shadow-2xl shadow-black/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#27272A]">
              <span className="text-sm font-semibold tracking-wider uppercase text-[#A1A1AA]">Add Transaction</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-[#A1A1AA] hover:text-white transition-colors"
                id="close-modal-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              {/* Type Switcher */}
              <div className="bg-[#09090B] p-1 rounded-2xl flex border border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all duration-300 ${
                    type === 'expense'
                      ? 'bg-[#F43F5E] text-white shadow-md shadow-red-950/20'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                  id="switch-expense-btn"
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all duration-300 ${
                    type === 'income'
                      ? 'bg-[#2DD4BF] text-[#09090B] font-bold shadow-md shadow-teal-950/25'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                  id="switch-income-btn"
                >
                  Income
                </button>
              </div>

              {/* Amount Display */}
              <div className="flex flex-col items-center justify-center py-4 bg-[#09090B] border border-[#27272A] rounded-3xl">
                <span className="text-xs font-mono font-semibold tracking-wider text-[#2DD4BF] uppercase mb-1">
                  ENTERED AMOUNT
                </span>
                <div className="flex items-baseline text-white">
                  <span className={`text-4xl font-semibold mr-1 ${type === 'expense' ? 'text-[#F43F5E]' : 'text-[#2DD4BF]'}`}>
                    $
                  </span>
                  <span className="text-5xl font-mono font-bold tracking-tight">
                    {amountStr}
                  </span>
                </div>
              </div>

              {/* Quick Numeric Keypad */}
              <div className="grid grid-cols-4 gap-2 bg-[#09090B]/50 p-3 rounded-2xl border border-[#27272A]">
                {['1', '2', '3', 'backspace', '4', '5', '6', 'C', '7', '8', '9', '.', '0'].map((key) => {
                  if (key === 'backspace') {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeyPress('backspace')}
                        className="h-12 flex items-center justify-center rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 text-zinc-300 border border-[#27272A] transition-all font-mono active:scale-95"
                      >
                        <Delete size={18} />
                      </button>
                    );
                  }
                  if (key === 'C') {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeyPress('C')}
                        className="h-12 flex items-center justify-center rounded-xl bg-rose-950/20 hover:bg-rose-900/30 text-[#F43F5E] border border-rose-900/30 transition-all font-semibold active:scale-95"
                      >
                        C
                      </button>
                    );
                  }
                  // Spacer to make 0 take cols properly
                  if (key === '0') {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeyPress('0')}
                        className="col-span-2 h-12 flex items-center justify-center rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white border border-[#27272A] transition-all font-bold text-lg active:scale-95"
                      >
                        0
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeyPress(key)}
                      className="h-12 flex items-center justify-center rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white border border-[#27272A] transition-all font-bold text-lg active:scale-95"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              {/* Merchant Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                  <Edit3 size={12} className="text-[#2DD4BF]" />
                  Title / Merchant name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks Coffee, Gym Pay"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#09090B] border border-[#27272A] rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF] transition-colors placeholder:text-zinc-600"
                  id="merchant-title-input"
                />
              </div>

              {/* Categories Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Select Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {displayCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                        category === cat.name
                          ? 'bg-[#18181B] border-[#2DD4BF] text-white font-semibold'
                          : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:bg-[#18181B]'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5"
                        style={{ backgroundColor: category === cat.name ? cat.color : cat.bgColor }}
                      >
                        <LucideIcon
                          name={cat.iconName}
                          size={16}
                          style={{ color: category === cat.name ? '#000' : cat.color }}
                        />
                      </div>
                      <span className="text-[10px] text-center truncate w-full tracking-wide">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Hide Details toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold text-[#2DD4BF] hover:text-[#2DD4BF]/90 flex items-center gap-1 mt-1"
                >
                  {showAdvanced ? 'Hide note & date' : 'Show note & date options'}
                </button>
              </div>

              {/* Notes & Date details */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4"
                  >
                    {/* Date picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#2DD4BF]" />
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3.5 bg-[#09090B] border border-[#27272A] rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF] transition-colors"
                      />
                    </div>

                    {/* Extra Notes */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                        Notes & Details
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Add some remarks..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 bg-[#09090B] border border-[#27272A] rounded-xl text-white text-sm focus:outline-none focus:border-[#2DD4BF] transition-colors placeholder:text-zinc-600 resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Confirm Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                    type === 'expense'
                      ? 'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-rose-950/20'
                      : 'bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#09090B] shadow-teal-950/25'
                  }`}
                  id="confirm-add-transaction-btn"
                >
                  <Plus size={18} />
                  Add {type === 'expense' ? 'Expense' : 'Income'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
