# Instruções para Corrigir a Tabela de Usuários

Se você está recebendo o erro:
```
Could not find the 'age' column of 'users' in the schema cache
```

Significa que a tabela `users` não possui todas as colunas necessárias.

## Solução

Execute o seguinte SQL no editor de SQL do Supabase:

1. Acesse https://app.supabase.com
2. Selecione seu projeto FreeFit
3. Vá para **SQL Editor** > **New Query**
4. Cole o conteúdo do arquivo `ALTER_USERS_TABLE.sql`
5. Clique em **Run**

Ou, copie e execute este código:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS imc DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS objective TEXT CHECK (objective IN ('weight_loss', 'muscle_gain', 'maintenance')),
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS gym_type TEXT CHECK (gym_type IN ('home', 'gym')),
ADD COLUMN IF NOT EXISTS equipments TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS available_time INTEGER,
ADD COLUMN IF NOT EXISTS target_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS has_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'semester', 'annual')),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
```

Depois disso, recarregue o aplicativo e tente fazer login novamente.

## Alternativa: Recriar do Zero

Se preferir, você pode também:
1. Ir em **Database** > **Tables** no Supabase
2. Deletar a tabela `users`
3. Executar o SQL completo do arquivo `SETUP_DATABASE.sql`

Mas primeiro execute o comando acima para adicionar as colunas faltantes.
