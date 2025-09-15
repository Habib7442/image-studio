'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
// Remove direct Supabase import - we'll use API instead
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Download,
  RotateCcw,
  Settings,
  Sparkles,
  Wand2,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  Clock
} from 'lucide-react'
import { canvasProcessor } from '@/lib/effects/canvas-processor'
import { useEffectsStore } from '@/store/effects-store'
import { ProcessingOptions } from '@/lib/effects'
import { EFFECTS, EFFECT_CATEGORIES, getEffectsByCategory } from '@/lib/effects'
import Link from 'next/link'

interface GeneratedImage {
  id: string
  storage_path: string
  public_url: string
  signed_url?: string
  prompt: string
  style: string
  metadata: any
  created_at: string
  expires_at: string
}

export default function EditorPage() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
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

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      if (!isSignedIn || !userId) return

      try {
        const response = await fetch('/api/user/images')
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        
        const data = await response.json()
        setImages(data.images || [])
      } catch (error) {
        console.error('Error fetching images:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchImages()
    }
  }, [isLoaded, isSignedIn, userId])

  // Initialize processed images when component mounts
  useEffect(() => {
    images.forEach((image, index) => {
      const imageId = `image-${image.id}`
      const existingImage = getProcessedImage(imageId)
      
      if (!existingImage) {
        addProcessedImage({
          imageId,
          originalImage: image.signed_url || image.public_url,
          processedImage: image.signed_url || image.public_url,
          appliedEffects: []
        })
      }
    })
  }, [images, addProcessedImage, getProcessedImage])

  const currentImage = images[selectedImageIndex]
  const currentImageId = currentImage ? `image-${currentImage.id}` : ''
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
        currentImage.signed_url || currentImage.public_url,
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

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      setDownloadError(null)
      
      // Fetch the image as a blob
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Image not accessible')
      }
      
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to access the editor</h1>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your images...</p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">No images found</h1>
          <p className="text-muted-foreground">Generate some images first to start editing</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Image Editor</h1>
                <p className="text-sm text-muted-foreground">
                  Edit and enhance your generated images
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {images.length} images available
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Image Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Images</CardTitle>
                <CardDescription>Select an image to edit</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedImageIndex === index
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <div className="flex gap-3">
                          <img
                            src={image.signed_url || image.public_url}
                            alt={`Generated image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {image.style || 'Generated Image'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {image.prompt}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(image.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Editor */}
          <div className="lg:col-span-2">
            {currentImage && (
              <div className="space-y-6">
                {/* Current Image Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Image</CardTitle>
                    <CardDescription>
                      {currentImage.style} • {formatDate(currentImage.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <img
                        src={processedImage?.processedImage || currentImage.signed_url || currentImage.public_url}
                        alt="Current image"
                        className="w-full max-h-96 object-contain rounded-lg"
                      />
                      {processedImage?.appliedEffects.length > 0 && (
                        <Badge className="absolute top-2 right-2">
                          {processedImage.appliedEffects.length} effect{processedImage.appliedEffects.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Effects Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Apply Effects
                    </CardTitle>
                    <CardDescription>
                      Enhance your image with creative effects
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    {/* Effects Categories */}
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

                    {/* Effect Options */}
                    {selectedEffect && (
                      <div className="space-y-4">
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            {selectedEffect.name} Settings
                          </h4>
                          {Object.entries(selectedEffect.parameters).map(([key, param]) => (
                            <div key={key} className="space-y-2">
                              <Label className="text-sm capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Label>
                              {param.type === 'text' ? (
                                <Input
                                  value={effectOptions[key as keyof ProcessingOptions] || param.default || ''}
                                  onChange={(e) => handleOptionChange(key, e.target.value)}
                                  placeholder={param.default || ''}
                                  maxLength={param.maxLength}
                                  className="text-sm"
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
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{param.min}</span>
                                    <span>{effectOptions[key as keyof ProcessingOptions] || param.default}</span>
                                    <span>{param.max}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApplyEffect}
                        disabled={!selectedEffect || isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Apply Effect
                          </>
                        )}
                      </Button>
                      
                      {processedImage && processedImage.appliedEffects.length > 0 && (
                        <Button
                          onClick={handleUndo}
                          variant="outline"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Undo
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
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
                    )}

                    {/* Applied Effects */}
                    {processedImage && processedImage.appliedEffects.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Applied Effects</h4>
                        <div className="flex flex-wrap gap-2">
                          {processedImage.appliedEffects.map((effect) => (
                            <Badge key={effect.id} variant="secondary" className="text-xs">
                              {effect.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Download Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Download</CardTitle>
                    <CardDescription>
                      Download your edited image
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        const filename = `edited-${currentImage.style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
                        handleDownload(
                          processedImage?.processedImage || currentImage.signed_url || currentImage.public_url,
                          filename
                        )
                      }}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Edited Image
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
