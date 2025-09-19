'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, Zap } from 'lucide-react'

export function PrivacySection() {
  const privacyFeatures = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Secure Processing',
      description: 'Your images are processed securely. Never stored permanently on our servers.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Clock className="w-12 h-12" />,
      title: 'Instant Generation',
      description: 'Images generated instantly. No storage or cleanup needed.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Fast Generation',
      description: 'Powered by Gemini 2.5 Flash. Generate 3 variations in under 5 seconds.',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy-First Design
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Secure, fast, and private AI image generation. Generated instantly.
          </p>
        </div>

        {/* Privacy Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {privacyFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Privacy Info */}
        <div className="mt-16 text-center">
          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Your Privacy Matters</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Data Processing</h4>
                <p className="text-muted-foreground">
                  Images are processed by Google&apos;s Gemini AI but never stored on our servers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">No Tracking</h4>
                <p className="text-muted-foreground">
                  We don&apos;t track your usage patterns or store personal data beyond authentication.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Secure Storage</h4>
                <p className="text-muted-foreground">
                  All data is encrypted in transit and at rest using industry-standard protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
