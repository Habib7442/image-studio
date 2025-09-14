import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function GET() {
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

    const supabase = createServiceRoleClient()
    
    // Check if user profile exists
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create profile
      console.log('User profile not found, creating new profile for:', userId)
      return await createUserProfile(userId)
    }

    if (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createUserProfile(clerkUserId: string) {
  try {
    // Get Clerk user data for profile fields
    const user = await currentUser()
    if (!user || user.id !== clerkUserId) {
      throw new Error('User not found or ID mismatch')
    }

    // Extract name from email if fullName is not available
    const email = user.emailAddresses[0]?.emailAddress || ''
    const emailName = email.split('@')[0]
    const fullName = user.fullName || emailName || ''

    console.log('Clerk user data:', {
      id: user.id,
      email: email,
      fullName: fullName,
      imageUrl: user.imageUrl
    })

    const supabase = createServiceRoleClient()

    // Check if user is blacklisted (deleted account)
    const { data: blacklistEntry, error: blacklistError } = await supabase
      .from('deleted_users_blacklist')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (blacklistError && blacklistError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking blacklist:', blacklistError)
      throw blacklistError
    }

    if (blacklistEntry) {
      console.log(`User ${email} is blacklisted due to account deletion on ${blacklistEntry.deleted_at} - creating account with 0 credits`)
      // Allow account creation but with 0 credits
    }

    // Check if this is a founding user (first 100 users)
    const { count: userCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error checking user count:', countError)
      throw countError
    }

    const isFoundingUser = (userCount || 0) < 100
    const userTier = isFoundingUser ? 'founding_100' : 'free'
    const initialCredits = blacklistEntry ? 0 : 10  // Blacklisted users get 0 credits, others get 10
    
    // For blacklisted users, set credit reset to tomorrow so they get daily credits next day
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Start of tomorrow
    
    const creditResetDate = blacklistEntry ? tomorrow.toISOString() : now.toISOString()
    
    console.log(`Blacklisted user: ${!!blacklistEntry}, Credits: ${initialCredits}, Reset date: ${creditResetDate}`)

    // Generate unique referral ID
    const referralId = `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    console.log(`Creating user: ${clerkUserId}, Founding: ${isFoundingUser}, Credits: ${initialCredits}`)

    // Create user profile with actual Clerk user data
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: clerkUserId,
        email: email,
        full_name: fullName,
        avatar_url: user.imageUrl || '',
        credits_left: initialCredits,
        total_credits_used: 0,
        user_tier: userTier,
        is_founding_user: isFoundingUser,
        founding_badge_earned: isFoundingUser,
        referral_id: referralId,
        referred_by: null,
        referral_credits_earned: 0,
        last_credit_reset: creditResetDate,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }

    // If founding user, add to founding_users table
    if (isFoundingUser) {
      const { error: foundingError } = await supabase
        .from('founding_users')
        .insert({
          user_id: clerkUserId,
          position: (userCount || 0) + 1, // Position based on user count
          benefits_claimed: {},
        })

      if (foundingError) {
        console.error('Error adding to founding users:', foundingError)
        // Don't throw error here, just log it
      } else {
        console.log(`Added user ${clerkUserId} to founding users at position ${(userCount || 0) + 1}`)
      }
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to create user profile' },
      { status: 500 }
    )
  }
}
