# Das Board Vercel Deployment Guide

This guide outlines the steps to deploy both the Das Board main application and the marketing website to Vercel with private access control.

## Overview

We will deploy two separate applications:

1. **Marketing Website**: A Next.js app deployed at `thedasboard.com`
2. **Main Application**: A React/Vite app deployed at `app.thedasboard.com`

Both applications will connect to the same Supabase backend.

## Prerequisites

- A Vercel account connected to your GitHub repository
- A Supabase project with proper authentication and database setup
- Ownership or access to the domain `thedasboard.com`

## Step 1: Configure DNS Settings

1. Purchase and configure the domain `thedasboard.com`
2. Set up two DNS records:
   - `thedasboard.com` (apex domain) for the marketing site
   - `app.thedasboard.com` (subdomain) for the main application

## Step 2: Deploy the Marketing Website

1. From the Vercel dashboard, click "Add New" > "Project"
2. Connect to your GitHub repository and select the `das-board-marketing` directory
3. Configure build settings:

   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. Configure environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_APP_URL=https://app.thedasboard.com
   NEXT_PUBLIC_DOMAIN=https://thedasboard.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_FINANCE_MANAGER_PRICE_ID=price_finance_manager
   NEXT_PUBLIC_STRIPE_DEALERSHIP_PRICE_ID=price_dealership
   NEXT_PUBLIC_STRIPE_DEALER_GROUP_PRICE_ID=price_dealer_group
   ```

5. Connect the domain `thedasboard.com` to this deployment
6. Click "Deploy"

## Step 3: Deploy the Main Application

1. From the Vercel dashboard, click "Add New" > "Project"
2. Connect to your GitHub repository and select the main project directory
3. Configure build settings:

   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Configure environment variables:

   ```
   VITE_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_APP_URL=https://app.thedasboard.com
   VITE_MARKETING_URL=https://thedasboard.com
   VITE_DEPLOYMENT_VERSION=1.0.0
   ```

5. Connect the domain `app.thedasboard.com` to this deployment
6. Click "Deploy"

## Step 4: Verify Deployments

1. Test the marketing website at `https://thedasboard.com`
2. Test the main application at `https://app.thedasboard.com`
3. Verify that the signup flow from the marketing site works properly
4. Verify that authentication and private access control work in the main app

## Step 5: Testing User Access Control

Test login and access for each user role:

### Dealership Admin Test

1. Open an incognito window and navigate to `https://app.thedasboard.com`
2. Login with a dealership admin account
3. Verify you're redirected to `/dashboard/admin`
4. Check the console logs for access control verification

### Finance Manager Test

1. Open an incognito window and navigate to `https://app.thedasboard.com`
2. Login with a finance manager account
3. Verify you're redirected to `/dashboard/finance`
4. Check the console logs for access control verification

### Sales Manager Test

1. Open an incognito window and navigate to `https://app.thedasboard.com`
2. Login with a sales manager account
3. Verify you're redirected to `/dashboard/sales-manager`
4. Check the console logs for access control verification

### General Manager Test

1. Open an incognito window and navigate to `https://app.thedasboard.com`
2. Login with a general manager account
3. Verify you're redirected to `/dashboard/gm`
4. Check the console logs for access control verification

### Salesperson Test

1. Open an incognito window and navigate to `https://app.thedasboard.com`
2. Login with a salesperson account
3. Verify you're redirected to `/dashboard/sales`
4. Check the console logs for access control verification

## Step 6: Monitor Logs and Performance

1. Use Vercel Analytics to monitor site performance
2. Check authentication logs in Supabase
3. Monitor access control logs in the browser console

## Troubleshooting

If you encounter issues:

1. **Authentication Problems**:

   - Verify Supabase environment variables
   - Check browser console for auth errors
   - Verify that Supabase RLS policies are correctly configured

2. **Routing Issues**:

   - Check the console log for role detection and redirect information
   - Verify that the user has the correct role assigned in Supabase

3. **Marketing Site/Main App Integration Issues**:
   - Ensure both sites have the correct URLs for each other
   - Verify that CORS is properly configured in Supabase

## Security Checklist

- [ ] Supabase Auth is properly configured
- [ ] RLS policies are implemented for all tables
- [ ] Authentication state is properly maintained
- [ ] Access control logs track authorization attempts
- [ ] Stripe API keys are kept secure
- [ ] Security headers are configured in Vercel
- [ ] All routes requiring authentication are protected

## Environment Variables Reference

### Marketing Website (Next.js)

| Variable                                    | Description                              |
| ------------------------------------------- | ---------------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL                    | Supabase project URL                     |
| NEXT_PUBLIC_SUPABASE_ANON_KEY               | Supabase anonymous key                   |
| NEXT_PUBLIC_APP_URL                         | URL of the main application              |
| NEXT_PUBLIC_DOMAIN                          | Domain of the marketing website          |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY          | Stripe publishable key                   |
| STRIPE_SECRET_KEY                           | Stripe secret key (server side only)     |
| NEXT_PUBLIC_STRIPE_FINANCE_MANAGER_PRICE_ID | Stripe price ID for Finance Manager tier |
| NEXT_PUBLIC_STRIPE_DEALERSHIP_PRICE_ID      | Stripe price ID for Dealership tier      |
| NEXT_PUBLIC_STRIPE_DEALER_GROUP_PRICE_ID    | Stripe price ID for Dealer Group tier    |

### Main Application (React/Vite)

| Variable                | Description                  |
| ----------------------- | ---------------------------- |
| VITE_SUPABASE_URL       | Supabase project URL         |
| VITE_SUPABASE_ANON_KEY  | Supabase anonymous key       |
| VITE_APP_URL            | URL of the main application  |
| VITE_MARKETING_URL      | URL of the marketing website |
| VITE_DEPLOYMENT_VERSION | Version of the deployment    |
