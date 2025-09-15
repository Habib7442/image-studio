# Cache Authorization Implementation

## Overview
This document describes the authorization measures implemented for the cache management endpoints to prevent unauthorized access to sensitive cache operations and statistics.

## Security Issues Addressed

### 1. Unprotected Destructive Operations
**Problem**: Cache clearing endpoints were publicly accessible without authentication.

**Risk**:
- Anyone could wipe all caches
- Potential DoS attacks
- Service disruption
- Data loss

### 2. Exposed Cache Statistics
**Problem**: Cache statistics endpoint revealed sensitive system information.

**Risk**:
- Information disclosure
- System reconnaissance
- Performance metrics exposure
- Cache size and patterns revealed

## Implementation Details

### 1. Admin Token Authentication

```typescript
// Authorization check for destructive operations
const token = request.headers.get('x-admin-token')
if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
  console.log('Unauthorized cache clear attempt:', {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString()
  })
  return NextResponse.json({ 
    success: false, 
    error: 'Unauthorized - Admin token required' 
  }, { status: 401 })
}
```

**Security Features**:
- Token-based authentication
- Environment variable protection
- Detailed logging of unauthorized attempts
- IP and User-Agent tracking

### 2. Protected Endpoints

#### Cache Statistics (GET)
```typescript
export async function GET(request: NextRequest) {
  try {
    // Authorization check for cache statistics
    const token = request.headers.get('x-admin-token')
    if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
      // ... authorization logic
    }
    // ... rest of function
  }
}
```

#### Cache Clearing (DELETE)
```typescript
export async function DELETE(request: NextRequest) {
  try {
    // Authorization check for destructive operations
    const token = request.headers.get('x-admin-token')
    if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
      // ... authorization logic
    }
    // ... rest of function
  }
}
```

### 3. Security Logging

```typescript
console.log('Unauthorized cache clear attempt:', {
  ip: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
  timestamp: new Date().toISOString()
})
```

**Logged Information**:
- Client IP address
- User-Agent string
- Timestamp of attempt
- Type of unauthorized access

## Environment Configuration

### Required Environment Variable
```bash
ADMIN_API_TOKEN=your-secure-admin-token-here
```

**Token Requirements**:
- Use a strong, random token
- At least 32 characters
- Mix of letters, numbers, and symbols
- Store securely in environment variables
- Rotate regularly

### Example Token Generation
```bash
# Generate a secure token
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Usage Examples

### Authorized Cache Statistics
```bash
curl -H "x-admin-token: your-secure-admin-token-here" \
     "https://your-domain.com/api/cache/stats"
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalImages": 150,
    "totalSize": 52428800,
    "totalSizeMB": 50.0,
    "oldestCacheAge": 2,
    "newestCacheAge": 5
  }
}
```

### Authorized Cache Clearing
```bash
# Clear all caches
curl -X DELETE \
     -H "x-admin-token: your-secure-admin-token-here" \
     "https://your-domain.com/api/cache/stats"

# Clear specific image cache
curl -X DELETE \
     -H "x-admin-token: your-secure-admin-token-here" \
     "https://your-domain.com/api/cache/stats?url=https://example.com/image.jpg"
```

**Response**:
```json
{
  "success": true,
  "message": "Cleared 150 image caches and 150 metadata caches (300 total)",
  "deleted": {
    "deletedImages": 150,
    "deletedMetadata": 150,
    "totalDeleted": 300
  }
}
```

### Unauthorized Access
```bash
curl "https://your-domain.com/api/cache/stats"
```

**Response**:
```json
{
  "success": false,
  "error": "Unauthorized - Admin token required"
}
```

**HTTP Status**: 401 Unauthorized

## Security Benefits

### 1. Access Control
- Only authorized administrators can access cache operations
- Prevents unauthorized cache clearing
- Protects sensitive system information

### 2. Audit Trail
- All unauthorized attempts are logged
- IP addresses and user agents tracked
- Timestamps for forensic analysis

### 3. Service Protection
- Prevents DoS attacks via cache clearing
- Protects against malicious actors
- Maintains service availability

### 4. Information Security
- Cache statistics are protected
- System metrics not exposed publicly
- Prevents reconnaissance attacks

## Monitoring and Alerting

### Security Event Logging
```typescript
console.log('Unauthorized cache clear attempt:', {
  ip: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
  timestamp: new Date().toISOString()
})
```

### Recommended Monitoring
1. **Alert on Unauthorized Attempts**: Set up alerts for 401 responses
2. **Rate Limiting**: Implement rate limiting on auth failures
3. **IP Blocking**: Block IPs with repeated unauthorized attempts
4. **Token Rotation**: Regular token rotation schedule

### Log Analysis
```bash
# Monitor unauthorized attempts
grep "Unauthorized cache" /var/log/app.log

# Count attempts by IP
grep "Unauthorized cache" /var/log/app.log | awk '{print $4}' | sort | uniq -c

# Monitor specific time periods
grep "2024-01-15.*Unauthorized cache" /var/log/app.log
```

## Best Practices

### 1. Token Management
- Use strong, random tokens
- Store in environment variables
- Rotate tokens regularly
- Use different tokens for different environments

### 2. Access Control
- Limit access to necessary personnel only
- Use principle of least privilege
- Monitor access patterns
- Implement additional authentication if needed

### 3. Logging and Monitoring
- Log all access attempts
- Monitor for suspicious patterns
- Set up automated alerts
- Regular security reviews

### 4. Network Security
- Use HTTPS for all requests
- Consider IP whitelisting
- Implement rate limiting
- Use VPN for admin access

## Advanced Security Considerations

### 1. Multi-Factor Authentication
Consider implementing MFA for additional security:
```typescript
// Example: Require both token and additional verification
const token = request.headers.get('x-admin-token')
const mfaCode = request.headers.get('x-mfa-code')
// Verify both token and MFA code
```

### 2. IP Whitelisting
```typescript
const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || []
const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
if (!allowedIPs.includes(clientIP)) {
  return NextResponse.json({ error: 'IP not allowed' }, { status: 403 })
}
```

### 3. Rate Limiting
```typescript
// Implement rate limiting for auth failures
const rateLimiter = new Map()
const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
const attempts = rateLimiter.get(clientIP) || 0
if (attempts > 5) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
}
```

### 4. Session-Based Authentication
For more complex scenarios, consider session-based auth:
```typescript
// Example: Check for valid admin session
const session = await getSession(request)
if (!session || !session.isAdmin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Troubleshooting

### Common Issues

1. **Token Not Working**
   - Check environment variable is set
   - Verify token matches exactly
   - Check for extra spaces or characters

2. **Still Getting 401**
   - Verify header name is `x-admin-token`
   - Check token is being sent correctly
   - Verify environment variable is loaded

3. **Logs Not Appearing**
   - Check log level configuration
   - Verify console.log is working
   - Check log file permissions

### Debug Commands
```bash
# Check environment variable
echo $ADMIN_API_TOKEN

# Test token
curl -H "x-admin-token: $ADMIN_API_TOKEN" \
     "https://your-domain.com/api/cache/stats"

# Check logs
tail -f /var/log/app.log | grep "cache"
```

## Conclusion

The cache authorization implementation provides essential security for sensitive cache operations:

**Key Security Features**:
- ✅ Token-based authentication
- ✅ Protected destructive operations
- ✅ Secure statistics access
- ✅ Comprehensive logging
- ✅ Audit trail
- ✅ Service protection

This implementation ensures that only authorized administrators can access cache management functions while providing detailed logging for security monitoring and incident response.
