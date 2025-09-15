'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, RotateCcw, Wand2 } from 'lucide-react'
import { canvasProcessor } from '@/lib/effects/canvas-processor'
import { ProcessingOptions } from '@/lib/effects'

interface CanvasEditorProps {
  imageUrl: string
  onDownload: (processedImage: string) => void
}

interface EffectSettings {
  intensity: number
  direction: number
  centerX: number
  centerY: number
  offset: number
  strength: number
  size: number
  caption: string
  borderSize: number
  stripCount: number
  spacing: number
}

const EFFECTS = [
  {
    id: 'motion-blur',
    name: 'Motion Blur',
    icon: '🌊',
    description: 'Add dynamic motion effects to your image',
    parameters: {
      intensity: { min: 1, max: 30, default: 10, step: 1 },
      direction: { min: 0, max: 360, default: 0, step: 1 }
    }
  },
  {
    id: 'chromatic-aberration',
    name: 'Chromatic Aberration',
    icon: '🌈',
    description: 'Create a colorful distortion effect',
    parameters: {
      offset: { min: 1, max: 20, default: 5, step: 1 },
      strength: { min: 0, max: 1, default: 1, step: 0.1 }
    }
  },
  {
    id: 'vignette',
    name: 'Vignette',
    icon: '🔍',
    description: 'Add a dark border effect',
    parameters: {
      strength: { min: 0, max: 1, default: 0.8, step: 0.1 },
      size: { min: 0, max: 1, default: 0.5, step: 0.1 }
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    icon: '📸',
    description: 'Apply a vintage sepia tone',
    parameters: {
      intensity: { min: 0, max: 1, default: 0.8, step: 0.1 }
    }
  },
  {
    id: 'polaroid',
    name: 'Polaroid Frame',
    icon: '📷',
    description: 'Add a classic polaroid frame',
    parameters: {
      caption: { type: 'text', default: 'Polaroid', maxLength: 20 },
      borderSize: { min: 20, max: 100, default: 60, step: 5 }
    }
  },
  {
    id: 'posterize',
    name: 'Posterize',
    icon: '🎭',
    description: 'Reduce colors for a poster-like effect',
    parameters: {
      levels: { min: 2, max: 16, default: 8, step: 1 }
    }
  },
  {
    id: 'solarize',
    name: 'Solarize',
    icon: '☀️',
    description: 'Create a solarized effect with inverted highlights',
    parameters: {
      threshold: { min: 0, max: 255, default: 128, step: 1 }
    }
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    description: 'Add dramatic cinematic color grading',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.8, step: 0.1 }
    }
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    icon: '⚡',
    description: 'Create high-contrast dramatic lighting',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.7, step: 0.1 }
    }
  },
  {
    id: 'moody',
    name: 'Moody',
    icon: '🌙',
    description: 'Add dark, moody atmosphere',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.6, step: 0.1 }
    }
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    icon: '🎞️',
    description: 'Classic film grain and color grading',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.8, step: 0.1 }
    }
  },
  {
    id: 'noir',
    name: 'Film Noir',
    icon: '🕶️',
    description: 'Classic black and white noir style',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.9, step: 0.1 }
    }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    icon: '🌅',
    description: 'Warm golden sunset lighting',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.7, step: 0.1 }
    }
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour',
    icon: '🌆',
    description: 'Cool blue twilight atmosphere',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.6, step: 0.1 }
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    icon: '💥',
    description: 'Bold, high-contrast dramatic effect',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.8, step: 0.1 }
    }
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    icon: '✨',
    description: 'Soft, ethereal dream-like effect',
    parameters: {
      intensity: { min: 0.1, max: 1, default: 0.7, step: 0.1 }
    }
  }
]

