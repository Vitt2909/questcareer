// Career Seed Data — 5 roles with phases, skills, resources
// Run: npx tsx src/lib/seed/career-data.ts (or call seedDatabase() from an API route)

import type { SupabaseClient } from '@supabase/supabase-js';

// ═══ Types ═══
interface SeedRole {
    id: string; name: string; description: string; category: string;
    demand_level: string; icon: string; active: boolean;
}
interface SeedSkill {
    id: string; role_id: string; name: string; description: string;
    category: string; level: string; prerequisites: string[];
    estimated_hours: number; related_attribute: string;
}
interface SeedResource {
    id: string; title: string; provider: string; url: string;
    content_type: string; duration_hours?: number; skill_ids: string[];
    platform_id?: string; youtube_id?: string; youtube_type?: string;
    language?: string; active: boolean;
}
interface SeedQuest {
    id: string; skill_id: string; title: string; description: string;
    resource_id?: string; resource_type: string; estimated_minutes: number;
    xp_reward: number; difficulty: string;
}
interface SeedPhase {
    name: string; weeks: number; skills: string[];
    checkpoint?: string; evidence?: string;
}

// ═══ DATA-ENGINEER (complete — 5 phases) ═══
const DE_SKILLS: SeedSkill[] = [
    // Phase 1
    {
        id: 'python-basic', role_id: 'data-engineer', name: 'Python Básico', description: 'Variáveis, loops, funções, listas e dicionários',
        category: 'Programação', level: 'basic', prerequisites: [], estimated_hours: 40, related_attribute: 'analytical'
    },
    {
        id: 'logic-programming', role_id: 'data-engineer', name: 'Lógica de Programação', description: 'Estruturas condicionais, algoritmos e pensamento computacional',
        category: 'Programação', level: 'basic', prerequisites: [], estimated_hours: 20, related_attribute: 'planning'
    },
    // Phase 2
    {
        id: 'sql-basic', role_id: 'data-engineer', name: 'SQL Básico', description: 'SELECT, JOIN, GROUP BY, subqueries',
        category: 'Dados', level: 'basic', prerequisites: ['logic-programming'], estimated_hours: 30, related_attribute: 'analytical'
    },
    {
        id: 'data-concepts', role_id: 'data-engineer', name: 'Conceitos de Dados', description: 'Tipos de dados, modelagem relacional, Data Warehouse vs Data Lake',
        category: 'Dados', level: 'basic', prerequisites: [], estimated_hours: 10, related_attribute: 'learning_speed'
    },
    // Phase 3
    {
        id: 'python-intermediate', role_id: 'data-engineer', name: 'Python Intermediário', description: 'OOP, decorators, virtualenv, testes',
        category: 'Programação', level: 'intermediate', prerequisites: ['python-basic'], estimated_hours: 30, related_attribute: 'execution'
    },
    {
        id: 'pandas-basics', role_id: 'data-engineer', name: 'Pandas Básico', description: 'DataFrames, limpeza, merge, groupby, visualização',
        category: 'Dados', level: 'basic', prerequisites: ['python-basic'], estimated_hours: 20, related_attribute: 'analytical'
    },
    // Phase 4
    {
        id: 'etl-pipelines', role_id: 'data-engineer', name: 'Pipelines ETL', description: 'Extração, transformação, carga, scheduling',
        category: 'Engenharia', level: 'intermediate', prerequisites: ['python-intermediate', 'sql-basic'], estimated_hours: 40, related_attribute: 'execution'
    },
    {
        id: 'cloud-basics', role_id: 'data-engineer', name: 'Cloud Básico', description: 'GCP/AWS free tier, armazenamento, IAM',
        category: 'Infra', level: 'basic', prerequisites: [], estimated_hours: 20, related_attribute: 'planning'
    },
    // Phase 5
    {
        id: 'portfolio-building', role_id: 'data-engineer', name: 'Construção de Portfólio', description: 'GitHub, README, projetos documentados',
        category: 'Carreira', level: 'basic', prerequisites: [], estimated_hours: 15, related_attribute: 'communication'
    },
    {
        id: 'technical-interview-prep', role_id: 'data-engineer', name: 'Preparação para Entrevistas', description: 'SQL challenges, whiteboard, behavioral questions',
        category: 'Carreira', level: 'intermediate', prerequisites: [], estimated_hours: 15, related_attribute: 'communication'
    },
];

