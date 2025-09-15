import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types for settings data
export interface UserProfile {
  id: string
  full_name: string
  email: string
  credits_left: number
  referral_id: string
  referral_count: number
  referral_credits_earned: number
  last_daily_bonus_date: string | null
  created_at: string
  updated_at: string
}

export interface ReferralStats {
  referral_code: string
  total_referrals: number
  credits_earned: number
  referrals: Array<{
    id: string
    referred_user_id: string
    referral_credits_given: number
    referral_credits_received: number
    created_at: string
  }>
}

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_rewards_claimed: Record<string, boolean>
}

export interface DailyBonusStatus {
  canClaim: boolean
  lastClaimed: string | null
  nextAvailable: string | null
}

// Settings store interface
interface SettingsState {
  // Profile data
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
  
  // Referral data
  referralStats: ReferralStats | null
  setReferralStats: (stats: ReferralStats | null) => void
  
  // Streak data
  streakData: StreakData | null
  setStreakData: (data: StreakData | null) => void
  
  // Daily bonus status
  dailyBonusStatus: DailyBonusStatus | null
  setDailyBonusStatus: (status: DailyBonusStatus | null) => void
  
  // Loading states
  isLoading: {
    profile: boolean
    referrals: boolean
    streak: boolean
    dailyBonus: boolean
  }
  setLoading: (key: keyof SettingsState['isLoading'], loading: boolean) => void
  
  // Error states
  errors: {
    profile: string | null
    referrals: string | null
    streak: string | null
    dailyBonus: string | null
  }
  setError: (key: keyof SettingsState['errors'], error: string | null) => void
  
  // Cache timestamps
  lastFetched: {
    profile: number | null
    referrals: number | null
    streak: number | null
    dailyBonus: number | null
  }
  setLastFetched: (key: keyof SettingsState['lastFetched'], timestamp: number) => void
  
  // Actions
  refreshProfile: () => Promise<void>
  refreshReferralStats: () => Promise<void>
  refreshStreakData: () => Promise<void>
  refreshDailyBonusStatus: () => Promise<void>
  refreshAll: () => Promise<void>
  
  // Utility functions
  isDataStale: (key: keyof SettingsState['lastFetched'], maxAgeMinutes?: number) => boolean
  clearCache: () => void
  reset: () => void
}

const initialLoadingState = {
  profile: false,
  referrals: false,
  streak: false,
  dailyBonus: false,
}

const initialErrorState = {
  profile: null,
  referrals: null,
  streak: null,
  dailyBonus: null,
}

