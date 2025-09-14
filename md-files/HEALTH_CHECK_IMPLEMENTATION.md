# Health Check Implementation

## Overview
This document describes the comprehensive health check system implemented to monitor critical dependencies and ensure service reliability.

## Health Check Endpoints

### **1. Comprehensive Health Check (`/api/health`)**
Full dependency verification with detailed status information.

### **2. Simple Health Check (`/api/health/simple`)**
Fast basic check for monitoring systems and load balancers.

## Comprehensive Health Check Features

### **Dependencies Monitored**

#### **1. Database (Supabase)**
- **Connection Test**: Basic query to verify connectivity
- **Function Test**: Verify `use_credit` function availability
- **Response Time**: Track database latency
- **Error Details**: Specific error codes and messages

#### **2. AI Service (Gemini)**
- **Configuration Check**: Verify API key is set
- **Service Test**: Actual API call with test prompt
- **Response Validation**: Ensure AI service returns valid response
- **Model Verification**: Confirm correct model is accessible

#### **3. Redis (Rate Limiting)**
- **Configuration Check**: Verify environment variables
- **Connection Test**: Ping Redis server
- **Read/Write Test**: Verify data persistence
- **Performance**: Track Redis response time

#### **4. Environment Variables**
- **Required Variables**: Critical configuration check
- **Optional Variables**: Non-critical but recommended
- **Configuration Status**: Detailed breakdown of each variable

#### **5. Storage (Supabase Storage)**
- **Bucket Access**: Verify storage bucket permissions
- **List Operation**: Test basic storage functionality
- **Error Handling**: Capture storage-specific errors

### **Health Status Levels**

#### **Healthy (200)**
- All critical dependencies operational
- All tests passing
- Service fully functional

#### **Degraded (200)**
- Some non-critical dependencies failing
- Core functionality still available
- Optional features may be unavailable

#### **Unhealthy (503)**
- Critical dependencies failing
- Service not fully functional
- Immediate attention required

## API Response Format

### **Comprehensive Health Check Response**
```json
{
  "status": "healthy|degraded|unhealthy",
  "service": "image-studio-lab",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "overallResponseTime": 1250,
  "checks": {
    "database": {
      "name": "Database",
      "status": "healthy",
      "responseTime": 45,
      "details": {
        "connection": "ok",
        "creditFunction": "ok",
        "recordCount": 1
      }
    },
    "aiService": {
      "name": "AI Service (Gemini)",
      "status": "healthy",
      "responseTime": 890,
      "details": {
        "testPrompt": "Say 'health check' in one word.",
        "response": "healthy",
        "model": "gemini-1.5-flash"
      }
    },
    "redis": {
      "name": "Redis (Rate Limiting)",
      "status": "healthy",
      "responseTime": 12,
      "details": {
        "connection": "ok",
        "readWriteTest": "passed"
      }
    },
    "environment": {
      "name": "Environment Variables",
      "status": "healthy",
      "responseTime": 1,
      "details": {
        "required": [
          { "name": "NEXT_PUBLIC_SUPABASE_URL", "configured": true },
          { "name": "GEMINI_API_KEY", "configured": true }
        ],
        "optional": [
          { "name": "UPSTASH_REDIS_REST_URL", "configured": true }
        ]
      }
    },
    "storage": {
      "name": "Storage (Supabase)",
      "status": "healthy",
      "responseTime": 23,
      "details": {
        "bucket": "generated-images",
        "access": "ok",
        "fileCount": 0
      }
    }
  }
}
```

### **Simple Health Check Response**
```json
{
  "status": "healthy|unhealthy",
  "service": "image-studio-lab",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": 45,
  "checks": {
    "database": true,
    "environment": true
  }
}
```

## Implementation Details

### **Database Health Check**
```typescript
async function checkDatabase(): Promise<HealthCheck> {
  try {
    const supabase = createServiceRoleClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      return {
        name: 'Database',
        status: 'unhealthy',
        error: error.message,
        details: { errorCode: error.code }
      }
    }

    // Test credit function availability
    const { data: creditTest, error: creditError } = await supabase
      .rpc('use_credit', { p_user_id: '00000000-0000-0000-0000-000000000000' })

    // Function should fail with "Insufficient credits" for invalid user
    if (creditError && !creditError.message.includes('Insufficient credits')) {
      return {
        name: 'Database',
        status: 'degraded',
        error: `Credit function error: ${creditError.message}`
      }
    }

    return {
      name: 'Database',
      status: 'healthy',
      details: { connection: 'ok', creditFunction: 'ok' }
    }
  } catch (error) {
    return {
      name: 'Database',
      status: 'unhealthy',
      error: error.message
    }
  }
}
```

### **AI Service Health Check**
```typescript
async function checkAIService(): Promise<HealthCheck> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        name: 'AI Service (Gemini)',
        status: 'unhealthy',
        error: 'GEMINI_API_KEY not configured'
      }
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Simple test prompt
    const result = await model.generateContent('Say "health check" in one word.')
    const response = await result.response
    const text = response.text()

    if (!text || text.trim().length === 0) {
      return {
        name: 'AI Service (Gemini)',
        status: 'degraded',
        error: 'Empty response from AI service'
      }
    }

    return {
      name: 'AI Service (Gemini)',
      status: 'healthy',
      details: { response: text.trim() }
    }
  } catch (error) {
    return {
      name: 'AI Service (Gemini)',
      status: 'unhealthy',
      error: error.message
    }
  }
}
```

