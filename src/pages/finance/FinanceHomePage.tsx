import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ChevronUp,
  ChevronDown,
  BarChart4,
  CreditCard,
  Percent,
  Calendar,
  Filter,
  FileText,
  Trophy,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calculator,
  Target,
  Badge,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

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

// Interface for metrics
interface Metrics {
  mtdRevenue: number;
  dealsProcessed: number;
  productsPerDeal: number;
  pvr: number;
  productMix: {
    extendedWarranty: number;
    gapInsurance: number;
    paintProtection: number;
    tireWheel: number;
    ppm: number;
    other: number;
  };
}

// Time period options
type TimePeriod = 'this-month' | 'last-month' | 'last-quarter' | 'ytd' | 'last-year' | 'custom';

// Add schedule data
// Mock schedule data
const SCHEDULE_DATA = [
  { day: 'Monday', date: '12', shift: 'Off', team: '' },
  { day: 'Tuesday', date: '13', shift: '9am - 6pm', team: 'Team A' },
  { day: 'Wednesday', date: '14', shift: '10am - 7pm', team: 'Team A' },
  { day: 'Thursday', date: '15', shift: '9am - 6pm', team: 'Team A' },
  { day: 'Friday', date: '16', shift: '11am - 8pm', team: 'Team B' },
  { day: 'Saturday', date: '17', shift: '9am - 5pm', team: 'Team B' },
  { day: 'Sunday', date: '18', shift: 'Off', team: '' },
];

