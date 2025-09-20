'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { compressImageWithFallback } from '@/lib/image-compression'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Shirt, 
  Sparkles, 
  Download, 
  AlertCircle,
  Clock,
  Image as ImageIcon,
  AlertTriangle,
  User,
  Package
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function VirtualTryOnPage() {
  const { profile, isSignedIn, isProfileLoading, refreshProfile } = useAuth()
  
  // Form state
  const [prompt, setPrompt] = useState('')
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [clothingImage, setClothingImage] = useState<string | null>(null)
  
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
  const clothingInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'selfie' | 'clothing') => {
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
      const { dataUrl, wasCompressed, error: compressionError } = await compressImageWithFallback(file)
      
      if (type === 'selfie') {
        setSelfieImage(dataUrl)
      } else {
        setClothingImage(dataUrl)
      }
      
      // Show warning if compression failed
      if (!wasCompressed && compressionError) {
        setError(compressionError)
      }
    } catch (error) {
      console.error('Image processing failed:', error)
      setError('Failed to process image. Please try a smaller file.')
    } finally {
      setIsCompressing(false)
    }
  }

  // Generate images
  const handleGenerate = async () => {
    if (!selfieImage) {
      setError('Please upload your photo')
      return
    }

    if (!clothingImage) {
      setError('Please upload a clothing/accessory image')
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

      const response = await fetch('/api/virtual-try-on/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Create a perfect virtual try-on experience by seamlessly merging the uploaded clothing/accessory item with the person from the uploaded selfie image. The clothing or accessory should appear naturally worn by the person from the selfie, with proper fit, realistic draping, and authentic integration.',
          selfieImage,
          clothingImage,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval) // Clear progress simulation

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Generation response:', data)

      if (data.images && data.images.length > 0) {
        const newImages: TempImage[] = data.images.map((imageUrl: string, index: number) => ({
          id: `virtual-try-on-${Date.now()}-${index}`,
          src: imageUrl,
          prompt: prompt || 'Virtual try-on generation',
          generatedAt: new Date().toISOString(),
        }))
        
        setGeneratedImages(prev => [...newImages, ...prev])
        setGenerationProgress(100)
        
        // Refresh user profile to update credits
        if (isSignedIn) {
          await refreshProfile()
        }
      } else {
        throw new Error('No images were generated. Please try again.')
      }
    } catch (error) {
      console.error('Generation error:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Generation timed out. Please try again with a simpler prompt.')
        } else if (error.message.includes('quota')) {
          setError('🚫 Daily quota exceeded! You\'ve reached the free tier limit. Please try again tomorrow.')
        } else if (error.message.includes('rate limit')) {
          setError('⏰ Rate limit exceeded. Please wait a moment before trying again.')
        } else if (error.message.includes('authentication')) {
          setError('🔐 Authentication required. Please sign in to generate images.')
        } else {
          setError(`Generation failed: ${error.message}`)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      
      setShowErrorDialog(true)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }

  // Download image
  const handleDownload = (imageUrl: string, imageId: string) => {
    try {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `virtual-try-on-${imageId}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try long-pressing the image and selecting "Save to Photos" or "Download image"')
    }
  }

  // Copy image URL
  const handleCopyUrl = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      // You could add a toast notification here
    } catch (error) {
      console.error('Copy failed:', error)
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
              Virtual Try-On
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Try fashion, accessories, or looks instantly with AI-powered virtual try-on technology.
          </p>
          
          {/* Example Image */}
          <div className="mt-6 flex justify-center">
            <div className="max-w-2xl w-full">
              <Image
                src="/virtual-try-on.png"
                alt="Virtual Try-On Example"
                width={800}
                height={400}
                className="w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                priority
              />
            </div>
          </div>
        </div>

        {/* Generation Form */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl flex items-center">
              <Shirt className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
              Upload Your Photos
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Upload your photo and clothing/accessory to see how it looks on you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selfie Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <User className="w-4 h-4 inline mr-1" />
                  Upload Your Photo
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

              {/* Clothing Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Package className="w-4 h-4 inline mr-1" />
                  Upload Clothing/Accessory
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Input
                    ref={clothingInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'clothing')
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
                  {clothingImage && !isCompressing && (
                    <div className="w-16 h-16 rounded-lg border-2 border-primary overflow-hidden flex-shrink-0">
                      <Image 
                        src={clothingImage} 
                        alt="Clothing preview" 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Describe Your Vision (Optional)
              </Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Make it look like a professional fashion shoot' or 'Add dramatic lighting'"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use default virtual try-on prompt
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!selfieImage || !clothingImage || isGenerating || isCompressing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Virtual Try-On (1 credit)
                  </div>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Generating your virtual try-on...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl flex items-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
                Your Virtual Try-On Results
              </CardTitle>
              <CardDescription>
                {generatedImages.length} virtual try-on{generatedImages.length > 1 ? 's' : ''} generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-[4/5] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <Image
                        src={image.src}
                        alt="Virtual try-on result"
                        width={400}
                        height={500}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(image.src, image.id)}
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg border border-gray-200"
                        >
                          <Download className="w-3 h-3 text-black" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="truncate">{image.prompt}</div>
                      <div className="text-gray-400">
                        {new Date(image.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Generation Failed
              </AlertDialogTitle>
              <AlertDialogDescription>
                {error || 'An unexpected error occurred while generating your virtual try-on.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                Try Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
