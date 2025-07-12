# Environment Configuration Guide

## ✅ Verified Supabase Project Details

Your Supabase project is **ACTIVE** and correctly configured:

- **Project ID**: `iugjtokydvbcvmrpeziv`
- **Project Name**: "das board master"
- **Status**: ACTIVE_HEALTHY
- **Region**: us-west-1
- **URL**: https://iugjtokydvbcvmrpeziv.supabase.co
- **Database Version**: PostgreSQL 15.8.1

## 🔑 Verified Environment Variables

### Required Environment Variables

Create a `.env` file in your project root with these **verified** values:

```env
# Supabase Configuration - VERIFIED CORRECT
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4
VITE_SUPABASE_PROJECT_ID=iugjtokydvbcvmrpeziv

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_MARKETING_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
VITE_DEPLOYMENT_VERSION=1.0.0

# Authentication Settings
VITE_AUTH_ENABLED=true
VITE_ENABLE_SIGNUP=true
VITE_ENABLE_GUEST_MODE=false

# Feature Flags
VITE_DEBUG_MODE=true
USE_MOCK_SUPABASE=false

# Secondary Dealership Configuration (uses same project with RLS)
VITE_DEALERSHIP1_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_DEALERSHIP1_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4
```

## 🚨 Previous Configuration Issues

The following **INCORRECT** values were found in your template:

```env
# ❌ WRONG - This was in your template
VITE_SUPABASE_ANON_KEY=sb_publishable_2k9zeqV2WEyuvRNsq9vO8A_3mZUvAI_

# ✅ CORRECT - Use this instead
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4
```

## 🏗️ Database Schema Status

Your database has the following key tables:

- ✅ `auth.users` - Authentication system
- ✅ `public.profiles` - User profiles with roles
- ✅ `public.dealerships` - Dealership management
- ✅ `public.deals` - Deal tracking
- ✅ `public.users` - Business users
- ✅ `public.roles` - Role management
- ✅ All tables have RLS (Row Level Security) enabled

## 🔧 Setup Instructions

1. **Create environment file**:

   ```bash
   # Copy the verified values above into .env
   cp netlify-env-template.txt .env
   # Edit .env with the correct values
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔍 Testing Authentication

To test if authentication is working:

1. Open your browser to `http://localhost:5173`
2. Try to sign up with a test email
3. Check the browser console for any Supabase connection errors
4. Verify in Supabase Dashboard > Authentication > Users

## 🛡️ Security Advisories

Your Supabase project has these security recommendations:

- ⚠️ **Function Search Path**: Some functions have mutable search_path
- ⚠️ **Leaked Password Protection**: Consider enabling HaveIBeenPwned protection

## 📝 Common Login Issues & Solutions

### Issue 1: "Invalid API Key" Error

**Solution**: Ensure you're using the correct anon key (the long JWT token, not the short one)

### Issue 2: "Network Error" or "CORS Error"

**Solution**: Verify the VITE_SUPABASE_URL is exactly `https://iugjtokydvbcvmrpeziv.supabase.co`

### Issue 3: "User not found" after signup

**Solution**: Check if RLS policies are properly configured for the profiles table

### Issue 4: Environment variables not loading

**Solution**: Ensure your .env file is in the project root and restart your dev server

## 🎯 Next Steps

1. Create your `.env` file with the verified values above
2. Test authentication by signing up a new user
3. Check the Supabase Dashboard to confirm users are being created
4. If issues persist, check the browser console for specific error messages

Your Supabase project is properly configured and ready to use!
