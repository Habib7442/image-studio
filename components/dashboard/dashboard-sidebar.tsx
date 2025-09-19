'use client'

import { Button } from '@/components/ui/button'
import { Home, Camera, Settings, Palette } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <h2 className="text-lg font-semibold">Image Studio Lab</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={pathname === '/dashboard'}
                  onClick={() => router.push('/dashboard')}
                >
                  <a href="#">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={pathname === '/dashboard/style-my-selfie'}
                  onClick={() => router.push('/dashboard/style-my-selfie')}
                >
                  <a href="#">
                    <Camera className="w-4 h-4" />
                    <span>Style My Selfie</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={pathname === '/dashboard/ai-editor'}
                  onClick={() => router.push('/dashboard/ai-editor')}
                >
                  <a href="#">
                    <Palette className="w-4 h-4" />
                    <span>AI Editor</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={pathname === '/dashboard/settings'}
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <a href="#">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}