-- Performance Optimization: Database Indexes for Notes Table
-- Run this SQL in Supabase SQL Editor

-- Index for user_id and archived (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_notes_user_archived
ON notes(user_id, archived);

-- Index for sorting by updated_at (descending order for recent notes first)
CREATE INDEX IF NOT EXISTS idx_notes_updated_at
ON notes(updated_at DESC);

-- Index for filtering by due_date (only for notes with due dates)
CREATE INDEX IF NOT EXISTS idx_notes_due_date
ON notes(due_date)
WHERE due_date IS NOT NULL;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_notes_status
ON notes(status)
WHERE status IS NOT NULL;

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_notes_category
ON notes(category)
WHERE category IS NOT NULL;

-- Composite index for common query pattern: user + archived + updated_at
CREATE INDEX IF NOT EXISTS idx_notes_user_archived_updated
ON notes(user_id, archived, updated_at DESC);

-- Index for tags using GIN (Generalized Inverted Index) for array searches
CREATE INDEX IF NOT EXISTS idx_notes_tags
ON notes USING GIN (tags);

-- Analyze the table to update statistics
ANALYZE notes;

-- Verify indexes were created
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'notes'
ORDER BY
    indexname;
