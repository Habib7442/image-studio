"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import {
  EcommerceTemplate,
  EcommerceCategory,
  getTrendingEcommerceTemplates,
  getEcommerceTemplatesByCategory,
  searchEcommerceTemplates,
} from "@/lib/ecommerce-templates";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  template: EcommerceTemplate;
}

export default function EcommerceEnhancementPage() {
  const { refreshProfile } = useAuth();

  // State management
  const [productImage, setProductImage] = useState<string | null>(null);
  const [lifestyleImage, setLifestyleImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EcommerceTemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Debug generatedImages state
  console.log('Current generatedImages state:', generatedImages);
  console.log('Generated images count:', generatedImages.length);
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get templates based on search and category
  const getFilteredTemplates = () => {
    let templates = getTrendingEcommerceTemplates();

    if (searchQuery) {
      templates = searchEcommerceTemplates(searchQuery);
    }

    if (selectedCategory !== "all") {
      templates = getEcommerceTemplatesByCategory(selectedCategory as EcommerceCategory);
    }

    return templates;
  };

  const handleProductImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProductImage(e.target?.result as string);
          setError(null);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleLifestyleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLifestyleImage(e.target?.result as string);
          setError(null);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleGenerate = async () => {
    if (!productImage) {
      setError("Please upload a product image");
      return;
    }

    if (!selectedTemplate && !customPrompt.trim()) {
      setError("Please select a template or enter a custom prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      const finalPrompt = selectedTemplate
        ? selectedTemplate.prompt.replace("{product}", "the uploaded product")
        : customPrompt;

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 90) {
            console.log('Progress at 90%, holding...');
            return 90; // Don't go to 100% until we get the actual result
          }
          console.log('Progress updated to:', newProgress);
          return newProgress; // Random increment for more realistic progress
        });
      }, 200);

      const response = await fetch("/api/ecommerce-enhancement/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productImage,
          lifestyleImage,
          template: selectedTemplate,
          customPrompt: customPrompt.trim() || undefined,
          finalPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate images");
      }

      const data = await response.json();
      
      // Clear progress interval and complete progress bar
      clearInterval(progressInterval);
      setGenerationProgress(100);
      console.log('Progress completed at 100%');

      console.log('Received data:', data);
      console.log('Images received:', data.images?.length || 0);
      console.log('Images array:', data.images);
      setGeneratedImages(data.images || []);

      // Refresh user credits
      await refreshProfile();
    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, templateName: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ecommerce-${templateName
      .toLowerCase()
      .replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasAnySelection = selectedTemplate || customPrompt.trim();
  const canGenerate = productImage && hasAnySelection && !isGenerating;

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
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
              E-commerce Product Enhancement
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your products into stunning lifestyle photos and mockups.
            Perfect for e-commerce, social media, and marketing campaigns.
          </p>
        </div>
        <div className="space-y-8">
          {/* Step 1: Upload Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Your Images</span>
              </CardTitle>
              <CardDescription>
                Upload your product image and optional lifestyle reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image Upload */}
                <div className="space-y-4">
                  <h3 className="font-medium">Product Image *</h3>
                  {productImage ? (
                    <div className="relative">
                      <Image
                        src={productImage}
                        alt="Product"
                        width={400}
                        height={300}
                        className="w-full h-64 object-contain rounded-lg border bg-muted/10"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setProductImage(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload your product image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                        id="product-upload"
                      />
                      <label
                        htmlFor="product-upload"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>

                {/* Lifestyle Image Upload */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Lifestyle Image (Optional)</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a reference image showing the style, setting, or mood you want for your product enhancement. 
                      This helps AI understand your vision better.
                    </p>
                  </div>
                  {lifestyleImage ? (
                    <div className="relative">
                      <Image
                        src={lifestyleImage}
                        alt="Lifestyle"
                        width={400}
                        height={300}
                        className="w-full h-64 object-contain rounded-lg border bg-muted/10"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setLifestyleImage(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload lifestyle reference
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLifestyleImageUpload}
                        className="hidden"
                        id="lifestyle-upload"
                      />
                      <label
                        htmlFor="lifestyle-upload"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Choose Style Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Choose Style Template</span>
              </CardTitle>
              <CardDescription>
                Select a professional template for your product enhancement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="mockup">Mockup</option>
                        <option value="lifestyle-model">Lifestyle Model</option>
                        <option value="product-showcase">
                          Product Showcase
                        </option>
                        <option value="social-media">Social Media</option>
                        <option value="advertising">Advertising</option>
                        <option value="catalog">Catalog</option>
                        <option value="seasonal">Seasonal</option>
                      </select>
                    </div>
                  </div>

                  {/* Templates Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{template.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-sm">
                                  {template.name}
                                </h3>
                                {template.isTrending && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Trending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {template.description}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{template.difficulty}</span>
                                <span>•</span>
                                <span>{template.estimatedTime}</span>
                                <span>•</span>
                                <span>{template.conversionBoost} boost</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <textarea
                    placeholder="Describe your vision for the product enhancement..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about the style, setting, lighting, and mood you
                    want for your product.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Step 3: Generation Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Instagram Optimized</h3>
                    <p className="text-sm text-muted-foreground">
                      All images are generated in 1080x1350 pixels (4:5 aspect
                      ratio) perfect for Instagram portrait posts. High-quality
                      AI-generated product enhancements optimized for social
                      media.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>15 generations per hour</span>
                  <span>Each generation creates 2 unique variations</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Generate Button */}
          <div className="space-y-4">
            {!hasAnySelection && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select a template, add filters, or write custom text to enable
                  generation.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate 2 Variations (1 credit)
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
          </div>

          {/* Step 5: Results */}
          {generatedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Your Enhanced Product Images</span>
                </CardTitle>
                <CardDescription>
                  Your enhanced product images are ready! Download them now or
                  they&apos;ll be lost on page refresh.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedImages.map((image, index) => (
                    <div key={image.id} className="space-y-3">
                      <div className="relative">
                        <Image
                          src={image.url}
                          alt={`Generated ${index + 1}`}
                          width={300}
                          height={400}
                          className="w-full h-80 object-cover rounded-lg border"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            handleDownload(image.url, image.template.name)
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">
                            {image.template.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {image.template.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {image.template.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {generatedImages.length === 0 && !isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Ready to Enhance Your Products?
                  </h3>
                  <p className="text-muted-foreground">
                    Upload your product image and select a style to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
