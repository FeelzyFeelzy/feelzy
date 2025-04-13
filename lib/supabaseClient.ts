import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fhbcqicnzcmnfcxhzymp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYmNxaWNuemNtbmZjeGh6eW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NDAxNTYsImV4cCI6MjA2MDExNjE1Nn0.R-1r8OCHV38tfKglS7gZu5TlR-2O6klTOtH3WSisfDQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
