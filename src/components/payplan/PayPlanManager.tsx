import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import {
  PayPlan,
  SalespersonPayPlan,
  FinanceManagerPayPlan,
  SalesManagerPayPlan,
  GeneralManagerPayPlan,
  PayPlanAssignment,
  PAY_PLAN_CONFIG,
  validatePayPlan,
} from '../../types/payPlan';

interface PayPlanManagerProps {
  dealershipId: string;
  isGroupAdmin?: boolean;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  current_pay_plan?: string;
}

export function PayPlanManager({ dealershipId, isGroupAdmin = false }: PayPlanManagerProps) {
  const { toast } = useToast();

  // State
  const [payPlans, setPayPlans] = useState<PayPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<PayPlanAssignment[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [editingPlan, setEditingPlan] = useState<PayPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for creating/editing pay plans
  const [formData, setFormData] = useState<Partial<PayPlan>>({
    name: '',
    description: '',
    role: 'salesperson',
    is_active: true,
  });

  useEffect(() => {
    fetchPayPlans();
    fetchUsers();
    fetchAssignments();
  }, [dealershipId]);

  const fetchPayPlans = async () => {
    try {
      // Mock data - would come from API
      const mockPlans: PayPlan[] = [
        {
          id: 'sp1',
          name: 'Standard Salesperson Plan',
          description: 'Standard commission structure for salespeople',
          role: 'salesperson',
          dealership_id: dealershipId,
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          is_active: true,
          front_end_gross_percentage: 25,
          back_end_gross_percentage: 10,
          monthly_unit_bonuses: [
            { units_threshold: 10, bonus_amount: 500 },
            { units_threshold: 15, bonus_amount: 1000 },
          ],
          csi_bonus: {
            enabled: true,
            threshold_score: 90,
            bonus_amount: 300,
          },
          minimum_monthly_pay: 2000,
        } as SalespersonPayPlan,
        {
          id: 'fm1',
          name: 'Senior Finance Manager Plan',
          description: 'Comprehensive plan for experienced finance managers',
          role: 'finance_manager',
          dealership_id: dealershipId,
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          is_active: true,
          front_end_gross_percentage: 15,
          back_end_gross_percentage: 50,
          pvr_structure: {
            base_pvr: 150,
            incremental_tiers: [
              { threshold: 10, pvr_increase: 25 },
              { threshold: 15, pvr_increase: 50 },
            ],
          },
          vsc_bonuses: {
            enabled: true,
            per_vsc_amount: 75,
            monthly_volume_bonuses: [{ vsc_count_threshold: 8, bonus_amount: 500 }],
          },
          gap_bonuses: {
            enabled: true,
            per_gap_amount: 50,
          },
          warranty_bonuses: {
            enabled: true,
            per_warranty_amount: 25,
          },
          csi_bonus: {
            enabled: true,
            threshold_score: 85,
            bonus_percentage: 5,
          },
          chargeback_protection: {
            enabled: true,
            protection_period_days: 90,
          },
          minimum_monthly_pay: 3000,
        } as FinanceManagerPayPlan,
      ];

      setPayPlans(mockPlans);
    } catch (error) {
      console.error('Error fetching pay plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pay plans',
        variant: 'destructive',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      // Mock users data
      const mockUsers: User[] = [
        {
          id: 'u1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@dealership.com',
          role: 'salesperson',
          current_pay_plan: 'sp1',
        },
        {
          id: 'u2',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@dealership.com',
          role: 'finance_manager',
          current_pay_plan: 'fm1',
        },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      // Mock assignments data
      const mockAssignments: PayPlanAssignment[] = [
        {
          id: 'a1',
          user_id: 'u1',
          pay_plan_id: 'sp1',
          assigned_by: 'admin',
          assigned_at: '2024-01-01',
          effective_date: '2024-01-01',
          is_active: true,
        },
        {
          id: 'a2',
          user_id: 'u2',
          pay_plan_id: 'fm1',
          assigned_by: 'admin',
          assigned_at: '2024-01-01',
          effective_date: '2024-01-01',
          is_active: true,
        },
      ];

      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleCreatePayPlan = async () => {
    try {
      setLoading(true);

      const errors = validatePayPlan(formData);
      if (errors.length > 0) {
        toast({
          title: 'Validation Error',
          description: errors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      const newPlan: PayPlan = {
        ...formData,
        id: `plan_${Date.now()}`,
        dealership_id: dealershipId,
        created_by: 'current_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as PayPlan;

      setPayPlans([...payPlans, newPlan]);
      setFormData({
        name: '',
        description: '',
        role: 'salesperson',
        is_active: true,
      });
      setShowCreateForm(false);

      toast({
        title: 'Success',
        description: 'Pay plan created successfully',
      });
    } catch (error) {
      console.error('Error creating pay plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create pay plan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPayPlan = async (userId: string, payPlanId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      const payPlan = payPlans.find(p => p.id === payPlanId);

      if (!user || !payPlan) {
        toast({
          title: 'Error',
          description: 'User or pay plan not found',
          variant: 'destructive',
        });
        return;
      }

      // Critical validation: ensure role matches
      if (user.role !== payPlan.role) {
        toast({
          title: 'Role Mismatch Error',
          description: `Cannot assign ${payPlan.role} pay plan to ${user.role}. Roles must match for security.`,
          variant: 'destructive',
        });
        return;
      }

      const newAssignment: PayPlanAssignment = {
        id: `assignment_${Date.now()}`,
        user_id: userId,
        pay_plan_id: payPlanId,
        assigned_by: 'current_user',
        assigned_at: new Date().toISOString(),
        effective_date: new Date().toISOString(),
        is_active: true,
      };

      setAssignments([...assignments, newAssignment]);
      setUsers(users.map(u => (u.id === userId ? { ...u, current_pay_plan: payPlanId } : u)));

      toast({
        title: 'Success',
        description: `Pay plan assigned to ${user.first_name} ${user.last_name}`,
      });
    } catch (error) {
      console.error('Error assigning pay plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign pay plan',
        variant: 'destructive',
      });
    }
  };

  const getRoleSpecificForm = () => {
    if (!formData.role) return null;

    switch (formData.role) {
      case 'salesperson':
        return <SalespersonForm formData={formData} setFormData={setFormData} />;
      case 'finance_manager':
      case 'finance_director':
        return <FinanceManagerForm formData={formData} setFormData={setFormData} />;
      case 'sales_manager':
        return <SalesManagerForm formData={formData} setFormData={setFormData} />;
      case 'general_manager':
        return <GeneralManagerForm formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  const getPayPlansByRole = (role: string) => {
    return payPlans.filter(plan => plan.role === role && plan.is_active);
  };

  const getUsersByRole = (role: string) => {
    return users.filter(user => user.role === role);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Pay Plan Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage compensation plans for different roles
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Pay Plan
        </Button>
      </div>

      {/* Critical Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-orange-800">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Security Notice:</span>
          </div>
          <p className="text-orange-700 mt-2 text-sm">
            Pay plans can only be assigned to users with matching roles. The system prevents
            accidental assignment of incorrect compensation structures.
          </p>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Pay Plans</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pay Plans</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  {payPlans.filter(p => p.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assignments.filter(a => a.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">Out of {users.length} total users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role Coverage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    (payPlans.filter(p => p.is_active).length / PAY_PLAN_CONFIG.ROLES.length) * 100
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Roles with pay plans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unassigned Users</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.length - assignments.filter(a => a.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">Need pay plan assignment</p>
              </CardContent>
            </Card>
          </div>

          {/* Role Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pay Plans by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PAY_PLAN_CONFIG.ROLES.map(role => {
                  const rolePlans = getPayPlansByRole(role.id);
                  const roleUsers = getUsersByRole(role.id);
                  const assignedUsers = roleUsers.filter(u => u.current_pay_plan);

                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rolePlans.length} plans, {assignedUsers.length}/{roleUsers.length} users
                          assigned
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{rolePlans.length} plans</Badge>
                        <Badge
                          variant={
                            assignedUsers.length === roleUsers.length ? 'default' : 'secondary'
                          }
                        >
                          {assignedUsers.length}/{roleUsers.length} assigned
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Pay Plans</CardTitle>
              <CardDescription>Manage compensation structures for different roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Users</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payPlans.map(plan => {
                    const assignedCount = assignments.filter(
                      a => a.pay_plan_id === plan.id && a.is_active
                    ).length;

                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">{plan.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PAY_PLAN_CONFIG.ROLES.find(r => r.id === plan.role)?.name || plan.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignedCount} users</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay Plan Assignments</CardTitle>
              <CardDescription>Assign pay plans to users (roles must match)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Current Pay Plan</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => {
                    const currentAssignment = assignments.find(
                      a => a.user_id === user.id && a.is_active
                    );
                    const currentPlan = currentAssignment
                      ? payPlans.find(p => p.id === currentAssignment.pay_plan_id)
                      : null;
                    const availablePlans = getPayPlansByRole(user.role);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {currentPlan ? (
                            <Badge variant="default">{currentPlan.name}</Badge>
                          ) : (
                            <Badge variant="destructive">No Plan Assigned</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {currentAssignment
                            ? new Date(currentAssignment.effective_date).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={value => handleAssignPayPlan(user.id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Assign Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePlans.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay Plan Reports</CardTitle>
              <CardDescription>Analytics and reporting on compensation structures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Pay plan reports and analytics coming soon</p>
                <p className="text-sm">
                  This will integrate with deal data for real-time pay calculations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Pay Plan Dialog would go here */}
      {showCreateForm && (
        <Card className="fixed inset-0 z-50 bg-white/80 backdrop-blur">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create New Pay Plan</CardTitle>
              <CardDescription>
                Configure compensation structure for a specific role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Senior Salesperson Plan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={value => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAY_PLAN_CONFIG.ROLES.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this pay plan"
                />
              </div>

              {/* Role-specific form */}
              {getRoleSpecificForm()}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePayPlan} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Pay Plan'}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}

// Role-specific form components
function SalespersonForm({
  formData,
  setFormData,
}: {
  formData: Partial<PayPlan>;
  setFormData: (data: Partial<PayPlan>) => void;
}) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">Salesperson Compensation</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Front-End Gross %</Label>
          <Select
            value={formData.front_end_gross_percentage?.toString()}
            onValueChange={value =>
              setFormData({ ...formData, front_end_gross_percentage: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select percentage" />
            </SelectTrigger>
            <SelectContent>
              {PAY_PLAN_CONFIG.PERCENTAGE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Back-End Gross %</Label>
          <Select
            value={formData.back_end_gross_percentage?.toString()}
            onValueChange={value =>
              setFormData({ ...formData, back_end_gross_percentage: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select percentage" />
            </SelectTrigger>
            <SelectContent>
              {PAY_PLAN_CONFIG.PERCENTAGE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function FinanceManagerForm({
  formData,
  setFormData,
}: {
  formData: Partial<PayPlan>;
  setFormData: (data: Partial<PayPlan>) => void;
}) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">Finance Manager Compensation</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Front-End Gross %</Label>
          <Select
            value={formData.front_end_gross_percentage?.toString()}
            onValueChange={value =>
              setFormData({ ...formData, front_end_gross_percentage: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select percentage" />
            </SelectTrigger>
            <SelectContent>
              {PAY_PLAN_CONFIG.PERCENTAGE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Back-End Gross %</Label>
          <Select
            value={formData.back_end_gross_percentage?.toString()}
            onValueChange={value =>
              setFormData({ ...formData, back_end_gross_percentage: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select percentage" />
            </SelectTrigger>
            <SelectContent>
              {PAY_PLAN_CONFIG.PERCENTAGE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PVR Structure */}
      <div className="space-y-2">
        <Label>Base PVR Amount</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select base PVR" />
          </SelectTrigger>
          <SelectContent>
            {PAY_PLAN_CONFIG.PVR_AMOUNTS.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* VSC Bonuses */}
      <div className="space-y-2">
        <Label>VSC Bonus per Sale</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select VSC bonus" />
          </SelectTrigger>
          <SelectContent>
            {PAY_PLAN_CONFIG.VSC_AMOUNTS.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SalesManagerForm({
  formData,
  setFormData,
}: {
  formData: Partial<PayPlan>;
  setFormData: (data: Partial<PayPlan>) => void;
}) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">Sales Manager Compensation</h4>
      <div className="space-y-2">
        <Label>Base Salary</Label>
        <Input
          type="number"
          placeholder="Annual base salary"
          onChange={e => setFormData({ ...formData, base_salary: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
}

function GeneralManagerForm({
  formData,
  setFormData,
}: {
  formData: Partial<PayPlan>;
  setFormData: (data: Partial<PayPlan>) => void;
}) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">General Manager Compensation</h4>
      <div className="space-y-2">
        <Label>Base Salary</Label>
        <Input
          type="number"
          placeholder="Annual base salary"
          onChange={e => setFormData({ ...formData, base_salary: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
}
