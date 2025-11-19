import React, { useState, useMemo } from 'react';
import { Investment, SpendingAnalysis, Language, Transaction, Goal, MarketNews } from '../types';
import Card from './shared/Card';
import SpendingChart from './charts/SpendingChart';
import AnnualOverviewChart from './charts/AnnualOverviewChart';
import { formatCurrency } from '../utils/formatters';
import { LogoIcon, StockIcon, BondIcon, CryptoIcon, RealEstateIcon, PlusIcon, CloseIcon, FilterIcon, TrophyIcon, NewsIcon } from './shared/Icon';
import { translations } from '../translations';

interface DashboardProps {
  netWorth: number;
  spendingAnalysis: SpendingAnalysis[];
  investments: Investment[];
  transactions: Transaction[];
  goals: Goal[];
  addGoal: (category: Transaction['category'], amount: number) => void;
  removeGoal: (id: string) => void;
  language: Language;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (category: string | null) => void;
  marketNews: MarketNews[];
  isFetchingNews: boolean;
}

const InvestmentTypeIcon = ({ type }: { type: Investment['type'] }) => {
    switch (type) {
        case 'Stocks': return <StockIcon className="w-5 h-5 text-cyan-400" />;
        case 'Bonds': return <BondIcon className="w-5 h-5 text-indigo-400" />;
        case 'Crypto': return <CryptoIcon className="w-5 h-5 text-amber-400" />;
        case 'Real Estate': return <RealEstateIcon className="w-5 h-5 text-emerald-400" />;
        default: return null;
    }
};

const AddGoalForm: React.FC<{ addGoal: (category: any, amount: number) => void; language: Language }> = ({ addGoal, language }) => {
    const [category, setCategory] = useState<Transaction['category']>('Food');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount && Number(amount) > 0) {
            addGoal(category, Number(amount));
            setAmount('');
        }
    };

    const categories: Transaction['category'][] = ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Other'];

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-2 p-2 bg-gray-900/50 rounded-lg">
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                className="bg-gray-700 border-gray-600 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={translations.goalAmount[language]}
                className="bg-gray-700 border-gray-600 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
            />
            <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white">
                <PlusIcon className="w-5 h-5" />
            </button>
        </form>
    );
};


