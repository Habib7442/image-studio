import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/api/public(.*)',
  '/_next(.*)',
  '/static(.*)',
  '/privacy',
  '/terms',
  '/cookie-policy',
  '/gdpr',
  '/api/inngest(.*)', // Disabled but kept for future use
  '/api/style-my-selfie/progress' // Allow progress updates
  // /api/style-my-selfie/generate - PROTECTED (requires authentication)
])

export default clerkMiddleware(
  async (auth, req) => {
    // Allow CORS preflight requests
    if (req.method === 'OPTIONS') {
      return NextResponse.next()
    }
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
