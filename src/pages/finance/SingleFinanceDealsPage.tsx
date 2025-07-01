import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
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
  lender?: string;
  dealStatus?: string;
}

const SingleFinanceDealsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('saleDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleBackToDashboard = () => {
    navigate('/dashboard/single-finance');
  };

  // Load deals from localStorage - using singleFinanceDeals storage key
  useEffect(() => {
    try {
      const storedDeals = localStorage.getItem('singleFinanceDeals');
      if (storedDeals) {
        const parsedDeals = JSON.parse(storedDeals);
        // Map raw deal data to component interface while preserving extended properties
        const formattedDeals: Deal[] = parsedDeals.map((rawDeal: any) => {
          const deal: Deal = {
            id: rawDeal.id,
            customer: rawDeal.customer || rawDeal.lastName || 'Unknown',
            vehicle:
              rawDeal.vehicle ||
              `${
                rawDeal.vehicleType === 'N' ? 'New' : rawDeal.vehicleType === 'U' ? 'Used' : 'CPO'
              } - Stock #${rawDeal.stockNumber}`,
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
          className="mr-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                <tr className="bg-orange-50 border-b">
                  <th className="py-3 px-4 text-left font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('dealNumber')}>
                      Deal #
                      {sortField === 'dealNumber' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('saleDate')}>
                      Date
                      {sortField === 'saleDate' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('customer')}>
                      Customer
                      {sortField === 'customer' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Vehicle</th>
                  <th className="py-3 px-4 text-left font-medium">Stock #</th>
                  <th className="py-3 px-4 text-left font-medium">VIN</th>
                  <th className="py-3 px-4 text-right font-medium">
                    <button
                      className="flex items-center ml-auto"
                      onClick={() => toggleSort('amount')}
                    >
                      Total Gross
                      {sortField === 'amount' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right font-medium">
                    <button
                      className="flex items-center ml-auto"
                      onClick={() => toggleSort('profit')}
                    >
                      Back End
                      {sortField === 'profit' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-medium">Lender</th>
                  <th className="py-3 px-4 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      {deals.length === 0
                        ? "No deals logged yet. Use the 'Log New Deal' button to add deals."
                        : 'No deals match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map(deal => {
                    const dealData = deal as any; // Access extended properties
                    return (
                      <tr key={deal.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">
                          {dealData.dealNumber || deal.id}
                        </td>
                        <td className="py-3 px-4">{formatDate(deal.saleDate)}</td>
                        <td className="py-3 px-4">{deal.customer}</td>
                        <td className="py-3 px-4">
                          {dealData.vehicleType && (
                            <span
                              className={`inline-block w-6 h-6 text-xs font-bold text-white text-center rounded mr-2 ${
                                dealData.vehicleType === 'N'
                                  ? 'bg-green-600'
                                  : dealData.vehicleType === 'U'
                                  ? 'bg-blue-600'
                                  : 'bg-purple-600'
                              }`}
                            >
                              {dealData.vehicleType}
                            </span>
                          )}
                          {deal.vehicle}
                        </td>
                        <td className="py-3 px-4 font-mono">{dealData.stockNumber || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {deal.vin ? `...${deal.vin.slice(-8)}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(deal.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {formatCurrency(deal.profit)}
                        </td>
                        <td className="py-3 px-4">{dealData.lender || 'N/A'}</td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(deal.status)}</td>
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
