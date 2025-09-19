'use client'

import { Button } from '@/components/ui/button'
import { Home, Camera, Settings } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface DashboardSidebarProps {
  onModeSelect: (mode: string) => void
}

export function DashboardSidebar({ onModeSelect }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      {/* Navigation */}
      <div className="p-4 space-y-2 flex-1">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </h3>
          
          <Button
            variant={pathname === '/dashboard' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onModeSelect('style-myselfie')}
          >
            <Home className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Home</div>
              <div className={`text-xs ${pathname === '/dashboard' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>View your generated images</div>
            </div>
          </Button>
        </div>

        {/* Style My Selfie */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Style My Selfie
          </h3>
          
          <Button
            variant={pathname === '/dashboard/style-my-selfie' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => router.push('/dashboard/style-my-selfie')}
          >
            <Camera className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Style My Selfie</div>
              <div className={`text-xs ${pathname === '/dashboard/style-my-selfie' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Transform your selfies with AI</div>
            </div>
          </Button>
        </div>

        {/* System */}
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            System
          </h3>
          
          <Button
            variant={pathname === '/dashboard/settings' ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Settings</div>
              <div className={`text-xs ${pathname === '/dashboard/settings' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>Manage your account</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}