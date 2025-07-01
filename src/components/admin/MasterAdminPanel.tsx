import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createDealership,
  createDealershipGroup,
  getDealerships,
  getDealershipGroups,
  logSchemaOperation,
  updateUserRole,
  testDealershipConnection,
  getDealershipSupabaseConfig,
  createDealershipUser,
  getDealershipUsers,
  createDealershipSchema,
  deleteDealershipGroup,
  deleteDealership,
  getSignupRequests,
  approveSignupRequest,
  rejectSignupRequest,
  SignupRequest,
} from '../../lib/apiService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from '../../lib/use-toast';
import { Loader2, Plus, Check, X, Info, Trash, Eye, EyeOff, Bell, UserPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { supabase } from '../../lib/supabaseClient';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { isAuthenticated, getCurrentUser } from '../../lib/directAuth';

// Define interfaces for our data types
interface DealershipGroup {
  id: number;
  name: string;
  logo_url?: string;
}

interface Dealership {
  id: number;
  name: string;
  group_id?: number;
  schema_name: string;
  logo_url?: string;
  locations?: string;
  brands?: string;
}

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  dealership_id?: number;
  role?: string;
  is_group_admin?: boolean;
  is_simulated?: boolean;
  group_name?: string;
  dealership_name?: string;
}

// Car Manufacturers list
const CAR_MANUFACTURERS = [
  'Acura',
  'Audi',
  'BMW',
  'Buick',
  'Cadillac',
  'CDJR', // Chrysler Dodge Jeep Ram
  'Chevrolet',
  'Ferrari',
  'Ford',
  'GMC',
  'Honda',
  'Hyundai',
  'Lamborghini',
  'Land Rover',
  'Lexus',
  'Lincoln',
  'Lucid',
  'Mazda',
  'Mercedes',
  'Mini',
  'Mitsubishi',
  'Porsche',
  'Rivian',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
];

// US States list
const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

// Add a toggle for mock data - always use real data
const USE_MOCK_DATA = false;

// Create a new function that overrides isAuthenticated to always return false
const isDirectAuth = () => {
  // Use the environment variable if available, otherwise default to false
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  // Always return false to force real data loading
  return useMockData && isAuthenticated();
};

