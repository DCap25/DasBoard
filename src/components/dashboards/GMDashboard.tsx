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
  Edit,
  Save,
  Loader2,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Add a type for editable deal
interface EditableDeal {
  id: string;
  frontGross: number;
  status: string;
}

const GMDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const [timePeriod, setTimePeriod] = useState<string>('this-month');
  
  // State for Deals Log editing
  const [selectedDeal, setSelectedDeal] = useState<EditableDeal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // Helper functions for Deals Log
  const handleFrontGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedDeal) {
      const value = parseFloat(e.target.value) || 0;
      setSelectedDeal({ ...selectedDeal, frontGross: value });
    }
  };

  const handleStatusChange = (status: string) => {
    if (selectedDeal) {
      setSelectedDeal({ ...selectedDeal, status });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeal) {
      setIsSaving(true);
      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        setSelectedDeal(null);
        console.log('Deal updated:', selectedDeal);
      }, 1000);
    }
  };

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

  return (
    <>
      {/* Standardized Dashboard Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">General Manager Dashboard</h1>
        </div>
        {/* Daily Management Tip */}
        <div className="bg-green-50 p-2 rounded-md border border-green-100 max-w-md mr-64">
          <p className="text-xs italic text-green-800">
            <Lightbulb className="h-3 w-3 inline-block mr-1" />
            <strong>Daily Tip:</strong>{' '}
            {
              [
                'Lead by example - your team watches everything you do.',
                'Delegate tasks, but never delegate responsibility.',
                'Focus on developing people, not just managing processes.',
                'Celebrate wins publicly, address issues privately.',
                'Data drives decisions, but intuition guides leadership.',
                'Invest time in your top performers - they set the standard.',
                'Listen to your frontline staff - they know your customers best.',
              ][new Date().getDay()]
            }
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
        <Card className="border-l-4 border-l-blue-500">
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
        <Card className="border-l-4 border-l-blue-500">
          <CardContent>
            <div className="text-2xl font-bold">{data.salesPerformance}%</div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-500">Goal: {data.salesGoal} units</span>
                <span className="font-medium">
                  {data.totalUnits}/{data.salesGoal}
                </span>
              </div>
              <div className="h-2 w-full bg-white rounded-full">
                <div
                  className={`h-full rounded-full ${
                    data.salesPerformance >= 100
                      ? 'bg-white border-r border-blue-500'
                      : data.salesPerformance >= 80
                      ? 'bg-blue-500'
                      : 'bg-blue-500'
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
        <Card className="border-l-4 border-l-blue-500">
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
        <Card className="col-span-12 md:col-span-4">
          <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg">
            <CardTitle className="text-black text-base font-medium flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              Finance Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Sortable Header */}
                <div className="flex items-center text-sm font-semibold text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-blue-500 border-r border-blue-600 py-2 rounded-l-md">
                    #
                  </div>
                  <div className="w-36 flex-shrink-0 bg-gray-700 text-white border-r border-gray-800 py-2 px-2">
                    F&I Manager
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    PVR <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    VSC % <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    PPM % <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    PPD <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-36 text-right bg-blue-500 border-r border-blue-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-blue-700 font-semibold rounded-r-md">
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
                              : 'bg-white border-r border-gray-200 text-blue-500'
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

        {/* Department Performance */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg">
            <CardTitle className="text-black text-base font-medium">Department Performance - % of Monthly Goal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Sales</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[85%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">85%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Finance</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[92%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">92%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">New</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[78%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">78%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Used</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[68%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">68%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">CPO</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[72%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">72%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Manager Das Board */}
        <Card className="col-span-12 md:col-span-4">
          <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg">
            <CardTitle className="text-black text-base font-medium flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              Sales Manager Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="flex items-center text-sm font-semibold text-white border-b py-2 px-1">
                  <div className="flex-1 text-center bg-blue-500 border-r border-blue-600 py-2 rounded-l-md">
                    #
                  </div>
                  <div className="flex-[3] bg-gray-700 text-white border-r border-gray-800 py-2 px-2">
                    Manager
                  </div>
                  <div className="flex-[2] text-center bg-blue-500 border-r border-blue-600 py-2">
                    Total Deals
                  </div>
                  <div className="flex-1 text-center bg-blue-500 border-r border-blue-600 py-2">
                    New
                  </div>
                  <div className="flex-1 text-center bg-blue-500 border-r border-blue-600 py-2">
                    U/CPO
                  </div>
                  <div className="flex-[2] text-center bg-blue-500 border-r border-blue-600 py-2">
                    Avg Front
                  </div>
                  <div className="flex-[2] text-center bg-blue-500 border-r border-blue-600 py-2">
                    Avg Back
                  </div>
                  <div className="flex-[2] text-center bg-blue-500 border-r border-blue-600 py-2 rounded-r-md">
                    Total Gross
                  </div>
                </div>

                {/* Sample data rows */}
                <div>
                {[
                  {
                    name: 'John Smith',
                    totalDeals: 45,
                    newDeals: 28,
                    usedDeals: 17,
                    gross: 84500,
                    avgFront: 1250,
                    avgBack: 950,
                  },
                  {
                    name: 'Jessica Lee',
                    totalDeals: 41,
                    newDeals: 25,
                    usedDeals: 16,
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
                    <div className="flex-1 flex justify-center">{index + 1}</div>
                    <div className="flex-[3] font-medium px-2">{manager.name}</div>
                    <div className="flex-[2] text-center">{manager.totalDeals}</div>
                    <div className="flex-1 text-center">{manager.newDeals}</div>
                    <div className="flex-1 text-center">{manager.usedDeals}</div>
                    <div className="flex-[2] text-center">${manager.avgFront}</div>
                    <div className="flex-[2] text-center">${manager.avgBack}</div>
                    <div className="flex-[2] text-center">${manager.gross.toLocaleString()}</div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Person Das Board */}
        <Card className="col-span-8">
          <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg">
            <CardTitle className="text-black text-base font-medium flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              The Sales DAS Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Sortable Header - Performance View */}
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-blue-500 border-r border-blue-600 py-2 rounded-l-md">
                    #
                  </div>
                  <div className="w-40 flex-shrink-0 bg-gray-700 text-white border-r border-gray-800 py-2 px-2">
                    Salesperson
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    PVR <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-36 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    Total Gross <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    Avg/Mo <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    Last Mo <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    YTD <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    Annual <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    New <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-blue-500 border-r border-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    Used <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-36 text-right bg-blue-500 border-r border-blue-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-blue-700 font-semibold rounded-r-md">
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
                              : 'bg-white border-r border-gray-200 text-blue-500'
                          }`}
                        >
                          <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="w-40 flex-shrink-0 font-medium truncate px-2">
                        {person.name}
                      </div>
                      <div className="w-28 text-center">${person.pvr}</div>
                      <div className="w-36 text-center">
                        ${person.totalGross.toLocaleString()}
                      </div>
                      <div className="w-28 text-center">{person.avgMonth}</div>
                      <div className="w-28 text-center">{person.lastMonth}</div>
                      <div className="w-28 text-center">{person.ytd}</div>
                      <div className="w-28 text-center">{person.annualPace}</div>
                      <div className="w-24 text-center">{person.newUnits}</div>
                      <div className="w-24 text-center">{person.usedUnits}</div>
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

        {/* Quick Actions */}
        <Card className="col-span-4">
          <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg">
            <CardTitle className="text-black text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
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

      {/* Deals Log - Full Width */}
      <Card className="mb-6 border hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center text-black">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            Deals Log
          </CardTitle>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2">
            View All Deals
          </Button>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          <div className="flex">
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-sm">
                    <th className="font-semibold text-white py-2 pl-3 text-center bg-blue-500 w-12 border-r border-gray-600 rounded-tl-md">
                      #
                    </th>
                    <th className="font-semibold text-white py-2 pl-4 pr-2 text-left bg-blue-500 border-r border-gray-600">
                      Deal #
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-left bg-blue-500 border-r border-gray-600">
                      Stock #
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-left bg-blue-500 border-r border-gray-600">
                      Customer
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                      Date
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                      N/U/CPO
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                      Salesperson
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-right bg-blue-500 border-r border-gray-600">
                      Front Gross
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-right bg-blue-500 border-r border-gray-600">
                      Finance Gross
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-right bg-blue-500 border-r border-gray-600">
                      Total Gross
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600 w-20">
                      Status
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600 w-20">
                      CSI Follow Up
                    </th>
                    <th className="font-semibold text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600 rounded-tr-md">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 'D12345',
                      stockNumber: 'S9876',
                      customer: 'Johnson',
                      vehicleType: 'N',
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
                      vehicleType: 'U',
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
                      vehicleType: 'C',
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
                  ].slice(0, 10).map((deal, index) => {
                    const statusColor =
                      deal.status === 'Funded'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : deal.status === 'Unwound'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200';

                    const reverseIndex = 10 - index;

                    return (
                      <tr
                        key={deal.id}
                        className={`border-b ${
                          index % 2 === 1 ? 'bg-gray-50' : ''
                        } hover:bg-blue-50`}
                      >
                        <td className="py-2 px-2 text-center font-medium">{reverseIndex}</td>
                        <td className="py-2 pl-4 pr-2 text-left font-medium text-blue-600">
                          {deal.id}
                        </td>
                        <td className="py-2 px-2 text-left">{deal.stockNumber}</td>
                        <td className="py-2 px-2 text-left font-medium">
                          {deal.customer}
                        </td>
                        <td className="py-2 px-2 text-center text-gray-600">
                          {deal.date}
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
                            {deal.vehicleType}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-medium">
                          {deal.initials}
                        </td>
                        <td className="py-2 px-2 text-right">
                          ${deal.frontGross.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right">
                          ${deal.financeGross.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-green-600">
                          ${deal.totalGross.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            {deal.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={deal.csiFollowUp}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Dialog
                            open={isEditing && selectedDeal?.id === deal.id}
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
                                    id: deal.id,
                                    frontGross: deal.frontGross,
                                    status: deal.status,
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
                                  Update deal information for {deal.customer}
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
            <div className="w-12 border-l bg-gray-600 flex flex-col items-center justify-between py-4">
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

    </>
  );
};

export default GMDashboard;
