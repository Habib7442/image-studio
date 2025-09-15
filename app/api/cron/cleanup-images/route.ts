import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredImages, getCleanupStats } from '@/lib/cleanup'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting scheduled image cleanup...')
    
    // Get stats before cleanup
    const statsBefore = await getCleanupStats()
    console.log('Stats before cleanup:', statsBefore)

    // Run cleanup
    const result = await cleanupExpiredImages()
    
    // Get stats after cleanup
    const statsAfter = await getCleanupStats()
    console.log('Stats after cleanup:', statsAfter)

    const response = {
      success: result.success,
      message: `Cleanup completed. Deleted ${result.deletedCount} images.`,
      details: {
        deletedCount: result.deletedCount,
        errors: result.errors,
        statsBefore,
        statsAfter,
        timestamp: new Date().toISOString()
      }
    }

    console.log('Cleanup response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  try {
    const { manual } = await request.json()
    
    if (!manual) {
      return NextResponse.json({ error: 'Manual trigger required' }, { status: 400 })
    }

    console.log('Manual cleanup triggered...')
    
    const statsBefore = await getCleanupStats()
    const result = await cleanupExpiredImages()
    const statsAfter = await getCleanupStats()

    return NextResponse.json({
      success: result.success,
      message: `Manual cleanup completed. Deleted ${result.deletedCount} images.`,
      details: {
        deletedCount: result.deletedCount,
        errors: result.errors,
        statsBefore,
        statsAfter,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Manual cleanup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Manual cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
