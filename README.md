# MyFit - Aplicativo de Fitness Inteligente

MyFit é um webapp React de fitness moderno e completo, alimentado por inteligência artificial, que oferece treinos personalizados, rastreamento de progresso em tempo real e uma comunidade de usuários.

## 🎯 Funcionalidades Principais

### Treinos Personalizados
- **Questionário de Onboarding**: Coleta dados sobre objetivos, nível, equipamentos e tempo disponível
- **Geração com IA**: Cria treinos automaticamente baseado no perfil do usuário usando OpenRouter
- **Editor Completo**: Interface intuitiva para criar e editar treinos manualmente
- **Biblioteca de Exercícios**: Com instruções, vídeos e dicas de forma

### Rastreamento de Progresso
- **Gráficos em Tempo Real**: Visualize seu volume, frequência e tendências
- **Registros Detalhados**: Log automático de séries, repetições e peso
- **Estatísticas Avançadas**: Calorias queimadas, volume total e sequência de treinos

### Gerenciamento de Treinos
- **Séries Editáveis**: Ajuste reps, peso e descanso para cada série
- **Checklist de Séries**: Marque séries como completas durante o treino
- **Adição de Séries**: Adicione séries extras durante o treino
- **Inclusão/Remoção de Exercícios**: Customize seus treinos facilmente

### Conta e Segurança
- **Autenticação**: Login e cadastro com Supabase
- **Deletar Conta**: Opção para remover permanentemente seu perfil
- **Planos de Assinatura**: Mensal, Semestral e Anual
- **Integrações**: Apple Health e Apple Watch (prototipado)

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **IA**: OpenRouter (Llama 2)
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast
- **Roteamento**: React Router v7

## 📋 Requisitos

- Node.js 18.17.1+
- npm 9.6.7+
- Conta no Supabase
- API Key do OpenRouter

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/myfit.git
cd myfit
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

## 📱 Páginas e Recursos

### Não Autenticado
- **Landing Page**: Apresentação do app com features e pricing
- **Login/Signup**: Autenticação com email

### Autenticado
- **Onboarding**: Questionário para personalização
- **Dashboard**: Visão geral de treinos e progresso
- **Criar/Editar Treino**: Editor completo com exercícios e séries
- **IA Workout**: Gerar treinos automáticos com IA
- **Progresso**: Gráficos e estatísticas
- **Configurações**: Gerenciamento de perfil e assinatura

## 🎨 Design

**Cores Principais:**
- `#001317` - Preto/Azul escuro
- `#00fff3` - Ciano vibrante

**Design Mobile-First**: Responsivo para todos os dispositivos

## 📊 Estrutura de Dados

### User
- Informações pessoais (idade, peso, altura, IMC calculado automaticamente)
- Objetivo (emagrecimento, ganho muscular, manutenção)
- Nível de experiência
- Local de treino (casa/academia)
- Equipamentos disponíveis
- Tempo disponível para treinar
- Plano de assinatura

### Workout
- Nome e descrição
- Duração
- Dificuldade
- Lista de exercícios com séries
- Dias de descanso
- Flag de template/IA

### Exercise
- Nome e descrição
- Grupo muscular
- Instruções passo a passo
- Dicas de forma
- Links para vídeos/GIFs
- Equipamentos necessários

### WorkoutExercise
- Exercício associado ao treino
- Ordem de execução
- Séries com reps, peso e descanso ajustáveis
- Status de completação

### ProgressLog
- Data do treino
- Exercício realizado
- Séries completadas
- Repetições e peso
- Duração
- Calorias queimadas

## 🔐 Segurança

- Autenticação via Supabase Auth
- RLS (Row Level Security) no Supabase para proteção de dados
- Senhas criptografadas
- Tokens JWT para sessões
- Deletar conta com confirmação segura

## 📈 Planos de Assinatura

| Plano | Preço | Benefícios |
|-------|-------|-----------|
| Mensal | R$ 49,90 | Treinos ilimitados, análise de progresso |
| Semestral | R$ 149,00 | Tudo + IA avançada, exportação de dados |
| Anual | R$ 99,00 | Tudo + Apple Health, versão Watch, desafios |

## 🔄 Fluxo de Usuário

1. **Landing Page** → Visualizar features e benefits
2. **Signup/Login** → Criar conta ou entrar
3. **Onboarding** → Responder questionário (gênero, idade, peso, objetivo, etc.)
4. **Dashboard** → Visão geral de treinos e progresso
5. **Criar Treino** → Manualmente ou com IA
6. **Executar Treino** → Marcar séries, ajustar peso/reps
7. **Acompanhar Progresso** → Visualizar gráficos e estatísticas
8. **Gerenciar Conta** → Configurações e assinatura

## 🚧 Roadmap Futuro

- [ ] Versão App (React Native)
- [ ] Integração com Apple HealthKit
- [ ] Versão Apple Watch
- [ ] Comunidade/Forum
- [ ] Compartilhamento de treinos
- [ ] Desafios diários/semanais
- [ ] Biblioteca de treinos prontos
- [ ] Análise de forma com IA (via câmera)
- [ ] Notificações push
- [ ] Sincronização em tempo real

## 📝 Scripts npm

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Lint com ESLint
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🙋 Suporte

Para suporte, abra uma issue no repositório GitHub.

## 💡 Créditos

- Desenvolvido com ❤️ usando React, Tailwind CSS e Supabase
- IA powered by OpenRouter (Llama 2)
- UI Components inspirados em modern design patterns

---

**Última atualização**: Fevereiro 2026

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
