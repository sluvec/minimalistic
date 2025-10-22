import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file')
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('Reading migration file...')
    const migrationPath = join(__dirname, 'supabase/migrations/20241022_add_projects.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('Connecting to Supabase...')
    console.log(`URL: ${supabaseUrl}`)

    console.log('\nExecuting migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      // If the RPC function doesn't exist, we need to run the SQL directly
      // This won't work with the anon key, so we'll provide instructions
      console.error('\nError executing migration:', error.message)
      console.error('\n⚠️  The anon key cannot execute raw SQL for security reasons.')
      console.error('\nPlease run the migration manually:')
      console.error('1. Go to https://supabase.com/dashboard')
      console.error('2. Select your project')
      console.error('3. Go to SQL Editor')
      console.error('4. Copy and paste the contents of: supabase/migrations/20241022_add_projects.sql')
      console.error('5. Click Run')
      process.exit(1)
    }

    console.log('✅ Migration executed successfully!')
    console.log('\nYou can now:')
    console.log('- Create projects at /projects')
    console.log('- View analytics at /analytics')
    console.log('- Assign notes to projects when creating/editing them')

  } catch (error) {
    console.error('Error running migration:', error.message)
    console.error('\nPlease run the migration manually through Supabase Dashboard.')
    process.exit(1)
  }
}

runMigration()
