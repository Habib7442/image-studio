'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Camera, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function StyleMySelfiePanel() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Style My Selfie</h2>
        <p className="text-muted-foreground">Transform your selfies with AI-powered styling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Upload Your Selfie</span>
            </CardTitle>
            <CardDescription>
              Upload a clear selfie to get started with AI styling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedImage ? (
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Uploaded selfie"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setSelectedImage(null)}
                    className="w-full"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click to upload or drag and drop your selfie
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Style Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Choose Style</span>
            </CardTitle>
            <CardDescription>
              Select a style template or create a custom prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-20 flex flex-col space-y-1">
                  <span className="text-lg">👔</span>
                  <span className="text-xs">Professional</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-1">
                  <span className="text-lg">🎨</span>
                  <span className="text-xs">Creative</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-1">
                  <span className="text-lg">👕</span>
                  <span className="text-xs">Casual</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-1">
                  <span className="text-lg">🖼️</span>
                  <span className="text-xs">Artistic</span>
                </Button>
              </div>
              
              <Button 
                className="w-full" 
                disabled={!selectedImage}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Styled Image
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}