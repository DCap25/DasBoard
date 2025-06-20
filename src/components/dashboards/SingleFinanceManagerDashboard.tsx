import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

import { SingleFinanceHomePage } from '../../pages/finance/SingleFinanceHomePage';
import FinanceDealsPage from '../../pages/finance/FinanceDealsPage';
import { getFinanceManagerDeals } from '../../lib/apiService';

// Interface for a deal
interface Deal {
  id: string;
  customer: string;
  vehicle: string;
  vin: string;
  saleDate: string;
  salesperson: string;
  amount: number;
  status: string;
  products: string[];
  profit: number;
  created_at: string;
}

const SingleFinanceManagerDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [timePeriod, setTimePeriod] = useState<string>('this-month');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the schema name from user metadata
  const schemaName = user?.user_metadata?.schema_name || '';

  // Function to load deals from localStorage for Single Finance Dashboard
  const loadDealsFromLocalStorage = () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[SingleFinanceManagerDashboard] Loading deals from localStorage');

      const existingDealsJson = localStorage.getItem('singleFinanceDeals');
      const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

      console.log(
        `[SingleFinanceManagerDashboard] Found ${existingDeals.length} deals in localStorage`
      );

      // Map localStorage deal format to the component's Deal interface
      const formattedDeals: Deal[] = existingDeals.map((localDeal: any) => ({
        id: localDeal.id || localDeal.deal_number || 'unknown',
        customer: localDeal.customer_name || localDeal.customer,
        vehicle: localDeal.vehicle,
        vin: localDeal.vin || '',
        saleDate: localDeal.sale_date || localDeal.saleDate,
        salesperson: localDeal.salesperson || 'Self',
        amount: localDeal.amount || localDeal.total_gross || 0,
        status: localDeal.status || 'pending',
        products: Array.isArray(localDeal.products) ? localDeal.products : [],
        profit: localDeal.profit || localDeal.back_end_gross || 0,
        created_at: localDeal.created_at || new Date().toISOString(),
      }));

      setDeals(formattedDeals);
    } catch (error) {
      console.error(
        '[SingleFinanceManagerDashboard] Error loading deals from localStorage:',
        error
      );
      setError('Failed to load deals from local storage.');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Load deals from the schema if it exists
  useEffect(() => {
    if (schemaName) {
      fetchDealsFromSchema();
    } else {
      // No schema available - load from localStorage for single finance deals
      console.log('[SingleFinanceManagerDashboard] No schema available, loading from localStorage');
      loadDealsFromLocalStorage();
    }
  }, [schemaName, timePeriod]);

  // Function to fetch deals from the schema
  const fetchDealsFromSchema = async () => {
    if (!schemaName) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`[SingleFinanceManagerDashboard] Fetching deals from schema: ${schemaName}`);

      // Build filter based on time period
      const filter: Record<string, any> = {};

      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      if (timePeriod === 'this-month') {
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        filter.sale_date = {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        };
      } else if (timePeriod === 'last-month') {
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);
        filter.sale_date = {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        };
      } else if (timePeriod === 'last-quarter') {
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3 - 3;
        const startDate = new Date(currentYear, quarterStartMonth, 1);
        const endDate = new Date(currentYear, quarterStartMonth + 3, 0);
        filter.sale_date = {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        };
      } else if (timePeriod === 'ytd') {
        const startDate = new Date(currentYear, 0, 1);
        filter.sale_date = {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      } else if (timePeriod === 'last-year') {
        const startDate = new Date(currentYear - 1, 0, 1);
        const endDate = new Date(currentYear - 1, 11, 31);
        filter.sale_date = {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        };
      }

      // Fetch deals from the schema
      const result = await getFinanceManagerDeals(schemaName, {
        limit: 50,
        sortBy: 'created_at',
        sortDirection: 'desc',
        filter,
      });

      if (result.success) {
        console.log(`[SingleFinanceManagerDashboard] Fetched ${result.deals.length} deals`);

        // Map the schema deal format to the component's Deal interface
        const formattedDeals: Deal[] = result.deals.map(schemaDeal => ({
          id: schemaDeal.deal_number || String(schemaDeal.id),
          customer: schemaDeal.customer_name,
          vehicle: schemaDeal.vehicle,
          vin: schemaDeal.vin || '',
          saleDate: schemaDeal.sale_date,
          salesperson: 'Self', // Finance manager deals are self-originated
          amount: schemaDeal.amount,
          status: schemaDeal.status,
          products: Array.isArray(schemaDeal.products)
            ? schemaDeal.products
            : typeof schemaDeal.products === 'string'
            ? JSON.parse(schemaDeal.products)
            : [],
          profit: schemaDeal.profit,
          created_at: schemaDeal.created_at,
        }));

        setDeals(formattedDeals);
      } else {
        console.error('[SingleFinanceManagerDashboard] Error fetching deals:', result.error);
        setError('Failed to load deals. Please try again later.');
      }
    } catch (err) {
      console.error('[SingleFinanceManagerDashboard] Exception fetching deals:', err);
      setError('An unexpected error occurred while loading deals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[SingleFinanceManagerDashboard] Rendering single finance manager dashboard', {
      userId: user?.id,
      role,
      dealershipId,
      timestamp: new Date().toISOString(),
      path: location.pathname,
    });

    // Cleanup function
    return () => {
      console.log('[SingleFinanceManagerDashboard] Unmounting single finance manager dashboard');
    };
  }, [user, role, dealershipId, location.pathname]);

  // Simple function to handle the "Log New Deal" button click
  const handleLogNewDealClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(
      '[SingleFinanceManagerDashboard] Log New Deal button clicked, navigating to /single-finance-deal-log'
    );
    navigate('/single-finance-deal-log'); // Navigate to the external single finance deal log route
  };

  // Helper to get the current month and year for display
  const getPeriodLabel = (period: string): string => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    switch (period) {
      case 'this-month':
        return `${month} ${year}`;
      case 'last-month':
        const lastMonth =
          today.getMonth() === 0
            ? 'December'
            : new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleString('default', {
                month: 'long',
              });
        const lastMonthYear =
          today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        return `${lastMonth} ${lastMonthYear}`;
      case 'last-quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        return `Q${currentQuarter === 0 ? 4 : currentQuarter} ${
          currentQuarter === 0 ? year - 1 : year
        }`;
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
    <div className="container py-4">
      {/* Dashboard header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold">Finance Manager Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Finance Manager: {user?.email?.split('@')[0] || 'Not Assigned'}
              </p>
            </div>

            {/* Daily Finance Tip - Best Practices */}
            <div className="bg-blue-50 p-2 rounded-md mt-2 md:mt-0 border border-blue-100 max-w-2xl">
              <p className="text-xs italic text-blue-800">
                <Lightbulb className="h-3 w-3 inline-block mr-1" />
                <strong>F&I Best Practice:</strong>{' '}
                {bestPractices[new Date().getDay() % bestPractices.length]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month/Year and New Deal Button row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-3">{getPeriodLabel(timePeriod)}</h2>
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

        <Button
          size="lg"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={handleLogNewDealClick}
        >
          <span className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" />
            Log New Deal
          </span>
        </Button>
      </div>

      {/* Main Dashboard Content */}
      <div>
        <SingleFinanceHomePage />
      </div>

      {/* Deals Log Section */}
      <Card className="col-span-12 bg-white border-slate-200 shadow-sm">
        <CardHeader className="py-2 px-4 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-medium flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            Deals Log
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/single-finance/deals">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {deals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs">
                    <th className="font-medium text-white py-2 pl-3 text-center bg-gray-600 w-12">
                      #
                    </th>
                    <th className="font-medium text-white py-2 pl-4 pr-2 text-left bg-blue-600">
                      Deal #
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-left bg-gray-600">
                      Stock #
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-left bg-gray-600">
                      Last Name
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-600">
                      Date
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-indigo-600">
                      N/U/CPO
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-teal-600">VSC</th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-purple-600">
                      PPM
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-green-600">
                      GAP
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-amber-600">
                      T&W/Bundle
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-pink-600">
                      PPD
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-purple-600">
                      PVR
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-green-600">
                      Total
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-600 rounded-tr-md w-20">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deals.slice(0, 5).map((deal, index) => {
                    // Extract last name from customer
                    const lastName = deal.customer.split(' ').pop() || '';

                    // Format date for display
                    const dealDate = new Date(deal.saleDate);
                    const formattedDate = dealDate.toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit',
                    });

                    // Determine if New, Used or CPO - simulating for now
                    const vehicleType = deal.vehicle.toLowerCase().includes('new')
                      ? 'N'
                      : deal.vehicle.toLowerCase().includes('cpo')
                      ? 'C'
                      : 'U';

                    // Calculate individual product profits
                    const vscProfit =
                      deal.products.includes('Extended Warranty') ||
                      deal.products.includes('Vehicle Service Contract (VSC)')
                        ? Math.round(deal.profit * 0.35)
                        : 0;
                    const ppmProfit =
                      deal.products.includes('Paint Protection') ||
                      deal.products.includes('Paint and Fabric Protection') ||
                      deal.products.includes('PPM') ||
                      deal.products.includes('PrePaid Maintenance (PPM)')
                        ? Math.round(deal.profit * 0.2)
                        : 0;
                    const gapProfit = deal.products.includes('GAP Insurance')
                      ? Math.round(deal.profit * 0.25)
                      : 0;
                    const twProfit =
                      deal.products.includes('Tire & Wheel') ||
                      deal.products.includes('Tire & Wheel Bundle')
                        ? Math.round(deal.profit * 0.2)
                        : 0;

                    // Products per deal
                    const ppd = deal.products.length;

                    // PVR (per vehicle retailed) - using profit as estimation
                    const pvr = Math.round(deal.profit / (ppd || 1));

                    // Get status based on deal status or default to "Pending"
                    const status =
                      deal.status === 'Complete' || deal.status === 'Funded'
                        ? 'Funded'
                        : deal.status === 'Canceled' || deal.status === 'Unwound'
                        ? 'Unwound'
                        : 'Pending';

                    // Status badge colors
                    const statusColor =
                      status === 'Funded'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : status === 'Unwound'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <tr
                        key={deal.id}
                        className={`border-b ${
                          index % 2 === 1 ? 'bg-gray-50' : ''
                        } hover:bg-blue-50`}
                      >
                        <td className="py-2 px-2 text-center font-medium">
                          {deals.length - index}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-left font-medium text-blue-600">
                          {deal.id}
                        </td>
                        <td className="py-2 px-2 text-left">{deal.id.replace('D', 'S')}</td>
                        <td className="py-2 px-2 text-left font-medium">{lastName}</td>
                        <td className="py-2 px-2 text-center text-gray-600">{formattedDate}</td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              vehicleType === 'N'
                                ? 'bg-green-100 text-green-800'
                                : vehicleType === 'C'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {vehicleType}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right bg-teal-50">
                          ${vscProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-purple-50">
                          ${ppmProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-green-50">
                          ${gapProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-amber-50">
                          ${twProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center bg-pink-50 font-medium">{ppd}</td>
                        <td className="py-2 px-2 text-right bg-purple-50">
                          ${pvr.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-green-600">
                          ${deal.profit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 border-t border-t-gray-200 font-medium">
                    <td colSpan={6} className="py-2 pl-4 text-left">
                      TOTALS
                    </td>
                    <td className="py-2 px-2 text-right bg-teal-50">
                      $
                      {deals
                        .slice(0, 5)
                        .reduce(
                          (sum, deal) =>
                            sum +
                            (deal.products.includes('Extended Warranty') ||
                            deal.products.includes('Vehicle Service Contract (VSC)')
                              ? Math.round(deal.profit * 0.35)
                              : 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-purple-50">
                      $
                      {deals
                        .slice(0, 5)
                        .reduce(
                          (sum, deal) =>
                            sum +
                            (deal.products.includes('Paint Protection') ||
                            deal.products.includes('Paint and Fabric Protection') ||
                            deal.products.includes('PPM') ||
                            deal.products.includes('PrePaid Maintenance (PPM)')
                              ? Math.round(deal.profit * 0.2)
                              : 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-green-50">
                      $
                      {deals
                        .slice(0, 5)
                        .reduce(
                          (sum, deal) =>
                            sum +
                            (deal.products.includes('GAP Insurance')
                              ? Math.round(deal.profit * 0.25)
                              : 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-amber-50">
                      $
                      {deals
                        .slice(0, 5)
                        .reduce(
                          (sum, deal) =>
                            sum +
                            (deal.products.includes('Tire & Wheel') ||
                            deal.products.includes('Tire & Wheel Bundle')
                              ? Math.round(deal.profit * 0.2)
                              : 0),
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center bg-pink-50">
                      {(
                        deals.slice(0, 5).reduce((sum, deal) => sum + deal.products.length, 0) /
                        Math.max(1, deals.slice(0, 5).length)
                      ).toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-right bg-purple-50">
                      $
                      {Math.round(
                        deals.slice(0, 5).reduce((sum, deal) => sum + deal.profit, 0) /
                          Math.max(1, deals.slice(0, 5).length)
                      ).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-green-600">
                      $
                      {deals
                        .slice(0, 5)
                        .reduce((sum, deal) => sum + deal.profit, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No deals logged yet. Use the "Log New Deal" button to add deals.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Placeholder components for the routes
function DealProfitTracker() {
  return (
    <Card className="p-6">
      <CardHeader>
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

export default SingleFinanceManagerDashboard;
