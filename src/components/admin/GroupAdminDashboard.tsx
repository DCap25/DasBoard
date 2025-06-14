import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '../../hooks/use-toast';
import { EnhancedPayPlanManager } from '../payplan/EnhancedPayPlanManager';
import {
  Building2,
  Users,
  Car,
  TrendingUp,
  Settings,
  ArrowLeft,
  MapPin,
  BarChart3,
  UserCircle,
  Calculator,
  Target,
  Crown,
  Clock,
  Plus,
  Edit,
  Save,
  Building,
  Info,
  Loader2,
} from 'lucide-react';

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
  dealership_id: string;
}

interface Dealership {
  id: string;
  name: string;
  location: string;
  phone?: string;
  email?: string;
  created_at: string;
  salespeople_count: number;
  finance_count: number;
  managers_count: number;
  total_staff: number;
  monthly_sales: number;
  monthly_revenue: number;
  // Configuration status
  is_configured: boolean;
}

interface GroupMetrics {
  total_dealerships: number;
  total_users: number;
  monthly_vehicles_sold: number;
  total_revenue: number;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  startDate: string;
  tempPassword: string;
  dealershipId: string;
}

interface StaffCounts {
  salesperson: number;
  finance_manager: number;
  sales_manager: number;
  general_manager: number;
  gsm: number;
  total: number;
}

