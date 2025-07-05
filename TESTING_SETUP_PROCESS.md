# Testing Environment Setup Process

## 🎯 **Objective**

Clean up existing test accounts and set up a proper multi-tenant testing environment with real data for debugging and testing.

## 📋 **Step-by-Step Process**

### **Phase 1: Backup & Cleanup** ⚠️

1. **Run Cleanup Script**:
   ```bash
   # Execute the cleanup script in Supabase
   # This will preserve demo@thedasboard.com and admindan@thedasboard.com
   ```
   - Removes ~50 test accounts
   - Keeps essential accounts: `demo@thedasboard.com` and `admindan@thedasboard.com`
   - Cleans up related data (deals, schedules, pay plans)

### **Phase 2: Multi-Tenancy Setup** 🏢

2. **Schema-Based Multi-Tenancy**:

   ```sql
   -- Each dealer group gets its own schema
   CREATE SCHEMA dealer_group_test;
   CREATE SCHEMA dealer_group_production; -- for real clients
   ```

3. **Update RLS Policies**:
   - Modify existing RLS policies to use schema-based isolation
   - Ensure data separation between dealer groups

### **Phase 3: Full Dealer Group Setup** 🚗

4. **Execute Full Setup Script**:
   - Creates "Test Automotive Group" with 3 dealerships:
     - Downtown Honda
     - Suburban Toyota
     - Metro Ford
5. **Test Users Created** (all with password: `TestPass123!`):

   - `finance.director@testgroup.com` - Finance Director
   - `sales.manager@testgroup.com` - Sales Manager
   - `general.manager@testgroup.com` - General Manager
   - `john.valentine@testgroup.com` - Finance Manager
   - `sarah.johnson@testgroup.com` - Finance Manager
   - `mike.davis@testgroup.com` - Salesperson
   - `lisa.chen@testgroup.com` - Salesperson
   - `tom.wilson@testgroup.com` - Salesperson

6. **Real Test Data**:
   - 5 realistic deals with proper F&I numbers
   - Pay plans for different roles
   - Schedules for all users
   - Proper dealership assignments

### **Phase 4: Admin Access Setup** 👑

7. **Master Admin Access**:

   - `admindan@thedasboard.com` - Master Admin Dashboard access
   - Can manage all dealer groups and settings

8. **Demo User**:
   - `demo@thedasboard.com` - Sales Manager demo access
   - Assigned to Downtown Honda for demo purposes

## 🔧 **Manual User Creation (Bypass Email Verification)**

### **Method 1: Supabase Dashboard**

1. Go to Authentication → Users
2. Click "Add User"
3. Enter email and password
4. ✅ **Check "Email Confirmed"** - This bypasses verification
5. Click "Create User"

### **Method 2: SQL (More Control)**

```sql
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'newuser@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(), -- This confirms email immediately
  NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}'
);
```

## 🏗️ **Multi-Tenancy Architecture**

### **Schema Structure**:

```
public                    -- Master/shared tables
├── dealer_groups        -- Group definitions
├── dealerships         -- Individual dealerships
└── auth tables         -- Shared authentication

dealer_group_test        -- Test group schema
├── deals               -- Isolated deal data
├── users               -- Group-specific users
├── schedules           -- Group schedules
└── pay_plans          -- Group pay plans

dealer_group_production  -- Production client schema
├── deals               -- Client deal data
├── users               -- Client users
└── ...                -- Isolated from test data
```

### **Data Isolation**:

- Each dealer group operates in its own schema
- RLS policies ensure no cross-contamination
- Metrics and reports are schema-specific

## 🧪 **Testing Scenarios**

### **Real Numbers to Test**:

1. **F&I Gross**: $2,800, $1,200, $3,200, $1,950, $2,600
2. **Product Mix**: VSC, GAP, Paint Protection, Tire & Wheel
3. **Deal Types**: Finance, Cash, Lease
4. **Multiple Dealerships**: Honda, Toyota, Ford
5. **Different Roles**: Finance Director, Sales Manager, F&I Managers, Salespersons

### **Dashboard Testing**:

- Finance Director Dashboard with real department metrics
- Sales Manager Dashboard with actual deal data
- Individual F&I Manager performance tracking
- Salesperson deal logs and commissions

## 🚀 **Execution Order**

1. **Run cleanup script** (`cleanup-test-accounts.sql`)
2. **Run setup script** (`setup-full-dealer-group.sql`)
3. **Test login with new accounts**
4. **Verify data isolation**
5. **Test all dashboard functionalities**

## 📊 **Expected Results**

After setup completion:

- ✅ 2 essential users preserved
- ✅ 8 new test users created
- ✅ 3 dealerships in test group
- ✅ 5 realistic deals created
- ✅ Multi-tenant architecture active
- ✅ Ready for real-world testing

## 🔍 **Verification Queries**

```sql
-- Check user count
SELECT COUNT(*) FROM auth.users;

-- Check test group setup
SELECT * FROM dealerships WHERE group_id = 'dg-test-001';

-- Check deals distribution
SELECT dealership_id, COUNT(*)
FROM deals
WHERE dealership_id LIKE 'deal-test-%'
GROUP BY dealership_id;

-- Verify multi-tenancy
SELECT schema_name FROM information_schema.schemata
WHERE schema_name LIKE 'dealer_group_%';
```

This setup provides a realistic testing environment with proper data separation and real numbers for comprehensive debugging and testing.
