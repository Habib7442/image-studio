'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react'

interface ClerkErrorBoundaryProps {
  children: React.ReactNode
}

export function ClerkErrorBoundary({ children }: ClerkErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Clerk') || event.message.includes('Failed to load Clerk')) {
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-display">Authentication Error</CardTitle>
            <CardDescription>
              There was an issue loading the authentication system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Clerk failed to load. Please check your environment variables.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Required Environment Variables:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</div>
                <div>• CLERK_SECRET_KEY</div>
                <div>• NEXT_PUBLIC_SUPABASE_URL</div>
                <div>• NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div>• SUPABASE_SERVICE_ROLE_KEY</div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setHasError(false)}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Continue Without Auth
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
