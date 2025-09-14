# Improved Atomic Credit System

## Overview
This document describes the enhanced atomic credit deduction system that prevents race conditions, ensures users don't get free generations, and provides proper error handling with credit refunds.

## Critical Issues Fixed

### 1. **Free Generation Vulnerability**
**Problem**: Credits were deducted AFTER AI generation, allowing users to get free generations if the update failed.

**Solution**: Credits are now deducted BEFORE AI generation using atomic database operations.

### 2. **Race Condition Prevention**
**Problem**: Concurrent requests could bypass credit limits due to TOCTOU race conditions.

**Solution**: Implemented optimistic locking with `FOR UPDATE NOWAIT` and conditional updates.

### 3. **Failed Generation Handling**
**Problem**: If AI generation failed after credit deduction, users lost credits without getting service.

**Solution**: Added automatic credit refund mechanism for failed generations.

## Implementation Details

### Database Functions

#### 1. **`use_credit(p_user_id UUID)`** - Atomic Credit Deduction
```sql
-- Features:
-- - Row locking with FOR UPDATE NOWAIT
-- - Optimistic locking with conditional updates
-- - Proper error handling and transaction safety
-- - Returns updated credit counts and success status
```

#### 2. **`refund_credit(p_user_id UUID)`** - Credit Refund
```sql
-- Features:
-- - Refunds credits for failed operations
-- - Prevents negative total_credits_used
-- - Same locking mechanism as use_credit
```

### API Flow

#### **Before (Vulnerable)**
```typescript
1. Check credits (stale data)
2. Generate AI images (expensive operation)
3. Deduct credits (race condition here!)
4. Return response
```

#### **After (Secure)**
```typescript
1. Check credits (early validation)
2. ATOMICALLY deduct credits (before AI generation)
3. Generate AI images (expensive operation)
4. If generation fails: refund credits
5. Return response with fresh credit data
```

## Key Improvements

### 1. **Credit Deduction Timing**
- **Before**: After AI generation (vulnerable to failures)
- **After**: Before AI generation (prevents free generations)

### 2. **Race Condition Prevention**
- **Before**: Separate check and update operations
- **After**: Single atomic operation with row locking

### 3. **Error Handling**
- **Before**: Silent failures, users could lose credits
- **After**: Automatic refunds for failed generations

### 4. **Data Consistency**
- **Before**: Stale data from initial check
- **After**: Fresh data from database as source of truth

## Database Function Features

### **Optimistic Locking**
```sql
UPDATE users 
SET credits_left = credits_left - 1,
    total_credits_used = total_credits_used + 1
WHERE id = p_user_id
  AND credits_left = current_credits; -- Only update if unchanged
```

### **Row Locking**
```sql
SELECT credits_left, total_credits_used 
FROM users 
WHERE id = p_user_id 
FOR UPDATE NOWAIT; -- Fail immediately if locked
```

### **Error Handling**
```sql
EXCEPTION
  WHEN lock_not_available THEN
    -- Handle concurrent access
  WHEN OTHERS THEN
    -- Handle any other errors
```

## API Implementation

### **Credit Deduction (Before AI Generation)**
```typescript
// ATOMICALLY deduct credit BEFORE expensive AI generation
const { data: creditResult, error: creditError } = await supabase
  .rpc('use_credit', { p_user_id: userId })

if (!creditResult?.[0]?.success) {
  return NextResponse.json({
    error: 'Insufficient credits',
    creditsLeft: creditResult?.[0]?.credits_left ?? userProfile.credits_left
  }, { status: 402 })
}
```

### **Credit Refund (On AI Failure)**
```typescript
if (images.length === 0) {
  // AI generation failed, refund the credit
  const { data: refundResult } = await supabase
    .rpc('refund_credit', { p_user_id: userId })
  
  return NextResponse.json({
    error: 'No images generated. Credit has been refunded.'
  }, { status: 500 })
}
```

## Security Benefits

### 1. **Prevents Free Generations**
- Credits deducted before service delivery
- No way to get service without payment

### 2. **Eliminates Race Conditions**
- Single atomic operation
- Database-level locking prevents concurrent issues

### 3. **Ensures Data Integrity**
- Database is single source of truth
- Fresh data in all responses
- No negative credit scenarios

### 4. **Fair Billing**
- Users only pay for successful generations
- Automatic refunds for failures
- Clear error messages

## Performance Considerations

### **Database Operations**
- **Before**: 2 operations (check + update)
- **After**: 1 atomic operation
- **Benefit**: Reduced database load and latency

### **Concurrency**
- **Before**: Race conditions under load
- **After**: Proper locking and queuing
- **Benefit**: Consistent behavior under high load

### **Error Recovery**
- **Before**: Silent failures, manual intervention needed
- **After**: Automatic refunds, self-healing
- **Benefit**: Better user experience and reduced support load

## Testing Scenarios

### 1. **Normal Flow**
- User with credits → Success → Credits deducted

### 2. **Insufficient Credits**
- User with 0 credits → Early rejection → No AI generation

### 3. **Concurrent Requests**
- Multiple simultaneous requests → Only one succeeds per credit

### 4. **AI Generation Failure**
- Credits deducted → AI fails → Automatic refund

### 5. **Database Locking**
- Concurrent credit deductions → Proper queuing and locking

## Monitoring and Alerts

### **Key Metrics**
- Credit deduction success rate
- Refund frequency and reasons
- Database lock contention
- AI generation failure rate

### **Alerts**
- High refund rate (indicates AI issues)
- Database lock timeouts
- Credit deduction failures
- Negative credit scenarios (should never happen)

## Migration Steps

### 1. **Apply Database Functions**
```sql
-- Run scripts/improved_credit_function.sql
-- Run scripts/refund_credit_function.sql
```

### 2. **Update API Code**
- Credits deducted before AI generation
- Refund mechanism for failures
- Fresh data in responses

### 3. **Test Thoroughly**
- Load testing with concurrent requests
- Failure scenario testing
- Credit accuracy verification

### 4. **Monitor**
- Watch for any issues
- Verify credit accuracy
- Check refund patterns

## Files Created

1. **`scripts/improved_credit_function.sql`** - Enhanced atomic credit function
2. **`scripts/refund_credit_function.sql`** - Credit refund function
3. **`ATOMIC_CREDITS_IMPROVED.md`** - This documentation

## Conclusion

The improved atomic credit system provides:
- **Security**: No free generations possible
- **Reliability**: Race condition prevention
- **Fairness**: Automatic refunds for failures
- **Performance**: Single atomic operations
- **Consistency**: Database as source of truth

This implementation ensures a robust, secure, and fair credit system that can handle high concurrency while maintaining data integrity.
