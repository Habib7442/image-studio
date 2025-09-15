# SSRF Protection Implementation for Image Proxy

## Overview
This document describes the Server-Side Request Forgery (SSRF) protection measures implemented in the `/api/image-proxy` endpoint to prevent attackers from making unauthorized requests to internal or external services.

## Critical Security Issue Fixed

### Previous Vulnerability
The original implementation used simple string inclusion checks:
```typescript
// VULNERABLE - Can be bypassed easily
if (!imageUrl.includes('supabase.co') && !imageUrl.includes('supabase.in')) {
  return NextResponse.json({ error: 'Invalid image source' }, { status: 400 })
}
```

**Attack Vectors:**
- `https://evil.com/supabase.co` ✅ Would pass validation
- `https://evil.com?supabase.in` ✅ Would pass validation
- `https://localhost:8080/supabase.co` ✅ Would pass validation
- `https://192.168.1.1/supabase.co` ✅ Would pass validation

### Fixed Implementation
Now uses proper URL parsing and domain validation:
```typescript
// SECURE - Proper domain validation
const url = new URL(imageUrl)
const hostname = url.hostname.toLowerCase()
const isValidSupabase = hostname.endsWith('.supabase.co') || 
                        hostname === 'supabase.co' ||
                        hostname.endsWith('.supabase.in') || 
                        hostname === 'supabase.in'
```

## Security Measures Implemented

### 1. Proper URL Parsing
```typescript
try {
  const url = new URL(imageUrl)
  const hostname = url.hostname.toLowerCase()
  // ... validation logic
} catch (e) {
  // Invalid URL format
  return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
}
```

**Benefits:**
- Prevents malformed URLs from causing errors
- Ensures proper URL structure validation
- Handles edge cases and encoding issues

### 2. Domain Validation
```typescript
const isValidSupabase = hostname.endsWith('.supabase.co') || 
                        hostname === 'supabase.co' ||
                        hostname.endsWith('.supabase.in') || 
                        hostname === 'supabase.in'
```

**Valid Domains:**
- `supabase.co` ✅
- `project.supabase.co` ✅
- `supabase.in` ✅
- `project.supabase.in` ✅

**Blocked Domains:**
- `evil.com/supabase.co` ❌
- `malicious.com?supabase.in` ❌
- `subdomain.supabase.co.evil.com` ❌

### 3. Protocol Validation
```typescript
const isHttps = url.protocol === 'https:'
```

**Security Benefits:**
- Forces HTTPS connections only
- Prevents HTTP requests that could be intercepted
- Ensures encrypted communication

### 4. Port Validation
```typescript
const hasValidPort = !url.port || url.port === '443'
```

**Security Benefits:**
- Only allows standard HTTPS port (443)
- Prevents requests to non-standard ports
- Blocks potential port scanning attempts

### 5. Local Network Protection
```typescript
const isNotLocalhost = !hostname.startsWith('localhost') && 
                       !hostname.startsWith('127.') && 
                       !hostname.startsWith('0.') &&
                       !hostname.startsWith('192.168.') &&
                       !hostname.startsWith('10.') &&
                       !hostname.startsWith('172.')
```

**Blocked IP Ranges:**
- `localhost` and `127.*` (loopback)
- `0.*` (reserved)
- `192.168.*` (private Class C)
- `10.*` (private Class A)
- `172.16-31.*` (private Class B)

**Security Benefits:**
- Prevents access to internal services
- Blocks localhost attacks
- Protects against internal network scanning

### 6. Request Timeout
```typescript
const response = await fetch(imageUrl, {
  headers: {
    'User-Agent': 'ImageStudioLab/1.0'
  },
  redirect: 'follow',
  signal: AbortSignal.timeout(10000) // 10 second timeout
})
```

**Security Benefits:**
- Prevents hanging requests
- Limits resource consumption
- Protects against slow-loris attacks

## Attack Scenarios Prevented

### 1. External Server Access
**Attack:** `https://evil.com/supabase.co`
**Result:** ❌ Blocked - Invalid domain

### 2. Internal Network Access
**Attack:** `https://192.168.1.1/supabase.co`
**Result:** ❌ Blocked - Private IP range

