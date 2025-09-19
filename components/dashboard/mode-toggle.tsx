'use client'

import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

export function ModeToggle() {
  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      <Button
        variant="default"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Camera className="w-4 h-4" />
        <span>Style My Selfie</span>
      </Button>
    </div>
  )
}