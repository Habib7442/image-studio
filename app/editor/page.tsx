'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Image as ImageIcon,
  Clock
} from 'lucide-react'
import { CanvasEditor } from '@/components/editor/canvas-editor'
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
  const [downloadError, setDownloadError] = useState<string | null>(null)

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

  const currentImage = images[selectedImageIndex]

  const handleDownload = async (imageData: string, filename: string) => {
    try {
      setDownloadError(null)
      
      // Check if it's a base64 data URL or a regular URL
      if (imageData.startsWith('data:image/')) {
        // It's already a base64 data URL, convert directly to blob
        const base64Data = imageData.split(',')[1]
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        const blob = new Blob([bytes], { type: 'image/jpeg' })
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // It's a regular URL, fetch it first
        const response = await fetch(imageData)
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
      }
    } catch (err) {
      console.error('Failed to download image:', err)
      setDownloadError('Failed to download image. Please try again.')
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

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Layout - Stacked */}
        <div className="block lg:hidden space-y-4">
          {/* Mobile Image Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Images</CardTitle>
              <CardDescription className="text-sm">Select an image to edit</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-32">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`flex-shrink-0 w-24 p-2 rounded-lg border cursor-pointer transition-all ${
                        selectedImageIndex === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image.signed_url || image.public_url}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="font-medium text-xs truncate text-center">
                        {image.style || 'Generated Image'}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mobile Canvas Editor */}
          {currentImage ? (
            <div className="space-y-4">
              {/* Image Info */}
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{currentImage.style}</h3>
                    <p className="text-xs text-muted-foreground">Canvas Editor</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(currentImage.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Canvas Editor */}
              <CanvasEditor
                imageUrl={currentImage.signed_url || currentImage.public_url}
                onDownload={(processedImage) => {
                  const filename = `edited-${currentImage.style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
                  handleDownload(processedImage, filename)
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Select an image to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {/* Left Sidebar - Image Selection */}
          <div className="col-span-1">
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

          {/* Center - Canvas Editor */}
          <div className="col-span-3">
            {currentImage ? (
              <div className="space-y-4">
                {/* Image Info */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{currentImage.style}</h3>
                      <p className="text-sm text-muted-foreground">Canvas Editor</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(currentImage.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Canvas Editor */}
                <CanvasEditor
                  imageUrl={currentImage.signed_url || currentImage.public_url}
                  onDownload={(processedImage) => {
                    const filename = `edited-${currentImage.style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
                    handleDownload(processedImage, filename)
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Select an image to start editing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
