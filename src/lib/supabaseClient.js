import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your Vercel environment variables or .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project-url.supabase.co',  // Replace with your actual URL if needed
  supabaseAnonKey || 'your-anon-key-for-development-only' // Replace with your actual key if needed
)
