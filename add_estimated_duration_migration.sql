-- Migration to add estimated_hours and estimated_minutes columns
-- This adds optional duration tracking for notes (useful for tasks)

-- Add estimated_hours column (integer, nullable)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS estimated_hours INTEGER;

-- Add estimated_minutes column (integer, nullable, 0-59)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

-- Add check constraint to ensure minutes are between 0 and 59
ALTER TABLE notes ADD CONSTRAINT IF NOT EXISTS check_minutes_range
  CHECK (estimated_minutes IS NULL OR (estimated_minutes >= 0 AND estimated_minutes <= 59));

-- Add check constraint to ensure hours are non-negative
ALTER TABLE notes ADD CONSTRAINT IF NOT EXISTS check_hours_positive
  CHECK (estimated_hours IS NULL OR estimated_hours >= 0);
