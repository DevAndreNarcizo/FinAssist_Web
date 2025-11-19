import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Esta é uma função de teste para depuração.
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Mantemos a checagem de método para consistência.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Apenas parseamos o corpo da requisição para ver se é válido.
    const body = JSON.parse(event.body || '{}');
    
    // Se chegarmos aqui, a função foi invocada com sucesso.
    // Retornamos uma mensagem de sucesso em vez de chamar o Gemini.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Success! The backend function was reached.",
        receivedAction: body.action, // Devolve a ação que o frontend enviou.
      }),
    };

  } catch (error: any) {
    // Se houver um erro (ex: JSON inválido), retornamos um erro interno.
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred in the test function.', details: error.message }),
    };
  }
};

export { handler };