const initialLastFetchedState = {
  profile: null,
  referrals: null,
  streak: null,
  dailyBonus: null,
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        profile: null,
        referralStats: null,
        streakData: null,
        dailyBonusStatus: null,
        isLoading: initialLoadingState,
        errors: initialErrorState,
        lastFetched: initialLastFetchedState,
        
        // Setters
        setProfile: (profile) => set({ profile }, false, 'setProfile'),
        setReferralStats: (stats) => set({ referralStats: stats }, false, 'setReferralStats'),
        setStreakData: (data) => set({ streakData: data }, false, 'setStreakData'),
        setDailyBonusStatus: (status) => set({ dailyBonusStatus: status }, false, 'setDailyBonusStatus'),
        
        setLoading: (key, loading) => 
          set((state) => ({
            isLoading: { ...state.isLoading, [key]: loading }
          }), false, `setLoading:${key}`),
        
        setError: (key, error) => 
          set((state) => ({
            errors: { ...state.errors, [key]: error }
          }), false, `setError:${key}`),
        
        setLastFetched: (key, timestamp) => 
          set((state) => ({
            lastFetched: { ...state.lastFetched, [key]: timestamp }
          }), false, `setLastFetched:${key}`),
        
        // API refresh functions
        refreshProfile: async () => {
          const { setLoading, setError, setLastFetched, setProfile } = get()
          
          setLoading('profile', true)
          setError('profile', null)
          
          try {
            const response = await fetch('/api/user/profile')
            if (!response.ok) throw new Error('Failed to fetch profile')
            
            const data = await response.json()
            setProfile(data)
            setLastFetched('profile', Date.now())
          } catch (error) {
            setError('profile', error instanceof Error ? error.message : 'Unknown error')
          } finally {
            setLoading('profile', false)
          }
        },
        
        refreshReferralStats: async () => {
          const { setLoading, setError, setLastFetched, setReferralStats } = get()
          
          setLoading('referrals', true)
          setError('referrals', null)
          
          try {
            const response = await fetch('/api/referral/stats')
            if (!response.ok) throw new Error('Failed to fetch referral stats')
            
            const data = await response.json()
            setReferralStats(data)
            setLastFetched('referrals', Date.now())
          } catch (error) {
            setError('referrals', error instanceof Error ? error.message : 'Unknown error')
          } finally {
            setLoading('referrals', false)
          }
        },
        
        refreshStreakData: async () => {
          const { setLoading, setError, setLastFetched, setStreakData } = get()
          
          setLoading('streak', true)
          setError('streak', null)
          
          try {
            const response = await fetch('/api/user/streak')
            if (!response.ok) throw new Error('Failed to fetch streak data')
            
            const data = await response.json()
            setStreakData(data)
            setLastFetched('streak', Date.now())
          } catch (error) {
            setError('streak', error instanceof Error ? error.message : 'Unknown error')
          } finally {
            setLoading('streak', false)
          }
        },
        
        refreshDailyBonusStatus: async () => {
          const { setLoading, setError, setLastFetched, setDailyBonusStatus } = get()
          
          setLoading('dailyBonus', true)
          setError('dailyBonus', null)
          
          try {
            // Check if user can claim daily bonus
            const response = await fetch('/api/user/daily-bonus', { method: 'POST' })
            const data = await response.json()
            
            const status: DailyBonusStatus = {
              canClaim: data.success || false,
              lastClaimed: data.success ? new Date().toISOString() : null,
              nextAvailable: data.success ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
            
            setDailyBonusStatus(status)
            setLastFetched('dailyBonus', Date.now())
          } catch (error) {
            setError('dailyBonus', error instanceof Error ? error.message : 'Unknown error')
          } finally {
            setLoading('dailyBonus', false)
          }
        },
        
        refreshAll: async () => {
          const { refreshProfile, refreshReferralStats, refreshStreakData, refreshDailyBonusStatus } = get()
          
          // Run all refreshes in parallel
          await Promise.allSettled([
            refreshProfile(),
            refreshReferralStats(),
            refreshStreakData(),
            refreshDailyBonusStatus()
          ])
        },
        
        // Utility functions
        isDataStale: (key, maxAgeMinutes = 5) => {
          const { lastFetched } = get()
          const lastFetchedTime = lastFetched[key]
          
          if (!lastFetchedTime) return true
          
          const maxAge = maxAgeMinutes * 60 * 1000 // Convert to milliseconds
          return Date.now() - lastFetchedTime > maxAge
        },
        
        clearCache: () => set({
          profile: null,
          referralStats: null,
          streakData: null,
          dailyBonusStatus: null,
          lastFetched: initialLastFetchedState,
          errors: initialErrorState
        }, false, 'clearCache'),
        
        reset: () => set({
          profile: null,
          referralStats: null,
          streakData: null,
          dailyBonusStatus: null,
          isLoading: initialLoadingState,
          errors: initialErrorState,
          lastFetched: initialLastFetchedState
        }, false, 'reset')
      }),
      {
        name: 'settings-storage',
        partialize: (state) => ({
          profile: state.profile,
          referralStats: state.referralStats,
          streakData: state.streakData,
          dailyBonusStatus: state.dailyBonusStatus,
          lastFetched: state.lastFetched,
        }),
        version: 1,
        migrate: (persistedState, version) => {
          console.log(`Migrating settings store from version ${version} to version 1`)
          return persistedState as SettingsState
        },
      }
    ),
    {
      name: 'settings-store',
    }
  )
)
