import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface FiManagerStats {
  fi_manager_id: string;
  fi_manager_name: string;
  total_deals: number;
  total_fi_profit: number;
  deals_with_vsc: number;
  total_products_sold: number;
}

type SortField = 'total_fi_profit' | 'pvr' | 'ppd' | 'vsc_percentage';
type SortDirection = 'asc' | 'desc';

export default function FiDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FiManagerStats[]>([]);
  const [sortField, setSortField] = useState<SortField>('total_fi_profit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('fi_dashboard_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals',
        },
        () => {
          fetchFiManagerStats();
        }
      )
      .subscribe();

    fetchFiManagerStats();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchFiManagerStats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select(`
          fi_manager_id,
          users!deals_fi_manager_id_fkey(name),
          count(*) as total_deals,
          sum(vsc_profit + ppm_profit + tire_wheel_profit + paint_fabric_profit + other_profit) as total_fi_profit,
          sum(case when vsc_profit > 0 then 1 else 0 end) as deals_with_vsc,
          sum(case when vsc_profit > 0 or ppm_profit > 0 or tire_wheel_profit > 0 or paint_fabric_profit > 0 or other_profit > 0 then 1 else 0 end) as total_products_sold
        `)
        .group('fi_manager_id, users.name');

      if (error) throw error;

      const formattedStats = data.map((stat: any) => ({
        fi_manager_id: stat.fi_manager_id,
        fi_manager_name: stat.users.name,
        total_deals: stat.total_deals,
        total_fi_profit: stat.total_fi_profit || 0,
        deals_with_vsc: stat.deals_with_vsc,
        total_products_sold: stat.total_products_sold,
      }));

      setStats(formattedStats);
    } catch (error) {
      console.error('Error fetching F&I manager stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    let valueA: number;
    let valueB: number;

    switch (sortField) {
      case 'pvr':
        valueA = a.total_fi_profit / a.total_deals;
        valueB = b.total_fi_profit / b.total_deals;
        break;
      case 'ppd':
        valueA = a.total_products_sold / a.total_deals;
        valueB = b.total_products_sold / b.total_deals;
        break;
      case 'vsc_percentage':
        valueA = (a.deals_with_vsc / a.total_deals) * 100;
        valueB = (b.deals_with_vsc / b.total_deals) * 100;
        break;
      default:
        valueA = a.total_fi_profit;
        valueB = b.total_fi_profit;
    }

    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold">Loading F&I Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">F&I Manager Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F&I Manager
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_fi_profit')}
                  >
                    Total F&I Gross
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('pvr')}
                  >
                    PVR
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ppd')}
                  >
                    PPD
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('vsc_percentage')}
                  >
                    VSC %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStats.map((stat) => (
                  <tr key={stat.fi_manager_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.fi_manager_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${stat.total_fi_profit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(stat.total_fi_profit / stat.total_deals).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(stat.total_products_sold / stat.total_deals).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((stat.deals_with_vsc / stat.total_deals) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 