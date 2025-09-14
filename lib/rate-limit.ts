import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = Redis.fromEnv()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyPrefix: string // Prefix for Redis keys
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline()
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, '-inf', windowStart)
      
      // Count current requests in window
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
      
      // Set expiration
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000))
      
      const results = await pipeline.exec()
      
      // Extract the count from pipeline results
      const currentCount = results?.[1] as number || 0
      
      const remaining = Math.max(0, this.config.maxRequests - currentCount - 1)
      const resetTime = now + this.config.windowMs
      
      if (currentCount >= this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil(this.config.windowMs / 1000)
        }
      }

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime
      }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      // Fail open - allow request if Redis is down
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }
  }

  async getRemaining(identifier: string): Promise<number> {
    const key = `${this.config.keyPrefix}:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Remove expired entries and count remaining
      await redis.zremrangebyscore(key, '-inf', windowStart)
      const count = await redis.zcard(key)
      return Math.max(0, this.config.maxRequests - count)
    } catch (error) {
      console.error('Failed to get remaining count:', error)
      return this.config.maxRequests
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const styleMySelfieRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 15, // 15 requests per hour
  keyPrefix: 'rate_limit:style_my_selfie'
})

export const generalApiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  keyPrefix: 'rate_limit:general_api'
})

// Utility function to create rate limit headers
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000))
  }

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter)
  }

  return headers
}
