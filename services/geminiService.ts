import { Transaction, Investment, Language, MarketNews } from '../types';
import { translations } from '../translations';

// Helper function to call our secure Netlify function
const callGeminiFunction = async (action: string, payload: any) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorBody = await response.json();
                console.error("Error from Netlify function:", errorBody);
                throw new Error(errorBody.error || `Function call failed with status: ${response.status}`);
            } else {
                const text = await response.text();
                console.error("Non-JSON error response:", text.substring(0, 200));
                throw new Error(`Server error (${response.status}). Is the backend running?`);
            }
        }
        
        return response.json();
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error("Request timed out. Please check your internet connection or backend server.");
        }
        throw error;
    }
};


interface GenerateResponseParams {
    prompt: string;
    transactions: Transaction[];
    investments: Investment[];
    localApi: { [key: string]: (...args: any[]) => any };
    language: Language;
}

export const generateResponse = async ({ prompt, transactions, investments, localApi, language }: GenerateResponseParams): Promise<string> => {
    try {
        const response = await callGeminiFunction('generateResponse', {
            prompt,
            transactions,
            investments,
            language,
        });

        if (response.type === 'functionCall') {
            const fc = response.data;
            const functionToCall = localApi[fc.name];
            
            if (functionToCall) {
                // The backend function doesn't know about the localApi, so we execute the call here.
                let result;
                if (fc.name === 'addTransaction') {
                    result = await functionToCall(fc.args.description, fc.args.amount, fc.args.category);
                } else if (fc.name === 'addInvestment') {
                    result = await functionToCall(fc.args.name, fc.args.type, fc.args.value, fc.args.quantity);
                } else {
                     return translations.errorMessage[language];
                }
                return result;
            } else {
                 return translations.errorMessage[language];
            }
        }
        
        return response.data; // This is the text response

    } catch (error) {
        console.error("Gemini function call Error:", error);
        return translations.thinkingError[language];
    }
};

export const fetchMarketNews = async (investments: Investment[], language: Language): Promise<Omit<MarketNews, 'id'>[]> => {
    if (investments.length === 0) {
        return [];
    }

    try {
        const newsData = await callGeminiFunction('fetchMarketNews', { investments, language });
        if (Array.isArray(newsData)) {
            return newsData;
        }
        return [];

    } catch (error) {
        console.error("Error fetching market news via function:", error);
        return [];
    }
};