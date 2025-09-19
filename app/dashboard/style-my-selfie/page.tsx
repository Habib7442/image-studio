'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Download, 
  Check,
  AlertCircle,
  Clock,
  Zap,
  Image as ImageIcon,
  User,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function StyleMySelfiePage() {
  const { user, profile, isAuthenticated, isLoading, refreshProfile } = useAuth()
  const router = useRouter()
  
  // Form state
  const [prompt, setPrompt] = useState('')
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<TempImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const [progressMessage, setProgressMessage] = useState('')
  
  // Temporary image interface
  interface TempImage {
    id: string
    src: string
    prompt: string
    generatedAt: string
  }
  
  // File input refs
  const selfieInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear progress interval on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [])

  // Poll progress updates
  const pollProgress = async (requestId: string) => {
    try {
      const response = await fetch(`/api/style-my-selfie/progress?requestId=${requestId}`)
      const data = await response.json()
      
      if (data.error) {
        console.error('Progress polling error:', data.error)
        return
      }

      setGenerationProgress(data.progress)
      setProgressMessage(data.message)

      if (data.status === 'completed' && data.result) {
        // Generation completed successfully
        const timestamp = Date.now()
        const tempImages: TempImage[] = data.result.images.map((imageData: string, index: number) => ({
          id: `temp-${timestamp}-${index}`,
          src: imageData,
          prompt: prompt,
          generatedAt: new Date().toISOString()
        }))

        setGeneratedImages(prev => [...tempImages, ...prev])
        setIsGenerating(false)
        setCurrentRequestId(null)
        
        // Clear form
        setPrompt('')
        setSelfieImage(null)
        if (selfieInputRef.current) selfieInputRef.current.value = ''

        // Refresh profile to get updated credits
        if (refreshProfile) {
          refreshProfile().catch(console.error)
        }

        // Clear progress interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        // Show success notification
        const successNotification = document.createElement('div')
        successNotification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
        successNotification.innerHTML = `
          <div class="flex items-center">
            <div class="w-4 h-4 mr-2">✅</div>
            <div>
              <div class="font-bold">Generation Complete!</div>
              <div class="text-sm">Your styled selfies are ready</div>
            </div>
          </div>
        `
        document.body.appendChild(successNotification)
        
        setTimeout(() => {
          if (successNotification.parentNode) {
            successNotification.parentNode.removeChild(successNotification)
          }
        }, 5000)

      } else if (data.status === 'failed') {
        // Generation failed
        setError(data.error || 'Generation failed')
        setShowErrorDialog(true)
        setIsGenerating(false)
        setCurrentRequestId(null)
        
        // Clear progress interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      }
    } catch (error) {
      console.error('Progress polling error:', error)
    }
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
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
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setSelfieImage(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  // Generate images
  const handleGenerate = async () => {
    if (!selfieImage) {
      setError('Please upload a selfie image')
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt describing your vision')
      return
    }

    // Check if user has credits
    if (isAuthenticated && profile && profile.credits_left <= 0) {
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
    setProgressMessage('Starting generation...')

    try {
      const response = await fetch('/api/style-my-selfie/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          selfieImage,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            throw new Error(errorData.error)
          }
        } catch (parseError) {
          throw new Error(errorText || `HTTP error! status: ${response.status}`)
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error || 'Failed to start generation')
        setShowErrorDialog(true)
        setIsGenerating(false)
        return
      }

      // Start polling for progress updates
      if (data.requestId) {
        setCurrentRequestId(data.requestId)
        progressIntervalRef.current = setInterval(() => {
          pollProgress(data.requestId)
        }, 2000) // Poll every 2 seconds
      } else {
        throw new Error('No request ID received')
      }

    } catch (error) {
      console.error('Generation error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
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
      setIsGenerating(false)
    }
  }

  // Download image
  const downloadImage = (image: TempImage) => {
    try {
      const link = document.createElement('a')
      link.href = image.src
      link.download = `style-my-selfie-${image.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download image:', error)
      alert('Download failed. Please try long-pressing the image and selecting "Save to Photos" or "Download image"')
    }
  }

  if (isLoading) {
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
              Style My Selfie
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your selfies with AI-powered styling. Professional, creative, and artistic looks in seconds.
          </p>
        </div>

        {/* Generation Form */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl flex items-center">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
              Upload Your Selfie
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Upload a clear selfie and describe how you want to be styled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Selfie Upload */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Upload Your Selfie
              </Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="flex-1 w-full"
                />
                {selfieImage && (
                  <div className="w-16 h-16 rounded-lg border-2 border-primary overflow-hidden flex-shrink-0">
                    <img 
                      src={selfieImage} 
                      alt="Selfie preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
                Describe Your Vision
              </Label>
              
              <Textarea
                id="prompt"
                placeholder="e.g., Professional headshot in a modern office, wearing a blue suit, natural lighting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] w-full resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {prompt.length}/1000 characters
              </div>
              
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Instagram Optimized:</strong> All images are generated in 1080x1350 pixels (4:5 aspect ratio) perfect for Instagram portrait posts. 
                  High-quality AI-generated images optimized for Instagram.
                </p>
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
                (isAuthenticated && profile && profile.credits_left <= 0) ||
                !prompt.trim() ||
                !selfieImage
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
                  Generate 3 Variations {isAuthenticated && profile && `(1 credit)`}
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progressMessage || 'Generating variations...'}</span>
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
                  ⚠️ Images are temporary - download them now or they'll be lost on page refresh!
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
            Your Styled Selfies
          </h2>
          
          {generatedImages.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No styled selfies yet</h3>
                <p className="text-muted-foreground text-center">
                  Create your first styled selfie using the form above
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
                      <img 
                        src={image.src} 
                        alt="Generated styled selfie" 
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
