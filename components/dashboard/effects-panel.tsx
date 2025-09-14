'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Download,
  RotateCcw,
  Settings,
  Sparkles,
  Wand2
} from 'lucide-react'
import { EFFECTS, EFFECT_CATEGORIES, getEffectsByCategory } from '@/lib/effects'
import { canvasProcessor } from '@/lib/effects/canvas-processor'
import { useEffectsStore } from '@/store/effects-store'
import { ProcessingOptions } from '@/lib/effects'

interface EffectsPanelProps {
  images: string[]
  onImageUpdate?: (imageId: string, processedImage: string) => void
}

export function EffectsPanel({ images, onImageUpdate }: EffectsPanelProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [effectOptions, setEffectOptions] = useState<ProcessingOptions>({})
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const {
    selectedEffect,
    isProcessing,
    processingProgress,
    setSelectedEffect,
    setIsProcessing,
    setProcessingProgress,
    addProcessedImage,
    updateProcessedImage,
    getProcessedImage
  } = useEffectsStore()

  // Initialize processed images when component mounts
  useEffect(() => {
    images.forEach((image, index) => {
      const imageId = `image-${index}`
      const existingImage = getProcessedImage(imageId)
      
      if (!existingImage) {
        addProcessedImage({
          imageId,
          originalImage: image,
          processedImage: image,
          appliedEffects: []
        })
      }
    })
  }, [images, addProcessedImage, getProcessedImage])

  const currentImage = images[selectedImageIndex]
  const currentImageId = `image-${selectedImageIndex}`
  const processedImage = getProcessedImage(currentImageId)

  const handleEffectSelect = (effect: typeof EFFECTS[0]) => {
    setSelectedEffect(effect)
    
    // Initialize default options
    const defaultOptions: ProcessingOptions = {}
    Object.entries(effect.parameters).forEach(([key, param]) => {
      if (typeof param === 'object' && 'default' in param) {
        defaultOptions[key as keyof ProcessingOptions] = param.default
      }
    })
    setEffectOptions(defaultOptions)
  }

  const handleOptionChange = (key: string, value: number | string) => {
    setEffectOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyEffect = async () => {
    if (!selectedEffect || !currentImage) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        const current = useEffectsStore.getState().processingProgress || 0
        if (current < 90) {
          setProcessingProgress(Math.min(current + 10, 90))
        }
      }, 100)

      // Apply effect
      const processedImageData = await canvasProcessor.processImage(
        currentImage,
        selectedEffect.id,
        effectOptions
      )

      clearInterval(progressInterval)
      setProcessingProgress(100)

      // Create effect record
      const effectRecord = {
        id: `effect-${Date.now()}`,
        effectId: selectedEffect.id,
        name: selectedEffect.name,
        options: effectOptions,
        timestamp: Date.now()
      }

      // Update processed image
      updateProcessedImage(currentImageId, {
        processedImage: processedImageData,
        appliedEffects: [...(processedImage?.appliedEffects || []), effectRecord]
      })

      // Notify parent component
      onImageUpdate?.(currentImageId, processedImageData)

      // Reset selection
      setSelectedEffect(null)
      setEffectOptions({})

    } catch (error) {
      console.error('Error applying effect:', error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      setDownloadError(null) // Clear any previous errors
      
      // Verify the image is still accessible
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Image not accessible')
      }
      
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `styled-selfie-with-effects-${index + 1}-${Date.now()}.jpeg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download image:', err)
      setDownloadError('Failed to download image. Please try again.')
    }
  }

  const handleUndo = () => {
    if (processedImage && processedImage.appliedEffects.length > 0) {
      const newEffects = processedImage.appliedEffects.slice(0, -1)
      updateProcessedImage(currentImageId, {
        appliedEffects: newEffects,
        processedImage: newEffects.length > 0 ? processedImage.processedImage : processedImage.originalImage
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
          <Wand2 className="h-5 w-5" />
          Apply Effects
        </h3>
        <p className="text-sm text-muted-foreground">
          Enhance your generated images with creative effects
        </p>
      </div>

      <Separator />

      {/* Error Display */}
      {downloadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-700">{downloadError}</p>
            <button
              onClick={() => setDownloadError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Image Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select Image</CardTitle>
          <CardDescription>Choose which image to apply effects to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <Button
                key={index}
                variant={selectedImageIndex === index ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedImageIndex(index)}
                className="h-20 p-1"
              >
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Effects Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Choose Effect</CardTitle>
          <CardDescription>Select an effect to apply to your image</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="blur" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {EFFECT_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  {category.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {EFFECT_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <ScrollArea className="h-48">
                  <div className="grid grid-cols-2 gap-2">
                    {getEffectsByCategory(category.id).map((effect) => (
                      <Card
                        key={effect.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedEffect?.id === effect.id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleEffectSelect(effect)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{effect.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs">{effect.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {effect.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Effect Options */}
      {selectedEffect && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {selectedEffect.name} Settings
            </CardTitle>
            <CardDescription>Adjust the effect parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(selectedEffect.parameters).map(([key, param]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                {param.type === 'text' ? (
                  <Input
                    value={effectOptions[key as keyof ProcessingOptions] || param.default || ''}
                    onChange={(e) => handleOptionChange(key, e.target.value)}
                    placeholder={param.default || ''}
                    maxLength={param.maxLength}
                    className="text-xs"
                  />
                ) : (
                  <div className="space-y-2">
                    <Slider
                      value={[effectOptions[key as keyof ProcessingOptions] as number || param.default || 0]}
                      onValueChange={([value]) => handleOptionChange(key, value)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{param.min}</span>
                      <span>{effectOptions[key as keyof ProcessingOptions] || param.default}</span>
                      <span>{param.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleApplyEffect}
          disabled={!selectedEffect || isProcessing}
          className="flex-1"
          size="sm"
        >
          {isProcessing ? (
            <>
              <Sparkles className="h-3 w-3 mr-1 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Wand2 className="h-3 w-3 mr-1" />
              Apply Effect
            </>
          )}
        </Button>
        
        {processedImage && processedImage.appliedEffects.length > 0 && (
          <Button
            onClick={handleUndo}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Undo
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Processing Effect</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applied Effects */}
      {processedImage && processedImage.appliedEffects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Applied Effects</CardTitle>
            <CardDescription>Effects currently applied to this image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {processedImage.appliedEffects.map((effect) => (
                <Badge key={effect.id} variant="secondary" className="text-xs">
                  {effect.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Enhanced Results</CardTitle>
          <CardDescription>Your images with applied effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => {
              const imageId = `image-${index}`
              const processed = getProcessedImage(imageId)
              const displayImage = processed?.processedImage || image
              
              return (
                <div key={index} className="space-y-2">
                  <div className="relative">
                    <img
                      src={displayImage}
                      alt={`Enhanced image ${index + 1}`}
                      className="w-full rounded-lg shadow-sm"
                    />
                    {processed?.appliedEffects.length > 0 && (
                      <Badge className="absolute top-2 right-2 text-xs">
                        {processed.appliedEffects.length} effect{processed.appliedEffects.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDownload(displayImage, index)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download {index + 1}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}