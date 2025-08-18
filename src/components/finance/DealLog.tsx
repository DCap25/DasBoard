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
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 px-4 sm:px-6 gap-3">
        <div>
          <CardTitle className="text-2xl text-gray-800">Deal Log</CardTitle>
          <CardDescription>View and manage your recent deals</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDeals}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
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
          <>
            {/* Mobile card view */}
            <div className="block sm:hidden px-4">
              {deals.map(deal => (
                <div key={deal.id} className="border rounded-lg p-4 mb-3 bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {deal.deal_details?.customer
                          ? `${deal.deal_details.customer.firstName} ${deal.deal_details.customer.lastName}`
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.deal_details?.deal?.saleDate
                          ? formatDate(deal.deal_details.deal.saleDate)
                          : formatDate(deal.created_at)}
                      </p>
                    </div>
                    {deal.vsc_sold ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                        VSC
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {deal.deal_details?.vehicle
                        ? `${deal.deal_details.vehicle.year} ${deal.deal_details.vehicle.make} ${deal.deal_details.vehicle.model}`
                        : 'Vehicle N/A'}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">
                        Deal: {formatCurrency(deal.deal_amount)}
                      </span>
                      <span className="text-sm text-green-600">
                        Profit: {formatCurrency(deal.product_profit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">
                      Vehicle
                    </TableHead>{' '}
                    {/* Hide on tablets */}
                    <TableHead className="font-semibold text-right">Deal Amount</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">
                      VSC Sold
                    </TableHead>{' '}
                    {/* Hide on smaller screens */}
                    <TableHead className="font-semibold text-right">Product Profit</TableHead>
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
                        <TableCell className="whitespace-nowrap">
                          {deal.deal_details?.deal?.saleDate
                            ? formatDate(deal.deal_details.deal.saleDate)
                            : formatDate(deal.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {deal.deal_details?.customer
                                ? `${deal.deal_details.customer.firstName} ${deal.deal_details.customer.lastName}`
                                : 'N/A'}
                            </p>
                            {/* Show vehicle on mobile/tablet as subtitle */}
                            <p className="text-xs text-muted-foreground md:hidden">
                              {deal.deal_details?.vehicle
                                ? `${deal.deal_details.vehicle.year} ${deal.deal_details.vehicle.make} ${deal.deal_details.vehicle.model}`
                                : 'Vehicle N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {' '}
                          {/* Hide on tablets and below */}
                          {deal.deal_details?.vehicle
                            ? `${deal.deal_details.vehicle.year} ${deal.deal_details.vehicle.make} ${deal.deal_details.vehicle.model}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(deal.deal_amount)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {' '}
                          {/* Hide on smaller screens */}
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
                        <TableCell className="text-right">
                          <div>
                            <p className="font-medium text-green-600">
                              {formatCurrency(deal.product_profit)}
                            </p>
                            {/* Show VSC status inline on smaller screens */}
                            {deal.vsc_sold && (
                              <span className="text-xs text-green-600 lg:hidden">+VSC</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
