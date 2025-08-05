#!/usr/bin/env node

/**
 * Security deployment script
 * Deploys security features to Supabase
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const FUNCTIONS_DIR = path.join(__dirname, '../supabase/functions');

console.log('🔐 Deploying security features to Supabase...');

try {
  // Check if Supabase CLI is available
  try {
    execSync('npx supabase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Supabase CLI not found. Please install it first:');
    console.error('npx supabase --help');
    process.exit(1);
  }

  // Check if we're linked to a Supabase project
  try {
    execSync('npx supabase status', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not linked to a Supabase project. Please run:');
    console.error('npx supabase link --project-ref YOUR_PROJECT_REF');
    process.exit(1);
  }

  // Deploy migrations
  console.log('📁 Deploying database migrations...');
  if (fs.existsSync(MIGRATIONS_DIR)) {
    const migrations = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const migration of migrations) {
      console.log(`   - ${migration}`);
    }

    execSync('npx supabase db push', { stdio: 'inherit' });
    console.log('✅ Database migrations deployed successfully');
  }

  // Deploy Edge Functions
  console.log('⚡ Deploying Edge Functions...');
  if (fs.existsSync(FUNCTIONS_DIR)) {
    const functions = fs.readdirSync(FUNCTIONS_DIR)
      .filter(item => fs.statSync(path.join(FUNCTIONS_DIR, item)).isDirectory());

    for (const func of functions) {
      console.log(`   - Deploying function: ${func}`);
      try {
        execSync(`npx supabase functions deploy ${func}`, { stdio: 'inherit' });
        console.log(`   ✅ Function ${func} deployed successfully`);
      } catch (error) {
        console.error(`   ❌ Failed to deploy function ${func}`);
        console.error(error.message);
      }
    }
  }

  console.log('\n🎉 Security features deployed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Test the rate limiting by making multiple login attempts');
  console.log('2. Verify RLS policies are working in Supabase dashboard');
  console.log('3. Check security headers using online tools like securityheaders.com');
  console.log('4. Monitor CSP violations in browser console');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}