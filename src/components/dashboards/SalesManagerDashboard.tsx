import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useManagerDealsData } from '../../hooks/useDealsData';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Users,
  Calculator,
  BarChart,
  Calendar,
  FileText,
  Activity,
  Target,
  LineChart,
  Medal,
  DollarSign,
  Car,
  TrendingUp,
  Percent,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Edit,
  Save,
  AlertTriangle,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { DealLogEditor } from '../manager/DealLogEditor';
import { ScheduleEditor } from '../manager/ScheduleEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

// Sample data - would be fetched from API in real implementation
const dealershipData = {
  totalGross: 125600,
  frontEndGross: 82400,
  financeGross: 43200,
  totalUnits: 86,
  newCars: 52,
  usedCars: 34,
  salesGoal: 100,
  salesPerformance: 86,
  avgPerDeal: 1460,
  avgFrontGross: 958,
  avgFinanceGross: 502,
  lastMonthComparison: {
    totalGross: 8.5,
    frontEndGross: 6.2,
    financeGross: 12.4,
    totalUnits: 9.3,
    avgPerDeal: 4.8,
  },
};

// Sample schedule data
const SCHEDULE_DATA = [
  {
    day: 'Monday',
    date: '12',
    shifts: [
      { team: 'Team A', hours: '9am-6pm', members: 'SJ, MC, DR' },
      { team: 'Team B', hours: 'Off', members: '' },
    ],
  },
  {
    day: 'Tuesday',
    date: '13',
    shifts: [
      { team: 'Team A', hours: '9am-6pm', members: 'SJ, MC, DR' },
      { team: 'Team B', hours: 'Off', members: '' },
    ],
  },
  {
    day: 'Wednesday',
    date: '14',
    shifts: [
      { team: 'Team A', hours: '10am-7pm', members: 'SJ, MC, DR' },
      { team: 'Team B', hours: 'Off', members: '' },
    ],
  },
  {
    day: 'Thursday',
    date: '15',
    shifts: [
      { team: 'Team A', hours: 'Off', members: '' },
      { team: 'Team B', hours: '9am-6pm', members: 'AW, RJ, KS' },
    ],
  },
  {
    day: 'Friday',
    date: '16',
    shifts: [
      { team: 'Team A', hours: 'Off', members: '' },
      { team: 'Team B', hours: '11am-8pm', members: 'AW, RJ, KS' },
    ],
  },
  {
    day: 'Saturday',
    date: '17',
    shifts: [
      { team: 'Team A', hours: '9am-5pm', members: 'SJ, MC, DR' },
      { team: 'Team B', hours: '9am-5pm', members: 'AW, RJ, KS' },
    ],
  },
  {
    day: 'Sunday',
    date: '18',
    shifts: [
      { team: 'Team A', hours: 'Off', members: '' },
      { team: 'Team B', hours: '10am-4pm', members: 'AW, RJ' },
    ],
  },
];

// Add a type for editable deal
interface EditableDeal {
  id: string;
  frontGross: number;
  status: string;
}

const SalesManagerDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const [data, setData] = useState(dealershipData);
  const [selectedDeal, setSelectedDeal] = useState<EditableDeal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timePeriod, setTimePeriod] = useState<string>('this-month');
  const navigate = useNavigate();

  // Use the manager deals hook
  const {
    dealData: managerDealData,
    loading: dealDataLoading,
    error: dealDataError,
    refresh: refreshDealData,
  } = useManagerDealsData(dealershipId, timePeriod);

  useEffect(() => {
    console.log('[SalesManagerDashboard] Rendering sales manager dashboard', {
      userId: user?.id,
      role,
      dealershipId,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, you would fetch data here
    // Example: fetchDealershipData(dealershipId).then(data => setData(data));

    // Cleanup function
    return () => {
      console.log('[SalesManagerDashboard] Unmounting sales manager dashboard');
    };
  }, [user, role, dealershipId]);

  // Format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to check if a day is today
  const isToday = (day: string) => {
    const today = new Date().getDay();
    // Convert day name to day number (0 = Sunday, 1 = Monday, etc.)
    const dayMap: { [key: string]: number } = {
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

  // Generate schedule data starting with today and the next 6 days
  const generateScheduleData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (currentDayIndex + i) % 7;
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateNum = date.getDate();

      // Find the corresponding data from the sample data to maintain the shift information
      const sampleDataIndex = SCHEDULE_DATA.findIndex(d => d.day === days[dayIndex]);
      const shiftsData =
        sampleDataIndex >= 0
          ? SCHEDULE_DATA[sampleDataIndex].shifts
          : [
              { team: 'Team A', hours: 'Off', members: '' },
              { team: 'Team B', hours: 'Off', members: '' },
            ];

      return {
        day: days[dayIndex],
        date: dateNum.toString(),
        shifts: shiftsData,
        isToday: i === 0,
      };
    });
  };

  const currentScheduleData = generateScheduleData();

  // Handle front gross change
  const handleFrontGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedDeal) {
      const value = parseFloat(e.target.value) || 0;
      setSelectedDeal({ ...selectedDeal, frontGross: value });
    }
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (selectedDeal) {
      setSelectedDeal({ ...selectedDeal, status });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeal) {
      setIsSaving(true);
      // Simulate API call
      setTimeout(() => {
        // In a real implementation, this would be a call to update the data in your database

        // For demo purposes, we'll just close the dialog and show success
        setIsSaving(false);
        setIsEditing(false);
        setSelectedDeal(null);

        // You would typically refresh the data here
        console.log('Deal updated:', selectedDeal);
      }, 1000);
    }
  };

  // Get period label for display
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

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimePeriod(e.target.value);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold">Sales Manager Dashboard</h1>
          {/* Best Practices Quote */}
          <div className="bg-blue-50 p-2 rounded-md mt-2 border border-blue-100">
            <p className="text-xs italic text-blue-800">
              <Lightbulb className="h-3 w-3 inline-block mr-1" />
              <strong>Management Tip:</strong>{' '}
              {
                [
                  "Great managers don't just set goals; they remove obstacles for their team members.",
                  'Feedback is a gift. Deliver it with respect, receive it with gratitude.',
                  'Celebrate small wins to build momentum toward big victories.',
                  'Know your numbers, but remember that your people drive those numbers.',
                  'The best way to predict the future is to create it through coaching and development.',
                  'The quality of your leadership determines the quality of your team.',
                  "Your team doesn't care how much you know until they know how much you care.",
                ][new Date().getDay()]
              }
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Header with Month/Year and Time Period Filter */}
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
            <div className="text-lg font-medium text-gray-700">Mike Johnson</div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {dealDataError && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Deal Data Warning</h3>
                <p className="text-sm text-red-700 mt-1">{dealDataError}</p>
                <p className="text-xs text-red-600 mt-1">
                  Showing fallback data. New deals will update automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {dealDataLoading && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-sm text-blue-700">Loading deal data...</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Box 1: Gross Profits */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-green-500" />
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(managerDealData?.metrics?.totalGross || data.totalGross)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Front End Gross:</span>
                <span className="font-medium">
                  {formatCurrency(managerDealData?.metrics?.totalFrontGross || data.frontEndGross)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Finance Gross:</span>
                <span className="font-medium">
                  {formatCurrency(managerDealData?.metrics?.totalBackGross || data.financeGross)}
                </span>
              </div>
            </div>
            <div className="flex items-center pt-2 text-xs">
              <span
                className={`flex items-center ${
                  data.lastMonthComparison.totalGross >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {data.lastMonthComparison.totalGross >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.lastMonthComparison.totalGross)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Box 2: Units Sold with New/Used Breakdown */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Car className="mr-2 h-4 w-4 text-blue-500" />
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {managerDealData?.metrics?.totalDeals || data.totalUnits}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">New Cars:</span>
                <span className="font-medium">
                  {managerDealData?.metrics?.newVehicleDeals || data.newCars}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Used Cars:</span>
                <span className="font-medium">
                  {managerDealData?.metrics?.usedVehicleDeals || data.usedCars}
                </span>
              </div>
            </div>
            <div className="flex items-center pt-2 text-xs">
              <span
                className={`flex items-center ${
                  data.lastMonthComparison.totalUnits >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {data.lastMonthComparison.totalUnits >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.lastMonthComparison.totalUnits)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Box 3: Sales Performance */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-purple-500" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {managerDealData?.metrics?.salesPerformance || data.salesPerformance}%
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-500">
                  Goal: {managerDealData?.metrics?.salesGoal || data.salesGoal} units
                </span>
                <span className="font-medium">
                  {managerDealData?.metrics?.totalDeals || data.totalUnits}/
                  {managerDealData?.metrics?.salesGoal || data.salesGoal}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    (managerDealData?.metrics?.salesPerformance || data.salesPerformance) >= 100
                      ? 'bg-green-500'
                      : (managerDealData?.metrics?.salesPerformance || data.salesPerformance) >= 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      managerDealData?.metrics?.salesPerformance || data.salesPerformance,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="flex items-center pt-2 text-xs">
              <span className="text-gray-500">
                {(managerDealData?.metrics?.salesGoal || data.salesGoal) -
                  (managerDealData?.metrics?.totalDeals || data.totalUnits) >
                0
                  ? `${
                      (managerDealData?.metrics?.salesGoal || data.salesGoal) -
                      (managerDealData?.metrics?.totalDeals || data.totalUnits)
                    } more units to goal`
                  : 'Goal achieved!'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Box 4: Average Per Deal */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calculator className="mr-2 h-4 w-4 text-amber-500" />
              Average Per Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(managerDealData?.metrics?.avgPerDeal || data.avgPerDeal)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Avg Front Gross:</span>
                <span className="font-medium">{formatCurrency(data.avgFrontGross)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Avg F&I Gross:</span>
                <span className="font-medium">{formatCurrency(data.avgFinanceGross)}</span>
              </div>
            </div>
            <div className="flex items-center pt-2 text-xs">
              <span
                className={`flex items-center ${
                  data.lastMonthComparison.avgPerDeal >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {data.lastMonthComparison.avgPerDeal >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(data.lastMonthComparison.avgPerDeal)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add schedule box before the leaderboard */}
      <div className="mb-6">
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="py-2 px-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium flex items-center">
                <CalendarClock className="mr-2 h-4 w-4 text-indigo-500" />
                Team Schedule
              </CardTitle>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">This Week</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-2 px-0 overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-7 text-center">
                {currentScheduleData.map((dayData, index) => (
                  <div
                    key={index}
                    className={`p-2 ${
                      dayData.isToday ? 'bg-blue-50 border-b-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-xs text-gray-800">
                      {dayData.day.substring(0, 3)}{' '}
                      <span className="text-gray-500">{dayData.date}</span>
                    </div>

                    <div className="mt-1 space-y-2">
                      {dayData.shifts.map((shift, shiftIndex) => (
                        <div key={shiftIndex} className="text-xs">
                          {shift.hours !== 'Off' ? (
                            <>
                              <div className="font-medium text-blue-600">{shift.team}</div>
                              <div className="text-gray-700">{shift.hours}</div>
                              {shift.members && (
                                <div className="text-gray-500 text-[10px]">{shift.members}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 italic">{shift.team}: Off</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>The Das Board</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sortable Header - Performance View */}
            <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1 overflow-x-auto">
              <div className="w-10 text-center bg-gray-600 py-2 rounded-l-md">#</div>
              <div className="w-40 flex-shrink-0 bg-gray-600 py-2 px-2">Salesperson</div>
              <div className="w-28 text-center bg-purple-600 py-2 flex items-center justify-center cursor-pointer hover:bg-purple-700">
                PVR <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-36 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                Total Gross <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                Avg/Mo <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-500 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-600">
                Last Mo <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                YTD <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-500 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-600">
                Annual <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-24 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                New <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-24 text-center bg-amber-600 py-2 flex items-center justify-center cursor-pointer hover:bg-amber-700">
                Used <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-36 text-right bg-indigo-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-indigo-700 font-semibold rounded-r-md">
                Current Month <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </div>

            {/* Leaderboard Entries */}
            <div className="overflow-x-auto">
              {[
                {
                  name: 'Sarah Johnson',
                  units: 14,
                  frontGross: 18200,
                  backGross: 14300,
                  totalGross: 32500,
                  avgMonth: 12,
                  lastMonth: 15,
                  ytd: 82,
                  annualPace: 144,
                  newUnits: 9,
                  usedUnits: 5,
                  pvr: 2321,
                },
                {
                  name: 'Michael Chen',
                  units: 12,
                  frontGross: 16400,
                  backGross: 12500,
                  totalGross: 28900,
                  avgMonth: 10,
                  lastMonth: 11,
                  ytd: 65,
                  annualPace: 120,
                  newUnits: 7,
                  usedUnits: 5,
                  pvr: 2408,
                },
                {
                  name: 'David Rodriguez',
                  units: 11,
                  frontGross: 14800,
                  backGross: 11600,
                  totalGross: 26400,
                  avgMonth: 9,
                  lastMonth: 10,
                  ytd: 58,
                  annualPace: 108,
                  newUnits: 4,
                  usedUnits: 7,
                  pvr: 2400,
                },
                {
                  name: 'Amanda Williams',
                  units: 9,
                  frontGross: 11900,
                  backGross: 9800,
                  totalGross: 21700,
                  avgMonth: 8,
                  lastMonth: 7,
                  ytd: 48,
                  annualPace: 96,
                  newUnits: 5,
                  usedUnits: 4,
                  pvr: 2411,
                },
                {
                  name: 'Robert Johnson',
                  units: 8,
                  frontGross: 10500,
                  backGross: 8700,
                  totalGross: 19200,
                  avgMonth: 7,
                  lastMonth: 9,
                  ytd: 42,
                  annualPace: 84,
                  newUnits: 3,
                  usedUnits: 5,
                  pvr: 2400,
                },
              ].map((person, index) => (
                <div
                  key={index}
                  className={`flex items-center py-2 px-1 ${
                    index !== 4 ? 'border-b' : ''
                  } border-gray-100 text-sm hover:bg-gray-50`}
                >
                  <div className="w-10 flex justify-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center
                      ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-600'
                          : index === 1
                          ? 'bg-gray-100 text-gray-600'
                          : index === 2
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-50 text-blue-500'
                      }`}
                    >
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="w-40 flex-shrink-0 font-medium truncate px-2">{person.name}</div>
                  <div className="w-28 text-center bg-purple-50">${person.pvr}</div>
                  <div className="w-36 text-center bg-green-50">
                    ${person.totalGross.toLocaleString()}
                  </div>
                  <div className="w-28 text-center bg-blue-50">{person.avgMonth}</div>
                  <div className="w-28 text-center">{person.lastMonth}</div>
                  <div className="w-28 text-center bg-blue-50">{person.ytd}</div>
                  <div className="w-28 text-center">{person.annualPace}</div>
                  <div className="w-24 text-center bg-green-50">{person.newUnits}</div>
                  <div className="w-24 text-center bg-amber-50">{person.usedUnits}</div>
                  <div className="w-36 text-right pr-3">
                    <span className="text-lg font-bold text-indigo-700">{person.units}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 text-center">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View All Salespeople
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/sales-manager/team')}
            >
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/sales-manager/goals')}
            >
              <Target className="mr-2 h-4 w-4" />
              Set Team Goals
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/sales-manager/schedule')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/sales-manager/sales-report')}
            >
              <LineChart className="mr-2 h-4 w-4" />
              Sales Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deals Log - Full Width */}
      <Card className="mb-6 border hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <CardTitle className="text-lg font-medium flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            Deals Log
          </CardTitle>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2">
            View All Deals
          </Button>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          {/* Sample deals - would be fetched from an API in real implementation */}
          <div className="flex">
            <div className="flex-grow overflow-x-auto">
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
                      Customer
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-600">
                      Date
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-indigo-600">
                      N/U/CPO
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-blue-600">
                      Salesperson
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-green-600">
                      Front Gross
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-purple-600">
                      Finance Gross
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-right bg-amber-600">
                      Total Gross
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-600 w-20">
                      Status
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-blue-600 w-20">
                      CSI Follow Up
                    </th>
                    <th className="font-medium text-white py-2 px-2 text-center bg-gray-600 rounded-tr-md">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    managerDealData?.deals || [
                      {
                        id: 'D12345',
                        stockNumber: 'S9876',
                        customer: 'Johnson',
                        vehicleType: 'N', // N for New
                        date: '06/12/2023',
                        salesperson: 'Sarah Johnson',
                        initials: 'SJ',
                        frontGross: 1850,
                        financeGross: 1200,
                        totalGross: 3050,
                        status: 'Funded',
                        csiFollowUp: true,
                      },
                      {
                        id: 'D12346',
                        stockNumber: 'S9452',
                        customer: 'Williams',
                        vehicleType: 'U', // U for Used
                        date: '06/10/2023',
                        salesperson: 'Michael Chen',
                        initials: 'MC',
                        frontGross: 1300,
                        financeGross: 950,
                        totalGross: 2250,
                        status: 'Pending',
                        csiFollowUp: false,
                      },
                      {
                        id: 'D12347',
                        stockNumber: 'S8765',
                        customer: 'Martinez',
                        vehicleType: 'C', // C for CPO
                        date: '06/09/2023',
                        salesperson: 'David Rodriguez',
                        initials: 'DR',
                        frontGross: 2100,
                        financeGross: 1400,
                        totalGross: 3500,
                        status: 'Funded',
                        csiFollowUp: true,
                      },
                      {
                        id: 'D12348',
                        stockNumber: 'S7620',
                        customer: 'Taylor',
                        vehicleType: 'U',
                        date: '06/07/2023',
                        salesperson: 'Amanda Williams',
                        initials: 'AW',
                        frontGross: 1750,
                        financeGross: 1050,
                        totalGross: 2800,
                        status: 'Funded',
                        csiFollowUp: true,
                      },
                      {
                        id: 'D12349',
                        stockNumber: 'S8452',
                        customer: 'Garcia',
                        vehicleType: 'N',
                        date: '06/05/2023',
                        salesperson: 'Robert Johnson',
                        initials: 'RJ',
                        frontGross: 1500,
                        financeGross: 1100,
                        totalGross: 2600,
                        status: 'Pending',
                        csiFollowUp: false,
                      },
                      {
                        id: 'D12350',
                        stockNumber: 'S9123',
                        customer: 'Miller',
                        vehicleType: 'C',
                        date: '06/04/2023',
                        salesperson: 'Sarah Johnson',
                        initials: 'SJ',
                        frontGross: 2250,
                        financeGross: 1320,
                        totalGross: 3570,
                        status: 'Funded',
                        csiFollowUp: true,
                      },
                      {
                        id: 'D12351',
                        stockNumber: 'S7845',
                        customer: 'Davis',
                        vehicleType: 'U',
                        date: '06/03/2023',
                        salesperson: 'Michael Chen',
                        initials: 'MC',
                        frontGross: 1420,
                        financeGross: 980,
                        totalGross: 2400,
                        status: 'Funded',
                        csiFollowUp: false,
                      },
                      {
                        id: 'D12352',
                        stockNumber: 'S8932',
                        customer: 'Wilson',
                        vehicleType: 'N',
                        date: '06/02/2023',
                        salesperson: 'David Rodriguez',
                        initials: 'DR',
                        frontGross: 1950,
                        financeGross: 1250,
                        totalGross: 3200,
                        status: 'Unwound',
                        csiFollowUp: false,
                      },
                      {
                        id: 'D12353',
                        stockNumber: 'S7534',
                        customer: 'Thompson',
                        vehicleType: 'C',
                        date: '06/01/2023',
                        salesperson: 'Amanda Williams',
                        initials: 'AW',
                        frontGross: 1650,
                        financeGross: 1020,
                        totalGross: 2670,
                        status: 'Funded',
                        csiFollowUp: true,
                      },
                      {
                        id: 'D12354',
                        stockNumber: 'S8721',
                        customer: 'Anderson',
                        vehicleType: 'N',
                        date: '05/31/2023',
                        salesperson: 'Robert Johnson',
                        initials: 'RJ',
                        frontGross: 2050,
                        financeGross: 1350,
                        totalGross: 3400,
                        status: 'Funded',
                        csiFollowUp: true,
                      },
                    ]
                  )
                    .slice(0, 10)
                    .map((deal, index) => {
                      // Status badge colors
                      const statusColor =
                        (deal.status || deal.dealStatus) === 'Funded'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : (deal.status || deal.dealStatus) === 'Unwound'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200';

                      // Calculate the reverse index (10, 9, 8, ..., 1)
                      const reverseIndex = 10 - index;

                      return (
                        <tr
                          key={deal.id || deal.dealNumber}
                          className={`border-b ${
                            index % 2 === 1 ? 'bg-gray-50' : ''
                          } hover:bg-blue-50`}
                        >
                          <td className="py-2 px-2 text-center font-medium">{reverseIndex}</td>
                          <td className="py-2 pl-4 pr-2 text-left font-medium text-blue-600">
                            {deal.dealNumber || deal.id}
                          </td>
                          <td className="py-2 px-2 text-left">{deal.stockNumber}</td>
                          <td className="py-2 px-2 text-left font-medium">
                            {deal.customer || deal.lastName}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-600">
                            {deal.date || deal.dealDate}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                deal.vehicleType === 'N'
                                  ? 'bg-green-100 text-green-800'
                                  : deal.vehicleType === 'U' || deal.vehicleType === 'C'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {deal.vehicleType || 'U'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-medium">
                            {deal.initials ||
                              deal.salesperson?.substring(0, 2)?.toUpperCase() ||
                              'SP'}
                          </td>
                          <td className="py-2 px-2 text-right">
                            ${(deal.frontGross || deal.frontEndGross || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right">
                            $
                            {(
                              deal.financeGross ||
                              deal.backEndGross ||
                              deal.profit ||
                              0
                            ).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-green-600">
                            $
                            {(
                              deal.totalGross ||
                              (deal.frontGross || deal.frontEndGross || 0) +
                                (deal.financeGross || deal.backEndGross || deal.profit || 0)
                            ).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              {deal.status || deal.dealStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={deal.csiFollowUp || false}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Dialog
                              open={isEditing && selectedDeal?.id === (deal.id || deal.dealNumber)}
                              onOpenChange={open => {
                                if (!open) setIsEditing(false);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setSelectedDeal({
                                      id: deal.id || deal.dealNumber,
                                      frontGross: deal.frontGross || deal.frontEndGross || 0,
                                      status: deal.status || deal.dealStatus || 'Pending',
                                    });
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Deal</DialogTitle>
                                  <DialogDescription>
                                    Update deal information for {deal.customer || deal.lastName}
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="frontGross">Front End Gross ($)</Label>
                                      <Input
                                        id="frontGross"
                                        type="number"
                                        value={selectedDeal?.frontGross || 0}
                                        onChange={handleFrontGrossChange}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="status">Deal Status</Label>
                                      <Select
                                        value={selectedDeal?.status || 'Pending'}
                                        onValueChange={handleStatusChange}
                                      >
                                        <SelectTrigger id="status">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Pending">Pending</SelectItem>
                                          <SelectItem value="Funded">Funded</SelectItem>
                                          <SelectItem value="Unwound">Unwound</SelectItem>
                                        </SelectContent>
                                      </Select>

                                      {selectedDeal?.status === 'Unwound' && (
                                        <p className="text-xs text-red-500 mt-1">
                                          Warning: Unwinding a deal may affect salesperson
                                          commissions.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit" disabled={isSaving}>
                                      {isSaving ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Saving
                                        </>
                                      ) : (
                                        <>
                                          <Save className="mr-2 h-4 w-4" />
                                          Save Changes
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
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
                    <td className="py-2 px-2 text-right">
                      $
                      {[1850, 1300, 2100, 1750, 1500, 2250, 1420, 1950, 1650, 2050]
                        .reduce((sum, value) => sum + value, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right">
                      $
                      {[1200, 950, 1400, 1050, 1100, 1320, 980, 1250, 1020, 1350]
                        .reduce((sum, value) => sum + value, 0)
                        .toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-green-600 font-medium">
                      $
                      {[3050, 2250, 3500, 2800, 2600, 3570, 2400, 3200, 2670, 3400]
                        .reduce((sum, value) => sum + value, 0)
                        .toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              {/* Information about current page */}
              <div className="flex justify-between items-center px-4 py-3 border-t">
                <div className="text-sm text-gray-500">Showing deals 1-10 of 45</div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
            {/* Scroll navigation buttons on the right */}
            <div className="w-12 border-l bg-gray-50 flex flex-col items-center justify-between py-4">
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-center py-2">10/45</div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesperson</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Target Goal</TableHead>
                <TableHead className="text-center">Sold (MTD)</TableHead>
                <TableHead className="text-right">Avg Front</TableHead>
                <TableHead className="text-right">Avg Back End</TableHead>
                <TableHead className="text-center">CSI Follow Up</TableHead>
                <TableHead className="text-right">% of Goal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  name: 'Sarah Johnson',
                  initials: 'SJ',
                  team: 'A',
                  targetGoal: 30,
                  actualDeals: 24,
                  avgFront: 1850,
                  avgBackEnd: 1200,
                  csiFollowUp: 92,
                  percentGoal: 80,
                },
                {
                  name: 'Michael Chen',
                  initials: 'MC',
                  team: 'A',
                  targetGoal: 25,
                  actualDeals: 20,
                  avgFront: 1320,
                  avgBackEnd: 980,
                  csiFollowUp: 85,
                  percentGoal: 80,
                },
                {
                  name: 'David Rodriguez',
                  initials: 'DR',
                  team: 'A',
                  targetGoal: 22,
                  actualDeals: 18,
                  avgFront: 1950,
                  avgBackEnd: 1250,
                  csiFollowUp: 75,
                  percentGoal: 82,
                },
                {
                  name: 'Amanda Williams',
                  initials: 'AW',
                  team: 'B',
                  targetGoal: 20,
                  actualDeals: 16,
                  avgFront: 1650,
                  avgBackEnd: 1020,
                  csiFollowUp: 95,
                  percentGoal: 80,
                },
                {
                  name: 'Robert Johnson',
                  initials: 'RJ',
                  team: 'B',
                  targetGoal: 18,
                  actualDeals: 15,
                  avgFront: 2050,
                  avgBackEnd: 1350,
                  csiFollowUp: 88,
                  percentGoal: 83,
                },
              ].map((person, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        person.team === 'A'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      Team {person.team}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{person.targetGoal}</TableCell>
                  <TableCell className="text-center">{person.actualDeals}</TableCell>
                  <TableCell className="text-right">${person.avgFront.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    ${person.avgBackEnd.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          person.csiFollowUp >= 90
                            ? 'bg-green-100 text-green-800'
                            : person.csiFollowUp >= 80
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {person.csiFollowUp}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <div className="w-16 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            person.percentGoal >= 90
                              ? 'bg-green-500'
                              : person.percentGoal >= 70
                              ? 'bg-blue-500'
                              : person.percentGoal >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(person.percentGoal, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{person.percentGoal}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Placeholder components for the routes
function TeamLeaderboard() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Team Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The team leaderboard feature is coming soon.</p>
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

function TeamAnalytics() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Team Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The team analytics feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function GoalTracking() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Goal Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The goal tracking feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

export default SalesManagerDashboard;