export function MasterAdminPanel() {
  const { user } = useAuth();

  // State for data
  const [groups, setGroups] = useState<DealershipGroup[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [simulatedAdmins, setSimulatedAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('simulatedAdmins');
    return saved ? JSON.parse(saved) : [];
  });

  // State for loading
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDealerships, setLoadingDealerships] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [creatingDealership, setCreatingDealership] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // State for forms
  const [groupForm, setGroupForm] = useState({
    name: '',
    logo_url: '',
    brands: [] as string[],
  });

  const [dealershipForm, setDealershipForm] = useState({
    name: '',
    group_id: '',
    logo_url: '',
    city: '',
    state: '',
    brands: [] as string[],
  });

  const [adminForm, setAdminForm] = useState({
    email: '',
    name: '',
    dealership_id: '',
    group_id: '',
    is_group_admin: false,
    password: '',
    phone: '',
  });

  // Add state for dealership project management
  const [selectedDealership, setSelectedDealership] = useState<number | null>(null);
  const [dealershipConnection, setDealershipConnection] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [dealershipUsers, setDealershipUsers] = useState<any[]>([]);
  const [loadingDealershipUsers, setLoadingDealershipUsers] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Add state for dialogs
  const [isSupabaseInfoOpen, setIsSupabaseInfoOpen] = useState(false);
  const [isConfirmGroupDialogOpen, setIsConfirmGroupDialogOpen] = useState(false);
  const [isConfirmDealershipDialogOpen, setIsConfirmDealershipDialogOpen] = useState(false);

  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Add to the state declarations after all the other state variables
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [purgeEmailInput, setPurgeEmailInput] = useState('');

  // Add state for signup requests
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [loadingSignupRequests, setLoadingSignupRequests] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [schemaNameInput, setSchemaNameInput] = useState('');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminNameInput, setAdminNameInput] = useState('');
  const [tempPasswordInput, setTempPasswordInput] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Add state for notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Flag to check if we're in demo/test mode
  const isTestEnvironment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('netlify') ||
    window.location.hostname.includes('vercel');

  // Add emergency manual confirmation for test accounts
  const confirmTestAccount = async (email: string) => {
    try {
      console.log('[MasterAdminPanel] Starting manual confirmation for:', email);

      if (
        !confirm(
          `Are you sure you want to manually confirm the email for ${email}? This is for emergency testing only.`
        )
      ) {
        return;
      }

      // Try a direct approach for test accounts - get users from auth.users table
      try {
        console.log('Attempting to get user list from auth system');
        const { data: authData, error: authError } = await supabase
          .from('auth')
          .select('*')
          .limit(1);

        // This will likely fail and we'll move to the fallback approaches
        if (authError) {
          console.log('Auth direct access failed as expected:', authError.message);
        }
      } catch (authErr) {
        console.log('Auth direct access error:', authErr);
      }

      // Fallback to profiles table search - this is more likely to work
      console.log('Searching in profiles table');
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (userError || !userData) {
        // Try searching with a pattern for test accounts
        const userName = email.split('@')[0];
        const { data: matchedUsers, error: matchError } = await supabase
          .from('profiles')
          .select('id, email')
          .or(`email.ilike.${userName}%,email.eq.${email}`)
          .limit(10);

        console.log(`Profile search for ${userName}% found:`, matchedUsers?.length || 0, 'matches');

        if (matchError || !matchedUsers?.length) {
          safeToast({
            title: 'Error',
            description: `Couldn't find any user with email similar to ${email}`,
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

          // Try the first one
          if (
            confirm(`Would you like to try confirming the first match: ${matchedUsers[0].email}?`)
          ) {
            await updateConfirmationStatus(matchedUsers[0].id, matchedUsers[0].email);
          }
          return;
        }

        // Use the first match
        const userId = matchedUsers[0].id;
        const actualEmail = matchedUsers[0].email;

        // Try to confirm the user
        await updateConfirmationStatus(userId, actualEmail);
      } else {
        // We found the exact user, try to confirm them
        await updateConfirmationStatus(userData.id, userData.email);
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

  // Helper function to update confirmation status
  const updateConfirmationStatus = async (userId: string, email: string) => {
    try {
      console.log(`Attempting to confirm user: ${email} (${userId})`);

      // First try direct SQL approach - this is a security risk in production, only for emergency testing
      try {
        const statementResult = await supabase.rpc('force_confirm_email', {
          user_id_param: userId,
        });

        console.log('Force confirm result:', statementResult);
        if (statementResult.error) {
          console.error('SQL approach error:', statementResult.error);
          throw statementResult.error;
        }

        safeToast({
          title: 'Success',
          description: `User ${email} has been confirmed via SQL. They can now log in with Password123!`,
        });

        console.log(`[MasterAdminPanel] Successfully confirmed test account ${email}`);
        return;
      } catch (sqlError) {
        console.error('SQL method failed:', sqlError);
      }

      // Fallback: Try using the auth update API if available
      try {
        console.log('Trying admin API approach');

        // This is a placeholder for the admin API - may not work without proper Supabase setup
        safeToast({
          title: 'Warning',
          description: `Confirmation may have failed - RPC function unavailable. Try creating a new test account.`,
        });
      } catch (adminError) {
        console.error('Admin update failed:', adminError);
      }

      // If we get here, show instructions for manual approach
      alert(`The system couldn't automatically confirm the account. Consider these options:
1. Create a new test account in the Admin panel
2. Use a magic link login (requires proper email setup)
3. Check Supabase dashboard directly to confirm the email`);
    } catch (err) {
      console.error(`[MasterAdminPanel] Error updating confirmation status:`, err);
      safeToast({
        title: 'Error',
        description: `Failed to confirm user: ${err}`,
        variant: 'destructive',
      });
    }
  };

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Update localStorage when simulatedAdmins changes
  useEffect(() => {
    localStorage.setItem('simulatedAdmins', JSON.stringify(simulatedAdmins));
  }, [simulatedAdmins]);

  // Fetch admin users with additional group info
  const fetchUsersWithGroupInfo = async () => {
    setLoadingUsers(true);
    try {
      console.log('[MasterAdminPanel] Fetching admin users...');

      // Get basic admin user data with proper OR syntax for Supabase
      let adminUsers: any[] = [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, dealership_id, role, is_group_admin')
        .or('role.eq.dealership_admin,role.eq.admin') // This causes a 400 error with this syntax
        .order('name');

      if (error) {
        console.error('[MasterAdminPanel] Error with OR query, trying alternate approach:', error);

        // Try with separate queries instead of OR
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id, email, name, dealership_id, role, is_group_admin')
          .eq('role', 'admin')
          .order('name');

        const { data: dealerAdminData, error: dealerAdminError } = await supabase
          .from('profiles')
          .select('id, email, name, dealership_id, role, is_group_admin')
          .eq('role', 'dealership_admin')
          .order('name');

        if (adminError) {
          console.error('[MasterAdminPanel] Error fetching admin users:', adminError);
        }

        if (dealerAdminError) {
          console.error(
            '[MasterAdminPanel] Error fetching dealership admin users:',
            dealerAdminError
          );
        }

        // Combine results from both queries
        adminUsers = [...(adminData || []), ...(dealerAdminData || [])];

        if (adminUsers.length === 0) {
          console.warn('[MasterAdminPanel] No admin users found in either query');
        }
      } else {
        adminUsers = data || [];
      }

      console.log('[MasterAdminPanel] Admins before enhancement:', adminUsers.length);

      // Add dealer group info to each admin
      const enhancedAdmins = await Promise.all(
        adminUsers.map(async admin => {
          // Get dealership info
          const dealership = dealerships.find(d => d.id === admin.dealership_id);

          // Determine if admin is a group admin (either by flag or by having a group_id)
          const isGroupAdmin =
            admin.is_group_admin ||
            (dealership?.group_id !== null && dealership?.group_id !== undefined);

          // Get group info if dealership has a group
          let groupName = null;
          if (dealership?.group_id) {
            const group = groups.find(g => g.id === dealership.group_id);
            groupName = group?.name;
          }

          console.log(`[MasterAdminPanel] Admin ${admin.email} info:`, {
            dealership_id: admin.dealership_id,
            dealership_name: dealership?.name,
            role: admin.role,
            is_group_admin: admin.is_group_admin,
            group_id: dealership?.group_id,
            group_name: groupName,
          });

          return {
            ...admin,
            dealership_name: dealership?.name || 'Unknown Dealership',
            is_group_admin: isGroupAdmin,
            group_id: dealership?.group_id,
            group_name: groupName,
          };
        })
      );

      // Combine real admins with simulated test admins from localStorage
      const realAdmins = enhancedAdmins || [];
      const allAdmins = [...realAdmins, ...simulatedAdmins];

      setUsers(allAdmins);
      console.log('[MasterAdminPanel] Fetched admin users:', allAdmins);
    } catch (error) {
      console.error('[MasterAdminPanel] Error fetching admin users:', error);
      safeToast({
        title: 'Error',
        description: 'Failed to load admin users',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Use the new function instead of fetchUsers
  useEffect(() => {
    fetchGroups();
    fetchDealerships();
    fetchUsersWithGroupInfo();
    fetchSignupRequests();
    fetchAdminNotifications(); // Add this line to fetch notifications

    // Set up a timer to check for new notifications every 30 seconds
    const notificationTimer = setInterval(() => {
      fetchAdminNotifications();
    }, 30000);

    return () => {
      clearInterval(notificationTimer);
    };
  }, []);

  // Fetch dealership groups
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const groupsData = await getDealershipGroups();

      // Merge with existing groups to preserve _selectedBrands
      const mergedGroups = groupsData.map(newGroup => {
        // Find matching existing group that might have _selectedBrands property
        const existingGroup = groups.find(g => g.id === newGroup.id);

        // If we have an existing group with _selectedBrands, preserve it
        if (existingGroup && existingGroup._selectedBrands) {
          return {
            ...newGroup,
            _selectedBrands: existingGroup._selectedBrands,
          };
        }

        return newGroup;
      });

      setGroups(mergedGroups);
      console.log('[MasterAdminPanel] Fetched dealership groups:', mergedGroups);
    } catch (error) {
      console.error('[MasterAdminPanel] Error fetching dealership groups:', error);
      if (toast && typeof toast === 'object') {
        toast({
          title: 'Error',
          description: 'Failed to load dealership groups',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch dealerships
  const fetchDealerships = async () => {
    setLoadingDealerships(true);
    try {
      console.log('[MasterAdminPanel] Fetching dealerships...');
      const dealershipsData = await getDealerships();

      // Debug info about dealerships and their group associations
      console.log(
        `[MasterAdminPanel] Fetched ${dealershipsData.length} dealerships with these group_ids:`,
        dealershipsData.map(d => ({ id: d.id, name: d.name, group_id: d.group_id }))
      );

      // Count dealerships per group for debugging
      const groupCounts = {};
      dealershipsData.forEach(d => {
        if (d.group_id) {
          groupCounts[d.group_id] = (groupCounts[d.group_id] || 0) + 1;
        }
      });

      console.log('[MasterAdminPanel] Dealerships per group:', groupCounts);

      setDealerships(dealershipsData);
    } catch (error) {
      console.error('[MasterAdminPanel] Error fetching dealerships:', error);
      if (toast && typeof toast === 'object') {
        toast({
          title: 'Error',
          description: 'Failed to load dealerships',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingDealerships(false);
    }
  };

  // Handle brand selection for groups
  const toggleGroupBrand = (brand: string) => {
    setGroupForm(prev => {
      const brands = [...prev.brands];
      const index = brands.indexOf(brand);

      if (index === -1) {
        brands.push(brand);
      } else {
        brands.splice(index, 1);
      }

      return { ...prev, brands };
    });
  };

  // Modified to safely call toast
  const safeToast = props => {
    console.log('[MasterAdminPanel] Attempting to show toast:', props);
    try {
      if (typeof toast === 'function') {
        toast(props);
        console.log('[MasterAdminPanel] Toast displayed successfully');
      } else {
        console.log('[MasterAdminPanel] Toast function not available');
      }
    } catch (err) {
      console.error('[MasterAdminPanel] Error displaying toast:', err);
    }
  };

  // Validate form before submitting
  const validateGroupForm = () => {
    if (!groupForm.name) {
      safeToast({
        title: 'Error',
        description: 'Group name is required',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  // Modified handler for group form submission
  const handleGroupFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[MasterAdminPanel] Group form submitted, validating...');
    if (validateGroupForm()) {
      console.log('[MasterAdminPanel] Group validation passed, creating group...');
      // Directly call createGroup instead of opening a confirmation dialog
      createGroup();
    }
  };

  // Actual group creation function
  const createGroup = async () => {
    console.log('[MasterAdminPanel] Starting group creation process');
    setCreatingGroup(true);
    setIsConfirmGroupDialogOpen(false); // Close dialog immediately

    // Declare variables at function scope
    let newDealerships = [];
    let selectedBrands = [];

    try {
      console.log('[MasterAdminPanel] Creating dealership group with name only');

      // Create group with only the name field - absolute minimum
      const groupData = {
        name: groupForm.name,
        // No other fields at all
      };

      console.log('[MasterAdminPanel] Group data to create:', groupData);

      // Create the group with the prepared data
      const newGroup = await createDealershipGroup(groupData);

      console.log('[MasterAdminPanel] Group created successfully:', newGroup);

      // Update state with the created group and add selected brands to local state
      const enhancedGroup = {
        ...newGroup,
        // Store brands in local state only
        _selectedBrands: groupForm.brands,
      };

      setGroups(prevGroups => [...prevGroups, enhancedGroup]);

      // Automatically create dealerships for each selected brand
      try {
        console.log('[MasterAdminPanel] Creating dealerships for each brand in the group');

        // Get the brands to create dealerships for
        selectedBrands = groupForm.brands.length > 0 ? groupForm.brands : ['Default']; // If no brands selected, create at least one default dealership

        newDealerships = [];

        for (const brand of selectedBrands) {
          // Generate schema name based on group name and brand
          const schemaName = `dealership_${brand
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')}_${newGroup.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().substring(0, 10)}`;

          // Create dealership name based on brand
          const dealershipName =
            brand === 'Default' ? `${newGroup.name} Main Dealership` : `${newGroup.name} ${brand}`;

          // Default dealership data
          const dealershipData = {
            name: dealershipName,
            group_id: newGroup.id,
            schema_name: schemaName,
            brands: brand !== 'Default' ? JSON.stringify([brand]) : null,
            store_hours: JSON.stringify({
              monday: '9AM-8PM',
              tuesday: '9AM-8PM',
              wednesday: '9AM-8PM',
              thursday: '9AM-8PM',
              friday: '9AM-8PM',
              saturday: '9AM-6PM',
              sunday: 'Closed',
            }),
            num_teams: 3,
          };

          console.log(
            `[MasterAdminPanel] Creating dealership for brand "${brand}"`,
            dealershipData
          );

          // Create the dealership
          const newDealership = await createDealership(dealershipData);
          console.log(`[MasterAdminPanel] Dealership created for brand "${brand}"`, newDealership);

          // Create schema for the new dealership
          try {
            const schemaResult = await createDealershipSchema(schemaName);
            console.log(
              `[MasterAdminPanel] Schema creation result for ${brand} dealership:`,
              schemaResult
            );
          } catch (schemaError) {
            console.error(
              `[MasterAdminPanel] Error creating schema for ${brand} dealership:`,
              schemaError
            );
            // Continue anyway since the dealership was created
          }

          // Log operation
          await logSchemaOperation('create_brand_dealership', {
            dealershipId: newDealership.id,
            dealershipName: newDealership.name,
            groupId: newGroup.id,
            groupName: newGroup.name,
            brand,
            schemaName,
            createdBy: user?.id,
            timestamp: new Date().toISOString(),
          });

          newDealerships.push(newDealership);
        }

        // Add the new dealerships to state
        setDealerships(prevDealerships => [...prevDealerships, ...newDealerships]);

        const dealershipCount = newDealerships.length;
        const brandText =
          selectedBrands.length > 1
            ? `brands (${selectedBrands.join(', ')})`
            : selectedBrands[0] === 'Default'
            ? 'default'
            : `brand ${selectedBrands[0]}`;

        safeToast({
          title: 'Success',
          description: `Created ${dealershipCount} dealership${
            dealershipCount > 1 ? 's' : ''
          } for ${brandText}`,
        });
      } catch (dealershipError) {
        console.error(
          '[MasterAdminPanel] Error creating brand dealerships for group:',
          dealershipError
        );
        safeToast({
          title: 'Warning',
          description: `Group created, but failed to create all dealerships. You may need to create additional dealerships manually.`,
          variant: 'destructive',
        });
      }

      // Reset form
      setGroupForm({
        name: '',
        logo_url: '',
        brands: [],
      });

      // Show success message
      safeToast({
        title: 'Success',
        description: `Dealership group "${newGroup.name}" created successfully with ${
          newDealerships.length
        } dealership${newDealerships.length !== 1 ? 's' : ''} for ${selectedBrands.length} brand${
          selectedBrands.length !== 1 ? 's' : ''
        }`,
        duration: 6000,
      });

      // Refresh dealerships but don't refresh groups to avoid losing _selectedBrands
      fetchDealerships();

      console.log('[MasterAdminPanel] Group creation process completed');
    } catch (error) {
      console.error('[MasterAdminPanel] Error creating dealership group:', error);
      // Show error message
      safeToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create dealership group',
        variant: 'destructive',
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  // Modified handler for opening dealership confirmation dialog
  const handleDealershipFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[MasterAdminPanel] Dealership form submitted, validating...');
    if (validateDealershipForm()) {
      console.log('[MasterAdminPanel] Dealership validation passed, opening confirmation dialog');
      setIsConfirmDealershipDialogOpen(true);
    }
  };

  // Validate dealership form
  const validateDealershipForm = () => {
    if (!dealershipForm.name) {
      safeToast({
        title: 'Error',
        description: 'Dealership name is required',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  // Actual dealership creation function
  const createDealershipEntity = async () => {
    console.log('[MasterAdminPanel] Starting dealership creation process');
    setCreatingDealership(true);
    setIsConfirmDealershipDialogOpen(false); // Close dialog immediately

    try {
      console.log('[MasterAdminPanel] Creating dealership with data:', dealershipForm);

      // Generate schema name based on dealership name
      const schemaName = `dealership_${dealershipForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().substring(0, 10)}`;

      console.log(`[MasterAdminPanel] Using schema-based multi-tenancy with schema: ${schemaName}`);

      // Create locations array from city and state
      let locations = [];
      if (dealershipForm.city || dealershipForm.state) {
        locations = [
          {
            city: dealershipForm.city,
            state: dealershipForm.state,
          },
        ];
      }

      // Ensure the group_id is properly set if provided
      let groupId = null;
      if (dealershipForm.group_id) {
        groupId = parseInt(dealershipForm.group_id);
        console.log(`[MasterAdminPanel] Assigning dealership to group ID: ${groupId}`);
      }

      // Store brand information separately if needed
      const selectedBrands = dealershipForm.brands;

      // Format brands as a JSON array if provided
      const brandsJson = selectedBrands.length > 0 ? JSON.stringify(selectedBrands) : null;

      console.log('[MasterAdminPanel] Creating dealership in database with schema:', schemaName);
      console.log('[MasterAdminPanel] Selected brands:', selectedBrands);
      console.log('[MasterAdminPanel] Group ID:', groupId);

      // Create dealership with schema_name
      const dealershipData = {
        name: dealershipForm.name,
        group_id: groupId,
        schema_name: schemaName,
        logo_url: dealershipForm.logo_url || undefined,
        locations,
        brands: brandsJson,
        // Add required fields
        store_hours: JSON.stringify({
          monday: '9AM-8PM',
          tuesday: '9AM-8PM',
          wednesday: '9AM-8PM',
          thursday: '9AM-8PM',
          friday: '9AM-8PM',
          saturday: '9AM-6PM',
          sunday: 'Closed',
        }),
        num_teams: 3, // Default value
      };

      console.log('[MasterAdminPanel] Final dealership data:', dealershipData);

      const newDealership = await createDealership(dealershipData);

      console.log(
        '[MasterAdminPanel] Dealership created in database:',
        JSON.stringify(newDealership, null, 2)
      );

      // Create schema for the new dealership using the new function
      try {
        const schemaResult = await createDealershipSchema(schemaName);
        console.log('[MasterAdminPanel] Schema creation result:', schemaResult);
      } catch (schemaError) {
        console.error('[MasterAdminPanel] Error creating schema:', schemaError);
        safeToast({
          title: 'Warning',
          description: `Dealership created but schema creation failed: ${schemaError.message}. Please contact support.`,
          variant: 'destructive',
        });
        // Continue anyway since the dealership was created
      }

      // Log operation
      await logSchemaOperation('create_dealership', {
        dealershipId: newDealership.id,
        dealershipName: newDealership.name,
        schemaName,
        createdBy: user?.id,
        timestamp: new Date().toISOString(),
      });

      // Update state and reset form
      setDealerships(prevDealerships => [...prevDealerships, newDealership]);
      setDealershipForm({
        name: '',
        group_id: '',
        logo_url: '',
        city: '',
        state: '',
        brands: [],
      });

      // Show success message
      safeToast({
        title: 'Success',
        description: `Dealership "${newDealership.name}" created successfully with schema ${schemaName}`,
      });

      console.log('[MasterAdminPanel] Dealership creation process completed');
    } catch (error) {
      console.error('[MasterAdminPanel] Error creating dealership:', error);
      safeToast({
        title: 'Error',
        description:
          typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : 'Failed to create dealership',
        variant: 'destructive',
      });
    } finally {
      setCreatingDealership(false);
    }
  };

  // Modify the isTestEmail function to be more lenient
  const isTestEmail = (email: string): boolean => {
    const testDomains = [
      'example.com',
      'test.com',
      'fake.com',
      'testing.com',
      'mailinator.com',
      'temp-mail.org',
      'tempmail.com',
      'sportdursttest.com', // Your specific test domain
    ];

    // Also allow emails that have a valid format but without a real domain verification
    // This makes it easier to create test accounts with domains that Supabase accepts
    const domain = email.split('@').pop()?.toLowerCase();
    return (
      testDomains.includes(domain || '') ||
      domain?.includes('test') ||
      domain?.includes('fake') ||
      domain?.includes('example') ||
      email.startsWith('test') ||
      email.includes('test+')
    );
  };

  // Modify the generateSafeTestEmail function to handle full email addresses
  const generateSafeTestEmail = (baseName: string) => {
    // If it's an @exampletest.com email, keep it as is - no transformation needed
    if (baseName.includes('@exampletest.com')) {
      return baseName;
    }

    // Make sure we only use the username part of any email
    const userName = baseName.includes('@') ? baseName.split('@')[0] : baseName;

    // Create a format that's more likely to pass Supabase validation
    // Using gmail.com which is typically allowed in most systems
    const timestamp = new Date().getTime().toString().substring(6, 10);
    return `${userName}${timestamp}@gmail.com`;
  };

  // Add a new function to purge a specific test account by email
  const purgeTestAccount = async (email: string) => {
    try {
      if (
        !confirm(
          `Are you sure you want to completely purge the account ${email}? This will attempt to remove all traces of this account.`
        )
      ) {
        return;
      }

      console.log(`[MasterAdminPanel] Attempting to purge test account: ${email}`);

      // Step 1: Find user by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .or(`email.eq.${email},email.ilike.${email.replace('@', '%')}`)
        .limit(10);

      if (profileError) {
        console.error(`[MasterAdminPanel] Error finding profile for ${email}:`, profileError);
      }

      // Step 2: Try direct delete from auth users table via RPC
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'admin_delete_user_by_email',
          {
            email_param: email,
          }
        );

        if (rpcError) {
          console.warn(`[MasterAdminPanel] RPC delete failed: ${rpcError.message}`);
        } else {
          console.log(`[MasterAdminPanel] RPC delete result:`, rpcData);
        }
      } catch (rpcErr) {
        console.error(`[MasterAdminPanel] RPC error:`, rpcErr);
      }

      // Step 3: Delete profile records if found
      let deletedProfiles = 0;
      if (profileData && profileData.length > 0) {
        for (const profile of profileData) {
          console.log(`[MasterAdminPanel] Deleting profile for user:`, profile);

          // Delete from profiles
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id);

          if (deleteError) {
            console.error(
              `[MasterAdminPanel] Error deleting profile for ${profile.email}:`,
              deleteError
            );
          } else {
            deletedProfiles++;
          }

          // Also try delete from auth if we have an ID
          try {
            const { error: authDeleteError } = await supabase.auth.admin.deleteUser(profile.id);
            if (authDeleteError) {
              console.warn(
                `[MasterAdminPanel] Auth delete failed for ${profile.email}:`,
                authDeleteError
              );
            }
          } catch (authErr) {
            console.error(`[MasterAdminPanel] Auth delete error:`, authErr);
          }
        }
      }

      // Step 4: Remove from simulated admins if present
      const originalCount = simulatedAdmins.length;
      setSimulatedAdmins(prev =>
        prev.filter(admin => admin.email !== email && !admin.email.includes(email.split('@')[0]))
      );

      const simulatedRemoved = originalCount - simulatedAdmins.length;

      safeToast({
        title: 'Account Purge Attempted',
        description: `Removed ${deletedProfiles} profile records and ${simulatedRemoved} simulated entries for ${email}. You should now be able to recreate this account.`,
      });

      // Refresh the users list
      fetchUsersWithGroupInfo();
    } catch (error) {
      console.error(`[MasterAdminPanel] Error purging account ${email}:`, error);
      safeToast({
        title: 'Error',
        description: 'Failed to purge account completely',
        variant: 'destructive',
      });
    }
  };

  // Modify the cleanupTestAccounts function for better effectiveness
  const cleanupTestAccounts = async () => {
    try {
      if (
        !confirm(
          'Are you sure you want to remove all test accounts except testadmin@example.com? This cannot be undone.'
        )
      ) {
        return;
      }

      // Step 1: Get all users from profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, role, is_test_account')
        .not('email', 'eq', 'testadmin@example.com');

      if (usersError) throw usersError;

      // Filter for test accounts
      let testAccountsRemoved = 0;
      const testUsers = usersData.filter(
        u =>
          isTestEmail(u.email) ||
          u.is_test_account === true ||
          simulatedAdmins.some(a => a.id === u.id)
      );

      console.log(`[MasterAdminPanel] Found ${testUsers.length} test accounts to clean up`);

      // Step 2: Try using server-side RPC for bulk deletion (more effective)
      try {
        const emails = testUsers.map(u => u.email);
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'admin_delete_test_accounts',
          {
            email_list: emails,
            exclude_email: 'testadmin@example.com',
          }
        );

        if (rpcError) {
          console.warn(`[MasterAdminPanel] Bulk RPC delete failed: ${rpcError.message}`);
        } else {
          console.log(`[MasterAdminPanel] Bulk RPC delete result:`, rpcData);
          testAccountsRemoved = rpcData.count || 0;
        }
      } catch (rpcErr) {
        console.error(`[MasterAdminPanel] Bulk RPC error:`, rpcErr);
      }

      // Step 3: Fallback to individual deletion
      if (testAccountsRemoved === 0) {
        console.log(
          `[MasterAdminPanel] RPC bulk delete failed, falling back to individual deletion`
        );

        for (const user of testUsers) {
          try {
            // Delete profile record first
            const { error: profileError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', user.id);

            if (profileError) {
              console.warn(
                `[MasterAdminPanel] Could not delete profile for ${user.email}: ${profileError.message}`
              );
            }

            // Try to remove from auth (may fail due to permissions)
            const { error } = await supabase.auth.admin.deleteUser(user.id);
            if (error) {
              console.warn(
                `[MasterAdminPanel] Could not delete user ${user.email} from auth: ${error.message}`
              );
              continue;
            }
            testAccountsRemoved++;
          } catch (err) {
            console.error(`[MasterAdminPanel] Error removing user ${user.email}:`, err);
          }
        }
      }

      // Clear simulated admins from localStorage
      setSimulatedAdmins([]);

      safeToast({
        title: 'Test Accounts Cleaned Up',
        description: `Attempted to remove ${testUsers.length} test accounts. Successfully removed ${testAccountsRemoved}. Main testadmin@example.com was preserved.`,
        duration: 8000,
      });

      // Refresh the users list
      fetchUsersWithGroupInfo();
    } catch (error) {
      console.error('[MasterAdminPanel] Error cleaning up test accounts:', error);
      safeToast({
        title: 'Error',
        description: 'Failed to clean up test accounts',
        variant: 'destructive',
      });
    }
  };

  // Create a full set of test staff for a dealership
  const createTestStaffForDealership = async (dealershipId: number) => {
    if (!dealershipId) {
      safeToast({
        title: 'Error',
        description: 'Please select a dealership first',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (
        !confirm(
          'This will create a full set of test staff members (Sales, Finance, Management) for the selected dealership. Continue?'
        )
      ) {
        return;
      }

      const staffRoles = [
        { role: 'salesperson', name: 'Sales Person', count: 3 },
        { role: 'finance_manager', name: 'Finance Manager', count: 1 },
        { role: 'sales_manager', name: 'Sales Manager', count: 2 },
        { role: 'general_manager', name: 'General Manager', count: 1 },
      ];

      const generatedStaff = [];
      const baseSalaryByRole = {
        salesperson: 50000,
        finance_manager: 75000,
        sales_manager: 85000,
        general_manager: 120000,
      };

      for (const roleInfo of staffRoles) {
        for (let i = 1; i <= roleInfo.count; i++) {
          const firstName = `Test${
            roleInfo.role.split('_')[0].charAt(0).toUpperCase() +
            roleInfo.role.split('_')[0].slice(1)
          }`;
          const lastName = `${i}`;
          const baseSuffix = `${roleInfo.role.replace('_', '')}${i}`;

          // Generate email unlikely to be rejected
          const email = generateSafeTestEmail(baseSuffix);
          const password = 'Password123!';

          // Create user
          const userData = {
            name: `${firstName} ${lastName}`,
            role: roleInfo.role,
            dealership_id: dealershipId,
            is_test_account: true,
          };

          try {
            const user = await createTestUserDirectly(email, password, userData);

            // Make additional profile updates if needed
            await supabase
              .from('profiles')
              .update({
                first_name: firstName,
                last_name: lastName,
                salary: baseSalaryByRole[roleInfo.role] || 50000,
                hire_date: new Date().toISOString().split('T')[0],
                is_active: true,
              })
              .eq('id', user.id);

            generatedStaff.push({
              name: `${firstName} ${lastName}`,
              role: roleInfo.name,
              email: email,
            });
          } catch (err) {
            console.error(`Error creating ${roleInfo.name}:`, err);
          }
        }
      }

      safeToast({
        title: 'Test Staff Created',
        description: `Created ${generatedStaff.length} test staff members for the dealership. All use password: Password123!`,
        duration: 8000,
      });

      console.table(generatedStaff);
    } catch (error) {
      console.error('[MasterAdminPanel] Error creating test staff:', error);
      safeToast({
        title: 'Error',
        description: 'Failed to create test staff',
        variant: 'destructive',
      });
    }
  };

  // Modify the createTestUserDirectly function to auto-confirm test users
  const createTestUserDirectly = async (email, password, userData) => {
    try {
      console.log('[MasterAdminPanel] Creating test user directly via API:', email);
      console.log('[MasterAdminPanel] User data for test user:', userData);

      // For test accounts in local/development environment, create a pre-confirmed account
      // This would typically be a server API call in production, but for testing,
      // we're reusing the signUp flow and ensuring the account is confirmed

      // Step 1: Sign up normally
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      console.log('[MasterAdminPanel] Sign up successful for test user:', email);
      console.log('[MasterAdminPanel] User ID:', data.user.id);

      // Step 2: Auto-confirm test emails by using admin functions
      // This is a workaround - in production you'd use Supabase admin API
      try {
        // First approach: Try directly using RPC to bypass email confirmation
        // This works in some Supabase setups where RPC is enabled
        console.log('[MasterAdminPanel] Attempting to auto-confirm test account:', email);

        // Create a server-side function to verify the email
        const functionName = 'auto_confirm_test_email';
        const { error: rpcError } = await supabase.rpc(functionName, { user_id: data.user.id });

        if (rpcError) {
          console.warn(
            '[MasterAdminPanel] Could not auto-confirm email via RPC:',
            rpcError.message
          );
          console.log(
            '[MasterAdminPanel] Direct database update not available - test users will need to use magic link login'
          );
        } else {
          console.log('[MasterAdminPanel] Successfully confirmed test email address');
        }
      } catch (confirmError) {
        console.warn('[MasterAdminPanel] Error in auto-confirm process:', confirmError);
      }

      // Step 3: Ensure profile record exists with proper role
      try {
        console.log('[MasterAdminPanel] Creating/updating profile record for test user');

        // Create each field explicitly rather than spreading userData to avoid any issues
        const profileData = {
          id: data.user.id,
          email: email,
          name: userData.name || email.split('@')[0],
          role: userData.role || 'dealership_admin',
          dealership_id: userData.dealership_id,
          is_group_admin: !!userData.is_group_admin,
          is_test_account: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('[MasterAdminPanel] Profile data:', profileData);

        const { error: profileError } = await supabase.from('profiles').upsert(profileData);

        if (profileError) {
          console.error('[MasterAdminPanel] Error creating profile:', profileError);

          // Try an insert as fallback
          console.log('[MasterAdminPanel] Trying insert instead of upsert');
          const { error: insertError } = await supabase.from('profiles').insert(profileData);

          if (insertError) {
            console.error('[MasterAdminPanel] Insert also failed:', insertError);
          } else {
            console.log('[MasterAdminPanel] Insert successful');
          }
        } else {
          console.log('[MasterAdminPanel] Profile upsert successful');
        }
      } catch (profileError) {
        console.error('[MasterAdminPanel] Error in profile creation:', profileError);
      }

      // Display the login info with special note for test accounts
      safeToast({
        title: 'Test User Created',
        description: `Created ${userData.role || 'user'}: "${email}" with password: ${password}
        Use "Refresh List" to see the user if it doesn't appear automatically.`,
        duration: 10000, // Show for 10 seconds
      });

      // Also log the credentials to the console for reference
      console.log(`[MasterAdminPanel] Test user created - Email: ${email}, Password: ${password}`);

      return data.user;
    } catch (error) {
      console.error('[MasterAdminPanel] Error creating test user directly:', error);
      throw error;
    }
  };

  // Handle admin form submission
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);

    try {
      console.log('[MasterAdminPanel] Creating admin user:', adminForm);
      console.log('[MasterAdminPanel] Is group admin:', adminForm.is_group_admin);

      // Generate password if not provided
      const password = adminForm.password || generatePassword();

      // We always need a dealership_id since it's required in the profiles table
      let dealershipId: number;

      if (adminForm.is_group_admin && adminForm.group_id) {
        console.log(`[MasterAdminPanel] Creating group admin for group ID ${adminForm.group_id}`);

        // Fetch the latest dealerships to ensure we have up-to-date data
        console.log('[MasterAdminPanel] Refreshing dealerships list before continuing');
        try {
          await fetchDealerships();
          console.log('[MasterAdminPanel] Dealerships refreshed');
        } catch (refreshError) {
          console.error('[MasterAdminPanel] Error refreshing dealerships:', refreshError);
          // Continue with the current dealerships data
        }

        // For group admins, find the first dealership in the selected group
        const groupDealerships = dealerships.filter(
          d => d.group_id === parseInt(adminForm.group_id)
        );
        if (groupDealerships.length === 0) {
          console.log(`[MasterAdminPanel] No dealerships found in group ID ${adminForm.group_id}`);

          // Get the group name for better error messaging
          const groupName =
            groups.find(g => g.id === parseInt(adminForm.group_id))?.name ||
            `ID ${adminForm.group_id}`;

          throw new Error(
            `No dealerships found in group "${groupName}". This could be because the group was just created and the default dealership creation is not yet complete. Please try refreshing the page or manually create a dealership in this group first.`
          );
        }
        dealershipId = groupDealerships[0].id;
        console.log(
          `[MasterAdminPanel] Group admin will be assigned to first dealership in group: ${dealershipId}`
        );
      } else if (adminForm.dealership_id) {
        // For regular admins, use the selected dealership
        dealershipId = parseInt(adminForm.dealership_id);
      } else {
        throw new Error('Please select a dealership or group');
      }

      // Check if this is a test email or we're in a test environment
      const isTestAccount = isTestEmail(adminForm.email) || isTestEnvironment;

      // For test accounts, use a simpler password format
      const finalPassword = isTestAccount ? 'Password123!' : password;

      // User data to store - Use dealership_admin role for all dealer admins
      const userData = {
        name: adminForm.name || adminForm.email.split('@')[0],
        role: 'dealership_admin', // Changed from 'admin' to 'dealership_admin'
        dealership_id: dealershipId,
        is_group_admin: adminForm.is_group_admin, // Explicitly set group admin flag
        is_test_account: isTestAccount,
      };

      // Log the user creation with group admin status for debugging
      console.log('[MasterAdminPanel] Creating user with data:', {
        ...userData,
        is_group_admin: adminForm.is_group_admin, // Explicitly show group admin status
        group_id: adminForm.is_group_admin ? adminForm.group_id : null,
      });

      if (isTestAccount) {
        // Always use a generated email with timestamp for uniqueness
        const emailParts = adminForm.email.split('@');
        const emailUsername = emailParts[0];
        const safeEmail = generateSafeTestEmail(adminForm.email);

        // Show a clear message about email transformation
        if (safeEmail !== adminForm.email) {
          console.log(
            `[MasterAdminPanel] Email transformed for compatibility: ${adminForm.email} → ${safeEmail}`
          );
          safeToast({
            title: 'Email Format Changed',
            description: `For compatibility, the email was changed from ${adminForm.email} to ${safeEmail}. Use this email to log in.`,
            duration: 8000,
          });
        } else {
          console.log(`[MasterAdminPanel] Using original email format: ${safeEmail}`);
        }

        // Use the direct creation method for test accounts
        const user = await createTestUserDirectly(safeEmail, finalPassword, userData);

        // Store in localStorage for tracking
        const simulatedAdmin: AdminUser = {
          id: user.id,
          email: safeEmail,
          name: userData.name,
          dealership_id: dealershipId,
          role: 'dealership_admin', // Changed from 'admin' to 'dealership_admin'
          is_group_admin: adminForm.is_group_admin, // Preserve group admin status
          is_simulated: true,
        };

        setSimulatedAdmins(prev => [...prev, simulatedAdmin]);
      } else {
        // Standard flow for real accounts
        const { data, error } = await supabase.auth.signUp({
          email: adminForm.email,
          password: finalPassword,
          options: {
            data: {
              ...userData,
              // Ensure is_group_admin is explicitly set in user metadata
              is_group_admin: adminForm.is_group_admin,
            },
          },
        });

        if (error) throw error;

        if (!data.user) {
          throw new Error('Failed to create user account');
        }

        // Set role and ensure profile record exists
        try {
          await updateUserRole(data.user.id, 'dealership_admin'); // Changed from 'admin' to 'dealership_admin'

          // Create or update profile record with explicit group admin flag
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: adminForm.email,
            name: userData.name,
            role: 'dealership_admin', // Changed from 'admin' to 'dealership_admin'
            dealership_id: dealershipId,
            is_group_admin: adminForm.is_group_admin, // Explicitly set the group admin flag
          });

          // Log successful profile update with group admin status
          console.log('[MasterAdminPanel] Profile record created/updated successfully with:', {
            user_id: data.user.id,
            dealership_id: dealershipId,
            is_group_admin: adminForm.is_group_admin,
            group_id: adminForm.is_group_admin ? adminForm.group_id : null,
          });
        } catch (roleError) {
          console.error('[MasterAdminPanel] Role update error:', roleError);
          // Continue anyway since the auth record was created
        }

        safeToast({
          title: 'Success',
          description: adminForm.is_group_admin
            ? `Dealer Group Admin "${adminForm.email}" created. Check email for confirmation. They should log in and will be redirected to the Group Admin dashboard. Password: ${finalPassword}`
            : `Dealer Admin "${adminForm.email}" created. Check email for confirmation. Password: ${finalPassword}`,
        });
      }

      // Reset form
      setAdminForm({
        email: '',
        name: '',
        dealership_id: '',
        group_id: '',
        is_group_admin: false,
        password: '',
        phone: '',
      });

      // Fetch updated users list
      await fetchUsersWithGroupInfo();
    } catch (error) {
      console.error('[MasterAdminPanel] Error creating admin user:', error);
      safeToast({
        title: 'Error',
        description:
          typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : 'Failed to create admin user',
        variant: 'destructive',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  // New function to test connection to a dealership's Supabase project
  const testConnection = async (dealershipId: number) => {
    setTestingConnection(true);
    setDealershipConnection(null);

    try {
      console.log('[MasterAdminPanel] Testing connection to dealership:', dealershipId);
      const result = await testDealershipConnection(dealershipId);
      setDealershipConnection(result);

      // If successful, load users from that dealership
      if (result.success) {
        fetchDealershipUsers(dealershipId);
      }
    } catch (error) {
      console.error('[MasterAdminPanel] Error testing dealership connection:', error);
      setDealershipConnection({
        success: false,
        message: `Error: ${error}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // New function to fetch users from a dealership
  const fetchDealershipUsers = async (dealershipId: number) => {
    setLoadingDealershipUsers(true);

    try {
      console.log('[MasterAdminPanel] Fetching users from dealership:', dealershipId);
      const users = await getDealershipUsers(dealershipId);
      setDealershipUsers(users);
    } catch (error) {
      console.error('[MasterAdminPanel] Error fetching dealership users:', error);
      safeToast({
        title: 'Error',
        description: 'Failed to load dealership users',
        variant: 'destructive',
      });
      setDealershipUsers([]);
    } finally {
      setLoadingDealershipUsers(false);
    }
  };

  // Create a user in the selected dealership
  const createDealershipAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDealership) {
      safeToast({
        title: 'Error',
        description: 'Please select a dealership first',
        variant: 'destructive',
      });
      return;
    }

    setCreatingAdmin(true);

    try {
      console.log('[MasterAdminPanel] Creating admin in dealership:', selectedDealership);

      // Generate a temporary password if not provided
      const password = adminForm.password || generatePassword();

      // Create the user with dealership_admin role explicitly instead of using role_id
      const result = await createDealershipUser(selectedDealership, {
        email: adminForm.email,
        password: password,
        first_name: adminForm.name.split(' ')[0] || 'Admin',
        last_name: adminForm.name.split(' ')[1] || 'User',
        role: 'dealership_admin', // Set explicit role name instead of using role_id
        phone_number: adminForm.phone || undefined,
      });

      if (!result.success) {
        throw result.error || new Error('Failed to create user');
      }

      safeToast({
        title: 'Success',
        description: `Created dealership admin user ${adminForm.email} in dealership ${selectedDealership}`,
      });

      // Reset form and refresh users
      setAdminForm({
        email: '',
        name: '',
        dealership_id: '',
        password: '',
        phone: '',
      });

      fetchDealershipUsers(selectedDealership);
    } catch (error) {
      console.error('[MasterAdminPanel] Error creating dealership admin:', error);
      safeToast({
        title: 'Error',
        description: `Failed to create admin: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Extend the dealership selection handler
  const handleDealershipSelect = (dealershipId: string) => {
    const id = parseInt(dealershipId, 10);
    setSelectedDealership(id);
    testConnection(id);
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      if (
        !confirm(
          'Are you sure you want to delete this dealership group? This action cannot be undone and will delete ALL dealerships in this group.'
        )
      ) {
        return;
      }

      // Find the group name for logging
      const groupName = groups.find(g => g.id === groupId)?.name || `Group ID ${groupId}`;
      console.log(
        `[MasterAdminPanel] Starting deletion of dealership group: ${groupName} (ID: ${groupId})`
      );

      // Find all dealerships associated with this group
      const groupDealerships = dealerships.filter(d => d.group_id === groupId);
      console.log(
        `[MasterAdminPanel] Found ${groupDealerships.length} dealerships to delete in group ${groupId}`
      );

      if (groupDealerships.length > 0) {
        // Create a loading toast to indicate deletion is in progress
        safeToast({
          title: 'Deleting Group',
          description: `Deleting ${groupDealerships.length} dealerships in group "${groupName}"...`,
        });

        // Delete each dealership in the group
        for (const dealership of groupDealerships) {
          try {
            console.log(
              `[MasterAdminPanel] Deleting dealership: ${dealership.name} (ID: ${dealership.id})`
            );
            const result = await deleteDealership(dealership.id);

            // Log operation for each dealership deletion
            await logSchemaOperation('delete_dealership_in_group', {
              dealershipId: dealership.id,
              dealershipName: dealership.name,
              schemaName: dealership.schema_name || result.schemaName,
              groupId,
              groupName,
              deletedBy: user?.id,
              timestamp: new Date().toISOString(),
            });

            console.log(
              `[MasterAdminPanel] Successfully deleted dealership: ${
                dealership.name
              } with schema: ${result.schemaName || dealership.schema_name}`
            );
          } catch (dealershipError) {
            console.error(
              `[MasterAdminPanel] Error deleting dealership ${dealership.id} in group:`,
              dealershipError
            );
            // Continue with other dealerships even if one fails
          }
        }
      }

      // Now delete the group itself
      await deleteDealershipGroup(groupId);

      // Log group deletion operation
      await logSchemaOperation('delete_dealership_group', {
        groupId,
        groupName,
        dealershipsDeleted: groupDealerships.length,
        deletedBy: user?.id,
        timestamp: new Date().toISOString(),
      });

      // Refresh the lists
      fetchGroups();
      fetchDealerships();

      safeToast({
        title: 'Success',
        description: `Dealership group "${groupName}" and all ${groupDealerships.length} associated dealerships have been deleted.`,
      });
    } catch (error) {
      console.error('[MasterAdminPanel] Error deleting dealership group:', error);
      safeToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete dealership group',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDealership = async (dealershipId: number) => {
    try {
      if (
        !confirm('Are you sure you want to delete this dealership? This action cannot be undone.')
      ) {
        return;
      }

      const result = await deleteDealership(dealershipId);

      // Log operation
      await logSchemaOperation('delete_dealership', {
        dealershipId,
        schemaName: result.schemaName,
        deletedBy: user?.id,
        timestamp: new Date().toISOString(),
      });

      // Refresh the list
      fetchDealerships();

      safeToast({
        title: 'Success',
        description: 'Dealership deleted successfully',
      });
    } catch (error) {
      console.error('[MasterAdminPanel] Error deleting dealership:', error);
      safeToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete dealership',
        variant: 'destructive',
      });
    }
  };

  // Add a new function to handle admin deletion
  const handleDeleteAdmin = async (adminId: string, isSimulated: boolean = false) => {
    try {
      if (
        !confirm('Are you sure you want to delete this admin user? This action cannot be undone.')
      ) {
        return;
      }

      // Get the admin's email first for proper cleanup
      const adminToDelete = isSimulated
        ? simulatedAdmins.find(admin => admin.id === adminId)
        : users.find(user => user.id === adminId);

      if (!adminToDelete) {
        throw new Error('Admin user not found');
      }

      const adminEmail = adminToDelete.email;
      console.log(
        `[MasterAdminPanel] Deleting admin: ${adminEmail} (${adminId}), isSimulated: ${isSimulated}`
      );

      if (isSimulated) {
        // For simulated admins, remove from localStorage
        setSimulatedAdmins(prev => prev.filter(admin => admin.id !== adminId));
      }

      // Always try to clean up from database tables
      try {
        // 1. Delete from profiles table
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', adminId);

        if (profileError) {
          console.warn(`[MasterAdminPanel] Error deleting profile: ${profileError.message}`);
        }

        // 2. Try to delete from auth system
        const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
        if (authError) {
          console.warn(`[MasterAdminPanel] Error deleting from auth: ${authError.message}`);

          // 3. If direct delete fails, try RPC method
          try {
            const { error: rpcError } = await supabase.rpc('admin_delete_user_by_email', {
              email_param: adminEmail,
            });

            if (rpcError) {
              console.warn(`[MasterAdminPanel] RPC delete failed: ${rpcError.message}`);
            }
          } catch (rpcErr) {
            console.error(`[MasterAdminPanel] RPC error:`, rpcErr);
          }
        }
      } catch (dbError) {
        console.error('[MasterAdminPanel] Database error during deletion:', dbError);
        // Continue with the process even if DB operations fail
      }

      safeToast({
        title: 'Success',
        description: `${isSimulated ? 'Test admin' : 'Admin user'} deleted successfully`,
      });

      // Refresh the list
      fetchUsersWithGroupInfo();
    } catch (error) {
      console.error('[MasterAdminPanel] Error deleting admin user:', error);
      safeToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete admin user',
        variant: 'destructive',
      });
    }
  };

  // Add function to fetch signup requests
  const fetchSignupRequests = async () => {
    try {
      setLoadingSignupRequests(true);
      const requests = await getSignupRequests();
      setSignupRequests(requests);
      console.log('[MasterAdminPanel] Fetched signup requests:', requests);
    } catch (error) {
      console.error('[MasterAdminPanel] Error fetching signup requests:', error);
      safeToast({
        title: 'Error',
        description: 'Failed to fetch signup requests',
        variant: 'destructive',
      });
    } finally {
      setLoadingSignupRequests(false);
    }
  };

  // Handle approval of a signup request
  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequest(true);
      console.log(`[MasterAdminPanel] Approving signup request: ${requestId}`);

      // Get the request details
      const request = signupRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      console.log('[MasterAdminPanel] Promotional pricing applied:', request.promo_applied);

      // Configure approval options
      const options: {
        createSchema?: boolean;
        schemaName?: string;
        adminEmail?: string;
        adminName?: string;
        tempPassword?: string;
        addOns?: string[];
        isDealerGroup?: boolean;
        groupLevel?: string;
        dealershipCount?: number;
        isPromotion?: boolean;
      } = {
        createSchema: true,
        addOns: request.add_ons || [],
        isPromotion: request.promo_applied || false,
      };

      // Set schema name if needed
      if (request.tier === 'dealership' || request.tier === 'dealer_group') {
        // Generate a schema name based on dealership name
        const safeName = request.dealership_name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .substring(0, 20);
        options.schemaName = `${safeName}_${Date.now().toString(36)}`;
      }

      // Add dealer group specific options
      if (request.tier === 'dealer_group') {
        options.isDealerGroup = true;
        options.groupLevel = request.group_level || 'level_1';
        options.dealershipCount = request.dealership_count || 2;

        console.log('Processing dealer group signup:', {
          level: options.groupLevel,
          dealershipCount: options.dealershipCount,
          addOns: options.addOns,
        });
      }

      // Generate a temporary password for the admin user
      const tempPassword = generatePassword();
      options.tempPassword = tempPassword;
      options.adminEmail = request.email;
      options.adminName = request.contact_person;

      const result = await approveSignupRequest(requestId, options);

      if (result.success) {
        toast({
          title: 'Success',
          description: `${
            request.tier === 'dealer_group' ? 'Dealer Group' : 'Dealership'
          } request approved successfully!`,
          variant: 'default',
        });

        // Log details for dealer group creations
        if (request.tier === 'dealer_group') {
          console.log('Dealer Group created:', {
            groupId: result.groupId,
            dealershipIds: result.dealershipIds,
            level: options.groupLevel,
            dealershipCount: options.dealershipCount,
          });

          // Display more detailed success message for dealer groups
          toast({
            title: 'Dealer Group Created',
            description: `Created group with ${options.dealershipCount} dealerships. Admin credentials sent to ${options.adminEmail}`,
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to approve request',
          variant: 'destructive',
        });
      }

      // Refresh the data
      fetchSignupRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  // Handle rejection of a signup request
  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(true);
      console.log(`[MasterAdminPanel] Rejecting signup request: ${requestId}`);

      const result = await rejectSignupRequest(requestId, rejectionReason);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Signup request rejected successfully',
        });

        // Refresh the list
        fetchSignupRequests();
        setRejectionReason('');
        setSelectedRequestId(null);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[MasterAdminPanel] Error rejecting signup request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject signup request',
        variant: 'destructive',
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  // Debug admin users - run a more detailed query to diagnose issues
  const debugAdminUsers = async () => {
    try {
      console.log('[MasterAdminPanel] Running admin users debug query...');

      // Check for local stored simulated admins
      console.log('[MasterAdminPanel] Locally stored simulated admins:', simulatedAdmins);

      // Get profiles directly without using OR to avoid syntax issues
      const { data: adminProfiles, error: adminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(20);

      if (adminError) {
        console.error('[MasterAdminPanel] Error querying admin profiles:', adminError);
      } else {
        console.log('[MasterAdminPanel] Admin profiles:', adminProfiles);
      }

      const { data: dealershipAdminProfiles, error: dealershipAdminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'dealership_admin')
        .order('created_at', { ascending: false })
        .limit(20);

      if (dealershipAdminError) {
        console.error(
          '[MasterAdminPanel] Error querying dealership_admin profiles:',
          dealershipAdminError
        );
      } else {
        console.log('[MasterAdminPanel] Dealership admin profiles:', dealershipAdminProfiles);
      }

      // Look for any profiles that have the is_group_admin flag set
      const { data: groupAdminProfiles, error: groupAdminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_group_admin', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (groupAdminError) {
        console.error(
          '[MasterAdminPanel] Error querying is_group_admin profiles:',
          groupAdminError
        );
      } else {
        console.log(
          '[MasterAdminPanel] Group admin profiles (is_group_admin=true):',
          groupAdminProfiles
        );
      }

      // Look for recent profiles regardless of role
      const { data: recentProfiles, error: recentError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (recentError) {
        console.error('[MasterAdminPanel] Error querying recent profiles:', recentError);
      } else {
        console.log('[MasterAdminPanel] Most recent profiles created:', recentProfiles);
      }

      // Try to find test user jp@exampletest.com if this is the one that was just created
      const { data: specificUser, error: specificError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'jp@exampletest.com')
        .maybeSingle();

      if (specificError) {
        console.error('[MasterAdminPanel] Error querying for specific test user:', specificError);
      } else if (specificUser) {
        console.log('[MasterAdminPanel] Found specific test user:', specificUser);
      } else {
        console.log('[MasterAdminPanel] Specific test user not found in profiles table');

        // Try searching by partial match
        const { data: partialMatches, error: partialError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', '%jp%')
          .limit(10);

        if (!partialError && partialMatches?.length) {
          console.log('[MasterAdminPanel] Found partial email matches:', partialMatches);
        }
      }

      // Count totals by role
      const allProfiles = [
        ...(adminProfiles || []),
        ...(dealershipAdminProfiles || []),
        ...(recentProfiles || []),
      ];

      // Deduplicate by ID
      const uniqueProfiles = Array.from(new Map(allProfiles.map(item => [item.id, item])).values());

      const roleCounts = {};
      uniqueProfiles.forEach(profile => {
        const role = profile.role || 'no_role';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });

      // Show results
      safeToast({
        title: 'Admin Debug Results',
        description: `Found ${adminProfiles?.length || 0} admin profiles and ${
          dealershipAdminProfiles?.length || 0
        } dealership_admin profiles. Group admins: ${groupAdminProfiles?.length || 0}. Recent: ${
          recentProfiles?.length || 0
        }`,
        duration: 10000,
      });

      console.log('[MasterAdminPanel] Role distribution:', roleCounts);
    } catch (error) {
      console.error('[MasterAdminPanel] Debug error:', error);
      safeToast({
        title: 'Debug Error',
        description: 'Error running diagnostics. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  // Add this function early in the component to provide mock data
  useEffect(() => {
    // Check for direct auth users and provide mock data
    if (isDirectAuth()) {
      console.log('[MasterAdminPanel] Direct auth user detected, using mock data');

      // Mock dealership groups
      const mockGroups = [
        {
          id: 1,
          name: 'Example Auto Group',
          logo_url: '',
          brands: ['Honda', 'Toyota', 'Ford'],
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Premium Motors Group',
          logo_url: '',
          brands: ['BMW', 'Mercedes', 'Audi'],
          created_at: new Date().toISOString(),
        },
      ];
      setGroups(mockGroups);

      // Mock dealerships
      const mockDealerships = [
        {
          id: 1,
          name: 'Downtown Motors',
          group_id: 1,
          logo_url: '',
          city: 'Downtown',
          state: 'CA',
          brands: ['Honda', 'Toyota'],
          schema_name: 'dealer_1',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Westside Auto',
          group_id: 1,
          logo_url: '',
          city: 'West Side',
          state: 'CA',
          brands: ['Ford'],
          schema_name: 'dealer_2',
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Premium BMW',
          group_id: 2,
          logo_url: '',
          city: 'Northside',
          state: 'CA',
          brands: ['BMW'],
          schema_name: 'dealer_3',
          created_at: new Date().toISOString(),
        },
      ];
      setDealerships(mockDealerships);

      // Mock admin users
      const mockAdmins = [
        {
          id: 1,
          email: 'testadmin@example.com',
          name: 'Test Admin',
          dealership_id: null,
          dealership_name: 'All Dealerships',
          role: 'admin',
          is_group_admin: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          email: 'group1.admin@exampletest.com',
          name: 'Group Admin',
          dealership_id: 1,
          dealership_name: 'Downtown Motors',
          role: 'dealer_group_admin',
          is_group_admin: true,
          group_id: 1,
          group_name: 'Example Auto Group',
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          email: 'dealer1.admin@exampletest.com',
          name: 'Dealership Admin',
          dealership_id: 1,
          dealership_name: 'Downtown Motors',
          role: 'dealership_admin',
          is_group_admin: false,
          group_id: 1,
          group_name: 'Example Auto Group',
          created_at: new Date().toISOString(),
        },
      ];
      setUsers(mockAdmins);

      // Mock signup requests
      const mockSignupRequests = [
        {
          id: 1,
          dealership_name: 'New Example Dealership',
          contact_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          tier: 'PRO',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ];
      setSignupRequests(mockSignupRequests);
    }
  }, []);

  // Add a function to fetch admin notifications
  const fetchAdminNotifications = async () => {
    try {
      console.log('[MasterAdminPanel] Fetching admin notifications');
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[MasterAdminPanel] Error fetching notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        // Count unread notifications
        const unreadCount = data.filter(notification => !notification.is_read).length;
        setUnreadNotifications(unreadCount);
        console.log(`[MasterAdminPanel] Found ${unreadCount} unread notifications`);
      }
    } catch (error) {
      console.error('[MasterAdminPanel] Error in fetchAdminNotifications:', error);
    }
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('[MasterAdminPanel] Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[MasterAdminPanel] Error in markNotificationAsRead:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Admin Panel</h1>
          <p className="text-muted-foreground">Manage dealerships, groups, and users</p>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200 font-medium">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div
                          className={`mr-3 mt-0.5 ${
                            !notification.is_read ? 'text-blue-500' : 'text-gray-400'
                          }`}
                        >
                          {notification.type === 'signup_request' ? (
                            <UserPlus className="h-5 w-5" />
                          ) : (
                            <Info className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {notification.type === 'signup_request'
                              ? `New ${notification.content.tier.replace('_', ' ')} signup`
                              : 'Notification'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.content.dealership_name} -{' '}
                            {notification.content.contact_person}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="dealerships" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dealerships">Dealerships</TabsTrigger>
          <TabsTrigger value="groups">Dealership Groups</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="projects">Dealership Projects</TabsTrigger>
          <TabsTrigger value="signups">Signup Requests</TabsTrigger>
        </TabsList>

        {/* Dealerships Tab */}
        <TabsContent value="dealerships">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dealership Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Dealership</CardTitle>
                <CardDescription>Create a new dealership and assign it to a group</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDealershipFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealership-name">Dealership Name *</Label>
                    <Input
                      id="dealership-name"
                      value={dealershipForm.name}
                      onChange={e => setDealershipForm({ ...dealershipForm, name: e.target.value })}
                      placeholder="Enter dealership name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealership-group">Dealership Group</Label>
                    <Select
                      value={dealershipForm.group_id}
                      onValueChange={value =>
                        setDealershipForm({ ...dealershipForm, group_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dealership group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={String(group.id)}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealership-logo">Logo URL</Label>
                    <Input
                      id="dealership-logo"
                      value={dealershipForm.logo_url}
                      onChange={e =>
                        setDealershipForm({ ...dealershipForm, logo_url: e.target.value })
                      }
                      placeholder="Enter logo URL (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealership-city">City</Label>
                    <Input
                      id="dealership-city"
                      value={dealershipForm.city}
                      onChange={e => setDealershipForm({ ...dealershipForm, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealership-state">State</Label>
                    <Select
                      value={dealershipForm.state}
                      onValueChange={value =>
                        setDealershipForm({ ...dealershipForm, state: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealership-brand">Primary Manufacturer</Label>
                    <Select
                      value={dealershipForm.brands.length > 0 ? dealershipForm.brands[0] : ''}
                      onValueChange={value =>
                        setDealershipForm({ ...dealershipForm, brands: [value] })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select primary manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAR_MANUFACTURERS.map(brand => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select the primary car manufacturer for this dealership (Note: Currently
                      collected for display purposes only - not stored in database)
                    </p>
                  </div>

                  <Button type="submit" disabled={creatingDealership} className="mt-4">
                    {creatingDealership ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Dealership
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Dealerships List */}
            <Card>
              <CardHeader>
                <CardTitle>Dealerships</CardTitle>
                <CardDescription>List of all dealerships</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDealerships ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dealerships.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No dealerships found
                            </TableCell>
                          </TableRow>
                        ) : (
                          dealerships.map(dealership => (
                            <TableRow key={dealership.id}>
                              <TableCell>{dealership.id}</TableCell>
                              <TableCell>{dealership.name}</TableCell>
                              <TableCell>
                                {groups.find(g => g.id === dealership.group_id)?.name || 'None'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteDealership(dealership.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dealership Groups Tab */}
        <TabsContent value="groups">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Group Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Dealership Group</CardTitle>
                <CardDescription>Create a new dealership group</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGroupFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name *</Label>
                    <Input
                      id="group-name"
                      value={groupForm.name}
                      onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                      placeholder="Enter group name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-logo">Logo URL</Label>
                    <Input
                      id="group-logo"
                      value={groupForm.logo_url}
                      onChange={e => setGroupForm({ ...groupForm, logo_url: e.target.value })}
                      placeholder="Enter logo URL (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-brands">
                      Car Manufacturers{' '}
                      {groupForm.brands.length > 0 && `(${groupForm.brands.length} selected)`}
                    </Label>
                    <div className="border rounded-md p-2">
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2 p-2">
                          {CAR_MANUFACTURERS.map(brand => (
                            <div key={brand} className="flex items-center space-x-2">
                              <Checkbox
                                id={`group-brand-${brand}`}
                                checked={groupForm.brands.includes(brand)}
                                onCheckedChange={() => toggleGroupBrand(brand)}
                              />
                              <label
                                htmlFor={`group-brand-${brand}`}
                                className="text-sm cursor-pointer"
                              >
                                {brand}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    {groupForm.brands.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {groupForm.brands.map(brand => (
                          <Badge key={brand} variant="secondary" className="mr-1 mb-1">
                            {brand}
                            <button
                              className="ml-1 text-xs"
                              onClick={() => toggleGroupBrand(brand)}
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Select all car manufacturers the dealership group sells (Note: Currently
                      collected for display purposes only - not stored in database)
                    </p>
                  </div>

                  <Button type="submit" disabled={creatingGroup} className="mt-4">
                    {creatingGroup ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Group
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Groups List */}
            <Card>
              <CardHeader>
                <CardTitle>Dealership Groups</CardTitle>
                <CardDescription>List of all dealership groups</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingGroups ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help flex items-center">
                                    Dealerships <Info className="ml-1 h-3 w-3" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Number of dealership locations in this group. Hover over the
                                    count to see names.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help flex items-center">
                                    Brands <Info className="ml-1 h-3 w-3" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Car manufacturers represented by this group. Multiple locations
                                    may sell the same brand.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              No groups found
                            </TableCell>
                          </TableRow>
                        ) : (
                          groups.map(group => {
                            // Count dealerships explicitly for this group
                            const groupDealerships = dealerships.filter(
                              d => d.group_id === group.id
                            );

                            return (
                              <TableRow key={group.id}>
                                <TableCell>{group.id}</TableCell>
                                <TableCell>{group.name}</TableCell>
                                <TableCell>
                                  {/* Show dealership count with tooltip of names */}
                                  {groupDealerships.length > 0 ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">
                                            {groupDealerships.length}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">
                                            {groupDealerships.map(d => d.name).join(', ')}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    0
                                  )}
                                </TableCell>
                                <TableCell>
                                  {/* Show brand count with tooltip */}
                                  {group._selectedBrands && group._selectedBrands.length ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">
                                            {group._selectedBrands.length}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">
                                            {Array.isArray(group._selectedBrands)
                                              ? group._selectedBrands.join(', ')
                                              : 'No brands'}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    0
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteGroup(group.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Users Tab */}
        <TabsContent value="admins">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Form */}
            <Card>
              <CardHeader>
                <CardTitle>Onboard New Admin</CardTitle>
                <CardDescription>
                  Create a new admin user and assign to a dealership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email *</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminForm.email}
                      onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="Enter admin email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Name *</Label>
                    <Input
                      id="admin-name"
                      value={adminForm.name}
                      onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                      placeholder="Enter admin name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-dealership">Dealership</Label>
                    <Select
                      value={adminForm.dealership_id}
                      onValueChange={value =>
                        setAdminForm({
                          ...adminForm,
                          dealership_id: value,
                          group_id: '',
                          is_group_admin: false,
                        })
                      }
                      disabled={adminForm.is_group_admin}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dealership" />
                      </SelectTrigger>
                      <SelectContent>
                        {dealerships.map(dealership => (
                          <SelectItem key={dealership.id} value={String(dealership.id)}>
                            {dealership.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="admin-group"
                        checked={adminForm.is_group_admin}
                        onCheckedChange={checked => {
                          const isChecked = Boolean(checked);
                          setAdminForm({
                            ...adminForm,
                            is_group_admin: isChecked,
                            dealership_id: isChecked ? '' : adminForm.dealership_id,
                          });
                        }}
                      />
                      <Label htmlFor="admin-group">Assign to Dealership Group instead</Label>
                    </div>

                    {adminForm.is_group_admin && (
                      <div className="mt-2">
                        <Select
                          value={adminForm.group_id}
                          onValueChange={value => setAdminForm({ ...adminForm, group_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select dealership group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map(group => (
                              <SelectItem key={group.id} value={String(group.id)}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          This admin will have access to all dealerships in the selected group.
                        </p>
                        <Alert className="mt-2">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Group Admin Access</AlertTitle>
                          <AlertDescription>
                            Group admins will be automatically redirected to the Group Admin
                            Dashboard when they log in. They will be able to manage all dealerships
                            in their group from a single interface.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {!adminForm.is_group_admin && adminForm.dealership_id && (
                      <Alert className="mt-2">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Dealership Admin Access</AlertTitle>
                        <AlertDescription>
                          Dealership admins will be redirected to the Dealership Admin Dashboard for
                          their specific dealership when they log in.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">
                      Temporary Password (optional - will be generated if left blank)
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={adminForm.password}
                        onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                        placeholder="Enter temporary password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-[calc(50%-6px)] text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={creatingAdmin || !adminForm.email || !adminForm.name}
                  >
                    {creatingAdmin ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {adminForm.is_group_admin ? 'Creating Group Admin...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Admin
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Admins List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Admin Users</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchUsersWithGroupInfo}>
                      Refresh List
                    </Button>
                    <Button variant="outline" size="sm" onClick={debugAdminUsers}>
                      Debug
                    </Button>
                    <Button variant="outline" size="sm" onClick={cleanupTestAccounts}>
                      Clean Up Test Accounts
                    </Button>
                  </div>
                </div>
                <CardDescription>List of all admin users</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Connected To</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              No admin users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map(user => (
                            <TableRow key={user.id}>
                              <TableCell>{user.name || 'N/A'}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.is_group_admin ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-indigo-100 text-indigo-800"
                                  >
                                    Group Admin
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    Dealership Admin
                                  </Badge>
                                )}
                                {user.is_simulated && (
                                  <Badge variant="outline" className="ml-2">
                                    Simulated
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {user.is_group_admin ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {(() => {
                                        // Try to get group name from various sources
                                        if (user.group_name) return user.group_name;

                                        const dealership = dealerships.find(
                                          d => d.id === user.dealership_id
                                        );
                                        if (!dealership?.group_id) return 'Unknown Group';

                                        const group = groups.find(
                                          g => g.id === dealership.group_id
                                        );
                                        return group?.name || `Group ${dealership.group_id}`;
                                      })()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {(() => {
                                        const dealership = dealerships.find(
                                          d => d.id === user.dealership_id
                                        );
                                        if (!dealership?.group_id) return '';
                                        return `Group ID: ${dealership.group_id}`;
                                      })()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Primary Dealership:{' '}
                                      {(() => {
                                        const dealership = dealerships.find(
                                          d => d.id === user.dealership_id
                                        );
                                        return (
                                          dealership?.name ||
                                          (user.dealership_id
                                            ? `ID: ${user.dealership_id}`
                                            : 'None')
                                        );
                                      })()}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {(() => {
                                        const dealership = dealerships.find(
                                          d => d.id === user.dealership_id
                                        );
                                        if (dealership) return dealership.name;
                                        if (user.dealership_name) return user.dealership_name;
                                        return user.dealership_id
                                          ? `Dealership ID: ${user.dealership_id}`
                                          : 'No Dealership';
                                      })()}
                                    </span>
                                    {(() => {
                                      const dealership = dealerships.find(
                                        d => d.id === user.dealership_id
                                      );
                                      if (!dealership?.group_id) return null;

                                      const group = groups.find(g => g.id === dealership.group_id);
                                      return (
                                        <span className="text-xs text-muted-foreground">
                                          Part of group:{' '}
                                          {group?.name || `Group ${dealership.group_id}`}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteAdmin(user.id, user.is_simulated)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>

              {/* Add emergency test account confirmation UI */}
              <div className="px-6 pb-6 pt-0 border-t border-gray-200 mt-4">
                <h4 className="text-sm font-medium mb-2 mt-4">
                  Emergency Test Account Confirmation
                </h4>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter test email to confirm"
                    value={confirmEmailInput}
                    onChange={e => setConfirmEmailInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmTestAccount(confirmEmailInput)}
                    disabled={!confirmEmailInput}
                  >
                    Confirm Email
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use only for test accounts with "Email not confirmed" errors. Enter the email
                  address you're having trouble with.
                </p>
              </div>

              {/* Add test account purge UI */}
              <div className="px-6 pb-6 pt-0 border-t border-gray-200 mt-2">
                <h4 className="text-sm font-medium mb-2 mt-4">Purge Test Account</h4>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter test email to purge"
                    value={purgeEmailInput}
                    onChange={e => setPurgeEmailInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => purgeTestAccount(purgeEmailInput)}
                    disabled={!purgeEmailInput}
                  >
                    Purge Account
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this to completely remove a test account that can't be recreated. This will
                  attempt to delete all traces of the account from auth and profiles tables.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Dealership Projects Tab */}
        <TabsContent value="projects">{/* Implementation of the projects tab */}</TabsContent>

        {/* Signup Requests Tab */}
        <TabsContent value="signups">
          <div className="grid md:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Signup Requests</CardTitle>
                <CardDescription>
                  Review and process signup requests from the marketing website
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSignupRequests ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Dealership</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Add-Ons</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {signupRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              No signup requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          signupRequests.map(request => (
                            <TableRow key={request.id}>
                              <TableCell className="font-mono text-xs">
                                {request.id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{request.dealership_name}</TableCell>
                              <TableCell>{request.contact_person}</TableCell>
                              <TableCell>{request.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    request.tier === 'free_trial'
                                      ? 'outline'
                                      : request.tier === 'finance_manager'
                                      ? 'secondary'
                                      : request.tier === 'dealership'
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {request.tier === 'free_trial'
                                    ? 'Free Trial'
                                    : request.tier === 'finance_manager'
                                    ? 'Finance Manager'
                                    : request.tier === 'dealership'
                                    ? 'Dealership'
                                    : 'Dealer Group'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {request.add_ons && request.add_ons.length > 0 ? (
                                  <div className="space-y-1">
                                    {request.add_ons.includes('plus') && (
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-900/20 text-blue-400 border-blue-800"
                                      >
                                        + Version
                                      </Badge>
                                    )}
                                    {request.add_ons.includes('plusplus') && (
                                      <Badge
                                        variant="outline"
                                        className="bg-indigo-900/20 text-indigo-400 border-indigo-800"
                                      >
                                        ++ Version
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">None</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    request.status === 'pending'
                                      ? 'outline'
                                      : request.status === 'approved'
                                      ? 'default'
                                      : 'destructive'
                                  }
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(request.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {request.status === 'pending' ? (
                                  <div className="flex space-x-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          disabled={processingRequest}
                                        >
                                          <Check className="h-4 w-4 mr-1" />
                                          Approve
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Approve Signup Request</DialogTitle>
                                          <DialogDescription>
                                            Review and approve this signup request. You can
                                            customize the onboarding details below.
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h3 className="font-medium">Request Details</h3>
                                              <p className="text-sm text-muted-foreground">
                                                <strong>Dealership:</strong>{' '}
                                                {request.dealership_name}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                <strong>Contact:</strong> {request.contact_person}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                <strong>Email:</strong> {request.email}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                <strong>Tier:</strong>{' '}
                                                {request.tier === 'free_trial'
                                                  ? 'Free Trial'
                                                  : request.tier === 'finance_manager'
                                                  ? 'Finance Manager'
                                                  : request.tier === 'dealership'
                                                  ? 'Dealership'
                                                  : 'Dealer Group'}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                <strong>Created:</strong>{' '}
                                                {new Date(request.created_at).toLocaleString()}
                                              </p>
                                            </div>

                                            <div>
                                              <h3 className="font-medium">
                                                Onboarding Configuration
                                              </h3>

                                              {(request.tier === 'dealership' ||
                                                request.tier === 'dealer_group') && (
                                                <div className="space-y-2 mt-2">
                                                  <Label htmlFor="schema-name">
                                                    Schema Name (optional)
                                                  </Label>
                                                  <Input
                                                    id="schema-name"
                                                    placeholder="Leave empty for auto-generated"
                                                    value={schemaNameInput}
                                                    onChange={e =>
                                                      setSchemaNameInput(e.target.value)
                                                    }
                                                  />
                                                  <p className="text-xs text-muted-foreground">
                                                    Only letters, numbers and underscores. If left
                                                    empty, a random name will be generated.
                                                  </p>
                                                </div>
                                              )}

                                              <div className="space-y-2 mt-2">
                                                <Label htmlFor="admin-email">
                                                  Admin Email (optional)
                                                </Label>
                                                <Input
                                                  id="admin-email"
                                                  placeholder={request.email}
                                                  value={adminEmailInput}
                                                  onChange={e => setAdminEmailInput(e.target.value)}
                                                />
                                              </div>

                                              <div className="space-y-2 mt-2">
                                                <Label htmlFor="admin-name">
                                                  Admin Name (optional)
                                                </Label>
                                                <Input
                                                  id="admin-name"
                                                  placeholder={request.contact_person}
                                                  value={adminNameInput}
                                                  onChange={e => setAdminNameInput(e.target.value)}
                                                />
                                              </div>

                                              <div className="space-y-2 mt-2">
                                                <Label htmlFor="temp-password">
                                                  Temporary Password (optional)
                                                </Label>
                                                <Input
                                                  id="temp-password"
                                                  placeholder="Leave empty for auto-generated"
                                                  value={tempPasswordInput}
                                                  onChange={e =>
                                                    setTempPasswordInput(e.target.value)
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setSchemaNameInput('');
                                              setAdminEmailInput('');
                                              setAdminNameInput('');
                                              setTempPasswordInput('');
                                            }}
                                          >
                                            Reset
                                          </Button>
                                          <Button
                                            onClick={() => handleApproveRequest(request.id)}
                                            disabled={processingRequest}
                                          >
                                            {processingRequest &&
                                            selectedRequestId === request.id ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                              </>
                                            ) : (
                                              'Approve Request'
                                            )}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          disabled={processingRequest}
                                        >
                                          <X className="h-4 w-4 mr-1" />
                                          Reject
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Reject Signup Request</DialogTitle>
                                          <DialogDescription>
                                            Are you sure you want to reject this signup request?
                                          </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                          <div>
                                            <h3 className="font-medium">Request Details</h3>
                                            <p className="text-sm text-muted-foreground">
                                              <strong>Dealership:</strong> {request.dealership_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              <strong>Contact:</strong> {request.contact_person}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              <strong>Email:</strong> {request.email}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              <strong>Tier:</strong>{' '}
                                              {request.tier === 'free_trial'
                                                ? 'Free Trial'
                                                : request.tier === 'finance_manager'
                                                ? 'Finance Manager'
                                                : request.tier === 'dealership'
                                                ? 'Dealership'
                                                : 'Dealer Group'}
                                            </p>
                                          </div>

                                          <div className="space-y-2">
                                            <Label htmlFor="rejection-reason">
                                              Rejection Reason (optional)
                                            </Label>
                                            <Textarea
                                              id="rejection-reason"
                                              placeholder="Enter reason for rejection"
                                              value={rejectionReason}
                                              onChange={e => setRejectionReason(e.target.value)}
                                            />
                                          </div>
                                        </div>

                                        <DialogFooter>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handleRejectRequest(request.id)}
                                            disabled={processingRequest}
                                          >
                                            {processingRequest &&
                                            selectedRequestId === request.id ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                              </>
                                            ) : (
                                              'Confirm Rejection'
                                            )}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                ) : (
                                  <Badge
                                    variant={
                                      request.status === 'approved' ? 'default' : 'destructive'
                                    }
                                  >
                                    {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={fetchSignupRequests}
                  disabled={loadingSignupRequests}
                >
                  {loadingSignupRequests ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>Refresh</>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MasterAdminPanel;
