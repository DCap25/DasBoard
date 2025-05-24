import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { DealershipUserManagement } from '../components/admin/DealershipUserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboardPage() {
  const { user, dealershipId } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <DealershipUserManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dealership Settings</CardTitle>
                <CardDescription>
                  Configure your dealership settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
