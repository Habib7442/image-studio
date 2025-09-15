'use client'

import { useState } from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/dashboard/mode-toggle'
import { funGenerationModes, professionalGenerationModes } from '@/lib/data'
import { Database, Settings } from 'lucide-react'

type CanvasMode = 'canvas' | 'style-myselfie'

interface DashboardSidebarProps {
  onModeSelect?: (modeId: CanvasMode) => void
}

export function DashboardSidebar({ onModeSelect }: DashboardSidebarProps) {
  const [activeMode, setActiveMode] = useState<'fun' | 'professional'>('fun')
  const [selectedMode, setSelectedMode] = useState<CanvasMode | null>(null)

  const currentModes = activeMode === 'fun' ? funGenerationModes : professionalGenerationModes

  const handleModeSelect = (modeId: string) => {
    // Map generation modes to canvas modes
    if (modeId === 'style-myselfie') {
      const canvasMode = 'style-myselfie' as CanvasMode
      setSelectedMode(canvasMode)
      onModeSelect?.(canvasMode)
    } else if (modeId === 'editor') {
      // Redirect to editor page
      window.location.href = '/editor'
    } else {
      // For other modes, we'll show a placeholder or redirect to specific pages
      // For now, we'll just set it to canvas mode
      const canvasMode = 'canvas' as CanvasMode
      setSelectedMode(canvasMode)
      onModeSelect?.(canvasMode)
    }
  }

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-4 border-b">
        <ModeToggle 
          activeMode={activeMode} 
          onModeChange={setActiveMode} 
        />
      </SidebarHeader>
      
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Generation Modes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {currentModes.map((mode) => (
                <SidebarMenuItem key={mode.id}>
                  <SidebarMenuButton 
                    asChild
                    onClick={() => handleModeSelect(mode.id)}
                    className={selectedMode === mode.id ? 'bg-sidebar-accent' : ''}
                  >
                    <button className="flex items-center gap-4 w-full px-4 py-6 rounded-lg">
                      <span className="text-xl">{mode.icon}</span>
                      <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                        <span className="text-sm font-medium truncate w-full">{mode.title}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">{mode.description}</span>
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Management */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => window.location.href = '/dashboard/cache'}
                  className="w-full justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Cache Management
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}