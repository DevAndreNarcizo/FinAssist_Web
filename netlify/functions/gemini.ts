import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "Você é o FinAssist, um assistente financeiro pessoal inteligente, amigável e proativo. Sua missão é ajudar o usuário a gerenciar suas finanças, rastrear gastos, definir metas e entender investimentos. Você fala português (ou o idioma que o usuário preferir). Você tem acesso a ferramentas para registrar transações e investimentos. Sempre que o usuário pedir para adicionar/registrar/salvar um gasto, ganho ou investimento, USE A FERRAMENTA APROPRIADA. Não apenas diga que vai fazer, faça. Seja conciso nas respostas de chat, mas detalhado nas análises.",
});

const tools: any = [
    {
        functionDeclarations: [
            {
                name: "addTransaction",
                description: "Adiciona uma nova transação (despesa ou receita) ao registro do usuário.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        description: { type: SchemaType.STRING, description: "Descrição da transação (ex: 'Almoço', 'Salário')" },
                        amount: { type: SchemaType.NUMBER, description: "Valor da transação. Positivo para receita, negativo para despesa." },
                        category: { type: SchemaType.STRING, description: "Categoria da transação. Opções: 'Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Other'" }
                    },
                    required: ["description", "amount", "category"]
                }
            },
            {
                name: "addInvestment",
                description: "Adiciona um novo investimento ao portfólio do usuário.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING, description: "Nome do ativo (ex: 'AAPL', 'Tesouro Direto')" },
                        type: { type: SchemaType.STRING, description: "Tipo de investimento. Opções: 'Stocks', 'Bonds', 'Crypto', 'Real Estate'" },
                        value: { type: SchemaType.NUMBER, description: "Valor total investido" },
                        quantity: { type: SchemaType.NUMBER, description: "Quantidade de ativos" }
                    },
                    required: ["name", "type", "value", "quantity"]
                }
            }
        ]
    }
];

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API Key missing" })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { action, payload } = body;

        if (action === 'generateResponse') {
            const { prompt, transactions, investments, language } = payload;
            
            // Contexto simplificado para não estourar tokens
            const contextMsg = `
Contexto Atual:
- Idioma: ${language}
- Transações Recentes: ${JSON.stringify(transactions.slice(0, 5))}
- Investimentos: ${JSON.stringify(investments)}
`;

            const chat = model.startChat({
                tools: tools,
            });

            const result = await chat.sendMessage(`${contextMsg}\n\nUsuário: ${prompt}`);
            const response = result.response;
            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: 'functionCall',
                        data: {
                            name: call.name,
                            args: call.args
                        }
                    })
                };
            } else {
                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: 'text',
                        data: response.text()
                    })
                };
            }
        }

        if (action === 'fetchMarketNews') {
             // Implementação simplificada de notícias (mockada ou via prompt se quiser gastar tokens)
             // Por enquanto, vamos pedir ao Gemini para gerar notícias fictícias baseadas nos investimentos
             const { investments, language } = payload;
             const prompt = `Gere 3 notícias curtas e fictícias de mercado financeiro relevantes para este portfólio: ${JSON.stringify(investments)}. Retorne APENAS um JSON array puro no formato: [{"headline": "...", "summary": "...", "source": "..."}]. Responda em ${language}.`;
             
             const result = await model.generateContent(prompt);
             const text = result.response.text();
             
             // Tenta limpar o markdown do JSON se houver
             const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
             
             try {
                 const news = JSON.parse(jsonStr);
                 return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(news)
                 };
             } catch (e) {
                 console.error("Failed to parse news JSON", e);
                 return { statusCode: 200, body: JSON.stringify([]) };
             }
        }

        return { statusCode: 400, body: JSON.stringify({ error: "Unknown action" }) };

    } catch (error: any) {
        console.error("Gemini Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "Internal Server Error" })
        };
    }
};

export { handler };