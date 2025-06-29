import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseQuery } from '@/hooks/use-supabase-query';
import { useSupabaseMutation } from '@/hooks/use-supabase-mutation';
import { queryClient } from '@/lib/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  AlertTriangle,
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  FileText,
  CarFront,
  DollarSign,
  TrendingUp,
  Percent,
  Info,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';

// Define interfaces for data types
interface Deal {
  id: string;
  customer_name: string;
  vehicle: string;
  sale_date: string;
  front_end_gross: number;
  back_end_gross: number;
  fni_gross?: number;
  vsc_sold?: boolean;
  salesperson_id: string;
  status: 'pending' | 'funded' | 'unwound';
  created_at: string;
  salesperson?: {
    first_name: string;
    last_name: string;
  };
}

interface Schedule {
  id: string;
  salesperson_id: string;
  date: string;
  shift_start: string;
  shift_end: string;
  notes?: string;
  team?: string;
  department?: string;
  salesperson?: {
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
}

interface MetricsData {
  totalSales: number;
  totalFrontGross: number;
  totalBackGross: number;
  totalFniGross: number;
  vscAttachment: number;
  pvr: number;
  ppd: number;
}

export function GeneralManagerDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('metrics');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()).toISOString().split('T')[0],
    end: endOfMonth(new Date()).toISOString().split('T')[0],
  });

  // Calculate schedule date range (current week)
  const scheduleStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const scheduleEndDate = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday
  const scheduleDateRange = eachDayOfInterval({ start: scheduleStartDate, end: scheduleEndDate });
  const formattedScheduleStartDate = format(scheduleStartDate, 'yyyy-MM-dd');
  const formattedScheduleEndDate = format(scheduleEndDate, 'yyyy-MM-dd');

  // Fetch deals for metrics and deal log
  const {
    data: deals = [],
    isLoading: isDealsLoading,
    isError: isDealsError,
    refetch: refetchDeals,
  } = useSupabaseQuery<Deal[]>(['deals', dateRange, filterStatus, searchTerm], async () => {
    let query = supabase
      .from('deals')
      .select(
        `
        *,
        salesperson:profiles(first_name, last_name)
        `
      )
      .gte('sale_date', dateRange.start)
      .lte('sale_date', dateRange.end)
      .order('sale_date', { ascending: false });

    // Apply status filter if not 'all'
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`customer_name.ilike.%${searchTerm}%,vehicle.ilike.%${searchTerm}%`);
    }

    return await query;
  });

  // Fetch schedules
  const {
    data: schedules = [],
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useSupabaseQuery<Schedule[]>(
    ['schedules', formattedScheduleStartDate, formattedScheduleEndDate],
    async () => {
      return await supabase
        .from('schedules')
        .select(
          `
          id, 
          salesperson_id, 
          date, 
          shift_start, 
          shift_end, 
          notes,
          team,
          department,
          salesperson:profiles(first_name, last_name, profile_image_url)
          `
        )
        .gte('date', formattedScheduleStartDate)
        .lte('date', formattedScheduleEndDate)
        .order('date');
    }
  );

  // Delete deal mutation
  const deleteDealMutation = useSupabaseMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => {
      // First, trigger the Edge Function to send notifications
      const { error: fnError } = await supabase.functions.invoke('notify-deal-deletion', {
        body: { dealId: id },
      });

      if (fnError) {
        console.error('Error triggering notification function:', fnError);
        throw new Error('Failed to send notifications');
      }

      // Then delete the deal
      return await supabase.from('deals').delete().eq('id', id);
    },
    {
      onSuccess: () => {
        toast({
          title: 'Deal Deleted',
          description: 'The deal has been deleted and managers notified.',
        });
        queryClient.invalidateQueries(['deals']);
        setDealToDelete(null);
        setShowDeleteConfirmation(false);
      },
      onError: error => {
        toast({
          title: 'Error',
          description: 'Failed to delete deal: ' + error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Calculate metrics from deals data
  const calculateMetrics = (): MetricsData => {
    const validDeals = deals.filter(deal => deal.status !== 'unwound');
    const totalSales = validDeals.length;
    const totalFrontGross = validDeals.reduce((sum, deal) => sum + (deal.front_end_gross || 0), 0);
    const totalBackGross = validDeals.reduce((sum, deal) => sum + (deal.back_end_gross || 0), 0);
    const totalFniGross = validDeals.reduce((sum, deal) => sum + (deal.fni_gross || 0), 0);
    const vscSold = validDeals.filter(deal => deal.vsc_sold).length;

    // Calculate derived metrics
    const vscAttachment = totalSales ? (vscSold / totalSales) * 100 : 0;
    const pvr = totalSales ? totalFniGross / totalSales : 0; // Per Vehicle Retailed
    const businessDays = 22; // Assumption: approx. business days in a month
    const ppd = totalSales ? totalSales / businessDays : 0; // Per Person per Day

    return {
      totalSales,
      totalFrontGross,
      totalBackGross,
      totalFniGross,
      vscAttachment,
      pvr,
      ppd,
    };
  };

  const metrics = calculateMetrics();

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-700">
            Pending
          </Badge>
        );
      case 'funded':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Funded
          </Badge>
        );
      case 'unwound':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Unwound
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get team/department badge
  const getTeamBadge = (team?: string, department?: string) => {
    if (!team && !department) return null;

    const displayText = department || team;
    let className = '';

    switch (team) {
      case 'red':
        className = 'bg-red-100 text-red-700';
        break;
      case 'blue':
        className = 'bg-blue-100 text-blue-700';
        break;
      case 'green':
        className = 'bg-green-100 text-green-700';
        break;
      case 'flex':
        className = 'bg-purple-100 text-purple-700';
        break;
      default:
        className = 'bg-gray-100 text-gray-700';
    }

    if (department === 'F&I') className = 'bg-indigo-100 text-indigo-700';
    if (department === 'Service') className = 'bg-cyan-100 text-cyan-700';

    return (
      <Badge variant="outline" className={className}>
        {displayText}
      </Badge>
    );
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => schedule.date === formattedDate);
  };

  // Handle deal deletion
  const handleDeleteDeal = (id: string) => {
    setDealToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteDeal = () => {
    if (dealToDelete) {
      deleteDealMutation.mutate({ id: dealToDelete });
    }
  };

  // Loading states
  const isLoading = isDealsLoading || isSchedulesLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Manager Dashboard</CardTitle>
          <CardDescription>
            Comprehensive overview of dealership performance and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="metrics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="deals">
                <FileText className="h-4 w-4 mr-2" />
                Deal Log
              </TabsTrigger>
            </TabsList>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Performance Metrics</h3>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => refetchDeals()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* F&I Gross Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>F&I Gross</CardDescription>
                    <CardTitle className="text-2xl flex items-center">
                      <DollarSign className="h-5 w-5 text-green-500 mr-1" />
                      {formatCurrency(metrics.totalFniGross)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      From {metrics.totalSales} total sales
                    </div>
                  </CardContent>
                </Card>

                {/* PVR Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>PVR (Per Vehicle Retailed)</CardDescription>
                    <CardTitle className="text-2xl flex items-center">
                      <CarFront className="h-5 w-5 text-blue-500 mr-1" />
                      {formatCurrency(metrics.pvr)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">F&I gross per vehicle sold</div>
                  </CardContent>
                </Card>

                {/* PPD Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>PPD (Per Person per Day)</CardDescription>
                    <CardTitle className="text-2xl flex items-center">
                      <TrendingUp className="h-5 w-5 text-indigo-500 mr-1" />
                      {metrics.ppd.toFixed(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Average daily units per salesperson
                    </div>
                  </CardContent>
                </Card>

                {/* VSC % Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>VSC Attachment %</CardDescription>
                    <CardTitle className="text-2xl flex items-center">
                      <Percent className="h-5 w-5 text-amber-500 mr-1" />
                      {metrics.vscAttachment.toFixed(1)}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Vehicle Service Contract attach rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-2">Sales Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Units Sold</span>
                          <span className="font-medium">{metrics.totalSales}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Front End Gross</span>
                          <span className="font-medium">
                            {formatCurrency(metrics.totalFrontGross)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Front Gross / Unit</span>
                          <span className="font-medium">
                            {formatCurrency(
                              metrics.totalSales ? metrics.totalFrontGross / metrics.totalSales : 0
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Month-to-Date Pace</span>
                          <span className="font-medium">
                            {Math.round(
                              metrics.totalSales * (30 / parseFloat(dateRange.end.split('-')[2]))
                            )}{' '}
                            units
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">F&I Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">F&I Gross Total</span>
                          <span className="font-medium">
                            {formatCurrency(metrics.totalFniGross)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Back End Gross</span>
                          <span className="font-medium">
                            {formatCurrency(metrics.totalBackGross)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">VSC Penetration</span>
                          <span className="font-medium">{metrics.vscAttachment.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Gross</span>
                          <span className="font-medium">
                            {formatCurrency(
                              metrics.totalFrontGross +
                                metrics.totalBackGross +
                                metrics.totalFniGross
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-medium">Department Schedule Overview</h3>

                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={date => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button variant="outline" size="icon" onClick={() => refetchSchedules()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isSchedulesLoading ? (
                <div className="h-[400px] w-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Week of {format(scheduleStartDate, 'MMMM d')} -{' '}
                    {format(scheduleEndDate, 'MMMM d, yyyy')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {scheduleDateRange.map(date => (
                      <Card
                        key={date.toString()}
                        className={isSameDay(date, new Date()) ? 'border-primary' : ''}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm font-medium">
                            {format(date, 'EEE')}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {format(date, 'MMM d')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          {getSchedulesForDate(date).length === 0 ? (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                              No shifts
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {getSchedulesForDate(date).map(schedule => (
                                <div
                                  key={schedule.id}
                                  className="text-xs p-2 rounded border bg-background relative group"
                                >
                                  <div className="font-medium">
                                    {schedule.salesperson?.first_name}{' '}
                                    {schedule.salesperson?.last_name}
                                  </div>
                                  <div className="text-muted-foreground mt-1">
                                    {formatTime(schedule.shift_start)} -{' '}
                                    {formatTime(schedule.shift_end)}
                                  </div>
                                  <div className="mt-1">
                                    {getTeamBadge(schedule.team, schedule.department)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Department Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['Sales', 'F&I', 'Service'].map(department => {
                          const deptSchedules = schedules.filter(s => s.department === department);
                          const totalShifts = deptSchedules.length;
                          const uniquePeople = new Set(deptSchedules.map(s => s.salesperson_id))
                            .size;

                          return (
                            <Card key={department} className="shadow-none border">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{department}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span>Total Shifts:</span>
                                    <span>{totalShifts}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Team Members:</span>
                                    <span>{uniquePeople}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Deal Log Tab */}
            <TabsContent value="deals" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h3 className="text-lg font-medium">Deal Log</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search deals..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                      <SelectItem value="unwound">Unwound</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" onClick={() => refetchDeals()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isDealsLoading ? (
                <div className="h-[400px] w-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isDealsError ? (
                <div className="h-[400px] w-full flex flex-col items-center justify-center text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>There was an error loading the deals.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => refetchDeals()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : deals.length === 0 ? (
                <div className="h-[400px] w-full flex flex-col items-center justify-center text-muted-foreground">
                  <p>No deals found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Salesperson</TableHead>
                        <TableHead className=" bg-gray-700 text-white">Front End</TableHead>
                        <TableHead className=" bg-gray-700 text-white">Back End</TableHead>
                        <TableHead className=" bg-gray-700 text-white">F&I Gross</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] bg-gray-700 text-white">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map(deal => (
                        <TableRow key={deal.id}>
                          <TableCell>{formatDate(deal.sale_date)}</TableCell>
                          <TableCell className="font-medium">{deal.customer_name}</TableCell>
                          <TableCell>{deal.vehicle}</TableCell>
                          <TableCell>
                            {deal.salesperson?.first_name} {deal.salesperson?.last_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deal.front_end_gross)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deal.back_end_gross)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(deal.fni_gross || 0)}
                          </TableCell>
                          <TableCell>{getStatusBadge(deal.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDeal(deal.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deal? This action will notify all Sales and F&I
              Managers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={deleteDealMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDeal}
              disabled={deleteDealMutation.isLoading}
            >
              {deleteDealMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Deal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
