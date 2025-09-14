'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TermsConsentProps {
  onConsentChange: (consented: boolean) => void
  onProceed: () => void
  mode?: 'signin' | 'signup'
  disabled?: boolean
}

export function TermsConsent({ 
  onConsentChange, 
  onProceed, 
  mode = 'signin',
  disabled = false 
}: TermsConsentProps) {
  const [consented, setConsented] = useState(false)
  const [showError, setShowError] = useState(false)

  const handleConsentChange = (checked: boolean) => {
    setConsented(checked)
    setShowError(false)
    onConsentChange(checked)
  }

  const handleProceed = () => {
    if (!consented) {
      setShowError(true)
      return
    }
    onProceed()
  }

  return (
    <div className="space-y-4">
      {/* Terms Consent Checkbox */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms-consent"
          checked={consented}
          onCheckedChange={handleConsentChange}
          disabled={disabled}
          className="mt-1"
        />
        <div className="space-y-2">
          <label 
            htmlFor="terms-consent" 
            className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
          >
            I agree to the{' '}
            <Link 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Terms of Service
              <ExternalLink className="w-3 h-3" />
            </Link>
            {' '}and{' '}
            <Link 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            {' '}by continuing with {mode === 'signup' ? 'sign up' : 'sign in'}.
          </label>
          
          {/* Error Message */}
          {showError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must accept the Terms of Service and Privacy Policy to continue.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Proceed Button */}
      <Button 
        onClick={handleProceed}
        disabled={disabled || !consented}
        className="w-full"
        size="lg"
      >
        {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
      </Button>
    </div>
  )
}