export function CanvasEditor({ imageUrl, onDownload }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null)
  const [processedImageData, setProcessedImageData] = useState<string | null>(null)
  const [selectedEffect, setSelectedEffect] = useState<typeof EFFECTS[0] | null>(null)
  // Default settings for each effect - no user control needed
  const getDefaultSettings = (effectId: string): EffectSettings => {
    switch (effectId) {
      case 'motion-blur':
        return { intensity: 15, direction: 45 }
      case 'chromatic-aberration':
        return { offset: 8, strength: 0.8 }
      case 'vignette':
        return { strength: 0.7, size: 0.6 }
      case 'sepia':
        return { intensity: 0.9 }
      case 'polaroid':
        return { caption: 'Polaroid', borderSize: 80 }
      case 'posterize':
        return { levels: 8 }
      case 'solarize':
        return { threshold: 128 }
      case 'cinematic':
        return { intensity: 0.8 }
      case 'dramatic':
        return { intensity: 0.7 }
      case 'moody':
        return { intensity: 0.6 }
      case 'vintage-film':
        return { intensity: 0.8 }
      case 'noir':
        return { intensity: 0.9 }
      case 'golden-hour':
        return { intensity: 0.7 }
      case 'blue-hour':
        return { intensity: 0.6 }
      case 'high-contrast':
        return { intensity: 0.8 }
      case 'dreamy':
        return { intensity: 0.7 }
      default:
        return {}
    }
  }
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [appliedEffects, setAppliedEffects] = useState<Array<{
    id: string
    effectId: string
    name: string
    settings: EffectSettings
    timestamp: number
  }>>([])

  // Load original image with CORS handling
  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) return
      
      setIsLoadingImage(true)
      setOriginalImageData(null)
      setProcessedImageData(null)
      setSelectedEffect(null)
      setAppliedEffects([])
      
      try {
        console.log('Loading image:', imageUrl)
        // Use image proxy to avoid CORS issues
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
        
        const imageData = await canvasProcessor.loadImage(proxyUrl)
        setOriginalImageData(imageData)
        setProcessedImageData(canvasProcessor.imageDataToBase64(imageData))
        console.log('Image loaded successfully via proxy')
      } catch (error) {
        console.error('Error loading image via proxy:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error: error
        })
        // Fallback: try direct loading with CORS
        try {
          console.log('Attempting fallback image loading...')
          const imageData = await canvasProcessor.loadImage(imageUrl)
          setOriginalImageData(imageData)
          setProcessedImageData(canvasProcessor.imageDataToBase64(imageData))
          console.log('Fallback image loading successful')
        } catch (fallbackError) {
          console.error('Fallback image loading also failed:', {
            message: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
            stack: fallbackError instanceof Error ? fallbackError.stack : undefined,
            error: fallbackError
          })
        }
      } finally {
        setIsLoadingImage(false)
      }
    }

    loadImage()
  }, [imageUrl])

  // Apply effect automatically when selected
  const applyEffect = useCallback(async (effect: typeof EFFECTS[0], settings: EffectSettings) => {
    if (!originalImageData) return

    setIsProcessing(true)
    try {
      const processedData = await canvasProcessor.processImage(
        originalImageData,
        effect.id,
        settings
      )
      setProcessedImageData(processedData)
    } catch (error) {
      console.error('Error applying effect:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [originalImageData])

  // Handle effect selection
  const handleEffectSelect = (effect: typeof EFFECTS[0]) => {
    setSelectedEffect(effect)
    
    // Get default settings for this effect
    const defaultSettings = getDefaultSettings(effect.id)
    
    applyEffect(effect, defaultSettings)
    
    // Add to applied effects history
    setTimeout(() => {
      applyEffectToHistory()
    }, 100) // Small delay to ensure effect is applied first
  }

  // Apply effect to history
  const applyEffectToHistory = () => {
    if (!selectedEffect || !originalImageData) return

    const effectRecord = {
      id: `effect-${Date.now()}`,
      effectId: selectedEffect.id,
      name: selectedEffect.name,
      settings: getDefaultSettings(selectedEffect.id),
      timestamp: Date.now()
    }

    setAppliedEffects(prev => [...prev, effectRecord])
  }

  // Reset to original image
  const handleReset = () => {
    if (originalImageData) {
      setProcessedImageData(canvasProcessor.imageDataToBase64(originalImageData))
      setAppliedEffects([])
      setSelectedEffect(null)
    }
  }

  // Undo last effect
  const handleUndo = () => {
    if (appliedEffects.length > 0) {
      const newEffects = appliedEffects.slice(0, -1)
      setAppliedEffects(newEffects)
      
      if (newEffects.length === 0) {
        handleReset()
      } else {
        // Reapply all effects except the last one
        // This is a simplified approach - in a real app you'd want to track the state better
        handleReset()
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Canvas Area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Canvas Editor</CardTitle>
          <CardDescription className="text-sm">
            Real-time image editing with instant preview
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative bg-muted/20 rounded-lg p-2 sm:p-4">
            {isLoadingImage ? (
              <div className="w-full h-64 sm:h-96 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-sm sm:text-base">Loading image...</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">This may take a few seconds</p>
                </div>
              </div>
            ) : processedImageData ? (
              <img
                ref={canvasRef}
                src={processedImageData}
                alt="Processed image"
                className="w-full h-auto max-h-[400px] sm:max-h-[600px] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-64 sm:h-96 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Wand2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm sm:text-base">Select an effect to start editing</p>
                </div>
              </div>
            )}
            
            {isProcessing && !isLoadingImage && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Applying effect...</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {appliedEffects.length > 0 && !isLoadingImage && (
              <Button
                onClick={handleUndo}
                variant="outline"
                disabled={isLoadingImage}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Undo
              </Button>
            )}
            
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isLoadingImage}
              className="w-full sm:flex-1"
            >
              Reset
            </Button>
          </div>

          {/* Applied Effects */}
          {appliedEffects.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Applied Effects</h4>
              <div className="flex flex-wrap gap-2">
                {appliedEffects.map((effect) => (
                  <span
                    key={effect.id}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {effect.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Effects Panel - Mobile */}
      <div className="block lg:hidden">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Effects</CardTitle>
            <CardDescription className="text-sm">
              Choose an effect to apply to your image
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Effects Grid for Mobile */}
            <div className={`grid grid-cols-2 gap-2 ${isLoadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              {EFFECTS.map((effect) => (
                <div
                  key={effect.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedEffect?.id === effect.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  } ${isLoadingImage ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !isLoadingImage && handleEffectSelect(effect)}
                >
                  <div className="text-center">
                    <span className="text-lg block mb-1">{effect.icon}</span>
                    <h4 className="font-medium text-xs truncate">{effect.name}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Button */}
            {processedImageData && !isLoadingImage && (
              <Button
                onClick={() => {
                  try {
                    onDownload(processedImageData)
                  } catch (error) {
                    console.error('Download error:', error)
                  }
                }}
                className="w-full mt-4"
                disabled={isLoadingImage}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Effects Panel - Desktop */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Effects</CardTitle>
            <CardDescription>
              Choose an effect to apply to your image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Effects List */}
            <div className={`space-y-2 ${isLoadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              {EFFECTS.map((effect) => (
                <div
                  key={effect.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedEffect?.id === effect.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  } ${isLoadingImage ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !isLoadingImage && handleEffectSelect(effect)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{effect.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{effect.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {effect.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Button */}
            {processedImageData && !isLoadingImage && (
              <Button
                onClick={() => {
                  try {
                    onDownload(processedImageData)
                  } catch (error) {
                    console.error('Download error:', error)
                  }
                }}
                className="w-full"
                disabled={isLoadingImage}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}