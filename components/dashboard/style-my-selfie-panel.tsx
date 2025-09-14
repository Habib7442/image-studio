'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import {
  Upload,
  Camera,
  Sparkles,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wand2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { STYLE_TEMPLATES, TEMPLATE_CATEGORIES, STYLE_TEMPLATE_CATEGORIES } from '@/lib/style-templates'
import { useStyleMySelfieStore } from '@/store/style-myselfie-store'
import { EffectsPanel } from './effects-panel'

export function StyleMySelfiePanel() {
  const { profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Zustand store
  const {
    selectedImage,
    selectedTemplate,
    selectedCategory,
    customPrompt,
    isGenerating,
    generationProgress,
    result,
    error,
    showSizeAlert,
    setSelectedImage,
    setSelectedCategory,
    setCustomPrompt,
    setIsGenerating,
    setGenerationProgress,
    setResult,
    setError,
    setShowSizeAlert,
    reset,
    handleTemplateSelect,
    handleSurpriseMe,
    getEffectivePrompt,
    canGenerate
  } = useStyleMySelfieStore()

  // Reset store when component mounts to ensure clean state
  useEffect(() => {
    reset()
  }, [reset])

  // Filter templates by category using the new structure
  const filteredTemplates = selectedCategory === 'all' 
    ? STYLE_TEMPLATES 
    : STYLE_TEMPLATE_CATEGORIES[selectedCategory as keyof typeof STYLE_TEMPLATE_CATEGORIES] || []


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }
    
    // Reject SVG explicitly
    if (file.type === 'image/svg+xml') {
      setError('SVG images are not supported')
      return
    }

    // Validate file size (max 6MB)
    if (file.size > 6 * 1024 * 1024) {
      setShowSizeAlert(true)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setSelectedImage(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!selectedImage) {
      setError('Please upload a selfie image')
      return
    }

    if (!canGenerate()) {
      setError('Please select a style template or enter a custom description')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setError(null)
    setResult(null)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const current = useStyleMySelfieStore.getState().generationProgress || 0
      if (current < 90) {
        setGenerationProgress(Math.min(current + Math.random() * 10, 90))
      }
    }, 500)

    try {
      const response = await fetch('/api/style-my-selfie/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: selectedTemplate ? selectedTemplate.prompt : getEffectivePrompt(),
          selfieImage: selectedImage,
          style: selectedTemplate?.name || 'custom',
          additionalDetails: selectedTemplate && customPrompt.trim() ? customPrompt : undefined
        }),
      })

      const isJson = response.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await response.json() : await response.text()
      if (!response.ok) {
        const message = isJson ? (data as { error?: string })?.error : String(data)
        throw new Error(message || 'Failed to generate image')
      }

      // Set progress to 100% when we get the response
      setGenerationProgress(100)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      // Verify the image is still accessible
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Image not accessible')
      }
      
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `styled-selfie-${index + 1}-${Date.now()}.jpeg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download image:', err)
      setError('Failed to download image. Please try again.')
    }
  }

  const handleReset = () => {
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 p-6 min-h-full">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Camera className="h-6 w-6" />
          Style My Selfie
        </h2>
        <p className="text-muted-foreground">
          Transform your selfie into professional, styled photos with AI
        </p>
        {profile && (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
            <Sparkles className="h-3 w-3" />
            {profile.credits_left} Credits Available
          </Badge>
        )}
      </div>

      <Separator />

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Your Selfie
          </CardTitle>
          <CardDescription>
            Upload a clear selfie photo to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Selfie Image</Label>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0"
              >
                <Camera className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
          </div>

          {selectedImage && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Selected selfie"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Style Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Style</CardTitle>
          <CardDescription>
            Select a style template or write your own custom description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {TEMPLATE_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="mr-1">{category.emoji}</span>
                {category.name}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSurpriseMe(filteredTemplates)}
              className="ml-auto"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Surprise Me!
            </Button>
          </div>

          {/* Style Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{template.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Template Display */}
          {selectedTemplate && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{selectedTemplate.emoji}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Selected Style: {selectedTemplate.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                  {customPrompt.trim() && (
                            <p className="text-xs text-primary mt-1">
                              + Additional details: &quot;{customPrompt.trim().substring(0, 50)}{customPrompt.trim().length > 50 ? '...' : ''}&quot;
                            </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Description */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              {selectedTemplate ? 'Additional Details (Optional)' : 'Describe Your Vision (Optional)'}
            </Label>
            <Textarea
              id="prompt"
              placeholder={
                selectedTemplate 
                  ? "Add any specific details or modifications to your selected style..."
                  : "Describe how you want your selfie to be styled..."
              }
              value={customPrompt}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setCustomPrompt(e.target.value)
                }
              }}
              rows={3}
              className="resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {customPrompt.length}/500 characters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate() || isGenerating}
          className="flex-1"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating 3 Variations...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {selectedTemplate 
                ? `Generate 3 ${selectedTemplate.name} Variations${customPrompt.trim() ? ' + Custom' : ''}` 
                : 'Generate 3 Styled Selfies'
              }
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isGenerating}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-spin" />
              Generating Your Styled Selfies...
            </CardTitle>
            <CardDescription>
              Creating 3 unique variations for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(Math.max(0, Math.min(100, generationProgress || 0)))}%</span>
              </div>
              <Progress value={Math.max(0, Math.min(100, generationProgress || 0))} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Results
            </CardTitle>
            <CardDescription>
              Your {result.images.length} styled selfie{result.images.length > 1 ? 's are' : ' is'} ready! Generated in {result.generationTime}ms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.images.map((image, index) => (
                <div key={image.id} className="space-y-3">
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={`Generated styled selfie ${index + 1}`}
                      className="w-full rounded-lg shadow-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Variation {index + 1}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(image.url, index)} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download {index + 1}
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    ⚠️ Important: Save Your Images Now
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    These images are not saved on our servers. Please download them now as they will be lost when you refresh the page or navigate away.
                  </p>
                </div>
              </div>
            </div>

                        <div className="text-center text-sm text-muted-foreground">
                          Credits remaining: {result.creditsLeft}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Effects Panel */}
                  {result && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wand2 className="h-5 w-5 text-purple-500" />
                          Apply Effects
                        </CardTitle>
                        <CardDescription>
                          Enhance your generated images with creative effects like blur, filters, and frames
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <EffectsPanel
                          images={result.images.map(img => img.url)}
                          onImageUpdate={(imageId, processedImage) => {
                            // Update the result with processed image
                            setResult({
                              ...result,
                              images: result.images.map((img, index) =>
                                `image-${index}` === imageId 
                                  ? { ...img, url: processedImage }
                                  : img
                              )
                            })
                          }}
                        />
                      </CardContent>
                    </Card>
                  )}

      {/* File Size Alert Dialog */}
      <AlertDialog open={showSizeAlert} onOpenChange={setShowSizeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              File Too Large
            </AlertDialogTitle>
            <AlertDialogDescription>
              The image you selected is larger than 6MB. Please choose a smaller image or compress it before uploading.
              <br /><br />
              <strong>Maximum file size:</strong> 6MB
              <br />
              <strong>Recommended:</strong> Use images under 2MB for best performance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSizeAlert(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
