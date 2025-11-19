import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Transaction, Investment, Language } from '../types';
import { generateResponse } from '../services/geminiService';
import { SUGGESTED_PROMPTS } from '../constants';
import { UserIcon, BotIcon, SendIcon, CogIcon } from './shared/Icon';
import { translations } from '../translations';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isThinking: boolean;
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>;
  localApi: { [key: string]: (...args: any[]) => any };
  transactions: Transaction[];
  investments: Investment[];
  language: Language;
  openSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chatHistory, setChatHistory, isThinking, setIsThinking, localApi, transactions, investments, language, openSettings
}) => {
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || userInput.trim();
    if (!textToSend) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
    };
    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsThinking(true);

    try {
        const modelResponse = await generateResponse({
            prompt: textToSend,
            transactions,
            investments,
            localApi,
            language,
        });

        const botMessage: ChatMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            text: modelResponse,
        };
        setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
        console.error("Error generating response:", error);
        const errorMessage: ChatMessage = {
            id: `model-${Date.now()}`,
            role: 'model',
            text: translations.errorMessage[language],
        };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsThinking(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full p-4 bg-gray-900">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-6 p-4">
        {chatHistory.map(message => (
          <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'model' && (
                <div className="w-8 h-8 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <BotIcon className="w-5 h-5 text-cyan-400" />
                </div>
            )}
            <div className={`max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
             {message.role === 'user' && (
                <div className="w-8 h-8 flex-shrink-0 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-indigo-400" />
                </div>
            )}
          </div>
        ))}
        {isThinking && (
           <div className="flex items-start gap-4">
                <div className="w-8 h-8 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <BotIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="max-w-md xl:max-w-lg px-4 py-3 rounded-2xl bg-gray-800 text-gray-200 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-0"></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
            </div>
        )}
      </div>
      <div className="mt-4 border-t border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-3 px-4 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
            {SUGGESTED_PROMPTS[language].map(prompt => (
                <button key={prompt} onClick={() => handleSendMessage(prompt)} className="flex-shrink-0 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap border border-gray-700/50">
                    {prompt}
                </button>
            ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={translations.askAnything[language]}
            className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-4 pr-24 md:pl-5 md:pr-28 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isThinking}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
                type="button" 
                onClick={openSettings} 
                className="p-2.5 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 transition-colors"
                aria-label={translations.settings[language]}
            >
                <CogIcon className="w-5 h-5" />
            </button>
            <button type="submit" disabled={isThinking} className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 transition-colors">
                <SendIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;