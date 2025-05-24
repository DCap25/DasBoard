# Finance Manager Promotion Implementation Guide

## Overview

This guide outlines the steps to implement the "Finance Manager Now FREE" promotion across both the dashboard application and marketing website.

## Implementation Steps

### 1. Marketing Website Updates (Port 3000)

**Files to Update:**

1. **src/components/SignupForm.tsx:**

   - Update pricing tiers to show Finance Manager as free
   - Modify form submission to handle free Finance Manager tier
   - Add promo tracking in database submissions
   - Update button text for clarity

2. **src/app/page.tsx:**

   - Add promotional banner at the top
   - Update pricing preview section with highlighted Finance Manager tier
   - Update calls-to-action to direct to Finance Manager signup

3. **src/app/pricing/page.tsx:**
   - Update Finance Manager pricing in comparison table
   - Add promotional banner at the top of the pricing page

### 2. Dashboard App Updates (Port 5173)

**Files to Update:**

1. **SignupForm.tsx:**

   - Pricing display has already been updated to show the Finance Manager tier as free

2. **src/app/page.tsx:**
   - Added promotional banner at the top of the homepage
   - Added prominent CTA for the Finance Manager tier

### 3. Database Updates

1. Ensure the `signup_requests` table has a `promo_applied` boolean field
2. Verify promo tracking is set up in the Supabase database
3. Run the promotion tracking migrations

### 4. Deployment Process

1. **Marketing Website:**

   ```powershell
   # Navigate to marketing website directory
   cd E:\WebProjects\das-board-marketing

   # Make backup copies of files
   Copy-Item -Path src\components\SignupForm.tsx -Destination src\components\SignupForm.tsx.bak
   Copy-Item -Path src\app\page.tsx -Destination src\app\page.tsx.bak
   Copy-Item -Path src\app\pricing\page.tsx -Destination src\app\pricing\page.tsx.bak

   # Update files according to update-files-marketing-site.md
   # (Manual editing required)

   # Restart the development server to test changes
   npm run dev
   ```

2. **Dashboard App:**

   ```powershell
   # Navigate to dashboard app directory
   cd E:\WebProjects\dasboard

   # Deploy using the script we created earlier
   .\deploy-finance-promo.ps1
   ```

3. **Testing:**
   - Verify the changes on both sites:
     - Marketing site: http://localhost:3000
     - Dashboard app: http://localhost:5173
   - Test the signup flow for the Finance Manager tier
   - Confirm database entries include promo tracking
   - Verify the promotional banners display correctly

### 5. Post-Deployment Verification

1. Test signing up as a Finance Manager
2. Verify no Stripe checkout for free Finance Manager tier
3. Check database entries for proper promo tracking
4. Test all links and CTAs

## Rollback Plan

In case of issues, restore the backup files:

```powershell
# Marketing website
cd E:\WebProjects\das-board-marketing
Copy-Item -Path src\components\SignupForm.tsx.bak -Destination src\components\SignupForm.tsx -Force
Copy-Item -Path src\app\page.tsx.bak -Destination src\app\page.tsx -Force
Copy-Item -Path src\app\pricing\page.tsx.bak -Destination src\app\pricing\page.tsx -Force

# Restart server
npm run dev
```

## Future Considerations

1. Plan for when the promotion ends
2. Set up email tracking for Finance Manager promotion signups
3. Consider adding analytics to measure conversion rates from this promotion
