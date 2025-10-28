# Database Migrations Guide

## Automatic Migration Process

This project uses Supabase for database management. All migrations should be executed **automatically** using the Supabase CLI.

## Prerequisites

### Required Credentials (stored in .env)
```bash
SUPABASE_DB_PASSWORD=2i_VGp@FqDzj42$
SUPABASE_ACCESS_TOKEN=sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb
```

### Supabase CLI Installation
```bash
# macOS
brew install supabase/tap/supabase

# or via npm
npm install -g supabase
```

## Standard Migration Workflow

### 1. Create a New Migration

```bash
# Create a new migration file
supabase migration new <description>

# Example:
supabase migration new add_user_preferences
```

This creates a file in `supabase/migrations/` with format: `YYYYMMDDHHMMSS_description.sql`

### 2. Write Your SQL Migration

Edit the created file in `supabase/migrations/` with your SQL changes:

```sql
-- Example migration
ALTER TABLE notes ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(archived);
```

### 3. Push Migration to Database (AUTOMATIC)

**Always use this command with stored credentials:**

```bash
SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN \
supabase db push --password "$SUPABASE_DB_PASSWORD"
```

Or with inline credentials:

```bash
SUPABASE_ACCESS_TOKEN=sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb \
supabase db push --password '2i_VGp@FqDzj42$'
```

### 4. Verify Migration

```bash
# List all migrations (local and remote)
SUPABASE_ACCESS_TOKEN=sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb \
supabase migration list --password '2i_VGp@FqDzj42$'

# Should show:
# Local          | Remote         | Time (UTC)
# 20251028000000 | 20251028000000 | 2025-10-28 00:00:00 ✓
```

## Migration Best Practices

### Always Use IF EXISTS / IF NOT EXISTS

```sql
-- ✅ GOOD: Safe migrations
ALTER TABLE notes ADD COLUMN IF NOT EXISTS new_field TEXT;
CREATE INDEX IF NOT EXISTS idx_notes_field ON notes(new_field);
DROP TABLE IF EXISTS old_table;

-- ❌ BAD: Will fail if already exists
ALTER TABLE notes ADD COLUMN new_field TEXT;
CREATE INDEX idx_notes_field ON notes(new_field);
```

### Include Comments

```sql
-- Migration: Add user preferences
-- Description: Adds user_preferences table for storing app settings

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE user_preferences IS 'User application preferences and settings';
```

### Always Add RLS Policies

```sql
-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
```

## Common Migration Scenarios

### Adding a New Table

```sql
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_user ON new_table(user_id);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own records"
  ON new_table FOR SELECT
  USING (auth.uid() = user_id);
```

### Adding a Column

```sql
-- Add new column with default value
ALTER TABLE notes ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add constraint
ALTER TABLE notes ADD CONSTRAINT notes_priority_check
  CHECK (priority IN ('low', 'normal', 'high'));

-- Add index if needed for filtering
CREATE INDEX IF NOT EXISTS idx_notes_priority ON notes(priority);
```

### Modifying a Constraint

```sql
-- Drop old constraint
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_status_check;

-- Add new constraint with more options
ALTER TABLE notes ADD CONSTRAINT notes_status_check
  CHECK (status IN ('draft', 'published', 'archived', 'deleted'));
```

## Troubleshooting

### Migration Failed - Password Error

```bash
# Verify password is correct in .env
echo $SUPABASE_DB_PASSWORD

# Try with explicit password
supabase db push --password 'YOUR_PASSWORD_HERE'
```

### Migration Already Applied

```bash
# Check migration status
supabase migration list --password "$SUPABASE_DB_PASSWORD"

# If showing as applied remotely but not locally, pull from remote
supabase db pull --password "$SUPABASE_DB_PASSWORD"
```

### Need to Rollback

Supabase doesn't support automatic rollback. You need to create a new "reverse" migration:

```sql
-- Original migration: 20251028000000_add_field.sql
ALTER TABLE notes ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Rollback migration: 20251028000100_remove_field.sql
ALTER TABLE notes DROP COLUMN IF EXISTS new_field;
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to Git (already in .gitignore)
- Database password is sensitive - store securely
- Access token has limited permissions - renew if compromised
- Always test migrations on local/staging before production

## Quick Reference

```bash
# Create new migration
supabase migration new <name>

# Push to database (AUTOMATIC - USE THIS)
SUPABASE_ACCESS_TOKEN=sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb \
supabase db push --password '2i_VGp@FqDzj42$'

# List migrations
supabase migration list --password '2i_VGp@FqDzj42$'

# Pull schema from remote
supabase db pull --password '2i_VGp@FqDzj42$'
```

## Helper Scripts (Optional)

You can add these to `package.json` for convenience:

```json
{
  "scripts": {
    "db:push": "SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN supabase db push --password \"$SUPABASE_DB_PASSWORD\"",
    "db:pull": "SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN supabase db pull --password \"$SUPABASE_DB_PASSWORD\"",
    "db:list": "SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN supabase migration list --password \"$SUPABASE_DB_PASSWORD\"",
    "db:new": "supabase migration new"
  }
}
```

Then use:
```bash
npm run db:push    # Push migrations
npm run db:pull    # Pull schema
npm run db:list    # List migrations
npm run db:new add_feature  # Create new migration
```

---

**Last Updated**: 2025-10-28
**Project**: Minimalistic Notes App
