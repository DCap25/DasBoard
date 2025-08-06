# Deployment Signup Error Fix Guide

## Issue
The application works locally but shows signup errors on the deployed site (Netlify).

## Root Causes
1. Missing environment variables on Netlify
2. Email verification settings mismatch
3. CORS/API connection issues

## Solution Steps

### 1. Set Environment Variables in Netlify

Go to your Netlify dashboard → Site Settings → Environment Variables and add:

```
VITE_SUPABASE_URL=(Get from your Supabase dashboard → Settings → API)
VITE_SUPABASE_ANON_KEY=(Get from your Supabase dashboard → Settings → API → anon/public key)
VITE_SUPABASE_PUBLISHABLE_KEY=(Get from your Supabase dashboard → Settings → API → publishable key)
VITE_SKIP_EMAIL_VERIFICATION=false
VITE_API_URL=(Same as VITE_SUPABASE_URL for production)
```

**Security Note:** Never expose these keys in public repositories. Get them from your Supabase dashboard.

**Important:** Set `VITE_SKIP_EMAIL_VERIFICATION=false` for production to ensure proper email verification.

### 2. Configure Supabase for Production

In your Supabase dashboard:

1. Go to Authentication → Settings
2. Ensure email confirmations are enabled
3. Add your production URL to Redirect URLs:
   - `https://your-netlify-site.netlify.app/*`
   - `https://your-netlify-site.netlify.app/auth/callback`

### 3. Update API Configuration

The current setup uses `http://localhost:3001` for API calls. For production:

1. Either deploy a separate API server, OR
2. Use Supabase directly by updating `VITE_API_URL` to your Supabase URL

### 4. Verify CORS Settings

In Supabase dashboard → Settings → API:
- Add your Netlify domain to allowed origins

### 5. Test Signup Flow

After deploying with proper environment variables:

1. Test regular signup:
   - Should send verification email
   - User clicks link → redirected to `/auth/callback`
   - Then redirected to appropriate dashboard

2. Test Single Finance Manager signup:
   - Should create account
   - Send verification email
   - After verification → redirect to welcome page

### 6. Debug Tips

If errors persist:

1. Check browser console for specific error messages
2. Check Network tab for failed API calls
3. Common errors and fixes:
   - "Invalid API key" → Check VITE_SUPABASE_ANON_KEY
   - "CORS error" → Add domain to Supabase allowed origins
   - "Email not sent" → Check Supabase email settings
   - "Redirect URL not allowed" → Add URL to Supabase redirect URLs

### 7. Quick Fix for Testing

If you need to bypass email verification temporarily for testing:

1. Set `VITE_SKIP_EMAIL_VERIFICATION=true` in Netlify
2. Redeploy the site
3. **Remember to set it back to `false` for production!**

### 8. Rebuild and Deploy

After setting environment variables:

1. Trigger a new deployment in Netlify
2. Clear browser cache
3. Test signup flow

## Verification Checklist

- [ ] Environment variables set in Netlify
- [ ] Supabase redirect URLs configured
- [ ] CORS settings updated
- [ ] Email settings verified in Supabase
- [ ] Site redeployed after changes
- [ ] Browser cache cleared
- [ ] Signup tested with real email

## Support

If issues persist, check:
1. Supabase logs (Dashboard → Logs)
2. Netlify function logs (if using functions)
3. Browser console errors