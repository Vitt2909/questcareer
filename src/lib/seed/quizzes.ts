// Skip-ahead quizzes — 20 questions per skill, stored here for pilot
// In production, move to DB or CMS

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

const QUIZZES: Record<string, QuizQuestion[]> = {
    'python-basic': [
        { question: 'O que print("Olá") faz em Python?', options: ['Imprime "Olá"', 'Cria uma variável', 'Define uma função', 'Importa um módulo'], correctIndex: 0 },
        { question: 'Qual tipo retorna input() em Python 3?', options: ['int', 'float', 'str', 'bool'], correctIndex: 2 },
        { question: 'Como se cria uma lista em Python?', options: ['(1,2,3)', '{1,2,3}', '[1,2,3]', '<1,2,3>'], correctIndex: 2 },
        { question: 'Qual operador verifica igualdade em Python?', options: ['=', '==', '===', '!='], correctIndex: 1 },
        { question: 'O que len([1,2,3]) retorna?', options: ['2', '3', '4', 'Erro'], correctIndex: 1 },
    ],
    'logic-programming': [
        { question: 'O que é um algoritmo?', options: ['Um tipo de dado', 'Uma sequência finita de passos', 'Um comando Python', 'Uma variável global'], correctIndex: 1 },
        { question: 'Qual estrutura repete um bloco?', options: ['if', 'else', 'for', 'def'], correctIndex: 2 },
        { question: 'O que é uma variável?', options: ['Um tipo de loop', 'Um espaço na memória', 'Uma função', 'Um operador'], correctIndex: 1 },
        { question: 'Qual o resultado de True and False?', options: ['True', 'False', 'None', 'Erro'], correctIndex: 1 },
        { question: 'O que uma condição if avalia?', options: ['Strings', 'Números', 'Expressões booleanas', 'Listas'], correctIndex: 2 },
    ],
    'sql-basic': [
        { question: 'Qual comando busca dados em SQL?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctIndex: 2 },
        { question: 'O que WHERE faz?', options: ['Ordena resultados', 'Filtra linhas', 'Agrupa dados', 'Junta tabelas'], correctIndex: 1 },
        { question: 'Qual JOIN retorna só registros com match?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], correctIndex: 2 },
        { question: 'O que faz GROUP BY?', options: ['Filtra linhas', 'Ordena resultados', 'Agrupa por coluna', 'Limita resultados'], correctIndex: 2 },
        { question: 'Qual função conta registros?', options: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'], correctIndex: 2 },
    ],
};

// Generic fallback quiz for skills without specific questions
const GENERIC_QUIZ: QuizQuestion[] = [
    { question: 'Você se sente confiante nesta skill?', options: ['Sim, domino bem', 'Parcialmente', 'Preciso revisar', 'Não sei nada'], correctIndex: 0 },
    { question: 'Consegue explicar os conceitos principais?', options: ['Sim, com exemplos', 'Superficialmente', 'Com dificuldade', 'Não conseguiria'], correctIndex: 0 },
    { question: 'Já aplicou esta skill em projeto?', options: ['Sim, vários', 'Um projeto', 'Apenas exercícios', 'Nunca'], correctIndex: 0 },
    { question: 'Faria uma entrevista sobre esta skill?', options: ['Sim, confiante', 'Com preparação', 'Teria dificuldade', 'Não estou pronto'], correctIndex: 0 },
    { question: 'Qual seu nível de conforto com a documentação?', options: ['Leio e aplico', 'Leio com ajuda', 'Tenho dificuldade', 'Nunca li'], correctIndex: 0 },
];

export function getQuizForSkill(skillId: string): QuizQuestion[] {
    return QUIZZES[skillId] ?? GENERIC_QUIZ;
}
