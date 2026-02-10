-- Criar tabela de exercícios se não existir

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  equipment JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT NOT NULL,
  primary_muscles JSONB DEFAULT '[]'::jsonb,
  secondary_muscles JSONB DEFAULT '[]'::jsonb,
  type TEXT,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  tips JSONB DEFAULT '[]'::jsonb,
  demo_image TEXT,
  demo_video TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_is_custom ON exercises(is_custom);
