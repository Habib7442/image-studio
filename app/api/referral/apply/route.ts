import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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

    const { referralCode } = await request.json()

    // Enhanced input validation
    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const trimmedCode = referralCode.trim()
    if (trimmedCode.length === 0) {
      return NextResponse.json({ error: 'Referral code cannot be empty' }, { status: 400 })
    }

    if (trimmedCode.length > 20) {
      return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 })
    }

    // Validate referral code format (alphanumeric with optional dashes/underscores)
    if (!/^[A-Za-z0-9_-]+$/.test(trimmedCode)) {
      return NextResponse.json({ error: 'Invalid referral code format' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    try {
      // Check if user already has a referral
      const { data: existingReferral } = await supabase
        .from('users')
        .select('referred_by')
        .eq('id', userId)
        .single()

      if (existingReferral?.referred_by) {
        return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 })
      }

      // Find the referrer
      const { data: referrer } = await supabase
        .from('users')
        .select('id, referral_id')
        .eq('referral_id', trimmedCode)
        .single()

      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
      }

      if (referrer.id === userId) {
        return NextResponse.json({ error: 'You cannot refer yourself' }, { status: 400 })
      }

      // Check if this referrer has already referred this user
      const { data: existingReferralRecord } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrer.id)
        .eq('referred_user_id', userId)
        .single()

      if (existingReferralRecord) {
        return NextResponse.json({ error: 'This referral has already been processed' }, { status: 400 })
      }

      // Start transaction-like operations
      // 1. Update the referred user
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ referred_by: referrer.id })
        .eq('id', userId)

      if (updateUserError) {
        throw new Error('Failed to update user referral status')
      }

      // 2. Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_user_id: userId,
          referral_credits_given: 5,
          referral_credits_received: 5
        })

      if (referralError) {
        throw new Error('Failed to create referral record')
      }

      // 3. Add credits to referrer (5 credits)
      const { error: referrerCreditsError } = await supabase.rpc('add_user_credits', {
        user_id: referrer.id,
        credits: 5,
        transaction_type: 'referral_bonus',
        metadata: { referred_user_id: userId, referral_type: 'given' }
      })

      if (referrerCreditsError) {
        throw new Error('Failed to add credits to referrer')
      }

      // 4. Add credits to referred user (5 credits)
      const { error: referredCreditsError } = await supabase.rpc('add_user_credits', {
        user_id: userId,
        credits: 5,
        transaction_type: 'referral_bonus',
        metadata: { referrer_id: referrer.id, referral_type: 'received' }
      })

      if (referredCreditsError) {
        throw new Error('Failed to add credits to referred user')
      }

      // 5. Update referral credits earned for referrer
      const { error: updateReferrerStatsError } = await supabase
        .from('users')
        .update({ 
          referral_credits_earned: supabase.raw('referral_credits_earned + 5'),
          referral_count: supabase.raw('referral_count + 1')
        })
        .eq('id', referrer.id)

      if (updateReferrerStatsError) {
        throw new Error('Failed to update referrer stats')
      }

      return NextResponse.json({
        success: true,
        message: 'Referral code applied successfully! Both you and your referrer received 5 credits each.'
      })

    } catch (error) {
      console.error('Referral application error:', error)
      return NextResponse.json({ error: 'Failed to apply referral code. Please try again.' }, { status: 400 })
    }

  } catch (error) {
    console.error('Referral application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
