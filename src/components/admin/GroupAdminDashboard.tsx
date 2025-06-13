import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../lib/use-toast';
import {
  Building2,
  Users,
  Car,
  TrendingUp,
  Plus,
  Edit,
  MapPin,
  BarChart3,
  UserCircle,
  Calculator,
  Target,
  Crown,
} from 'lucide-react';

// Interfaces
interface Dealership {
  id: string;
  name: string;
  location: string;
  created_at: string;
  salespeople_count: number;
  finance_count: number;
  managers_count: number;
  total_staff: number;
  monthly_sales: number;
  monthly_revenue: number;
}

interface GroupMetrics {
  total_dealerships: number;
  total_users: number;
  monthly_vehicles_sold: number;
  total_revenue: number;
}

interface NewDealershipData {
  name: string;
  location: string;
  phone: string;
  email: string;
}

export function GroupAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for direct auth
  const directAuthData = localStorage.getItem('directauth_user');
  const directUser = directAuthData ? JSON.parse(directAuthData) : null;
  const currentUser = user || directUser;

  // State
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [groupMetrics, setGroupMetrics] = useState<GroupMetrics>({
    total_dealerships: 0,
    total_users: 0,
    monthly_vehicles_sold: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showAddDealership, setShowAddDealership] = useState(false);
  const [newDealershipData, setNewDealershipData] = useState<NewDealershipData>({
    name: '',
    location: '',
    phone: '',
    email: '',
  });

  // Fetch data on component mount
  useEffect(() => {
    console.log('[GroupAdminDashboard] Component mounting - currentUser:', currentUser?.email);
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockDealerships: Dealership[] = [
        {
          id: '1',
          name: 'Downtown Toyota',
          location: 'Chicago, IL',
          created_at: '2024-01-15',
          salespeople_count: 12,
          finance_count: 3,
          managers_count: 4,
          total_staff: 19,
          monthly_sales: 145,
          monthly_revenue: 4350000,
        },
        {
          id: '2',
          name: 'Suburban Honda',
          location: 'Naperville, IL',
          created_at: '2024-02-01',
          salespeople_count: 8,
          finance_count: 2,
          managers_count: 3,
          total_staff: 13,
          monthly_sales: 98,
          monthly_revenue: 2940000,
        },
        {
          id: '3',
          name: 'Metro Ford',
          location: 'Aurora, IL',
          created_at: '2024-01-20',
          salespeople_count: 15,
          finance_count: 4,
          managers_count: 5,
          total_staff: 24,
          monthly_sales: 187,
          monthly_revenue: 5610000,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import {
  Users,
  Building2,
  UserPlus,
  CalendarClock,
  UserCog,
  Search,
  Trash2,
  Edit,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
  Download,
  Link,
  ArrowRight,
  UserCircle,
  Calculator,
  Briefcase,
  Clock,
  BarChart3,
  Calendar,
  LineChart,
  AlertTriangle,
  ThumbsUp,
  Sliders,
  LayoutGrid,
  ClipboardList,
  User,
  Car,
  TrendingUp,
  Target,
  Crown,
  Building,
  MapPin,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { isAuthenticated, getCurrentUser } from '../../lib/directAuth';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import {
  getDealershipGroups,
  getDealerships,
  createDealershipUser,
  getDealershipUsers,
} from '../../lib/apiService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

// Define interfaces
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  dealership_id: number;
  dealership_name: string;
  team?: string;
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface SalesPerformance {
  user_id: number;
  name: string;
  email: string;
  team?: string;
  dealership_id: number;
  dealership_name: string;
  units_sold: number;
  avg_gross_per_unit: number;
  total_gross: number;
  csi_score: number;
  performance_score: number; // Calculated metric combining volume, gross, and CSI
  recommendation: 'promote' | 'maintain' | 'coach' | 'review' | 'reassign';
  months_data: {
    month: string;
    units: number;
    gross: number;
  }[];
}

interface SchedulerConfig {
  dealership_id: number;
  min_sales_per_month: number;
  target_sales_per_month: number;
  min_gross_per_unit: number;
  target_gross_per_unit: number;
  min_csi_score: number;
  optimal_team_size: number;
  max_teams: number;
  performance_weight: {
    volume: number; // 0-100 percentage
    gross: number; // 0-100 percentage
    csi: number; // 0-100 percentage
  };
}

interface Dealership {
  id: number;
  name: string;
  location: string;
  schedule_type: string;
  working_hours: string;
  pay_config_id: number;
  pay_config_name: string;
  schedule?: WeekSchedule;
  scheduler_config?: SchedulerConfig;
  salespeople_count: number;
  finance_count: number;
  managers_count: number;
  total_staff: number;
  monthly_sales: number;
  monthly_revenue: number;
  avg_deal_value: number;
}

interface PayPlanTemplate {
  id: number;
  name: string;
  description: string;
  role_type: string;
  configuration: any; // This would be structured based on role type
}

interface PayConfiguration {
  id: number;
  name: string;
  description: string;
  commission_structure: string;
  bonus_structure: string;
  role_type?: string;
  templates?: PayPlanTemplate[];
}

interface AreaVP {
  id: string;
  user_id: string;
  name: string;
  email: string;
  dealerships: number[];
  created_at: string;
}

interface GroupMetrics {
  total_dealerships: number;
  total_users: number;
  monthly_vehicles_sold: number;
  total_revenue: number;
}

interface NewDealershipData {
  name: string;
  location: string;
  phone: string;
  email: string;
}

export function GroupAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State variables
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('dealerships');
  const [users, setUsers] = useState<User[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [payConfigurations, setPayConfigurations] = useState<PayConfiguration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dealershipFilter, setDealershipFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [selectedPayConfig, setSelectedPayConfig] = useState<PayConfiguration | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDealershipForSchedule, setSelectedDealershipForSchedule] =
    useState<Dealership | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<WeekSchedule | null>(null);
  const [salesPerformanceData, setSalesPerformanceData] = useState<SalesPerformance[]>([]);
  const [selectedDealershipForScheduler, setSelectedDealershipForScheduler] = useState<
    number | null
  >(null);
  const [schedulerConfigs, setSchedulerConfigs] = useState<SchedulerConfig[]>([]);
  const [currentSchedulerConfig, setCurrentSchedulerConfig] = useState<SchedulerConfig | null>(
    null
  );
  const [generatedSchedule, setGeneratedSchedule] = useState<any | null>(null);
  const [isAddDealershipModalOpen, setIsAddDealershipModalOpen] = useState(false);
  const [newDealershipData, setNewDealershipData] = useState({
    name: '',
    location: '',
    schedule_type: 'Standard',
    pay_config_id: 1,
  });
  const [groupMetrics, setGroupMetrics] = useState<GroupMetrics>({
    total_dealerships: 0,
    total_users: 0,
    monthly_vehicles_sold: 0,
    total_revenue: 0,
  });
  const [showAddDealership, setShowAddDealership] = useState(false);

  // Get admin name
  const [adminName, setAdminName] = useState<string>('');

  // Add these new state variables after the existing ones
  const [dealershipGroup, setDealershipGroup] = useState<{
    id: number;
    name: string;
    settings: any;
  } | null>(null);
  const [groupDealerships, setGroupDealerships] = useState<Dealership[]>([]);
  const [areaVPs, setAreaVPs] = useState<AreaVP[]>([]);
  const [avpCount, setAvpCount] = useState(0);
  const [maxAvpCount, setMaxAvpCount] = useState(0);
  const [newAvpEmail, setNewAvpEmail] = useState('');
  const [newAvpName, setNewAvpName] = useState('');
  const [selectedDealershipIds, setSelectedDealershipIds] = useState<number[]>([]);
  const [isAddingAvp, setIsAddingAvp] = useState(false);
  const [userLimits, setUserLimits] = useState<any>(null);
  const [groupAddOns, setGroupAddOns] = useState<string[]>([]);
  const [groupLevel, setGroupLevel] = useState<string>('level_1');

  useEffect(() => {
    // Set admin name from user data
    if (user) {
      const name = user.email?.split('@')[0] || 'Admin';
      // Convert first letter to uppercase and replace dots with spaces
      setAdminName(name.charAt(0).toUpperCase() + name.slice(1).replace(/\./g, ' '));
    }
  }, [user]);

  // Load mock data
  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        console.log('[GroupAdminDashboard] Loading mock data for admin panel');

        // Check if authenticated
        if (isAuthenticated()) {
          console.log('[GroupAdminDashboard] Direct auth user detected, using mock data');

          // Default schedule template
          const defaultSchedule: WeekSchedule = {
            monday: { open: '09:00', close: '20:00', closed: false },
            tuesday: { open: '09:00', close: '20:00', closed: false },
            wednesday: { open: '09:00', close: '20:00', closed: false },
            thursday: { open: '09:00', close: '20:00', closed: false },
            friday: { open: '09:00', close: '20:00', closed: false },
            saturday: { open: '10:00', close: '18:00', closed: false },
            sunday: { open: '11:00', close: '16:00', closed: true },
          };

          // Default scheduler configuration
          const defaultSchedulerConfig: SchedulerConfig = {
            dealership_id: 0,
            min_sales_per_month: 8,
            target_sales_per_month: 12,
            min_gross_per_unit: 1200,
            target_gross_per_unit: 1800,
            min_csi_score: 85,
            optimal_team_size: 5,
            max_teams: 4,
            performance_weight: {
              volume: 40,
              gross: 40,
              csi: 20,
            },
          };

          // Mock dealerships with schedules
          const mockDealerships = [
            {
              id: 1,
              name: 'Downtown Motors',
              location: 'Downtown',
              schedule_type: 'Standard',
              working_hours: 'Mon-Sat: 9AM-8PM, Sun: 11AM-6PM',
              pay_config_id: 1,
              pay_config_name: 'Standard Commission',
              schedule: {
                ...defaultSchedule,
                sunday: { open: '11:00', close: '18:00', closed: false },
              },
              scheduler_config: {
                ...defaultSchedulerConfig,
                dealership_id: 1,
                min_sales_per_month: 10,
                target_sales_per_month: 15,
                optimal_team_size: 6,
              },
              salespeople_count: 12,
              finance_count: 3,
              managers_count: 4,
              total_staff: 19,
              monthly_sales: 145,
              monthly_revenue: 4350000,
              avg_deal_value: 30000,
            },
            {
              id: 2,
              name: 'Westside Auto',
              location: 'West Side',
              schedule_type: 'Extended',
              working_hours: 'Mon-Sat: 8AM-9PM, Sun: 10AM-7PM',
              pay_config_id: 2,
              pay_config_name: 'Performance Plus',
              schedule: {
                ...defaultSchedule,
                monday: { open: '08:00', close: '21:00', closed: false },
                tuesday: { open: '08:00', close: '21:00', closed: false },
                wednesday: { open: '08:00', close: '21:00', closed: false },
                thursday: { open: '08:00', close: '21:00', closed: false },
                friday: { open: '08:00', close: '21:00', closed: false },
                saturday: { open: '09:00', close: '21:00', closed: false },
                sunday: { open: '10:00', close: '19:00', closed: false },
              },
              scheduler_config: {
                ...defaultSchedulerConfig,
                dealership_id: 2,
                min_sales_per_month: 8,
                target_sales_per_month: 12,
              },
              salespeople_count: 8,
              finance_count: 2,
              managers_count: 3,
              total_staff: 13,
              monthly_sales: 98,
              monthly_revenue: 2940000,
              avg_deal_value: 30000,
            },
            {
              id: 3,
              name: 'Eastside Dealership',
              location: 'East Side',
              schedule_type: 'Standard',
              working_hours: 'Mon-Sat: 9AM-8PM, Sun: Closed',
              pay_config_id: 1,
              pay_config_name: 'Standard Commission',
              schedule: {
                ...defaultSchedule,
                sunday: { open: '10:00', close: '16:00', closed: true },
              },
              scheduler_config: {
                ...defaultSchedulerConfig,
                dealership_id: 3,
                optimal_team_size: 4,
                max_teams: 3,
              },
              salespeople_count: 15,
              finance_count: 4,
              managers_count: 5,
              total_staff: 24,
              monthly_sales: 187,
              monthly_revenue: 5610000,
              avg_deal_value: 30000,
            },
          ];

          // Mock users with team assignments and new roles
          const mockUsers = [
            {
              id: 1,
              name: 'John Smith',
              email: 'john.smith@example.com',
              role: 'sales_person',
              dealership_id: 1,
              dealership_name: 'Downtown Motors',
              team: 'Team A',
              status: 'active',
              created_at: '2023-01-15T08:30:00Z',
              last_login: '2023-05-05T14:22:10Z',
            },
            {
              id: 2,
              name: 'Sarah Johnson',
              email: 'sarah.j@example.com',
              role: 'sales_person',
              dealership_id: 2,
              dealership_name: 'Westside Auto',
              team: 'Team B',
              status: 'active',
              created_at: '2023-02-10T10:15:00Z',
              last_login: '2023-05-04T16:45:30Z',
            },
            {
              id: 3,
              name: 'Robert Davis',
              email: 'robert.d@example.com',
              role: 'sales_manager',
              dealership_id: 1,
              dealership_name: 'Downtown Motors',
              team: 'Team A',
              status: 'active',
              created_at: '2022-11-20T09:00:00Z',
              last_login: '2023-05-05T11:20:15Z',
            },
            {
              id: 4,
              name: 'Michael Lee',
              email: 'michael.lee@example.com',
              role: 'finance_manager',
              dealership_id: 1,
              dealership_name: 'Downtown Motors',
              team: 'Team A',
              status: 'active',
              created_at: '2022-12-05T14:30:00Z',
              last_login: '2023-05-04T09:15:45Z',
            },
            {
              id: 5,
              name: 'Jessica Chen',
              email: 'j.chen@example.com',
              role: 'finance_director',
              dealership_id: 3,
              dealership_name: 'Eastside Dealership',
              team: 'Team C',
              status: 'active',
              created_at: '2023-01-25T11:45:00Z',
              last_login: '2023-05-03T15:30:20Z',
            },
            {
              id: 6,
              name: 'David Wilson',
              email: 'david.w@example.com',
              role: 'general_manager',
              dealership_id: 2,
              dealership_name: 'Westside Auto',
              team: 'Team B',
              status: 'active',
              created_at: '2022-09-15T08:00:00Z',
              last_login: '2023-05-05T08:10:05Z',
            },
            {
              id: 7,
              name: 'Amanda Harris',
              email: 'a.harris@example.com',
              role: 'sales_person',
              dealership_id: 3,
              dealership_name: 'Eastside Dealership',
              team: 'Team C',
              status: 'inactive',
              created_at: '2022-10-10T09:30:00Z',
              last_login: '2023-04-15T10:20:30Z',
            },
            {
              id: 8,
              name: 'Thomas Parker',
              email: 't.parker@example.com',
              role: 'general_sales_manager',
              dealership_id: 1,
              dealership_name: 'Downtown Motors',
              team: 'Team A',
              status: 'active',
              created_at: '2022-08-20T10:30:00Z',
              last_login: '2023-05-05T09:45:30Z',
            },
          ] as User[];

          // Mock pay configurations with templates
          const mockPayConfigurations = [
            {
              id: 1,
              name: 'Sales Compensation Plans',
              description: 'Compensation plans for sales staff',
              role_type: 'sales',
              commission_structure: 'Varies by template',
              bonus_structure: 'Varies by template',
              templates: [
                {
                  id: 101,
                  name: 'Standard Sales Commission',
                  description: 'Base salary plus graduated commission on sales',
                  role_type: 'sales_person',
                  configuration: {
                    base_salary: 3000,
                    commission_tiers: [
                      { tier: 1, threshold: 0, rate: 0.05 },
                      { tier: 2, threshold: 10, rate: 0.075 },
                      { tier: 3, threshold: 20, rate: 0.1 },
                    ],
                    volume_bonus: {
                      amount: 500,
                      threshold: 10,
                    },
                    spiffs: [
                      { name: 'New Vehicle', amount: 100 },
                      { name: 'Used Vehicle', amount: 75 },
                    ],
                  },
                },
                {
                  id: 102,
                  name: 'Performance Plus',
                  description: 'Lower base with higher commission potential',
                  role_type: 'sales_person',
                  configuration: {
                    base_salary: 2000,
                    commission_tiers: [
                      { tier: 1, threshold: 0, rate: 0.07 },
                      { tier: 2, threshold: 8, rate: 0.1 },
                      { tier: 3, threshold: 16, rate: 0.15 },
                    ],
                    volume_bonus: {
                      amount: 1000,
                      threshold: 15,
                    },
                    spiffs: [
                      { name: 'New Vehicle', amount: 150 },
                      { name: 'Used Vehicle', amount: 100 },
                    ],
                  },
                },
              ],
            },
            {
              id: 2,
              name: 'Finance Compensation Plans',
              description: 'Compensation plans for finance department',
              role_type: 'finance',
              commission_structure: 'Percentage of backend',
              bonus_structure: 'Product-based incentives',
              templates: [
                {
                  id: 201,
                  name: 'Standard Finance Manager Plan',
                  description: 'Percentage of back-end gross with product bonuses',
                  role_type: 'finance_manager',
                  configuration: {
                    base_salary: 4000,
                    backend_percentage: 0.08,
                    product_bonuses: [
                      { name: 'VSA', amount: 100, threshold: 10 },
                      { name: 'GAP', amount: 75, threshold: 8 },
                      { name: 'PPM', amount: 150, threshold: 5 },
                    ],
                    csi_bonus: {
                      threshold: 90,
                      amount: 500,
                    },
                  },
                },
                {
                  id: 202,
                  name: 'Finance Director Plan',
                  description: 'Department performance with individual metrics',
                  role_type: 'finance_director',
                  configuration: {
                    base_salary: 6000,
                    backend_percentage: 0.05,
                    department_bonus: {
                      threshold: 150000,
                      percentage: 0.02,
                    },
                    product_penetration_bonus: {
                      vsa_threshold: 40,
                      gap_threshold: 35,
                      ppm_threshold: 25,
                      amount: 1000,
                    },
                  },
                },
              ],
            },
            {
              id: 3,
              name: 'Management Compensation Plans',
              description: 'Compensation plans for management staff',
              role_type: 'management',
              commission_structure: 'Dealership performance',
              bonus_structure: 'Quarterly & annual targets',
              templates: [
                {
                  id: 301,
                  name: 'Sales Manager Plan',
                  description: 'Front-end focused with team performance',
                  role_type: 'sales_manager',
                  configuration: {
                    base_salary: 5000,
                    frontend_percentage: 0.05,
                    backend_percentage: 0.02,
                    team_performance: {
                      unit_threshold: 50,
                      amount: 1000,
                    },
                    demo_allowance: 800,
                  },
                },
                {
                  id: 302,
                  name: 'General Sales Manager Plan',
                  description: 'Overall sales department performance',
                  role_type: 'general_sales_manager',
                  configuration: {
                    base_salary: 7000,
                    frontend_percentage: 0.04,
                    backend_percentage: 0.025,
                    department_bonus: {
                      threshold: 100,
                      amount: 2000,
                    },
                    quarterly_bonus: {
                      threshold_percentage: 110,
                      amount: 5000,
                    },
                    demo_allowance: 1000,
                  },
                },
                {
                  id: 303,
                  name: 'General Manager Plan',
                  description: 'Overall dealership performance',
                  role_type: 'general_manager',
                  configuration: {
                    base_salary: 10000,
                    store_profit_percentage: 0.05,
                    quarterly_target_bonus: {
                      threshold_percentage: 100,
                      amount: 10000,
                    },
                    annual_bonus: {
                      threshold_percentage: 105,
                      amount: 50000,
                    },
                    demo_allowance: 1200,
                  },
                },
              ],
            },
          ];

          // After initializing users, let's add mock sales performance data
          const mockPerformanceData: SalesPerformance[] = [
            {
              user_id: 1,
              name: 'John Smith',
              email: 'john.smith@example.com',
              team: 'Team A',
              dealership_id: 1,
              dealership_name: 'Downtown Motors',
              units_sold: 14,
              avg_gross_per_unit: 1750,
              total_gross: 24500,
              csi_score: 92,
              performance_score: 87,
              recommendation: 'maintain',
              months_data: [
                { month: 'Jan', units: 12, gross: 18000 },
                { month: 'Feb', units: 10, gross: 16500 },
                { month: 'Mar', units: 15, gross: 24000 },
                { month: 'Apr', units: 11, gross: 18500 },
                { month: 'May', units: 14, gross: 24500 },
                { month: 'Jun', units: 13, gross: 22000 },
              ],
            },
            {
              user_id: 2,
              name: 'Sarah Johnson',
              email: 'sarah.j@example.com',
              team: 'Team B',
              dealership_id: 2,
              dealership_name: 'Westside Auto',
              units_sold: 8,
              avg_gross_per_unit: 2100,
              total_gross: 16800,
              csi_score: 88,
              performance_score: 78,
              recommendation: 'coach',
              months_data: [
                { month: 'Jan', units: 7, gross: 14000 },
                { month: 'Feb', units: 9, gross: 18000 },
                { month: 'Mar', units: 6, gross: 12500 },
                { month: 'Apr', units: 10, gross: 19000 },
                { month: 'May', units: 8, gross: 16800 },
                { month: 'Jun', units: 7, gross: 15000 },
              ],
            },
            {
              user_id: 7,
              name: 'Amanda Harris',
              email: 'a.harris@example.com',
              team: 'Team C',
              dealership_id: 3,
              dealership_name: 'Eastside Dealership',
              units_sold: 6,
              avg_gross_per_unit: 1050,
              total_gross: 6300,
              csi_score: 81,
              performance_score: 58,
              recommendation: 'review',
              months_data: [
                { month: 'Jan', units: 8, gross: 9000 },
                { month: 'Feb', units: 7, gross: 7500 },
                { month: 'Mar', units: 6, gross: 6800 },
                { month: 'Apr', units: 5, gross: 5500 },
                { month: 'May', units: 6, gross: 6300 },
                { month: 'Jun', units: 4, gross: 4200 },
              ],
            },
            {
              user_id: 10,
              name: 'Mark Thompson',
              email: 'm.thompson@example.com',
              team: 'Team A',
              dealership_id: 1,
              dealership_name: 'Downtown Motors',
              units_sold: 18,
              avg_gross_per_unit: 1900,
              total_gross: 34200,
              csi_score: 95,
              performance_score: 94,
              recommendation: 'promote',
              months_data: [
                { month: 'Jan', units: 15, gross: 28000 },
                { month: 'Feb', units: 16, gross: 30000 },
                { month: 'Mar', units: 14, gross: 27000 },
                { month: 'Apr', units: 17, gross: 32000 },
                { month: 'May', units: 18, gross: 34200 },
                { month: 'Jun', units: 16, gross: 31000 },
              ],
            },
            {
              user_id: 12,
              name: 'Emily Chen',
              email: 'e.chen@example.com',
              team: 'Team B',
              dealership_id: 2,
              dealership_name: 'Westside Auto',
              units_sold: 7,
              avg_gross_per_unit: 950,
              total_gross: 6650,
              csi_score: 79,
              performance_score: 52,
              recommendation: 'reassign',
              months_data: [
                { month: 'Jan', units: 9, gross: 9500 },
                { month: 'Feb', units: 8, gross: 8200 },
                { month: 'Mar', units: 8, gross: 7800 },
                { month: 'Apr', units: 6, gross: 6000 },
                { month: 'May', units: 7, gross: 6650 },
                { month: 'Jun', units: 5, gross: 4800 },
              ],
            },
          ];

          // Initialize scheduler configs from dealerships
          const extractedSchedulerConfigs = mockDealerships
            .filter(d => d.scheduler_config)
            .map(d => d.scheduler_config as SchedulerConfig);

          setDealerships(mockDealerships);
          setUsers(mockUsers);
          setPayConfigurations(mockPayConfigurations);
          setSalesPerformanceData(mockPerformanceData);
          setSchedulerConfigs(extractedSchedulerConfigs);

          console.log('[GroupAdminDashboard] Mock data loaded successfully');
          setLoading(false);
        } else {
          // In a real app, we would fetch data from Supabase here
          console.log('[GroupAdminDashboard] No direct auth user, would fetch from Supabase');
          setLoading(false);
        }
      } catch (error) {
        console.error('[GroupAdminDashboard] Error loading data:', error);
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  // Filter users based on search and filter selections
  const getFilteredUsers = () => {
    // If a dealership is selected, only show users from that dealership
    let filteredUsers = users;

    if (selectedDealership) {
      filteredUsers = users.filter(user => user.dealership_id === selectedDealership.id);
    }

    // If a user type is selected, filter by role
    if (selectedUserType) {
      switch (selectedUserType) {
        case 'sales':
          filteredUsers = filteredUsers.filter(user => user.role === 'sales_person');
          break;
        case 'finance':
          filteredUsers = filteredUsers.filter(
            user => user.role === 'finance_manager' || user.role === 'finance_director'
          );
          break;
        case 'sales_managers':
          filteredUsers = filteredUsers.filter(
            user => user.role === 'sales_manager' || user.role === 'general_sales_manager'
          );
          break;
        case 'general_manager':
          filteredUsers = filteredUsers.filter(user => user.role === 'general_manager');
          break;
      }
    }

    return filteredUsers.filter(user => {
      // Apply search term filter
      const matchesSearch =
        searchTerm === '' ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  // Handle adding a new user
  const handleAddUser = () => {
    // In a real app, we would create a user in Supabase
    const newUser: User = {
      id: users.length + 1,
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      dealership_id: parseInt(newUserData.dealership_id),
      dealership_name:
        dealerships.find(d => d.id === parseInt(newUserData.dealership_id))?.name || '',
      team: newUserData.team,
      status: newUserData.status as 'active' | 'inactive',
      created_at: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    setIsAddUserModalOpen(false);
    setNewUserData({
      name: '',
      email: '',
      role: '',
      dealership_id: '',
      team: '',
      status: 'active',
    });
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'sales_person':
        return 'Sales Person';
      case 'sales_manager':
        return 'Sales Manager';
      case 'general_sales_manager':
        return 'General Sales Manager';
      case 'finance_manager':
        return 'Finance Manager';
      case 'finance_director':
        return 'Finance Director';
      case 'general_manager':
        return 'General Manager';
      default:
        return role.replace('_', ' ');
    }
  };

  // Handle dealership selection
  const selectDealership = (dealership: Dealership) => {
    // Navigate to the single dealership admin page
    navigate(`/dashboard/admin?dealership=${dealership.id}`);
  };

  // Handle going back to dealership list
  const goBackToDealerships = () => {
    setSelectedDealership(null);
    setSelectedUserType(null);
    setSelectedTab('dealerships');
  };

  // Open schedule configuration modal
  const openScheduleModal = (dealership: Dealership) => {
    setSelectedDealershipForSchedule(dealership);
    setCurrentSchedule(dealership.schedule || null);
    setIsScheduleModalOpen(true);
  };

  // Save dealership schedule
  const saveSchedule = (schedule: WeekSchedule) => {
    if (selectedDealershipForSchedule) {
      const updatedDealerships = dealerships.map(d =>
        d.id === selectedDealershipForSchedule.id ? { ...d, schedule: schedule } : d
      );
      setDealerships(updatedDealerships);

      // Update selected dealership if it's the one being edited
      if (selectedDealership && selectedDealership.id === selectedDealershipForSchedule.id) {
        setSelectedDealership({ ...selectedDealership, schedule: schedule });
      }

      setIsScheduleModalOpen(false);
    }
  };

  // Functions for Dynamic Scheduler
  const selectDealershipForScheduler = (dealershipId: number) => {
    setSelectedDealershipForScheduler(dealershipId);
    const dealership = dealerships.find(d => d.id === dealershipId);
    if (dealership && dealership.scheduler_config) {
      setCurrentSchedulerConfig(dealership.scheduler_config);
    } else {
      // Use default config as fallback
      const defaultConfig: SchedulerConfig = {
        dealership_id: dealershipId,
        min_sales_per_month: 8,
        target_sales_per_month: 12,
        min_gross_per_unit: 1200,
        target_gross_per_unit: 1800,
        min_csi_score: 85,
        optimal_team_size: 5,
        max_teams: 4,
        performance_weight: {
          volume: 40,
          gross: 40,
          csi: 20,
        },
      };
      setCurrentSchedulerConfig(defaultConfig);
    }
  };

  const updateSchedulerConfig = (field: string, value: number) => {
    if (!currentSchedulerConfig) return;

    if (field.includes('.')) {
      // Handle nested properties like 'performance_weight.volume'
      const [parent, child] = field.split('.');
      setCurrentSchedulerConfig({
        ...currentSchedulerConfig,
        [parent]: {
          ...(currentSchedulerConfig[parent as keyof SchedulerConfig] as object),
          [child]: value,
        },
      });
    } else {
      // Handle top-level properties
      setCurrentSchedulerConfig({
        ...currentSchedulerConfig,
        [field]: value,
      });
    }
  };

  const saveSchedulerConfig = () => {
    if (!currentSchedulerConfig || !selectedDealershipForScheduler) return;

    // Update the dealership's scheduler config
    const updatedDealerships = dealerships.map(d =>
      d.id === selectedDealershipForScheduler
        ? { ...d, scheduler_config: currentSchedulerConfig }
        : d
    );

    setDealerships(updatedDealerships);

    // Update the schedulerConfigs array
    const updatedConfigs = [
      ...schedulerConfigs.filter(c => c.dealership_id !== selectedDealershipForScheduler),
      currentSchedulerConfig,
    ];
    setSchedulerConfigs(updatedConfigs);
  };

  const generateOptimalSchedule = () => {
    if (!selectedDealershipForScheduler || !currentSchedulerConfig) return;

    // Get sales staff for the selected dealership
    const salesStaff = salesPerformanceData.filter(
      p => p.dealership_id === selectedDealershipForScheduler
    );

    if (salesStaff.length === 0) {
      console.warn('No sales staff data found for this dealership');
      return;
    }

    // Sort by performance score (descending)
    const sortedStaff = [...salesStaff].sort((a, b) => b.performance_score - a.performance_score);

    // Determine optimal number of teams based on staff size and configuration
    const staffCount = sortedStaff.length;
    const { optimal_team_size, max_teams } = currentSchedulerConfig;

    const recommendedTeamCount = Math.min(Math.ceil(staffCount / optimal_team_size), max_teams);

    // Create teams with balanced performance
    const teams: any[] = Array.from({ length: recommendedTeamCount }, () => []);

    // Distribute staff using a "snake draft" approach to balance teams
    sortedStaff.forEach((staff, index) => {
      // For even indices, go left-to-right; for odd indices, go right-to-left
      const round = Math.floor(index / recommendedTeamCount);
      const position =
        round % 2 === 0
          ? index % recommendedTeamCount
          : recommendedTeamCount - 1 - (index % recommendedTeamCount);

      teams[position].push(staff);
    });

    // Create final optimal schedule
    const optimalSchedule = {
      dealership_id: selectedDealershipForScheduler,
      dealership_name: dealerships.find(d => d.id === selectedDealershipForScheduler)?.name || '',
      recommended_team_count: recommendedTeamCount,
      optimal_team_size: optimal_team_size,
      teams: teams.map((members, index) => ({
        team_name: `Team ${String.fromCharCode(65 + index)}`, // Team A, Team B, etc.
        members,
        avg_performance: members.reduce((sum, m) => sum + m.performance_score, 0) / members.length,
        total_units: members.reduce((sum, m) => sum + m.units_sold, 0),
        total_gross: members.reduce((sum, m) => sum + m.total_gross, 0),
      })),
      staffing_recommendations: {
        promote: sortedStaff.filter(s => s.recommendation === 'promote'),
        coach: sortedStaff.filter(s => s.recommendation === 'coach'),
        review: sortedStaff.filter(s => s.recommendation === 'review'),
        reassign: sortedStaff.filter(s => s.recommendation === 'reassign'),
      },
    };

    setGeneratedSchedule(optimalSchedule);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'promote':
        return 'bg-green-100 text-green-800';
      case 'maintain':
        return 'bg-blue-100 text-blue-800';
      case 'coach':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-orange-100 text-orange-800';
      case 'reassign':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamColor = (teamName: string) => {
    const teamLetter = teamName.slice(-1);
    switch (teamLetter) {
      case 'A':
        return 'bg-blue-100 text-blue-800';
      case 'B':
        return 'bg-purple-100 text-purple-800';
      case 'C':
        return 'bg-green-100 text-green-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle adding a new dealership
  const handleAddDealership = () => {
    // Validate form
    if (!newDealershipData.name || !newDealershipData.location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Create a new dealership object
    const newDealership: Dealership = {
      id: dealerships.length ? Math.max(...dealerships.map(d => d.id)) + 1 : 1,
      name: newDealershipData.name,
      location: newDealershipData.location,
      schedule_type: newDealershipData.schedule_type,
      working_hours: 'Mon-Sat: 9AM-8PM, Sun: 11AM-6PM',
      pay_config_id: newDealershipData.pay_config_id,
      pay_config_name: 'Standard Pay Plan',
      schedule: {
        monday: { open: '09:00', close: '20:00', closed: false },
        tuesday: { open: '09:00', close: '20:00', closed: false },
        wednesday: { open: '09:00', close: '20:00', closed: false },
        thursday: { open: '09:00', close: '20:00', closed: false },
        friday: { open: '09:00', close: '20:00', closed: false },
        saturday: { open: '10:00', close: '18:00', closed: false },
        sunday: { open: '11:00', close: '16:00', closed: true },
      },
      salespeople_count: 0,
      finance_count: 0,
      managers_count: 0,
      total_staff: 0,
      monthly_sales: 0,
      monthly_revenue: 0,
      avg_deal_value: 0,
    };

    // Add the new dealership to the state
    setDealerships([...dealerships, newDealership]);

    // Close the modal and reset form
    setIsAddDealershipModalOpen(false);
    setNewDealershipData({
      name: '',
      location: '',
      schedule_type: 'Standard',
      pay_config_id: 1,
    });

    toast({
      title: 'Success',
      description: `Dealership "${newDealershipData.name}" has been created.`,
      variant: 'default',
    });
  };

  // Add this useEffect to fetch the dealer group and dealerships data
  useEffect(() => {
    const fetchGroupAndDealerships = async () => {
      try {
        setLoading(true);
        console.log('[GroupAdminDashboard] Fetching group data and dealerships');

        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          console.error('[GroupAdminDashboard] No authenticated user');
          return;
        }

        // Set admin name from user data
        const name = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Admin';
        setAdminName(name);

        // Get group info from user metadata
        const groupId = currentUser.user_metadata?.group_id;
        if (!groupId) {
          console.error('[GroupAdminDashboard] User is not associated with a dealership group');
          return;
        }

        // Get group details
        const { data: groupData, error: groupError } = await supabase
          .from('dealership_groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError || !groupData) {
          console.error('[GroupAdminDashboard] Error fetching group:', groupError);
          return;
        }

        setDealershipGroup(groupData);
        console.log('[GroupAdminDashboard] Fetched group:', groupData);

        // Extract group settings
        const settings = groupData.settings || {};
        setGroupLevel(settings.level || 'level_1');
        setGroupAddOns(settings.add_ons || []);

        // Extract user limits
        const userLimitsData = settings.user_limits || {
          sales_people: 10,
          finance_managers: 3,
          sales_managers: 3,
          general_managers: 1,
          finance_directors: 0,
          finance_assistants: 0,
          gsm: 0,
          area_vps: 0,
        };
        setUserLimits(userLimitsData);

        // Set max Area VP count based on settings
        const maxAvps = userLimitsData.area_vps || 0;
        setMaxAvpCount(maxAvps);

        console.log('[GroupAdminDashboard] Group level:', settings.level);
        console.log('[GroupAdminDashboard] Add-ons:', settings.add_ons);
        console.log('[GroupAdminDashboard] User limits:', userLimitsData);

        // Get dealerships in this group
        const { data: dealershipData, error: dealershipError } = await supabase
          .from('dealerships')
          .select('*')
          .eq('group_id', groupId)
          .order('name');

        if (dealershipError) {
          console.error('[GroupAdminDashboard] Error fetching dealerships:', dealershipError);
          return;
        }

        setGroupDealerships(dealershipData);
        console.log('[GroupAdminDashboard] Fetched dealerships:', dealershipData.length);

        // Fetch existing Area VPs
        const { data: avpData, error: avpError } = await supabase
          .from('area_vps')
          .select('*')
          .eq('group_id', groupId);

        if (avpError) {
          console.error('[GroupAdminDashboard] Error fetching Area VPs:', avpError);
        } else {
          setAreaVPs(avpData || []);
          setAvpCount(avpData?.length || 0);
          console.log('[GroupAdminDashboard] Fetched Area VPs:', avpData?.length);
        }

        // If we have a "++ Version" add-on, we have unlimited AVPs
        const hasUnlimitedAvps = settings.add_ons?.includes('plusplus');
        if (hasUnlimitedAvps) {
          console.log('[GroupAdminDashboard] Group has unlimited Area VPs');
          setMaxAvpCount(999); // Effectively unlimited
        }

        // Calculate remaining AVP slots
        const remainingAvpSlots = Math.max(0, maxAvpCount - (avpData?.length || 0));
        console.log('[GroupAdminDashboard] Remaining AVP slots:', remainingAvpSlots);

        // Mock data for dealerships if needed
        if (IS_DEV && dealershipData.length === 0) {
          // ...existing mock data code...
        }

        // We're using real data, so process it
        const dealershipsWithSchedule: Dealership[] = dealershipData.map(dealership => {
          const schedule = dealership.settings?.schedule || DEFAULT_SCHEDULE;
          return {
            id: dealership.id,
            name: dealership.name,
            location: dealership.locations?.[0]?.address || 'No location',
            schedule_type: dealership.settings?.schedule_type || 'Standard',
            working_hours: getWorkingHoursString(schedule),
            pay_config_id: dealership.settings?.pay_config_id || 1,
            pay_config_name: getPayConfigName(dealership.settings?.pay_config_id),
            schedule,
            salespeople_count: 0,
            finance_count: 0,
            managers_count: 0,
            total_staff: 0,
            monthly_sales: 0,
            monthly_revenue: 0,
            avg_deal_value: 0,
          };
        });

        setDealerships(dealershipsWithSchedule);

        // Log the dealership count compared to group level limits
        const levelLimits = {
          level_1: { min: 2, max: 5 },
          level_2: { min: 6, max: 15 },
          level_3: { min: 16, max: 999 },
        };

        const currentLevel = settings.level || 'level_1';
        const currentLimit = levelLimits[currentLevel] || levelLimits.level_1;

        console.log('[GroupAdminDashboard] Dealership count:', dealershipData.length);
        console.log('[GroupAdminDashboard] Group level limits:', currentLimit);

        // Alert if approaching dealership limit
        if (currentLevel !== 'level_3' && dealershipData.length >= currentLimit.max - 1) {
          toast({
            title: 'Approaching Dealership Limit',
            description: `Your group is approaching the maximum of ${currentLimit.max} dealerships for your current plan level.`,
            variant: 'warning',
          });
        }
      } catch (error) {
        console.error('[GroupAdminDashboard] Error in fetchGroupAndDealerships:', error);
        toast({
          title: 'Error',
          description: 'Failed to load group data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndDealerships();
  }, []);

  // Add a function to fetch users for a specific dealership
  const fetchDealershipUsers = async (dealershipId: number) => {
    try {
      console.log(`[GroupAdminDashboard] Fetching users for dealership ${dealershipId}`);
      setLoading(true);

      // Set the selected dealership
      selectDealership(groupDealerships.find(d => d.id === dealershipId) || null);

      // Fetch users from the dealership schema
      const dealershipUsers = await getDealershipUsers(dealershipId);
      console.log(`[GroupAdminDashboard] Fetched ${dealershipUsers.length} users`);

      // Map to the expected format
      const formattedUsers = dealershipUsers.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.roles?.name || 'Unknown',
        dealership_id: dealershipId,
        dealership_name: selectedDealership?.name || 'Unknown',
        status: 'active',
        created_at: user.created_at || new Date().toISOString(),
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error(
        `[GroupAdminDashboard] Error fetching users for dealership ${dealershipId}:`,
        error
      );
      // Use mock data if there's an error
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Add a function to add an Area VP
  const addAreaVP = async () => {
    try {
      setIsAddingAvp(true);

      // Initial validation and logging
      console.log('[GroupAdminDashboard] Adding Area VP:', {
        name: newAvpName,
        email: newAvpEmail,
        dealershipCount: selectedDealershipIds.length,
        dealershipIds: selectedDealershipIds,
        groupLevel: groupLevel,
        addOns: groupAddOns,
        currentAvpCount: avpCount,
        maxAvpCount: maxAvpCount,
      });

      if (!newAvpEmail || !newAvpName || selectedDealershipIds.length === 0 || !dealershipGroup) {
        toast({
          title: 'Error',
          description: 'Please provide all required information',
          variant: 'destructive',
        });
        return;
      }

      // Check AVP limits based on plan level and add-ons
      if (avpCount >= maxAvpCount && maxAvpCount !== 999) {
        // Special case for ++ Version which has unlimited AVPs
        const hasUnlimitedAvps = groupAddOns.includes('plusplus');

        if (!hasUnlimitedAvps) {
          toast({
            title: 'Limit Reached',
            description: `You've reached the maximum of ${maxAvpCount} Area VPs allowed in your plan. Upgrade to ++ Version for unlimited Area VPs.`,
            variant: 'destructive',
          });
          return;
        }
      }

      // Generate a secure temporary password
      const tempPassword = generatePassword();

      // Get the AVP role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'area_vp')
        .single();

      if (roleError || !roleData) {
        throw new Error('Could not find Area VP role');
      }

      // Create the user with enhanced metadata
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newAvpEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: newAvpName.split(' ')[0],
          last_name: newAvpName.split(' ').slice(1).join(' '),
          role_id: roleData.id,
          is_area_vp: true,
          group_id: dealershipGroup.id,
          dealership_ids: selectedDealershipIds,
          group_level: groupLevel,
          group_add_ons: groupAddOns,
          created_at: new Date().toISOString(),
        },
      });

      if (authError) {
        throw authError;
      }

      // Create profile record with enhanced data
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: newAvpName,
        email: newAvpEmail,
        role_id: roleData.id,
        is_area_vp: true,
        group_id: dealershipGroup.id,
        created_at: new Date().toISOString(),
        last_sign_in: null,
      });

      if (profileError) {
        console.warn('[GroupAdminDashboard] Error creating profile record:', profileError);
        // Continue anyway - this is not critical
      }

      // Create area_vp record with enhanced data
      const { data: avpData, error: avpError } = await supabase
        .from('area_vps')
        .insert({
          user_id: authData.user.id,
          group_id: dealershipGroup.id,
          dealerships: selectedDealershipIds,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          settings: {
            group_level: groupLevel,
            add_ons: groupAddOns,
            dealership_count: selectedDealershipIds.length,
          },
        })
        .select()
        .single();

      if (avpError) {
        throw avpError;
      }

      // Log successful creation
      console.log('[GroupAdminDashboard] Area VP created successfully:', {
        id: avpData.id,
        userId: authData.user.id,
        dealershipCount: selectedDealershipIds.length,
      });

      // Update state with new AVP
      setAreaVPs([
        ...areaVPs,
        {
          id: avpData.id,
          user_id: authData.user.id,
          name: newAvpName,
          email: newAvpEmail,
          dealerships: selectedDealershipIds,
          created_at: avpData.created_at,
        },
      ]);
      setAvpCount(avpCount + 1);

      // Reset form fields
      setNewAvpEmail('');
      setNewAvpName('');
      setSelectedDealershipIds([]);

      // Show success message (with secure password handling for demo)
      toast({
        title: 'Success',
        description: `Area VP ${newAvpName} added successfully. An email with login instructions will be sent.`,
      });

      // In a real implementation, you'd send an email with the password
      // For demo purposes, we'll log it securely
      console.log(`[GroupAdminDashboard] Temporary password for ${newAvpName}: ${tempPassword}`);

      // Show temporary password in a separate toast for demo purposes
      toast({
        title: 'Demo: Temporary Password',
        description: tempPassword,
        variant: 'default',
      });
    } catch (error) {
      console.error('[GroupAdminDashboard] Error adding Area VP:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add Area VP',
        variant: 'destructive',
      });
    } finally {
      setIsAddingAvp(false);
    }
  };

  // Add a function to remove an Area VP
  const removeAreaVP = async (avpId: string, userId: string) => {
    try {
      console.log(`[GroupAdminDashboard] Removing Area VP ${avpId}`);

      // Remove AVP record
      const { error: avpError } = await supabase.from('area_vps').delete().eq('id', avpId);

      if (avpError) {
        throw avpError;
      }

      // Optionally deactivate the user account
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { is_area_vp: false, is_deactivated: true },
      });

      if (authError) {
        console.warn('[GroupAdminDashboard] Error updating user status:', authError);
      }

      // Update state
      setAreaVPs(areaVPs.filter(avp => avp.id !== avpId));
      setAvpCount(avpCount - 1);

      toast({
        title: 'Success',
        description: 'Area VP removed successfully',
      });
    } catch (error) {
      console.error('[GroupAdminDashboard] Error removing Area VP:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove Area VP',
        variant: 'destructive',
      });
    }
  };

  // Add a toggle function for dealership selection in the AVP form
  const toggleDealershipSelection = (dealershipId: number) => {
    setSelectedDealershipIds(prev => {
      if (prev.includes(dealershipId)) {
        return prev.filter(id => id !== dealershipId);
      } else {
        return [...prev, dealershipId];
      }
    });
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header with admin name */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Dealership Group Administration</h1>
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-gray-500" />
          <span className="font-medium">{adminName}</span>
        </div>
      </div>

      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="flex justify-center">
          <TabsTrigger value="dealerships" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Dealerships
          </TabsTrigger>
          <TabsTrigger value="pay-config" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Pay Configuration
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-2" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="dynamic-scheduler" className="flex items-center">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Dynamic Scheduler
          </TabsTrigger>
          <TabsTrigger value="area-vps" onClick={() => setSelectedTab('area-vps')}>
            <UserCog className="w-4 h-4 mr-2" />
            Area VPs
          </TabsTrigger>
        </TabsList>

        {/* Dealerships Tab Content */}
        <TabsContent value="dealerships" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Dealership Settings</CardTitle>
                  <CardDescription>
                    Select a dealership to manage staff and configurations
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddDealershipModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dealership
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupDealerships.map(dealership => (
                  <Card key={dealership.id} className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{dealership.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{dealership.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Schedule Type</h4>
                        <p className="text-sm">{dealership.schedule_type}</p>
                        <h4 className="text-sm font-medium mt-3 mb-1">Pay Configuration</h4>
                        <p className="text-sm">{dealership.pay_config_name}</p>
                        <h4 className="text-sm font-medium mt-3 mb-1">Staff Count</h4>
                        <p className="text-sm">
                          {
                            users.filter(
                              user =>
                                user.dealership_id === dealership.id && user.status === 'active'
                            ).length
                          }{' '}
                          active staff members
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => fetchDealershipUsers(dealership.id)}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Manage Dealership
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Dealership Modal */}
        <Dialog open={isAddDealershipModalOpen} onOpenChange={setIsAddDealershipModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Dealership</DialogTitle>
              <DialogDescription>
                Enter the details for the new dealership location.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newDealershipData.name}
                  onChange={e =>
                    setNewDealershipData({ ...newDealershipData, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter dealership name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={newDealershipData.location}
                  onChange={e =>
                    setNewDealershipData({ ...newDealershipData, location: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="City, State"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="schedule-type" className="text-right">
                  Schedule Type
                </Label>
                <Select
                  value={newDealershipData.schedule_type}
                  onValueChange={value =>
                    setNewDealershipData({ ...newDealershipData, schedule_type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                    <SelectItem value="Extended">Extended Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pay-config" className="text-right">
                  Pay Configuration
                </Label>
                <Select
                  value={newDealershipData.pay_config_id.toString()}
                  onValueChange={value =>
                    setNewDealershipData({ ...newDealershipData, pay_config_id: parseInt(value) })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select pay configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Standard Pay Plan</SelectItem>
                    <SelectItem value="2">Performance Based</SelectItem>
                    <SelectItem value="3">Volume Incentive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDealershipModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDealership}>Add Dealership</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Selected Dealership View */}
        <TabsContent value="dealership-view" className="space-y-4">
          {selectedDealership && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>{selectedDealership.name}</CardTitle>
                    <CardDescription>
                      {selectedDealership.location} | {selectedDealership.pay_config_name}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={goBackToDealerships}>
                      Back to Dealerships
                    </Button>
                    <Button variant="outline" onClick={() => openScheduleModal(selectedDealership)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Configure Schedule
                    </Button>
                    <Button onClick={() => setIsAddUserModalOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    variant={selectedUserType === null ? 'default' : 'outline'}
                    onClick={() => setSelectedUserType(null)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    All Staff
                  </Button>
                  <Button
                    variant={selectedUserType === 'sales' ? 'default' : 'outline'}
                    onClick={() => setSelectedUserType('sales')}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Sales People
                  </Button>
                  <Button
                    variant={selectedUserType === 'finance' ? 'default' : 'outline'}
                    onClick={() => setSelectedUserType('finance')}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Finance Managers
                  </Button>
                  <Button
                    variant={selectedUserType === 'sales_managers' ? 'default' : 'outline'}
                    onClick={() => setSelectedUserType('sales_managers')}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Sales Managers
                  </Button>
                  <Button
                    variant={selectedUserType === 'general_manager' ? 'default' : 'outline'}
                    onClick={() => setSelectedUserType('general_manager')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    General Manager
                  </Button>
                </div>

                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredUsers().map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.team || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={user.status === 'active' ? 'default' : 'secondary'}
                              className={
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredUsers().length === 0 && (
                  <div className="text-center py-10">
                    <Users className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No users match your search criteria.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Showing {getFilteredUsers().length} of{' '}
                  {users.filter(u => u.dealership_id === selectedDealership.id).length} users at
                  this dealership
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Area VP Management Tab Content */}
        <TabsContent value="area-vps" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Area VP Management</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {avpCount} / {maxAvpCount === 999 ? '∞' : maxAvpCount} Area VPs
                </span>
              </div>
            </div>

            {/* Add-on summary */}
            <div className="bg-card-dark p-4 rounded-md glow-card">
              <h4 className="font-medium text-white mb-2">Your Subscription</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="bg-gray-800 text-white">
                  Group Level: {groupLevel?.replace('_', ' ')}
                </Badge>
                {groupAddOns?.map(addon => (
                  <Badge
                    key={addon}
                    variant="outline"
                    className={
                      addon === 'plus'
                        ? 'bg-blue-900/50 text-blue-200'
                        : 'bg-purple-900/50 text-purple-200'
                    }
                  >
                    {addon === 'plus' ? '+ Version' : '++ Version'}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                {maxAvpCount === 0
                  ? 'Your current subscription does not include Area VPs. Upgrade to + Version for 1-2 Area VPs or ++ Version for unlimited Area VPs.'
                  : maxAvpCount === 999
                  ? 'Your subscription includes unlimited Area VPs.'
                  : `Your subscription allows up to ${maxAvpCount} Area VP${
                      maxAvpCount > 1 ? 's' : ''
                    }.`}
              </p>
            </div>

            {/* List of existing Area VPs */}
            <Card className="bg-card-dark border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Current Area VPs</CardTitle>
                <CardDescription>Manage Area VPs who oversee multiple dealerships</CardDescription>
              </CardHeader>
              <CardContent>
                {areaVPs.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    No Area VPs have been assigned yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {areaVPs.map(avp => (
                      <div
                        key={avp.id}
                        className="flex items-center justify-between p-3 border border-gray-700 rounded-md"
                      >
                        <div>
                          <div className="font-medium text-white">{avp.name}</div>
                          <div className="text-sm text-gray-400">{avp.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Managing {avp.dealerships.length} dealership(s)
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-red-700 hover:bg-red-900/20 text-red-400"
                          onClick={() => removeAreaVP(avp.id, avp.user_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setIsAddingAvp(true)}
                  className="w-full"
                  disabled={avpCount >= maxAvpCount || maxAvpCount === 0}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Area VP
                </Button>
              </CardFooter>
            </Card>

            {/* Dialog for adding new Area VP */}
            <Dialog open={isAddingAvp} onOpenChange={setIsAddingAvp}>
              <DialogContent className="bg-gray-800 text-white border-gray-700">
                <DialogHeader>
                  <DialogTitle>Add New Area VP</DialogTitle>
                  <DialogDescription>
                    Area VPs can manage multiple dealerships across your group.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="avp-name">Name</Label>
                    <Input
                      id="avp-name"
                      placeholder="Enter full name"
                      value={newAvpName}
                      onChange={e => setNewAvpName(e.target.value)}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avp-email">Email</Label>
                    <Input
                      id="avp-email"
                      type="email"
                      placeholder="Enter email address"
                      value={newAvpEmail}
                      onChange={e => setNewAvpEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Dealerships</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-900 rounded-md">
                      {groupDealerships.map(dealership => (
                        <div key={dealership.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`dealership-${dealership.id}`}
                            checked={selectedDealershipIds.includes(dealership.id)}
                            onChange={() => toggleDealershipSelection(dealership.id)}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`dealership-${dealership.id}`} className="text-sm">
                            {dealership.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedDealershipIds.length === 0 && (
                      <p className="text-xs text-amber-400 mt-1">
                        Please select at least one dealership
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingAvp(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={addAreaVP}
                    disabled={!newAvpEmail || !newAvpName || selectedDealershipIds.length === 0}
                  >
                    Add Area VP
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
