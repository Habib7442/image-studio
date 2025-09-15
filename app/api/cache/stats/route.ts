import { NextRequest, NextResponse } from 'next/server'
import { getCacheStats, clearImageCache } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
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
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (imageUrl) {
      // Clear specific image cache
      await clearImageCache(imageUrl)
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared for image: ${imageUrl}` 
      })
    } else {
      // Clear all image caches
      const { redis } = await import('@/lib/redis')
      const keys = await redis.keys('image_proxy:*')
      const metadataKeys = await redis.keys('image_metadata:*')
      
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      if (metadataKeys.length > 0) {
        await redis.del(...metadataKeys)
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Cleared ${keys.length} image caches and ${metadataKeys.length} metadata caches` 
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
