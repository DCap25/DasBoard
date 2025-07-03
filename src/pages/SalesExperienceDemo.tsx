import React, { useState, useEffect } from 'react';
import { isAuthenticatedDemoUser } from '../lib/demoAuth';
import DemoLogin from '../components/auth/DemoLogin';

/**
 * Sales Experience Demo - Separate from regular dashboard access
 * This provides the sales demonstration interface for authenticated demo users
 */
const SalesExperienceDemo: React.FC = () => {
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDemoUser = () => {
      const demoUserStatus = isAuthenticatedDemoUser();
      setIsDemoUser(demoUserStatus);
      setLoading(false);

      if (demoUserStatus) {
        console.log('[SalesExperienceDemo] Demo user authenticated - showing sales demo');
      } else {
        console.log('[SalesExperienceDemo] No demo user authentication found');
      }
    };

    checkDemoUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Sales Demo...</p>
        </div>
      </div>
    );
  }

  if (!isDemoUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This demo requires special authentication. Please contact sales for access.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            The DAS Board - Sales Experience Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive Sales Demonstration - Explore Our Platform Features
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Authenticated Demo Session
          </div>
        </div>
        <DemoLogin />
      </div>
    </div>
  );
};

export default SalesExperienceDemo;
