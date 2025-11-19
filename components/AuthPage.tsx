import React, { useState } from 'react';
import { LogoIcon, GoogleIcon } from './shared/Icon';
import { translations } from '../translations';
import { SupabaseClient } from '@supabase/supabase-js';

interface AuthPageProps {
  supabase: SupabaseClient;
}

const AuthPage: React.FC<AuthPageProps> = ({ supabase }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  
  const lang = 'pt';

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setError(error.message || translations.authError[lang]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
        if (isRegister) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });
            if (error) throw error;
            setShowConfirmationMessage(true);
        } else { // Login
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        }
    } catch (err: any) {
        console.error("Authentication error:", err);
        if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('check your email'))) {
            setError(translations.emailNotConfirmed[lang]);
        } else {
            setError(err.message || translations.authError[lang]);
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (showConfirmationMessage) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
            <div className="w-full max-w-sm text-center">
                <div className="flex flex-col items-center mb-8">
                    <LogoIcon className="w-16 h-16 text-cyan-400" />
                    <h1 className="text-4xl font-bold text-white mt-4">FinAssist</h1>
                </div>
                <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">{translations.checkEmail[lang]}</h2>
                    <p className="text-gray-400">{`Enviamos um link de confirmação para ${email}. Por favor, verifique sua caixa de entrada.`}</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <LogoIcon className="w-16 h-16 text-cyan-400" />
          <h1 className="text-4xl font-bold text-white mt-4">FinAssist</h1>
          <p className="text-gray-400">{translations.appSubtitle[lang]}</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {isRegister ? translations.register[lang] : translations.login[lang]}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-400" htmlFor="name">{translations.name[lang]}</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-400" htmlFor="email">{translations.email[lang]}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400" htmlFor="password">{translations.password[lang]}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isLoading ? translations.processing[lang] : (isRegister ? translations.register[lang] : translations.login[lang])}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-500">OU</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            {translations.signInWithGoogle[lang]}
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isRegister ? translations.haveAccount[lang] : translations.noAccount[lang]}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="font-semibold text-indigo-400 hover:text-indigo-300">
            {isRegister ? translations.login[lang] : translations.register[lang]}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;