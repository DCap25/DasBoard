import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../hooks/use-toast';
import { useSupabaseQuery } from '../../hooks/use-supabase-query';
import { useSupabaseMutation } from '../../hooks/use-supabase-mutation';
import { queryClient } from '../../lib/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loader2, Edit, Save, AlertTriangle, Search, RefreshCw } from 'lucide-react';

// Define interfaces for our data types
interface Deal {
  id: string;
  customer_name: string;
  vehicle: string;
  sale_date: string;
  front_end_gross: number;
  back_end_gross: number;
  salesperson_id: string;
  status: 'pending' | 'funded' | 'unwound';
  created_at: string;
  salesperson?: {
    first_name: string;
    last_name: string;
  };
}

interface EditableDeal {
  id: string;
  front_end_gross: number;
  status: 'pending' | 'funded' | 'unwound';
}

export function DealLogEditor() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for selected deal and filter
  const [selectedDeal, setSelectedDeal] = useState<EditableDeal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0], // Today
  });

  // Fetch deals query
  const {
    data: deals = [],
    isLoading,
    isError,
    refetch,
  } = useSupabaseQuery<Deal[]>(['deals', filterStatus, searchTerm, dateRange], async () => {
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

  // Define mutation for updating deals
  const updateDealMutation = useSupabaseMutation<{ success: boolean }, EditableDeal>(
    async variables => {
      const { id, ...updateData } = variables;
      return await supabase.from('deals').update(updateData).eq('id', id).select();
    },
    {
      onSuccess: () => {
        toast({
          title: 'Deal Updated',
          description: 'The deal information has been successfully updated.',
        });
        queryClient.invalidateQueries(['deals']);
        setSelectedDeal(null);
        setIsEditing(false);
      },
    }
  );

  // Handle deal status change
  const handleStatusChange = (status: 'pending' | 'funded' | 'unwound') => {
    if (selectedDeal) {
      setSelectedDeal({ ...selectedDeal, status });
    }
  };

  // Handle front end gross change
  const handleFrontEndGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedDeal) {
      const value = parseFloat(e.target.value) || 0;
      setSelectedDeal({ ...selectedDeal, front_end_gross: value });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeal) {
      updateDealMutation.mutate(selectedDeal);
    }
  };

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

  // Get status badge color
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Deal Management</CardTitle>
              <CardDescription>Review and update deal information</CardDescription>
            </div>

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

              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="h-[400px] w-full flex flex-col items-center justify-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <p>There was an error loading the deals.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
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
                    <TableHead className="text-right">Front End</TableHead>
                    <TableHead className="text-right">Back End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
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
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
                      <TableCell>
                        <Dialog
                          open={isEditing && selectedDeal?.id === deal.id}
                          onOpenChange={open => {
                            if (!open) setIsEditing(false);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDeal({
                                  id: deal.id,
                                  front_end_gross: deal.front_end_gross,
                                  status: deal.status,
                                });
                                setIsEditing(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Deal</DialogTitle>
                              <DialogDescription>
                                Update deal information for {deal.customer_name}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="front_end_gross">Front End Gross ($)</Label>
                                  <Input
                                    id="front_end_gross"
                                    type="number"
                                    value={selectedDeal?.front_end_gross || 0}
                                    onChange={handleFrontEndGrossChange}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="status">Deal Status</Label>
                                  <Select
                                    value={selectedDeal?.status || 'pending'}
                                    onValueChange={(value: 'pending' | 'funded' | 'unwound') =>
                                      handleStatusChange(value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="funded">Funded</SelectItem>
                                      <SelectItem value="unwound">Unwound</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {selectedDeal?.status === 'unwound' && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Warning: Unwinding a deal may affect salesperson commissions.
                                    </p>
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={updateDealMutation.isLoading}>
                                  {updateDealMutation.isLoading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving
                                    </>
                                  ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      Save Changes
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
