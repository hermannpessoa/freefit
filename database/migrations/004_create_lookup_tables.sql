-- ========================================
-- LOOKUP TABLES FOR MYFIT AI
-- ========================================

-- Exercise Categories
CREATE TABLE IF NOT EXISTS exercise_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types
CREATE TABLE IF NOT EXISTS equipment_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requires_gym BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Difficulty Levels
CREATE TABLE IF NOT EXISTS difficulty_levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  level_number INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Muscle Groups
CREATE TABLE IF NOT EXISTS muscle_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  category TEXT, -- primary, secondary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workout Categories
CREATE TABLE IF NOT EXISTS workout_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- SEED DATA
-- ========================================

-- Exercise Categories
INSERT INTO exercise_categories (id, name, name_pt, description, icon, color) VALUES
('chest', 'Chest', 'Peito', 'Exercícios para peitoral', '💪', '#FF6B6B'),
('back', 'Back', 'Costas', 'Exercícios para costas', '🦾', '#4ECDC4'),
('shoulders', 'Shoulders', 'Ombros', 'Exercícios para ombros', '🏋️', '#95E1D3'),
('arms', 'Arms', 'Braços', 'Exercícios para bíceps e tríceps', '💪', '#F38181'),
('legs', 'Legs', 'Pernas', 'Exercícios para pernas', '🦵', '#AA96DA'),
('core', 'Core', 'Core', 'Exercícios para abdômen e core', '🔥', '#FCBAD3'),
('cardio', 'Cardio', 'Cardio', 'Exercícios cardiovasculares', '🏃', '#A8D8EA'),
('flexibility', 'Flexibility', 'Flexibilidade', 'Alongamentos e mobilidade', '🧘', '#FFFFD2')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_pt = EXCLUDED.name_pt,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Equipment Types
INSERT INTO equipment_types (id, name, name_pt, description, icon, requires_gym) VALUES
('barbell', 'Barbell', 'Barra', 'Barra olímpica ou standard', '🏋️', true),
('dumbbells', 'Dumbbells', 'Halteres', 'Halteres de diversos pesos', '💪', false),
('bench', 'Bench', 'Banco', 'Banco de musculação', '🪑', true),
('cable', 'Cable Machine', 'Cabo/Polia', 'Máquina de cabo ou crossover', '⚙️', true),
('machine', 'Machine', 'Máquina', 'Máquinas de musculação', '🎰', true),
('bodyweight', 'Bodyweight', 'Peso Corporal', 'Sem equipamento necessário', '🤸', false),
('resistance-band', 'Resistance Band', 'Faixa Elástica', 'Faixas de resistência', '🎗️', false),
('kettlebell', 'Kettlebell', 'Kettlebell', 'Kettlebell russo', '🫙', false),
('pull-up-bar', 'Pull-up Bar', 'Barra Fixa', 'Barra para pull-ups', '🚪', false),
('dip-station', 'Dip Station', 'Paralelas', 'Estação de fundos', '⚖️', true),
('ez-bar', 'EZ Bar', 'Barra W', 'Barra ondulada para rosca', '〰️', true),
('trx', 'TRX', 'TRX', 'Suspension trainer', '🪢', false),
('medicine-ball', 'Medicine Ball', 'Bola Medicinal', 'Bola com peso', '⚽', false),
('foam-roller', 'Foam Roller', 'Rolo de Espuma', 'Para liberação miofascial', '🌀', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_pt = EXCLUDED.name_pt,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requires_gym = EXCLUDED.requires_gym;

-- Difficulty Levels
INSERT INTO difficulty_levels (id, name, name_pt, description, level_number, color) VALUES
('beginner', 'Beginner', 'Iniciante', 'Para quem está começando', 1, '#4CAF50'),
('intermediate', 'Intermediate', 'Intermediário', 'Requer experiência básica', 2, '#FF9800'),
('advanced', 'Advanced', 'Avançado', 'Para praticantes experientes', 3, '#F44336'),
('expert', 'Expert', 'Expert', 'Nível profissional', 4, '#9C27B0')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_pt = EXCLUDED.name_pt,
  description = EXCLUDED.description,
  level_number = EXCLUDED.level_number,
  color = EXCLUDED.color;

-- Muscle Groups
INSERT INTO muscle_groups (id, name, name_pt, description, category) VALUES
-- Primary Muscles
('pectoralis-major', 'Pectoralis Major', 'Peitoral Maior', 'Músculo principal do peito', 'primary'),
('latissimus-dorsi', 'Latissimus Dorsi', 'Grande Dorsal', 'Músculo das costas', 'primary'),
('deltoids', 'Deltoids', 'Deltóides', 'Músculos dos ombros', 'primary'),
('biceps-brachii', 'Biceps Brachii', 'Bíceps', 'Músculo frontal do braço', 'primary'),
('triceps-brachii', 'Triceps Brachii', 'Tríceps', 'Músculo posterior do braço', 'primary'),
('quadriceps', 'Quadriceps', 'Quadríceps', 'Músculos frontais da coxa', 'primary'),
('hamstrings', 'Hamstrings', 'Posteriores de Coxa', 'Músculos posteriores da coxa', 'primary'),
('glutes', 'Glutes', 'Glúteos', 'Músculos do quadril', 'primary'),
('calves', 'Calves', 'Panturrilhas', 'Músculos da panturrilha', 'primary'),
('abs', 'Abdominals', 'Abdominais', 'Músculos abdominais', 'primary'),
('obliques', 'Obliques', 'Oblíquos', 'Músculos laterais do abdômen', 'primary'),
('lower-back', 'Lower Back', 'Lombar', 'Eretores da espinha', 'primary'),
('traps', 'Trapezius', 'Trapézio', 'Músculos do pescoço/costas superiores', 'primary'),
-- Secondary Muscles
('forearms', 'Forearms', 'Antebraços', 'Músculos dos antebraços', 'secondary'),
('serratus', 'Serratus', 'Serrátil', 'Músculo lateral do tronco', 'secondary'),
('hip-flexors', 'Hip Flexors', 'Flexores do Quadril', 'Músculos do quadril', 'secondary'),
('adductors', 'Adductors', 'Adutores', 'Músculos internos da coxa', 'secondary'),
('abductors', 'Abductors', 'Abdutores', 'Músculos externos da coxa', 'secondary')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_pt = EXCLUDED.name_pt,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Workout Categories
INSERT INTO workout_categories (id, name, name_pt, description, icon, color) VALUES
('strength', 'Strength', 'Força', 'Treinos de musculação', '💪', '#FF6B6B'),
('cardio', 'Cardio', 'Cardio', 'Treinos cardiovasculares', '🏃', '#4ECDC4'),
('hiit', 'HIIT', 'HIIT', 'Treinos intervalados de alta intensidade', '⚡', '#F38181'),
('flexibility', 'Flexibility', 'Flexibilidade', 'Alongamento e mobilidade', '🧘', '#95E1D3'),
('functional', 'Functional', 'Funcional', 'Treinos funcionais', '🤸', '#AA96DA'),
('powerlifting', 'Powerlifting', 'Powerlifting', 'Treinos de força máxima', '🏋️', '#FF5252'),
('bodybuilding', 'Bodybuilding', 'Bodybuilding', 'Hipertrofia muscular', '💎', '#7C4DFF'),
('crossfit', 'CrossFit', 'CrossFit', 'Treinos CrossFit', '🔥', '#FF6E40'),
('calisthenics', 'Calisthenics', 'Calistenia', 'Treinos com peso corporal', '🤸', '#00BCD4')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_pt = EXCLUDED.name_pt,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Enable RLS on all tables (optional, since they're mostly read-only)
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read lookup tables
CREATE POLICY "Public read access" ON exercise_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON equipment_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON difficulty_levels FOR SELECT USING (true);
CREATE POLICY "Public read access" ON muscle_groups FOR SELECT USING (true);
CREATE POLICY "Public read access" ON workout_categories FOR SELECT USING (true);
