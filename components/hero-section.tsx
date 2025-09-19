'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, Clock, Zap, Camera } from 'lucide-react'
import { ClerkLoginButton } from '@/components/auth/clerk-login-button'
import { useUser } from '@clerk/nextjs'

export function HeroSection() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-black/20" />
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
              <span className="block text-foreground">Style Your</span>
              <span className="block text-primary">
                Selfie with AI
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-5xl leading-relaxed text-center">
              Transform your selfies with AI-powered styling. Professional, creative, and artistic looks in seconds.
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
                <span>Style My Selfie</span>
              </Button>
            ) : (
              <ClerkLoginButton
                size="lg"
                mode="signup"
                showTermsConsent={true}
                className="px-8 py-4 text-lg font-semibold rounded-full"
              >
                <Sparkles className="w-5 h-5 mr-2 text-white" />
                <span className="text-white">Get Started</span>
              </ClerkLoginButton>
            )}
          </div>

          {/* Info */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
      </div>
    </section>
  )
}
