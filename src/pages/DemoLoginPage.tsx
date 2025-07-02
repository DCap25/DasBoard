import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import DemoLogin from '../components/auth/DemoLogin';

export default function DemoLoginPage() {
  const navigate = useNavigate();

  const handleDemoLogin = (demoData: any) => {
    console.log('[DEMO] Demo login successful:', demoData.user);
    // The DemoLogin component handles navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition-colors flex items-center"
              title="Go back"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              Back
            </button>
            <h1 className="text-4xl font-bold text-white">Sales Demonstration</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
              title="Back to home"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience The DAS Board with realistic dealership data and metrics. Perfect for
            showcasing capabilities to potential customers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Login */}
          <DemoLogin onDemoLogin={handleDemoLogin} />

          {/* Additional Demo Information */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">What's Included in the Demo</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Sales Dashboards:</strong> Real-time metrics and performance tracking
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Finance Manager Tools:</strong> F&I penetration, PVR tracking, and deal
                    logging
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Management Insights:</strong> Team performance and operational analytics
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>Pay Plan Calculator:</strong> Commission tracking and goal management
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Demo Data Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Dealership</div>
                  <div className="text-white font-medium">Premier Auto Group</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Data Period</div>
                  <div className="text-white font-medium">Current Month</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Demo Deals</div>
                  <div className="text-white font-medium">3 Sample Transactions</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">User Role</div>
                  <div className="text-white font-medium">Sales Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-700">
              <h3 className="text-xl font-bold text-blue-200 mb-3">For Sales Team</h3>
              <p className="text-blue-100 text-sm mb-4">
                This demo environment allows you to showcase The DAS Board's full capabilities to
                potential customers. All data is realistic but simulated - no real customer
                information is used.
              </p>
              <div className="text-blue-200 text-xs">
                💡 Tip: Navigate through different dashboard views to show the variety of insights
                available.
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            Need to set up a real account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
