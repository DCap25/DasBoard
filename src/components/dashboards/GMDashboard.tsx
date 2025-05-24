import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BarChart,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  CalendarClock,
  Landmark,
  PieChart,
  Target,
  Calculator,
  ArrowUp,
  ArrowDown,
  Calendar,
  Building,
  ChevronDown,
  BarChart3,
  Percent,
  ArrowUpDown,
  User,
  Activity,
  Briefcase,
  LineChart,
  Info,
  Trophy,
} from 'lucide-react';

const GMDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const [timePeriod, setTimePeriod] = useState<string>('this-month');

  // Sample data for dashboard
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

  const [data, setData] = useState(dealershipData);

  useEffect(() => {
    console.log('[GMDashboard] Rendering general manager dashboard', {
      userId: user?.id,
      role,
      dealershipId,
      timestamp: new Date().toISOString(),
    });

    // Cleanup function
    return () => {
      console.log('[GMDashboard] Unmounting general manager dashboard');
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

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold">General Manager Dashboard</h1>
        </div>
      </div>

      {/* Dashboard Header with Month/Year */}
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
            <p className="text-gray-500">GM Performance Dashboard</p>
          </div>

          <div className="flex items-center">
            <div className="text-lg font-medium text-gray-700">
              {user?.email || 'General Manager'}
            </div>
          </div>
        </div>
      </div>

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
            <div className="text-2xl font-bold">{formatCurrency(data.totalGross)}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Front End Gross:</span>
                <span className="font-medium">{formatCurrency(data.frontEndGross)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Finance Gross:</span>
                <span className="font-medium">{formatCurrency(data.financeGross)}</span>
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
            <div className="text-2xl font-bold">{data.totalUnits}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">New Cars:</span>
                <span className="font-medium">{data.newCars}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Used Cars:</span>
                <span className="font-medium">{data.usedCars}</span>
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
            <div className="text-2xl font-bold">{data.salesPerformance}%</div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-500">Goal: {data.salesGoal} units</span>
                <span className="font-medium">
                  {data.totalUnits}/{data.salesGoal}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    data.salesPerformance >= 100
                      ? 'bg-green-500'
                      : data.salesPerformance >= 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(data.salesPerformance, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center pt-2 text-xs">
              <span className="text-gray-500">
                {data.salesGoal - data.totalUnits > 0
                  ? `${data.salesGoal - data.totalUnits} more units to goal`
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
            <div className="text-2xl font-bold">{formatCurrency(data.avgPerDeal)}</div>
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

      {/* Dashboards Section */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Finance Das Board (Left) */}
        <Card className="col-span-12 md:col-span-6">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-lg font-semibold text-green-700 flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              Finance Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Sortable Header */}
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-gray-600 py-2 rounded-l-md">#</div>
                  <div className="w-36 flex-shrink-0 bg-gray-600 py-2 px-2">F&I Manager</div>
                  <div className="w-28 text-center bg-purple-600 py-2 flex items-center justify-center cursor-pointer hover:bg-purple-700">
                    PVR <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-teal-600 py-2 flex items-center justify-center cursor-pointer hover:bg-teal-700">
                    VSC % <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-purple-600 py-2 flex items-center justify-center cursor-pointer hover:bg-purple-700">
                    PPM % <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-pink-600 py-2 flex items-center justify-center cursor-pointer hover:bg-pink-700">
                    PPD <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-36 text-right bg-indigo-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-indigo-700 font-semibold rounded-r-md">
                    Profit <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                </div>

                {/* Leaderboard Entries */}
                <div>
                  {[
                    {
                      name: 'Ashley Rodriguez',
                      pvr: 2650,
                      vscPen: 68,
                      ppmPen: 54,
                      ppd: 3.2,
                      profit: 143200,
                    },
                    {
                      name: 'Michael Parker',
                      pvr: 2450,
                      vscPen: 65,
                      ppmPen: 48,
                      ppd: 2.9,
                      profit: 127500,
                    },
                    {
                      name: 'Sophia Martinez',
                      pvr: 2320,
                      vscPen: 61,
                      ppmPen: 45,
                      ppd: 2.7,
                      profit: 115300,
                    },
                    {
                      name: 'James Wilson',
                      pvr: 2200,
                      vscPen: 58,
                      ppmPen: 42,
                      ppd: 2.5,
                      profit: 96500,
                    },
                    {
                      name: 'Emma Johnson',
                      pvr: 2100,
                      vscPen: 55,
                      ppmPen: 38,
                      ppd: 2.3,
                      profit: 84200,
                    },
                  ].map((manager, index) => (
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
                      <div className="w-36 flex-shrink-0 font-medium px-2">{manager.name}</div>
                      <div className="w-28 text-center">${manager.pvr}</div>
                      <div className="w-28 text-center">{manager.vscPen}%</div>
                      <div className="w-28 text-center">{manager.ppmPen}%</div>
                      <div className="w-24 text-center">{manager.ppd}</div>
                      <div className="w-36 text-right pr-3 font-semibold text-green-700">
                        ${manager.profit.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Manager Das Board */}
        <Card className="col-span-12 md:col-span-6">
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="text-lg font-semibold text-purple-700 flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              Sales Manager Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-gray-600 py-2 rounded-l-md">#</div>
                  <div className="w-40 flex-shrink-0 bg-gray-600 py-2 px-2">Manager</div>
                  <div className="w-28 text-center bg-blue-600 py-2">Team Units</div>
                  <div className="w-28 text-center bg-green-600 py-2">Total Gross</div>
                  <div className="w-28 text-center bg-purple-600 py-2">Avg Front</div>
                  <div className="w-28 text-center bg-indigo-600 py-2 rounded-r-md">Avg Back</div>
                </div>

                {/* Sample data rows */}
                {[
                  {
                    name: 'John Smith',
                    units: 45,
                    gross: 84500,
                    avgFront: 1250,
                    avgBack: 950,
                  },
                  {
                    name: 'Jessica Lee',
                    units: 41,
                    gross: 78900,
                    avgFront: 1180,
                    avgBack: 920,
                  },
                ].map((manager, index) => (
                  <div
                    key={index}
                    className={`flex items-center py-2 px-1 ${
                      index !== 1 ? 'border-b' : ''
                    } border-gray-100 text-sm hover:bg-gray-50`}
                  >
                    <div className="w-10 flex justify-center">{index + 1}</div>
                    <div className="w-40 flex-shrink-0 font-medium px-2">{manager.name}</div>
                    <div className="w-28 text-center">{manager.units}</div>
                    <div className="w-28 text-center">${manager.gross.toLocaleString()}</div>
                    <div className="w-28 text-center">${manager.avgFront}</div>
                    <div className="w-28 text-center">${manager.avgBack}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Person Das Board */}
        <Card className="col-span-12">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-lg font-semibold text-blue-700 flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              The Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Sortable Header - Performance View */}
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-gray-600 py-2 rounded-l-md">#</div>
                  <div className="w-40 flex-shrink-0 bg-gray-600 py-2 px-2">Salesperson</div>
                  <div className="w-28 text-center bg-purple-600 py-2 flex items-center justify-center cursor-pointer hover:bg-purple-700">
                    PVR <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-36 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                    Total Gross <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    Avg/Mo <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-600">
                    Last Mo <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    YTD <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-600">
                    Annual <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                    New <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-amber-600 py-2 flex items-center justify-center cursor-pointer hover:bg-amber-700">
                    Used <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-36 text-right bg-indigo-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-indigo-700 font-semibold rounded-r-md">
                    Current Month <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                </div>

                {/* Leaderboard Entries */}
                <div>
                  {[
                    {
                      name: 'Michael Scott',
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
                      name: 'Jim Halpert',
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
                      name: 'Dwight Schrute',
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
                      name: 'Pam Beesly',
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
                      name: 'Stanley Hudson',
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
                      <div className="w-40 flex-shrink-0 font-medium truncate px-2">
                        {person.name}
                      </div>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance (moved down) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Overall business metrics for the current month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Sales</div>
                <div className="flex-1">
                  <div className="bg-blue-500 h-2 w-[85%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">85%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Finance</div>
                <div className="flex-1">
                  <div className="bg-green-500 h-2 w-[92%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">92%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Service</div>
                <div className="flex-1">
                  <div className="bg-amber-500 h-2 w-[78%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">78%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Parts</div>
                <div className="flex-1">
                  <div className="bg-purple-500 h-2 w-[68%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">68%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Dealership Reports
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Staff Management
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Building className="mr-2 h-4 w-4" />
              Inventory Overview
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Financial Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GMDashboard;
