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
                <tr className="bg-gray-50 border-b">
                  <th className="py-3 px-4 text-left font-medium">
                    <button className="flex items-center" onClick={() => toggleSort('id')}>
                      Deal #
                      {sortField === 'id' && (
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
                  <th className="py-3 px-4 text-left font-medium">Salesperson</th>
                  <th className="py-3 px-4 text-right font-medium">
                    <button
                      className="flex items-center justify-end ml-auto"
                      onClick={() => toggleSort('amount')}
                    >
                      Amount
                      {sortField === 'amount' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right font-medium">
                    <button
                      className="flex items-center justify-end ml-auto"
                      onClick={() => toggleSort('profit')}
                    >
                      F&I Profit
                      {sortField === 'profit' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center font-medium">Status</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(deal => (
                    <tr key={deal.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-left font-medium text-blue-600">{deal.id}</td>
                      <td className="py-3 px-4 text-left">{deal.saleDate}</td>
                      <td className="py-3 px-4 text-left font-medium">{deal.customer}</td>
                      <td className="py-3 px-4 text-left">
                        <div>{deal.vehicle}</div>
                        <div className="text-xs text-gray-500">VIN: {deal.vin}</div>
                      </td>
                      <td className="py-3 px-4 text-left">{deal.salesperson}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${deal.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        ${deal.profit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(deal.status)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <FileEdit size={16} className="mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
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
