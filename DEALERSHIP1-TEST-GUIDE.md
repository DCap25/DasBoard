# Dealership1 Testing Guide

This guide explains how to test the multi-dealership Supabase setup for Das Board.

## Overview

Das Board uses a multi-Supabase project approach:

1. **Das Board Master** (main project) - Hosts global tables (dealerships, dealership_groups, etc.) and master admin functionalities
2. **Dealership1** (test project) - A test dealership with its own Supabase project containing user accounts and dealership-specific data

This architecture allows dealerships to have their own isolated data while still being managed through the master project.

## Setup

### Option 1: Automatic Setup (Recommended)

1. Run the setup script from the project root:

   ```
   .\setup-dealership1.ps1
   ```

2. The script will:
   - Create the required `.env` file with all necessary credentials
   - Install dependencies
   - Run a test to verify connectivity
   - Start the development server

### Option 2: Manual Setup

1. Create a `.env` file in the project root with the following content:

   ```
   # Das Board Master (Main project)
   VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.iP4Z25K1Lv5AMOb8A35H9O967LfAcGdaKH82k05Q-iE

   # Dealership1 (Secondary test project)
   VITE_DEALERSHIP1_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co
   VITE_DEALERSHIP1_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA

   # API configuration
   VITE_API_URL=http://localhost:3000
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Run the test script:

   ```
   node src/scripts/test-dealership1.js
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Test Accounts

The following accounts are pre-configured in Dealership1 for testing:

| Role            | Email                   | Password     |
| --------------- | ----------------------- | ------------ |
| Admin           | testadmin@example.com   | temppassword |
| Sales Person    | testsales@example.com   | temppassword |
| F&I Manager     | testfinance@example.com | temppassword |
| Sales Manager   | testmanager@example.com | temppassword |
| General Manager | testgm@example.com      | temppassword |

## Testing Workflow

1. Open the application in your browser (default: http://localhost:5173)
2. Log in with one of the test accounts
3. Verify that you're redirected to the appropriate dashboard for the role
4. Test role-specific functionality (e.g., Sales dashboard for Sales Person)
5. Try logging in with different roles to test the permissions system
6. Use incognito/private browsing for testing multiple users simultaneously

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. Check the browser console for error messages
2. Verify your `.env` file has the correct credentials
3. Run the test script to verify connectivity:
   ```
   node src/scripts/test-dealership1.js
   ```
4. Test login directly on the Supabase dashboard (https://app.supabase.com)
5. Restart the development server with a clean state:
   ```
   npx kill-port 5173 && npm run dev
   ```

### Connection Issues

If you have connection issues:

1. Verify your internet connection
2. Check if the Supabase projects are running (https://app.supabase.com)
3. Try accessing the API directly using the Supabase dashboard
4. Check browser console for CORS or network errors

## Master Admin Panel

The Master Admin Panel at `/master-admin` allows you to manage dealerships and users. You can:

1. Create and manage dealership groups
2. Add new dealerships
3. Create admin users
4. Test connections to dealership Supabase projects
5. Add users directly to dealership projects

Access this panel using a master admin account or directly login to the Das Board Master project with an admin user.

## Architecture Notes

- **Das Board Master** manages global configuration and serves as the main entry point
- Each dealership has its own Supabase project with isolated user accounts and data
- Authentication is handled by the respective Supabase project based on login selection
- Row Level Security (RLS) ensures users can only access data they are authorized to see
- The environment supports multiple Supabase projects running concurrently

## Cost Considerations

- Das Board Master is covered by Supabase Pro plan compute credits
- Each dealership project costs $10/month (Supabase Pro plan)
- Dealership1 is a test project that can be deleted after testing
- For production, each real dealership would have its own project

For more detailed documentation on the Das Board architecture, refer to the main README.md and the DEALERSHIP-SCHEMA-README.md file.
