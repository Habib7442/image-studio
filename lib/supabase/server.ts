import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

export const createClient = async () => {
  const cookieStore = await cookies()
  const { getToken } = await auth()
  const token = await getToken()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Service role client for server-side operations that need elevated privileges
export const createServiceRoleClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for server-side operations
    {
      cookies: {
        get() {
          return undefined
        },
        set() {
          // No-op for server-side operations
        },
        remove() {
          // No-op for server-side operations
        },
      },
    }
  )
}
