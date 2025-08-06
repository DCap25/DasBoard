# Netlify Environment Variables Setup

## Required Environment Variables for Production

Set these in your Netlify dashboard under Site Settings → Environment Variables:

### Core Configuration
```
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=(use the legacy anon key from Supabase dashboard)
VITE_SUPABASE_PUBLISHABLE_KEY=(use the publishable key from Supabase dashboard)
```

### Production Settings
```
VITE_SKIP_EMAIL_VERIFICATION=false
VITE_API_URL=https://iugjtokydvbcvmrpeziv.supabase.co
NODE_ENV=production
```

## Step-by-Step Setup

1. **Login to Netlify**
   - Go to your Netlify dashboard
   - Select your site

2. **Navigate to Environment Variables**
   - Site Settings → Environment Variables
   - Click "Add variable"

3. **Add Each Variable**
   - Add each variable from the list above
   - Make sure to use the exact variable names (case-sensitive)

4. **Deploy Settings**
   - After adding all variables, trigger a new deployment
   - Go to Deploys → Trigger Deploy → Deploy site

5. **Verify Deployment**
   - Check the deploy logs for any errors
   - Test the signup flow on the live site

## Important Security Notes

- ✅ The anon/public key is safe to use in frontend applications
- ✅ The publishable key is designed for client-side use
- ❌ NEVER expose the service role key in frontend code
- ❌ NEVER commit .env files with real keys to version control

## Troubleshooting

### If signup still fails after setting variables:

1. **Check Supabase Dashboard**
   - Authentication → Settings → Ensure email confirmations are enabled
   - Authentication → URL Configuration → Add your Netlify URL to Redirect URLs:
     - `https://[your-site].netlify.app/*`
     - `https://[your-site].netlify.app/auth/callback`

2. **Clear Cache and Redeploy**
   - In Netlify: Deploys → Clear cache and deploy site

3. **Check Browser Console**
   - Look for specific error messages
   - Common issues:
     - "Invalid API key" → Check VITE_SUPABASE_ANON_KEY
     - "CORS error" → Add domain to Supabase allowed origins
     - "Redirect URL not allowed" → Add URL to Supabase settings

## Testing Checklist

After deployment with proper environment variables:

- [ ] Regular user signup works
- [ ] Email verification is sent
- [ ] Single Finance Manager signup works
- [ ] Login works after email verification
- [ ] Dashboard redirects work properly

## Contact Support

If issues persist after following these steps:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check Netlify deploy logs
3. Review browser console errors