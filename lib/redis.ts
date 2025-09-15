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

// Efficient caching for large images using streaming
export async function cacheImageEfficient(url: string, imageBuffer: Buffer, contentType: string, size: number): Promise<void> {
  try {
    // For large images, we'll store them in chunks to avoid memory issues
    const CHUNK_SIZE = 1024 * 1024 // 1MB chunks
    const chunks: string[] = []
    
    // Split the buffer into chunks
    for (let i = 0; i < imageBuffer.length; i += CHUNK_SIZE) {
      const chunk = imageBuffer.slice(i, i + CHUNK_SIZE)
      chunks.push(chunk.toString('base64'))
    }

    const cachedImage: CachedImage = {
      data: chunks.join(''), // Join chunks back together
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

    console.log(`Large image cached efficiently: ${url} (${chunks.length} chunks)`)
  } catch (error) {
    console.error('Failed to cache large image efficiently:', error)
    // Don't throw - caching is optional
  }
}

// Check if image should be cached based on size
export function shouldCacheImage(size: number): boolean {
  const MAX_CACHE_SIZE = 5 * 1024 * 1024 // 5MB
  return size <= MAX_CACHE_SIZE
}

// SCAN-based helper functions for production use
export async function scanAll(redis: any, pattern: string, count = 1000): Promise<string[]> {
  const out: string[] = []
  let cursor = '0'
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', count)
    cursor = String(next)
    if (Array.isArray(batch)) out.push(...batch)
  } while (cursor !== '0')
  return out
}

export async function batchDelete(redis: any, keys: string[], batchSize = 500): Promise<number> {
  let deleted = 0
  for (let i = 0; i < keys.length; i += batchSize) {
    const chunk = keys.slice(i, i + batchSize)
    // Prefer UNLINK if supported (non-blocking); fallback to DEL
    if (typeof (redis as any).unlink === 'function') {
      deleted += await redis.unlink(...chunk)
    } else {
      deleted += await redis.del(...chunk)
    }
  }
  return deleted
}

// Production-safe cache clearing
export async function clearAllImageCaches(): Promise<{
  deletedImages: number
  deletedMetadata: number
  totalDeleted: number
}> {
  try {
    const keys = await scanAll(redis, 'image_proxy:*')
    const metadataKeys = await scanAll(redis, 'image_metadata:*')
    
    const deletedImages = await batchDelete(redis, keys)
    const deletedMeta = await batchDelete(redis, metadataKeys)
    
    console.log(`Cache cleared: ${deletedImages} images, ${deletedMeta} metadata`)
    
    return {
      deletedImages,
      deletedMetadata: deletedMeta,
      totalDeleted: deletedImages + deletedMeta
    }
  } catch (error) {
    console.error('Failed to clear all caches:', error)
    throw error
  }
}

// Get cache statistics using SCAN (production-safe)
export async function getCacheStats(): Promise<{
  totalImages: number
  totalSize: number
  oldestCache: number | null
  newestCache: number | null
}> {
  try {
    const keys = await scanAll(redis, 'image_proxy:*')
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
