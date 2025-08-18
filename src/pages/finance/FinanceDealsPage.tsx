import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileEdit,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
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
}

const FinanceDealsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('saleDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Handle status change for a deal
  const handleStatusChange = (dealId: string, newStatus: string) => {
    try {
      // Get existing deals from localStorage
      const existingDealsJson = localStorage.getItem('financeDeals');
      const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

      // Update the deal status
      const updatedDeals = existingDeals.map((deal: any) =>
        deal.id === dealId ? { ...deal, status: newStatus } : deal
      );

      // Save back to localStorage
      localStorage.setItem('financeDeals', JSON.stringify(updatedDeals));

      // Update local state
      setDeals(updatedDeals);

      console.log(`[FinanceDealsPage] Updated deal ${dealId} status to ${newStatus}`);
    } catch (error) {
      console.error('[FinanceDealsPage] Error updating deal status:', error);
    }
  };

  // Handle deal deletion
  const handleDeleteDeal = (dealId: string, shouldDelete: boolean) => {
    if (!shouldDelete) return;

    if (confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      try {
        // Get existing deals from localStorage
        const existingDealsJson = localStorage.getItem('financeDeals');
        const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

        // Remove the deal
        const updatedDeals = existingDeals.filter((deal: any) => deal.id !== dealId);

        // Save back to localStorage
        localStorage.setItem('financeDeals', JSON.stringify(updatedDeals));

        // Update local state
        setDeals(updatedDeals);

        console.log(`[FinanceDealsPage] Deleted deal ${dealId}`);
      } catch (error) {
        console.error('[FinanceDealsPage] Error deleting deal:', error);
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard/finance');
  };

  // Load deals from localStorage
  useEffect(() => {
    try {
      const storedDeals = localStorage.getItem('financeDeals');
      if (storedDeals) {
        const parsedDeals = JSON.parse(storedDeals);
        setDeals(parsedDeals);
      }
    } catch (error) {
      console.error('Error loading deals from localStorage:', error);
    }
  }, []);

  // Filter and sort deals
  const filteredDeals = deals
    .filter(deal => {
      const matchesSearch =
        deal.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={handleBackToDashboard}
          className="mr-4 flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Finance Deals</h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            placeholder="Search deals by customer, vehicle, ID, or VIN"
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
              <option value="Bank Approval">Bank Approval</option>
              <option value="Pending Documents">Pending Documents</option>
              <option value="Contract Review">Contract Review</option>
              <option value="Insurance Verification">Insurance Verification</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="border hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs">
                  <th className="font-medium text-gray-700 py-2 pl-3 text-center bg-white w-12 border-r border-gray-200">
                    #
                  </th>
                  <th className="font-medium text-gray-700 py-2 px-2 text-left bg-gray-50 border-r border-gray-200">
                    Last Name
                  </th>
                  <th className="font-medium text-white py-2 pl-4 pr-2 text-left bg-blue-100 border-r border-blue-200">
                    <button
                      className="flex items-center text-blue-700"
                      onClick={() => toggleSort('id')}
                    >
                      Deal #
                      {sortField === 'id' && (
                        <ArrowUpDown size={14} className="ml-1 text-blue-700" />
                      )}
                    </button>
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-left bg-blue-200 border-r border-blue-300">
                    <span className="text-blue-800">Stock #</span>
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-center bg-blue-300 border-r border-blue-400">
                    <button
                      className="flex items-center text-blue-900"
                      onClick={() => toggleSort('saleDate')}
                    >
                      Date
                      {sortField === 'saleDate' && (
                        <ArrowUpDown size={14} className="ml-1 text-blue-900" />
                      )}
                    </button>
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-left bg-blue-400 border-r border-blue-500">
                    <span className="text-blue-900">VIN</span>
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-center bg-blue-500 border-r border-blue-600">
                    N/U/CPO
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-left bg-blue-600 border-r border-blue-700">
                    Lender
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-blue-700 border-r border-blue-800">
                    Front End
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-blue-800 border-r border-blue-900">
                    VSC
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-blue-900 border-r border-slate-100">
                    PPM
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-slate-600 border-r border-slate-700">
                    GAP
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-slate-700 border-r border-slate-800">
                    T&W/Bundle
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-center bg-slate-800 border-r border-slate-900">
                    PPD
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-slate-900 border-r border-gray-700">
                    PVR
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-right bg-gray-700 border-r border-gray-800">
                    <button
                      className="flex items-center justify-end ml-auto"
                      onClick={() => toggleSort('profit')}
                    >
                      Total
                      {sortField === 'profit' && (
                        <ArrowUpDown size={14} className="ml-1 text-white" />
                      )}
                    </button>
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-center bg-gray-800 w-20 border-r border-gray-900">
                    Status
                  </th>
                  <th className="font-medium text-white py-2 px-2 text-center bg-red-600 rounded-tr-md w-16">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal, index) => {
                    // Get individual product profits from deal data or calculate from legacy data
                    const dealData = deal as any; // Type assertion to access extended properties

                    // Extract last name from customer
                    const lastName = deal.customer.split(' ').pop() || '';

                    // Format date for display - use actual deal date from form
                    const actualDealDate = dealData.dealDate || deal.saleDate;
                    const dealDate = new Date(actualDealDate);
                    const formattedDate = dealDate.toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit',
                    });

                    // Determine if New, Used or CPO - use actual form data
                    const vehicleType =
                      dealData.vehicleType ||
                      (deal.vehicle.toLowerCase().includes('new')
                        ? 'N'
                        : deal.vehicle.toLowerCase().includes('cpo')
                          ? 'C'
                          : 'U');

                    // Get individual product profits - ensure we handle both number and string values
                    const vscProfit =
                      typeof dealData.vscProfit === 'number'
                        ? dealData.vscProfit
                        : parseFloat(dealData.vscProfit) ||
                          (deal.products.includes('Extended Warranty') ||
                          deal.products.includes('Vehicle Service Contract (VSC)')
                            ? Math.round(deal.profit * 0.35)
                            : 0);

                    const ppmProfit =
                      typeof dealData.ppmProfit === 'number'
                        ? dealData.ppmProfit
                        : parseFloat(dealData.ppmProfit) ||
                          (deal.products.includes('Paint Protection') ||
                          deal.products.includes('Paint and Fabric Protection') ||
                          deal.products.includes('PPM') ||
                          deal.products.includes('PrePaid Maintenance (PPM)')
                            ? Math.round(deal.profit * 0.2)
                            : 0);

                    const gapProfit =
                      typeof dealData.gapProfit === 'number'
                        ? dealData.gapProfit
                        : parseFloat(dealData.gapProfit) ||
                          (deal.products.includes('GAP Insurance')
                            ? Math.round(deal.profit * 0.25)
                            : 0);

                    const twProfit =
                      typeof dealData.tireAndWheelProfit === 'number'
                        ? dealData.tireAndWheelProfit
                        : parseFloat(dealData.tireAndWheelProfit) ||
                          (deal.products.includes('Tire & Wheel') ||
                          deal.products.includes('Tire & Wheel Bundle')
                            ? Math.round(deal.profit * 0.2)
                            : 0);

                    // Products per deal
                    const ppd = deal.products.length;

                    // PVR (per vehicle retailed) - using profit as estimation
                    const pvr = Math.round(deal.profit / (ppd || 1));

                    // Get status based on deal status or default to "Pending"
                    const status =
                      deal.status === 'Complete' || deal.status === 'Funded'
                        ? 'Funded'
                        : deal.status === 'Canceled' || deal.status === 'Unwound'
                          ? 'Unwound'
                          : deal.status === 'Dead Deal'
                            ? 'Dead Deal'
                            : 'Pending';

                    // Status badge colors
                    const statusColor =
                      status === 'Funded'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : status === 'Unwound'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : status === 'Dead Deal'
                            ? 'bg-gray-100 text-gray-800 border-gray-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200';

                    return (
                      <tr
                        key={deal.id}
                        className={`border-b ${
                          index % 2 === 1 ? 'bg-gray-50' : ''
                        } hover:bg-blue-50`}
                      >
                        <td className="py-2 px-2 text-center font-medium bg-white border-r border-gray-200">
                          {filteredDeals.length - index}
                        </td>
                        <td className="py-2 px-2 text-left font-medium bg-white border-r border-gray-200">
                          {lastName}
                        </td>
                        <td className="py-2 pl-4 pr-2 text-left font-medium text-blue-700 bg-white border-r border-gray-200">
                          {dealData.dealNumber || deal.id}
                        </td>
                        <td className="py-2 px-2 text-left font-mono bg-white border-r border-gray-200">
                          {dealData.stockNumber || deal.id.replace('D', 'S')}
                        </td>
                        <td className="py-2 px-2 text-center text-gray-700 bg-white border-r border-gray-200">
                          {formattedDate}
                        </td>
                        <td className="py-2 px-2 text-left font-mono text-xs bg-white border-r border-gray-200">
                          {deal.vin ? `...${deal.vin.slice(-8)}` : dealData.vinLast8 || 'N/A'}
                        </td>
                        <td className="py-2 px-2 text-center bg-white border-r border-gray-200">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              vehicleType === 'N'
                                ? 'bg-blue-100 text-blue-800'
                                : vehicleType === 'C'
                                  ? 'bg-slate-100 text-slate-800'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {vehicleType}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-left bg-white border-r border-gray-200">
                          {dealData.lender || 'N/A'}
                        </td>
                        <td className="py-2 px-2 text-right bg-white font-medium border-r border-gray-200">
                          $
                          {(
                            dealData.frontEndGross || Math.round(deal.amount * 0.7)
                          ).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                          ${vscProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                          ${ppmProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                          ${gapProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                          ${twProfit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center bg-white font-medium border-r border-gray-200">
                          {ppd}
                        </td>
                        <td className="py-2 px-2 text-right bg-white border-r border-gray-200">
                          ${pvr.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-blue-600 bg-white border-r border-gray-200">
                          ${deal.profit.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center bg-white border-r border-gray-200">
                          <select
                            value={status}
                            onChange={e => handleStatusChange(deal.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-500 ${statusColor}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Funded">Funded</option>
                            <option value="Unwound">Unwound</option>
                            <option value="Dead Deal">Dead Deal</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center bg-white">
                          <input
                            type="checkbox"
                            onChange={e => handleDeleteDeal(deal.id, e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={18} className="py-10 text-center text-gray-500">
                      No deals match your filter criteria. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {filteredDeals.length} of {deals.length} deals
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinanceDealsPage;