const Dashboard: React.FC<DashboardProps> = ({
  netWorth, spendingAnalysis, investments, transactions, goals, addGoal, removeGoal, language, activeCategoryFilter, setActiveCategoryFilter, marketNews, isFetchingNews
}) => {
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => !activeCategoryFilter || t.category === activeCategoryFilter)
      .filter(t => 
        transactionTypeFilter === 'all' ||
        (transactionTypeFilter === 'income' && t.amount > 0) ||
        (transactionTypeFilter === 'expense' && t.amount < 0)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeCategoryFilter, transactionTypeFilter]);
  
  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full">
      <div className="hidden lg:flex items-center gap-3">
        <LogoIcon className="w-10 h-10 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">FinAssist</h1>
      </div>
      
      <Card>
        <h2 className="text-sm font-medium text-gray-400 mb-2">{translations.netWorth[language]}</h2>
        <p className="text-3xl md:text-4xl font-bold text-white truncate">{formatCurrency(netWorth, language)}</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card className="flex-grow flex flex-col md:col-span-2 lg:col-span-1 xl:col-span-2">
          <h2 className="text-sm font-medium text-gray-400 mb-4">{translations.spendingAnalysis[language]}</h2>
          <div className="flex-grow h-60 md:h-64 cursor-pointer" onClick={() => setActiveCategoryFilter(null)} title={translations.clickToClear[language]}>
            <SpendingChart data={spendingAnalysis} language={language} onSliceClick={(category) => setActiveCategoryFilter(category)} />
          </div>
        </Card>

        <Card className="flex-grow flex flex-col md:col-span-2 lg:col-span-1 xl:col-span-2">
          <h2 className="text-sm font-medium text-gray-400 mb-4">{translations.annualOverview[language]}</h2>
          <div className="flex-grow h-60 md:h-64">
            <AnnualOverviewChart transactions={transactions} language={language} />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <h2 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><TrophyIcon className="w-5 h-5" />{translations.goals[language]}</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {goals.map(goal => {
              const spent = transactions
                .filter(t => t.category === goal.category && t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
              const progress = Math.min((spent / goal.amount) * 100, 100);
              const isOverBudget = spent > goal.amount;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-semibold text-white">{goal.category}</span>
                    <button onClick={() => removeGoal(goal.id)} className="text-gray-500 hover:text-red-400"><CloseIcon className="w-4 h-4" /></button>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className={`${isOverBudget ? 'bg-red-500' : 'bg-cyan-500'} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className={`text-xs mt-1 text-right ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
                    {formatCurrency(spent, language)} / {formatCurrency(goal.amount, language)}
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <p className="text-sm text-gray-500">{translations.noGoals[language]}</p>}
          </div>
          <AddGoalForm addGoal={addGoal} language={language} />
        </Card>
        
        <Card>
          <h2 className="text-sm font-medium text-gray-400 mb-4">{translations.investments[language]}</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {investments.map(inv => (
              <div key={inv.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-700 p-2 rounded-full">
                      <InvestmentTypeIcon type={inv.type} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{inv.name}</p>
                    <p className="text-xs text-gray-400">{inv.quantity} {translations.units[language]}</p>
                  </div>
                </div>
                <p className="font-mono text-white">{formatCurrency(inv.value, language)}</p>
              </div>
            ))}
             {investments.length === 0 && <p className="text-sm text-gray-500">{translations.noInvestments[language]}</p>}
          </div>
        </Card>
      </div>
      
      <Card className="md:col-span-2 lg:col-span-1 xl:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <FilterIcon className="w-5 h-5" />
                {translations.transactions[language]}
            </h2>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <select 
                    value={transactionTypeFilter} 
                    onChange={e => setTransactionTypeFilter(e.target.value as any)}
                    className="bg-gray-700 border-gray-600 text-white text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-1.5"
                >
                    <option value="all">{translations.all[language]}</option>
                    <option value="income">{translations.income[language]}</option>
                    <option value="expense">{translations.expense[language]}</option>
                </select>
                {activeCategoryFilter && (
                    <button onClick={() => setActiveCategoryFilter(null)} className="text-xs flex items-center gap-1 bg-indigo-600/50 text-indigo-200 px-2 py-1 rounded-md">
                        {activeCategoryFilter} <CloseIcon className="w-3 h-3"/>
                    </button>
                )}
            </div>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {filteredTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                  <p className="font-semibold text-white">{t.description}</p>
                  <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString(language === 'en' ? 'en-US' : `${language}-${language.toUpperCase()}`)} - {t.category}</p>
              </div>
              <p className={`font-mono ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount, language)}
              </p>
            </div>
          ))}
           {filteredTransactions.length === 0 && <p className="text-sm text-gray-500">{translations.noTransactions[language]}</p>}
        </div>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-1 xl:col-span-2">
        <h2 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <NewsIcon className="w-5 h-5" />
          {translations.marketNews[language]}
        </h2>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {isFetchingNews && (
                <p className="text-sm text-gray-500 animate-pulse">{translations.loadingNews[language]}</p>
            )}
            {!isFetchingNews && marketNews.length === 0 && (
                <p className="text-sm text-gray-500">{translations.noNews[language]}</p>
            )}
            {!isFetchingNews && marketNews.map(news => (
                <div key={news.id}>
                    <h4 className="font-semibold text-white text-sm">{news.headline}</h4>
                    <p className="text-xs text-gray-300 mt-1">{news.summary}</p>
                    <p className="text-xs text-gray-500 text-right mt-1 font-mono">{news.source}</p>
                </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;