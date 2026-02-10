# 🐛 Como Corrigir o Problema do Onboarding

## ⚡ Solução Mais Rápida - Use o Painel de Debug

1. **Acesse a rota de debug:**
   ```
   http://localhost:5173/debug
   ```

2. **Clique nos botões:**
   - **"Verificar Perfil"** - Vê o estado atual do seu perfil
   - **"Corrigir Onboarding"** - Marca onboarding como completo
   - **"Limpar Cache"** - Limpa localStorage

3. **Pronto!** A página recarregará e você irá direto para o dashboard

---

## 🔧 Por que o MCP não funciona?

O arquivo `.mcp.json` está configurado corretamente:

```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=tdyrysmjbogtldiiuzhp"
    }
  }
}
```

**Mas as ferramentas MCP não estão disponíveis porque:**

1. **Autenticação ausente**: O servidor MCP do Supabase precisa de credenciais (Service Role Key) que não estão configuradas
2. **Ambiente Claude Code**: Nem todos os servidores MCP externos são carregados automaticamente
3. **Limitações de segurança**: Servidores HTTP MCP podem ter restrições

### Como configurar MCP (se necessário no futuro):

O MCP do Supabase precisa de configuração adicional no `.mcp.json`:

```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "params": {
        "project_ref": "tdyrysmjbogtldiiuzhp",
        "service_role_key": "sua-service-role-key-aqui"
      }
    }
  }
}
```

⚠️ **NUNCA commite a Service Role Key no git!**

---

## 📋 Alternativas Implementadas

Como o MCP não está funcionando, criei 3 soluções:

### 1. Painel de Debug React (✅ RECOMENDADO)
- **Acesse:** http://localhost:5173/debug
- Interface visual para corrigir o problema
- Não precisa de SQL ou console

### 2. Script de Console JavaScript
- **Arquivo:** `scripts/fix-onboarding.js`
- **Como usar:**
  1. Abra o console (F12)
  2. Cole o conteúdo do arquivo
  3. Pressione Enter

### 3. SQL Direto no Supabase
- **Arquivo:** `database/fix-onboarding-status.sql`
- **Como usar:**
  1. Acesse: https://app.supabase.com/project/tdyrysmjbogtldiiuzhp/sql
  2. Cole e execute o SQL

---

## 🎯 Qual Usar?

- **Mais fácil:** Painel de Debug (opção 1)
- **Mais rápido:** Script de Console (opção 2)
- **Mais direto:** SQL no Supabase (opção 3)

---

## 📊 O que foi feito?

### Arquivos criados:
1. `src/pages/Debug/DebugPanel.jsx` - Componente React visual
2. `src/pages/Debug/DebugPanel.css` - Estilos
3. `scripts/fix-onboarding.js` - Script de console
4. `database/fix-onboarding-status.sql` - Queries SQL

### Arquivos modificados:
1. `src/App.jsx` - Adicionada rota `/debug`
2. `src/contexts/AppContext.jsx` - Logs de debug adicionados
3. `src/pages/Onboarding/OnboardingPage.jsx` - Validação mais rigorosa

### Logs de Debug:
Quando você recarregar a página, verá no console:
- 🔄 AppContext: Carregando estado do usuário...
- ✅ Sessão encontrada: [user_id]
- 📊 Profile do Supabase: [dados]
- 🎯 onboarding_completed: [true/false]

Isso ajuda a identificar exatamente onde está o problema.

---

## ✅ Próximos Passos

1. Acesse `/debug`
2. Clique em "Corrigir Onboarding"
3. Aguarde recarregar
4. Seu problema estará resolvido!

Se ainda não funcionar, me envie os logs do console (🔄, ✅, 📊, 🎯).
