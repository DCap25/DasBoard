import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../lib/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { RefreshCw, Info } from 'lucide-react';

interface Deal {
  id: string;
  user_id: string;
  deal_amount: number;
  vsc_sold: boolean;
  product_profit: number;
  deal_details: {
    dealId: string;
    customer: {
      firstName: string;
      lastName: string;
    };
    vehicle: {
      year: string;
      make: string;
      model: string;
      trim: string;
      vin: string;
    };
    deal: {
      saleDate: string;
      sellingPrice: string;
      salesperson: string;
    };
    status: string;
  };
  created_at: string;
}

export const DealLog: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSchema, setUserSchema] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user's schema and deals
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('[DealLog] Fetching user data...');
        setLoading(true);

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error('[DealLog] No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('[DealLog] User authenticated:', user.id);

        // Fetch the user's schema from schema_user_mappings
        const { data: schemaMapping, error: schemaMappingError } = await supabase
          .from('schema_user_mappings')
          .select('schema_name')
          .eq('user_id', user.id)
          .eq('schema_type', 'finance_manager')
          .single();

        if (schemaMappingError) {
          console.error('[DealLog] Error fetching schema mapping:', schemaMappingError);
          setLoading(false);
          return;
        }

        if (!schemaMapping?.schema_name) {
          console.warn('[DealLog] No schema found for user. Using public schema as fallback.');
          setUserSchema('public');
        } else {
          console.log('[DealLog] User schema found:', schemaMapping.schema_name);
          setUserSchema(schemaMapping.schema_name);
        }

        const schema = schemaMapping?.schema_name || 'public';

        // Fetch the user's deals
        const { data: dealsData, error: dealsError } = await supabase
          .from(`${schema}.deals`)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dealsError) {
          console.error('[DealLog] Error fetching deals:', dealsError);
          toast({
            title: 'Error',
            description: 'Could not fetch your deals. Please try again later.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        console.log('[DealLog] Deals fetched:', dealsData?.length || 0);
        setDeals(dealsData || []);
      } catch (error) {
        console.error('[DealLog] Unexpected error:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Refresh deals
  const refreshDeals = () => {
    setLoading(true);
    const fetchUserData = async () => {
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !userSchema) {
          setLoading(false);
          return;
        }

        // Fetch the user's deals
        const { data: dealsData, error: dealsError } = await supabase
          .from(`${userSchema}.deals`)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dealsError) {
          console.error('[DealLog] Error refreshing deals:', dealsError);
          toast({
            title: 'Error',
            description: 'Could not refresh your deals. Please try again later.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        console.log('[DealLog] Deals refreshed:', dealsData?.length || 0);
        setDeals(dealsData || []);
      } catch (error) {
        console.error('[DealLog] Unexpected error during refresh:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl text-gray-800">Deal Log</CardTitle>
          <CardDescription>View and manage your recent deals</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDeals}
          disabled={loading}
          className="ml-auto"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <Info className="h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">No deals found</h3>
            <p className="max-w-md mt-2">
              You haven't logged any deals yet. Use the "Log New Deal" button to record your first
              deal.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Vehicle</TableHead>
                  <TableHead className="font-semibold">Deal Amount</TableHead>
                  <TableHead className="font-semibold">VSC Sold</TableHead>
                  <TableHead className="font-semibold">Product Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                      <span className="text-sm text-gray-500 mt-2">Loading deals...</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  deals.map(deal => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        {deal.deal_details?.deal?.saleDate
                          ? formatDate(deal.deal_details.deal.saleDate)
                          : formatDate(deal.created_at)}
                      </TableCell>
                      <TableCell>
                        {deal.deal_details?.customer
                          ? `${deal.deal_details.customer.firstName} ${deal.deal_details.customer.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {deal.deal_details?.vehicle
                          ? `${deal.deal_details.vehicle.year} ${deal.deal_details.vehicle.make} ${deal.deal_details.vehicle.model}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(deal.deal_amount)}</TableCell>
                      <TableCell>
                        {deal.vsc_sold ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(deal.product_profit)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
