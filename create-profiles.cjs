const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
// This needs to be the service role key to bypass RLS
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTkyNDA5NCwiZXhwIjoyMDUxNTAwMDk0fQ.Y3DjXWr3sWjU8wRXBH8p3uEcJ_IY8hDxJzgp8JK2tVE'; // Note: This might need to be the actual service role key

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createProfiles() {
  console.log('🔧 Creating profiles for existing auth users...');

  try {
    // First, let's check existing auth users
    console.log('1. Checking existing auth users...');

    // Note: We can't directly query auth.users from client, so we'll work with known users
    const knownUsers = [
      {
        id: '2a91997d-3152-46ec-9cb8-b9c13ea341e9',
        email: 'testadmin@example.com',
        name: 'Test Admin',
        role: 'master_admin',
      },
      {
        id: '4a0019f4-3dfb-405b-b6ce-097819dc2386',
        email: 'testfinance@example.com',
        name: 'Test Finance Manager',
        role: 'finance_manager',
      },
      {
        id: '68d5b654-93c8-4d5a-be00-bd645a2c3f03',
        email: 'dealer1.admin@exampletest.com',
        name: 'Dealer Admin',
        role: 'dealership_admin',
      },
    ];

    console.log('2. Known users to create profiles for:', knownUsers.length);

    // Check current profiles
    console.log('3. Checking existing profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, role');

    if (profilesError) {
      console.error('Error checking existing profiles:', profilesError);
    } else {
      console.log('Existing profiles:', existingProfiles.length);
      existingProfiles.forEach(p => console.log(`  - ${p.email} (${p.role})`));
    }

    // Create profiles for users that don't have them
    console.log('4. Creating missing profiles...');

    for (const user of knownUsers) {
      const existingProfile = existingProfiles?.find(p => p.id === user.id);

      if (existingProfile) {
        console.log(`✅ Profile already exists for ${user.email}`);
        continue;
      }

      console.log(`🔄 Creating profile for ${user.email}...`);

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error(`❌ Failed to create profile for ${user.email}:`, createError);
      } else {
        console.log(`✅ Created profile for ${user.email}:`, newProfile);
      }
    }

    // Verify final state
    console.log('5. Verifying final profiles...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, email, name, role');

    if (finalError) {
      console.error('Error checking final profiles:', finalError);
    } else {
      console.log('Final profiles count:', finalProfiles.length);
      finalProfiles.forEach(p => console.log(`  - ${p.email} (${p.role})`));
    }

    console.log('✅ Profile creation completed!');
  } catch (error) {
    console.error('❌ Error in createProfiles:', error);
  }
}

createProfiles()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
