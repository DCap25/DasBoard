/**
 * Enhanced Dashboard Component for The DAS Board
 * 
 * PRODUCTION STABILITY: COMPREHENSIVE 500 ERROR PREVENTION POST-LOGIN
 * 
 * This dashboard component implements a bulletproof fallback system to prevent the common
 * "dashboard flash then redirect" issue that occurs when profiles queries return 500 errors
 * after successful login. The system ensures consistent behavior between local and production
 * environments while maintaining full functionality even during database maintenance.
 * 
 * 1. ROBUST PROFILE INTEGRATION:
 *    - Integrated with apiService robust profile functions (getUserProfileData, getUserRole)
 *    - Multi-layer fallback strategy: RPC → Direct Query → Cache → Safe Defaults
 *    - Automatic retry mechanisms with comprehensive error handling
 *    - Production-optimized query patterns with intelligent caching
 * 
 * 2. DASHBOARD FLASH PREVENTION:
 *    - Immediate cached role loading on mount to prevent initial flash
 *    - Robust profile query fallback when useAuth returns no role
 *    - Non-disruptive error messaging that doesn't break user experience
 *    - Safe default role (Viewer) when all fallback strategies fail
 * 
 * 3. COMPREHENSIVE 500 ERROR HANDLING:
 *    - Enhanced 500 error pattern detection (500, PGRST301, Internal Server Error)
 *    - Specific handling for profiles table 500 errors vs other auth errors
 *    - Graceful degradation with user-friendly messaging
 *    - Emergency fallback systems for unexpected errors
 * 
 * 4. PRODUCTION STABILITY FEATURES:
 *    - Local/Production consistency with same fallback logic
 *    - Network performance monitoring and error tracking
 *    - Cached role persistence (24-hour expiration) for offline resilience
 *    - Comprehensive logging for production debugging
 * 
 * 5. NON-DISRUPTIVE USER EXPERIENCE:
 *    - Shows "Service temporarily limited" instead of error messages
 *    - Maintains full dashboard functionality with cached data
 *    - Progressive enhancement - features work even with limited profile data
 *    - Clear visual indicators for cached vs live data (dev mode only)
 * 
 * 6. MULTI-STRATEGY FALLBACK SYSTEM:
 *    - Strategy 1: Robust profile RPC (handles database-level 500s)
 *    - Strategy 2: Direct profiles table query with enhanced error handling
 *    - Strategy 3: Cached role data from localStorage (up to 24 hours)
 *    - Strategy 4: Safe defaults (Viewer role) to prevent app crashes
 * 
 * 7. PRODUCTION MONITORING & DEBUGGING:
 *    - Network operation logging with performance metrics
 *    - Browser console diagnostics for production support
 *    - Comprehensive error tracking and categorization
 *    - Cache status monitoring and management utilities
 * 
 * 8. LOCAL/PROD CONSISTENCY GUARANTEES:
 *    - Same fallback logic in development and production
 *    - Consistent error handling across all environments
 *    - Predictable user experience regardless of backend issues
 *    - Environment-specific debugging while maintaining stable core functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { DealLogEditor } from '../components/manager/DealLogEditor';
import { ScheduleEditor } from '../components/manager/ScheduleEditor';
// Enhanced: Import robust profile functions for comprehensive 500 error handling
import { getUserProfileData, getUserRole } from '../lib/apiService';

// Enhanced: Types for cached role data and network logging
interface CachedRoleData {
  role: string;
  email: string;
  timestamp: number;
  source: 'database' | 'cache';
}

interface NetworkLogEntry {
  timestamp: number;
  operation: string;
  url?: string;
  method?: string;
  duration: number;
  success: boolean;
  error?: string;
  responseSize?: number;
  userAgent?: string;
}

// Enhanced: Network logging utility for Supabase calls
class SupabaseNetworkLogger {
  private static instance: SupabaseNetworkLogger;
  private logs: NetworkLogEntry[] = [];
  private maxLogs = 100;

  static getInstance(): SupabaseNetworkLogger {
    if (!SupabaseNetworkLogger.instance) {
      SupabaseNetworkLogger.instance = new SupabaseNetworkLogger();
    }
    return SupabaseNetworkLogger.instance;
  }

  // Enhanced: Log network operations with comprehensive details
  logOperation(operation: string, startTime: number, success: boolean, error?: any, url?: string, method?: string): void {
    try {
      const duration = Date.now() - startTime;
      const entry: NetworkLogEntry = {
        timestamp: Date.now(),
        operation,
        url,
        method,
        duration,
        success,
        error: error?.message || error?.toString(),
        userAgent: navigator.userAgent,
        responseSize: error?.response?.headers?.get('content-length') || undefined
      };

      this.logs.push(entry);
      
      // Keep only recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }

      // Enhanced: Detailed console logging for debugging
      const logLevel = success ? 'log' : (error?.status === 500 ? 'error' : 'warn');
      const emoji = success ? '✅' : (error?.status === 500 ? '🚨' : '⚠️');
      
      console[logLevel](`${emoji} [Supabase Network] ${operation}:`, {
        duration: `${duration}ms`,
        success,
        url: url || 'N/A',
        method: method || 'N/A',
        error: error?.message || 'None',
        timestamp: new Date(entry.timestamp).toISOString()
      });

      // Enhanced: Special logging for 500 errors
      if (error?.status === 500 || error?.message?.includes('500')) {
        console.error(`🚨 [500 Error] Supabase operation failed: ${operation}`);
        console.error(`🚨 [500 Error] This will cause dashboard flash followed by error`);
        console.error(`🚨 [500 Error] Error details:`, {
          message: error.message,
          code: error.code,
          status: error.status,
          details: error.details,
          hint: error.hint
        });
      }
    } catch (loggingError) {
      console.warn('[Network Logger] Failed to log operation:', loggingError);
    }
  }

  // Enhanced: Get recent logs for debugging
  getRecentLogs(count: number = 10): NetworkLogEntry[] {
    return this.logs.slice(-count);
  }

  // Enhanced: Get 500 error logs specifically
  get500Errors(): NetworkLogEntry[] {
    return this.logs.filter(log => !log.success && 
      (log.error?.includes('500') || log.error?.includes('Database')));
  }

  // Enhanced: Get network performance statistics
  getPerformanceStats(): { avgDuration: number; errorRate: number; total500Errors: number } {
    if (this.logs.length === 0) return { avgDuration: 0, errorRate: 0, total500Errors: 0 };
    
    const totalDuration = this.logs.reduce((sum, log) => sum + log.duration, 0);
    const errors = this.logs.filter(log => !log.success).length;
    const errors500 = this.get500Errors().length;
    
    return {
      avgDuration: Math.round(totalDuration / this.logs.length),
      errorRate: Math.round((errors / this.logs.length) * 100),
      total500Errors: errors500
    };
  }
}

// Enhanced: Role caching utility for fallback support
class RoleCacheManager {
  private static instance: RoleCacheManager;
  private cacheKey = 'dasboard_role_cache';
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): RoleCacheManager {
    if (!RoleCacheManager.instance) {
      RoleCacheManager.instance = new RoleCacheManager();
    }
    return RoleCacheManager.instance;
  }

  // Enhanced: Cache role data with timestamp and source tracking
  cacheRole(role: string, email: string, source: 'database' | 'cache' = 'database'): void {
    try {
      const cacheData: CachedRoleData = {
        role,
        email,
        timestamp: Date.now(),
        source
      };
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      
      console.log('📦 [Role Cache] Cached role data:', {
        role,
        email: `${email.substring(0, 3)}...`,
        source,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('📦 [Role Cache] Failed to cache role:', error);
    }
  }

  // Enhanced: Retrieve cached role with expiry check
  getCachedRole(userEmail?: string): CachedRoleData | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) {
        console.log('📦 [Role Cache] No cached role found');
        return null;
      }

      const cacheData: CachedRoleData = JSON.parse(cached);
      const now = Date.now();
      const isExpired = (now - cacheData.timestamp) > this.cacheExpiry;

      if (isExpired) {
        console.log('📦 [Role Cache] Cached role expired, removing...');
        this.clearCache();
        return null;
      }

      // Enhanced: Validate cached data matches current user
      if (userEmail && cacheData.email !== userEmail) {
        console.log('📦 [Role Cache] Cached role for different user, clearing...');
        this.clearCache();
        return null;
      }

      console.log('📦 [Role Cache] Retrieved cached role:', {
        role: cacheData.role,
        email: `${cacheData.email.substring(0, 3)}...`,
        age: `${Math.round((now - cacheData.timestamp) / 1000)}s`,
        source: cacheData.source
      });

      return cacheData;
    } catch (error) {
      console.warn('📦 [Role Cache] Failed to retrieve cached role:', error);
      this.clearCache();
      return null;
    }
  }

  // Enhanced: Clear cache
  clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('📦 [Role Cache] Cache cleared');
    } catch (error) {
      console.warn('📦 [Role Cache] Failed to clear cache:', error);
    }
  }

  // Enhanced: Get cache status for debugging
  getCacheStatus(): { hasCachedData: boolean; age?: number; email?: string } {
    const cached = this.getCachedRole();
    if (!cached) {
      return { hasCachedData: false };
    }
    
    return {
      hasCachedData: true,
      age: Date.now() - cached.timestamp,
      email: cached.email
    };
  }
}

// Enhanced Dashboard with comprehensive 500 error fallbacks and cached role support
const Dashboard = () => {
  // Enhanced 500 Error Handling: Get auth context with error states
  const { user, role: userRole, error: authError, loading: authLoading } = useAuth();
  
  // Enhanced 500 Error Handling: Local state for role display with cached fallbacks
  const [roleDisplayState, setRoleDisplayState] = useState<{
    displayRole: string;
    hasError: boolean;
    errorMessage: string | null;
    isLoading: boolean;
    isCached: boolean;
    lastSuccessfulFetch?: number;
  }>({
    displayRole: 'Loading...',
    hasError: false,
    errorMessage: null,
    isLoading: true,
    isCached: false
  });

  // Enhanced: Network logging and cache management instances
  const networkLogger = SupabaseNetworkLogger.getInstance();
  const roleCache = RoleCacheManager.getInstance();

  // Enhanced: Log network operation wrapper for Supabase calls
  const logNetworkOperation = useCallback((operation: string, startTime: number, success: boolean, error?: any) => {
    networkLogger.logOperation(operation, startTime, success, error);
  }, [networkLogger]);

  // Enhanced: Get cached role with fallback logic
  const getCachedRoleFallback = useCallback((userEmail?: string): string | null => {
    try {
      const cached = roleCache.getCachedRole(userEmail);
      if (cached) {
        console.log('🎯 [Dashboard] Using cached role as fallback:', cached.role);
        console.log('🎯 [Dashboard] This prevents dashboard flash after 500 error');
        return cached.role;
      }
      return null;
    } catch (error) {
      console.warn('🎯 [Dashboard] Failed to get cached role fallback:', error);
      return null;
    }
  }, [roleCache]);

  // Enhanced: Attempt to get role from cache immediately on mount to prevent flash
  useEffect(() => {
    if (user?.email && !userRole && !authLoading) {
      const startTime = Date.now();
      
      try {
        const cachedRole = getCachedRoleFallback(user.email);
        
        if (cachedRole) {
          // Enhanced: Use cached role immediately to prevent dashboard flash
          const formattedRole = cachedRole.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          setRoleDisplayState({
            displayRole: formattedRole,
            hasError: false,
            errorMessage: null,
            isLoading: false,
            isCached: true,
            lastSuccessfulFetch: Date.now()
          });
          
          logNetworkOperation('Dashboard_CachedRole_Fallback', startTime, true);
          
          console.log('🎯 [Dashboard] Prevented dashboard flash using cached role');
        }
      } catch (error) {
        logNetworkOperation('Dashboard_CachedRole_Fallback', startTime, false, error);
      }
    }
  }, [user?.email, userRole, authLoading, getCachedRoleFallback, logNetworkOperation]);

  // Enhanced 500 Error Handling with Robust Profile Integration: 
  // Comprehensive post-login fallback system to prevent dashboard flash/redirect on 500 errors
  useEffect(() => {
    const startTime = Date.now();
    
    // Enhanced logging for debugging 500 errors with network tracking
    console.log('[Dashboard] Auth state update:', {
      hasUser: !!user,
      userEmail: user?.email ? `${user.email.substring(0, 3)}...` : 'none',
      userRole: userRole || 'undefined',
      authError: authError?.message || 'none',
      authLoading: authLoading,
      cacheStatus: roleCache.getCacheStatus()
    });

    // Enhanced 500 Error Handling: Process role with comprehensive error handling and caching
    try {
      if (authLoading) {
        // Still loading authentication - don't update state if we have cached data
        if (!roleDisplayState.isCached) {
          setRoleDisplayState(prev => ({
            ...prev,
            displayRole: 'Loading...',
            hasError: false,
            errorMessage: null,
            isLoading: true
          }));
        }
        logNetworkOperation('Dashboard_Auth_Loading', startTime, true);
        return;
      }

      // Enhanced 500 Error Handling: Check for authentication errors (including 500s)
      if (authError) {
        console.error('[Dashboard] Auth error detected:', authError);
        logNetworkOperation('Dashboard_Auth_Error', startTime, false, authError);
        
        // Production Stability: Comprehensive 500 error pattern detection
        const error500Pattern = authError.message?.includes('500') || 
                               authError.message?.includes('Database') ||
                               authError.message?.includes('database') ||
                               authError.message?.includes('temporarily unavailable') ||
                               authError.message?.includes('fetch') ||
                               authError.message?.includes('Internal Server Error') ||
                               authError.message?.includes('PGRST301');
        
        if (error500Pattern) {
          console.error('[Dashboard] 500 error detected - attempting comprehensive fallback');
          console.error('🚨 [500 Prevention] Dashboard flash detected - using multi-layer fallback strategies');
          
          // Production Stability: Multi-layer fallback approach
          handleProfileError500Fallback(user, startTime);
        } else {
          // Non-500 auth error - try cached fallback but with different messaging
          handleNon500AuthError(user, authError, startTime);
        }
        return;
      }

      // Enhanced 500 Error Handling: No user authenticated
      if (!user) {
        setRoleDisplayState({
          displayRole: 'Not signed in',
          hasError: false,
          errorMessage: null,
          isLoading: false,
          isCached: false
        });
        logNetworkOperation('Dashboard_No_User', startTime, true);
        return;
      }

      // Enhanced 500 Error Handling: Handle successful role data with caching
      if (userRole) {
        handleSuccessfulRoleLoad(userRole, user, startTime);
      } else {
        // Production Stability: User exists but no role - likely 500 error during profiles fetch
        // This is the most common scenario causing dashboard flash after login
        console.warn('[Dashboard] User exists but no role - profiles fetch likely failed with 500');
        console.warn('🚨 [500 Prevention] Initiating robust profile query fallback to prevent flash');
        
        // Production Stability: Use robust profile functions as primary fallback
        handleMissingRoleWithRobustFallback(user, startTime);
      }
    } catch (error: any) {
      // Enhanced 500 Error Handling: Catch any errors in role processing with comprehensive fallback
      console.error('[Dashboard] Error processing role data:', error);
      logNetworkOperation('Dashboard_Processing_Error', startTime, false, error);
      
      // Production Stability: Emergency fallback with multiple strategies
      handleEmergencyRoleFallback(user, error, startTime);
    }
  }, [user, userRole, authError, authLoading, roleCache, getCachedRoleFallback, logNetworkOperation, roleDisplayState.isCached]);

  // Production Stability: Handle 500 errors with comprehensive fallback strategies
  const handleProfileError500Fallback = useCallback(async (currentUser: any, startTime: number) => {
    console.log('🔄 [500 Fallback] Starting comprehensive 500 error recovery process');
    
    // Strategy 1: Try robust profile functions first (new integration)
    if (currentUser?.id) {
      try {
        console.log('🔄 [500 Fallback] Attempting robust profile query as primary fallback');
        const profileResponse = await getUserRole(currentUser.id);
        
        if (profileResponse.success && profileResponse.data) {
          console.log('✅ [500 Fallback] Robust profile query succeeded - preventing dashboard failure');
          const { role, is_group_admin } = profileResponse.data;
          
          const formattedRole = role.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          // Cache successful result
          roleCache.cacheRole(role, currentUser.email, 'database');
          
          setRoleDisplayState({
            displayRole: formattedRole,
            hasError: false, // Success case - no error display needed
            errorMessage: null,
            isLoading: false,
            isCached: false,
            lastSuccessfulFetch: Date.now()
          });
          
          logNetworkOperation('Dashboard_Robust_Profile_Success', startTime, true);
          return; // Success - no need for further fallbacks
        }
      } catch (robustError) {
        console.warn('🔄 [500 Fallback] Robust profile query also failed:', robustError);
      }
    }
    
    // Strategy 2: Try cached role as secondary fallback
    const cachedRole = getCachedRoleFallback(currentUser?.email);
    
    if (cachedRole) {
      console.log('✅ [500 Fallback] Using cached role to prevent complete failure');
      
      const formattedRole = cachedRole.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setRoleDisplayState({
        displayRole: formattedRole,
        hasError: true,
        errorMessage: 'Profile data temporarily unavailable - using cached data. Some features may be limited.',
        isLoading: false,
        isCached: true,
        lastSuccessfulFetch: Date.now()
      });
    } else {
      // Strategy 3: Safe defaults with user-friendly messaging
      console.error('❌ [500 Fallback] No fallback available - using safe defaults');
      
      setRoleDisplayState({
        displayRole: 'Viewer', // Safe default role
        hasError: true,
        errorMessage: 'Profile temporarily unavailable due to server maintenance. Using safe defaults.',
        isLoading: false,
        isCached: false
      });
    }
    
    logNetworkOperation('Dashboard_500_Fallback_Complete', startTime, false);
  }, [getUserRole, roleCache, getCachedRoleFallback, logNetworkOperation]);

  // Production Stability: Handle non-500 auth errors with appropriate fallbacks
  const handleNon500AuthError = useCallback((currentUser: any, error: any, startTime: number) => {
    const cachedRole = getCachedRoleFallback(currentUser?.email);
    
    if (cachedRole) {
      const formattedRole = cachedRole.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setRoleDisplayState({
        displayRole: formattedRole,
        hasError: true,
        errorMessage: 'Authentication issue detected - using cached role data',
        isLoading: false,
        isCached: true
      });
    } else {
      setRoleDisplayState({
        displayRole: 'Error loading role',
        hasError: true,
        errorMessage: error.message || 'Unknown error',
        isLoading: false,
        isCached: false
      });
    }
    
    logNetworkOperation('Dashboard_Non500_Error', startTime, false, error);
  }, [getCachedRoleFallback, logNetworkOperation]);

  // Production Stability: Handle successful role loading with proper caching
  const handleSuccessfulRoleLoad = useCallback((role: string, currentUser: any, startTime: number) => {
    const formattedRole = role.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Cache successful role fetch for future 500 error fallbacks
    roleCache.cacheRole(role, currentUser.email, 'database');
    
    setRoleDisplayState({
      displayRole: formattedRole,
      hasError: false,
      errorMessage: null,
      isLoading: false,
      isCached: false,
      lastSuccessfulFetch: Date.now()
    });
    
    logNetworkOperation('Dashboard_Role_Success', startTime, true);
    console.log('✅ [Dashboard] Role loaded successfully and cached for future fallback');
  }, [roleCache, logNetworkOperation]);

  // Production Stability: Handle missing role with robust profile query fallback
  // This is the key function that prevents dashboard flash after login on 500 errors
  const handleMissingRoleWithRobustFallback = useCallback(async (currentUser: any, startTime: number) => {
    console.log('🔄 [Missing Role] Starting robust fallback for missing role after login');
    
    // Strategy 1: Use robust profile functions to get role data directly
    if (currentUser?.id) {
      try {
        const robustStartTime = Date.now();
        console.log('🔄 [Missing Role] Querying profiles with robust fallback functions');
        
        const profileResponse = await getUserProfileData(currentUser.id);
        
        if (profileResponse.success && profileResponse.data) {
          console.log('✅ [Missing Role] Robust profile query successful - dashboard flash prevented');
          const { role, is_group_admin } = profileResponse.data;
          
          const formattedRole = role.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          // Cache the successful result
          roleCache.cacheRole(role, currentUser.email, 'database');
          
          setRoleDisplayState({
            displayRole: formattedRole,
            hasError: false,
            errorMessage: null,
            isLoading: false,
            isCached: false,
            lastSuccessfulFetch: Date.now()
          });
          
          const robustDuration = Date.now() - robustStartTime;
          logNetworkOperation('Dashboard_Robust_Profile_Recovery', startTime, true);
          console.log(`✅ [Missing Role] Robust recovery successful in ${robustDuration}ms`);
          return; // Success - exit early
        } else {
          console.warn('🔄 [Missing Role] Robust profile query returned no data, trying cache fallback');
        }
      } catch (robustError) {
        console.warn('🔄 [Missing Role] Robust profile query failed:', robustError);
      }
    }
    
    // Strategy 2: Try cached role as secondary fallback
    const cachedRole = getCachedRoleFallback(currentUser.email);
    
    if (cachedRole) {
      console.log('✅ [Missing Role] Using cached role after robust query failure');
      
      const formattedRole = cachedRole.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setRoleDisplayState({
        displayRole: formattedRole,
        hasError: true,
        errorMessage: 'Profile temporarily unavailable - using recent data. Some features may be limited.',
        isLoading: false,
        isCached: true
      });
    } else {
      // Strategy 3: Safe defaults to prevent app crash
      console.warn('❌ [Missing Role] No fallback available - using safe defaults to prevent crash');
      console.warn('[User Message] Profile information temporarily unavailable. Dashboard functionality may be limited.');
      
      setRoleDisplayState({
        displayRole: 'Viewer', // Safe fallback role
        hasError: true,
        errorMessage: 'Profile temporarily unavailable. Using safe defaults until service is restored.',
        isLoading: false,
        isCached: false
      });
    }
    
    logNetworkOperation('Dashboard_Missing_Role_Handled', startTime, false, new Error('Role fetch failed, used comprehensive fallback'));
  }, [getUserProfileData, roleCache, getCachedRoleFallback, logNetworkOperation]);

  // Production Stability: Emergency fallback for any unexpected errors
  const handleEmergencyRoleFallback = useCallback((currentUser: any, error: any, startTime: number) => {
    console.error('🆘 [Emergency] Handling unexpected error in role processing');
    
    // Even in emergency, try cached role as last resort
    const cachedRole = getCachedRoleFallback(currentUser?.email);
    
    if (cachedRole) {
      console.log('🆘 [Emergency] Using cached role after processing error');
      
      const formattedRole = cachedRole.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setRoleDisplayState({
        displayRole: formattedRole,
        hasError: true,
        errorMessage: 'Error processing role - using cached data as fallback',
        isLoading: false,
        isCached: true
      });
    } else {
      setRoleDisplayState({
        displayRole: 'Viewer', // Safe default
        hasError: true,
        errorMessage: 'Role processing error - using safe defaults',
        isLoading: false,
        isCached: false
      });
    }
    
    logNetworkOperation('Dashboard_Emergency_Fallback', startTime, false, error);
  }, [getCachedRoleFallback, logNetworkOperation]);

  // Enhanced 500 Error Handling: Safe role display function with cached indicator (never throws)
  const getRoleDisplay = (): string => {
    try {
      const baseRole = roleDisplayState.displayRole;
      
      // Enhanced: Add cache indicator for debugging but keep UI clean
      if (roleDisplayState.isCached) {
        // Log cache usage but don't show in UI to preserve original functionality
        console.log('📦 [Dashboard UI] Displaying cached role to user:', baseRole);
      }
      
      return baseRole;
    } catch (error) {
      console.error('[Dashboard] Error in getRoleDisplay:', error);
      // Enhanced: Try cached fallback even in error case
      const cached = roleCache.getCachedRole(user?.email);
      return cached?.role?.replace(/_/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || 'Unknown';
    }
  };

  // Enhanced 500 Error Handling: Safe role error display function with cache status
  const getRoleErrorDisplay = (): JSX.Element | null => {
    try {
      if (!roleDisplayState.hasError || !roleDisplayState.errorMessage) {
        return null;
      }

      // Enhanced: Different styling for cached vs error states
      const textColor = roleDisplayState.isCached ? 'text-amber-600' : 'text-orange-600';
      const prefix = roleDisplayState.isCached ? '📦 ' : '⚠️ ';
      
      return (
        <p className={`text-xs ${textColor} mt-1`}>
          {prefix}{roleDisplayState.errorMessage}
        </p>
      );
    } catch (error) {
      console.error('[Dashboard] Error in getRoleErrorDisplay:', error);
      return (
        <p className="text-xs text-red-600 mt-1">
          ⚠️ Error displaying role status
        </p>
      );
    }
  };

  // Enhanced: Diagnostic information for debugging (available in console)
  const getDashboardDiagnostics = useCallback(() => {
    const networkStats = networkLogger.getPerformanceStats();
    const recent500Errors = networkLogger.get500Errors();
    const cacheStatus = roleCache.getCacheStatus();
    
    return {
      roleDisplayState,
      networkStats,
      recent500Errors: recent500Errors.slice(-5), // Last 5 500 errors
      cacheStatus,
      userInfo: {
        hasUser: !!user,
        userEmail: user?.email ? `${user.email.substring(0, 3)}...` : 'none',
        userRole: userRole || 'undefined'
      },
      authInfo: {
        authError: authError?.message || 'none',
        authLoading: authLoading
      }
    };
  }, [roleDisplayState, networkLogger, roleCache, user, userRole, authError, authLoading]);

  // Enhanced: Make diagnostics available in browser console for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.getDashboardDiagnostics = getDashboardDiagnostics;
      // @ts-ignore
      window.clearRoleCache = () => roleCache.clearCache();
      // @ts-ignore
      window.getSupabaseNetworkLogs = () => networkLogger.getRecentLogs(20);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 [Dashboard] Diagnostics available in console:');
        console.log('   getDashboardDiagnostics() - Get full diagnostic info');
        console.log('   clearRoleCache() - Clear cached role data');
        console.log('   getSupabaseNetworkLogs() - Get recent network logs');
      }
    }
  }, [getDashboardDiagnostics, roleCache, networkLogger]);

  return (
    <div className="container mx-auto px-4 py-4 sm:p-4">
      {' '}
      {/* Mobile-optimized padding */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {' '}
              {/* Stack on mobile, 2 cols on tablet */}
              <Card>
                <CardHeader>
                  <CardTitle>Welcome</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base">Hello, {user?.email}!</p>{' '}
                  {/* Responsive text size */}
                  {/* Production Stability: Safe role display with comprehensive fallbacks */}
                  <p className="mt-2 text-sm sm:text-base">Role: {getRoleDisplay()}</p>
                  {/* Production Stability: Non-disruptive messaging for 500 errors */}
                  {getRoleErrorDisplay()}
                  {/* Production Stability: Show service status when profiles fetch fails */}
                  {roleDisplayState.hasError && !roleDisplayState.isCached && (
                    <p className="text-xs text-blue-600 mt-1">
                      ℹ️ Service temporarily limited - full functionality will return shortly
                    </p>
                  )}
                  {/* Enhanced: Show cache indicator for debugging (only in development) */}
                  {process.env.NODE_ENV === 'development' && roleDisplayState.isCached && (
                    <p className="text-xs text-blue-500 mt-1 opacity-75">
                      📦 Using cached data (debug info)
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base">View and manage vehicle deals</p>{' '}
                  {/* Responsive text */}
                  <a
                    href="/dashboard/deals"
                    className="text-blue-500 hover:underline mt-2 inline-block p-2 sm:p-0 -m-2 sm:m-0"
                  >
                    Go to Deals
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base">View and manage salesperson schedule</p>{' '}
                  {/* Responsive text */}
                  <a
                    href="/dashboard/schedule"
                    className="text-blue-500 hover:underline mt-2 inline-block p-2 sm:p-0 -m-2 sm:m-0"
                  >
                    Go to Schedule
                  </a>
                </CardContent>
              </Card>
            </div>
          }
        />
        <Route path="/deals" element={<DealLogEditor />} />
        <Route path="/schedule" element={<ScheduleEditor />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
