# 🚀 Guia Completo de Setup - MyFit

## Status Atual ✅

- ✅ Projeto scaffolding completo
- ✅ Todas as dependências instaladas
- ✅ TypeScript type-checking passou com sucesso
- ✅ Componentes e páginas implementados
- ✅ Autenticação context configurado
- ✅ Serviços prontos (Supabase, OpenRouter, Workouts)

**Próximos passos**: Configurar Supabase + OpenRouter + Rodar desenvolvimento

---

## 1️⃣ Pré-requisitos

```
✓ Node.js 18.17.1+ (instalado)
✓ npm 9.6.7+ (instalado)
✓ Git (para controle de versão)
□ Conta no Supabase (CRIAR)
□ API Key do OpenRouter (OBTER)
```

---

## 2️⃣ Configurar Supabase

### A. Criar Projeto

1. Acesse https://supabase.com
2. Clique em "Create new project"
3. Preencha:
   - **Project Name**: `freefit` (ou seu nome)
   - **Database Password**: Salve com segurança
   - **Region**: Escolha a mais próxima
4. Aguarde criação (~2 minutos)

### B. Obter Credenciais

1. No dashboard, vá para **Settings** → **API**
2. Copie:
   - `VITE_SUPABASE_URL` (Project URL)
   - `VITE_SUPABASE_ANON_KEY` (anon public)

### C. Criar Tabelas

No Supabase, vá para **SQL Editor** e execute:

```sql
-- Tabela de usuários (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  age INT CHECK (age >= 16 AND age <= 100),
  gender VARCHAR(20),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  imc DECIMAL(5,2),
  objective VARCHAR(50),
  experience_level VARCHAR(50),
  gym_type VARCHAR(20),
  equipments JSONB DEFAULT '[]',
  available_time INT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de exercícios
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  muscle_group VARCHAR(100),
  difficulty VARCHAR(50),
  equipment JSONB DEFAULT '[]',
  video_url TEXT,
  gif_url TEXT,
  instructions JSONB DEFAULT '[]',
  tips JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de treinos
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT,
  difficulty VARCHAR(50),
  rest_days JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exercícios dentro de um treino
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  order_index INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Séries dos exercícios
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_number INT,
  reps INT,
  weight DECIMAL(6,2),
  rest_time INT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Log de progresso
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id),
  exercise_id UUID REFERENCES exercises(id),
  date DATE DEFAULT CURRENT_DATE,
  sets_completed INT,
  total_sets INT,
  weight DECIMAL(6,2),
  reps INT,
  duration INT,
  calories_burned INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Desafios
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  target_value INT,
  reward_points INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas de RLS para workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de RLS para progress_logs
CREATE POLICY "Users can view own logs"
  ON progress_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs"
  ON progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Exercícios são públicos (leitura apenas)
CREATE POLICY "Everyone can read exercises"
  ON exercises FOR SELECT
  USING (true);

-- Índices para performance
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_progress_logs_user_id ON progress_logs(user_id);
CREATE INDEX idx_progress_logs_date ON progress_logs(date);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
```

---

## 3️⃣ Configurar OpenRouter

### A. Criar Conta e API Key

1. Acesse https://openrouter.ai
2. Faça sign up (gratuito)
3. Vá para **Account** → **API Keys**
4. Copie a chave (começa com `sk-`)

### B. Adicionar Créditos (Opcional)

- Contas gratuitas têm limite de $5/mês
- Para testes, é suficiente
- Para produção, adicione pagamento

---

## 4️⃣ Configurar Variáveis de Ambiente

Na raiz do projeto, crie `.env.local`:

```bash
# Copiar do .env.example
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
VITE_OPENROUTER_API_KEY=sk-sua-api-key-aqui
```

⚠️ **NÃO commit `.env.local`** (já está em .gitignore)

---

## 5️⃣ Rodar o Projeto

### Desenvolvimento

```bash
npm run dev
```

Abra http://localhost:5173 no navegador

### Type-check

```bash
npm run build
```

### Lint (verificar erros)

```bash
npm run lint
```

---

## 6️⃣ Testar Fluxos

### 1. Landing Page (Sem Login)
- ✅ Deve aparecer hero com features e pricing
- ✅ Botões "Login" e "Começar" funcionam

### 2. Signup
- ✅ Criar novo usuário com email/senha
- ✅ Deve redirecionar para onboarding

### 3. Onboarding
- ✅ 7 passos funcionam
- ✅ Equipamentos aparecem apenas para "home"
- ✅ Dados salvam no Supabase

