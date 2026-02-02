-- ============================================
-- ALTERAÇÕES PARA SUPORTAR ALTERNATIVAS DE EXERCÍCIO
-- ============================================

-- 1. Adicionar coluna image_url na tabela exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Criar tabela exercise_alternatives
CREATE TABLE IF NOT EXISTS exercise_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índice para buscar alternativas por exercício
CREATE INDEX IF NOT EXISTS idx_exercise_alternatives_exercise_id 
  ON exercise_alternatives(exercise_id);

-- 3. Adicionar colunas na tabela workout_exercises
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS selected_alternative_id UUID;
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Adicionar foreign key para alternative (opcional, caso queira manter integridade)
-- ALTER TABLE workout_exercises 
-- ADD CONSTRAINT fk_selected_alternative 
-- FOREIGN KEY (selected_alternative_id) REFERENCES exercise_alternatives(id) ON DELETE SET NULL;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_workout_exercises_completed 
  ON workout_exercises(workout_id, completed);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS nas novas/alteradas tabelas
ALTER TABLE exercise_alternatives ENABLE ROW LEVEL SECURITY;

-- Policy para exercise_alternatives - permitir ler (usuários podem ver alternativas)
CREATE POLICY "Allow read exercise_alternatives" 
  ON exercise_alternatives FOR SELECT 
  USING (true);

-- Policy para exercise_alternatives - permitir criar (para apps/admin)
CREATE POLICY "Allow insert exercise_alternatives" 
  ON exercise_alternatives FOR INSERT 
  WITH CHECK (true);

-- Policy para exercises - permitir insert de novos exercícios (para apps/admin)
DROP POLICY IF EXISTS "Allow insert exercises" ON exercises;
CREATE POLICY "Allow insert exercises" 
  ON exercises FOR INSERT 
  WITH CHECK (true);

-- Policy para workout_exercises - permitir update (para marcar como concluído)
DROP POLICY IF EXISTS "Allow update workout_exercises" ON workout_exercises;
CREATE POLICY "Allow update workout_exercises" 
  ON workout_exercises FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar estrutura das tabelas
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exercises';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exercise_alternatives';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'workout_exercises';
