import { Language } from './types';

export const translations: Record<string, Record<Language, string>> = {
  initialGreeting: {
    en: 'Hello! I am FinAssist. Start by telling me about your income, expenses, or investments. For example, say "I spent R$50 on lunch today".',
    pt: 'Olá! Eu sou o FinAssist. Comece me contando sobre suas receitas, despesas ou investimentos. Por exemplo, diga "Gastei R$50 no almoço hoje".',
    es: '¡Hola! Soy FinAssist. Empieza contándome tus ingresos, gastos o inversiones. Por ejemplo, di "Hoy gasté R$50 en el almuerzo".',
    ja: 'こんにちは！私はFinAssistです。あなたの収入、支出、または投資について教えてください。例えば、「今日、昼食にR$50使いました」のように話しかけてください。'
  },
  netWorth: {
    en: 'Net Worth',
    pt: 'Patrimônio Líquido',
    es: 'Patrimonio Neto',
    ja: '純資産'
  },
  spendingAnalysis: {
    en: 'Spending Analysis',
    pt: 'Análise de Gastos',
    es: 'Análisis de Gastos',
    ja: '支出分析'
  },
  investments: {
    en: 'Investments',
    pt: 'Investimentos',
    es: 'Inversiones',
    ja: '投資'
  },
  units: {
    en: 'units',
    pt: 'unidades',
    es: 'unidades',
    ja: 'ユニット'
  },
  noSpendingData: {
    en: 'No spending data available.',
    pt: 'Nenhum dado de gasto disponível.',
    es: 'No hay datos de gastos disponibles.',
    ja: '支出データはありません。'
  },
  askAnything: {
    en: 'Ask FinAssist anything...',
    pt: 'Pergunte qualquer coisa para o FinAssist...',
    es: 'Pregúntale a FinAssist cualquier cosa...',
    ja: 'FinAssistに何でも聞いてください...'
  },
  errorMessage: {
    en: 'Sorry, I encountered an error. Please try again.',
    pt: 'Desculpe, encontrei um erro. Por favor, tente novamente.',
    es: 'Lo siento, encontré un error. Por favor, inténtalo de nuevo.',
    ja: '申し訳ありませんが、エラーが発生しました。もう一度お試しください。'
  },
  thinkingError: {
    en: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
    pt: "Estou com problemas para me conectar ao meu cérebro agora. Por favor, tente novamente em um momento.",
    es: "Estoy teniendo problemas para conectarme a mi cerebro en este momento. Por favor, inténtalo de nuevo en un momento.",
    ja: "現在、脳に接続できません。しばらくしてからもう一度お試しください。"
  },
  settings: {
    en: 'Settings',
    pt: 'Configurações',
    es: 'Configuración',
    ja: '設定'
  },
  language: {
    en: 'Language',
    pt: 'Idioma',
    es: 'Idioma',
    ja: '言語'
  },
  close: {
    en: 'Close',
    pt: 'Fechar',
    es: 'Cerrar',
    ja: '閉じる'
  },
  expense: {
    en: 'expense',
    pt: 'despesa',
    es: 'gasto',
    ja: '費用'
  },
  income: {
    en: 'income',
    pt: 'receita',
    es: 'ingreso',
    ja: '収入'
  },
  transactionAdded1: {
    en: "Got it. I've added the",
    pt: 'Entendido. Adicionei a',
    es: 'Entendido. He añadido el',
    ja: '了解しました。追加しました：'
  },
  transactionAdded2: {
    en: 'for',
    pt: 'no valor de',
    es: 'por',
    ja: '、金額は'
  },
  investmentAdded1: {
    en: "Okay, I've logged the investment in",
    pt: 'Ok, registrei o investimento em',
    es: 'Vale, he registrado la inversión en',
    ja: 'はい、投資を記録しました：'
  },
  investmentAdded2: {
    en: 'with a value of',
    pt: 'com um valor de',
    es: 'con un valor de',
    ja: '、評価額は'
  },
  clickToClear: {
    en: 'Click to clear filter',
    pt: 'Clique para limpar o filtro',
    es: 'Haga clic para borrar el filtro',
    ja: 'クリックしてフィルターをクリア'
  },
  annualOverview: {
    en: 'Annual Overview',
    pt: 'Visão Geral Anual',
    es: 'Resumen Anual',
    ja: '年間概要'
  },
  goals: {
    en: 'Goals',
    pt: 'Metas',
    es: 'Metas',
    ja: '目標'
  },
  goalAmount: {
    en: 'Amount',
    pt: 'Valor',
    es: 'Cantidad',
    ja: '金額'
  },
  noGoals: {
    en: 'No goals set yet. Add one!',
    pt: 'Nenhuma meta definida ainda. Adicione uma!',
    es: 'No hay metas establecidas todavía. ¡Añade una!',
    ja: '目標はまだ設定されていません。追加してください！'
  },
  transactions: {
    en: 'Transactions',
    pt: 'Transações',
    es: 'Transacciones',
    ja: '取引'
  },
  all: {
    en: 'All',
    pt: 'Todos',
    es: 'Todos',
    ja: 'すべて'
  },
  noTransactions: {
    en: 'No transactions match filters.',
    pt: 'Nenhuma transação corresponde aos filtros.',
    es: 'Ninguna transacción coincide con los filtros.',
    ja: 'フィルターに一致する取引はありません。'
  },
  achievementUnlocked: {
    en: 'Achievement Unlocked!',
    pt: 'Conquista Desbloqueada!',
    es: '¡Logro Desbloqueado!',
    ja: '実績解除！'
  },
  goalMet: {
    en: 'Goal Met for',
    pt: 'Meta Atingida para',
    es: 'Meta Alcanzada para',
    ja: '目標達成：'
  },
  goalMetDescription: {
    en: 'You stayed under your budget of',
    pt: 'Você ficou abaixo do seu orçamento de',
    es: 'Te mantuviste por debajo de tu presupuesto de',
    ja: '予算内に収まりました：'
  },
  marketNews: {
    en: 'Market News',
    pt: 'Notícias do Mercado',
    es: 'Noticias del Mercado',
    ja: '市場ニュース'
  },
  loadingNews: {
    en: 'Loading news...',
    pt: 'Carregando notícias...',
    es: 'Cargando noticias...',
    ja: 'ニュースを読み込んでいます...'
  },
  noNews: {
    en: 'No relevant news found for your investments.',
    pt: 'Nenhuma notícia relevante encontrada para seus investimentos.',
    es: 'No se encontraron noticias relevantes para sus inversiones.',
    ja: 'あなたの投資に関連するニュースは見つかりませんでした。'
  },
  logout: {
    en: 'Logout',
    pt: 'Sair',
    es: 'Cerrar Sesión',
    ja: 'ログアウト'
  },
  login: {
    en: 'Login',
    pt: 'Entrar',
    es: 'Iniciar Sesión',
    ja: 'ログイン'
  },
  register: {
    en: 'Register',
    pt: 'Registrar',
    es: 'Registrarse',
    ja: '登録'
  },
  name: {
    en: 'Name',
    pt: 'Nome',
    es: 'Nombre',
    ja: '名前'
  },
  email: {
    en: 'Email',
    pt: 'E-mail',
    es: 'Correo Electrónico',
    ja: 'メールアドレス'
  },
  password: {
    en: 'Password',
    pt: 'Senha',
    es: 'Contraseña',
    ja: 'パスワード'
  },
  haveAccount: {
    en: 'Already have an account?',
    pt: 'Já tem uma conta?',
    es: '¿Ya tienes una cuenta?',
    ja: 'すでにアカウントをお持ちですか？'
  },
  noAccount: {
    en: "Don't have an account?",
    pt: 'Não tem uma conta?',
    es: '¿No tienes una cuenta?',
    ja: 'アカウントをお持ちではありませんか？'
  },
  processing: {
    en: "Processing...",
    pt: "Processando...",
    es: "Procesando...",
    ja: "処理中..."
  },
  authError: {
    en: "Authentication failed. Please check your credentials.",
    pt: "Falha na autenticação. Verifique suas credenciais.",
    es: "Autenticación fallida. Por favor, compruebe sus credenciales.",
    ja: "認証に失敗しました。資格情報を確認してください。"
  },
  appSubtitle: {
    en: 'Your AI Financial Assistant',
    pt: 'Seu Assistente Financeiro de IA',
    es: 'Tu Asistente Financiero de IA',
    ja: 'あなたのAI金融アシスタント'
  },
  signInWithGoogle: {
    en: 'Sign in with Google',
    pt: 'Entrar com o Google',
    es: 'Iniciar sesión con Google',
    ja: 'Googleでサインイン'
  },
  checkEmail: {
    en: 'Check your email',
    pt: 'Verifique seu e-mail',
    es: 'Revisa tu correo electrónico',
    ja: 'メールを確認してください'
  },
  emailNotConfirmed: {
    en: 'Please confirm your email address to log in.',
    pt: 'Por favor, confirme seu endereço de e-mail para entrar.',
    es: 'Por favor, confirma tu dirección de correo electrónico para iniciar sesión.',
    ja: 'ログインするには、メールアドレスを確認してください。'
  }
};