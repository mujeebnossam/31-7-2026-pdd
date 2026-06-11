export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
  accountId?: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  color?: string;
}

export type ActiveTab = 'dashboard' | 'analytics' | 'budgets' | 'ai-advisor';

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
}
