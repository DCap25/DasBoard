# Sales API

A mock API service that mimics Supabase authentication and database operations.

## Features

- Authentication (signup, signin, signout)
- JWT-based authentication
- Tenant isolation based on dealership_id
- Role-based access control

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

The API will be available at http://localhost:3001

## Test Users

The API comes with pre-configured test users:

| Email | Password | Role | Dealership ID |
|-------|----------|------|--------------|
| testsales@example.com | password | salesperson | 1 |
| testfinance@example.com | password | finance_manager | 1 |
| testmanager@example.com | password | sales_manager | 1 |
| testgm@example.com | password | general_manager | 1 |
| testadmin@example.com | password | admin | 1 |

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/signin` - Sign in an existing user
- `POST /auth/signout` - Sign out

### Protected Endpoints

- `GET /profiles` - Get user profile
- `GET /api/sales` - Get sales data (filtered by dealership_id)
- `POST /api/sales` - Create a new sale
- `GET /api/metrics` - Get metrics data (filtered by dealership_id)
- `GET /api/fni_details` - Get F&I details (filtered by dealership_id) 