const DE_RESOURCES: SeedResource[] = [
    // Phase 1
    {
        id: 'cs50p', title: 'CS50P Python', provider: 'Harvard', content_type: 'external_course',
        url: 'https://cs50.harvard.edu/python', duration_hours: 20, skill_ids: ['python-basic'], active: true
    },
    {
        id: 'python-org-tutorial', title: 'Python.org Tutorial', provider: 'Python.org', content_type: 'external_article',
        url: 'https://docs.python.org/3/tutorial/', skill_ids: ['python-basic'], active: true
    },
    {
        id: 'yt-python-guanabara', title: 'Curso de Python 3 — Mundo 1', provider: 'Curso em Vídeo', content_type: 'youtube',
        youtube_id: 'PLHz_AreHm4dlKP6QQCekuIPky1CiwmdI6', youtube_type: 'playlist',
        url: 'https://youtube.com/playlist?list=PLHz_AreHm4dlKP6QQCekuIPky1CiwmdI6', skill_ids: ['python-basic'], active: true
    },
    {
        id: 'bradesco-logica', title: 'Lógica de Programação', provider: 'Fundação Bradesco', content_type: 'external_course',
        url: 'https://www.ev.org.br/cursos/logica-de-programacao', duration_hours: 20,
        platform_id: 'bradesco', skill_ids: ['logic-programming'], active: true
    },
    // Phase 2
    {
        id: 'sqlzoo', title: 'SQLZoo', provider: 'SQLZoo', content_type: 'external_exercise',
        url: 'https://sqlzoo.net', duration_hours: 12, skill_ids: ['sql-basic'], active: true
    },
    {
        id: 'mode-sql', title: 'Mode SQL Tutorial', provider: 'Mode Analytics', content_type: 'external_article',
        url: 'https://mode.com/sql-tutorial', skill_ids: ['sql-basic'], active: true
    },
    {
        id: 'yt-sql-hashtag', title: 'SQL com Python — Hashtag', provider: 'Hashtag Treinamentos', content_type: 'youtube',
        youtube_id: 'PLyqOvdQmGdTSQs-ya5u-O2aMCvFV0UhNy', youtube_type: 'playlist',
        url: 'https://youtube.com/playlist?list=PLyqOvdQmGdTSQs-ya5u-O2aMCvFV0UhNy', skill_ids: ['sql-basic'], active: true
    },
    {
        id: 'evg-ciencia-dados', title: 'Introdução à Ciência de Dados', provider: 'Escola Virtual GOV', content_type: 'external_course',
        url: 'https://www.escolavirtual.gov.br/curso/288', duration_hours: 4,
        platform_id: 'evg', skill_ids: ['data-concepts'], active: true
    },
    // Phase 3
    {
        id: 'kaggle-python', title: 'Kaggle Python Course', provider: 'Kaggle', content_type: 'external_course',
        url: 'https://www.kaggle.com/learn/python', duration_hours: 5, skill_ids: ['python-intermediate'], active: true
    },
    {
        id: 'kaggle-pandas', title: 'Kaggle Pandas Course', provider: 'Kaggle', content_type: 'external_course',
        url: 'https://www.kaggle.com/learn/pandas', duration_hours: 4, skill_ids: ['pandas-basics'], active: true
    },
    {
        id: 'dnc-python-ds', title: 'Python para Data Science', provider: 'Escola DNC', content_type: 'external_course',
        url: 'https://www.escoladnc.com.br/cursos/python-para-data-science', duration_hours: 15,
        platform_id: 'dnc', skill_ids: ['python-intermediate', 'pandas-basics'], active: true
    },
    // Phase 4
    {
        id: 'dbt-learn', title: 'dbt Learn', provider: 'dbt Labs', content_type: 'external_course',
        url: 'https://courses.getdbt.com', duration_hours: 8, skill_ids: ['etl-pipelines'], active: true
    },
    {
        id: 'gcp-free', title: 'GCP Skills Boost Free Tier', provider: 'Google Cloud', content_type: 'external_course',
        url: 'https://cloudskillsboost.google', duration_hours: 10, skill_ids: ['cloud-basics'], active: true
    },
    {
        id: 'santander-tech', title: 'Tecnologia e Inovação', provider: 'Santander Open Academy', content_type: 'external_course',
        url: 'https://app.becas-santander.com/pt/program/cursos-santander-tecnologia', duration_hours: 20,
        platform_id: 'santander', skill_ids: ['etl-pipelines', 'cloud-basics'], active: true
    },
    // Phase 5
    {
        id: 'stratascratch', title: 'StrataScratch SQL Practice', provider: 'StrataScratch', content_type: 'external_exercise',
        url: 'https://stratascratch.com', skill_ids: ['technical-interview-prep'], active: true
    },
    {
        id: 'yt-readme-tips', title: 'Como fazer um bom README', provider: 'Filipe Deschamps', content_type: 'youtube',
        youtube_id: 'o6HEeHzj0g8', youtube_type: 'video',
        url: 'https://youtube.com/watch?v=o6HEeHzj0g8', skill_ids: ['portfolio-building'], active: true
    },
];

