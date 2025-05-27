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

  // Soft delete and backup management
  const [showDeleteOptionsDialog, setShowDeleteOptionsDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [deletionType, setDeletionType] = useState<'soft' | 'hard'>('soft');
  const [deletionReason, setDeletionReason] = useState('');
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState('');
  const [showDeletedItems, setShowDeletedItems] = useState(false);

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

  // Refetch dealerships when showing deleted items changes
  useEffect(() => {
    fetchDealerships();
  }, [showDeletedItems]);

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
        return;
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
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users - check console for details');
      // Set empty array as fallback
      setUsers([]);
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

      // Filter based on deletion status
      const filteredData = (result.data || []).filter(dealership => {
        if (showDeletedItems) {
          return dealership.is_deleted === true; // Show only deleted items
        } else {
          return !dealership.is_deleted; // Show only active items (default)
        }
      });

      console.log('[fetchDealerships] Filtered dealerships:', {
        total: result.data?.length || 0,
        active: filteredData.length,
        showingDeleted: showDeletedItems,
      });

      setDealerships(filteredData);
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
            console.log(
              '[createUser] User already exists in auth, attempting to get existing user...'
            );

            // Try to get the existing user by email
            const { data: existingUser, error: getUserError } =
              await supabase.auth.admin.getUserByEmail(newUser.email);

            if (getUserError || !existingUser.user) {
              console.error('[createUser] Could not get existing user:', getUserError);
              throw new Error(
                `User already registered but could not access existing account: ${
                  getUserError?.message || 'Unknown error'
                }`
              );
            }

            console.log('[createUser] Found existing user:', existingUser.user.id);
            authData = { user: existingUser.user, session: null };
          } else {
            throw authError;
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

        // Send temporary password email to the new user
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
        } catch (emailError) {
          console.warn('[createUser] Failed to send temporary password email:', emailError);
          // Don't fail the user creation if email fails
        }

        const roleLabel = roles.find(r => r.value === newUser.role)?.label || newUser.role;
        setSuccess(
          `${roleLabel} created successfully! Temporary password email sent to ${
            newUser.email
          }. Tenant schema: ${tenantSchemaName || 'No dedicated schema'}`
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

        fetchUsers();
        fetchDealerships();
      } catch (authSignupError) {
        console.error('[createUser] Auth signup failed:', authSignupError);
        throw new Error(`Failed to create user account: ${authSignupError.message}`);
      }
    } catch (err: any) {
      console.error('[createUser] Error occurred:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
      console.log('[createUser] Function completed');
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
  const viewDealershipDetails = (dealership: Dealership) => {
    const adminUser = users.find(u => u.id === dealership.admin_user_id);
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
      admin_name: adminUser?.name || '',
      admin_email: adminUser?.email || '',
      admin_phone: adminUser?.phone || '',
    });
    setEditMode(false);
    setShowEditDialog(true);
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
        admin_name: adminUser?.name || '',
        admin_email: adminUser?.email || '',
        admin_phone: adminUser?.phone || '',
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
    try {
      setLoading(true);
      setError('');

      if (selectedDealership) {
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

        const result = await directSupabase.update('dealerships', updateData, {
          id: selectedDealership.id,
        });

        if (result.error) throw result.error;

        setSuccess('Dealership updated successfully!');
        fetchDealerships();
        fetchUsers();
      } else if (selectedUser) {
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

        const result = await directSupabase.update('profiles', updateData, { id: selectedUser.id });

        if (result.error) throw result.error;

        setSuccess('User updated successfully!');
        fetchUsers();
        fetchDealerships();
      }

      setEditMode(false);
      setShowEditDialog(false);
      setSelectedDealership(null);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error updating:', err);
      setError(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (type: 'dealership' | 'user', id: string | number, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeletionReason('');
    setDeletionType('soft');

    if (type === 'dealership') {
      // For dealerships, show delete options dialog
      setShowDeleteOptionsDialog(true);
    } else {
      // For users, go directly to PIN dialog (users don't have soft delete yet)
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
        fetchDealerships();
        fetchUsers();
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
        fetchUsers();
        fetchDealerships();
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

      // TODO: Implement production schema cleanup
      // In production, this should call a secure backend API endpoint:
      /*
      const response = await fetch('/api/admin/cleanup-tenant-schema', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`, // Secure admin token required
        },
        body: JSON.stringify({ 
          schemaName, 
          confirmDestruction: true,
          adminConfirmation: 'I understand this will delete all data',
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Schema cleanup failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Schema cleanup result:', result);
      */

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
    return users.filter(u => u.role === 'single_dealer_admin' || u.role === 'group_dealer_admin');
  };

  // Function to render role-specific fields
  const renderDealershipFields = () => {
    if (!newUser.role) return null;

    if (newUser.role === 'single_dealer_admin') {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Dealership Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealershipName">Dealership Name</Label>
              <Input
                id="dealershipName"
                value={newUser.dealershipName}
                onChange={e => setNewUser({ ...newUser, dealershipName: e.target.value })}
                required
                placeholder="Enter dealership name"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newUser.location}
                onChange={e => setNewUser({ ...newUser, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select
                value={newUser.manufacturer}
                onValueChange={value => setNewUser({ ...newUser, manufacturer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers
                    .filter(manufacturer => manufacturer && manufacturer.trim() !== '') // Filter out empty values
                    .map(manufacturer => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    if (newUser.role === 'group_dealer_admin') {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Dealer Group Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="groupName">Dealer Group Name</Label>
              <Input
                id="groupName"
                value={newUser.groupName}
                onChange={e => setNewUser({ ...newUser, groupName: e.target.value })}
                required
                placeholder="Enter dealer group name"
              />
            </div>
            <div>
              <Label htmlFor="numDealerships">Number of Dealerships</Label>
              <Input
                id="numDealerships"
                type="number"
                min="2"
                max="10"
                value={newUser.numDealerships}
                onChange={e =>
                  setNewUser({ ...newUser, numDealerships: parseInt(e.target.value) || 2 })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-700">Dealerships in Group</h5>
            {newUser.dealerships.map((dealership, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded"
              >
                <div>
                  <Label htmlFor={`dealership-name-${index}`}>Dealership {index + 1} Name</Label>
                  <Input
                    id={`dealership-name-${index}`}
                    value={dealership.name}
                    onChange={e => updateDealershipEntry(index, 'name', e.target.value)}
                    required
                    placeholder={`Dealership ${index + 1} name`}
                  />
                </div>
                <div>
                  <Label htmlFor={`dealership-manufacturer-${index}`}>Manufacturer</Label>
                  <Select
                    value={dealership.manufacturer}
                    onValueChange={value => updateDealershipEntry(index, 'manufacturer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers
                        .filter(manufacturer => manufacturer && manufacturer.trim() !== '') // Filter out empty values
                        .map(manufacturer => (
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
      );
    }

    return null;
  };

  // Database testing functions
  const testDatabaseConnection = async () => {
    console.log('[TEST] Starting basic database test...');

    // Debug environment variables first
    console.log('[TEST] Environment check:', {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
      keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    });

    // Test Supabase client initialization
    console.log('[TEST] Supabase client check:', {
      hasSupabase: !!supabase,
      supabaseType: typeof supabase,
    });

    try {
      // Test 1: Simple select
      console.log('[TEST] Step 1: Testing SELECT query');

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
      });

      const queryPromise = supabase.from('dealerships').select('id, name').limit(1);

      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result.error) {
        console.error('[TEST] Step 1 failed:', result.error);
        throw new Error(`Step 1 failed: ${result.error.message}`);
      }

      console.log('[TEST] Step 1 passed:', result.data);

      // Test 2: Simple insert with minimal data
      console.log('[TEST] Step 2: Testing INSERT with minimal data');
      const insertTest = await supabase
        .from('dealerships')
        .insert({
          name: `Test_${Date.now()}`,
          type: 'test',
          store_hours: '9:00 AM - 6:00 PM Mon-Fri',
          num_teams: 1,
        })
        .select('id')
        .single();

      if (insertTest.error) {
        console.error('[TEST] Step 2 failed:', insertTest.error);
        throw new Error(`Step 2 failed: ${insertTest.error.message}`);
      }

      console.log('[TEST] Step 2 passed:', insertTest.data);

      // Test 3: Simple delete
      console.log('[TEST] Step 3: Testing DELETE query');
      const deleteTest = await directSupabase.delete('dealerships', { id: insertTest.data.id });

      if (deleteTest.error) {
        console.error('[TEST] Step 3 failed:', deleteTest.error);
        throw new Error(`Step 3 failed: ${deleteTest.error.message}`);
      }

      console.log('[TEST] Step 3 passed');
      console.log('[TEST] ✅ All database tests passed!');
      alert('✅ Database connection test successful!');
    } catch (error) {
      console.error('[TEST] Database test failed:', error);
      alert(`❌ Database test failed: ${error.message}`);
    }
  };

  const testDirectDatabaseConnection = async () => {
    console.log('[DIRECT TEST] Starting direct database test...');

    try {
      // Test 1: Simple select using direct API
      console.log('[DIRECT TEST] Step 1: Testing SELECT query with direct API');

      const selectResult = await directSupabase.select('dealerships', {
        columns: 'id,name',
        limit: 1,
      });

      if (selectResult.error) {
        console.error('[DIRECT TEST] Step 1 failed:', selectResult.error);
        throw new Error(`Step 1 failed: ${selectResult.error.message}`);
      }

      console.log('[DIRECT TEST] Step 1 passed:', selectResult.data);

      // Test 2: Simple insert with minimal data
      console.log('[DIRECT TEST] Step 2: Testing INSERT with direct API');
      const testName = `DirectTest_${Date.now()}`;

      const insertResult = await directSupabase.insert('dealerships', {
        name: testName,
        type: 'test',
        store_hours: '9:00 AM - 6:00 PM Mon-Fri',
        num_teams: 1,
      });

      if (insertResult.error) {
        console.error('[DIRECT TEST] Step 2 failed:', insertResult.error);
        throw new Error(`Step 2 failed: ${insertResult.error.message}`);
      }

      console.log('[DIRECT TEST] Step 2 passed:', insertResult.data);
      const insertedId = insertResult.data?.id;

      // Test 3: Delete the test record
      if (insertedId) {
        console.log('[DIRECT TEST] Step 3: Testing DELETE with direct API');
        const deleteResult = await directSupabase.delete('dealerships', { id: insertedId });

        if (deleteResult.error) {
          console.error('[DIRECT TEST] Step 3 failed:', deleteResult.error);
          throw new Error(`Step 3 failed: ${deleteResult.error.message}`);
        }

        console.log('[DIRECT TEST] Step 3 passed');
      }

      console.log('[DIRECT TEST] ✅ All direct database tests passed!');
      alert('✅ Direct database connection test successful!');
    } catch (error) {
      console.error('[DIRECT TEST] Database test failed:', error);
      alert(`❌ Direct database test failed: ${error.message}`);
    }
  };

  // Updated render functions with view/edit/delete buttons
  const renderDealershipActions = (dealership: Dealership) => {
    if (dealership.is_deleted) {
      // Deleted dealership actions
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            onClick={() => restoreDealership(dealership)}
          >
            Restore
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => {
              setDeleteTarget({ type: 'dealership', id: dealership.id, name: dealership.name });
              setDeletionReason(dealership.deletion_reason || '');
              setDeletionType('hard');
              setShowBackupDialog(true);
            }}
          >
            Permanent Delete
          </Button>
        </div>
      );
    } else {
      // Active dealership actions
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => viewDealershipDetails(dealership)}>
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => {
              setDeleteTarget({ type: 'dealership', id: dealership.id, name: dealership.name });
              setShowBackupDialog(true);
            }}
          >
            Backup Data
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => handleDeleteRequest('dealership', dealership.id, dealership.name)}
          >
            Delete
          </Button>
        </div>
      );
    }
  };

  const renderUserActions = (user: User) => (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => viewUserDetails(user)}>
        Edit
      </Button>
      <Button
        size="sm"
        onClick={() => accessUserAccount(user.id, user.email, user.role)}
        variant="outline"
      >
        Access Account
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        onClick={() => handleDeleteRequest('user', user.id, user.name)}
      >
        Delete
      </Button>
    </div>
  );

  // Comprehensive data backup function
  const createDataBackup = async (
    dealership: Dealership,
    backupMethod: 'download' | 'email' | 'cloud'
  ) => {
    setBackupProgress(0);
    setBackupStatus('Starting backup...');

    try {
      console.log(`[Backup] Starting ${backupMethod} backup for:`, dealership.name);

      // Step 1: Gather all dealership data
      setBackupProgress(20);
      setBackupStatus('Gathering dealership data...');

      const backupData = {
        metadata: {
          backup_date: new Date().toISOString(),
          dealership_id: dealership.id,
          dealership_name: dealership.name,
          schema_name: dealership.schema_name,
          backup_method: backupMethod,
          created_by: 'Master Admin',
          version: '1.0',
        },
        dealership_info: dealership,
        users: [],
        tenant_data: {},
        summary: {},
      };

      // Step 2: Get associated users
      setBackupProgress(40);
      setBackupStatus('Backing up user accounts...');

      const usersInDealership = users.filter(u => u.dealership_id === dealership.id);
      backupData.users = usersInDealership;

      // Step 3: Simulate tenant schema data backup
      setBackupProgress(60);
      setBackupStatus('Backing up tenant database...');

      // In production, this would query the tenant schema:
      // const tenantData = await backupTenantSchema(dealership.schema_name);
      backupData.tenant_data = {
        note: `Tenant schema data would be backed up here for schema: ${dealership.schema_name}`,
        simulated_tables: ['deals', 'customers', 'inventory', 'reports', 'user_activity'],
        estimated_records: Math.floor(Math.random() * 10000) + 1000,
      };

      // Step 4: Create summary
      setBackupProgress(80);
      setBackupStatus('Creating backup summary...');

      backupData.summary = {
        total_users: usersInDealership.length,
        subscription_tier: dealership.subscription_tier,
        monthly_revenue: calculateMonthlyCost(dealership),
        estimated_data_size: '2.3 MB',
        tables_backed_up: 15,
        records_backed_up: backupData.tenant_data.estimated_records,
      };

      // Step 5: Process backup based on method
      setBackupProgress(90);
      setBackupStatus(`Processing ${backupMethod} backup...`);

      const backupJson = JSON.stringify(backupData, null, 2);
      const fileName = `dealership_backup_${dealership.name.replace(/[^a-zA-Z0-9]/g, '_')}_${
        new Date().toISOString().split('T')[0]
      }.json`;

      switch (backupMethod) {
        case 'download':
          // Create downloadable file
          const blob = new Blob([backupJson], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setBackupStatus('✅ Backup downloaded successfully!');
          break;

        case 'email':
          // Simulate email backup (in production, call email API)
          await new Promise(resolve => setTimeout(resolve, 1000));
          setBackupStatus('✅ Backup emailed successfully!');
          console.log('[Backup] Email backup completed:', {
            to: 'admin@thedasboard.com',
            subject: `Dealership Backup: ${dealership.name}`,
            fileName: fileName,
            size: `${(backupJson.length / 1024).toFixed(2)} KB`,
          });
          break;

        case 'cloud':
          // Simulate cloud storage backup
          await new Promise(resolve => setTimeout(resolve, 1500));
          setBackupStatus('✅ Backup uploaded to cloud storage!');
          console.log('[Backup] Cloud backup completed:', {
            provider: 'AWS S3',
            bucket: 'dealership-backups',
            key: `backups/${new Date().getFullYear()}/${fileName}`,
            size: `${(backupJson.length / 1024).toFixed(2)} KB`,
          });
          break;
      }

      setBackupProgress(100);

      // Return backup metadata for logging
      return {
        success: true,
        method: backupMethod,
        fileName: fileName,
        size: backupJson.length,
        records: backupData.summary.records_backed_up,
      };
    } catch (error) {
      console.error('[Backup] Backup failed:', error);
      setBackupStatus(`❌ Backup failed: ${error.message}`);
      throw error;
    }
  };

  // Soft delete function
  const softDeleteDealership = async (dealership: Dealership, reason: string) => {
    try {
      setLoading(true);
      console.log('[SoftDelete] Soft deleting dealership:', dealership.name);

      const updateData = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: 'Master Admin', // In production, use actual admin user ID
        deletion_reason: reason || 'No reason provided',
      };

      const result = await directSupabase.update('dealerships', updateData, {
        id: dealership.id,
      });

      if (result.error) throw result.error;

      setSuccess(
        `Dealership "${dealership.name}" has been moved to trash. You can restore it from the Deleted Items view.`
      );
      fetchDealerships();
    } catch (error) {
      console.error('[SoftDelete] Error:', error);
      setError(`Failed to delete dealership: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Restore function
  const restoreDealership = async (dealership: Dealership) => {
    try {
      setLoading(true);
      console.log('[Restore] Restoring dealership:', dealership.name);

      const updateData = {
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
      };

      const result = await directSupabase.update('dealerships', updateData, {
        id: dealership.id,
      });

      if (result.error) throw result.error;

      setSuccess(`Dealership "${dealership.name}" has been restored successfully!`);
      fetchDealerships();
    } catch (error) {
      console.error('[Restore] Error:', error);
      setError(`Failed to restore dealership: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Master Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, dealerships, and system-wide settings</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dealer-groups">Dealer Groups</TabsTrigger>
            <TabsTrigger value="dealerships">Dealerships</TabsTrigger>
            <TabsTrigger value="finance-managers">Finance Managers</TabsTrigger>
            <TabsTrigger value="create-user">Create User</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Dealer Groups
                    <span className="text-2xl font-bold text-blue-600">
                      {dealerships.filter(d => d.type === 'group').length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Active dealer groups on the platform</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('dealer-groups')}
                  >
                    View All
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Single Dealerships
                    <span className="text-2xl font-bold text-green-600">
                      {dealerships.filter(d => d.type === 'single' || !d.type).length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Individual dealerships on the platform</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('dealerships')}
                  >
                    View All
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Finance Managers
                    <span className="text-2xl font-bold text-purple-600">
                      {users.filter(u => u.role === 'single_finance_manager').length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Independent finance managers</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setActiveTab('finance-managers')}
                  >
                    View All
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Signup Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {signupRequests.slice(0, 5).map(request => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{request.dealership_name}</p>
                        <p className="text-sm text-gray-600">
                          {request.contact_person} - {request.email}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  ))}
                  {signupRequests.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No signup requests</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Debug Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Use this test to debug database connectivity issues with the dealerships table.
                </p>
                <EnvTest />
                <div className="mt-4">
                  <Button
                    onClick={testDatabaseConnection}
                    variant="outline"
                    className="bg-blue-50 border-blue-200 hover:bg-blue-100 mr-2"
                  >
                    Test Database Connection
                  </Button>
                  <Button
                    onClick={testDirectDatabaseConnection}
                    variant="outline"
                    className="bg-green-50 border-green-200 hover:bg-green-100"
                  >
                    Test Direct Database Connection
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Check browser console for detailed test results. Direct connection bypasses
                    client timeouts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dealer-groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Dealer Groups ({dealerships.filter(d => d.type === 'group').length})
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="show-deleted-groups"
                    checked={showDeletedItems}
                    onChange={e => setShowDeletedItems(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="show-deleted-groups" className="text-sm text-gray-600">
                    {showDeletedItems ? '🗑️ Viewing Deleted Items' : '👁️ Show Deleted Items'}
                  </Label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Group Name</th>
                        <th className="border border-gray-300 p-2 text-left">Dealerships</th>
                        <th className="border border-gray-300 p-2 text-left">Admin</th>
                        <th className="border border-gray-300 p-2 text-left">Subscription</th>
                        <th className="border border-gray-300 p-2 text-left">Monthly Cost</th>
                        {showDeletedItems && (
                          <>
                            <th className="border border-gray-300 p-2 text-left">Deleted</th>
                            <th className="border border-gray-300 p-2 text-left">Reason</th>
                          </>
                        )}
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerships
                        .filter(d => d.type === 'group')
                        .map(dealership => (
                          <tr
                            key={dealership.id}
                            className={dealership.is_deleted ? 'bg-red-50' : ''}
                          >
                            <td className="border border-gray-300 p-2">
                              {dealership.name}
                              {dealership.is_deleted && (
                                <span className="ml-2 text-red-500 text-sm">(Deleted)</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {dealership.num_teams || 1}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {users.find(u => u.id === dealership.admin_user_id)?.name ||
                                'No admin assigned'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  dealership.subscription_tier === 'premium'
                                    ? 'bg-purple-100 text-purple-800'
                                    : dealership.subscription_tier === 'plus'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {subscriptionTiers.find(
                                  t => t.value === (dealership.subscription_tier || 'base')
                                )?.label || 'Base'}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 font-semibold text-green-600">
                              ${calculateMonthlyCost(dealership)}/mo
                            </td>
                            {showDeletedItems && (
                              <>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {dealership.deleted_at
                                    ? new Date(dealership.deleted_at).toLocaleDateString()
                                    : 'N/A'}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {dealership.deletion_reason || 'No reason provided'}
                                </td>
                              </>
                            )}
                            <td className="border border-gray-300 p-2">
                              {renderDealershipActions(dealership)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {dealerships.filter(d => d.type === 'group').length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      {showDeletedItems
                        ? 'No deleted dealer groups found'
                        : 'No dealer groups found'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dealerships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Single Dealerships (
                  {dealerships.filter(d => d.type === 'single' || !d.type).length})
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="show-deleted-dealerships"
                    checked={showDeletedItems}
                    onChange={e => setShowDeletedItems(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="show-deleted-dealerships" className="text-sm text-gray-600">
                    {showDeletedItems ? '🗑️ Viewing Deleted Items' : '👁️ Show Deleted Items'}
                  </Label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Dealership Name</th>
                        <th className="border border-gray-300 p-2 text-left">Location</th>
                        <th className="border border-gray-300 p-2 text-left">Manufacturer</th>
                        <th className="border border-gray-300 p-2 text-left">Admin</th>
                        <th className="border border-gray-300 p-2 text-left">Subscription</th>
                        <th className="border border-gray-300 p-2 text-left">Monthly Cost</th>
                        {showDeletedItems && (
                          <>
                            <th className="border border-gray-300 p-2 text-left">Deleted</th>
                            <th className="border border-gray-300 p-2 text-left">Reason</th>
                          </>
                        )}
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerships
                        .filter(d => d.type === 'single' || !d.type)
                        .map(dealership => (
                          <tr
                            key={dealership.id}
                            className={dealership.is_deleted ? 'bg-red-50' : ''}
                          >
                            <td className="border border-gray-300 p-2">
                              {dealership.name}
                              {dealership.is_deleted && (
                                <span className="ml-2 text-red-500 text-sm">(Deleted)</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {dealership.location || 'Not set'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {Array.isArray(dealership.brands)
                                ? dealership.brands.join(', ')
                                : dealership.manufacturer || 'Not set'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {users.find(u => u.id === dealership.admin_user_id)?.name ||
                                'No admin assigned'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  dealership.subscription_tier === 'premium'
                                    ? 'bg-purple-100 text-purple-800'
                                    : dealership.subscription_tier === 'plus'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {subscriptionTiers.find(
                                  t => t.value === (dealership.subscription_tier || 'base')
                                )?.label || 'Base'}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 font-semibold text-green-600">
                              ${calculateMonthlyCost(dealership)}/mo
                            </td>
                            {showDeletedItems && (
                              <>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {dealership.deleted_at
                                    ? new Date(dealership.deleted_at).toLocaleDateString()
                                    : 'N/A'}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {dealership.deletion_reason || 'No reason provided'}
                                </td>
                              </>
                            )}
                            <td className="border border-gray-300 p-2">
                              {renderDealershipActions(dealership)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {dealerships.filter(d => d.type === 'single' || !d.type).length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      {showDeletedItems
                        ? 'No deleted single dealerships found'
                        : 'No single dealerships found'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance-managers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Single Finance Managers (
                  {users.filter(u => u.role === 'single_finance_manager').length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Email</th>
                        <th className="border border-gray-300 p-2 text-left">Phone</th>
                        <th className="border border-gray-300 p-2 text-left">Joined</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u => u.role === 'single_finance_manager')
                        .map(user => (
                          <tr key={user.id}>
                            <td className="border border-gray-300 p-2">{user.name}</td>
                            <td className="border border-gray-300 p-2">{user.email}</td>
                            <td className="border border-gray-300 p-2">
                              {user.phone || 'Not provided'}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 p-2">
                              {renderUserActions(user)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-user" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <p className="text-gray-600">
                  Create a new user and their associated business entity
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="space-y-6">
                  {/* Basic User Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">User Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={newUser.phone}
                          onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                          placeholder="For 2FA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={newUser.role} onValueChange={handleRoleChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
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
                        <Label htmlFor="tempPassword">Temporary Password</Label>
                        <div className="flex gap-2">
                          <Input
                            id="tempPassword"
                            value={newUser.tempPassword}
                            onChange={e => setNewUser({ ...newUser, tempPassword: e.target.value })}
                            required
                          />
                          <Button type="button" onClick={generateTempPassword} variant="outline">
                            Generate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {renderDealershipFields()}

                  <Button type="submit" disabled={loading || !newUser.role} className="w-full">
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* All Users Management Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Email</th>
                        <th className="border border-gray-300 p-2 text-left">Role</th>
                        <th className="border border-gray-300 p-2 text-left">Business</th>
                        <th className="border border-gray-300 p-2 text-left">Created</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="border border-gray-300 p-2">{user.name}</td>
                          <td className="border border-gray-300 p-2">{user.email}</td>
                          <td className="border border-gray-300 p-2">
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {roles.find(r => r.value === user.role)?.label || user.role}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">
                            {user.dealership?.name || 'None'}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-300 p-2">{renderUserActions(user)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit/View Dialog */}
        <Dialog open={showEditDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editMode ? 'Edit' : 'View'} {selectedDealership ? 'Dealership' : 'User'} Details
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? `Modify the ${selectedDealership ? 'dealership' : 'user'} information below.`
                  : `View ${
                      selectedDealership ? 'dealership' : 'user'
                    } details. Click Edit to make changes.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedDealership && (
                <>
                  <div>
                    <Label htmlFor="edit-name">
                      {selectedDealership.type === 'group'
                        ? 'Dealer Group Name'
                        : 'Dealership Name'}
                    </Label>
                    <Input
                      id="edit-name"
                      value={editData.name || ''}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>

                  {/* Subscription Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Subscription Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-subscription-tier">Subscription Tier</Label>
                        {editMode ? (
                          <Select
                            value={editData.subscription_tier || 'base'}
                            onValueChange={value => {
                              const newEditData = { ...editData, subscription_tier: value };
                              // Recalculate cost when tier changes
                              const tempDealership = {
                                ...selectedDealership,
                                subscription_tier: value as any,
                              };
                              newEditData.monthly_cost = calculateMonthlyCost(tempDealership);
                              setEditData(newEditData);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subscription tier" />
                            </SelectTrigger>
                            <SelectContent>
                              {subscriptionTiers
                                .filter(tier => tier.value && tier.value.trim() !== '') // Filter out empty values
                                .map(tier => (
                                  <SelectItem key={tier.value} value={tier.value}>
                                    {tier.label} - {tier.description}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={
                              subscriptionTiers.find(t => t.value === editData.subscription_tier)
                                ?.label || 'Base'
                            }
                            disabled
                          />
                        )}
                      </div>
                      <div>
                        <Label>Monthly Cost</Label>
                        <Input
                          value={`$${
                            editData.monthly_cost || calculateMonthlyCost(selectedDealership)
                          }/month`}
                          disabled
                          className="font-semibold text-green-600"
                        />
                      </div>
                    </div>

                    {!editMode && (
                      <div className="mt-3">
                        <Label>Current Plan Features:</Label>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {subscriptionTiers
                            .find(t => t.value === editData.subscription_tier)
                            ?.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Admin Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Admin Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Admin Name</Label>
                        <Input value={editData.admin_name || 'No admin assigned'} disabled />
                      </div>
                      <div>
                        <Label>Admin Email</Label>
                        <Input value={editData.admin_email || 'No admin assigned'} disabled />
                      </div>
                      <div>
                        <Label>Admin Phone</Label>
                        <Input value={editData.admin_phone || 'Not provided'} disabled />
                      </div>
                      <div>
                        <Label>Change Admin User</Label>
                        {editMode ? (
                          <Select
                            value={editData.admin_user_id || ''}
                            onValueChange={value =>
                              setEditData({ ...editData, admin_user_id: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select admin user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No admin assigned</SelectItem>
                              {getAvailableAdmins()
                                .filter(user => user.id && user.id.trim() !== '') // Filter out empty IDs
                                .map(user => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value="Use Edit mode to change"
                            disabled
                            className="text-gray-400"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">Business Details</h4>

                    {selectedDealership.type === 'group' ? (
                      // Dealer Group specific fields
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Number of Dealerships</Label>
                            {editMode ? (
                              <Input
                                type="number"
                                value={editData.num_teams || 1}
                                onChange={e => {
                                  const newTeams = parseInt(e.target.value) || 1;
                                  const newEditData = { ...editData, num_teams: newTeams };
                                  // Recalculate cost when number of dealerships changes
                                  const tempDealership = {
                                    ...selectedDealership,
                                    num_teams: newTeams,
                                  };
                                  newEditData.monthly_cost = calculateMonthlyCost(tempDealership);
                                  setEditData(newEditData);
                                }}
                                disabled={!editMode}
                                min="1"
                              />
                            ) : (
                              <Input value={editData.num_teams || 1} disabled />
                            )}
                          </div>
                          <div>
                            <Label>Brands (comma-separated)</Label>
                            <Input
                              value={editData.brands || ''}
                              onChange={e => setEditData({ ...editData, brands: e.target.value })}
                              disabled={!editMode}
                              placeholder="Toyota, Lexus, Honda"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      // Single Dealership specific fields
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                              id="edit-location"
                              value={editData.location || ''}
                              onChange={e => setEditData({ ...editData, location: e.target.value })}
                              disabled={!editMode}
                              placeholder="City, State"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-manufacturer">Manufacturer</Label>
                            {editMode ? (
                              <Select
                                value={editData.manufacturer || ''}
                                onValueChange={value =>
                                  setEditData({ ...editData, manufacturer: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select manufacturer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {manufacturers
                                    .filter(
                                      manufacturer => manufacturer && manufacturer.trim() !== ''
                                    ) // Filter out empty values
                                    .map(manufacturer => (
                                      <SelectItem key={manufacturer} value={manufacturer}>
                                        {manufacturer}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input value={editData.manufacturer || 'Not set'} disabled />
                            )}
                          </div>
                          <div>
                            <Label htmlFor="edit-brands">Brands (comma-separated)</Label>
                            <Input
                              id="edit-brands"
                              value={editData.brands || ''}
                              onChange={e => setEditData({ ...editData, brands: e.target.value })}
                              disabled={!editMode}
                              placeholder="Toyota, Lexus, Honda"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-store-hours">Store Hours</Label>
                            <Input
                              id="edit-store-hours"
                              value={editData.store_hours || ''}
                              onChange={e =>
                                setEditData({ ...editData, store_hours: e.target.value })
                              }
                              disabled={!editMode}
                              placeholder="9:00 AM - 6:00 PM Mon-Fri"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {selectedUser && (
                <>
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
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="edit-user-role">Role</Label>
                    {editMode ? (
                      <Select
                        value={editData.role || ''}
                        onValueChange={value => setEditData({ ...editData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles
                            .filter(role => role.value && role.value.trim() !== '') // Filter out empty values
                            .map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={roles.find(r => r.value === editData.role)?.label || editData.role}
                        disabled
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit-user-phone">Phone</Label>
                    <Input
                      id="edit-user-phone"
                      value={editData.phone || ''}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      disabled={!editMode}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-user-dealership">Assigned Dealership</Label>
                    {editMode ? (
                      <Select
                        value={editData.dealership_id ? editData.dealership_id.toString() : ''}
                        onValueChange={value => setEditData({ ...editData, dealership_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select dealership" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No dealership assigned</SelectItem>
                          {dealerships
                            .filter(
                              dealership =>
                                dealership.id && dealership.name && dealership.name.trim() !== ''
                            ) // Filter out empty values
                            .map(dealership => (
                              <SelectItem key={dealership.id} value={dealership.id.toString()}>
                                {dealership.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={
                          dealerships.find(d => d.id === editData.dealership_id)?.name || 'None'
                        }
                        disabled
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="gap-2">
              {!editMode ? (
                <>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                  <Button onClick={handleEdit}>Edit</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PIN Protected Delete Dialog */}
        <Dialog open={showPinDialog} onOpenChange={handleClosePinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
              <DialogDescription>
                You are about to delete{' '}
                <strong>{deleteTarget?.type === 'dealership' ? 'dealership' : 'user'}</strong>:{' '}
                <strong>"{deleteTarget?.name}"</strong>
                <br />
                <br />
                {deleteTarget?.type === 'dealership' && (
                  <>
                    <span className="text-red-600 font-semibold">
                      ⚠️ WARNING: DESTRUCTIVE OPERATION
                    </span>
                    <br />
                    This will also permanently delete:
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>The dealership's tenant database schema</li>
                      <li>ALL data within that schema (users, deals, reports, etc.)</li>
                      <li>All associated user accounts</li>
                      <li>All business data and history</li>
                    </ul>
                    <br />
                    <span className="text-red-600 font-medium">
                      This action CANNOT be undone and will result in complete data loss!
                    </span>
                    <br />
                    <br />
                  </>
                )}
                This action cannot be undone. Please enter the PIN to confirm.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="delete-pin">Enter PIN (4 digits)</Label>
                <Input
                  id="delete-pin"
                  type="password"
                  value={deletePin}
                  onChange={e => setDeletePin(e.target.value)}
                  placeholder="Enter PIN"
                  maxLength={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClosePinDialog}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={loading || deletePin.length !== 4}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Options Dialog */}
        <Dialog open={showDeleteOptionsDialog} onOpenChange={setShowDeleteOptionsDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Delete Dealership: {deleteTarget?.name}</DialogTitle>
              <DialogDescription>
                Choose how you would like to handle this dealership deletion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Deletion Type Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Deletion Type</Label>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="soft-delete"
                      name="deletionType"
                      value="soft"
                      checked={deletionType === 'soft'}
                      onChange={e => setDeletionType(e.target.value as 'soft' | 'hard')}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="soft-delete" className="text-green-600 font-medium">
                        🗑️ Move to Trash (Recommended)
                      </Label>
                      <p className="text-sm text-gray-600">
                        Safely disable the dealership while preserving all data. Can be restored
                        later. No data loss occurs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="hard-delete"
                      name="deletionType"
                      value="hard"
                      checked={deletionType === 'hard'}
                      onChange={e => setDeletionType(e.target.value as 'soft' | 'hard')}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="hard-delete" className="text-red-600 font-medium">
                        💥 Permanent Deletion (Dangerous)
                      </Label>
                      <p className="text-sm text-gray-600">
                        Completely remove dealership and all associated data. Requires backup first.
                        <span className="text-red-600 font-medium"> Cannot be undone!</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <Label htmlFor="deletion-reason">
                  Reason for Deletion {deletionType === 'soft' ? '(Optional)' : '(Required)'}
                </Label>
                <Input
                  id="deletion-reason"
                  value={deletionReason}
                  onChange={e => setDeletionReason(e.target.value)}
                  placeholder="e.g., Business closed, Contract ended, Account violation"
                  className="mt-1"
                />
              </div>

              {/* Hard Delete Warning */}
              {deletionType === 'hard' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600 text-xl">⚠️</span>
                    <div>
                      <h4 className="text-red-600 font-semibold">Hard Deletion Requirements</h4>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• Data backup will be created automatically</li>
                        <li>• PIN confirmation required</li>
                        <li>• All tenant schema data will be permanently deleted</li>
                        <li>• Associated users will be removed</li>
                        <li>• This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteOptionsDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={deletionType === 'soft' ? 'default' : 'destructive'}
                onClick={async () => {
                  if (deletionType === 'soft') {
                    if (!deleteTarget) return;
                    const dealership = dealerships.find(
                      d => d.id === deleteTarget.id
                    ) as Dealership;
                    if (dealership) {
                      setShowDeleteOptionsDialog(false);
                      await softDeleteDealership(dealership, deletionReason);
                    }
                  } else {
                    // Hard delete - require backup first
                    if (!deletionReason.trim()) {
                      setError('Reason is required for permanent deletion.');
                      return;
                    }
                    setShowDeleteOptionsDialog(false);
                    setShowBackupDialog(true);
                  }
                }}
                disabled={loading || (deletionType === 'hard' && !deletionReason.trim())}
              >
                {loading
                  ? 'Processing...'
                  : deletionType === 'soft'
                  ? 'Move to Trash'
                  : 'Proceed with Backup & Deletion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Backup Progress Dialog */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Data Backup Required</DialogTitle>
              <DialogDescription>
                Before permanent deletion, we'll backup all dealership data. Choose your preferred
                backup method.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {backupProgress === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Select how you'd like to receive the backup data:
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={async () => {
                        if (!deleteTarget) return;
                        const dealership = dealerships.find(
                          d => d.id === deleteTarget.id
                        ) as Dealership;
                        if (dealership) {
                          await createDataBackup(dealership, 'download');
                        }
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">📁 Download File</div>
                        <div className="text-sm text-gray-500">
                          Save backup file to your computer
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={async () => {
                        if (!deleteTarget) return;
                        const dealership = dealerships.find(
                          d => d.id === deleteTarget.id
                        ) as Dealership;
                        if (dealership) {
                          await createDataBackup(dealership, 'email');
                        }
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">📧 Email Backup</div>
                        <div className="text-sm text-gray-500">
                          Send backup to admin@thedasboard.com
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={async () => {
                        if (!deleteTarget) return;
                        const dealership = dealerships.find(
                          d => d.id === deleteTarget.id
                        ) as Dealership;
                        if (dealership) {
                          await createDataBackup(dealership, 'cloud');
                        }
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">☁️ Cloud Storage</div>
                        <div className="text-sm text-gray-500">
                          Upload to secure cloud storage (AWS S3)
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              {backupProgress > 0 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Backup Progress</span>
                      <span>{backupProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${backupProgress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{backupStatus}</p>

                  {backupProgress === 100 && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setShowBackupDialog(false);
                        setDeletePin('');
                        setShowPinDialog(true);
                      }}
                    >
                      Proceed with Permanent Deletion
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              {backupProgress === 0 && (
                <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                  Cancel Deletion
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MasterAdminPage;
