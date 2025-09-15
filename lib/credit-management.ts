import 'server-only'
import { createServiceRoleClient } from '@/lib/supabase/server'

export interface CreditOperationResult {
  success: boolean
  creditsLeft: number
  totalCreditsUsed: number
  error?: string
}

export interface CreditDeductionOptions {
  maxRetries?: number
  retryDelay?: number
  userId: string
}

/**
 * Atomically deduct credits with retry logic and proper error handling
 */
export const deductCreditsWithRetry = async (
  options: CreditDeductionOptions
): Promise<CreditOperationResult> => {
  const { maxRetries = 3, retryDelay = 1000, userId } = options
  const supabase = createServiceRoleClient()
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Credit deduction attempt ${attempt}/${maxRetries} for user ${userId}`)
      
      const { data: creditResult, error: creditError } = await supabase
        .rpc('use_credits', { user_uuid: userId, credits_to_use: 1 })

      if (creditError) {
        console.error(`Credit deduction attempt ${attempt} failed:`, creditError)
        
        if (attempt === maxRetries) {
          return {
            success: false,
            creditsLeft: 0,
            totalCreditsUsed: 0,
            error: `Failed to deduct credits after ${maxRetries} attempts: ${creditError.message}`
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        continue
      }

      if (!creditResult || !creditResult.success) {
        return {
          success: false,
          creditsLeft: 0,
          totalCreditsUsed: 0,
          error: creditResult?.error || 'Insufficient credits'
        }
      }

      console.log(`Credits successfully deducted for user ${userId}. Remaining: ${creditResult.credits_remaining}`)
      
      return {
        success: true,
        creditsLeft: creditResult.credits_remaining,
        totalCreditsUsed: 0 // This function doesn't return total_credits_used
      }
      
    } catch (error) {
      console.error(`Credit deduction attempt ${attempt} threw error:`, error)
      
      if (attempt === maxRetries) {
        return {
          success: false,
          creditsLeft: 0,
          totalCreditsUsed: 0,
          error: `Credit deduction failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }
  
  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    creditsLeft: 0,
    totalCreditsUsed: 0,
    error: 'Credit deduction failed: Maximum retries exceeded'
  }
}

/**
 * Refund credits with retry logic and proper error handling
 */
export const refundCreditsWithRetry = async (
  options: CreditDeductionOptions
): Promise<CreditOperationResult> => {
  const { maxRetries = 3, retryDelay = 1000, userId } = options
  const supabase = createServiceRoleClient()
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Credit refund attempt ${attempt}/${maxRetries} for user ${userId}`)
      
      const { data: refundResult, error: refundError } = await supabase
        .rpc('add_user_credits', { 
          user_id: userId, 
          credits: 1, 
          transaction_type: 'refund',
          metadata: { reason: 'generation_failed' }
        })

      if (refundError) {
        console.error(`Credit refund attempt ${attempt} failed:`, refundError)
        
        if (attempt === maxRetries) {
          return {
            success: false,
            creditsLeft: 0,
            totalCreditsUsed: 0,
            error: `Failed to refund credits after ${maxRetries} attempts: ${refundError.message}`
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        continue
      }

      if (!refundResult || !refundResult.success) {
        return {
          success: false,
          creditsLeft: 0,
          totalCreditsUsed: 0,
          error: refundResult?.error || 'Failed to refund credits'
        }
      }

      console.log(`Credits successfully refunded for user ${userId}. Added: ${refundResult.credits_added}`)
      
      return {
        success: true,
        creditsLeft: refundResult.credits_after,
        totalCreditsUsed: 0 // This function doesn't return total_credits_used
      }
      
    } catch (error) {
      console.error(`Credit refund attempt ${attempt} threw error:`, error)
      
      if (attempt === maxRetries) {
        return {
          success: false,
          creditsLeft: 0,
          totalCreditsUsed: 0,
          error: `Credit refund failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
    }
  }
  
  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    creditsLeft: 0,
    totalCreditsUsed: 0,
    error: 'Credit refund failed: Maximum retries exceeded'
  }
}

/**
 * Get current credit status for a user
 */
export const getCurrentCredits = async (userId: string): Promise<CreditOperationResult> => {
  const supabase = createServiceRoleClient()
  
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('credits_left, total_credits_used')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return {
        success: false,
        creditsLeft: 0,
        totalCreditsUsed: 0,
        error: 'Failed to fetch credit status'
      }
    }

    return {
      success: true,
      creditsLeft: profile.credits_left,
      totalCreditsUsed: profile.total_credits_used
    }
  } catch (error) {
    console.error('Error fetching credit status:', error)
    return {
      success: false,
      creditsLeft: 0,
      totalCreditsUsed: 0,
      error: 'Failed to fetch credit status'
    }
  }
}
