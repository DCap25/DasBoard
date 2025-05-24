# Das Board Testing Instructions

This document provides comprehensive testing instructions for the Das Board application after fixing the 401 authentication error.

## Prerequisites

1. Mock API server running:
   ```
   cd E:\WebProjects\sales-api-new
   npm run start
   ```

2. Das Board application running:
   ```
   cd E:\WebProjects\dasboard
   npm run dev
   ```

## Test Credentials

Use the following test accounts:

| Email | Password | Role | Expected Redirect |
|-------|----------|------|------------------|
| testsales@example.com | password | Salesperson | /dashboard/salesperson |
| testfinance@example.com | password | Finance Manager | /finance |
| testmanager@example.com | password | Sales Manager | /dashboard/sales-manager |
| testgm@example.com | password | General Manager | /dashboard/general-manager |
| testadmin@example.com | password | Admin | /dashboard/admin |

## 1. Authentication Testing

- [ ] Login with each test user
- [ ] Verify correct redirect based on role
- [ ] Test remember me functionality
- [ ] Test logout functionality
- [ ] Verify session persistence with page refresh
- [ ] Test invalid credentials error handling

## 2. Role-Based Access Testing

### Admin

- [ ] User Management:
  - [ ] View all users across all dealerships
  - [ ] Create new user with various roles
  - [ ] Edit existing user permissions
  - [ ] Delete user (if applicable)

- [ ] Metrics:
  - [ ] View all dealership metrics
  - [ ] Filter by dealership
  - [ ] Export reports

- [ ] Subscription:
  - [ ] View subscription details
  - [ ] Manage subscription settings

### Salesperson

- [ ] Dashboard:
  - [ ] View personal sales metrics
  - [ ] Check recent activity
  - [ ] View upcoming tasks

- [ ] Deal Log:
  - [ ] View personal sales records
  - [ ] Create new deal
  - [ ] Update deal status
  - [ ] Add notes to deals

- [ ] Pay Calculator:
  - [ ] Calculate commission based on sales
  - [ ] View historical pay data

### Finance Manager

- [ ] Deal Entry:
  - [ ] Add F&I products to deals
  - [ ] Calculate finance terms
  - [ ] Process finance applications

- [ ] Metrics:
  - [ ] View F&I performance metrics
  - [ ] Check product penetration rates

- [ ] Deal Log:
  - [ ] View all dealership deals
  - [ ] Filter by salesperson
  - [ ] Add finance details to deals

- [ ] Pay Calculator:
  - [ ] Calculate F&I commission

### Sales Manager

- [ ] Team Metrics:
  - [ ] View team performance dashboard
  - [ ] Check individual salesperson stats
  - [ ] Monitor goal progress

- [ ] Deal Log:
  - [ ] View all dealership deals
  - [ ] Approve/reject deals
  - [ ] Reassign deals between salespeople

- [ ] Scheduling:
  - [ ] Create team schedule
  - [ ] Assign shifts to team members
  - [ ] View schedule conflicts

### General Manager

- [ ] Metrics:
  - [ ] View comprehensive dealership performance
  - [ ] Check department metrics
  - [ ] View historical trend analysis

- [ ] Deal Log:
  - [ ] Access all dealership transactions
  - [ ] Review and approve special deals
  - [ ] View profit margins

- [ ] Scheduling Overview:
  - [ ] View department schedules
  - [ ] Check resource allocation
  - [ ] Approve time-off requests

## 3. Multi-tenant Isolation Testing

- [ ] Verify users can only access data from their assigned dealership (dealership-1)
- [ ] Confirm admin can access all dealerships
- [ ] Check that direct URL attempts to access other dealership data are blocked
- [ ] Test API endpoint protection with tools like Postman (optional)

## 4. UI Consistency Testing

- [ ] Verify dark gray-black background throughout
- [ ] Check blue-teal gradients on UI elements
- [ ] Test dark/light mode toggle
- [ ] Verify responsive design at different screen sizes:
  - [ ] Desktop (1920×1080)
  - [ ] Laptop (1366×768)
  - [ ] Tablet (768×1024)
  - [ ] Mobile (375×667)

## 5. Error Handling Testing

- [ ] Test form validation errors
- [ ] Check API error handling
- [ ] Verify unauthorized access attempts
- [ ] Test network error handling
- [ ] Verify loading states during data fetch

## 6. Build and Deployment Testing

- [ ] Run automated tests:
  ```
  npm run test
  ```

- [ ] Build the application:
  ```
  npm run build
  ```

- [ ] Preview the production build:
  ```
  npm run preview
  ```

- [ ] Verify all features work in production build

## Test Reporting

Document any issues found using the following format:

```
Issue: [Brief description]
Page: [Where the issue occurs]
Steps: [Steps to reproduce]
Expected: [Expected behavior]
Actual: [Actual behavior]
Role: [User role when issue occurs]
Environment: [Dev/Prod build]
```

Submit findings through the project tracking system for resolution. 