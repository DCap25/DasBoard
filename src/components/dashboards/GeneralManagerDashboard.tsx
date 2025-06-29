import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import {
  Activity,
  Briefcase,
  DollarSign,
  LineChart,
  TrendingUp,
  Users,
  Car,
  Target,
  Calculator,
  ArrowUp,
  ArrowDown,
  Calendar,
  Building,
  ChevronDown,
  BarChart3,
  Percent,
  FileText,
  ArrowUpDown,
  User,
} from 'lucide-react';

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

export default function GeneralManagerDashboard() {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState<string>('this-month');
  const [data, setData] = useState(dealershipData);

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
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300 pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-white">
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
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300 pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-white">
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
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300 pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-white">
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
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300 pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-white">
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
        {/* Sales Person Das Board (Left) */}
        <Card className="col-span-12 md:col-span-6">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
            <CardTitle className="text-white text-lg font-semibold flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Sales Person Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-gray-50 border-r border-gray-200 py-2 rounded-l-md">#</div>
                  <div className="w-40 flex-shrink-0 bg-blue-100 border-r border-blue-200 py-2 px-2">Salesperson</div>
                  <div className="w-28 text-center bg-blue-200 border-r border-blue-300 py-2 flex items-center justify-center">
                    MTD <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-300 border-r border-blue-400 py-2 flex items-center justify-center">
                    Gross <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-blue-400 border-r border-blue-500 py-2 flex items-center justify-center rounded-r-md">
                    CSI <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </div>

                {/* Sample data rows */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex items-center py-2 px-1 ${
                      index !== 5 ? 'border-b' : ''
                    } border-gray-100 text-sm hover:bg-gray-50`}
                  >
                    <div className="w-10 flex justify-center">{index + 1}</div>
                    <div className="w-40 flex-shrink-0 font-medium px-2">
                      {['Sarah J', 'Michael C', 'David R', 'Amanda W', 'Robert J', 'Lisa T'][index]}
                    </div>
                    <div className="w-28 text-center">{[14, 12, 10, 9, 8, 7][index]}</div>
                    <div className="w-28 text-center">
                      ${[32500, 28900, 26400, 24700, 21800, 19500][index].toLocaleString()}
                    </div>
                    <div className="w-24 text-center">{[92, 88, 90, 85, 91, 87][index]}%</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Das Board (Right) */}
        <Card className="col-span-12 md:col-span-6">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
            <CardTitle className="text-white text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Finance Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-white border-r border-blue-500 border-r border-blue-600 py-2 rounded-l-md">#</div>
                  <div className="w-40 flex-shrink-0 bg-blue-600 border-r border-blue-700 py-2 px-2">Product</div>
                  <div className="w-28 text-center bg-blue-700 border-r border-blue-800 py-2 flex items-center justify-center">
                    Penetration <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-28 text-center bg-blue-800 border-r border-blue-900 py-2 flex items-center justify-center">
                    Profit <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="w-24 text-center bg-blue-900 border-r border-slate-100 py-2 flex items-center justify-center rounded-r-md">
                    Avg <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </div>

                {/* Sample data rows */}
                {[
                  { name: 'VSC', penetration: '62%', profit: 14300, avg: 1250 },
                  { name: 'GAP', penetration: '58%', profit: 9800, avg: 850 },
                  { name: 'T&W Bundle', penetration: '42%', profit: 7500, avg: 900 },
                  { name: 'Paint & Fabric', penetration: '38%', profit: 6200, avg: 820 },
                  { name: 'PPM', penetration: '35%', profit: 5400, avg: 750 },
                  { name: 'Key/Theft', penetration: '24%', profit: 3200, avg: 680 },
                ].map((product, index) => (
                  <div
                    key={index}
                    className={`flex items-center py-2 px-1 ${
                      index !== 5 ? 'border-b' : ''
                    } border-gray-100 text-sm hover:bg-gray-50`}
                  >
                    <div className="w-10 flex justify-center">{index + 1}</div>
                    <div className="w-40 flex-shrink-0 font-medium px-2">{product.name}</div>
                    <div className="w-28 text-center">{product.penetration}</div>
                    <div className="w-28 text-center">${product.profit.toLocaleString()}</div>
                    <div className="w-24 text-center">${product.avg}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Manager Das Board (Full width) */}
        <Card className="col-span-12">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600 border-b border-gray-300">
            <CardTitle className="text-white text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 text-purple-600 mr-2" />
              Sales Manager Das Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                  <div className="w-10 text-center bg-slate-600 border-r border-slate-700 py-2 rounded-l-md">#</div>
                  <div className="w-40 flex-shrink-0 bg-slate-700 border-r border-slate-800 py-2 px-2">Manager</div>
                  <div className="w-28 text-center bg-slate-800 border-r border-slate-900 py-2">Team Units</div>
                  <div className="w-28 text-center bg-slate-900 border-r border-gray-700 py-2">Total Gross</div>
                  <div className="w-28 text-center bg-gray-700 border-r border-gray-800 py-2">Closing %</div>
                  <div className="w-28 text-center bg-gray-800 border-r border-gray-900 py-2">Avg Front</div>
                  <div className="w-28 text-center bg-gray-900 py-2 rounded-r-md">Avg Back</div>
                </div>

                {/* Sample data rows */}
                {[
                  {
                    name: 'John Smith',
                    units: 45,
                    gross: 84500,
                    closing: 32,
                    avgFront: 1250,
                    avgBack: 950,
                  },
                  {
                    name: 'Jessica Lee',
                    units: 41,
                    gross: 78900,
                    closing: 30,
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
                    <div className="w-28 text-center">{manager.closing}%</div>
                    <div className="w-28 text-center">${manager.avgFront}</div>
                    <div className="w-28 text-center">${manager.avgBack}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance (moved down) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <Card className="col-span-4">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-gray-600">
            <CardTitle className="text-white">Department Performance</CardTitle>
            <CardDescription>Overall business metrics for the current month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Sales</div>
                <div className="flex-1">
                  <div className="bg-blue-600 h-2 w-[85%] rounded-full"></div>
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
                <div className="w-[100px] text-sm">Service</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[78%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">78%</div>
              </div>
              <div className="flex items-center">
                <div className="w-[100px] text-sm">Parts</div>
                <div className="flex-1">
                  <div className="bg-gray-600 h-2 w-[68%] rounded-full"></div>
                </div>
                <div className="w-[50px] text-right text-sm">68%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
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
}
