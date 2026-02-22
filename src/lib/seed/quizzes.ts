// Skip-ahead quizzes — 5 questions per skill, stored here for pilot
// In production, move to DB or CMS

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

const QUIZZES: Record<string, QuizQuestion[]> = {
    'python-basic': [
        { question: 'O que print("Olá") faz em Python?', options: ['Imprime "Olá"', 'Cria uma variável', 'Define uma função', 'Importa um módulo'], correctIndex: 0, explanation: 'print() é a função de saída padrão do Python.' },
        { question: 'Qual tipo retorna input() em Python 3?', options: ['int', 'float', 'str', 'bool'], correctIndex: 2, explanation: 'input() sempre retorna string; use int() ou float() para converter.' },
        { question: 'Como se cria uma lista em Python?', options: ['(1,2,3)', '{1,2,3}', '[1,2,3]', '<1,2,3>'], correctIndex: 2, explanation: 'Listas usam colchetes []. Parênteses criam tuplas, chaves criam sets ou dicts.' },
        { question: 'Qual operador verifica igualdade em Python?', options: ['=', '==', '===', '!='], correctIndex: 1, explanation: '= é atribuição, == é comparação de igualdade.' },
        { question: 'O que len([1,2,3]) retorna?', options: ['2', '3', '4', 'Erro'], correctIndex: 1, explanation: 'len() retorna o número de elementos. A lista tem 3 itens.' },
    ],
    'logic-programming': [
        { question: 'O que é um algoritmo?', options: ['Um tipo de dado', 'Uma sequência finita de passos', 'Um comando Python', 'Uma variável global'], correctIndex: 1, explanation: 'Algoritmo é uma sequência finita e ordenada de passos para resolver um problema.' },
        { question: 'Qual estrutura repete um bloco?', options: ['if', 'else', 'for', 'def'], correctIndex: 2, explanation: 'for e while são estruturas de repetição (loops).' },
        { question: 'O que é uma variável?', options: ['Um tipo de loop', 'Um espaço na memória', 'Uma função', 'Um operador'], correctIndex: 1, explanation: 'Variáveis armazenam valores na memória para uso posterior.' },
        { question: 'Qual o resultado de True and False?', options: ['True', 'False', 'None', 'Erro'], correctIndex: 1, explanation: 'O operador "and" retorna True somente se ambos forem True.' },
        { question: 'O que uma condição if avalia?', options: ['Strings', 'Números', 'Expressões booleanas', 'Listas'], correctIndex: 2, explanation: 'if avalia uma expressão que resulta em True ou False.' },
    ],
    'sql-basic': [
        { question: 'Qual comando busca dados em SQL?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctIndex: 2, explanation: 'SELECT é o comando DQL (Data Query Language) para consultar dados.' },
        { question: 'O que WHERE faz?', options: ['Ordena resultados', 'Filtra linhas', 'Agrupa dados', 'Junta tabelas'], correctIndex: 1, explanation: 'WHERE filtra linhas com base em uma condição.' },
        { question: 'Qual JOIN retorna só registros com match?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], correctIndex: 2, explanation: 'INNER JOIN retorna apenas as linhas que possuem correspondência em ambas as tabelas.' },
        { question: 'O que faz GROUP BY?', options: ['Filtra linhas', 'Ordena resultados', 'Agrupa por coluna', 'Limita resultados'], correctIndex: 2, explanation: 'GROUP BY agrupa linhas com valores iguais em colunas especificadas.' },
        { question: 'Qual função conta registros?', options: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'], correctIndex: 2, explanation: 'COUNT() retorna o número de linhas que correspondem à consulta.' },
    ],
    'etl-pipelines': [
        { question: 'O que significa ETL?', options: ['Export, Transform, Load', 'Extract, Transform, Load', 'Extract, Transfer, Log', 'Edit, Transform, Link'], correctIndex: 1, explanation: 'ETL = Extract (extrair dados da origem), Transform (limpar/transformar), Load (carregar no destino).' },
        { question: 'Qual fase do ETL limpa dados inconsistentes?', options: ['Extract', 'Transform', 'Load', 'Index'], correctIndex: 1, explanation: 'A fase Transform é responsável pela limpeza, validação e transformação dos dados.' },
        { question: 'O que é um Data Warehouse?', options: ['Base de dados operacional', 'Repositório analítico consolidado', 'Planilha Excel', 'Ferramenta de BI'], correctIndex: 1, explanation: 'Data Warehouse é um repositório centralizado para análise, otimizado para consultas analíticas.' },
        { question: 'O que faz o Apache Airflow?', options: ['Armazena dados', 'Orquestra pipelines', 'Visualiza dashboards', 'Treina modelos ML'], correctIndex: 1, explanation: 'Airflow é um orquestrador de workflows que agenda e monitora pipelines de dados.' },
        { question: 'Qual é a vantagem de pipelines idempotentes?', options: ['Mais rápidos', 'Podem ser re-executados sem efeitos colaterais', 'Usam menos memória', 'São mais simples de escrever'], correctIndex: 1, explanation: 'Pipelines idempotentes produzem o mesmo resultado independente de quantas vezes são executados.' },
    ],
};

// Generic fallback quiz for skills without specific questions
const GENERIC_QUIZ: QuizQuestion[] = [
    { question: 'Você se sente confiante nesta skill?', options: ['Sim, domino bem', 'Parcialmente', 'Preciso revisar', 'Não sei nada'], correctIndex: 0, explanation: 'Auto-avaliação de confiança na skill.' },
    { question: 'Consegue explicar os conceitos principais?', options: ['Sim, com exemplos', 'Superficialmente', 'Com dificuldade', 'Não conseguiria'], correctIndex: 0, explanation: 'Capacidade de explicar demonstra domínio real.' },
    { question: 'Já aplicou esta skill em projeto?', options: ['Sim, vários', 'Um projeto', 'Apenas exercícios', 'Nunca'], correctIndex: 0, explanation: 'Aplicação prática valida o aprendizado.' },
    { question: 'Faria uma entrevista sobre esta skill?', options: ['Sim, confiante', 'Com preparação', 'Teria dificuldade', 'Não estou pronto'], correctIndex: 0, explanation: 'Prontidão para entrevista indica nível avançado.' },
    { question: 'Qual seu nível de conforto com a documentação?', options: ['Leio e aplico', 'Leio com ajuda', 'Tenho dificuldade', 'Nunca li'], correctIndex: 0, explanation: 'Leitura autônoma de docs é sinal de maturidade técnica.' },
];

export function getQuizForSkill(skillId: string): QuizQuestion[] {
    return QUIZZES[skillId] ?? GENERIC_QUIZ;
}
