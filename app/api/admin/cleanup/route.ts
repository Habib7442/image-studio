import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { cleanupExpiredImages, getCleanupStats } from '@/lib/cleanup'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cleanup statistics
    const stats = await getCleanupStats()
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get cleanup stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cleanup stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Manual cleanup triggered by user ${userId}`)
    
    // Get stats before cleanup
    const statsBefore = await getCleanupStats()
    console.log('Stats before cleanup:', statsBefore)

    // Run cleanup
    const result = await cleanupExpiredImages()
    
    // Get stats after cleanup
    const statsAfter = await getCleanupStats()
    console.log('Stats after cleanup:', statsAfter)

    return NextResponse.json({
      success: result.success,
      message: `Manual cleanup completed. Deleted ${result.deletedCount} images.`,
      details: {
        deletedCount: result.deletedCount,
        errors: result.errors,
        deletedImages: result.deletedImages,
        statsBefore,
        statsAfter,
        triggeredBy: userId,
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
