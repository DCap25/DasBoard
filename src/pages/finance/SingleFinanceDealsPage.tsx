import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SingleFinanceStorage } from '../../lib/singleFinanceStorage';
import { getConsistentUserId, debugUserId } from '../../utils/userIdHelper';
import { supabase } from '../../lib/supabaseClient';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileEdit,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

// Interface for a deal
interface Deal {
  id: string;
  customer: string;
  vehicle: string;
  vin: string;
  saleDate: string;
  salesperson: string;
  amount: number;
  status: string;
  products: string[];
  profit: number;
  created_at: string;
  // Extended properties from form data
  lastName?: string;
  dealNumber?: string;
  stockNumber?: string;
  vinLast8?: string;
  vehicleType?: string;
  dealDate?: string;
  frontEndGross?: number;
  backEndGross?: number;
  totalGross?: number;
  vscProfit?: number;
  ppmProfit?: number;
  gapProfit?: number;
  tireAndWheelProfit?: number;
  appearanceProfit?: number;
  otherProfit?: number;
  theftProfit?: number;
  bundledProfit?: number;
  lender?: string;
  dealStatus?: string;
}

const SingleFinanceDealsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('saleDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  // Attempt to fetch user id directly if token exists but context not ready
  useEffect(() => {
    let cancelled = false;
    const tryFetch = async () => {
      if (localUserId || user?.id) return;
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id || null;
      if (!cancelled && uid) {
        console.log('[SingleFinanceDealsPage] Got user ID from session:', uid);
        setLocalUserId(uid);
        // Also store it for future use
        localStorage.setItem('singleFinanceUserId', uid);
      }
    };
    tryFetch();
    const t = setTimeout(tryFetch, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, localUserId]);

  // Helper function to get user ID with fallback
  const getUserId = () => {
    // Use the same logic as dashboard
    const userId = getConsistentUserId(user) || localUserId || localStorage.getItem('singleFinanceUserId');
    debugUserId('SingleFinanceDealsPage', user, localUserId);
    console.log('[SingleFinanceDealsPage] Final resolved user ID:', userId);
    return userId;
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard/single-finance');
  };

  // Handle status change for a deal
  const handleStatusChange = (dealId: string, newStatus: string) => {
    try {
      // Get existing deals from localStorage
      const userId = getUserId();
      if (!userId) return;
      
      const existingDeals = SingleFinanceStorage.getDeals(userId);

      // Update the deal status
      const updatedDeals = existingDeals.map((deal: any) =>
        deal.id === dealId ? { ...deal, status: newStatus, dealStatus: newStatus } : deal
      );

      // Save back to localStorage
      SingleFinanceStorage.setDeals(userId, updatedDeals);

      // Update state immediately to trigger re-render
      setDeals(currentDeals => 
        currentDeals.map(deal => 
          deal.id === dealId ? { ...deal, status: newStatus } : deal
        )
      );

      // Also reload deals to keep consistency
      const formattedDeals: Deal[] = updatedDeals.map((rawDeal: any) => {
        const deal: Deal = {
          id: rawDeal.id,
          customer: rawDeal.customer || rawDeal.lastName || 'Unknown',
          vehicle: rawDeal.vehicle || `${rawDeal.vehicleType === 'N' ? 'New' : rawDeal.vehicleType === 'U' ? 'Used' : 'CPO'} - Stock #${rawDeal.stockNumber}`,
          vin: rawDeal.vin || rawDeal.vinLast8 || '',
          saleDate: rawDeal.saleDate || rawDeal.dealDate || rawDeal.created_at,
          salesperson: rawDeal.salesperson || 'Self',
          amount: rawDeal.amount || rawDeal.totalGross || 0,
          status: rawDeal.status || rawDeal.dealStatus || 'Pending',
          products: rawDeal.products || [],
          profit: rawDeal.profit || rawDeal.backEndGross || 0,
          created_at: rawDeal.created_at || new Date().toISOString(),
        };
        return Object.assign(deal, rawDeal);
      });
      setDeals(formattedDeals);

      console.log(`Updated deal ${dealId} status to ${newStatus}`);
    } catch (error) {
      console.error('Error updating deal status:', error);
    }
  };

  // Handle deal editing
  const handleEditDeal = (dealId: string) => {
    // Navigate to the deal edit page with the deal ID
    navigate(`/single-finance-deal-log/edit/${dealId}`);
  };

  // Handle deal deletion with enhanced warning popup
  const handleDeleteDeal = (dealId: string, shouldDelete: boolean) => {
    if (!shouldDelete) return;

    // Enhanced warning popup with better messaging
    const confirmed = confirm(
      '⚠️ DELETE CONFIRMATION\n\n' +
      'Are you sure you want to delete this deal?\n\n' +
      'This action will:\n' +
      '• Permanently remove all deal data\n' +
      '• Update your dashboard metrics\n' +
      '• Cannot be undone\n\n' +
      'Click OK to delete or Cancel to keep the deal.'
    );

    if (confirmed) {
      // Second confirmation for extra safety
      const finalConfirm = confirm(
        '🚨 FINAL CONFIRMATION\n\n' +
        'This is your last chance!\n\n' +
        'Click OK to permanently delete this deal, or Cancel to keep it.'
      );

      if (finalConfirm) {
        try {
          // Get existing deals from localStorage
          const userId = getUserId();
          if (!userId) return;
          
          const existingDeals = SingleFinanceStorage.getDeals(userId);

          // Remove the deal
          const updatedDeals = existingDeals.filter((deal: any) => deal.id !== dealId);

          // Save back to localStorage
          SingleFinanceStorage.setDeals(userId, updatedDeals);

          // Reload deals to reflect the change
          const formattedDeals: Deal[] = updatedDeals.map((rawDeal: any) => {
            const deal: Deal = {
              id: rawDeal.id,
              customer: rawDeal.customer || rawDeal.lastName || 'Unknown',
              vehicle: rawDeal.vehicle || `${rawDeal.vehicleType === 'N' ? 'New' : rawDeal.vehicleType === 'U' ? 'Used' : 'CPO'} - Stock #${rawDeal.stockNumber}`,
              vin: rawDeal.vin || rawDeal.vinLast8 || '',
              saleDate: rawDeal.saleDate || rawDeal.dealDate || rawDeal.created_at,
              salesperson: rawDeal.salesperson || 'Self',
              amount: rawDeal.amount || rawDeal.totalGross || 0,
              status: rawDeal.status || rawDeal.dealStatus || 'Pending',
              products: rawDeal.products || [],
              profit: rawDeal.profit || rawDeal.backEndGross || 0,
              created_at: rawDeal.created_at || new Date().toISOString(),
            };
            return Object.assign(deal, rawDeal);
          });
          setDeals(formattedDeals);

          console.log(`Deleted deal ${dealId}`);
        } catch (error) {
          console.error('Error deleting deal:', error);
        }
      }
    }
  };

  // Function to load deals from localStorage
  const loadDealsFromStorage = () => {
    try {
      const userId = getUserId();
      console.log('[SingleFinanceDealsPage] Loading deals, userId:', userId);
      if (!userId) {
        console.warn('[SingleFinanceDealsPage] No user ID available');
        return;
      }
      
      const parsedDeals = SingleFinanceStorage.getDeals(userId);
      console.log('[SingleFinanceDealsPage] Loaded deals from storage:', parsedDeals.length);
      if (parsedDeals.length > 0) {
        // Map raw deal data to component interface while preserving extended properties
        const formattedDeals: Deal[] = parsedDeals.map((rawDeal: any) => {
          const deal: Deal = {
            id: rawDeal.id,
            customer: rawDeal.customer || rawDeal.lastName || 'Unknown',
            vehicle:
              rawDeal.vehicle ||
              `${rawDeal.vehicleType === 'N' ? 'New' : rawDeal.vehicleType === 'U' ? 'Used' : 'CPO'} - Stock #${rawDeal.stockNumber}`,
            vin: rawDeal.vin || rawDeal.vinLast8 || '',
            saleDate: rawDeal.saleDate || rawDeal.dealDate || rawDeal.created_at,
            salesperson: rawDeal.salesperson || 'Self',
            amount: rawDeal.amount || rawDeal.totalGross || 0,
            status: rawDeal.status || rawDeal.dealStatus || 'Pending',
            products: rawDeal.products || [],
            profit: rawDeal.profit || rawDeal.backEndGross || 0,
            created_at: rawDeal.created_at || new Date().toISOString(),
          };
          // Preserve extended properties
          return Object.assign(deal, rawDeal);
        });
        setDeals(formattedDeals);
      } else {
        setDeals([]);
      }
    } catch (error) {
      console.error('Error loading deals from localStorage:', error);
    }
  };

  // Load deals from localStorage - using singleFinanceDeals storage key
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      console.log('[SingleFinanceDealsPage] User available, loading deals with userId:', userId);
      loadDealsFromStorage();
    } else {
      console.log('[SingleFinanceDealsPage] Waiting for user...');
    }

    // Listen for deals updates from the deal log page
    const handleDealsUpdated = (event: CustomEvent) => {
      console.log('[SingleFinanceDealsPage] Received deals update event', event.detail);
      const currentUserId = getUserId();
      if (currentUserId) {
        loadDealsFromStorage();
      }
    };

    window.addEventListener('singleFinanceDealsUpdated', handleDealsUpdated as EventListener);

    return () => {
      window.removeEventListener('singleFinanceDealsUpdated', handleDealsUpdated as EventListener);
    };
  }, [user?.id, localUserId]); // Added localUserId as dependency

  // Filter and sort deals
  const filteredDeals = deals
    .filter(deal => {
      const matchesSearch =
        deal.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.dealNumber && deal.dealNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deal.vin && deal.vin.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];

      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      return 0;
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
      case 'Funded':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
      case 'Bank Approval':
      case 'Contract Review':
      case 'Insurance Verification':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
      case 'Pending Documents':
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
      case 'Held':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Clock className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
      case 'Unwound':
      case 'Dead Deal':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={handleBackToDashboard}
          className="mr-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Single Finance Manager - Deals</h1>
      </div>

      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-orange-800 text-sm">
          <strong>Note:</strong> These deals are specific to your Single Finance Manager Dashboard
          and are stored separately from the main finance deals.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search deals by customer, vehicle, deal #, or VIN"
            className="pl-9 border-gray-300"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2">
            <Filter size={16} className="text-gray-500" />
            <select
              className="border-0 rounded p-2 text-sm focus:ring-0 focus:outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Funded">Funded</option>
              <option value="Held">Held</option>
              <option value="Unwound">Unwound</option>
              <option value="Dead Deal">Dead Deal</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="border hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs">
                  <th className="py-3 px-4 text-center font-medium">#</th>
                  <th className="py-3 px-4 text-left font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('customer')}>
                      Last Name
                      {sortField === 'customer' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('dealNumber')}>
                      Deal #
                      {sortField === 'dealNumber' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Stock #</th>
                  <th className="py-3 px-4 text-center font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('saleDate')}>
                      Date
                      {sortField === 'saleDate' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">VIN</th>
                  <th className="py-3 px-4 text-center font-medium">N/U/CPO</th>
                  <th className="py-3 px-4 text-left font-medium">Lender</th>
                  <th className="py-3 px-4 text-right font-medium">Front End</th>
                  <th className="py-3 px-4 text-right font-medium">VSC</th>
                  <th className="py-3 px-4 text-right font-medium">PPM</th>
                  <th className="py-3 px-4 text-right font-medium">GAP</th>
                  <th className="py-3 px-4 text-right font-medium">T&W</th>
                  <th className="py-3 px-4 text-right font-medium">App</th>
                  <th className="py-3 px-4 text-right font-medium">Theft</th>
                  <th className="py-3 px-4 text-right font-medium">Bundled</th>
                  <th className="py-3 px-4 text-center font-medium">PPD</th>
                  <th className="py-3 px-4 text-right font-medium">PVR</th>
                  <th className="py-3 px-4 text-right font-medium">
                    <button
                      className="flex items-center ml-auto"
                      onClick={() => toggleSort('profit')}
                    >
                      Total
                      {sortField === 'profit' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center font-medium">Status</th>
                  <th className="py-3 px-4 text-center font-medium bg-blue-600 text-white">Edit</th>
                  <th className="py-3 px-4 text-center font-medium bg-red-600 text-white">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={21} className="py-8 text-center text-gray-500">
                      {deals.length === 0
                        ? "No deals logged yet. Use the 'Log New Deal' button to add deals."
                        : 'No deals match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal, index) => {
                    const dealData = deal as any; // Access extended properties
                    
                    // Extract last name from customer
                    const lastName = deal.customer.split(' ').pop() || '';

                    // Format date for display
                    const actualDealDate = dealData.dealDate || deal.saleDate;
                    const dealDate = new Date(actualDealDate);
                    const formattedDate = dealDate.toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit',
                    });

                    // Determine if New, Used or CPO
                    const vehicleType = dealData.vehicleType || 
                      (deal.vehicle.toLowerCase().includes('new') ? 'N' : 
                       deal.vehicle.toLowerCase().includes('cpo') ? 'C' : 'U');

                    // Get individual product profits
                    const vscProfit = parseFloat(dealData.vscProfit) || 0;
                    const ppmProfit = parseFloat(dealData.ppmProfit) || 0;
                    const gapProfit = parseFloat(dealData.gapProfit) || 0;
                    const twProfit = parseFloat(dealData.tireAndWheelProfit) || 0;
                    const appearanceProfit = parseFloat(dealData.appearanceProfit) || 0;
                    const theftProfit = parseFloat(dealData.theftProfit) || 0;
                    const bundledProfit = parseFloat(dealData.bundledProfit) || 0;

                    // Products per deal
                    const ppd = deal.products.length;

                    // PVR (per vehicle retailed)
                    const pvr = Math.round(deal.profit / (ppd || 1));

                    // Debug logging
                    if (deal.id === 'some-id') {
                      console.log(`[ViewAllDeals] Deal ${deal.id} status: "${deal.status}", Should be red: ${deal.status === 'Held'}`);
                    }

                    return (
                      <tr 
                        key={deal.id} 
                        className="border-b"
                        style={{
                          backgroundColor: 
                            deal.status === 'Funded' ? '#dcfce7' : 
                            deal.status === 'Held' ? '#fecaca' : 
                            'white'
                        }}
                      >
                        <td className="py-3 px-4 text-center font-medium">
                          {filteredDeals.length - index}
                        </td>
                        <td className="py-3 px-4 font-medium">{lastName}</td>
                        <td className="py-3 px-4 font-medium text-blue-600">
                          {dealData.dealNumber || deal.id}
                        </td>
                        <td className="py-3 px-4 font-mono">{dealData.stockNumber || 'N/A'}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{formattedDate}</td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {dealData.vinLast8 || (deal.vin ? deal.vin.slice(-8) : 'N/A')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              vehicleType === 'N'
                                ? 'bg-green-100 text-green-800'
                                : vehicleType === 'C'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {vehicleType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">{dealData.lender || 'N/A'}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(dealData.frontEndGross || 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(vscProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(ppmProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(gapProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(twProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(appearanceProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(theftProfit)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(bundledProfit)}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">{ppd}</td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(pvr)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {formatCurrency(deal.profit)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={deal.status}
                            onChange={e => handleStatusChange(deal.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-500 ${
                              deal.status === 'Funded' 
                                ? 'bg-green-100 text-green-800'
                                : deal.status === 'Held'
                                ? 'bg-red-100 text-red-800'
                                : deal.status === 'Pending'
                                ? 'bg-blue-100 text-blue-800'
                                : deal.status === 'Unwound'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Funded">Funded</option>
                            <option value="Held">Held</option>
                            <option value="Unwound">Unwound</option>
                            <option value="Dead Deal">Dead Deal</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleEditDeal(deal.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            onChange={e => handleDeleteDeal(deal.id, e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredDeals.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {filteredDeals.length} of {deals.length} deals
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign size={16} />
              <span>
                Total Gross:{' '}
                {formatCurrency(filteredDeals.reduce((sum, deal) => sum + deal.amount, 0))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>
                Back End Total:{' '}
                {formatCurrency(filteredDeals.reduce((sum, deal) => sum + deal.profit, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleFinanceDealsPage;
