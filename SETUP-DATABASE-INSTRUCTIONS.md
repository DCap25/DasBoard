# Supabase Database Setup Instructions

## Issue Identified: Empty Tables

Our testing shows that all required tables exist, but the `dealership_groups` and `dealerships` tables are **empty**. The 500 errors are occurring because your application is trying to read data from these tables, but they don't have any records.

## Adding Sample Data

You have two options for adding sample data:

### Option 1: Basic Sample Data

For a minimal setup with just enough data to make the app work:

1. **Log in to your Supabase Dashboard**: https://app.supabase.com/
2. **Open your project** (with URL https://iugjtokydvbcvmrpeziv.supabase.co)
3. **Navigate to SQL Editor** (in the left sidebar)
4. **Create a new query**
5. **Copy and paste the contents** from the `create-sample-data.sql` file in this project
6. **Run the query**

### Option 2: Comprehensive Test Data (Recommended)

For a complete testing environment with multiple dealership groups, dealerships, and various user types:

1. **Log in to your Supabase Dashboard**: https://app.supabase.com/
2. **Open your project** (with URL https://iugjtokydvbcvmrpeziv.supabase.co)
3. **Navigate to SQL Editor** (in the left sidebar)
4. **Create a new query**
5. **Copy and paste the contents** from the `complete-sample-data.sql` file in this project
6. **Run the query**

This will create:

- 3 dealership groups
- 8 dealerships (distributed across the groups)
- 6 different roles
- Multiple user profiles for each dealership with various roles

## Viewing the Sample Data

To verify the sample data was added correctly:

1. **Log in to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the contents** from the `view-sample-data.sql` file
5. **Run the query**

Or view directly in the Table Editor:

1. **Go to the Table Editor** in the Supabase dashboard
2. **Select each table** to see the records that were added

## Restart Your Application

After adding the sample data:

1. **Restart your development server**: Run `npm run dev`
2. **Test the application** by logging in and verifying all features work

## Future Data Management

When creating new records:

- Dealership groups should be created first
- Dealerships should reference a valid group_id from the dealership_groups table
- User profiles should reference valid dealership_id values

## Common Issues and Solutions

- **500 Errors** after setup:

  - Make sure both dealership_groups and dealerships tables have data
  - Check that your foreign key relationships are valid

- **Authentication Issues**:

  - The `roles` table needs to contain all the roles referenced in your application
  - Verify that user profiles have correct role assignments

- **Additional Debugging**:
  - Use the `src/test-supabase-connection.cjs` script to verify tables exist and contain data
  - Check browser network requests for more detailed error information
