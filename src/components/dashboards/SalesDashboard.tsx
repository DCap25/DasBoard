import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DealLogEditor } from '../manager/DealLogEditor';
import GoalTracking from '../GoalTracking';
import {
  getDashboardData,
  loadDealsFromStorage,
  aggregateDealsForDashboard,
} from '../../utils/dealMapper';
import { useSalesDealsData } from '../../hooks/useDealsData';
import {
  ShoppingBag,
  Target,
  Calculator,
  Clock,
  TrendingUp,
  DollarSign,
  Car,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  FileText,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Home,
  Calendar,
  Users,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trophy,
  User,
  Lightbulb,
  ArrowUpDown,
  BarChart3,
} from 'lucide-react';
import { Progress } from '../ui/progress';

// Mock data for salesperson deals
const MOCK_DEALS = [
  {
    id: 'D5421',
    stockNumber: 'A7831',
    lastName: 'Johnson',
    frontGross: 1200,
    backEndGross: 700,
    date: '2023-06-10',
    isNew: true,
  },
  {
    id: 'D5398',
    stockNumber: 'B2241',
    lastName: 'Martinez',
    frontGross: 800,
    backEndGross: 900,
    date: '2023-06-08',
    isNew: false,
  },
  {
    id: 'D5376',
    stockNumber: 'C5532',
    lastName: 'Williams',
    frontGross: 0,
    backEndGross: 500,
    date: '2023-06-05',
    isNew: false,
  },
  {
    id: 'D5342',
    stockNumber: 'A1277',
    lastName: 'Garcia',
    frontGross: 1500,
    backEndGross: 800,
    date: '2023-06-01',
    isNew: false,
  },
  {
    id: 'D5321',
    stockNumber: 'B8773',
    lastName: 'Miller',
    frontGross: 950,
    backEndGross: 600,
    date: '2023-05-29',
    isNew: false,
  },
  {
    id: 'D5310',
    stockNumber: 'C9912',
    lastName: 'Davis',
    frontGross: 0,
    backEndGross: 450,
    date: '2023-05-27',
    isNew: false,
  },
  {
    id: 'D5298',
    stockNumber: 'A5523',
    lastName: 'Rodriguez',
    frontGross: 1300,
    backEndGross: 750,
    date: '2023-05-25',
    isNew: false,
  },
];

// Car emojis for goal progression
const CAR_PROGRESSION = [
  { emoji: '🚗', name: 'Compact', threshold: 0 },
  { emoji: '🚙', name: 'Sedan', threshold: 20 },
  { emoji: '🚐', name: 'SUV', threshold: 40 },
  { emoji: '🏎️', name: 'Sports Car', threshold: 60 },
  { emoji: '🚓', name: 'Premium', threshold: 80 },
  { emoji: '🏁', name: 'Supercar', threshold: 95 },
];

// Mock schedule data
const SCHEDULE_DATA = [
  { day: 'Monday', date: '12', shift: 'Off', team: '' },
  { day: 'Tuesday', date: '13', shift: '10am - 7pm', team: 'Team A' },
  { day: 'Wednesday', date: '14', shift: '9am - 6pm', team: 'Team A' },
  { day: 'Thursday', date: '15', shift: '12pm - 9pm', team: 'Team A' },
  { day: 'Friday', date: '16', shift: '9am - 6pm', team: 'Team B' },
  { day: 'Saturday', date: '17', shift: '9am - 8pm', team: 'Team B' },
  { day: 'Sunday', date: '18', shift: 'Off', team: '' },
];

// Mock pay calculator data
const PAY_CALCULATOR = {
  frontEndGrossPercent: 25,
  backEndGrossPercent: 5,
  spiffs: 350,
  bonusThreshold: 12,
  bonusAmount: 500,
};

const SalesDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const [displayFrontEnd, setDisplayFrontEnd] = useState(true);
  const [displayBackEnd, setDisplayBackEnd] = useState(true);
  const [goalProgress, setGoalProgress] = useState(60);
  const [timePeriod, setTimePeriod] = useState<string>('this-month');
  const [expandedDasBoard, setExpandedDasBoard] = useState(false);

  // Use the custom hook to manage deal data
  const salespersonId = user?.id || user?.user_metadata?.salesperson_id;
  const {
    dealData,
    loading,
    error,
    setTimePeriod: setHookTimePeriod,
  } = useSalesDealsData(salespersonId, timePeriod);

  // Update goal progress based on actual deals
  useEffect(() => {
    if (dealData?.metrics) {
      const progressPercentage =
        dealData.metrics.totalDeals > 0
          ? Math.min((dealData.metrics.totalDeals / 15) * 100, 100) // Assuming 15 deals goal
          : 0;
      setGoalProgress(progressPercentage);
    }
  }, [dealData]);

  // Get the current car based on goal progress
  const getCurrentCar = progress => {
    for (let i = CAR_PROGRESSION.length - 1; i >= 0; i--) {
      if (progress >= CAR_PROGRESSION[i].threshold) {
        return CAR_PROGRESSION[i];
      }
    }
    return CAR_PROGRESSION[0];
  };

  // Get deals performance indicator
  const getDealsPerformanceIndicator = () => {
    // Assuming goal is 15 deals in a 30 day month
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const expectedDeals = Math.round((currentDay / daysInMonth) * 15);
    const actualDeals = MOCK_DEALS.length;

    if (actualDeals < expectedDeals - 2) return 'red';
    if (actualDeals < expectedDeals) return 'yellow';
    return 'green';
  };

  // Use real deal data or fallback to mock data
  const currentDeals = dealData?.deals || MOCK_DEALS;
  const metrics = dealData?.metrics || {};

  // Calculate metrics from real data
  const totalFrontEndGross = metrics.totalFrontGross || 0;
  const totalBackEndGross = metrics.totalBackGross || 0;
  const totalGross = metrics.totalGross || totalFrontEndGross + totalBackEndGross;
  const totalDeals = metrics.totalDeals || 0;
  const miniDeals = currentDeals.filter(
    deal => (deal.frontGross || deal.frontEndGross || 0) === 0
  ).length;

  // Current car in progression
  const currentCar = getCurrentCar(goalProgress);

  // Performance indicator color
  const performanceColor = getDealsPerformanceIndicator();

  // Calculate current earnings
  const currentEarnings =
    totalFrontEndGross * (PAY_CALCULATOR.frontEndGrossPercent / 100) +
    totalBackEndGross * (PAY_CALCULATOR.backEndGrossPercent / 100) +
    PAY_CALCULATOR.spiffs;

  // Calculate potential earnings (assuming similar performance for rest of month)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const remainingDaysFactor = daysInMonth / currentDay;
  const potentialEarnings = currentEarnings * remainingDaysFactor;

  // Add bonus if deals threshold is met
  const projectedDeals = (metrics.totalDeals || MOCK_DEALS.length) * remainingDaysFactor;
  const projectedEarningsWithBonus =
    potentialEarnings +
    (projectedDeals >= PAY_CALCULATOR.bonusThreshold ? PAY_CALCULATOR.bonusAmount : 0);

  // Get period label for display
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

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value;
    setTimePeriod(newPeriod);
    setHookTimePeriod(newPeriod);
  };

  useEffect(() => {
    console.log('[SalesDashboard] Rendering sales dashboard', {
      userId: user?.id,
      role,
      dealershipId,
      timestamp: new Date().toISOString(),
    });

    // Cleanup function
    return () => {
      console.log('[SalesDashboard] Unmounting sales dashboard');
    };
  }, [user, role, dealershipId]);

  // Helper to highlight today in the schedule
  const isToday = day => {
    const today = new Date().getDay();
    // Convert day name to day number (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    return dayMap[day] === today;
  };

  return (
    <>
      {/* Standardized Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold">Sales Person Dashboard</h1>
          {/* Daily Sales Tip */}
          <div className="bg-blue-50 p-2 rounded-md mt-2 border border-blue-100 max-w-2xl">
            <p className="text-xs italic text-blue-800">
              <Lightbulb className="h-3 w-3 inline-block mr-1" />
              <strong>Daily Tip:</strong>{' '}
              {
                [
                  'Listen twice as much as you talk. You have two ears and one mouth for a reason.',
                  'The first 5 minutes with a customer sets the tone for the entire deal.',
                  'Be the expert they can trust, not just the salesperson they deal with.',
                  "Follow up with past customers - they're your best source of referrals.",
                  'Know your inventory better than anyone else on the floor.',
                  'Sell the experience and lifestyle, not just the vehicle.',
                  "Always ask for referrals - it's the easiest way to grow your business.",
                ][new Date().getDay()]
              }
            </p>
          </div>
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
                onChange={handleTimePeriodChange}
                className="p-2 border rounded-md shadow-sm"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="ytd">Year to Date</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
            <p className="text-gray-500">Sales Performance Dashboard</p>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-50 border-r border-gray-200 rounded-full flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold">{user?.email?.split('@')[0] || 'Sales Associate'}</div>
              <div className="text-xs text-gray-500">{role || 'Salesperson'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <div className="bg-blue-100 border-r border-blue-200 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Deal Data Warning</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  Showing fallback data. New deals will update automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-6">
          <div className="bg-blue-200 border-r border-blue-300 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-sm text-blue-700">Loading deal data...</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-black">
              <span className="flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5 text-gray-600" />
                Total Deals This Month
              </span>
              <span>📊</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dealData?.metrics?.totalDeals || MOCK_DEALS.length}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ChevronUp className="h-3 w-3 mr-1" />
              8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-black">
              <span className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-gray-600" />
                Total Gross
              </span>
              <span>💰</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dealData?.metrics?.totalGross?.toLocaleString() || '32,450'}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ChevronUp className="h-3 w-3 mr-1" />
              12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-black">
              <span className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-gray-600" />
                Average PVR
              </span>
              <span>📈</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dealData?.metrics?.avgPVR?.toLocaleString() || '2,315'}
            </div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <ChevronDown className="h-3 w-3 mr-1" />
              4% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-lg font-semibold flex items-center justify-between text-black">
              <span className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-gray-600" />
                Goal Progress
              </span>
              <span>🎯</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Compact Weekly Schedule with left/right navigation */}
      <div className="mb-6">
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-lg font-semibold flex items-center text-black">
              <CalendarClock className="mr-2 h-5 w-5 text-gray-600" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-0 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-7 text-center px-6">
              {SCHEDULE_DATA.map((day, index) => (
                <div
                  key={index}
                  className={`p-1 ${
                    isToday(day.day)
                      ? 'bg-white border-r border-gray-200 border-b-2 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="font-medium text-xs text-gray-800">
                    {day.day.substring(0, 3)} <span className="text-gray-500">{day.date}</span>
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      day.shift === 'Off' ? 'text-gray-400' : 'text-gray-800 font-medium'
                    }`}
                  >
                    {day.shift === 'Off'
                      ? 'Off'
                      : day.shift.replace('am - ', '-').replace('pm', '').replace('am', '')}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Deals - Full Width Expandable */}
      <div className="mb-6">
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="py-2 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center text-black">
                <FileText className="mr-2 h-5 w-5 text-gray-600" />
                My Deals
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedDasBoard(!expandedDasBoard)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                {expandedDasBoard ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            {!expandedDasBoard ? (
              /* Compact View - Recent deals only */
              <>
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium text-xs text-gray-700">STOCK #</th>
                          <th className="pb-2 font-medium text-xs text-gray-700">CUSTOMER</th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-right">
                            FRONT
                          </th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-right">
                            BACK
                          </th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-right">
                            TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDeals.slice(0, 5).map((deal, index) => (
                          <tr
                            key={deal.id || deal.dealNumber}
                            className={`border-b hover:bg-gray-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="py-2 text-sm font-medium">
                              {deal.stockNumber || `STK${1000 + index}`}
                            </td>
                            <td className="py-2 text-sm">
                              {deal.customerName || deal.lastName || 'N/A'}
                            </td>
                            <td className="py-2 text-sm text-right">
                              ${(deal.frontEndGross || deal.frontGross || 0).toLocaleString()}
                            </td>
                            <td className="py-2 text-sm text-right">
                              ${(deal.backEndGross || 0).toLocaleString()}
                            </td>
                            <td className="py-2 text-sm text-right font-semibold">
                              $
                              {(
                                (deal.frontEndGross || deal.frontGross || 0) +
                                (deal.backEndGross || 0)
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Expanded View - All deals with more details */
              <>
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-medium text-xs text-gray-700">DATE</th>
                          <th className="pb-2 font-medium text-xs text-gray-700">STOCK #</th>
                          <th className="pb-2 font-medium text-xs text-gray-700">CUSTOMER</th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-center">
                            TYPE
                          </th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-right">
                            FRONT
                          </th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-right">
                            BACK
                          </th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-right">
                            TOTAL
                          </th>
                          <th className="pb-2 font-medium text-xs text-gray-700 text-center">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDeals.map((deal, index) => (
                          <tr
                            key={deal.id || deal.dealNumber}
                            className={`border-b hover:bg-gray-50 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="py-2 text-sm">
                              {deal.date ? new Date(deal.date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-2 text-sm font-medium">
                              {deal.stockNumber || `STK${1000 + index}`}
                            </td>
                            <td className="py-2 text-sm">
                              {deal.customerName || deal.lastName || 'N/A'}
                            </td>
                            <td className="py-2 text-sm text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  deal.isNew
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {deal.isNew ? 'New' : 'Used'}
                              </span>
                            </td>
                            <td className="py-2 text-sm text-right">
                              ${(deal.frontEndGross || deal.frontGross || 0).toLocaleString()}
                            </td>
                            <td className="py-2 text-sm text-right">
                              ${(deal.backEndGross || 0).toLocaleString()}
                            </td>
                            <td className="py-2 text-sm text-right font-semibold">
                              $
                              {(
                                (deal.frontEndGross || deal.frontGross || 0) +
                                (deal.backEndGross || 0)
                              ).toLocaleString()}
                            </td>
                            <td className="py-2 text-sm text-center">
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                Funded
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Three Big Sections: The DAS Board, Goal Tracker, and Pay Configurator */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* The DAS Board Section */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="py-2 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center text-black">
                <Trophy className="mr-2 h-5 w-5 text-gray-600" />
                The DAS Board
              </CardTitle>
              <div
                className={`h-3 w-3 rounded-full ${
                  getDealsPerformanceIndicator() === 'green'
                    ? 'bg-green-400'
                    : getDealsPerformanceIndicator() === 'yellow'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
              ></div>
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 font-medium text-xs text-gray-700">#</th>
                      <th className="pb-2 font-medium text-xs text-gray-700">SALESPERSON</th>
                      <th className="pb-2 font-medium text-xs text-gray-700 text-right">PVR</th>
                      <th className="pb-2 font-medium text-xs text-gray-700 text-right">UNITS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Michael Scott', units: 14, pvr: 2321 },
                      { name: 'Jim Halpert', units: 12, pvr: 2408 },
                      { name: 'Dwight Schrute', units: 11, pvr: 2400 },
                      { name: 'Pam Beesly', units: 9, pvr: 2411 },
                      { name: 'Stanley Hudson', units: 8, pvr: 2400 },
                    ].map((person, index) => (
                      <tr
                        key={index}
                        className={`border-b hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="py-2 text-sm">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                            ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-600'
                                : index === 1
                                ? 'bg-gray-100 text-gray-600'
                                : index === 2
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-2 text-sm font-medium">{person.name}</td>
                        <td className="py-2 text-sm text-right">${person.pvr}</td>
                        <td className="py-2 text-sm text-right font-semibold text-indigo-700">
                          {person.units}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View More Button */}
            <div className="mt-3 pt-2 text-center border-t">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View Full Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goal Tracker */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-lg font-semibold flex items-center text-black">
              <Target className="mr-2 h-5 w-5 text-gray-600" />
              Goal Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-4">
              {/* Monthly Goal Progress */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(goalProgress)}%
                </div>
                <div className="text-sm text-gray-600 mb-3">Monthly Goal Progress</div>
                <Progress value={goalProgress} className="mb-3" />
                <div className="text-xs text-gray-500">
                  {Math.round((goalProgress / 100) * 15)} of 15 deals
                </div>
              </div>

              {/* Car Progression */}
              <div className="text-center border-t pt-4">
                <div className="text-4xl mb-2">{getCurrentCar(goalProgress).emoji}</div>
                <div className="text-sm font-medium text-gray-700">
                  {getCurrentCar(goalProgress).name}
                </div>
                <div className="text-xs text-gray-500 mt-1">Current Level</div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold">{totalDeals} deals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg PVR</span>
                  <span className="font-semibold">
                    ${dealData?.metrics?.avgPVR?.toLocaleString() || '2,315'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Gross</span>
                  <span className="font-semibold">${totalGross?.toLocaleString() || '32,450'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month-to-Date Pay Configurator */}
        <Card className="border-l-4 border-l-blue-600 rounded-lg shadow-sm">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-lg font-semibold flex items-center text-black">
              <Calculator className="mr-2 h-5 w-5 text-gray-600" />
              Pay Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-4">
              {/* Current Month Earnings */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  $
                  {(
                    (totalFrontEndGross * PAY_CALCULATOR.frontEndGrossPercent) / 100 +
                    (totalBackEndGross * PAY_CALCULATOR.backEndGrossPercent) / 100 +
                    PAY_CALCULATOR.spiffs
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-3">Estimated Month-to-Date</div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Front End ({PAY_CALCULATOR.frontEndGrossPercent}%)
                  </span>
                  <span className="font-semibold">
                    $
                    {(
                      (totalFrontEndGross * PAY_CALCULATOR.frontEndGrossPercent) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Back End ({PAY_CALCULATOR.backEndGrossPercent}%)
                  </span>
                  <span className="font-semibold">
                    $
                    {(
                      (totalBackEndGross * PAY_CALCULATOR.backEndGrossPercent) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Spiffs & Bonuses</span>
                  <span className="font-semibold">${PAY_CALCULATOR.spiffs}</span>
                </div>
              </div>

              {/* Bonus Tracker */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Bonus Tracker</span>
                  <span className="text-xs text-gray-500">
                    {totalDeals}/{PAY_CALCULATOR.bonusThreshold} deals
                  </span>
                </div>
                <Progress
                  value={Math.min((totalDeals / PAY_CALCULATOR.bonusThreshold) * 100, 100)}
                  className="mb-2"
                />
                <div className="text-xs text-center text-gray-500">
                  {totalDeals >= PAY_CALCULATOR.bonusThreshold
                    ? `Bonus Earned: $${PAY_CALCULATOR.bonusAmount}`
                    : `${PAY_CALCULATOR.bonusThreshold - totalDeals} deals to bonus`}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-gray-400 border-t pt-3">
                *Estimates only. Actual pay may vary based on final accounting.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SalesDashboard;