const DE_PHASES: SeedPhase[] = [
    {
        name: 'Fundamentos de Programação', weeks: 6, skills: ['python-basic', 'logic-programming'],
        checkpoint: 'Quiz 20 questões, aprovação >= 70%', evidence: 'Repositório GitHub com 3 scripts funcionais'
    },
    {
        name: 'Fundamentos de Dados', weeks: 8, skills: ['sql-basic', 'data-concepts'],
        evidence: 'Notebook Kaggle publicado com análise de dataset público'
    },
    {
        name: 'Python para Dados', weeks: 8, skills: ['python-intermediate', 'pandas-basics'],
        evidence: 'PR no GitHub com análise de dados reais + README'
    },
    {
        name: 'Engenharia de Dados', weeks: 10, skills: ['etl-pipelines', 'cloud-basics'],
        evidence: 'Pipeline ETL end-to-end rodando + repositório documentado'
    },
    {
        name: 'Portfólio e Mercado', weeks: 10, skills: ['portfolio-building', 'technical-interview-prep'],
        evidence: 'Portfolio page no GitHub + 3 candidaturas documentadas'
    },
];

// ═══ BACKEND-DEVELOPER (2 phases) ═══
const BE_SKILLS: SeedSkill[] = [
    {
        id: 'be-javascript', role_id: 'backend-developer', name: 'JavaScript/TypeScript', description: 'Fundamentos de JS/TS, async/await, módulos',
        category: 'Programação', level: 'basic', prerequisites: [], estimated_hours: 40, related_attribute: 'analytical'
    },
    {
        id: 'be-nodejs', role_id: 'backend-developer', name: 'Node.js Básico', description: 'Express, APIs REST, middleware',
        category: 'Backend', level: 'basic', prerequisites: ['be-javascript'], estimated_hours: 30, related_attribute: 'execution'
    },
    {
        id: 'be-databases', role_id: 'backend-developer', name: 'Bancos de Dados', description: 'PostgreSQL, queries, ORMs',
        category: 'Dados', level: 'basic', prerequisites: ['be-javascript'], estimated_hours: 25, related_attribute: 'analytical'
    },
    {
        id: 'be-apis', role_id: 'backend-developer', name: 'Design de APIs', description: 'REST, GraphQL, autenticação, versionamento',
        category: 'Backend', level: 'intermediate', prerequisites: ['be-nodejs'], estimated_hours: 30, related_attribute: 'planning'
    },
    {
        id: 'be-testing', role_id: 'backend-developer', name: 'Testes Automatizados', description: 'Jest, testes unitários e de integração',
        category: 'Qualidade', level: 'intermediate', prerequisites: ['be-nodejs'], estimated_hours: 20, related_attribute: 'execution'
    },
    {
        id: 'be-deploy', role_id: 'backend-developer', name: 'Deploy e CI/CD', description: 'Docker, Vercel, GitHub Actions',
        category: 'Infra', level: 'basic', prerequisites: [], estimated_hours: 15, related_attribute: 'planning'
    },
];

