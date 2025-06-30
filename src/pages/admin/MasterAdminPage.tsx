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
import { getCurrentDirectAuthUser, isDirectAuthAuthenticated } from '../../lib/directAuth';
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
  locations?: any; // Changed from location to locations
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
  // Individual dealer details for groups
  individual_dealers?: IndividualDealer[];
  metadata?: any;
}

interface IndividualDealer {
  id?: number;
  name: string;
  manufacturer: string;
  subscription_tier: 'base' | 'plus' | 'premium';
  brands?: string[];
  location?: string;
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
  const [loading, setLoading] = useState(true);
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
  const [availableAdmins, setAvailableAdmins] = useState<User[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Tab management state
  const [activeTab, setActiveTab] = useState('overview');

  // Existing dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'dealership' | 'user' | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [deleteItemName, setDeleteItemName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // New states for overlay dialogs
  const [showViewAllDialog, setShowViewAllDialog] = useState(false);
  const [viewAllType, setViewAllType] = useState<
    'dealerships' | 'groups' | 'finance_managers' | null
  >(null);
  const [viewAllData, setViewAllData] = useState<any[]>([]);

  // Function to refresh overview data
  const refreshOverview = async () => {
    console.log('[refreshOverview] Refreshing overview data...');
    try {
      await Promise.all([fetchUsers(), fetchDealerships(), fetchSignupRequests()]);
      console.log('[refreshOverview] Overview data refreshed successfully');
    } catch (error) {
      console.error('[refreshOverview] Failed to refresh overview data:', error);
    }
  };

  // Clear messages when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
    setSuccess('');
    console.log(`[handleTabChange] Switched to tab: ${value}`);

    // Auto-refresh data when switching to overview
    if (value === 'overview') {
      console.log('[handleTabChange] Refreshing data for overview tab');
      refreshOverview();
    }
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

  // Simplified roles - only 3 main options for new user creation
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

  // Complete roles list for display purposes (includes legacy roles)
  const allRoles = [
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
    // Legacy role compatibility
    { value: 'admin', label: 'Admin', dashboard: '/dashboard/admin' },
    { value: 'dealership_admin', label: 'Dealership Admin', dashboard: '/dashboard/admin' },
    { value: 'finance_manager', label: 'Finance Manager', dashboard: '/dashboard/finance' },
    { value: 'general_manager', label: 'General Manager', dashboard: '/dashboard/gm' },
    { value: 'sales_manager', label: 'Sales Manager', dashboard: '/dashboard/sales-manager' },
    { value: 'salesperson', label: 'Salesperson', dashboard: '/dashboard/sales' },
  ];

  // Role mapping function for backward compatibility
  const mapLegacyRole = (role: string): string => {
    const legacyRoleMap: { [key: string]: string } = {
      // New role names pass through as-is
      single_finance_manager: 'single_finance_manager',
      single_dealer_admin: 'single_dealer_admin',
      group_dealer_admin: 'group_dealer_admin',
      admin: 'admin', // Keep master admin as is
      // Legacy mappings for backward compatibility
      dealership_admin: 'single_dealer_admin',
      finance_manager: 'single_finance_manager',
      general_manager: 'single_dealer_admin',
      sales_manager: 'single_dealer_admin',
      salesperson: 'salesperson', // Fixed: was incorrectly mapped to single_finance_manager
    };
    return legacyRoleMap[role] || role;
  };

  // Helper function to check if a role is an admin role (for available admins)
  const isAdminRole = (role: string): boolean => {
    const adminRoles = [
      'single_dealer_admin',
      'group_dealer_admin',
      'admin',
      'dealership_admin',
      'general_manager',
    ];
    return adminRoles.includes(role);
  };

  // Function to convert UI roles to database-compatible roles
  const mapUIRoleToDatabase = (uiRole: string): string => {
    // All roles are now directly supported in the database constraint
    const roleMapping: { [key: string]: string } = {
      single_finance_manager: 'single_finance_manager',
      single_dealer_admin: 'single_dealer_admin',
      group_dealer_admin: 'group_dealer_admin',
      admin: 'admin',
      dealership_admin: 'dealership_admin', // Legacy support
      finance_manager: 'finance_manager', // Legacy support
      general_manager: 'general_manager',
      sales_manager: 'sales_manager',
      salesperson: 'salesperson',
    };
    return roleMapping[uiRole] || uiRole;
  };

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
      singleDealershipPrice: 350, // Base + 100
      dealerGroupPricePerDealer: 300, // Group base + 100
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
      singleDealershipPrice: 750, // Base + 500
      dealerGroupPricePerDealer: 700, // Group base + 500
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

    if (dealership.type === 'group') {
      // For dealer groups, calculate based on individual dealer tiers if available
      const individualDealers = dealership.metadata?.individual_dealers;

      if (individualDealers && Array.isArray(individualDealers) && individualDealers.length > 0) {
        // Calculate cost based on each individual dealer's tier using SINGLE DEALERSHIP PRICING
        // This matches what's shown in the UI and user expectations
        let totalCost = 0;

        individualDealers.forEach((dealer: any) => {
          const dealerTier = dealer.subscription_tier || 'base';
          let dealerCost = 250; // Use single dealership pricing for individual dealers in groups

          if (dealerTier === 'plus') {
            dealerCost = 350; // Single dealership plus pricing
          } else if (dealerTier === 'premium') {
            dealerCost = 750; // Single dealership premium pricing
          }

          totalCost += dealerCost;
        });

        return totalCost;
      } else {
        // Fallback to group-wide tier calculation using single dealership pricing
        // This ensures consistency with individual dealer pricing
        let baseCost = 250 * numDealerships; // Use single dealership pricing

        if (tier === 'plus') {
          baseCost = 350 * numDealerships; // Single dealership plus pricing
        } else if (tier === 'premium') {
          baseCost = 750 * numDealerships; // Single dealership premium pricing
        }

        return baseCost;
      }
    } else {
      // Single dealership pricing - unchanged
      let baseCost = 250; // $250 for single dealership

      if (tier === 'plus') {
        baseCost = 350;
      } else if (tier === 'premium') {
        baseCost = 750;
      }

      return baseCost;
    }
  };

