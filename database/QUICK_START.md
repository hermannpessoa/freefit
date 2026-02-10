# 🚀 Execução Rápida - Supabase Setup

## ⚡ Execute nesta ordem:

### 1️⃣ Primeiro: Setup Principal
**Arquivo:** `database/EXECUTE_FIRST.sql`

```bash
# Acesse:
https://app.supabase.com/project/tdyrysmjbogtldiiuzhp/sql

# Copie TODO o conteúdo de database/EXECUTE_FIRST.sql
# Cole no SQL Editor e clique em RUN
```

✅ Cria todas as tabelas
✅ Configura RLS e policies
✅ Cria triggers automáticos

---

### 2️⃣ Segundo: Seed de Exercícios
**Arquivo:** `database/seed-exercises.sql`

```bash
# No mesmo SQL Editor
# Copie TODO o conteúdo de database/seed-exercises.sql
# Cole e clique em RUN
# ⏳ Aguarde ~30 segundos
```

✅ Popula 45+ exercícios

---

### 3️⃣ Terceiro: Lookup Tables
**Arquivo:** `database/migrations/004_create_lookup_tables.sql`

```bash
# No mesmo SQL Editor
# Copie TODO o conteúdo de database/migrations/004_create_lookup_tables.sql
# Cole e clique em RUN
```

✅ Popula categorias, equipamentos, níveis, grupos musculares

---

### 4️⃣ Quarto: Desabilitar Confirmação de Email (Dev)

```bash
# Acesse:
https://app.supabase.com/project/tdyrysmjbogtldiiuzhp/auth/settings

# Authentication → Settings
# Desabilite "Enable email confirmations"
# Salve
```

✅ Permite login imediato sem confirmar email

---

## ✅ Verificação Rápida

Execute no SQL Editor:

```sql
-- Ver tabelas criadas
SELECT
  'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercises WHERE user_id IS NULL
UNION ALL
SELECT 'Categories', COUNT(*) FROM exercise_categories
UNION ALL
SELECT 'Equipment', COUNT(*) FROM equipment_types
UNION ALL
SELECT 'Difficulties', COUNT(*) FROM difficulty_levels;
```

**Resultado esperado:**
- Profiles: 0 (normal, usuários criam ao registrar)
- Exercises: 45+
- Categories: 8
- Equipment: 14
- Difficulties: 4

---

## 🎉 Pronto!

Agora:
1. Recarregue o app: http://localhost:5173
2. Crie uma conta
3. Complete onboarding
4. Crie um treino
5. Divirta-se! 🏋️

---

## 🐛 Problemas?

### Erro: relation does not exist
Execute EXECUTE_FIRST.sql primeiro

### Exercises vazios
Execute seed-exercises.sql

### Perfil não criado
O trigger cria automaticamente. Se não funcionar:
```sql
-- Manual para usuário existente
INSERT INTO profiles (id, email, onboarding_completed)
SELECT id, email, false
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```
