-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  goal TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_workout_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  instructions TEXT,
  tips TEXT,
  video_url TEXT,
  equipment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'mixed')),
  duration_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  exercises JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create progress_logs table
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  duration_minutes INTEGER,
  calories_burned INTEGER,
  exercises_completed JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can create own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can view own progress" ON public.progress_logs;
DROP POLICY IF EXISTS "Users can create own progress" ON public.progress_logs;
DROP POLICY IF EXISTS "Users can update own progress" ON public.progress_logs;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for exercises table (public read)
CREATE POLICY "Anyone can view exercises" ON public.exercises
  FOR SELECT USING (true);

-- RLS Policies for workouts table
CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for progress_logs table
CREATE POLICY "Users can view own progress" ON public.progress_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON public.progress_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.progress_logs
  FOR UPDATE USING (auth.uid() = user_id);
