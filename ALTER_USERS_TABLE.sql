-- Add missing columns to users table for onboarding data
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