const BE_RESOURCES: SeedResource[] = [
    {
        id: 'freecodecamp-js', title: 'JavaScript Algorithms', provider: 'freeCodeCamp', content_type: 'external_course',
        url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/', duration_hours: 40, skill_ids: ['be-javascript'], active: true
    },
    {
        id: 'yt-rocketseat-node', title: 'Node.js do Zero', provider: 'Rocketseat', content_type: 'youtube',
        youtube_id: 'PLRqMrr8aCON5tLKS3w6gZekMGOZmNKqKe', youtube_type: 'playlist',
        url: 'https://youtube.com/playlist?list=PLRqMrr8aCON5tLKS3w6gZekMGOZmNKqKe', skill_ids: ['be-nodejs'], active: true
    },
    {
        id: 'supabase-tutorial', title: 'Supabase Quickstart', provider: 'Supabase', content_type: 'external_article',
        url: 'https://supabase.com/docs/guides/getting-started', skill_ids: ['be-databases'], active: true
    },
    {
        id: 'yt-deschamps-api', title: 'Como funciona uma API?', provider: 'Filipe Deschamps', content_type: 'youtube',
        youtube_id: 'vGuqKIRWosk', youtube_type: 'video',
        url: 'https://youtube.com/watch?v=vGuqKIRWosk', skill_ids: ['be-apis'], active: true
    },
    {
        id: 'jest-docs', title: 'Jest Getting Started', provider: 'Jest', content_type: 'external_article',
        url: 'https://jestjs.io/docs/getting-started', skill_ids: ['be-testing'], active: true
    },
    {
        id: 'vercel-deploy-guide', title: 'Deploy com Vercel', provider: 'Vercel', content_type: 'external_article',
        url: 'https://vercel.com/docs/getting-started-with-vercel', skill_ids: ['be-deploy'], active: true
    },
];

const BE_PHASES: SeedPhase[] = [
    {
        name: 'Fundamentos de Backend', weeks: 8, skills: ['be-javascript', 'be-nodejs', 'be-databases'],
        evidence: 'API REST com CRUD completo no GitHub'
    },
    {
        name: 'Backend Avançado', weeks: 8, skills: ['be-apis', 'be-testing', 'be-deploy'],
        evidence: 'Projeto com testes e deploy automatizado'
    },
];

// ═══ FRONTEND-DEVELOPER (2 phases) ═══
const FE_SKILLS: SeedSkill[] = [
    {
        id: 'fe-html-css', role_id: 'frontend-developer', name: 'HTML & CSS', description: 'Semântica, Flexbox, Grid, responsivo',
        category: 'Frontend', level: 'basic', prerequisites: [], estimated_hours: 30, related_attribute: 'execution'
    },
    {
        id: 'fe-javascript', role_id: 'frontend-developer', name: 'JavaScript para Web', description: 'DOM, eventos, fetch, ES6+',
        category: 'Programação', level: 'basic', prerequisites: [], estimated_hours: 35, related_attribute: 'analytical'
    },
    {
        id: 'fe-react', role_id: 'frontend-developer', name: 'React Básico', description: 'Components, hooks, state, props',
        category: 'Frontend', level: 'basic', prerequisites: ['fe-javascript'], estimated_hours: 30, related_attribute: 'execution'
    },
    {
        id: 'fe-responsive', role_id: 'frontend-developer', name: 'Design Responsivo', description: 'Mobile-first, media queries, acessibilidade',
        category: 'Frontend', level: 'intermediate', prerequisites: ['fe-html-css', 'fe-react'], estimated_hours: 20, related_attribute: 'planning'
    },
    {
        id: 'fe-nextjs', role_id: 'frontend-developer', name: 'Next.js', description: 'SSR, SSG, App Router, APIs',
        category: 'Frontend', level: 'intermediate', prerequisites: ['fe-react'], estimated_hours: 25, related_attribute: 'execution'
    },
    {
        id: 'fe-portfolio', role_id: 'frontend-developer', name: 'Portfólio Web', description: 'Projeto pessoal + deploy',
        category: 'Carreira', level: 'basic', prerequisites: [], estimated_hours: 15, related_attribute: 'communication'
    },
];

