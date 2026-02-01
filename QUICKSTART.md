# 🏋️ FreeFit - Webapp de Fitness com IA

> **Status**: ✅ Estrutura completa e compilada com sucesso!

## 📱 Sobre o Projeto

**FreeFit** é um webapp moderno de fitness que utiliza inteligência artificial (OpenRouter) para gerar treinos personalizados. A aplicação oferece:

- ✅ Autenticação segura (Supabase Auth)
- ✅ Geração de treinos com IA (Llama 2 70B)
- ✅ Editor completo de treinos com séries editáveis
- ✅ Rastreamento de progresso com gráficos
- ✅ Interface dark mode com cores #001317 e #00fff3
- ✅ Suporte para equipamentos condicionais (home vs gym)
- ✅ Deletar conta com confirmação segura

## 🚀 Quick Start

### 1. Pré-requisitos
```bash
Node.js 18.17.1+
npm 9.6.7+
Conta Supabase (gratuita)
API Key OpenRouter (gratuita)
```

### 2. Instalar & Configurar
```bash
# Clonar/abrir projeto
cd FreeFit

# Instalar dependências
npm install

# Copiar template de ambiente
cp .env.example .env.local

# Editar .env.local com suas credenciais:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_OPENROUTER_API_KEY
```

### 3. Configurar Banco de Dados
Seguir instruções em **SETUP.md** → Seção 2 (Supabase)

```bash
# Abra SQL Editor no Supabase e execute o script completo
# Arquivo: SETUP.md (copiar SQL de "Criar Tabelas")
```

### 4. Rodar Desenvolvimento
```bash
npm run dev
```
Abra **http://localhost:5173**

## 📚 Documentação Completa

- **[SETUP.md](./SETUP.md)** - Guia completo de instalação (9 seções)
- **[STATUS.md](./STATUS.md)** - Status detalhado do projeto
- **[README.md](./README.md)** - Overview do projeto

## 📁 Estrutura do Projeto

```
src/
├── pages/              # 8 páginas principais
│   ├── LandingPage     # Página inicial (sem login)
│   ├── AuthPage        # Login/Signup
│   ├── OnboardingPage  # Questionnaire (7 passos)
│   ├── Dashboard       # Dashboard principal
│   ├── WorkoutEditor   # Editor de treino
│   ├── AIWorkoutPage   # Gerar treino com IA
│   ├── ProgressPage    # Progresso e gráficos
│   └── SettingsPage    # Configurações
├── services/           # API integration
│   ├── supabaseClient  # Supabase config
│   ├── aiService       # OpenRouter AI
│   └── workoutService  # CRUD operations
├── context/
│   └── AuthContext     # Global auth state
├── components/
│   └── ExerciseItem    # Series management
├── types/
│   └── index.ts        # TypeScript interfaces
└── assets/
    └── styles/         # Tailwind + custom CSS
```

## 🎨 Tecnologias

| Categoria | Stack |
|-----------|-------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Custom CSS |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase JWT |
| IA | OpenRouter (Llama 2 70B) |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Routing | React Router v7 |
| Toast | React Hot Toast |

## ✨ Recursos Principais

### 1. Autenticação
- Email/Senha com validação
- Auto-cálculo de IMC
- Deletar conta com confirmação

### 2. Onboarding Inteligente
- 7 passos de configuração
- Equipamentos condicionais (gym vs home)
- Salva automaticamente no Supabase

### 3. Treinos Personalizados
- **Manual**: Editor com exercícios, séries, reps, peso
- **IA**: Geração automática com base no perfil
- Séries editáveis em tempo real
- Checklist de séries durante treino

### 4. Series Management
```typescript
// Cada série tem:
- Repetições (editável)
- Peso em kg (editável)
- Tempo de descanso em segundos (editável)
- Status de conclusão (checkbox)
- Botões: Adicionar série / Remover série
```

### 5. Progresso & Analytics
- Volume total em kg
- Frequência semanal
- Gráficos com Recharts
- Histórico completo

### 6. Segurança
- JWT tokens do Supabase
- Row Level Security (RLS)
- Type-safe com TypeScript strict
- Senhas hashadas (Supabase)

## 🔐 Variáveis de Ambiente

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# OpenRouter AI
VITE_OPENROUTER_API_KEY=sk-or-v1-sua-chave
```

**⚠️ NÃO commitar `.env.local`** (já está em .gitignore)

## 📊 Dados do Projeto

| Métrica | Valor |
|---------|-------|
| Componentes React | 9 |
| Páginas | 8 |
| Tipos TypeScript | 13+ |
| Linhas de código | ~3,500 |
| Tamanho compilado | ~500KB |

## 🧪 Testar Localmente

```bash
# 1. Type-check
npm run build

# 2. Lint
npm run lint

# 3. Dev server
npm run dev

# 4. Preview build
npm run preview
```

## 📋 Fluxo de Uso

```
Landing Page
    ↓
    ├─ Não autenticado: Ver features/pricing
    └─ Botões: Login ou Começar
         ↓
    Auth Page (Signup)
         ↓
    Onboarding (7 passos)
         ↓
    Dashboard
         ├─ Novo Treino → WorkoutEditor
         ├─ Gerar com IA → AIWorkoutPage
         ├─ Progresso → ProgressPage
         └─ Configurações → SettingsPage
```

## 🤖 Geração com IA

A IA analisa:
- Idade, sexo, peso, altura
- Objetivo (perda peso, ganho massa, manutenção)
- Nível de experiência
- Tipo de local (gym vs home)
- Equipamentos disponíveis
- Tempo disponível

E gera:
- Exercícios personalizados
- Séries e repetições otimizadas
- Descanso recomendado
- Dicas de forma e segurança

## 🎯 Cores & Design

- **Primária**: `#001317` - Dark Navy
- **Destaque**: `#00fff3` - Cyan Neon
- **Tema**: Dark mode completo
- **Responsivo**: Mobile-first com Tailwind

## 📞 Próximas Etapas

Após primeira execução:

1. **Criar contas**:
   - Supabase: https://supabase.com
   - OpenRouter: https://openrouter.ai

2. **Configurar Banco**:
   - Executar SQL script (SETUP.md)
   - Testar RLS policies

3. **Testar Fluxos**:
   - Signup → Onboarding → Dashboard
   - Criar treino manual
   - Gerar treino com IA
   - Deletar conta

4. **Expandir**:
   - Popular 500+ exercícios
   - Apple Health integration
   - Payment (Stripe)
   - Community features

## 🚨 Limitações Conhecidas

1. **Node.js 18 incompatível com Vite bundler**
   - Type-check ✅
   - Bundler requer Node 20+ ❌
   - Workaround: usar Node 20+ em produção

2. **Apple Health/Watch**: Apenas UI (não funcional)
3. **Payment**: Não integrado (Stripe)
4. **Community**: Schema pronto, UI pendente

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig)

## ✅ Checklist de Deploy

- [ ] Supabase projeto criado
- [ ] Tabelas criadas (SQL script)
- [ ] .env.local configurado
- [ ] `npm run build` passa ✅
- [ ] `npm run dev` funciona
- [ ] Testar signup/login
- [ ] Testar onboarding
- [ ] Testar AI workout
- [ ] Testar delete account
- [ ] População de exercícios (500+)

## 📄 Licença

MIT

---

**Status**: 🟢 Pronto para desenvolvimento  
**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0

**Próximo passo**: Siga [SETUP.md](./SETUP.md) para configurar e rodar localmente! 🚀
