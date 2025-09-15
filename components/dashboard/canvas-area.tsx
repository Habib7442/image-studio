'use client'

import { useState, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { Image as ImageIcon } from 'lucide-react'
import { StyleMySelfiePanel } from '@/components/dashboard/style-my-selfie-panel'

type CanvasMode = 'canvas' | 'style-myselfie'

interface CanvasAreaProps {
  activeMode?: CanvasMode
  showGrid?: boolean
}

export function CanvasArea({ activeMode = 'canvas', showGrid = false }: CanvasAreaProps) {
  const [zoom] = useState(100)
  const { resolvedTheme } = useTheme()
  const isDark = useMemo(() => resolvedTheme === 'dark', [resolvedTheme])

  return (
    <div className="flex-1 flex flex-col bg-muted/20 w-full min-w-0 h-full">

      {/* Main Canvas */}
      <div className="flex-1 bg-muted/10 w-full min-w-0 h-full">
        {activeMode === 'style-myselfie' ? (
          <div className="h-full overflow-y-auto">
            <StyleMySelfiePanel />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-muted/5 to-muted/10">
            <div className="text-center space-y-6 max-w-md px-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold">Coming Soon</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This generation mode is currently under development. 
                  Check back soon for exciting new features!
                </p>
              </div>
              
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  In Development
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span>•</span>
          <span>No unsaved changes</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Page 1 of 1</span>
          <span>•</span>
          <span>AI Studio</span>
        </div>
      </div>
    </div>
  )
}
