-- Migration: Add start_date and end_date fields to notes
-- Useful for events and tasks with date ranges

-- Add start_date column
ALTER TABLE notes ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add end_date column
ALTER TABLE notes ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create indexes for better query performance when filtering by dates
CREATE INDEX IF NOT EXISTS idx_notes_start_date ON notes(start_date);
CREATE INDEX IF NOT EXISTS idx_notes_end_date ON notes(end_date);

-- Add comments for documentation
COMMENT ON COLUMN notes.start_date IS 'Start date for events or date-ranged tasks';
COMMENT ON COLUMN notes.end_date IS 'End date for events or date-ranged tasks';
