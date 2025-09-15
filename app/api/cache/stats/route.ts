import { NextRequest, NextResponse } from 'next/server'
import { getCacheStats, clearImageCache, clearAllImageCaches } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    // Authorization check for cache statistics
    const token = request.headers.get('x-admin-token')
    if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
      console.log('Unauthorized cache stats access attempt:', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin token required' 
      }, { status: 401 })
    }

    const stats = await getCacheStats()
    
    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        totalSizeMB: Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100,
        oldestCacheAge: stats.oldestCache ? Math.round((Date.now() - stats.oldestCache) / (1000 * 60 * 60)) : null, // hours
        newestCacheAge: stats.newestCache ? Math.round((Date.now() - stats.newestCache) / (1000 * 60)) : null, // minutes
      }
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get cache stats' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authorization check for destructive operations
    const token = request.headers.get('x-admin-token')
    if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
      console.log('Unauthorized cache clear attempt:', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Admin token required' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (imageUrl) {
      // Clear specific image cache
      await clearImageCache(imageUrl)
      console.log('Cache cleared for specific image:', imageUrl)
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared for image: ${imageUrl}` 
      })
    } else {
      // Clear all image caches using production-safe methods
      console.log('Starting full cache clear operation')
      const result = await clearAllImageCaches()
      
      console.log('Full cache clear completed:', result)
      return NextResponse.json({ 
        success: true, 
        message: `Cleared ${result.deletedImages} image caches and ${result.deletedMetadata} metadata caches (${result.totalDeleted} total)`,
        deleted: result
      })
    }
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear cache' 
    }, { status: 500 })
  }
}