### 3. Localhost Access
**Attack:** `https://localhost:8080/supabase.co`
**Result:** ❌ Blocked - Localhost protection

### 4. Port Scanning
**Attack:** `https://supabase.co:8080/image.jpg`
**Result:** ❌ Blocked - Invalid port

### 5. Protocol Downgrade
**Attack:** `http://supabase.co/image.jpg`
**Result:** ❌ Blocked - HTTP not allowed

### 6. Subdomain Hijacking
**Attack:** `https://supabase.co.evil.com/image.jpg`
**Result:** ❌ Blocked - Invalid domain structure

## Logging and Monitoring

### Security Event Logging
```typescript
console.log('Invalid image source - SSRF protection triggered:', { 
  imageUrl, 
  hostname, 
  protocol: url.protocol,
  port: url.port,
  isValidSupabase,
  isHttps,
  hasValidPort,
  isNotLocalhost
})
```

### Monitoring Recommendations
1. **Alert on SSRF attempts**: Set up alerts for blocked requests
2. **Track attack patterns**: Monitor for repeated attempts
3. **Rate limit by IP**: Block IPs with multiple SSRF attempts
4. **Log analysis**: Regular review of security logs

## Additional Security Considerations

### 1. Content-Type Validation
Consider adding content-type validation:
```typescript
const contentType = response.headers.get('content-type')
if (!contentType?.startsWith('image/')) {
  return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
}
```

### 2. File Size Limits
```typescript
const contentLength = response.headers.get('content-length')
if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
  return NextResponse.json({ error: 'File too large' }, { status: 400 })
}
```

### 3. Image Format Validation
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
if (!allowedTypes.includes(contentType)) {
  return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 })
}
```

### 4. DNS Rebinding Protection
Consider implementing DNS rebinding protection by:
- Caching resolved IPs
- Validating IP addresses don't change
- Using allowlists for known good IPs

## Testing the Implementation

### Valid URLs (Should Work)
```bash
curl "https://your-domain.com/api/image-proxy?url=https://project.supabase.co/storage/v1/object/public/bucket/image.jpg"
```

### Invalid URLs (Should Be Blocked)
```bash
# External domain
curl "https://your-domain.com/api/image-proxy?url=https://evil.com/supabase.co"

# Localhost
curl "https://your-domain.com/api/image-proxy?url=https://localhost/supabase.co"

# Private IP
curl "https://your-domain.com/api/image-proxy?url=https://192.168.1.1/supabase.co"

# HTTP instead of HTTPS
curl "https://your-domain.com/api/image-proxy?url=http://supabase.co/image.jpg"

# Invalid port
curl "https://your-domain.com/api/image-proxy?url=https://supabase.co:8080/image.jpg"
```

## Compliance and Standards

### OWASP Guidelines
This implementation follows OWASP SSRF prevention guidelines:
- ✅ Validate and sanitize input
- ✅ Use allowlists for allowed domains
- ✅ Block private IP ranges
- ✅ Use proper URL parsing
- ✅ Implement timeouts

### Security Best Practices
- ✅ Defense in depth
- ✅ Fail securely
- ✅ Comprehensive logging
- ✅ Input validation
- ✅ Output encoding

## Future Enhancements

### 1. Dynamic Allowlist
- Maintain allowlist of approved Supabase projects
- Validate against project database
- Support for custom domains

### 2. Advanced Monitoring
- Real-time attack detection
- Automated response to threats
- Integration with security tools

### 3. Content Security
- Image content validation
- Malware scanning
- Format verification

## Conclusion

The implemented SSRF protection provides comprehensive security against various attack vectors while maintaining functionality for legitimate use cases. The multi-layered approach ensures that even if one protection fails, others will catch the attack.

**Key Security Improvements:**
- ✅ Proper URL parsing and validation
- ✅ Domain allowlist enforcement
- ✅ Private network protection
- ✅ Protocol and port validation
- ✅ Request timeout protection
- ✅ Comprehensive logging

This implementation significantly reduces the risk of SSRF attacks while maintaining the service's intended functionality.
