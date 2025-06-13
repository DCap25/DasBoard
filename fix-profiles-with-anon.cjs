const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Create Supabase client with anon key
const supabase = createClient(supabaseUrl, anonKey);

async function createProfilesViaAuth() {
  console.log('🔧 Creating profiles by signing in and creating profiles...');

  const testUsers = [
    {
      email: 'testadmin@example.com',
      password: 'testadmin123',
      name: 'Test Admin',
      role: 'master_admin'
    },
    {
      email: 'testfinance@example.com', 
      password: 'testfinance123',
      name: 'Test Finance Manager',
      role: 'finance_manager'
    },
    {
      email: 'dealer1.admin@exampletest.com',
      password: 'dealeradmin123', 
      name: 'Dealer Admin',
      role: 'dealership_admin'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n🔄 Processing ${user.email}...`);

      // Try to sign in first
      console.log('1. Attempting to sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (signInError) {
        console.log(`❌ Sign in failed for ${user.email}:`, signInError.message);
        console.log('⚠️ This user may not exist or password is incorrect');
        continue;
      }

      console.log(`✅ Successfully signed in as ${user.email}`);
      const userId = signInData.user.id;
      console.log(`User ID: ${userId}`);

      // Check if profile already exists
      console.log('2. Checking for existing profile...');
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log(`✅ Profile already exists for ${user.email}:`, existingProfile);
        console.log('   Updating role if needed...');
        
        if (existingProfile.role !== user.role) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: user.role, name: user.name })
            .eq('id', userId);
            
          if (updateError) {
            console.error(`❌ Failed to update profile for ${user.email}:`, updateError);
          } else {
            console.log(`✅ Updated profile role to ${user.role}`);
          }
        }
      } else {
        console.log('3. Creating new profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: `555-000${testUsers.indexOf(user) + 1}`,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ Failed to create profile for ${user.email}:`, createError);
        } else {
          console.log(`✅ Created profile for ${user.email}:`, newProfile);
        }
      }

      // Sign out to clean up session
      await supabase.auth.signOut();
      console.log('🔓 Signed out');

    } catch (error) {
      console.error(`❌ Error processing ${user.email}:`, error);
    }
  }

  // Final verification
  console.log('\n🔍 Final verification - checking all profiles...');
  try {
    // Sign in as admin to check all profiles
    const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'testadmin@example.com',
      password: 'testadmin123'
    });

    if (adminError) {
      console.log('❌ Could not sign in as admin for verification');
      return;
    }

    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');

    if (profilesError) {
      console.error('❌ Error fetching all profiles:', profilesError);
    } else {
      console.log(`✅ Total profiles in database: ${allProfiles.length}`);
      allProfiles.forEach(p => {
        console.log(`  - ${p.email} (${p.role}) - ID: ${p.id}`);
      });
    }

    await supabase.auth.signOut();
  } catch (error) {
    console.error('❌ Error in verification:', error);
  }

  console.log('\n✅ Profile creation process completed!');
}

createProfilesViaAuth()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 