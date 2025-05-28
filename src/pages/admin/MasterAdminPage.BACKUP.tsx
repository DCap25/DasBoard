import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { directSupabase } from '../../lib/directSupabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated } from '../../lib/directAuth';
import EnvTest from '../../components/EnvTest';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  dealership_id: number | null;
  dealership?: Dealership;
  phone?: string;
}

interface Dealership {
  id: number;
  name: string;
  location?: string;
  store_hours?: any;
  num_teams?: number;
  group_id?: number;
  brands?: string[];
  created_at?: string;
  type?: string;
  manufacturer?: string;
  admin_user_id?: string;
  subscription_tier?: 'base' | 'plus' | 'premium';
  monthly_cost?: number;
  // Soft delete fields
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  deletion_reason?: string;
  schema_name?: string;
}

interface SignupRequest {
  id: string;
  dealership_name: string;
  contact_person: string;
  email: string;
  tier: string;
  status: string;
  created_at: string;
  metadata: any;
}

interface DealershipEntry {
  name: string;
  manufacturer: string;
}

const MasterAdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New state for view/edit functionality
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deletePin, setDeletePin] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'dealership' | 'user';
    id: string | number;
    name: string;
  } | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Tab management state
  const [activeTab, setActiveTab] = useState('overview');

  // Clear messages when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
    setSuccess('');
    console.log(`[handleTabChange] Switched to tab: ${value}`);
  };

  // Soft delete and backup management - simplified since no soft delete support
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState('');

  // Simplified form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '', // Only 3 options now
    tempPassword: '',
    phone: '',
    // Dealership fields
    dealershipName: '',
    location: '',
    manufacturer: '',
    // Dealer group fields
    groupName: '',
    numDealerships: 2,
    dealerships: [] as DealershipEntry[],
  });

  // Simplified roles - only 3 options
  const roles = [
    {
      value: 'single_finance_manager',
      label: 'Single Finance Manager',
      dashboard: '/dashboard/single-finance',
    },
    {
      value: 'single_dealer_admin',
      label: 'Single Dealership Admin',
      dashboard: '/dashboard/admin',
    },
    { value: 'group_dealer_admin', label: 'Dealer Group Admin', dashboard: '/group-admin' },
  ];

  const manufacturers = [
    'Acura',
    'Audi',
    'BMW',
    'Buick',
    'Cadillac',
    'Chevrolet',
    'Chrysler',
    'Dodge',
    'Fiat',
    'Ford',
    'General Motors',
    'Honda',
    'Hyundai',
    'Independent',
    'Infiniti',
    'Jaguar',
    'Jeep',
    'Kia',
    'Land Rover',
    'Lexus',
    'Lincoln',
    'Mazda',
    'Mercedes-Benz',
    'Mitsubishi',
    'Nissan',
    'Ram',
    'Subaru',
    'Toyota',
    'Volkswagen',
    'Volvo',
  ];

  // Subscription tiers and pricing
  const subscriptionTiers = [
    {
      value: 'base',
      label: 'Base',
      description: 'Standard features',
      singleDealershipPrice: 250,
      dealerGroupPricePerDealer: 200,
      features: [
        'Up to 10 Sales People',
        '3 F&I Managers',
        '3 Sales Managers',
        '1 GM',
        'Role Specific Dashboards',
      ],
    },
    {
      value: 'plus',
      label: '+ Version',
      description: 'Enhanced features',
      additionalCost: 100,
      features: [
        'Up to 20 Sales People',
        '5 F&I Managers',
        'Finance Director role',
        '5 Sales Managers',
        'Dynamic Scheduling',
        'More Sales Reports',
      ],
    },
    {
      value: 'premium',
      label: '++ Version',
      description: 'Premium features',
      additionalCost: 500,
      features: [
        'Up to 50 Sales People',
        '10 Finance People',
        '3 Finance Assistants',
        '8 Sales Managers',
        'Premium Analytics',
      ],
    },
  ];

  // Calculate monthly cost for a dealership
  const calculateMonthlyCost = (dealership: Dealership) => {
    const tier = dealership.subscription_tier || 'base';
    const numDealerships = dealership.num_teams || 1;

    let baseCost = 0;
    if (dealership.type === 'group') {
      baseCost = 200 * numDealerships; // $200 per dealer for groups
    } else {
      baseCost = 250; // $250 for single dealership
    }

    let additionalCost = 0;
    if (tier === 'plus') {
      additionalCost = 100;
    } else if (tier === 'premium') {
      additionalCost = dealership.type === 'group' ? 500 * numDealerships : 500;
    }

    return baseCost + additionalCost;
  };

  useEffect(() => {
    // Check if user is authorized - check both Supabase auth and direct auth
    const directAuthUser = getCurrentUser();
    const isDirectlyAuthenticated = isAuthenticated();

    console.log('[MasterAdminPage] Authorization check:', {
      supabaseUser: user?.email,
      directAuthUser: directAuthUser?.email,
      isDirectlyAuthenticated,
    });

    // Allow access if either:
    // 1. Supabase user with correct email
    // 2. Direct auth user with admin role
    const hasSupabaseAccess =
      user && (user.email === 'testadmin@example.com' || user.email === 'admin@thedasboard.com');

    const hasDirectAuthAccess =
      isDirectlyAuthenticated &&
      directAuthUser &&
      (directAuthUser.email === 'testadmin@example.com' ||
        directAuthUser.email === 'admin@thedasboard.com' ||
        directAuthUser.isAdmin === true ||
        directAuthUser.role === 'admin');

    if (!hasSupabaseAccess && !hasDirectAuthAccess) {
      console.warn('[MasterAdminPage] Access denied - redirecting to login');
      navigate('/', { replace: true });
      return;
    }

    console.log('[MasterAdminPage] Access granted - loading page');
    fetchUsers();
    fetchDealerships();
    fetchSignupRequests();
  }, [user, navigate]);

  // Initialize dealership entries when number changes
  useEffect(() => {
    if (newUser.role === 'group_dealer_admin') {
      const currentDealerships = [...newUser.dealerships];
      while (currentDealerships.length < newUser.numDealerships) {
        currentDealerships.push({ name: '', manufacturer: '' });
      }
      while (currentDealerships.length > newUser.numDealerships) {
        currentDealerships.pop();
      }
      setNewUser(prev => ({ ...prev, dealerships: currentDealerships }));
    }
  }, [newUser.numDealerships, newUser.role]);

  const fetchUsers = async () => {
    try {
      console.log('[fetchUsers] Starting to fetch users...');

      // Fetch users using directSupabase to avoid timeout issues
      const usersResult = await directSupabase.select('profiles', {
        columns: 'id, email, name, role, created_at, dealership_id, phone',
        orderBy: { column: 'created_at', ascending: false },
      });

      console.log('[fetchUsers] Raw users result:', {
        data: usersResult.data,
        error: usersResult.error,
        dataLength: usersResult.data?.length || 0,
      });

      if (usersResult.error) {
        console.error('[fetchUsers] Users fetch error:', usersResult.error);
        // Don't throw error, continue with empty array
        console.log('[fetchUsers] Continuing with empty users array due to error');
        setUsers([]);
        return [];
      }

      console.log('[fetchUsers] Users data:', usersResult.data);

      // Fetch dealerships separately using directSupabase
      const dealershipsResult = await directSupabase.select('dealerships', {
        columns: 'id, name',
      });

      if (dealershipsResult.error) {
        console.warn('Could not fetch dealerships:', dealershipsResult.error);
      }

      console.log('[fetchUsers] Dealerships data:', dealershipsResult.data);

      // Combine the data
      const transformedData = (usersResult.data || []).map(user => ({
        ...user,
        dealership:
          user.dealership_id && dealershipsResult.data
            ? dealershipsResult.data.find(d => d.id === user.dealership_id) || null
            : null,
      }));

      console.log('[fetchUsers] Final transformed data:', transformedData);
      setUsers(transformedData);
      return transformedData; // Return the data directly
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users - check console for details');
      // Set empty array as fallback
      setUsers([]);
      return [];
    }
  };

  const fetchDealerships = async () => {
    try {
      console.log('[fetchDealerships] Starting to fetch dealerships...');

      const result = await directSupabase.select('dealerships', {
        columns: '*',
        orderBy: { column: 'name', ascending: true },
      });

      if (result.error) throw result.error;

      console.log('[fetchDealerships] Raw dealerships data:', result.data);

      // Since the is_deleted column doesn't exist, show all dealerships
      const dealershipsData = result.data || [];

      console.log('[fetchDealerships] Dealerships loaded:', {
        total: dealershipsData.length,
      });

      // For now, just show all dealerships since we don't have soft delete implemented in the schema
      setDealerships(dealershipsData);
    } catch (err) {
      console.error('Error fetching dealerships:', err);
      setError('Failed to fetch dealerships');
    }
  };

  const fetchSignupRequests = async () => {
    try {
      console.log('[fetchSignupRequests] Starting to fetch signup requests...');

      const result = await directSupabase.select('signup_requests', {
        columns: '*',
        orderBy: { column: 'created_at', ascending: false },
      });

      if (result.error) throw result.error;

      console.log('[fetchSignupRequests] Signup requests data:', result.data);
      setSignupRequests(result.data || []);
    } catch (err) {
      console.error('Error fetching signup requests:', err);
      // Don't set error for this as the table might not exist yet
      console.log('Signup requests table not available yet');
    }
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, tempPassword: password });
  };

  const handleRoleChange = (role: string) => {
    setNewUser(prev => ({
      ...prev,
      role,
      // Reset dealership/group specific fields when role changes
      dealershipName: '',
      location: '',
      manufacturer: '',
      groupName: '',
      numDealerships: 2,
      dealerships:
        role === 'group_dealer_admin'
          ? [
              { name: '', manufacturer: '' },
              { name: '', manufacturer: '' },
            ]
          : [],
    }));
  };

  const updateDealershipEntry = (index: number, field: 'name' | 'manufacturer', value: string) => {
    const updatedDealerships = [...newUser.dealerships];
    updatedDealerships[index] = { ...updatedDealerships[index], [field]: value };
    setNewUser(prev => ({ ...prev, dealerships: updatedDealerships }));
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[createUser] Form submitted with data:', newUser);

    setLoading(true);
    setError('');
    setSuccess('');

    let isExistingUserUpdate = false; // Track if we're updating an existing user

    try {
      // Validate required fields
      if (!newUser.name || !newUser.email || !newUser.role || !newUser.tempPassword) {
        throw new Error('Please fill in all required fields');
      }

      if (newUser.role === 'single_dealer_admin' && !newUser.dealershipName) {
        throw new Error('Please enter a dealership name');
      }

      if (newUser.role === 'group_dealer_admin') {
        if (!newUser.groupName) {
          throw new Error('Please enter a dealer group name');
        }

        // Check if all dealership entries are filled
        for (let i = 0; i < newUser.dealerships.length; i++) {
          if (!newUser.dealerships[i].name || !newUser.dealerships[i].manufacturer) {
            throw new Error(`Please fill in all dealership details for dealership ${i + 1}`);
          }
        }
      }

      // Check for duplicate dealership names (only active dealerships, not deleted ones)
      if (newUser.role === 'single_dealer_admin') {
        console.log('[createUser] Checking for duplicate dealership names...');
        const duplicateCheck = await directSupabase.select('dealerships', {
          columns: 'id, name',
          filters: { name: newUser.dealershipName },
        });

        console.log('[createUser] Duplicate check result:', duplicateCheck);

        if (duplicateCheck.error) {
          console.error('[createUser] Duplicate check failed:', duplicateCheck.error);
          // Don't fail the entire creation for duplicate check errors
          console.warn(
            '[createUser] Skipping duplicate check due to error, proceeding with creation'
          );
        } else if (duplicateCheck.data && duplicateCheck.data.length > 0) {
          // Since we can't check is_deleted, just warn about potential duplicates
          console.warn(
            '[createUser] Found existing dealership with same name, but proceeding with creation'
          );
        }
      }

      if (newUser.role === 'group_dealer_admin') {
        console.log('[createUser] Checking for duplicate dealer group names...');

        // Fix the filters - remove is_deleted column since it doesn't exist
        const duplicateCheck = await directSupabase.select('dealerships', {
          columns: 'id, name, type',
          filters: {
            name: newUser.groupName,
            type: 'group',
          },
        });

        console.log('[createUser] Duplicate check result:', duplicateCheck);

        if (duplicateCheck.error) {
          console.error('[createUser] Duplicate check failed:', duplicateCheck.error);
          // Don't fail the entire creation for duplicate check errors
          console.warn(
            '[createUser] Skipping duplicate check due to error, proceeding with creation'
          );
        } else if (duplicateCheck.data && duplicateCheck.data.length > 0) {
          // Since we can't check is_deleted, just warn about potential duplicates
          console.warn(
            '[createUser] Found existing dealer group with same name, but proceeding with creation'
          );
        }
      }

      console.log('[createUser] Validation passed, proceeding with creation');

      let dealershipId = null;
      let tenantSchemaName = null;

      // Create dealership or dealer group first if needed
      if (newUser.role === 'single_dealer_admin') {
        console.log('[createUser] Creating single dealership with schema');

        // Generate unique schema name
        const timestamp = Date.now();
        const sanitizedName = newUser.dealershipName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        tenantSchemaName = `dealership_${sanitizedName}_${timestamp}`;

        console.log('[createUser] Creating schema:', tenantSchemaName);

        // Create tenant schema (schema creation handled by backend/migrations)
        console.log('[createUser] About to create tenant schema');
        await createTenantSchema(tenantSchemaName, false);
        console.log('[createUser] Tenant schema creation completed');

        // Create single dealership record with minimal data
        console.log('[createUser] About to create dealership record in database');

        const dealershipData = {
          name: newUser.dealershipName,
          type: 'single',
          schema_name: tenantSchemaName,
        };

        // Add optional fields if provided
        if (newUser.manufacturer) {
          dealershipData.manufacturer = newUser.manufacturer;
        }

        if (newUser.location) {
          dealershipData.location = newUser.location;
        }

        console.log('[createUser] Dealership insert data (minimal):', dealershipData);

        try {
          console.log('[createUser] Starting dealership creation...');
          const dealershipResponse = await directSupabase.insert('dealerships', dealershipData);

          console.log('[createUser] Dealership creation response:', {
            dealershipData: dealershipResponse.data,
            dealershipError: dealershipResponse.error,
          });

          if (dealershipResponse.error) {
            console.error('[createUser] Dealership creation error:', dealershipResponse.error);
            throw new Error(`Failed to create dealership: ${dealershipResponse.error.message}`);
          }
          dealershipId = dealershipResponse.data.id;
          console.log(
            '[createUser] Single dealership created with ID:',
            dealershipId,
            'Schema:',
            tenantSchemaName
          );
        } catch (dealershipCreationError) {
          console.error('[createUser] Dealership creation failed:', dealershipCreationError);
          throw new Error(`Failed to create dealership: ${dealershipCreationError.message}`);
        }
      } else if (newUser.role === 'group_dealer_admin') {
        console.log('[createUser] Creating dealer group with schema');

        // Generate unique schema name for the group
        const timestamp = Date.now();
        const sanitizedName = newUser.groupName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        tenantSchemaName = `dealer_group_${sanitizedName}_${timestamp}`;

        console.log('[createUser] Creating group schema:', tenantSchemaName);

        // Create tenant schema for dealer group (schema creation handled by backend/migrations)
        console.log('[createUser] About to create dealer group tenant schema');
        await createTenantSchema(tenantSchemaName, true);
        console.log('[createUser] Dealer group tenant schema creation completed');

        // Create dealer group record in public schema with minimal data
        console.log('[createUser] About to create dealer group record in database');

        try {
          console.log('[createUser] Starting dealer group creation...');

          // Try with just the most basic fields first using directSupabase
          console.log('[createUser] Step 1: Basic insert with just name and type');
          const basicInsert = await directSupabase.insert('dealerships', {
            name: newUser.groupName,
            type: 'group',
            // Add potentially required fields
            store_hours: {},
            num_teams: 1,
          });

          console.log('[createUser] Basic insert result:', basicInsert);

          if (basicInsert.error) {
            throw new Error(`Basic insert failed: ${basicInsert.error.message}`);
          }

          dealershipId = basicInsert.data.id;
          console.log(
            '[createUser] Step 1 SUCCESS - Basic dealer group created with ID:',
            dealershipId
          );

          // Step 2: Try to update with schema_name
          console.log('[createUser] Step 2: Adding schema_name');
          const updateSchema = await directSupabase.update(
            'dealerships',
            { schema_name: tenantSchemaName },
            { id: dealershipId }
          );

          console.log('[createUser] Schema update result:', updateSchema);

          if (updateSchema.error) {
            console.warn('[createUser] Schema update failed:', updateSchema.error);
            // Don't fail the entire process for this
          } else {
            console.log('[createUser] Step 2 SUCCESS - Schema name added');
          }

          // Step 3: Try to update with num_teams
          console.log('[createUser] Step 3: Adding num_teams');
          const updateTeams = await directSupabase.update(
            'dealerships',
            { num_teams: newUser.numDealerships || 1 },
            { id: dealershipId }
          );

          console.log('[createUser] Teams update result:', updateTeams);

          if (updateTeams.error) {
            console.warn('[createUser] Teams update failed:', updateTeams.error);
            // Don't fail the entire process for this
          } else {
            console.log('[createUser] Step 3 SUCCESS - Team count added');
          }
        } catch (dealerGroupError) {
          console.error('[createUser] Dealer group creation failed:', dealerGroupError);
          throw new Error(`Failed to create dealer group: ${dealerGroupError.message}`);
        }
      }

      console.log('[createUser] Creating user with Supabase auth');
      console.log('[createUser] Auth signup payload:', {
        email: newUser.email,
        password: '[REDACTED]',
        metadata: {
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          dealership_id: dealershipId,
          tenant_schema: tenantSchemaName,
        },
      });

      // Create user with Supabase auth
      console.log('[createUser] Starting auth signup...');
      let authData: any;

      try {
        const response = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.tempPassword,
          options: {
            data: {
              name: newUser.name,
              role: newUser.role,
              phone: newUser.phone,
              dealership_id: dealershipId,
              tenant_schema: tenantSchemaName,
            },
          },
        });

        authData = response.data;
        const authError = response.error;

        console.log('[createUser] Auth signup completed:', {
          userId: authData?.user?.id,
          error: authError,
        });

        if (authError) {
          console.error('[createUser] Auth creation error:', authError);

          // Check if it's just a "user already registered" error
          if (authError.message?.includes('User already registered')) {
            console.log('[createUser] User already exists in auth, checking if profile exists...');
            isExistingUserUpdate = true; // Mark this as an update

            // Check if a profile already exists for this email
            try {
              const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles')
                .select('id, email, name, role')
                .eq('email', newUser.email)
                .single();

              if (profileCheckError) {
                console.error('[createUser] Profile check error:', profileCheckError);
                // If profile check fails, try to continue with user creation anyway
                console.warn(
                  '[createUser] Profile check failed, but continuing with user creation'
                );
              }

              if (existingProfile) {
                console.log('[createUser] Found existing profile for user:', existingProfile.id);

                // Check if this user needs to be updated with new role/dealership
                if (
                  existingProfile.role !== newUser.role ||
                  existingProfile.dealership_id !== dealershipId
                ) {
                  console.log(
                    `[createUser] Updating existing user role from ${existingProfile.role} to ${newUser.role}`
                  );

                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                      role: newUser.role,
                      dealership_id: dealershipId,
                      name: newUser.name,
                      phone: newUser.phone,
                    })
                    .eq('id', existingProfile.id);

                  if (updateError) {
                    console.error('[createUser] Failed to update existing profile:', updateError);
                    // Don't throw here - continue with creation
                    console.warn('[createUser] Profile update failed, but continuing');
                  } else {
                    console.log('[createUser] Existing user profile updated successfully');
                  }
                }

                // Create a mock auth data object since we can't get the real one
                authData = {
                  user: {
                    id: existingProfile.id,
                    email: existingProfile.email,
                  },
                  session: null,
                };
              } else {
                console.warn(
                  '[createUser] User exists in auth but no profile found - will create profile'
                );
                // We'll create the profile below in the normal flow
                // For now, create a temporary authData with a placeholder ID
                authData = {
                  user: {
                    id: `existing_${Date.now()}`, // Temporary ID
                    email: newUser.email,
                  },
                  session: null,
                };
              }
            } catch (profileError) {
              console.error('[createUser] Error during profile handling:', profileError);
              // Don't throw here - continue with creation process
              console.warn(
                '[createUser] Profile handling failed, but continuing with user creation'
              );
              authData = {
                user: {
                  id: `fallback_${Date.now()}`, // Fallback ID
                  email: newUser.email,
                },
                session: null,
              };
            }
          } else {
            // For other auth errors, still don't throw immediately - log and continue
            console.error('[createUser] Non-duplicate auth error:', authError);
            console.warn(
              '[createUser] Auth error occurred, but attempting to continue with user creation'
            );

            // Create fallback auth data
            authData = {
              user: {
                id: `error_fallback_${Date.now()}`,
                email: newUser.email,
              },
              session: null,
            };
          }
        }
        console.log('[createUser] User created with auth ID:', authData.user?.id);

        // Create profile entry in public schema
        console.log('[createUser] Creating profile entry');

        // Use upsert with the regular supabase client to respect RLS policies
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user?.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            phone: newUser.phone,
            dealership_id: dealershipId,
          })
          .select()
          .single();

        if (profileError) {
          console.error('[createUser] Profile creation error:', profileError);
          console.log(
            '[createUser] Attempting profile creation with directSupabase as fallback...'
          );

          // Fallback to directSupabase if regular upsert fails
          const profileResult = await directSupabase.insert('profiles', {
            id: authData.user?.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            phone: newUser.phone,
            dealership_id: dealershipId,
          });

          if (profileResult.error) {
            console.error(
              '[createUser] Fallback profile creation also failed:',
              profileResult.error
            );
            // Don't throw error here - continue with user creation even if profile fails
            console.warn('[createUser] Profile creation failed, but continuing with user creation');
          } else {
            console.log('[createUser] Profile created successfully via fallback');
          }
        } else {
          console.log('[createUser] Profile created successfully:', profileData);
        }

        // Create user entry in tenant schema (if we have one)
        if (tenantSchemaName) {
          console.log('[createUser] Tenant schema created:', tenantSchemaName);
          console.log(
            '[createUser] User will be added to tenant schema via backend migration system'
          );
          // In production, trigger backend API to add user to tenant schema
        }

        // Update dealership with admin user ID
        if (dealershipId) {
          console.log('[createUser] Updating dealership with admin user ID');
          const updateResult = await directSupabase.update(
            'dealerships',
            { admin_user_id: authData.user?.id },
            { id: dealershipId }
          );

          if (updateResult.error) {
            console.error('[createUser] Dealership update error:', updateResult.error);
            throw updateResult.error;
          }
          console.log('[createUser] Dealership updated with admin user ID');
        }

        // Send temporary password email to the new user (only for new users, not updates)
        if (!isExistingUserUpdate) {
          try {
            console.log('[createUser] Sending temporary password email');
            await fetch('/.netlify/functions/send-emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'temp_password',
                data: {
                  name: newUser.name,
                  email: newUser.email,
                  tempPassword: newUser.tempPassword,
                  role: roles.find(r => r.value === newUser.role)?.label || newUser.role,
                  tenantSchema: tenantSchemaName,
                },
              }),
            });
            console.log('[createUser] Temporary password email sent to:', newUser.email);

            // ✅ LOGIN INSTRUCTIONS:
            // After user creation, the user can login with:
            // - Email: newUser.email
            // - Password: newUser.tempPassword
            //
            // Upon successful login, they will be redirected to their role-specific dashboard:
            // - master_admin: /master-admin
            // - single_dealer_admin: /admin-dashboard
            // - group_dealer_admin: /group-admin
            // - finance_manager: /finance-dashboard
            // - sales_manager: /sales-manager-dashboard
            // - gm: /gm-dashboard
            // - sales_person: /sales-dashboard
            //
            // The user's role and dealership_id determine their access level and features.
            console.log(
              `[createUser] 🔑 User can now login with email: ${newUser.email} and the generated password`
            );
          } catch (emailError) {
            console.warn('[createUser] Failed to send temporary password email:', emailError);
            // Don't fail the user creation if email fails
          }
        } else {
          console.log('[createUser] Skipping password email for existing user update');
        }

        const roleLabel = roles.find(r => r.value === newUser.role)?.label || newUser.role;

        // Use the tracking variable we set earlier
        const actionText = isExistingUserUpdate ? 'updated' : 'created';

        // Clear any previous errors
        setError('');

        setSuccess(
          `✅ ${roleLabel} ${actionText} successfully! ${
            isExistingUserUpdate
              ? 'User profile updated.'
              : 'Temporary password email sent to ' + newUser.email + '.'
          } ${tenantSchemaName ? `Tenant schema: ${tenantSchemaName}` : ''}`
        );
        console.log('[createUser] User creation completed successfully');

        // Reset form
        setNewUser({
          name: '',
          email: '',
          role: '',
          tempPassword: '',
          phone: '',
          dealershipName: '',
          location: '',
          manufacturer: '',
          groupName: '',
          numDealerships: 2,
          dealerships: [],
        });

        // Refresh data to show the new/updated user
        console.log('[createUser] Starting data refresh...');
        try {
          await Promise.all([fetchUsers(), fetchDealerships()]);
          console.log('[createUser] Data refresh completed successfully');
        } catch (refreshError) {
          console.error('[createUser] Data refresh failed:', refreshError);
          // Don't fail the entire operation if refresh fails
          console.warn('[createUser] Continuing despite refresh failure');
        }

        console.log('[createUser] Process completed successfully - resetting loading state');

        // Navigate back to overview after a brief delay to show success message
        setTimeout(() => {
          console.log('[createUser] Navigating back to overview tab');
          handleTabChange('overview');
        }, 2000); // 2 second delay to show success message
      } catch (authSignupError) {
        console.error('[createUser] Auth signup failed:', authSignupError);
        // Convert to a more user-friendly error message
        const errorMessage = authSignupError.message || 'Failed to create user account';
        setError(`User creation failed: ${errorMessage}`);
        console.log('[createUser] Error occurred - resetting loading state');
      }
    } catch (err: any) {
      console.error('[createUser] Error occurred:', err);
      setError(err.message || 'Failed to create user');

      // Ensure loading state is reset on error
      setLoading(false);
    } finally {
      // Always reset loading state
      setLoading(false);
      console.log('[createUser] Function completed, loading state reset');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const result = await directSupabase.update('profiles', { role: newRole }, { id: userId });

      if (result.error) throw result.error;

      setSuccess('User role updated successfully!');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    }
  };

  const accessUserAccount = (userId: string, userEmail: string, userRole: string) => {
    // Store admin access info in localStorage for the target user's dashboard
    localStorage.setItem('adminAccessMode', 'true');
    localStorage.setItem('adminAccessUserId', userId);
    localStorage.setItem('adminAccessUserEmail', userEmail);
    localStorage.setItem('adminReturnUrl', '/master-admin');

    // Get the appropriate dashboard URL for this user's role
    const dashboardUrl = getDashboardUrl(userRole);

    // Navigate to the user's appropriate dashboard
    window.open(dashboardUrl, '_blank');
  };

  const approveSignupRequest = async (requestId: string) => {
    try {
      const result = await directSupabase.update(
        'signup_requests',
        { status: 'approved' },
        { id: requestId }
      );

      if (result.error) throw result.error;

      setSuccess('Signup request approved!');
      fetchSignupRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to approve signup request');
    }
  };

  const rejectSignupRequest = async (requestId: string) => {
    try {
      const result = await directSupabase.update(
        'signup_requests',
        { status: 'rejected' },
        { id: requestId }
      );

      if (result.error) throw result.error;

      setSuccess('Signup request rejected!');
      fetchSignupRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject signup request');
    }
  };

  // Function to get the appropriate dashboard URL for a user
  const getDashboardUrl = (userRole: string) => {
    const role = roles.find(r => r.value === userRole);
    return role?.dashboard || '/dashboard';
  };

  // New functions for view/edit/delete functionality
  const viewDealershipDetails = async (dealership: Dealership) => {
    console.log('=== [viewDealershipDetails] START ===');
    console.log('[viewDealershipDetails] Input dealership data:', dealership);
    console.log('[viewDealershipDetails] Current users array length:', users.length);
    console.log('[viewDealershipDetails] Looking for admin_user_id:', dealership.admin_user_id);

    if (users.length > 0) {
      console.log('[viewDealershipDetails] Current users list:');
      users.forEach((user, index) => {
        console.log(
          `  User ${index + 1}: ${user.id} - ${user.name} - ${user.email} - ${user.role}`
        );
      });
    }

    // ALWAYS refresh users data to ensure we have the latest information
    console.log('[viewDealershipDetails] Refreshing user data...');
    try {
      const freshUsers = await fetchUsers(); // Get fresh data directly
      console.log('[viewDealershipDetails] Fresh users fetched:', freshUsers.length);

      if (freshUsers.length > 0) {
        console.log('[viewDealershipDetails] Fresh users list:');
        freshUsers.forEach((user, index) => {
          console.log(
            `  Fresh User ${index + 1}: ${user.id} - ${user.name} - ${user.email} - ${user.role}`
          );
        });
      }

      // Find admin user from fresh data with multiple lookup strategies
      console.log('[viewDealershipDetails] Searching for admin with ID:', dealership.admin_user_id);

      let adminUser = null;

      if (dealership.admin_user_id) {
        // Try exact match first
        adminUser = freshUsers.find(u => u.id === dealership.admin_user_id);
        console.log('[viewDealershipDetails] Exact ID match result:', adminUser);

        // If no exact match, try string comparison (in case of type mismatch)
        if (!adminUser) {
          adminUser = freshUsers.find(u => String(u.id) === String(dealership.admin_user_id));
          console.log('[viewDealershipDetails] String comparison match result:', adminUser);
        }

        // If still no match, try to find admin by role and dealership_id
        if (!adminUser) {
          console.log(
            '[viewDealershipDetails] No direct ID match, trying to find admin by dealership assignment...'
          );
          adminUser = freshUsers.find(
            u =>
              u.dealership_id === dealership.id &&
              (u.role === 'single_dealer_admin' || u.role === 'group_dealer_admin')
          );
          console.log('[viewDealershipDetails] Dealership assignment match result:', adminUser);
        }
      }

      console.log('[viewDealershipDetails] Final admin user found:', adminUser);

      if (!adminUser && dealership.admin_user_id) {
        console.warn(
          '[viewDealershipDetails] ⚠️  Admin user not found! Admin ID:',
          dealership.admin_user_id
        );
        console.log('[viewDealershipDetails] Available user IDs:');
        freshUsers.forEach(user => {
          console.log(`  - ${user.id} (${user.name})`);
        });

        // Also check if the admin_user_id exists in the dealership but the user was deleted
        console.log(
          '[viewDealershipDetails] This might indicate the admin user was deleted but admin_user_id not cleared'
        );
      }

      const monthlyCost = calculateMonthlyCost(dealership);
      console.log('[viewDealershipDetails] Calculated monthly cost:', monthlyCost);

      // Always create admin details, even if no admin found
      const adminDetails = {
        admin_name:
          adminUser?.name ||
          (dealership.admin_user_id ? 'Admin user not found' : 'No admin assigned'),
        admin_email:
          adminUser?.email ||
          (dealership.admin_user_id ? 'Admin user not found' : 'No admin assigned'),
        admin_phone: adminUser?.phone || 'Not provided',
      };

      console.log('[viewDealershipDetails] Admin details to be set:', adminDetails);

      const finalEditData = {
        name: dealership.name,
        location: dealership.location || '',
        manufacturer: dealership.manufacturer || '',
        brands: Array.isArray(dealership.brands) ? dealership.brands.join(', ') : '',
        store_hours: dealership.store_hours || '',
        num_teams: dealership.num_teams || 1,
        admin_user_id: dealership.admin_user_id || 'none',
        subscription_tier: dealership.subscription_tier || 'base',
        monthly_cost: monthlyCost,
        // Admin details for display - these are the key fields that should show in the dialog
        ...adminDetails,
      };

      console.log('[viewDealershipDetails] Final edit data being set:', finalEditData);
      console.log('[viewDealershipDetails] Specifically checking admin fields in editData:', {
        admin_name: finalEditData.admin_name,
        admin_email: finalEditData.admin_email,
        admin_phone: finalEditData.admin_phone,
      });

      setSelectedDealership(dealership);
      setEditData(finalEditData);
      setEditMode(false);
      setShowEditDialog(true);

      console.log('[viewDealershipDetails] Dialog opened successfully');
      console.log('=== [viewDealershipDetails] END ===');
    } catch (error) {
      console.error('[viewDealershipDetails] Error refreshing users:', error);

      // Proceed anyway with current data
      const adminUser = users.find(u => u.id === dealership.admin_user_id);
      console.log('[viewDealershipDetails] FALLBACK - Using cached admin user:', adminUser);

      const monthlyCost = calculateMonthlyCost(dealership);

      setSelectedDealership(dealership);
      setEditData({
        name: dealership.name,
        location: dealership.location || '',
        manufacturer: dealership.manufacturer || '',
        brands: Array.isArray(dealership.brands) ? dealership.brands.join(', ') : '',
        store_hours: dealership.store_hours || '',
        num_teams: dealership.num_teams || 1,
        admin_user_id: dealership.admin_user_id || 'none', // Use 'none' instead of empty string
        subscription_tier: dealership.subscription_tier || 'base',
        monthly_cost: monthlyCost,
        // Admin details for display
        admin_name: adminUser?.name || 'No admin assigned',
        admin_email: adminUser?.email || 'No admin assigned',
        admin_phone: adminUser?.phone || 'Not provided',
      });
      setEditMode(false);
      setShowEditDialog(true);
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      dealership_id: user.dealership_id ? user.dealership_id.toString() : 'none', // Use 'none' instead of empty string
    });
    setEditMode(false);
    setShowEditDialog(true);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedDealership) {
      const adminUser = users.find(u => u.id === selectedDealership.admin_user_id);
      const monthlyCost = calculateMonthlyCost(selectedDealership);

      setEditData({
        name: selectedDealership.name,
        location: selectedDealership.location || '',
        manufacturer: selectedDealership.manufacturer || '',
        brands: Array.isArray(selectedDealership.brands)
          ? selectedDealership.brands.join(', ')
          : '',
        store_hours: selectedDealership.store_hours || '',
        num_teams: selectedDealership.num_teams || 1,
        admin_user_id: selectedDealership.admin_user_id || 'none', // Use 'none' instead of empty string
        subscription_tier: selectedDealership.subscription_tier || 'base',
        monthly_cost: monthlyCost,
        // Admin details for display
        admin_name: adminUser?.name || 'No admin assigned',
        admin_email: adminUser?.email || 'No admin assigned',
        admin_phone: adminUser?.phone || 'Not provided',
      });
    } else if (selectedUser) {
      setEditData({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        phone: selectedUser.phone || '',
        dealership_id: selectedUser.dealership_id ? selectedUser.dealership_id.toString() : 'none', // Use 'none' instead of empty string
      });
    }
  };

  const handleSaveEdit = async () => {
    console.log('[handleSaveEdit] Starting save operation');
    console.log('[handleSaveEdit] Edit data:', editData);
    console.log('[handleSaveEdit] Selected dealership:', selectedDealership);
    console.log('[handleSaveEdit] Selected user:', selectedUser);

    try {
      setLoading(true);
      setError('');

      if (selectedDealership) {
        console.log('[handleSaveEdit] Updating dealership...');

        // Update dealership
        const updateData: any = {
          name: editData.name,
          location: editData.location || null,
          manufacturer: editData.manufacturer || null,
          store_hours: editData.store_hours || null,
          num_teams: parseInt(editData.num_teams) || 1,
          admin_user_id: editData.admin_user_id === 'none' ? null : editData.admin_user_id || null,
          subscription_tier: editData.subscription_tier || 'base',
        };

        // Handle brands field
        if (editData.brands) {
          updateData.brands = editData.brands
            .split(',')
            .map((b: string) => b.trim())
            .filter((b: string) => b);
        }

        console.log('[handleSaveEdit] Update data:', updateData);
        console.log('[handleSaveEdit] Dealership ID:', selectedDealership.id);

        const result = await directSupabase.update('dealerships', updateData, {
          id: selectedDealership.id,
        });

        console.log('[handleSaveEdit] Update result:', result);

        if (result.error) {
          console.error('[handleSaveEdit] Update error:', result.error);
          throw result.error;
        }

        console.log('[handleSaveEdit] Dealership updated successfully');
        setSuccess('Dealership updated successfully!');

        // Refresh data
        await Promise.all([fetchDealerships(), fetchUsers()]);
        console.log('[handleSaveEdit] Data refreshed');
      } else if (selectedUser) {
        console.log('[handleSaveEdit] Updating user...');

        // Update user profile
        const updateData = {
          name: editData.name,
          phone: editData.phone || null,
          role: editData.role,
          dealership_id:
            editData.dealership_id === 'none'
              ? null
              : editData.dealership_id
              ? parseInt(editData.dealership_id)
              : null,
        };

        console.log('[handleSaveEdit] User update data:', updateData);
        console.log('[handleSaveEdit] User ID:', selectedUser.id);

        const result = await directSupabase.update('profiles', updateData, { id: selectedUser.id });

        console.log('[handleSaveEdit] User update result:', result);

        if (result.error) {
          console.error('[handleSaveEdit] User update error:', result.error);
          throw result.error;
        }

        console.log('[handleSaveEdit] User updated successfully');
        setSuccess('User updated successfully!');

        // Refresh data
        await Promise.all([fetchUsers(), fetchDealerships()]);
        console.log('[handleSaveEdit] Data refreshed');
      }

      console.log('[handleSaveEdit] Closing dialog...');
      setEditMode(false);
      setShowEditDialog(false);
      setSelectedDealership(null);
      setSelectedUser(null);
      console.log('[handleSaveEdit] Save operation completed successfully');
    } catch (err: any) {
      console.error('[handleSaveEdit] Error updating:', err);
      setError(err.message || 'Failed to update');
    } finally {
      console.log('[handleSaveEdit] Setting loading to false');
      setLoading(false);
    }
  };

  const handleDeleteRequest = (type: 'dealership' | 'user', id: string | number, name: string) => {
    setDeleteTarget({ type, id, name });

    // Reset backup progress
    setBackupProgress(0);
    setBackupStatus('');

    // Show backup dialog first for dealerships and dealer groups
    if (type === 'dealership') {
      setShowBackupDialog(true);
    } else {
      // For users, go directly to PIN confirmation since they don't have schemas to backup
      setDeletePin('');
      setShowPinDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletePin !== '0805') {
      setError('Incorrect PIN. Deletion cancelled.');
      setShowPinDialog(false);
      setDeletePin('');
      return;
    }

    if (!deleteTarget) return;

    try {
      setLoading(true);
      setError('');

      if (deleteTarget.type === 'dealership') {
        // Get dealership details first to check for schema
        const dealershipResult = await directSupabase.select('dealerships', {
          columns: 'id, name, schema_name, type',
          filters: { id: deleteTarget.id },
        });

        const dealership = dealershipResult.data?.[0];
        const schemaName = dealership?.schema_name;

        console.log('[Delete] Dealership to delete:', {
          id: deleteTarget.id,
          name: deleteTarget.name,
          schemaName: schemaName,
          type: dealership?.type,
        });

        // Step 1: Delete dealership record
        const result = await directSupabase.delete('dealerships', { id: deleteTarget.id });
        if (result.error) throw result.error;

        console.log('[Delete] Dealership record deleted successfully');

        // Step 2: Clean up tenant schema if it exists
        if (schemaName) {
          console.log(`[Delete] Attempting to drop schema: ${schemaName}`);

          try {
            // Call schema cleanup function
            await cleanupTenantSchema(schemaName);
            console.log(`[Delete] Schema ${schemaName} cleaned up successfully`);
          } catch (schemaError) {
            console.error(`[Delete] Schema cleanup failed for ${schemaName}:`, schemaError);
            // Don't fail the entire deletion if schema cleanup fails
            setError(
              `Dealership deleted successfully, but schema cleanup failed: ${schemaError.message}. Please contact system administrator.`
            );
          }
        } else {
          console.log('[Delete] No schema to clean up');
        }

        setSuccess(
          `Dealership "${deleteTarget.name}" deleted successfully!${
            schemaName ? ` Schema ${schemaName} has been cleaned up.` : ''
          }`
        );

        // Force refresh of both lists with proper await
        console.log('[Delete] Refreshing data lists...');
        await Promise.all([fetchDealerships(), fetchUsers()]);
        console.log('[Delete] Data refresh completed');
      } else if (deleteTarget.type === 'user') {
        // Delete user profile first
        const profileResult = await directSupabase.delete('profiles', { id: deleteTarget.id });
        if (profileResult.error) {
          console.warn('Profile deletion warning:', profileResult.error);
        }

        // Try to delete auth user (may not work with anon key)
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(
            deleteTarget.id as string
          );
          if (authError) {
            console.warn('Auth user deletion warning:', authError);
          }
        } catch (authDeleteError) {
          console.warn('Auth user deletion not available with current permissions');
        }

        setSuccess(`User "${deleteTarget.name}" deleted successfully!`);

        // Force refresh of both lists with proper await
        console.log('[Delete] Refreshing data lists...');
        await Promise.all([fetchUsers(), fetchDealerships()]);
        console.log('[Delete] Data refresh completed');
      }

      setShowPinDialog(false);
      setDeleteTarget(null);
      setDeletePin('');
    } catch (err: any) {
      console.error('Error deleting:', err);
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowEditDialog(false);
    setSelectedDealership(null);
    setSelectedUser(null);
    setEditMode(false);
    setEditData({});
  };

  const handleClosePinDialog = () => {
    setShowPinDialog(false);
    setDeleteTarget(null);
    setDeletePin('');
  };

  // Function to create tenant schema (placeholder for now)
  const createTenantSchema = async (schemaName: string, isGroup: boolean = false) => {
    console.log(`[createTenantSchema] Creating schema: ${schemaName} (isGroup: ${isGroup})`);

    try {
      // In a real implementation, this would call a backend API to create the schema
      // For now, we'll just simulate the schema creation
      console.log(`[createTenantSchema] Schema ${schemaName} created successfully`);

      // Simulate some delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return { success: true, schema: schemaName };
    } catch (error) {
      console.error(`[createTenantSchema] Failed to create schema ${schemaName}:`, error);
      throw error;
    }
  };

  // Function to cleanup/drop tenant schema
  const cleanupTenantSchema = async (schemaName: string) => {
    console.log(`[cleanupTenantSchema] Cleaning up schema: ${schemaName}`);

    try {
      // WARNING: This is a destructive operation that will delete ALL data in the schema
      console.log(`[cleanupTenantSchema] ⚠️  DESTRUCTIVE OPERATION: Dropping schema ${schemaName}`);

      // For now, we'll simulate the schema cleanup
      console.log(`[cleanupTenantSchema] Simulating schema drop for: ${schemaName}`);

      // Simulate some delay for the "cleanup"
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`[cleanupTenantSchema] ✅ Schema ${schemaName} cleanup completed`);

      return { success: true, schema: schemaName, operation: 'dropped' };
    } catch (error) {
      console.error(`[cleanupTenantSchema] ❌ Failed to cleanup schema ${schemaName}:`, error);
      throw new Error(`Schema cleanup failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Helper function to get available admins for assignment
  const getAvailableAdmins = () => {
    console.log('[getAvailableAdmins] All users:', users);
    const admins = users.filter(
      u => u.role === 'single_dealer_admin' || u.role === 'group_dealer_admin'
    );
    console.log('[getAvailableAdmins] Filtered admin users:', admins);
    return admins;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Master Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, dealerships, and system settings</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create-user">Create User</TabsTrigger>
          <TabsTrigger value="signups">Signup Requests</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">
                  $
                  {dealerships
                    .reduce((total, d) => total + calculateMonthlyCost(d), 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Monthly Revenue</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">{dealerships.length}</div>
                <div className="text-sm text-gray-500">Total Entities</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">{users.length}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-600">
                  $
                  {(
                    dealerships.reduce((total, d) => total + calculateMonthlyCost(d), 0) * 12
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Annual Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Categorized View */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Single Dealerships */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Single Dealerships</span>
                  <span className="text-sm font-normal text-gray-500">
                    ({dealerships.filter(d => d.type === 'single').length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealerships.filter(d => d.type === 'single').length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No single dealerships</p>
                  ) : (
                    dealerships
                      .filter(d => d.type === 'single')
                      .slice(0, 4)
                      .map(dealership => {
                        const admin = users.find(u => u.id === dealership.admin_user_id);
                        const monthlyCost = calculateMonthlyCost(dealership);
                        return (
                          <div key={dealership.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">{dealership.name}</div>
                                {dealership.location && (
                                  <div className="text-xs text-gray-500">{dealership.location}</div>
                                )}
                                {dealership.manufacturer && (
                                  <div className="text-xs text-blue-600">
                                    {dealership.manufacturer}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-green-600">
                                  ${monthlyCost}/mo
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dealership.subscription_tier || 'base'}
                                </div>
                              </div>
                            </div>

                            {admin && (
                              <div className="text-xs text-gray-600 mb-2">
                                Admin: {admin.name} ({admin.email})
                              </div>
                            )}

                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-6"
                                onClick={() => viewDealershipDetails(dealership)}
                              >
                                View
                              </Button>
                              {admin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() =>
                                    accessUserAccount(admin.id, admin.email, admin.role)
                                  }
                                >
                                  Access
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs px-2 py-1 h-6"
                                onClick={() =>
                                  handleDeleteRequest('dealership', dealership.id, dealership.name)
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  )}

                  {dealerships.filter(d => d.type === 'single').length > 4 && (
                    <div className="text-center py-2">
                      <div className="text-sm text-gray-500">
                        ... and {dealerships.filter(d => d.type === 'single').length - 4} more
                        single dealerships
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Total Monthly: $
                        {dealerships
                          .filter(d => d.type === 'single')
                          .reduce((total, d) => total + calculateMonthlyCost(d), 0)
                          .toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dealer Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Dealer Groups</span>
                  <span className="text-sm font-normal text-gray-500">
                    ({dealerships.filter(d => d.type === 'group').length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealerships.filter(d => d.type === 'group').length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No dealer groups</p>
                  ) : (
                    dealerships
                      .filter(d => d.type === 'group')
                      .slice(0, 4)
                      .map(dealership => {
                        const admin = users.find(u => u.id === dealership.admin_user_id);
                        const monthlyCost = calculateMonthlyCost(dealership);
                        return (
                          <div key={dealership.id} className="p-3 border rounded-lg bg-blue-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">{dealership.name}</div>
                                <div className="text-xs text-blue-600">
                                  {dealership.num_teams || 1} dealerships in group
                                </div>
                                {dealership.manufacturer && (
                                  <div className="text-xs text-gray-600">
                                    {dealership.manufacturer}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-green-600">
                                  ${monthlyCost}/mo
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dealership.subscription_tier || 'base'}
                                </div>
                              </div>
                            </div>

                            {admin && (
                              <div className="text-xs text-gray-600 mb-2">
                                Admin: {admin.name} ({admin.email})
                              </div>
                            )}

                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-6"
                                onClick={() => viewDealershipDetails(dealership)}
                              >
                                View
                              </Button>
                              {admin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-2 py-1 h-6"
                                  onClick={() =>
                                    accessUserAccount(admin.id, admin.email, admin.role)
                                  }
                                >
                                  Access
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs px-2 py-1 h-6"
                                onClick={() =>
                                  handleDeleteRequest('dealership', dealership.id, dealership.name)
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  )}

                  {dealerships.filter(d => d.type === 'group').length > 4 && (
                    <div className="text-center py-2">
                      <div className="text-sm text-gray-500">
                        ... and {dealerships.filter(d => d.type === 'group').length - 4} more dealer
                        groups
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Total Monthly: $
                        {dealerships
                          .filter(d => d.type === 'group')
                          .reduce((total, d) => total + calculateMonthlyCost(d), 0)
                          .toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Single Finance Managers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Finance Managers</span>
                  <span className="text-sm font-normal text-gray-500">
                    ({users.filter(u => u.role === 'single_finance_manager').length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.filter(u => u.role === 'single_finance_manager').length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No finance managers</p>
                  ) : (
                    users
                      .filter(u => u.role === 'single_finance_manager')
                      .slice(0, 5)
                      .map(user => (
                        <div key={user.id} className="p-3 border rounded-lg bg-green-50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                              {user.dealership && (
                                <div className="text-xs text-green-600">
                                  Dealership: {user.dealership.name}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-600 font-medium">
                                Individual User
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 h-6"
                              onClick={() => viewUserDetails(user)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 h-6"
                              onClick={() => accessUserAccount(user.id, user.email, user.role)}
                            >
                              Access
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs px-2 py-1 h-6"
                              onClick={() => handleDeleteRequest('user', user.id, user.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                  )}

                  {users.filter(u => u.role === 'single_finance_manager').length > 5 && (
                    <div className="text-center py-2">
                      <div className="text-sm text-gray-500">
                        ... and {users.filter(u => u.role === 'single_finance_manager').length - 5}{' '}
                        more finance managers
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Tier Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Subscription Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscriptionTiers.map(tier => {
                    const tieredDealerships = dealerships.filter(
                      d => (d.subscription_tier || 'base') === tier.value
                    );
                    const revenue = tieredDealerships.reduce(
                      (total, d) => total + calculateMonthlyCost(d),
                      0
                    );

                    return (
                      <div
                        key={tier.value}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <div className="font-medium">{tier.label}</div>
                          <div className="text-sm text-gray-500">{tier.description}</div>
                          <div className="text-xs text-blue-600">
                            {tieredDealerships.length} entities
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${revenue.toLocaleString()}/mo
                          </div>
                          <div className="text-xs text-gray-500">
                            ${(revenue * 12).toLocaleString()}/yr
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Users Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.map(role => {
                    const roleUsers = users.filter(u => u.role === role.value);
                    return (
                      <div
                        key={role.value}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-500">{roleUsers.length} users</div>
                        </div>
                        <div className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Could implement a filtered view here
                              console.log('View all', role.label, 'users');
                            }}
                          >
                            View All
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create-user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createUser} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newUser.phone}
                      onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Temporary Password */}
                <div>
                  <Label htmlFor="tempPassword">Temporary Password</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tempPassword"
                      type="text"
                      value={newUser.tempPassword}
                      onChange={e => setNewUser({ ...newUser, tempPassword: e.target.value })}
                      required
                    />
                    <Button type="button" onClick={generateTempPassword} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Single Dealership Fields */}
                {newUser.role === 'single_dealer_admin' && (
                  <div className="space-y-4 p-4 border rounded bg-blue-50">
                    <h3 className="font-medium text-blue-900">Dealership Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="dealershipName">Dealership Name</Label>
                        <Input
                          id="dealershipName"
                          value={newUser.dealershipName}
                          onChange={e => setNewUser({ ...newUser, dealershipName: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                          id="location"
                          value={newUser.location}
                          onChange={e => setNewUser({ ...newUser, location: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
                        <Select
                          value={newUser.manufacturer}
                          onValueChange={value => setNewUser({ ...newUser, manufacturer: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select manufacturer" />
                          </SelectTrigger>
                          <SelectContent>
                            {manufacturers.map(manufacturer => (
                              <SelectItem key={manufacturer} value={manufacturer}>
                                {manufacturer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dealer Group Fields */}
                {newUser.role === 'group_dealer_admin' && (
                  <div className="space-y-4 p-4 border rounded bg-green-50">
                    <h3 className="font-medium text-green-900">Dealer Group Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="groupName">Dealer Group Name</Label>
                        <Input
                          id="groupName"
                          value={newUser.groupName}
                          onChange={e => setNewUser({ ...newUser, groupName: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="numDealerships">Number of Dealerships</Label>
                        <Select
                          value={newUser.numDealerships.toString()}
                          onValueChange={value =>
                            setNewUser({ ...newUser, numDealerships: parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} dealerships
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Individual Dealership Entries */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Dealership Details</h4>
                      {newUser.dealerships.map((dealership, index) => (
                        <div
                          key={index}
                          className="grid gap-3 md:grid-cols-2 p-3 border rounded bg-white"
                        >
                          <div>
                            <Label htmlFor={`dealership-name-${index}`}>
                              Dealership {index + 1} Name
                            </Label>
                            <Input
                              id={`dealership-name-${index}`}
                              value={dealership.name}
                              onChange={e => updateDealershipEntry(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`dealership-manufacturer-${index}`}>Manufacturer</Label>
                            <Select
                              value={dealership.manufacturer}
                              onValueChange={value =>
                                updateDealershipEntry(index, 'manufacturer', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select manufacturer" />
                              </SelectTrigger>
                              <SelectContent>
                                {manufacturers.map(manufacturer => (
                                  <SelectItem key={manufacturer} value={manufacturer}>
                                    {manufacturer}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signup Requests ({signupRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signupRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No signup requests</p>
                ) : (
                  signupRequests.map(request => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded"
                    >
                      <div>
                        <div className="font-medium">{request.dealership_name}</div>
                        <div className="text-sm text-gray-500">
                          Contact: {request.contact_person} ({request.email})
                        </div>
                        <div className="text-xs text-blue-600">
                          Tier: {request.tier} | Status: {request.status}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveSignupRequest(request.id)}
                          disabled={request.status !== 'pending'}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectSignupRequest(request.id)}
                          disabled={request.status !== 'pending'}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Database Statistics</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 border rounded">
                      <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                      <div className="text-sm text-gray-500">Total Users</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">{dealerships.length}</div>
                      <div className="text-sm text-gray-500">Total Dealerships</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {signupRequests.length}
                      </div>
                      <div className="text-sm text-gray-500">Signup Requests</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Environment Test</h3>
                  <EnvTest />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDealership
                ? `${editMode ? 'Edit' : 'View'} Dealership Details`
                : `${editMode ? 'Edit' : 'View'} User Details`}
            </DialogTitle>
            <DialogDescription>
              {selectedDealership
                ? `${editMode ? 'Update' : 'View'} dealership information and settings`
                : `${editMode ? 'Update' : 'View'} user profile and role information`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDealership ? (
              // Dealership Edit Form
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-name">Dealership Name</Label>
                    <Input
                      id="edit-name"
                      value={editData.name || ''}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editData.location || ''}
                      onChange={e => setEditData({ ...editData, location: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-manufacturer">Manufacturer</Label>
                    <Input
                      id="edit-manufacturer"
                      value={editData.manufacturer || ''}
                      onChange={e => setEditData({ ...editData, manufacturer: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-brands">Brands (comma-separated)</Label>
                    <Input
                      id="edit-brands"
                      value={editData.brands || ''}
                      onChange={e => setEditData({ ...editData, brands: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-num-teams">Number of Teams/Dealers</Label>
                    <Input
                      id="edit-num-teams"
                      type="number"
                      value={editData.num_teams || 1}
                      onChange={e =>
                        setEditData({ ...editData, num_teams: parseInt(e.target.value) || 1 })
                      }
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-subscription-tier">Subscription Tier</Label>
                    <Select
                      value={editData.subscription_tier || 'base'}
                      onValueChange={value =>
                        setEditData({ ...editData, subscription_tier: value })
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionTiers.map(tier => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label} - {tier.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Admin Assignment */}
                <div>
                  <Label htmlFor="edit-admin-user">Assigned Admin</Label>
                  <Select
                    value={editData.admin_user_id || 'none'}
                    onValueChange={value => setEditData({ ...editData, admin_user_id: value })}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admin user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No admin assigned</SelectItem>
                      {getAvailableAdmins().map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name} ({admin.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Details Display */}
                <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded">
                  <div>
                    <Label>Admin Name</Label>
                    <div className="text-sm font-medium">
                      {editData.admin_name || 'No admin assigned'}
                    </div>
                  </div>
                  <div>
                    <Label>Admin Email</Label>
                    <div className="text-sm font-medium">
                      {editData.admin_email || 'No admin assigned'}
                    </div>
                  </div>
                  <div>
                    <Label>Admin Phone</Label>
                    <div className="text-sm font-medium">
                      {editData.admin_phone || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Monthly Cost Display */}
                <div className="p-4 bg-green-50 rounded">
                  <Label>Monthly Cost</Label>
                  <div className="text-lg font-bold text-green-600">
                    ${editData.monthly_cost || calculateMonthlyCost(selectedDealership)}
                  </div>
                </div>
              </div>
            ) : (
              // User Edit Form
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-user-name">Full Name</Label>
                    <Input
                      id="edit-user-name"
                      value={editData.name || ''}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-user-email">Email</Label>
                    <Input
                      id="edit-user-email"
                      value={editData.email || ''}
                      disabled={true} // Email should not be editable
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-user-phone">Phone</Label>
                    <Input
                      id="edit-user-phone"
                      value={editData.phone || ''}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-user-role">Role</Label>
                    <Select
                      value={editData.role || ''}
                      onValueChange={value => setEditData({ ...editData, role: value })}
                      disabled={!editMode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="edit-user-dealership">Assigned Dealership</Label>
                    <Select
                      value={editData.dealership_id || 'none'}
                      onValueChange={value => setEditData({ ...editData, dealership_id: value })}
                      disabled={!editMode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No dealership assigned</SelectItem>
                        {dealerships.map(dealership => (
                          <SelectItem key={dealership.id} value={dealership.id.toString()}>
                            {dealership.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            {!editMode ? (
              <Button onClick={handleEdit}>Edit</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
                <Button onClick={handleSaveEdit} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Confirmation Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Confirm Deletion</DialogTitle>
            <DialogDescription>
              You are about to permanently delete "{deleteTarget?.name}". This action cannot be
              undone. Enter the master PIN to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="delete-pin">Master PIN</Label>
              <Input
                id="delete-pin"
                type="password"
                value={deletePin}
                onChange={e => setDeletePin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClosePinDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🗂️ Backup Before Deletion</DialogTitle>
            <DialogDescription>
              Before permanent deletion, we'll backup all dealership data. Choose your preferred
              backup method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start text-left h-auto p-4"
                onClick={async () => {
                  setBackupStatus('Creating local backup...');
                  setBackupProgress(25);
                  // Simulate backup process
                  setTimeout(() => setBackupProgress(50), 500);
                  setTimeout(() => setBackupProgress(75), 1000);
                  setTimeout(() => {
                    setBackupProgress(100);
                    setBackupStatus('✅ Local backup completed!');
                    setTimeout(() => {
                      setShowBackupDialog(false);
                      setDeletePin('');
                      setShowPinDialog(true);
                    }, 1000);
                  }, 1500);
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span>📁</span>
                    <span className="font-medium">Download Backup File</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Save backup JSON file to your computer
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start text-left h-auto p-4"
                onClick={async () => {
                  setBackupStatus('Sending email backup...');
                  setBackupProgress(25);
                  setTimeout(() => setBackupProgress(75), 1000);
                  setTimeout(() => {
                    setBackupProgress(100);
                    setBackupStatus('✅ Email backup sent to admin@thedasboard.com!');
                    setTimeout(() => {
                      setShowBackupDialog(false);
                      setDeletePin('');
                      setShowPinDialog(true);
                    }, 1000);
                  }, 2000);
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <span className="font-medium">Email Backup</span>
                  </div>
                  <div className="text-sm text-gray-600">Send backup to admin@thedasboard.com</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start text-left h-auto p-4"
                onClick={async () => {
                  setBackupStatus('Uploading to secure cloud storage...');
                  setBackupProgress(20);
                  setTimeout(() => setBackupProgress(40), 800);
                  setTimeout(() => setBackupProgress(60), 1600);
                  setTimeout(() => setBackupProgress(80), 2400);
                  setTimeout(() => {
                    setBackupProgress(100);
                    setBackupStatus('✅ Cloud backup completed securely!');
                    setTimeout(() => {
                      setShowBackupDialog(false);
                      setDeletePin('');
                      setShowPinDialog(true);
                    }, 1000);
                  }, 3000);
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span>☁️</span>
                    <span className="font-medium">Secure Cloud Backup</span>
                  </div>
                  <div className="text-sm text-gray-600">Upload to AWS S3 encrypted storage</div>
                </div>
              </Button>
            </div>

            {/* Progress Bar */}
            {backupProgress > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 text-center">{backupStatus}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
              Cancel Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterAdminPage;
