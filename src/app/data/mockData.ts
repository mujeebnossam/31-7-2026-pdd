export const mockUser = {
  name: "Alex Morgan",
  email: "alex.morgan@email.com",
  avatar: "AM",
  memberSince: "March 2023",
  financialScore: 742,
};

export const mockAccounts = [
  { id: "1", name: "Chase Checking", type: "checking", balance: 4823.47, bank: "Chase", last4: "4521", color: "#6366f1" },
  { id: "2", name: "Savings Account", type: "savings", balance: 18250.00, bank: "Chase", last4: "8832", color: "#10b981" },
  { id: "3", name: "Credit Card", type: "credit", balance: -1247.82, bank: "Amex", last4: "3391", color: "#f59e0b" },
  { id: "4", name: "Investment Account", type: "investment", balance: 34590.15, bank: "Fidelity", last4: "7710", color: "#3b82f6" },
];

export const mockTransactions = [
  { id: "t1", date: "2026-06-11", merchant: "Whole Foods Market", category: "Groceries", amount: -127.43, account: "Chase Checking", icon: "🛒", status: "cleared" },
  { id: "t2", date: "2026-06-11", merchant: "Netflix", category: "Entertainment", amount: -15.99, account: "Amex Credit", icon: "🎬", status: "cleared" },
  { id: "t3", date: "2026-06-10", merchant: "Direct Deposit", category: "Income", amount: 3450.00, account: "Chase Checking", icon: "💰", status: "cleared" },
  { id: "t4", date: "2026-06-10", merchant: "Shell Gas Station", category: "Transportation", amount: -62.18, account: "Amex Credit", icon: "⛽", status: "cleared" },
  { id: "t5", date: "2026-06-09", merchant: "Starbucks", category: "Food & Drink", amount: -8.75, account: "Chase Checking", icon: "☕", status: "cleared" },
  { id: "t6", date: "2026-06-09", merchant: "Amazon Prime", category: "Shopping", amount: -14.99, account: "Amex Credit", icon: "📦", status: "cleared" },
  { id: "t7", date: "2026-06-08", merchant: "Planet Fitness", category: "Health", amount: -24.99, account: "Chase Checking", icon: "💪", status: "cleared" },
  { id: "t8", date: "2026-06-08", merchant: "Uber", category: "Transportation", amount: -18.40, account: "Amex Credit", icon: "🚗", status: "cleared" },
  { id: "t9", date: "2026-06-07", merchant: "Chipotle", category: "Food & Drink", amount: -13.85, account: "Chase Checking", icon: "🌯", status: "cleared" },
  { id: "t10", date: "2026-06-07", merchant: "Apple Music", category: "Entertainment", amount: -10.99, account: "Amex Credit", icon: "🎵", status: "cleared" },
  { id: "t11", date: "2026-06-06", merchant: "Target", category: "Shopping", amount: -89.23, account: "Amex Credit", icon: "🎯", status: "cleared" },
  { id: "t12", date: "2026-06-06", merchant: "Electric Bill", category: "Utilities", amount: -142.50, account: "Chase Checking", icon: "⚡", status: "cleared" },
  { id: "t13", date: "2026-06-05", merchant: "Cheesecake Factory", category: "Food & Drink", amount: -67.20, account: "Amex Credit", icon: "🍰", status: "cleared" },
  { id: "t14", date: "2026-06-05", merchant: "Freelance Payment", category: "Income", amount: 850.00, account: "Chase Checking", icon: "💼", status: "cleared" },
  { id: "t15", date: "2026-06-04", merchant: "CVS Pharmacy", category: "Health", amount: -32.15, account: "Chase Checking", icon: "💊", status: "cleared" },
  { id: "t16", date: "2026-06-04", merchant: "Spotify", category: "Entertainment", amount: -9.99, account: "Amex Credit", icon: "🎧", status: "cleared" },
  { id: "t17", date: "2026-06-03", merchant: "Airbnb Refund", category: "Travel", amount: 320.00, account: "Chase Checking", icon: "✈️", status: "cleared" },
  { id: "t18", date: "2026-06-03", merchant: "Home Depot", category: "Home", amount: -156.78, account: "Amex Credit", icon: "🔨", status: "cleared" },
  { id: "t19", date: "2026-06-02", merchant: "Trader Joe's", category: "Groceries", amount: -94.32, account: "Chase Checking", icon: "🛍️", status: "cleared" },
  { id: "t20", date: "2026-06-01", merchant: "Rent Payment", category: "Housing", amount: -2100.00, account: "Chase Checking", icon: "🏠", status: "cleared" },
];

