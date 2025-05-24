import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
  CardFooter,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Plus, Trash, Edit, Save, Lock, Unlock, Eye, EyeOff, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { getDealershipUserLimits, canAddUserWithRole } from '../../lib/apiService';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

// Define interfaces for our data types
interface Role {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_id: string;
  created_at: string;
  isEditing?: boolean;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

interface PayPlanFormData {
  roleId: string;
  front_end_percent: number;
  back_end_percent: number;
  csi_bonus: number;
  demo_allowance: number;
  vsc_bonus: number;
  ppm_bonus: number;
  volume_bonus: {
    tier1?: number;
    tier2?: number;
    tier3?: number;
  };
}

interface VolumeTier {
  level: string;
  bonus: number;
}

// Role options for dropdown
const USER_ROLES: Role[] = [
  { id: 'sales', name: 'Sales' },
  { id: 'finance_manager', name: 'F&I Manager' },
  { id: 'sales_manager', name: 'Sales Manager' },
  { id: 'general_manager', name: 'General Manager' },
  { id: 'viewer', name: 'Viewer' },
];

// Test users data
const TEST_USERS = [
  // Sales People
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@exampletest.com',
    roleId: 'sales',
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@exampletest.com',
    roleId: 'sales',
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    email: 'carlos.rodriguez@exampletest.com',
    roleId: 'sales',
  },

