# Match de Duplas 💚 — Guia de Configuração

Aplicação web tipo Tinder para encontrar duplas no formato Parlamentar Britânico (WUDC/BP).

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuito)
- Conta na [Vercel](https://vercel.com) para deploy (opcional)

---

## 1. Configurar o Supabase

### 1.1 Criar projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **Project URL** e a **anon public key** (em Settings → API)

### 1.2 Executar o schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Cole e execute o conteúdo de `supabase/schema.sql`
3. Isso cria as tabelas `profiles`, `swipes`, `matches`, os índices, as políticas RLS e o bucket de avatares

### 1.3 Habilitar autenticação por e-mail

1. Authentication → Providers → Email → certifique-se de que está **habilitado**
2. Em "Email confirmations": você pode **desabilitar** para facilitar testes, ou manter habilitado para produção

---

## 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com seus dados:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_EMAIL=seu-email-admin@email.com
```

> O `VITE_ADMIN_EMAIL` define qual conta tem acesso ao painel `/admin`.

---

## 3. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

---

## 4. Deploy na Vercel

### 4.1 Via CLI

```bash
npm i -g vercel
vercel
```

### 4.2 Via painel web

1. Conecte o repositório GitHub na Vercel
2. Em **Environment Variables**, adicione as três variáveis do `.env.local`
3. Deploy automático a cada push

---

## 5. Fluxo de uso

1. Acesse o link do app
2. Crie sua conta (e-mail + senha)
3. Preencha perfil: nome, sociedade, WhatsApp, posições
4. Deslize perfis compatíveis para direita (like) ou esquerda (passar)
5. Quando houver match mútuo → animação de match
6. Na aba "Matches" → botão para abrir WhatsApp direto

---

## 6. Algoritmo de compatibilidade

| Minha seleção | Vejo perfis de |
|---|---|
| Só Pontas (PM/LO/MG/MO) | Só Meios |
| Só Meios (DPM/DLO/GW/OW) | Só Pontas |
| Pontas + Meios | Qualquer um |
| Tanto faz | Todos |
| — | Tanto faz sempre aparece para todos |

---

## 7. Segurança dos dados

- WhatsApp só é acessível a quem tem **match confirmado** (políticas RLS do Supabase)
- Perfis inativos não aparecem na descoberta
- Swipes e matches têm restrição de unicidade no banco — impossível duplicar
- Upload de fotos restrito à pasta do próprio usuário

---

## 8. Painel administrativo

Acesse `/admin` com o e-mail definido em `VITE_ADMIN_EMAIL`.

Funcionalidades:
- Estatísticas: total de cadastros, ativos, matches, swipes
- Lista de participantes com toggle de ativo/inativo
