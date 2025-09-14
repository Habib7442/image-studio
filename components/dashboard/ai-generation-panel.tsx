'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Camera, 
  Palette,
  Zap,
  Clock,
  Download
} from 'lucide-react'
import { funGenerationModes, professionalGenerationModes } from '@/lib/data'

export function AIGenerationPanel() {
  const [prompt, setPrompt] = useState('')
  const [selectedMode, setSelectedMode] = useState<'fun' | 'professional'>('fun')
  const [isGenerating, setIsGenerating] = useState(false)

  const currentModes = selectedMode === 'fun' ? funGenerationModes : professionalGenerationModes

  const handleGenerate = () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    // TODO: Implement AI generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Generation Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Image Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your image
            </label>
            <Textarea
              placeholder="A professional headshot of a business person in a modern office..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Generation Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~10 seconds
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Powered by Gemini 2.5 Flash
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Quick Templates
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {currentModes.slice(0, 4).map((mode) => (
            <Button
              key={mode.id}
              variant="outline"
              size="sm"
              className="h-auto p-3 flex flex-col items-start text-left"
              onClick={() => setPrompt(mode.description)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="text-primary">
                  {mode.icon}
                </div>
                <span className="text-xs font-medium">{mode.title}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left break-words">
                {mode.description}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Generations */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Recent Generations
        </h3>
        <div className="space-y-2">
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No recent generations</p>
            <p className="text-xs">Generate your first AI image to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}
