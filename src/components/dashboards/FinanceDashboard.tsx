import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  DollarSign,
  Calculator,
  FileText,
  TrendingUp,
  PieChart,
  Percent,
  ChevronUp,
  ChevronDown,
  BarChart4,
  CreditCard,
  PlusCircle,
  Lightbulb,
  Calendar,
} from 'lucide-react';
import FinanceHomePage from '../../pages/finance/FinanceHomePage';
import FinanceDealsPage from '../../pages/finance/FinanceDealsPage';
import FinanceSchedulePage from '../../pages/finance/FinanceSchedulePage';
import {
  getDashboardData,
  loadDealsFromStorage,
  aggregateDealsForDashboard,
} from '../../utils/dealMapper';

const FinanceDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [timePeriod, setTimePeriod] = useState<string>('this-month');

  useEffect(() => {
    console.log('[FinanceDashboard] Rendering finance dashboard', {
      userId: user?.id,
      role,
      dealershipId,
      timestamp: new Date().toISOString(),
      path: location.pathname,
    });

    // Cleanup function
    return () => {
      console.log('[FinanceDashboard] Unmounting finance dashboard');
    };
  }, [user, role, dealershipId, location.pathname]);

  // Simple function to handle the "Log New Deal" button click
  const handleLogNewDealClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[FinanceDashboard] Log New Deal button clicked, navigating to /finance-deal-log');
    navigate('/finance-deal-log'); // Navigate to the dedicated finance deal log route
  };

  // Helper to get the current month and year for display
  const getPeriodLabel = (period: string): string => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    switch (period) {
      case 'this-month':
        return `${month} ${year}`;
      case 'last-month': {
        const lastMonth =
          today.getMonth() === 0
            ? 'December'
            : new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleString('default', {
                month: 'long',
              });
        const lastMonthYear =
          today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        return `${lastMonth} ${lastMonthYear}`;
      }
      case 'last-quarter': {
        const currentQuarter = Math.floor(today.getMonth() / 3);
        return `Q${currentQuarter === 0 ? 4 : currentQuarter} ${
          currentQuarter === 0 ? year - 1 : year
        }`;
      }
      case 'ytd':
        return `Year to Date ${year}`;
      case 'last-year':
        return `${year - 1}`;
      default:
        return `${month} ${year}`;
    }
  };

  // Best practices tips for finance managers
  const bestPractices = [
    'Present every product to every customer every time - consistency is key.',
    'Build value first, then discuss investment. Never start with the price.',
    'Use customer-friendly language instead of industry jargon when explaining products.',
    'Focus on protection and peace of mind, not just financial benefits.',
    'Keep your menu presentation simple and visual for maximum effectiveness.',
    'Digital menus increase compliance and provide a more professional presentation.',
    'Always congratulate the customer on their vehicle purchase before starting your presentation.',
    'Listen to customer concerns about products and address them specifically.',
    "Explain how each product benefits the customer's specific vehicle and usage patterns.",
  ];

  return (
    <>
      {/* Standardized Dashboard Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Finance Manager Dashboard</h1>
        </div>
        <div className="bg-blue-50 p-2 rounded-md border border-blue-100 max-w-md mr-64">
          <p className="text-xs italic text-blue-800">
            <Lightbulb className="h-3 w-3 inline-block mr-1" />
            <strong>F&I Best Practice:</strong>{' '}
            {bestPractices[new Date().getDay() % bestPractices.length]}
          </p>
        </div>
      </div>

      {/* Standardized Period Controls */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">{getPeriodLabel(timePeriod)}</h2>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-1" />
              <select
                value={timePeriod}
                onChange={e => setTimePeriod(e.target.value)}
                className="p-2 border rounded-md shadow-sm"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="ytd">Year to Date</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
            <p className="text-gray-500">Finance Performance Dashboard</p>
          </div>

          <div className="flex items-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleLogNewDealClick}
            >
              <span className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5" />
                Log New Deal
              </span>
            </Button>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<FinanceHomePage />} />
        <Route path="/deals" element={<FinanceDealsPage />} />
        <Route path="/schedule" element={<FinanceSchedulePage />} />
        <Route path="*" element={<Navigate to="/dashboard/finance" replace />} />
      </Routes>
    </>
  );
};

// Placeholder components for the routes
function DealProfitTracker() {
  return (
    <Card className="p-6">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600">
        <CardTitle>Deal Profit Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The deal profit tracker feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function PayCalculator() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Pay Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The pay calculator feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function ProductsPerformance() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Products Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The products performance feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function DealDocuments() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Deal Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The deal documents feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function PerformanceMetrics() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Performance metrics are coming soon.</p>
      </CardContent>
    </Card>
  );
}

export default FinanceDashboard;
