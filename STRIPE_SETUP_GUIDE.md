# Stripe Integration Setup Guide

## 🎯 **Current Status**

✅ **Completed:**

- Stripe dependencies installed
- Finance Manager promotional pricing (FREE)
- Database tables ready (`signup_requests` with Stripe fields)
- Single Finance Manager signup component updated
- Express API server created for Stripe operations
- Webhook handling implemented

## 🔧 **Next Steps to Complete Setup**

### 1. **Environment Variables Setup**

Create a `.env` file in your project root with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://your-project-id.supabase.co
USE_MOCK_SUPABASE=false

# Server-side Supabase (for API server)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
VITE_STRIPE_WEBHOOK_URL=http://localhost:3001/api/stripe-webhook

# Application URLs
VITE_APP_URL=http://localhost:5173
```

### 2. **Stripe Dashboard Configuration**

#### A. Create Products and Prices in Stripe Dashboard:

1. **Finance Manager Product:**

   - Name: "Finance Manager Subscription"
   - Price: $5.00/month (recurring)
   - Price ID: `price_finance_manager_monthly`

2. **Small Dealership Product:**

   - Name: "Small Dealership Subscription"
   - Price: $250.00/month (recurring)
   - Price ID: `price_dealership_small_monthly`

3. **Dealer Group Products:**
   - Level 1: $200.00/month per dealership
   - Level 2: $250.00/month per dealership

#### B. Update Price IDs in Code:

Edit `src/lib/stripe.ts` and replace the placeholder price IDs with your actual Stripe price IDs.

#### C. Set Up Webhooks:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `http://localhost:3001/api/stripe-webhook` (for development)
3. Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`
4. Copy the webhook signing secret to your `.env` file

### 3. **Running the Full System**

#### Option A: Run Frontend and Backend Together

```bash
npm run dev:with-api
```

#### Option B: Run Separately

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - API Server
npm run api:dev
```

### 4. **Testing the Signup Flow**

#### Finance Manager (FREE - Promotional):

1. Go to `http://localhost:5173/signup/single-finance`
2. Fill out the form
3. Click "Create Finance Manager Account"
4. Should show success message (no payment required)

#### Paid Tiers (For Future Testing):

1. Go to signup pages for dealership/dealer group
2. Fill out forms
3. Should redirect to Stripe Checkout
4. Use Stripe test cards for testing

### 5. **Stripe Test Cards**

For testing paid subscriptions:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

## 📊 **Database Monitoring**

Check signup requests in Supabase:

```sql
SELECT * FROM signup_requests ORDER BY created_at DESC;
```

Monitor Stripe events:

- Check Stripe Dashboard → Events
- Check your Express server logs

## 🎉 **What's Working Now**

1. **Finance Manager Signup:** Completely FREE (promotional pricing)
2. **Database Integration:** Signup requests properly stored
3. **Promotional Tracking:** `promo_applied` field tracks free signups
4. **Schema Preparation:** Ready for paid tier integration

## 🚀 **Next Development Phases**

1. **Admin Dashboard:** For approving/managing signup requests
2. **User Account Creation:** After signup approval
3. **Paid Tier Integration:** When promotional period ends
4. **Email Notifications:** Welcome emails and notifications
5. **Dashboard Access:** Routing users to appropriate dashboards

## 🔍 **Troubleshooting**

### Common Issues:

1. **"Failed to load Stripe"**

   - Check `VITE_STRIPE_PUBLISHABLE_KEY` in .env
   - Ensure API server is running on port 3001

2. **Database Connection Issues**

   - Verify Supabase credentials
   - Check RLS policies on `signup_requests` table

3. **Webhook Issues**
   - Ensure webhook URL is accessible
   - Check webhook signing secret
   - Monitor Express server logs

### Useful Commands:

```bash
# Check if ports are in use
netstat -an | findstr :5173
netstat -an | findstr :3001

# Kill processes if needed
npm run stop

# View logs
# Check browser console for frontend logs
# Check terminal for API server logs
```

## 📱 **Current Pricing Structure**

| Tier             | Regular Price       | Current Status | Notes                   |
| ---------------- | ------------------- | -------------- | ----------------------- |
| Finance Manager  | $5/month            | **FREE** 🎉    | Limited time promotion  |
| Small Dealership | $250/month          | Paid           | Full Stripe integration |
| Dealer Group L1  | $200/month/location | Paid           | 6-12 locations          |
| Dealer Group L2  | $250/month/location | Paid           | 13-25 locations         |

The Finance Manager tier is currently completely FREE as a promotional offer, making it easy for individual finance managers to try the system without any payment barriers.
