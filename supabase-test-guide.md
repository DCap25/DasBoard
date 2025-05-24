# Supabase Integration Testing Guide for Das Board

This guide provides instructions for testing the Supabase integration with the Das Board application, ensuring that all roles and features work correctly with both the mock API and live Supabase.

## Prerequisites

- Supabase project set up according to `supabase-setup-guide.md`
- Das Board application configured with environment files:
  - `.env.development` for mock API testing
  - `.env.production` for live Supabase testing

## Testing Strategy

We'll test:
1. Authentication for each user role
2. Data access based on role permissions
3. Multi-tenant isolation (dealership-based)
4. UI consistency

## Test Environment Setup

### For Mock API Testing (Development)

1. Start the mock API server:
   ```
   cd sales-api-new
   npm run start
   ```

2. In a separate terminal, start the application in development mode:
   ```
   cd ..
   npm run dev
   ```

### For Supabase Testing (Production)

1. Build the application:
   ```
   npm run build
   ```

2. Preview the production build:
   ```
   npm run preview
   ```

## Test Cases by Role

### Common Tests (All Roles)

- [ ] Authentication:
  - [ ] Login with credentials
  - [ ] View profile information
  - [ ] Logout

- [ ] UI Consistency:
  - [ ] Verify dark gray-black background
  - [ ] Check blue-teal gradients for UI elements
  - [ ] Test dark/light mode toggle
  - [ ] Confirm responsive design at different viewport sizes

### Salesperson

- [ ] Dashboard:
  - [ ] View personal sales metrics
  - [ ] See only sales from their dealership (dealership-1)

- [ ] Sales Management:
  - [ ] View list of own sales
  - [ ] Create new sale
  - [ ] Update existing sale status

### Finance Manager

- [ ] F&I Details:
  - [ ] View F&I details for all sales in their dealership
  - [ ] Add F&I products to sales
  - [ ] Calculate commissions

- [ ] Reporting:
  - [ ] View finance-related metrics
  - [ ] See totals by product type

### Sales Manager

- [ ] Team Management:
  - [ ] View all sales team members' performance
  - [ ] See all sales for the dealership

- [ ] Reporting:
  - [ ] View aggregated sales metrics
  - [ ] Track team performance statistics

### General Manager

- [ ] Dealership Overview:
  - [ ] View all dealership metrics
  - [ ] Access all sales and F&I data

- [ ] Advanced Reporting:
  - [ ] Cross-department performance metrics
  - [ ] Financial overview

### Admin

- [ ] User Management:
  - [ ] View all users across dealerships
  - [ ] Access all dealership data

- [ ] System Settings:
  - [ ] View and modify system configuration

## Multi-Tenant Isolation Testing

1. Login as users from dealership-1
2. Verify they can only see dealership-1 data
3. Attempt to access data from other dealerships (should fail)

## Error Handling Tests

- [ ] Test invalid login credentials
- [ ] Test accessing routes without authentication
- [ ] Test accessing data without proper permissions

## Testing with Live Supabase

When testing with the live Supabase:

1. Use the command `VITE_API_URL="https://dijulexxrgfmaiewtavb.supabase.co" VITE_SUPABASE_ANON_KEY="<your-anon-key>" USE_MOCK_SUPABASE="false" npm run dev` to override the development environment

2. Or use `npm run build && npm run preview` to test the production build

3. For each user role:
   - Verify authentication works
   - Confirm all data appears correctly
   - Test CRUD operations
   - Ensure multi-tenant isolation is enforced

## Reporting Issues

If you discover any issues during testing, document them in the following format:

```
Issue: [Brief description]
Environment: [Development/Production]
User Role: [Salesperson/Finance Manager/Sales Manager/General Manager/Admin]
Steps to Reproduce:
1. 
2.
3.
Expected Behavior:
Actual Behavior: 