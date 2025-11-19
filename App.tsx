import React, { useState, useEffect } from 'react';
import { User } from './types';
import AuthPage from './components/AuthPage';
import MainApp from './MainApp';
import { supabase, supabaseError } from './services/supabaseClient';
import { LogoIcon } from './components/shared/Icon';

const App: React.FC = () => {
    if (supabaseError || !supabase) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white font-sans p-4">
                <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 max-w-md">
                    <div className="flex justify-center mb-4">
                        <LogoIcon className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
                    <p className="text-gray-300 mb-1">{supabaseError}</p>
                    <p className="text-gray-400">Please provide your Supabase credentials (`SUPABASE_URL` and `SUPABASE_ANON_KEY`) as environment variables to run the application.</p>
                </div>
            </div>
        );
    }

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                 setCurrentUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name || session.user.email!,
                });
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        // Check for initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
             if (session?.user) {
                 setCurrentUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.full_name || session.user.email!,
                });
            }
            setIsLoading(false);
        };
        
        getInitialSession();

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white font-sans">
                <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 text-cyan-400 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-xl">Loading FinAssist...</span>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <AuthPage supabase={supabase} />;
    }

    return <MainApp key={currentUser.id} user={currentUser} onLogout={handleLogout} supabase={supabase} />;
};

export default App;
