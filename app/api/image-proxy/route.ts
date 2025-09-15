import { NextRequest, NextResponse } from 'next/server'
import { getCachedImage, cacheImage, shouldCacheImage, cacheImageMetadata } from '@/lib/redis'
import { imageProxyRateLimit, imageProxyStrictRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      request.headers.get('cf-connecting-ip') ||
      'anonymous'
    
    // Apply rate limiting - check both short-term and long-term limits
    const [shortTermResult, longTermResult] = await Promise.all([
      imageProxyRateLimit.checkLimit(clientIP),
      imageProxyStrictRateLimit.checkLimit(clientIP)
    ])
    
    // If either rate limit is exceeded, return 429
    if (!shortTermResult.success || !longTermResult.success) {
      console.log('Rate limit exceeded:', { 
        clientIP, 
        shortTerm: shortTermResult, 
        longTerm: longTermResult 
      })
      
      const headers = createRateLimitHeaders(shortTermResult.success ? longTermResult : shortTermResult)
      
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: shortTermResult.retryAfter || longTermResult.retryAfter
        }, 
        { 
          status: 429,
          headers
        }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const useCache = searchParams.get('cache') !== 'false' // Default to true
    
    console.log('Image proxy request:', { 
      imageUrl, 
      useCache, 
      clientIP,
      rateLimit: {
        shortTerm: shortTermResult,
        longTerm: longTermResult
      }
    })
    
    if (!imageUrl) {
      console.log('No image URL provided')
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Validate that it's a Supabase URL for security (SSRF protection)
    try {
      const url = new URL(imageUrl)
      const hostname = url.hostname.toLowerCase()
      
      // Check for valid Supabase domains
      const isValidSupabase = hostname.endsWith('.supabase.co') || 
                              hostname === 'supabase.co' ||
                              hostname.endsWith('.supabase.in') || 
                              hostname === 'supabase.in'
      
      // Additional security checks
      const isHttps = url.protocol === 'https:'
      const hasValidPort = !url.port || url.port === '443'
      const isNotLocalhost = !hostname.startsWith('localhost') && 
                             !hostname.startsWith('127.') && 
                             !hostname.startsWith('0.') &&
                             !hostname.startsWith('192.168.') &&
                             !hostname.startsWith('10.') &&
                             !hostname.startsWith('172.')
      
      if (!isValidSupabase || !isHttps || !hasValidPort || !isNotLocalhost) {
        console.log('Invalid image source - SSRF protection triggered:', { 
          imageUrl, 
          hostname, 
          protocol: url.protocol,
          port: url.port,
          isValidSupabase,
          isHttps,
          hasValidPort,
          isNotLocalhost
        })
        return NextResponse.json({ error: 'Invalid image source' }, { status: 400 })
      }
    } catch (e) {
      console.log('Invalid URL format - SSRF protection triggered:', { imageUrl, error: e })
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check cache first if enabled
    if (useCache) {
      const cachedImage = await getCachedImage(imageUrl)
      if (cachedImage) {
        console.log('Serving image from cache:', { 
          size: cachedImage.size, 
          contentType: cachedImage.contentType,
          cachedAt: new Date(cachedImage.cachedAt).toISOString()
        })
        
        // Convert base64 back to buffer
        const imageBuffer = Buffer.from(cachedImage.data, 'base64')
        
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': cachedImage.contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            'X-Cache': 'HIT',
            'X-Cached-At': new Date(cachedImage.cachedAt).toISOString(),
            ...createRateLimitHeaders(shortTermResult),
          },
        })
      }
    }

    console.log('Fetching image from source:', imageUrl)
    
    // Image size limits for security
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
    
    // Fetch the image from source with SSRF protection
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'ImageStudioLab/1.0'
        },
        // Additional SSRF protection
        redirect: 'follow',
        signal: controller.signal
      })
      clearTimeout(timeout)

    console.log('Image fetch response:', { 
      status: response.status, 
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    })

    if (!response.ok) {
      console.log('Image fetch failed:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    // Check content-length header to prevent downloading oversized files
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      console.log('Image too large (content-length):', contentLength)
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const imageBuffer = await response.arrayBuffer()
    
    // Limit image size to prevent memory exhaustion
    if (imageBuffer.byteLength > MAX_IMAGE_SIZE) {
      console.log('Image too large:', imageBuffer.byteLength)
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageSize = imageBuffer.byteLength

    // Validate content type to ensure it's actually an image
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']
    if (!validImageTypes.some(type => contentType.startsWith(type))) {
      console.log('Invalid content type:', contentType)
      return NextResponse.json({ error: 'Invalid content type' }, { status: 415 })
    }

    console.log('Image loaded successfully:', { 
      size: imageSize, 
      contentType,
      sizeMB: (imageSize / (1024 * 1024)).toFixed(2)
    })

    // Cache the image if enabled
    if (useCache) {
      try {
        if (shouldCacheImage(imageSize)) {
          // Use efficient caching for images under 5MB
          const base64Data = Buffer.from(imageBuffer).toString('base64')
          await cacheImage(imageUrl, base64Data, contentType, imageSize)
          
          console.log('Image cached successfully:', { 
            url: imageUrl, 
            size: imageSize,
            sizeMB: (imageSize / (1024 * 1024)).toFixed(2)
          })
        } else {
          console.log('Image too large to cache:', { 
            url: imageUrl, 
            size: imageSize,
            sizeMB: (imageSize / (1024 * 1024)).toFixed(2)
          })
        }
        
        // Always cache metadata for future reference (small data)
        await cacheImageMetadata(imageUrl, {
          width: 0, // We don't have dimensions yet
          height: 0,
          contentType,
          size: imageSize
        })
      } catch (cacheError) {
        console.error('Failed to cache image:', cacheError)
        // Continue without caching - don't fail the request
      }
    }

      // Return the image with proper CORS headers
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          'X-Cache': 'MISS',
          'X-Cache-Timestamp': new Date().toISOString(),
          ...createRateLimitHeaders(shortTermResult),
        },
      })
    } catch (fetchError) {
      clearTimeout(timeout)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.log('Image fetch timeout')
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 })
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Image proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
