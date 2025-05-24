import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { DealLog } from '../../components/finance/DealLog';
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
  PlusCircle,
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

// Mock deals
const MOCK_DEALS: Deal[] = [
  {
    id: 'D12345',
    customer: 'John Smith',
    vehicle: '2023 Toyota Camry',
    vin: '1HGCM82633A123456',
    saleDate: '2023-05-02',
    salesperson: 'Mike Johnson',
    amount: 32500,
    status: 'Completed',
    products: ['Vehicle Service Contract (VSC)', 'GAP', 'Tire and Wheel Bundle'],
    profit: 2200,
    created_at: '2023-05-02T14:30:00Z',
  },
  {
    id: 'D12346',
    customer: 'Sarah Williams',
    vehicle: '2023 Honda Accord',
    vin: '1HGCM82633A789012',
    saleDate: '2023-05-03',
    salesperson: 'Jessica Lee',
    amount: 28900,
    status: 'Pending',
    products: ['PrePaid Maintenance (PPM)'],
    profit: 1750,
    created_at: '2023-05-03T11:15:00Z',
  },
  {
    id: 'D12347',
    customer: 'Robert Davis',
    vehicle: '2023 Ford Explorer',
    vin: '1FMHK7D83CGA12345',
    saleDate: '2023-05-05',
    salesperson: 'Alex Martinez',
    amount: 42500,
    status: 'Completed',
    products: [
      'Vehicle Service Contract (VSC)',
      'GAP',
      'PrePaid Maintenance (PPM)',
      'Tire and Wheel Bundle',
    ],
    profit: 3100,
    created_at: '2023-05-05T16:45:00Z',
  },
  {
    id: 'D12348',
    customer: 'Emily Johnson',
    vehicle: '2022 Nissan Altima',
    vin: '1N4AL3AP8DC234567',
    saleDate: '2023-05-07',
    salesperson: 'Mike Johnson',
    amount: 26900,
    status: 'Pending',
    products: ['GAP'],
    profit: 1450,
    created_at: '2023-05-07T09:30:00Z',
  },
  {
    id: 'D12349',
    customer: 'Thomas Wilson',
    vehicle: '2023 Chevrolet Tahoe',
    vin: '1GNSKBE72DR345678',
    saleDate: '2023-05-10',
    salesperson: 'Jessica Lee',
    amount: 58900,
    status: 'Completed',
    products: [
      'Vehicle Service Contract (VSC)',
      'GAP',
      'Paint Protection',
      'Tire and Wheel Bundle',
    ],
    profit: 4200,
    created_at: '2023-05-10T15:00:00Z',
  },
];

