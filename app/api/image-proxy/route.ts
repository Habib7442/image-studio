import { NextRequest, NextResponse } from 'next/server'
import { getCachedImage, cacheImage, getCachedImageMetadata, cacheImageMetadata } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const useCache = searchParams.get('cache') !== 'false' // Default to true
    
    console.log('Image proxy request:', { imageUrl, useCache })
    
    if (!imageUrl) {
      console.log('No image URL provided')
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Validate that it's a Supabase URL for security
    if (!imageUrl.includes('supabase.co') && !imageUrl.includes('supabase.in')) {
      console.log('Invalid image source:', imageUrl)
      return NextResponse.json({ error: 'Invalid image source' }, { status: 400 })
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
          },
        })
      }
    }

    console.log('Fetching image from source:', imageUrl)
    
    // Fetch the image from source
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'ImageStudioLab/1.0'
      }
    })

    console.log('Image fetch response:', { 
      status: response.status, 
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    })

    if (!response.ok) {
      console.log('Image fetch failed:', response.status, response.statusText)
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageSize = imageBuffer.byteLength

    console.log('Image loaded successfully:', { 
      size: imageSize, 
      contentType 
    })

    // Cache the image if enabled
    if (useCache) {
      try {
        // Convert to base64 for caching
        const base64Data = Buffer.from(imageBuffer).toString('base64')
        await cacheImage(imageUrl, base64Data, contentType, imageSize)
        
        // Also cache metadata for future reference
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
      },
    })
  } catch (error) {
    console.error('Image proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
