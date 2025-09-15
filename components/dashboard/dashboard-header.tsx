'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { 
  Settings, 
  HelpCircle, 
  Sparkles,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { UserButton } from '@clerk/nextjs'
import { useAuth } from '@/hooks/useAuth'

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { profile } = useAuth()

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          {/* Sidebar Trigger */}
          <SidebarTrigger />
          
          {/* Mobile Image Editor Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 md:hidden flex flex-col items-center gap-0 px-2"
            onClick={() => window.location.href = '/editor'}
          >
            <span className="text-lg">🎨</span>
            <span className="text-xs leading-none">Editor</span>
          </Button>
        </div>

        {/* Center Section - Hidden on small devices */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Image Editor */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-12 flex flex-col items-center gap-0 px-3"
            onClick={() => window.location.href = '/editor'}
          >
            <span className="text-lg">🎨</span>
            <span className="text-xs leading-none">Image Editor</span>
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Credits - Show on all devices */}
          <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">{profile?.credits_left || 0} Credits</span>
            <span className="sm:hidden">{profile?.credits_left || 0}</span>
          </Badge>

          {/* Theme Toggle - Hidden on small devices */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-12 hidden sm:flex flex-col items-center gap-0 px-2"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="text-xs leading-none">Theme</span>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => window.location.href = '/dashboard/settings'}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Help - Hidden on small devices */}
          <Button variant="ghost" size="sm" className="h-12 hidden sm:flex flex-col items-center gap-0 px-2">
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs leading-none">Help</span>
          </Button>

          {/* User Button */}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}
