'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Carousel_006 } from '@/components/ui/carousel-006'
import { Play, Sparkles, Shield, Clock, Zap, Camera } from 'lucide-react'
import { ClerkLoginButton } from '@/components/auth/clerk-login-button'
import { useUser } from '@clerk/nextjs'

export function HeroSection() {
  const { isSignedIn } = useUser()
  
  const carouselImages = [
    {
      src: "/landing-assets/1.jpg",
      alt: "AI Generated Image 1",
      title: "Trending Content",
    },
    {
      src: "/landing-assets/2.jpg",
      alt: "AI Generated Image 2",
      title: "Style My Selfie",
    },
    {
      src: "/landing-assets/3.jpg",
      alt: "AI Generated Image 3",
      title: "Virtual Ad On",
    },
    {
      src: "/landing-assets/4.jpg",
      alt: "AI Generated Image 4",
      title: "Cineshot AI",
    },
    {
      src: "/landing-assets/5.jpg",
      alt: "AI Generated Image 5",
      title: "Dream Ride AI",
    },
    {
      src: "/landing-assets/6.jpg",
      alt: "AI Generated Image 6",
      title: "AI Gaming Photoshoot",
    },
    {
      src: "/landing-assets/7.jpg",
      alt: "AI Generated Image 7",
      title: "Live Avatar Studio",
    },
  ]

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <div className="flex w-full h-full">
          <div className="relative flex-1">
                  <Image
                    src="/landing-assets/hero_2.png"
                    alt="Hero Background 2"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain opacity-20"
                    priority
                  />
          </div>
          <div className="relative flex-1 hidden sm:block">
            <Image
              src="/landing-assets/hero_3.png"
              alt="Hero Background 3"
              fill
              sizes="(max-width: 768px) 0vw, 33vw"
              className="object-contain opacity-20"
              priority
            />
          </div>
          <div className="relative flex-1 hidden sm:block">
            <Image
              src="/landing-assets/hero_4.png"
              alt="Hero Background 4"
              fill
              sizes="(max-width: 768px) 0vw, 33vw"
              className="object-contain opacity-20"
              priority
            />
          </div>
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-12">
          
          {/* Powered by badge */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              Powered by Gemini 2.5 Flash
            </Badge>
          </div>

          {/* Main headline */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
              <span className="block text-foreground">Generate Stunning</span>
              <span className="block text-primary">
                AI Photos Instantly
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-5xl leading-relaxed text-center">
              Generate stunning images for all platforms with AI.
              Instagram, YouTube, LinkedIn, and more. No photos stored on servers. Instant generation.
            </p>
          </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {isSignedIn ? (
                    <Button
                      size="lg"
                      className="px-8 py-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      <span>Create your first photoshoot</span>
                    </Button>
                  ) : (
                    <ClerkLoginButton
                      size="lg"
                      mode="signup"
                      showTermsConsent={true}
                      className="px-8 py-4 text-lg font-semibold rounded-full"
                    >
                      <Sparkles className="w-5 h-5 mr-2 text-white" />
                      <span className="text-white">Start Creating</span>
                    </ClerkLoginButton>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold rounded-full"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>

          {/* Credits Info */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Daily credit reset</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>We do not save your images</span>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="w-full max-w-6xl">
            <Carousel_006
              images={carouselImages}
              className=""
              loop={true}
              showNavigation={false}
              showPagination={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
