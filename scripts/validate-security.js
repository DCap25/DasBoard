#!/usr/bin/env node

/**
 * Security validation script
 * Tests implemented security features
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Validating security implementation...\n');

const tests = [];
let passed = 0;
let failed = 0;

// Test 1: Check if dynamic key management exists
tests.push({
  name: 'Dynamic Key Management',
  check: () => {
    const keyMgmtPath = path.join(__dirname, '../src/lib/keyManagement.ts');
    if (!fs.existsSync(keyMgmtPath)) return false;
    
    const content = fs.readFileSync(keyMgmtPath, 'utf8');
    return content.includes('generateSecureKey') && 
           content.includes('PBKDF2') && 
           content.includes('session_key');
  }
});

// Test 2: Check if hardcoded encryption key is removed
tests.push({
  name: 'Hardcoded Key Removed',
  check: () => {
    const encStoragePath = path.join(__dirname, '../src/lib/encryptedStorage.ts');
    if (!fs.existsSync(encStoragePath)) return false;
    
    const content = fs.readFileSync(encStoragePath, 'utf8');
    return !content.includes('das-board-secure-key-2025') &&
           content.includes('KeyManagement.getSessionKey');
  }
});

// Test 3: Check if server-side rate limiter exists
tests.push({
  name: 'Server-side Rate Limiter',
  check: () => {
    const rateLimiterPath = path.join(__dirname, '../supabase/functions/rate-limiter/index.ts');
    return fs.existsSync(rateLimiterPath);
  }
});

// Test 4: Check if RLS migration exists
tests.push({
  name: 'Row Level Security Migration',
  check: () => {
    const rlsPath = path.join(__dirname, '../supabase/migrations/20250205_enable_rls.sql');
    if (!fs.existsSync(rlsPath)) return false;
    
    const content = fs.readFileSync(rlsPath, 'utf8');
    return content.includes('ENABLE ROW LEVEL SECURITY') &&
           content.includes('CREATE POLICY');
  }
});

// Test 5: Check if security headers are configured
tests.push({
  name: 'Security Headers Configuration',
  check: () => {
    const headersPath = path.join(__dirname, '../public/_headers');
    if (!fs.existsSync(headersPath)) return false;
    
    const content = fs.readFileSync(headersPath, 'utf8');
    return content.includes('Content-Security-Policy') &&
           content.includes('X-Frame-Options') &&
           content.includes('Strict-Transport-Security');
  }
});

// Test 6: Check if test credentials are removed from .env.example
tests.push({
  name: 'Test Credentials Removed',
  check: () => {
    const envExamplePath = path.join(__dirname, '../.env.example');
    if (!fs.existsSync(envExamplePath)) return false;
    
    const content = fs.readFileSync(envExamplePath, 'utf8');
    return !content.includes('VITE_TEST_USER_EMAIL') &&
           !content.includes('VITE_TEST_USER_PASSWORD');
  }
});

// Test 7: Check if security documentation exists
tests.push({
  name: 'Security Documentation',
  check: () => {
    const securityMdPath = path.join(__dirname, '../SECURITY.md');
    return fs.existsSync(securityMdPath);
  }
});

// Test 8: Check if audit configuration exists
tests.push({
  name: 'Audit Configuration',
  check: () => {
    const auditConfigPath = path.join(__dirname, '../.audit-ci.json');
    return fs.existsSync(auditConfigPath);
  }
});

// Test 9: Check if AuthContext uses server rate limiter
tests.push({
  name: 'Server Rate Limiter Integration',
  check: () => {
    const authContextPath = path.join(__dirname, '../src/contexts/AuthContext.tsx');
    if (!fs.existsSync(authContextPath)) return false;
    
    const content = fs.readFileSync(authContextPath, 'utf8');
    return content.includes('ServerRateLimiter') &&
           content.includes('enforceRateLimit');
  }
});

// Test 10: Check if App.tsx initializes security
tests.push({
  name: 'Security Initialization',
  check: () => {
    const appPath = path.join(__dirname, '../src/App.tsx');
    if (!fs.existsSync(appPath)) return false;
    
    const content = fs.readFileSync(appPath, 'utf8');
    return content.includes('SecurityHeadersManager') &&
           content.includes('setupCSPReporting');
  }
});

// Run all tests
console.log('Running security validation tests...\n');

tests.forEach((test, index) => {
  const result = test.check();
  const status = result ? '✅ PASS' : '❌ FAIL';
  console.log(`${index + 1}. ${test.name}: ${status}`);
  
  if (result) {
    passed++;
  } else {
    failed++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Security Validation Summary:`);
console.log(`✅ Passed: ${passed}/${tests.length}`);
console.log(`❌ Failed: ${failed}/${tests.length}`);

if (failed === 0) {
  console.log('\n🎉 All security features are properly implemented!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy to Supabase: npm run deploy:security');
  console.log('2. Test in browser for CSP violations');
  console.log('3. Verify rate limiting with multiple login attempts');
  console.log('4. Check security headers with online tools');
  
  process.exit(0);
} else {
  console.log('\n⚠️  Some security features are missing or misconfigured.');
  console.log('Please review the failed tests and fix the issues.');
  
  process.exit(1);
}