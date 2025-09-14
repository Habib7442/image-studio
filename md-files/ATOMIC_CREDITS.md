# Atomic Credit System

## Overview
This document describes the atomic credit deduction system implemented to prevent race conditions and ensure data consistency.

## Problem
The previous implementation had a Time-of-Check-Time-of-Use (TOCTOU) race condition where:
1. Check user credits
2. Generate images (time-consuming operation)
3. Deduct credits based on stale data

This could lead to:
- Negative credits
- Incorrect credit counts
- Data inconsistency

## Solution
Implemented an atomic credit deduction system using PostgreSQL functions:

### Database Function: `use_credit(p_user_id UUID)`
```sql
CREATE OR REPLACE FUNCTION use_credit(p_user_id UUID)
RETURNS TABLE(
  credits_left INTEGER,
  total_credits_used INTEGER,
  success BOOLEAN
)
```

**Features:**
- **Atomic Operation**: Credits are checked and deducted in a single database transaction
- **Row Locking**: Uses `FOR UPDATE` to prevent concurrent modifications
- **Conditional Update**: Only deducts if credits > 0
- **Return Values**: Returns updated credit counts and success status

### API Implementation
```typescript
// Atomically deduct credit using database function
const { data: creditResult, error: creditError } = await supabase
  .rpc('use_credit', { p_user_id: userId })

if (!creditResult?.[0]?.success) {
  return NextResponse.json({
    error: 'Insufficient credits',
    creditsLeft: creditResult?.[0]?.credits_left ?? userProfile.credits_left,
    resetTime: userProfile.last_credit_reset
  }, { status: 402 })
}

const updatedCredits = creditResult[0]
// Use updatedCredits.credits_left in response
```

## Benefits

### 1. **Race Condition Prevention**
- Single atomic operation prevents concurrent credit deductions
- Database-level locking ensures consistency

### 2. **Data Integrity**
- Credits can never go negative
- Total credits used is always accurate
- Database is the single source of truth

### 3. **Performance**
- Single database call instead of separate check + update
- Reduced network round trips
- Better concurrency handling

### 4. **Error Handling**
- Clear success/failure indication
- Proper error responses with current credit counts
- Graceful handling of edge cases

## Setup Instructions

### 1. Apply Database Function
Run the SQL script in your Supabase SQL editor:
```bash
# Copy and paste the contents of scripts/apply_credit_function.sql
# into your Supabase SQL editor and execute
```

### 2. Verify Function
Test the function with a valid user ID:
```sql
SELECT * FROM use_credit('your-user-id-here');
```

### 3. Update API Routes
The Style My Selfie API has been updated to use the atomic system. Other credit-deducting APIs should follow the same pattern.

## Migration Notes

### Before (Race Condition Prone)
```typescript
// Check credits
if (profile.credits_left <= 0) return error

// ... do work ...

// Update credits (race condition here!)
await supabase.from('users').update({
  credits_left: profile.credits_left - 1,
  total_credits_used: profile.total_credits_used + 1
})
```

### After (Atomic)
```typescript
// Do work first
// ... generate images ...

// Atomically deduct credits
const { data: creditResult } = await supabase.rpc('use_credit', { p_user_id: userId })
if (!creditResult?.[0]?.success) return insufficient_credits_error

// Use updated credits from database
const updatedCredits = creditResult[0]
```

## Testing

### Test Cases
1. **Normal Flow**: User with credits should succeed
2. **Insufficient Credits**: User with 0 credits should fail gracefully
3. **Concurrent Requests**: Multiple simultaneous requests should not cause negative credits
4. **Database Errors**: Proper error handling for database failures

### Load Testing
Test with multiple concurrent requests to ensure:
- No race conditions
- Consistent credit counts
- Proper error responses

## Monitoring

### Key Metrics
- Credit deduction success rate
- Database function execution time
- Concurrent request handling
- Error rates by type

### Logging
- Credit deduction attempts
- Success/failure rates
- Performance metrics
- Error details

## Future Enhancements

### 1. **Batch Operations**
For operations requiring multiple credits:
```sql
CREATE FUNCTION use_multiple_credits(p_user_id UUID, p_credits INTEGER)
```

### 2. **Credit Refunds**
For failed operations:
```sql
CREATE FUNCTION refund_credit(p_user_id UUID, p_credits INTEGER)
```

### 3. **Audit Trail**
Track all credit operations:
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER, -- positive for refunds, negative for deductions
  operation_type TEXT, -- 'deduction', 'refund', 'reset'
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Security Considerations

### 1. **Function Permissions**
- Only authenticated users can execute `use_credit`
- Function uses `SECURITY DEFINER` for controlled access

### 2. **Input Validation**
- User ID validation in the function
- Proper error handling for invalid inputs

### 3. **Rate Limiting**
- API-level rate limiting still applies
- Database function provides additional protection

## Troubleshooting

### Common Issues

#### 1. **Function Not Found**
```sql
-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'use_credit';
```

#### 2. **Permission Denied**
```sql
-- Grant permissions
GRANT EXECUTE ON FUNCTION use_credit(UUID) TO authenticated;
```

#### 3. **Performance Issues**
- Monitor function execution time
- Check for database locks
- Consider connection pooling

### Debug Queries
```sql
-- Check user credits
SELECT id, credits_left, total_credits_used FROM users WHERE id = 'user-id';

-- Test function
SELECT * FROM use_credit('user-id');

-- Check for locks
SELECT * FROM pg_locks WHERE relation = 'users'::regclass;
```
