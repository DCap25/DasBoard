# Das Board Production Deployment Checklist

## Pre-Deployment Tasks

- [ ] Fix all CORS issues in API service
  - Updated `sales-api-new/index.js` with proper CORS configuration
  - Modified credential handling in `apiService.ts`

- [ ] Configure production environment
  - Created `.env.production` file with:
    - `VITE_API_URL=https://dijulexxrgfmaiewtavb.supabase.co`
    - `USE_MOCK_SUPABASE=false`

- [ ] Set up Vercel configuration
  - Created `vercel.json` with proper SPA routing and build settings

- [ ] Run production build test
  - Verified chunk sizes are all below 500kB
  - Fixed any build warnings
  - Tested with `npm run preview`

- [ ] Create local service management scripts
  - Created `start-services.ps1` for Windows environments
  - Addressed port collision issues

## Deployment Process

- [ ] Push to GitHub repository
  - Create repository: `dasboard-app`
  - Push codebase to main branch

- [ ] Set up Vercel project
  - Connect GitHub repository
  - Configure build settings:
    - Framework preset: Vite
    - Build command: `npm run build`
    - Output directory: `dist`

- [ ] Configure environment variables in Vercel
  - `VITE_API_URL`: `https://dijulexxrgfmaiewtavb.supabase.co`
  - `USE_MOCK_SUPABASE`: `false`

- [ ] Deploy project
  - Verify build succeeds in Vercel
  - Run automated deployment checks

## Post-Deployment Verification

- [ ] Test with Supabase authentication
  - Verify sign-in works with test credentials
  - Check token storage and persistence

- [ ] Verify data isolation
  - Test multi-tenant functionality
  - Ensure dealership-specific data is properly filtered

- [ ] Check all features
  - Sales management
  - Metrics display
  - F&I details
  - Role-based access control

- [ ] Verify performance
  - Check load times are reasonable
  - Monitor API response times

## Supabase Configuration

- [ ] Configure Supabase authentication
  - Set up password policies
  - Configure social providers if needed

- [ ] Set up Row Level Security (RLS)
  - Apply policies for multi-tenant isolation
  - Configure role-based access controls

- [ ] Add Vercel domain to Supabase CORS configuration
  - Navigate to Project Settings > API
  - Add production domain to allowed origins

## Maintenance Plan

- [ ] Set up monitoring
  - Configure Vercel Analytics
  - Set up error tracking

- [ ] Document deployment procedures
  - Update deployment guide with specific details
  - Note any manual steps required

- [ ] Create rollback procedure
  - Document steps to revert to previous deployment
  - Test rollback process 