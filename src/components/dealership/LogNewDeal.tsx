import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, Deal, DealType, VehicleType } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const dealSchema = z.object({
  stock_number: z.string().min(1, 'Stock number is required'),
  vin_last8: z.string().length(8, 'Last 8 of VIN must be 8 characters'),
  new_or_used: z.enum(['N', 'U', 'D']),
  customer_last_name: z.string().min(1, 'Customer last name is required'),
  deal_type: z.enum(['Cash', 'Finance', 'Lease']),
  salesperson_id: z.string().min(1, 'Salesperson is required'),
  reserve_flat_amount: z.number().nullable(),
  vsc_profit: z.number().nullable(),
  ppm_profit: z.number().nullable(),
  tire_wheel_profit: z.number().nullable(),
  paint_fabric_profit: z.number().nullable(),
  other_profit: z.number().nullable(),
  front_end_gross: z.number().min(0, 'Front end gross must be a positive number'),
});

type DealFormData = z.infer<typeof dealSchema>;

export default function LogNewDeal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalFiProfit, setTotalFiProfit] = useState(0);
  const [isFiManager, setIsFiManager] = useState(false);
  const [salespeople, setSalespeople] = useState<
    { id: string; first_name: string; last_name: string }[]
  >([]);

  useEffect(() => {
    const checkFiManagerRole = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: userRole } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userRole) {
        setIsFiManager(userRole.role === 'F&I');
      }
    };

    const fetchSalespeople = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('role_id', 'salesperson'); // Assuming 'salesperson' is the role_id for salespeople

      if (error) {
        console.error('Error fetching salespeople:', error);
        return;
      }

      if (data) {
        setSalespeople(data);
      }
    };

    checkFiManagerRole();
    fetchSalespeople();
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      new_or_used: 'N',
      deal_type: 'Finance',
      reserve_flat_amount: null,
      vsc_profit: null,
      ppm_profit: null,
      tire_wheel_profit: null,
      paint_fabric_profit: null,
      other_profit: null,
      front_end_gross: 0,
    },
  });

  // Watch profit fields to calculate total F&I profit
  const watchProfitFields = watch([
    'vsc_profit',
    'ppm_profit',
    'tire_wheel_profit',
    'paint_fabric_profit',
    'other_profit',
  ]);

  // Calculate total F&I profit whenever profit fields change
  useEffect(() => {
    const total = watchProfitFields.reduce((sum, profit) => sum + (profit || 0), 0);
    setTotalFiProfit(total);
  }, [watchProfitFields]);

  const onSubmit = async (data: DealFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a deal',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the salesperson to get their initials
      const salesperson = salespeople.find(person => person.id === data.salesperson_id);
      const initials = salesperson ? `${salesperson.first_name[0]}${salesperson.last_name[0]}` : '';

      const newDeal: Deal = {
        ...data,
        salesperson_initials: initials, // Save initials for display in deal log
        status: 'Pending',
        created_by: user.id,
        fi_manager_id: user.id,
      };

      const { error } = await supabase.from('deals').insert(newDeal);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deal created successfully',
      });
      navigate('/dashboard/deals');
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create deal',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isFiManager) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be an F&I Manager to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Log New Deal</CardTitle>
          <CardDescription>Enter the details for a new vehicle deal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Number */}
              <div className="space-y-2">
                <Label htmlFor="stock_number">Stock Number</Label>
                <Input
                  id="stock_number"
                  {...register('stock_number')}
                  placeholder="Enter stock number"
                />
                {errors.stock_number && (
                  <p className="text-sm text-red-500">{errors.stock_number.message}</p>
                )}
              </div>

              {/* VIN Last 8 */}
              <div className="space-y-2">
                <Label htmlFor="vin_last8">Last 8 of VIN</Label>
                <Input
                  id="vin_last8"
                  {...register('vin_last8')}
                  placeholder="Enter last 8 of VIN"
                  maxLength={8}
                />
                {errors.vin_last8 && (
                  <p className="text-sm text-red-500">{errors.vin_last8.message}</p>
                )}
              </div>

              {/* New/Used/Demo */}
              <div className="space-y-2">
                <Label htmlFor="new_or_used">Vehicle Type</Label>
                <Select
                  onValueChange={(value: 'N' | 'U' | 'D') => setValue('new_or_used', value)}
                  defaultValue="N"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">New</SelectItem>
                    <SelectItem value="U">Used</SelectItem>
                    <SelectItem value="D">Demo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Last Name */}
              <div className="space-y-2">
                <Label htmlFor="customer_last_name">Customer Last Name</Label>
                <Input
                  id="customer_last_name"
                  {...register('customer_last_name')}
                  placeholder="Enter customer last name"
                />
                {errors.customer_last_name && (
                  <p className="text-sm text-red-500">{errors.customer_last_name.message}</p>
                )}
              </div>

              {/* Salesperson */}
              <div className="space-y-2">
                <Label htmlFor="salesperson_id">Salesperson</Label>
                <Select onValueChange={(value: string) => setValue('salesperson_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    {salespeople.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.salesperson_id && (
                  <p className="text-sm text-red-500">{errors.salesperson_id.message}</p>
                )}
              </div>

              {/* Deal Type */}
              <div className="space-y-2">
                <Label htmlFor="deal_type">Deal Type</Label>
                <Select
                  onValueChange={(value: DealType) => setValue('deal_type', value)}
                  defaultValue="Finance"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Lease">Lease</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reserve/Flat Amount */}
              <div className="space-y-2">
                <Label htmlFor="reserve_flat_amount">Reserve/Flat Amount</Label>
                <Input
                  id="reserve_flat_amount"
                  type="number"
                  step="0.01"
                  {...register('reserve_flat_amount', { valueAsNumber: true })}
                  placeholder="Enter reserve/flat amount"
                />
              </div>

              {/* Profit Fields */}
              <div className="space-y-2">
                <Label htmlFor="vsc_profit">VSC Profit</Label>
                <Input
                  id="vsc_profit"
                  type="number"
                  step="0.01"
                  {...register('vsc_profit', { valueAsNumber: true })}
                  placeholder="Enter VSC profit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ppm_profit">PPM Profit</Label>
                <Input
                  id="ppm_profit"
                  type="number"
                  step="0.01"
                  {...register('ppm_profit', { valueAsNumber: true })}
                  placeholder="Enter PPM profit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tire_wheel_profit">Tire & Wheel Profit</Label>
                <Input
                  id="tire_wheel_profit"
                  type="number"
                  step="0.01"
                  {...register('tire_wheel_profit', { valueAsNumber: true })}
                  placeholder="Enter tire & wheel profit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paint_fabric_profit">Paint & Fabric Profit</Label>
                <Input
                  id="paint_fabric_profit"
                  type="number"
                  step="0.01"
                  {...register('paint_fabric_profit', { valueAsNumber: true })}
                  placeholder="Enter paint & fabric profit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other_profit">Other Profit</Label>
                <Input
                  id="other_profit"
                  type="number"
                  step="0.01"
                  {...register('other_profit', { valueAsNumber: true })}
                  placeholder="Enter other profit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="front_end_gross">Front End Gross</Label>
                <Input
                  id="front_end_gross"
                  type="number"
                  step="0.01"
                  {...register('front_end_gross', { valueAsNumber: true })}
                  placeholder="Enter front end gross"
                />
                {errors.front_end_gross && (
                  <p className="text-sm text-red-500">{errors.front_end_gross.message}</p>
                )}
              </div>
            </div>

            {/* Total F&I Profit Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">
                Total F&I Profit: ${totalFiProfit.toFixed(2)}
              </h3>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Deal...' : 'Create Deal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
