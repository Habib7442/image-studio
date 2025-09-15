import { redis } from './redis'

// Performance monitoring interface
export interface PerformanceMetrics {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: number
  userId?: string
  cacheHit?: boolean
  error?: string
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private readonly maxMetrics = 1000 // Keep last 1000 metrics in memory

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow requests
    if (metric.responseTime > 2000) { // 2 seconds
      console.warn(`Slow API request detected: ${metric.method} ${metric.endpoint} took ${metric.responseTime}ms`)
    }

    // Log errors
    if (metric.statusCode >= 400) {
      console.error(`API error: ${metric.method} ${metric.endpoint} returned ${metric.statusCode}`)
    }
  }

  // Get performance statistics
  getStats(): {
    totalRequests: number
    averageResponseTime: number
    slowRequests: number
    errorRate: number
    cacheHitRate: number
    recentMetrics: PerformanceMetrics[]
  } {
    const totalRequests = this.metrics.length
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests
    const slowRequests = this.metrics.filter(m => m.responseTime > 2000).length
    const errorRequests = this.metrics.filter(m => m.statusCode >= 400).length
    const cacheHits = this.metrics.filter(m => m.cacheHit).length

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
      cacheHitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      recentMetrics: this.metrics.slice(-10) // Last 10 metrics
    }
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = []
  }

  // Store metrics in Redis for persistence
  async storeMetrics(): Promise<void> {
    try {
      const key = `performance:metrics:${Date.now()}`
      await redis.setex(key, 3600, JSON.stringify(this.metrics)) // Store for 1 hour
      console.log(`Stored ${this.metrics.length} performance metrics in Redis`)
    } catch (error) {
      console.error('Failed to store performance metrics:', error)
    }
  }

  // Get metrics from Redis
  async getStoredMetrics(): Promise<PerformanceMetrics[]> {
    try {
      const keys = await redis.keys('performance:metrics:*')
      const allMetrics: PerformanceMetrics[] = []
      
      for (const key of keys) {
        const data = await redis.get(key)
        if (data) {
          const metrics = JSON.parse(data as string)
          allMetrics.push(...metrics)
        }
      }
      
      return allMetrics
    } catch (error) {
      console.error('Failed to get stored metrics:', error)
      return []
    }
  }
}

// Performance monitoring middleware
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  endpoint: string,
  method: string
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now()
    const monitor = PerformanceMonitor.getInstance()
    
    let statusCode = 500
    let cacheHit = false
    let error: string | undefined

    try {
      const response = await handler(...args)
      statusCode = response.status
      
      // Check if response was from cache
      const cacheHeader = response.headers.get('X-Cache')
      cacheHit = cacheHeader === 'HIT'
      
      return response
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
      throw err
    } finally {
      const responseTime = Date.now() - startTime
      
      monitor.recordMetric({
        endpoint,
        method,
        responseTime,
        statusCode,
        timestamp: Date.now(),
        cacheHit,
        error
      })
    }
  }
}

// API performance decorator
export function monitorApiPerformance(endpoint: string, method: string = 'GET') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = withPerformanceMonitoring(method, endpoint, method)
  }
}

// Health check endpoint data
export async function getHealthCheckData(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  metrics: ReturnType<PerformanceMonitor['getStats']>
  redis: {
    connected: boolean
    latency: number
  }
  timestamp: string
}> {
  const monitor = PerformanceMonitor.getInstance()
  const metrics = monitor.getStats()
  
  // Check Redis connection
  let redisConnected = false
  let redisLatency = 0
  
  try {
    const start = Date.now()
    await redis.ping()
    redisLatency = Date.now() - start
    redisConnected = true
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  // Determine overall health
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  
  if (!redisConnected || metrics.errorRate > 10) {
    status = 'unhealthy'
  } else if (metrics.averageResponseTime > 1000 || metrics.cacheHitRate < 50) {
    status = 'degraded'
  }

  return {
    status,
    metrics,
    redis: {
      connected: redisConnected,
      latency: redisLatency
    },
    timestamp: new Date().toISOString()
  }
}
