import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../../lib/use-toast';

interface Manufacturer {
  id: number;
  name: string;
  dealership_count: number;
}

export function DealerGroupCreationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<number[]>([]);
  const [totalDealerships, setTotalDealerships] = useState(0);

  // Fetch available manufacturers
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const { data, error } = await supabase.from('manufacturers').select('*');

        if (error) {
          throw error;
        }

        // Calculate dealership count for each manufacturer
        const manufacturersWithCount = await Promise.all(
          (data || []).map(async manufacturer => {
            const { count } = await supabase
              .from('dealerships')
              .select('*', { count: 'exact', head: true })
              .eq('manufacturer_id', manufacturer.id);

            return {
              ...manufacturer,
              dealership_count: count || 0,
            };
          })
        );

        setManufacturers(manufacturersWithCount);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load manufacturers. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchManufacturers();
  }, []);

  // Calculate total dealerships when selected manufacturers change
  useEffect(() => {
    const count = manufacturers
      .filter(m => selectedManufacturers.includes(m.id))
      .reduce((sum, m) => sum + m.dealership_count, 0);

    setTotalDealerships(count);
  }, [selectedManufacturers, manufacturers]);

  const handleManufacturerChange = (manufacturerId: number, checked: boolean) => {
    if (checked) {
      setSelectedManufacturers(prev => [...prev, manufacturerId]);
    } else {
      setSelectedManufacturers(prev => prev.filter(id => id !== manufacturerId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group name',
        variant: 'destructive',
      });
      return;
    }

    if (selectedManufacturers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one manufacturer',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // First create the dealer group
      const { data, error } = await supabase
        .from('dealer_groups')
        .insert([{ name: groupName, dealer_count: 0 }])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      if (!data?.id) {
        throw new Error('Failed to create dealer group');
      }

      // Use the associate_manufacturers function we created
      const { error: funcError } = await supabase.rpc(
        'associate_manufacturers_with_dealer_group',
        {
          p_group_id: data.id,
          p_manufacturer_ids: selectedManufacturers,
        }
      );

      if (funcError) {
        throw funcError;
      }

      // Manually update the dealer count to ensure it's correct
      await supabase.rpc('sync_all_dealer_group_counts');

      toast({
        title: 'Success',
        description: `Dealer group "${groupName}" created with ${totalDealerships} dealerships`,
      });

      // Reset form
      setGroupName('');
      setSelectedManufacturers([]);

      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating dealer group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dealer group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Create New Dealer Group</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="groupName" className="text-sm sm:text-base font-medium">
              Group Name
            </Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Enter dealer group name"
              required
              className="text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="block text-sm sm:text-base font-medium">Select Manufacturers</Label>
            <div className="border rounded-md p-3 sm:p-4 max-h-48 sm:max-h-60 overflow-y-auto space-y-3 sm:space-y-2">
              {manufacturers.map(manufacturer => (
                <div
                  key={manufacturer.id}
                  className="flex items-center space-x-3 sm:space-x-2 py-1"
                >
                  <Checkbox
                    id={`manufacturer-${manufacturer.id}`}
                    checked={selectedManufacturers.includes(manufacturer.id)}
                    onCheckedChange={checked =>
                      handleManufacturerChange(manufacturer.id, checked === true)
                    }
                    className="h-5 w-5 sm:h-4 sm:w-4"
                  />
                  <label
                    htmlFor={`manufacturer-${manufacturer.id}`}
                    className="text-sm sm:text-sm font-medium leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                  >
                    {manufacturer.name} ({manufacturer.dealership_count} dealerships)
                  </label>
                </div>
              ))}
              {manufacturers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No manufacturers available</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 sm:p-4 rounded-md">
            <p className="text-sm sm:text-base font-medium mb-2">Summary</p>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm">
                Selected manufacturers:{' '}
                <span className="font-medium">{selectedManufacturers.length}</span>
              </p>
              <p className="text-xs sm:text-sm">
                Total dealerships: <span className="font-medium">{totalDealerships}</span>
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full text-base sm:text-sm"
            disabled={loading}
            size="lg"
          >
            {loading ? 'Creating...' : 'Create Dealer Group'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