export const mockBudgets = [
  { id: "b1", category: "Groceries", budgeted: 500, spent: 318, color: "#10b981", icon: "🛒" },
  { id: "b2", category: "Food & Drink", budgeted: 300, spent: 287, color: "#f59e0b", icon: "🍔" },
  { id: "b3", category: "Transportation", budgeted: 200, spent: 81, color: "#3b82f6", icon: "🚗" },
  { id: "b4", category: "Entertainment", budgeted: 150, spent: 37, color: "#6366f1", icon: "🎬" },
  { id: "b5", category: "Shopping", budgeted: 250, spent: 104, color: "#ec4899", icon: "🛍️" },
  { id: "b6", category: "Health", budgeted: 100, spent: 57, color: "#14b8a6", icon: "💊" },
  { id: "b7", category: "Utilities", budgeted: 200, spent: 143, color: "#8b5cf6", icon: "⚡" },
  { id: "b8", category: "Housing", budgeted: 2200, spent: 2100, color: "#ef4444", icon: "🏠" },
];

export const mockSpendingByMonth = [
  { month: "Jan", income: 4300, expenses: 3100 },
  { month: "Feb", income: 4300, expenses: 2850 },
  { month: "Mar", income: 4300, expenses: 3400 },
  { month: "Apr", income: 5150, expenses: 3200 },
  { month: "May", income: 4300, expenses: 2950 },
  { month: "Jun", income: 4300, expenses: 2723 },
];

export const mockCategoryBreakdown = [
  { name: "Housing", value: 2100, color: "#ef4444" },
  { name: "Groceries", value: 318, color: "#10b981" },
  { name: "Food & Drink", value: 287, color: "#f59e0b" },
  { name: "Shopping", value: 104, color: "#ec4899" },
  { name: "Transportation", value: 81, color: "#3b82f6" },
  { name: "Utilities", value: 143, color: "#8b5cf6" },
  { name: "Entertainment", value: 37, color: "#6366f1" },
  { name: "Health", value: 57, color: "#14b8a6" },
];

export const mockInvestments = [
  { id: "i1", name: "Apple Inc.", ticker: "AAPL", shares: 12, price: 213.47, change: 2.34, changePercent: 1.1, value: 2561.64, color: "#6366f1" },
  { id: "i2", name: "Vanguard S&P 500", ticker: "VOO", shares: 25, price: 521.83, change: -3.12, changePercent: -0.6, value: 13045.75, color: "#10b981" },
  { id: "i3", name: "Tesla Inc.", ticker: "TSLA", shares: 8, price: 178.92, change: 4.56, changePercent: 2.6, value: 1431.36, color: "#f59e0b" },
  { id: "i4", name: "Microsoft Corp.", ticker: "MSFT", shares: 10, price: 432.14, change: 1.89, changePercent: 0.44, value: 4321.40, color: "#3b82f6" },
  { id: "i5", name: "Bitcoin ETF", ticker: "IBIT", shares: 50, price: 44.82, change: -0.93, changePercent: -2.03, value: 2241.00, color: "#ec4899" },
];

export const mockGoals = [
  { id: "g1", name: "Emergency Fund", target: 15000, current: 10240, icon: "🛡️", deadline: "Dec 2026", color: "#10b981" },
  { id: "g2", name: "Vacation to Japan", target: 5000, current: 2150, icon: "✈️", deadline: "Aug 2026", color: "#6366f1" },
  { id: "g3", name: "New MacBook", target: 2500, current: 1800, icon: "💻", deadline: "Sep 2026", color: "#f59e0b" },
  { id: "g4", name: "Down Payment", target: 50000, current: 18250, icon: "🏡", deadline: "Jun 2028", color: "#3b82f6" },
];

export const mockBills = [
  { id: "bi1", name: "Rent", amount: 2100, dueDay: 1, category: "Housing", autopay: true, icon: "🏠", color: "#ef4444" },
  { id: "bi2", name: "Electric", amount: 142.50, dueDay: 15, category: "Utilities", autopay: true, icon: "⚡", color: "#f59e0b" },
  { id: "bi3", name: "Internet", amount: 79.99, dueDay: 18, category: "Utilities", autopay: true, icon: "📶", color: "#3b82f6" },
  { id: "bi4", name: "Phone", amount: 85.00, dueDay: 22, category: "Utilities", autopay: false, icon: "📱", color: "#6366f1" },
  { id: "bi5", name: "Car Insurance", amount: 167.00, dueDay: 5, category: "Insurance", autopay: true, icon: "🚗", color: "#10b981" },
  { id: "bi6", name: "Gym Membership", amount: 24.99, dueDay: 8, category: "Health", autopay: true, icon: "💪", color: "#14b8a6" },
];

