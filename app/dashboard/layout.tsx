'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { CanvasArea } from '@/components/dashboard/canvas-area'

type CanvasMode = 'canvas' | 'style-myselfie'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // children renders nested route content alongside CanvasArea
  const { isLoaded, isSignedIn, isProfileLoading, profileError } = useAuth()
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<CanvasMode | undefined>(undefined)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isProfileLoading ? 'Setting up your profile...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Profile Error</p>
            <p className="text-sm">{profileError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="h-screen w-screen flex flex-col bg-background">
        {/* Header */}
        <DashboardHeader />
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden w-full min-w-0">
          {/* Left Sidebar */}
          <DashboardSidebar onModeSelect={setSelectedMode} />
          
          {/* Center Content Area - Full Width */}
          <main className="flex-1 flex flex-col overflow-y-auto w-full min-w-0">
            {selectedMode ? (
              <CanvasArea activeMode={selectedMode} />
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
