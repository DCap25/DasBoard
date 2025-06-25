# DAS Board Netlify Deployment Guide

## Overview

This guide covers deploying the DAS Board React SPA to Netlify and integrating it with the existing marketing website at thedasboard.com.

## Architecture

- **Marketing Site**: `thedasboard.com/` (existing das-board-marketing)
- **Dashboard App**: `thedasboard.com/dashboard/` (this React SPA)
- **Authentication**: Supabase Auth protects dashboard routes

## Pre-Deployment Checklist

### 1. Repository Preparation

- [ ] Ensure all code is committed and pushed to GitHub
- [ ] Verify build configuration in `vite.config.js`
- [ ] Check `netlify.toml` and `public/_redirects` files are present
- [ ] Review environment variables template in `netlify-env-template.txt`

### 2. Supabase Configuration

- [ ] Production Supabase project is set up
- [ ] RLS policies are configured
- [ ] Database tables and functions are migrated
- [ ] Auth settings are properly configured

## Deployment Steps

### Step 1: Create New Netlify Site

1. **Login to Netlify**: Go to [netlify.com](https://netlify.com) and login
2. **Create New Site**: Click "New site from Git"
3. **Connect Repository**:
   - Choose GitHub
   - Select your DAS Board repository
   - Authorize Netlify if needed

### Step 2: Configure Build Settings

**Build Settings:**

```
Build command: npm run build
Publish directory: dist
Node version: 18
```

**Advanced Build Settings:**

- Add environment variable: `NPM_FLAGS` = `--legacy-peer-deps`

### Step 3: Environment Variables

In Netlify dashboard, go to Site settings > Environment variables and add:

**Required Variables:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_APP_URL=https://thedasboard.com
VITE_MARKETING_URL=https://thedasboard.com
USE_MOCK_SUPABASE=false
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
```

**Optional Variables:**

```
VITE_DEALERSHIP1_SUPABASE_URL=https://dealership1.supabase.co
VITE_DEALERSHIP1_SUPABASE_ANON_KEY=dealership1-anon-key
VITE_API_URL=https://thedasboard.com/api
SENDGRID_API_KEY=your-sendgrid-key
VITE_DEPLOYMENT_VERSION=1.0.0
```

### Step 4: Domain Configuration

#### Option A: Subdirectory Integration (Recommended)

1. **Primary Domain**: Keep `thedasboard.com` pointing to marketing site
2. **Dashboard Subdomain**: Create `dashboard.thedasboard.com` pointing to this Netlify site
3. **URL Rewrite**: Use Netlify's proxy redirects to serve dashboard at `/dashboard`

#### Option B: Branch Deployment

1. **Marketing Branch**: Deploy das-board-marketing to main domain
2. **Dashboard Branch**: Deploy this app to `/dashboard` path

### Step 5: Custom Domain Setup

1. **In Netlify**: Go to Site settings > Domain management
2. **Add Custom Domain**: `dashboard.thedasboard.com` or configure subdirectory
3. **DNS Configuration**: Update DNS records as instructed by Netlify
4. **SSL Certificate**: Enable HTTPS (automatic with Netlify)

## Integration with Marketing Site

### Method 1: Subdomain (Easiest)

- Dashboard: `dashboard.thedasboard.com`
- Marketing: `thedasboard.com`
- Cross-domain authentication using Supabase

### Method 2: Subdirectory (More Complex)

Requires additional configuration in the marketing site:

```nginx
# Example reverse proxy configuration
location /dashboard {
    proxy_pass https://dasboard-app.netlify.app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Testing Checklist

### Pre-Launch Testing

- [ ] Build completes successfully
- [ ] Environment variables are set correctly
- [ ] Authentication flow works
- [ ] All dashboard routes load properly
- [ ] Supabase connection is working
- [ ] RLS policies allow proper data access

### Post-Launch Testing

- [ ] Dashboard loads at correct URL
- [ ] Login/logout functionality works
- [ ] Role-based access control functions
- [ ] All dashboard features work as expected
- [ ] Performance is acceptable
- [ ] Mobile responsiveness

## Build and Test Locally

Before deploying, test the production build locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

## Deployment Commands

```bash
# Build the project
npm run build

# Test build locally
npm run preview

# Deploy to Netlify (if using Netlify CLI)
netlify deploy --prod --dir=dist
```

## Monitoring and Maintenance

### Post-Deployment

1. **Monitor Build Logs**: Check Netlify build logs for any issues
2. **Error Tracking**: Monitor JavaScript errors in browser console
3. **Performance**: Use Lighthouse to check performance scores
4. **Analytics**: Set up monitoring for user behavior

### Regular Maintenance

- Update dependencies regularly
- Monitor Supabase usage and costs
- Review and update security headers
- Test authentication flows periodically

## Troubleshooting

### Common Issues

**Build Failures:**

- Check Node version (should be 18)
- Verify all dependencies are installed
- Check for TypeScript errors

**Authentication Issues:**

- Verify Supabase URL and keys
- Check RLS policies
- Ensure CORS is configured properly

**Routing Issues:**

- Verify `_redirects` file is in `public` folder
- Check `netlify.toml` redirect rules
- Test with various URL patterns

**Performance Issues:**

- Review bundle size warnings
- Optimize images and assets
- Check for unnecessary dependencies

## Support

For issues with:

- **Netlify Deployment**: Check Netlify docs and support
- **Supabase Integration**: Review Supabase documentation
- **React/Vite Issues**: Check respective documentation

## Next Steps

After successful deployment:

1. Set up monitoring and analytics
2. Configure backup strategies
3. Plan for scaling if needed
4. Document operational procedures
5. Train team on deployment process