const FE_RESOURCES: SeedResource[] = [
    {
        id: 'freecodecamp-html', title: 'Responsive Web Design', provider: 'freeCodeCamp', content_type: 'external_course',
        url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', duration_hours: 30, skill_ids: ['fe-html-css'], active: true
    },
    {
        id: 'yt-curso-em-video-js', title: 'JavaScript — Curso em Vídeo', provider: 'Curso em Vídeo', content_type: 'youtube',
        youtube_id: 'PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1', youtube_type: 'playlist',
        url: 'https://youtube.com/playlist?list=PLHz_AreHm4dlsK3Nr9GVvXCbpQyHQl1o1', skill_ids: ['fe-javascript'], active: true
    },
    {
        id: 'react-docs', title: 'React Docs — Learn', provider: 'React', content_type: 'external_article',
        url: 'https://react.dev/learn', skill_ids: ['fe-react'], active: true
    },
    {
        id: 'nextjs-learn', title: 'Next.js Learn', provider: 'Vercel', content_type: 'external_course',
        url: 'https://nextjs.org/learn', duration_hours: 12, skill_ids: ['fe-nextjs'], active: true
    },
    {
        id: 'a11y-mdn', title: 'Accessibility — MDN', provider: 'MDN', content_type: 'external_article',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', skill_ids: ['fe-responsive'], active: true
    },
    {
        id: 'yt-portfolio-deschamps', title: 'Como criar um portfólio dev', provider: 'Filipe Deschamps', content_type: 'youtube',
        youtube_id: 'tavMBKJ1sAo', youtube_type: 'video',
        url: 'https://youtube.com/watch?v=tavMBKJ1sAo', skill_ids: ['fe-portfolio'], active: true
    },
];

const FE_PHASES: SeedPhase[] = [
    {
        name: 'Fundamentos de Frontend', weeks: 8, skills: ['fe-html-css', 'fe-javascript', 'fe-react'],
        evidence: 'Landing page responsiva publicada'
    },
    {
        name: 'Frontend Avançado', weeks: 8, skills: ['fe-responsive', 'fe-nextjs', 'fe-portfolio'],
        evidence: 'Portfólio pessoal com Next.js no Vercel'
    },
];

// ═══ UX-DESIGNER (2 phases) ═══
const UX_SKILLS: SeedSkill[] = [
    {
        id: 'ux-research', role_id: 'ux-designer', name: 'Pesquisa com Usuários', description: 'Entrevistas, personas, jornada do usuário',
        category: 'UX', level: 'basic', prerequisites: [], estimated_hours: 25, related_attribute: 'communication'
    },
    {
        id: 'ux-ia', role_id: 'ux-designer', name: 'Arquitetura de Informação', description: 'Sitemaps, card sorting, navegação',
        category: 'UX', level: 'basic', prerequisites: [], estimated_hours: 20, related_attribute: 'planning'
    },
    {
        id: 'ux-wireframes', role_id: 'ux-designer', name: 'Wireframes e Protótipos', description: 'Figma, low-fi → high-fi, fluxos',
        category: 'UX', level: 'basic', prerequisites: ['ux-ia'], estimated_hours: 30, related_attribute: 'execution'
    },
    {
        id: 'ux-ui-fundamentals', role_id: 'ux-designer', name: 'Fundamentos de UI', description: 'Tipografia, cores, grid, acessibilidade visual',
        category: 'UI', level: 'intermediate', prerequisites: ['ux-wireframes'], estimated_hours: 25, related_attribute: 'analytical'
    },
    {
        id: 'ux-usability', role_id: 'ux-designer', name: 'Testes de Usabilidade', description: 'Heurísticas, testes moderados, métricas',
        category: 'UX', level: 'intermediate', prerequisites: ['ux-research'], estimated_hours: 20, related_attribute: 'analytical'
    },
    {
        id: 'ux-portfolio', role_id: 'ux-designer', name: 'Portfólio de Design', description: 'Estudos de caso, Behance/Dribbble',
        category: 'Carreira', level: 'basic', prerequisites: [], estimated_hours: 15, related_attribute: 'communication'
    },
];