  useEffect(() => {
    // Check if user is authorized - check both Supabase auth and direct auth
    const directAuthUser = getCurrentDirectAuthUser();
    const isDirectlyAuthenticated = isDirectAuthAuthenticated();

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
      console.log('[fetchUsers] directSupabase client:', directSupabase);

      // Test basic connectivity first
      console.log('[fetchUsers] Testing database connectivity...');

      // Fetch users using directSupabase - try with minimal columns first
      console.log('[fetchUsers] Attempting to fetch profiles...');

      const usersResult = await directSupabase.select('profiles', {
        columns: 'id, email, name, role, created_at, dealership_id, phone',
      });

      console.log('[fetchUsers] Raw users result:', {
        data: usersResult.data,
        error: usersResult.error,
        dataLength: usersResult.data?.length || 0,
        dataType: typeof usersResult.data,
        isArray: Array.isArray(usersResult.data),
      });

      if (usersResult.error) {
        console.error('[fetchUsers] Users fetch error:', usersResult.error);
        console.error('[fetchUsers] Error details:', {
          message: usersResult.error.message,
          details: usersResult.error.details,
          hint: usersResult.error.hint,
          code: usersResult.error.code,
        });
        setUsers([]);
        return [];
      }

      const usersData = usersResult.data || [];
      console.log('[fetchUsers] Users data received:', usersData.length, 'users');
      console.log('[fetchUsers] Raw users data sample:', usersData.slice(0, 2));

      // Debug role mapping
      console.log('[fetchUsers] ===== ROLE MAPPING DEBUG =====');
      usersData.forEach((user, index) => {
        const mappedRole = mapLegacyRole(user.role);
        console.log(
          `[fetchUsers] User ${index + 1}: ${user.name} - Role: ${
            user.role
          } -> Mapped: ${mappedRole}`
        );
      });
      console.log('[fetchUsers] ===== END ROLE MAPPING DEBUG =====');

      // Count finance managers specifically
      const financeManagers = usersData.filter(
        u => mapLegacyRole(u.role) === 'single_finance_manager'
      );
      console.log('[fetchUsers] Finance managers found:', financeManagers.length);
      financeManagers.forEach((fm, index) => {
        console.log(
          `[fetchUsers] Finance Manager ${index + 1}: ${fm.name} (${fm.email}) - Role: ${fm.role}`
        );
      });

      if (usersData.length === 0) {
        console.warn(
          '[fetchUsers] No users found in database - this should not happen if there are 17 users'
        );

        // Try a different approach - simple query without columns specification
        console.log('[fetchUsers] Trying alternative query method...');
        try {
          const alternativeResult = await directSupabase.select('profiles', {});
          console.log('[fetchUsers] Alternative query result:', {
            data: alternativeResult.data,
            error: alternativeResult.error,
            dataLength: alternativeResult.data?.length || 0,
          });
        } catch (altError) {
          console.error('[fetchUsers] Alternative query also failed:', altError);
        }

        setUsers([]);
        return [];
      }

      // Fetch dealerships for relationship
      const dealershipsResult = await directSupabase.select('dealerships', {
        columns: 'id, name',
      });

      console.log('[fetchUsers] Dealerships for relationships:', dealershipsResult.data?.length);

      // Transform the data
      const transformedData = usersData.map(user => ({
        ...user,
        dealership:
          user.dealership_id && dealershipsResult.data
            ? dealershipsResult.data.find(d => d.id === user.dealership_id) || null
            : null,
      }));

      console.log('[fetchUsers] Transformed data:', transformedData.length, 'users');
      console.log('[fetchUsers] First user sample:', transformedData[0]);

      // Final check for finance managers after transformation
      const finalFinanceManagers = transformedData.filter(
        u => mapLegacyRole(u.role) === 'single_finance_manager'
      );
      console.log('[fetchUsers] Final finance managers count:', finalFinanceManagers.length);

      setUsers(transformedData);
      return transformedData;
    } catch (err) {
      console.error('[fetchUsers] Unexpected error:', err);
      console.error('[fetchUsers] Error stack:', (err as Error)?.stack);
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
      // Validate required fields - PHONE IS NOW REQUIRED
      if (
        !newUser.name ||
        !newUser.email ||
        !newUser.role ||
        !newUser.tempPassword ||
        !newUser.phone
      ) {
        throw new Error(
          'Please fill in all required fields including phone number (required for 2FA)'
        );
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(newUser.phone.replace(/[\s\-()]/g, ''))) {
        throw new Error('Please enter a valid phone number');
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
          filter: { name: newUser.dealershipName },
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
          filter: {
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

        const dealershipData: any = {
          name: newUser.dealershipName,
          type: 'single',
          schema_name: tenantSchemaName,
          // Minimal placeholder - dealer admin will configure actual hours in their dashboard
          store_hours: {
            status: 'not_configured',
            note: 'Store hours to be configured by dealer admin',
          },
          num_teams: 1,
          subscription_tier: 'base',
        };

        // Add optional fields if provided
        if (newUser.manufacturer) {
          dealershipData.manufacturer = newUser.manufacturer;
        }

        if (newUser.location) {
          // Convert location string to locations array format
          dealershipData.locations = [
            {
              name: 'Main Location',
              address: newUser.location,
              city: '',
              state: '',
              zip: '',
              phone: '',
            },
          ];
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
          throw new Error(
            `Failed to create dealership: ${
              (dealershipCreationError as Error)?.message || 'Unknown error'
            }`
          );
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
            // Minimal placeholder - dealer admin will configure actual hours in their dashboard
            store_hours: {
              status: 'not_configured',
              note: 'Store hours to be configured by dealer admin',
            },
            num_teams: newUser.numDealerships || 1,
            subscription_tier: 'base',
            schema_name: tenantSchemaName,
          });

          console.log('[createUser] Basic insert result:', basicInsert);

          if (basicInsert.error) {
            throw new Error(`Basic insert failed: ${basicInsert.error.message}`);
          }

          dealershipId = basicInsert.data.id;
          console.log(
            '[createUser] ✅ Dealer group created successfully with ID:',
            dealershipId,
            'Schema:',
            tenantSchemaName
          );

          console.log('[createUser] Dealer group creation completed successfully');

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
          throw new Error(
            `Failed to create dealer group: ${
              (dealerGroupError as Error)?.message || 'Unknown error'
            }`
          );
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

            // Check if a profile already exists for this email using directSupabase
            try {
              console.log('[createUser] Checking for existing profile with directSupabase...');
              const profileCheckResult = await directSupabase.select('profiles', {
                columns: 'id, email, name, role, dealership_id',
                filter: { email: newUser.email },
              });

              console.log('[createUser] Profile check result:', profileCheckResult);

              if (profileCheckResult.error) {
                console.error('[createUser] Profile check error:', profileCheckResult.error);
                // If profile check fails, try to continue with user creation anyway
                console.warn(
                  '[createUser] Profile check failed, but continuing with user creation'
                );
              }

              const existingProfile = profileCheckResult.data?.[0];

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

                  // Convert UI role to database-compatible role for existing profile update
                  const databaseRole = mapUIRoleToDatabase(newUser.role);
                  console.log(
                    `[createUser] Converting update role: ${newUser.role} -> ${databaseRole}`
                  );

                  const updateResult = await directSupabase.update(
                    'profiles',
                    {
                      role: databaseRole, // Use database-compatible role
                      dealership_id: dealershipId,
                      name: newUser.name,
                      phone: newUser.phone,
                    },
                    { id: existingProfile.id }
                  );

                  if (updateResult.error) {
                    console.error(
                      '[createUser] Failed to update existing profile:',
                      updateResult.error
                    );
                    // Don't throw here - continue with creation
                    console.warn('[createUser] Profile update failed, but continuing');
                  } else {
                    console.log('[createUser] Existing user profile updated successfully');
                  }
                }

                // Use the existing profile ID for admin assignment
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

                // First, let's check if a profile actually exists by searching more broadly
                console.log('[createUser] Searching for existing profile by email...');
                try {
                  // Use directSupabase which should have better privileges than regular supabase
                  const existingUserResult = await directSupabase.select('profiles', {
                    columns: 'id, email, name, role',
                    filter: { email: newUser.email },
                  });

                  if (existingUserResult.data && existingUserResult.data.length > 0) {
                    const existingProfile = existingUserResult.data[0];
                    console.log('[createUser] Found existing profile:', existingProfile);

                    // Use the existing profile ID
                    authData = {
                      user: {
                        id: existingProfile.id,
                        email: existingProfile.email,
                      },
                      session: null,
                    };

                    console.log('[createUser] Using existing profile ID:', existingProfile.id);
                    isExistingUserUpdate = true;

                    // Update the existing profile if needed
                    const databaseRole = mapUIRoleToDatabase(newUser.role);
                    if (
                      existingProfile.role !== databaseRole ||
                      existingProfile.name !== newUser.name
                    ) {
                      console.log('[createUser] Updating existing profile...');
                      const updateResult = await directSupabase.update(
                        'profiles',
                        {
                          role: databaseRole,
                          name: newUser.name,
                          phone: newUser.phone,
                          dealership_id: dealershipId,
                        },
                        { id: existingProfile.id }
                      );

                      if (updateResult.error) {
                        console.error(
                          '[createUser] Failed to update existing profile:',
                          updateResult.error
                        );
                      } else {
                        console.log('[createUser] Successfully updated existing profile');
                      }
                    }
                  } else {
                    // No profile found, we need to get the real auth user ID
                    console.log('[createUser] No profile found, attempting to get auth user ID...');

                    // Try to use Supabase admin API to get the user by email
                    try {
                      // Since we can't access admin.listUsers from client, we'll skip the sign-in approach
                      // and instead return a null ID to handle this case later
                      console.log(
                        '[createUser] Cannot retrieve auth user ID from client - profile will be skipped'
                      );
                      authData = {
                        user: null,
                        session: null,
                      };
                    } catch (adminError) {
                      console.error('[createUser] Admin API not accessible:', adminError);
                      authData = {
                        user: null,
                        session: null,
                      };
                    }
                  }
                } catch (profileSearchError) {
                  console.error(
                    '[createUser] Error searching for existing profile:',
                    profileSearchError
                  );
                  authData = {
                    user: null,
                    session: null,
                  };
                }

                isExistingUserUpdate = true;
              }
            } catch (profileError) {
              console.error('[createUser] Error during profile handling:', profileError);
              // Don't throw here - continue with creation process
              console.warn(
                '[createUser] Profile handling failed, but continuing with user creation'
              );
              authData = {
                user: null, // Use null instead of fake ID
                session: null,
              };
              isExistingUserUpdate = true;
            }
          } else {
            // For other auth errors, still don't throw immediately - log and continue
            console.error('[createUser] Non-duplicate auth error:', authError);
            console.warn(
              '[createUser] Auth error occurred, but attempting to continue with user creation'
            );

            // Create fallback auth data
            authData = {
              user: null, // Use null instead of fake ID
              session: null,
            };
          }
        }

        console.log('[createUser] User created with auth ID:', authData.user?.id);
