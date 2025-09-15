# Rate Limiting Implementation for Image Proxy

## Overview
This document describes the rate limiting implementation added to the `/api/image-proxy` endpoint to prevent abuse and DoS attacks.

## Implementation Details

### Rate Limiting Strategy
The image proxy endpoint now implements a **dual-layer rate limiting** approach:

1. **Short-term Rate Limit**: 30 requests per minute
2. **Long-term Rate Limit**: 50 requests per 5 minutes

### Client Identification
The system identifies clients using the following priority order:
1. `x-forwarded-for` header (for requests behind proxies)
2. `x-real-ip` header (for direct server requests)
3. `cf-connecting-ip` header (for Cloudflare requests)
4. Falls back to 'anonymous' if no IP is available

### Rate Limiting Configuration

```typescript
// Short-term: 30 requests per minute
export const imageProxyRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  keyPrefix: 'rate_limit:image_proxy'
})

// Long-term: 50 requests per 5 minutes
export const imageProxyStrictRateLimit = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50,
  keyPrefix: 'rate_limit:image_proxy_strict'
})
```

### Response Headers
All responses include rate limiting information:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995200
```

When rate limited, additional headers are included:
```
Retry-After: 60
```

### Error Response
When rate limits are exceeded, the endpoint returns:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

**HTTP Status**: 429 Too Many Requests

## Security Benefits

### 1. DoS Protection
- Prevents overwhelming the server with rapid requests
- Protects against both intentional and accidental abuse

### 2. Resource Protection
- Limits bandwidth usage for image proxying
- Prevents excessive Redis cache usage
- Protects against memory exhaustion

### 3. Fair Usage
- Ensures all users get fair access to the service
- Prevents single users from monopolizing resources

## Monitoring and Logging

### Logged Information
The system logs detailed information for monitoring:

```typescript
console.log('Image proxy request:', { 
  imageUrl, 
  useCache, 
  clientIP,
  rateLimit: {
    shortTerm: shortTermResult,
    longTerm: longTermResult
  }
})
```

### Rate Limit Exceeded Logs
```typescript
console.log('Rate limit exceeded:', { 
  clientIP, 
  shortTerm: shortTermResult, 
  longTerm: longTermResult 
})
```

## Redis Storage

### Key Structure
- Short-term: `rate_limit:image_proxy:{clientIP}`
- Long-term: `rate_limit:image_proxy_strict:{clientIP}`

### Data Structure
Uses Redis sorted sets (ZSET) with:
- **Score**: Timestamp of the request
- **Member**: Unique request identifier
- **TTL**: Automatically expires based on window size

## Performance Considerations

### 1. Atomic Operations
Uses Redis pipeline for atomic operations to prevent race conditions.

### 2. Fail-Open Strategy
If Redis is unavailable, the system allows requests to proceed (fail-open) to prevent service disruption.

### 3. Efficient Cleanup
Expired entries are automatically removed during each rate limit check.

## Configuration Tuning

### Adjusting Limits
To modify rate limits, update the configuration in `lib/rate-limit.ts`:

```typescript
// For more restrictive limits
export const imageProxyRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // Reduced from 30
  keyPrefix: 'rate_limit:image_proxy'
})

// For more permissive limits
export const imageProxyRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // Increased from 30
  keyPrefix: 'rate_limit:image_proxy'
})
```

### Monitoring Metrics
Track these metrics for optimization:
- Rate limit hit rate
- Average requests per client
- Peak usage times
- Redis memory usage

## Best Practices

### 1. Client-Side Handling
Clients should:
- Respect the `Retry-After` header
- Implement exponential backoff
- Cache images locally when possible

### 2. Error Handling
```typescript
try {
  const response = await fetch('/api/image-proxy?url=...')
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
  }
} catch (error) {
  // Handle error
}
```

### 3. Monitoring
- Set up alerts for high rate limit hit rates
- Monitor Redis memory usage
- Track client IP patterns for abuse detection

## Future Enhancements

### 1. Dynamic Rate Limiting
- Adjust limits based on server load
- Different limits for different user tiers
- Geographic-based rate limiting

### 2. Advanced Analytics
- Request pattern analysis
- Anomaly detection
- Predictive rate limiting

### 3. Integration with CDN
- Move rate limiting to edge locations
- Reduce server load
- Improve response times

## Troubleshooting

### Common Issues

1. **Legitimate users getting rate limited**
   - Check if limits are too restrictive
   - Consider user tier-based limits
   - Review client implementation

2. **Redis connection issues**
   - Verify Redis configuration
   - Check network connectivity
   - Monitor Redis memory usage

3. **IP detection problems**
   - Verify proxy configuration
   - Check header forwarding
   - Test with different client types

### Debug Commands

```bash
# Check Redis keys
redis-cli KEYS "rate_limit:image_proxy:*"

# Check specific client
redis-cli ZRANGE "rate_limit:image_proxy:192.168.1.1" 0 -1 WITHSCORES

# Clear rate limits (emergency)
redis-cli DEL "rate_limit:image_proxy:*"
```

## Conclusion

The rate limiting implementation provides robust protection against abuse while maintaining good user experience. The dual-layer approach ensures both immediate protection and sustained usage limits, while the fail-open strategy prevents service disruption during infrastructure issues.
