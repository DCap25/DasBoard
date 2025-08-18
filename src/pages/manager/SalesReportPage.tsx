import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
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
import {
  ChevronLeft,
  Download,
  Calendar,
  LineChart,
  BarChart,
  // PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Users,
  ArrowUp,
  ArrowDown,
  FileText,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckSquare,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';

// Sample monthly sales data
const MONTHLY_SALES = [
  { month: 'Jan', newVehicles: 42, usedVehicles: 38, totalSales: 80, avgGross: 1820 },
  { month: 'Feb', newVehicles: 38, usedVehicles: 35, totalSales: 73, avgGross: 1750 },
  { month: 'Mar', newVehicles: 45, usedVehicles: 40, totalSales: 85, avgGross: 1780 },
  { month: 'Apr', newVehicles: 48, usedVehicles: 42, totalSales: 90, avgGross: 1850 },
  { month: 'May', newVehicles: 52, usedVehicles: 48, totalSales: 100, avgGross: 1930 },
  { month: 'Jun', newVehicles: 58, usedVehicles: 52, totalSales: 110, avgGross: 2100 },
];

// Sample team performance data
const TEAM_PERFORMANCE = [
  {
    team: 'Team A',
    members: 3,
    totalSales: 62,
    salesPerMember: 20.7,
    grossProfit: 124500,
    avgGross: 2008,
    closingRatio: 32,
  },
  {
    team: 'Team B',
    members: 2,
    totalSales: 38,
    salesPerMember: 19,
    grossProfit: 74100,
    avgGross: 1950,
    closingRatio: 28,
  },
];

// Sample salesperson data
const SALESPERSON_DATA = [
  {
    id: 1,
    name: 'Sarah Johnson',
    team: 'Team A',
    newVehicles: 24,
    usedVehicles: 10,
    totalSales: 34,
    grossProfit: 68500,
    avgGross: 2015,
    closingRatio: 35,
  },
  {
    id: 2,
    name: 'Michael Chen',
    team: 'Team A',
    newVehicles: 18,
    usedVehicles: 8,
    totalSales: 26,
    grossProfit: 52000,
    avgGross: 2000,
    closingRatio: 30,
  },
  {
    id: 3,
    name: 'David Rodriguez',
    team: 'Team A',
    newVehicles: 14,
    usedVehicles: 8,
    totalSales: 22,
    grossProfit: 44000,
    avgGross: 2000,
    closingRatio: 28,
  },
  {
    id: 4,
    name: 'Amanda Williams',
    team: 'Team B',
    newVehicles: 12,
    usedVehicles: 8,
    totalSales: 20,
    grossProfit: 38000,
    avgGross: 1900,
    closingRatio: 27,
  },
  {
    id: 5,
    name: 'Robert Johnson',
    team: 'Team B',
    newVehicles: 10,
    usedVehicles: 8,
    totalSales: 18,
    grossProfit: 36100,
    avgGross: 2006,
    closingRatio: 29,
  },
];

// Sample inventory data
const INVENTORY_DATA = {
  newVehicles: {
    total: 120,
    inTransit: 15,
    sold: 58,
    available: 47,
    reserved: 10,
    daysOnLot: 32,
  },
  usedVehicles: {
    total: 85,
    inTransit: 8,
    sold: 52,
    available: 25,
    reserved: 5,
    daysOnLot: 24,
  },
};

// Sample types of sold vehicles
const VEHICLE_TYPES_SOLD = [
  { type: 'Sedan', count: 42, percentage: 38 },
  { type: 'SUV', count: 35, percentage: 32 },
  { type: 'Truck', count: 18, percentage: 16 },
  { type: 'Crossover', count: 10, percentage: 9 },
  { type: 'Luxury', count: 5, percentage: 5 },
];

// Sample finance data
const FINANCE_DATA = {
  totalFinanced: 92,
  cashDeals: 18,
  avgRate: 4.2,
  frontEndAvg: 1460,
  backEndAvg: 880,
  warrantyPenetration: 68,
  gapPenetration: 72,
};

// Sample detailed sales metrics data
const DETAILED_SALES_METRICS = {
  lastUpdate: '06/18/2025',
  totalSold: 23,
  totalBooked: 21,
  tracking: 42,
  currentFront: 10145,
  currentBack: 62438,
  total: 69006,
  avgFront: 483,
  avgBack: 2973,
  pvr: 3456,
  fiChargebacks: 1129,
  wholesaleProfitLoss: -2448,
  trackingGross: 154086,
  forecastGross: 159000,
  overUnderGross: -9914,
  trackingUnits: 42,
  forecastUnits: 55,
  overUnderUnits: -13,
};

// Sample store comparison data for single stores vs dealer groups
const STORE_COMPARISON_DATA = [
  {
    id: 1,
    name: 'Central Motors - Main Location',
    type: 'single',
    lastUpdate: '06/18/2025',
    metrics: {
      totalSold: 23,
      totalBooked: 21,
      tracking: 42,
      currentFront: 10145,
      currentBack: 62438,
      total: 69006,
      avgFront: 483,
      avgBack: 2973,
      pvr: 3456,
      fiChargebacks: 1129,
      wholesaleProfitLoss: -2448,
      trackingGross: 154086,
      forecastGross: 159000,
      overUnderGross: -9914,
      trackingUnits: 42,
      forecastUnits: 55,
      overUnderUnits: -13,
    },
  },
  {
    id: 2,
    name: 'Premier Auto Group',
    type: 'group',
    lastUpdate: '06/18/2025',
    metrics: {
      totalSold: 87,
      totalBooked: 79,
      tracking: 158,
      currentFront: 42580,
      currentBack: 198750,
      total: 241330,
      avgFront: 489,
      avgBack: 2284,
      pvr: 2773,
      fiChargebacks: 3890,
      wholesaleProfitLoss: -8920,
      trackingGross: 445320,
      forecastGross: 475000,
      overUnderGross: -29680,
      trackingUnits: 158,
      forecastUnits: 185,
      overUnderUnits: -27,
    },
  },
  {
    id: 3,
    name: 'AutoMax Dealerships',
    type: 'group',
    lastUpdate: '06/18/2025',
    metrics: {
      totalSold: 134,
      totalBooked: 127,
      tracking: 248,
      currentFront: 68920,
      currentBack: 312480,
      total: 381400,
      avgFront: 515,
      avgBack: 2333,
      pvr: 2848,
      fiChargebacks: 5670,
      wholesaleProfitLoss: -12350,
      trackingGross: 698540,
      forecastGross: 720000,
      overUnderGross: -21460,
      trackingUnits: 248,
      forecastUnits: 275,
      overUnderUnits: -27,
    },
  },
];

// Update the DEALER_GROUP_DATA to use a real dealership name and adjust colors
const DEALER_GROUP_DATA = [
  {
    id: 1,
    name: 'Central Motors - New Cars',
    isManagerStore: true,
    storeType: 'new', // Add type for styling
    lastUpdated: '2025-05-08 14:30',
    totalSold: 45,
    totalPending: 14,
    totalBooked: 38,
    tracking: 52,
    currentFrontGross: 68500,
    currentBackGross: 38500,
    totalGross: 107000,
    avgFront: 1522,
    avgBack: 856,
    pvr: 2378,
    trackingGross: 119000,
    forecastGross: 110000,
    overUnderGross: 9000,
    trackingUnits: 56,
    forecastUnits: 52,
    actualUnits: 52,
    overUnderUnits: 0,
    locations: [
      {
        id: 101,
        name: 'Downtown Branch - New Cars',
        lastUpdated: '2025-05-08 14:15',
        totalSold: 24,
        totalPending: 7,
        totalBooked: 19,
        tracking: 26,
        currentFrontGross: 36750,
        currentBackGross: 20800,
        totalGross: 57550,
        avgFront: 1531,
        avgBack: 867,
        pvr: 2398,
        trackingGross: 62500,
        forecastGross: 58000,
        overUnderGross: 4500,
        trackingUnits: 28,
        forecastUnits: 26,
        actualUnits: 26,
        overUnderUnits: 0,
      },
      {
        id: 102,
        name: 'Westside Branch - New Cars',
        lastUpdated: '2025-05-08 14:30',
        totalSold: 21,
        totalPending: 7,
        totalBooked: 19,
        tracking: 26,
        currentFrontGross: 31750,
        currentBackGross: 17700,
        totalGross: 49450,
        avgFront: 1512,
        avgBack: 843,
        pvr: 2355,
        trackingGross: 56500,
        forecastGross: 52000,
        overUnderGross: 4500,
        trackingUnits: 28,
        forecastUnits: 26,
        actualUnits: 26,
        overUnderUnits: 0,
      },
    ],
  },
  {
    id: 2,
    name: 'Central Motors - Used Cars',
    isManagerStore: true,
    storeType: 'used', // Add type for styling
    lastUpdated: '2025-05-08 14:45',
    totalSold: 33,
    totalPending: 10,
    totalBooked: 27,
    tracking: 37,
    currentFrontGross: 44000,
    currentBackGross: 27300,
    totalGross: 71300,
    avgFront: 1333,
    avgBack: 827,
    pvr: 2160,
    trackingGross: 79000,
    forecastGross: 75000,
    overUnderGross: 4000,
    trackingUnits: 39,
    forecastUnits: 38,
    actualUnits: 37,
    overUnderUnits: -1,
    locations: [
      {
        id: 201,
        name: 'Downtown Branch - Used Cars',
        lastUpdated: '2025-05-08 14:15',
        totalSold: 17,
        totalPending: 5,
        totalBooked: 13,
        tracking: 19,
        currentFrontGross: 23000,
        currentBackGross: 14000,
        totalGross: 37000,
        avgFront: 1353,
        avgBack: 824,
        pvr: 2177,
        trackingGross: 41500,
        forecastGross: 37000,
        overUnderGross: 4500,
        trackingUnits: 20,
        forecastUnits: 19,
        actualUnits: 19,
        overUnderUnits: 0,
      },
      {
        id: 202,
        name: 'Westside Branch - Used Cars',
        lastUpdated: '2025-05-08 14:30',
        totalSold: 16,
        totalPending: 5,
        totalBooked: 14,
        tracking: 18,
        currentFrontGross: 21000,
        currentBackGross: 13300,
        totalGross: 34300,
        avgFront: 1313,
        avgBack: 831,
        pvr: 2144,
        trackingGross: 37500,
        forecastGross: 38000,
        overUnderGross: -500,
        trackingUnits: 19,
        forecastUnits: 19,
        actualUnits: 18,
        overUnderUnits: -1,
      },
    ],
  },
  {
    id: 3,
    name: 'North Region Dealerships',
    isManagerStore: false,
    storeType: 'other', // Add type for styling
    lastUpdated: '2025-05-08 13:45',
    totalSold: 64,
    totalPending: 19,
    totalBooked: 55,
    tracking: 72,
    currentFrontGross: 95200,
    currentBackGross: 52600,
    totalGross: 147800,
    avgFront: 1487,
    avgBack: 822,
    pvr: 2309,
    trackingGross: 165000,
    forecastGross: 160000,
    overUnderGross: 5000,
    trackingUnits: 78,
    forecastUnits: 75,
    actualUnits: 72,
    overUnderUnits: -3,
    locations: [
      {
        id: 301,
        name: 'North City Branch',
        lastUpdated: '2025-05-08 13:45',
        totalSold: 36,
        totalPending: 10,
        totalBooked: 30,
        tracking: 40,
        currentFrontGross: 54000,
        currentBackGross: 29600,
        totalGross: 83600,
        avgFront: 1500,
        avgBack: 822,
        pvr: 2322,
        trackingGross: 93000,
        forecastGross: 90000,
        overUnderGross: 3000,
        trackingUnits: 42,
        forecastUnits: 40,
        actualUnits: 40,
        overUnderUnits: 0,
      },
      {
        id: 302,
        name: 'Eastside Branch',
        lastUpdated: '2025-05-08 13:30',
        totalSold: 28,
        totalPending: 9,
        totalBooked: 25,
        tracking: 32,
        currentFrontGross: 41200,
        currentBackGross: 23000,
        totalGross: 64200,
        avgFront: 1471,
        avgBack: 821,
        pvr: 2292,
        trackingGross: 72000,
        forecastGross: 70000,
        overUnderGross: 2000,
        trackingUnits: 36,
        forecastUnits: 35,
        actualUnits: 32,
        overUnderUnits: -3,
      },
    ],
  },
  {
    id: 4,
    name: 'Premier Auto - New Division',
    isManagerStore: false,
    storeType: 'new',
    lastUpdated: '2025-05-08 13:20',
    totalSold: 38,
    totalPending: 12,
    totalBooked: 32,
    tracking: 44,
    currentFrontGross: 58200,
    currentBackGross: 32100,
    totalGross: 90300,
    avgFront: 1532,
    avgBack: 845,
    pvr: 2377,
    trackingGross: 101500,
    forecastGross: 95000,
    overUnderGross: 6500,
    trackingUnits: 48,
    forecastUnits: 44,
    actualUnits: 44,
    overUnderUnits: 0,
    locations: [],
  },
  {
    id: 5,
    name: 'AutoMax New Cars',
    isManagerStore: false,
    storeType: 'new',
    lastUpdated: '2025-05-08 12:45',
    totalSold: 29,
    totalPending: 9,
    totalBooked: 25,
    tracking: 34,
    currentFrontGross: 44800,
    currentBackGross: 24600,
    totalGross: 69400,
    avgFront: 1545,
    avgBack: 848,
    pvr: 2393,
    trackingGross: 78000,
    forecastGross: 72000,
    overUnderGross: 6000,
    trackingUnits: 37,
    forecastUnits: 34,
    actualUnits: 34,
    overUnderUnits: 0,
    locations: [],
  },
  {
    id: 6,
    name: 'Premier Auto - Used Division',
    isManagerStore: false,
    storeType: 'used',
    lastUpdated: '2025-05-08 13:15',
    totalSold: 41,
    totalPending: 13,
    totalBooked: 35,
    tracking: 46,
    currentFrontGross: 52300,
    currentBackGross: 33100,
    totalGross: 85400,
    avgFront: 1276,
    avgBack: 807,
    pvr: 2083,
    trackingGross: 96000,
    forecastGross: 90000,
    overUnderGross: 6000,
    trackingUnits: 50,
    forecastUnits: 46,
    actualUnits: 46,
    overUnderUnits: 0,
    locations: [],
  },
  {
    id: 7,
    name: 'AutoMax Used Cars',
    isManagerStore: false,
    storeType: 'used',
    lastUpdated: '2025-05-08 12:30',
    totalSold: 35,
    totalPending: 11,
    totalBooked: 30,
    tracking: 39,
    currentFrontGross: 43500,
    currentBackGross: 28800,
    totalGross: 72300,
    avgFront: 1243,
    avgBack: 823,
    pvr: 2066,
    trackingGross: 81000,
    forecastGross: 78000,
    overUnderGross: 3000,
    trackingUnits: 42,
    forecastUnits: 39,
    actualUnits: 39,
    overUnderUnits: 0,
    locations: [],
  },
];

// Update the SalesPerformanceSummary component to include tabs for different views
const SalesPerformanceSummary = ({ data }) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'comparison'

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = value => {
    return value.toLocaleString();
  };

  // Cards view (original view)
  const CardsView = () => (
    <div className="space-y-3">
      {/* Render Central Motors - New Cars first */}
      {data.find(group => group.id === 1) && (
        <DealerGroupSummary key={1} dealerGroup={data.find(group => group.id === 1)} />
      )}

      {/* Render Central Motors - Used Cars second */}
      {data.find(group => group.id === 2) && (
        <DealerGroupSummary key={2} dealerGroup={data.find(group => group.id === 2)} />
      )}

      {/* Render all other dealerships */}
      {data
        .filter(group => group.id !== 1 && group.id !== 2)
        .map(dealerGroup => (
          <DealerGroupSummary key={dealerGroup.id} dealerGroup={dealerGroup} />
        ))}
    </div>
  );

  // Comparison table view (new side-by-side view with metrics as rows, dealerships as columns)
  const ComparisonView = () => {
    // Separate dealerships by type
    const newCarDealerships = data.filter(dealer => dealer.storeType === 'new');
    const usedCarDealerships = data.filter(dealer => dealer.storeType === 'used');
    const mixedDealerships = data.filter(
      dealer => dealer.storeType !== 'new' && dealer.storeType !== 'used'
    );

    // Define metrics to display based on deal log data and forecasts
    const metrics = [
      { key: 'lastUpdated', label: 'Last Updated', format: 'date' },
      { key: 'totalSold', label: 'Total Sold', format: 'number' },
      { key: 'totalBooked', label: 'Total Booked/Funded', format: 'number' },
      { key: 'tracking', label: 'Tracking', format: 'number', highlight: true },
      { key: 'currentFrontGross', label: 'Current Front Gross', format: 'currency' },
      { key: 'currentBackGross', label: 'Current Back Gross', format: 'currency' },
      { key: 'totalGross', label: 'Current Total Gross', format: 'currency', color: 'green' },
      { key: 'avgFront', label: 'Avg Front Gross', format: 'currency' },
      { key: 'avgBack', label: 'Avg Back Gross', format: 'currency' },
      { key: 'pvr', label: 'Total PVR', format: 'currency', color: 'blue' },
      { key: 'trackingGross', label: 'Tracking Gross', format: 'currency', highlight: true },
      { key: 'forecastGross', label: 'Forecast Gross', format: 'currency' },
      { key: 'overUnderGross', label: 'Over/Under Gross', format: 'currency', conditional: true },
      { key: 'trackingUnits', label: 'Tracking Units', format: 'number', highlight: true },
      { key: 'forecastUnits', label: 'Forecast Units', format: 'number' },
      { key: 'overUnderUnits', label: 'Over/Under Units', format: 'number', conditional: true },
    ];

    const formatValue = (value, format, conditional = false) => {
      if (format === 'currency') {
        return formatCurrency(value);
      } else if (format === 'number') {
        return formatNumber(value);
      } else if (format === 'date') {
        return value; // Already formatted as string in the data
      }
      return value;
    };

    const getValueClassName = (value, color, conditional = false, highlight = false) => {
      let className = 'text-center font-medium';

      if (highlight) {
        className += ' text-amber-600 bg-yellow-50';
      } else if (conditional) {
        className += value < 0 ? ' text-red-600' : ' text-green-600';
      } else if (color === 'green') {
        className += ' text-green-600';
      } else if (color === 'blue') {
        className += ' text-blue-600';
      }

      return className;
    };

    const renderComparisonTable = (dealerships, title, bgColor) => {
      if (dealerships.length === 0) return null;

      return (
        <div className="mb-6">
          <h4 className={`text-lg font-semibold mb-3 px-3 py-2 ${bgColor} rounded-t-lg border-b`}>
            {title}
          </h4>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-40 font-semibold sticky left-0 bg-gray-50 z-10">
                    Metric
                  </TableHead>
                  {dealerships.map(dealer => (
                    <TableHead key={dealer.id} className="text-center font-semibold min-w-32">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{dealer.name}</span>
                        {dealer.isManagerStore && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Your Store
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-semibold bg-gray-100 min-w-32">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map(metric => (
                  <TableRow key={metric.key} className="hover:bg-gray-50">
                    <TableCell className="font-medium sticky left-0 bg-white z-10 border-r">
                      {metric.label}
                    </TableCell>
                    {dealerships.map(dealer => (
                      <TableCell
                        key={dealer.id}
                        className={getValueClassName(
                          dealer[metric.key],
                          metric.color,
                          metric.conditional,
                          metric.highlight
                        )}
                      >
                        {formatValue(dealer[metric.key], metric.format, metric.conditional)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-semibold bg-gray-50">
                      {metric.key === 'lastUpdated'
                        ? 'Various'
                        : metric.format === 'currency' &&
                            !['avgFront', 'avgBack', 'pvr'].includes(metric.key)
                          ? formatCurrency(
                              dealerships.reduce((sum, dealer) => sum + dealer[metric.key], 0)
                            )
                          : metric.format === 'number'
                            ? formatNumber(
                                dealerships.reduce((sum, dealer) => sum + dealer[metric.key], 0)
                              )
                            : ['avgFront', 'avgBack', 'pvr'].includes(metric.key)
                              ? formatCurrency(
                                  dealerships.reduce((sum, dealer) => sum + dealer[metric.key], 0) /
                                    dealerships.length
                                )
                              : '--'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* New Cars Section */}
        {renderComparisonTable(
          newCarDealerships,
          '🚗 New Cars Performance',
          'bg-blue-50 text-blue-800'
        )}

        {/* Used Cars Section */}
        {renderComparisonTable(
          usedCarDealerships,
          '🚙 Used Cars Performance',
          'bg-green-50 text-green-800'
        )}

        {/* Mixed/Other Dealerships Section */}
        {mixedDealerships.length > 0 &&
          renderComparisonTable(
            mixedDealerships,
            '🏢 Mixed Dealerships',
            'bg-gray-50 text-gray-800'
          )}

        {/* Overall Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h4 className="font-semibold text-gray-700 mb-3">📊 Overall Performance Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-gray-600 block">Total Units Sold</span>
              <span className="font-bold text-lg text-blue-600">
                {formatNumber(data.reduce((sum, dealer) => sum + dealer.totalSold, 0))}
              </span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-gray-600 block">Total Gross</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(data.reduce((sum, dealer) => sum + dealer.totalGross, 0))}
              </span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-gray-600 block">Avg PVR</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(data.reduce((sum, dealer) => sum + dealer.pvr, 0) / data.length)}
              </span>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <span className="text-gray-600 block">Total Over/Under</span>
              <span
                className={`font-bold text-lg ${
                  data.reduce((sum, dealer) => sum + dealer.overUnderGross, 0) < 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {formatCurrency(data.reduce((sum, dealer) => sum + dealer.overUnderGross, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-5">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Sales Performance</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              Cards View
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('comparison')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Comparison Table
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {viewMode === 'cards' ? <CardsView /> : <ComparisonView />}
      </CardContent>
    </Card>
  );
};

// Update the DealerGroupSummary component to be more compact and use different colors
const DealerGroupSummary = ({ dealerGroup }) => {
  // Set isExpanded to true by default only for the manager's stores
  const [isExpanded, setIsExpanded] = useState(dealerGroup.isManagerStore);

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get background and border colors based on store type
  const getStoreColors = () => {
    switch (dealerGroup.storeType) {
      case 'new':
        return {
          headerBg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          highlight: 'bg-blue-50',
        };
      case 'used':
        return {
          headerBg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800',
          highlight: 'bg-green-50',
        };
      default:
        return {
          headerBg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800',
          highlight: 'bg-gray-50',
        };
    }
  };

  const colors = getStoreColors();

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className={`border rounded-lg overflow-hidden shadow-sm ${colors.border} ${
          dealerGroup.isManagerStore ? '' : 'text-sm'
        }`}
      >
        {/* Header section with dealership name and last updated */}
        <div className={`${colors.headerBg} border-b`}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <h3 className="font-semibold">{dealerGroup.name}</h3>
                {dealerGroup.isManagerStore && (
                  <span className={`ml-2 px-2 py-0.5 text-xs ${colors.badge} rounded-full`}>
                    Your Store
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {dealerGroup.lastUpdated}
              </div>
            </div>
          </CollapsibleTrigger>
        </div>

        {/* Only show the content if expanded */}
        {isExpanded && (
          <div className="px-3 py-3">
            {/* Top metrics row - more compact */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              <MetricCard
                label="Sold"
                value={dealerGroup.totalSold}
                icon={<Car className="h-3 w-3" />}
                color={
                  dealerGroup.storeType === 'new'
                    ? 'blue'
                    : dealerGroup.storeType === 'used'
                      ? 'green'
                      : 'gray'
                }
              />
              <MetricCard
                label="Booked"
                value={Math.floor(dealerGroup.totalBooked * 0.6)}
                icon={<CheckSquare className="h-3 w-3" />}
                color={
                  dealerGroup.storeType === 'new'
                    ? 'blue'
                    : dealerGroup.storeType === 'used'
                      ? 'green'
                      : 'gray'
                }
              />
              <MetricCard
                label="Pending"
                value={dealerGroup.totalPending}
                icon={<Clock className="h-3 w-3" />}
                color={
                  dealerGroup.storeType === 'new'
                    ? 'blue'
                    : dealerGroup.storeType === 'used'
                      ? 'green'
                      : 'gray'
                }
              />
              <MetricCard
                label="Tracking"
                value={dealerGroup.tracking}
                icon={<TrendingUp className="h-3 w-3" />}
                color={
                  dealerGroup.storeType === 'new'
                    ? 'blue'
                    : dealerGroup.storeType === 'used'
                      ? 'green'
                      : 'gray'
                }
              />
              <MetricCard
                label="Funded"
                value={Math.floor(dealerGroup.totalBooked * 0.4)}
                icon={<DollarSign className="h-3 w-3" />}
                color={
                  dealerGroup.storeType === 'new'
                    ? 'blue'
                    : dealerGroup.storeType === 'used'
                      ? 'green'
                      : 'gray'
                }
              />
            </div>

            {/* Revenue metrics - more compact */}
            <div className={`${colors.highlight} p-2 rounded-lg mb-3`}>
              <h4 className="font-medium text-xs text-gray-500 mb-2">REVENUE</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Front Gross</p>
                  <p className="text-base font-bold">
                    {formatCurrency(dealerGroup.currentFrontGross)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {formatCurrency(dealerGroup.avgFront)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Back Gross</p>
                  <p className="text-base font-bold">
                    {formatCurrency(dealerGroup.currentBackGross)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {formatCurrency(dealerGroup.avgBack)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Gross</p>
                  <p className="text-base font-bold">{formatCurrency(dealerGroup.totalGross)}</p>
                  <p className="text-xs text-gray-500">PVR: {formatCurrency(dealerGroup.pvr)}</p>
                </div>
              </div>
            </div>

            {/* Forecast vs Actual - more compact */}
            <div className={`${colors.highlight} p-2 rounded-lg`}>
              <h4 className="font-medium text-xs text-gray-500 mb-2">FORECAST VS ACTUAL</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h5 className="font-medium text-xs mb-1">Gross Revenue</h5>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div>
                      <span className="text-gray-500">Tracking:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(dealerGroup.trackingGross)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Forecast:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(dealerGroup.forecastGross)}
                      </span>
                    </div>
                    <div
                      className={
                        dealerGroup.overUnderGross >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      <span className="mr-1">+/-:</span>
                      <span className="font-medium">
                        {dealerGroup.overUnderGross >= 0 ? '+' : ''}
                        {formatCurrency(dealerGroup.overUnderGross)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        dealerGroup.overUnderGross >= 0 ? 'bg-green-500' : 'bg-red-500'
                      } rounded-full`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.abs((dealerGroup.trackingGross / dealerGroup.forecastGross) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-xs mb-1">Units</h5>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div>
                      <span className="text-gray-500">Tracking:</span>
                      <span className="font-medium ml-1">{dealerGroup.trackingUnits}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Forecast:</span>
                      <span className="font-medium ml-1">{dealerGroup.forecastUnits}</span>
                    </div>
                    <div
                      className={
                        dealerGroup.overUnderUnits >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      <span className="mr-1">+/-:</span>
                      <span className="font-medium">
                        {dealerGroup.overUnderUnits >= 0 ? '+' : ''}
                        {dealerGroup.overUnderUnits}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        dealerGroup.overUnderUnits >= 0 ? 'bg-green-500' : 'bg-red-500'
                      } rounded-full`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.abs((dealerGroup.trackingUnits / dealerGroup.forecastUnits) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locations section only visible when expanded */}
        <CollapsibleContent>
          <div className="border-t">
            <div className={`px-3 py-2 ${colors.headerBg} border-b`}>
              <h4 className="font-medium text-xs">
                Dealership Locations ({dealerGroup.locations.length})
              </h4>
            </div>

            {dealerGroup.locations.map((location, index) => (
              <div
                key={location.id}
                className={`px-3 py-2 ${
                  index < dealerGroup.locations.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex justify-between mb-2">
                  <h5 className="font-medium text-sm">{location.name}</h5>
                  <div className="text-xs text-gray-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {location.lastUpdated}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-2 text-xs">
                  <div className="p-1">
                    <p className="text-gray-500 uppercase font-medium">Sold</p>
                    <p className="font-bold">{location.totalSold}</p>
                  </div>
                  <div className="p-1">
                    <p className="text-gray-500 uppercase font-medium">Booked</p>
                    <p className="font-bold">{Math.floor(location.totalBooked * 0.6)}</p>
                  </div>
                  <div className="p-1">
                    <p className="text-gray-500 uppercase font-medium">Pending</p>
                    <p className="font-bold">{location.totalPending}</p>
                  </div>
                  <div className="p-1">
                    <p className="text-gray-500 uppercase font-medium">Tracking</p>
                    <p className="font-bold">{location.tracking}</p>
                  </div>
                  <div className="p-1">
                    <p className="text-gray-500 uppercase font-medium">Funded</p>
                    <p className="font-bold">{Math.floor(location.totalBooked * 0.4)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className={`${colors.highlight} p-1 rounded flex justify-between`}>
                    <span className="text-gray-500">Front:</span>
                    <span className="font-medium">
                      {formatCurrency(location.currentFrontGross)}
                    </span>
                  </div>
                  <div className={`${colors.highlight} p-1 rounded flex justify-between`}>
                    <span className="text-gray-500">Back:</span>
                    <span className="font-medium">{formatCurrency(location.currentBackGross)}</span>
                  </div>
                  <div className={`${colors.highlight} p-1 rounded flex justify-between`}>
                    <span className="text-gray-500">Total:</span>
                    <span className="font-medium">{formatCurrency(location.totalGross)}</span>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <div className={`flex-1 ${colors.highlight} p-1 rounded flex justify-between`}>
                    <span className="text-gray-500">PVR:</span>
                    <span className="font-medium">{formatCurrency(location.pvr)}</span>
                  </div>
                  <div className={`flex-1 ${colors.highlight} p-1 rounded flex justify-between`}>
                    <span className="text-gray-500">Gross +/-:</span>
                    <span
                      className={
                        location.overUnderGross >= 0
                          ? 'text-green-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {location.overUnderGross >= 0 ? '+' : ''}
                      {formatCurrency(location.overUnderGross)}
                    </span>
                  </div>
                  <div className={`flex-1 ${colors.highlight} p-1 rounded flex justify-between`}>
                    <span className="text-gray-500">Units +/-:</span>
                    <span
                      className={
                        location.overUnderUnits >= 0
                          ? 'text-green-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {location.overUnderUnits >= 0 ? '+' : ''}
                      {location.overUnderUnits}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Update MetricCard to be more compact and use appropriate colors
// Detailed Sales Report Component
const DetailedSalesReport = () => {
  const [selectedView, setSelectedView] = useState('single'); // 'single' or 'group'
  const [selectedStore, setSelectedStore] = useState(STORE_COMPARISON_DATA[0]);

  const formatCurrency = value => {
    if (value < 0) {
      return `-$${Math.abs(value).toLocaleString()}`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = value => {
    return value.toLocaleString();
  };

  // Filter stores based on selected view
  const filteredStores = STORE_COMPARISON_DATA.filter(store => store.type === selectedView);

  // Highlighted metrics (with yellow background)
  const highlightedMetrics = [
    'tracking',
    'wholesaleProfitLoss',
    'overUnderGross',
    'trackingUnits',
    'forecastUnits',
    'overUnderUnits',
  ];

  const MetricRow = ({
    label,
    value,
    isHighlighted = false,
    isCurrency = false,
    isNegative = false,
  }) => (
    <div
      className={`grid grid-cols-2 py-3 px-4 border-b border-gray-100 ${
        isHighlighted ? 'bg-yellow-50' : 'bg-white'
      } hover:bg-gray-50 transition-colors`}
    >
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div
        className={`text-sm font-semibold text-right ${
          isNegative ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {isCurrency ? formatCurrency(value) : formatNumber(value)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Selection and Store Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Detailed Sales Report</h2>
          <p className="text-sm text-gray-600">
            Comprehensive sales metrics for performance tracking
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-44">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Stores</SelectItem>
              <SelectItem value="group">Dealer Groups</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedStore.id.toString()}
            onValueChange={value =>
              setSelectedStore(filteredStores.find(store => store.id.toString() === value))
            }
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filteredStores.map(store => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Metrics Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedStore.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Last Update: {selectedStore.lastUpdate}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedStore.type === 'single'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {selectedStore.type === 'single' ? 'Single Store' : 'Dealer Group'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden">
              <MetricRow label="Total Sold" value={selectedStore.metrics.totalSold} />
              <MetricRow label="Total Booked" value={selectedStore.metrics.totalBooked} />
              <MetricRow
                label="Tracking"
                value={selectedStore.metrics.tracking}
                isHighlighted={true}
              />
              <MetricRow
                label="Current Front"
                value={selectedStore.metrics.currentFront}
                isCurrency={true}
              />
              <MetricRow
                label="Current Back"
                value={selectedStore.metrics.currentBack}
                isCurrency={true}
              />
              <MetricRow label="Total" value={selectedStore.metrics.total} isCurrency={true} />
              <MetricRow
                label="Avg Front"
                value={selectedStore.metrics.avgFront}
                isCurrency={true}
              />
              <MetricRow label="Avg Back" value={selectedStore.metrics.avgBack} isCurrency={true} />
              <MetricRow label="PVR" value={selectedStore.metrics.pvr} isCurrency={true} />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Metrics Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Performance Analysis</CardTitle>
            <p className="text-sm text-gray-600">Key performance indicators and forecasts</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-lg overflow-hidden">
              <MetricRow
                label="F&I Charge Backs"
                value={selectedStore.metrics.fiChargebacks}
                isCurrency={true}
              />
              <MetricRow
                label="Wholesale Profit / Loss (+/-)"
                value={selectedStore.metrics.wholesaleProfitLoss}
                isCurrency={true}
                isHighlighted={true}
                isNegative={selectedStore.metrics.wholesaleProfitLoss < 0}
              />
              <MetricRow
                label="Tracking Gross"
                value={selectedStore.metrics.trackingGross}
                isCurrency={true}
                isHighlighted={true}
              />
              <MetricRow
                label="Forecast Gross"
                value={selectedStore.metrics.forecastGross}
                isCurrency={true}
                isHighlighted={true}
              />
              <MetricRow
                label="Over/Under Gross"
                value={selectedStore.metrics.overUnderGross}
                isCurrency={true}
                isHighlighted={true}
                isNegative={selectedStore.metrics.overUnderGross < 0}
              />
              <MetricRow
                label="Tracking Units"
                value={selectedStore.metrics.trackingUnits}
                isHighlighted={true}
              />
              <MetricRow
                label="Forecast Units"
                value={selectedStore.metrics.forecastUnits}
                isHighlighted={true}
              />
              <MetricRow
                label="Over/Under Units"
                value={selectedStore.metrics.overUnderUnits}
                isHighlighted={true}
                isNegative={selectedStore.metrics.overUnderUnits < 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards for Quick Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{selectedStore.metrics.totalSold}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedStore.metrics.total)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PVR</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedStore.metrics.pvr)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${
            selectedStore.metrics.overUnderGross < 0 ? 'border-l-red-500' : 'border-l-green-500'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Over/Under</p>
                <p
                  className={`text-2xl font-bold ${
                    selectedStore.metrics.overUnderGross < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(selectedStore.metrics.overUnderGross)}
                </p>
              </div>
              {selectedStore.metrics.overUnderGross < 0 ? (
                <TrendingDown className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingUp className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table for Multiple Stores/Groups */}
      {selectedView === 'group' && (
        <Card>
          <CardHeader>
            <CardTitle>Dealer Group Comparison</CardTitle>
            <p className="text-sm text-gray-600">Compare performance across dealer groups</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer Group</TableHead>
                    <TableHead className="text-right">Total Sold</TableHead>
                    <TableHead className="text-right">Total Gross</TableHead>
                    <TableHead className="text-right">PVR</TableHead>
                    <TableHead className="text-right">Over/Under Gross</TableHead>
                    <TableHead className="text-right">Over/Under Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STORE_COMPARISON_DATA.filter(store => store.type === 'group').map(store => (
                    <TableRow key={store.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell className="text-right">{store.metrics.totalSold}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(store.metrics.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(store.metrics.pvr)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          store.metrics.overUnderGross < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatCurrency(store.metrics.overUnderGross)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          store.metrics.overUnderUnits < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {store.metrics.overUnderUnits}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, icon, color = 'blue' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white p-2 rounded-lg border shadow-sm">
      <div className="flex items-center gap-1 mb-1">
        <div className={`p-1 rounded-md ${getColorClasses()}`}>{icon}</div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
};

const SalesReportPage = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Calculate monthly totals
  const calculateMonthlyTotals = () => {
    const latestMonth = MONTHLY_SALES[MONTHLY_SALES.length - 1];
    const previousMonth = MONTHLY_SALES[MONTHLY_SALES.length - 2];

    const newVehicleChange =
      ((latestMonth.newVehicles - previousMonth.newVehicles) / previousMonth.newVehicles) * 100;
    const usedVehicleChange =
      ((latestMonth.usedVehicles - previousMonth.usedVehicles) / previousMonth.usedVehicles) * 100;
    const totalSalesChange =
      ((latestMonth.totalSales - previousMonth.totalSales) / previousMonth.totalSales) * 100;
    const avgGrossChange =
      ((latestMonth.avgGross - previousMonth.avgGross) / previousMonth.avgGross) * 100;

    return {
      newVehicles: {
        count: latestMonth.newVehicles,
        change: newVehicleChange,
      },
      usedVehicles: {
        count: latestMonth.usedVehicles,
        change: usedVehicleChange,
      },
      totalSales: {
        count: latestMonth.totalSales,
        change: totalSalesChange,
      },
      avgGross: {
        value: latestMonth.avgGross,
        change: avgGrossChange,
      },
    };
  };

  const monthlyTotals = calculateMonthlyTotals();

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/dashboard/sales-manager">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Sales Reports</h1>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Add the Sales Performance Summary component */}
      <SalesPerformanceSummary data={DEALER_GROUP_DATA} />

      {/* Monthly Totals */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Vehicles Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTotals.newVehicles.count}</div>
            <div className="flex items-center text-xs mt-1">
              {monthlyTotals.newVehicles.change > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{monthlyTotals.newVehicles.change.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {monthlyTotals.newVehicles.change.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Used Vehicles Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTotals.usedVehicles.count}</div>
            <div className="flex items-center text-xs mt-1">
              {monthlyTotals.usedVehicles.change > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{monthlyTotals.usedVehicles.change.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {monthlyTotals.usedVehicles.change.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyTotals.totalSales.count}</div>
            <div className="flex items-center text-xs mt-1">
              {monthlyTotals.totalSales.change > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{monthlyTotals.totalSales.change.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {monthlyTotals.totalSales.change.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Gross Per Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyTotals.avgGross.value}</div>
            <div className="flex items-center text-xs mt-1">
              {monthlyTotals.avgGross.change > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{monthlyTotals.avgGross.change.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">{monthlyTotals.avgGross.change.toFixed(1)}%</span>
                </>
              )}
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">
            <LineChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team Performance
          </TabsTrigger>
          <TabsTrigger value="individual">
            <Users className="h-4 w-4 mr-2" />
            Individual Performance
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Car className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="h-4 w-4 mr-2" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="detailed">
            <FileText className="h-4 w-4 mr-2" />
            Detailed Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex justify-center items-center h-full text-center text-gray-500">
                  [Sales Trend Chart - Interactive line chart showing sales trends over the past 6
                  months]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex justify-center items-center h-full text-center text-gray-500">
                  [Vehicle Types Pie Chart - Distribution of vehicle types sold]
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {VEHICLE_TYPES_SOLD.map(type => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="text-sm">{type.type}</div>
                      <div className="text-sm font-medium">{type.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">New Vehicles</TableHead>
                    <TableHead className="text-right">Used Vehicles</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Avg. Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MONTHLY_SALES.map(month => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-right">{month.newVehicles}</TableCell>
                      <TableCell className="text-right">{month.usedVehicles}</TableCell>
                      <TableCell className="text-right">{month.totalSales}</TableCell>
                      <TableCell className="text-right">${month.avgGross}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Team Performance Comparison</h3>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="Team A">Team A</SelectItem>
                <SelectItem value="Team B">Team B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex justify-center items-center h-full text-center text-gray-500">
                  [Team Sales Comparison Chart - Bar chart comparing teams]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex justify-center items-center h-full text-center text-gray-500">
                  [Team Performance Radar Chart - Comparing multiple metrics]
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Sales/Member</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead className="text-right">Avg. Gross</TableHead>
                    <TableHead className="text-right">Closing %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TEAM_PERFORMANCE.map(team => (
                    <TableRow key={team.team}>
                      <TableCell className="font-medium">{team.team}</TableCell>
                      <TableCell className="text-right">{team.members}</TableCell>
                      <TableCell className="text-right">{team.totalSales}</TableCell>
                      <TableCell className="text-right">{team.salesPerMember.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        ${team.grossProfit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">${team.avgGross}</TableCell>
                      <TableCell className="text-right">{team.closingRatio}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Individual Salesperson Performance</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead className="text-right">Used</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead className="text-right">Avg. Gross</TableHead>
                    <TableHead className="text-right">Closing %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SALESPERSON_DATA.map(person => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{person.team}</TableCell>
                      <TableCell className="text-right">{person.newVehicles}</TableCell>
                      <TableCell className="text-right">{person.usedVehicles}</TableCell>
                      <TableCell className="text-right">{person.totalSales}</TableCell>
                      <TableCell className="text-right">
                        ${person.grossProfit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">${person.avgGross}</TableCell>
                      <TableCell className="text-right">{person.closingRatio}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>New Vehicle Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Total Inventory</div>
                    <div className="text-2xl font-bold">{INVENTORY_DATA.newVehicles.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Avg. Days on Lot</div>
                    <div className="text-2xl font-bold">{INVENTORY_DATA.newVehicles.daysOnLot}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Available</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.newVehicles.available} (
                        {Math.round(
                          (INVENTORY_DATA.newVehicles.available /
                            INVENTORY_DATA.newVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.newVehicles.available /
                              INVENTORY_DATA.newVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Sold</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.newVehicles.sold} (
                        {Math.round(
                          (INVENTORY_DATA.newVehicles.sold / INVENTORY_DATA.newVehicles.total) * 100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.newVehicles.sold / INVENTORY_DATA.newVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Reserved</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.newVehicles.reserved} (
                        {Math.round(
                          (INVENTORY_DATA.newVehicles.reserved / INVENTORY_DATA.newVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.newVehicles.reserved /
                              INVENTORY_DATA.newVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">In Transit</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.newVehicles.inTransit} (
                        {Math.round(
                          (INVENTORY_DATA.newVehicles.inTransit /
                            INVENTORY_DATA.newVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.newVehicles.inTransit /
                              INVENTORY_DATA.newVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Used Vehicle Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Total Inventory</div>
                    <div className="text-2xl font-bold">{INVENTORY_DATA.usedVehicles.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Avg. Days on Lot</div>
                    <div className="text-2xl font-bold">
                      {INVENTORY_DATA.usedVehicles.daysOnLot}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Available</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.usedVehicles.available} (
                        {Math.round(
                          (INVENTORY_DATA.usedVehicles.available /
                            INVENTORY_DATA.usedVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.usedVehicles.available /
                              INVENTORY_DATA.usedVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Sold</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.usedVehicles.sold} (
                        {Math.round(
                          (INVENTORY_DATA.usedVehicles.sold / INVENTORY_DATA.usedVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.usedVehicles.sold / INVENTORY_DATA.usedVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Reserved</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.usedVehicles.reserved} (
                        {Math.round(
                          (INVENTORY_DATA.usedVehicles.reserved /
                            INVENTORY_DATA.usedVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.usedVehicles.reserved /
                              INVENTORY_DATA.usedVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">In Transit</span>
                      <span className="text-sm font-medium">
                        {INVENTORY_DATA.usedVehicles.inTransit} (
                        {Math.round(
                          (INVENTORY_DATA.usedVehicles.inTransit /
                            INVENTORY_DATA.usedVehicles.total) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${
                            (INVENTORY_DATA.usedVehicles.inTransit /
                              INVENTORY_DATA.usedVehicles.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Finance Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCE_DATA.totalFinanced}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(
                    (FINANCE_DATA.totalFinanced /
                      (FINANCE_DATA.totalFinanced + FINANCE_DATA.cashDeals)) *
                      100
                  )}
                  % of total deals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCE_DATA.cashDeals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(
                    (FINANCE_DATA.cashDeals /
                      (FINANCE_DATA.totalFinanced + FINANCE_DATA.cashDeals)) *
                      100
                  )}
                  % of total deals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{FINANCE_DATA.avgRate}%</div>
                <p className="text-xs text-green-600 mt-1">0.3% lower than last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Front End vs Back End</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <div className="flex justify-center items-center h-full text-center text-gray-500">
                  [Front End vs Back End Chart - Comparison of front-end vs back-end profit]
                </div>
                <div className="grid grid-cols-2 gap-8 mt-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Front End Avg</div>
                    <div className="text-xl font-bold">${FINANCE_DATA.frontEndAvg}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Back End Avg</div>
                    <div className="text-xl font-bold">${FINANCE_DATA.backEndAvg}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Penetration</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Warranty</span>
                      <span className="font-medium">{FINANCE_DATA.warrantyPenetration}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${FINANCE_DATA.warrantyPenetration}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">GAP Insurance</span>
                      <span className="font-medium">{FINANCE_DATA.gapPenetration}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${FINANCE_DATA.gapPenetration}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <DetailedSalesReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReportPage;
