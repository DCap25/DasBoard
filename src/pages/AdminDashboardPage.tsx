import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  console.log('[AdminDashboardPage] Rendering with user:', user?.email);

  return (
    <DashboardLayout title="Admin Dashboard">
      <AdminDashboard />
    </DashboardLayout>
  );
}