const UX_RESOURCES: SeedResource[] = [
    {
        id: 'google-ux-cert', title: 'Google UX Design — Coursera', provider: 'Google', content_type: 'external_course',
        url: 'https://www.coursera.org/professional-certificates/google-ux-design', duration_hours: 40, skill_ids: ['ux-research', 'ux-ia'], active: true
    },
    {
        id: 'figma-tutorials', title: 'Figma Tutorials', provider: 'Figma', content_type: 'external_article',
        url: 'https://help.figma.com/hc/en-us/categories/360002051613', skill_ids: ['ux-wireframes'], active: true
    },
    {
        id: 'yt-uxnow', title: 'UX Now — Fundamentos de UX', provider: 'UX Now', content_type: 'youtube',
        youtube_id: 'PLQ8RiHNthORJJyC3FCuAA8g6a9lfKPHNm', youtube_type: 'playlist',
        url: 'https://youtube.com/playlist?list=PLQ8RiHNthORJJyC3FCuAA8g6a9lfKPHNm', skill_ids: ['ux-research'], active: true
    },
    {
        id: 'laws-of-ux', title: 'Laws of UX', provider: 'Jon Yablonski', content_type: 'external_article',
        url: 'https://lawsofux.com', skill_ids: ['ux-ui-fundamentals'], active: true
    },
    {
        id: 'nielsen-heuristics', title: '10 Heurísticas de Nielsen', provider: 'NN/g', content_type: 'external_article',
        url: 'https://www.nngroup.com/articles/ten-usability-heuristics/', skill_ids: ['ux-usability'], active: true
    },
    {
        id: 'yt-behance-portfolio', title: 'Como montar portfólio de UX', provider: 'Leandro Rezende', content_type: 'youtube',
        youtube_id: '3j-Y-3E1dT4', youtube_type: 'video',
        url: 'https://youtube.com/watch?v=3j-Y-3E1dT4', skill_ids: ['ux-portfolio'], active: true
    },
];

const UX_PHASES: SeedPhase[] = [
    {
        name: 'Fundamentos de UX', weeks: 8, skills: ['ux-research', 'ux-ia', 'ux-wireframes'],
        evidence: 'Protótipo no Figma de um app simples'
    },
    {
        name: 'UX/UI Avançado', weeks: 8, skills: ['ux-ui-fundamentals', 'ux-usability', 'ux-portfolio'],
        evidence: 'Case study completo no Behance'
    },
];

// ═══ DATA-ANALYST (2 phases) ═══
const DA_SKILLS: SeedSkill[] = [
    {
        id: 'da-excel', role_id: 'data-analyst', name: 'Excel/Sheets Avançado', description: 'Fórmulas, pivot tables, gráficos, macros básicas',
        category: 'Ferramentas', level: 'basic', prerequisites: [], estimated_hours: 25, related_attribute: 'execution'
    },
    {
        id: 'da-sql', role_id: 'data-analyst', name: 'SQL para Análise', description: 'Consultas complexas, CTEs, window functions',
        category: 'Dados', level: 'basic', prerequisites: [], estimated_hours: 30, related_attribute: 'analytical'
    },
    {
        id: 'da-statistics', role_id: 'data-analyst', name: 'Estatística Descritiva', description: 'Medidas centrais, dispersão, distribuições, correlação',
        category: 'Análise', level: 'basic', prerequisites: [], estimated_hours: 20, related_attribute: 'analytical'
    },
    {
        id: 'da-visualization', role_id: 'data-analyst', name: 'Visualização de Dados', description: 'Power BI, Looker Studio, storytelling com dados',
        category: 'Análise', level: 'intermediate', prerequisites: ['da-sql'], estimated_hours: 25, related_attribute: 'communication'
    },
    {
        id: 'da-python-analysis', role_id: 'data-analyst', name: 'Python para Análise', description: 'pandas, matplotlib, seaborn, notebooks',
        category: 'Programação', level: 'intermediate', prerequisites: ['da-statistics'], estimated_hours: 30, related_attribute: 'execution'
    },
    {
        id: 'da-portfolio', role_id: 'data-analyst', name: 'Portfólio de Dados', description: 'Kaggle notebooks, dashboards públicos',
        category: 'Carreira', level: 'basic', prerequisites: [], estimated_hours: 15, related_attribute: 'communication'
    },
];

