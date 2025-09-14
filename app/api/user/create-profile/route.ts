import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'
// Types are available globally from types/index.d.ts

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check
    const rateLimitResult = await generalApiRateLimit.checkLimit(userId)
    
    if (!rateLimitResult.success) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      )
    }

    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      email, 
      fullName, 
      avatarUrl, 
      referralCode,
      termsAccepted = false 
    } = body

    const supabase = createServiceRoleClient()
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError)
      return NextResponse.json({ error: 'Failed to check user existence' }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists',
        existing: true 
      })
    }

    // Create user profile
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || 'User',
        avatar_url: avatarUrl,
        credits_left: 5, // Daily free credits
        total_credits_used: 0,
        user_tier: 'free',
        is_founding_user: false,
        founding_badge_earned: false,
        referral_id: `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        referred_by: referralCode || null,
        referral_credits_earned: 0,
        last_credit_reset: new Date().toISOString(),
        terms_accepted: termsAccepted,
        terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      profile: newUser,
      message: 'User created successfully',
      existing: false
    })
  } catch (error) {
    console.error('Error in create profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
