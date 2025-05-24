// Add emergency manual confirmation for test accounts
const confirmTestAccount = async (email: string) => {
  try {
    if (
      !confirm(
        `Are you sure you want to manually confirm the email for ${email}? This is for emergency testing only.`
      )
    ) {
      return;
    }

    // First try to get the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      // Try searching with a glob pattern for test accounts that might have timestamps
      const userName = email.split('@')[0];
      const { data: matchedUsers, error: matchError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `${userName}%@gmail.com`)
        .limit(10);

      if (matchError || !matchedUsers?.length) {
        safeToast({
          title: 'Error',
          description: `Couldn't find user with email like ${email}`,
          variant: 'destructive',
        });
        return;
      }

      // If we have multiple matches, show them with a selection dialog
      if (matchedUsers.length > 1) {
        console.log('Found multiple possible matches:', matchedUsers);
        const matchedEmails = matchedUsers.map(u => u.email).join('\n');
        alert(
          `Found multiple possible matches:\n${matchedEmails}\n\nPlease try with the exact email from this list.`
        );
        return;
      }

      // Use the first match
      const userId = matchedUsers[0].id;
      const actualEmail = matchedUsers[0].email;

      // Try to confirm the user
      try {
        // Direct database operation to mark email as confirmed
        const { data, error } = await supabase.rpc('admin_confirm_user', { user_id: userId });

        if (error) {
          console.error('RPC error:', error);
          throw error;
        }

        safeToast({
          title: 'Success',
          description: `User ${actualEmail} has been manually confirmed. They can now log in.`,
        });

        console.log(`[MasterAdminPanel] Successfully confirmed test account ${actualEmail}`);
      } catch (err) {
        console.error(`[MasterAdminPanel] Error confirming test account:`, err);
        safeToast({
          title: 'Error',
          description: `Failed to confirm user: ${err}`,
          variant: 'destructive',
        });
      }
    } else {
      // We found the exact user, try to confirm them
      const userId = userData.id;

      try {
        // Direct database operation to mark email as confirmed
        const { data, error } = await supabase.rpc('admin_confirm_user', { user_id: userId });

        if (error) {
          console.error('RPC error:', error);
          throw error;
        }

        safeToast({
          title: 'Success',
          description: `User ${email} has been manually confirmed. They can now log in.`,
        });

        console.log(`[MasterAdminPanel] Successfully confirmed test account ${email}`);
      } catch (err) {
        console.error(`[MasterAdminPanel] Error confirming test account:`, err);
        safeToast({
          title: 'Error',
          description: `Failed to confirm user: ${err}`,
          variant: 'destructive',
        });
      }
    }
  } catch (error) {
    console.error('[MasterAdminPanel] Error in confirmTestAccount:', error);
    safeToast({
      title: 'Error',
      description: 'Failed to confirm test account',
      variant: 'destructive',
    });
  }
};
