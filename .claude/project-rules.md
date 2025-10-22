# Project Rules & Automation Guidelines

## Database Migrations - ALWAYS AUTOMATE

### When creating database migrations:

1. **Create migration file** in `supabase/migrations/` with timestamp format:
   - Format: `YYYYMMDDHHMMSS_description.sql`
   - Example: `20241022143000_add_projects.sql`

2. **Use PostgreSQL built-in functions**:
   - ✅ Use `gen_random_uuid()` for UUID generation (PostgreSQL 13+)
   - ❌ Avoid `uuid_generate_v4()` (requires uuid-ossp extension)

3. **ALWAYS run migration automatically** after creating it:
   ```bash
   SUPABASE_ACCESS_TOKEN=<token> supabase db push
   ```
   - If migration already exists, repair first:
   ```bash
   SUPABASE_ACCESS_TOKEN=<token> supabase migration repair --status reverted <version>
   ```
   - Then push again

4. **Verify migration success**:
   - Run `node create-projects-table.js` or similar verification script
   - Check that tables/columns were created successfully

5. **NEVER ask user to run migrations manually**:
   - Access token should be stored in environment variable: `SUPABASE_ACCESS_TOKEN`
   - Never commit access tokens to git
   - Always use it for automated migrations
   - Token should be set in CI/CD secrets for automation

## Git Workflow

1. **Commit after migrations**:
   - Always commit migration files
   - Include descriptive commit message
   - Push to GitHub immediately

2. **Commit message format**:
   ```
   <type>: <description>

   <detailed changes>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

## Development Workflow

1. **Always use TodoWrite** for multi-step tasks:
   - Plan tasks at the beginning
   - Update status as you progress
   - Mark completed immediately after finishing

2. **Test locally before pushing**:
   - Check `npm run dev` output for errors
   - Use curl to verify server is responding
   - Run verification scripts if available

3. **Deployment**:
   - Push to GitHub automatically triggers Vercel deployment
   - No manual deployment steps needed

## Supabase-Specific Rules

1. **Connection Info**:
   - Project Ref: `fowscvbexfryuaqvuqtz`
   - URL: `https://fowscvbexfryuaqvuqtz.supabase.co`
   - Access Token: `sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb`

2. **Migration Best Practices**:
   - Always use `IF NOT EXISTS` for table creation
   - Always use `IF EXISTS` for drops
   - Include RLS policies in migration
   - Add indexes for foreign keys
   - Use proper constraints (CHECK, UNIQUE, etc.)

3. **RLS Pattern**:
   ```sql
   ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own <table>"
     ON <table> FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own <table>"
     ON <table> FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own <table>"
     ON <table> FOR UPDATE
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own <table>"
     ON <table> FOR DELETE
     USING (auth.uid() = user_id);
   ```

## File Organization

1. **Migrations**: `supabase/migrations/`
2. **Pages**: `src/pages/`
3. **Components**: `src/components/`
4. **API utilities**: `src/api/`
5. **Helper scripts**: Root directory (e.g., `create-projects-table.js`)

## Code Standards

1. **React Components**:
   - Use functional components with hooks
   - PropTypes for type checking
   - Consistent styling with inline styles or existing patterns

2. **Database queries**:
   - Always use Supabase client from `src/lib/supabaseClient`
   - Handle errors properly
   - Use RLS for security (don't bypass with service role key in frontend)

3. **Routing**:
   - Protected routes check for session
   - Lazy load pages for code splitting
   - Use Navigate for redirects

## Automation Scripts

### Migration Verification
```bash
node create-projects-table.js
```
- Checks if tables exist
- Shows current state
- Provides helpful instructions

### Database Push
```bash
SUPABASE_ACCESS_TOKEN=sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb supabase db push
```
- Always answer "Y" to prompts (use `echo "Y" |` prefix)
- Repair migration history if needed
- Verify success after push

## Environment Variables

Current `.env` structure:
```
VITE_SUPABASE_URL=https://fowscvbexfryuaqvuqtz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## Common Issues & Solutions

### Issue: Migration already exists
**Solution**:
```bash
SUPABASE_ACCESS_TOKEN=<token> supabase migration repair --status reverted <version>
SUPABASE_ACCESS_TOKEN=<token> supabase db push
```

### Issue: UUID function not found
**Solution**: Use `gen_random_uuid()` instead of `uuid_generate_v4()`

### Issue: Access token not found
**Solution**: Set environment variable:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_19cf52856f7e2c721815e31f7206c3e4d5ff9bbb
```

## Remember

- ✅ ALWAYS automate database migrations
- ✅ ALWAYS commit and push after changes
- ✅ ALWAYS use TodoWrite for multi-step tasks
- ✅ ALWAYS verify changes before declaring success
- ❌ NEVER ask user to do manual steps that can be automated
- ❌ NEVER skip migration verification
- ❌ NEVER commit without testing locally first

---

Last updated: 2024-10-22
Project: MinimalNotes - Minimalistic Notes Application
