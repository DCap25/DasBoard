import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Settings, Database } from 'lucide-react';

// Simple AdminDashboard that should render without any dependencies on external data
const AdminDashboard = () => {
  const { user, role, dealershipId } = useAuth();

  console.log('[AdminDashboard] Rendering simplified admin dashboard', {
    userId: user?.id,
    role,
    dealershipId,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dealership Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-medium">Email: {user?.email || 'Not available'}</div>
            <div className="text-sm mt-1">Role: {role || 'Unknown'}</div>
            <div className="text-sm mt-1">Dealership ID: {dealershipId || 'Not assigned'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">186</div>
            <p className="text-xs text-muted-foreground mt-1">12 added this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button size="sm" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Backup Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
        <p className="mb-4">
          This is a simplified dashboard for troubleshooting. From here, you can manage your
          dealership's users, view reports, and configure system settings.
        </p>
        <p className="text-sm text-gray-500">
          User ID: {user?.id}
          <br />
          Session established: {user ? 'Yes' : 'No'}
          <br />
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
