import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { CloseIcon } from './shared/Icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language, setLanguage, onLogout }) => {
  if (!isOpen) return null;

  const languageOptions: { code: Language; name: string; flag: string }[] = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-700 animate-fade-in"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{translations.settings[language]}</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label={translations.close[language]}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">{translations.language[language]}</h3>
          <div className="grid grid-cols-2 gap-3">
            {languageOptions.map(opt => (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code)}
                className={`flex items-center justify-center gap-2 text-lg px-4 py-3 rounded-lg transition-all transform hover:scale-105 ${
                  language === opt.code
                    ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <span>{opt.flag}</span>
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6">
           <button
              onClick={onLogout}
              className="w-full text-center px-4 py-3 rounded-lg transition-colors bg-red-800/50 hover:bg-red-800/80 text-red-300 font-semibold"
          >
              {translations.logout[language]}
          </button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
          }
       `}</style>
    </div>
  );
};

export default SettingsModal;
