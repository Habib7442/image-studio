'use client'

import { useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { TermsConsentModal } from './terms-consent-modal'
import { User, Sparkles } from 'lucide-react'

interface ClerkLoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
  mode?: 'signin' | 'signup'
  showTermsConsent?: boolean
}

export function ClerkLoginButton({ 
  variant = 'default', 
  size = 'lg',
  className = '',
  children,
  mode = 'signin',
  showTermsConsent = true
}: ClerkLoginButtonProps) {
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [consented, setConsented] = useState(false)
  const { openSignIn, openSignUp, isLoaded } = useClerk()

  const handleButtonClick = () => {
    if (showTermsConsent && !consented) {
      setShowTermsModal(true)
    } else {
      // If terms are already consented or not required, proceed directly
      console.log(`Opening ${mode} modal`)
      if (mode === 'signup') {
        openSignUp()
      } else {
        openSignIn()
      }
    }
  }

  const handleConsent = () => {
    setConsented(true)
    setShowTermsModal(false)
    // Use Clerk's programmatic API to open the modal
    setTimeout(() => {
      console.log(`Opening ${mode} modal after consent`)
      if (mode === 'signup') {
        openSignUp()
      } else {
        openSignIn()
      }
    }, 100)
  }

  const buttonContent = children || (
    <>
      {mode === 'signin' ? (
        <>
          <User className="w-4 h-4 mr-2" />
          Sign In
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Get Started
        </>
      )}
    </>
  )

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleButtonClick}
      >
        {buttonContent}
      </Button>
      
      <TermsConsentModal
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        onConsent={handleConsent}
        mode={mode}
      />
    </>
  )
}