const FinanceHomePage: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this-month');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    mtdRevenue: 0,
    dealsProcessed: 0,
    productsPerDeal: 0,
    pvr: 0,
    productMix: {
      extendedWarranty: 0,
      gapInsurance: 0,
      paintProtection: 0,
      tireWheel: 0,
      ppm: 0,
      other: 0,
    },
  });

  // Get current month and year for display
  const getCurrentMonthYear = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get date range based on selected time period
  const getDateRange = (period: TimePeriod) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;

      case 'last-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;

      case 'last-quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), currentQuarter * 3 - 3, 1);
        endDate = new Date(today.getFullYear(), currentQuarter * 3, 0);
        break;

      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;

      case 'last-year':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        break;

      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          endDate = new Date(customDateRange.end);
        }
        break;
    }

    return { startDate, endDate };
  };

  // Get period label for display
  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'this-month':
        return getCurrentMonthYear();
      case 'last-month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'last-quarter':
        const today = new Date();
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const lastQuarterEndMonth = new Date(today.getFullYear(), currentQuarter * 3 - 1, 1);
        return `Q${
          Math.floor(lastQuarterEndMonth.getMonth() / 3) + 1
        } ${lastQuarterEndMonth.getFullYear()}`;
      case 'ytd':
        return `YTD ${new Date().getFullYear()}`;
      case 'last-year':
        return `${new Date().getFullYear() - 1}`;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          return `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(
            customDateRange.end
          ).toLocaleDateString()}`;
        }
        return 'Custom Range';
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as TimePeriod;
    setTimePeriod(newPeriod);
    setShowCustomDatePicker(newPeriod === 'custom');
  };

  // Handle custom date range change
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      filterDealsByDateRange();
    }
  };

  // Load deals from localStorage
  useEffect(() => {
    try {
      const storedDeals = localStorage.getItem('financeDeals');
      if (storedDeals) {
        const parsedDeals = JSON.parse(storedDeals);
        setDeals(parsedDeals);

        // Filter for pending deals
        const pendingDealsFilter = parsedDeals.filter(
          (deal: Deal) =>
            deal.status === 'Pending' ||
            deal.status === 'Bank Approval' ||
            deal.status === 'Pending Documents' ||
            deal.status === 'Contract Review' ||
            deal.status === 'Insurance Verification'
        );
        setPendingDeals(pendingDealsFilter);
      }
    } catch (error) {
      console.error('Error loading deals from localStorage:', error);
    }
  }, []);

  // Filter deals by date range when time period changes
  useEffect(() => {
    filterDealsByDateRange();
  }, [deals, timePeriod, customDateRange]);

  // Filter deals by selected date range
  const filterDealsByDateRange = () => {
    if (!deals.length) return;

    const { startDate, endDate } = getDateRange(timePeriod);

    const filtered = deals.filter(deal => {
      const dealDate = new Date(deal.saleDate);
      return dealDate >= startDate && dealDate <= endDate;
    });

    setFilteredDeals(filtered);
    calculateMetrics(filtered);
  };

  // Calculate metrics based on deals
  const calculateMetrics = (deals: Deal[]) => {
    // Calculate total F&I revenue for the time period
    const totalRevenue = deals.reduce((total, deal) => total + deal.profit, 0);

    // Calculate deals processed in this time period
    const dealsProcessed = deals.length;

    // Calculate average products per deal
    const totalProducts = deals.reduce((total, deal) => total + deal.products.length, 0);
    const productsPerDeal = dealsProcessed > 0 ? totalProducts / dealsProcessed : 0;

    // Calculate PVR (Per Vehicle Retailed)
    const pvr = dealsProcessed > 0 ? totalRevenue / dealsProcessed : 0;

    // Calculate product mix percentages
    let extendedWarrantyCount = 0;
    let gapInsuranceCount = 0;
    let paintProtectionCount = 0;
    let tireWheelCount = 0;
    let ppmCount = 0;
    let otherCount = 0;

    deals.forEach(deal => {
      deal.products.forEach(product => {
        if (product === 'Extended Warranty' || product === 'Vehicle Service Contract (VSC)')
          extendedWarrantyCount++;
        else if (product === 'GAP Insurance') gapInsuranceCount++;
        else if (product === 'Paint Protection' || product === 'Paint and Fabric Protection')
          paintProtectionCount++;
        else if (product === 'Tire & Wheel' || product === 'Tire & Wheel Bundle') tireWheelCount++;
        else if (product === 'PPM' || product === 'PrePaid Maintenance (PPM)') ppmCount++;
        else otherCount++;
      });
    });

    const totalProductCount =
      extendedWarrantyCount +
      gapInsuranceCount +
      paintProtectionCount +
      tireWheelCount +
      ppmCount +
      otherCount;

    // Calculate percentages, handling the case where totalProductCount is 0
    const calculatePercentage = (count: number) =>
      totalProductCount > 0 ? Math.round((count / totalProductCount) * 100) : 0;

    const productMix = {
      extendedWarranty: calculatePercentage(extendedWarrantyCount),
      gapInsurance: calculatePercentage(gapInsuranceCount),
      paintProtection: calculatePercentage(paintProtectionCount),
      tireWheel: calculatePercentage(tireWheelCount),
      ppm: calculatePercentage(ppmCount),
      other: calculatePercentage(otherCount),
    };

    // Update metrics state
    setMetrics({
      mtdRevenue: totalRevenue,
      dealsProcessed,
      productsPerDeal,
      pvr,
      productMix,
    });
  };

  // Helper to highlight today in the schedule
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

  return (
    <>
      {/* Dashboard Header with Month/Year and Time Period Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Empty div to maintain layout spacing */}
            <div></div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {showCustomDatePicker && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  name="start"
                  value={customDateRange.start}
                  onChange={handleCustomDateChange}
                  className="p-2 border rounded-md shadow-sm"
                />
                <span>to</span>
                <input
                  type="date"
                  name="end"
                  value={customDateRange.end}
                  onChange={handleCustomDateChange}
                  className="p-2 border rounded-md shadow-sm"
                />
                <Button size="sm" onClick={applyCustomDateRange}>
                  Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 4 Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                F&I Gross
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.mtdRevenue > 0 ? `$${metrics.mtdRevenue.toLocaleString()}` : 'No data yet'}
              </div>
              {metrics.mtdRevenue > 0 && (
                <div className="flex items-center pt-1 text-green-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">8.2% from previous period</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
                Deals Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.dealsProcessed > 0 ? metrics.dealsProcessed : 'No deals yet'}
              </div>
              {metrics.dealsProcessed > 0 && (
                <div className="flex items-center pt-1 text-green-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">10.5% from previous period</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart4 className="mr-2 h-4 w-4 text-purple-500" />
                Pay Calculator MTD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Math.round(metrics.mtdRevenue * 0.15).toLocaleString()}
              </div>
              {metrics.dealsProcessed > 0 && (
                <div className="flex items-center pt-1 text-green-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">15% of F&I revenue</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Percent className="mr-2 h-4 w-4 text-amber-500" />
                PVR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.dealsProcessed > 0 ? `$${metrics.pvr.toLocaleString()}` : 'No data yet'}
              </div>
              {metrics.dealsProcessed > 0 && (
                <div className="flex items-center pt-1 text-green-500">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">$120 from previous period</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compact Weekly Schedule with left/right navigation */}
        <div>
          <Card className="border hover:shadow-md transition-shadow">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm font-medium flex items-center">
                <CalendarClock className="mr-2 h-4 w-4 text-indigo-500" />
                Finance Schedule
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
                      isToday(day.day) ? 'bg-blue-50 border-b-2 border-blue-500' : ''
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-medium">
                <BarChart4 className="mr-2 h-5 w-5 text-blue-500" />
                F&I Product Mix & Avg. Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.dealsProcessed > 0 ? (
                <div className="space-y-2">
                  {[
                    {
                      name: 'Vehicle Service Contract (VSC)',
                      percent: metrics.productMix.extendedWarranty,
                      value: `$${Math.round(
                        (metrics.mtdRevenue * metrics.productMix.extendedWarranty) /
                          100 /
                          Math.max(
                            1,
                            deals.filter(
                              d =>
                                d.products.includes('Extended Warranty') ||
                                d.products.includes('Vehicle Service Contract (VSC)')
                            ).length
                          )
                      ).toLocaleString()}`,
                      color: 'bg-teal-600',
                    },
                    {
                      name: 'PrePaid Maintenance (PPM)',
                      percent: metrics.productMix.ppm,
                      value: `$${Math.round(
                        (metrics.mtdRevenue * metrics.productMix.ppm) /
                          100 /
                          Math.max(
                            1,
                            deals.filter(
                              d =>
                                d.products.includes('PPM') ||
                                d.products.includes('PrePaid Maintenance (PPM)')
                            ).length
                          )
                      ).toLocaleString()}`,
                      color: 'bg-purple-600',
                    },
                    {
                      name: 'GAP Insurance',
                      percent: metrics.productMix.gapInsurance,
                      value: `$${Math.round(
                        (metrics.mtdRevenue * metrics.productMix.gapInsurance) /
                          100 /
                          Math.max(
                            1,
                            deals.filter(d => d.products.includes('GAP Insurance')).length
                          )
                      ).toLocaleString()}`,
                      color: 'bg-green-600',
                    },
                    {
                      name: 'Paint and Fabric Protection',
                      percent: metrics.productMix.paintProtection,
                      value: `$${Math.round(
                        (metrics.mtdRevenue * metrics.productMix.paintProtection) /
                          100 /
                          Math.max(
                            1,
                            deals.filter(
                              d =>
                                d.products.includes('Paint Protection') ||
                                d.products.includes('Paint and Fabric Protection')
                            ).length
                          )
                      ).toLocaleString()}`,
                      color: 'bg-blue-600',
                    },
                    {
                      name: 'Tire & Wheel Bundle',
                      percent: metrics.productMix.tireWheel,
                      value: `$${Math.round(
                        (metrics.mtdRevenue * metrics.productMix.tireWheel) /
                          100 /
                          Math.max(
                            1,
                            deals.filter(
                              d =>
                                d.products.includes('Tire & Wheel') ||
                                d.products.includes('Tire & Wheel Bundle')
                            ).length
                          )
                      ).toLocaleString()}`,
                      color: 'bg-amber-600',
                    },
                    {
                      name: 'Other Products',
                      percent: metrics.productMix.other,
                      value: `$${Math.round(
                        (metrics.mtdRevenue * metrics.productMix.other) /
                          100 /
                          Math.max(
                            1,
                            deals.filter(
                              d =>
                                !d.products.some(
                                  p =>
                                    p === 'Extended Warranty' ||
                                    p === 'Vehicle Service Contract (VSC)' ||
                                    p === 'GAP Insurance' ||
                                    p === 'Paint Protection' ||
                                    p === 'Paint and Fabric Protection' ||
                                    p === 'Tire & Wheel' ||
                                    p === 'Tire & Wheel Bundle' ||
                                    p === 'PPM' ||
                                    p === 'PrePaid Maintenance (PPM)'
                                )
                            ).length
                          )
                      ).toLocaleString()}`,
                      color: 'bg-gray-600',
                    },
                  ].map((product, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center text-sm">
                          <div className={`w-3 h-3 ${product.color} rounded-full mr-2`}></div>
                          {product.name}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Avg. Profit</div>
                          <div className="font-medium text-sm">{product.value}</div>
                        </div>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full ${product.color}`}
                          style={{ width: `${product.percent}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500">{product.percent}%</div>
                    </div>
                  ))}

                  {/* Add PPD metric at the bottom */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">Products Per Deal (PPD)</div>
                      <div className="font-bold text-lg text-purple-600">
                        {metrics.productsPerDeal.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No F&I product data available yet. Log deals with products to see the mix.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border hover:shadow-md transition-shadow">
            <CardHeader className="py-2 px-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                  Finance Das Board
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-1">
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
                <div className="w-28 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                  GAP % <ChevronDown className="ml-1 h-3 w-3" />
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
                    gapPen: 72,
                    ppmPen: 54,
                    ppd: 3.2,
                    profit: 143200,
                  },
                  {
                    name: 'Michael Parker',
                    pvr: 2450,
                    vscPen: 65,
                    gapPen: 70,
                    ppmPen: 48,
                    ppd: 2.9,
                    profit: 127500,
                  },
                  {
                    name: 'Sophia Martinez',
                    pvr: 2320,
                    vscPen: 61,
                    gapPen: 68,
                    ppmPen: 45,
                    ppd: 2.7,
                    profit: 115300,
                  },
                  {
                    name: 'James Wilson',
                    pvr: 2200,
                    vscPen: 58,
                    gapPen: 65,
                    ppmPen: 42,
                    ppd: 2.5,
                    profit: 96500,
                  },
                  {
                    name: 'Emma Johnson',
                    pvr: 2100,
                    vscPen: 55,
                    gapPen: 62,
                    ppmPen: 38,
                    ppd: 2.4,
                    profit: 89200,
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
                    <div className="w-36 flex-shrink-0 font-medium truncate px-2">
                      {person.name}
                    </div>
                    <div className="w-28 text-center bg-purple-50">
                      ${person.pvr.toLocaleString()}
                    </div>
                    <div className="w-28 text-center bg-teal-50">{person.vscPen}%</div>
                    <div className="w-28 text-center bg-green-50">{person.gapPen}%</div>
                    <div className="w-28 text-center bg-purple-50">{person.ppmPen}%</div>
                    <div className="w-24 text-center bg-pink-50">{person.ppd}</div>
                    <div className="w-36 text-right pr-3">
                      <span className="text-lg font-bold text-green-600">
                        ${person.profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-lg font-medium flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Deals Log
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/finance/deals">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 px-0">
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
                      <th className="font-medium text-white py-2 px-2 text-right bg-teal-600">
                        VSC
                      </th>
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

        {/* Pay Tracker and Goal Tracker Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Pay Tracker */}
          <Card className="border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b bg-gradient-to-r from-green-400 to-teal-500">
              <CardTitle className="text-lg font-medium flex items-center text-white">
                <Calculator className="mr-2 h-5 w-5 text-white" />
                Pay Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-center mb-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${Math.round(metrics.mtdRevenue * 0.25).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Month-to-Date Earnings</div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Base Commission (25%)</span>
                  <span className="text-xs font-medium">
                    ${Math.round(metrics.mtdRevenue * 0.25).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Volume Bonus</span>
                  <span className="text-xs font-medium">
                    ${metrics.dealsProcessed >= 20 ? '500' : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">PPD Bonus</span>
                  <span className="text-xs font-medium">
                    ${metrics.productsPerDeal >= 2.5 ? '300' : '0'}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-700">
                      Potential Monthly Total
                    </span>
                    <span className="text-xs font-bold text-green-600">
                      $
                      {Math.round(
                        metrics.mtdRevenue * 0.25 * 2.2 +
                          (metrics.dealsProcessed >= 20 ? 500 : 0) +
                          (metrics.productsPerDeal >= 2.5 ? 300 : 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  {(metrics.dealsProcessed >= 20 || metrics.productsPerDeal >= 2.5) && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      {metrics.dealsProcessed >= 20 && 'Volume bonus earned! '}
                      {metrics.productsPerDeal >= 2.5 && 'PPD bonus earned!'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t">
                <p className="text-[10px] text-gray-400 italic">
                  <strong>Disclaimer:</strong> These figures are estimates only and not actual
                  earnings. Final compensation may vary based on dealership policies and deal
                  structures.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Goal Tracker */}
          <Card className="border hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-600" />
                  Goal Tracker
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {Math.round((metrics.dealsProcessed / 25) * 100)}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Deals Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Monthly Deals</span>
                    <span className="text-sm text-gray-600">{metrics.dealsProcessed} / 25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (metrics.dealsProcessed / 25) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* PPD Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Products Per Deal</span>
                    <span className="text-sm text-gray-600">{metrics.productsPerDeal} / 2.5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (metrics.productsPerDeal / 2.5) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* PVR Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Per Vehicle Retail</span>
                    <span className="text-sm text-gray-600">${metrics.pvr} / $1,500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (metrics.pvr / 1500) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="pt-3 border-t">
                  <div className="text-center">
                    {metrics.dealsProcessed >= 25 &&
                    metrics.productsPerDeal >= 2.5 &&
                    metrics.pvr >= 1500 ? (
                      <div className="text-green-600 font-medium text-sm">
                        🎉 All goals achieved!
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm">
                        {25 - metrics.dealsProcessed > 0 &&
                          `${25 - metrics.dealsProcessed} more deals needed`}
                        {metrics.productsPerDeal < 2.5 && metrics.dealsProcessed < 25 && ' • '}
                        {metrics.productsPerDeal < 2.5 &&
                          `PPD needs ${(2.5 - metrics.productsPerDeal).toFixed(1)} improvement`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FinanceHomePage;
