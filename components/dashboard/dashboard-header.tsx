'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, HelpCircle, User } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function DashboardHeader() {
  const { user } = useUser()
  const router = useRouter()

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      {/* Left side - Empty */}
      <div className="flex items-center space-x-4">
      </div>


      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Credits */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            5 Credits
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

        {/* Help */}
        <Button variant="ghost" size="sm">
          <HelpCircle className="w-4 h-4" />
        </Button>

        {/* User Profile */}
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm">{user?.firstName || 'User'}</span>
        </Button>
      </div>
    </header>
  )
}