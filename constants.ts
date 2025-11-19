import { Language } from './types';

export const SUGGESTED_PROMPTS: Record<Language, string[]> = {
    en: [
        "Analyze my spending",
        "Add a R$75 dinner expense",
        "What are common bank fees?",
        "Explain compound interest"
    ],
    pt: [
        "Analisar meus gastos",
        "Adicionar despesa de R$75 para o jantar",
        "Quais são as taxas bancárias comuns?",
        "Explique juros compostos"
    ],
    es: [
        "Analizar mis gastos",
        "Añadir gasto de R$75 para la cena",
        "¿Cuáles son las comisiones bancarias comunes?",
        "Explica el interés compuesto"
    ],
    ja: [
        "支出を分析して",
        "夕食にR$75の経費を追加",
        "一般的な銀行手数料は何ですか？",
        "複利を説明して"
    ]
};
