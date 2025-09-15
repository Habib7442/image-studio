import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'
import { cacheApiResponse, invalidateUserCache, API_CACHE_KEYS, API_CACHE_TTL } from '@/lib/api-cache'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitResult = await generalApiRateLimit.checkLimit(userId)
    if (!rateLimitResult.success) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retryAfter: rateLimitResult.retryAfter,
          resetTime: new Date(rateLimitResult.resetTime).toISOString()
        },
        { status: 429, headers }
      )
    }

    const { full_name } = await request.json()

    // Enhanced input validation
    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    const trimmedName = full_name.trim()
    if (trimmedName.length === 0) {
      return NextResponse.json({ error: 'Full name cannot be empty' }, { status: 400 })
    }

    if (trimmedName.length > 100) {
      return NextResponse.json({ error: 'Full name too long (max 100 characters)' }, { status: 400 })
    }

    // Validate characters (allow letters, spaces, and common Unicode characters)
    if (!/^[a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/.test(trimmedName)) {
      return NextResponse.json({ error: 'Full name contains invalid characters' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        full_name: trimmedName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Invalidate user cache after successful update
    await invalidateUserCache(userId)

    const response = { 
      success: true, 
      message: 'Profile updated successfully' 
    }

    // Cache the success response briefly
    await cacheApiResponse(
      API_CACHE_KEYS.USER_PROFILE(userId),
      response,
      API_CACHE_TTL.USER_PROFILE
    )

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in update profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
