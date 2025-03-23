-- Safe incremental migration for production
-- This adds the archived column only if it doesn't exist
-- All existing records will be set to not archived (false)
-- This won't affect any existing data

-- Add archived column to notes table with default value of false
ALTER TABLE notes ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Update any NULL values to FALSE to ensure data consistency
UPDATE notes SET archived = FALSE WHERE archived IS NULL;
