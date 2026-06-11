/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Transaction, Budget } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from './utils/mockData';
import Navigation from './components/Navigation';
import AddTransactionModal from './components/AddTransactionModal';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import BudgetsView from './components/BudgetsView';
import AiAdvisorView from './components/AiAdvisorView';
import LoginView from './components/LoginView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Track currently logged-in user session
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const local = localStorage.getItem('mujeeb_expense_user');
    return local ? JSON.parse(local) : null;
  });

  // Backed by persistent localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const local = localStorage.getItem('mujeeb_expense_transactions');
    return local ? JSON.parse(local) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const local = localStorage.getItem('mujeeb_expense_budgets');
    return local ? JSON.parse(local) : INITIAL_BUDGETS;
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('mujeeb_expense_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mujeeb_expense_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Recalculate 'spent' amounts in budgets automatically whenever transactions change
  useEffect(() => {
    setBudgets(prevBudgets => {
      const updated = prevBudgets.map(b => {
        const spentVal = transactions
          .filter(t => t.type === 'expense' && t.category === b.category)
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...b, spent: spentVal };
      });
      return updated;
    });
  }, [transactions]);

  // Handler: Add custom transaction
  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const fullT: Transaction = {
      ...newT,
      id: 't_' + Math.random().toString(36).substr(2, 9)
    };
    setTransactions(prev => [fullT, ...prev]);
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Handler: Simulate payday paycheque
  const handleSimulatePayday = () => {
    const payday: Transaction = {
      id: 'payday_' + Math.random().toString(36).substr(2, 9),
      title: 'Payday Simulation',
      amount: 1500.00,
      type: 'income',
      category: 'Salary',
      date: new Date().toISOString().split('T')[0],
      notes: 'Test payday simulation injector'
    };
    setTransactions(prev => [payday, ...prev]);
  };

  // Handler: Set / Add custom category budget
  const handleAddBudget = (category: string, limit: number) => {
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      alert('Limit is already active for this Category. Extend it directly instead!');
      return;
    }
    const newB: Budget = {
      category,
      limit,
      spent: transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0)
    };
    setBudgets(prev => [...prev, newB]);
  };

  // Handler: Delete budget
  const handleDeleteBudget = (category: string) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
  };

  // Handler: Direct budget limit modifications
  const handleUpdateBudgetLimit = (category: string, newLimit: number) => {
    setBudgets(prev => prev.map(b => {
      if (b.category === category) {
        return { ...b, limit: newLimit };
      }
      return b;
    }));
  };

  // Render view conditional panels
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onSimulatePayday={handleSimulatePayday}
            onOpenAdd={() => setIsAddOpen(true)}
            userName={user?.name}
            onLogout={() => {
              setUser(null);
              localStorage.removeItem('mujeeb_expense_user');
            }}
          />
        );
      case 'analytics':
        return <AnalyticsView transactions={transactions} />;
      case 'budgets':
        return (
          <BudgetsView
            budgets={budgets}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            onAddBudget={handleAddBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'ai-advisor':
        return <AiAdvisorView transactions={transactions} budgets={budgets} />;
      default:
        return <div>View not found</div>;
    }
  };

  // If user session is not decrypted, mandate entrance verification
  if (!user) {
    return (
      <LoginView
        onLogin={(email, name) => {
          const session = { email, name };
          setUser(session);
          localStorage.setItem('mujeeb_expense_user', JSON.stringify(session));
        }}
      />
    );
  }

  return (
    <div className="bg-[#09090B] min-h-screen text-gray-100 font-sans flex justify-center items-start">
      
      {/* App wrapper - phone simulator on mobile, full-screen wide canvas on desktop */}
      <div className="w-full max-w-[450px] md:max-w-none min-h-screen bg-[#0F0F11] md:bg-transparent border-x border-[#27272A] md:border-none shadow-2xl relative px-6 py-6 md:px-8 md:py-10 overflow-x-hidden flex flex-col justify-between transition-all duration-300">
        
        {/* Main core panel */}
        <div className="flex-1 w-full max-w-[450px] md:max-w-5xl mx-auto">
          {renderActiveView()}
        </div>

        {/* Floating Touch deck bar navigation items */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenAdd={() => setIsAddOpen(true)}
        />

        {/* Action Panel sliding drawer */}
        <AddTransactionModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddTransaction}
        />
      </div>
    </div>
  );
}
