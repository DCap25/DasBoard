-- Supabase Initialization Script for Das Board Application

-- Create Tables

-- Dealerships Table
CREATE TABLE IF NOT EXISTS public.dealerships (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('salesperson', 'finance_manager', 'sales_manager', 'general_manager', 'admin')),
  dealership_id INTEGER REFERENCES public.dealerships(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
  id SERIAL PRIMARY KEY,
  dealership_id INTEGER REFERENCES public.dealerships(id),
  salesperson_id UUID REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_vin TEXT,
  sale_date DATE NOT NULL,
  sale_amount NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics Table
CREATE TABLE IF NOT EXISTS public.metrics (
  id SERIAL PRIMARY KEY,
  dealership_id INTEGER REFERENCES public.dealerships(id),
  sales_count INTEGER NOT NULL,
  total_revenue NUMERIC(12,2) NOT NULL,
  average_sale_amount NUMERIC(10,2) NOT NULL,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F&I Details Table
CREATE TABLE IF NOT EXISTS public.fni_details (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES public.sales(id),
  dealership_id INTEGER REFERENCES public.dealerships(id),
  finance_manager_id UUID REFERENCES public.profiles(id),
  product_type TEXT CHECK (product_type IN ('warranty', 'insurance', 'protection_plan', 'service_contract', 'other')),
  amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fni_details ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Dealerships

-- Allow users to view their own dealership
CREATE POLICY "Users can view their own dealership"
  ON public.dealerships
  FOR SELECT
  USING (
    id IN (
      SELECT dealership_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow admins to view all dealerships
CREATE POLICY "Admins can view all dealerships"
  ON public.dealerships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS Policies for Profiles

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to view profiles from their dealership
CREATE POLICY "Users can view profiles from their dealership"
  ON public.profiles
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dealership_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS Policies for Sales

-- Allow users to view sales from their dealership
CREATE POLICY "Users can view sales from their dealership"
  ON public.sales
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dealership_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow salespeople to manage their own sales
CREATE POLICY "Salespeople can insert sales"
  ON public.sales
  FOR INSERT
  WITH CHECK (
    dealership_id IN (
      SELECT dealership_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow sales managers and above to manage all sales in their dealership
CREATE POLICY "Managers can manage dealership sales"
  ON public.sales
  FOR ALL
  USING (
    dealership_id IN (
      SELECT dealership_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('sales_manager', 'general_manager')
    )
  );

-- Create RLS Policies for Metrics

-- Allow users to view metrics from their dealership
CREATE POLICY "Users can view metrics from their dealership"
  ON public.metrics
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dealership_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow managers to manage metrics
CREATE POLICY "Managers can manage metrics"
  ON public.metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('sales_manager', 'general_manager', 'admin')
    )
  );

-- Create RLS Policies for F&I Details

-- Allow users to view F&I details from their dealership
CREATE POLICY "Users can view F&I details from their dealership"
  ON public.fni_details
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dealership_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Allow finance managers to manage F&I details
CREATE POLICY "Finance managers can manage F&I details"
  ON public.fni_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND dealership_id = public.fni_details.dealership_id
      AND role IN ('finance_manager', 'general_manager', 'admin')
    )
  );

-- Create helpful functions

-- Function to automatically set dealership_id based on the user
CREATE OR REPLACE FUNCTION public.set_dealership_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.dealership_id := (
    SELECT dealership_id FROM public.profiles
    WHERE id = auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_updated_at_sales
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_fni_details
BEFORE UPDATE ON public.fni_details
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_dealership_id_sales
BEFORE INSERT ON public.sales
FOR EACH ROW
WHEN (NEW.dealership_id IS NULL)
EXECUTE FUNCTION public.set_dealership_id();

CREATE TRIGGER set_dealership_id_fni_details
BEFORE INSERT ON public.fni_details
FOR EACH ROW
WHEN (NEW.dealership_id IS NULL)
EXECUTE FUNCTION public.set_dealership_id(); 