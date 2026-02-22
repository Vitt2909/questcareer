---
description: Como rodar e testar o QuestCareer localmente
---

Para rodar e testar o projeto, siga estes passos:

### 1. Instalação
Certifique-se de ter o Node.js v20+ e o npm instalados.
```bash
npm install
```

### 2. Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com).
2. No menu **SQL Editor**, crie uma nova query e cole o conteúdo do arquivo `supabase/migrations/001_initial.sql`.
3. Clique em **Run** para criar todas as tabelas e políticas de segurança.

### 3. Variáveis de Ambiente
Crie ou edite o arquivo `.env.local` na raiz do projeto com as suas credenciais:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=um-secret-para-os-crons
ADMIN_EMAIL=seu-email@exemplo.com
```

### 4. Executando o Projeto
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse `http://localhost:3000`.

### 5. Populando os Dados (Seed)
// turbo
1. Faça login na aplicação como o usuário definido no seu `ADMIN_EMAIL`.
2. Acesse a rota `/admin/content`.
3. Clique no botão **"Executar Seed"**. Isso irá carregar as 8 plataformas, os planos de carreira e as quests iniciais.

### 6. Rodando os Testes
A plataforma utiliza o Vitest para garantir que o sistema de XP, Quizzes e Progressão estejam funcionando.
```bash
# Rodar todos os testes unitários
npm test

# Rodar testes em modo interativo
npx vitest
```

### 7. Verificando Saúde do Sistema
Acesse `http://localhost:3000/api/trpc/health` para confirmar se o servidor tRPC está respondendo corretamente.
