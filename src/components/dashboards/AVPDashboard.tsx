import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAuthenticated, getCurrentUser } from '../../lib/directAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useToast } from '../../hooks/use-toast';
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
  Building2,
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
  MapPin,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  Goal,
  UserPlus,
  ClipboardList,
  BarChart3,
  LineChart,
  Activity,
} from 'lucide-react';
import DealLogPage from '../../pages/DealLogPage';

interface Dealership {
  id: string;
  name: string;
  location: string;
  general_manager: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  monthly_goal: number;
  ytd_units: number;
  mtd_units: number;
  front_gross: number;
  back_gross: number;
  total_gross: number;
  new_units: number;
  used_units: number;
  cpo_units: number;
  front_pvr: number;
  back_pvr: number;
  performance_rating: 'excellent' | 'good' | 'needs_improvement';
}

interface DistrictMetrics {
  total_dealerships: number;
  active_dealerships: number;
  total_gross_profit: number;
  total_units: number;
  district_front_pvr: number;
  district_back_pvr: number;
  goal_achievement: number;
  top_performer: string;
  mtd_growth: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: 'salesperson' | 'finance_manager';
  dealership: string;
  deals_processed: number;
  revenue: number;
  performance_rating: 'excellent' | 'good' | 'needs_improvement';
  schedule: string;
  goals: {
    monthly_deals: number;
    current_deals: number;
    monthly_revenue: number;
    current_revenue: number;
  };
}

const AVPDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedDealership, setSelectedDealership] = useState<string>('all');
  const [showSalesBoard, setShowSalesBoard] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>('this-month');

  // Mock data - replace with actual API calls
  const [districtMetrics, setDistrictMetrics] = useState<DistrictMetrics>({
    total_dealerships: 5,
    active_dealerships: 5,
    total_gross_profit: 2450000,
    total_units: 1247,
    district_front_pvr: 2850,
    district_back_pvr: 1420,
    goal_achievement: 87.5,
    top_performer: 'Downtown Toyota',
    mtd_growth: 15.2,
  });

  const [dealerships, setDealerships] = useState<Dealership[]>([
    {
      id: 'deal1',
      name: 'Downtown Toyota',
      location: 'Downtown District',
      general_manager: 'Michael Johnson',
      phone: '(555) 123-4567',
      email: 'mjohnson@downtowntoyota.com',
      status: 'active',
      monthly_goal: 250,
      ytd_units: 2847,
      mtd_units: 247,
      front_gross: 485000,
      back_gross: 245000,
      total_gross: 730000,
      new_units: 147,
      used_units: 85,
      cpo_units: 15,
      front_pvr: 2950,
      back_pvr: 1485,
      performance_rating: 'excellent',
    },
    {
      id: 'deal2',
      name: 'Westside Honda',
      location: 'West District',
      general_manager: 'Sarah Williams',
      phone: '(555) 234-5678',
      email: 'swilliams@westsidehonda.com',
      status: 'active',
      monthly_goal: 200,
      ytd_units: 2156,
      mtd_units: 189,
      front_gross: 378000,
      back_gross: 189000,
      total_gross: 567000,
      new_units: 112,
      used_units: 65,
      cpo_units: 12,
      front_pvr: 2750,
      back_pvr: 1350,
      performance_rating: 'good',
    },
    {
      id: 'deal3',
      name: 'Northside Ford',
      location: 'North District',
      general_manager: 'David Chen',
      phone: '(555) 345-6789',
      email: 'dchen@northsideford.com',
      status: 'active',
      monthly_goal: 180,
      ytd_units: 1987,
      mtd_units: 165,
      front_gross: 342000,
      back_gross: 171000,
      total_gross: 513000,
      new_units: 98,
      used_units: 55,
      cpo_units: 12,
      front_pvr: 2650,
      back_pvr: 1285,
      performance_rating: 'good',
    },
    {
      id: 'deal4',
      name: 'Southside Chevrolet',
      location: 'South District',
      general_manager: 'Lisa Rodriguez',
      phone: '(555) 456-7890',
      email: 'lrodriguez@southsidechevy.com',
      status: 'active',
      monthly_goal: 220,
      ytd_units: 2398,
      mtd_units: 198,
      front_gross: 425000,
      back_gross: 212000,
      total_gross: 637000,
      new_units: 118,
      used_units: 68,
      cpo_units: 12,
      front_pvr: 2800,
      back_pvr: 1395,
      performance_rating: 'excellent',
    },
    {
      id: 'deal5',
      name: 'Eastside Nissan',
      location: 'East District',
      general_manager: 'Robert Taylor',
      phone: '(555) 567-8901',
      email: 'rtaylor@eastsidenissan.com',
      status: 'active',
      monthly_goal: 160,
      ytd_units: 1756,
      mtd_units: 148,
      front_gross: 298000,
      back_gross: 149000,
      total_gross: 447000,
      new_units: 88,
      used_units: 48,
      cpo_units: 12,
      front_pvr: 2550,
      back_pvr: 1245,
      performance_rating: 'needs_improvement',
    },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'tm1',
      name: 'John Smith',
      role: 'salesperson',
      dealership: 'Downtown Toyota',
      deals_processed: 28,
      revenue: 84000,
      performance_rating: 'excellent',
      schedule: '9am - 6pm',
      goals: {
        monthly_deals: 30,
        current_deals: 28,
        monthly_revenue: 90000,
        current_revenue: 84000,
      },
    },
    {
      id: 'tm2',
      name: 'Jane Valentine',
      role: 'finance_manager',
      dealership: 'Downtown Toyota',
      deals_processed: 32,
      revenue: 45000,
      performance_rating: 'excellent',
      schedule: '9am - 6pm',
      goals: {
        monthly_deals: 35,
        current_deals: 32,
        monthly_revenue: 50000,
        current_revenue: 45000,
      },
    },
    // Add more team members as needed
  ]);

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

  const getGoalProgress = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            percentage >= 90 ? 'bg-blue-500' : percentage >= 70 ? 'bg-blue-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <>
      {/* Dashboard header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-600" />
            Area Vice President Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            AVP: {user?.email?.split('@')[0] || 'Not Assigned'} | District Overview
          </p>
        </div>
        {/* Leadership Tip */}
        <div className="bg-blue-50 p-2 rounded-md border border-blue-100 max-w-md mr-64">
          <p className="text-xs italic text-blue-800">
            <Lightbulb className="h-3 w-3 inline-block mr-1" />
            <strong>Leadership Tip:</strong> Focus on developing your General Managers - their
            success drives district performance.
          </p>
        </div>
      </div>

      {/* Period selector and Quick Actions */}
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

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Goal className="mr-2 h-4 w-4" />
            Set Goals
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedules
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">District View</TabsTrigger>
          <TabsTrigger value="dealerships">Dealerships</TabsTrigger>
          <TabsTrigger value="leaderboard">DAS Board</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="deals">Deal Log</TabsTrigger>
          <TabsTrigger value="metrics">Team Metrics</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        {/* District Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* District Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-white flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">Total Gross Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${districtMetrics.total_gross_profit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />+{districtMetrics.mtd_growth}%
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-white flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">Total Units</CardTitle>
                <BarChart4 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{districtMetrics.total_units}</div>
                <p className="text-xs text-muted-foreground">
                  Across {districtMetrics.active_dealerships} dealerships
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-white flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">District Front PVR</CardTitle>
                <Calculator className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${districtMetrics.district_front_pvr}</div>
                <p className="text-xs text-muted-foreground">Average across district</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="bg-white flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-black">District Back PVR</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${districtMetrics.district_back_pvr}</div>
                <p className="text-xs text-muted-foreground">F&I average</p>
              </CardContent>
            </Card>
          </div>

          {/* DAS Boards and Goal Achievement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Finance Das Board */}
            <Card>
              <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-black text-base font-medium flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Finance Das Board
                </CardTitle>
                <Button variant="outline" size="sm" className="h-8 text-xs px-2">
                  View All
                </Button>
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

            {/* District Goal Achievement */}
            <Card>
              <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg">
                <CardTitle className="flex items-center text-black text-base font-medium">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  District Goal Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{districtMetrics.goal_achievement}%</div>
                {getGoalProgress(districtMetrics.goal_achievement, 100)}
                <p className="text-sm text-muted-foreground mt-2">
                  {districtMetrics.goal_achievement >= 90
                    ? 'Exceeding expectations'
                    : districtMetrics.goal_achievement >= 70
                      ? 'On track'
                      : 'Needs attention'}
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Top Performing Store</h4>
                  <div className="text-xl font-bold mb-1">{districtMetrics.top_performer}</div>
                  <p className="text-sm text-muted-foreground">
                    Leading in overall performance this month
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sales Manager Das Board */}
            <Card>
              <CardHeader className="bg-white border-b border-gray-300 py-2 rounded-t-lg flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-black text-base font-medium flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Sales Manager Das Board
                </CardTitle>
                <Button variant="outline" size="sm" className="h-8 text-xs px-2">
                  View All
                </Button>
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
                          <div className="flex-[2] text-center">
                            ${manager.gross.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dealership Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Building className="w-5 h-5 mr-2" />
                Dealership Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dealerships.map(dealership => (
                  <div key={dealership.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{dealership.name}</h4>
                      {getPerformanceBadge(dealership.performance_rating)}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>GM:</span>
                        <span className="font-medium">{dealership.general_manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MTD Units:</span>
                        <span className="font-medium">{dealership.mtd_units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goal:</span>
                        <span className="font-medium">{dealership.monthly_goal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Gross:</span>
                        <span className="font-medium">
                          ${dealership.total_gross.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Goal Progress</div>
                        {getGoalProgress(dealership.mtd_units, dealership.monthly_goal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Dealerships Tab */}
        <TabsContent value="dealerships" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Individual Dealership Performance</h3>
            <Select value={selectedDealership} onValueChange={setSelectedDealership}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select dealership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dealerships</SelectItem>
                {dealerships.map(dealership => (
                  <SelectItem key={dealership.id} value={dealership.id}>
                    {dealership.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealership</TableHead>
                    <TableHead>General Manager</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">MTD Units</TableHead>
                    <TableHead className="text-right">Goal</TableHead>
                    <TableHead className="text-right">Front Gross</TableHead>
                    <TableHead className="text-right">Back Gross</TableHead>
                    <TableHead className="text-right">Front PVR</TableHead>
                    <TableHead className="text-right">Back PVR</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealerships
                    .filter(d => selectedDealership === 'all' || d.id === selectedDealership)
                    .map(dealership => (
                      <TableRow key={dealership.id}>
                        <TableCell className="font-medium">{dealership.name}</TableCell>
                        <TableCell>{dealership.general_manager}</TableCell>
                        <TableCell>{dealership.location}</TableCell>
                        <TableCell className="text-right font-medium">
                          {dealership.mtd_units}
                        </TableCell>
                        <TableCell className="text-right">{dealership.monthly_goal}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${dealership.front_gross.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${dealership.back_gross.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">${dealership.front_pvr}</TableCell>
                        <TableCell className="text-right">${dealership.back_pvr}</TableCell>
                        <TableCell className="text-right">
                          {getPerformanceBadge(dealership.performance_rating)}
                        </TableCell>
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

        {/* DAS Board Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">District Performance Board</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Sales</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSalesBoard(!showSalesBoard)}
                className="p-2"
              >
                {showSalesBoard ? (
                  <ToggleLeft className="w-4 h-4" />
                ) : (
                  <ToggleRight className="w-4 h-4" />
                )}
              </Button>
              <span className="text-sm">F&I</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                {showSalesBoard ? 'Sales Team' : 'F&I Team'} Leaderboard
              </CardTitle>
              <CardDescription>
                Top performers across all dealerships for {getPeriodLabel(timePeriod)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Dealership</TableHead>
                    <TableHead className="text-right">Deals</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Goal Progress</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers
                    .filter(member =>
                      showSalesBoard
                        ? member.role === 'salesperson'
                        : member.role === 'finance_manager'
                    )
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {index === 0 && <Trophy className="w-4 h-4 text-yellow-500 mr-1" />}
                            {index === 1 && <Trophy className="w-4 h-4 text-gray-400 mr-1" />}
                            {index === 2 && <Trophy className="w-4 h-4 text-amber-600 mr-1" />}
                            <span className="font-medium">#{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.dealership}</TableCell>
                        <TableCell className="text-right">{member.deals_processed}</TableCell>
                        <TableCell className="text-right">
                          ${member.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-20">
                            {getGoalProgress(
                              member.goals.current_deals,
                              member.goals.monthly_deals
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {getPerformanceBadge(member.performance_rating)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Calendar className="w-5 h-5 mr-2" />
                District Team Schedules
              </CardTitle>
              <CardDescription>View and manage schedules across all dealerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dealerships.map(dealership => (
                  <div key={dealership.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{dealership.name}</h4>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Schedules
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      GM: {dealership.general_manager} | {dealership.location}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Log Tab */}
        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <FileText className="w-5 h-5 mr-2" />
                District Deal Log
              </CardTitle>
              <CardDescription>
                View and edit deals across all dealerships (Front Gross editable)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DealLogPage dashboardType="avp" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Sales Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <BarChart3 className="w-5 h-5 mr-2" />
                Team Sales Metrics
              </CardTitle>
              <CardDescription>
                Comprehensive performance metrics across the district
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dealerships.map(dealership => (
                  <div key={dealership.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{dealership.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>New Units:</span>
                        <span className="font-medium">{dealership.new_units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used Units:</span>
                        <span className="font-medium">{dealership.used_units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPO Units:</span>
                        <span className="font-medium">{dealership.cpo_units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>YTD Total:</span>
                        <span className="font-medium">{dealership.ytd_units}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Teams
                </Button>
                <Button className="w-full" variant="outline">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Performance Reviews
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Goal className="w-5 h-5 mr-2" />
                  Goal Setting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Set Team Goals
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Individual Goals
                </Button>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Track Progress
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Sales Reports
                </Button>
                <Button className="w-full" variant="outline">
                  <LineChart className="w-4 h-4 mr-2" />
                  Performance Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  <PieChart className="w-4 h-4 mr-2" />
                  District Summary
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AVPDashboard;
