import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'
import { cacheApiResponse, getCachedApiResponse, API_CACHE_KEYS, API_CACHE_TTL } from '@/lib/api-cache'

export async function GET() {
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

    // Check cache first
    const cacheKey = API_CACHE_KEYS.REFERRAL_STATS(userId)
    const cachedData = await getCachedApiResponse(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const supabase = createServiceRoleClient()

    // Get user's referral stats
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referral_id, referral_count, referral_credits_earned')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user referral stats:', userError)
      return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 })
    }

    // Get detailed referral records
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 })
    }

    const responseData = {
      referral_code: user.referral_id,
      total_referrals: user.referral_count || 0,
      credits_earned: user.referral_credits_earned || 0,
      referrals: referrals || []
    }

    // Cache the response
    await cacheApiResponse(cacheKey, responseData, API_CACHE_TTL.REFERRAL_STATS)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error in referral stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
