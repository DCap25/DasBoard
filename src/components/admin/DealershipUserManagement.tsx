import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Loader2, PlusCircle, User, UserX, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../../lib/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { getDealershipUsers, createDealershipUser, getDealerships } from '../../lib/apiService';
import { useAuth } from '../../contexts/AuthContext';

interface UserLimits {
  sales_people: number;
  finance_managers: number;
  sales_managers: number;
  general_managers: number;
  finance_directors: number;
  finance_assistants: number;
  gsm: number;
}

interface DealershipSettings {
  user_limits: UserLimits;
  add_ons: string[];
  tier: string;
}

interface DealershipUser {
  id: string;
  email: string;
  name: string;
  role_id: string;
  phone_number?: string;
  created_at: string;
}

export function DealershipUserManagement() {
  const { user, dealershipId } = useAuth();
  const [users, setUsers] = useState<DealershipUser[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([
    { id: 'salesperson', name: 'Sales Person' },
    { id: 'finance_manager', name: 'F&I Manager' },
    { id: 'sales_manager', name: 'Sales Manager' },
    { id: 'general_manager', name: 'General Manager' },
    { id: 'finance_director', name: 'Finance Director' },
    { id: 'finance_assistant', name: 'Finance Assistant' },
    { id: 'gsm', name: 'GSM' },
  ]);

  const [newUserForm, setNewUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    phoneNumber: '',
    password: '',
  });

  const [dealership, setDealership] = useState<any>(null);
  const [settings, setSettings] = useState<DealershipSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});

  // Fetch users and dealership settings on component mount
  useEffect(() => {
    if (dealershipId) {
      fetchDealershipInfo();
      fetchUsers();
    }
  }, [dealershipId]);

  // Fetch dealership info including settings
  const fetchDealershipInfo = async () => {
    try {
      const dealerships = await getDealerships();
      const currentDealership = dealerships.find(d => d.id === dealershipId);

      if (currentDealership) {
        setDealership(currentDealership);

        // Get settings from dealership record
        const settings = currentDealership.settings || {
          user_limits: {
            sales_people: 10,
            finance_managers: 3,
            sales_managers: 3,
            general_managers: 1,
            finance_directors: 0,
            finance_assistants: 0,
            gsm: 0,
          },
          add_ons: [],
          tier: 'dealership',
        };

        setSettings(settings);
        console.log('[DealershipUserManagement] Dealership settings:', settings);
      }
    } catch (error) {
      console.error('[DealershipUserManagement] Error fetching dealership info:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dealership information',
        variant: 'destructive',
      });
    }
  };

  // Fetch users for the current dealership
  const fetchUsers = async () => {
    try {
      setLoading(true);

      if (!dealershipId) {
        throw new Error('No dealership ID available');
      }

      const dealershipUsers = await getDealershipUsers(dealershipId);
      setUsers(dealershipUsers);

      // Count users by role
      const counts: Record<string, number> = {};
      dealershipUsers.forEach(user => {
        counts[user.role_id] = (counts[user.role_id] || 0) + 1;
      });

      setUserCounts(counts);
      console.log('[DealershipUserManagement] User counts by role:', counts);
    } catch (error) {
      console.error('[DealershipUserManagement] Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle role selection
  const handleRoleChange = (value: string) => {
    setNewUserForm(prev => ({ ...prev, roleId: value }));
  };

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserForm(prev => ({ ...prev, password }));
  };

  // Check if user limit for the selected role has been reached
  const isUserLimitReached = (roleId: string): boolean => {
    if (!settings || !settings.user_limits) return false;

    const limits = settings.user_limits;
    const count = userCounts[roleId] || 0;

    switch (roleId) {
      case 'salesperson':
        return count >= limits.sales_people;
      case 'finance_manager':
        return count >= limits.finance_managers;
      case 'sales_manager':
        return count >= limits.sales_managers;
      case 'general_manager':
        return count >= limits.general_managers;
      case 'finance_director':
        return count >= limits.finance_directors;
      case 'finance_assistant':
        return count >= limits.finance_assistants;
      case 'gsm':
        return count >= limits.gsm;
      default:
        return false;
    }
  };

  // Get the limit for a specific role
  const getRoleLimit = (roleId: string): number => {
    if (!settings || !settings.user_limits) return 0;

    const limits = settings.user_limits;

    switch (roleId) {
      case 'salesperson':
        return limits.sales_people;
      case 'finance_manager':
        return limits.finance_managers;
      case 'sales_manager':
        return limits.sales_managers;
      case 'general_manager':
        return limits.general_managers;
      case 'finance_director':
        return limits.finance_directors;
      case 'finance_assistant':
        return limits.finance_assistants;
      case 'gsm':
        return limits.gsm;
      default:
        return 0;
    }
  };

  // Submit new user form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);

      if (!dealershipId) {
        throw new Error('No dealership ID available');
      }

      // Check if form is valid
      if (
        !newUserForm.email ||
        !newUserForm.firstName ||
        !newUserForm.lastName ||
        !newUserForm.roleId
      ) {
        throw new Error('Please fill in all required fields');
      }

      // Check if user limit has been reached
      if (isUserLimitReached(newUserForm.roleId)) {
        throw new Error(
          `User limit for this role has been reached. Consider upgrading your subscription.`
        );
      }

      const userData = {
        email: newUserForm.email,
        password: newUserForm.password || Math.random().toString(36).slice(-12) + 'A1!',
        first_name: newUserForm.firstName,
        last_name: newUserForm.lastName,
        role_id: newUserForm.roleId,
        phone_number: newUserForm.phoneNumber || undefined,
      };

      console.log('[DealershipUserManagement] Creating new user:', userData);

      const result = await createDealershipUser(dealershipId, userData);

      console.log('[DealershipUserManagement] User created successfully:', result);

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      // Reset form and refresh users
      setNewUserForm({
        email: '',
        firstName: '',
        lastName: '',
        roleId: '',
        phoneNumber: '',
        password: '',
      });

      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('[DealershipUserManagement] Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  // Display user counts vs limits
  const RoleLimitDisplay = ({ roleId, label }: { roleId: string; label: string }) => {
    const count = userCounts[roleId] || 0;
    const limit = getRoleLimit(roleId);
    const isAtLimit = count >= limit;

    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center">
          <span className={`text-sm ${isAtLimit ? 'text-red-400' : 'text-green-400'}`}>
            {count}/{limit}
          </span>
          {isAtLimit ? (
            <AlertCircle className="ml-1 h-4 w-4 text-red-400" />
          ) : (
            <Check className="ml-1 h-4 w-4 text-green-400" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-light-orange to-dark-orange text-white hover:scale-105 transition-all duration-300">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card-dark p-6 rounded-lg glow-card max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-white mb-2">Add New User</DialogTitle>
              <DialogDescription>
                Create a new user for your dealership. They will receive an email with login
                instructions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newUserForm.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newUserForm.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newUserForm.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={newUserForm.roleId} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => {
                      const disabled = isUserLimitReached(role.id);
                      const limit = getRoleLimit(role.id);
                      return (
                        <SelectItem key={role.id} value={role.id} disabled={disabled}>
                          {role.name} {limit > 0 ? `(${userCounts[role.id] || 0}/${limit})` : ''}
                          {disabled && ' - Limit reached'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-400 px-0 py-0 h-auto text-xs"
                    onClick={generatePassword}
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  id="password"
                  name="password"
                  value={newUserForm.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-xs text-muted-foreground">
                  User will be prompted to change their password on first login.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-gradient-to-r from-light-orange to-dark-orange text-white px-4 py-2 rounded-md hover:scale-105 transition-all duration-300 w-full"
                >
                  {creating ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Limits Card */}
        <Card className="bg-card-dark p-6 rounded-lg glow-card">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg text-white">User Limits</CardTitle>
            <CardDescription>Based on your subscription tier and add-ons</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {settings?.add_ons && settings.add_ons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Active Add-Ons:</h4>
                <div className="flex flex-wrap gap-2">
                  {settings.add_ons.includes('plus') && (
                    <Badge className="bg-blue-900/20 text-blue-400 border-blue-800">
                      + Version
                    </Badge>
                  )}
                  {settings.add_ons.includes('plusplus') && (
                    <Badge className="bg-indigo-900/20 text-indigo-400 border-indigo-800">
                      ++ Version
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1 border-t border-gray-700 pt-3">
              <RoleLimitDisplay roleId="salesperson" label="Sales People" />
              <RoleLimitDisplay roleId="finance_manager" label="F&I Managers" />
              <RoleLimitDisplay roleId="sales_manager" label="Sales Managers" />
              <RoleLimitDisplay roleId="general_manager" label="General Managers" />
              <RoleLimitDisplay roleId="finance_director" label="Finance Directors" />
              <RoleLimitDisplay roleId="finance_assistant" label="Finance Assistants" />
              <RoleLimitDisplay roleId="gsm" label="GSM" />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('/upgrade', '_blank')}
              >
                Upgrade Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List Card */}
        <Card className="md:col-span-2 bg-card-dark p-6 rounded-lg glow-card">
          <CardHeader className="p-0 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-white">Users</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
            <CardDescription>Manage users for your dealership</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg">
                <User className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-300 mb-1">No Users Yet</h3>
                <p className="text-gray-500 mb-4">Add your first user to get started</p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-light-orange to-dark-orange text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add First User
                </Button>
              </div>
            ) : (
              <div className="border rounded-md border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-deep-black text-white text-lg font-semibold">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell className="font-medium text-gray-300">{user.name}</TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell>
                          {roles.find(r => r.id === user.role_id)?.name || user.role_id}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
