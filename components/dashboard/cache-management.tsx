'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Trash2, Database, Clock, HardDrive } from 'lucide-react'

interface CacheStats {
  totalImages: number
  totalSize: number
  totalSizeMB: number
  oldestCacheAge: number | null
  newestCacheAge: number | null
}

export function CacheManagement() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Failed to fetch cache stats')
      }
    } catch (err) {
      setError('Failed to fetch cache stats')
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached images? This will require re-downloading images from Supabase.')) {
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache/stats', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        setStats(null)
        await fetchStats() // Refresh stats
      } else {
        setError(data.error || 'Failed to clear cache')
      }
    } catch (err) {
      setError('Failed to clear cache')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Cache Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Image Cache</CardTitle>
            <CardDescription>
              Redis-powered image caching for improved performance
            </CardDescription>
          </div>
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="space-y-4">
            {/* Cache Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{stats.totalImages}</p>
                <p className="text-sm text-muted-foreground">Cached Images</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <HardDrive className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{stats.totalSizeMB} MB</p>
                <p className="text-sm text-muted-foreground">Cache Size</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">
                  {stats.oldestCacheAge ? `${stats.oldestCacheAge}h` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Oldest Cache</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">
                  {stats.newestCacheAge ? `${stats.newestCacheAge}m` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Newest Cache</p>
              </div>
            </div>

            {/* Cache Status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Redis caching enabled
                </span>
              </div>
              
              <Button 
                onClick={clearCache} 
                variant="destructive" 
                size="sm"
                disabled={loading || stats.totalImages === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>

            {/* Performance Benefits */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Performance Benefits:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Faster image loading in the editor</li>
                <li>Reduced load on Supabase storage</li>
                <li>Improved user experience with instant previews</li>
                <li>Automatic cache expiration (24 hours)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading cache statistics...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
