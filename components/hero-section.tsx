'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, Clock, Zap, Camera } from 'lucide-react'
import { ClerkLoginButton } from '@/components/auth/clerk-login-button'
import { useUser } from '@clerk/nextjs'
import { HeroGalleryCarousel } from '@/components/hero-gallery-carousel'

export function HeroSection() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/20 to-secondary/10" />
      </div>
      
      <div className="container mx-auto px-4 pt-4 pb-20 relative z-10">
        <div className="flex flex-col items-center justify-start min-h-screen text-center space-y-6 pt-16">
          
          {/* Powered by badge */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Zap className="w-3 h-3 mr-1" />
              Powered by Gemini 2.5 Flash
            </Badge>
          </div>

          {/* Main headline */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
              <span className="block text-white drop-shadow-lg">AI-Powered</span>
              <span className="block text-primary drop-shadow-lg">
                Image Studio
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-5xl leading-relaxed text-center drop-shadow-md">
              Create stunning AI-generated images for all platforms. Professional photos, creative styles, and artistic transformations in seconds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isSignedIn ? (
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <a href="/dashboard">
                  <Camera className="w-5 h-5 mr-2" />
                  <span>Open Studio</span>
                </a>
              </Button>
            ) : (
              <ClerkLoginButton
                size="lg"
                mode="signup"
                showTermsConsent={true}
                className="px-8 py-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                <span>Get Started</span>
              </ClerkLoginButton>
            )}
          </div>

          {/* Info */}
          <div className="flex items-center space-x-6 text-sm text-white/80 mt-2">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Privacy protected</span>
            </div>
          </div>
        </div>

        {/* Gallery Carousel */}
        <div className="mt-8 w-full">
          <HeroGalleryCarousel />
        </div>
      </div>
    </section>
  )
}
