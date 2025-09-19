'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { ClerkLoginButton } from '@/components/auth/clerk-login-button'

export function Navigation() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
              priority
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ImageStudioLab
            </span>
          </div>

          {/* Desktop Navigation */}
          {/* <nav className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </Link>
          </nav> */}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              {isLoaded ? (
                <>
                  {isSignedIn ? (
                    <div className="flex items-center space-x-2">
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                          Dashboard
                        </Button>
                      </Link>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8"
                          }
                        }}
                        afterSignOutUrl="/"
                        showName={true}
                        userProfileMode="modal"
                      />
                    </div>
                  ) : (
                    <ClerkLoginButton 
                      variant="ghost" 
                      size="sm" 
                      mode="signin"
                      showTermsConsent={true}
                    />
                  )}
                </>
              ) : (
                // Fallback when Clerk is not loaded - still use ClerkLoginButton
                <ClerkLoginButton 
                  variant="ghost" 
                  size="sm" 
                  mode="signin"
                  showTermsConsent={true}
                />
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 py-4 space-y-4">
              {/* <nav className="space-y-2">
                <Link 
                  href="/about" 
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </nav> */}

              <div className="space-y-2 pt-4 border-t">
                {isLoaded ? (
                  <>
                    {isSignedIn ? (
                      <>
                        <Link href="/dashboard">
                          <Button variant="outline" size="sm" className="w-full">
                            Dashboard
                          </Button>
                        </Link>
                        <div className="flex justify-center">
                          <UserButton 
                            appearance={{
                              elements: {
                                avatarBox: "w-8 h-8"
                              }
                            }}
                            afterSignOutUrl="/"
                            showName={true}
                            userProfileMode="modal"
                          />
                        </div>
                      </>
                    ) : (
                      <ClerkLoginButton 
                        variant="ghost" 
                        size="sm" 
                        mode="signin"
                        showTermsConsent={true}
                        className="w-full justify-start"
                      />
                    )}
                  </>
                ) : (
                  // Fallback when Clerk is not loaded - still use ClerkLoginButton
                  <ClerkLoginButton 
                    variant="ghost" 
                    size="sm" 
                    mode="signin"
                    showTermsConsent={true}
                    className="w-full justify-start"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
