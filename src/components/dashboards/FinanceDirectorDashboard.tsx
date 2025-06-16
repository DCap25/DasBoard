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
}

interface DepartmentMetrics {
  total_fi_gross: number;
  deals_processed: number;
  products_per_deal: number;
  per_vehicle_retail: number;
  mtd_growth: number;
  team_performance: 'excellent' | 'good' | 'needs_improvement';
}

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
}

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

  // If showing the log deal form, render it instead of the normal dashboard
  if (showLogDealForm) {
    return (
      <div className="container py-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Finance Director Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Finance Director: {user?.email?.split('@')[0] || 'Not Assigned'}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700"
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
    <div className="container py-4">
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
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <Crown className="w-16 h-16 mx-auto text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Finance Director Dashboard</h2>
        <p className="text-muted-foreground mb-4">
          This dashboard is under construction. Coming soon with full F&I department management
          features.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Log Deals - Edit Deal</p>
          <p>• Quick View - Department F&I Gross, Deals Processed, PPD, PVR</p>
          <p>• View Finance DAS Board (Leaderboard)</p>
          <p>• View Department Deals (All)</p>
          <p>• View Individual F&I Manager Deals</p>
          <p>• View F&I Schedules and edit schedules</p>
          <p>• Limited edit to Pay Plan configurator</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceDirectorDashboard;
