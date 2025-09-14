# Redis Setup for Rate Limiting

This application uses Upstash Redis for production-grade rate limiting. The in-memory rate limiting has been replaced with a Redis-based solution that works across serverless instances and deployments.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

### Alternative: Vercel Integration

If you're using the Vercel & Upstash integration, you can use these environment variables instead:

```bash
# Alternative Redis environment variables (if using Vercel integration)
KV_REST_API_URL=your_redis_rest_url
KV_REST_API_TOKEN=your_redis_rest_token
```

## Setting up Upstash Redis

1. **Create a Redis Database:**
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create a new Redis database
   - Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

2. **Add to Environment:**
   - Add the Redis credentials to your `.env.local` file
   - For production, add them to your deployment platform (Vercel, Netlify, etc.)

## Rate Limiting Configuration

The application includes pre-configured rate limiters:

### Style My Selfie API
- **Window:** 1 hour
- **Limit:** 15 requests per hour per user
- **Key Prefix:** `rate_limit:style_my_selfie`

### General API
- **Window:** 15 minutes  
- **Limit:** 100 requests per 15 minutes per user
- **Key Prefix:** `rate_limit:general_api`

## HTTP Headers

The rate limiting implementation includes proper HTTP headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before retrying (only on 429 responses)

## Benefits of Redis-based Rate Limiting

1. **Serverless Safe:** Works across multiple instances and cold starts
2. **Persistent:** Rate limits persist across deployments
3. **Scalable:** Handles high traffic with Redis's performance
4. **Standard Headers:** Includes proper HTTP rate limiting headers
5. **Fail-Safe:** Falls back to allowing requests if Redis is unavailable

## Testing

To test the rate limiting:

1. Make multiple requests to `/api/style-my-selfie/generate`
2. Check the response headers for rate limit information
3. After 15 requests in an hour, you should receive a 429 status with `Retry-After` header

## Monitoring

You can monitor rate limiting in the Upstash Console:
- View Redis keys and their TTL
- Monitor request patterns
- Set up alerts for high usage
