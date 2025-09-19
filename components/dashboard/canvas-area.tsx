'use client'

import { StyleMySelfiePanel } from './style-my-selfie-panel'

interface CanvasAreaProps {
  activeMode: string
}

export function CanvasArea({ activeMode }: CanvasAreaProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      {activeMode === 'style-myselfie' && <StyleMySelfiePanel />}
    </div>
  )
}