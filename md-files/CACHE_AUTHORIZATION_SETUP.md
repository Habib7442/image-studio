# Cache Authorization Setup Guide

## Quick Setup

### 1. Generate Admin Token
```bash
# Generate a secure 32-byte token
openssl rand -base64 32

# Alternative using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Set Environment Variable
Add to your `.env.local` or production environment:
```bash
ADMIN_API_TOKEN=your-generated-token-here
```

### 3. Test Authorization
```bash
# Test cache statistics (should work)
curl -H "x-admin-token: your-generated-token-here" \
     "https://your-domain.com/api/cache/stats"

# Test without token (should fail)
curl "https://your-domain.com/api/cache/stats"
```

## Security Checklist

- [ ] Strong token generated (32+ characters)
- [ ] Token stored in environment variables
- [ ] No hardcoded tokens in code
- [ ] Token rotation schedule planned
- [ ] Access limited to necessary personnel
- [ ] Monitoring and alerting configured
- [ ] Logs being collected and analyzed

## Usage Examples

### Get Cache Statistics
```bash
curl -H "x-admin-token: $ADMIN_API_TOKEN" \
     "https://your-domain.com/api/cache/stats"
```

### Clear All Caches
```bash
curl -X DELETE \
     -H "x-admin-token: $ADMIN_API_TOKEN" \
     "https://your-domain.com/api/cache/stats"
```

### Clear Specific Image Cache
```bash
curl -X DELETE \
     -H "x-admin-token: $ADMIN_API_TOKEN" \
     "https://your-domain.com/api/cache/stats?url=https://example.com/image.jpg"
```

## Monitoring Setup

### Log Monitoring
```bash
# Monitor unauthorized attempts
grep "Unauthorized cache" /var/log/app.log

# Count attempts by IP
grep "Unauthorized cache" /var/log/app.log | awk '{print $4}' | sort | uniq -c
```

### Alert Configuration
Set up alerts for:
- 401 responses from cache endpoints
- Multiple unauthorized attempts from same IP
- Unusual access patterns

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check token matches environment variable
2. **Token not working**: Verify no extra spaces or characters
3. **Environment not loaded**: Restart application after setting variable

### Debug Commands
```bash
# Check if environment variable is set
echo $ADMIN_API_TOKEN

# Test with verbose output
curl -v -H "x-admin-token: $ADMIN_API_TOKEN" \
     "https://your-domain.com/api/cache/stats"
```
