'use client'

import { Button } from '@/components/ui/button'
import { Gamepad2, Building } from 'lucide-react'

interface ModeToggleProps {
  activeMode: 'fun' | 'professional'
  onModeChange: (mode: 'fun' | 'professional') => void
}

export function ModeToggle({ activeMode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
      <Button
        variant={activeMode === 'fun' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('fun')}
        className="flex-1"
      >
        <Gamepad2 className="h-4 w-4 mr-2" />
        Fun
      </Button>
      <Button
        variant={activeMode === 'professional' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('professional')}
        className="flex-1"
      >
        <Building className="h-4 w-4 mr-2" />
        Professional
      </Button>
    </div>
  )
}
