import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
// Removed unused imports
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
  Car,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DropdownMenu } from '../../components/ui/dropdown-menu';

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
  back_end_gross?: number;
  vsc_profit?: number;
  gap_profit?: number;
  appearance_profit?: number;
  tire_wheel_profit?: number;
  ppm_profit?: number;
  ext_warranty_profit?: number;
  key_replacement_profit?: number;
  theft_profit?: number;
  windshield_profit?: number;
  lojack_profit?: number;
  other_profit?: number;
}

// Interface for metrics
interface Metrics {
  mtdRevenue: number;
  dealsProcessed: number;
  productsPerDeal: number;
  pvr: number;
  dealTypes: {
    finance: number;
    cash: number;
    lease: number;
  };
  productMix: {
    extendedWarranty: number;
    gapInsurance: number;
    paintProtection: number;
    tireWheel: number;
    ppm: number;
    other: number;
  };
  avgProfits: {
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
// Commented out unused data
/* 
const SCHEDULE_DATA = [
  { day: 'Monday', date: '12', shift: 'Off', team: '' },
  { day: 'Tuesday', date: '13', shift: '9am - 6pm', team: 'Team A' },
  { day: 'Wednesday', date: '14', shift: '10am - 7pm', team: 'Team A' },
  { day: 'Thursday', date: '15', shift: '9am - 6pm', team: 'Team A' },
  { day: 'Friday', date: '16', shift: '11am - 8pm', team: 'Team B' },
  { day: 'Saturday', date: '17', shift: '9am - 5pm', team: 'Team B' },
  { day: 'Sunday', date: '18', shift: 'Off', team: '' },
];
*/

// Mock deals - cleared for testing
const MOCK_DEALS: Deal[] = [];

export const SingleFinanceHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [, setPendingDeals] = useState<Deal[]>([]);
  const [timePeriod] = useState<TimePeriod>('this-month');
  const [customDateRange] = useState({
    start: '',
    end: '',
  });
  const [showCustomDatePicker] = useState(false);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    mtdRevenue: 0,
    dealsProcessed: 0,
    productsPerDeal: 0,
    pvr: 0,
    dealTypes: {
      finance: 0,
      cash: 0,
      lease: 0,
    },
    productMix: {
      extendedWarranty: 0,
      gapInsurance: 0,
      paintProtection: 0,
      tireWheel: 0,
      ppm: 0,
      other: 0,
    },
    avgProfits: {
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
  const [showPayAmounts, setShowPayAmounts] = useState(true);

  // Check and handle monthly reset
  const checkMonthlyReset = () => {
    try {
      const lastResetMonth = localStorage.getItem('singleFinanceLastResetMonth');
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthYear = `${currentYear}-${currentMonth}`;

      if (!lastResetMonth || lastResetMonth !== currentMonthYear) {
        console.log('[SingleFinanceHomePage] New month detected, resetting data...');
        
        // Clear deals but preserve team members and settings
        localStorage.removeItem('singleFinanceDeals');
        
        // Update the last reset month
        localStorage.setItem('singleFinanceLastResetMonth', currentMonthYear);
        
        console.log('[SingleFinanceHomePage] Monthly reset completed');
      }
    } catch (error) {
      console.error('[SingleFinanceHomePage] Error during monthly reset:', error);
    }
  };

  // Load deals from localStorage and recalculate when component mounts or data changes
  useEffect(() => {
    // Check for monthly reset first
    checkMonthlyReset();
    
    // Force immediate reload on component mount
    setTimeout(() => {
      loadDealsFromStorage();
    }, 100);
    
    loadDealsFromStorage();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: any) => {
      if (e.key === 'singleFinanceDeals') {
        console.log('[SingleFinanceHomePage] Storage change detected, reloading deals');
        loadDealsFromStorage();
      }
    };

    // Listen for window focus to refresh data when returning to tab
    const handleWindowFocus = () => {
      console.log('[SingleFinanceHomePage] Window focus detected, refreshing deals');
      loadDealsFromStorage();
    };

    // Listen for custom event when deals are updated
    const handleDealsUpdated = (e: any) => {
      console.log('[SingleFinanceHomePage] Custom deals updated event received:', e.detail);
      loadDealsFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('singleFinanceDealsUpdated', handleDealsUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('singleFinanceDealsUpdated', handleDealsUpdated);
    };
  }, []);

  // Function to manually refresh deals (can be called by buttons)
  const refreshDeals = () => {
    console.log('[SingleFinanceHomePage] Manual refresh triggered');
    loadDealsFromStorage();
  };

  // Expose refresh function globally for debugging
  useEffect(() => {
    (window as any).refreshSingleFinanceDeals = refreshDeals;
    return () => {
      delete (window as any).refreshSingleFinanceDeals;
    };
  }, []);

  // Separate effect for time period changes
  useEffect(() => {
    if (deals.length > 0) {
      filterDealsByDateRange();
    }
  }, [timePeriod, customDateRange, deals]);

  // Function to load deals from localStorage
  const loadDealsFromStorage = useCallback(() => {
    try {
      // Load from SEPARATE storage for Single Finance Dashboard
      const storedDeals = localStorage.getItem('singleFinanceDeals');
      if (storedDeals) {
        const parsedDeals = JSON.parse(storedDeals);
        console.log(
          '[SingleFinanceHomePage] Loaded deals from singleFinanceDeals storage:',
          parsedDeals
        );
        console.log('[SingleFinanceHomePage] Number of deals loaded:', parsedDeals.length);
        setDeals(parsedDeals);
        setPendingDeals(
          parsedDeals.filter((deal: Deal) => deal.status === 'Pending' || deal.status === 'pending')
        );
      } else {
        // Fallback to mock data if no stored deals
        console.log('[SingleFinanceHomePage] No stored deals found, using mock data');
        setDeals(MOCK_DEALS);
        setPendingDeals(MOCK_DEALS.filter(deal => deal.status === 'Pending'));
      }
    } catch (error) {
      console.error('[SingleFinanceHomePage] Error loading deals from localStorage:', error);
      // Fallback to mock data
      setDeals(MOCK_DEALS);
      setPendingDeals(MOCK_DEALS.filter(deal => deal.status === 'Pending'));
    }
  }, []);

  // Filter deals based on selected time period
  const filterDealsByDateRange = useCallback(() => {
    const { startDate, endDate } = getDateRange(timePeriod);

    const filtered = deals.filter(deal => {
      const dealDate = new Date(deal.saleDate);
      return dealDate >= startDate && dealDate <= endDate;
    });

    setFilteredDeals(filtered);
    calculateMetrics(filtered);
  }, [deals, timePeriod, customDateRange]);

  // Calculate metrics based on filtered deals
  const calculateMetrics = useCallback((deals: Deal[]) => {
    if (deals.length === 0) {
      setMetrics({
        mtdRevenue: 0,
        dealsProcessed: 0,
        productsPerDeal: 0,
        pvr: 0,
        dealTypes: {
          finance: 0,
          cash: 0,
          lease: 0,
        },
        productMix: {
          extendedWarranty: 0,
          gapInsurance: 0,
          paintProtection: 0,
          tireWheel: 0,
          ppm: 0,
          other: 0,
        },
        avgProfits: {
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

    // Calculate total revenue - handle both new and old data structures
    const totalRevenue = deals.reduce((acc, deal) => {
      // New structure has back_end_gross, old structure has profit
      const dealProfit = deal.back_end_gross || deal.profit || 0;
      return acc + dealProfit;
    }, 0);

    const totalDeals = deals.length;

    // Calculate AVERAGE PROFIT per product across all deals (not percentages)
    let extendedWarrantyTotal = 0;
    let extendedWarrantyCount = 0;
    let gapInsuranceTotal = 0;
    let gapInsuranceCount = 0;
    let paintProtectionTotal = 0;
    let paintProtectionCount = 0;
    let tireWheelTotal = 0;
    let tireWheelCount = 0;
    let ppmTotal = 0;
    let ppmCount = 0;
    let otherTotal = 0;
    let otherCount = 0;

    deals.forEach(deal => {
      // Access deal data properly - cast to any to access extended properties
      const dealData = deal as any;

      // VSC/Extended Warranty
      if (dealData.vscProfit && dealData.vscProfit > 0) {
        extendedWarrantyTotal += dealData.vscProfit;
        extendedWarrantyCount++;
      } else if (deal.vsc_profit && deal.vsc_profit > 0) {
        extendedWarrantyTotal += deal.vsc_profit;
        extendedWarrantyCount++;
      }

      // GAP Insurance
      if (dealData.gapProfit && dealData.gapProfit > 0) {
        gapInsuranceTotal += dealData.gapProfit;
        gapInsuranceCount++;
      } else if (deal.gap_profit && deal.gap_profit > 0) {
        gapInsuranceTotal += deal.gap_profit;
        gapInsuranceCount++;
      }

      // Paint Protection/Appearance
      if (dealData.appearanceProfit && dealData.appearanceProfit > 0) {
        paintProtectionTotal += dealData.appearanceProfit;
        paintProtectionCount++;
      } else if (deal.appearance_profit && deal.appearance_profit > 0) {
        paintProtectionTotal += deal.appearance_profit;
        paintProtectionCount++;
      }

      // Tire & Wheel
      if (dealData.tireAndWheelProfit && dealData.tireAndWheelProfit > 0) {
        tireWheelTotal += dealData.tireAndWheelProfit;
        tireWheelCount++;
      } else if (deal.tire_wheel_profit && deal.tire_wheel_profit > 0) {
        tireWheelTotal += deal.tire_wheel_profit;
        tireWheelCount++;
      }

      // PPM (Prepaid Maintenance)
      if (dealData.ppmProfit && dealData.ppmProfit > 0) {
        ppmTotal += dealData.ppmProfit;
        ppmCount++;
      } else if (deal.ppm_profit && deal.ppm_profit > 0) {
        ppmTotal += deal.ppm_profit;
        ppmCount++;
      }

      // Other products
      const otherProfit =
        (dealData.extWarrantyProfit || deal.ext_warranty_profit || 0) +
        (dealData.keyReplacementProfit || deal.key_replacement_profit || 0) +
        (dealData.theftProfit || deal.theft_profit || 0) +
        (dealData.windshieldProfit || deal.windshield_profit || 0) +
        (dealData.lojackProfit || deal.lojack_profit || 0) +
        (dealData.otherProfit || deal.other_profit || 0);

      if (otherProfit > 0) {
        otherTotal += otherProfit;
        otherCount++;
      }
    });

    // Calculate deal types (Finance, Cash, Lease)
    let financeDealsCount = 0;
    let cashDealsCount = 0;
    let leaseDealsCount = 0;

    deals.forEach(deal => {
      const dealData = deal as any;
      const dealType = (dealData.dealType || '').toLowerCase();

      if (dealType === 'finance' || dealType === 'financing') {
        financeDealsCount++;
      } else if (dealType === 'cash') {
        cashDealsCount++;
      } else if (dealType === 'lease' || dealType === 'leasing') {
        leaseDealsCount++;
      } else {
        // Default to finance if not specified
        financeDealsCount++;
      }
    });

    // Calculate penetration percentage (how often each product is sold)
    const calculatePenetration = (count: number) =>
      totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0;

    // Calculate average profit per product
    const calculateAverage = (total: number, count: number) =>
      count > 0 ? Math.round(total / count) : 0;

    setMetrics({
      mtdRevenue: totalRevenue,
      dealsProcessed: totalDeals,
      productsPerDeal:
        totalDeals > 0
          ? (extendedWarrantyCount +
              gapInsuranceCount +
              paintProtectionCount +
              tireWheelCount +
              ppmCount +
              otherCount) /
            totalDeals
          : 0,
      pvr: totalDeals > 0 ? totalRevenue / totalDeals : 0,
      dealTypes: {
        finance: financeDealsCount,
        cash: cashDealsCount,
        lease: leaseDealsCount,
      },
      productMix: {
        extendedWarranty: calculatePenetration(extendedWarrantyCount),
        gapInsurance: calculatePenetration(gapInsuranceCount),
        paintProtection: calculatePenetration(paintProtectionCount),
        tireWheel: calculatePenetration(tireWheelCount),
        ppm: calculatePenetration(ppmCount),
        other: calculatePenetration(otherCount),
      },
      // Add average profits as a separate property
      avgProfits: {
        extendedWarranty: calculateAverage(extendedWarrantyTotal, extendedWarrantyCount),
        gapInsurance: calculateAverage(gapInsuranceTotal, gapInsuranceCount),
        paintProtection: calculateAverage(paintProtectionTotal, paintProtectionCount),
        tireWheel: calculateAverage(tireWheelTotal, tireWheelCount),
        ppm: calculateAverage(ppmTotal, ppmCount),
        other: calculateAverage(otherTotal, otherCount),
      },
    });
  }, []);

  // Helper to get the current month and year for display
  const getCurrentMonthYear = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get date range based on selected time period
  const getDateRange = useCallback(
    (period: TimePeriod) => {
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

        case 'last-quarter': {
          const currentQuarter = Math.floor(today.getMonth() / 3);
          startDate = new Date(today.getFullYear(), currentQuarter * 3 - 3, 1);
          endDate = new Date(today.getFullYear(), currentQuarter * 3, 0);
          break;
        }

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
    },
    [customDateRange]
  );

  // Check if the day is today for styling
  const isToday = (day: string) => {
    const today = new Date();
    const date = today.getDate().toString();
    return day === date;
  };

  return (
    <div className="w-full px-2 py-2">
      {/* Promotional Banner */}
      {showPromoBanner && (
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPromoBanner(false)}
            aria-label="Close promotional banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
                Your Finance Manager subscription is currently{' '}
                <span className="line-through text-gray-500 mr-1">$5/month</span>
                <span className="font-bold text-red-500">FREE</span>
                <span className="text-gray-500 text-sm italic ml-1">for a limited time</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold">Finance Manager Dashboard</h1>
        <div className="space-x-2">
          <DropdownMenu>{/* ... existing dropdown menu code ... */}</DropdownMenu>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">F&I Gross</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">
              Deals Processed
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-slate-900">{metrics.dealsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <ChevronUp className="mr-1 h-4 w-4" />
                +3% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">Deal Types</CardTitle>
            <Car className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Finance:</span>
                <span className="text-sm font-bold text-indigo-600">
                  {metrics.dealTypes.finance}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Cash:</span>
                <span className="text-sm font-bold text-green-600">{metrics.dealTypes.cash}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Lease:</span>
                <span className="text-sm font-bold text-blue-600">{metrics.dealTypes.lease}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">
              Products Per Deal
            </CardTitle>
            <BarChart4 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
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

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">
              PVR (Per Vehicle Retailed)
            </CardTitle>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
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

      {/* F&I Product Mix & Pay Calculator Section - Side by Side */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* F&I Product Mix - Condensed */}
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-medium">
              <BarChart4 className="mr-2 h-5 w-5 text-blue-500" />
              F&I Product Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {/* Header Row */}
            <div className="flex items-center py-2 px-3 mb-3 border-b border-gray-200">
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Product</span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Profit $</span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Per Deal %</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                {
                  name: 'VSC',
                  percent: metrics.productMix.extendedWarranty,
                  value: `${metrics.avgProfits.extendedWarranty.toLocaleString()}`,
                  color: 'bg-blue-500',
                },
                {
                  name: 'PPM',
                  percent: metrics.productMix.ppm,
                  value: `${metrics.avgProfits.ppm.toLocaleString()}`,
                  color: 'bg-green-500',
                },
                {
                  name: 'GAP',
                  percent: metrics.productMix.gapInsurance,
                  value: `${metrics.avgProfits.gapInsurance.toLocaleString()}`,
                  color: 'bg-purple-500',
                },
                {
                  name: 'Paint/Fabric',
                  percent: metrics.productMix.paintProtection,
                  value: `${metrics.avgProfits.paintProtection.toLocaleString()}`,
                  color: 'bg-orange-500',
                },
                {
                  name: 'Tire & Wheel',
                  percent: metrics.productMix.tireWheel,
                  value: `${metrics.avgProfits.tireWheel.toLocaleString()}`,
                  color: 'bg-red-500',
                },
                {
                  name: 'Other',
                  percent: metrics.productMix.other,
                  value: `${metrics.avgProfits.other.toLocaleString()}`,
                  color: 'bg-gray-500',
                },
                ].map((product, index) => (
                  <div key={index} className="flex items-center py-2 px-3 bg-gray-50 rounded-md">
                    <div className="flex items-center flex-1">
                      <div className={`w-3 h-3 ${product.color} rounded-full mr-3 flex-shrink-0`}></div>
                      <span className="font-medium text-sm">{product.name}</span>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-bold text-base">
                        <span className="text-xs">$</span>{product.value}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-bold text-sm text-blue-600">{product.percent}%</div>
                    </div>
                  </div>
                ))}

                {/* PPD metric */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center py-2 px-3 bg-blue-50 rounded-md">
                    <div className="flex-1">
                      <span className="font-medium text-sm">Products Per Deal (PPD)</span>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-bold text-lg text-blue-600">
                        {metrics.productsPerDeal.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      {/* Empty space to maintain alignment */}
                    </div>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Pay Calculator Card */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center justify-between text-green-800">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Monthly Pay Estimator
              </div>
              <button
                onClick={() => setShowPayAmounts(!showPayAmounts)}
                className="p-1 hover:bg-green-200 rounded transition-colors"
                title={showPayAmounts ? "Hide pay amounts" : "Show pay amounts"}
              >
                {showPayAmounts ? (
                  <Eye className="h-4 w-4 text-green-700" />
                ) : (
                  <EyeOff className="h-4 w-4 text-green-700" />
                )}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Load pay configuration from localStorage
              let payConfig;
              try {
                const savedPayConfig = localStorage.getItem('singleFinancePayConfig');
                payConfig = savedPayConfig ? JSON.parse(savedPayConfig) : {
                  commissionRate: 25,
                  baseRate: 500,
                  bonusThresholds: {
                    vscBonus: 100,
                    gapBonus: 50,
                    ppmBonus: 75,
                    totalThreshold: 15000
                  }
                };
              } catch (error) {
                payConfig = {
                  commissionRate: 25,
                  baseRate: 500,
                  bonusThresholds: {
                    vscBonus: 100,
                    gapBonus: 50,
                    ppmBonus: 75,
                    totalThreshold: 15000
                  }
                };
              }

              // Calculate pay based on current month's data
              const totalProfit = filteredDeals.reduce((acc, deal) => {
                const dealProfit = deal.back_end_gross || deal.profit || 0;
                return acc + dealProfit;
              }, 0);
              const commissionEarnings = (totalProfit * payConfig.commissionRate) / 100;
              const baseEarnings = payConfig.baseRate;
              
              // Calculate product bonuses (only for funded deals)
              const fundedDeals = filteredDeals.filter(deal => deal.status === 'Funded' || deal.status === 'Complete');
              const vscBonuses = fundedDeals.filter(deal => {
                const dealData = deal as any;
                return (dealData.vscProfit && dealData.vscProfit > 0) || (deal.vsc_profit && deal.vsc_profit > 0);
              }).length * payConfig.bonusThresholds.vscBonus;
              
              const gapBonuses = fundedDeals.filter(deal => {
                const dealData = deal as any;
                return (dealData.gapProfit && dealData.gapProfit > 0) || (deal.gap_profit && deal.gap_profit > 0);
              }).length * payConfig.bonusThresholds.gapBonus;
              
              const ppmBonuses = fundedDeals.filter(deal => {
                const dealData = deal as any;
                return (dealData.ppmProfit && dealData.ppmProfit > 0) || (deal.ppm_profit && deal.ppm_profit > 0);
              }).length * payConfig.bonusThresholds.ppmBonus;

              const totalBonuses = vscBonuses + gapBonuses + ppmBonuses;
              const estimatedPay = baseEarnings + commissionEarnings + totalBonuses;

              // Helper function to display amount or XXX
              const displayAmount = (amount: number) => showPayAmounts ? `$${amount.toLocaleString()}` : 'XXX';

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="text-sm font-medium">Base Pay</span>
                      <span className="font-bold text-green-600">{displayAmount(baseEarnings)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="text-sm font-medium">Commission ({payConfig.commissionRate}%)</span>
                      <span className="font-bold text-green-600">{displayAmount(commissionEarnings)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="text-sm font-medium">Product Bonuses</span>
                      <span className="font-bold text-green-600">{displayAmount(totalBonuses)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
                      <div className="text-sm font-medium">Estimated Monthly Pay</div>
                      <div className="text-2xl font-bold">{showPayAmounts ? `$${estimatedPay.toLocaleString()}` : 'XXX'}</div>
                    </div>
                    
                    <div className="text-xs text-gray-600 p-3 bg-white rounded-lg border">
                      <p className="font-medium mb-1">Bonus Breakdown:</p>
                      <p>VSC Deals: {fundedDeals.filter(deal => {
                        const dealData = deal as any;
                        return (dealData.vscProfit && dealData.vscProfit > 0) || (deal.vsc_profit && deal.vsc_profit > 0);
                      }).length} × {showPayAmounts ? `$${payConfig.bonusThresholds.vscBonus}` : 'XXX'} = {showPayAmounts ? `$${vscBonuses}` : 'XXX'}</p>
                      <p>GAP Deals: {fundedDeals.filter(deal => {
                        const dealData = deal as any;
                        return (dealData.gapProfit && dealData.gapProfit > 0) || (deal.gap_profit && deal.gap_profit > 0);
                      }).length} × {showPayAmounts ? `$${payConfig.bonusThresholds.gapBonus}` : 'XXX'} = {showPayAmounts ? `$${gapBonuses}` : 'XXX'}</p>
                      <p>PPM Deals: {fundedDeals.filter(deal => {
                        const dealData = deal as any;
                        return (dealData.ppmProfit && dealData.ppmProfit > 0) || (deal.ppm_profit && deal.ppm_profit > 0);
                      }).length} × {showPayAmounts ? `$${payConfig.bonusThresholds.ppmBonus}` : 'XXX'} = {showPayAmounts ? `$${ppmBonuses}` : 'XXX'}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <p className="text-xs text-gray-500 text-center">
                      <strong>Disclaimer:</strong> This calculator is for informational purposes only. 
                      Actual pay may differ based on final accounting, management review, and company policies. 
                      Configure your pay settings in the Settings page.
                    </p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default SingleFinanceHomePage;