### **Redis Health Check**
```typescript
async function checkRedis(): Promise<HealthCheck> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        name: 'Redis (Rate Limiting)',
        status: 'degraded',
        error: 'Redis environment variables not configured'
      }
    }

    const { Redis } = await import('@upstash/redis')
    const redis = Redis.fromEnv()
    
    // Read/write test
    const testKey = 'health-check-test'
    const testValue = Date.now().toString()
    
    await redis.set(testKey, testValue, { ex: 10 })
    const retrievedValue = await redis.get(testKey)
    await redis.del(testKey)

    if (retrievedValue !== testValue) {
      return {
        name: 'Redis (Rate Limiting)',
        status: 'degraded',
        error: 'Redis read/write test failed'
      }
    }

    return {
      name: 'Redis (Rate Limiting)',
      status: 'healthy',
      details: { readWriteTest: 'passed' }
    }
  } catch (error) {
    return {
      name: 'Redis (Rate Limiting)',
      status: 'unhealthy',
      error: error.message
    }
  }
}
```

## Monitoring Integration

### **Load Balancer Health Checks**
```bash
# Use simple health check for load balancers
curl -f http://your-domain.com/api/health/simple || exit 1
```

### **Monitoring Systems**
```bash
# Use comprehensive health check for detailed monitoring
curl http://your-domain.com/api/health | jq '.status'
```

### **Alerting Rules**
```yaml
# Example Prometheus alerting rules
- alert: ServiceUnhealthy
  expr: up{job="image-studio-lab"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Image Studio Lab service is down"

- alert: ServiceDegraded
  expr: health_check_status{service="image-studio-lab"} == 1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Image Studio Lab service is degraded"
```

## Performance Considerations

### **Response Times**
- **Simple Health Check**: < 100ms (database ping only)
- **Comprehensive Health Check**: 1-3 seconds (full dependency test)
- **Timeout Handling**: 5 second timeout per check

### **Caching Strategy**
- **No Caching**: Always return real-time status
- **Fresh Data**: Critical for monitoring accuracy
- **Real-time Alerts**: Immediate notification of issues

### **Resource Usage**
- **Minimal Impact**: Health checks use minimal resources
- **Efficient Queries**: Simple, fast database queries
- **Error Isolation**: One failing check doesn't affect others

## Error Scenarios

### **Database Unavailable**
```json
{
  "status": "unhealthy",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "connection refused",
      "details": { "connection": "failed" }
    }
  }
}
```

### **AI Service Down**
```json
{
  "status": "unhealthy",
  "checks": {
    "aiService": {
      "status": "unhealthy",
      "error": "API key invalid",
      "details": { "testFailed": true }
    }
  }
}
```

### **Redis Unavailable**
```json
{
  "status": "degraded",
  "checks": {
    "redis": {
      "status": "unhealthy",
      "error": "Redis environment variables not configured",
      "details": {
        "UPSTASH_REDIS_REST_URL": false,
        "UPSTASH_REDIS_REST_TOKEN": false
      }
    }
  }
}
```

## Security Considerations

### **No Sensitive Data**
- Health checks don't expose sensitive information
- Error messages are generic and safe
- No user data or credentials in responses

### **Rate Limiting**
- Health checks should be exempt from rate limiting
- Monitor for abuse of health check endpoints
- Consider IP whitelisting for monitoring systems

### **Access Control**
- Health checks are typically public
- Consider authentication for detailed health checks
- Monitor access patterns for anomalies

## Deployment Considerations

### **Environment-Specific Checks**
- **Development**: All checks enabled
- **Staging**: Production-like checks
- **Production**: Full monitoring and alerting

### **Health Check Endpoints**
- **Load Balancer**: `/api/health/simple`
- **Monitoring**: `/api/health`
- **Debugging**: `/api/health` with detailed logs

### **Monitoring Setup**
- **Uptime Monitoring**: External service monitoring
- **Internal Monitoring**: Application-level health checks
- **Alerting**: Immediate notification of issues

## Troubleshooting

### **Common Issues**

#### **1. Database Connection Failures**
- Check Supabase service status
- Verify connection string
- Check network connectivity

#### **2. AI Service Errors**
- Verify API key validity
- Check quota and limits
- Monitor API response times

#### **3. Redis Connection Issues**
- Verify environment variables
- Check Upstash service status
- Test network connectivity

#### **4. Storage Access Problems**
- Verify bucket permissions
- Check RLS policies
- Test storage operations

### **Debug Commands**
```bash
# Test individual components
curl http://localhost:3000/api/health | jq '.checks.database'
curl http://localhost:3000/api/health | jq '.checks.aiService'
curl http://localhost:3000/api/health | jq '.checks.redis'

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health/simple
```

## Conclusion

The health check implementation provides:
- **Comprehensive Monitoring**: All critical dependencies checked
- **Detailed Status Information**: Specific error details and response times
- **Multiple Endpoints**: Simple and comprehensive options
- **Production Ready**: Suitable for load balancers and monitoring systems
- **Security Conscious**: No sensitive data exposed
- **Performance Optimized**: Fast response times with detailed information

This health check system ensures reliable monitoring and quick identification of issues, enabling proactive maintenance and rapid response to problems.
