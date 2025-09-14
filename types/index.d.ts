// Database Types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  credits_left: number
  total_credits_used: number
  user_tier: 'free' | 'founding_100' | 'pro'
  is_founding_user: boolean
  founding_badge_earned: boolean
  referral_id: string
  referred_by?: string
  referral_credits_earned: number
  last_credit_reset: string
  terms_accepted: boolean
  terms_accepted_at?: string
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_user_id: string
  referral_credits_given: number
  referral_credits_received: number
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  transaction_type: 'generation' | 'daily_reset' | 'referral_bonus' | 'founding_bonus' | 'manual_adjustment'
  credits_change: number
  credits_before: number
  credits_after: number
  metadata?: any
  created_at: string
}

// Generation Mode Types
export interface GenerationMode {
  id: string
  title: string
  icon: string
  description: string
  category: 'fun' | 'professional'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CreateUserProfileRequest {
  email: string
  fullName: string
  avatarUrl?: string
  referralCode?: string
}

export interface CreateUserProfileResponse {
  profile: User
  message: string
  existing: boolean
}

// UI Component Types
export interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface Avatar {
  userName: string
  width: number
  height: number
  className?: string
}

// Auth Types
export interface AuthUser {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  isSignedIn: boolean
}

// Generation Types
export interface GenerationRequest {
  prompt: string
  style: string
  quality: 'standard' | 'premium'
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
}

export interface GenerationResponse {
  id: string
  imageUrl: string
  prompt: string
  style: string
  quality: string
  aspectRatio: string
  creditsUsed: number
  createdAt: string
}

// Gallery Types
export interface GalleryImage {
  id: string
  userId: string
  imageUrl: string
  prompt: string
  style: string
  quality: string
  aspectRatio: string
  creditsUsed: number
  createdAt: string
  isPublic: boolean
  likes: number
  downloads: number
}

// Credit System Types
export interface CreditPack {
  id: string
  name: string
  credits: number
  price: number
  currency: string
  description: string
  popular?: boolean
}

export interface CreditPurchase {
  id: string
  userId: string
  creditPackId: string
  credits: number
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentIntentId?: string
  createdAt: string
  completedAt?: string
}

// Referral System Types
export interface ReferralStats {
  totalReferrals: number
  totalCreditsEarned: number
  pendingCredits: number
  referralCode: string
  referralUrl: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: 'credit_earned' | 'generation_complete' | 'referral_bonus' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Settings Types
export interface UserSettings {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  dataProcessing: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  updatedAt: string
}
