# QuestCareer Pilot 🎮

Plataforma de desenvolvimento de carreira gamificada para estudantes.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** (Auth + Postgres + Storage)
- **tRPC v11** + React Query
- **Zod** para validação

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

## Testes 🧪

A plataforma utiliza o **Vitest** para testes unitários.

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch
npx vitest

# Gerar coverage
npx vitest run --coverage
```

Localização dos testes: `tests/unit/core.test.ts`

## Admin & Conteúdo 🛠️

1. Faça login com o email configurado em `ADMIN_EMAIL`.
2. Acesse `/admin` para ver o dashboard de métricas.
3. Vá em `/admin/content` e clique em **"Executar Seed"** para popular o banco com as plataformas, roles, skills e quests iniciais.

## Funcionalidades Pilot v0.1

- [x] **Avaliação de Perfil:** Quiz inicial para descobrir interesses.
- [x] **Plano de Carreira:** Geração de trilhas personalizadas.
- [x] **Quests Gamificadas:** YouTube Player integrado e Quests externas.
- [x] **Sistema de XP:** Níveis, medalhas e bônus de streak.
- [x] **Admin Dashboard:** Visão de alunos, feedback e acompanhamento.
- [x] **Segurança:** Rate limiting e conformidade LGPD.

## Licença

Uso interno — piloto escolar.

