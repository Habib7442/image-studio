'use client'

import { useState } from 'react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/dashboard/mode-toggle'
import { funGenerationModes, professionalGenerationModes } from '@/lib/data'

export function DashboardSidebar() {
  const [activeMode, setActiveMode] = useState<'fun' | 'professional'>('fun')
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  const currentModes = activeMode === 'fun' ? funGenerationModes : professionalGenerationModes

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
                    onClick={() => setSelectedMode(mode.id)}
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
      </SidebarContent>
    </Sidebar>
  )
}