import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';
import { INITIAL_CATEGORIES } from '../utils/mockData';

interface AnalyticsViewProps {
  transactions: Transaction[];
}

export default function AnalyticsView({ transactions }: AnalyticsViewProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; label: string; val: number } | null>(null);

  // Math variables
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by Category
  const categoryTotals: { [key: string]: number } = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Convert categories object to dynamic array
  const categoryBreakdown = Object.keys(categoryTotals).map(catName => {
    const parentCat = INITIAL_CATEGORIES.find(c => c.name === catName);
    return {
      name: catName,
      amount: categoryTotals[catName],
      percent: totalExpense > 0 ? (categoryTotals[catName] / totalExpense) * 100 : 0,
      color: parentCat?.color || '#8B5CF6',
      bgColor: parentCat?.bgColor || 'rgba(139, 92, 246, 0.1)',
      icon: parentCat?.iconName || 'DollarSign'
    };
  }).sort((a,b) => b.amount - a.amount);

  // Custom SVG Chart Data: Monthly level (Jan - June 2026)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // Let's split transactions into months
  const monthlyIncomes = [1200, 3100, 4800, 4400, 4800, 4800]; // Seed baseline
  const monthlyExpenses = [950, 1800, 1400, 2100, 1950, 1600]; // Seed baseline

  // We overwrite June values using actual transaction props so it updates in real-time
  let currentJuneExpense = 0;
  let currentJuneIncome = 0;
  
  transactions.forEach(t => {
    if (t.date.startsWith('2026-06')) {
      if (t.type === 'expense') currentJuneExpense += t.amount;
      if (t.type === 'income') currentJuneIncome += t.amount;
    }
  });

  monthlyExpenses[5] = currentJuneExpense;
  monthlyIncomes[5] = currentJuneIncome;

  // For weekly graph (Last 7 days of dates representation inside June)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyExpenses = [45, 120, 88, 55, 142.50, currentJuneExpense * 0.15, currentJuneExpense * 0.2];
  const weeklyIncomes = [100, 0, 125, 0, 0, 0, 200];

  const activeLabels = period === 'monthly' ? months : weekdays;
  const activeIncomes = period === 'monthly' ? monthlyIncomes : weeklyIncomes;
  const activeExpenses = period === 'monthly' ? monthlyExpenses : weeklyExpenses;

  // Compute SVG plotting path coordinates
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const maxVal = Math.max(...activeIncomes, ...activeExpenses, 1000) * 1.1;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingX + (index / (activeLabels.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  };

  // Generate SVG Path for Income line
  const incomeCoords = activeIncomes.map((val, i) => getCoordinates(i, val));
  let incomePath = '';
  if (incomeCoords.length > 0) {
    incomePath = `M ${incomeCoords[0].x} ${incomeCoords[0].y} ` + 
      incomeCoords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
  }

  // Generate SVG Path for Expense Line and area
  const expenseCoords = activeExpenses.map((val, i) => getCoordinates(i, val));
  let expensePath = '';
  let expenseAreaPath = '';
  if (expenseCoords.length > 0) {
    expensePath = `M ${expenseCoords[0].x} ${expenseCoords[0].y} ` + 
      expenseCoords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');

    // Extend path to floor values to create enclosed area shading
    expenseAreaPath = `${expensePath} L ${expenseCoords[expenseCoords.length - 1].x} ${paddingY + chartHeight} L ${expenseCoords[0].x} ${paddingY + chartHeight} Z`;
  }

  // Double check averages
  const avgExpense = totalExpense / (period === 'monthly' ? 6 : 7);

  return (
    <div className="space-y-6 pb-28">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#A1A1AA] font-mono tracking-wider uppercase">ANALYTICS SCREEN</span>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Spending Insights
            <TrendingUp size={18} className="text-[#2DD4BF]" />
          </h1>
        </div>

        {/* Weekly & Monthly Toggles */}
        <div className="bg-[#18181B] p-1 rounded-xl flex border border-[#27272A]">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'weekly' 
                ? 'bg-[#2DD4BF] text-[#09090B] shadow-sm shadow-black/25' 
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === 'monthly' 
                ? 'bg-[#2DD4BF] text-[#09090B] shadow-sm shadow-black/25' 
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Grid container for Full Screen desktop layouts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left column (Span 7) — Interactive charts and indicators */}
        <div className="md:col-span-7 space-y-6">
          {/* Main Interactive SVG Trend Area Chart */}
          <div className="relative bg-[#18181B] border border-[#27272A] rounded-[24px] p-5">
            
            {/* Graph Legend */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                  <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">EXPENSES</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" />
                  <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">INCOMES</span>
                </div>
              </div>
              <div className="text-[10px] text-[#71717A] font-mono">
                Values in USD ($)
              </div>
            </div>

            {/* SVG Drawing Canvas */}
            <div className="relative overflow-visible" style={{ touchAction: 'none' }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingY + ratio * chartHeight;
                  const gridVal = maxVal * (1 - ratio);
                  return (
                    <g key={i}>
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={svgWidth - paddingX} 
                        y2={y} 
                        stroke="rgba(39, 39, 42, 0.25)" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingX - 10} 
                        y={y + 3} 
                        fill="rgba(161, 161, 170, 0.5)" 
                        fontSize="9" 
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        ${Math.round(gridVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Enclosed Area Path under Expense curve */}
                {expenseAreaPath && (
                  <path d={expenseAreaPath} fill="url(#expenseGradient)" />
                )}

                {/* Income Line & Nodes */}
                {incomePath && (
                  <path d={incomePath} fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {/* Expense Line & Nodes */}
                {expensePath && (
                  <path d={expensePath} fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {/* Interactive Circles / Nodes */}
                {expenseCoords.map((coord, i) => {
                  const val = activeExpenses[i];
                  return (
                    <circle
                      key={`exp-node-${i}`}
                      cx={coord.x}
                      cy={coord.y}
                      r="4"
                      fill="#F43F5E"
                      stroke="#18181B"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:r-6 transition-all duration-150"
                      onMouseEnter={() => setHoveredNode({ x: coord.x, y: coord.y, label: activeLabels[i], val })}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                  );
                })}

                {incomeCoords.map((coord, i) => {
                  const val = activeIncomes[i];
                  return (
                    <circle
                      key={`inc-node-${i}`}
                      cx={coord.x}
                      cy={coord.y}
                      r="4"
                      fill="#2DD4BF"
                      stroke="#18181B"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:r-6 transition-all duration-150"
                      onMouseEnter={() => setHoveredNode({ x: coord.x, y: coord.y, label: activeLabels[i], val })}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                  );
                })}

                {/* Axis Labels (Mon, Tue, Wed...) */}
                {activeLabels.map((label, i) => {
                  const x = paddingX + (i / (activeLabels.length - 1)) * chartWidth;
                  return (
                    <text
                      key={i}
                      x={x}
                      y={svgHeight - paddingY + 16}
                      fill="rgba(161, 161, 170, 0.7)"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>

              {/* Interactive Tooltip popup card */}
              {hoveredNode && (
                <div 
                  className="absolute z-10 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 shadow-xl text-[11px] pointer-events-none"
                  style={{
                    left: `${(hoveredNode.x / svgWidth) * 100}%`,
                    top: `${(hoveredNode.y / svgHeight) * 100 - 15}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="font-semibold text-[#A1A1AA] mb-0.5">{hoveredNode.label}</div>
                  <div className="text-white font-mono font-bold">${hoveredNode.val.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Category Pie wheel proportion */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-[24px] p-5 flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-[10px] text-[#71717A] tracking-wider font-mono uppercase mb-4">Proportional Expenditure Wheel</span>
            {categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-[#A1A1AA] text-xs">
                No active records.
              </div>
            ) : (
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="transparent" stroke="#27272A" strokeWidth="3" />
                  {(() => {
                    let accumulatedPercentage = 0;
                    return categoryBreakdown.map((item, index) => {
                      const strokeDasharray = `${item.percent} ${100 - item.percent}`;
                      const strokeDashoffset = 100 - accumulatedPercentage + 25;
                      accumulatedPercentage += item.percent;

                      return (
                        <circle
                          key={index}
                          cx="18"
                          cy="18"
                          r="16"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="3.2"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-[#A1A1AA] font-mono tracking-widest uppercase">SPENT</span>
                  <span className="text-base font-mono font-bold text-white leading-tight">
                    ${totalExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column (Span 5) — Stat blocks and listing detail bars */}
        <div className="md:col-span-5 space-y-6">
          {/* Numerical Quick Stats banner */}
          <div className="grid grid-cols-2 gap-4 bg-[#18181B] border border-[#27272A] rounded-2xl p-5">
            <div>
              <span className="text-[10px] text-[#A1A1AA] font-semibold tracking-wider block uppercase leading-tight">AVG SPENT</span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                ${avgExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-[#2DD4BF] font-medium flex items-center gap-0.5 mt-0.5">
                -4.5% versus last period
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#A1A1AA] font-semibold tracking-wider block uppercase leading-tight">SAVINGS Target</span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {totalIncome > 0 ? ((1 - totalExpense / totalIncome) * 100).toFixed(0) : '0'}%
              </div>
              <span className="text-[10px] text-[#2DD4BF] font-medium flex items-center gap-0.5 mt-0.5">
                Saving ${Math.max(0, totalIncome - totalExpense).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Category Breakdown list progress bars */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Category Breakdown</h2>
            <div className="bg-[#18181B] border border-[#27272A] rounded-[24px] p-5 space-y-3.5">
              {categoryBreakdown.length === 0 ? (
                <div className="py-8 text-center text-[#A1A1AA] text-sm">
                  Add expense items to view category analytics.
                </div>
              ) : (
                categoryBreakdown.slice(0, 5).map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-white">{item.name}</span>
                      </div>
                      <span className="font-mono text-[#A1A1AA] font-medium">${item.amount.toFixed(2)}</span>
                    </div>

                    {/* Progress slider base */}
                    <div className="h-1.5 w-full bg-[#09090B] rounded-full overflow-hidden border border-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
