'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TermsConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConsent: () => void
  mode?: 'signin' | 'signup'
}

export function TermsConsentModal({ 
  open, 
  onOpenChange, 
  onConsent, 
  mode = 'signin' 
}: TermsConsentModalProps) {
  const [consented, setConsented] = useState(false)
  const [showError, setShowError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConsentChange = (checked: boolean) => {
    setConsented(checked)
    setShowError(false)
  }

  const handleProceed = () => {
    if (!consented) {
      setShowError(true)
      return
    }
    onConsent()
    onOpenChange(false)
  }

  const handleCancel = () => {
    setConsented(false)
    setShowError(false)
    onOpenChange(false)
  }

  if (!mounted) return null

  const modalContent = (
    <div className="terms-consent-modal">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terms & Privacy Agreement</DialogTitle>
            <DialogDescription>
              Please review and accept our terms before {mode === 'signup' ? 'signing up' : 'signing in'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Terms Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms-consent-modal"
                checked={consented}
                onCheckedChange={handleConsentChange}
                className="mt-1"
              />
              <div className="space-y-2">
                <label 
                  htmlFor="terms-consent-modal" 
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
                      You must accept the terms and conditions to continue.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceed}
                disabled={!consented}
                className="flex-1"
              >
                {mode === 'signup' ? 'Sign Up' : 'Sign In'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  return createPortal(modalContent, document.body)
}
