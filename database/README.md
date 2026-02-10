# 🗄️ Database Setup Guide - MyFit AI

## Ordem de Execução no Supabase

Execute os arquivos SQL nesta ordem no Supabase SQL Editor:

### 1. Setup Principal
📄 **database/complete-setup.sql**
- Cria tabela `profiles` com onboarding
- Cria tabela `workouts`
- Cria tabela `workout_history`
- Cria tabela `progress_records`
- Cria tabela `subscriptions`
- Cria tabela `exercises`
- Configura RLS (Row Level Security)
- Cria triggers automáticos

### 2. Tabelas de Lookup
📄 **database/migrations/004_create_lookup_tables.sql**
- Cria `exercise_categories` (chest, back, arms, etc)
- Cria `equipment_types` (barbell, dumbbells, etc)
- Cria `difficulty_levels` (beginner, intermediate, advanced)
- Cria `muscle_groups` (pectoralis, biceps, etc)
- Cria `workout_categories` (strength, cardio, hiit, etc)
- Popula todas as tabelas com dados

### 3. Seed de Exercícios
📄 **database/seed-exercises.sql** (gerado automaticamente)
- Popula tabela `exercises` com 45+ exercícios
- Contém descrições, steps, tips, vídeos

## 📝 Passo a Passo

### 1. Acesse o Supabase SQL Editor
```
https://app.supabase.com/project/tdyrysmjbogtldiiuzhp/sql
```

### 2. Execute complete-setup.sql
1. Copie TODO o conteúdo de `database/complete-setup.sql`
2. Cole no SQL Editor
3. Clique em **RUN** ou pressione `Ctrl+Enter`
4. Verifique se não há erros

### 3. Execute lookup tables
1. Copie TODO o conteúdo de `database/migrations/004_create_lookup_tables.sql`
2. Cole no SQL Editor
3. Clique em **RUN**
4. Verifique que as tabelas foram populadas

### 4. Execute seed de exercícios
1. Copie TODO o conteúdo de `database/seed-exercises.sql`
2. Cole no SQL Editor
3. Clique em **RUN**
4. Aguarde (pode demorar ~30 segundos)

### 5. Desabilite confirmação de email (Desenvolvimento)
1. Vá em: **Authentication → Settings**
2. Desabilite **"Enable email confirmations"**
3. Salve

## ✅ Verificação

Execute estes queries para verificar:

```sql
-- Verificar profiles
SELECT COUNT(*) FROM profiles;

-- Verificar exercises
SELECT category, COUNT(*) as count
FROM exercises
WHERE user_id IS NULL
GROUP BY category
ORDER BY category;

-- Verificar lookup tables
SELECT 'Categories' as table_name, COUNT(*) as count FROM exercise_categories
UNION ALL
SELECT 'Equipment', COUNT(*) FROM equipment_types
UNION ALL
SELECT 'Difficulties', COUNT(*) FROM difficulty_levels
UNION ALL
SELECT 'Muscle Groups', COUNT(*) FROM muscle_groups
UNION ALL
SELECT 'Workout Categories', COUNT(*) FROM workout_categories;

-- Verificar workouts (deve estar vazia)
SELECT COUNT(*) FROM workouts;
```

## 📊 Estrutura do Banco

```
profiles (usuários)
  ├─ onboarding_completed
  ├─ onboarding_data
  └─ stats (streak, xp, level)

exercises (banco de exercícios)
  ├─ default exercises (user_id = NULL)
  └─ custom exercises (user_id != NULL)

workouts (treinos dos usuários)
  ├─ exercises[]
  └─ metadata

workout_history (histórico)
  └─ completed workouts

progress_records (progresso)
  └─ PRs e records

Lookup Tables:
  ├─ exercise_categories
  ├─ equipment_types
  ├─ difficulty_levels
  ├─ muscle_groups
  └─ workout_categories
```

## 🔐 Security (RLS)

Todas as tabelas têm Row Level Security habilitado:

- **profiles**: Usuários só veem/editam próprio perfil
- **workouts**: Usuários só veem/editam próprios treinos
- **exercises**: Todos veem default, usuários editam custom
- **workout_history**: Usuários só veem próprio histórico
- **Lookup tables**: Todos têm acesso de leitura

## 🚀 Depois do Setup

1. Crie uma nova conta no app
2. Complete o onboarding
3. Crie um treino
4. Execute o treino
5. Verifique o histórico

## 🐛 Troubleshooting

### "relation does not exist"
Execute os SQL files na ordem correta

### "permission denied"
Verifique se as políticas RLS foram criadas

### Perfil não criado ao registrar
Execute o trigger SQL:
```sql
SELECT public.handle_new_user();
```

### Exercises vazios
1. Execute `database/seed-exercises.sql`
2. Aguarde conclusão
3. Recarregue o app

## 📞 Suporte

Qualquer problema, verifique:
1. Console do navegador (F12)
2. Logs do Supabase
3. Estrutura das tabelas
