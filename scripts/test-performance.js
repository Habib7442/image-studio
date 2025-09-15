#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests API performance with and without caching
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api/user/profile',
  '/api/referral/stats',
  '/api/user/streak',
  '/api/health'
];

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          statusCode: res.statusCode,
          responseTime: endTime - startTime,
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function testEndpoint(endpoint, iterations = 5) {
  console.log(`\n🧪 Testing ${endpoint}...`);
  
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    try {
      const result = await makeRequest(`${BASE_URL}${endpoint}`);
      results.push(result);
      
      const cacheStatus = result.headers['x-cache'] || 'MISS';
      console.log(`  Request ${i + 1}: ${result.responseTime}ms (${result.statusCode}) [${cacheStatus}]`);
      
      // Wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  Request ${i + 1} failed:`, error.message);
    }
  }
  
  if (results.length === 0) {
    console.log('  ❌ All requests failed');
    return null;
  }
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const cacheHits = results.filter(r => r.headers['x-cache'] === 'HIT').length;
  const successRate = (results.filter(r => r.statusCode < 400).length / results.length) * 100;
  
  console.log(`  📊 Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`  📊 Cache Hit Rate: ${Math.round((cacheHits / results.length) * 100)}%`);
  console.log(`  📊 Success Rate: ${Math.round(successRate)}%`);
  
  return {
    endpoint,
    avgResponseTime,
    cacheHitRate: (cacheHits / results.length) * 100,
    successRate,
    results
  };
}

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  const testResults = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    if (result) {
      testResults.push(result);
    }
  }
  
  if (testResults.length === 0) {
    console.log('\n❌ No successful tests completed');
    process.exit(1);
  }
  
  // Summary
  console.log('\n📈 Performance Test Summary');
  console.log('=' .repeat(50));
  
  const overallAvgTime = testResults.reduce((sum, r) => sum + r.avgResponseTime, 0) / testResults.length;
  const overallCacheRate = testResults.reduce((sum, r) => sum + r.cacheHitRate, 0) / testResults.length;
  const overallSuccessRate = testResults.reduce((sum, r) => sum + r.successRate, 0) / testResults.length;
  
  console.log(`🎯 Overall Average Response Time: ${Math.round(overallAvgTime)}ms`);
  console.log(`🎯 Overall Cache Hit Rate: ${Math.round(overallCacheRate)}%`);
  console.log(`🎯 Overall Success Rate: ${Math.round(overallSuccessRate)}%`);
  
  // Performance assessment
  if (overallAvgTime < 200) {
    console.log('✅ Excellent performance! (< 200ms)');
  } else if (overallAvgTime < 500) {
    console.log('✅ Good performance (< 500ms)');
  } else if (overallAvgTime < 1000) {
    console.log('⚠️  Acceptable performance (< 1s)');
  } else {
    console.log('❌ Poor performance (> 1s)');
  }
  
  if (overallCacheRate > 80) {
    console.log('✅ Excellent cache performance! (> 80%)');
  } else if (overallCacheRate > 50) {
    console.log('✅ Good cache performance (> 50%)');
  } else {
    console.log('⚠️  Cache performance needs improvement (< 50%)');
  }
  
  console.log('\n🏁 Performance test completed!');
}

// Run the test
runPerformanceTest().catch(console.error);
