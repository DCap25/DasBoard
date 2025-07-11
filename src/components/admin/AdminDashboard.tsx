import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '../../lib/use-toast';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Shield,
  Crown,
  Calculator,
  Car,
  TrendingUp,
  Plus,
  Edit,
  Trash,
  X,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Building,
  Target,
  BarChart3,
  Settings,
  Clock,
  Info,
} from 'lucide-react';
import { EnhancedPayPlanManager } from '../payplan/EnhancedPayPlanManager';
import { PayPlan } from '../../types/payPlan';
import { PayCalculator } from '../payplan/PayCalculator';

// User roles configuration
const USER_ROLES = [
  { id: 'salesperson', name: 'Salesperson', category: 'sales' },
  { id: 'finance_manager', name: 'Finance Manager', category: 'finance' },
  { id: 'finance_director', name: 'Finance Director', category: 'finance' },
  { id: 'sales_manager', name: 'Sales Manager', category: 'management' },
  { id: 'general_manager', name: 'General Manager', category: 'management' },
  { id: 'gsm', name: 'GSM', category: 'management' },
  { id: 'dealership_admin', name: 'Dealership Admin', category: 'admin' },
];

// Employment status options
const EMPLOYMENT_STATUS = [
  { id: 'employed', name: 'Employed', color: 'bg-green-100 text-green-800' },
  { id: 'suspended', name: 'Suspended', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'terminated', name: 'Terminated', color: 'bg-red-100 text-red-800' },
];

// Interfaces
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  role_id: string;
  employment_status?: string;
  created_at: string;
  start_date?: string;
  isEditing?: boolean;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  startDate: string;
  tempPassword: string;
  payPlanId: string;
}

interface StaffCounts {
  salesperson: number;
  finance_manager: number;
  sales_manager: number;
  general_manager: number;
  gsm: number;
  total: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for direct auth if Supabase auth is not available
  const directAuthData = localStorage.getItem('directauth_user');
  const directUser = directAuthData ? JSON.parse(directAuthData) : null;

  // Use direct auth user if Supabase user is not available
  const currentUser = user || directUser;

  // Extract dealershipId from current user
  const dealershipId = currentUser?.dealership_id || currentUser?.dealershipId || null;

