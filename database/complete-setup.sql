-- Complete Database Setup for MyFit AI
-- Execute this in Supabase SQL Editor: https://app.supabase.com/project/tdyrysmjbogtldiiuzhp/sql

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar TEXT,
  streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add onboarding fields if they don't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 4. Enable Row Level Security if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 6. Create RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 7. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, onboarding_completed, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Verify the setup
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 10. Create exercises table
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
  video_url TEXT,
  gif_url TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create indexes for exercises
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);

-- 12. Enable RLS for exercises
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies for exercises
DROP POLICY IF EXISTS "Everyone can view default exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

CREATE POLICY "Everyone can view default exercises"
  ON exercises FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- LOOKUP TABLES
-- ========================================

-- 14. Exercise Categories
CREATE TABLE IF NOT EXISTS exercise_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Equipment Types
CREATE TABLE IF NOT EXISTS equipment_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requires_gym BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Difficulty Levels
CREATE TABLE IF NOT EXISTS difficulty_levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  level_number INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Muscle Groups
CREATE TABLE IF NOT EXISTS muscle_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Workout Categories
CREATE TABLE IF NOT EXISTS workout_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_pt TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Enable RLS on lookup tables
ALTER TABLE exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_categories ENABLE ROW LEVEL SECURITY;

-- 20. Public read policies for lookup tables
CREATE POLICY "Public read" ON exercise_categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON equipment_types FOR SELECT USING (true);
CREATE POLICY "Public read" ON difficulty_levels FOR SELECT USING (true);
CREATE POLICY "Public read" ON muscle_groups FOR SELECT USING (true);
CREATE POLICY "Public read" ON workout_categories FOR SELECT USING (true);

-- 21. Seed lookup data (run migrations/004_create_lookup_tables.sql for full seed)
