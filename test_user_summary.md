# Das Board Test User Setup Documentation

## Overview

This document outlines the test user implementation for Das Board, including the setup process, available test accounts, and guide to using the test login system.

## Test Users Created

| Email                        | Password     | Role                                         | Description           |
| ---------------------------- | ------------ | -------------------------------------------- | --------------------- |
| testadmin@example.com        | Password123! | finance_manager (+ master_admin in metadata) | Master Admin User     |
| group1.admin@exampletest.com | Password123! | admin (+ dealer_group_admin in metadata)     | Group Admin User      |
| jp@exampletest.com           | Password123! | dealership_admin                             | Dealership Admin User |
| admin1@exampletest.com       | Password123! | admin                                        | Admin User            |
| sales1@exampletest.com       | Password123! | salesperson                                  | Sales User            |
| finance1@exampletest.com     | Password123! | finance_manager                              | Finance Manager       |
| salesmgr1@exampletest.com    | Password123! | sales_manager                                | Sales Manager         |
| gm1@exampletest.com          | Password123! | general_manager                              | General Manager       |

## Implementation Details

### 1. User Creation

We created the test user accounts in Supabase using the `supabase.auth.signUp()` method and then added the corresponding profiles in the `profiles` table.

### 2. Role Assignment

We assigned proper roles to each user based on the valid role values allowed in the `profiles` table:

- Valid roles: `finance_manager`, `salesperson`, `admin`, `sales_manager`, `general_manager`, `dealership_admin`
- For roles that don't exist in the profiles table (like `dealer_group_admin`), we used a valid role in the table and stored the actual role in user metadata.

### 3. Authentication Flow

The authentication flow has been simplified:

- Direct authentication uses the standard Supabase JWT auth.
- Special handling for test emails (ending with `@exampletest.com` or `@example.com`).
- Automatic email verification for test accounts.

### 4. Test Login Page

We created a dedicated test login page at `/login-test.html` that provides one-click access to all test accounts.

### 5. Forced Real Data Loading

The `MasterAdminPanel` component has been modified to always use real data instead of mock data by:

- Setting `USE_MOCK_DATA` to `false`.
- Making `isDirectAuth()` check for the environment variable `VITE_USE_MOCK_DATA`.

### 6. Reset Functionality

We've added a `/reset` route that clears all authentication state, including:

- Signing out from Supabase
- Clearing localStorage
- Clearing sessionStorage
- Clearing cookies
- Redirecting to the login page

## How to Use

### 1. Accessing Test Accounts

1. Navigate to `/login-test.html`
2. Click on the desired user type
3. You will be automatically logged in and redirected to the appropriate dashboard

### 2. Resetting Authentication

If you encounter any authentication issues:

1. Navigate to `/reset`
2. Wait for the authentication state to be cleared
3. You will be redirected to the login page

### 3. Checking Authentication State

1. Navigate to `/login-test.html`
2. Click "Check Auth State" to see current authentication information
3. Click "Clear Auth State" to sign out and clear storage

### 4. Running with Real vs Mock Data

By default, the app now uses real data from Supabase. To use mock data:

1. Set the environment variable `VITE_USE_MOCK_DATA=true`
2. Restart the development server

## Troubleshooting

### Authentication Issues

If you experience authentication problems:

1. Visit `/reset` to clear all authentication state
2. Try using a different test account
3. Check the browser console for authentication-related error messages

### Data Loading Issues

If data is not loading properly:

1. Verify the `USE_MOCK_DATA` setting in `MasterAdminPanel.tsx`
2. Check the browser console for API-related error messages
3. Verify the user has appropriate permissions for the data they're trying to access

## Next Steps for Further Improvement

1. Add more detailed logging for authentication and data loading processes
2. Implement proper role-based access control that works with the test users
3. Improve the test user creation process to handle DB constraints properly
4. Add automatic test user refresh/recreation functionality
