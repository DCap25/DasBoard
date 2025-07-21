import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { toast } from 'react-hot-toast';

type User = Database['public']['Tables']['users']['Row'];
type PayPlan = Database['public']['Tables']['pay_plans']['Row'];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'payplans'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [payPlans, setPayPlans] = useState<PayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayPlanForm, setShowPayPlanForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role_id: '',
  });

  const [newPayPlan, setNewPayPlan] = useState({
    role_id: '',
    base_salary: 0,
    commission_rate: 0,
    bonus_percentage: 0,
    profit_sharing: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, payPlansResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('pay_plans').select('*'),
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (payPlansResponse.error) throw payPlansResponse.error;

      setUsers(usersResponse.data || []);
      setPayPlans(payPlansResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('profiles').insert([newUser]);
      if (error) throw error;
      
      toast.success('User added successfully');
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        role_id: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  const handleUpdatePayPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error('Please enter a valid password');
      return;
    }

    try {
      const { error } = await supabase
        .from('pay_plans')
        .update(newPayPlan)
        .eq('role_id', newPayPlan.role_id);

      if (error) throw error;
      
      toast.success('Pay plan updated successfully');
      setNewPayPlan({
        role_id: '',
        base_salary: 0,
        commission_rate: 0,
        bonus_percentage: 0,
        profit_sharing: 0,
      });
      setShowPayPlanForm(false);
      fetchData();
    } catch (error) {
      console.error('Error updating pay plan:', error);
      toast.error('Failed to update pay plan');
    }
  };

  const verifyPassword = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password,
      });
      
      if (error) throw error;
      setIsPasswordValid(true);
      toast.success('Password verified');
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error('Invalid password');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'payplans' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('payplans')}
        >
          Pay Plan Management
        </button>
      </div>

      {activeTab === 'users' ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <select
                value={newUser.role_id}
                onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Role</option>
                {payPlans.map((plan) => (
                  <option key={plan.role_id} value={plan.role_id}>
                    {plan.role_id}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add User
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Existing Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Name</th>
                    <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Email</th>
                    <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 border-b border-gray-200">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200">{user.email}</td>
                      <td className="px-6 py-4 border-b border-gray-200">{user.role_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {!showPayPlanForm ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pay Plans</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Role</th>
                      <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Base Salary</th>
                      <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Commission Rate</th>
                      <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Bonus %</th>
                      <th className="bg-gray-700 text-white" className="px-6 py-3 border-b-2 border-gray-200 text-left bg-gray-700 text-white">Profit Sharing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payPlans.map((plan) => (
                      <tr key={plan.role_id}>
                        <td className="px-6 py-4 border-b border-gray-200">{plan.role_id}</td>
                        <td className="px-6 py-4 border-b border-gray-200">${plan.base_salary}</td>
                        <td className="px-6 py-4 border-b border-gray-200">{plan.commission_rate}%</td>
                        <td className="px-6 py-4 border-b border-gray-200">{plan.bonus_percentage}%</td>
                        <td className="px-6 py-4 border-b border-gray-200">{plan.profit_sharing}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setShowPayPlanForm(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update Pay Plan
              </button>
            </div>
          ) : (
            <div>
              {!isPasswordValid ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-4">Verify Password</h2>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <button
                    onClick={verifyPassword}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Update Pay Plan</h2>
                  <form onSubmit={handleUpdatePayPlan} className="space-y-4">
                    <select
                      value={newPayPlan.role_id}
                      onChange={(e) => setNewPayPlan({ ...newPayPlan, role_id: e.target.value })}
                      className="border p-2 rounded w-full"
                      required
                    >
                      <option value="">Select Role</option>
                      {payPlans
                        .filter((plan) => plan.role_id !== 'Admin')
                        .map((plan) => (
                          <option key={plan.role_id} value={plan.role_id}>
                            {plan.role_id}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Base Salary"
                      value={newPayPlan.base_salary}
                      onChange={(e) =>
                        setNewPayPlan({ ...newPayPlan, base_salary: parseFloat(e.target.value) })
                      }
                      className="border p-2 rounded w-full"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Commission Rate (%)"
                      value={newPayPlan.commission_rate}
                      onChange={(e) =>
                        setNewPayPlan({ ...newPayPlan, commission_rate: parseFloat(e.target.value) })
                      }
                      className="border p-2 rounded w-full"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Bonus Percentage (%)"
                      value={newPayPlan.bonus_percentage}
                      onChange={(e) =>
                        setNewPayPlan({ ...newPayPlan, bonus_percentage: parseFloat(e.target.value) })
                      }
                      className="border p-2 rounded w-full"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Profit Sharing (%)"
                      value={newPayPlan.profit_sharing}
                      onChange={(e) =>
                        setNewPayPlan({ ...newPayPlan, profit_sharing: parseFloat(e.target.value) })
                      }
                      className="border p-2 rounded w-full"
                      required
                    />
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPayPlanForm(false);
                          setIsPasswordValid(false);
                          setPassword('');
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { AdminDashboard };
export default AdminDashboard; 