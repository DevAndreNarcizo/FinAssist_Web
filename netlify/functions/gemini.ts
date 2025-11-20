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
            const { prompt, chatHistory, transactions, investments, language } = payload;
            
            // Contexto simplificado para não estourar tokens
            const contextMsg = `
Contexto Atual:
- Idioma: ${language}
- Transações Recentes: ${JSON.stringify(transactions.slice(0, 5))}
- Investimentos: ${JSON.stringify(investments)}
`;

            // Converter e sanitizar histórico do frontend
            const rawHistory = (chatHistory || [])
                .filter((msg: any) => msg.id !== 'init' && !msg.id.startsWith('db-'))
                .map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                }));

            // Garantir alternância de papéis (User -> Model -> User...)
            const sanitizedHistory: any[] = [];
            if (rawHistory.length > 0) {
                let lastRole = null;
                for (const msg of rawHistory) {
                    if (msg.role === lastRole) {
                        // Se o papel for igual ao anterior, concatena o texto na mensagem anterior
                        sanitizedHistory[sanitizedHistory.length - 1].parts[0].text += `\n\n${msg.parts[0].text}`;
                    } else {
                        sanitizedHistory.push(msg);
                        lastRole = msg.role;
                    }
                }
            }
            
            // O histórico não pode terminar com 'user' se vamos mandar uma nova mensagem de 'user' (na verdade o startChat aceita, mas o sendMessage adiciona a nova user message. O importante é o histórico passado no startChat estar alternado e terminar com model ou user, desde que a próxima seja oposta. Como vamos mandar user, o histórico deve terminar com model, OU se terminar com user, o Gemini pode reclamar dependendo da versão. Mas a regra de ouro é alternância. Se o histórico termina com User, e mandamos User, dá erro. Então se o último do histórico for User, temos que remover ou fundir com o prompt atual? Não, o startChat define o PASSADO. Se o passado termina com User, o modelo deveria ter respondido. Vamos assumir que o histórico deve terminar com Model para podermos mandar User.)
            
            // Correção: Se a última mensagem do histórico for User, o Gemini espera que a próxima seja Model. Mas nós vamos chamar sendMessage com User.
            // Isso significa que o histórico está "incompleto" (o modelo não respondeu a última).
            // Nesse caso, devemos remover a última mensagem de User do histórico e adicioná-la ao início do prompt atual, ou simplesmente ignorá-la para evitar o erro.
            // Vamos optar por concatenar ao prompt atual se a última for user.
            
            let finalPrompt = prompt;
            if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
                const lastUserMsg = sanitizedHistory.pop();
                finalPrompt = `${lastUserMsg.parts[0].text}\n\n${prompt}`;
            }

            const chat = model.startChat({
                history: sanitizedHistory,
                tools: tools,
            });

            try {
                const result = await chat.sendMessage(`${contextMsg}\n\nUsuário: ${finalPrompt}`);
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
            } catch (apiError: any) {
                console.error("Gemini API Error:", apiError);
                return {
                    statusCode: 200, // Retorna 200 para o frontend não cair no catch genérico
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: 'text',
                        data: `Desculpe, tive um problema técnico ao processar sua solicitação. Detalhe: ${apiError.message}`
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