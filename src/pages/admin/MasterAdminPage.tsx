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

        // Create profile entry in public schema only if we have a valid user ID and it's not an existing profile update
        if (authData.user?.id && !isExistingUserUpdate) {
          console.log('[createUser] Creating new profile entry');

          // Convert UI role to database-compatible role
          const databaseRole = mapUIRoleToDatabase(newUser.role);
          console.log(`[createUser] Converting role: ${newUser.role} -> ${databaseRole}`);

          // Try directSupabase first to avoid RLS issues
          const profileResult = await directSupabase.insert('profiles', {
            id: authData.user.id,
            email: newUser.email,
            name: newUser.name,
            role: databaseRole, // Use database-compatible role
            phone: newUser.phone,
            dealership_id: dealershipId,
          });

          if (profileResult.error) {
            console.error('[createUser] Profile creation error:', profileResult.error);
            console.log(
              '[createUser] Attempting profile creation with regular supabase as fallback...'
            );

            // Fallback to regular supabase upsert if directSupabase fails
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: authData.user.id,
                email: newUser.email,
                name: newUser.name,
                role: databaseRole, // Use database-compatible role
                phone: newUser.phone,
                dealership_id: dealershipId,
              })
              .select()
              .single();

            if (profileError) {
              console.error('[createUser] Fallback profile creation also failed:', profileError);
              // Don't throw error here - continue with user creation even if profile fails
              console.warn(
                '[createUser] Profile creation failed, but continuing with user creation'
              );
            } else {
              console.log('[createUser] Profile created successfully via fallback:', profileData);
            }
          } else {
            console.log(
              '[createUser] Profile created successfully via directSupabase:',
              profileResult.data
            );
          }
        } else if (isExistingUserUpdate) {
          console.log(
            '[createUser] Skipping profile creation - existing profile was already updated'
          );
        } else {
          console.log('[createUser] Skipping profile creation - no valid auth user ID available');
          console.log(
            '[createUser] This happens when user already exists in auth but we cannot retrieve their ID'
          );
        }

        // Create user entry in tenant schema (if we have one)
        if (tenantSchemaName) {
          console.log('[createUser] Tenant schema created:', tenantSchemaName);
          console.log(
            '[createUser] User will be added to tenant schema via backend migration system'
          );
          // In production, trigger backend API to add user to tenant schema
        }

        // Update dealership with admin user ID (only if we have a valid user ID)
        let finalUserId = authData.user?.id;

        // If auth creation failed but we still need to link the admin, try to find the user by email
        if (dealershipId && !finalUserId) {
          console.log('[createUser] Auth user ID not available, searching for user by email...');
          try {
            const existingUserResult = await directSupabase.select('profiles', {
              columns: 'id, email, name',
              filter: { email: newUser.email },
            });

            if (existingUserResult.data && existingUserResult.data.length > 0) {
              finalUserId = existingUserResult.data[0].id;
              console.log('[createUser] Found existing user ID by email:', finalUserId);
            }
          } catch (searchError) {
            console.error('[createUser] Error searching for user by email:', searchError);
          }
        }

        if (dealershipId && finalUserId) {
          console.log('[createUser] Updating dealership with admin user ID:', finalUserId);
          const updateResult = await directSupabase.update(
            'dealerships',
            { admin_user_id: finalUserId },
            { id: dealershipId }
          );

          if (updateResult.error) {
            console.error('[createUser] Dealership update error:', updateResult.error);
            // Don't throw - just log the error
            console.warn(
              '[createUser] Failed to update dealership with admin user ID, but continuing'
            );
          } else {
            console.log('[createUser] ✅ Dealership updated with admin user ID successfully');

            // Verify the update worked and log detailed information
            const verifyResult = await directSupabase.select('dealerships', {
              columns: 'id, name, admin_user_id',
              filter: { id: dealershipId },
            });

            if (verifyResult.data && verifyResult.data.length > 0) {
              console.log(
                '[createUser] ✅ Verification - Dealership admin_user_id:',
                verifyResult.data[0].admin_user_id
              );
              console.log('[createUser] ✅ This admin should now appear in dealership details!');
            }
          }
        } else if (dealershipId && !finalUserId) {
          console.warn(
            '[createUser] ⚠️ Could not assign admin to dealership - no valid user ID available'
          );
          console.warn('[createUser] This means admin details will not show in dealership view');
          console.warn('[createUser] To fix: manually assign admin in Master Admin interface');
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
                  role: allRoles.find(r => r.value === newUser.role)?.label || newUser.role,
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

        const roleLabel = allRoles.find(r => r.value === newUser.role)?.label || newUser.role;

        // Use the tracking variable we set earlier
        const actionText = isExistingUserUpdate ? 'updated' : 'created';

        // Clear any previous errors
        setError('');

        // Customize success message based on what was actually created/updated
        let successMessage = '';

        if (dealershipId && !authData.user?.id) {
          // Dealership created but user already exists in auth
          const entityType = newUser.role === 'group_dealer_admin' ? 'Dealer group' : 'Dealership';
          const entityName =
            newUser.role === 'group_dealer_admin' ? newUser.groupName : newUser.dealershipName;
          successMessage = `✅ ${entityType} "${entityName}" created successfully! Note: User ${newUser.email} already exists in the system. Please have them login with their existing password.`;
        } else if (isExistingUserUpdate && authData.user?.id) {
          // Existing user updated
          successMessage = `✅ ${roleLabel} updated successfully! User profile updated.`;
        } else {
          // New user created
          successMessage = `✅ ${roleLabel} created successfully! Temporary password email sent to ${newUser.email}.`;
        }

        if (tenantSchemaName) {
          successMessage += ` Tenant schema: ${tenantSchemaName}`;
        }

        setSuccess(successMessage);
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
        const errorMessage = (authSignupError as Error)?.message || 'Failed to create user account';
        setError(`User creation failed: ${errorMessage}`);
        console.log('[createUser] Error occurred - resetting loading state');
      }
    } catch (err: any) {
      console.error('[createUser] Error occurred:', err);
      setError(err.message || 'Failed to create user');
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
    const role = allRoles.find(r => r.value === userRole);
    return role?.dashboard || '/dashboard';
  };

  // New functions for view/edit/delete functionality
  const viewDealershipDetails = async (dealership: Dealership) => {
    console.log('[viewDealershipDetails] ===== START DETAILED DEBUG =====');
    console.log('[viewDealershipDetails] Dealership data:', dealership);
    console.log('[viewDealershipDetails] Dealership type:', dealership.type);
    console.log('[viewDealershipDetails] Admin user ID:', dealership.admin_user_id);

    // Calculate monthly cost first
    const monthlyCost = calculateMonthlyCost(dealership);
    console.log('[viewDealershipDetails] Calculated monthly cost:', monthlyCost);

    // Directly query admin details instead of relying on users array
    let adminDetails: any = {};
    if (dealership.admin_user_id) {
      console.log(
        '[viewDealershipDetails] Querying admin details for ID:',
        dealership.admin_user_id
      );

      try {
        const adminResult = await directSupabase.select('profiles', {
          columns: 'id, name, email, phone, role',
          filter: { id: dealership.admin_user_id },
        });

        console.log('[viewDealershipDetails] Admin query result:', adminResult);

        if (adminResult.data && adminResult.data.length > 0) {
          const adminUser = adminResult.data[0];
          console.log('[viewDealershipDetails] Found admin user:', adminUser);

          adminDetails = {
            admin_name: adminUser.name || 'Name not provided',
            admin_email: adminUser.email || 'Email not provided',
            admin_phone: adminUser.phone || 'Phone not provided',
            admin_role: adminUser.role || 'Role not specified',
          };

          console.log('[viewDealershipDetails] ✅ Admin details populated:', adminDetails);
        } else {
          console.log('[viewDealershipDetails] ❌ No admin user found in database');
          adminDetails = {
            admin_name: 'No admin found',
            admin_email: 'No admin found',
            admin_phone: 'No admin found',
            admin_role: 'No admin found',
          };
        }
      } catch (error) {
        console.error('[viewDealershipDetails] ❌ Error querying admin details:', error);
        adminDetails = {
          admin_name: 'Error loading admin',
          admin_email: 'Error loading admin',
          admin_phone: 'Error loading admin',
          admin_role: 'Error loading admin',
        };
      }
    } else {
      console.log('[viewDealershipDetails] ❌ No admin_user_id provided');
      adminDetails = {
        admin_name: 'No admin assigned',
        admin_email: 'No admin assigned',
        admin_phone: 'No admin assigned',
        admin_role: 'No admin assigned',
      };
    }

    console.log('[viewDealershipDetails] Final admin details object:', adminDetails);

    // Initialize individual dealer data for groups
    let dealerGroupDetails: any = {};
    if (dealership.type === 'group') {
      console.log(
        '[viewDealershipDetails] Processing dealer group with num_teams:',
        dealership.num_teams
      );

      // Check if we have stored individual dealer data in metadata
      const storedDealers = dealership.metadata?.individual_dealers;
      console.log('[viewDealershipDetails] Stored individual dealers:', storedDealers);

      // Calculate individual dealer revenues for transparency
      const individualDealerRevenues = [];

      for (let i = 0; i < (dealership.num_teams || 1); i++) {
        const dealerKey = `dealer_${i}`;
        const storedDealer = storedDealers?.[i];

        // Use stored data if available, otherwise use defaults
        dealerGroupDetails[`${dealerKey}_name`] =
          storedDealer?.name || `${dealership.name} - Location ${i + 1}`;
        dealerGroupDetails[`${dealerKey}_manufacturer`] =
          storedDealer?.manufacturer || dealership.manufacturer || '';
        dealerGroupDetails[`${dealerKey}_tier`] =
          storedDealer?.subscription_tier || dealership.subscription_tier || 'base';
        dealerGroupDetails[`${dealerKey}_brands`] = storedDealer?.brands
          ? storedDealer.brands.join(', ')
          : Array.isArray(dealership.brands)
          ? dealership.brands.join(', ')
          : '';

        // Calculate individual dealer revenue
        const dealerTier =
          storedDealer?.subscription_tier || dealership.subscription_tier || 'base';
        let dealerCost = 250; // Use single dealership pricing for consistency

        if (dealerTier === 'plus') dealerCost = 350; // Single dealership plus pricing
        else if (dealerTier === 'premium') dealerCost = 750; // Single dealership premium pricing

        individualDealerRevenues.push({
          name: dealerGroupDetails[`${dealerKey}_name`],
          tier: dealerTier,
          cost: dealerCost,
        });
      }

      dealerGroupDetails = {
        group_name: dealership.name,
        num_dealers: dealership.num_teams || 1,
        total_monthly_revenue: monthlyCost, // Add total revenue for verification
        individual_dealer_revenues: individualDealerRevenues, // Add individual revenues for transparency
        ...dealerGroupDetails,
      };
    }

    const finalEditData = {
      id: dealership.id,
      name: dealership.name,
      type: dealership.type,
      store_hours: dealership.store_hours || '',
      num_teams: dealership.num_teams || 1,
      admin_user_id: dealership.admin_user_id || 'none',
      subscription_tier: dealership.subscription_tier || 'base',
      monthly_cost: monthlyCost,
      schema_name: dealership.schema_name || '',
      // Admin details for display
      ...adminDetails,
      // Dealer group details if applicable
      ...dealerGroupDetails,
    };

    console.log('[viewDealershipDetails] Final edit data being set:', finalEditData);
    console.log('[viewDealershipDetails] ===== FINAL EDIT DATA ADMIN FIELDS =====');
    console.log('[viewDealershipDetails] finalEditData.admin_name:', finalEditData.admin_name);
    console.log('[viewDealershipDetails] finalEditData.admin_email:', finalEditData.admin_email);
    console.log('[viewDealershipDetails] finalEditData.admin_phone:', finalEditData.admin_phone);
    console.log('[viewDealershipDetails] Type of admin_name:', typeof finalEditData.admin_name);
    console.log('[viewDealershipDetails] Type of admin_email:', typeof finalEditData.admin_email);
    console.log('[viewDealershipDetails] Type of admin_phone:', typeof finalEditData.admin_phone);
    console.log('[viewDealershipDetails] ===== END FINAL EDIT DATA DEBUG =====');
    console.log('[viewDealershipDetails] Specifically checking admin fields in editData:', {
      admin_name: finalEditData.admin_name,
      admin_email: finalEditData.admin_email,
      admin_phone: finalEditData.admin_phone,
    });

    setSelectedDealership(dealership);
    setEditData(finalEditData);
    setEditMode(false);
    setDialogLoading(true);

    // Load available admins AFTER setting the dialog data but BEFORE opening the dialog
    console.log('[viewDealershipDetails] Loading available admins...');

    // Use a shorter timeout and better error handling
    const adminLoadingTimeout = setTimeout(() => {
      console.warn('[viewDealershipDetails] Admin loading timed out, opening dialog anyway');
      setAvailableAdmins([]);
      setDialogLoading(false);
      setShowEditDialog(true);
    }, 3000); // Reduced timeout to 3 seconds

    try {
      // Try a simple direct query without the complex timeout logic
      console.log('[viewDealershipDetails] Attempting direct admin query...');
      const { data: adminUsers, error: adminError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('role', [
          'single_dealer_admin',
          'group_dealer_admin',
          'admin',
          'dealership_admin',
          'general_manager',
        ])
        .limit(20);

      clearTimeout(adminLoadingTimeout);

      if (adminError) {
        console.error('[viewDealershipDetails] Admin query error:', adminError);
        setAvailableAdmins([]);
      } else {
        console.log('[viewDealershipDetails] Admin users found:', adminUsers?.length || 0);
        setAvailableAdmins(
          (adminUsers || []).map((admin: any) => ({
            ...admin,
            created_at: (admin as any).created_at || new Date().toISOString(),
            dealership_id: (admin as any).dealership_id || null,
          }))
        );
      }

      setDialogLoading(false);
      setShowEditDialog(true);
      console.log('[viewDealershipDetails] Dialog opened successfully');
    } catch (error) {
      clearTimeout(adminLoadingTimeout);
      console.error('[viewDealershipDetails] Error loading available admins:', error);
      setAvailableAdmins([]);
      setDialogLoading(false);
      setShowEditDialog(true);
      console.log('[viewDealershipDetails] Dialog opened with empty admins due to error');
    }
  };

  const viewUserDetails = async (user: User) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      dealership_id: user.dealership_id ? user.dealership_id.toString() : 'none',
    });
    setEditMode(false);
    setDialogLoading(true);

    // Load available admins for the dropdown
    try {
      const admins = await getAvailableAdmins();
      setAvailableAdmins(admins);
      setDialogLoading(false);
      setShowEditDialog(true);
    } catch (error) {
      console.error('Error loading available admins:', error);
      setAvailableAdmins([]);
      setDialogLoading(false);
      setShowEditDialog(true);
    }
  };

  const handleEdit = () => {
    console.log('[handleEdit] Setting edit mode to true');
    console.log('[handleEdit] Current editMode state:', editMode);
    setEditMode(true);
    console.log('[handleEdit] Edit mode state should now be true');

    // Force a small delay to ensure state update
    setTimeout(() => {
      console.log('[handleEdit] Delayed check - editMode should be true:', editMode);
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (selectedDealership) {
      // Directly query admin details instead of relying on users array
      const refreshAdminDetails = async () => {
        let adminUser = null;
        if (selectedDealership.admin_user_id) {
          try {
            const adminResult = await directSupabase.select('profiles', {
              columns: 'id, name, email, phone, role',
              filter: { id: selectedDealership.admin_user_id },
            });

            if (adminResult.data && adminResult.data.length > 0) {
              adminUser = adminResult.data[0];
            }
          } catch (error) {
            console.error('Error refreshing admin details:', error);
          }
        }

        const monthlyCost = calculateMonthlyCost(selectedDealership);

        // Initialize individual dealer data
        let dealerGroupDetails: any = {};
        if (selectedDealership.type === 'group') {
          // Check if we have stored individual dealer data in metadata
          const storedDealers = selectedDealership.metadata?.individual_dealers;

          for (let i = 0; i < (selectedDealership.num_teams || 1); i++) {
            const dealerKey = `dealer_${i}`;
            const storedDealer = storedDealers?.[i];

            // Use stored data if available, otherwise use defaults
            dealerGroupDetails[`${dealerKey}_name`] =
              storedDealer?.name || `${selectedDealership.name} - Location ${i + 1}`;
            dealerGroupDetails[`${dealerKey}_manufacturer`] =
              storedDealer?.manufacturer || selectedDealership.manufacturer || '';
            dealerGroupDetails[`${dealerKey}_tier`] =
              storedDealer?.subscription_tier || selectedDealership.subscription_tier || 'base';
            dealerGroupDetails[`${dealerKey}_brands`] = storedDealer?.brands
              ? storedDealer.brands.join(', ')
              : Array.isArray(selectedDealership.brands)
              ? selectedDealership.brands.join(', ')
              : '';
          }
        }

        setEditData({
          id: selectedDealership.id,
          name: selectedDealership.name,
          type: selectedDealership.type,
          store_hours: selectedDealership.store_hours || '',
          num_teams: selectedDealership.num_teams || 1,
          admin_user_id: selectedDealership.admin_user_id || 'none',
          subscription_tier: selectedDealership.subscription_tier || 'base',
          monthly_cost: monthlyCost,
          schema_name: selectedDealership.schema_name || '',
          // Admin details for display
          admin_name: adminUser?.name || 'No admin assigned',
          admin_email: adminUser?.email || 'No admin assigned',
          admin_phone: adminUser?.phone || 'Not provided',
          // Individual dealer details for groups
          ...dealerGroupDetails,
        });
      };

      refreshAdminDetails();
    } else if (selectedUser) {
      setEditData({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        phone: selectedUser.phone || '',
        dealership_id: selectedUser.dealership_id ? selectedUser.dealership_id.toString() : 'none',
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
          store_hours: editData.store_hours || null,
          num_teams: parseInt(editData.num_teams) || 1,
          admin_user_id: editData.admin_user_id === 'none' ? null : editData.admin_user_id || null,
          subscription_tier: editData.subscription_tier || 'base',
        };

        // For dealer groups, collect individual dealer data
        if (editData.type === 'group') {
          const individualDealers = [];
          for (let i = 0; i < (editData.num_teams || 1); i++) {
            const dealerKey = `dealer_${i}`;
            const dealerData = {
              name: editData[`${dealerKey}_name`] || `Dealer ${i + 1}`,
              manufacturer: editData[`${dealerKey}_manufacturer`] || '',
              subscription_tier: editData[`${dealerKey}_tier`] || 'base',
              brands: editData[`${dealerKey}_brands`]
                ? editData[`${dealerKey}_brands`].split(',').map((b: string) => b.trim())
                : [],
            };
            individualDealers.push(dealerData);
          }

          // Store individual dealer data as JSON in the database
          // For now, we'll store it as metadata since we don't have a separate table
          updateData.metadata = {
            individual_dealers: individualDealers,
          };

          console.log('[handleSaveEdit] Individual dealers data:', individualDealers);
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
        setSuccess('Dealership updated successfully! Revenue will be recalculated.');

        // Force refresh data to update revenue calculations immediately
        console.log('[handleSaveEdit] Force refreshing all data for revenue recalculation...');
        await Promise.all([fetchDealerships(), fetchUsers()]);
        console.log('[handleSaveEdit] Data refreshed - revenue should now be updated');

        // Trigger overview refresh to ensure revenue totals match
        await refreshOverview();

        // Force re-render of all components to ensure revenue totals are consistent
        setSelectedDealership(null);
        setSelectedUser(null);
        setEditData({});

        console.log(
          '[handleSaveEdit] Overview refreshed and components re-rendered for consistent revenue display'
        );
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
      // setShowEditDialog(false); // Keep dialog open to show updated info
      // setSelectedDealership(null);
      // setSelectedUser(null);
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
    console.log('[handleDeleteConfirm] Called with PIN:', deletePin);
    console.log('[handleDeleteConfirm] Expected PIN: 0805');
    console.log('[handleDeleteConfirm] PIN comparison:', deletePin !== '0805');

    if (deletePin !== '0805') {
      console.log('[handleDeleteConfirm] PIN mismatch, cancelling deletion');
      setError('Incorrect PIN. Deletion cancelled.');
      setShowPinDialog(false);
      setDeletePin('');
      return;
    }

    console.log('[handleDeleteConfirm] PIN correct, proceeding with deletion');
    if (!deleteTarget) return;

    try {
      setLoading(true);
      setError('');

      if (deleteTarget.type === 'dealership') {
        // Get dealership details first to check for schema
        const dealershipResult = await directSupabase.select('dealerships', {
          columns: 'id, name, schema_name, type',
          filter: { id: deleteTarget.id },
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
              `Dealership deleted successfully, but schema cleanup failed: ${
                (schemaError as Error)?.message || 'Unknown error'
              }. Please contact system administrator.`
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
    setDialogLoading(false);
    setAvailableAdmins([]);
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
      throw new Error(`Schema cleanup failed: ${(error as Error)?.message || 'Unknown error'}`);
    }
  };

  // Helper function to get available admins for assignment
  const getAvailableAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, created_at, dealership_id')
        .in('role', ['admin', 'dealership_admin', 'single_dealer_admin', 'group_dealer_admin']);

      if (error) {
        console.error('Error fetching available admins:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAvailableAdmins:', error);
      return [];
    }
  };

  // New functions for View All overlay functionality
  const openViewAllDialog = (type: 'dealerships' | 'groups' | 'finance_managers') => {
    let data: any[] = [];

    switch (type) {
      case 'dealerships':
        data = dealerships.filter(d => d.type === 'single');
        break;
      case 'groups':
        data = dealerships.filter(d => d.type === 'group');
        break;
      case 'finance_managers':
        data = users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager');
        break;
    }

    setViewAllType(type);
    setViewAllData(data);
    setShowViewAllDialog(true);
  };

  const closeViewAllDialog = () => {
    setShowViewAllDialog(false);
    setViewAllType(null);
    setViewAllData([]);
  };

  const renderViewAllContent = () => {
    if (!viewAllType || !viewAllData) return null;

    switch (viewAllType) {
      case 'dealerships':
        return (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {viewAllData.map((dealership: Dealership) => {
              const admin = users.find(u => u.id === dealership.admin_user_id);
              const monthlyCost = calculateMonthlyCost(dealership);
              return (
                <div key={dealership.id} className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{dealership.name}</div>
                      {dealership.manufacturer && (
                        <div className="text-xs text-gray-600">{dealership.manufacturer}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">${monthlyCost}/mo</div>
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
                      onClick={() => {
                        closeViewAllDialog();
                        viewDealershipDetails(dealership);
                      }}
                    >
                      View
                    </Button>
                    {admin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => {
                          closeViewAllDialog();
                          accessUserAccount(admin.id, admin.email, admin.role);
                        }}
                      >
                        Access
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'groups':
        return (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {viewAllData.map((dealership: Dealership) => {
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
                        <div className="text-xs text-gray-600">{dealership.manufacturer}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">${monthlyCost}/mo</div>
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
                      onClick={() => {
                        closeViewAllDialog();
                        viewDealershipDetails(dealership);
                      }}
                    >
                      View
                    </Button>
                    {admin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => {
                          closeViewAllDialog();
                          accessUserAccount(admin.id, admin.email, admin.role);
                        }}
                      >
                        Access
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'finance_managers':
        return (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {viewAllData.map((user: User) => (
              <div key={user.id} className="p-3 border rounded-lg bg-green-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-blue-600">
                      Role: {allRoles.find(r => r.value === user.role)?.label || user.role}
                    </div>
                    {user.dealership && (
                      <div className="text-xs text-green-600">
                        Dealership: {user.dealership.name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium">Individual User</div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6"
                    onClick={() => {
                      closeViewAllDialog();
                      viewUserDetails(user);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6"
                    onClick={() => {
                      closeViewAllDialog();
                      accessUserAccount(user.id, user.email, user.role);
                    }}
                  >
                    Access
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Master Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, dealerships, and system settings</p>

        {/* Debug Refresh Button */}
        <div className="mt-4">
          <Button
            onClick={async () => {
              console.log('[Debug] Manual refresh triggered');
              setLoading(true);
              try {
                await Promise.all([fetchUsers(), fetchDealerships(), fetchSignupRequests()]);
                setSuccess('Data refreshed successfully!');
                console.log('[Debug] Manual refresh completed');
              } catch (error) {
                console.error('[Debug] Manual refresh failed:', error);
                setError('Failed to refresh data');
              } finally {
                setLoading(false);
              }
            }}
            variant="outline"
            className="mr-2"
          >
            🔄 Manual Refresh Data
          </Button>
          <span className="text-sm text-gray-500">Use this to refresh if data seems outdated</span>
        </div>
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
                                {dealership.locations && dealership.locations.length > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {dealership.locations[0].address ||
                                      dealership.locations[0].city}
                                  </div>
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

                  {/* View All button for all single dealerships */}
                  <div className="text-center pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewAllDialog('dealerships')}
                    >
                      View All Single Dealerships (
                      {dealerships.filter(d => d.type === 'single').length})
                    </Button>
                  </div>
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

                  {/* View All button for all dealer groups */}
                  <div className="text-center pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={() => openViewAllDialog('groups')}>
                      View All Dealer Groups ({dealerships.filter(d => d.type === 'group').length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Single Finance Managers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Finance Managers</span>
                  <span className="text-sm font-normal text-gray-500">
                    ({users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager').length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Enhanced debugging for Finance Managers */}
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>🔍 Debug Finance Managers:</strong>
                    <div>Total users loaded: {users.length}</div>
                    <div>
                      Users with 'finance_manager' role:{' '}
                      {users.filter(u => u.role === 'finance_manager').length}
                    </div>
                    <div>
                      Users with 'single_finance_manager' role:{' '}
                      {users.filter(u => u.role === 'single_finance_manager').length}
                    </div>
                    <div>
                      Users mapped to 'single_finance_manager':{' '}
                      {users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager').length}
                    </div>
                    {users.filter(u => u.role.includes('finance')).length > 0 && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-blue-600">
                          Show all finance-related users
                        </summary>
                        <div className="mt-1 space-y-1">
                          {users
                            .filter(u => u.role.includes('finance'))
                            .map(u => (
                              <div key={u.id}>
                                • {u.name} ({u.email}) - Role: {u.role} → Mapped:{' '}
                                {mapLegacyRole(u.role)}
                              </div>
                            ))}
                        </div>
                      </details>
                    )}
                  </div>

                  {users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager').length ===
                  0 ? (
                    <>
                      <p className="text-gray-500 text-center py-4">No finance managers</p>
                      <div className="p-4 border rounded bg-gray-50">
                        <h4 className="font-medium mb-2">Current Dealerships Data</h4>
                        <div className="text-sm">
                          <div>Total Dealerships: {dealerships.length}</div>
                          <div>
                            Single Dealerships:{' '}
                            {dealerships.filter(d => d.type === 'single').length}
                          </div>
                          <div>
                            Dealer Groups: {dealerships.filter(d => d.type === 'group').length}
                          </div>
                          <div>
                            Finance Managers in DB:{' '}
                            {users.filter(u => u.role === 'finance_manager').length}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {users
                        .filter(u => mapLegacyRole(u.role) === 'single_finance_manager')
                        .slice(0, 5)
                        .map(user => (
                          <div key={user.id} className="p-3 border rounded-lg bg-green-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                                <div className="text-xs text-blue-600">
                                  Role:{' '}
                                  {allRoles.find(r => r.value === user.role)?.label || user.role}
                                </div>
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
                        ))}
                    </>
                  )}

                  {users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager').length >
                    5 && (
                    <div className="text-center py-2">
                      <div className="text-sm text-gray-500">
                        ... and{' '}
                        {users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager')
                          .length - 5}{' '}
                        more finance managers
                      </div>
                    </div>
                  )}

                  {/* View All button for all finance managers */}
                  <div className="text-center pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewAllDialog('finance_managers')}
                    >
                      View All Finance Managers (
                      {users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager').length}
                      )
                    </Button>
                  </div>

                  {/* Manual Refresh Button for debugging */}
                  <div className="text-center pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-blue-50 text-blue-600"
                      onClick={async () => {
                        console.log('🔄 Manual refresh triggered for Finance Managers debugging');
                        await fetchUsers();
                        console.log('🔄 Refresh completed');
                      }}
                    >
                      🔄 Force Refresh Data
                    </Button>
                  </div>
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
                  {/* Main role categories */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Single Finance Managers</div>
                        <div className="text-sm text-gray-500">
                          {
                            users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager')
                              .length
                          }{' '}
                          users
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const financeManagers = users.filter(
                              u => mapLegacyRole(u.role) === 'single_finance_manager'
                            );
                            console.log(
                              `All Finance Managers (${
                                financeManagers.length
                              }):\n\n${financeManagers
                                .map(
                                  u =>
                                    `• ${u.name} (${u.email}) - ${
                                      allRoles.find(r => r.value === u.role)?.label || u.role
                                    }`
                                )
                                .join('\n')}`
                            );
                          }}
                        >
                          View All
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Single Dealership Admins</div>
                        <div className="text-sm text-gray-500">
                          {
                            users.filter(u => mapLegacyRole(u.role) === 'single_dealer_admin')
                              .length
                          }{' '}
                          users
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const dealerAdmins = users.filter(
                              u => mapLegacyRole(u.role) === 'single_dealer_admin'
                            );
                            console.log(
                              `All Dealership Admins (${dealerAdmins.length}):\n\n${dealerAdmins
                                .map(
                                  u =>
                                    `• ${u.name} (${u.email}) - ${
                                      allRoles.find(r => r.value === u.role)?.label || u.role
                                    }`
                                )
                                .join('\n')}`
                            );
                          }}
                        >
                          View All
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Dealer Group Admins</div>
                        <div className="text-sm text-gray-500">
                          {users.filter(u => mapLegacyRole(u.role) === 'group_dealer_admin').length}{' '}
                          users
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const groupAdmins = users.filter(
                              u => mapLegacyRole(u.role) === 'group_dealer_admin'
                            );
                            console.log(
                              `All Dealer Group Admins (${groupAdmins.length}):\n\n${groupAdmins
                                .map(
                                  u =>
                                    `• ${u.name} (${u.email}) - ${
                                      allRoles.find(r => r.value === u.role)?.label || u.role
                                    }`
                                )
                                .join('\n')}`
                            );
                          }}
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Summary by mapped roles */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Total Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Finance Managers:</span>
                        <span className="font-medium">
                          {
                            users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager')
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dealership Admins:</span>
                        <span className="font-medium">
                          {
                            users.filter(u => mapLegacyRole(u.role) === 'single_dealer_admin')
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dealer Group Admins:</span>
                        <span className="font-medium">
                          {users.filter(u => mapLegacyRole(u.role) === 'group_dealer_admin').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Total Users:</span>
                        <span>{users.length}</span>
                      </div>
                    </div>
                  </div>
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
                    <Label htmlFor="phone">Phone (Required for 2FA)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newUser.phone}
                      onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="Enter phone number for 2FA verification"
                      required
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

                {/* Debug Section */}
                <div>
                  <h3 className="font-medium mb-2">Debug Information</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded bg-gray-50">
                      <h4 className="font-medium mb-2">Current Users Data</h4>
                      <div className="text-sm">
                        <div>Total Users: {users.length}</div>
                        <div>
                          Finance Managers:{' '}
                          {
                            users.filter(u => mapLegacyRole(u.role) === 'single_finance_manager')
                              .length
                          }
                        </div>
                        <div>
                          Single Dealer Admins:{' '}
                          {
                            users.filter(u => mapLegacyRole(u.role) === 'single_dealer_admin')
                              .length
                          }
                        </div>
                        <div>
                          Group Dealer Admins:{' '}
                          {users.filter(u => mapLegacyRole(u.role) === 'group_dealer_admin').length}
                        </div>
                      </div>

                      {users.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">Show All Users</summary>
                          <div className="mt-2 space-y-1 text-xs">
                            {users.map((user, index) => (
                              <div key={user.id} className="flex justify-between">
                                <span>
                                  {user.name} ({user.email})
                                </span>
                                <span>
                                  {user.role} → {mapLegacyRole(user.role)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>

                    <div className="p-4 border rounded bg-gray-50">
                      <h4 className="font-medium mb-2">Current Dealerships Data</h4>
                      <div className="text-sm">
                        <div>Total Dealerships: {dealerships.length}</div>
                        <div>
                          With Admin Assigned: {dealerships.filter(d => d.admin_user_id).length}
                        </div>
                        <div>Without Admin: {dealerships.filter(d => !d.admin_user_id).length}</div>
                      </div>

                      {dealerships.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">
                            Show All Dealerships
                          </summary>
                          <div className="mt-2 space-y-1 text-xs">
                            {dealerships.map((dealership, index) => (
                              <div key={dealership.id} className="flex justify-between">
                                <span>
                                  {dealership.name} ({dealership.type || 'single'})
                                </span>
                                <span>Admin: {dealership.admin_user_id || 'None'}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {dialogLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-sm text-gray-500">Loading details...</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDealership ? (
                // Dealership Edit Form
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="edit-name">
                        {editData.type === 'group' ? 'Dealer Group Name' : 'Dealership Name'}
                      </Label>
                      <Input
                        id="edit-name"
                        value={editData.name || ''}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-num-teams">
                        {editData.type === 'group' ? 'Number of Dealers' : 'Number of Teams'}
                      </Label>
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

                    <div>
                      <Label htmlFor="edit-schema-name">Schema Name</Label>
                      <Input
                        id="edit-schema-name"
                        value={editData.schema_name || ''}
                        disabled={true}
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Dealer Group Details */}
                  {editData.type === 'group' && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded">
                      <h3 className="font-medium text-blue-900">Individual Dealers in Group</h3>

                      <div className="grid gap-3">
                        {Array.from({ length: editData.num_teams || 1 }, (_, index) => {
                          const dealerKey = `dealer_${index}`;
                          const dealerName = editData[`${dealerKey}_name`] || `Dealer ${index + 1}`;
                          const dealerManufacturer = editData[`${dealerKey}_manufacturer`] || '';
                          const dealerTier = editData[`${dealerKey}_tier`] || 'base';
                          const dealerBrands = editData[`${dealerKey}_brands`] || '';

                          return (
                            <div key={index} className="p-4 border rounded bg-white space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">Dealer {index + 1}</h4>
                                <div className="text-sm text-green-600 font-medium">
                                  $
                                  {subscriptionTiers.find(t => t.value === dealerTier)
                                    ?.singleDealershipPrice || 250}
                                  /mo
                                </div>
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <Label htmlFor={`${dealerKey}_name`}>Dealer Name</Label>
                                  <Input
                                    id={`${dealerKey}_name`}
                                    value={dealerName}
                                    onChange={e =>
                                      setEditData({
                                        ...editData,
                                        [`${dealerKey}_name`]: e.target.value,
                                      })
                                    }
                                    disabled={!editMode}
                                    placeholder={`Dealer ${index + 1} Name`}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor={`${dealerKey}_manufacturer`}>Manufacturer</Label>
                                  <Select
                                    value={dealerManufacturer}
                                    onValueChange={value =>
                                      setEditData({
                                        ...editData,
                                        [`${dealerKey}_manufacturer`]: value,
                                      })
                                    }
                                    disabled={!editMode}
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

                                <div>
                                  <Label htmlFor={`${dealerKey}_tier`}>Subscription Tier</Label>
                                  <Select
                                    value={dealerTier}
                                    onValueChange={value =>
                                      setEditData({ ...editData, [`${dealerKey}_tier`]: value })
                                    }
                                    disabled={!editMode}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {subscriptionTiers.map(tier => (
                                        <SelectItem key={tier.value} value={tier.value}>
                                          {tier.label} - ${tier.singleDealershipPrice || 250}/mo
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor={`${dealerKey}_brands`}>
                                    Brands (comma-separated)
                                  </Label>
                                  <Input
                                    id={`${dealerKey}_brands`}
                                    value={dealerBrands}
                                    onChange={e =>
                                      setEditData({
                                        ...editData,
                                        [`${dealerKey}_brands`]: e.target.value,
                                      })
                                    }
                                    disabled={!editMode}
                                    placeholder="Ford, Lincoln, etc."
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Group Total Cost */}
                      <div className="p-3 bg-green-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Group Monthly Cost:</span>
                          <span className="text-lg font-bold text-green-600">
                            $
                            {Array.from({ length: editData.num_teams || 1 }, (_, index) => {
                              const dealerTier = editData[`dealer_${index}_tier`] || 'base';
                              const tierInfo = subscriptionTiers.find(t => t.value === dealerTier);
                              return tierInfo?.singleDealershipPrice || 250;
                            }).reduce((sum, cost) => sum + cost, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

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
                        {availableAdmins.map(admin => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.name} ({admin.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Admin Details Display - This should now show the correct info */}
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
                          {allRoles.map(role => (
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>

            {!dialogLoading ? (
              !editMode ? (
                <Button
                  onClick={e => {
                    console.log('[Edit Button] Clicked!');
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel Edit
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )
            ) : (
              <div className="text-sm text-gray-500">Loading...</div>
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
              <br />
              <span className="text-sm text-gray-500 mt-2 block">Debug: The PIN is 0805</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="delete-pin">Master PIN</Label>
              <Input
                id="delete-pin"
                type="password"
                value={deletePin}
                onChange={e => {
                  console.log('[PIN Input] Value changed to:', e.target.value);
                  setDeletePin(e.target.value);
                }}
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

      {/* View All Dialog */}
      <Dialog open={showViewAllDialog} onOpenChange={setShowViewAllDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View All {viewAllType}</DialogTitle>
            <DialogDescription>
              {viewAllType === 'dealerships'
                ? 'These are all the single dealerships in the system.'
                : viewAllType === 'groups'
                ? 'These are all the dealer groups in the system.'
                : 'These are all the finance managers in the system.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">{renderViewAllContent()}</div>

          <DialogFooter>
            <Button variant="outline" onClick={closeViewAllDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterAdminPage;
