'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Gift, 
  Users, 
  Calendar,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  Coins,
  Flame,
  Clock,
  Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_rewards_claimed: Record<string, boolean>
}

interface ReferralStats {
  total_referrals: number
  credits_earned: number
  referral_code: string
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  
  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  
  // Referral state
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  
  // Daily claim state
  const [dailyClaimed, setDailyClaimed] = useState(false)
  const [dailyClaimLoading, setDailyClaimLoading] = useState(false)
  
  // Streak state
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [streakLoading, setStreakLoading] = useState(false)
  
  // Account deletion state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '')
      setEmail(profile.email || '')
      setReferralStats({
        total_referrals: profile.referral_count || 0,
        credits_earned: profile.referral_credits_earned || 0,
        referral_code: profile.referral_id || ''
      })
    }
  }, [profile])

  // Check daily claim status
  useEffect(() => {
    if (profile?.last_daily_bonus_date) {
      const today = new Date().toISOString().split('T')[0]
      setDailyClaimed(profile.last_daily_bonus_date === today)
    }
  }, [profile])

  // Load streak data
  useEffect(() => {
    loadStreakData()
  }, [])

  const loadStreakData = async () => {
    setStreakLoading(true)
    try {
      const response = await fetch('/api/user/streak')
      if (response.ok) {
        const data = await response.json()
        setStreakData(data)
      }
    } catch (error) {
      console.error('Error loading streak data:', error)
    } finally {
      setStreakLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim() })
      })

      if (!response.ok) throw new Error('Failed to update profile')
      
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralCode.trim() })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message)
        setReferralCode('')
        await refreshProfile()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('Error applying referral:', error)
      toast.error('Failed to apply referral code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDailyClaim = async () => {
    setDailyClaimLoading(true)
    try {
      const response = await fetch('/api/user/daily-bonus', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message)
        setDailyClaimed(true)
        await refreshProfile()
      } else {
        toast.error(data.message || 'Failed to claim daily bonus')
      }
    } catch (error) {
      console.error('Error claiming daily bonus:', error)
      toast.error('Failed to claim daily bonus. Please try again.')
    } finally {
      setDailyClaimLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion')
      return
    }

    setDeleteLoading(true)
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Account deleted successfully. Redirecting...')
        // Redirect to home page after successful deletion
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (referralStats?.referral_code) {
      navigator.clipboard.writeText(referralStats.referral_code)
      toast.success('Referral code copied to clipboard!')
    }
  }

  const getStreakReward = (streak: number) => {
    if (streak >= 30) return { credits: 10, label: 'Monthly Master' }
    if (streak >= 14) return { credits: 5, label: 'Two Week Warrior' }
    if (streak >= 7) return { credits: 3, label: 'Week Warrior' }
    if (streak >= 3) return { credits: 2, label: 'Getting Started' }
    return { credits: 0, label: 'Keep Going!' }
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full gap-2 p-1 text-xs sm:text-sm">
              <TabsTrigger value="profile" className="text-xs sm:text-sm whitespace-nowrap px-4 py-2">Profile</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs sm:text-sm whitespace-nowrap px-4 py-2">Referrals</TabsTrigger>
              <TabsTrigger value="rewards" className="text-xs sm:text-sm whitespace-nowrap px-4 py-2">Rewards</TabsTrigger>
              <TabsTrigger value="streak" className="text-xs sm:text-sm whitespace-nowrap px-4 py-2">Streak</TabsTrigger>
              <TabsTrigger value="danger" className="text-xs sm:text-sm whitespace-nowrap px-4 py-2">Danger Zone</TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isLoading || !name.trim()}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{name || 'Loading...'}</p>
                    <p className="text-sm text-muted-foreground">{email || 'Loading...'}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Credits Left</span>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{profile?.credits_left || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member since</span>
                    <span className="text-sm">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      }) : 'Loading...'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral System
                </CardTitle>
                <CardDescription>
                  Invite friends and earn credits together
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Your Referral Code */}
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={referralStats?.referral_code || ''}
                      readOnly
                      className="bg-muted"
                    />
                    <Button variant="outline" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this code with friends. Both you and your friend will get 5 credits each!
                  </p>
                </div>

                {/* Apply Referral Code */}
                <div className="space-y-2">
                  <Label>Apply Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter referral code"
                    />
                    <Button 
                      onClick={handleApplyReferral}
                      disabled={isLoading || !referralCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Referral Stats */}
                {referralStats && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{referralStats.total_referrals}</p>
                      <p className="text-sm text-muted-foreground">Total Referrals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{referralStats.credits_earned}</p>
                      <p className="text-sm text-muted-foreground">Credits Earned</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Daily Rewards
                </CardTitle>
                <CardDescription>
                  Claim your daily bonus credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary rounded-full p-2">
                      <Coins className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Daily Bonus</p>
                      <p className="text-sm text-muted-foreground">+2 credits every day</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDailyClaim}
                    disabled={dailyClaimed || dailyClaimLoading}
                    variant={dailyClaimed ? "outline" : "default"}
                  >
                    {dailyClaimLoading ? (
                      'Claiming...'
                    ) : dailyClaimed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Claimed Today
                      </>
                    ) : (
                      'Claim Now'
                    )}
                  </Button>
                </div>

                {dailyClaimed && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You've already claimed your daily bonus today. Come back tomorrow for more credits!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streak Tab */}
          <TabsContent value="streak" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Daily Streak
                </CardTitle>
                <CardDescription>
                  Build your streak and earn bonus rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {streakLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading streak data...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <p className="text-4xl font-bold text-primary">
                        {streakData?.current_streak || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Longest Streak</span>
                        <span className="font-medium">{streakData?.longest_streak || 0} days</span>
                      </div>
                      <Progress 
                        value={streakData ? (streakData.current_streak / Math.max(streakData.longest_streak, 1)) * 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Streak Rewards */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Streak Rewards</h4>
                      <div className="grid gap-2">
                        {[3, 7, 14, 30].map((days) => {
                          const reward = getStreakReward(days)
                          const isClaimed = streakData?.streak_rewards_claimed?.[days] || false
                          const canClaim = (streakData?.current_streak || 0) >= days && !isClaimed
                          
                          return (
                            <div 
                              key={days}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                canClaim ? 'bg-green-50 border-green-200' : 
                                isClaimed ? 'bg-muted' : 'bg-background'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  canClaim ? 'bg-green-500 text-white' :
                                  isClaimed ? 'bg-muted-foreground text-white' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {days}
                                </div>
                                <div>
                                  <p className="font-medium">{reward.label}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {reward.credits} credits
                                  </p>
                                </div>
                              </div>
                              <Badge variant={canClaim ? "default" : isClaimed ? "secondary" : "outline"}>
                                {canClaim ? "Available" : isClaimed ? "Claimed" : "Locked"}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Account Deletion Warning:</strong> This action will permanently delete your account, 
                    all your data, generated images, and credits. This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="delete-confirm">
                      Type "DELETE" to confirm account deletion
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="border-destructive"
                    />
                  </div>

                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                    className="w-full"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account Permanently
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