export const SingleFinanceHomePage: React.FC = () => {
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
  // State to control promotional banner visibility
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Load mock data on component mount
  useEffect(() => {
    // In a real application, this would be an API call
    setDeals(MOCK_DEALS);
    setPendingDeals(MOCK_DEALS.filter(deal => deal.status === 'Pending'));

    // Filter deals based on selected time period
    filterDealsByDateRange();
  }, [timePeriod, customDateRange]);

  // Filter deals based on selected time period
  const filterDealsByDateRange = () => {
    const { startDate, endDate } = getDateRange(timePeriod);

    const filtered = MOCK_DEALS.filter(deal => {
      const dealDate = new Date(deal.saleDate);
      return dealDate >= startDate && dealDate <= endDate;
    });

    setFilteredDeals(filtered);
    calculateMetrics(filtered);
  };

  // Calculate metrics based on filtered deals
  const calculateMetrics = (deals: Deal[]) => {
    if (deals.length === 0) {
      setMetrics({
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
      return;
    }

    const totalRevenue = deals.reduce((acc, deal) => acc + deal.profit, 0);
    const totalDeals = deals.length;

    // Count products
    let extendedWarrantyCount = 0;
    let gapInsuranceCount = 0;
    let paintProtectionCount = 0;
    let tireWheelCount = 0;
    let ppmCount = 0;
    let otherCount = 0;

    deals.forEach(deal => {
      deal.products.forEach(product => {
        if (product.includes('Vehicle Service Contract') || product.includes('VSC')) {
          extendedWarrantyCount++;
        } else if (product.includes('GAP')) {
          gapInsuranceCount++;
        } else if (product.includes('Paint Protection')) {
          paintProtectionCount++;
        } else if (product.includes('Tire and Wheel')) {
          tireWheelCount++;
        } else if (product.includes('PrePaid Maintenance') || product.includes('PPM')) {
          ppmCount++;
        } else {
          otherCount++;
        }
      });
    });

    const totalProductCount =
      extendedWarrantyCount +
      gapInsuranceCount +
      paintProtectionCount +
      tireWheelCount +
      ppmCount +
      otherCount;

    const calculatePercentage = (count: number) =>
      totalProductCount > 0 ? Math.round((count / totalProductCount) * 100) : 0;

    setMetrics({
      mtdRevenue: totalRevenue,
      dealsProcessed: totalDeals,
      productsPerDeal: totalProductCount / totalDeals,
      pvr: totalRevenue / totalDeals,
      productMix: {
        extendedWarranty: calculatePercentage(extendedWarrantyCount),
        gapInsurance: calculatePercentage(gapInsuranceCount),
        paintProtection: calculatePercentage(paintProtectionCount),
        tireWheel: calculatePercentage(tireWheelCount),
        ppm: calculatePercentage(ppmCount),
        other: calculatePercentage(otherCount),
      },
    });
  };

  // Helper to get the current month and year for display
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

  // Check if the day is today for styling
  const isToday = (day: string) => {
    const today = new Date();
    const date = today.getDate().toString();
    return day === date;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Promotional Banner */}
      {showPromoBanner && (
        <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm relative">
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPromoBanner(false)}
            aria-label="Close promotional banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex items-center">
            <div className="mr-4 bg-blue-500 text-white p-2 rounded-full">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Special Promotion Active!</h3>
              <p className="text-blue-600">
                Your Finance Manager subscription is currently <span className="line-through text-gray-500 mr-1">$5/month</span> 
                <span className="font-bold text-red-500">FREE</span> 
                <span className="text-gray-500 text-sm italic ml-1">for a limited time</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance Manager Dashboard</h1>
        <div className="space-x-2">
          <Link to="/dashboard/single-finance/log-deal">
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Log New Deal
            </Button>
          </Link>
          <DropdownMenu>
            {/* ... existing dropdown menu code ... */}
          </DropdownMenu>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">F&I Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${metrics.mtdRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.mtdRevenue > 12000 ? (
                <span className="text-green-500 flex items-center">
                  <ChevronUp className="mr-1 h-4 w-4" />
                  +12% from last month
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ChevronDown className="mr-1 h-4 w-4" />
                  -8% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Deals Processed</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metrics.dealsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ChevronUp className="mr-1 h-4 w-4" />
                +3% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Products Per Deal</CardTitle>
            <BarChart4 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {metrics.productsPerDeal.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.productsPerDeal >= 2.0 ? (
                <span className="text-green-500 flex items-center">
                  <ChevronUp className="mr-1 h-4 w-4" />
                  +0.2 from last month
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ChevronDown className="mr-1 h-4 w-4" />
                  -0.3 from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              PVR (Per Vehicle Retailed)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${metrics.pvr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pvr > 1500 ? (
                <span className="text-green-500 flex items-center">
                  <ChevronUp className="mr-1 h-4 w-4" />
                  +$125 from last month
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <ChevronDown className="mr-1 h-4 w-4" />
                  -$89 from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Mix Section - Now Full Width */}
      <Card className="col-span-12 bg-white border-slate-200 shadow-sm">
        <CardHeader className="py-2 px-4 border-b">
          <CardTitle className="flex items-center text-lg font-medium">
            <BarChart4 className="mr-2 h-5 w-5 text-blue-500" />
            F&I Product Mix & Avg. Profit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Column: VSC, GAP, PPM */}
            <div className="space-y-2">
              {/* VSC */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center text-sm">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                    Vehicle Service Contract (VSC)
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Avg. Profit</div>
                    <div className="font-medium text-sm">
                      $
                      {Math.round(
                        (metrics.mtdRevenue * metrics.productMix.extendedWarranty) / 100
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                    style={{ width: `${metrics.productMix.extendedWarranty}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">
                  {metrics.productMix.extendedWarranty}%
                </div>
              </div>

              {/* GAP Insurance */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center text-sm">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                    GAP Insurance
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Avg. Profit</div>
                    <div className="font-medium text-sm">
                      $
                      {Math.round(
                        (metrics.mtdRevenue * metrics.productMix.gapInsurance) / 100
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-green-600"
                    style={{ width: `${metrics.productMix.gapInsurance}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">
                  {metrics.productMix.gapInsurance}%
                </div>
              </div>

              {/* PPM */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center text-sm">
                    <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                    PrePaid Maintenance (PPM)
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Avg. Profit</div>
                    <div className="font-medium text-sm">
                      $
                      {Math.round(
                        (metrics.mtdRevenue * metrics.productMix.ppm) / 100
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-purple-600"
                    style={{ width: `${metrics.productMix.ppm}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">{metrics.productMix.ppm}%</div>
              </div>
            </div>

            {/* Second Column: Paint, Tire & Wheel, Other */}
            <div className="space-y-2">
              {/* Paint Protection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center text-sm">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                    Paint Protection
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Avg. Profit</div>
                    <div className="font-medium text-sm">
                      $
                      {Math.round(
                        (metrics.mtdRevenue * metrics.productMix.paintProtection) / 100
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-blue-600"
                    style={{ width: `${metrics.productMix.paintProtection}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">
                  {metrics.productMix.paintProtection}%
                </div>
              </div>

              {/* Tire & Wheel */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center text-sm">
                    <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                    Tire and Wheel Bundle
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Avg. Profit</div>
                    <div className="font-medium text-sm">
                      $
                      {Math.round(
                        (metrics.mtdRevenue * metrics.productMix.tireWheel) / 100
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-amber-600"
                    style={{ width: `${metrics.productMix.tireWheel}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">
                  {metrics.productMix.tireWheel}%
                </div>
              </div>

              {/* Other */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center text-sm">
                    <div className="w-3 h-3 bg-gray-600 rounded-full mr-2"></div>
                    Other
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Avg. Profit</div>
                    <div className="font-medium text-sm">
                      $
                      {Math.round(
                        (metrics.mtdRevenue * metrics.productMix.other) / 100
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gray-600"
                    style={{ width: `${metrics.productMix.other}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-500">{metrics.productMix.other}%</div>
              </div>
            </div>
          </div>

          {/* Products Per Deal (PPD) metric at the bottom */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">Products Per Deal (PPD)</div>
              <div className="font-bold text-lg text-purple-600">
                {metrics.productsPerDeal.toFixed(1)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Log Section */}
      <div className="mt-8">
        <DealLog />
      </div>

      {/* Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... existing schedule section ... */}
      </div>
    </div>
  );
};

export default SingleFinanceHomePage;
