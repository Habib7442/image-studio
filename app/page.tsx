import { Navigation } from '@/components/navigation'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { PricingSection } from '@/components/pricing-section'
import { PrivacySection } from '@/components/privacy-section'
import { CTASection } from '@/components/cta-section'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <PrivacySection />
      <CTASection />
    </main>
  )
}
