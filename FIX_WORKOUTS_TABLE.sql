-- Verificar e corrigir a tabela workouts

-- Adicionar coluna exercises se não existir
ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '[]';

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS image TEXT;

ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS duration INTEGER;

ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS rest_days INTEGER[] DEFAULT ARRAY[]::INTEGER[];

ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;

-- Renomear colunas se necessário (title -> name, difficulty -> ...)
-- Isso será feito manualmente via Supabase dashboard se necessário

-- Confirmar estrutura
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'workouts'
ORDER BY ordinal_position;
