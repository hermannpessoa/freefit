-- Add training_days column to users table
ALTER TABLE users ADD COLUMN training_days INTEGER DEFAULT 4 CHECK (training_days >= 1 AND training_days <= 7);
