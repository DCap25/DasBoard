# Das Board Application - Manual Testing Guide

## Overview
This guide provides a systematic approach to testing all features of the Das Board application for each user role. Follow the instructions for comprehensive testing coverage.

## Prerequisites
- The Sales API is running on port 3001
- The Das Board application is running on port 5173
- You have run the `start-services.ps1` script to ensure services are active

## Test Users
| Email | Password | Role | Dealership |
|-------|----------|------|------------|
| admin@example.com | password | Admin | All |
| salesperson@dealer1.com | password | Salesperson | Dealer 1 |
| finance@dealer1.com | password | Finance Manager | Dealer 1 |
| salesmanager@dealer1.com | password | Sales Manager | Dealer 1 |
| gm@dealer1.com | password | General Manager | Dealer 1 |
| salesperson@dealer2.com | password | Salesperson | Dealer 2 |
| finance@dealer2.com | password | Finance Manager | Dealer 2 |
| salesmanager@dealer2.com | password | Sales Manager | Dealer 2 |
| gm@dealer2.com | password | General Manager | Dealer 2 |

## Testing Approach
For each user role, perform the following tests and mark them as passed (✅) or failed (❌).

## Common Features to Test for All Roles

### Authentication
- [ ] **Signup**
  - Try to sign up with an email that doesn't match the pattern for existing users
  - Verify form validation for missing fields
  - Verify password strength requirements

- [ ] **Login**
  - Login with correct credentials 
  - Try to login with incorrect password and verify error message
  - Try to login with non-existent email and verify error message
  - Verify "Remember me" checkbox functionality

- [ ] **Logout**
  - Confirm that logout button is visible in the navbar
  - Click logout and verify you're redirected to login page
  - Verify that protected routes can't be accessed after logout

### UI Consistency Tests
- [ ] Verify responsive design at:
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)
- [ ] Check navigation menu appearance and functionality
- [ ] Verify that all forms have consistent styling
- [ ] Test dark/light mode toggle if available
- [ ] Verify that all buttons have hover states
- [ ] Check loading states for data-fetching operations

## Role-Specific Testing

### Salesperson Testing

#### Dashboard
- [ ] Verify dashboard loads with correct metrics
- [ ] Confirm personal sales statistics are visible
- [ ] Verify commission calculations are accurate

#### Deal Log
- [ ] View list of all deals associated with the salesperson
- [ ] Add a new deal with all required information
- [ ] Edit an existing deal
- [ ] Verify deal status transitions work correctly

#### Pay Calculator
- [ ] Enter sales figures and verify commission calculation
- [ ] Change pay plan and verify recalculation
- [ ] Test edge cases (zero sales, maximum sales)

#### Schedule
- [ ] View personal schedule
- [ ] Create a new appointment
- [ ] Edit an existing appointment
- [ ] Delete an appointment

### Finance Manager Testing

#### Dashboard
- [ ] Verify F&I metrics are visible
- [ ] Confirm product penetration rates are displayed
- [ ] Check revenue per unit calculations

#### F&I Products
- [ ] View list of F&I products
- [ ] Add a new F&I product to a deal
- [ ] Edit existing product information
- [ ] Verify commission calculations

#### Reports
- [ ] Generate F&I performance report
- [ ] Export report to CSV or PDF
- [ ] Filter report by date range

### Sales Manager Testing

#### Dashboard
- [ ] Verify team performance metrics are visible
- [ ] Check inventory status indicators
- [ ] Confirm sales goals vs. actuals are displayed

#### Team Management
- [ ] View list of team members
- [ ] Check individual performance metrics
- [ ] Assign tasks or deals to team members

#### Inventory
- [ ] View current inventory
- [ ] Add new vehicle to inventory
- [ ] Update existing vehicle information
- [ ] Mark vehicle as sold and verify inventory count updates

#### Reports
- [ ] Generate sales performance report
- [ ] Filter report by salesperson
- [ ] Export report in different formats

### General Manager Testing

#### Dashboard
- [ ] Verify dealership-wide metrics are visible
- [ ] Check department performance comparisons
- [ ] Confirm financial summaries are accurate

#### Department Management
- [ ] View all departments
- [ ] Check department-specific metrics
- [ ] Verify budget vs. actuals for each department

#### Dealership Settings
- [ ] View dealership profile information
- [ ] Update dealership contact information
- [ ] Modify operational settings

#### Advanced Reports
- [ ] Generate comprehensive dealership performance report
- [ ] Compare current period vs. previous periods
- [ ] Export detailed financial analysis

### Admin Testing

#### User Management
- [ ] View all users across dealerships
- [ ] Create a new user with specific role
- [ ] Edit existing user details
- [ ] Deactivate a user account
- [ ] Reactivate a deactivated account

#### Dealership Management
- [ ] View all dealerships
- [ ] Add a new dealership
- [ ] Edit dealership information
- [ ] View dealership-specific metrics

#### System Settings
- [ ] Modify global application settings
- [ ] Update authentication settings
- [ ] Configure notification preferences
- [ ] View system logs

## Multi-Tenant Isolation Testing
- [ ] Log in as Dealer 1 user and note visible data
- [ ] Log in as Dealer 2 user with same role and verify only Dealer 2 data is visible
- [ ] Verify that users cannot access data from other dealerships
- [ ] Test URL manipulation to attempt cross-tenant access

## Edge Cases and Error Handling
- [ ] Test form submissions with invalid data
- [ ] Test behavior when API is slow (can be simulated with network throttling in dev tools)
- [ ] Check error messages when operations fail
- [ ] Verify application behavior when local storage is cleared
- [ ] Test session timeout handling

## Bug Reporting Template
For any bugs found during testing, use this format:

```
ISSUE: [Brief description]
STEPS TO REPRODUCE:
1. 
2.
3.
EXPECTED BEHAVIOR:
ACTUAL BEHAVIOR:
SEVERITY: [Critical, Major, Minor, Cosmetic]
AFFECTED ROLES:
SCREENSHOT: [If applicable]
```

## Test Completion Checklist
- [ ] All common features tested
- [ ] All role-specific features tested
- [ ] Multi-tenant isolation verified
- [ ] Edge cases and error handling tested
- [ ] All critical bugs documented
- [ ] All major bugs documented

## Sign-off
Testing completed by: [Name]
Date: [Date]
Build version: [Version]

Notes: [Any additional information or observations] 