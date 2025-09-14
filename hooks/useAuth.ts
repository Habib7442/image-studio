'use client'

import { useAuth as useClerkAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  credits_left: number
  total_credits_used: number
  user_tier: string
  is_founding_user: boolean
  founding_badge_earned: boolean
  referral_id: string
  referred_by: string | null
  referral_credits_earned: number
  last_credit_reset: string
  created_at: string
  updated_at: string
}

export function useAuth() {
  const { isLoaded, isSignedIn, userId } = useClerkAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      fetchUserProfile()
    } else if (isLoaded && !isSignedIn) {
      setProfile(null)
      setProfileError(null)
    }
  }, [isLoaded, isSignedIn, userId])

  const fetchUserProfile = async () => {
    if (!userId) return

    setIsProfileLoading(true)
    setProfileError(null)

    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfileError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const refreshProfile = () => {
    if (userId) {
      fetchUserProfile()
    }
  }

  return {
    isLoaded,
    isSignedIn,
    userId,
    profile,
    isProfileLoading,
    profileError,
    refreshProfile
  }
}
