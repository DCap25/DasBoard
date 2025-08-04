import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  getDashboardData,
  loadDealsFromStorage,
  aggregateDealsForDashboard,
} from '../../utils/dealMapper';
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
import SingleFinanceDealsPage from '../../pages/finance/SingleFinanceDealsPage';
import SingleFinanceSettings from '../../pages/finance/SingleFinanceSettings';
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

      // Load raw deals directly from localStorage to preserve all form data
      const singleFinanceDealsJson = localStorage.getItem('singleFinanceDeals');
      console.log(
        '[SingleFinanceManagerDashboard] Raw singleFinanceDeals:',
        singleFinanceDealsJson
      );

      if (!singleFinanceDealsJson) {
        console.log('[SingleFinanceManagerDashboard] No deals found in localStorage');
        setDeals([]);
        return;
      }

      const rawDeals = JSON.parse(singleFinanceDealsJson);
      console.log(`[SingleFinanceManagerDashboard] Found ${rawDeals.length} raw deals`);
      console.log('[SingleFinanceManagerDashboard] First deal sample:', rawDeals[0]);

      // Convert raw deals to component's Deal interface while preserving all extended properties
      const formattedDeals: Deal[] = rawDeals.map((rawDeal: any) => {
        // Create the base Deal interface
        const deal: Deal = {
          id: rawDeal.id,
          customer: rawDeal.customer || rawDeal.lastName,
          vehicle:
            rawDeal.vehicle ||
            `${
              rawDeal.vehicleType === 'N' ? 'New' : rawDeal.vehicleType === 'U' ? 'Used' : 'CPO'
            } - Stock #${rawDeal.stockNumber}`,
          vin: rawDeal.vin || rawDeal.vinLast8,
          saleDate: rawDeal.saleDate || rawDeal.dealDate,
          salesperson: rawDeal.salesperson || 'Self',
          amount: rawDeal.amount || rawDeal.totalGross,
          status: rawDeal.status || rawDeal.dealStatus,
          products: rawDeal.products || [],
          profit: rawDeal.profit || rawDeal.backEndGross,
          created_at: rawDeal.created_at || new Date().toISOString(),
        };

        // Preserve all the extended properties by copying them to the deal object
        // This allows the table to access dealData.dealNumber, dealData.vscProfit, etc.
        return Object.assign(deal, rawDeal);
      });

      console.log(
        '[SingleFinanceManagerDashboard] Formatted deals with extended properties:',
        formattedDeals[0]
      );
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

  // Handle status change for a deal
  const handleStatusChange = (dealId: string, newStatus: string) => {
    try {
      // Use the correct storage key for single finance deals
      const storageKey = 'singleFinanceDeals';

      // Get existing deals from localStorage
      const existingDealsJson = localStorage.getItem(storageKey);
      const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

      // Update the deal status
      const updatedDeals = existingDeals.map((deal: any) =>
        deal.id === dealId ? { ...deal, status: newStatus, dealStatus: newStatus } : deal
      );

      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedDeals));

      // Update state immediately to trigger re-render
      setDeals(currentDeals => 
        currentDeals.map(deal => 
          deal.id === dealId ? { ...deal, status: newStatus } : deal
        )
      );

      // Also reload from storage to keep consistency
      loadDealsFromLocalStorage();

      console.log(`[SingleFinanceManagerDashboard] Updated deal ${dealId} status to ${newStatus}`);
    } catch (error) {
      console.error('[SingleFinanceManagerDashboard] Error updating deal status:', error);
      setError('Failed to update deal status');
    }
  };

  // Handle deal editing
  const handleEditDeal = (dealId: string) => {
    // Navigate to the deal edit page with the deal ID
    navigate(`/single-finance-deal-log/edit/${dealId}`);
  };

  // Handle deal deletion with warning popup
  const handleDeleteDeal = (dealId: string, shouldDelete: boolean) => {
    if (!shouldDelete) return;

    // Enhanced warning popup with better messaging
    const confirmed = confirm(
      '⚠️ DELETE CONFIRMATION\n\n' +
      'Are you sure you want to delete this deal?\n\n' +
      'This action will:\n' +
      '• Permanently remove all deal data\n' +
      '• Update your dashboard metrics\n' +
      '• Cannot be undone\n\n' +
      'Click OK to delete or Cancel to keep the deal.'
    );

    if (confirmed) {
      // Second confirmation for extra safety
      const finalConfirm = confirm(
        '🚨 FINAL CONFIRMATION\n\n' +
        'This is your last chance!\n\n' +
        'Click OK to permanently delete this deal, or Cancel to keep it.'
      );

      if (finalConfirm) {
        try {
          // Use the correct storage key for single finance deals
          const storageKey = 'singleFinanceDeals';

          // Get existing deals from localStorage
          const existingDealsJson = localStorage.getItem(storageKey);
          const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

          // Remove the deal
          const updatedDeals = existingDeals.filter((deal: any) => deal.id !== dealId);

          // Save back to localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedDeals));

          // Reload deals to reflect the change
          loadDealsFromLocalStorage();

          console.log(`[SingleFinanceManagerDashboard] Deleted deal ${dealId}`);
        } catch (error) {
          console.error('[SingleFinanceManagerDashboard] Error deleting deal:', error);
          setError('Failed to delete deal');
        }
      }
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

  // Component for the main dashboard content
  const MainDashboardContent = () => (
    <>
      {/* Dashboard header - Three column layout */}
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        {/* Left Column - Title and Controls */}
        <div>
          <h1 className="text-2xl font-bold">Single Finance Manager Dashboard</h1>
          <p className="text-gray-600 text-sm mb-2">
            Finance Manager: {user?.email?.split('@')[0] || 'Not Assigned'}
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-gray-700">{getPeriodLabel(timePeriod)}</h2>
            <select
              value={timePeriod}
              onChange={e => setTimePeriod(e.target.value)}
              className="p-1 border rounded-md shadow-sm text-sm"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="ytd">Year to Date</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Middle Column - F&I Best Practice */}
        <div className="flex items-center justify-center">
          <div className="bg-white p-3 rounded-md border border-orange-100 w-full">
            <p className="text-sm text-orange-800 text-center">
              <Lightbulb className="h-4 w-4 inline-block mr-2" />
              <strong>F&I Best Practice:</strong>{' '}
              {bestPractices[new Date().getDay() % bestPractices.length]}
            </p>
          </div>
        </div>

        {/* Right Column - Log New Deal Button */}
        <div className="flex justify-end">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleLogNewDealClick}>
            <span className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Log New Deal
            </span>
          </Button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div>
        <SingleFinanceHomePage />
      </div>

      {/* Deals Log Section */}
      <Card className="col-span-12 bg-white border-slate-200 shadow-sm rounded-lg">
        <CardHeader className="bg-blue-500 border-b border-gray-300 py-2 px-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
          <CardTitle className="text-lg font-medium flex items-center text-white">
            <FileText className="mr-2 h-5 w-5 text-white" />
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
                    <th className="font-medium text-white py-2 pl-3 text-center bg-white w-12 border-r border-gray-200">
                      #
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-gray-200">
                      Last Name
                    </th>
                    <th className="font-medium text-white py-2 pl-4 pr-2 text-left bg-gray-700 border-r border-blue-200">
                      Deal #
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-blue-300">
                      Stock #
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-blue-400">
                      Date
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-blue-500">
                      VIN
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-blue-600">
                      N/U/CPO
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-blue-700">
                      Lender
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-blue-800">
                      Front End
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-blue-900">
                      VSC
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-slate-100">
                      PPM
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-slate-700">
                      GAP
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-slate-800">
                      T&W/Bundle
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-slate-900">
                      PPD
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-700">
                      PVR
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-800">
                      Total
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-gray-900 w-20">
                      Status
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-blue-600 w-16">
                      Edit
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-red-600 rounded-tr-md w-16">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deals.slice(0, 10).map((deal, index) => {
                    // Get individual product profits from deal data or calculate from legacy data
                    const dealData = deal as any; // Type assertion to access extended properties

                    // Extract last name from customer
                    const lastName = deal.customer.split(' ').pop() || '';

                    // Format date for display - use actual deal date from form
                    const actualDealDate = dealData.dealDate || deal.saleDate;
                    const dealDate = new Date(actualDealDate);
                    const formattedDate = dealDate.toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit',
                    });

                    // Determine if New, Used or CPO - use actual form data
                    const vehicleType =
                      dealData.vehicleType ||
                      (deal.vehicle.toLowerCase().includes('new')
                        ? 'N'
                        : deal.vehicle.toLowerCase().includes('cpo')
                        ? 'C'
                        : 'U');

                    console.log(`[Dashboard] Processing deal ${deal.id}:`, {
                      dealData: dealData,
                      vscProfit: dealData.vscProfit,
                      ppmProfit: dealData.ppmProfit,
                      gapProfit: dealData.gapProfit,
                      tireAndWheelProfit: dealData.tireAndWheelProfit,
                      appearanceProfit: dealData.appearanceProfit,
                      otherProfit: dealData.otherProfit,
                      dealNumber: dealData.dealNumber,
                      stockNumber: dealData.stockNumber,
                      dealDate: dealData.dealDate,
                      vehicleType: dealData.vehicleType,
                      frontEndGross: dealData.frontEndGross,
                      backEndGross: dealData.backEndGross,
                      totalGross: dealData.totalGross,
                    });

                    // Get individual product profits - ensure we handle both number and string values
                    const vscProfit =
                      typeof dealData.vscProfit === 'number'
                        ? dealData.vscProfit
                        : parseFloat(dealData.vscProfit) || 0;
                    const ppmProfit =
                      typeof dealData.ppmProfit === 'number'
                        ? dealData.ppmProfit
                        : parseFloat(dealData.ppmProfit) || 0;
                    const gapProfit =
                      typeof dealData.gapProfit === 'number'
                        ? dealData.gapProfit
                        : parseFloat(dealData.gapProfit) || 0;
                    const twProfit =
                      typeof dealData.tireAndWheelProfit === 'number'
                        ? dealData.tireAndWheelProfit
                        : parseFloat(dealData.tireAndWheelProfit) || 0;
                    const appearanceProfit =
                      typeof dealData.appearanceProfit === 'number'
                        ? dealData.appearanceProfit
                        : parseFloat(dealData.appearanceProfit) || 0;
                    const otherProfit =
                      typeof dealData.otherProfit === 'number'
                        ? dealData.otherProfit
                        : parseFloat(dealData.otherProfit) || 0;

                    // Products per deal
                    const ppd = deal.products.length;

                    // PVR (per vehicle retailed) - using profit as estimation
                    const pvr = Math.round(deal.profit / (ppd || 1));

                    // Get status based on deal status or default to "Pending"
                    const status =
                      deal.status === 'Complete' || deal.status === 'Funded'
                        ? 'Funded'
                        : deal.status === 'Held'
                        ? 'Held'
                        : deal.status === 'Canceled' || deal.status === 'Unwound'
                        ? 'Unwound'
                        : deal.status || 'Pending';

                    // Status badge colors
                    const statusColor =
                      status === 'Funded'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : status === 'Held'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : status === 'Unwound'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <tr
                        key={deal.id}
                        className="border-b"
                        style={{
                          backgroundColor: status === 'Held' ? '#fef2f2' : 
                            index % 2 === 1 ? '#f9fafb' : 'white'
                        }}
                      >
                        <td className="py-2 px-2 text-center font-medium">
                          {deals.length - index}
                        </td>
                        <td className="py-2 px-2 text-left font-medium">{lastName}</td>
                        <td className="py-2 pl-4 pr-2 text-left font-medium text-blue-600">
                          {dealData.dealNumber || deal.id}
                        </td>
                        <td className="py-2 px-2 text-left">
                          {dealData.stockNumber || deal.id.replace('D', 'S')}
                        </td>
                        <td className="py-2 px-2 text-center text-gray-600">{formattedDate}</td>
                        <td className="py-2 px-2 text-left text-gray-600 font-mono text-xs">
                          {dealData.vinLast8 || deal.vin || 'N/A'}
                        </td>
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
                        <td className="py-2 px-2 text-left text-gray-600 text-xs">
                          {dealData.lender || 'N/A'}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200 font-medium">
                          ${(dealData.frontEndGross || 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200">
                          ${vscProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200">
                          ${ppmProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200">
                          ${gapProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200">
                          ${twProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-gray-200 font-medium">
                          {ppd}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200">
                          ${pvr.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-green-600">
                          ${deal.profit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <select
                            value={status}
                            onChange={e => handleStatusChange(deal.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className={`text-xs px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-500 ${statusColor}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Funded">Funded</option>
                            <option value="Held">Held</option>
                            <option value="Unwound">Unwound</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleEditDeal(deal.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            onChange={e => handleDeleteDeal(deal.id, e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 border-t border-t-gray-200 font-medium">
                    <td colSpan={8} className="py-2 pl-4 text-left">
                      TOTALS
                    </td>
                    <td className="py-2 px-2 text-right bg-blue-50">
                      $
                      {deals
                        .slice(0, 10)
                        .reduce((sum, deal) => {
                          const dealData = deal as any;
                          const frontEndGross =
                            typeof dealData.frontEndGross === 'number'
                              ? dealData.frontEndGross
                              : parseFloat(dealData.frontEndGross) || 0;
                          return sum + frontEndGross;
                        }, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                      $
                      {deals
                        .slice(0, 10)
                        .reduce((sum, deal) => {
                          const dealData = deal as any;
                          const vscProfit =
                            typeof dealData.vscProfit === 'number'
                              ? dealData.vscProfit
                              : parseFloat(dealData.vscProfit) || 0;
                          return sum + vscProfit;
                        }, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                      $
                      {deals
                        .slice(0, 10)
                        .reduce((sum, deal) => {
                          const dealData = deal as any;
                          const ppmProfit =
                            typeof dealData.ppmProfit === 'number'
                              ? dealData.ppmProfit
                              : parseFloat(dealData.ppmProfit) || 0;
                          return sum + ppmProfit;
                        }, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                      $
                      {deals
                        .slice(0, 10)
                        .reduce((sum, deal) => {
                          const dealData = deal as any;
                          const gapProfit =
                            typeof dealData.gapProfit === 'number'
                              ? dealData.gapProfit
                              : parseFloat(dealData.gapProfit) || 0;
                          return sum + gapProfit;
                        }, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                      $
                      {deals
                        .slice(0, 10)
                        .reduce((sum, deal) => {
                          const dealData = deal as any;
                          const tireAndWheelProfit =
                            typeof dealData.tireAndWheelProfit === 'number'
                              ? dealData.tireAndWheelProfit
                              : parseFloat(dealData.tireAndWheelProfit) || 0;
                          return sum + tireAndWheelProfit;
                        }, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center bg-white border-r border-gray-200">
                      {(
                        deals.slice(0, 10).reduce((sum, deal) => sum + deal.products.length, 0) /
                        Math.max(1, deals.slice(0, 10).length)
                      ).toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                      $
                      {Math.round(
                        deals.slice(0, 10).reduce((sum, deal) => sum + deal.profit, 0) /
                          Math.max(1, deals.slice(0, 10).length)
                      ).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-green-600">
                      $
                      {deals
                        .slice(0, 10)
                        .reduce((sum, deal) => sum + deal.profit, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-2"></td>
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
    </>
  );

  return (
    <div className="w-full px-2 py-4">
      <Routes>
        <Route path="/" element={<MainDashboardContent />} />
        <Route path="/deals" element={<SingleFinanceDealsPage />} />
        <Route path="/settings" element={<SingleFinanceSettings />} />
        <Route path="*" element={<Navigate to="/dashboard/single-finance" replace />} />
      </Routes>
    </div>
  );
};

// Placeholder components for the routes
function DealProfitTracker() {
  return (
    <Card className="p-6">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600">
        <CardTitle className="text-white">Deal Profit Tracker</CardTitle>
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
      <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
        <CardTitle className="text-white">Pay Calculator</CardTitle>
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
      <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
        <CardTitle className="text-white">Products Performance</CardTitle>
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
      <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
        <CardTitle className="text-white">Deal Documents</CardTitle>
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
      <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
        <CardTitle className="text-white">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Performance metrics are coming soon.</p>
      </CardContent>
    </Card>
  );
}

export default SingleFinanceManagerDashboard;
