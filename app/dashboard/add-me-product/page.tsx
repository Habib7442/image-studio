'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Sparkles, 
  Download, 
  AlertCircle,
  Clock,
  Image as ImageIcon,
  AlertTriangle,
  Package,
  User
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { StyleSelection } from '@/components/ui/style-selection'
import { AdTemplateSelector } from '@/components/ui/ad-template-selector'
import { type StyleTemplate } from '@/lib/style-templates'
import { type FilterEffect } from '@/lib/filter-effects'
import { type AdTemplate } from '@/lib/ad-templates'

export default function AddMeProductPage() {
  const { profile, isSignedIn, isProfileLoading, refreshProfile } = useAuth()
  
  // Form state
  const [prompt, setPrompt] = useState('')
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [productImage, setProductImage] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<StyleTemplate | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<FilterEffect[]>([])
  const [selectedAdTemplate, setSelectedAdTemplate] = useState<AdTemplate | null>(null)
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<TempImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [copiedId] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  
  // Temporary image interface
  interface TempImage {
    id: string
    src: string
    prompt: string
    generatedAt: string
  }
  
  // File input refs
  const selfieInputRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)

  // Handle style selection changes
  const handleStyleChange = (newPrompt: string, template?: StyleTemplate, filters?: FilterEffect[]) => {
    setPrompt(newPrompt)
    setSelectedTemplate(template || null)
    setSelectedFilters(filters || [])
  }

  // Handle ad template selection
  const handleAdTemplateSelect = (template: AdTemplate | null) => {
    setSelectedAdTemplate(template)
    if (template) {
      setPrompt(template.prompt)
    }
  }

  // Handle surprise me
  const handleSurpriseMe = () => {
    // The template selector will handle the random selection
  }

  // Compress image to reduce payload size
  const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'selfie' | 'product') => {
    if (!file) return
    
    // Basic file validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }
    
    try {
      setIsCompressing(true)
      setError(null)
      
      // Compress image to reduce payload size
      const compressedImage = await compressImage(file, 1024, 0.8)
      
      if (type === 'selfie') {
        setSelfieImage(compressedImage)
      } else {
        setProductImage(compressedImage)
      }
    } catch (error) {
      console.error('Image compression failed:', error)
      setError('Failed to process image. Please try again.')
    } finally {
      setIsCompressing(false)
    }
  }

  // Generate images
  const handleGenerate = async () => {
    if (!selfieImage) {
      setError('Please upload a selfie image')
      return
    }

    if (!productImage) {
      setError('Please upload a product image')
      return
    }

    // Check if user has credits
    if (isSignedIn && profile && profile.credits_left <= 0) {
      setError('No credits remaining. Credits reset daily.')
      return
    }

    // Prevent multiple simultaneous requests
    if (isGenerating) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setGenerationProgress(0)

    // Declare progress interval outside try block for cleanup
    let progressInterval: NodeJS.Timeout | undefined

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout
      
      // Simulate progress to show user that generation is happening
      progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev // Don't go to 100% until we get the response
          return prev + Math.random() * 10
        })
      }, 2000)

      const response = await fetch('/api/add-me-product/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          selfieImage,
          productImage,
          template: selectedTemplate,
          filters: selectedFilters,
          adTemplate: selectedAdTemplate,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval) // Clear progress simulation

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        // Try to parse the error message from the response
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            throw new Error(errorData.error)
          }
        } catch {
          // If parsing fails, use the raw error text or fallback
          throw new Error(errorText || `HTTP error! status: ${response.status}`)
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error(text || 'Server returned non-JSON response')
      }

      const data = await response.json()

      if (data.error) {
        // Handle specific error types with better user messaging
        if (data.errorType === 'QUOTA_EXCEEDED') {
          setError('🚫 Daily quota exceeded! You\'ve reached the free tier limit. Please try again tomorrow or consider upgrading your plan.')
        } else if (data.errorType === 'RATE_LIMITED') {
          setError('⏳ Too many requests! Please wait a few minutes before trying again.')
        } else {
          setError(data.error || 'Failed to generate images')
        }
        setShowErrorDialog(true)
        return
      }

      // Create temporary images for immediate display (NO STORAGE)
      const timestamp = Date.now()
      const tempImages: TempImage[] = data.images.map((imageData: string, index: number) => ({
        id: `temp-${timestamp}-${index}`,
        src: imageData, // Direct base64 data
        prompt: data.prompt,
        generatedAt: data.generatedAt
      }))

      console.log(`Received ${data.images.length} images from API - showing immediately`)

      // Show images immediately
      const updatedImages = [...tempImages, ...generatedImages]
      setGeneratedImages(updatedImages)

      // Show download warning notification
      const warningNotification = document.createElement('div')
      warningNotification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      warningNotification.innerHTML = `
        <div class="flex items-center">
          <div class="w-4 h-4 mr-2">⚠️</div>
          <div>
            <div class="font-bold">Download Now!</div>
            <div class="text-sm">Images will be lost on page refresh</div>
          </div>
        </div>
      `
      document.body.appendChild(warningNotification)
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        if (warningNotification.parentNode) {
          warningNotification.parentNode.removeChild(warningNotification)
        }
      }, 5000)

      // Reset generating state immediately after success
      setIsGenerating(false)

      // Clear form immediately
      setPrompt('')
      setSelfieImage(null)
      setProductImage(null)
      if (selfieInputRef.current) selfieInputRef.current.value = ''
      if (productInputRef.current) productInputRef.current.value = ''

      // Refresh profile to get updated credits (async, don't await)
      if (refreshProfile) {
        refreshProfile().catch(console.error)
      } else {
        console.warn('refreshProfile function not available')
      }

    } catch (error) {
      console.error('Generation error:', error)
      
      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Generation is taking longer than expected. Please try again with a simpler prompt or check your internet connection.')
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setError('Network error. Please check your internet connection and try again.')
        } else if (error.message.includes('HTTP error! status: 429')) {
          setError('Too many requests. Please wait a moment before trying again.')
        } else if (error.message.includes('HTTP error! status: 500')) {
          setError('Server error. Please try again in a few moments.')
        } else if (error.message.includes('HTTP error! status: 401')) {
          setError('Authentication error. Please sign in again.')
        } else if (error.message.includes('HTTP error! status: 403')) {
          setError('Access denied. Please check your permissions.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      setShowErrorDialog(true)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(100) // Complete progress bar
    }
  }

  // Download image
  const downloadImage = (image: TempImage) => {
    try {
      const link = document.createElement('a')
      link.href = image.src
      link.download = `add-me-product-${image.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download image:', error)
      alert('Download failed. Please try long-pressing the image and selecting "Save to Photos" or "Download image"')
    }
  }

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Main Header */}
        <div className="mb-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden">
              <Image 
                src="/logo.png?v=2" 
                alt="ImageStudioLab Logo" 
                width={40} 
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-center">
              Add Me + Product
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional product advertisements with you and any product. Perfect for social media, marketing, and brand promotion.
          </p>
        </div>

        {/* Generation Form */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl flex items-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
              Create Your Product Ad
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Upload your selfie and a product image, then choose your ad style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selfie Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <User className="w-4 h-4 inline mr-1" />
                  Upload Your Selfie
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'selfie')
                    }}
                    className="flex-1 w-full"
                    disabled={isCompressing}
                  />
                  {isCompressing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Compressing...
                    </div>
                  )}
                  {selfieImage && !isCompressing && (
                    <div className="w-16 h-16 rounded-lg border-2 border-primary overflow-hidden flex-shrink-0">
                      <Image 
                        src={selfieImage} 
                        alt="Selfie preview" 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Package className="w-4 h-4 inline mr-1" />
                  Upload Product Image
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Input
                    ref={productInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'product')
                    }}
                    className="flex-1 w-full"
                    disabled={isCompressing}
                  />
                  {isCompressing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Compressing...
                    </div>
                  )}
                  {productImage && !isCompressing && (
                    <div className="w-16 h-16 rounded-lg border-2 border-primary overflow-hidden flex-shrink-0">
                      <Image 
                        src={productImage} 
                        alt="Product preview" 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ad Template Selector */}
            <div>
              <h3 className="text-sm font-medium mb-3">Choose Ad Style Template</h3>
              <AdTemplateSelector
                selectedTemplate={selectedAdTemplate}
                onTemplateSelect={handleAdTemplateSelect}
                onSurpriseMe={handleSurpriseMe}
              />
            </div>

            {/* Style Selection (Templates + Filters) */}
            <div>
              <h3 className="text-sm font-medium mb-3">Add Style Effects (Optional)</h3>
              <StyleSelection onStyleChange={handleStyleChange} />
            </div>

            {/* Instagram Optimization Info */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg">📱</span>
                <div>
                  <h4 className="text-blue-700 dark:text-blue-300 font-medium text-sm">Instagram Optimized</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    All images are generated in 1080×1350 pixels (4:5 aspect ratio) perfect for Instagram portrait posts. 
                    High-quality AI-generated product advertisements optimized for social media.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate}
              disabled={
                isGenerating || 
                (isSignedIn && profile && profile.credits_left <= 0) ||
                !selfieImage ||
                !productImage ||
                (!prompt.trim() && !selectedAdTemplate)
              }
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Generating 3 variations...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate 3 Variations {isSignedIn && profile && `(1 credit)`}
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Generating variations...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rate Limit Info */}
            <div className="text-center space-y-2">
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                15 generations per hour
              </Badge>
              <p className="text-xs text-muted-foreground">
                Each generation creates 3 unique variations optimized for Instagram (1080x1350)
              </p>
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-700 font-medium">
                  ⚠️ Images are temporary - download them now or they&apos;ll be lost on page refresh!
                </p>
              </div>
              {isGenerating && (
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Generating 3 variations... (Images will appear instantly!)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Images */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center">
            <ImageIcon className="w-6 h-6 mr-2 text-primary" />
            Your Product Advertisements
          </h2>
          
          {generatedImages.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No product ads yet</h3>
                <p className="text-muted-foreground text-center">
                  Create your first product advertisement using the form above
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Image Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((image) => (
                  <Card key={image.id} className="border shadow-lg overflow-hidden group">
                    <div className="relative">
                      <Image 
                        src={image.src} 
                        alt="Generated product advertisement" 
                        width={400}
                        height={500}
                        className="w-full h-auto object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => downloadImage(image)}
                            disabled={copiedId === image.id}
                          >
                            {copiedId === image.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      {/* Visible download button on small screens */}
                      <div className="absolute bottom-2 right-2 sm:hidden">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => downloadImage(image)}
                          className="h-8 px-2"
                          disabled={copiedId === image.id}
                        >
                          {copiedId === image.id ? (
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="text-orange-600 font-medium">
                          ⚠️ Download now - will be lost on refresh
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.prompt.length > 60 ? `${image.prompt.substring(0, 60)}...` : image.prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Generation Error
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2">
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowErrorDialog(false)
                setError(null)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