const DA_RESOURCES: SeedResource[] = [
    {
        id: 'bradesco-excel', title: 'Excel Avançado', provider: 'Fundação Bradesco', content_type: 'external_course',
        url: 'https://www.ev.org.br/cursos/microsoft-excel-2016-avancado', duration_hours: 15,
        platform_id: 'bradesco', skill_ids: ['da-excel'], active: true
    },
    {
        id: 'kaggle-sql', title: 'Intro to SQL — Kaggle', provider: 'Kaggle', content_type: 'external_course',
        url: 'https://www.kaggle.com/learn/intro-to-sql', duration_hours: 5, skill_ids: ['da-sql'], active: true
    },
    {
        id: 'khan-statistics', title: 'Estatística — Khan Academy', provider: 'Khan Academy', content_type: 'external_course',
        url: 'https://pt.khanacademy.org/math/statistics-probability', duration_hours: 20, skill_ids: ['da-statistics'], active: true
    },
    {
        id: 'google-looker', title: 'Looker Studio Tutorial', provider: 'Google', content_type: 'external_article',
        url: 'https://lookerstudio.google.com/overview', skill_ids: ['da-visualization'], active: true
    },
    {
        id: 'kaggle-viz', title: 'Data Visualization — Kaggle', provider: 'Kaggle', content_type: 'external_course',
        url: 'https://www.kaggle.com/learn/data-visualization', duration_hours: 4, skill_ids: ['da-python-analysis'], active: true
    },
    {
        id: 'yt-hashtag-powerbi', title: 'Power BI — Hashtag', provider: 'Hashtag Treinamentos', content_type: 'youtube',
        youtube_id: 'PLyqOvdQmGdTR46HKxHGMq2KzSdFJ05k_5', youtube_type: 'playlist',
        url: 'https://youtube.com/playlist?list=PLyqOvdQmGdTR46HKxHGMq2KzSdFJ05k_5', skill_ids: ['da-visualization'], active: true
    },
];

const DA_PHASES: SeedPhase[] = [
    {
        name: 'Fundamentos de Análise', weeks: 8, skills: ['da-excel', 'da-sql', 'da-statistics'],
        evidence: 'Dashboard em Google Sheets ou Looker Studio'
    },
    {
        name: 'Análise Avançada', weeks: 8, skills: ['da-visualization', 'da-python-analysis', 'da-portfolio'],
        evidence: 'Notebook Kaggle com análise exploratória publicada'
    },
];

// ═══ ALL ROLES ═══
const ROLES: SeedRole[] = [
    {
        id: 'data-engineer', name: 'Engenheiro de Dados', description: 'Projeta e mantém pipelines de dados, data warehouses e infraestrutura de dados.',
        category: 'Dados', demand_level: 'very_high', icon: '🏗️', active: true
    },
    {
        id: 'backend-developer', name: 'Desenvolvedor Backend', description: 'Constrói APIs, lógica de negócios e integrações server-side.',
        category: 'Dev', demand_level: 'very_high', icon: '⚙️', active: true
    },
    {
        id: 'frontend-developer', name: 'Desenvolvedor Frontend', description: 'Cria interfaces web interativas e responsivas.',
        category: 'Dev', demand_level: 'high', icon: '🎨', active: true
    },
    {
        id: 'ux-designer', name: 'UX Designer', description: 'Pesquisa, desenha e testa experiências de usuário.',
        category: 'Design', demand_level: 'high', icon: '🧩', active: true
    },
    {
        id: 'data-analyst', name: 'Analista de Dados', description: 'Analisa dados, cria relatórios e gera insights para decisões.',
        category: 'Dados', demand_level: 'very_high', icon: '📊', active: true
    },
];