export const mockSubscriptions = [
  { id: "s1", name: "Netflix", amount: 15.99, billing: "monthly", category: "Entertainment", icon: "🎬", color: "#ef4444", nextBill: "Jun 15" },
  { id: "s2", name: "Spotify", amount: 9.99, billing: "monthly", category: "Entertainment", icon: "🎵", color: "#1db954", nextBill: "Jun 16" },
  { id: "s3", name: "Amazon Prime", amount: 14.99, billing: "monthly", category: "Shopping", icon: "📦", color: "#f59e0b", nextBill: "Jun 9" },
  { id: "s4", name: "Apple Music", amount: 10.99, billing: "monthly", category: "Entertainment", icon: "🎧", color: "#6366f1", nextBill: "Jun 7" },
  { id: "s5", name: "iCloud+", amount: 2.99, billing: "monthly", category: "Storage", icon: "☁️", color: "#3b82f6", nextBill: "Jun 23" },
  { id: "s6", name: "ChatGPT Plus", amount: 20.00, billing: "monthly", category: "Productivity", icon: "🤖", color: "#10b981", nextBill: "Jun 28" },
];

export const mockAIInsights = [
  { id: "ai1", type: "saving", title: "You're spending 43% more on dining out vs last month", description: "You've spent $287 on food & drink this month, up from $201 last month. Consider meal prepping 2-3 days a week to save ~$80/month.", impact: 80, confidence: 92, icon: "🍔" },
  { id: "ai2", type: "alert", title: "Unusual charge detected at Shell Gas Station", description: "$62.18 on Jun 10 is 2.3x your typical gas spend. Prices may have spiked — compare nearby stations next time.", impact: 0, confidence: 88, icon: "⛽" },
  { id: "ai3", type: "prediction", title: "You'll exceed your Food & Drink budget by $47", description: "At your current spending rate, you'll hit $347 by month end vs your $300 budget. Skip 3-4 restaurant visits this week.", impact: 47, confidence: 85, icon: "⚠️" },
  { id: "ai4", type: "saving", title: "Consolidate streaming services and save $26/month", description: "You're paying for Netflix, Spotify, Apple Music, and Amazon Prime. Switching to an Apple One Family plan could save $26/month or $312/year.", impact: 312, confidence: 95, icon: "💡" },
  { id: "ai5", type: "goal", title: "Emergency fund milestone — 68% complete!", description: "You're on track to reach your $15,000 emergency fund by December 2026. Keep up the $400/month transfer.", impact: 0, confidence: 100, icon: "🎯" },
];

export const mockNotifications = [
  { id: "n1", type: "alert", message: "Bill due tomorrow: Electric ($142.50)", time: "2 hours ago", read: false },
  { id: "n2", type: "insight", message: "AI detected unusual spending in Food & Drink", time: "5 hours ago", read: false },
  { id: "n3", type: "goal", message: "You're 68% toward your Emergency Fund goal!", time: "1 day ago", read: true },
  { id: "n4", type: "transaction", message: "Large transaction: Rent $2,100 cleared", time: "2 days ago", read: true },
];

export const mockPortfolioHistory = [
  { date: "Jan", value: 28400 },
  { date: "Feb", value: 29100 },
  { date: "Mar", value: 27800 },
  { date: "Apr", value: 31200 },
  { date: "May", value: 33400 },
  { date: "Jun", value: 34590 },
];

export const mockForecast = [
  { month: "Jul", predicted: 2650, actual: null },
  { month: "Aug", predicted: 2580, actual: null },
  { month: "Sep", predicted: 2720, actual: null },
  { month: "Oct", predicted: 3100, actual: null },
  { month: "Nov", predicted: 3450, actual: null },
  { month: "Dec", predicted: 3800, actual: null },
];

export const categories = ["Groceries", "Food & Drink", "Transportation", "Entertainment", "Shopping", "Health", "Utilities", "Housing", "Travel", "Income", "Home", "Insurance", "Other"];
