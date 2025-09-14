'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Image as ImageIcon } from 'lucide-react'

export function CanvasArea() {
  const [zoom, setZoom] = useState(100)
  const { theme } = useTheme()

  return (
    <div className="flex-1 flex flex-col bg-muted/20 w-full min-w-0">

      {/* Main Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted/10 overflow-auto w-full min-w-0">
        <div className="relative w-full h-full flex items-center justify-center min-w-0">
          {/* Canvas Container */}
          <div 
            className={`shadow-2xl border relative overflow-hidden w-full h-full ${
              theme === 'dark' 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center'
            }}
          >
            {/* Canvas Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }} />
            </div>

                        {/* Canvas Content Area */}
                        <div className="relative w-full h-full flex items-center justify-center p-8">
                          {/* Placeholder Content */}
                          <div className={`text-center max-w-md ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-400'
                          }`}>
                            <div className="mb-6">
                              <ImageIcon className={`h-20 w-20 mx-auto mb-4 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-300'
                              }`} />
                              <h3 className={`text-xl font-semibold mb-3 ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                              }`}>Your Canvas</h3>
                              <p className={`text-sm leading-relaxed ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Generate AI images or add elements to start creating your masterpiece
                              </p>
                            </div>
                          </div>
                        </div>

            {/* Canvas Grid Overlay (when enabled) */}
            {false && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(to right, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px),
                    linear-gradient(to bottom, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }} />
              </div>
            )}
          </div>

        </div>
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
