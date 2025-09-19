'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Shield, Clock, Zap } from 'lucide-react'
import { ClerkLoginButton } from '@/components/auth/clerk-login-button'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export function CTASection() {
  const { isSignedIn } = useUser()

  return (
    <section className="py-20 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main CTA */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Create?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of creators generating stunning content for all platforms with AI. 
                Instagram, YouTube, LinkedIn, and more. Start free today, no credit card required.
              </p>
            </div>

            {/* CTA Button */}
            <div className="w-full max-w-md mx-auto">
              {isSignedIn ? (
                <Link href="/dashboard" className="w-full">
                  <Button 
                    size="lg" 
                    className="text-base px-8 py-4 w-full rounded-full"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span>Go to Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <ClerkLoginButton
                  className="w-full text-base px-8 py-4 h-auto rounded-full"
                  size="lg"
                  mode="signup"
                  showTermsConsent={true}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span>Start Creating</span>
                </ClerkLoginButton>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>5 daily credits with sign-in</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>We do not save your images</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Why Choose ImageStudioLab?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">AI-Powered</h4>
                <p className="text-muted-foreground">
                  Powered by Google&apos;s Gemini 2.5 Flash for cutting-edge image generation.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Privacy-First</h4>
                <p className="text-muted-foreground">
                  Your images are never stored permanently. Processed securely and deleted immediately.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Platform Ready</h4>
                <p className="text-muted-foreground">
                  Optimized for Instagram, YouTube, LinkedIn, and all major social platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
