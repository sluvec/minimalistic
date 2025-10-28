-- Migration to add event and link types, checklists, and triage status system
-- This migration adds:
-- 1. 'event' and 'link' to note_type options
-- 2. Triage status system (New, Active, Done)
-- 3. Checklists as a new organizational unit

-- Add 'event' and 'link' to note_type constraint
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_note_type_check;
ALTER TABLE notes ADD CONSTRAINT notes_note_type_check CHECK (
  note_type IN ('note', 'task', 'idea', 'list', 'prompt', 'question', 'reflection', 'event', 'link')
);

-- Add triage_status column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS triage_status TEXT DEFAULT 'New';
ALTER TABLE notes ADD CONSTRAINT notes_triage_status_check CHECK (
  triage_status IN ('New', 'Active', 'Done')
);

-- Create checklists table (similar to projects but for task lists)
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8b5cf6',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add checklist_id column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS checklist_id UUID REFERENCES checklists(id) ON DELETE SET NULL;

-- Add is_checkable column to notes for tasks in checklists
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_checkable BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_checked BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_triage_status ON notes(triage_status);
CREATE INDEX IF NOT EXISTS idx_notes_checklist ON notes(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklists_user ON checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_project ON checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_checklists_space ON checklists(space_id);
CREATE INDEX IF NOT EXISTS idx_checklists_archived ON checklists(archived);

-- Enable Row Level Security for checklists
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- RLS policies for checklists
CREATE POLICY "Users can view own checklists"
  ON checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON checklists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists"
  ON checklists FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE checklists IS 'Checklists for organizing tasks, events, ideas, and links';
COMMENT ON COLUMN checklists.project_id IS 'Optional reference to parent project';
COMMENT ON COLUMN checklists.space_id IS 'Optional reference to parent space';
COMMENT ON COLUMN notes.checklist_id IS 'Optional reference to parent checklist';
COMMENT ON COLUMN notes.triage_status IS 'Triage status: New (default), Active, Done';
COMMENT ON COLUMN notes.is_checkable IS 'Whether this item can be checked off in a checklist';
COMMENT ON COLUMN notes.is_checked IS 'Whether this checkable item is checked';
COMMENT ON COLUMN notes.note_type IS 'Type of note: note, task, idea, list, prompt, question, reflection, event, link';
