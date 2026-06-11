import React from 'react';
import { motion } from 'motion/react';
import { Home, BarChart2, PieChart, Sparkles, Plus, Wallet } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenAdd: () => void;
}

export default function Navigation({ activeTab, onChangeTab, onOpenAdd }: NavigationProps) {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: Home },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart2 },
    { id: 'add-placeholder', label: 'Add', icon: Plus, isSpurred: true },
    { id: 'budgets' as ActiveTab, label: 'Budgets', icon: PieChart },
    { id: 'ai-advisor' as ActiveTab, label: 'AI Coach', icon: Sparkles, isAi: true }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-6 z-40">
      <div className="relative bg-[#18181B]/95 backdrop-blur-md border border-[#27272A] rounded-[28px] h-20 px-4 flex items-center justify-between shadow-2xl shadow-black/40">
        
        {/* Navigation buttons */}
        {tabs.map((tab) => {
          if (tab.isSpurred) {
            // Big elevated middle CTA addition button
            return (
              <div key="add-cta" className="relative -top-7">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onOpenAdd}
                  className="w-14 h-14 bg-[#2DD4BF] text-[#09090B] rounded-full flex items-center justify-center shadow-lg shadow-teal-500/10 focus:outline-none"
                  id="nav-add-btn"
                >
                  <Plus size={28} strokeWidth={2.5} />
                </motion.button>
              </div>
            );
          }

          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => tab.id !== 'add-placeholder' && onChangeTab(tab.id as ActiveTab)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-gray-400 focus:outline-none"
              id={`nav-tab-${tab.id}`}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                {/* Icon wrapper */}
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0
                  }}
                  className={`p-1.5 rounded-xl transition-colors duration-300 ${
                    isActive 
                      ? 'text-[#2DD4BF] bg-[#2DD4BF]/10' 
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                </motion.div>
                
                {/* Label */}
                <span className={`text-[10px] tracking-wide font-medium ${isActive ? 'text-white' : 'text-[#71717A]'}`}>
                  {tab.label}
                </span>
              </div>

              {/* sliding backdrop bubble for active item */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
