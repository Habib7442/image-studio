'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useImageEditorStore } from '@/store/image-editor-store'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Camera,
  Sparkles,
  Upload,
  Download,
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export function AIEditorMain() {
  const { profile, isSignedIn, refreshProfile } = useAuth()
  const {
    currentImage,
    settings,
    isGenerating,
    generationProgress,
    error,
    setCurrentImage,
    setIsGenerating,
    setGenerationProgress,
    setError,
    loadImage,
    addAIEdit,
  } = useImageEditorStore()

  const [prompt, setPrompt] = useState('')
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editHistory, setEditHistory] = useState<Array<{
    id: string;
    prompt: string;
    timestamp: Date;
    imageUrl: string;
  }>>([])
  const [isFollowUp, setIsFollowUp] = useState(false)

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load history from Supabase on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (isSignedIn) {
        try {
          const response = await fetch('/api/ai-editor/history')
          if (response.ok) {
            const data = await response.json()
            // You could add a function to load history into the store if needed
            console.log('Loaded history:', data.history)
          }
        } catch (error) {
          console.error('Failed to load history:', error)
        }
      }
    }

    loadHistory()
  }, [isSignedIn])

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file) return

    // Basic file validation
    const MAX_FILE_SIZE_MB = 10
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`)
      setShowErrorDialog(true)
      return
    }

    loadImage(file).catch((error) => {
      console.error('Error loading image:', error)
      setError('Failed to load image.')
      setShowErrorDialog(true)
    })
  }

  // Handle AI generation
  const handleAIGenerate = async (toolId: string, isFollowUpEdit = false) => {
    if (!currentImage) {
      setError('Please upload an image first')
      setShowErrorDialog(true)
      return
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt describing your vision')
      setShowErrorDialog(true)
      return
    }

    // Check if user has credits
    if (isSignedIn && profile && profile.credits_left <= 0) {
      setError('No credits remaining. Credits reset daily.')
      setShowErrorDialog(true)
      return
    }

    // Prevent multiple simultaneous requests
    if (isGenerating) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setGenerationProgress(0)
    setIsFollowUp(isFollowUpEdit)

    // Declare progress interval outside try block for cleanup
    let progressInterval: NodeJS.Timeout | undefined

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout

      // Simulate progress to show user that generation is happening
      progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) return prev // Don't go to 100% until we get the response
          return prev + Math.random() * 10
        })
      }, 2000)

      const response = await fetch('/api/ai-editor/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image: currentImage.src,
          tool: toolId,
          settings: settings,
        }),
        signal: controller.signal,
      })

          clearTimeout(timeoutId)
          if (progressInterval) {
            clearInterval(progressInterval) // Clear progress simulation
          }
          setGenerationProgress(100) // Complete progress bar

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)

        // Try to parse the error message from the response
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            throw new Error(errorData.error)
          }
        } catch (parseError) {
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
          setError(data.error || 'Failed to generate image')
        }
        setShowErrorDialog(true)
        return
      }

      // Add AI edit to store
      addAIEdit({
        prompt: prompt.trim(),
        strength: settings.aiStrength,
        model: 'gemini-2.5-flash',
        result: data.result,
      })

      // Add to edit history
      const editEntry = {
        id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt: prompt.trim(),
        timestamp: new Date(),
        imageUrl: data.result,
      }
      setEditHistory(prev => [...prev, editEntry])

      // Update current image with result
      setCurrentImage({
        ...currentImage,
        src: data.result,
      })

      // Reset generating state immediately after success
      setIsGenerating(false)

      // Clear prompt
      setPrompt('')

      // Refresh profile to get updated credits (async, don't await)
      if (refreshProfile) {
        refreshProfile().catch((error) => {
          console.error('Error refreshing profile:', error)
        })
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
  const downloadImage = () => {
    if (!currentImage) return

    try {
      const link = document.createElement('a')
      link.href = currentImage.src
      link.download = `ai-edited-${currentImage.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading image:', error)
      setError('Failed to download image.')
      setShowErrorDialog(true)
    }
  }

  // Copy image to clipboard
  const copyImageToClipboard = async () => {
    if (!currentImage) return

    try {
      const response = await fetch(currentImage.src)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
      setCopiedId('current')
      setTimeout(() => setCopiedId(null), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Error copying image to clipboard:', error)
      setError('Failed to copy image to clipboard.')
      setShowErrorDialog(true)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png?v=2"
                alt="ImageStudioLab Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-center">
              AI Image Editor
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The world&apos;s most powerful AI-powered image editor. Better than Photoshop and Lightroom.
          </p>
        </div>

        <div className="w-full">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Image Upload/Display */}
            <div className="flex justify-center items-center min-h-[60vh]">
              <Card className="w-full max-w-4xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  {currentImage ? 'Edit Image' : 'Upload Image'}
                </CardTitle>
                <CardDescription>
                  {currentImage ? 'Your image is ready for AI editing' : 'Upload an image to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentImage ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <Image
                        src={currentImage.src}
                        alt="Current image"
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-96 object-contain rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={downloadImage}
                          >
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={copyImageToClipboard}
                          >
                            {copiedId === 'current' ? (
                              <span className="text-green-500">Copied!</span>
                            ) : (
                              <span>Copy</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Name:</strong> {currentImage.name}</p>
                      <p><strong>Size:</strong> {currentImage.width} × {currentImage.height}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload an image to get started</p>
                    <p className="text-muted-foreground mb-4">Drag and drop or click to browse</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                      className="hidden"
                    />
                  </div>
                )}
              </CardContent>
              </Card>
            </div>


            {/* AI Prompt and Generation */}
            {currentImage && (
              <div className="flex justify-center">
                <Card className="w-full max-w-4xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {editHistory.length === 0 ? 'AI Editing' : 'Initial Edit'}
                  </CardTitle>
                  <CardDescription>
                    {editHistory.length === 0 
                      ? 'Describe how you want to edit your image' 
                      : 'Make your first edit to get started with follow-up prompts'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
                      Describe Your Vision
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g., 'Make this a professional headshot with dramatic lighting' or 'Create a modern advertising poster with clean background'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={3}
                      className="w-full"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      💡 <strong>Tips for better results:</strong>
                      <ul className="mt-1 space-y-1 ml-4">
                        <li>• Be specific about style: &quot;professional&quot;, &quot;modern&quot;, &quot;vintage&quot;</li>
                        <li>• Mention lighting: &quot;dramatic lighting&quot;, &quot;soft natural light&quot;</li>
                        <li>• Specify background: &quot;clean white background&quot;, &quot;studio setting&quot;</li>
                        <li>• Avoid complex requests that might confuse the AI</li>
                      </ul>
                      <div className="mt-2">
                        <strong>Quick suggestions:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            "Professional headshot",
                            "Modern advertising poster", 
                            "Clean white background",
                            "Dramatic lighting",
                            "Studio photography style"
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setPrompt(suggestion)}
                              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded border"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Enhance
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {isSignedIn && profile && `(${profile.credits_left} credits left)`}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAIGenerate('ai-enhance', false)}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex items-center"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          {isFollowUp ? 'Refining...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {editHistory.length === 0 ? 'Generate' : 'Make Edit'}
                        </>
                      )}
                    </Button>
                  </div>

                      {/* Progress Bar */}
                      {isGenerating && (
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Generating AI edit...</span>
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
                </CardContent>
                </Card>
              </div>
            )}
          </div>

       
        </div>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-500">
                <Sparkles className="w-5 h-5 mr-2" />
                Generation Error
              </AlertDialogTitle>
              <AlertDialogDescription>
                {error || 'An unexpected error occurred during image generation.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                Got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
