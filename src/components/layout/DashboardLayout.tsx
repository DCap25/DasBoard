import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Home, BarChart2, Calendar, LogOut, User, Building2, Settings } from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = 'The DAS Board' }) => {
  const { signOut, user, userRole, dealershipId, currentDealershipName } = useAuth();
  const location = useLocation();

  const handleSignOut = () => {
    // Navigate to the dedicated logout page instead of calling signOut
    window.location.href = '/logout';
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check if we're in a specific dealership context
  const isDealershipPath = location.pathname.startsWith('/dealership/');
  const dealershipIdFromPath = isDealershipPath ? location.pathname.split('/')[2] : null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 shadow-md text-white">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
          {currentDealershipName && (
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Building2 size={14} className="mr-1" />
              <span>{currentDealershipName}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-blue-700 p-2 rounded-full">
              <User size={20} className="text-blue-100" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-blue-100">{user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {/* Route-specific navigation: use Single Finance nav on dashboard and log routes */}
            {location.pathname.startsWith('/dashboard/single-finance') ||
            location.pathname.startsWith('/single-finance-deal-log') ? (
              <>
                {/* Single Finance Manager Navigation */}
                <Link to="/dashboard/single-finance">
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/single-finance') &&
                      !isActive('/dashboard/single-finance/deals')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <Home size={18} className="mr-2" />
                    Home
                  </button>
                </Link>

                <Link to="/dashboard/single-finance/deals">
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/single-finance/deals')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <BarChart2 size={18} className="mr-2" />
                    Deals
                  </button>
                </Link>

                <Link to="/dashboard/single-finance/settings">
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/single-finance/settings')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <Settings size={18} className="mr-2" />
                    Settings
                  </button>
                </Link>
              </>
            ) : (
              <>
                {/* Default navigation for other roles */}
                <Link to={isDealershipPath ? `/dealership/${dealershipIdFromPath}` : '/dashboard'}>
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                      (isActive('/dashboard') &&
                        !isActive('/dashboard/deals') &&
                        !isActive('/dashboard/schedule')) ||
                      (isDealershipPath &&
                        !location.pathname.includes('/deals') &&
                        !location.pathname.includes('/schedule'))
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <Home size={18} className="mr-2" />
                    Home
                  </button>
                </Link>

                <Link
                  to={
                    isDealershipPath
                      ? `/dealership/${dealershipIdFromPath}/deals`
                      : '/dashboard/deals'
                  }
                >
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/deals') ||
                      (isDealershipPath && location.pathname.includes('/deals'))
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <BarChart2 size={18} className="mr-2" />
                    Deals
                  </button>
                </Link>

                <Link
                  to={
                    isDealershipPath
                      ? `/dealership/${dealershipIdFromPath}/schedule`
                      : '/dashboard/schedule'
                  }
                >
                  <button
                    className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/schedule') ||
                      (isDealershipPath && location.pathname.includes('/schedule'))
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <Calendar size={18} className="mr-2" />
                    Schedule
                  </button>
                </Link>

                {/* Master Admin Panel link for admins */}
                {userRole === 'admin' && !dealershipId && (
                  <Link to="/master-admin">
                    <button
                      className={`flex items-center w-full px-4 py-2 text-left text-sm rounded-md ${
                        isActive('/master-admin')
                          ? 'bg-blue-700 text-white'
                          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }`}
                    >
                      <Building2 size={18} className="mr-2" />
                      Master Admin
                    </button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t border-blue-800">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center bg-blue-700 text-white border-blue-600 hover:bg-blue-800"
            onClick={handleSignOut}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {/* Use Outlet to render nested routes */}
          {children || <Outlet />}

          {/* Debug placeholder only if neither children nor Outlet content exists */}
          {!children &&
            !location.pathname.includes('/admin') &&
            !location.pathname.includes('/sales') && (
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeeba',
                  borderRadius: '4px',
                }}
              >
                <p>Warning: No content to display for this route.</p>
                <p>Current path: {location.pathname}</p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
