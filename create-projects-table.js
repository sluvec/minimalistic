import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProjectsTable() {
  console.log('🔍 Checking if projects table exists...\n')

  try {
    // Try to query the projects table
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Projects table does NOT exist')
        console.log('\n📋 To create the projects table, please:')
        console.log('1. Go to: https://supabase.com/dashboard/project/fowscvbexfryuaqvuqtz/sql/new')
        console.log('2. Copy the contents of: supabase/migrations/20241022_add_projects.sql')
        console.log('3. Paste into the SQL Editor')
        console.log('4. Click "Run" or press Cmd/Ctrl + Enter')
        console.log('\n✨ After running the migration, your app will have:')
        console.log('   • Projects management')
        console.log('   • Project analytics')
        console.log('   • Ability to assign notes to projects')
        return false
      }
      throw error
    }

    console.log('✅ Projects table EXISTS!')
    console.log('\nYour projects system is ready to use:')
    console.log('• /projects - Manage your projects')
    console.log('• /analytics - View project statistics')
    console.log('• Create notes and assign them to projects')

    // Check if there are any projects
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📊 Current projects count: ${count || 0}`)

    if (count === 0) {
      console.log('\n💡 Tip: Create your first project at http://localhost:5173/projects')
    }

    return true

  } catch (error) {
    console.error('Error checking projects table:', error.message)
    return false
  }
}

checkProjectsTable()
