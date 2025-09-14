'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Only show footer on landing page and legal pages
  const showFooter = pathname === '/' || 
    pathname.startsWith('/privacy') || 
    pathname.startsWith('/terms') || 
    pathname.startsWith('/cookie-policy') || 
    pathname.startsWith('/gdpr')
  
  if (!showFooter) {
    return null
  }
  
  return <Footer />
}
