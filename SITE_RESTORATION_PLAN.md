# 🚨 URGENT: Site Restoration Plan

## Current Problem

The DAS Board app has completely replaced the marketing website at thedasboard.com. This needs to be fixed immediately.

## Required Architecture

- **Marketing Site**: `thedasboard.com/` (Next.js - das-board-marketing)
- **Dashboard App**: `thedasboard.com/dashboard/` (React SPA - dasboard)

## Immediate Solution Options

### Option 1: Two Separate Netlify Sites (Recommended)

1. **Marketing Site**: Deploy to main domain `thedasboard.com`
2. **Dashboard App**: Deploy to subdomain `dashboard.thedasboard.com`

### Option 2: Monorepo Deployment

1. Build both sites
2. Merge into single deployment
3. Use routing to serve correct app

### Option 3: Reverse Proxy

1. Marketing site at root
2. Proxy `/dashboard/*` to dashboard app

## Step-by-Step Restoration

### Step 1: Fix Marketing Site Build Issue

The Next.js build is failing due to Windows symlink issues. Solutions:

1. ✅ Use `npm run build:static` (already tried - failed)
2. Try WSL2 environment
3. Use the existing `out` directory if available
4. Deploy from a different machine/environment

### Step 2: Deploy Marketing Site

1. Create new Netlify site for marketing
2. Connect das-board-marketing repo
3. Set domain to `thedasboard.com`

### Step 3: Reconfigure Dashboard

1. Deploy dashboard to subdomain or separate site
2. Update all links and configurations
3. Test authentication flow

### Step 4: Update DNS/Domain Settings

1. Point main domain to marketing site
2. Point subdomain to dashboard app
3. Update CORS settings in Supabase

## Current Status

- ❌ Marketing site: Build failing (Next.js Windows symlink issue)
- ✅ Dashboard app: Built successfully, currently live at thedasboard.com
- ❌ Architecture: Dashboard has replaced marketing site

## Next Actions Required

1. **URGENT**: Get marketing site building and deployed
2. **Reconfigure**: Dashboard as subdirectory or subdomain
3. **Test**: Ensure both sites work correctly
4. **Update**: All navigation and authentication flows

## Workaround for Marketing Site Build

If Next.js continues to fail on Windows:

1. Use GitHub Actions to build on Linux
2. Build locally on WSL2
3. Build on a different machine
4. Use existing built files if available

## Files Modified for Dashboard Subdirectory

- ✅ `vite.config.js`: Updated base path to `/dashboard/`
- 🔄 Need to update: `App.tsx` routing
- 🔄 Need to update: `public/_redirects`
- 🔄 Need to update: Authentication redirects
