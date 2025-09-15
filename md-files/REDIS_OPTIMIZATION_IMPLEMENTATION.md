# Redis Optimization Implementation for Production

## Overview
This document describes the Redis optimization measures implemented to replace blocking `KEYS` operations with production-safe `SCAN` operations and efficient batch deletion strategies.

## Performance Issues Addressed

### 1. KEYS Command Blocking
**Problem**: `KEYS` command is O(N) and blocks the Redis server during execution.

**Impact**:
- Blocks all other Redis operations
- Can cause timeouts in production
- Performance degrades with large datasets
- Not suitable for production environments

### 2. Large Array Deletion
**Problem**: `DEL(...keys)` with large arrays can exceed argument limits.

**Impact**:
- Redis argument limit exceeded errors
- Failed cache clearing operations
- Incomplete cache cleanup
- Service disruption

## Implementation Details

### 1. SCAN-Based Key Discovery

```typescript
export async function scanAll(redis: any, pattern: string, count = 1000): Promise<string[]> {
  const out: string[] = []
  let cursor = '0'
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', count)
    cursor = String(next)
    if (Array.isArray(batch)) out.push(...batch)
  } while (cursor !== '0')
  return out
}
```

**Benefits**:
- Non-blocking operation
- Iterates through keys in batches
- Configurable batch size
- Production-safe for large datasets

### 2. Batch Deletion with UNLINK Support

```typescript
export async function batchDelete(redis: any, keys: string[], batchSize = 500): Promise<number> {
  let deleted = 0
  for (let i = 0; i < keys.length; i += batchSize) {
    const chunk = keys.slice(i, i + batchSize)
    // Prefer UNLINK if supported (non-blocking); fallback to DEL
    if (typeof (redis as any).unlink === 'function') {
      deleted += await redis.unlink(...chunk)
    } else {
      deleted += await redis.del(...chunk)
    }
  }
  return deleted
}
```

**Benefits**:
- Chunked deletion prevents argument limit errors
- Uses UNLINK when available (non-blocking)
- Falls back to DEL for compatibility
- Returns count of deleted keys

### 3. Production-Safe Cache Clearing

```typescript
export async function clearAllImageCaches(): Promise<{
  deletedImages: number
  deletedMetadata: number
  totalDeleted: number
}> {
  try {
    const keys = await scanAll(redis, 'image_proxy:*')
    const metadataKeys = await scanAll(redis, 'image_metadata:*')
    
    const deletedImages = await batchDelete(redis, keys)
    const deletedMeta = await batchDelete(redis, metadataKeys)
    
    console.log(`Cache cleared: ${deletedImages} images, ${deletedMeta} metadata`)
    
    return {
      deletedImages,
      deletedMetadata: deletedMeta,
      totalDeleted: deletedImages + deletedMeta
    }
  } catch (error) {
    console.error('Failed to clear all caches:', error)
    throw error
  }
}
```

**Benefits**:
- Uses SCAN instead of KEYS
- Batch deletion prevents argument limits
- Detailed logging and return values
- Proper error handling

## Performance Comparison

### Before Optimization (KEYS + DEL)

| Operation | Time Complexity | Blocking | Production Safe |
|-----------|----------------|----------|-----------------|
| Key Discovery | O(N) | Yes | No |
| Deletion | O(N) | Yes | No |
| Large Arrays | O(N) | Yes | No |

### After Optimization (SCAN + Batch Delete)

| Operation | Time Complexity | Blocking | Production Safe |
|-----------|----------------|----------|-----------------|
| Key Discovery | O(N) | No | Yes |
| Deletion | O(N) | No | Yes |
| Large Arrays | O(N) | No | Yes |

## Configuration Parameters

### SCAN Batch Size
```typescript
const count = 1000 // Keys per SCAN iteration
```

**Rationale**:
- 1000 is a good balance between memory usage and performance
- Can be adjusted based on Redis server capacity
- Larger values = fewer iterations but more memory
- Smaller values = more iterations but less memory

### Delete Batch Size
```typescript
const batchSize = 500 // Keys per deletion batch
```

**Rationale**:
- 500 is well under Redis argument limits
- Prevents "too many arguments" errors
- Can be adjusted based on Redis configuration
- Balances performance with safety

## Redis Commands Used

