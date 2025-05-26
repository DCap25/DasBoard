import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  dealership_id: number | null;
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

const MasterAdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'salesperson',
    tempPassword: '',
  });

  const roles = [
    { value: 'single_dealer_admin', label: 'Single Dealer Admin' },
    { value: 'group_dealer_admin', label: 'Group Dealer Admin' },
    { value: 'single_finance_manager', label: 'Single Finance Manager' },
    { value: 'finance_manager', label: 'Finance Manager' },
    { value: 'finance_director', label: 'Finance Director' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'general_manager', label: 'General Manager' },
    { value: 'general_sales_manager', label: 'General Sales Manager' },
    { value: 'area_vice_president', label: 'Area Vice President' },
    { value: 'salesperson', label: 'Salesperson' },
  ];

  useEffect(() => {
    // Check if user is authorized
    if (
      !user ||
      (user.email !== 'testadmin@example.com' && user.email !== 'admin@thedasboard.com')
    ) {
      navigate('/', { replace: true });
      return;
    }

    fetchUsers();
    fetchSignupRequests();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, created_at, dealership_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  };

  const fetchSignupRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('signup_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignupRequests(data || []);
    } catch (err) {
      console.error('Error fetching signup requests:', err);
      // Don't show error if table doesn't exist yet
    }
  };

  const generateTempPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Generate temporary password if not provided
      const tempPassword = newUser.tempPassword || generateTempPassword();

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: newUser.name,
          role: newUser.role,
        },
      });

      if (authError) throw authError;

      // Create profile record
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        dealership_id: 1, // Default dealership
      });

      if (profileError) throw profileError;

      // Send email with temporary password
      try {
        await fetch('/.netlify/functions/send-emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'temp_password',
            data: {
              name: newUser.name,
              email: newUser.email,
              tempPassword,
              role: newUser.role,
            },
          }),
        });
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
      }

      setSuccess(`User created successfully! Temporary password: ${tempPassword}`);
      setNewUser({ name: '', email: '', role: 'salesperson', tempPassword: '' });
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);

      if (error) throw error;

      setSuccess('User role updated successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  const approveSignupRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('signup_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      setSuccess('Signup request approved');
      await fetchSignupRequests();
    } catch (err) {
      console.error('Error approving signup request:', err);
      setError('Failed to approve signup request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Master Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, roles, and system settings</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

        {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New User */}
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addUser} className="space-y-4">
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
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={value => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div>
                  <Label htmlFor="tempPassword">Temporary Password (optional)</Label>
                  <Input
                    id="tempPassword"
                    type="password"
                    value={newUser.tempPassword}
                    onChange={e => setNewUser({ ...newUser, tempPassword: e.target.value })}
                    placeholder="Auto-generate if empty"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating User...' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Signup Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Signup Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {signupRequests
                  .filter(req => req.status === 'pending')
                  .map(request => (
                    <div key={request.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{request.dealership_name}</h4>
                          <p className="text-sm text-gray-600">{request.contact_person}</p>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          <p className="text-xs text-gray-500">{request.tier}</p>
                        </div>
                        <Button size="sm" onClick={() => approveSignupRequest(request.id)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                {signupRequests.filter(req => req.status === 'pending').length === 0 && (
                  <p className="text-gray-500 text-center py-4">No pending requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Users */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">
                        <Select
                          value={user.role}
                          onValueChange={value => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterAdminPage;
