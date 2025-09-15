'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import {
  Download,
  Trash2,
  Clock,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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

export function HistoryPanel() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
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

  const handleDelete = async (imageId: string) => {
    try {
      setDeleting(imageId)
      
      const response = await fetch('/api/user/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
    } finally {
      setDeleting(null)
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to view your history</h1>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your images...</p>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">No images found</h1>
          <p className="text-muted-foreground">Generate some images first to see them here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Generated Images</h1>
          <p className="text-muted-foreground mt-1">
            View, download, and manage your AI-generated images
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {images.length} images
        </Badge>
      </div>

      {/* Privacy Notice */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-sm font-bold">!</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Privacy & Data Control
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              We care about your privacy! You can delete your photos anytime from our servers. 
              We also have <Link href="/dashboard/cleanup" className="underline font-medium hover:text-red-600 dark:hover:text-red-200">Cleanup Management</Link> that automatically removes images after 1 hour 
              to protect your data. You can also manually trigger cleanup of all images from the 
              <Link href="/dashboard/cleanup" className="underline font-medium hover:text-red-600 dark:hover:text-red-200"> Cleanup Management</Link> page. 
              Your images are never stored permanently without your consent.
            </p>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="relative">
                <img
                  src={image.signed_url || image.public_url}
                  alt={`Generated image ${image.id}`}
                  className="w-full h-48 object-contain rounded-lg bg-muted/20"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="secondary" className="text-xs">
                    {image.style}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-sm truncate">{image.style}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(image.created_at)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const filename = `${image.style.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
                    handleDownload(image.signed_url || image.public_url, filename)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleting === image.id}
                    >
                      {deleting === image.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Image</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this image? This action cannot be undone.
                        The image will be permanently removed from both storage and database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(image.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {downloadError && (
                <p className="text-xs text-destructive">{downloadError}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
