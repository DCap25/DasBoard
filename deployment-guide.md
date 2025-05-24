# Das Board Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Das Board application to Vercel. The application uses Supabase for authentication and data storage in production.

## Prerequisites
- GitHub account
- Vercel account (can be created with your GitHub account)
- Supabase project (already created at https://dijulexxrgfmaiewtavb.supabase.co)

## Local Testing Before Deployment

1. Ensure the application builds correctly:
   ```
   npm run build
   ```

2. Verify that all chunks are below 500kB in size:
   ```
   dist/assets/index-BFiAtAc4.css         21.39 kB
   dist/assets/supabase-l0sNRNKZ.js        0.00 kB
   dist/assets/sales-V04PJKtA.js           1.33 kB
   dist/assets/index-DBcVSkku.js          41.09 kB
   dist/assets/react-vendor-BtP0CW_r.js  141.73 kB
   ```

3. Preview the production build locally:
   ```
   npm run preview
   ```

## GitHub Setup

1. Create a new GitHub repository:
   - Go to github.com and sign in
   - Click "New repository"
   - Name: dasboard-app
   - Description: Dealership management dashboard
   - Set to Private or Public as needed
   - Click "Create repository"

2. Push your code to GitHub:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/dasboard-app.git
   git push -u origin main
   ```

## Vercel Deployment

1. Connect to your Vercel account:
   - Go to vercel.com and sign in with your GitHub account
   - Click "Add New..." > "Project"
   - Select the "dasboard-app" repository from the list
   - Click "Import"

2. Configure project settings:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install

3. Configure environment variables:
   - VITE_API_URL: https://dijulexxrgfmaiewtavb.supabase.co
   - USE_MOCK_SUPABASE: false

4. Click "Deploy"

5. After deployment completes, your site will be available at a URL like:
   https://dasboard-app.vercel.app

## Post-Deployment Verification

1. Test user authentication:
   - Try logging in with test credentials
   - Verify that role-based access control works correctly

2. Test data operations:
   - Create new sales entries
   - View metrics
   - Check F&I details

3. Verify multi-tenant isolation:
   - Log in as users from different dealerships
   - Ensure data is properly isolated

## Troubleshooting

1. If you encounter CORS issues:
   - Ensure your Supabase project has the correct CORS configuration
   - Go to Supabase Dashboard > Project Settings > API
   - Add your Vercel domain to the allowed origins

2. If authentication fails:
   - Check the browser console for error messages
   - Verify that Supabase Auth service is properly configured
   - Ensure environment variables are correctly set in Vercel

3. If data doesn't load:
   - Verify that RLS (Row Level Security) policies are configured in Supabase
   - Check that the correct API URLs are being used

## Production Maintenance

1. Monitor application performance:
   - Use Vercel Analytics to track page load times
   - Monitor Supabase usage and performance

2. Update deployment:
   - Push changes to your GitHub repository
   - Vercel will automatically rebuild and deploy

3. Roll back if necessary:
   - Go to Vercel project dashboard
   - Navigate to "Deployments" tab
   - Select a previous successful deployment
   - Click "..." > "Promote to Production" 