import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Brain, ArrowDownRight, Bot, Info, MessageSquareCode, ChevronRight } from 'lucide-react';
import { Transaction, Budget } from '../types';

interface AiAdvisorViewProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AiAdvisorView({ transactions, budgets }: AiAdvisorViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi Mujeeb! I am **Auden**, your personal smart financial advisor. 🧠✨\n\nI have evaluated your transaction logs and category bounds for June 2026. Select one of the analysis requests below, or type your own question, and I'll build a tailored savings masterclass for you!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Formulate prompts based on user click
  const handleQuickPrompt = async (promptType: 'analyze' | 'food_budget' | 'savings_plan') => {
    let promptTitle = '';
    let systemContext = '';

    if (promptType === 'analyze') {
      promptTitle = "Analyze this month's spending patterns";
      systemContext = `Analyze my recent expenses. Total spent is $${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}. Incomes are $${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}. Here are some items: ${transactions.slice(0, 10).map(t => `${t.title} (${t.category}) spent $${t.amount}`).join(', ')}. Give me 2 actionable insights regarding categories showing heavy usage.`;
    } else if (promptType === 'food_budget') {
      promptTitle = "How can I optimize my Food budget?";
      const foodB = budgets.find(b => b.category === 'Food & Dining');
      const limit = foodB ? foodB.limit : 400;
      const spent = foodB ? foodB.spent : 180;
      systemContext = `I have a budget of $${limit} for Food & Dining, and have already spent $${spent.toFixed(2)} (${((spent/limit)*100).toFixed(0)}%). Recommend 3 smart micro-habits to stay within bounds.`;
    } else if (promptType === 'savings_plan') {
      promptTitle = "Give me a 3-step savings plan";
      systemContext = "Calculate a realistic 3-step high-yield financial plan based on average wages ($4,800/mo) and simple rent bills ($1,200/mo). Be brief, structured, and use Markdown bullet formatting.";
    }

    sendToAI(promptTitle, systemContext);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const text = inputText.trim();
    setInputText('');
    
    // Pass raw input to AI
    sendToAI(text, text);
  };

  const sendToAI = async (userDisplayMessage: string, backendPrompt: string) => {
    // Add user message to stack
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userDisplayMessage,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build transactions context for Gemini payload
      const transactionStats = transactions.map(t => ({
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date
      }));

      const budgetStats = budgets.map(b => ({
        category: b.category,
        limit: b.limit,
        spent: b.spent
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: backendPrompt,
          transactions: transactionStats,
          budgets: budgetStats
        })
      });

      if (!response.ok) {
        throw new Error('API communication block failed');
      }

      const data = await response.json();
      
      const aiResponseText = data.text || "I was unable to consult my models. Please check your Gemini API configuration in Secrets.";
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: "I encountered an issue reaching my server or the Gemini endpoint. Ensure the backend server is running and the **GEMINI_API_KEY** is configured in **Settings > Secrets**.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple clean message renderer supporting basic bold and newline splitting
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text parse `**text**` -> `<strong>`
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-[#2DD4BF] font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const processedLine = parts.length > 0 ? parts : line;

      // Render items with bullet/line matching
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li key={i} className="ml-4 list-disc text-zinc-200 mt-1 pl-1 leading-relaxed">
            {typeof processedLine === 'string' ? processedLine.replace(/^[-*]\s*/, '') : processedLine}
          </li>
        );
      }
      
      return (
        <p key={i} className="text-zinc-200 leading-relaxed mb-2.5 last:mb-0">
          {processedLine}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] pb-28">
      
      {/* Header Info */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
          <Brain size={18} />
        </div>
        <div>
          <span className="text-[10px] text-[#A1A1AA] font-mono uppercase tracking-wider block">AI SYSTEM</span>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">Auden AI Assistant</h1>
        </div>
      </div>

      {/* Chat Messages Frame */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1 mb-4 border border-[#27272A] bg-[#18181B]/40 rounded-2xl p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
              msg.sender === 'user'
                ? 'bg-[#18181B] border border-[#27272A] text-white rounded-br-none'
                : 'bg-[#09090B] border border-[#27272A] text-zinc-200 rounded-bl-none'
            }`}>
              {/* Bot Meta */}
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[#2DD4BF] text-[10px] font-mono tracking-wider uppercase font-semibold">
                  <Bot size={11} />
                  <span>Auden Advisor</span>
                </div>
              )}
              
              <div className="text-xs">
                {renderMessageText(msg.text)}
              </div>
              
              <div className="text-[9px] text-right text-zinc-500 mt-1 font-mono">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#09090B] border border-[#27272A] text-[#A1A1AA] rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] flex items-center gap-2">
              <Sparkles size={14} className="text-[#2DD4BF] animate-spin" />
              <span className="text-xs font-medium">Auden is crunching your ledgers...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Dock */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 gap-2 mb-4">
          <button
            onClick={() => handleQuickPrompt('analyze')}
            className="w-full text-left p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#2DD4BF]/80 transition-all text-xs text-white hover:text-[#2DD4BF] flex items-center justify-between"
          >
            <span>📊 Analyze this month's spending patterns</span>
            <ChevronRight size={14} className="text-zinc-500" />
          </button>

          <button
            onClick={() => handleQuickPrompt('food_budget')}
            className="w-full text-left p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#2DD4BF]/80 transition-all text-xs text-white hover:text-[#2DD4BF] flex items-center justify-between"
          >
            <span>🍕 How can I optimize my Food budget?</span>
            <ChevronRight size={14} className="text-zinc-500" />
          </button>

          <button
            onClick={() => handleQuickPrompt('savings_plan')}
            className="w-full text-left p-3.5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#2DD4BF]/80 transition-all text-xs text-[#FAFAFA] hover:text-[#2DD4BF] flex items-center justify-between"
          >
            <span>📝 Give me a 3-step savings plan</span>
            <ChevronRight size={14} className="text-zinc-500" />
          </button>
        </div>
      )}

      {/* Input Form Box */}
      <form onSubmit={handleSendMessage} className="relative flex items-center">
        <input
          type="text"
          disabled={isLoading}
          placeholder={isLoading ? "Auden is thinking..." : "Ask Auden about savings, budgets, optimizations..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full pl-4 pr-12 py-3.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white text-xs text-wrap focus:outline-none focus:border-[#2DD4BF] placeholder:text-zinc-600 disabled:opacity-60"
          id="ai-prompt-input-field"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="absolute right-2 p-2 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 disabled:bg-[#18181B] text-[#09090B] disabled:text-zinc-600 rounded-lg transition-colors focus:outline-none"
          id="send-ai-prompt-btn"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
