import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { getConsistentUserId, getUserIdSync, debugUserId, getUserIdWithFallbacks } from '../../utils/secureUserIdHelper';
import { supabase, quickHasSupabaseSessionToken } from '../../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from '../../components/ui/use-toast';
import { SingleFinanceStorage } from '../../lib/singleFinanceStorage';
import { teamMemberSchema, type TeamMemberData } from '../../lib/validation/dealSchemas';
import LanguageSelector from '../../components/auth/LanguageSelector';
import { Settings, Users, DollarSign, Plus, Trash2, Save, ArrowLeft, Globe } from 'lucide-react';

// Interface for team member
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: 'salesperson' | 'sales_manager';
  active: boolean;
}

// Interface for pay configuration
interface PayConfig {
  commissionRate: number;
  baseRate: number;
  bonusThresholds: {
    vscBonus: number;
    gapBonus: number;
    ppmBonus: number;
    totalThreshold: number;
  };
}

export default function SingleFinanceSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<'team' | 'pay' | 'language'>('team');
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  // Enhanced user ID resolution with immediate synchronous priority
  const getUserId = (): string | null => {
    // Strategy 1: Direct user object ID (highest priority - most reliable)
    if (user?.id) {
      console.log('[Settings] Found user ID from user context:', user.id);
      // Update cache immediately for consistency
      if (user.id !== resolvedUserId) {
        setResolvedUserId(user.id);
      }
      return user.id;
    }
    
    // Strategy 2: Use cached resolved user ID if available
    if (resolvedUserId) {
      console.log('[Settings] Using cached resolved user ID:', resolvedUserId);
      return resolvedUserId;
    }
    
    // Strategy 3: Try locally stored user ID
    if (localUserId) {
      console.log('[Settings] Using locally stored user ID:', localUserId);
      setResolvedUserId(localUserId);
      return localUserId;
    }
    
    // Strategy 4: Try secure user ID helper
    let userId = getConsistentUserId(user);
    if (userId) {
      console.log('[Settings] Found user ID from secure helper:', userId);
      setResolvedUserId(userId);
      return userId;
    }
    
    // Strategy 5: Try sync version with fallback
    userId = getUserIdSync(user, localUserId);
    if (userId) {
      console.log('[Settings] Found user ID from sync helper:', userId);
      setResolvedUserId(userId);
      return userId;
    }
    
    // Strategy 6: Direct localStorage access (synchronous)
    if (typeof window !== 'undefined') {
      try {
        const tokenKey = Object.keys(localStorage).find(key => 
          key.startsWith('sb-') && key.endsWith('-auth-token')
        );
        if (tokenKey) {
          const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
          userId = tokenData?.currentSession?.user?.id || tokenData?.user?.id;
          if (userId) {
            console.log('[Settings] Found user ID from localStorage token:', userId);
            setResolvedUserId(userId);
            return userId;
          }
        }
      } catch (error) {
        console.warn('[Settings] Error reading from localStorage:', error);
      }
    }
    
    // Strategy 7: Demo user ID from email (development/demo mode)
    if (user?.email) {
      userId = `demo_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      console.log('[Settings] Created demo user ID:', userId);
      setResolvedUserId(userId);
      return userId;
    }
    
    // Debug logging for troubleshooting
    debugUserId('SingleFinanceSettings', user, localUserId);
    console.log('[Settings] ALL STRATEGIES FAILED - No user ID found');
    console.log('[Settings] User object details:', {
      hasUser: !!user,
      userType: typeof user,
      userId: user?.id,
      userEmail: user?.email,
      localUserId,
      resolvedUserId: userId,
      cachedUserId: resolvedUserId
    });
    
    return null;
  };

  // Manual authentication refresh function
  const refreshAuthentication = async () => {
    try {
      console.log('[Settings] Manual auth refresh triggered');
      
      // Clear current state
      setLocalUserId(null);
      setResolvedUserId(null);
      
      // Try to get fresh session
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      
      if (data?.session?.user?.id) {
        setLocalUserId(data.session.user.id);
        setResolvedUserId(data.session.user.id);
        console.log('[Settings] Manual refresh successful:', data.session.user.id);
        toast({
          title: 'Success',
          description: 'Authentication refreshed successfully',
        });
      } else {
        throw new Error('No valid session found');
      }
    } catch (error) {
      console.error('[Settings] Manual refresh failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh authentication. Please sign out and sign back in.',
        variant: 'destructive',
      });
    }
  };

  // Enhanced user ID resolution with multiple fallback strategies
  useEffect(() => {
    let cancelled = false;
    
    const tryFetchUserId = async () => {
      console.log('[Settings] Attempting to resolve user ID...', {
        hasLocalUserId: !!localUserId,
        hasUserFromAuth: !!user?.id,
        userObject: user
      });
      
      // If we already have a user ID, don't fetch again
      if (localUserId || user?.id) return;
      
      try {
        // Try the async version of getUserId with fallbacks
        const asyncUserId = await getUserIdWithFallbacks(user, localUserId);
        if (!cancelled && asyncUserId) {
          console.log('[Settings] Async getUserId resolved:', asyncUserId);
          setLocalUserId(asyncUserId);
          setResolvedUserId(asyncUserId);
          return;
        }
        
        // Fallback to Supabase session check
        if (quickHasSupabaseSessionToken()) {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('[Settings] Error getting Supabase session:', error);
            return;
          }
          
          const uid = data?.session?.user?.id || null;
          console.log('[Settings] Supabase session user ID:', uid);
          if (!cancelled && uid) {
            setLocalUserId(uid);
            setResolvedUserId(uid);
          }
        }
        
        // Last resort: check localStorage directly
        if (!cancelled && typeof window !== 'undefined') {
          const tokenKey = Object.keys(localStorage).find(key => 
            key.startsWith('sb-') && key.endsWith('-auth-token')
          );
          if (tokenKey) {
            const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
            const storageUserId = tokenData?.currentSession?.user?.id || tokenData?.user?.id;
            if (storageUserId) {
              console.log('[Settings] Found user ID in localStorage:', storageUserId);
              setLocalUserId(storageUserId);
              setResolvedUserId(storageUserId);
            }
          }
        }
      } catch (error) {
        console.error('[Settings] Error in user ID resolution:', error);
      }
    };

    // Initial attempt
    tryFetchUserId();
    
    // Retry after delays to catch auth state changes
    const timeouts = [
      setTimeout(tryFetchUserId, 500),
      setTimeout(tryFetchUserId, 1500),
      setTimeout(tryFetchUserId, 3000),
    ];
    
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [user, localUserId]);

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    role: 'salesperson' as 'salesperson' | 'sales_manager',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [authDebugMode, setAuthDebugMode] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  // Immediate user ID resolution on component mount
  useEffect(() => {
    const immediateResolveUserId = async () => {
      try {
        console.log('[Settings] Immediate user ID resolution attempt');
        
        // Try all available methods immediately
        let userId = null;
        
        // Method 1: From user context
        if (user?.id) {
          userId = user.id;
          console.log('[Settings] Found user ID from context:', userId);
        }
        
        // Method 2: From Supabase session
        if (!userId) {
          try {
            const { data } = await supabase.auth.getSession();
            userId = data?.session?.user?.id || null;
            if (userId) {
              console.log('[Settings] Found user ID from Supabase session:', userId);
            }
          } catch (error) {
            console.warn('[Settings] Error getting Supabase session:', error);
          }
        }
        
        // Method 3: From localStorage
        if (!userId && typeof window !== 'undefined') {
          try {
            const tokenKey = Object.keys(localStorage).find(key => 
              key.startsWith('sb-') && key.endsWith('-auth-token')
            );
            if (tokenKey) {
              const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
              userId = tokenData?.currentSession?.user?.id || tokenData?.user?.id;
              if (userId) {
                console.log('[Settings] Found user ID from localStorage:', userId);
              }
            }
          } catch (error) {
            console.warn('[Settings] Error reading localStorage:', error);
          }
        }
        
        // Method 4: Demo user from email
        if (!userId && user?.email) {
          userId = `demo_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
          console.log('[Settings] Created demo user ID:', userId);
        }
        
        if (userId) {
          setLocalUserId(userId);
          setResolvedUserId(userId);
          console.log('[Settings] Immediate resolution successful:', userId);
        } else {
          console.warn('[Settings] Immediate resolution failed');
        }
      } catch (error) {
        console.error('[Settings] Error in immediate user ID resolution:', error);
      }
    };
    
    immediateResolveUserId();
  }, []); // Run only once on mount

  // Pay configuration state
  const [payConfig, setPayConfig] = useState<PayConfig>({
    commissionRate: 25,
    baseRate: 500,
    bonusThresholds: {
      vscBonus: 100,
      gapBonus: 50,
      ppmBonus: 75,
      totalThreshold: 15000,
    },
  });

  // Make user available globally for encryption layer
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      (window as any).__authUser = user;
      console.log('[Settings] Made user available globally for encryption');
    }
  }, [user]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const userId = getUserId();
    console.log('[Settings] Loading settings for user:', userId);
    console.log('[Settings] Full user object:', user);

    if (!userId) {
      console.log('[Settings] No userId, skipping load');
      return;
    }

    // Clear old format data to ensure clean state
    SingleFinanceStorage.clearOldFormatData();

    try {
      const storageKey = `singleFinanceTeamMembers_${userId}`;
      const rawData = localStorage.getItem(storageKey);
      console.log('[Settings] Raw localStorage data for key:', storageKey);
      console.log('[Settings] Raw data:', rawData);

      const savedTeamMembers = SingleFinanceStorage.getTeamMembers(userId);
      console.log('[Settings] Parsed team members:', savedTeamMembers);
      console.log('[Settings] Team member count:', savedTeamMembers.length);

      setTeamMembers(savedTeamMembers);

      const savedPayConfig = SingleFinanceStorage.getPayConfig(userId);
      if (savedPayConfig) {
        setPayConfig(savedPayConfig);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [user]);

  // Save team members to localStorage with enhanced verification and retry logic
  const saveTeamMembers = async (members: TeamMember[]) => {
    let userId = getUserId();
    console.log('[Settings] saveTeamMembers called with:', {
      userId,
      memberCount: members.length,
      members,
    });

    // Enhanced validation with retry mechanism
    if (!userId) {
      console.warn('[Settings] No userId found on first attempt, trying authentication refresh...');
      
      // Try to force resolve the user ID immediately
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          userId = data.session.user.id;
          setLocalUserId(userId);
          setResolvedUserId(userId);
          console.log('[Settings] Successfully resolved user ID via Supabase session:', userId);
        }
      } catch (error) {
        console.error('[Settings] Failed to resolve user ID via Supabase session:', error);
      }
      
      // Second attempt with all fallback methods
      if (!userId) {
        userId = getUserId();
        console.log('[Settings] Second getUserId attempt returned:', userId);
      }
      
      // Final validation
      if (!userId) {
        console.error('[Settings] CRITICAL: No userId found after all attempts, cannot save team members');
        console.error('[Settings] Debug info:', {
          user,
          localUserId,
          userType: typeof user,
          userKeys: user ? Object.keys(user) : [],
          hasSupabaseToken: quickHasSupabaseSessionToken(),
          resolvedUserId
        });
        
        toast({
          title: 'Authentication Error',
          description: 'Unable to resolve user identity after multiple attempts. Please refresh the page and try again.',
          variant: 'destructive',
        });
        
        return;
      }
    }

    try {
      const storageKey = `singleFinanceTeamMembers_${userId}`;
      console.log('[Settings] Saving to localStorage key:', storageKey);

      // Save to encrypted storage
      SingleFinanceStorage.setTeamMembers(userId, members);

      // Immediate verification - check if data was actually saved
      const verificationData = SingleFinanceStorage.getTeamMembers(userId);
      console.log('[Settings] Immediate verification - retrieved team members:', {
        saved: members.length,
        retrieved: verificationData.length,
        match: members.length === verificationData.length,
      });

      // Update component state only after successful save verification
      if (verificationData.length === members.length) {
        setTeamMembers(members);

        // Enhanced event dispatch with retry mechanism
        const dispatchEvent = () => {
          const event = new CustomEvent('teamMembersUpdated', {
            detail: {
              teamMembers: members,
              userId: userId,
              timestamp: new Date().toISOString(),
              source: 'SingleFinanceSettings',
            },
          });
          window.dispatchEvent(event);
          console.log('[Settings] teamMembersUpdated event dispatched:', {
            memberCount: members.length,
            userId,
            timestamp: new Date().toISOString(),
          });
        };

        // Dispatch immediately
        dispatchEvent();

        // Also dispatch after a small delay to catch any late listeners
        setTimeout(dispatchEvent, 100);

        console.log(
          '[Settings] Team members saved and verified successfully:',
          members.length,
          'members'
        );

        toast({
          title: 'Success',
          description: `Team members updated successfully (${members.length} total)`,
        });
      } else {
        throw new Error('Verification failed: saved data does not match expected data');
      }
    } catch (error) {
      console.error('[Settings] Error saving team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to save team members. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Save pay configuration to localStorage
  const savePayConfig = (config: PayConfig) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      SingleFinanceStorage.setPayConfig(userId, config);
      setPayConfig(config);
      toast({
        title: 'Success',
        description: 'Pay configuration saved successfully',
      });
    } catch (error) {
      console.error('Error saving pay configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pay configuration',
        variant: 'destructive',
      });
    }
  };

  // Add new team member
  const handleAddTeamMember = async () => {
    const userId = getUserId();
    console.log('[Settings] Add team member clicked:', { newMember, userId });
    console.log('[Settings] Full user object:', user);
    console.log('[Settings] Storage key will be:', `singleFinanceTeamMembers_${userId}`);

    // Validate using Zod schema
    const validationResult = teamMemberSchema.safeParse({
      firstName: newMember.firstName.trim(),
      lastName: newMember.lastName.trim(),
      role: newMember.role,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      setValidationErrors(errors);

      const firstError = validationResult.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    // Clear validation errors if validation passes
    setValidationErrors({});

    const firstName = newMember.firstName.trim();
    const lastName = newMember.lastName.trim();
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    const member: TeamMember = {
      id: `member_${Date.now()}`,
      firstName,
      lastName,
      initials,
      role: newMember.role,
      active: true,
    };

    const updatedMembers = [...teamMembers, member];
    console.log('[Settings] About to save team members:', updatedMembers);
    await saveTeamMembers(updatedMembers);

    // Reset form and clear validation errors
    setNewMember({
      firstName: '',
      lastName: '',
      role: 'salesperson',
    });
    setValidationErrors({});

    console.log('[Settings] Team member added successfully:', member);
    toast({
      title: t('common.success'),
      description: t('dashboard.settings.memberAdded', {
        firstName: member.firstName,
        lastName: member.lastName,
      }),
    });
  };

  // Remove team member
  const handleRemoveTeamMember = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (
      confirm(
        t('dashboard.settings.confirmRemove', {
          firstName: member?.firstName,
          lastName: member?.lastName,
        })
      )
    ) {
      const updatedMembers = teamMembers.filter(m => m.id !== memberId);
      await saveTeamMembers(updatedMembers);

      toast({
        title: t('common.success'),
        description: t('dashboard.settings.memberRemoved'),
      });
    }
  };

  // Toggle team member active status
  const handleToggleActive = async (memberId: string) => {
    const updatedMembers = teamMembers.map(member =>
      member.id === memberId ? { ...member, active: !member.active } : member
    );
    await saveTeamMembers(updatedMembers);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          onClick={() => navigate('/dashboard/single-finance')}
          className="mr-4 flex items-center bg-blue-500 text-white hover:bg-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('dashboard.settings.backToDashboard')}
        </Button>
        <h1 className="text-2xl font-bold">{t('dashboard.settings.title')}</h1>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>{t('dashboard.settings.note.title')}:</strong>{' '}
          {t('dashboard.settings.note.description')}
        </p>
      </div>

      {/* Authentication Debug Section */}
      {!getUserId() && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ Authentication Issue Detected
              </p>
              <p className="text-yellow-700 text-xs mt-1">
                Unable to resolve user ID. This may prevent saving team members.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshAuthentication}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Refresh Auth
              </Button>
              <Button
                onClick={() => setAuthDebugMode(!authDebugMode)}
                size="sm"
                variant="outline"
              >
                {authDebugMode ? 'Hide' : 'Show'} Debug
              </Button>
            </div>
          </div>
          
          {authDebugMode && (
            <div className="mt-3 p-3 bg-yellow-100 rounded text-xs">
              <pre className="text-yellow-800 overflow-auto">
                {JSON.stringify({
                  user: user ? {
                    id: user.id,
                    email: user.email,
                    type: typeof user,
                  } : null,
                  localUserId,
                  resolvedUserId: getUserId(),
                  hasSupabaseToken: quickHasSupabaseSessionToken(),
                  localStorage: typeof window !== 'undefined' ? 
                    Object.keys(localStorage).filter(k => k.includes('sb-')) : [],
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'team'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Users className="inline mr-2 h-4 w-4" />
          {t('dashboard.settings.teamManagement')}
        </button>
        <button
          onClick={() => setActiveTab('pay')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'pay'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <DollarSign className="inline mr-2 h-4 w-4" />
          {t('dashboard.settings.payConfiguration')}
        </button>
        <button
          onClick={() => setActiveTab('language')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'language'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Globe className="inline mr-2 h-4 w-4" />
          {t('dashboard.settings.languageSettings')}
        </button>
      </div>

      {/* Team Management Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Add New Team Member */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                {t('dashboard.settings.addNewMember')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('dashboard.settings.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={newMember.firstName}
                    onChange={e => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder={t('dashboard.settings.firstNamePlaceholder')}
                    className={validationErrors.firstName ? 'border-red-500' : ''}
                  />
                  {validationErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('dashboard.settings.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={newMember.lastName}
                    onChange={e => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder={t('dashboard.settings.lastNamePlaceholder')}
                    className={validationErrors.lastName ? 'border-red-500' : ''}
                  />
                  {validationErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('dashboard.settings.role')}</Label>
                  <select
                    id="role"
                    value={newMember.role}
                    onChange={e =>
                      setNewMember(prev => ({
                        ...prev,
                        role: e.target.value as 'salesperson' | 'sales_manager',
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="salesperson">{t('dashboard.settings.roles.salesperson')}</option>
                    <option value="sales_manager">
                      {t('dashboard.settings.roles.salesManager')}
                    </option>
                  </select>
                </div>
                <Button onClick={handleAddTeamMember} className="bg-green-500 hover:bg-green-600">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('dashboard.settings.addMember')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List - Separated by Role */}
          {teamMembers.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  {t('dashboard.settings.teamMembers')} (0)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  {t('dashboard.settings.noMembers')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Salespeople Section */}
              {teamMembers.filter(member => member.role === 'salesperson').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      {t('dashboard.settings.salespeople')} (
                      {teamMembers.filter(member => member.role === 'salesperson').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers
                        .filter(member => member.role === 'salesperson')
                        .map(member => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-medium">
                                {member.initials}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-sm text-blue-600">
                                  {t('dashboard.settings.roles.salesperson')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleActive(member.id)}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  member.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {member.active
                                  ? t('dashboard.settings.active')
                                  : t('dashboard.settings.inactive')}
                              </button>
                              <Button
                                onClick={() => handleRemoveTeamMember(member.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sales Managers Section */}
              {teamMembers.filter(member => member.role === 'sales_manager').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      {t('dashboard.settings.salesManagers')} (
                      {teamMembers.filter(member => member.role === 'sales_manager').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers
                        .filter(member => member.role === 'sales_manager')
                        .map(member => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-purple-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-medium">
                                {member.initials}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-sm text-purple-600">
                                  {t('dashboard.settings.roles.salesManager')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleActive(member.id)}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  member.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {member.active
                                  ? t('dashboard.settings.active')
                                  : t('dashboard.settings.inactive')}
                              </button>
                              <Button
                                onClick={() => handleRemoveTeamMember(member.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pay Configuration Tab */}
      {activeTab === 'pay' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                {t('dashboard.settings.commissionBasePay')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">{t('dashboard.settings.commissionRate')}</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={payConfig.commissionRate}
                    onChange={e =>
                      setPayConfig(prev => ({
                        ...prev,
                        commissionRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs text-gray-600">
                    {t('dashboard.settings.commissionRateDescription')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseRate">{t('dashboard.settings.baseRate')}</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    min="0"
                    step="50"
                    value={payConfig.baseRate}
                    onChange={e =>
                      setPayConfig(prev => ({
                        ...prev,
                        baseRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs text-gray-600">
                    {t('dashboard.settings.baseRateDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.settings.bonusThresholds')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vscBonus">{t('dashboard.settings.vscBonus')}</Label>
                  <Input
                    id="vscBonus"
                    type="number"
                    min="0"
                    step="25"
                    value={payConfig.bonusThresholds.vscBonus}
                    onChange={e =>
                      setPayConfig(prev => ({
                        ...prev,
                        bonusThresholds: {
                          ...prev.bonusThresholds,
                          vscBonus: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gapBonus">{t('dashboard.settings.gapBonus')}</Label>
                  <Input
                    id="gapBonus"
                    type="number"
                    min="0"
                    step="25"
                    value={payConfig.bonusThresholds.gapBonus}
                    onChange={e =>
                      setPayConfig(prev => ({
                        ...prev,
                        bonusThresholds: {
                          ...prev.bonusThresholds,
                          gapBonus: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ppmBonus">{t('dashboard.settings.ppmBonus')}</Label>
                  <Input
                    id="ppmBonus"
                    type="number"
                    min="0"
                    step="25"
                    value={payConfig.bonusThresholds.ppmBonus}
                    onChange={e =>
                      setPayConfig(prev => ({
                        ...prev,
                        bonusThresholds: {
                          ...prev.bonusThresholds,
                          ppmBonus: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalThreshold">{t('dashboard.settings.totalThreshold')}</Label>
                  <Input
                    id="totalThreshold"
                    type="number"
                    min="0"
                    step="1000"
                    value={payConfig.bonusThresholds.totalThreshold}
                    onChange={e =>
                      setPayConfig(prev => ({
                        ...prev,
                        bonusThresholds: {
                          ...prev.bonusThresholds,
                          totalThreshold: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                  <p className="text-xs text-gray-600">
                    {t('dashboard.settings.totalThresholdDescription')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => savePayConfig(payConfig)}
              className="bg-green-500 hover:bg-green-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {t('dashboard.settings.saveConfiguration')}
            </Button>
          </div>
        </div>
      )}

      {/* Language Settings Tab */}
      {activeTab === 'language' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                {t('dashboard.settings.languageSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentLanguage">{t('dashboard.settings.currentLanguage')}</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {language === 'en' && 'English'}
                    {language === 'es' && 'Español'}
                    {language === 'fr' && 'Français'}
                    {language === 'de' && 'Deutsch'}
                    {language === 'cs' && 'Čeština'}
                    {language === 'it' && 'Italiano'}
                    {language === 'pl' && 'Polski'}
                    {language === 'pt' && 'Português'}
                    {language === 'gr' && 'Ελληνικά'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="languageSelector">{t('dashboard.settings.selectLanguage')}</Label>
                  <div className="mt-2">
                    <LanguageSelector variant="form" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">{t('dashboard.settings.languageUpdated')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
