import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, Building, TrendingUp, DollarSign, Users } from 'lucide-react';

interface DemoLoginProps {
  onDemoLogin?: (demoData: any) => void;
}

export default function DemoLogin({ onDemoLogin }: DemoLoginProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const demoData = {
    user: {
      id: 'demo-user-123',
      email: 'demo@thedasboard.com',
      name: 'Demo Sales Manager',
      role: 'sales_manager',
      dealership: 'Premier Auto Group',
      account_type: 'small-dealer-group',
    },
    metrics: {
      monthly_sales: 42,
      monthly_revenue: 1250000,
      avg_deal_size: 29762,
      fi_penetration: 0.78,
      pvr: 2845,
      monthly_goals: {
        sales: 45,
        revenue: 1300000,
        fi_penetration: 0.8,
      },
      ytd_performance: {
        sales: 487,
        revenue: 14500000,
        deals_closed: 487,
      },
    },
    deals: [
      {
        id: 'demo-001',
        customer: 'Johnson',
        vehicle: '2024 Toyota Camry',
        deal_type: 'Finance',
        front_end: 2500,
        fi_profit: 3200,
        total_profit: 5700,
        status: 'Funded',
        date: '2025-01-15',
      },
      {
        id: 'demo-002',
        customer: 'Martinez',
        vehicle: '2024 Honda CR-V',
        deal_type: 'Lease',
        front_end: 1800,
        fi_profit: 2800,
        total_profit: 4600,
        status: 'Pending',
        date: '2025-01-16',
      },
      {
        id: 'demo-003',
        customer: 'Wilson',
        vehicle: '2023 Ford F-150',
        deal_type: 'Finance',
        front_end: 3200,
        fi_profit: 3800,
        total_profit: 7000,
        status: 'Funded',
        date: '2025-01-16',
      },
    ],
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ensure demo data is stored in localStorage for the session
      localStorage.setItem('demo_session', JSON.stringify(demoData));
      localStorage.setItem('demo_mode', 'true');

      // Call the onDemoLogin callback if provided
      if (onDemoLogin) {
        onDemoLogin(demoData);
      }

      // Navigate to the sales manager dashboard (default demo view)
      navigate('/dashboard/sales-manager');
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const demoFeatures = [
    {
      icon: TrendingUp,
      title: 'Real Sales Data',
      description: 'Pre-loaded with realistic dealership metrics and performance data',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Experience dashboards for Sales, Finance, and Management roles',
    },
    {
      icon: DollarSign,
      title: 'Financial Insights',
      description: 'See F&I performance, PVR, and commission tracking in action',
    },
    {
      icon: Building,
      title: 'Dealership Management',
      description: 'Explore team management and operational oversight features',
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Sales Demo Access</h2>
        <p className="text-gray-300 text-lg">
          Experience The DAS Board with realistic dealership data
        </p>
      </div>

      {/* Demo Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {demoFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg flex-shrink-0">
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sample Data Preview */}
      <div className="bg-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">Sample Data Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">42</div>
            <div className="text-gray-400 text-sm">Monthly Sales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">$1.25M</div>
            <div className="text-gray-400 text-sm">Monthly Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">78%</div>
            <div className="text-gray-400 text-sm">F&I Penetration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">$2,845</div>
            <div className="text-gray-400 text-sm">Average PVR</div>
          </div>
        </div>
      </div>

      {/* Demo Dashboard Options */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-center mb-4">Choose Demo Dashboard</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              localStorage.setItem('demo_session', JSON.stringify(demoData));
              localStorage.setItem('demo_mode', 'true');
              navigate('/dashboard/sales-manager');
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Users className="mr-2 w-4 h-4" />
            Sales Manager
          </button>

          <button
            onClick={() => {
              localStorage.setItem('demo_session', JSON.stringify(demoData));
              localStorage.setItem('demo_mode', 'true');
              navigate('/dashboard/finance');
            }}
            className="bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <DollarSign className="mr-2 w-4 h-4" />
            Finance Manager
          </button>

          <button
            onClick={() => {
              localStorage.setItem('demo_session', JSON.stringify(demoData));
              localStorage.setItem('demo_mode', 'true');
              navigate('/dashboard/gm');
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Building className="mr-2 w-4 h-4" />
            General Manager
          </button>

          <button
            onClick={() => {
              localStorage.setItem('demo_session', JSON.stringify(demoData));
              localStorage.setItem('demo_mode', 'true');
              navigate('/dashboard/sales');
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <TrendingUp className="mr-2 w-4 h-4" />
            Salesperson
          </button>
        </div>

        {/* Primary Demo Button */}
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center justify-center hover:shadow-xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Loading Demo...
            </>
          ) : (
            <>
              Launch Sales Manager Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          This demo includes sample data for demonstration purposes only.
          <br />
          No real customer information is used.
        </p>
      </div>
    </div>
  );
}
