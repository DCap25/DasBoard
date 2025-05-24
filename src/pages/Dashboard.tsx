import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { DealLogEditor } from '../components/manager/DealLogEditor';
import { ScheduleEditor } from '../components/manager/ScheduleEditor';

const Dashboard = () => {
  const { user, userRole } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route
          path="/"
          element={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Hello, {user?.email}!</p>
                  <p className="mt-2">Role: {userRole || 'Not assigned'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>View and manage vehicle deals</p>
                  <a
                    href="/dashboard/deals"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    Go to Deals
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>View and manage salesperson schedule</p>
                  <a
                    href="/dashboard/schedule"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    Go to Schedule
                  </a>
                </CardContent>
              </Card>
            </div>
          }
        />
        <Route path="/deals" element={<DealLogEditor />} />
        <Route path="/schedule" element={<ScheduleEditor />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
