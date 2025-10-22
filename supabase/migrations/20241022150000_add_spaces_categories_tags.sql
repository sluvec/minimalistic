-- Migration to add spaces, categories, and tags management
-- This adds structured organization with spaces as top-level containers

-- Create spaces table (top-level organization containers)
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📁',
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create categories table (for organizing notes by category)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10b981',
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create tags table (for tagging notes)
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Add space_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;

-- Add space_id and category_id to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES spaces(id) ON DELETE SET NULL;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create note_tags junction table (many-to-many relationship)
-- Note: notes.id is bigint, not UUID
CREATE TABLE IF NOT EXISTS note_tags (
  note_id BIGINT REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (note_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_spaces_user ON spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_archived ON spaces(archived);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_archived ON categories(archived);
CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_archived ON tags(archived);
CREATE INDEX IF NOT EXISTS idx_projects_space ON projects(space_id);
CREATE INDEX IF NOT EXISTS idx_notes_space ON notes(space_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);

-- Enable Row Level Security
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for spaces
CREATE POLICY "Users can view own spaces"
  ON spaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaces"
  ON spaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spaces"
  ON spaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spaces"
  ON spaces FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for tags
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for note_tags
CREATE POLICY "Users can view own note_tags"
  ON note_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own note_tags"
  ON note_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own note_tags"
  ON note_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_tags.note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE spaces IS 'Top-level organizational containers that can hold projects, notes, and tasks';
COMMENT ON TABLE categories IS 'Categories for organizing notes by type or topic';
COMMENT ON TABLE tags IS 'Tags for flexible note organization and filtering';
COMMENT ON TABLE note_tags IS 'Junction table for many-to-many relationship between notes and tags';
COMMENT ON COLUMN projects.space_id IS 'Optional reference to parent space';
COMMENT ON COLUMN notes.space_id IS 'Optional reference to parent space (can be direct or through project)';
COMMENT ON COLUMN notes.category_id IS 'Optional reference to category';
