// Script to apply promotion-related migrations to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration - Replace with your actual values or load from .env
const supabaseUrl = process.env.SUPABASE_URL || 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use the service key for admin privileges

if (!supabaseKey) {
  console.error(
    'Error: Supabase service key is required. Set SUPABASE_SERVICE_KEY environment variable.'
  );
  process.exit(1);
}

// Initialize Supabase client with service key
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to migration files
const migrationsPath = path.join(__dirname, '..', 'migrations');

async function applyMigrations() {
  try {
    console.log('Applying promotions-related database migrations...');

    // Read and apply each migration file
    const migrationFiles = ['create_promotions_table.sql', 'create_promotions_usage_table.sql'];

    for (const fileName of migrationFiles) {
      const filePath = path.join(migrationsPath, fileName);

      try {
        if (fs.existsSync(filePath)) {
          console.log(`\nApplying migration: ${fileName}`);
          const sql = fs.readFileSync(filePath, 'utf8');

          // Execute the SQL through Supabase
          const { error } = await supabase.rpc('exec_sql', { sql });

          if (error) {
            console.error(`Error applying migration ${fileName}:`, error);
          } else {
            console.log(`Successfully applied migration: ${fileName}`);

            // Record the migration in migrations table if it exists
            await supabase
              .from('migrations_log')
              .insert({
                name: fileName,
                applied_at: new Date().toISOString(),
                status: 'success',
              })
              .catch(err => {
                // Ignore if migrations_log table doesn't exist
                console.log('Note: Could not record migration in migrations_log table.');
              });
          }
        } else {
          console.error(`Migration file not found: ${fileName}`);
        }
      } catch (fileError) {
        console.error(`Error processing migration ${fileName}:`, fileError);
      }
    }

    // Verify the promotions table was created
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('*');

    if (promotionsError) {
      console.error('Error verifying promotions table:', promotionsError);
    } else {
      console.log('\nPromotion records created:');
      console.table(promotions);
    }

    console.log('\nPromotions database setup complete!');

    // Instructions for next steps
    console.log('\nNext steps:');
    console.log(
      '1. Update SignupForm.tsx to reflect Free pricing (already done if you ran the editor script)'
    );
    console.log(
      '2. Update apiService.ts to handle promotional pricing (already done if you ran the editor script)'
    );
    console.log('3. Test the Finance Manager signup flow to ensure it works with $0 pricing');
    console.log('4. Verify promotion tracking in the Supabase tables');
  } catch (error) {
    console.error('Unexpected error applying migrations:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigrations();
