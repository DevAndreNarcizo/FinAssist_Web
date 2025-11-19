export type Language = 'en' | 'pt' | 'es' | 'ja';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Income' | 'Housing' | 'Food' | 'Transport' | 'Entertainment' | 'Health' | 'Other';
}

export interface Investment {
  id: string;
  name: string;
  type: 'Stocks' | 'Bonds' | 'Real Estate' | 'Crypto';
  value: number;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface SpendingAnalysis {
    category: string;
    total: number;
    percentage: number;
}

export interface Goal {
    id: string;
    category: Transaction['category'];
    amount: number;
}

export interface Achievement {
    id: string;
    goalId: string;
    title: string;
    description: string;
    date: string;
}

export interface MarketNews {
  id: string;
  headline: string;
  summary: string;
  source: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