export function GroupAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for direct auth
  const directAuthData = localStorage.getItem('directauth_user');
  const directUser = directAuthData ? JSON.parse(directAuthData) : null;
  const currentUser = user || directUser;

  // State
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [groupMetrics, setGroupMetrics] = useState<GroupMetrics>({
    total_dealerships: 0,
    total_users: 0,
    monthly_vehicles_sold: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(false);

  // Configuration state
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [dealershipUsers, setDealershipUsers] = useState<User[]>([]);
  const [staffCounts, setStaffCounts] = useState<StaffCounts>({
    salesperson: 0,
    finance_manager: 0,
    sales_manager: 0,
    general_manager: 0,
    gsm: 0,
    total: 0,
  });

  // User form state
  const [userForm, setUserForm] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    roleId: 'salesperson',
    startDate: '',
    tempPassword: '',
    dealershipId: '',
  });
  const [userLoading, setUserLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('staff');

  // Fetch data on component mount
  useEffect(() => {
    console.log('[GroupAdminDashboard] Component mounting - currentUser:', currentUser?.email);
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Calculate staff counts when dealership users change
  useEffect(() => {
    if (selectedDealership && dealershipUsers.length > 0) {
      const counts = dealershipUsers.reduce(
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
    }
  }, [dealershipUsers, selectedDealership]);

  // Generate temporary password function
  const generateTempPassword = () => {
    const tempPassword =
      Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
    setUserForm({ ...userForm, tempPassword });
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Mock data - these would come from the Master Admin's dealership creation
      const mockDealerships: Dealership[] = [
        {
          id: '1',
          name: 'Downtown Toyota',
          location: 'Chicago, IL',
          phone: '(312) 555-0123',
          email: 'info@downtowntoyota.com',
          created_at: '2024-01-15',
          salespeople_count: 12,
          finance_count: 3,
          managers_count: 4,
          total_staff: 19,
          monthly_sales: 145,
          monthly_revenue: 4350000,
          is_configured: true,
        },
        {
          id: '2',
          name: 'Suburban Honda',
          location: 'Naperville, IL',
          phone: '(630) 555-0456',
          email: 'contact@suburbanhonda.com',
          created_at: '2024-02-01',
          salespeople_count: 8,
          finance_count: 2,
          managers_count: 3,
          total_staff: 13,
          monthly_sales: 98,
          monthly_revenue: 2940000,
          is_configured: false, // Needs configuration
        },
        {
          id: '3',
          name: 'Metro Ford',
          location: 'Aurora, IL',
          phone: '(630) 555-0789',
          email: 'hello@metroford.com',
          created_at: '2024-01-20',
          salespeople_count: 15,
          finance_count: 4,
          managers_count: 5,
          total_staff: 24,
          monthly_sales: 187,
          monthly_revenue: 5610000,
          is_configured: true,
        },
      ];

      setDealerships(mockDealerships);

      // Calculate group metrics
      const metrics: GroupMetrics = {
        total_dealerships: mockDealerships.length,
        total_users: mockDealerships.reduce((sum, d) => sum + d.total_staff, 0),
        monthly_vehicles_sold: mockDealerships.reduce((sum, d) => sum + d.monthly_sales, 0),
        total_revenue: mockDealerships.reduce((sum, d) => sum + d.monthly_revenue, 0),
      };

      setGroupMetrics(metrics);
      console.log('[GroupAdminDashboard] Data loaded successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle dealership configuration
  const handleConfigureDealership = async (dealership: Dealership) => {
    setSelectedDealership(dealership);
    setUserForm({ ...userForm, dealershipId: dealership.id });

    // Generate initial password
    if (!userForm.tempPassword) {
      generateTempPassword();
    }

    // Fetch dealership users
    await fetchDealershipUsers(dealership.id);
  };

  // Fetch users for a specific dealership
  const fetchDealershipUsers = async (dealershipId: string) => {
    try {
      // Mock dealership users data
      const mockUsers: User[] = [
        {
          id: 'u1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@dealership.com',
          role: 'salesperson',
          role_id: 'salesperson',
          employment_status: 'employed',
          created_at: '2024-01-10',
          start_date: '2024-01-15',
          dealership_id: dealershipId,
        },
        {
          id: 'u2',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@dealership.com',
          role: 'finance_manager',
          role_id: 'finance_manager',
          employment_status: 'employed',
          created_at: '2024-01-12',
          start_date: '2024-01-20',
          dealership_id: dealershipId,
        },
      ];

      setDealershipUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching dealership users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dealership staff',
        variant: 'destructive',
      });
    }
  };

  // Handle adding new user to dealership
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);

    try {
      // Mock user creation
      const newUser: User = {
        id: `u${Date.now()}`,
        first_name: userForm.firstName,
        last_name: userForm.lastName,
        email: userForm.email,
        role: userForm.roleId,
        role_id: userForm.roleId,
        employment_status: 'employed',
        created_at: new Date().toISOString(),
        start_date: userForm.startDate,
        dealership_id: userForm.dealershipId,
      };

      setDealershipUsers([...dealershipUsers, newUser]);

      // Reset form
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        roleId: 'salesperson',
        startDate: '',
        tempPassword: '',
        dealershipId: selectedDealership?.id || '',
      });

      generateTempPassword();

      toast({
        title: 'Success',
        description: `${userForm.firstName} ${userForm.lastName} has been added to ${selectedDealership?.name}`,
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member',
        variant: 'destructive',
      });
    } finally {
      setUserLoading(false);
    }
  };

  // Update employment status
  const updateEmploymentStatus = async (userId: string, status: string) => {
    try {
      setDealershipUsers(
        dealershipUsers.map(user =>
          user.id === userId ? { ...user, employment_status: status } : user
        )
      );

      toast({
        title: 'Success',
        description: `Employment status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating employment status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employment status',
        variant: 'destructive',
      });
    }
  };

  // Get users by role for the selected dealership
  const getUsersByRole = (role: string) => {
    const filteredUsers = dealershipUsers.filter(user => (user.role || user.role_id) === role);

    // Sort by employment status
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

  // Back to dealership list
  const handleBackToDealerships = () => {
    setSelectedDealership(null);
    setDealershipUsers([]);
    setSelectedTab('staff');
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

  // If a dealership is selected, show the configuration view
  if (selectedDealership) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBackToDealerships}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dealerships
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Configure {selectedDealership.name}
              </h1>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {selectedDealership.location}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              <Settings className="w-4 h-4 mr-1" />
              Configuration
            </Badge>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="hours">Operating Hours</TabsTrigger>
            <TabsTrigger value="payplans">Pay Plans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            {/* Staff Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales People</CardTitle>
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staffCounts.salesperson}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Finance Managers</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staffCounts.finance_manager}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales Managers</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staffCounts.sales_manager}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staffCounts.total}</div>
                </CardContent>
              </Card>
            </div>

            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dealershipUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {USER_ROLES.find(r => r.id === user.role)?.name || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.start_date
                              ? new Date(user.start_date).toLocaleDateString()
                              : 'Not set'}
                          </TableCell>
                          <TableCell>{getStatusBadge(user.employment_status)}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Add New Staff Form */}
            <Card>
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
          </TabsContent>

          {/* Operating Hours Tab */}
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Dealership Operating Hours
                </CardTitle>
                <CardDescription>
                  Set the standard operating hours for this dealership. These hours will be used as
                  the base for staff scheduling.
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
                        <Label htmlFor={`closed-${key}`} className="text-sm text-muted-foreground">
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
          </TabsContent>

          {/* Pay Plans Tab */}
          <TabsContent value="payplans" className="space-y-6">
            <EnhancedPayPlanManager dealershipId={selectedDealership.id} isGroupAdmin={true} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dealership Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealership-name">Dealership Name</Label>
                    <Input
                      id="dealership-name"
                      defaultValue={selectedDealership.name}
                      placeholder="Dealership Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealership-location">Location</Label>
                    <Input
                      id="dealership-location"
                      defaultValue={selectedDealership.location}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealership-phone">Phone Number</Label>
                    <Input
                      id="dealership-phone"
                      defaultValue={selectedDealership.phone}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealership-email">Email</Label>
                    <Input
                      id="dealership-email"
                      defaultValue={selectedDealership.email}
                      placeholder="info@dealership.com"
                    />
                  </div>
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Main dealership list view
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and configure your dealership group</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Building2 className="w-4 h-4 mr-1" />
            Group Admin
          </Badge>
        </div>
      </div>

      {/* Top Metrics Cards - 4 boxes as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Box 1: Number of Dealerships */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Number of Dealerships</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupMetrics.total_dealerships}</div>
            <p className="text-xs text-muted-foreground">Active dealership locations</p>
          </CardContent>
        </Card>

        {/* Box 2: Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupMetrics.total_users}</div>
            <p className="text-xs text-muted-foreground">Staff across all dealerships</p>
          </CardContent>
        </Card>

        {/* Box 3: Total Vehicles Sold MTD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles Sold MTD</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupMetrics.monthly_vehicles_sold}</div>
            <p className="text-xs text-muted-foreground">Month to date sales</p>
          </CardContent>
        </Card>

        {/* Box 4: TBD - Using Group Revenue for now */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBD Metric</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(groupMetrics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">To be determined</p>
          </CardContent>
        </Card>
      </div>

      {/* Dealership Configuration Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Dealership Configuration</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {dealerships.map(dealership => (
            <Card key={dealership.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {dealership.name}
                      {!dealership.is_configured && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Needs Setup
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {dealership.location}
                    </CardDescription>
                  </div>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Staff Metrics */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Staff Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <UserCircle className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sales People</p>
                        <p className="font-semibold">{dealership.salespeople_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Finance People</p>
                        <p className="font-semibold">{dealership.finance_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sales Managers</p>
                        <p className="font-semibold">{dealership.managers_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Staff</p>
                        <p className="font-semibold">{dealership.total_staff}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Monthly Performance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vehicles Sold:</span>
                      <Badge variant="secondary">{dealership.monthly_sales}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue:</span>
                      <Badge variant="secondary">
                        {formatCurrency(dealership.monthly_revenue)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Configuration Status and Actions */}
                <div className="pt-3 border-t space-y-2">
                  {dealership.is_configured ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Configuration Complete
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600 text-sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Requires Configuration
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleConfigureDealership(dealership)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Dealership
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
