import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
// Types are available globally from types/index.d.ts

// Client-side Supabase client with Clerk integration
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken()
      }
    }
  )
}

// Service role client for admin operations
export const createServiceRoleClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// For backward compatibility
export const supabase = createSupabaseClient()
