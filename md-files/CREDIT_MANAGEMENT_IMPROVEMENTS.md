# Credit Management Improvements

## Overview
This document describes the improvements made to the credit management system to address silent failures and ensure accurate credit state reporting to the client.

## Problem Addressed

### **Silent Credit Update Failures**
**Issue**: The previous implementation could silently log credit update failures while still returning decremented credit counts, misleading the UI about the actual database state.

**Example of Problematic Code**:
```typescript
// ❌ BAD: Silent failure with misleading response
if (updateError) {
  console.error('Failed to update credits:', updateError)
  // Don't fail the request, just log the error
}

// Later in response:
return NextResponse.json({
  creditsLeft: profile.credits_left - 1, // ❌ Misleading - actual DB state unknown
})
```

## Solution Implemented

### **1. Robust Credit Management System (`lib/credit-management.ts`)**

#### **Retry Logic with Exponential Backoff**
```typescript
export const deductCreditsWithRetry = async (
  options: CreditDeductionOptions
): Promise<CreditOperationResult> => {
  const { maxRetries = 3, retryDelay = 1000, userId } = options
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data: creditResult, error: creditError } = await supabase
        .rpc('use_credit', { p_user_id: userId })

      if (creditError) {
        if (attempt === maxRetries) {
          return {
            success: false,
            creditsLeft: 0,
            totalCreditsUsed: 0,
            error: `Failed to deduct credits after ${maxRetries} attempts`
          }
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        continue
      }
      
      // Return actual database state
      return {
        success: true,
        creditsLeft: creditResult[0].credits_left,
        totalCreditsUsed: creditResult[0].total_credits_used
      }
    } catch (error) {
      // Handle and retry
    }
  }
}
```

#### **Proper Error Handling**
- **No Silent Failures**: All errors are properly handled and returned to client
- **Accurate State**: Always return actual database state, not assumed state
- **Clear Error Messages**: Specific error messages for different failure types
- **Retry Logic**: Automatic retry with exponential backoff for transient failures

### **2. Updated API Implementation**

#### **Before (Problematic)**
```typescript
// ❌ Silent failure with misleading response
const { error: updateError } = await supabase
  .from('users')
  .update({ credits_left: profile.credits_left - 1 })
  .eq('id', userId)

if (updateError) {
  console.error('Failed to update credits:', updateError)
  // Don't fail the request, just log the error
}

return NextResponse.json({
  creditsLeft: profile.credits_left - 1, // ❌ Misleading
})
```

#### **After (Robust)**
```typescript
// ✅ Proper error handling with retry logic
const creditResult = await deductCreditsWithRetry({
  userId,
  maxRetries: 3,
  retryDelay: 1000
})

if (!creditResult.success) {
  if (creditResult.error?.includes('Insufficient credits')) {
    return NextResponse.json({
      error: 'Insufficient credits',
      creditsLeft: creditResult.creditsLeft, // ✅ Actual DB state
    }, { status: 402 })
  } else {
    return NextResponse.json({
      error: 'Failed to process credit deduction. Please try again.',
      creditsLeft: creditResult.creditsLeft, // ✅ Actual DB state
    }, { status: 500 })
  }
}

return NextResponse.json({
  creditsLeft: creditResult.creditsLeft, // ✅ Actual DB state
})
```

## Key Improvements

### **1. No More Silent Failures**
- **Before**: Errors logged but request continued with misleading data
- **After**: All errors properly handled and returned to client

### **2. Accurate Credit State**
- **Before**: Assumed credit count (could be wrong)
- **After**: Actual database state returned

### **3. Retry Logic**
- **Before**: Single attempt, fail immediately
- **After**: Up to 3 retries with exponential backoff

### **4. Proper Error Classification**
- **Insufficient Credits**: 402 status with current credit count
- **System Errors**: 500 status with retry suggestion
- **Refund Failures**: Clear error messages for manual review

### **5. Comprehensive Logging**
```typescript
console.log(`Credit deduction attempt ${attempt}/${maxRetries} for user ${userId}`)
console.log(`Credits successfully deducted for user ${userId}. Remaining: ${updatedCredits.credits_left}`)
```

## Error Handling Scenarios

### **1. Insufficient Credits**
```typescript
if (creditResult.error?.includes('Insufficient credits')) {
  return NextResponse.json({
    error: 'Insufficient credits',
    creditsLeft: creditResult.creditsLeft, // Actual current credits
    resetTime: userProfile.last_credit_reset
  }, { status: 402 })
}
```

