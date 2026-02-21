# QuestCareer Pilot 🎮

Plataforma de desenvolvimento de carreira gamificada para estudantes.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** (Auth + Postgres + Storage)
- **tRPC v11** + React Query
- **Zod** para validação
- **Vercel** para deploy

## Setup em 5 Passos

### 1. Clone e instale

```bash
git clone <repo-url>
cd questcareer
npm install
```

### 2. Configure as variáveis de ambiente

Copie `.env.local` e preencha os valores:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=um-secret-qualquer
ADMIN_EMAIL=admin@email.com
```

> **Opcionais:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`

### 3. Configure o banco de dados

1. Abra o **Supabase SQL Editor**
2. Copie e cole o conteúdo de `supabase/migrations/001_initial.sql`
3. Execute

### 4. Configure Auth no Supabase

1. Vá em **Authentication > Providers**
2. Ative **Email** (já vem ativo)
3. Para **Google OAuth**:
   - Crie um projeto no [Google Cloud Console](https://console.cloud.google.com)
   - Configure OAuth 2.0 com redirect URI: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
   - Cole Client ID e Secret no Supabase

### 5. Rode localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Verificação

- **Healthcheck tRPC:** GET `/api/trpc/health` → `{ "result": { "data": { "ok": true } } }`
- **Login:** `/login` com email/senha ou Google
- **Banco:** Todas as tabelas, RLS policies e triggers criados

## Estrutura do Projeto

```
src/
├── app/            # Rotas Next.js (App Router)
├── components/     # Componentes reutilizáveis
├── lib/            # Utilitários (Supabase, tRPC, analytics, seeds)
├── modules/        # Módulos de domínio (assessment, career, execution, progress, notifications)
├── types/          # TypeScript types
└── middleware.ts   # Auth guard, rate limiting
```

## Deploy na Vercel

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente no painel
3. O `vercel.json` já configura os crons automaticamente

## Licença

Uso interno — piloto escolar.