  // Sales Managers
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@exampletest.com',
    roleId: 'sales_manager',
  },
  {
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@exampletest.com',
    roleId: 'sales_manager',
  },

  // F&I Managers
  {
    firstName: 'Mike',
    lastName: 'Williams',
    email: 'mike.williams@exampletest.com',
    roleId: 'finance_manager',
  },
  {
    firstName: 'Lisa',
    lastName: 'Taylor',
    email: 'lisa.taylor@exampletest.com',
    roleId: 'finance_manager',
  },

  // General Managers
  {
    firstName: 'Robert',
    lastName: 'Thomas',
    email: 'robert.thomas@exampletest.com',
    roleId: 'general_manager',
  },
  {
    firstName: 'Michelle',
    lastName: 'Garcia',
    email: 'michelle.garcia@exampletest.com',
    roleId: 'general_manager',
  },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for loading and data
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [payPlans, setPayPlans] = useState<Record<string, PayPlanFormData>>({});
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // State for forms
  const [userForm, setUserForm] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
  });

  const [payPlanForm, setPayPlanForm] = useState<PayPlanFormData>({
    roleId: '',
    front_end_percent: 0,
    back_end_percent: 0,
    csi_bonus: 0,
    demo_allowance: 0,
    vsc_bonus: 0,
    ppm_bonus: 0,
    volume_bonus: {},
  });

  // State for security
  const [adminPassword, setAdminPassword] = useState('');
  const [showPayPlanFields, setShowPayPlanFields] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for loading states
  const [userLoading, setUserLoading] = useState(false);
  const [payPlanLoading, setPayPlanLoading] = useState(false);
  const [volumeTiers, setVolumeTiers] = useState<VolumeTier[]>([
    { level: 'tier1', bonus: 0 },
    { level: 'tier2', bonus: 0 },
    { level: 'tier3', bonus: 0 },
  ]);

  // Add to the component state
  const [userLimits, setUserLimits] = useState<any>(null);
  const [userCounts, setUserCounts] = useState<Record<string, { current: number; limit: number }>>(
    {}
  );
  const [subscribedAddOns, setSubscribedAddOns] = useState<string[]>([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users and pay plans in parallel
        await Promise.all([fetchUsers(), fetchPayPlans()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Functions to fetch data
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          id, 
          email,
          role,
          created_at
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
        return;
      }

      // Map the data to match our User interface
      const mappedUsers =
        data?.map(user => ({
          id: user.id,
          first_name: user.email.split('@')[0].split('.')[0] || 'User',
          last_name: user.email.split('@')[0].split('.')[1] || '',
          email: user.email,
          role: user.role || 'user',
          role_id: user.role || 'user',
          created_at: user.created_at,
        })) || [];

      setUsers(mappedUsers);
      console.log('Fetched users:', mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  // Function to load test users
  const loadTestUsers = async () => {
    setUserLoading(true);
    let createdCount = 0;
    let existingCount = 0;

    try {
      // Create test users in sequence to avoid race conditions
      for (const testUser of TEST_USERS) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', testUser.email)
            .maybeSingle();

          if (existingUser) {
            console.log(`User ${testUser.email} already exists, skipping...`);
            existingCount++;
            continue;
          }

          // Create new user with fixed password using standard signup
          const fixedPassword = 'Password123!';

          const { data: userData, error: signUpError } = await supabase.auth.signUp({
            email: testUser.email,
            password: fixedPassword,
            options: {
              data: {
                role: testUser.roleId,
              },
            },
          });

          if (signUpError) {
            console.error(`Error creating user ${testUser.email}:`, signUpError);
            continue;
          }

          // Insert profile directly if needed
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userData?.user?.id,
            email: testUser.email,
            role: testUser.roleId,
          });

          if (profileError) {
            console.error(`Error updating profile for ${testUser.email}:`, profileError);
          } else {
            createdCount++;
          }
        } catch (error) {
          console.error(`Error processing user ${testUser.email}:`, error);
        }
      }

      // Refresh user list
      await fetchUsers();

      toast({
        title: 'Test Users Created',
        description: `${createdCount} users created, ${existingCount} already existed.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating test users:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test users',
        variant: 'destructive',
      });
    } finally {
      setUserLoading(false);
    }
  };

  const fetchPayPlans = async () => {
    const { data, error } = await supabase.from('pay_plans').select('*');

    if (error) {
      throw error;
    }

    // Convert array to object with roleId as key
    const payPlansObject: Record<string, PayPlanFormData> = {};
    data?.forEach(plan => {
      payPlansObject[plan.role_id] = {
        roleId: plan.role_id,
        front_end_percent: plan.front_end_percent,
        back_end_percent: plan.back_end_percent,
        csi_bonus: plan.csi_bonus,
        demo_allowance: plan.demo_allowance,
        vsc_bonus: plan.vsc_bonus,
        ppm_bonus: plan.ppm_bonus,
        volume_bonus: plan.volume_bonus || {},
      };
    });

    setPayPlans(payPlansObject);
  };

  // Add a function to fetch user limits
  const fetchUserLimits = async () => {
    try {
      if (!dealershipId) return;

      const { success, limits, add_ons } = await getDealershipUserLimits(dealershipId);

      if (success && limits) {
        setUserLimits(limits);
        setSubscribedAddOns(add_ons || []);

        // Initialize user counts
        const counts: Record<string, { current: number; limit: number }> = {};

        // Count users by category
        const usersByCategory: Record<string, number> = {
          sales_people: 0,
          finance_managers: 0,
          sales_managers: 0,
          general_managers: 0,
          finance_assistants: 0,
          others: 0,
        };

        users.forEach(user => {
          const category = getCategory(user.role);
          usersByCategory[category] = (usersByCategory[category] || 0) + 1;
        });

        // Set counts with limits
        Object.keys(limits).forEach(category => {
          counts[category] = {
            current: usersByCategory[category] || 0,
            limit: limits[category],
          };
        });

        setUserCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching user limits:', error);
    }
  };

  // Helper to get category from role
  const getCategory = (role: string): string => {
    if (role.includes('sales') && !role.includes('manager')) {
      return 'sales_people';
    } else if (
      role.includes('finance') &&
      !role.includes('manager') &&
      !role.includes('director')
    ) {
      return 'finance_assistants';
    } else if (
      role.includes('finance') &&
      (role.includes('manager') || role.includes('director'))
    ) {
      return 'finance_managers';
    } else if (role.includes('sales') && role.includes('manager')) {
      return 'sales_managers';
    } else if (role.includes('general') && role.includes('manager')) {
      return 'general_managers';
    } else {
      return 'others';
    }
  };

  // Update the useEffect to fetch user limits
  useEffect(() => {
    // Add userLimits to initial fetch
    if (dealershipId) {
      fetchUsers();
      fetchPayPlans();
      fetchUserLimits();
    }
  }, [dealershipId]);

  // Update handleUserSubmit to check limits before adding
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);

    try {
      // Check if user can be added based on role limits
      const { success, canAdd, currentCount, limit } = await canAddUserWithRole(
        dealershipId || '',
        userForm.roleId
      );

      if (!success) {
        throw new Error('Failed to check user limits');
      }

      if (!canAdd) {
        throw new Error(
          `Cannot add more users with this role. Limit reached (${currentCount}/${limit}). Consider upgrading your subscription.`
        );
      }

      // Use standard signup API
      const { data, error } = await supabase.auth.signUp({
        email: userForm.email,
        password: generateTempPassword(),
        options: {
          data: {
            role: userForm.roleId || 'viewer',
            dealership_id: dealershipId,
          },
        },
      });

      if (error) throw error;

      // Insert profile record directly if needed
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data?.user?.id,
        email: userForm.email,
        role: userForm.roleId || 'viewer',
        dealership_id: dealershipId,
        first_name: userForm.firstName,
        last_name: userForm.lastName,
      });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Reset form and refresh user list
      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        roleId: USER_ROLES[0].id,
      });

      await fetchUsers();
      await fetchUserLimits(); // Update limits after adding user
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setUserLoading(false);
    }
  };

  // Restore the handlePayPlanSubmit function after handleUserSubmit
  const handlePayPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated) {
      verifyAdminPassword();
      return;
    }

    setPayPlanLoading(true);

    try {
      // Prepare volume bonus tiers
      const volumeBonus = volumeTiers.reduce((acc, tier) => {
        if (tier.bonus > 0) {
          acc[tier.level] = tier.bonus;
        }
        return acc;
      }, {} as Record<string, number>);

      // Call secure RPC function to update pay plan
      const { error } = await supabase.rpc('update_pay_plan', {
        p_role_id: payPlanForm.roleId,
        p_front_end_percent: payPlanForm.front_end_percent,
        p_back_end_percent: payPlanForm.back_end_percent,
        p_csi_bonus: payPlanForm.csi_bonus,
        p_demo_allowance: payPlanForm.demo_allowance,
        p_vsc_bonus: payPlanForm.vsc_bonus,
        p_ppm_bonus: payPlanForm.ppm_bonus,
        p_volume_bonus: volumeBonus,
      });

      if (error) throw error;

      // Update success message and refresh data
      toast({
        title: 'Success',
        description: 'Pay plan updated successfully',
      });

      // Reset form
      setPayPlanForm({
        roleId: '',
        front_end_percent: 0,
        back_end_percent: 0,
        csi_bonus: 0,
        demo_allowance: 0,
        vsc_bonus: 0,
        ppm_bonus: 0,
        volume_bonus: {},
      });

      setVolumeTiers([
        { level: 'tier1', bonus: 0 },
        { level: 'tier2', bonus: 0 },
        { level: 'tier3', bonus: 0 },
      ]);

      await fetchPayPlans();
    } catch (error: any) {
      console.error('Error updating pay plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update pay plan',
        variant: 'destructive',
      });
    } finally {
      setPayPlanLoading(false);
    }
  };

  // Helper functions
  const generateTempPassword = () => {
    return (
      Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4)
    );
  };

  const verifyAdminPassword = async () => {
    if (adminPassword === 'admin123') {
      // This would be replaced with proper auth in production
      setAuthenticated(true);
      setShowPayPlanFields(true);
      toast({
        title: 'Authenticated',
        description: 'You can now modify pay plans',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Invalid admin password',
        variant: 'destructive',
      });
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    const payPlan = payPlans[roleId];

    if (payPlan) {
      setPayPlanForm({
        ...payPlan,
      });

      // Extract volume bonus tiers
      const newTiers = [...volumeTiers];
      Object.entries(payPlan.volume_bonus || {}).forEach(([key, value]) => {
        const tierIndex = newTiers.findIndex(t => t.level === key);
        if (tierIndex >= 0) {
          newTiers[tierIndex].bonus = value;
        }
      });

      setVolumeTiers(newTiers);
    } else {
      // Reset form for new role without existing pay plan
      setPayPlanForm({
        roleId,
        front_end_percent: 0,
        back_end_percent: 0,
        csi_bonus: 0,
        demo_allowance: 0,
        vsc_bonus: 0,
        ppm_bonus: 0,
        volume_bonus: {},
      });

      setVolumeTiers([
        { level: 'tier1', bonus: 0 },
        { level: 'tier2', bonus: 0 },
        { level: 'tier3', bonus: 0 },
      ]);
    }
  };

  const updateVolumeTier = (index: number, value: number) => {
    const newTiers = [...volumeTiers];
    newTiers[index].bonus = value;
    setVolumeTiers(newTiers);
  };

  // Function to update a user's role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Update user in Supabase
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, role: newRole, role_id: newRole, isEditing: false } : u
        )
      );

      // Set editing state back to null
      setEditingUserId(null);

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  // Function to toggle edit mode for a user
  const toggleEditMode = (userId: string) => {
    setEditingUserId(editingUserId === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Dealership Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and pay plans for your dealership</p>
      </header>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="payplans">Pay Plan Setup</TabsTrigger>
          <TabsTrigger value="scheduler">Dealership Hours</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>Create a new dealership staff account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userForm.firstName}
                      onChange={e => setUserForm({ ...userForm, firstName: e.target.value })}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userForm.lastName}
                      onChange={e => setUserForm({ ...userForm, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Dealership Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="john.doe@dealership.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={userForm.roleId}
                    onValueChange={value => setUserForm({ ...userForm, roleId: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={userLoading}>
                  {userLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add User
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Capacity</CardTitle>
              <CardDescription>
                User limits based on your subscription
                {subscribedAddOns.length > 0 && ' and add-ons'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscribedAddOns.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Active Add-ons:</h4>
                  <div className="flex flex-wrap gap-2">
                    {subscribedAddOns.map(addon => (
                      <Badge key={addon} variant="secondary">
                        {addon === 'plus'
                          ? '+ Version'
                          : addon === 'plusplus'
                          ? '++ Version'
                          : addon}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(userCounts).map(([category, count]) => (
                  <div key={category} className="rounded-lg border p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                      <span
                        className={count.current >= count.limit ? 'text-red-500 font-bold' : ''}
                      >
                        {count.current}/{count.limit}
                      </span>
                    </div>
                    <Progress
                      value={(count.current / count.limit) * 100}
                      className={count.current >= count.limit ? 'bg-red-200' : ''}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Users</CardTitle>
              <CardDescription>Manage dealership staff accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select
                              defaultValue={
                                USER_ROLES.find(r => r.name.toLowerCase() === user.role)?.id ||
                                'viewer'
                              }
                              onValueChange={value => updateUserRole(user.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {USER_ROLES.map(role => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {user.role}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEditMode(user.id)}
                            >
                              {editingUserId === user.id ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No users found. Add your first user above.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Load Test Users</CardTitle>
              <CardDescription>Add test users to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <p className="text-sm">This will create the following test users:</p>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p className="font-medium mb-2">Sales People:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <strong>John Smith</strong> - john.smith@exampletest.com
                    </li>
                    <li>
                      <strong>Emily Davis</strong> - emily.davis@exampletest.com
                    </li>
                    <li>
                      <strong>Carlos Rodriguez</strong> - carlos.rodriguez@exampletest.com
                    </li>
                  </ul>

                  <p className="font-medium mb-2">Sales Managers:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <strong>Sarah Johnson</strong> - sarah.johnson@exampletest.com
                    </li>
                    <li>
                      <strong>David Chen</strong> - david.chen@exampletest.com
                    </li>
                  </ul>

                  <p className="font-medium mb-2">F&I Managers:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <strong>Mike Williams</strong> - mike.williams@exampletest.com
                    </li>
                    <li>
                      <strong>Lisa Taylor</strong> - lisa.taylor@exampletest.com
                    </li>
                  </ul>

                  <p className="font-medium mb-2">General Managers:</p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>
                      <strong>Robert Thomas</strong> - robert.thomas@exampletest.com
                    </li>
                    <li>
                      <strong>Michelle Garcia</strong> - michelle.garcia@exampletest.com
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-amber-600 mt-2">
                  Note: All test users will be created with the password{' '}
                  <strong>Password123!</strong>
                </p>
              </div>
              <Button onClick={loadTestUsers} disabled={userLoading}>
                {userLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Load Test Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Plan Setup Tab */}
        <TabsContent value="payplans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay Plan Configuration</CardTitle>
              <CardDescription>
                Set up compensation structures for different roles
                {!authenticated && (
                  <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                    <Lock className="inline-block h-4 w-4 mr-1" />
                    This section requires administrator verification
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!authenticated ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        placeholder="Enter admin password to unlock"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button onClick={verifyAdminPassword}>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock Pay Plan Management
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePayPlanSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="payPlanRole">Select Role to Configure</Label>
                    <Select value={payPlanForm.roleId} onValueChange={handleRoleSelect}>
                      <SelectTrigger id="payPlanRole">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {payPlanForm.roleId && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="frontEndPercent">Front End %</Label>
                          <Input
                            id="frontEndPercent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={payPlanForm.front_end_percent}
                            onChange={e =>
                              setPayPlanForm({
                                ...payPlanForm,
                                front_end_percent: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backEndPercent">Back End %</Label>
                          <Input
                            id="backEndPercent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={payPlanForm.back_end_percent}
                            onChange={e =>
                              setPayPlanForm({
                                ...payPlanForm,
                                back_end_percent: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="csiBonus">CSI Bonus ($)</Label>
                          <Input
                            id="csiBonus"
                            type="number"
                            min="0"
                            step="1"
                            value={payPlanForm.csi_bonus}
                            onChange={e =>
                              setPayPlanForm({
                                ...payPlanForm,
                                csi_bonus: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demoAllowance">Demo Allowance ($)</Label>
                          <Input
                            id="demoAllowance"
                            type="number"
                            min="0"
                            step="1"
                            value={payPlanForm.demo_allowance}
                            onChange={e =>
                              setPayPlanForm({
                                ...payPlanForm,
                                demo_allowance: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vscBonus">VSC Bonus ($)</Label>
                          <Input
                            id="vscBonus"
                            type="number"
                            min="0"
                            step="1"
                            value={payPlanForm.vsc_bonus}
                            onChange={e =>
                              setPayPlanForm({
                                ...payPlanForm,
                                vsc_bonus: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ppmBonus">PPM Bonus ($)</Label>
                          <Input
                            id="ppmBonus"
                            type="number"
                            min="0"
                            step="1"
                            value={payPlanForm.ppm_bonus}
                            onChange={e =>
                              setPayPlanForm({
                                ...payPlanForm,
                                ppm_bonus: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Volume Bonus Tiers</Label>
                        <div className="grid md:grid-cols-3 gap-4 mt-2">
                          {volumeTiers.map((tier, index) => (
                            <div key={tier.level} className="space-y-2">
                              <Label htmlFor={`tier-${index}`}>
                                {tier.level === 'tier1'
                                  ? 'Tier 1 (1-10 units)'
                                  : tier.level === 'tier2'
                                  ? 'Tier 2 (11-20 units)'
                                  : 'Tier 3 (21+ units)'}
                              </Label>
                              <Input
                                id={`tier-${index}`}
                                type="number"
                                min="0"
                                step="1"
                                value={tier.bonus}
                                onChange={e =>
                                  updateVolumeTier(index, parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" disabled={payPlanLoading || !payPlanForm.roleId}>
                        {payPlanLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Pay Plan
                      </Button>
                    </>
                  )}
                </form>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-xs text-muted-foreground">
                Pay plans are confidential and should only be modified by authorized personnel. All
                changes are logged for auditing purposes.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Scheduler Settings Tab */}
        <TabsContent value="scheduler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dealership Schedule</CardTitle>
              <CardDescription>
                Configure your dealership's operating hours for the scheduling system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-4">
                  {[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ].map(day => (
                    <div key={day} className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Label className="text-base">{day}</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor={`${day.toLowerCase()}-open`}>Open</Label>
                          <Select defaultValue="09:00">
                            <SelectTrigger id={`${day.toLowerCase()}-open`}>
                              <SelectValue placeholder="Open Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 13 }, (_, i) => i + 6).map(hour => (
                                <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                  {hour > 12
                                    ? `${hour - 12}:00 PM`
                                    : hour === 12
                                    ? '12:00 PM'
                                    : `${hour}:00 AM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${day.toLowerCase()}-close`}>Close</Label>
                          <Select defaultValue="18:00">
                            <SelectTrigger id={`${day.toLowerCase()}-close`}>
                              <SelectValue placeholder="Close Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 13 }, (_, i) => i + 10).map(hour => (
                                <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                  {hour > 12
                                    ? `${hour - 12}:00 PM`
                                    : hour === 12
                                    ? '12:00 PM'
                                    : `${hour}:00 AM`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`${day.toLowerCase()}-closed`}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <div className="flex">
                            <input
                              type="checkbox"
                              id={`${day.toLowerCase()}-closed`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              defaultChecked={day === 'Sunday'}
                            />
                            <span className="ml-2 text-sm">Closed</span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Schedule
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <p className="text-xs text-muted-foreground">
                These hours will be used by the scheduling system to determine when appointments can
                be booked.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
