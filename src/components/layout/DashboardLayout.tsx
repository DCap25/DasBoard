import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import {
  Home,
  BarChart2,
  Calendar,
  LogOut,
  User,
  Building2,
  Settings,
  Menu,
  X,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title = 'The DAS Board' }) => {
  const { signOut, user, userRole, dealershipId, currentDealershipName, loading, hasSession } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  const [fallbackUser, setFallbackUser] = useState<any>(null);
  
  // Fetch user data directly from Supabase if auth context doesn't provide it
  useEffect(() => {
    const fetchFallbackUser = async () => {
      if (!user) {
        console.log('[DashboardLayout] No user from context, fetching from Supabase...');
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            console.log('[DashboardLayout] Found fallback user:', data.session.user.email);
            setFallbackUser(data.session.user);
          }
        } catch (error) {
          console.error('[DashboardLayout] Error fetching fallback user:', error);
        }
      }
    };
    
    fetchFallbackUser();
  }, [user]);
  
  // Use effective user (context or fallback)
  const effectiveUser = user || fallbackUser;
  
  // Create a display name from available data
  const getDisplayName = () => {
    if (effectiveUser?.user_metadata?.full_name) {
      return effectiveUser.user_metadata.full_name;
    }
    if (effectiveUser?.email) {
      // Try to extract a name from the email
      const emailPart = effectiveUser.email.split('@')[0];
      if (effectiveUser.email === 'dan.caplan@sportdurst.com') {
        return 'Dan Caplan';
      }
      // Convert email username to a readable name (dan.caplan -> Dan Caplan)
      const name = emailPart.replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return name;
    }
    
    return 'Single Finance User';
  };
  
  // Debug user data  
  console.log('[DashboardLayout] Auth data:', {
    hasUser: !!user,
    hasFallbackUser: !!fallbackUser,
    userFromContext: user,
    fallbackUserFromSupabase: fallbackUser,
    effectiveUserEmail: effectiveUser?.email,
    userMetadata: effectiveUser?.user_metadata,
    fullName: effectiveUser?.user_metadata?.full_name,
    displayName: getDisplayName(),
    currentPath: location.pathname,
    userRole,
    dealershipId,
    authLoading: loading,
    hasSession: hasSession
  });

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
      {/* Mobile menu button - visible only on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-900 text-white hover:bg-blue-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - responsive for mobile */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-blue-900 shadow-md text-white
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 pl-10 lg:pl-0">{title}</h1>
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
                {getDisplayName()}
              </p>
              <p className="text-xs text-blue-100">
                {effectiveUser?.email || 'User'}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {/* Route-specific navigation: use Single Finance nav on dashboard and log routes */}
            {location.pathname.startsWith('/dashboard/single-finance') ||
            location.pathname.startsWith('/single-finance-deal-log') ? (
              <>
                {/* Single Finance Manager Navigation */}
                <Link to="/dashboard/single-finance" onClick={() => setIsMobileMenuOpen(false)} className="block">
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
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

                <Link
                  to="/dashboard/single-finance/deals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/single-finance/deals')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <BarChart2 size={18} className="mr-2" />
                    Deals
                  </button>
                </Link>

                <Link
                  to="/dashboard/single-finance/forms"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/single-finance/forms')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <FileText size={18} className="mr-2" />
                    Forms
                  </button>
                </Link>

                <Link
                  to="/dashboard/single-finance/dealer-insights"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/single-finance/dealer-insights')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <TrendingUp size={18} className="mr-2" />
                    Dealer Insights
                  </button>
                </Link>

                <Link
                  to="/dashboard/single-finance/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
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
                <Link
                  to={isDealershipPath ? `/dealership/${dealershipIdFromPath}` : '/dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
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

                <Link
                  to={
                    isDealershipPath
                      ? `/dealership/${dealershipIdFromPath}/forms`
                      : '/dashboard/forms'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/forms') ||
                      (isDealershipPath && location.pathname.includes('/forms'))
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <FileText size={18} className="mr-2" />
                    Forms
                  </button>
                </Link>

                <Link
                  to={
                    isDealershipPath
                      ? `/dealership/${dealershipIdFromPath}/dealer-insights`
                      : '/dashboard/dealer-insights'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block"
                >
                  <button
                    className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
                      isActive('/dashboard/dealer-insights') ||
                      (isDealershipPath && location.pathname.includes('/dealer-insights'))
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <TrendingUp size={18} className="mr-2" />
                    Dealer Insights
                  </button>
                </Link>

                {/* Master Admin Panel link for admins */}
                {userRole === 'admin' && !dealershipId && (
                  <Link to="/master-admin" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <button
                      className={`flex items-center w-full px-4 py-3 sm:py-2 text-left text-sm rounded-md ${
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

      {/* Main Content - adjusted padding for mobile */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <main className="p-4 sm:p-6 pt-16 lg:pt-6">
          {' '}
          {/* Extra top padding on mobile for menu button */}
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