// ═══ Map roles → data ═══
const ROLE_DATA: Record<string, { skills: SeedSkill[]; resources: SeedResource[]; phases: SeedPhase[] }> = {
    'data-engineer': { skills: DE_SKILLS, resources: DE_RESOURCES, phases: DE_PHASES },
    'backend-developer': { skills: BE_SKILLS, resources: BE_RESOURCES, phases: BE_PHASES },
    'frontend-developer': { skills: FE_SKILLS, resources: FE_RESOURCES, phases: FE_PHASES },
    'ux-designer': { skills: UX_SKILLS, resources: UX_RESOURCES, phases: UX_PHASES },
    'data-analyst': { skills: DA_SKILLS, resources: DA_RESOURCES, phases: DA_PHASES },
};

// ═══ Quest generation from resources ═══
function generateQuests(skills: SeedSkill[], resources: SeedResource[]): SeedQuest[] {
    const quests: SeedQuest[] = [];
    let idx = 0;
    for (const resource of resources) {
        const mainSkill = resource.skill_ids[0];
        const rtMap: Record<string, string> = {
            youtube: 'video', external_course: 'exercise',
            external_article: 'article', external_exercise: 'exercise',
        };
        quests.push({
            id: `quest-${resource.id}`,
            skill_id: mainSkill,
            title: `Estudar: ${resource.title}`,
            description: `Acesse ${resource.provider} e complete este recurso.`,
            resource_id: resource.id,
            resource_type: rtMap[resource.content_type] ?? 'article',
            estimated_minutes: (resource.duration_hours ?? 2) * 60 / 4, // split into ~4 sessions
            xp_reward: 30,
            difficulty: skills.find((s) => s.id === mainSkill)?.level === 'intermediate' ? 'intermediate' : 'beginner',
        });
        idx++;
    }
    return quests;
}

// ═══ Seed function ═══
export async function seedDatabase(supabase: SupabaseClient) {
    console.log('🌱 Seeding career data...');

    // 1. Insert roles
    const { error: rolesErr } = await supabase
        .from('roles')
        .upsert(ROLES, { onConflict: 'id' });
    if (rolesErr) console.error('Roles error:', rolesErr);
    else console.log(`✅ ${ROLES.length} roles`);

    // 2. Insert skills
    const allSkills = Object.values(ROLE_DATA).flatMap((d) => d.skills);
    const { error: skillsErr } = await supabase
        .from('skills')
        .upsert(allSkills, { onConflict: 'id' });
    if (skillsErr) console.error('Skills error:', skillsErr);
    else console.log(`✅ ${allSkills.length} skills`);

    // 3. Insert content_resources
    const allResources = Object.values(ROLE_DATA).flatMap((d) => d.resources);
    const { error: resErr } = await supabase
        .from('content_resources')
        .upsert(allResources, { onConflict: 'id' });
    if (resErr) console.error('Resources error:', resErr);
    else console.log(`✅ ${allResources.length} resources`);

    // 4. Insert quests
    const allQuests = Object.entries(ROLE_DATA).flatMap(([, d]) =>
        generateQuests(d.skills, d.resources)
    );
    const { error: questsErr } = await supabase
        .from('quests')
        .upsert(allQuests, { onConflict: 'id' });
    if (questsErr) console.error('Quests error:', questsErr);
    else console.log(`✅ ${allQuests.length} quests`);

    console.log('🌱 Seed complete!');
}

// Export for use in generator
export { ROLE_DATA, ROLES };
export type { SeedPhase };
