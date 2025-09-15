'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  RefreshCw, 
  Clock, 
  Database,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface CleanupStats {
  totalImages: number
  expiredImages: number
  cutoffTime: string
  error?: string
}

interface CleanupResult {
  success: boolean
  message: string
  details: {
    deletedCount: number
    errors: string[]
    statsBefore: CleanupStats
    statsAfter: CleanupStats
    timestamp: string
  }
}

export function CleanupManagement() {
  const [stats, setStats] = useState<CleanupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<CleanupResult | null>(null)

  // Fetch cleanup stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/cleanup')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching cleanup stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Run manual cleanup
  const runCleanup = async () => {
    try {
      setRunning(true)
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual: true }),
      })

      if (response.ok) {
        const result = await response.json()
        setLastCleanup(result)
        // Refresh stats after cleanup
        await fetchStats()
      }
    } catch (error) {
      console.error('Error running cleanup:', error)
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }

  const getTimeUntilExpiry = (timeString: string) => {
    const expiry = new Date(new Date(timeString).getTime() + 60 * 60 * 1000)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cleanup Management
          </CardTitle>
          <CardDescription>
            Manage automatic image cleanup and storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading cleanup statistics...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cleanup Management
        </CardTitle>
        <CardDescription>
          Manage automatic image cleanup and storage. Images are automatically deleted after 1 hour.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats?.totalImages || 0}</div>
            <div className="text-sm text-muted-foreground">Total Images</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-500">{stats?.expiredImages || 0}</div>
            <div className="text-sm text-muted-foreground">Expired Images</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              {stats ? stats.totalImages - stats.expiredImages : 0}
            </div>
            <div className="text-sm text-muted-foreground">Active Images</div>
          </div>
        </div>

        {/* Cleanup Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Images expire after 1 hour of generation</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>Automatic cleanup runs every 30 minutes</span>
          </div>
          {stats?.cutoffTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Cutoff time: {formatTime(stats.cutoffTime)}</span>
            </div>
          )}
        </div>

        {/* Manual Cleanup */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Manual Cleanup</h4>
            <p className="text-sm text-muted-foreground">
              Run cleanup immediately to remove expired images
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={running || (stats?.expiredImages || 0) === 0}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {running ? 'Running...' : 'Run Cleanup'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Run Manual Cleanup</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {stats?.expiredImages || 0} expired images from both storage and database. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={runCleanup}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete {stats?.expiredImages || 0} Images
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Last Cleanup Result */}
        {lastCleanup && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {lastCleanup.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Last Cleanup Result</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{lastCleanup.message}</div>
              <div>Completed at: {formatTime(lastCleanup.details.timestamp)}</div>
              {lastCleanup.details.errors.length > 0 && (
                <div className="text-red-500">
                  Errors: {lastCleanup.details.errors.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
