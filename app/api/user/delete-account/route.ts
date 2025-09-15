import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { clerkClient } from '@clerk/nextjs/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting (stricter for destructive operations)
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

    // Get user data before deletion for logging
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`Starting account deletion for user: ${userId}`)

    // 1. Delete all user-related data from Supabase (in correct order to handle foreign keys)
    const tablesToClean = [
      { table: 'credit_transactions', column: 'user_id' },
      { table: 'user_streaks', column: 'user_id' },
      { table: 'generated_images', column: 'user_id' },
      { table: 'testimonials', column: 'user_id' }
    ]

    for (const { table, column } of tablesToClean) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(column, userId)

        if (error) {
          console.error(`Error deleting from ${table}:`, error)
        } else {
          console.log(`Successfully deleted from ${table}`)
        }
      } catch (error) {
        console.error(`Exception deleting from ${table}:`, error)
      }
    }

    // Handle referrals table separately (has different column names)
    try {
      // Delete referrals where user is the referrer
      const { error: referrerError } = await supabase
        .from('referrals')
        .delete()
        .eq('referrer_id', userId)

      if (referrerError) {
        console.error('Error deleting referrals as referrer:', referrerError)
      } else {
        console.log('Successfully deleted referrals as referrer')
      }

      // Delete referrals where user is the referred user
      const { error: referredError } = await supabase
        .from('referrals')
        .delete()
        .eq('referred_user_id', userId)

      if (referredError) {
        console.error('Error deleting referrals as referred user:', referredError)
      } else {
        console.log('Successfully deleted referrals as referred user')
      }
    } catch (error) {
      console.error('Exception deleting from referrals:', error)
    }

    // 2. Delete the main user record (after all foreign key references are removed)
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteUserError) {
      console.error('Error deleting user from Supabase:', deleteUserError)
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
    }

    console.log('Successfully deleted user from Supabase')

    // 2.5. Add user to blacklist to prevent re-registration with credits
    try {
      const { error: blacklistError } = await supabase
        .from('deleted_users_blacklist')
        .insert({
          email: userData.email,
          user_id: userId,
          reason: 'account_deletion',
          deleted_at: new Date().toISOString()
        })

      if (blacklistError) {
        console.error('Error adding user to blacklist:', blacklistError)
      } else {
        console.log('Successfully added user to blacklist')
      }
    } catch (error) {
      console.error('Exception adding user to blacklist:', error)
    }

    // 3. Delete user from Clerk
    try {
      await clerkClient.users.deleteUser(userId)
      console.log('Successfully deleted user from Clerk')
    } catch (clerkError) {
      console.error('Error deleting user from Clerk:', clerkError)
      // Even if Clerk deletion fails, we've already deleted from Supabase
      // The user's data is gone, but they might still be able to sign in
      return NextResponse.json({ 
        error: 'User data deleted but Clerk deletion failed. Please contact support.',
        success: true 
      }, { status: 206 })
    }

    console.log(`Account deletion completed for user: ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Account successfully deleted' 
    })

  } catch (error) {
    console.error('Error in delete account:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
