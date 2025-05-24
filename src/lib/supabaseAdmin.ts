/**
 * supabaseAdmin.ts
 *
 * Admin operations for Supabase, including schema creation and management.
 * These functions should only be called from server-side code or secure admin endpoints.
 */

import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for privileged operations
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Creates a new schema for a Finance Manager
 * @param userId - The user's UUID in Supabase Auth
 * @returns The name of the created schema or null if failed
 */
export async function createFinanceManagerSchema(userId: string): Promise<string | null> {
  console.log(`[supabaseAdmin] Creating schema for Finance Manager with ID: ${userId}`);

  try {
    // Create a unique schema name
    const schemaPrefix = 'finance_mgr_';
    const schemaId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const schemaName = `${schemaPrefix}${schemaId}`;

    console.log(`[supabaseAdmin] Generated schema name: ${schemaName}`);

    // Execute SQL to create the schema
    const { error: schemaError } = await supabaseAdmin.rpc('create_schema_with_tables', {
      p_schema_name: schemaName,
      p_user_id: userId,
    });

    if (schemaError) {
      console.error('[supabaseAdmin] Error creating schema:', schemaError);
      return null;
    }

    console.log(`[supabaseAdmin] Successfully created schema: ${schemaName}`);

    // Create entry in the schemas table to track schema ownership
    const { error: mappingError } = await supabaseAdmin.from('schema_user_mappings').insert({
      user_id: userId,
      schema_name: schemaName,
      schema_type: 'finance_manager',
      created_at: new Date().toISOString(),
    });

    if (mappingError) {
      console.error('[supabaseAdmin] Error creating schema-user mapping:', mappingError);
      // We continue even if this fails, as the schema was created
    }

    return schemaName;
  } catch (error) {
    console.error('[supabaseAdmin] Unexpected error creating schema:', error);
    return null;
  }
}

/**
 * Creates the deals table in a Finance Manager's schema
 * @param schemaName - The schema name
 * @returns Boolean indicating success or failure
 */
export async function createDealsTable(schemaName: string): Promise<boolean> {
  console.log(`[supabaseAdmin] Creating deals table in schema: ${schemaName}`);

  try {
    // Create the deals table
    const { error } = await supabaseAdmin.rpc('create_deals_table', {
      p_schema_name: schemaName,
    });

    if (error) {
      console.error('[supabaseAdmin] Error creating deals table:', error);
      return false;
    }

    console.log(`[supabaseAdmin] Successfully created deals table in schema: ${schemaName}`);
    return true;
  } catch (error) {
    console.error('[supabaseAdmin] Unexpected error creating deals table:', error);
    return false;
  }
}

/**
 * Sets up RLS policies for a Finance Manager's deals table
 * @param schemaName - The schema name
 * @param userId - The user's UUID in Supabase Auth
 * @returns Boolean indicating success or failure
 */
export async function setupDealsRLSPolicies(schemaName: string, userId: string): Promise<boolean> {
  console.log(`[supabaseAdmin] Setting up RLS policies for schema: ${schemaName}, user: ${userId}`);

  try {
    // Set up RLS policies
    const { error } = await supabaseAdmin.rpc('setup_deals_rls_policies', {
      p_schema_name: schemaName,
      p_user_id: userId,
    });

    if (error) {
      console.error('[supabaseAdmin] Error setting up RLS policies:', error);
      return false;
    }

    console.log(`[supabaseAdmin] Successfully set up RLS policies in schema: ${schemaName}`);
    return true;
  } catch (error) {
    console.error('[supabaseAdmin] Unexpected error setting up RLS policies:', error);
    return false;
  }
}

/**
 * Approves a Finance Manager signup by creating a schema and necessary tables
 * @param signupRequestId - The ID of the signup request
 * @param userId - The user's UUID in Supabase Auth
 * @returns Object with schema info or error
 */
export async function approveFinanceManagerSignup(
  signupRequestId: string,
  userId: string
): Promise<{ success: boolean; schemaName?: string; error?: string }> {
  console.log(
    `[supabaseAdmin] Approving Finance Manager signup. Request ID: ${signupRequestId}, User ID: ${userId}`
  );

  try {
    // Create schema
    const schemaName = await createFinanceManagerSchema(userId);
    if (!schemaName) {
      return { success: false, error: 'Failed to create schema' };
    }

    // Create deals table
    const dealsTableCreated = await createDealsTable(schemaName);
    if (!dealsTableCreated) {
      return { success: false, error: 'Failed to create deals table' };
    }

    // Set up RLS policies
    const rlsPoliciesSet = await setupDealsRLSPolicies(schemaName, userId);
    if (!rlsPoliciesSet) {
      return { success: false, error: 'Failed to set up RLS policies' };
    }

    // Update signup request status
    const { error: updateError } = await supabaseAdmin
      .from('signup_requests')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString(),
        processed_by: userId,
      })
      .eq('id', signupRequestId);

    if (updateError) {
      console.error('[supabaseAdmin] Error updating signup request:', updateError);
      // Continue anyway since the schema was created
    }

    console.log(
      `[supabaseAdmin] Successfully approved Finance Manager signup. Schema: ${schemaName}`
    );
    return { success: true, schemaName };
  } catch (error) {
    console.error('[supabaseAdmin] Unexpected error approving signup:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export default supabaseAdmin;
