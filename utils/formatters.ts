import { Language } from '../types';

const locales: Record<Language, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES',
  ja: 'ja-JP'
};

export const formatCurrency = (value: number, language: Language): string => {
  return new Intl.NumberFormat(locales[language], {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
