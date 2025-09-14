'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { 
  FileText, 
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
        <div className="flex items-center space-x-4">
          {/* Sidebar Trigger */}
          <SidebarTrigger />
          
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <FileText className="h-4 w-4 mr-2" />
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>New Project</DropdownMenuItem>
              <DropdownMenuItem>Open Project</DropdownMenuItem>
              <DropdownMenuItem>Save Project</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Resize */}
          <Button variant="ghost" size="sm" className="h-8">
            Resize
          </Button>

        </div>

        {/* Center Section */}
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Studio
          </Badge>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Credits */}
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {profile?.credits_left || 0} Credits
          </Badge>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="h-4 w-4" />
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