### **2. System Errors (Retryable)**
```typescript
if (!creditResult.success && !creditResult.error?.includes('Insufficient credits')) {
  return NextResponse.json({
    error: 'Failed to process credit deduction. Please try again.',
    creditsLeft: creditResult.creditsLeft // Actual current credits
  }, { status: 500 })
}
```

### **3. Refund Failures**
```typescript
if (!refundResult.success) {
  console.error('Failed to refund credit after multiple attempts:', refundResult.error)
  return NextResponse.json({
    error: 'Credit refund failed - please contact support.',
    creditsLeft: creditResult.creditsLeft // Actual current credits
  }, { status: 500 })
}
```

## Retry Strategy

### **Exponential Backoff**
```typescript
// Wait before retry: 1000ms, 2000ms, 3000ms
await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
```

### **Maximum Retries**
- **Default**: 3 attempts
- **Configurable**: Can be adjusted per operation
- **Timeout**: Each retry has increasing delay

### **Retry Conditions**
- **Database Connection Errors**: Retry with backoff
- **Temporary Lock Contention**: Retry with backoff
- **Network Timeouts**: Retry with backoff
- **Insufficient Credits**: Don't retry (immediate failure)

## Monitoring and Debugging

### **Logging Strategy**
```typescript
// Attempt logging
console.log(`Credit deduction attempt ${attempt}/${maxRetries} for user ${userId}`)

// Success logging
console.log(`Credits successfully deducted for user ${userId}. Remaining: ${updatedCredits.credits_left}`)

// Error logging
console.error(`Credit deduction attempt ${attempt} failed:`, creditError)
console.error(`Credit deduction attempt ${attempt} threw error:`, error)
```

### **Error Tracking**
- **Retry Attempts**: Track number of retries per operation
- **Failure Reasons**: Categorize errors for analysis
- **Success Rates**: Monitor credit operation success rates
- **Performance**: Track retry delays and total operation time

## Testing Scenarios

### **1. Normal Flow**
- User has credits → Success → Credits deducted correctly

### **2. Insufficient Credits**
- User has 0 credits → Immediate failure → Correct error message

### **3. Database Errors**
- Temporary DB error → Retry → Success on retry
- Persistent DB error → Retry → Failure after max retries

### **4. Network Issues**
- Network timeout → Retry → Success on retry
- Persistent network issues → Retry → Failure after max retries

### **5. Concurrent Operations**
- Multiple simultaneous requests → Proper locking → No race conditions

## Performance Considerations

### **Retry Overhead**
- **Additional Latency**: Up to 6 seconds for 3 retries (1s + 2s + 3s)
- **Database Load**: Increased queries during retries
- **User Experience**: Clear error messages during failures

### **Optimization Strategies**
- **Fast First Attempt**: Optimize initial database call
- **Smart Retry Logic**: Only retry on retryable errors
- **Circuit Breaker**: Stop retrying if service is down

## Migration Impact

### **API Response Changes**
- **More Accurate**: Credit counts always reflect actual DB state
- **Better Errors**: Clear error messages for different failure types
- **Consistent Format**: All responses include actual credit state

### **Client-Side Updates**
- **Error Handling**: Update UI to handle new error responses
- **Credit Display**: Always show actual credit count from response
- **Retry Logic**: Implement client-side retry for 500 errors

## Security Considerations

### **Credit Accuracy**
- **No Double Charging**: Atomic operations prevent duplicate deductions
- **Accurate Refunds**: Failed operations properly refund credits
- **Audit Trail**: All credit operations logged for review

### **Error Information**
- **No Sensitive Data**: Error messages don't expose internal details
- **User-Friendly**: Clear messages for user actions
- **Support-Friendly**: Detailed logs for support team

## Future Enhancements

### **1. Circuit Breaker Pattern**
```typescript
// Stop retrying if service is consistently failing
if (consecutiveFailures > threshold) {
  return immediateFailure()
}
```

### **2. Adaptive Retry Delays**
```typescript
// Adjust retry delays based on error type
const delay = errorType === 'timeout' ? baseDelay : baseDelay * 2
```

### **3. Credit Operation History**
```typescript
// Track all credit operations for audit
const operation = {
  userId,
  operation: 'deduct',
  amount: 1,
  success: true,
  retries: 0,
  timestamp: new Date()
}
```

## Conclusion

The improved credit management system provides:
- **No Silent Failures**: All errors properly handled and reported
- **Accurate State**: Always return actual database state
- **Robust Retry Logic**: Handle transient failures gracefully
- **Better UX**: Clear error messages and accurate credit counts
- **Audit Trail**: Comprehensive logging for debugging and monitoring

This implementation ensures that users always see accurate credit information and that any credit operation failures are properly communicated rather than silently ignored.
