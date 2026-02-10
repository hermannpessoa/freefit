-- Create exercises table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises
-- Everyone can view default exercises (user_id is null)
CREATE POLICY "Everyone can view default exercises"
  ON exercises FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can insert their own custom exercises
CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom exercises
CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own custom exercises
CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);
