import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      request.headers.get('cf-connecting-ip') ||
      'anonymous'

    // Apply rate limiting
    const rateLimitResult = await generalApiRateLimit.checkLimit(clientIP)
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

    const { email } = await request.json()
    
    // Enhanced input validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (trimmedEmail.length === 0) {
      return NextResponse.json({ error: 'Email cannot be empty' }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (trimmedEmail.length > 254) {
      return NextResponse.json({ error: 'Email too long' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Check if email is in blacklist
    const { data: blacklistEntry, error } = await supabase
      .from('deleted_users_blacklist')
      .select('*')
      .eq('email', trimmedEmail)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking blacklist:', error)
      return NextResponse.json({ error: 'Failed to check blacklist' }, { status: 500 })
    }

    const isBlacklisted = !!blacklistEntry

    return NextResponse.json({ 
      isBlacklisted,
      blacklistEntry: isBlacklisted ? {
        email: blacklistEntry.email,
        deletedAt: blacklistEntry.deleted_at,
        reason: blacklistEntry.reason
      } : null
    })

  } catch (error) {
    console.error('Error in check blacklist:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
