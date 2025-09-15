import { Redis } from '@upstash/redis'

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache keys
export const CACHE_KEYS = {
  IMAGE_PROXY: (url: string) => `image_proxy:${Buffer.from(url).toString('base64')}`,
  IMAGE_METADATA: (url: string) => `image_metadata:${Buffer.from(url).toString('base64')}`,
} as const

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  IMAGE_PROXY: 24 * 60 * 60, // 24 hours
  IMAGE_METADATA: 7 * 24 * 60 * 60, // 7 days
} as const

// Image cache interface
export interface CachedImage {
  data: string // base64 encoded image data
  contentType: string
  size: number
  cachedAt: number
  expiresAt: number
}

// Image metadata interface
export interface ImageMetadata {
  width: number
  height: number
  contentType: string
  size: number
  cachedAt: number
}

// Cache image data
export async function cacheImage(url: string, imageData: string, contentType: string, size: number): Promise<void> {
  try {
    const cachedImage: CachedImage = {
      data: imageData,
      contentType,
      size,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (CACHE_TTL.IMAGE_PROXY * 1000)
    }

    await redis.setex(
      CACHE_KEYS.IMAGE_PROXY(url),
      CACHE_TTL.IMAGE_PROXY,
      JSON.stringify(cachedImage)
    )

    console.log(`Image cached successfully: ${url}`)
  } catch (error) {
    console.error('Failed to cache image:', error)
    // Don't throw - caching is optional
  }
}

// Get cached image
export async function getCachedImage(url: string): Promise<CachedImage | null> {
  try {
    const cached = await redis.get(CACHE_KEYS.IMAGE_PROXY(url))
    
    if (!cached) {
      return null
    }

    const cachedImage: CachedImage = JSON.parse(cached as string)
    
    // Check if cache is expired
    if (Date.now() > cachedImage.expiresAt) {
      await redis.del(CACHE_KEYS.IMAGE_PROXY(url))
      return null
    }

    console.log(`Cache hit for image: ${url}`)
    return cachedImage
  } catch (error) {
    console.error('Failed to get cached image:', error)
    return null
  }
}

// Cache image metadata
export async function cacheImageMetadata(url: string, metadata: Omit<ImageMetadata, 'cachedAt'>): Promise<void> {
  try {
    const cachedMetadata: ImageMetadata = {
      ...metadata,
      cachedAt: Date.now()
    }

    await redis.setex(
      CACHE_KEYS.IMAGE_METADATA(url),
      CACHE_TTL.IMAGE_METADATA,
      JSON.stringify(cachedMetadata)
    )

    console.log(`Image metadata cached successfully: ${url}`)
  } catch (error) {
    console.error('Failed to cache image metadata:', error)
    // Don't throw - caching is optional
  }
}

// Get cached image metadata
export async function getCachedImageMetadata(url: string): Promise<ImageMetadata | null> {
  try {
    const cached = await redis.get(CACHE_KEYS.IMAGE_METADATA(url))
    
    if (!cached) {
      return null
    }

    const metadata: ImageMetadata = JSON.parse(cached as string)
    console.log(`Cache hit for image metadata: ${url}`)
    return metadata
  } catch (error) {
    console.error('Failed to get cached image metadata:', error)
    return null
  }
}

// Clear cache for a specific image
export async function clearImageCache(url: string): Promise<void> {
  try {
    await Promise.all([
      redis.del(CACHE_KEYS.IMAGE_PROXY(url)),
      redis.del(CACHE_KEYS.IMAGE_METADATA(url))
    ])
    console.log(`Cache cleared for image: ${url}`)
  } catch (error) {
    console.error('Failed to clear image cache:', error)
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  totalImages: number
  totalSize: number
  oldestCache: number | null
  newestCache: number | null
}> {
  try {
    const keys = await redis.keys('image_proxy:*')
    let totalSize = 0
    let oldestCache: number | null = null
    let newestCache: number | null = null

    for (const key of keys) {
      const cached = await redis.get(key)
      if (cached) {
        const cachedImage: CachedImage = JSON.parse(cached as string)
        totalSize += cachedImage.size
        
        if (!oldestCache || cachedImage.cachedAt < oldestCache) {
          oldestCache = cachedImage.cachedAt
        }
        if (!newestCache || cachedImage.cachedAt > newestCache) {
          newestCache = cachedImage.cachedAt
        }
      }
    }

    return {
      totalImages: keys.length,
      totalSize,
      oldestCache,
      newestCache
    }
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return {
      totalImages: 0,
      totalSize: 0,
      oldestCache: null,
      newestCache: null
    }
  }
}
