# Configurando Variáveis de Ambiente (.env)

## Para Desenvolvimento Local

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo `.env.local` (NÃO será commitado):

```bash
cp .env.example .env.local
```

### 2. Adicionar suas credenciais em `.env.local`

```dotenv
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
VITE_OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
```

### 3. ⚠️ SEGURANÇA

**NUNCA commit `.env.local` com credenciais reais!**

- ✅ `.gitignore` já inclui `.env.local`
- ✅ Somente `.env.example` é commitado
- ✅ Compartilhe `.env.example` com a equipe
- ✅ Cada desenvolvedor tem seu próprio `.env.local`

---

## Para Produção (EasyPanel)

### 1. No EasyPanel Dashboard

1. Vá até seu projeto **FreeFit**
2. Clique em **Environment Variables** ou **Settings**
3. Adicione cada variável:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
VITE_OPENROUTER_API_KEY = sk-or-v1-...
```

### 2. Obtendo as Credenciais

#### Supabase:
1. Acesse https://supabase.com
2. Selecione seu projeto FreeFit
3. Vá para **Project Settings** → **API**
4. Copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

#### OpenRouter:
1. Acesse https://openrouter.ai
2. Vá para **Account** → **API Keys**
3. Crie uma nova chave ou copie a existente
4. Cole em `VITE_OPENROUTER_API_KEY`

### 3. Deploy

Após adicionar as variáveis:
1. Clique em **Rebuild** ou **Redeploy**
2. EasyPanel vai usar essas variáveis no build
3. Vite vai injetar os valores no bundle

---

## Variáveis Disponíveis

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | ✅ Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ Sim | Chave pública Supabase (anon) |
| `VITE_OPENROUTER_API_KEY` | ✅ Sim | Chave API OpenRouter |
| `VITE_OPENROUTER_MODEL` | ❌ Não | Modelo a usar (padrão: llama-2-70b) |

---

## Checklist de Segurança

- ✅ `.env.local` está em `.gitignore`
- ✅ Nunca fazer commit de credenciais reais
- ✅ Usar `VITE_` prefix para variáveis do frontend (visíveis no cliente)
- ✅ Usar prefix sem `VITE_` para variáveis privadas (não compiladas no bundle)
- ✅ Regenerar chaves se houver vazamento
- ✅ Revisar credenciais regularmente
- ✅ Usar chaves específicas por ambiente (dev/prod)

---

## Troubleshooting

### "Erro: VITE_SUPABASE_URL not defined"

**Causa**: Variável não configurada.

**Solução**:
1. No EasyPanel, adicione `VITE_SUPABASE_URL`
2. Refaça o deploy
3. Verifique se a variável aparece em **Environment Variables**

### App fica em loading infinito

**Causa**: Credenciais Supabase incorretas ou incompletas.

**Solução**:
1. Verifique console do navegador (F12 → Console)
2. Procure por erro de autenticação Supabase
3. Confirme `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Teste localmente com `.env.local`

### "Cannot generate workout" (erro na IA)

**Causa**: `VITE_OPENROUTER_API_KEY` incorreta ou sem saldo.

**Solução**:
1. Verifique a chave em https://openrouter.ai/account/keys
2. Confirme que tem créditos disponíveis
3. Teste a chave via curl:
   ```bash
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

---

## Arquivo `.env.local` (Local)

**Exemplo completo:**

```dotenv
# Supabase
VITE_SUPABASE_URL=https://pfllkawlbyeigeaeutbi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenRouter
VITE_OPENROUTER_API_KEY=sk-or-v1-abc123def456...

# Opcional: Especificar modelo
VITE_OPENROUTER_MODEL=llama-2-70b
```

**Não commitar este arquivo!** ⚠️

---

## Para Colaboradores

1. Clone o repositório
2. Copie `.env.example` para `.env.local`
3. Preencha com suas credenciais
4. Nunca commite `.env.local`
5. Compartilhe `.env.example` atualizado se adicionar nova variável

```bash
# Setup rápido
cp .env.example .env.local
# ... edite .env.local com suas credenciais
npm install
npm run dev
```

---

## Links de Referência

- [Variáveis de Ambiente Vite](https://vitejs.dev/guide/env-and-modes.html)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [OpenRouter API](https://openrouter.ai/docs)
- [EasyPanel Environment Variables](https://docs.easypanel.io/)
```bash
1. Ir em https://openrouter.ai
2. Copiar API Key
```

### Passo 3: Preencher .env.local (2 min)
```bash
# Abrir o arquivo .env.local na raiz do projeto
# Substituir os valores placeholder pelos reais:

VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-real
VITE_OPENROUTER_API_KEY=sk-sua-chave-real
```

### Passo 4: Refresh Browser (1 min)
```bash
F5 ou Cmd+R para recarregar
```

---

## 📍 Localizando .env.local

Arquivo está na **raiz do projeto**:

```
FreeFit/
├── .env.local          ← Este arquivo
├── .env.example
├── src/
├── package.json
├── vite.config.ts
└── ...
```

---

## 🔒 Segurança

- ✅ `.env.local` está em `.gitignore`
- ✅ Não será commitado no Git
- ✅ Seus dados estão seguros
- ⚠️ Nunca compartilhe `.env.local` ou credenciais

---

## ✨ O que Você Vai Ver Depois

Após preencher `.env.local` com credenciais reais:

1. **Landing Page** → Mesma visual (sem mudanças)
2. **Click "Começar"** → Redireciona para signup
3. **Signup** → Cria usuário no Supabase
4. **Onboarding** → 7 passos para configurar perfil
5. **Dashboard** → Painel com estatísticas
6. **Criar Treino** → Editor funcional
7. **Gerar com IA** → OpenRouter cria treinos personalizados
8. **Progresso** → Gráficos e rastreamento
9. **Configurações** → Editar perfil, deletar conta

---

## 🔗 Links Úteis

- **[SETUP.md](./SETUP.md)** - Guia completo (seções 2-4)
- **[Supabase Docs](https://supabase.com/docs)** - Documentação
- **[OpenRouter API](https://openrouter.ai/docs)** - API Docs

---

## 💡 Próximas Ações

1. **Abra [SETUP.md](./SETUP.md)** - Seção 2 (Supabase)
2. **Crie conta Supabase**
3. **Crie account OpenRouter**
4. **Edite .env.local**
5. **Refresh browser**
6. **Teste signup!**

---

## 🎯 Resumo

| Status | Descrição |
|--------|-----------|
| ✅ App Rodando | Vite está servindo o app |
| ✅ Landing Page OK | Visual perfeito, layout funciona |
| ✅ Hot Reload OK | Edite código e veja mudanças em tempo real |
| ❌ Auth Não Funciona | Precisa de Supabase credentials |
| ❌ Database Não Funciona | Precisa de Supabase credentials |
| ❌ IA Não Funciona | Precisa de OpenRouter API key |

---

**Status**: 🟡 App rodando visualmente (credenciais pendentes)

**Próxima ação**: Siga [SETUP.md](./SETUP.md) para configurar Supabase + OpenRouter

**Tempo estimado**: 15-20 minutos até funcionalidade completa ⏱️

---

*Aproveite! Seu MyFit está pronto para desenvolvimento! 💪*
