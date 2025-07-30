import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '../../hooks/use-toast';
import { EnhancedPayPlanManager } from '../payplan/EnhancedPayPlanManager';
import {
  DollarSign,
  Calculator,
  FileText,
  TrendingUp,
  PieChart,
  Percent,
  ChevronUp,
  ChevronDown,
  BarChart4,
  CreditCard,
  PlusCircle,
  Lightbulb,
  Users,
  Target,
  Crown,
  Calendar,
  Edit,
  Eye,
  Settings,
  Trophy,
  Clock,
  Building,
  UserCheck,
  ArrowRight,
  Filter,
  MoreVertical,
  Star,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import DealLogPage from '../../pages/DealLogPage';

interface FinanceManager {
  id: string;
  name: string;
  email: string;
  deals_processed: number;
  mtd_revenue: number;
  ppd: number;
  pvr: number;
  status: 'active' | 'inactive';
  schedule: string;
  performance_rating: 'excellent' | 'good' | 'needs_improvement';
  vsc_penetration: number;
}

interface DepartmentMetrics {
  total_fi_gross: number;
  deals_processed: number;
  products_per_deal: number;
  per_vehicle_retail: number;
  mtd_growth: number;
  team_performance: 'excellent' | 'good' | 'needs_improvement';
  total_vsc_penetration: number;
  penetration_rate: number;
}

// Lenders list from DealLogPage - matches the dropdown options
const LENDERS = [
  'Ally Bank',
  'American Credit Acceptance',
  'Americredit',
  'Bank of America',
  'Capital One',
  'Chase',
  'Chrysler Capital',
  'Crescent Bank',
  'Exeter',
  'First Help Financial',
  'Ford Motor Credit',
  'Global Lending Services',
  'Huntington National Bank',
  'Hyundai Financial',
  'Navy Federal',
  'Other',
  'PNC Bank',
  'Prestige Financial Services',
  'Regional Acceptance',
  'Santander',
  'Stellantis',
  'TD Auto',
  'Tesla',
  'Toyota Credit',
  'Truist',
  'US Bank',
  'USAA',
  'Wells Fargo',
  'Westlake Financial Services',
];

interface Deal {
  id: string;
  customer_name: string;
  vehicle: string;
  salesperson: string;
  finance_manager: string;
  fi_gross: number;
  products: string[];
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  deal_type: 'new' | 'used';
  lender: string;
}

// Deals by Lender Component
const DealsByLenderComponent: React.FC<{ deals: Deal[] }> = ({ deals }) => {
  const [showAll, setShowAll] = useState(false);

  // Process deals to count by lender
  const lenderCounts = deals.reduce((acc, deal) => {
    const lenderName = deal.lender || 'Unknown';
    
    if (!acc[lenderName]) {
      acc[lenderName] = 0;
    }
    acc[lenderName]++;
    return acc;
  }, {} as Record<string, number>);

  // Sort lenders by deal count
  const sortedLenders = Object.entries(lenderCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([lender, count], index) => ({ lender, count, rank: index + 1 }));

  const topLenders = sortedLenders.slice(0, 5);
  const displayLenders = showAll ? sortedLenders : topLenders;

  const totalDeals = deals.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {displayLenders.map(({ lender, count, rank }) => (
          <div key={lender} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">#{rank}</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{lender}</h4>
                <p className="text-sm text-gray-500">
                  {((count / totalDeals) * 100).toFixed(1)}% of total deals
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500">deals</div>
            </div>
          </div>
        ))}
      </div>

      {sortedLenders.length > 5 && (
        <div className="pt-3 border-t">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
            size="sm"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Top 5 Only
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                View All Lenders ({sortedLenders.length})
              </>
            )}
          </Button>
        </div>
      )}

      {totalDeals === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No deals found for the selected period</p>
        </div>
      )}
    </div>
  );
};

const FinanceDirectorDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLogDealForm, setShowLogDealForm] = useState(false);
  const [timePeriod, setTimePeriod] = useState<string>('this-month');
  const [selectedManager, setSelectedManager] = useState<string>('all');

  // Mock data - replace with actual API calls
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics>({
    total_fi_gross: 125000,
    deals_processed: 87,
    products_per_deal: 2.4,
    per_vehicle_retail: 1437,
    mtd_growth: 12.5,
    team_performance: 'excellent',
    total_vsc_penetration: 78.5,
    penetration_rate: 78.5,
  });

  const [financeManagers, setFinanceManagers] = useState<FinanceManager[]>([
    {
      id: 'fm1',
      name: 'John Valentine',
      email: 'john.valentine@dealership.com',
      deals_processed: 32,
      mtd_revenue: 45000,
      ppd: 2.8,
      pvr: 1406,
      status: 'active',
      schedule: '9am - 6pm',
      performance_rating: 'excellent',
      vsc_penetration: 85,
    },
    {
      id: 'fm2',
      name: 'Lloyd Hatter',
      email: 'lloyd.hatter@dealership.com',
      deals_processed: 28,
      mtd_revenue: 38000,
      ppd: 2.2,
      pvr: 1357,
      status: 'active',
      schedule: '11am - 8pm',
      performance_rating: 'good',
      vsc_penetration: 72,
    },
    {
      id: 'fm3',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@dealership.com',
      deals_processed: 27,
      mtd_revenue: 42000,
      ppd: 2.6,
      pvr: 1556,
      status: 'active',
      schedule: '10am - 7pm',
      performance_rating: 'excellent',
      vsc_penetration: 78,
    },
  ]);

  const [recentDeals, setRecentDeals] = useState<Deal[]>([
    {
      id: 'D001',
      customer_name: 'Smith, John',
      vehicle: '2024 Honda Accord',
      salesperson: 'Mike Davis',
      finance_manager: 'John Valentine',
      fi_gross: 2400,
      products: ['Extended Warranty', 'GAP Insurance'],
      date: '2024-01-15',
      status: 'completed',
      deal_type: 'new',
      lender: 'Bank of America',
    },
    {
      id: 'D002',
      customer_name: 'Johnson, Mary',
      vehicle: '2023 Toyota Camry',
      salesperson: 'Lisa Chen',
      finance_manager: 'Lloyd Hatter',
      fi_gross: 1800,
      products: ['Paint Protection', 'Tire & Wheel'],
      date: '2024-01-15',
      status: 'completed',
      deal_type: 'used',
      lender: 'Navy Federal',
    },
    {
      id: 'D003',
      customer_name: 'Williams, Bob',
      vehicle: '2024 Ford F-150',
      salesperson: 'Tom Wilson',
      finance_manager: 'Sarah Johnson',
      fi_gross: 3200,
      products: ['Extended Warranty', 'GAP Insurance', 'Paint Protection'],
      date: '2024-01-14',
      status: 'completed',
      deal_type: 'new',
      lender: 'Ford Motor Credit',
    },
    {
      id: 'D004',
      customer_name: 'Davis, Jennifer',
      vehicle: '2023 Nissan Altima',
      salesperson: 'Sarah Miller',
      finance_manager: 'John Valentine',
      fi_gross: 1950,
      products: ['Extended Warranty', 'PPM'],
      date: '2024-01-14',
      status: 'pending',
      deal_type: 'used',
      lender: 'Wells Fargo',
    },
    {
      id: 'D005',
      customer_name: 'Brown, Michael',
      vehicle: '2024 Chevrolet Silverado',
      salesperson: 'Kevin Johnson',
      finance_manager: 'Sarah Johnson',
      fi_gross: 2800,
      products: ['GAP Insurance', 'Tire & Wheel', 'Paint Protection'],
      date: '2024-01-13',
      status: 'completed',
      deal_type: 'new',
      lender: 'Chrysler Capital',
    },
    {
      id: 'D006',
      customer_name: 'Wilson, Sarah',
      vehicle: '2024 Honda CR-V',
      salesperson: 'David Lee',
      finance_manager: 'John Valentine',
      fi_gross: 2200,
      products: ['Extended Warranty', 'GAP Insurance'],
      date: '2024-01-13',
      status: 'completed',
      deal_type: 'new',
      lender: 'Chase',
    },
    {
      id: 'D007',
      customer_name: 'Taylor, James',
      vehicle: '2023 Toyota RAV4',
      salesperson: 'Amy Chen',
      finance_manager: 'Lloyd Hatter',
      fi_gross: 1650,
      products: ['Paint Protection'],
      date: '2024-01-12',
      status: 'completed',
      deal_type: 'used',
      lender: 'Navy Federal',
    },
    {
      id: 'D008',
      customer_name: 'Anderson, Lisa',
      vehicle: '2024 Ford Explorer',
      salesperson: 'Mike Davis',
      finance_manager: 'Sarah Johnson',
      fi_gross: 2900,
      products: ['Extended Warranty', 'GAP Insurance', 'Tire & Wheel'],
      date: '2024-01-12',
      status: 'completed',
      deal_type: 'new',
      lender: 'Toyota Credit',
    },
    {
      id: 'D009',
      customer_name: 'Garcia, Carlos',
      vehicle: '2023 Hyundai Elantra',
      salesperson: 'Lisa Chen',
      finance_manager: 'John Valentine',
      fi_gross: 1750,
      products: ['Extended Warranty'],
      date: '2024-01-11',
      status: 'completed',
      deal_type: 'used',
      lender: 'Ally Bank',
    },
    {
      id: 'D010',
      customer_name: 'Miller, Robert',
      vehicle: '2024 BMW X3',
      salesperson: 'Tom Wilson',
      finance_manager: 'Sarah Johnson',
      fi_gross: 3500,
      products: ['Extended Warranty', 'GAP Insurance', 'Paint Protection', 'Tire & Wheel'],
      date: '2024-01-11',
      status: 'completed',
      deal_type: 'new',
      lender: 'Cash',
    },
    {
      id: 'D011',
      customer_name: 'Thompson, Karen',
      vehicle: '2023 Subaru Outback',
      salesperson: 'Sarah Miller',
      finance_manager: 'Lloyd Hatter',
      fi_gross: 2100,
      products: ['Extended Warranty', 'GAP Insurance'],
      date: '2024-01-10',
      status: 'completed',
      deal_type: 'used',
      lender: 'PNC Bank',
    },
    {
      id: 'D012',
      customer_name: 'Rodriguez, Maria',
      vehicle: '2024 Mazda CX-5',
      salesperson: 'Kevin Johnson',
      finance_manager: 'John Valentine',
      fi_gross: 2400,
      products: ['Extended Warranty', 'Paint Protection'],
      date: '2024-01-10',
      status: 'completed',
      deal_type: 'new',
      lender: 'Capital One',
    },
  ]);

  // Check the URL to see if we should show the log deal form
  useEffect(() => {
    if (
      location.pathname.includes('/log-deal') ||
      location.pathname.includes('/deal-log') ||
      location.pathname.includes('/finance-director-deal-log')
    ) {
      setShowLogDealForm(true);
    } else {
      setShowLogDealForm(false);
    }
  }, [location.pathname]);

  const handleLogNewDealClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/finance-director/log-deal');
  };

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

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case 'needs_improvement':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDealTypeBadge = (type: string) => {
    switch (type) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'used':
        return <Badge className="bg-purple-100 text-purple-800">Used</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getVSCIcon = (penetration: number) => {
    if (penetration >= 80) return <Star className="w-4 h-4 text-yellow-500 fill-current" />;
    if (penetration >= 70) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (penetration >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  // If showing the log deal form, render it instead of the normal dashboard
  if (showLogDealForm) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Finance Director Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Finance Director: {user?.email?.split('@')[0] || 'Not Assigned'}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/dashboard/finance-director')}
          >
            Back to Dashboard
          </Button>
        </div>
        <DealLogPage dashboardType="finance-director" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Dashboard header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Crown className="w-8 h-8 mr-3 text-purple-600" />
                Finance Director Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Finance Director: {user?.email?.split('@')[0] || 'Not Assigned'}
              </p>
            </div>

            {/* Finance Leadership Tip */}
            <div className="bg-blue-50 p-2 rounded-md mt-2 md:mt-0 border border-blue-100 max-w-2xl">
              <p className="text-xs italic text-blue-800">
                <Lightbulb className="h-3 w-3 inline-block mr-1" />
                <strong>Leadership Tip:</strong> Regular one-on-ones with your F&I managers help
                identify training opportunities and boost team performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Period selector and Log Deal button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-3">{getPeriodLabel(timePeriod)}</h2>
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

        <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleLogNewDealClick}>
          <span className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" />
            Log New Deal
          </span>
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Quick View</TabsTrigger>
          <TabsTrigger value="leaderboard">F&I DAS Board</TabsTrigger>
          <TabsTrigger value="deals">Department Deals</TabsTrigger>
          <TabsTrigger value="managers">F&I Manager</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="payplans">Pay Plans</TabsTrigger>
        </TabsList>

        {/* Quick View Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Department Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Department F&I Gross
                </CardTitle>
                <DollarSign className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${departmentMetrics.total_fi_gross.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />+{departmentMetrics.mtd_growth}%
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">Deals Processed</CardTitle>
                <FileText className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departmentMetrics.deals_processed}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(departmentMetrics.deals_processed / financeManagers.length)} avg per
                  manager
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Products Per Deal (PPD)
                </CardTitle>
                <BarChart4 className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departmentMetrics.products_per_deal}</div>
                <p className="text-xs text-muted-foreground">Target: 2.5 products per deal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Per Vehicle Retail (PVR)
                </CardTitle>
                <Calculator className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${departmentMetrics.per_vehicle_retail}</div>
                <p className="text-xs text-muted-foreground">Department average</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Total VSC Penetration
                </CardTitle>
                <Star className="h-5 w-5 text-yellow-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departmentMetrics.total_vsc_penetration}%</div>
                <p className="text-xs text-muted-foreground">Department average penetration</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Finance Penetration Rate
                </CardTitle>
                <Percent className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departmentMetrics.penetration_rate}%</div>
                <p className="text-xs text-muted-foreground">Financed vs cash deals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md flex flex-row items-center justify-between space-y-0 py-2">
                <CardTitle className="text-lg font-semibold text-white">Team Performance</CardTitle>
                <Users className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getPerformanceBadge(departmentMetrics.team_performance)}
                </div>
                <p className="text-xs text-muted-foreground">Overall department rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Deals by Lender and Team Performance Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deals by Lender */}
            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md py-2">
                <CardTitle className="flex items-center text-white text-lg font-semibold">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Deals by Lender
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Top lenders and deal distribution for {getPeriodLabel(timePeriod)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DealsByLenderComponent deals={recentDeals} />
              </CardContent>
            </Card>

            {/* Team Performance Overview */}
            <Card>
              <CardHeader className="bg-blue-600 rounded-t-md py-2">
                <CardTitle className="flex items-center text-white text-lg font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  Team Performance Overview
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Current performance status:{' '}
                  {getPerformanceBadge(departmentMetrics.team_performance)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financeManagers.map(manager => (
                    <div key={manager.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{manager.name}</h4>
                        <div className="flex items-center space-x-1">
                          {getVSCIcon(manager.vsc_penetration)}
                          <Badge variant={manager.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {manager.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deals:</span>
                          <span className="font-medium">{manager.deals_processed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-medium">${(manager.mtd_revenue / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">PPD:</span>
                          <span className="font-medium">{manager.ppd}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">PVR:</span>
                          <span className="font-medium">${manager.pvr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VSC:</span>
                          <span className="font-medium">{manager.vsc_penetration}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <span className="text-xs">{getPerformanceBadge(manager.performance_rating)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Deals Log - Full Width */}
          <Card className="mt-6 border hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Department Deals Log
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs px-2"
                onClick={() => setSelectedTab('deals')}
              >
                View All Deals
              </Button>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              <div className="flex">
                <div className="flex-grow overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs">
                        <th className="font-medium text-white py-2 pl-3 text-center bg-blue-500 w-12 border-r border-gray-600 rounded-tl-md">
                          #
                        </th>
                        <th className="font-medium text-white py-2 pl-4 pr-2 text-left bg-blue-500 border-r border-gray-600">
                          Deal #
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-left bg-blue-500 border-r border-gray-600">
                          Stock #
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-left bg-blue-500 border-r border-gray-600">
                          Customer
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                          Date
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                          Type
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                          F&I Manager
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-right bg-blue-500 border-r border-gray-600">
                          F&I Gross
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                          PPD
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600">
                          Lender
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-gray-600 w-20">
                          Status
                        </th>
                        <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 rounded-tr-md">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDeals.slice(0, 10).map((deal, index) => (
                        <tr
                          key={deal.id}
                          className={`group border-b ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <td className="py-2 pl-3 text-center text-gray-600">
                            {index + 1}
                          </td>
                          <td className="py-2 pl-4 pr-2 text-left font-medium">
                            {deal.id}
                          </td>
                          <td className="py-2 px-2 text-left">S{Math.floor(Math.random() * 9000) + 1000}</td>
                          <td className="py-2 px-2 text-left">{deal.customer_name}</td>
                          <td className="py-2 px-2 text-center text-xs">
                            {new Date(deal.date).toLocaleDateString('en-US', { 
                              month: '2-digit', 
                              day: '2-digit', 
                              year: '2-digit' 
                            })}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              deal.deal_type === 'new' 
                                ? 'bg-blue-100 text-blue-700' 
                                : deal.deal_type === 'used'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {deal.deal_type === 'new' ? 'N' : deal.deal_type === 'used' ? 'U' : 'C'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center text-xs">
                            {deal.finance_manager.split(' ').map(n => n[0]).join('')}
                          </td>
                          <td className="py-2 px-2 text-right font-medium text-green-600">
                            ${deal.fi_gross.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {deal.products.length}
                          </td>
                          <td className="py-2 px-2 text-center text-xs">
                            {deal.lender.length > 15 ? deal.lender.substring(0, 15) + '...' : deal.lender}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              deal.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : deal.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {deal.status === 'completed' ? 'Funded' : deal.status === 'pending' ? 'Pending' : 'Cancelled'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2 hover:bg-blue-100"
                              onClick={() => navigate(`/deal/${deal.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* F&I Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader className="bg-blue-600 rounded-t-md py-2">
              <CardTitle className="flex items-center text-white text-lg font-semibold">
                <Trophy className="w-5 h-5 mr-2 text-yellow-300" />
                F&I DAS Board
              </CardTitle>
              <CardDescription className="text-blue-100">
                Performance rankings for {getPeriodLabel(timePeriod)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Finance Manager</TableHead>
                    <TableHead className="text-right">Deals</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">PPD</TableHead>
                    <TableHead className="text-right">PVR</TableHead>
                    <TableHead className="text-right">VSC Penetration</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeManagers
                    .sort((a, b) => b.mtd_revenue - a.mtd_revenue)
                    .map((manager, index) => (
                      <TableRow key={manager.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 mr-1" />}
                            {index === 1 && <Trophy className="w-4 h-4 text-gray-400 mr-1" />}
                            {index === 2 && <Trophy className="w-4 h-4 text-amber-600 mr-1" />}
                            <span className="font-medium">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{manager.name}</div>
                            <div className="text-sm text-muted-foreground">{manager.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {manager.deals_processed}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${manager.mtd_revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{manager.ppd}</TableCell>
                        <TableCell className="text-right">${manager.pvr}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {getVSCIcon(manager.vsc_penetration)}
                            <span>{manager.vsc_penetration}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {getPerformanceBadge(manager.performance_rating)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Deals Tab */}
        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader className="bg-blue-600 rounded-t-md py-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-white text-lg font-semibold">
                    <FileText className="w-5 h-5 mr-2" />
                    All Department Deals
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Complete view of all F&I deals for {getPeriodLabel(timePeriod)}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Managers</SelectItem>
                      {financeManagers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>F&I Manager</TableHead>
                    <TableHead className="text-right">F&I Gross</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Lender</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDeals
                    .filter(
                      deal =>
                        selectedManager === 'all' || deal.finance_manager.includes(selectedManager)
                    )
                    .map(deal => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.id}</TableCell>
                        <TableCell>{deal.customer_name}</TableCell>
                        <TableCell>{deal.vehicle}</TableCell>
                        <TableCell>{getDealTypeBadge(deal.deal_type)}</TableCell>
                        <TableCell>{deal.salesperson}</TableCell>
                        <TableCell>{deal.finance_manager}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${deal.fi_gross.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {deal.products.slice(0, 2).map((product, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                            {deal.products.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{deal.products.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {deal.lender}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(deal.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(deal.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Manager Deals Tab */}
        <TabsContent value="managers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {financeManagers.map(manager => (
              <Card key={manager.id}>
                <CardHeader className="bg-blue-600 rounded-t-md py-2">
                  <CardTitle className="flex items-center justify-between text-white text-lg font-semibold">
                    <span>{manager.name}</span>
                    <div className="flex items-center space-x-2">
                      {getVSCIcon(manager.vsc_penetration)}
                      <Badge variant={manager.status === 'active' ? 'default' : 'secondary'}>
                        {manager.status}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-blue-100">{manager.email}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {manager.deals_processed}
                        </div>
                        <div className="text-xs text-blue-600">Deals</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${manager.mtd_revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">Revenue</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{manager.ppd}</div>
                        <div className="text-xs text-purple-600">PPD</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">${manager.pvr}</div>
                        <div className="text-xs text-orange-600">PVR</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {manager.vsc_penetration}%
                        </div>
                        <div className="text-xs text-yellow-600">VSC Penetration</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-bold text-indigo-600">
                          {getPerformanceBadge(manager.performance_rating)}
                        </div>
                        <div className="text-xs text-indigo-600">Rating</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Individual Deals
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader className="bg-blue-600 rounded-t-md py-2">
              <CardTitle className="flex items-center text-white text-lg font-semibold">
                <Calendar className="w-5 h-5 mr-2" />
                F&I Manager Schedules
              </CardTitle>
              <CardDescription className="text-blue-100">
                View and edit finance manager schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {financeManagers.map(manager => (
                  <div key={manager.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{manager.name}</h4>
                        <p className="text-sm text-muted-foreground">Current: {manager.schedule}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Schedule
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="text-center p-2 border rounded">
                          <div className="text-xs font-medium">{day}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {index < 5 ? manager.schedule : index === 5 ? '9am - 5pm' : 'Off'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pay Plans Tab */}
        <TabsContent value="payplans" className="space-y-6">
          <Card>
            <CardHeader className="bg-blue-600 rounded-t-md py-2">
              <CardTitle className="flex items-center text-white text-lg font-semibold">
                <Settings className="w-5 h-5 mr-2" />
                Pay Plan Management
              </CardTitle>
              <CardDescription className="text-blue-100">
                Limited access: Add/remove monthly bonuses for finance managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Limited Access</h4>
                    <p className="text-sm text-yellow-700">
                      As Finance Director, you can add/remove monthly bonuses but cannot modify base
                      pay plan structures.
                    </p>
                  </div>
                </div>
              </div>

              <EnhancedPayPlanManager
                dealershipId={dealershipId || 'default'}
                isGroupAdmin={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDirectorDashboard;
