import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
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
        },
      ];

      setDealerships(mockDealerships);

      // Calculate group metrics
      const metrics: GroupMetrics = {
        total_dealerships: mockDealerships.length,
        total_users: mockDealerships.reduce((sum, d) => sum + d.total_staff, 0),
        monthly_vehicles_sold: mockDealerships.reduce((sum, d) => sum + d.monthly_sales, 0),
        total_revenue: mockDealerships.reduce((sum, d) => sum + d.monthly_revenue, 0),
      };

      setGroupMetrics(metrics);
      console.log('[GroupAdminDashboard] Data loaded successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new dealership
  const handleAddDealership = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newId = (dealerships.length + 1).toString();

      const newDealership: Dealership = {
        id: newId,
        name: newDealershipData.name,
        location: newDealershipData.location,
        created_at: new Date().toISOString(),
        salespeople_count: 0,
        finance_count: 0,
        managers_count: 0,
        total_staff: 0,
        monthly_sales: 0,
        monthly_revenue: 0,
      };

      setDealerships([...dealerships, newDealership]);
      setGroupMetrics(prev => ({
        ...prev,
        total_dealerships: prev.total_dealerships + 1,
      }));

      // Reset form
      setNewDealershipData({ name: '', location: '', phone: '', email: '' });
      setShowAddDealership(false);

      toast({
        title: 'Success',
        description: `Dealership "${newDealershipData.name}" has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding dealership:', error);
      toast({
        title: 'Error',
        description: 'Failed to add dealership',
        variant: 'destructive',
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your dealership group operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Building2 className="w-4 h-4 mr-1" />
            Group Admin
          </Badge>
        </div>
      </div>

      {/* Top Metrics Cards - 4 boxes as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Box 1: Number of Dealerships */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Number of Dealerships</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupMetrics.total_dealerships}</div>
            <p className="text-xs text-muted-foreground">Active dealership locations</p>
          </CardContent>
        </Card>

        {/* Box 2: Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupMetrics.total_users}</div>
            <p className="text-xs text-muted-foreground">Staff across all dealerships</p>
          </CardContent>
        </Card>

        {/* Box 3: Total Vehicles Sold MTD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles Sold MTD</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupMetrics.monthly_vehicles_sold}</div>
            <p className="text-xs text-muted-foreground">Month to date sales</p>
          </CardContent>
        </Card>

        {/* Box 4: TBD - Using Group Revenue for now */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBD Metric</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(groupMetrics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">To be determined</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Dealership Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Dealership
              </CardTitle>
              <CardDescription>Add a new dealership location to your group</CardDescription>
            </div>
            <Button onClick={() => setShowAddDealership(!showAddDealership)}>
              {showAddDealership ? 'Cancel' : 'Add Dealership'}
            </Button>
          </div>
        </CardHeader>

        {showAddDealership && (
          <CardContent>
            <form onSubmit={handleAddDealership} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealership-name">Dealership Name</Label>
                  <Input
                    id="dealership-name"
                    placeholder="Enter dealership name"
                    value={newDealershipData.name}
                    onChange={e =>
                      setNewDealershipData({ ...newDealershipData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealership-location">Location</Label>
                  <Input
                    id="dealership-location"
                    placeholder="City, State"
                    value={newDealershipData.location}
                    onChange={e =>
                      setNewDealershipData({ ...newDealershipData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealership-phone">Phone Number</Label>
                  <Input
                    id="dealership-phone"
                    placeholder="(555) 123-4567"
                    value={newDealershipData.phone}
                    onChange={e =>
                      setNewDealershipData({ ...newDealershipData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealership-email">Email</Label>
                  <Input
                    id="dealership-email"
                    type="email"
                    placeholder="info@dealership.com"
                    value={newDealershipData.email}
                    onChange={e =>
                      setNewDealershipData({ ...newDealershipData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Dealership
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Individual Dealership Metrics Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Individual Dealership Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {dealerships.map(dealership => (
            <Card key={dealership.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{dealership.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {dealership.location}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Staff Metrics */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Staff Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <UserCircle className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sales People</p>
                        <p className="font-semibold">{dealership.salespeople_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Finance People</p>
                        <p className="font-semibold">{dealership.finance_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sales Managers</p>
                        <p className="font-semibold">{dealership.managers_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Staff</p>
                        <p className="font-semibold">{dealership.total_staff}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Monthly Performance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vehicles Sold:</span>
                      <Badge variant="secondary">{dealership.monthly_sales}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue:</span>
                      <Badge variant="secondary">
                        {formatCurrency(dealership.monthly_revenue)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Deal:</span>
                      <Badge variant="secondary">
                        {formatCurrency(
                          dealership.monthly_revenue / (dealership.monthly_sales || 1)
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/dashboard/admin?dealership=${dealership.id}`)}
                  >
                    View Dealership Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
