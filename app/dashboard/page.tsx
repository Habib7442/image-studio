import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserButton } from '@clerk/nextjs'
import { Sparkles, Camera, Users, Upload, Shield, Clock, Zap } from 'lucide-react'
import Image from 'next/image'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold font-display">ImageStudioLab</span>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display">Welcome to ImageStudioLab</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate stunning AI photos instantly for all platforms. Instagram, YouTube, LinkedIn, and more.
            </p>
          </div>

          {/* Credits Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Credits</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Credits reset every 24 hours
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Used Today</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Images generated today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Type</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="outline">Free</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upgrade for more credits
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generation Modes */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display">Generation Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>AI Photoshoot</span>
                  </CardTitle>
                  <CardDescription>
                    Generate personalized AI photos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Generating
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-primary" />
                    <span>Style My Selfie</span>
                  </CardTitle>
                  <CardDescription>
                    Transform your selfies with AI styles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Generating
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Professional Headshots</span>
                  </CardTitle>
                  <CardDescription>
                    Generate professional headshots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Generating
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display">Why Choose ImageStudioLab?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4 p-6 border-2 rounded-lg">
                <Shield className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-bold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  We do not save your images on our servers
                </p>
              </div>
              <div className="text-center space-y-4 p-6 border-2 rounded-lg">
                <Clock className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-bold">Daily Credit Reset</h3>
                <p className="text-sm text-muted-foreground">
                  Fresh credits every 24 hours
                </p>
              </div>
              <div className="text-center space-y-4 p-6 border-2 rounded-lg">
                <Zap className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-bold">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
