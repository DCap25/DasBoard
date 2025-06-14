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
import { Textarea } from '../ui/textarea';
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
  Settings,
  Calculator,
  Target,
  Percent,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PayPlan,
  AdvancedFinanceManagerPayPlan,
  SimpleFinanceManagerPayPlan,
  PayPlanAssignment,
  PAY_PLAN_CONFIG,
  validatePayPlan,
  CommissionTier,
  PenetrationBonus,
  createDefaultStructures,
} from '../../types/payPlan';

interface EnhancedPayPlanManagerProps {
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

interface PayPlanFormData {
  name: string;
  description: string;
  role: string;
  plan_type: 'simple' | 'advanced';
  is_active: boolean;

  // Dynamic structure based on plan type and role
  structure: any;
}

export function EnhancedPayPlanManager({
  dealershipId,
  isGroupAdmin = false,
}: EnhancedPayPlanManagerProps) {
  const { toast } = useToast();

  // State
  const [payPlans, setPayPlans] = useState<PayPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<PayPlanAssignment[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [editingPlan, setEditingPlan] = useState<PayPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Enhanced form state
  const [formData, setFormData] = useState<PayPlanFormData>({
    name: '',
    description: '',
    role: 'finance_manager',
    plan_type: 'simple',
    is_active: true,
    structure: {},
  });

  // Tier management state
  const [activeTierEditor, setActiveTierEditor] = useState<string | null>(null);

  useEffect(() => {
    fetchPayPlans();
    fetchUsers();
    fetchAssignments();
  }, [dealershipId]);

  const fetchPayPlans = async () => {
    try {
      // Mock enhanced pay plans data
      const mockPlans: PayPlan[] = [
        {
          id: 'fm_advanced_1',
          name: 'John Valentine Finance Plan',
          description: 'Advanced F&I plan with CIT bonuses and penetration tiers',
          role: 'finance_manager',
          plan_type: 'advanced',
          dealership_id: dealershipId,
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          is_active: true,
          base_commission: {
            enabled: true,
            base_percentage: 25,
            tiers: [],
            applies_to: 'total_fi_income',
          },
          draw_structure: {
            enabled: true,
            amount: 4000,
            frequency: 'monthly',
            deducted_from_commissions: true,
          },
          cit_bonuses: {
            enabled: true,
            cit_30_bonus: {
              enabled: true,
              tiers: [
                { min_deals: 2, bonus_percentage: 0.5 },
                { min_deals: 1, max_deals: 1, bonus_percentage: 0.25 },
                { min_deals: 0, max_deals: 0, bonus_percentage: 0 },
              ],
            },
            cit_10_bonus: {
              enabled: true,
              tiers: [
                { min_deals: 3, bonus_percentage: 0.5 },
                { min_deals: 1, max_deals: 2, bonus_percentage: 0.25 },
                { min_deals: 0, max_deals: 0, bonus_percentage: 0 },
              ],
            },
          },
          penetration_bonuses: [
            {
              enabled: true,
              name: 'Service Contract Penetration',
              tiers: [
                { min_percentage: 80, bonus_percentage: 3.5 },
                { min_percentage: 70, max_percentage: 79.99, bonus_percentage: 3.0 },
                { min_percentage: 60, max_percentage: 69.99, bonus_percentage: 2.5 },
                { min_percentage: 50, max_percentage: 59.99, bonus_percentage: 2.0 },
                { min_percentage: 40, max_percentage: 49.99, bonus_percentage: 1.5 },
                { min_percentage: 30, max_percentage: 39.99, bonus_percentage: 1.0 },
                { min_percentage: 0, max_percentage: 29.99, bonus_percentage: 0 },
              ],
            },
          ],
          provider_bonuses: [
            {
              enabled: true,
              provider_name: 'EasyCare',
              commission_percentage: 10.99,
              payment_frequency: 'annually',
              description: 'Year-end EasyCare commission',
            },
          ],
          vehicle_allowance: {
            enabled: true,
            allowance_amount: 300,
            demo_privileges_available: true,
            description: 'Monthly vehicle allowance or demo privileges',
          },
          pto_structure: {
            enabled: true,
            annual_days: 12,
            prorated: true,
            cash_value_per_day: 150,
          },
          chargeback_protection: {
            enabled: true,
            protection_period_days: 90,
          },
        } as AdvancedFinanceManagerPayPlan,
        {
          id: 'fm_simple_1',
          name: 'Lloyd Hatter Finance Plan',
          description: 'Simple PVR-based commission structure',
          role: 'finance_manager',
          plan_type: 'simple',
          dealership_id: dealershipId,
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          is_active: true,
          commission_structure: {
            base_fi_percentage: 12,
            pvr_tiers: [
              { min_value: 999, max_value: 999, percentage: 12.0, label: '$999 or below' },
              { min_value: 1000, max_value: 1099, percentage: 13.0, label: '$1,000 to $1,099' },
              { min_value: 1100, max_value: 1199, percentage: 13.5, label: '$1,100 to $1,199' },
              { min_value: 1200, max_value: 1299, percentage: 14.0, label: '$1,200 to $1,299' },
              { min_value: 1300, percentage: 14.5, label: '$1,300 or more' },
            ],
          },
          monthly_draw: 2500,
          provider_bonuses: [
            {
              enabled: true,
              provider_name: 'EasyCare',
              commission_percentage: 10.99,
              payment_frequency: 'annually',
              description: 'Year-end EasyCare commission',
            },
          ],
          vehicle_allowance: {
            enabled: true,
            allowance_amount: 300,
            demo_privileges_available: true,
            description: 'Monthly vehicle allowance or demo privileges',
          },
          pto_structure: {
            enabled: true,
            annual_days: 12,
            prorated: true,
          },
        } as SimpleFinanceManagerPayPlan,
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
          last_name: 'Valentine',
          email: 'john.valentine@dealership.com',
          role: 'finance_manager',
          current_pay_plan: 'fm_advanced_1',
        },
        {
          id: 'u2',
          first_name: 'Lloyd',
          last_name: 'Hatter',
          email: 'lloyd.hatter@dealership.com',
          role: 'finance_manager',
          current_pay_plan: 'fm_simple_1',
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
          pay_plan_id: 'fm_advanced_1',
          assigned_by: 'admin',
          assigned_at: '2024-01-01',
          effective_date: '2024-01-01',
          is_active: true,
        },
        {
          id: 'a2',
          user_id: 'u2',
          pay_plan_id: 'fm_simple_1',
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

      const newPlan: Partial<PayPlan> = {
        ...formData,
        id: `plan_${Date.now()}`,
        dealership_id: dealershipId,
        created_by: 'current_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...formData.structure,
      };

      setPayPlans([...payPlans, newPlan as PayPlan]);
      resetForm();
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      role: 'finance_manager',
      plan_type: 'simple',
      is_active: true,
      structure: {},
    });
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

  const addTier = (tierType: string) => {
    // Add new tier logic based on tier type
    console.log(`Adding new ${tierType} tier`);
  };

  const removeTier = (tierType: string, index: number) => {
    // Remove tier logic
    console.log(`Removing ${tierType} tier at index ${index}`);
  };

  const renderRoleSpecificForm = () => {
    if (formData.role === 'finance_manager' || formData.role === 'finance_director') {
      return <FinanceManagerForm formData={formData} setFormData={setFormData} />;
    }
    if (formData.role === 'salesperson') {
      return <SalespersonForm formData={formData} setFormData={setFormData} />;
    }
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Configuration form for {formData.role} role is coming soon.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Enhanced Pay Plan Management
          </h2>
          <p className="text-muted-foreground">
            Create complex compensation plans with multiple tiers and bonuses
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
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
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
                <CardTitle className="text-sm font-medium">Advanced Plans</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payPlans.filter(p => p.plan_type === 'advanced').length}
                </div>
                <p className="text-xs text-muted-foreground">Complex bonus structures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Simple Plans</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payPlans.filter(p => p.plan_type === 'simple').length}
                </div>
                <p className="text-xs text-muted-foreground">Basic commission structures</p>
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
          </div>
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
                    <TableHead>Type</TableHead>
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
                          <Badge variant={plan.plan_type === 'advanced' ? 'default' : 'secondary'}>
                            {plan.plan_type === 'advanced' ? 'Advanced' : 'Simple'}
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
                    <TableHead>Plan Type</TableHead>
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
                          {currentPlan && (
                            <Badge
                              variant={
                                currentPlan.plan_type === 'advanced' ? 'default' : 'secondary'
                              }
                            >
                              {currentPlan.plan_type === 'advanced' ? 'Advanced' : 'Simple'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={value => handleAssignPayPlan(user.id, value)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assign Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePlans.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} ({plan.plan_type})
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

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay Calculator</CardTitle>
              <CardDescription>
                Real-time pay calculations based on assigned pay plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Pay calculator will integrate with deal data</p>
                <p className="text-sm">
                  Enter deal information to calculate real-time estimated pay
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Pay Plan Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Create New Pay Plan</CardTitle>
                    <CardDescription>
                      Configure comprehensive compensation structure
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Senior Finance Manager Plan"
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

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan_type">Plan Type</Label>
                    <Select
                      value={formData.plan_type}
                      onValueChange={(value: 'simple' | 'advanced') =>
                        setFormData({ ...formData, plan_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.PLAN_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this pay plan"
                    rows={3}
                  />
                </div>

                {/* Role-specific form */}
                {renderRoleSpecificForm()}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePayPlan} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Pay Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Finance Manager Form Component
function FinanceManagerForm({
  formData,
  setFormData,
}: {
  formData: PayPlanFormData;
  setFormData: (data: PayPlanFormData) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  if (formData.plan_type === 'simple') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium">Simple Finance Manager Plan</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Base F&I Commission %</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select base percentage" />
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
            <Label>Monthly Draw</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select draw amount" />
              </SelectTrigger>
              <SelectContent>
                {PAY_PLAN_CONFIG.DRAW_AMOUNTS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PVR Tiers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">PVR Commission Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add PVR Tier
              </Button>
              <div className="text-sm text-muted-foreground">
                Configure commission percentages based on PVR thresholds
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Advanced plan configuration
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">Advanced Finance Manager Plan Configuration</h4>

      {/* Basic Commission Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('basic')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Base Commission Structure</CardTitle>
            {isExpanded('basic') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('basic') && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base F&I Commission %</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base percentage" />
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
                <Label>Applies To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Commission applies to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total_fi_income">Total F&I Income</SelectItem>
                    <SelectItem value="front_end">Front End Only</SelectItem>
                    <SelectItem value="back_end">Back End Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Draw Structure Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('draw')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Draw Structure</CardTitle>
            {isExpanded('draw') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('draw') && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Draw Amount</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_PLAN_CONFIG.DRAW_AMOUNTS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_PLAN_CONFIG.DRAW_FREQUENCIES.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deducted from Commissions</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch defaultChecked />
                  <span className="text-sm">Yes</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* CIT Bonuses Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('cit')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">CIT Deal Bonuses</CardTitle>
            {isExpanded('cit') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('cit') && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Enable CIT Deal Bonuses</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">30+ CIT Bonus</h5>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add 30+ CIT Tier
                  </Button>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">10+ CIT Bonus</h5>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add 10+ CIT Tier
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Penetration Bonuses Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('penetration')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Penetration Bonuses</CardTitle>
            {isExpanded('penetration') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('penetration') && (
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Penetration Bonus
              </Button>
              <div className="text-sm text-muted-foreground">
                Configure bonuses based on product penetration rates (Service Contracts, GAP,
                Warranties, etc.)
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Provider Bonuses Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('providers')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Provider Bonuses</CardTitle>
            {isExpanded('providers') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('providers') && (
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider Bonus
              </Button>
              <div className="grid grid-cols-1 gap-3">
                {PAY_PLAN_CONFIG.PROVIDER_OPTIONS.map(provider => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <span className="font-medium">{provider.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({provider.commission}% default)
                      </span>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('benefits')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Benefits & Allowances</CardTitle>
            {isExpanded('benefits') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('benefits') && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Allowance</Label>
                  <Input placeholder="$300" />
                </div>
                <div className="space-y-2">
                  <Label>Annual PTO Days</Label>
                  <Input placeholder="12" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Demo Vehicle Privileges Available</Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Salesperson Form Component
function SalespersonForm({
  formData,
  setFormData,
}: {
  formData: PayPlanFormData;
  setFormData: (data: PayPlanFormData) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  if (formData.plan_type === 'simple') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium">Simple Salesperson Plan</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Front-End Commission %</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select front-end percentage" />
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
            <Label>Back-End Commission %</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select back-end percentage" />
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

        <div className="space-y-2">
          <Label>Minimum Monthly Pay</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select minimum guarantee" />
            </SelectTrigger>
            <SelectContent>
              {PAY_PLAN_CONFIG.MINIMUM_GUARANTEES.map(option => (
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

  // Advanced salesperson plan configuration
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">Advanced Salesperson Plan Configuration</h4>

      {/* Front-End Commission Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('frontend')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Front-End Commission Structure</CardTitle>
            {isExpanded('frontend') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('frontend') && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gross Profit Percentage</Label>
                  <Select>
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
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox id="take-higher" />
                  <Label htmlFor="take-higher" className="text-sm">
                    Take higher of percentage or unit flat
                  </Label>
                </div>
              </div>

              {/* Unit Flat Structure */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Unit Flat Rate Tiers</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Min Units</span>
                    <span>Max Units</span>
                    <span>Flat Amount</span>
                    <span>Retroactive</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder="0" />
                    <Input placeholder="14" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.UNIT_FLAT_AMOUNTS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-center">
                      <Checkbox />
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Back-End Commission Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('backend')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Back-End Commission Structure</CardTitle>
            {isExpanded('backend') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('backend') && (
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Base Back-End Percentage</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base percentage" />
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

              {/* Volume-Based Tiers */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Volume-Based Percentage Tiers</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Min Units</span>
                    <span>Max Units</span>
                    <span>Percentage</span>
                    <span>Retroactive</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder="0" />
                    <Input placeholder="14" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="%" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.PERCENTAGE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-center">
                      <Checkbox />
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Used Vehicle Pack Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('pack')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Used Vehicle Pack Deductions</CardTitle>
            {isExpanded('pack') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('pack') && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="enable-pack" />
                <Label htmlFor="enable-pack">Enable used vehicle pack deductions</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>High Value Pack (≥$10,000)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.PACK_THRESHOLDS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pack Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.PACK_AMOUNTS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Low Value Pack ($2,000-$10,000)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Min Threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.PACK_THRESHOLDS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pack Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.PACK_AMOUNTS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* CSI Bonus Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('csi')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">CSI Bonus Structure</CardTitle>
            {isExpanded('csi') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('csi') && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="enable-csi" />
                <Label htmlFor="enable-csi">Enable CSI benchmark bonus</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bonus Percentage</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bonus %" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAY_PLAN_CONFIG.PERCENTAGE_OPTIONS.filter(opt => opt.value <= 10).map(
                        option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="e.g., Additional 5% on back-end if CSI above benchmark" />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Minimum Guarantee Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('guarantee')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Minimum Unit Guarantee</CardTitle>
            {isExpanded('guarantee') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('guarantee') && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="enable-guarantee" />
                <Label htmlFor="enable-guarantee">Enable minimum unit guarantees</Label>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Guarantee Tiers</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Min Units</span>
                    <span>Max Units</span>
                    <span>Guarantee Amount</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="15" />
                    <Input placeholder="19" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_PLAN_CONFIG.MINIMUM_GUARANTEES.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guarantee Tier
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleSection('benefits')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Benefits & Allowances</CardTitle>
            {isExpanded('benefits') ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </CardHeader>
        {isExpanded('benefits') && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Allowance</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="vehicle-allowance" />
                    <Label htmlFor="vehicle-allowance" className="text-sm">
                      Enable
                    </Label>
                  </div>
                  <Input placeholder="Monthly allowance amount" />
                </div>
                <div className="space-y-2">
                  <Label>PTO Structure</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pto" />
                    <Label htmlFor="pto" className="text-sm">
                      Enable
                    </Label>
                  </div>
                  <Input placeholder="Annual PTO days" />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
