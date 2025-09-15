import { redis } from './redis'

// API Cache Configuration
export const API_CACHE_TTL = {
  USER_PROFILE: 5 * 60, // 5 minutes
  REFERRAL_STATS: 2 * 60, // 2 minutes
  STREAK_DATA: 1 * 60, // 1 minute
  DAILY_BONUS_STATUS: 30, // 30 seconds
  BLACKLIST_CHECK: 10 * 60, // 10 minutes
} as const

// Cache keys for different API endpoints
export const API_CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `api:user:profile:${userId}`,
  REFERRAL_STATS: (userId: string) => `api:referral:stats:${userId}`,
  STREAK_DATA: (userId: string) => `api:user:streak:${userId}`,
  DAILY_BONUS_STATUS: (userId: string) => `api:user:daily-bonus:${userId}`,
  BLACKLIST_CHECK: (email: string) => `api:blacklist:${email.toLowerCase()}`,
} as const

// Generic API cache interface
export interface CachedApiResponse<T = any> {
  data: T
  timestamp: number
  ttl: number
  version: string
}

// Cache API response
export async function cacheApiResponse<T>(
  key: string,
  data: T,
  ttl: number,
  version = '1.0'
): Promise<void> {
  try {
    const cachedResponse: CachedApiResponse<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version
    }

    await redis.setex(key, ttl, JSON.stringify(cachedResponse))
    console.log(`API response cached: ${key}`)
  } catch (error) {
    console.error('Failed to cache API response:', error)
    // Don't throw - caching is optional
  }
}

// Get cached API response
export async function getCachedApiResponse<T>(
  key: string
): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    
    if (!cached) {
      return null
    }

    const cachedResponse: CachedApiResponse<T> = JSON.parse(cached as string)
    
    // Check if cache is expired
    const now = Date.now()
    const cacheAge = now - cachedResponse.timestamp
    if (cacheAge > cachedResponse.ttl * 1000) {
      await redis.del(key)
      return null
    }

    console.log(`API cache hit: ${key} (age: ${Math.round(cacheAge / 1000)}s)`)
    return cachedResponse.data
  } catch (error) {
    console.error('Failed to get cached API response:', error)
    return null
  }
}

// Invalidate cache for a specific user
export async function invalidateUserCache(userId: string): Promise<void> {
  try {
    const patterns = [
      API_CACHE_KEYS.USER_PROFILE(userId),
      API_CACHE_KEYS.REFERRAL_STATS(userId),
      API_CACHE_KEYS.STREAK_DATA(userId),
      API_CACHE_KEYS.DAILY_BONUS_STATUS(userId),
    ]

    await Promise.all(patterns.map(key => redis.del(key)))
    console.log(`User cache invalidated: ${userId}`)
  } catch (error) {
    console.error('Failed to invalidate user cache:', error)
  }
}

// Cache with automatic invalidation
export async function cacheWithInvalidation<T>(
  key: string,
  data: T,
  ttl: number,
  invalidationKeys?: string[]
): Promise<void> {
  await cacheApiResponse(key, data, ttl)
  
  if (invalidationKeys) {
    // Set shorter TTL for invalidation keys
    await Promise.all(
      invalidationKeys.map(invKey => 
        redis.setex(invKey, 60, '1') // 1 minute TTL
      )
    )
  }
}

// Batch cache operations
export async function batchCacheApiResponses(
  operations: Array<{
    key: string
    data: any
    ttl: number
  }>
): Promise<void> {
  try {
    const pipeline = redis.pipeline()
    
    operations.forEach(({ key, data, ttl }) => {
      const cachedResponse: CachedApiResponse = {
        data,
        timestamp: Date.now(),
        ttl,
        version: '1.0'
      }
      pipeline.setex(key, ttl, JSON.stringify(cachedResponse))
    })
    
    await pipeline.exec()
    console.log(`Batch cached ${operations.length} API responses`)
  } catch (error) {
    console.error('Failed to batch cache API responses:', error)
  }
}

// Get cache statistics
export async function getApiCacheStats(): Promise<{
  totalKeys: number
  memoryUsage: number
  hitRate: number
}> {
  try {
    // This would require Redis INFO command - simplified for now
    return {
      totalKeys: 0,
      memoryUsage: 0,
      hitRate: 0
    }
  } catch (error) {
    console.error('Failed to get API cache stats:', error)
    return {
      totalKeys: 0,
      memoryUsage: 0,
      hitRate: 0
    }
  }
}

// Clear all API caches
export async function clearAllApiCaches(): Promise<number> {
  try {
    const keys = await redis.keys('api:*')
    if (keys.length === 0) return 0
    
    const deleted = await redis.del(...keys)
    console.log(`Cleared ${deleted} API cache entries`)
    return deleted
  } catch (error) {
    console.error('Failed to clear API caches:', error)
    return 0
  }
}