  // Debug logging
  console.log('[AdminDashboard] Component rendering', {
    supabaseUser: user?.email,
    directUser: directUser?.email,
    currentUser: currentUser?.email,
    dealershipId: dealershipId,
  });

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [payPlans, setPayPlans] = useState<PayPlan[]>([]);
  const [staffCounts, setStaffCounts] = useState<StaffCounts>({
    salesperson: 0,
    finance_manager: 0,
    sales_manager: 0,
    general_manager: 0,
    gsm: 0,
    total: 0,
  });
  const [selectedTab, setSelectedTab] = useState('salesperson');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // Form state
  const [userForm, setUserForm] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    roleId: 'salesperson',
    startDate: '',
    tempPassword: '',
    payPlanId: '',
  });

  // Generate temporary password function
  const generateTempPassword = () => {
    const tempPassword =
      Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
    setUserForm({ ...userForm, tempPassword });
  };

  // Fetch data when component mounts
  useEffect(() => {
    console.log('[AdminDashboard] useEffect running - currentUser:', currentUser?.email);

    if (currentUser) {
      fetchUsers();
    } else {
      // If no user, just log it but still show the dashboard
      console.log('[AdminDashboard] No current user, showing dashboard anyway');
    }

    // Generate initial temporary password
    if (!userForm.tempPassword) {
      generateTempPassword();
    }
  }, [currentUser]);

  // Calculate staff counts when users change
  useEffect(() => {
    const counts = users.reduce(
      (acc, user) => {
        const role = user.role || user.role_id;
        if (role in acc) {
          acc[role as keyof StaffCounts]++;
        }
        acc.total++;
        return acc;
      },
      {
        salesperson: 0,
        finance_manager: 0,
        sales_manager: 0,
        general_manager: 0,
        gsm: 0,
        total: 0,
      }
    );
    setStaffCounts(counts);
  }, [users]);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, start_date, first_name, last_name, employment_status')
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
          first_name: user.first_name || user.email.split('@')[0].split('.')[0] || 'User',
          last_name: user.last_name || user.email.split('@')[0].split('.')[1] || '',
          email: user.email,
          role: user.role || 'viewer',
          role_id: user.role || 'viewer',
          employment_status: user.employment_status,
          created_at: user.created_at,
          start_date: user.start_date,
        })) || [];

      setUsers(mappedUsers);
      console.log('Fetched users:', mappedUsers);

      // Fetch pay plans after fetching users
      await fetchPayPlans();
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  // Fetch pay plans function
  const fetchPayPlans = async () => {
    try {
      // For now, use mock data since we don't have Supabase tables yet
      const mockPayPlans: PayPlan[] = [
        {
          id: '1',
          name: 'John Valentine Advanced Plan',
          description: 'Advanced F&I plan with complex bonus structures',
          role: 'finance_manager',
          dealership_id: dealershipId || 'demo',
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          plan_type: 'advanced',
          base_commission: {
            enabled: true,
            base_percentage: 25,
            tiers: [],
            applies_to: 'total_fi_income',
          },
          draw_structure: {
            enabled: true,
            amount: 2500,
            frequency: 'monthly',
            deducted_from_commissions: true,
          },
          penetration_bonuses: [],
          provider_bonuses: [],
          vehicle_allowance: {
            enabled: true,
            allowance_amount: 300,
            demo_privileges_available: true,
            description: '$300 vehicle allowance or demo privileges',
          },
          pto_structure: {
            enabled: true,
            annual_days: 12,
            prorated: true,
          },
          chargeback_protection: {
            enabled: true,
            protection_period_days: 90,
          },
        } as PayPlan,
        {
          id: '2',
          name: 'Lloyd Hatter Simple Plan',
          description: 'Simple PVR-based F&I plan',
          role: 'finance_manager',
          dealership_id: dealershipId || 'demo',
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          plan_type: 'simple',
          commission_structure: {
            base_fi_percentage: 12,
            pvr_tiers: [
              { min_value: 0, max_value: 999, percentage: 12, label: '$999 or below' },
              { min_value: 1000, max_value: 1199, percentage: 13, label: '$1,000 - $1,199' },
              { min_value: 1200, max_value: 1299, percentage: 14, label: '$1,200 - $1,299' },
              { min_value: 1300, percentage: 14.5, label: '$1,300+' },
            ],
          },
          monthly_draw: 2500,
          provider_bonuses: [],
          vehicle_allowance: {
            enabled: true,
            allowance_amount: 300,
            demo_privileges_available: true,
            description: '$300 vehicle allowance or demo privileges',
          },
          pto_structure: {
            enabled: true,
            annual_days: 12,
            prorated: true,
          },
        } as PayPlan,
        {
          id: '3',
          name: 'Basic Salesperson Plan',
          description: 'Standard salesperson compensation',
          role: 'salesperson',
          dealership_id: dealershipId || 'demo',
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          plan_type: 'simple',
          front_end_gross_percentage: 25,
          back_end_gross_percentage: 10,
          minimum_monthly_pay: 3000,
        } as PayPlan,
        {
          id: '4',
          name: 'Advanced Salesperson Plan',
          description:
            'Complex salesperson plan with unit flats, pack deductions, and minimum guarantees',
          role: 'salesperson',
          dealership_id: dealershipId || 'demo',
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          plan_type: 'advanced',
          front_end_commission: {
            gross_percentage: 15,
            unit_flat_structure: {
              enabled: true,
              tiers: [
                {
                  min_units: 0,
                  max_units: 14,
                  flat_amount: 14.5,
                  label: '0-14 units: $14.50',
                  retroactive: true,
                },
                {
                  min_units: 15,
                  max_units: 19,
                  flat_amount: 19.5,
                  label: '15-19 units: $19.50',
                  retroactive: true,
                },
                { min_units: 20, flat_amount: 25.0, label: '20+ units: $25.00', retroactive: true },
              ],
            },
            take_higher: true,
          },
          back_end_commission: {
            enabled: true,
            base_percentage: 10,
            tiers: [
              {
                min_units: 0,
                max_units: 14,
                percentage: 10,
                label: '0-14 units: 10%',
                retroactive: true,
              },
              {
                min_units: 15,
                max_units: 19,
                percentage: 12.5,
                label: '15-19 units: 12.5%',
                retroactive: true,
              },
              { min_units: 20, percentage: 15, label: '20+ units: 15%', retroactive: true },
            ],
          },
          used_vehicle_pack: {
            enabled: true,
            high_value_pack: {
              threshold: 10000,
              pack_amount: 10000,
            },
            low_value_pack: {
              min_threshold: 2000,
              max_threshold: 10000,
              pack_amount: 450,
            },
          },
          csi_bonus: {
            enabled: true,
            benchmark_bonus: {
              enabled: true,
              bonus_percentage: 5,
              description: 'Additional 5% on back-end if CSI above benchmark',
            },
          },
          minimum_guarantee: {
            enabled: true,
            tiers: [
              {
                min_units: 15,
                max_units: 19,
                guarantee_amount: 5000,
                label: '15-19 units: $5,000',
              },
              {
                min_units: 20,
                max_units: 24,
                guarantee_amount: 7500,
                label: '20-24 units: $7,500',
              },
              { min_units: 25, guarantee_amount: 10000, label: '25+ units: $10,000' },
            ],
          },
          conditions: {
            no_prepaid_commission: true,
            complete_paperwork_required: true,
            trade_payoff_discrepancy_flat: true,
            weekly_verification_required: true,
          },
          vehicle_allowance: {
            enabled: false,
            allowance_amount: 0,
            demo_privileges_available: false,
            description: 'No vehicle allowance',
          },
          pto_structure: {
            enabled: true,
            annual_days: 10,
            prorated: true,
          },
        } as PayPlan,
      ];

      setPayPlans(mockPayPlans);
    } catch (error) {
      console.error('Error fetching pay plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pay plans',
        variant: 'destructive',
      });
    }
  };

  // Handle user form submission
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);

    try {
      // Use temporary password from form state
      const tempPassword =
        userForm.tempPassword ||
        Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);

      // Use standard signup API
      const { data, error } = await supabase.auth.signUp({
        email: userForm.email,
        password: tempPassword,
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
        start_date: userForm.startDate,
      });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Show success message with temp password
      toast({
        title: 'Success',
        description: `User created successfully. Temporary password: ${tempPassword}`,
      });

      // Reset form and refresh user list
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        roleId: 'salesperson',
        startDate: '',
        tempPassword: '',
        payPlanId: '',
      });

      // Generate new password for next user
      generateTempPassword();

      await fetchUsers();
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

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });

      setEditingUserId(null);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  // Update user employment status
  const updateEmploymentStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ employment_status: status })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Employment status updated to ${status}`,
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating employment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employment status',
        variant: 'destructive',
      });
    }
  };

  // Toggle edit mode
  const toggleEditMode = (userId: string) => {
    setEditingUserId(editingUserId === userId ? null : userId);
  };

  // Filter users by role and sort by employment status
  const getUsersByRole = (role: string) => {
    const filteredUsers = users.filter(user => (user.role || user.role_id) === role);

    // Sort by employment status: employed first, then suspended, then terminated
    return filteredUsers.sort((a, b) => {
      const statusOrder = { employed: 0, suspended: 1, terminated: 2 };
      const statusA = a.employment_status || 'employed';
      const statusB = b.employment_status || 'employed';
      return statusOrder[statusA] - statusOrder[statusB];
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string = 'employed') => {
    const statusConfig = EMPLOYMENT_STATUS.find(s => s.id === status) || EMPLOYMENT_STATUS[0];
    return <Badge className={statusConfig.color}>{statusConfig.name}</Badge>;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dealership Admin</h1>
          <p className="text-muted-foreground">Manage your dealership staff and operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Building className="w-4 h-4 mr-1" />
            Admin Dashboard
          </Badge>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Salespeople */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salespeople</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCounts.salesperson}</div>
            <p className="text-xs text-muted-foreground">Active sales staff members</p>
          </CardContent>
        </Card>

        {/* Finance Managers */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finance Managers</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCounts.finance_manager}</div>
            <p className="text-xs text-muted-foreground">F&I department staff</p>
          </CardContent>
        </Card>

        {/* Sales Managers */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Managers</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCounts.sales_manager}</div>
            <p className="text-xs text-muted-foreground">Sales management team</p>
          </CardContent>
        </Card>

        {/* GM/GSM */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GM/GSM</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffCounts.general_manager + staffCounts.gsm}
            </div>
            <p className="text-xs text-muted-foreground">Executive management</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management Section */}
      <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Staff Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="salesperson">Sales People</TabsTrigger>
              <TabsTrigger value="finance_manager">Finance Managers</TabsTrigger>
              <TabsTrigger value="sales_manager">Sales Managers</TabsTrigger>
              <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
              <TabsTrigger value="payplans">Pay Plans</TabsTrigger>
            </TabsList>

            {/* Sales People Tab */}
            <TabsContent value="salesperson" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sales Team ({staffCounts.salesperson})</h3>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px] bg-red-600 text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getUsersByRole('salesperson').map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.start_date
                            ? new Date(user.start_date).toLocaleDateString()
                            : 'Not set'}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.employment_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={user.employment_status || 'employed'}
                              onValueChange={value => updateEmploymentStatus(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EMPLOYMENT_STATUS.map(status => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEditMode(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Finance Managers Tab */}
            <TabsContent value="finance_manager" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Finance Team ({staffCounts.finance_manager})
                </h3>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px] bg-red-600 text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getUsersByRole('finance_manager').map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.start_date
                            ? new Date(user.start_date).toLocaleDateString()
                            : 'Not set'}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.employment_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={user.employment_status || 'employed'}
                              onValueChange={value => updateEmploymentStatus(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EMPLOYMENT_STATUS.map(status => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEditMode(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Sales Managers Tab */}
            <TabsContent value="sales_manager" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Management Team ({staffCounts.sales_manager})
                </h3>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px] bg-red-600 text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getUsersByRole('sales_manager').map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.start_date
                            ? new Date(user.start_date).toLocaleDateString()
                            : 'Not set'}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.employment_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={user.employment_status || 'employed'}
                              onValueChange={value => updateEmploymentStatus(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EMPLOYMENT_STATUS.map(status => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleEditMode(user.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Scheduler Tab */}
            <TabsContent value="scheduler" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Dealership Schedule & Hours
                </h3>
                <Button
                  onClick={() => {
                    navigate('/dashboard/sales-manager/schedule');
                  }}
                  variant="outline"
                  className="flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Advanced Scheduler
                </Button>
              </div>

              {/* Dealership Hours Configuration */}
              <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Dealership Operating Hours
                  </CardTitle>
                  <CardDescription>
                    Set the standard operating hours for your dealership. These hours will be used
                    as the base for staff scheduling.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[
                      { day: 'Monday', key: 'monday' },
                      { day: 'Tuesday', key: 'tuesday' },
                      { day: 'Wednesday', key: 'wednesday' },
                      { day: 'Thursday', key: 'thursday' },
                      { day: 'Friday', key: 'friday' },
                      { day: 'Saturday', key: 'saturday' },
                      { day: 'Sunday', key: 'sunday' },
                    ].map(({ day, key }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-20 font-medium">{day}</div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              defaultValue="09:00"
                              className="w-24"
                              placeholder="Open"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              defaultValue="20:00"
                              className="w-24"
                              placeholder="Close"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`closed-${key}`} />
                          <Label
                            htmlFor={`closed-${key}`}
                            className="text-sm text-muted-foreground"
                          >
                            Closed
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Hours
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Week Schedule Overview */}
              <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    This Week's Schedule
                  </CardTitle>
                  <CardDescription>
                    Overview of staff schedules for the current week. Click "Advanced Scheduler"
                    above for full editing capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {/* Week header */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="font-semibold p-2 bg-muted rounded">
                        {day}
                      </div>
                    ))}

                    {/* Schedule data - simplified view */}
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="p-2 border rounded min-h-[100px]">
                        <div className="text-xs space-y-1">
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Team A: 9am-6pm
                          </div>
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Team B: 11am-8pm
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-800">
                      <Info className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Schedule Management</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Sales Managers can edit team schedules from their dashboard. Use the "Advanced
                      Scheduler" button above for detailed schedule management.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pay Plans Tab */}
            <TabsContent value="payplans" className="space-y-4">
              <div className="grid gap-6">
                {/* Pay Plan Management */}
                <EnhancedPayPlanManager
                  dealershipId={dealershipId || 'demo'}
                  isGroupAdmin={false}
                />

                {/* Pay Calculator */}
                <PayCalculator payPlans={payPlans} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add New User Form */}
      <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Staff Member
          </CardTitle>
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="john.doe@dealership.com"
                required
              />
            </div>

            {/* Role and Start Date on same line */}
            <div className="grid md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={userForm.startDate}
                  onChange={e => setUserForm({ ...userForm, startDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Temporary Password Field */}
            <div className="space-y-2">
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  id="tempPassword"
                  type="text"
                  value={userForm.tempPassword}
                  onChange={e => setUserForm({ ...userForm, tempPassword: e.target.value })}
                  placeholder="Auto-generated password"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateTempPassword}
                  className="shrink-0"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                User will be required to change their password on first login.
              </p>
            </div>

            {/* Pay Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="payPlan">Pay Plan</Label>
              <Select
                value={userForm.payPlanId}
                onValueChange={value => setUserForm({ ...userForm, payPlanId: value })}
              >
                <SelectTrigger id="payPlan">
                  <SelectValue placeholder="Select a pay plan" />
                </SelectTrigger>
                <SelectContent>
                  {payPlans
                    .filter(plan => plan.role === userForm.roleId && plan.is_active)
                    .map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex flex-col">
                          <span>{plan.name}</span>
                          <span className="text-xs text-muted-foreground">{plan.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  {payPlans.filter(plan => plan.role === userForm.roleId && plan.is_active)
                    .length === 0 && (
                    <SelectItem value="no-plans" disabled>
                      No active pay plans for this role
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pay plan determines the compensation structure for this employee. You can create new
                pay plans in the Pay Plans tab above.
              </p>
            </div>

            <Button type="submit" disabled={userLoading} className="w-full">
              {userLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Staff Member
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Team Overview Section */}
      <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Team Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Team */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Sales Team
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Salespeople</span>
                  <Badge variant="outline">{staffCounts.salesperson}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sales Managers</span>
                  <Badge variant="outline">{staffCounts.sales_manager}</Badge>
                </div>
              </div>
            </div>

            {/* Finance Team */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Finance Team
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Finance Managers</span>
                  <Badge variant="outline">{staffCounts.finance_manager}</Badge>
                </div>
              </div>
            </div>

            {/* Management */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Executive Team
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>General Managers</span>
                  <Badge variant="outline">{staffCounts.general_manager}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>GSM</span>
                  <Badge variant="outline">{staffCounts.gsm}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
