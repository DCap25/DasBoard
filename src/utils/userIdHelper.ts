/**
 * Helper function to get a consistent user ID across the application
 * Handles both real Supabase users and demo/test users
 */
export const getConsistentUserId = (user: any): string | null => {
  // Try to get the ID in order of preference
  // 1. First try the direct id field
  if (user?.id && user.id !== 'undefined') {
    return user.id;
  }
  
  // 2. Try the nested user.id (some auth contexts nest the user)
  if (user?.user?.id && user.user.id !== 'undefined') {
    return user.user.id;
  }
  
  // 3. For demo/test users without a real ID, use email as fallback
  // This ensures consistency for demo users
  if (user?.email) {
    console.log('[UserIdHelper] Using email as fallback ID for demo user:', user.email);
    return `demo_${user.email}`;
  }
  
  // 4. Last resort - check if there's any unique identifier
  if (user?.sub && user.sub !== 'undefined') {
    return user.sub;
  }
  
  console.warn('[UserIdHelper] Could not determine user ID from user object:', user);
  return null;
};

/**
 * Debug helper to log user ID information
 */
export const debugUserId = (context: string, user: any): void => {
  const userId = getConsistentUserId(user);
  console.log(`[${context}] User ID resolution:`, {
    resolvedId: userId,
    user: user,
    directId: user?.id,
    nestedId: user?.user?.id,
    email: user?.email,
    sub: user?.sub
  });
};