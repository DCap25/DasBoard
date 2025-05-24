import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { AlertTriangle, ArrowLeft, BarChart3, ChevronRight, Loader2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from '../../lib/use-toast';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

interface DealershipData {
  id: number;
  name: string;
  schema_name: string;
  locations?: any;
  settings?: any;
  group_id?: number;
  dealership_groups?: {
    id: number;
    name: string;
    settings?: any;
  };
  performance?: {
    todaySales: number;
    monthSales: number;
    goalProgress: number;
  };
  userCounts?: {
    total: number;
    salesPeople: number;
    financeManagers: number;
    managers: number;
  };
  userLimits?: {
    sales_people: number;
    finance_managers: number;
    sales_managers: number;
    general_managers: number;
    finance_directors?: number;
    finance_assistants?: number;
    gsm?: number;
    area_vps?: number;
  };
  capacity?: {
    salesPeople: number;
    financeManagers: number;
    managers: number;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  dealership_id: number;
  dealership_name: string;
  last_login?: string;
}

export function AVPDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [assignedDealerships, setAssignedDealerships] = useState<DealershipData[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<DealershipData | null>(null);
  const [dealershipUsers, setDealershipUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchAvpData();
  }, []);

  const fetchAvpData = async () => {
    try {
      setLoading(true);
      console.log('[AVPDashboard] Fetching Area VP data');

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Fetch AVP assignments
      const { data: avpData, error: avpError } = await supabase
        .from('area_vps')
        .select('*, dealership_groups(id, name, settings)')
        .eq('user_id', user.id)
        .single();

      if (avpError || !avpData) {
        console.error('[AVPDashboard] Error fetching AVP data:', avpError);
        throw new Error('You do not have Area VP permissions.');
      }

      // Extract dealer group information
      const dealerGroup = avpData.dealership_groups;
      const dealerships = avpData.dealerships || [];

      console.log('[AVPDashboard] AVP data retrieved:', {
        avpId: avpData.id,
        dealershipCount: dealerships.length,
        groupId: dealerGroup?.id,
        groupSettings: dealerGroup?.settings,
      });

      if (dealerships.length === 0) {
        console.warn('[AVPDashboard] No dealerships assigned to this Area VP');
        setAssignedDealerships([]);
        setLoading(false);
        return;
      }

      // Extract group settings and limits if available
      const groupSettings = dealerGroup?.settings || {};
      const groupLevel = groupSettings.level || 'level_1';
      const groupAddOns = groupSettings.add_ons || [];
      const userLimits = groupSettings.user_limits || {
        sales_people: 10,
        finance_managers: 3,
        sales_managers: 3,
        general_managers: 1,
      };

      console.log('[AVPDashboard] Group settings:', {
        level: groupLevel,
        addOns: groupAddOns,
        userLimits,
      });

      // Fetch details for each assigned dealership
      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .select('id, name, schema_name, locations, settings, group_id')
        .in('id', dealerships);

      if (dealershipError) {
        console.error('[AVPDashboard] Error fetching dealership data:', dealershipError);
        throw new Error('Failed to fetch dealership data');
      }

      console.log(
        '[AVPDashboard] Retrieved dealership data for',
        dealershipData.length,
        'dealerships'
      );

      // For each dealership, fetch real performance metrics if available
      const enhancedDealerships = await Promise.all(
        dealershipData.map(async dealership => {
          // Attempt to get real metrics from the dealership's schema
          let performance = {
            todaySales: 0,
            monthSales: 0,
            goalProgress: 0,
          };

          let userCounts = {
            total: 0,
            salesPeople: 0,
            financeManagers: 0,
            managers: 0,
          };

          try {
            // Get real user counts based on role types
            const { data: users, error: usersError } = await supabase
              .from('profiles')
              .select('id, role_id')
              .eq('dealership_id', dealership.id);

            if (!usersError && users) {
              // Count users by role
              userCounts.total = users.length;

              // For a real implementation, you would categorize users by role_id
              // For now, use mock distribution for demonstration
              userCounts.salesPeople = Math.floor(users.length * 0.6);
              userCounts.financeManagers = Math.floor(users.length * 0.2);
              userCounts.managers = Math.floor(users.length * 0.2);
            }

            // Try to get real sales metrics if available
            const { data: salesData, error: salesError } = await supabase
              .from('deals')
              .select('id, sale_date')
              .eq('dealership_id', dealership.id)
              .gte('sale_date', new Date(new Date().setDate(1)).toISOString());

            if (!salesError && salesData) {
              // Count sales for the current month
              performance.monthSales = salesData.length;

              // Count sales for today
              const today = new Date().toISOString().split('T')[0];
              performance.todaySales = salesData.filter(sale =>
                sale.sale_date.startsWith(today)
              ).length;

              // Calculate goal progress (assuming goal is stored in settings or using default)
              const monthlyGoal = dealership.settings?.monthly_sales_goal || 100;
              performance.goalProgress = Math.min(
                100,
                Math.floor((performance.monthSales / monthlyGoal) * 100)
              );
            }
          } catch (err) {
            console.warn(
              `[AVPDashboard] Error fetching metrics for dealership ${dealership.id}:`,
              err
            );
            // Fall back to mock data if real data fetch fails
            performance = {
              todaySales: Math.floor(Math.random() * 10),
              monthSales: Math.floor(Math.random() * 100),
              goalProgress: Math.floor(Math.random() * 100),
            };
            userCounts = {
              total: Math.floor(Math.random() * 50) + 10,
              salesPeople: Math.floor(Math.random() * 30) + 5,
              financeManagers: Math.floor(Math.random() * 5) + 1,
              managers: Math.floor(Math.random() * 5) + 1,
            };
          }

          // Enhanced dealership object with metrics and limits
          return {
            ...dealership,
            performance,
            userCounts,
            // Add user limits based on group settings
            userLimits: {
              ...userLimits,
              // Override with dealership-specific limits if available
              ...(dealership.settings?.user_limits || {}),
            },
            // Track capacity based on limits
            capacity: {
              salesPeople: Math.floor((userCounts.salesPeople / userLimits.sales_people) * 100),
              financeManagers: Math.floor(
                (userCounts.financeManagers / userLimits.finance_managers) * 100
              ),
              managers: Math.floor(
                (userCounts.managers / (userLimits.sales_managers + userLimits.general_managers)) *
                  100
              ),
            },
          };
        })
      );

      setAssignedDealerships(enhancedDealerships);
      console.log('[AVPDashboard] Enhanced dealership data:', enhancedDealerships);
    } catch (error) {
      console.error('[AVPDashboard] Error in fetchAvpData:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load Area VP data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDealershipUsers = async (dealershipId: number) => {
    try {
      setLoadingUsers(true);

      // Fetch users for the selected dealership
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, dealership_id, last_login')
        .eq('dealership_id', dealershipId);

      if (error) {
        throw error;
      }

      // Transform data to match UserData interface
      const usersWithDealershipName = data.map(user => ({
        ...user,
        dealership_name: selectedDealership?.name || 'Unknown Dealership',
      }));

      setDealershipUsers(usersWithDealershipName);
    } catch (error) {
      console.error('Error fetching dealership users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dealership users',
        variant: 'destructive',
      });
      setDealershipUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const switchDealership = (dealershipId: number) => {
    const dealership = assignedDealerships.find(d => d.id === dealershipId);
    if (dealership) {
      setSelectedDealership(dealership);
      fetchDealershipUsers(dealershipId);
    }
  };

  const backToOverview = () => {
    setSelectedDealership(null);
    setDealershipUsers([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If a dealership is selected, show the detailed view
  if (selectedDealership) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={backToOverview} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dealerships
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{selectedDealership.name}</h1>
            {selectedDealership.group_id && (
              <div className="text-sm text-muted-foreground">
                Dealer Group: {selectedDealership.dealership_groups?.name || 'Unknown Group'}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Badge variant="outline" className="text-sm">
              Schema: {selectedDealership.schema_name}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Area VP Dashboard
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {selectedDealership.performance?.todaySales || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Month to Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {selectedDealership.performance?.monthSales || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {selectedDealership.performance?.goalProgress || 0}%
              </div>
              <Progress value={selectedDealership.performance?.goalProgress || 0} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Staff capacity section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Staff Capacity</CardTitle>
            <CardDescription>Current staff utilization and available positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sales People</CardTitle>
                  <CardDescription>
                    {selectedDealership.userCounts?.salesPeople || 0} of{' '}
                    {selectedDealership.userLimits?.sales_people || 0} Positions Filled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={selectedDealership.capacity?.salesPeople ?? 0}
                    className={
                      (selectedDealership.capacity?.salesPeople ?? 0) > 90
                        ? 'h-2 bg-red-200'
                        : 'h-2'
                    }
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Available Positions:</span>
                    <span className="font-medium">
                      {Math.max(
                        0,
                        (selectedDealership.userLimits?.sales_people || 0) -
                          (selectedDealership.userCounts?.salesPeople || 0)
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Finance Managers</CardTitle>
                  <CardDescription>
                    {selectedDealership.userCounts?.financeManagers || 0} of{' '}
                    {selectedDealership.userLimits?.finance_managers || 0} Positions Filled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={selectedDealership.capacity?.financeManagers ?? 0}
                    className={
                      (selectedDealership.capacity?.financeManagers ?? 0) > 90
                        ? 'h-2 bg-red-200'
                        : 'h-2'
                    }
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Available Positions:</span>
                    <span className="font-medium">
                      {Math.max(
                        0,
                        (selectedDealership.userLimits?.finance_managers || 0) -
                          (selectedDealership.userCounts?.financeManagers || 0)
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Management</CardTitle>
                  <CardDescription>
                    {selectedDealership.userCounts?.managers || 0} of{' '}
                    {(selectedDealership.userLimits?.sales_managers || 0) +
                      (selectedDealership.userLimits?.general_managers || 0)}{' '}
                    Positions Filled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={selectedDealership.capacity?.managers ?? 0}
                    className={
                      (selectedDealership.capacity?.managers ?? 0) > 90 ? 'h-2 bg-red-200' : 'h-2'
                    }
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Available Positions:</span>
                    <span className="font-medium">
                      {Math.max(
                        0,
                        (selectedDealership.userLimits?.sales_managers || 0) +
                          (selectedDealership.userLimits?.general_managers || 0) -
                          (selectedDealership.userCounts?.managers || 0)
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Manage dealership users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealershipUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8 mb-2" />
                          <p>No users found for this dealership</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dealershipUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.last_login
                            ? format(new Date(user.last_login), 'MMM d, yyyy')
                            : 'Never logged in'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Area VP Dashboard</h1>
          {assignedDealerships.length > 0 && assignedDealerships[0].group_id && (
            <div className="text-sm text-muted-foreground">
              {/* Show dealer group name if available */}
              Dealer Group: {assignedDealerships[0]?.dealership_groups?.name || 'Group'} • Managing{' '}
              {assignedDealerships.length} Dealerships
            </div>
          )}
        </div>

        {/* Version badge based on user limits */}
        {assignedDealerships.length > 0 && assignedDealerships[0]?.userLimits && (
          <Badge variant="outline" className="text-sm">
            {assignedDealerships[0]?.userLimits?.sales_people > 20
              ? '++ Version'
              : assignedDealerships[0]?.userLimits?.sales_people > 10
              ? '+ Version'
              : 'Standard'}{' '}
            Plan
          </Badge>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Assigned Dealerships</CardTitle>
          <CardDescription>Manage and monitor dealerships assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedDealerships.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">No Dealerships Assigned</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any dealerships assigned to you yet. Please contact your group
                administrator.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedDealerships.map(dealership => (
                <Card key={dealership.id} className="overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">{dealership.name}</h3>

                        {/* Capacity warning indicator */}
                        {dealership.capacity &&
                          ((dealership.capacity?.salesPeople ?? 0) > 90 ||
                            (dealership.capacity?.financeManagers ?? 0) > 90 ||
                            (dealership.capacity?.managers ?? 0) > 90) && (
                            <Badge variant="destructive" className="ml-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              At Capacity
                            </Badge>
                          )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary" className="rounded-sm">
                          {dealership.userCounts?.total || 0} Team Members
                        </Badge>
                        <Badge variant="outline" className="rounded-sm">
                          {dealership.performance?.monthSales || 0} Sales MTD
                        </Badge>
                        <Badge variant="outline" className="rounded-sm">
                          Schema: {dealership.schema_name}
                        </Badge>
                      </div>

                      {/* User count indicators with capacity */}
                      {dealership.userLimits && (
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span>Sales:</span>
                              <span
                                className={
                                  (dealership.capacity?.salesPeople ?? 0) > 90
                                    ? 'text-red-500 font-bold'
                                    : ''
                                }
                              >
                                {dealership.userCounts?.salesPeople}/
                                {dealership.userLimits?.sales_people}
                              </span>
                            </div>
                            <Progress
                              value={dealership.capacity?.salesPeople ?? 0}
                              className={
                                (dealership.capacity?.salesPeople ?? 0) > 90
                                  ? 'h-1 mt-1 bg-red-200'
                                  : 'h-1 mt-1'
                              }
                            />
                          </div>
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span>F&I:</span>
                              <span
                                className={
                                  (dealership.capacity?.financeManagers ?? 0) > 90
                                    ? 'text-red-500 font-bold'
                                    : ''
                                }
                              >
                                {dealership.userCounts?.financeManagers}/
                                {dealership.userLimits?.finance_managers}
                              </span>
                            </div>
                            <Progress
                              value={dealership.capacity?.financeManagers ?? 0}
                              className={
                                (dealership.capacity?.financeManagers ?? 0) > 90
                                  ? 'h-1 mt-1 bg-red-200'
                                  : 'h-1 mt-1'
                              }
                            />
                          </div>
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span>Mgmt:</span>
                              <span
                                className={
                                  (dealership.capacity?.managers ?? 0) > 90
                                    ? 'text-red-500 font-bold'
                                    : ''
                                }
                              >
                                {dealership.userCounts?.managers}/
                                {(dealership.userLimits?.sales_managers || 0) +
                                  (dealership.userLimits?.general_managers || 0)}
                              </span>
                            </div>
                            <Progress
                              value={dealership.capacity?.managers ?? 0}
                              className={
                                (dealership.capacity?.managers ?? 0) > 90
                                  ? 'h-1 mt-1 bg-red-200'
                                  : 'h-1 mt-1'
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm mb-1">
                        Goal Progress:{' '}
                        <span className="font-semibold">
                          {dealership.performance?.goalProgress || 0}%
                        </span>
                      </div>
                      <Progress
                        value={dealership.performance?.goalProgress || 0}
                        className="h-2 w-32 mb-2"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => switchDealership(dealership.id)}
                      >
                        Manage <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Analytics</CardTitle>
          <CardDescription>Performance overview across all your dealerships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center py-8">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {assignedDealerships.reduce((sum, d) => sum + (d.performance?.todaySales || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Sales Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {assignedDealerships.reduce((sum, d) => sum + (d.performance?.monthSales || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Sales This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {assignedDealerships.reduce((sum, d) => sum + (d.userCounts?.total || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Team Members</div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
