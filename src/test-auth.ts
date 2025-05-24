const { supabase } = require('./lib/supabaseClient');

async function testAuth() {
  console.log('Starting authentication test...');

  // Test credentials - replace these with test user credentials
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';

  try {
    // 1. Test sign in
    console.log('Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('Sign in error:', signInError.message);
      return;
    }

    console.log('Sign in successful:', signInData);

    // 2. Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      return;
    }

    console.log('Session data:', sessionData);

    // 3. Get user profile
    if (signInData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError.message);
        return;
      }

      console.log('Profile data:', profileData);
    }

    // 4. Test sign out
    console.log('Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('Sign out error:', signOutError.message);
      return;
    }

    console.log('Sign out successful');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testAuth().catch(console.error); 