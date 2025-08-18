import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { DealLogEditor } from '../components/manager/DealLogEditor';
import { ScheduleEditor } from '../components/manager/ScheduleEditor';

const Dashboard = () => {
  const { user, userRole } = useAuth();

  return (
    <div className="container mx-auto px-4 py-4 sm:p-4">
      {' '}
      {/* Mobile-optimized padding */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {' '}
              {/* Stack on mobile, 2 cols on tablet */}
              <Card>
                <CardHeader>
                  <CardTitle>Welcome</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base">Hello, {user?.email}!</p>{' '}
                  {/* Responsive text size */}
                  <p className="mt-2 text-sm sm:text-base">Role: {userRole || 'Not assigned'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base">View and manage vehicle deals</p>{' '}
                  {/* Responsive text */}
                  <a
                    href="/dashboard/deals"
                    className="text-blue-500 hover:underline mt-2 inline-block p-2 sm:p-0 -m-2 sm:m-0"
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
                  <p className="text-sm sm:text-base">View and manage salesperson schedule</p>{' '}
                  {/* Responsive text */}
                  <a
                    href="/dashboard/schedule"
                    className="text-blue-500 hover:underline mt-2 inline-block p-2 sm:p-0 -m-2 sm:m-0"
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
