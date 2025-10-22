-- Migration to add project tags/categories support and update note type system
-- Projects can now have tags and categories like notes
-- Note types changed from boolean flags to single type field

-- Add category_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create project_tags junction table (many-to-many relationship for project tags)
CREATE TABLE IF NOT EXISTS project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

-- Add boolean columns if they don't exist (for backward compatibility)
ALTER TABLE notes ADD COLUMN IF NOT EXISTS isTask BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS isIdea BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS isList BOOLEAN DEFAULT false;

-- Add note_type column to notes table
-- Valid types: 'note', 'task', 'idea', 'list', 'prompt', 'question', 'reflection'
ALTER TABLE notes ADD COLUMN IF NOT EXISTS note_type TEXT DEFAULT 'note';

-- Add constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notes_note_type_check'
  ) THEN
    ALTER TABLE notes ADD CONSTRAINT notes_note_type_check CHECK (
      note_type IN ('note', 'task', 'idea', 'list', 'prompt', 'question', 'reflection')
    );
  END IF;
END $$;

-- Migrate existing data from boolean flags to note_type
-- Only update rows that don't have note_type set or are still 'note'
UPDATE notes
SET note_type = CASE
  WHEN isTask = true THEN 'task'
  WHEN isIdea = true THEN 'idea'
  WHEN isList = true THEN 'list'
  ELSE 'note'
END
WHERE note_type = 'note' OR note_type IS NULL;

-- Note: Keep the old boolean columns for now for backward compatibility
-- They can be removed in a future migration once the frontend is fully updated

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_project ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON notes(note_type);

-- Enable Row Level Security for project_tags
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_tags
CREATE POLICY "Users can view own project_tags"
  ON project_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project_tags"
  ON project_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project_tags"
  ON project_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE project_tags IS 'Junction table for many-to-many relationship between projects and tags';
COMMENT ON COLUMN projects.category_id IS 'Optional reference to category for project organization';
COMMENT ON COLUMN notes.note_type IS 'Type of note: note (default), task, idea, list, prompt, question, reflection';
