import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { useFinanceDealsData } from '../../hooks/useDealsData';
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
  // Additional fields for new deal structure
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
  // Camel case variants for backward compatibility
  vscProfit?: number;
  gapProfit?: number;
  appearanceProfit?: number;
  tireWheelProfit?: number;
  ppmProfit?: number;
  extWarrantyProfit?: number;
  keyReplacementProfit?: number;
  theftProfit?: number;
  windshieldProfit?: number;
  lojackProfit?: number;
  otherProfit?: number;
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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this-month');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Local state for deal management
  const [localDeals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [localPendingDeals, setPendingDeals] = useState<Deal[]>([]);
  const [localMetrics, setMetrics] = useState<Metrics>({
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
    avgProfits: {
      extendedWarranty: 0,
      gapInsurance: 0,
      paintProtection: 0,
      tireWheel: 0,
      ppm: 0,
      other: 0,
    },
  });

  // Use the finance deals data hook
  const {
    dealData,
    loading,
    error,
    setTimePeriod: setHookTimePeriod,
  } = useFinanceDealsData(timePeriod);

  // Extract data from the hook
  const hookDeals = dealData?.deals || [];
  const hookMetrics = dealData?.metrics || {
    totalDeals: 0,
    fundedDeals: 0,
    pendingDeals: 0,
    totalFrontGross: 0,
    totalBackGross: 0,
    totalGross: 0,
    avgFrontGross: 0,
    avgBackGross: 0,
    totalPVR: 0,
    avgPVR: 0,
  };

  // Use local deals for table display and hook deals for other metrics
  const deals = localDeals.length > 0 ? localDeals : hookDeals;
  const metrics =
    localMetrics.mtdRevenue > 0
      ? localMetrics
      : {
          mtdRevenue: hookMetrics.totalBackGross,
          dealsProcessed: hookMetrics.totalDeals,
          productsPerDeal:
            hookMetrics.totalDeals > 0 ? hookMetrics.totalPVR / hookMetrics.totalDeals : 0,
          pvr: hookMetrics.avgPVR,
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
        };

  // Filter deals by status
  const fundedDeals = deals.filter((deal: any) => deal.isFunded);
  const pendingDeals =
    localPendingDeals.length > 0 ? localPendingDeals : deals.filter((deal: any) => deal.isPending);

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

    // Update the hook's time period if it's not custom
    if (newPeriod !== 'custom') {
      setHookTimePeriod(newPeriod);
    }
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
          (deal: any) =>
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
    if (localDeals.length > 0) {
      filterDealsByDateRange();
    }
  }, [timePeriod, customDateRange, localDeals]);

  // Filter deals by selected date range
  const filterDealsByDateRange = () => {
    if (!localDeals.length) return;

    const { startDate, endDate } = getDateRange(timePeriod);

    const filtered = localDeals.filter((deal: any) => {
      const dealDate = new Date(deal.saleDate);
      return dealDate >= startDate && dealDate <= endDate;
    });

    setFilteredDeals(filtered);
    calculateMetrics(filtered);
  };

  // Handle status change for a deal
  const handleStatusChange = (dealId: string, newStatus: string) => {
    try {
      // Get existing deals from localStorage
      const existingDealsJson = localStorage.getItem('financeDeals');
      const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

      // Update the deal status
      const updatedDeals = existingDeals.map((deal: any) =>
        deal.id === dealId ? { ...deal, status: newStatus } : deal
      );

      // Save back to localStorage
      localStorage.setItem('financeDeals', JSON.stringify(updatedDeals));

      // Update local state
      setDeals(updatedDeals);

      console.log(`[FinanceHomePage] Updated deal ${dealId} status to ${newStatus}`);
    } catch (error) {
      console.error('[FinanceHomePage] Error updating deal status:', error);
    }
  };

  // Handle deal deletion
  const handleDeleteDeal = (dealId: string, shouldDelete: boolean) => {
    if (!shouldDelete) return;

    if (confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      try {
        // Get existing deals from localStorage
        const existingDealsJson = localStorage.getItem('financeDeals');
        const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

        // Remove the deal
        const updatedDeals = existingDeals.filter((deal: any) => deal.id !== dealId);

        // Save back to localStorage
        localStorage.setItem('financeDeals', JSON.stringify(updatedDeals));

        // Update local state
        setDeals(updatedDeals);

        console.log(`[FinanceHomePage] Deleted deal ${dealId}`);
      } catch (error) {
        console.error('[FinanceHomePage] Error deleting deal:', error);
      }
    }
  };

  // Calculate metrics based on deals
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

    // Calculate total F&I revenue for the time period - handle both new and old data structures
    const totalRevenue = deals.reduce((total, deal) => {
      // New structure has back_end_gross, old structure has profit
      const dealProfit = deal.back_end_gross || deal.profit || 0;
      return total + dealProfit;
    }, 0);

    // Calculate deals processed in this time period
    const dealsProcessed = deals.length;

    // Calculate product penetration and average profits based on actual profit values
    let extendedWarrantyCount = 0;
    let extendedWarrantyTotal = 0;
    let gapInsuranceCount = 0;
    let gapInsuranceTotal = 0;
    let paintProtectionCount = 0;
    let paintProtectionTotal = 0;
    let tireWheelCount = 0;
    let tireWheelTotal = 0;
    let ppmCount = 0;
    let ppmTotal = 0;
    let otherCount = 0;
    let otherTotal = 0;

    deals.forEach(deal => {
      // VSC/Extended Warranty
      const vscProfit = deal.vsc_profit || deal.vscProfit || 0;
      if (vscProfit > 0) {
        extendedWarrantyCount++;
        extendedWarrantyTotal += vscProfit;
      }

      // GAP Insurance
      const gapProfit = deal.gap_profit || deal.gapProfit || 0;
      if (gapProfit > 0) {
        gapInsuranceCount++;
        gapInsuranceTotal += gapProfit;
      }

      // Paint Protection/Appearance
      const appearanceProfit = deal.appearance_profit || deal.appearanceProfit || 0;
      if (appearanceProfit > 0) {
        paintProtectionCount++;
        paintProtectionTotal += appearanceProfit;
      }

      // Tire & Wheel
      const tireWheelProfit = deal.tire_wheel_profit || deal.tireWheelProfit || 0;
      if (tireWheelProfit > 0) {
        tireWheelCount++;
        tireWheelTotal += tireWheelProfit;
      }

      // PPM (Prepaid Maintenance)
      const ppmProfit = deal.ppm_profit || deal.ppmProfit || 0;
      if (ppmProfit > 0) {
        ppmCount++;
        ppmTotal += ppmProfit;
      }

      // Other products (Extended Warranty, Key Replacement, Theft, Windshield, LoJack, Other)
      const otherProfit =
        (deal.ext_warranty_profit || deal.extWarrantyProfit || 0) +
        (deal.key_replacement_profit || deal.keyReplacementProfit || 0) +
        (deal.theft_profit || deal.theftProfit || 0) +
        (deal.windshield_profit || deal.windshieldProfit || 0) +
        (deal.lojack_profit || deal.lojackProfit || 0) +
        (deal.other_profit || deal.otherProfit || 0);

      if (otherProfit > 0) {
        otherCount++;
        otherTotal += otherProfit;
      }
    });

    // Calculate penetration percentage (how often each product is sold)
    const calculatePenetration = (count: number) =>
      dealsProcessed > 0 ? Math.round((count / dealsProcessed) * 100) : 0;

    // Calculate average profit per product
    const calculateAverage = (total: number, count: number) =>
      count > 0 ? Math.round(total / count) : 0;

    // Calculate average products per deal
    const totalProductsSold =
      extendedWarrantyCount +
      gapInsuranceCount +
      paintProtectionCount +
      tireWheelCount +
      ppmCount +
      otherCount;
    const productsPerDeal = dealsProcessed > 0 ? totalProductsSold / dealsProcessed : 0;

    // Calculate PVR (Per Vehicle Retailed)
    const pvr = dealsProcessed > 0 ? totalRevenue / dealsProcessed : 0;

    const productMix = {
      extendedWarranty: calculatePenetration(extendedWarrantyCount),
      gapInsurance: calculatePenetration(gapInsuranceCount),
      paintProtection: calculatePenetration(paintProtectionCount),
      tireWheel: calculatePenetration(tireWheelCount),
      ppm: calculatePenetration(ppmCount),
      other: calculatePenetration(otherCount),
    };

    const avgProfits = {
      extendedWarranty: calculateAverage(extendedWarrantyTotal, extendedWarrantyCount),
      gapInsurance: calculateAverage(gapInsuranceTotal, gapInsuranceCount),
      paintProtection: calculateAverage(paintProtectionTotal, paintProtectionCount),
      tireWheel: calculateAverage(tireWheelTotal, tireWheelCount),
      ppm: calculateAverage(ppmTotal, ppmCount),
      other: calculateAverage(otherTotal, otherCount),
    };

    // Update metrics state
    setMetrics({
      mtdRevenue: totalRevenue,
      dealsProcessed,
      productsPerDeal,
      pvr,
      productMix,
      avgProfits,
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
          <Card className="border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
                F&I Gross
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.mtdRevenue > 0 ? `$${metrics.mtdRevenue.toLocaleString()}` : 'No data yet'}
              </div>
              {metrics.mtdRevenue > 0 && (
                <div className="flex items-center pt-1 text-blue-600">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">8.2% from previous period</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-slate-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
                Deals Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.dealsProcessed > 0 ? metrics.dealsProcessed : 'No deals yet'}
              </div>
              {metrics.dealsProcessed > 0 && (
                <div className="flex items-center pt-1 text-slate-600">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">10.5% from previous period</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-700 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart4 className="mr-2 h-4 w-4 text-blue-700" />
                Pay Calculator MTD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Math.round(metrics.mtdRevenue * 0.15).toLocaleString()}
              </div>
              {metrics.dealsProcessed > 0 && (
                <div className="flex items-center pt-1 text-blue-700">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">15% of F&I revenue</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-slate-700 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Percent className="mr-2 h-4 w-4 text-slate-700" />
                PVR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.dealsProcessed > 0 ? `$${metrics.pvr.toLocaleString()}` : 'No data yet'}
              </div>
              {metrics.dealsProcessed > 0 && (
                <div className="flex items-center pt-1 text-slate-700">
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
                <CalendarClock className="mr-2 h-4 w-4 text-blue-600" />
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
                      value: `$${metrics.avgProfits.extendedWarranty.toLocaleString()}`,
                      color: 'bg-blue-600',
                    },
                    {
                      name: 'PrePaid Maintenance (PPM)',
                      percent: metrics.productMix.ppm,
                      value: `$${metrics.avgProfits.ppm.toLocaleString()}`,
                      color: 'bg-blue-600',
                    },
                    {
                      name: 'GAP Insurance',
                      percent: metrics.productMix.gapInsurance,
                      value: `$${metrics.avgProfits.gapInsurance.toLocaleString()}`,
                      color: 'bg-blue-600',
                    },
                    {
                      name: 'Paint and Fabric Protection',
                      percent: metrics.productMix.paintProtection,
                      value: `$${metrics.avgProfits.paintProtection.toLocaleString()}`,
                      color: 'bg-blue-600',
                    },
                    {
                      name: 'Tire & Wheel Bundle',
                      percent: metrics.productMix.tireWheel,
                      value: `$${metrics.avgProfits.tireWheel.toLocaleString()}`,
                      color: 'bg-blue-600',
                    },
                    {
                      name: 'Other Products',
                      percent: metrics.productMix.other,
                      value: `$${metrics.avgProfits.other.toLocaleString()}`,
                      color: 'bg-blue-600',
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
                      <div className="font-bold text-lg text-blue-700">
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
                  <Trophy className="mr-2 h-4 w-4 text-blue-600" />
                  Finance Das Board
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-1">
              {/* Sortable Header */}
              <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
                <div className="w-10 text-center bg-gray-600 py-2 rounded-l-md">#</div>
                <div className="w-36 flex-shrink-0 bg-gray-600 py-2 px-2">F&I Manager</div>
                <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                  PVR <ChevronDown className="ml-1 h-3 w-3" />
                </div>
                <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                  VSC % <ChevronDown className="ml-1 h-3 w-3" />
                </div>
                <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                  GAP % <ChevronDown className="ml-1 h-3 w-3" />
                </div>
                <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                  PPM % <ChevronDown className="ml-1 h-3 w-3" />
                </div>
                <div className="w-24 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                  PPD <ChevronDown className="ml-1 h-3 w-3" />
                </div>
                <div className="w-36 text-right bg-blue-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-blue-700 font-semibold rounded-r-md">
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
                    <div className="w-28 text-center bg-blue-50">
                      ${person.pvr.toLocaleString()}
                    </div>
                    <div className="w-28 text-center bg-blue-50">{person.vscPen}%</div>
                    <div className="w-28 text-center bg-blue-50">{person.gapPen}%</div>
                    <div className="w-28 text-center bg-blue-50">{person.ppmPen}%</div>
                    <div className="w-24 text-center bg-blue-50">{person.ppd}</div>
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
            <CardTitle className="text-lg font-medium flex items-center text-black">
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
                      <th className="font-medium text-white py-2 pl-3 text-center bg-gray-700 w-12 border-r border-gray-600">
                        #
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-gray-600">
                        Last Name
                      </th>
                      <th className="font-medium text-white py-2 pl-4 pr-2 text-left bg-gray-700 border-r border-gray-600">
                        Deal #
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-gray-600">
                        Stock #
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-gray-600">
                        Date
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-gray-600">
                        VIN
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-gray-600">
                        N/U/CPO
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-left bg-gray-700 border-r border-gray-600">
                        Lender
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        Front End
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        VSC
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        PPM
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        GAP
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        T&W/Bundle
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 border-r border-gray-600">
                        PPD
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        PVR
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-600">
                        Total
                      </th>
                      <th className="font-medium text-white py-2 px-2 text-center bg-gray-700 w-20 border-r border-gray-600">
                        Status
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

                      // Get individual product profits - ensure we handle both number and string values
                      const vscProfit =
                        typeof dealData.vscProfit === 'number'
                          ? dealData.vscProfit
                          : parseFloat(dealData.vscProfit) ||
                            (deal.products.includes('Extended Warranty') ||
                            deal.products.includes('Vehicle Service Contract (VSC)')
                              ? Math.round(deal.profit * 0.35)
                              : 0);

                      const ppmProfit =
                        typeof dealData.ppmProfit === 'number'
                          ? dealData.ppmProfit
                          : parseFloat(dealData.ppmProfit) ||
                            (deal.products.includes('Paint Protection') ||
                            deal.products.includes('Paint and Fabric Protection') ||
                            deal.products.includes('PPM') ||
                            deal.products.includes('PrePaid Maintenance (PPM)')
                              ? Math.round(deal.profit * 0.2)
                              : 0);

                      const gapProfit =
                        typeof dealData.gapProfit === 'number'
                          ? dealData.gapProfit
                          : parseFloat(dealData.gapProfit) ||
                            (deal.products.includes('GAP Insurance')
                              ? Math.round(deal.profit * 0.25)
                              : 0);

                      const twProfit =
                        typeof dealData.tireAndWheelProfit === 'number'
                          ? dealData.tireAndWheelProfit
                          : parseFloat(dealData.tireAndWheelProfit) ||
                            (deal.products.includes('Tire & Wheel') ||
                            deal.products.includes('Tire & Wheel Bundle')
                              ? Math.round(deal.profit * 0.2)
                              : 0);

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
                          <td className="py-2 px-2 text-center font-medium bg-white border-r border-gray-200">
                            {deals.length - index}
                          </td>
                          <td className="py-2 px-2 text-left font-medium bg-white border-r border-gray-200">
                            {lastName}
                          </td>
                          <td className="py-2 pl-4 pr-2 text-left font-medium text-blue-600 bg-white border-r border-gray-200">
                            {dealData.dealNumber || deal.id}
                          </td>
                          <td className="py-2 px-2 text-left font-mono bg-white border-r border-gray-200">
                            {dealData.stockNumber || deal.id.replace('D', 'S')}
                          </td>
                          <td className="py-2 px-2 text-center text-gray-600 bg-white border-r border-gray-200">
                            {formattedDate}
                          </td>
                          <td className="py-2 px-2 text-left font-mono text-xs bg-white border-r border-gray-200">
                            {deal.vin ? `...${deal.vin.slice(-8)}` : dealData.vinLast8 || 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-center bg-white border-r border-gray-200">
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
                          <td className="py-2 px-2 text-left bg-white border-r border-gray-200">
                            {dealData.lender || 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-right bg-white font-medium border-r border-gray-200">
                            $
                            {(
                              dealData.frontEndGross || Math.round(deal.amount * 0.7)
                            ).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                            ${vscProfit.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                            ${ppmProfit.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                            ${gapProfit.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                            ${twProfit.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center bg-white font-medium border-r border-gray-200">
                            {ppd}
                          </td>
                          <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                            ${pvr.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-green-600 bg-white border-r border-gray-200">
                            ${deal.profit.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center bg-white border-r border-gray-200">
                            <select
                              value={status}
                              onChange={e => handleStatusChange(deal.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-500 ${statusColor}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Funded">Funded</option>
                              <option value="Unwound">Unwound</option>
                              <option value="Dead Deal">Dead Deal</option>
                            </select>
                          </td>
                          <td className="py-2 px-2 text-center bg-white">
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
                      <td colSpan={9} className="py-2 pl-4 text-left">
                        TOTALS
                      </td>
                      <td className="py-2 px-2 text-right bg-blue-50">
                        $
                        {deals
                          .slice(0, 10)
                          .reduce((sum, deal) => {
                            const dealData = deal as any;
                            const vscProfit =
                              typeof dealData.vscProfit === 'number'
                                ? dealData.vscProfit
                                : parseFloat(dealData.vscProfit) ||
                                  (deal.products.includes('Extended Warranty') ||
                                  deal.products.includes('Vehicle Service Contract (VSC)')
                                    ? Math.round(deal.profit * 0.35)
                                    : 0);
                            return sum + vscProfit;
                          }, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right bg-blue-50">
                        $
                        {deals
                          .slice(0, 10)
                          .reduce((sum, deal) => {
                            const dealData = deal as any;
                            const ppmProfit =
                              typeof dealData.ppmProfit === 'number'
                                ? dealData.ppmProfit
                                : parseFloat(dealData.ppmProfit) ||
                                  (deal.products.includes('Paint Protection') ||
                                  deal.products.includes('Paint and Fabric Protection') ||
                                  deal.products.includes('PPM') ||
                                  deal.products.includes('PrePaid Maintenance (PPM)')
                                    ? Math.round(deal.profit * 0.2)
                                    : 0);
                            return sum + ppmProfit;
                          }, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right bg-blue-50">
                        $
                        {deals
                          .slice(0, 10)
                          .reduce((sum, deal) => {
                            const dealData = deal as any;
                            const gapProfit =
                              typeof dealData.gapProfit === 'number'
                                ? dealData.gapProfit
                                : parseFloat(dealData.gapProfit) ||
                                  (deal.products.includes('GAP Insurance')
                                    ? Math.round(deal.profit * 0.25)
                                    : 0);
                            return sum + gapProfit;
                          }, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right bg-amber-50">
                        $
                        {deals
                          .slice(0, 10)
                          .reduce((sum, deal) => {
                            const dealData = deal as any;
                            const twProfit =
                              typeof dealData.tireAndWheelProfit === 'number'
                                ? dealData.tireAndWheelProfit
                                : parseFloat(dealData.tireAndWheelProfit) ||
                                  (deal.products.includes('Tire & Wheel') ||
                                  deal.products.includes('Tire & Wheel Bundle')
                                    ? Math.round(deal.profit * 0.2)
                                    : 0);
                            return sum + twProfit;
                          }, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-center bg-blue-50">
                        {(
                          deals.slice(0, 10).reduce((sum, deal) => sum + deal.products.length, 0) /
                          Math.max(1, deals.slice(0, 10).length)
                        ).toFixed(1)}
                      </td>
                      <td className="py-2 px-2 text-right bg-blue-50">
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
            <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-500 to-gray-600">
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
            <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-500 to-gray-600">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center text-white">
                  <Target className="mr-2 h-5 w-5 text-white" />
                  Goal Tracker
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-white text-gray-700">
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
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
