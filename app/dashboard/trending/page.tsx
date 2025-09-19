'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, Heart, Users, Zap, Camera, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function TrendingPage() {
  const miniApps = [
    {
      id: 'hug-childhood',
      title: 'Hug Your Childhood',
      description: 'Upload your current photo and childhood photo to create heartwarming memories',
      image: '/trending/hug-childhood-1.jpg',
      category: 'Memory',
      popularity: 95,
      users: 1250,
      isHot: true,
      features: ['Dual photo upload', 'No prompt needed', '3 variations', 'Memory templates']
    }
  ]

  const comingSoonApps = [
    {
      title: 'Time Travel Selfie',
      description: 'See yourself in different eras - Victorian, 80s, or futuristic styles',
      image: '/landing-assets/2.jpg',
      category: 'Creative'
    },
    {
      title: 'Family Reunion',
      description: 'Create group photos with family members from different time periods',
      image: '/landing-assets/3.jpg',
      category: 'Family'
    },
    {
      title: 'Dream Job Photo',
      description: 'See yourself in your dream profession - astronaut, chef, or artist',
      image: '/landing-assets/4.jpg',
      category: 'Career'
    },
    {
      title: 'Pet Transformation',
      description: 'Turn your pet into different animals or cartoon characters',
      image: '/landing-assets/5.jpg',
      category: 'Pets'
    },
    {
      title: 'Celebrity Lookalike',
      description: 'See which celebrity you look most like',
      image: '/landing-assets/6.jpg',
      category: 'Entertainment'
    },
    {
      title: 'Art Style Transfer',
      description: 'Transform your photos into famous art styles',
      image: '/landing-assets/7.jpg',
      category: 'Art'
    }
  ]

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Trending Mini Apps</h1>
              <p className="text-muted-foreground">Discover the most popular AI mini apps</p>
            </div>
          </div>
        </div>

        {/* Mini Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miniApps.map((app) => (
            <Card key={app.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <div className="aspect-video relative bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                  <Image
                    src={app.image}
                    alt={app.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Hot Badge */}
                  {app.isHot && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                        <Flame className="w-3 h-3 mr-1" />
                        HOT
                      </Badge>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      {app.category}
                    </Badge>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                          <Heart className="w-3 h-3 text-white" />
                          <span className="text-xs text-white">{app.popularity}%</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                          <Users className="w-3 h-3 text-white" />
                          <span className="text-xs text-white">{app.users}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{app.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {app.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {app.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={`/dashboard/trending/${app.id}`} className="w-full">
                  <Button className="w-full" size="lg">
                    <Camera className="w-4 h-4 mr-2" />
                    Try Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonApps.map((app, index) => (
              <Card key={index} className="opacity-60">
                <div className="aspect-video relative">
                  <Image
                    src={app.image}
                    alt={app.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      Coming Soon
                    </Badge>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      {app.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{app.title}</CardTitle>
                  <CardDescription>{app.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
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
