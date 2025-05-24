# Dealership Management Schema - Das Board

This document provides instructions for setting up the multi-dealership schema structure in Supabase for the Das Board application.

## Schema Overview

The database structure consists of:

1. **Global Tables** (in `public` schema):

   - `dealership_groups`: Manages groups of dealerships
   - `dealerships`: Individual dealership info with schema assignment
   - `roles`: System user roles
   - `logs`: System operation logs

2. **Per-Dealership Schemas**:

   - Each dealership gets an isolated schema (e.g., `dealership_123`)
   - Contains dealership-specific tables: pay_plans, schedules, deals, etc.
   - Automatic schema creation via database trigger

3. **Row-Level Security**:
   - Global admin access to all schemas and tables
   - Dealership admins can only access their dealership's schema
   - Role-based permissions within each dealership

## Installation Instructions

### Setting Up the Schema

1. Log in to your Supabase project
2. Go to SQL Editor
3. Copy the entire contents of `setup-schema.sql`
4. Run the script

### Testing the Setup

After installation, run the following commands to verify the setup:

```sql
-- Check if global tables were created
SELECT * FROM public.dealership_groups;
SELECT * FROM public.dealerships;
SELECT * FROM public.roles;
SELECT * FROM public.logs;

-- Create test data
SELECT create_test_data();

-- Verify test data
SELECT * FROM public.dealership_groups;
SELECT * FROM public.dealerships;
SELECT * FROM dealership_test.pay_plans;
```

### Row-Level Security Testing

The schema includes Row-Level Security (RLS) to isolate data:

- **Admin** users can see all dealerships and all schemas
- **Dealership Admin** users can only see their assigned dealership
- **Other roles** (managers, salespeople) can only access their dealership's schema with role-specific permissions

## Integration with Das Board Application

### API Service

The `apiService.ts` file provides functions to interact with the schema:

- `getDealershipGroups()`: Get all dealership groups
- `createDealershipGroup()`: Create a new group
- `getDealerships()`: Get all dealerships
- `createDealership()`: Create a new dealership (automatically creates its schema)
- `getDealershipData()`: Get data from a specific dealership's schema
- `createDealershipRecord()`: Create a record in a dealership's schema
- `testSchemaConnections()`: Test database connections

### AuthContext Integration

The `AuthContext.tsx` file has been updated to:

- Track user's dealership assignment
- Store dealership context for data operations
- Log schema-related operations

### Admin Panel

Use the `AdminPanel.tsx` component to:

- Create and manage dealership groups
- Create and manage dealerships
- Test schema connections
- View operation logs

## Schema Creation Process

When a new dealership is created:

1. A record is inserted into `public.dealerships` with a unique `schema_name`
2. A database trigger calls `create_dealership_schema()` function
3. A new schema is created with standard tables (pay_plans, schedules, deals)
4. RLS policies are applied to the new schema
5. The operation is logged in `public.logs`

## Debugging

If you encounter issues:

1. Check the `public.logs` table for creation errors
2. Verify RLS policies with different user roles
3. Test schema access from the Das Board application
4. Ensure users have the correct `dealership_id` in their profiles

## Manual Schema Management

You can manually create or update schemas:

```sql
-- Create a new schema
SELECT create_dealership_schema('dealership_new');

-- Verify schema creation
SELECT schema_name FROM information_schema.schemata
WHERE schema_name LIKE 'dealership%';

-- Add tables to existing schema
CREATE TABLE dealership_new.custom_table (...);
```

## Security Considerations

- Never expose the `postgres` role to applications
- Always use Supabase's Row-Level Security
- Test access with multiple user roles
- Keep dealership IDs confidential as they're used in security policies

## Troubleshooting

1. **Schema creation fails**: Check extension requirements, particularly `pg_trgm` and `moddatetime`
2. **Cannot access dealership data**: Verify user's `dealership_id` in profiles table
3. **RLS blocks access**: Confirm user role and permissions
4. **Missing tables**: Manually run `create_dealership_schema()` function for affected schemas
