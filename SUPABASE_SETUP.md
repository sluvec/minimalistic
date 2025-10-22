# Supabase Migrations Setup

## One-time Setup (3 commands)

### Step 1: Login to Supabase CLI
```bash
supabase login
```
This will open your browser to authenticate. Login and then return to terminal.

### Step 2: Get your Project Reference ID

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > General
4. Copy your "Reference ID" (looks like: `abcdefghijklmnop`)

### Step 3: Link your project
```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```
Replace `YOUR_PROJECT_REF_ID` with the actual ID from Step 2.

Example:
```bash
supabase link --project-ref abcdefghijklmnop
```

---

## Running Migrations (Every time you need to update DB)

After the one-time setup above, just run:

```bash
npm run db:push
```

This will apply all migrations from `supabase/migrations/` to your database.

---

## Creating New Migrations

To create a new migration:

```bash
supabase migration new your_migration_name
```

This creates a new timestamped SQL file in `supabase/migrations/`

Then edit the file and add your SQL, for example:
```sql
ALTER TABLE notes ADD COLUMN new_field TEXT;
```

Then run:
```bash
npm run db:push
```

---

## Troubleshooting

### "Project not linked"
Run: `supabase link --project-ref YOUR_PROJECT_REF_ID`

### "Permission denied"
Make sure you're logged in: `supabase login`

### "Migration already applied"
Migrations are tracked automatically. If you want to reset: `npm run db:reset` (⚠️ WARNING: This deletes all data!)

---

## Current Migration

The migration `20241022_add_estimated_duration.sql` adds:
- `estimated_hours` column (INTEGER)
- `estimated_minutes` column (INTEGER)
- Check constraints for valid values

Run `npm run db:push` to apply it now!
