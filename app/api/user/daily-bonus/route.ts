import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function POST() {
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

    const supabase = createServiceRoleClient()
    
    // Get user's current profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if user already claimed today's bonus
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format in UTC
    const lastBonusDate = user.last_daily_bonus_date
    
    if (lastBonusDate === today) {
      return NextResponse.json({
        success: false,
        message: 'Daily bonus already claimed today'
      })
    }

    // Award daily bonus credits (2 credits)
    const bonusCredits = 2
    const newCreditsLeft = user.credits_left + bonusCredits

    // Update user with new credits and bonus date
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_left: newCreditsLeft,
        last_daily_bonus_date: today
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user credits:', updateError)
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }

    // Record the credit transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        credits_change: bonusCredits,
        transaction_type: 'daily_bonus',
        description: 'Daily login bonus'
      })

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      // Don't fail the request if transaction recording fails
    }

    return NextResponse.json({
      success: true,
      bonus_credits: bonusCredits,
      new_credits_total: newCreditsLeft,
      message: `Daily bonus claimed! +${bonusCredits} credits`
    })

  } catch (error) {
    console.error('Error in daily bonus API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
