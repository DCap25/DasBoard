# Cursor AI Prompt for Supabase Configuration

## Context
You are helping configure a Supabase database for "The DAS Board" React/TypeScript application to prevent 500 errors during Finance Manager login. The application has been experiencing database permission issues and needs proper RLS (Row Level Security) policies and table structure.

## Your Task
Please help me execute the SQL setup commands in my Supabase dashboard to implement comprehensive 500 error prevention for Finance Manager authentication. I have a complete SQL setup script ready that needs to be run in Supabase.

## What You Need to Do

1. **Guide me through accessing Supabase SQL Editor:**
   - Help me navigate to the correct location in Supabase dashboard
   - Explain how to properly execute SQL commands

2. **Execute the SQL setup script:**
   - The script is located in my project at: `E:\WebProjects\dasboard\supabase_setup_commands.sql`
   - This script contains 387 lines of comprehensive database setup commands
   - It includes RLS policies, table creation, validation functions, and health checks

3. **Verify the setup was successful:**
   - Help me run the verification queries included in the script
   - Ensure all RLS policies were created correctly
   - Confirm the Finance Manager promotion was inserted
   - Test the health check functions

## Key Components the Script Sets Up

### RLS Policies for Finance Manager Access:
- `finance_managers_can_access_own_profile` - Profile access policy
- `finance_managers_can_update_own_profile` - Profile update policy
- `admins_can_view_all_profiles` - Admin access policy
- `authenticated_users_can_view_promotions` - Promotions viewing policy

### Tables and Structure:
- Enhanced `promotions` table with validation constraints
- `promotions_usage` table with schema-based access control
- Finance Manager specific promotion (tier: finance_manager_only, price: $0.00)

### Validation Functions:
- `get_user_profile_safe()` - Safe profile retrieval with error handling
- `check_database_health()` - System health monitoring

## Expected Outcomes
After successful execution, the script should:
- ✅ Enable RLS on profiles table
- ✅ Create 4+ RLS policies for secure access
- ✅ Set up promotions tables with proper constraints
- ✅ Insert the Finance Manager free promotion
- ✅ Create validation and health check functions
- ✅ Return verification queries showing successful setup

## Project Context
- **Application:** React/TypeScript dashboard with Supabase authentication
- **Issue:** Finance Manager users experiencing 500 errors during login
- **Solution:** Comprehensive database security and error prevention setup
- **Environment:** Development environment with plans for production deployment

## File Location
The complete SQL script is ready at: `E:\WebProjects\dasboard\supabase_setup_commands.sql`

Please help me execute this script step-by-step and verify that all components are properly configured to prevent Finance Manager 500 errors.

## Additional Notes
- The script includes extensive comments explaining each section
- All commands are designed to be idempotent (safe to run multiple times)
- Verification queries are included to confirm successful setup
- The script handles both new installations and existing database updates

Please guide me through this process and help ensure the Supabase configuration is properly set up for Finance Manager 500 error prevention.