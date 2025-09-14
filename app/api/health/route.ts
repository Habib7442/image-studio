import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  error?: string
  details?: any
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  service: string
  timestamp: string
  checks: Record<string, HealthCheck>
  overallResponseTime: number
}

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, HealthCheck> = {}

  // Check database connection
  const dbCheck = await checkDatabase()
  checks.database = dbCheck

  // Check AI service (Gemini)
  const aiCheck = await checkAIService()
  checks.aiService = aiCheck

  // Check Redis (for rate limiting)
  const redisCheck = await checkRedis()
  checks.redis = redisCheck

  // Check environment variables
  const envCheck = checkEnvironment()
  checks.environment = envCheck

  // Check storage bucket
  const storageCheck = await checkStorage()
  checks.storage = storageCheck

  const overallResponseTime = Date.now() - startTime

  // Determine overall status
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy')
  const anyUnhealthy = Object.values(checks).some(check => check.status === 'unhealthy')
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  if (allHealthy) {
    overallStatus = 'healthy'
  } else if (anyUnhealthy) {
    overallStatus = 'unhealthy'
  } else {
    overallStatus = 'degraded'
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    service: 'image-studio-lab',
    timestamp: new Date().toISOString(),
    checks,
    overallResponseTime
  }

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(healthStatus, { status: httpStatus })
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const supabase = createServiceRoleClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return {
        name: 'Database',
        status: 'unhealthy',
        responseTime,
        error: error.message,
        details: { errorCode: error.code }
      }
    }

    // Test credit function availability
    const { data: creditTest, error: creditError } = await supabase
      .rpc('use_credit', { p_user_id: '00000000-0000-0000-0000-000000000000' })

    if (creditError && !creditError.message.includes('Insufficient credits')) {
      return {
        name: 'Database',
        status: 'degraded',
        responseTime,
        error: `Credit function error: ${creditError.message}`,
        details: { functionTest: 'failed' }
      }
    }

    return {
      name: 'Database',
      status: 'healthy',
      responseTime,
      details: { 
        connection: 'ok',
        creditFunction: 'ok',
        recordCount: data?.length || 0
      }
    }
  } catch (error) {
    return {
      name: 'Database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: { connection: 'failed' }
    }
  }
}

async function checkAIService(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return {
        name: 'AI Service (Gemini)',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'GEMINI_API_KEY not configured',
        details: { configuration: 'missing' }
      }
    }

    // Test AI service with a simple request
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Simple test prompt
    const testPrompt = 'Say "health check" in one word.'
    const result = await model.generateContent(testPrompt)
    const response = await result.response
    const text = response.text()

    const responseTime = Date.now() - startTime

    if (!text || text.trim().length === 0) {
      return {
        name: 'AI Service (Gemini)',
        status: 'degraded',
        responseTime,
        error: 'Empty response from AI service',
        details: { testPrompt, response: text }
      }
    }

    return {
      name: 'AI Service (Gemini)',
      status: 'healthy',
      responseTime,
      details: { 
        testPrompt,
        response: text.trim(),
        model: 'gemini-1.5-flash'
      }
    }
  } catch (error) {
    return {
      name: 'AI Service (Gemini)',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown AI service error',
      details: { testFailed: true }
    }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check if Redis environment variables are configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        name: 'Redis (Rate Limiting)',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        error: 'Redis environment variables not configured',
        details: { 
          UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
          UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN
        }
      }
    }

    // Test Redis connection
    const { Redis } = await import('@upstash/redis')
    const redis = Redis.fromEnv()
    
    // Simple ping test
    const testKey = 'health-check-test'
    const testValue = Date.now().toString()
    
    await redis.set(testKey, testValue, { ex: 10 }) // 10 second expiry
    const retrievedValue = await redis.get(testKey)
    await redis.del(testKey)

    const responseTime = Date.now() - startTime

    if (retrievedValue !== testValue) {
      return {
        name: 'Redis (Rate Limiting)',
        status: 'degraded',
        responseTime,
        error: 'Redis read/write test failed',
        details: { 
          expected: testValue,
          actual: retrievedValue
        }
      }
    }

    return {
      name: 'Redis (Rate Limiting)',
      status: 'healthy',
      responseTime,
      details: { 
        connection: 'ok',
        readWriteTest: 'passed'
      }
    }
  } catch (error) {
    return {
      name: 'Redis (Rate Limiting)',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
      details: { connection: 'failed' }
    }
  }
}

function checkEnvironment(): HealthCheck {
  const startTime = Date.now()
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY'
  ]

  const optionalEnvVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ]

  const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar])
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar])

  const responseTime = Date.now() - startTime

  if (missingRequired.length > 0) {
    return {
      name: 'Environment Variables',
      status: 'unhealthy',
      responseTime,
      error: `Missing required environment variables: ${missingRequired.join(', ')}`,
      details: {
        required: requiredEnvVars.map(envVar => ({
          name: envVar,
          configured: !!process.env[envVar]
        })),
        optional: optionalEnvVars.map(envVar => ({
          name: envVar,
          configured: !!process.env[envVar]
        }))
      }
    }
  }

  if (missingOptional.length > 0) {
    return {
      name: 'Environment Variables',
      status: 'degraded',
      responseTime,
      error: `Missing optional environment variables: ${missingOptional.join(', ')}`,
      details: {
        required: requiredEnvVars.map(envVar => ({
          name: envVar,
          configured: !!process.env[envVar]
        })),
        optional: optionalEnvVars.map(envVar => ({
          name: envVar,
          configured: !!process.env[envVar]
        }))
      }
    }
  }

  return {
    name: 'Environment Variables',
    status: 'healthy',
    responseTime,
    details: {
      required: requiredEnvVars.map(envVar => ({
        name: envVar,
        configured: !!process.env[envVar]
      })),
      optional: optionalEnvVars.map(envVar => ({
        name: envVar,
        configured: !!process.env[envVar]
      }))
    }
  }
}

async function checkStorage(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const supabase = createServiceRoleClient()
    
    // Test storage bucket access
    const { data, error } = await supabase.storage
      .from('generated-images')
      .list('', { limit: 1 })

    const responseTime = Date.now() - startTime

    if (error) {
      return {
        name: 'Storage (Supabase)',
        status: 'unhealthy',
        responseTime,
        error: error.message,
        details: { 
          bucket: 'generated-images',
          access: 'failed'
        }
      }
    }

    return {
      name: 'Storage (Supabase)',
      status: 'healthy',
      responseTime,
      details: { 
        bucket: 'generated-images',
        access: 'ok',
        fileCount: data?.length || 0
      }
    }
  } catch (error) {
    return {
      name: 'Storage (Supabase)',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown storage error',
      details: { 
        bucket: 'generated-images',
        access: 'failed'
      }
    }
  }
}
