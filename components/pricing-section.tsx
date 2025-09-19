'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Check } from 'lucide-react'
import { ClerkLoginButton } from '@/components/auth/clerk-login-button'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export function PricingSection() {
  const { isSignedIn } = useUser()

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out our AI image generation',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-blue-500 to-purple-600',
      features: [
        '5 credits per day',
        'All AI features included',
        'Basic templates',
        'Standard quality',
        'Community support'
      ],
      limitations: [
        'Limited daily credits',
        'No priority processing'
      ],
      cta: 'Start Free',
      ctaVariant: 'outline' as const,
      popular: false,
      comingSoon: false
    },
    {
      name: 'Credit Packs',
      price: 'Coming Soon',
      description: 'Pay as you go with credit packs',
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-600',
      features: [
        'Pay as you go',
        'Credits never expire',
        'Bulk discounts available',
        'No subscription required',
        'Use when you need them'
      ],
      limitations: [],
      cta: 'Coming Soon',
      ctaVariant: 'outline' as const,
      popular: true,
      comingSoon: true
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple Credit System
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sign in with Google to get 5 daily credits. No subscriptions required, just fair usage.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative h-full flex flex-col ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${plan.comingSoon ? 'opacity-75' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {plan.comingSoon && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Coming Soon
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 text-white`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-4xl font-bold">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        /day
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-muted-foreground">
                      {plan.price}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 flex-1">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Limitations:</h4>
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start space-x-3">
                        <span className="text-muted-foreground text-sm">•</span>
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <div className="p-6 pt-0">
                {plan.comingSoon ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                ) : plan.name === 'Free' ? (
                  isSignedIn ? (
                    <Link href="/dashboard" className="w-full">
                      <Button 
                        className="w-full" 
                        variant={plan.ctaVariant}
                        size="lg"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <ClerkLoginButton
                      className="w-full"
                      size="lg"
                      mode="signup"
                      showTermsConsent={true}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {plan.cta}
                    </ClerkLoginButton>
                  )
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                    disabled
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">What are credits?</h4>
                <p className="text-muted-foreground text-sm">
                  Credits are used to generate AI images. Each image generation costs 1 credit, 
                  regardless of the number of variations created.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-2">Do credits roll over?</h4>
                <p className="text-muted-foreground text-sm">
                  Free plan credits reset daily. Credit packs will never expire, so you can use 
                  them whenever you need them.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">When will credit packs be available?</h4>
                <p className="text-muted-foreground text-sm">
                  Credit packs are coming soon! We&apos;re working on a pay-as-you-go system 
                  with no subscriptions required.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-muted-foreground text-sm">
                  Yes! Start with our free plan and get 5 credits per day to try all features. 
                  No credit card required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
