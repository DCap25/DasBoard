# Test Authentication System

This document explains how to use the test authentication system for easier development and testing without dealing with email verification or complex authentication flows.

## Test Accounts

The system automatically recognizes the following test accounts:

| Account Type     | Email                         | Password    | Dashboard Redirect       |
| ---------------- | ----------------------------- | ----------- | ------------------------ |
| Master Admin     | testadmin@example.com         | password123 | /master-admin            |
| Group Admin      | group1.admin@exampletest.com  | password123 | /group-admin             |
| Dealership Admin | dealer1.admin@exampletest.com | password123 | /dashboard/admin         |
| Sales Manager    | sales.manager@exampletest.com | password123 | /dashboard/sales-manager |
| Salesperson      | sales@exampletest.com         | password123 | /dashboard/sales         |

## How to Access Test Accounts

There are two main ways to access the test accounts:

1. **Debug Auth Page** - Navigate to `/debug-auth` for a simplified login interface with preset test accounts.
2. **Test User Link** - Use the "Test User Login" link at the bottom of the regular login page.

## How It Works

The test authentication system uses several components to bypass the normal authentication flow for test accounts:

1. **TestUserMiddleware**: Intercepts navigation and automatically routes test users to the correct dashboard.
2. **Enhanced ProtectedRoute**: Explicitly handles test users to allow access to the appropriate routes.
3. **Enhanced DebugAuthPage**: Provides a dedicated interface for logging in as test users.

All test users have email addresses ending with `@example.com` or `@exampletest.com`. The system automatically detects these email patterns and applies special handling.

## Adding New Test Users

To add a new test user:

1. Create an account using the Supabase API or dashboard with an email ending in `@exampletest.com`.
2. No email verification is required for these domains.
3. Optionally, add the user to the `TEST_ACCOUNTS` array in `src/pages/DebugAuthPage.tsx` to make it available as a preset.

## Troubleshooting

If you encounter issues with test authentication:

1. Clear your browser's localStorage and sessionStorage.
2. Try using the `/debug-auth` page which provides direct login functionality.
3. Check the browser console for debugging information - all test user handling includes detailed logs.
4. Use the AuthDebugger component by clicking the "Debug Auth" button to inspect authentication state.

## Test Email Pattern

The system recognizes any email that matches these patterns as a test account:

- Emails ending with `@example.com`
- Emails ending with `@exampletest.com`
- Emails containing `test` in the username

These accounts get special handling to bypass email verification and navigate directly to the appropriate dashboard based on their role.

## Auto-Role Assignment

Role assignment is primarily based on the email address:

- Accounts with `testadmin@example.com` are assigned the `admin` role.
- Accounts containing `group` and ending with `@exampletest.com` are assigned the `dealer_group_admin` role.
- Accounts containing `admin` and ending with `@exampletest.com` are assigned the `dealership_admin` role.
- Other patterns can be added in the `TestUserMiddleware` component.
