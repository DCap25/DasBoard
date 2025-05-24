import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Track role fetch attempts to prevent infinite loops
  const roleFetchAttemptsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
          setLoading(false);
          return;
        }

        console.log('AuthProvider: Initial session check:', { 
          hasSession: !!initialSession,
          userId: initialSession?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchUserRole(initialSession.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AuthProvider: Auth state changed:', { 
        event, 
        userId: currentSession?.user?.id,
        timestamp: new Date().toISOString()
      });

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        await fetchUserRole(currentSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserRole(userId: string) {
    // Track fetch attempts to prevent infinite loops
    if (!roleFetchAttemptsRef.current[userId]) {
      roleFetchAttemptsRef.current[userId] = 0;
    }
    
    // If we've tried too many times, don't keep trying
    if (roleFetchAttemptsRef.current[userId] >= 3) {
      console.warn(`AuthProvider: Too many role fetch attempts for user ${userId}, setting default role`);
      // Set a default role as fallback
      setRole('viewer');
      setLoading(false);
      return;
    }
    
    roleFetchAttemptsRef.current[userId]++;
    
    try {
      console.log(`AuthProvider: Fetching role for user ${userId}, attempt ${roleFetchAttemptsRef.current[userId]}`);
      
      // First try to get from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileData?.role) {
        console.log('AuthProvider: User role fetched from profiles:', {
          role: profileData.role,
          userId,
          timestamp: new Date().toISOString()
        });
        
        setRole(profileData.role);
        setLoading(false);
        return;
      }
      
      if (profileError) {
        console.warn('AuthProvider: Error fetching user role from profiles:', profileError);
        
        // Try to get from users table as fallback
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role_id')
          .eq('id', userId)
          .single();
          
        if (userData?.role_id) {
          // Get role name from roles table
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', userData.role_id)
            .single();
            
          if (roleData?.name) {
            console.log('AuthProvider: User role fetched from roles table:', {
              role: roleData.name,
              userId,
              timestamp: new Date().toISOString()
            });
            
            setRole(roleData.name);
            setLoading(false);
            return;
          }
          
          if (roleError) {
            console.warn('AuthProvider: Error fetching role name:', roleError);
          }
        }
        
        if (userError) {
          console.warn('AuthProvider: Error fetching user role from users table:', userError);
        }
      }
      
      // If we still don't have a role, provide a default as last resort
      console.warn('AuthProvider: Unable to determine user role, setting default');
      setRole('viewer');
    } catch (error) {
      console.error('AuthProvider: Error in fetchUserRole:', error);
      setRole('viewer'); // Default fallback
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in:', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        return { error };
      }

      console.log('AuthProvider: Sign in successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session,
        timestamp: new Date().toISOString()
      });

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) {
          await fetchUserRole(data.user.id);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign in:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Error signing out:', error);
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
      }
    } catch (error) {
      console.error('AuthProvider: Unexpected error during sign out:', error);
    }
  };

  const value = {
    user,
    session,
    role,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 