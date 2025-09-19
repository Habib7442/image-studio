'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, ShoppingCart, Wand2, Sparkles, Zap, Shield, Clock, Download, Palette, Globe } from 'lucide-react'

export function FeaturesSection() {
  const mainFeatures = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Style My Selfie',
      description: 'Transform your selfies with AI-powered styling, filters, and effects',
      features: ['10+ trending templates', 'Professional filters', 'Custom prompts', 'High-quality output'],
      gradient: 'from-blue-500 to-purple-600',
      size: 'large'
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: 'Add Me + Product',
      description: 'Create professional product photos with your face for marketing campaigns',
      features: ['Dual image upload', 'AI composition', 'Ad templates', 'Brand consistency'],
      gradient: 'from-green-500 to-blue-600',
      size: 'medium'
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: 'E-commerce Enhancement',
      description: 'Generate lifestyle photos and mockups for your products',
      features: ['Product + lifestyle fusion', '32+ templates', 'Commercial quality', 'E-commerce optimized'],
      gradient: 'from-orange-500 to-red-600',
      size: 'medium'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'AI Editor',
      description: 'Advanced AI-powered image editing with iterative refinement',
      features: ['Iterative editing', 'Follow-up prompts', 'Edit history', 'Real-time preview'],
      gradient: 'from-purple-500 to-pink-600',
      size: 'large'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Trending',
      description: 'Discover the latest AI mini-apps and trending features',
      features: ['Hug Your Childhood', 'Mini-apps', 'Trending features', 'Community favorites'],
      gradient: 'from-red-500 to-orange-600',
      size: 'medium'
    }
  ]

  const platformFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'Images never stored permanently'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Daily Credits',
      description: 'Fresh credits every 24 hours'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Instant Download',
      description: 'High resolution downloads'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Multiple Styles',
      description: 'Dozens of professional styles'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Platform Ready',
      description: 'Optimized for all platforms'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful AI Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your images with our cutting-edge AI technology. 
            Choose from multiple generation modes and create stunning content.
          </p>
        </div>

        {/* Bento Grid - Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-xl transition-all duration-300 ${
                feature.size === 'large' ? 'lg:col-span-2' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center text-white`}>
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      AI Powered
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Features Grid */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Why Choose ImageStudioLab?</h3>
          <p className="text-muted-foreground mb-8">
            Built for creators who demand quality and speed
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platformFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
