# Supabase Setup Guide for Das Board

## Overview
This guide outlines the steps needed to configure your Supabase project for the Das Board application.

## Authentication Configuration

1. **Navigate to Authentication Settings**
   - Go to the Supabase dashboard: https://app.supabase.com/
   - Select your project: `dijulexxrgfmaiewtavb`
   - Go to Authentication > Settings

2. **Configure Sign-in Methods**
   - Ensure Email auth is enabled
   - Configure password requirements:
     - Minimum password length: 8
     - Enable "Require special character"
   - Set Site URL to your Vercel deployment URL (e.g., `https://dasboard-app.vercel.app`)

3. **Set Up Custom Email Templates**
   - Navigate to Authentication > Email Templates
   - Customize the following templates:
     - Confirmation
     - Invitation
     - Magic Link
     - Password Reset

## Database Table Structure

1. **Profiles Table**
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT NOT NULL,
     name TEXT,
     role TEXT CHECK (role IN ('salesperson', 'finance_manager', 'sales_manager', 'general_manager', 'admin')),
     dealership_id INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Dealerships Table**
   ```sql
   CREATE TABLE dealerships (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     location TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Sales Table**
   ```sql
   CREATE TABLE sales (
     id SERIAL PRIMARY KEY,
     dealership_id INTEGER NOT NULL,
     salesperson_id UUID REFERENCES profiles(id),
     customer_name TEXT NOT NULL,
     vehicle_type TEXT NOT NULL,
     vehicle_vin TEXT,
     sale_date DATE NOT NULL,
     sale_amount NUMERIC(10,2) NOT NULL,
     status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Metrics Table**
   ```sql
   CREATE TABLE metrics (
     id SERIAL PRIMARY KEY,
     dealership_id INTEGER NOT NULL,
     sales_count INTEGER NOT NULL,
     total_revenue NUMERIC(12,2) NOT NULL,
     average_sale_amount NUMERIC(10,2) NOT NULL,
     period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
     date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **F&I Details Table**
   ```sql
   CREATE TABLE fni_details (
     id SERIAL PRIMARY KEY,
     sale_id INTEGER REFERENCES sales(id),
     dealership_id INTEGER NOT NULL,
     finance_manager_id UUID REFERENCES profiles(id),
     product_type TEXT CHECK (product_type IN ('warranty', 'insurance', 'protection_plan', 'service_contract', 'other')),
     amount NUMERIC(10,2) NOT NULL,
     commission_amount NUMERIC(10,2) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## Row Level Security (RLS) Configuration

1. **Enable RLS on All Tables**
   - For each table, go to the Authentication tab and enable Row Level Security

2. **Create Policies for Dealership Isolation**

   **For Profiles Table:**
   ```sql
   -- Allow users to read their own profile
   CREATE POLICY "Users can view their own profile"
     ON profiles
     FOR SELECT
     USING (auth.uid() = id);
   
   -- Allow users to read profiles from their dealership
   CREATE POLICY "Users can view profiles from their dealership"
     ON profiles
     FOR SELECT
     USING (
       dealership_id IN (
         SELECT dealership_id FROM profiles WHERE id = auth.uid()
       )
     );
   
   -- Allow admins to view all profiles
   CREATE POLICY "Admins can view all profiles"
     ON profiles
     FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

   **For Sales Table:**
   ```sql
   -- Allow users to view sales from their dealership
   CREATE POLICY "Users can view sales from their dealership"
     ON sales
     FOR SELECT
     USING (
       dealership_id IN (
         SELECT dealership_id FROM profiles WHERE id = auth.uid()
       )
     );
   
   -- Allow salespeople to insert sales for their dealership
   CREATE POLICY "Salespeople can insert sales"
     ON sales
     FOR INSERT
     WITH CHECK (
       dealership_id IN (
         SELECT dealership_id FROM profiles WHERE id = auth.uid()
       )
     );
   
   -- Allow admins to view all sales
   CREATE POLICY "Admins can view all sales"
     ON sales
     FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

   **Similar policies should be created for the metrics and fni_details tables**

## API Configuration

1. **Configure CORS Settings**
   - Go to Project Settings > API
   - Under CORS (Cross-Origin Resource Sharing), add your Vercel domain:
     - `https://dasboard-app.vercel.app`
   - Also add your local development domains:
     - `http://localhost:5173`
     - `http://localhost:5174`

2. **API Authentication Settings**
   - Under Project Settings > API
   - Copy the "Project URL": `https://dijulexxrgfmaiewtavb.supabase.co`
   - For local development testing with the anon key, use a placeholder like `<dealership-1-anon-key>`

## Sample Data Insert

1. **Insert Dealership**
   ```sql
   INSERT INTO dealerships (name, location) VALUES
   ('Auto Haven', 'New York, NY');
   ```

2. **Insert Test Users**
   - Use the Supabase authentication UI to create test users with these emails:
     - `testsales@example.com` (role: salesperson)
     - `testfinance@example.com` (role: finance_manager)
     - `testmanager@example.com` (role: sales_manager)
     - `testgm@example.com` (role: general_manager)
     - `testadmin@example.com` (role: admin)
   - Then link them to profiles with:
   ```sql
   INSERT INTO profiles (id, email, name, role, dealership_id)
   VALUES 
   ([user_id_1], 'testsales@example.com', 'Test Sales', 'salesperson', 1),
   ([user_id_2], 'testfinance@example.com', 'Test Finance', 'finance_manager', 1),
   ([user_id_3], 'testmanager@example.com', 'Test Manager', 'sales_manager', 1),
   ([user_id_4], 'testgm@example.com', 'Test GM', 'general_manager', 1),
   ([user_id_5], 'testadmin@example.com', 'Test Admin', 'admin', 1);
   ```

## Additional Security Settings

1. **Database Functions**
   - Create a function to automatically set the dealership_id for new sales:
   ```sql
   CREATE OR REPLACE FUNCTION set_dealership_id()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.dealership_id := (
       SELECT dealership_id FROM profiles WHERE id = auth.uid()
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   CREATE TRIGGER set_dealership_id_trigger
   BEFORE INSERT ON sales
   FOR EACH ROW
   EXECUTE FUNCTION set_dealership_id();
   ```

2. **Bucket Storage (Optional)**
   - Create a storage bucket for file uploads:
     - Go to Storage > Create bucket
     - Name: `dealership-documents`
     - Make it private
   - Set up RLS policies to limit access to users within the same dealership

## Testing the Setup

1. Use the Supabase SQL editor to query data:
   ```sql
   SELECT * FROM profiles;
   SELECT * FROM sales;
   ```

2. Test authentication using the Supabase Auth UI

3. Test API access with Postman or similar tool to verify RLS is working properly 