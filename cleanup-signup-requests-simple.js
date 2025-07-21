#!/usr/bin/env node

/**
 * Simple Cleanup Script: Generate SQL to clean signup_requests
 * This script generates SQL commands you can run in Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateCleanupSQL() {
  console.log('🔍 Analyzing signup_requests table...\n');

  try {
    // Get all signup_requests that we can see (public readable data)
    const { data: signupRequests, error: signupError } = await supabase
      .from('signup_requests')
      .select('email, status, created_at')
      .order('created_at', { ascending: false });

    if (signupError) {
      console.log('ℹ️  Cannot read signup_requests with anon key (expected for security)');
      console.log('📋 Here are the SQL commands to run in Supabase SQL Editor:\n');
      
      // Generate the cleanup SQL
      console.log('-- Step 1: Preview what will be deleted');
      console.log('SELECT email, status, created_at');
      console.log('FROM signup_requests');
      console.log('WHERE email NOT IN (');
      console.log('  SELECT email FROM auth.users WHERE email IS NOT NULL');
      console.log(');');
      console.log();
      
      console.log('-- Step 2: Delete orphaned signup_requests');
      console.log('DELETE FROM signup_requests');
      console.log('WHERE email NOT IN (');
      console.log('  SELECT email FROM auth.users WHERE email IS NOT NULL');
      console.log(');');
      console.log();
      
      console.log('-- Step 3: Verify cleanup');
      console.log('SELECT COUNT(*) as remaining_requests FROM signup_requests;');
      console.log();
      
      console.log('-- Step 4: View remaining requests (should all have auth users)');
      console.log('SELECT');
      console.log('  sr.email as signup_email,');
      console.log('  au.email as auth_email,');
      console.log('  sr.status,');
      console.log('  sr.created_at');
      console.log('FROM signup_requests sr');
      console.log('LEFT JOIN auth.users au ON sr.email = au.email');
      console.log('ORDER BY sr.created_at DESC;');
      
      return;
    }

    console.log(`📊 Found ${signupRequests.length} signup_requests`);
    
    if (signupRequests.length > 0) {
      console.log('\n📋 Current signup_requests:');
      signupRequests.forEach(request => {
        console.log(`   - ${request.email} (${request.status}) - ${new Date(request.created_at).toLocaleDateString()}`);
      });
    }
    
    console.log('\n📋 SQL Commands to run in Supabase SQL Editor:');
    console.log('(Copy and paste these one by one)\n');
    
    console.log('-- Step 1: Preview what will be deleted');
    console.log('SELECT email, status, created_at');
    console.log('FROM signup_requests');
    console.log('WHERE email NOT IN (');
    console.log('  SELECT email FROM auth.users WHERE email IS NOT NULL');
    console.log(');');
    console.log();
    
    console.log('-- Step 2: Delete orphaned signup_requests');
    console.log('DELETE FROM signup_requests');
    console.log('WHERE email NOT IN (');
    console.log('  SELECT email FROM auth.users WHERE email IS NOT NULL');
    console.log(');');
    console.log();
    
    console.log('-- Step 3: Verify cleanup');
    console.log('SELECT COUNT(*) as remaining_requests FROM signup_requests;');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Still provide the SQL commands
    console.log('\n📋 SQL Commands to run in Supabase SQL Editor:\n');
    
    console.log('-- Delete orphaned signup_requests');
    console.log('DELETE FROM signup_requests');
    console.log('WHERE email NOT IN (');
    console.log('  SELECT email FROM auth.users WHERE email IS NOT NULL');
    console.log(');');
  }
}

// Run the analysis
generateCleanupSQL().then(() => {
  console.log('\n🎉 Analysis complete!');
  console.log('📌 Next steps:');
  console.log('   1. Copy the SQL commands above');
  console.log('   2. Go to your Supabase Dashboard > SQL Editor');
  console.log('   3. Paste and run the commands one by one');
  console.log('   4. Try the signup process again');
});