/**
 * Helper function to get a consistent user ID across the application
 * Handles both real Supabase users and demo/test users
 * Enhanced to provide better debugging and fallback mechanisms
 */
export const getConsistentUserId = (user: any): string | null => {
  const debug = (message: string, value?: any) => {
    console.log(`[UserIdHelper] ${message}`, value);
  };

  debug('Starting user ID resolution for user:', {
    hasUser: !!user,
    directId: user?.id,
    nestedId: user?.user?.id,
    email: user?.email,
    sub: user?.sub
  });

  // Try to get the ID in order of preference
  // 1. First try the direct id field
  if (user?.id && user.id !== 'undefined' && user.id !== null && user.id !== '') {
    debug('Found direct ID:', user.id);
    return user.id;
  }

  // 2. Try the nested user.id (some auth contexts nest the user)
  if (user?.user?.id && user.user.id !== 'undefined' && user.user.id !== null && user.user.id !== '') {
    debug('Found nested user ID:', user.user.id);
    return user.user.id;
  }

  // 3. For demo/test users without a real ID, use email as fallback
  // This ensures consistency for demo users
  if (user?.email && user.email !== 'undefined' && user.email !== null && user.email !== '') {
    const demoId = `demo_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    debug('Using email as fallback ID for demo user:', { email: user.email, demoId });
    return demoId;
  }

  // 4. Last resort - check if there's any unique identifier
  if (user?.sub && user.sub !== 'undefined' && user.sub !== null && user.sub !== '') {
    debug('Found sub ID:', user.sub);
    return user.sub;
  }

  // 5. Try to recover from Supabase auth token in localStorage (sb-*-auth-token)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const tokenKey = Object.keys(window.localStorage).find(
        k => k.startsWith('sb-') && k.endsWith('-auth-token')
      );
      if (tokenKey) {
        const raw = window.localStorage.getItem(tokenKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const sessionUserId = parsed?.currentSession?.user?.id || parsed?.user?.id;
          if (sessionUserId && sessionUserId !== 'undefined' && sessionUserId !== null && sessionUserId !== '') {
            debug('Found ID from localStorage token:', sessionUserId);
            return sessionUserId;
          }
        }
      }
    }
  } catch (error) {
    debug('Error reading from localStorage:', error);
  }

  console.warn('[UserIdHelper] Could not determine user ID from user object:', user);
  return null;
};

/**
 * Enhanced getUserId function that provides multiple fallback strategies
 * Designed to be used by both Settings and LogDeal pages for consistency
 */
export const getUserIdWithFallbacks = async (user: any, localUserId: string | null = null): Promise<string | null> => {
  const debug = (message: string, value?: any) => {
    console.log(`[getUserIdWithFallbacks] ${message}`, value);
  };

  debug('Starting enhanced user ID resolution', { user, localUserId });

  // First try the standard method
  let userId = getConsistentUserId(user);
  if (userId) {
    debug('Standard method returned ID:', userId);
    return userId;
  }

  // Try the local fallback user ID
  if (localUserId && localUserId !== 'undefined' && localUserId !== null && localUserId !== '') {
    debug('Using localUserId fallback:', localUserId);
    return localUserId;
  }

  // Try to get from Supabase session directly
  try {
    if (typeof window !== 'undefined') {
      const { supabase } = await import('../lib/supabaseClient');
      const { data } = await supabase.auth.getSession();
      const sessionUserId = data?.session?.user?.id;
      if (sessionUserId && sessionUserId !== 'undefined' && sessionUserId !== null && sessionUserId !== '') {
        debug('Retrieved from Supabase session:', sessionUserId);
        return sessionUserId;
      }
    }
  } catch (error) {
    debug('Error getting Supabase session:', error);
  }

  debug('All methods failed to resolve user ID');
  return null;
};

/**
 * Synchronous version for cases where async is not possible
 */
export const getUserIdSync = (user: any, localUserId: string | null = null): string | null => {
  // Try the standard method first
  let userId = getConsistentUserId(user);
  if (userId) {
    return userId;
  }

  // Try the local fallback user ID
  if (localUserId && localUserId !== 'undefined' && localUserId !== null && localUserId !== '') {
    return localUserId;
  }

  return null;
};

/**
 * Debug helper to log user ID information
 */
export const debugUserId = (context: string, user: any, localUserId?: string | null): void => {
  const userId = getConsistentUserId(user);
  const syncUserId = getUserIdSync(user, localUserId);
  console.log(`[${context}] User ID resolution:`, {
    resolvedId: userId,
    syncResolvedId: syncUserId,
    localUserId,
    user: user,
    directId: user?.id,
    nestedId: user?.user?.id,
    email: user?.email,
    sub: user?.sub,
  });
};
