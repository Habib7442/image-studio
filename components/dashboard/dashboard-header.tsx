'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Settings, User } from 'lucide-react'
import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function DashboardHeader() {
  const { user } = useUser()
  const { profile } = useAuth()
  const router = useRouter()

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      {/* Left side - Sidebar Toggle */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
      </div>


      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Credits */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {profile?.credits_left || 0} Credits
          </Badge>
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="sm">
          <span className="text-sm">Theme</span>
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/settings')}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Profile with Clerk UserButton */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "backdrop-blur-xl bg-black/30 border border-white/20 shadow-2xl",
              userButtonPopoverActionButton: "text-white hover:bg-white/10 transition-colors",
              userButtonPopoverActionButtonText: "text-white !text-white font-medium",
              userButtonPopoverFooter: "text-gray-300",
              userButtonPopoverActionButtonIcon: "text-white",
              userButtonPopoverActionButton__signOut: "text-white hover:bg-red-500/20 hover:text-red-400 transition-colors border-t border-white/10 flex items-center gap-2 px-3 py-2 [&>span]:text-white [&>span]:font-medium",
              userButtonPopoverActionButtonText__signOut: "text-white font-medium !text-white",
              userButtonPopoverActionButtonIcon__signOut: "text-red-400 w-4 h-4",
              userButtonPopoverActionButton__manageAccount: "text-white hover:bg-white/10 transition-colors flex items-center gap-2 px-3 py-2 [&>span]:text-white [&>span]:font-medium",
              userButtonPopoverActionButtonText__manageAccount: "text-white font-medium !text-white",
              userButtonPopoverActionButtonIcon__manageAccount: "text-white w-4 h-4"
            }
          }}
          afterSignOutUrl="/"
          showName={true}
          userProfileMode="modal"
        />
      </div>
    </header>
  )
}