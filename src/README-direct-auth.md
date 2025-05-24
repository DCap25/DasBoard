# Direct Authentication System

This simple authentication system bypasses Supabase completely and uses localStorage to store authentication state. It's designed for reliable development and testing without any external dependencies.

## How to Use

1. Go to `/direct-login` to access the direct login page
2. Select a test account from the dropdown
3. Click "Login as Selected User"
4. You'll be automatically redirected to the appropriate dashboard based on the user's role

## Available Test Accounts

| Account Type     | Email                         | Dashboard Redirect       |
| ---------------- | ----------------------------- | ------------------------ |
| Master Admin     | testadmin@example.com         | /master-admin            |
| Group Admin      | group1.admin@exampletest.com  | /group-admin             |
| Dealership Admin | dealer1.admin@exampletest.com | /dashboard/admin         |
| Sales Manager    | sales.manager@exampletest.com | /dashboard/sales-manager |
| Salesperson      | sales@exampletest.com         | /dashboard/sales         |

## How it Works

The direct authentication system consists of the following components:

1. **directAuth.ts** - Core authentication functionality using localStorage
2. **DirectLoginPage.tsx** - UI for selecting and logging in with test accounts
3. **DirectAuthProvider.tsx** - Component that detects direct auth and handles redirects
4. **ProtectedRoute** - Updated to check for direct authentication

This system completely bypasses Supabase and React Context, using a much simpler localStorage-based approach that's more reliable for development and testing.

## Adding New Test Users

To add a new test user, edit the `TEST_USERS` array in `src/lib/directAuth.ts`:

```typescript
export const TEST_USERS: DirectAuthUser[] = [
  // Add your new user here
  {
    id: 'new-user-id',
    email: 'new.user@exampletest.com',
    role: 'role_name',
    dealershipId: 1,
    name: 'New User',
  },
];
```

## Troubleshooting

If you encounter any issues:

1. Click the "Log Out" button on the direct login page
2. Clear your browser's localStorage (in DevTools > Application > Local Storage)
3. Try logging in again

## Switching Back to Regular Authentication

To switch back to the regular Supabase authentication:

1. Log out using the Direct Login page
2. Navigate to the regular login page at `/`