### 4. Dashboard
- ✅ Estatísticas carregam
- ✅ Botões "Novo Treino" e "Gerar com IA"

### 5. Treino com IA
- ✅ Seleciona duração
- ✅ OpenRouter gera treino
- ✅ Pode salvar treino

### 6. Editor de Treino
- ✅ Adiciona exercícios
- ✅ Série é editável (reps, peso, descanso)
- ✅ Pode remover série/exercício

### 7. Settings
- ✅ Editar perfil
- ✅ Ver planos de assinatura
- ✅ Deletar conta com confirmação

### 8. Progresso
- ✅ Gráficos carregam
- ✅ Histórico de treinos aparece

---

## 7️⃣ Dados de Teste

Para popular com exercícios, você pode:

### Opção 1: SQL (Rápido)
```sql
INSERT INTO exercises (name, description, muscle_group, difficulty, equipment, instructions, tips)
VALUES
  ('Supino Reto', 'Exercício fundamental para peito', 'Peito', 'Intermediate', '["barbell", "bench"]', '["Deite-se no banco", "Pressione a barra para cima"]', '["Respiração controlada"]'),
  ('Agachamento', 'Exercício para pernas', 'Pernas', 'Intermediate', '["barbell"]', '["De pé com pés afastados", "Desça controlado"]', '["Joelhos apontando para fora"]'),
  ('Rosca Direta', 'Exercício para bíceps', 'Bíceps', 'Beginner', '["dumbbell"]', '["Em pé com halteres", "Flexione os cotovelos"]', '["Evite balanço do corpo"]');
```

### Opção 2: Arquivo CSV
1. Crie `exercises.csv` com estrutura de dados
2. Use import do Supabase

### Opção 3: Aplicação Web
Criar página admin para adicionar exercícios (futura)

---

## 8️⃣ Troubleshooting

### Erro: "Cannot find module @supabase"
```bash
npm install
```

### Erro: "VITE_SUPABASE_URL is not defined"
- Verificar `.env.local` existe
- Não cometeu `.env.local` acidentalmente?
- Reiniciar `npm run dev`

### Erro: "User not found"
- Verificar tabela `profiles` tem RLS corretamente
- Verificar usuário criado no `auth.users`

### Erro: "OpenRouter API Error"
- Verificar chave API está válida
- Verificar créditos disponíveis
- Verificar modelo "llama-2-70b" está disponível

### Build falha com "Node.js 18"
- TypeScript check OK: `npm run build` ✅
- Vite build requer Node 20+: `npm run build:full` ❌
- Para produção, usar Node 20+

---

## 9️⃣ Estrutura de Pastas

```
FreeFit/
├── src/
│   ├── components/          # Componentes React
│   │   └── ExerciseItem.tsx
│   ├── context/             # Context API
│   │   └── AuthContext.tsx
│   ├── hooks/               # Custom Hooks (vazio, para expandir)
│   ├── pages/               # Páginas/Telas
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── WorkoutEditor.tsx
│   │   ├── AIWorkoutPage.tsx
│   │   ├── ProgressPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/            # Serviços de API
│   │   ├── supabaseClient.ts
│   │   ├── aiService.ts
│   │   └── workoutService.ts
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   ├── assets/
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── data/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── App.css
├── public/
├── .env.example
├── .env.local               # NÃO COMMITAR
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🔟 Próximos Passos

### Imediato
- [ ] Criar contas Supabase + OpenRouter
- [ ] Configurar .env.local
- [ ] Criar tabelas no Supabase
- [ ] Rodar `npm run dev`
- [ ] Testar signup/login/onboarding

### Curto Prazo
- [ ] Popular exercícios (500+)
- [ ] Testar geração com IA
- [ ] Refinar UI/UX
- [ ] Adicionar animações

### Médio Prazo
- [ ] Apple Health integration
- [ ] Apple Watch version
- [ ] Community forum
- [ ] Payment integration

### Longo Prazo
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Offline support
- [ ] Analytics

---

## ✅ Checklist de Deploy

Antes de colocar em produção:

- [ ] Build com `npm run build:full` em Node 20+
- [ ] Testar em staging
- [ ] Criptografar .env.local
- [ ] Configurar CORS no Supabase
- [ ] Adicionar domínio autorizado
- [ ] Testar pagamento (Stripe)
- [ ] Backup do banco de dados

---

**Dúvidas?** Verifique os documentos:
- [Supabase Docs](https://supabase.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

**Sucesso! 🚀**
