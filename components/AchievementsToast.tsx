import React, { useEffect, useState } from 'react';
import { Achievement, Language } from '../types';
import { translations } from '../translations';
import { TrophyIcon, CloseIcon } from './shared/Icon';

interface AchievementsToastProps {
  achievement: Achievement;
  onClose: () => void;
  language: Language;
  style?: React.CSSProperties;
}

const AchievementsToast: React.FC<AchievementsToastProps> = ({ achievement, onClose, language, style }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const inTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Set timer to animate out and then close
    const outTimer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
        clearTimeout(inTimer);
        clearTimeout(outTimer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Allow animation to finish before calling onClose
    setTimeout(onClose, 300); 
  };
  
  return (
    <div 
        style={style}
        className={`relative flex items-start gap-3 w-80 max-w-sm p-4 bg-gray-800 border border-amber-400/50 rounded-lg shadow-2xl text-white transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="flex-shrink-0 text-amber-400">
        <TrophyIcon className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <p className="font-bold">{translations.achievementUnlocked[language]}</p>
        <p className="text-sm text-gray-300">{achievement.title}</p>
        <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
      </div>
       <button onClick={handleClose} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white rounded-full">
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AchievementsToast;
