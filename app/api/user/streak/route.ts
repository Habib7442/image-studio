import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

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

    const supabase = createServiceRoleClient()
    
    const { data: streakData, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching streak data:', error)
      return NextResponse.json({ error: 'Failed to fetch streak data' }, { status: 500 })
    }

    // If no streak data exists, return default values
    if (!streakData) {
      return NextResponse.json({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_rewards_claimed: {}
      })
    }

    return NextResponse.json(streakData)

  } catch (error) {
    console.error('Error in streak API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    
    const today = new Date().toISOString().split('T')[0]
    
    // Get current streak data
    const { data: currentStreak, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching streak data:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch streak data' }, { status: 500 })
    }

    let newStreak = 1
    let longestStreak = 1

    if (currentStreak) {
      const lastActivity = currentStreak.last_activity_date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastActivity === today) {
        // Already updated today
        return NextResponse.json({
          success: true,
          message: 'Streak already updated today',
          streak: currentStreak
        })
      } else if (lastActivity === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak = currentStreak.current_streak + 1
        longestStreak = Math.max(newStreak, currentStreak.longest_streak)
      }
      // If last activity was more than 1 day ago, streak resets to 1
    }

    // Update or create streak record
    const { data: updatedStreak, error: updateError } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error updating streak:', updateError)
      return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Streak updated! Current streak: ${newStreak}`,
      streak: updatedStreak
    })

  } catch (error) {
    console.error('Error in streak update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
