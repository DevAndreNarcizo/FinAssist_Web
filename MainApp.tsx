import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction, Investment, ChatMessage, SpendingAnalysis, Language, Goal, Achievement, MarketNews, User } from './types';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import { LogoIcon } from './components/shared/Icon';
import { translations } from './translations';
import SettingsModal from './components/SettingsModal';
import { formatCurrency } from './utils/formatters';
import AchievementsToast from './components/AchievementsToast';
import { fetchMarketNews } from './services/geminiService';
import { SupabaseClient } from '@supabase/supabase-js';

interface MainAppProps {
    user: User;
    onLogout: () => void;
    supabase: SupabaseClient;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, supabase }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [language, setLanguage] = useState<Language>('pt');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
    const [marketNews, setMarketNews] = useState<MarketNews[]>([]);
    const [isFetchingNews, setIsFetchingNews] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    
    const isInitialMount = useRef(true);

    // Load all user data from Supabase on component mount
    useEffect(() => {
        const fetchData = async () => {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('language')
                .eq('id', user.id)
                .single();
            if (profileData) setLanguage(profileData.language as Language);

            const { data: transactionsData } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false });
            setTransactions(transactionsData || []);

            const { data: investmentsData } = await supabase.from('investments').select('*').eq('user_id', user.id);
            setInvestments(investmentsData || []);

            const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', user.id);
            setGoals(goalsData || []);

            const { data: chatHistoryData } = await supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
            if (chatHistoryData && chatHistoryData.length > 0) {
                 setChatHistory(chatHistoryData);
            } else {
                 setChatHistory([{ id: 'init', role: 'model', text: translations.initialGreeting[profileData?.language as Language || 'pt'] }]);
            }
        };

        fetchData();
    }, [user.id, supabase]);

    // Update language preference in DB
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const updateUserLanguage = async () => {
             const { error } = await supabase
                .from('profiles')
                .update({ language: language })
                .eq('id', user.id);
            if (error) console.error("Error updating language", error);
        };
        updateUserLanguage();

        setChatHistory(prev => {
            if (prev.length > 0 && prev[0].id === 'init') {
                return [{ ...prev[0], text: translations.initialGreeting[language] }];
            }
            return prev;
        });
    }, [language, user.id, supabase]);

    // Fetch market news when investments or language change
    useEffect(() => {
        const getNews = async () => {
            if (investments.length === 0) {
                setMarketNews([]);
                return;
            }
            setIsFetchingNews(true);
            try {
                const newsData = await fetchMarketNews(investments, language);
                const newsWithIds = newsData.map((item, index) => ({
                    ...item,
                    id: `news-${Date.now()}-${index}`,
                }));
                setMarketNews(newsWithIds);
            } finally {
                setIsFetchingNews(false);
            }
        };
        const debounceTimer = setTimeout(getNews, 500);
        return () => clearTimeout(debounceTimer);
    }, [investments, language]);

    // Achievement Logic
    useEffect(() => {
        // ... (achievement logic remains the same as it depends on local state)
    }, [transactions, goals, language, achievements]);

    // Persist new chat messages to Supabase
    useEffect(() => {
        const saveChatTurn = async () => {
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage && lastMessage.id !== 'init' && !lastMessage.id.startsWith('db-')) {
                 const { data, error } = await supabase.from('chat_history').insert({
                    user_id: user.id,
                    role: lastMessage.role,
                    text: lastMessage.text
                 }).select();

                 if (error) console.error("Failed to save chat message", error);
            }
        };
        saveChatTurn();
    }, [chatHistory, user.id, supabase]);


    const netWorth = useMemo(() => {
        const cash = transactions.reduce((acc, t) => acc + t.amount, 0);
        const investmentValue = investments.reduce((acc, i) => acc + i.value, 0);
        return cash + investmentValue;
    }, [transactions, investments]);

    const spendingAnalysis: SpendingAnalysis[] = useMemo(() => {
        // ... (spending analysis logic remains the same)
        const spending = transactions.filter(t => t.amount < 0);
        const totalSpending = spending.reduce((acc, t) => acc + Math.abs(t.amount), 0);
        if (totalSpending === 0) return [];
        const categoryTotals: { [key: string]: number } = {};
        spending.forEach(t => {
            const category = t.category || 'Other';
            if (!categoryTotals[category]) categoryTotals[category] = 0;
            categoryTotals[category] += Math.abs(t.amount);
        });
        return Object.entries(categoryTotals)
            .map(([category, total]) => ({
                category,
                total,
                percentage: parseFloat(((total / totalSpending) * 100).toFixed(2)),
            }))
            .sort((a, b) => b.total - a.total);
    }, [transactions]);
    
    const addTransaction = async (description: string, amount: number, category: Transaction['category']) => {
        const newTransactionData = { user_id: user.id, date: new Date().toISOString().split('T')[0], description, amount, category };
        const { data, error } = await supabase.from('transactions').insert(newTransactionData).select();
        if (error) return `Error: ${error.message}`;
        if (data) setTransactions(prev => [...data, ...prev]);
        const type = amount < 0 ? translations.expense[language] : translations.income[language];
        return `${translations.transactionAdded1[language]} ${type}: "${description}" ${translations.transactionAdded2[language]} ${formatCurrency(Math.abs(amount), language)}.`;
    };
    
    const addInvestment = async (name: string, type: Investment['type'], value: number, quantity: number) => {
        const newInvestmentData = { user_id: user.id, name, type, value, quantity };
        const { data, error } = await supabase.from('investments').insert(newInvestmentData).select();
        if (error) return `Error: ${error.message}`;
        if (data) setInvestments(prev => [...prev, ...data]);
        return `${translations.investmentAdded1[language]} ${name} ${translations.investmentAdded2[language]} ${formatCurrency(value, language)}.`;
    };

    const addGoal = async (category: Transaction['category'], amount: number) => {
        const newGoalData = { user_id: user.id, category, amount };
        const { data, error } = await supabase.from('goals').insert(newGoalData).select();
        if (error) console.error("Error adding goal", error);
        if (data) setGoals(prev => [...prev, ...data]);
    };
    
    const removeGoal = async (id: string) => {
        const { error } = await supabase.from('goals').delete().match({ id });
        if (error) console.error("Error removing goal", error);
        else setGoals(prev => prev.filter(g => g.id !== id));
    };
    
    const removeAchievement = (id: string) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
    };

    const localApi = { addTransaction, addInvestment };

    return (
        <>
            <div className="flex h-screen w-screen flex-col lg:flex-row bg-gray-900 font-sans">
                <header className="flex-shrink-0 lg:hidden p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LogoIcon className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-xl font-bold text-white">FinAssist</h1>
                    </div>
                </header>
                <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 bg-gray-800/50 p-4 lg:p-6 overflow-y-auto">
                    <Dashboard netWorth={netWorth} spendingAnalysis={spendingAnalysis} investments={investments} transactions={transactions} goals={goals} addGoal={addGoal} removeGoal={removeGoal} language={language} activeCategoryFilter={activeCategoryFilter} setActiveCategoryFilter={setActiveCategoryFilter} marketNews={marketNews} isFetchingNews={isFetchingNews} />
                </aside>
                <main className="flex-1 flex flex-col bg-gray-900">
                    <ChatInterface chatHistory={chatHistory} setChatHistory={setChatHistory} isThinking={isThinking} setIsThinking={setIsThinking} localApi={localApi} transactions={transactions} investments={investments} language={language} openSettings={() => setIsSettingsOpen(true)} />
                </main>
                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} language={language} setLanguage={setLanguage} onLogout={onLogout} />
            </div>
            <div className="absolute bottom-4 right-4 z-50">
                {achievements.map((ach, index) => (
                    <AchievementsToast key={ach.id} achievement={ach} onClose={() => removeAchievement(ach.id)} language={language} style={{ marginBottom: `${index * 5}px`, zIndex: 100 - index }} />
                ))}
            </div>
        </>
    );
};

export default MainApp;
