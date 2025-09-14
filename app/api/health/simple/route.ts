import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Simple health check for basic monitoring (faster response)
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Quick database ping
    const supabase = createServiceRoleClient()
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    const responseTime = Date.now() - startTime
    
    // Check critical environment variables
    const hasRequiredEnv = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.GEMINI_API_KEY
    )

    const isHealthy = !error && hasRequiredEnv

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'image-studio-lab',
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        database: !error,
        environment: hasRequiredEnv
      }
    }, { 
      status: isHealthy ? 200 : 503 
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      service: 'image-studio-lab',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: false,
        environment: false
      }
    }, { status: 503 })
  }
}
