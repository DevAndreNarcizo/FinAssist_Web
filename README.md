# FinAssist - Seu Assistente Financeiro com IA

## 📋 Sobre o Projeto

O **FinAssist** é uma aplicação web de gestão financeira inteligente que combina um dashboard interativo com um assistente de chat alimentado por Inteligência Artificial (Google Gemini). O objetivo é simplificar o rastreamento de despesas, receitas e investimentos através de linguagem natural, permitindo que o usuário converse com seus dados financeiros.

A aplicação oferece suporte multi-idioma (Português, Inglês, Espanhol e Japonês), gamificação através de conquistas e análise de notícias do mercado financeiro em tempo real.

## 🚀 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando uma stack moderna e robusta:

-   **Frontend:** [React](https://react.dev/) (v19) + [Vite](https://vitejs.dev/)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Gráficos:** [Recharts](https://recharts.org/)
-   **Banco de Dados & Auth:** [Supabase](https://supabase.com/)
-   **Inteligência Artificial:** [Google Gemini API](https://ai.google.dev/)
-   **Backend/Serverless:** Netlify Functions

## ✨ Funcionalidades Principais

### 1. Dashboard Interativo
-   **Patrimônio Líquido:** Visualização em tempo real do saldo total (Caixa + Investimentos).
-   **Análise de Gastos:** Gráfico de pizza detalhando despesas por categoria.
-   **Visão Geral Anual:** Gráfico de barras comparativo de Receitas vs. Despesas ao longo dos últimos 12 meses.

### 2. Assistente de IA (Chat)
-   **Entrada de Dados via NLP:** Adicione transações ou investimentos apenas conversando (ex: *"Gastei R$50 no almoço hoje"* ou *"Comprei 10 ações da Apple"*).
-   **Consultoria Financeira:** Tire dúvidas sobre termos financeiros, peça análises de gastos ou dicas de economia.
-   **Feedback Visual:** Indicadores de estado "pensando" para respostas da IA.

### 3. Gestão de Investimentos
-   Suporte para Ações, Renda Fixa (Bonds), Criptomoedas e Imóveis.
-   Atualização automática de notícias relevantes ao portfólio do usuário.

### 4. Metas e Gamificação
-   Definição de metas de gastos por categoria.
-   Sistema de conquistas (Achievements) desbloqueadas ao atingir objetivos financeiros.

### 5. Internacionalização (i18n)
-   Suporte completo para **Português (PT)**, **Inglês (EN)**, **Espanhol (ES)** e **Japonês (JA)**, incluindo formatação de moeda local.

## ⚙️ Configuração e Instalação

### Pré-requisitos
-   Node.js (Versão 18+ recomendada)
-   Conta no Supabase
-   Chave de API do Google Gemini

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/finassist.git](https://github.com/seu-usuario/finassist.git)
    cd finassist
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes chaves:

    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    GEMINI_API_KEY=sua_chave_api_do_gemini
    ```

4.  **Configuração do Banco de Dados (Supabase):**
    Crie as seguintes tabelas no seu projeto Supabase para garantir o funcionamento correto:
    -   `profiles` (id, language, etc.)
    -   `transactions` (user_id, amount, category, description, date)
    -   `investments` (user_id, name, type, value, quantity)
    -   `goals` (user_id, category, amount)
    -   `chat_history` (user_id, role, text, created_at)

5.  **Execute o projeto localmente:**
    ```bash
    npm run dev
    ```

## 📂 Estrutura do Projeto

```text
/
├── components/          # Componentes React (Dashboard, Chat, Gráficos)
├── services/            # Lógica de integração (Supabase, Gemini)
├── netlify/functions/   # Serverless functions para backend seguro
├── utils/               # Formatadores e utilitários
├── types.ts             # Definições de tipos TypeScript
├── translations.ts      # Arquivos de tradução
└── App.tsx              # Ponto de entrada e roteamento