### SCAN Command
```redis
SCAN cursor MATCH pattern COUNT count
```

**Parameters**:
- `cursor`: Starting position (0 for first iteration)
- `MATCH pattern`: Key pattern to match
- `COUNT count`: Approximate number of keys to return

**Benefits**:
- Non-blocking iteration
- Cursor-based pagination
- Pattern matching support
- Configurable batch size

### UNLINK Command
```redis
UNLINK key1 key2 key3 ...
```

**Benefits**:
- Non-blocking deletion
- Asynchronous memory reclamation
- Better performance than DEL
- Redis 4.0+ feature

### DEL Command (Fallback)
```redis
DEL key1 key2 key3 ...
```

**Benefits**:
- Synchronous deletion
- Immediate memory reclamation
- Universal compatibility
- Fallback for older Redis versions

## Error Handling

### SCAN Errors
```typescript
try {
  const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', count)
  // Process batch
} catch (error) {
  console.error('SCAN operation failed:', error)
  // Handle error appropriately
}
```

### Deletion Errors
```typescript
try {
  if (typeof (redis as any).unlink === 'function') {
    deleted += await redis.unlink(...chunk)
  } else {
    deleted += await redis.del(...chunk)
  }
} catch (error) {
  console.error('Deletion failed:', error)
  // Continue with next batch
}
```

## Monitoring and Logging

### Operation Logging
```typescript
console.log(`Cache cleared: ${deletedImages} images, ${deletedMeta} metadata`)
```

### Performance Metrics
```typescript
const startTime = Date.now()
const result = await clearAllImageCaches()
const duration = Date.now() - startTime
console.log(`Cache clear completed in ${duration}ms`)
```

### Error Tracking
```typescript
console.error('Failed to clear all caches:', error)
```

## Best Practices

### 1. Use SCAN for Key Discovery
- Never use KEYS in production
- Use SCAN with appropriate COUNT
- Handle cursor-based iteration properly

### 2. Batch Deletion Operations
- Delete keys in small batches
- Use UNLINK when available
- Monitor deletion progress

### 3. Error Handling
- Handle SCAN errors gracefully
- Continue processing on deletion errors
- Log errors for monitoring

### 4. Performance Monitoring
- Track operation duration
- Monitor Redis memory usage
- Alert on performance issues

## Testing the Implementation

### Small Dataset Test
```bash
# Test with small number of keys
curl -X DELETE "https://your-domain.com/api/cache/stats"
# Should complete quickly
```

### Large Dataset Test
```bash
# Test with large number of keys
# Monitor Redis performance during operation
# Verify all keys are deleted
```

### Error Handling Test
```bash
# Test with Redis connection issues
# Verify graceful error handling
# Check error logging
```

## Configuration Tuning

### Adjusting SCAN Count
```typescript
// For faster iteration (more memory)
const count = 2000

// For less memory usage (slower)
const count = 500
```

### Adjusting Delete Batch Size
```typescript
// For faster deletion (more memory)
const batchSize = 1000

// For less memory usage (slower)
const batchSize = 250
```

## Redis Version Compatibility

### Redis 4.0+
- Full UNLINK support
- Optimal performance
- Non-blocking operations

### Redis 3.x
- DEL fallback
- Still production-safe
- Slightly slower deletion

### Redis 2.x
- DEL only
- Basic SCAN support
- Compatible but slower

## Future Enhancements

### 1. Parallel Processing
- Process multiple SCAN operations in parallel
- Parallel batch deletions
- Improved performance for large datasets

### 2. Progress Tracking
- Real-time progress updates
- WebSocket notifications
- Progress bars for UI

### 3. Selective Deletion
- Delete by pattern
- Delete by age
- Delete by size

### 4. Redis Cluster Support
- Multi-node SCAN operations
- Cluster-aware deletion
- Distributed cache management

## Conclusion

The Redis optimization implementation provides significant improvements in production safety and performance:

**Key Benefits**:
- ✅ Non-blocking operations
- ✅ Production-safe for large datasets
- ✅ Prevents argument limit errors
- ✅ Better error handling
- ✅ Improved monitoring
- ✅ Redis version compatibility

This implementation ensures that cache operations can be performed safely in production environments without blocking the Redis server or causing service disruptions.
