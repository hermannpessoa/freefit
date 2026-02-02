-- Fix workouts foreign key constraint
-- This script drops the incorrect constraint and recreates it correctly

-- First, check current constraints:
-- SELECT constraint_name, table_name, column_name 
-- FROM information_schema.key_column_usage 
-- WHERE table_name='workouts';

-- Drop the incorrect constraint if it exists
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS "workouts_user_id_fkey";

-- Recreate the correct constraint
ALTER TABLE workouts 
ADD CONSTRAINT workouts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
