import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Helper to get environment variables
const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// Initialize Gemini AI Client
const ai = new GoogleGenAI({ apiKey: getEnv('GEMINI_API_KEY') });

// --- Function Declarations and System Instructions (copied from original geminiService) ---
// Note: These are simplified for the backend, as language is passed in each request.
const getSystemInstruction = (language: string): string => {
    const langMap: { [key: string]: string } = { en: 'English', pt: 'Portuguese (Brazil)', es: 'Spanish', ja: 'Japanese' };
    return `You are FinAssist, a world-class financial assistant. Your role is to analyze user's financial data and answer questions. You can also add transactions and investments using the provided tools. You MUST respond in ${langMap[language] || 'the user\'s language'}. The currency is Brazilian Real (R$).`;
};

const getFunctionDeclarations = (): FunctionDeclaration[] => {
    const addTransaction: FunctionDeclaration = {
        name: 'addTransaction',
        description: 'Adds a new financial transaction (expense or income).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: 'The description of the transaction (e.g., "Groceries", "Salary").' },
                amount: { type: Type.NUMBER, description: 'The transaction amount. Negative for expenses, positive for income.' },
                category: { type: Type.STRING, description: 'The category of the transaction.', enum: ['Income', 'Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Other'] },
            },
            required: ['description', 'amount', 'category'],
        },
    };
    const addInvestment: FunctionDeclaration = {
        name: 'addInvestment',
        description: 'Adds a new investment holding.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name or ticker of the investment (e.g., "Bitcoin", "AAPL").' },
                type: { type: Type.STRING, description: 'The type of investment.', enum: ['Stocks', 'Bonds', 'Real Estate', 'Crypto'] },
                value: { type: Type.NUMBER, description: 'The current total market value of this holding in BRL.' },
                quantity: { type: Type.NUMBER, description: 'The quantity of the asset held (e.g., number of shares, coins).' },
            },
            required: ['name', 'type', 'value', 'quantity'],
        },
    };
    return [addTransaction, addInvestment];
};


// --- Main Handler Logic ---
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, payload } = JSON.parse(event.body || '{}');

    if (action === 'generateResponse') {
      const { prompt, transactions, investments, language } = payload;
      const contextPrompt = `Here is the user's current financial data:
Transactions:
${JSON.stringify(transactions, null, 2)}

Investments:
${JSON.stringify(investments, null, 2)}

User Query: "${prompt}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextPrompt,
        config: {
          systemInstruction: getSystemInstruction(language),
          tools: [{ functionDeclarations: getFunctionDeclarations() }],
        },
      });

      // Check for function calls or return text
      if (response.functionCalls && response.functionCalls.length > 0) {
        return { statusCode: 200, body: JSON.stringify({ type: 'functionCall', data: response.functionCalls[0] }) };
      }
      return { statusCode: 200, body: JSON.stringify({ type: 'text', data: response.text }) };

    } else if (action === 'fetchMarketNews') {
      const { investments, language } = payload;
      if (!investments || investments.length === 0) {
        return { statusCode: 200, body: JSON.stringify([]) };
      }
      const investmentNames = investments.map((i: any) => i.name).join(', ');
      const prompt = `Generate 3 realistic, brief financial news headlines and a one-sentence summary for each, relevant to investments in ${investmentNames}. Respond in ${language}. The source should be a plausible financial news outlet.`;
      
      const newsSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING, description: 'The news headline.' },
                summary: { type: Type.STRING, description: 'A one-sentence summary of the news.' },
                source: { type: Type.STRING, description: 'The plausible source of the news (e.g., "Reuters", "Bloomberg").' },
            },
            required: ['headline', 'summary', 'source'],
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: newsSchema },
      });
      
      return { statusCode: 200, body: response.text };
    } else {
      return { statusCode: 400, body: 'Invalid action' };
    }

  } catch (error: any) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.', details: error.message }),
    };
  }
};

export { handler };
