'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Camera, Download, Eye, Sparkles, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { StyleSelection } from '@/components/ui/style-selection'
import { compressImageWithFallback } from '@/lib/image-compression'
import Image from 'next/image'

export default function HugChildhoodPage() {
  const { profile, isSignedIn } = useAuth()
  const [currentImage, setCurrentImage] = useState<File | null>(null)
  const [childhoodImage, setChildhoodImage] = useState<File | null>(null)
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null)
  const [childhoodImagePreview, setChildhoodImagePreview] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [selectedFilters, setSelectedFilters] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generationProgress, setGenerationProgress] = useState(0)

  const currentImageRef = useRef<HTMLInputElement>(null)
  const childhoodImageRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File, type: 'current' | 'childhood') => {
    if (!file) return

    try {
      setIsCompressing(true)
      
      // Compress image to reduce payload size
      const { dataUrl, wasCompressed, error: compressionError } = await compressImageWithFallback(file)
      
      if (type === 'current') {
        setCurrentImage(file)
        setCurrentImagePreview(dataUrl)
      } else {
        setChildhoodImage(file)
        setChildhoodImagePreview(dataUrl)
      }
      
      // Show warning if compression failed
      if (!wasCompressed && compressionError) {
        console.warn('Compression failed:', compressionError)
      }
    } catch (error) {
      console.error('Image processing failed:', error)
      // Fallback to original file
      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'current') {
          setCurrentImage(file)
          setCurrentImagePreview(e.target?.result as string)
        } else {
          setChildhoodImage(file)
          setChildhoodImagePreview(e.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleGenerate = async () => {
    if (!currentImage || !childhoodImage) {
      alert('Please upload both your current photo and childhood photo')
      return
    }

    if (!isSignedIn || !profile || profile.credits_left <= 0) {
      alert('No credits remaining. Credits reset daily.')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 2000)

    try {
      // Convert images to base64
      const currentImageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(currentImage)
      })

      const childhoodImageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(childhoodImage)
      })

      const response = await fetch('/api/hug-childhood/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentImage: currentImageBase64,
          childhoodImage: childhoodImageBase64,
          template: selectedTemplate,
          filters: selectedFilters,
        }),
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate images')
      }

      const data = await response.json()
      setGeneratedImages(data.images || [])
    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate images. Please try again.'
      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `hug-childhood-${index + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canGenerate = currentImage && childhoodImage && (selectedTemplate || selectedFilters.length > 0)

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">Hug Your Childhood</h1>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <Flame className="w-3 h-3 mr-1" />
                TRENDING
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">Create heartwarming memories by combining your current and childhood photos</p>
        </div>

        <div className="w-full space-y-6">
            {/* Photo Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Upload Photos
                </CardTitle>
                <CardDescription>
                  Upload your current photo and childhood photo to create magical memories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Photo Upload */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Current Photo</h3>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    {currentImagePreview ? (
                      <div className="space-y-4">
                        <Image
                          src={currentImagePreview}
                          alt="Current photo"
                          width={200}
                          height={200}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentImage(null)
                            setCurrentImagePreview(null)
                          }}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-lg font-medium">Upload your current photo</p>
                        <Button onClick={() => currentImageRef.current?.click()}>
                          Choose File
                        </Button>
                        <input
                          ref={currentImageRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'current')
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Childhood Photo Upload */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Childhood Photo</h3>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    {childhoodImagePreview ? (
                      <div className="space-y-4">
                        <Image
                          src={childhoodImagePreview}
                          alt="Childhood photo"
                          width={200}
                          height={200}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setChildhoodImage(null)
                            setChildhoodImagePreview(null)
                          }}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-lg font-medium">Upload your childhood photo</p>
                        <Button onClick={() => childhoodImageRef.current?.click()}>
                          Choose File
                        </Button>
                        <input
                          ref={childhoodImageRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'childhood')
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Choose Style
                </CardTitle>
                <CardDescription>
                  Select templates and filters to enhance your memory creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StyleSelection
                  onStyleChange={(template, filters) => {
                    setSelectedTemplate(template)
                    setSelectedFilters(filters)
                  }}
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Memory Creation
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {isSignedIn && profile && `(${profile.credits_left} credits left)`}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Memories...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Memory (1 credit)
                      </>
                    )}
                  </Button>

                  {/* Progress Bar */}
                  {isGenerating && (
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Creating your memory...</span>
                        <span>{Math.round(generationProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Your Memory Created
                  </CardTitle>
                  <CardDescription>
                    Here are your 3 variations of the heartwarming memory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={imageUrl}
                          alt={`Memory variation ${index + 1}`}
                          width={400}
                          height={400}
                          className="w-full rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => downloadImage(imageUrl, index)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span>•</span>
          <span>No unsaved changes</span>
        </div>

        <div className="flex items-center space-x-4">
          <span>Page 1 of 1</span>
          <span>•</span>
          <span>AI Studio</span>
        </div>
      </div>
    </div>
  )
}
