'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Trash2, Camera } from 'lucide-react'

export function HistoryPanel() {
  // Mock data - in real app this would come from API
  const generatedImages = [
    {
      id: '1',
      title: 'Professional Headshot',
      timestamp: 'Sep 15, 2025, 12:30 PM',
      imageUrl: '/placeholder-image.jpg'
    },
    {
      id: '2', 
      title: 'Creative Style',
      timestamp: 'Sep 15, 2025, 11:15 AM',
      imageUrl: '/placeholder-image.jpg'
    },
    {
      id: '3',
      title: 'Artistic Portrait',
      timestamp: 'Sep 15, 2025, 10:45 AM',
      imageUrl: '/placeholder-image.jpg'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Generated Images</h2>
          <p className="text-muted-foreground">View, download, and manage your AI-generated images</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {generatedImages.length} images
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Privacy & Data Control</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              We care about your privacy! You can delete your photos anytime from our servers. 
          We also have Cleanup Management that automatically removes images after 1 hour to protect your data. 
          You can also manually trigger cleanup of all images from the Cleanup Management page. 
              Your images are never stored permanently without your consent.
            </p>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generatedImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{image.title}</CardTitle>
              <CardDescription className="text-xs">{image.timestamp}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-3 h-3" />
                    </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
