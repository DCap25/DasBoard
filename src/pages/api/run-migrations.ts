import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for admin key authorization
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[API] Running migrations');

    // First, check if migrations table exists
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'migrations');

    if (tablesError) {
      console.error('[API] Error checking migrations table:', tablesError);
      return res.status(500).json({ error: 'Error checking migrations table' });
    }

    // Create migrations table if it doesn't exist
    if (!tablesData || tablesData.length === 0) {
      console.log('[API] Creating migrations table');

      const { error: createTableError } = await supabase.rpc('create_migrations_table');

      if (createTableError) {
        console.error('[API] Error creating migrations table:', createTableError);
        return res.status(500).json({ error: 'Failed to create migrations table' });
      }
    }

    // Get list of applied migrations
    const { data: appliedMigrations, error: migrationsError } = await supabase
      .from('migrations')
      .select('name');

    if (migrationsError) {
      console.error('[API] Error fetching applied migrations:', migrationsError);
      return res.status(500).json({ error: 'Failed to fetch applied migrations' });
    }

    const appliedMigrationNames = new Set(appliedMigrations?.map(m => m.name) || []);
    console.log('[API] Applied migrations:', Array.from(appliedMigrationNames));

    // Migrations to apply
    const migrations = [
      {
        name: '001_initial_schema',
        sql: `
          -- Create basic tables if they don't exist
          CREATE TABLE IF NOT EXISTS public.dealership_groups (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            logo_url TEXT,
            brands TEXT,
            settings JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS public.dealerships (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            group_id INTEGER REFERENCES public.dealership_groups(id),
            schema_name TEXT NOT NULL UNIQUE,
            logo_url TEXT,
            locations JSONB,
            brands JSONB,
            settings JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS public.roles (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Insert default roles if they don't exist
          INSERT INTO public.roles (name, description)
          VALUES 
            ('admin', 'Master administrator with full access'),
            ('dealership_admin', 'Dealership administrator'),
            ('group_admin', 'Dealer group administrator'),
            ('area_vp', 'Area VP managing multiple dealerships'),
            ('finance_manager', 'Finance department manager')
          ON CONFLICT (name) DO NOTHING;
          
          -- Create logs table for tracking operations
          CREATE TABLE IF NOT EXISTS public.logs (
            id SERIAL PRIMARY KEY,
            action TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID
          );
        `,
      },
      {
        name: '002_profiles_table',
        sql: `
          -- Create profiles table if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL,
            name TEXT,
            role_id INTEGER REFERENCES public.roles(id),
            dealership_id INTEGER REFERENCES public.dealerships(id),
            group_id INTEGER REFERENCES public.dealership_groups(id),
            is_group_admin BOOLEAN DEFAULT false,
            is_area_vp BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add RLS policies to profiles
          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Users can view their own profile"
            ON public.profiles FOR SELECT
            TO authenticated
            USING (id = auth.uid());
        `,
      },
      {
        name: '003_signup_requests',
        sql: `
          -- Create signup_requests table in public schema if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.signup_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            dealership_name TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            email TEXT NOT NULL,
            tier TEXT NOT NULL CHECK (tier IN ('free_trial', 'finance_manager', 'dealership', 'dealer_group')),
            add_ons JSONB DEFAULT '[]'::jsonb,
            stripe_subscription_id TEXT,
            stripe_checkout_session_id TEXT,
            payment_status TEXT,
            subscription_status TEXT,
            trial_end TIMESTAMP WITH TIME ZONE,
            metadata JSONB DEFAULT '{}'::jsonb,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE,
            processed_by UUID REFERENCES auth.users(id)
          );
          
          -- Enable Row Level Security
          ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
          
          -- Create policies for signup_requests table
          CREATE POLICY IF NOT EXISTS "Admins can manage signup requests"
            ON public.signup_requests
            FOR ALL
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND role_id = (SELECT id FROM public.roles WHERE name = 'admin')
              )
            );
            
          -- Create function to update updated_at timestamp if it doesn't exist
          CREATE OR REPLACE FUNCTION public.update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
          END;
          $$ language 'plpgsql';
          
          -- Add the trigger if it doesn't exist
          DROP TRIGGER IF EXISTS update_signup_requests_updated_at ON public.signup_requests;
          CREATE TRIGGER update_signup_requests_updated_at
            BEFORE UPDATE ON public.signup_requests
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        `,
      },
      {
        name: '004_dealer_group_schema',
        sql: `
          -- Add fields for dealer group support to signup_requests table
          ALTER TABLE public.signup_requests 
          ADD COLUMN IF NOT EXISTS group_level TEXT,
          ADD COLUMN IF NOT EXISTS dealership_count INTEGER DEFAULT 1;
          
          -- Create area_vps table for tracking Area VP assignments if it doesn't exist
          CREATE TABLE IF NOT EXISTS public.area_vps (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            group_id INTEGER NOT NULL REFERENCES public.dealership_groups(id),
            dealerships JSONB, -- Array of dealership IDs this AVP manages
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add RLS policies for area_vps table
          ALTER TABLE public.area_vps ENABLE ROW LEVEL SECURITY;
          
          -- Policy for master admins to manage all area VPs
          CREATE POLICY IF NOT EXISTS "Master admins can manage all area VPs"
            ON public.area_vps
            FOR ALL
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND role_id = (SELECT id FROM public.roles WHERE name = 'admin')
              )
            );
          
          -- Policy for group admins to manage their own group's area VPs
          CREATE POLICY IF NOT EXISTS "Group admins can manage their own group's area VPs"
            ON public.area_vps
            FOR ALL
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND is_group_admin = true
                AND group_id = area_vps.group_id
              )
            );
          
          -- Policy for area VPs to view their own assignments
          CREATE POLICY IF NOT EXISTS "Area VPs can view their own assignments"
            ON public.area_vps
            FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
            
          -- Add trigger for updated_at on area_vps
          DROP TRIGGER IF EXISTS update_area_vps_updated_at ON public.area_vps;
          CREATE TRIGGER update_area_vps_updated_at
            BEFORE UPDATE ON public.area_vps
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        `,
      },
    ];

    // Apply migrations that haven't been applied yet
    const results = [];

    for (const migration of migrations) {
      if (!appliedMigrationNames.has(migration.name)) {
        console.log(`[API] Applying migration: ${migration.name}`);

        // Execute the migration
        const { error: sqlError } = await supabase.rpc('run_sql', { sql: migration.sql });

        if (sqlError) {
          console.error(`[API] Error applying migration ${migration.name}:`, sqlError);
          results.push({
            name: migration.name,
            success: false,
            error: sqlError.message,
          });
          continue;
        }

        // Record the migration as applied
        const { error: recordError } = await supabase
          .from('migrations')
          .insert({ name: migration.name });

        if (recordError) {
          console.error(`[API] Error recording migration ${migration.name}:`, recordError);
        }

        // Log the migration
        await supabase.from('logs').insert({
          action: 'migration_applied',
          details: { migration: migration.name, timestamp: new Date().toISOString() },
        });

        results.push({
          name: migration.name,
          success: true,
        });
      } else {
        console.log(`[API] Migration already applied: ${migration.name}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Migrations completed',
      results,
    });
  } catch (error) {
    console.error('[API] Error running migrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error running migrations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
