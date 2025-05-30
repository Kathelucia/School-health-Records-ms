
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://merlstopxaxndtwliigy.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcmxzdG9weGF4bmR0d2xpaWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzExNDAsImV4cCI6MjA2MzkwNzE0MH0.RpODUSIzSarKc4Vj3bhZERN7DwZyuyyEM_IogGKNfNk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
